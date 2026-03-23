import { PtyManager } from './pty-manager.js';

export class SessionManager {
  sessions: Map<string, PtyManager> = new Map();
  private onReloadCallback?: () => Promise<void>;

  setOnReload(cb: () => Promise<void>): void {
    this.onReloadCallback = cb;
  }

  /**
   * Get existing PtyManager for a drawId, or create a new one.
   * Does NOT spawn the PTY — that happens on attachWebSocket.
   */
  getOrCreate(drawId: string): PtyManager {
    let manager = this.sessions.get(drawId);
    if (!manager) {
      manager = new PtyManager();
      this.sessions.set(drawId, manager);
      console.log(`[SessionManager] Created session for drawId=${drawId}, total=${this.sessions.size}`);
    }
    return manager;
  }

  /**
   * Check if a drawId has an active terminal WebSocket attached.
   */
  hasActiveTerminal(drawId: string): boolean {
    const manager = this.sessions.get(drawId);
    return !!(manager && manager.terminalWs);
  }

  /**
   * Destroy a session: kill PTY process and remove from map.
   */
  destroy(drawId: string): void {
    const manager = this.sessions.get(drawId);
    if (manager) {
      manager.kill();
      this.sessions.delete(drawId);
      console.log(`[SessionManager] Destroyed session for drawId=${drawId}, total=${this.sessions.size}`);
    }
  }

  /**
   * Respawn (kill and recreate) a session for a drawId.
   * Reloads global registries first, then respawns the CLI.
   * Returns true if session existed and was respawned, false otherwise.
   */
  async respawn(drawId: string, reason?: string): Promise<boolean> {
    // Reload global registries (custom routes, tools, macros)
    if (this.onReloadCallback) {
      await this.onReloadCallback();
    }
    const manager = this.sessions.get(drawId);
    if (!manager) return false;
    await manager.respawn(reason);
    return true;
  }

  /**
   * Destroy all sessions (server shutdown).
   */
  destroyAll(): void {
    for (const [drawId, manager] of this.sessions) {
      manager.kill();
      console.log(`[SessionManager] Destroyed session for drawId=${drawId}`);
    }
    this.sessions.clear();
  }
}
