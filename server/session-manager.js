import { PtyManager } from './pty-manager.js';

export class SessionManager {
  constructor() {
    /** @type {Map<string, PtyManager>} */
    this.sessions = new Map();
  }

  /**
   * Get existing PtyManager for a drawId, or create a new one.
   * Does NOT spawn the PTY — that happens on attachWebSocket.
   * @param {string} drawId
   * @returns {PtyManager}
   */
  getOrCreate(drawId) {
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
   * @param {string} drawId
   * @returns {boolean}
   */
  hasActiveTerminal(drawId) {
    const manager = this.sessions.get(drawId);
    return !!(manager && manager.terminalWs);
  }

  /**
   * Destroy a session: kill PTY process and remove from map.
   * @param {string} drawId
   */
  destroy(drawId) {
    const manager = this.sessions.get(drawId);
    if (manager) {
      manager.kill();
      this.sessions.delete(drawId);
      console.log(`[SessionManager] Destroyed session for drawId=${drawId}, total=${this.sessions.size}`);
    }
  }

  /**
   * Destroy all sessions (server shutdown).
   */
  destroyAll() {
    for (const [drawId, manager] of this.sessions) {
      manager.kill();
      console.log(`[SessionManager] Destroyed session for drawId=${drawId}`);
    }
    this.sessions.clear();
  }
}
