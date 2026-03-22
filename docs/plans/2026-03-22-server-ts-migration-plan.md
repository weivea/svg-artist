# Server JS → TypeScript Migration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate all 5 server JavaScript files to TypeScript, using tsx for runtime execution.

**Architecture:** Rename `.js` → `.ts`, add full type annotations, create separate `tsconfig.server.json` (no DOM types), update all scripts/configs to use tsx.

**Tech Stack:** TypeScript 5.9, tsx, Express 5, ws, node-pty (bundled types), @modelcontextprotocol/sdk

---

### Task 1: Install dependencies and create tsconfig.server.json

**Files:**
- Modify: `package.json`
- Create: `tsconfig.server.json`

**Step 1: Install type dependencies**

Run:
```bash
npm install -D tsx @types/node @types/express @types/ws
```

Expected: Packages installed successfully. Note: `node-pty` already ships its own `.d.ts`, no `@types/node-pty` needed.

**Step 2: Create `tsconfig.server.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["server/**/*.ts"]
}
```

**Step 3: Verify typecheck command works (no files yet, should succeed trivially)**

Run:
```bash
npx tsc --noEmit -p tsconfig.server.json
```

Expected: No errors (no files matched yet, that's ok).

**Step 4: Commit**

```bash
git add package.json package-lock.json tsconfig.server.json
git commit -m "chore: add tsx, type packages, and tsconfig.server.json for server TS migration"
```

---

### Task 2: Migrate drawing-store.js → drawing-store.ts

This is the simplest module with no server-framework dependencies. Good starting point.

**Files:**
- Delete: `server/drawing-store.js`
- Create: `server/drawing-store.ts`

**Step 1: Rename and add types**

Rename `server/drawing-store.js` → `server/drawing-store.ts` and replace contents with:

```typescript
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = process.env.DATA_DIR || join(__dirname, '..', 'data');
const DATA_FILE = join(DATA_DIR, 'drawings.json');

const DEFAULT_SVG = '<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><text x="400" y="300" text-anchor="middle" fill="#666" font-size="24">Waiting for artwork...</text></svg>';

export interface Drawing {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  sessionId: string;
  svgContent: string;
}

interface DrawingData {
  drawings: Drawing[];
}

export class DrawingStore {
  private _cache: DrawingData | null = null;

  private async _ensureDir(): Promise<void> {
    await mkdir(DATA_DIR, { recursive: true });
  }

  private async _load(): Promise<DrawingData> {
    if (this._cache) return this._cache;
    try {
      const raw = await readFile(DATA_FILE, 'utf8');
      this._cache = JSON.parse(raw) as DrawingData;
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        this._cache = { drawings: [] };
      } else {
        throw err;
      }
    }
    return this._cache!;
  }

  private async _save(): Promise<void> {
    await this._ensureDir();
    const tmp = DATA_FILE + '.tmp';
    await writeFile(tmp, JSON.stringify(this._cache, null, 2));
    await writeFile(DATA_FILE, JSON.stringify(this._cache, null, 2));
  }

  async list(): Promise<Drawing[]> {
    const data = await this._load();
    return data.drawings;
  }

  async create(): Promise<Drawing> {
    const data = await this._load();
    const now = new Date();
    const title = `绘画 ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const drawing: Drawing = {
      id: nanoid(8),
      title,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      sessionId: randomUUID(),
      svgContent: DEFAULT_SVG,
    };
    data.drawings.push(drawing);
    await this._save();
    return drawing;
  }

  async get(id: string): Promise<Drawing | null> {
    const data = await this._load();
    return data.drawings.find(d => d.id === id) || null;
  }

  async updateSvg(id: string, svgContent: string): Promise<Drawing | null> {
    const data = await this._load();
    const drawing = data.drawings.find(d => d.id === id);
    if (!drawing) return null;
    drawing.svgContent = svgContent;
    drawing.updatedAt = new Date().toISOString();
    await this._save();
    return drawing;
  }

  async delete(id: string): Promise<boolean> {
    const data = await this._load();
    const index = data.drawings.findIndex(d => d.id === id);
    if (index === -1) return false;
    data.drawings.splice(index, 1);
    await this._save();
    return true;
  }
}
```

**Step 2: Verify it typechecks**

Run:
```bash
npx tsc --noEmit -p tsconfig.server.json
```

Expected: No errors.

**Step 3: Commit**

```bash
git add server/drawing-store.ts
git rm server/drawing-store.js
git commit -m "refactor: migrate drawing-store to TypeScript"
```

---

### Task 3: Migrate mcp-server.js → mcp-server.ts

**Files:**
- Delete: `server/mcp-server.js`
- Create: `server/mcp-server.ts`

**Step 1: Rename and add types**

Rename `server/mcp-server.js` → `server/mcp-server.ts` and replace contents with:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const CALLBACK_URL = process.env.SVG_CALLBACK_URL || 'http://localhost:3000/api/svg';

const server = new McpServer({
  name: 'svg-artist',
  version: '1.0.0',
});

server.tool(
  'draw_svg',
  'Draw or update the SVG artwork. Pass the complete SVG content including the <svg> root element.',
  {
    svg_content: z.string().describe('Complete SVG markup to render'),
  },
  async ({ svg_content }: { svg_content: string }) => {
    try {
      const res = await fetch(CALLBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ svg: svg_content }),
      });

      if (!res.ok) {
        return {
          content: [{ type: 'text' as const, text: `Failed to push SVG update: HTTP ${res.status}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text' as const, text: 'SVG rendered successfully in the preview pane.' }],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: 'text' as const, text: `Failed to push SVG update: ${message}` }],
        isError: true,
      };
    }
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

**Step 2: Update mcp-config.json to use tsx**

```json
{
  "mcpServers": {
    "svg-artist": {
      "command": "npx",
      "args": ["tsx", "./server/mcp-server.ts"]
    }
  }
}
```

**Step 3: Verify typecheck**

Run:
```bash
npx tsc --noEmit -p tsconfig.server.json
```

Expected: No errors.

**Step 4: Commit**

```bash
git add server/mcp-server.ts mcp-config.json
git rm server/mcp-server.js
git commit -m "refactor: migrate mcp-server to TypeScript"
```

---

### Task 4: Migrate session-manager.js → session-manager.ts

**Files:**
- Delete: `server/session-manager.js`
- Create: `server/session-manager.ts`

**Step 1: Rename and add types**

Rename `server/session-manager.js` → `server/session-manager.ts` and replace contents with:

```typescript
import { PtyManager } from './pty-manager.js';

export class SessionManager {
  sessions: Map<string, PtyManager> = new Map();

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
```

Note: The import `'./pty-manager.js'` uses `.js` extension — this is correct for NodeNext module resolution. TypeScript resolves `.js` imports to `.ts` files at compile time.

**Step 2: Verify typecheck**

Run:
```bash
npx tsc --noEmit -p tsconfig.server.json
```

Expected: May have errors because `pty-manager.ts` doesn't exist yet. That's expected — we'll fix in the next task. Alternatively, create a stub if needed or just proceed.

**Step 3: Commit**

```bash
git add server/session-manager.ts
git rm server/session-manager.js
git commit -m "refactor: migrate session-manager to TypeScript"
```

---

### Task 5: Migrate pty-manager.js → pty-manager.ts

**Files:**
- Delete: `server/pty-manager.js`
- Create: `server/pty-manager.ts`

**Step 1: Rename and add types**

Rename `server/pty-manager.js` → `server/pty-manager.ts` and replace contents with:

```typescript
import pty, { IPty } from 'node-pty';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

export interface SelectionRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SelectionData {
  region: SelectionRegion;
  elements: string[];
}

export interface SpawnOptions {
  sessionId?: string;
  isResume?: boolean;
  callbackUrl?: string;
}

/**
 * Resolve the full path to the claude CLI binary.
 * node-pty's posix_spawnp may not find binaries that are only on the
 * user's interactive-shell PATH, so we resolve it once at startup.
 */
function resolveClaudePath(): string {
  try {
    return execSync('which claude', { encoding: 'utf8' }).trim();
  } catch {
    return 'claude'; // fallback — let node-pty try PATH
  }
}

const claudeBin = resolveClaudePath();

type SvgFilterState = 'passthrough' | 'suppressing';

export class PtyManager {
  ptyProcess: IPty | null = null;
  terminalWs: WebSocket | null = null;
  selectionContext: SelectionData | null = null;
  inputBuffer: string = '';
  private _svgFilterState: SvgFilterState = 'passthrough';
  private _svgFilterBuffer: string = '';

  /**
   * Spawn claude CLI in a real PTY.
   */
  spawn(opts: SpawnOptions = {}): IPty {
    const mcpConfigPath = join(projectRoot, 'mcp-config.json');
    const systemPrompt = [
      'You are an SVG artist. The user will describe what they want you to draw.',
      'Use the draw_svg tool to render your artwork. Always provide complete SVG content.',
      'Give each SVG element a meaningful id attribute for easy identification.',
      'Use viewBox="0 0 800 600" unless the user specifies otherwise.',
      'When the user selects a region and asks for changes, only modify the specified elements.',
    ].join(' ');

    const callbackUrl = opts.callbackUrl
      || `http://localhost:${process.env.PORT || 3000}/api/svg`;

    const args: string[] = [];
    if (opts.sessionId) {
      if (opts.isResume) {
        args.push('--resume', opts.sessionId);
      } else {
        args.push('--session-id', opts.sessionId);
        args.push('--system-prompt', systemPrompt);
      }
    } else {
      args.push('--system-prompt', systemPrompt);
    }
    args.push('--mcp-config', mcpConfigPath);
    args.push('--allowedTools', 'mcp__svg-artist__draw_svg');

    this.ptyProcess = pty.spawn(claudeBin, args, {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: projectRoot,
      env: {
        ...process.env,
        SVG_CALLBACK_URL: callbackUrl,
      },
    });

    console.log('[PTY] Claude process spawned, pid:', this.ptyProcess.pid);

    this.ptyProcess.onExit(({ exitCode }) => {
      console.log('[PTY] Claude process exited with code:', exitCode);
      this.ptyProcess = null;
    });

    return this.ptyProcess;
  }

  /**
   * Attach a WebSocket client to the PTY
   */
  attachWebSocket(ws: WebSocket, spawnOpts: SpawnOptions = {}): void {
    if (!this.ptyProcess) {
      this.spawn(spawnOpts);
    }

    this.terminalWs = ws;

    // PTY stdout -> filter SVG content -> WebSocket -> xterm.js
    const dataHandler = this.ptyProcess!.onData((data: string) => {
      if (ws.readyState === 1) {
        const filtered = this._filterSvgContent(data);
        if (filtered) {
          ws.send(filtered);
        }
      }
    });

    // xterm.js -> WebSocket -> PTY stdin (with interception)
    ws.on('message', (message: Buffer | ArrayBuffer | Buffer[]) => {
      const input = message.toString();

      // Check for JSON control messages (e.g. resize)
      try {
        const parsed = JSON.parse(input) as { type: string; cols?: number; rows?: number };
        if (parsed.type === 'resize') {
          this.resize(parsed.cols!, parsed.rows!);
          return;
        }
      } catch {
        // not JSON, treat as terminal input
      }

      this.handleInput(input);
    });

    ws.on('close', () => {
      dataHandler.dispose();
      this.terminalWs = null;
      console.log('[PTY] WebSocket disconnected');
    });
  }

  /**
   * Handle input from xterm.js, intercept Enter to inject selection context
   */
  handleInput(input: string): void {
    if (!this.ptyProcess) return;

    // Check if input contains Enter/Return (carriage return)
    if (input === '\r' && this.selectionContext && this.inputBuffer.trim().length > 0) {
      // Inject selection context before user's message
      const contextPrefix = this.formatSelectionContext();
      const fullInput = contextPrefix + this.inputBuffer;

      // Clear current line: move to start, clear line
      this.ptyProcess.write('\x1b[2K\r');
      // Write the full input with context
      this.ptyProcess.write(fullInput + '\r');

      this.inputBuffer = '';
      this.selectionContext = null;
      return;
    }

    if (input === '\r') {
      this.inputBuffer = '';
      this.ptyProcess.write(input);
      return;
    }

    // Handle backspace
    if (input === '\x7f') {
      this.inputBuffer = this.inputBuffer.slice(0, -1);
      this.ptyProcess.write(input);
      return;
    }

    // Accumulate printable input
    if (input.length === 1 && input >= ' ') {
      this.inputBuffer += input;
    }

    this.ptyProcess.write(input);
  }

  /**
   * Set the current selection context (called from SVG WebSocket)
   */
  setSelection(selection: SelectionData): void {
    this.selectionContext = selection;
    console.log('[PTY] Selection set:', selection?.region);
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selectionContext = null;
  }

  /**
   * Format selection context as a prefix string for Claude
   */
  formatSelectionContext(): string {
    const { region, elements } = this.selectionContext!;
    const lines: string[] = [
      `[Selected region x:${region.x} y:${region.y} w:${region.width} h:${region.height}`,
    ];
    if (elements && elements.length > 0) {
      lines.push(' Elements in region:');
      for (const el of elements) {
        lines.push(` - ${el}`);
      }
    }
    lines.push(' Please only modify these elements]');
    return lines.join('\n') + '\n';
  }

  /**
   * Filter SVG content from PTY output to prevent raw XML from cluttering terminal.
   */
  _filterSvgContent(data: string): string | null {
    let result = '';
    let i = 0;

    const combined = this._svgFilterBuffer + data;
    this._svgFilterBuffer = '';

    while (i < combined.length) {
      if (this._svgFilterState === 'passthrough') {
        const svgStart = this._findSvgOpen(combined, i);
        if (svgStart === -1) {
          const safeEnd = Math.max(i, combined.length - 5);
          result += combined.slice(i, safeEnd);
          this._svgFilterBuffer = combined.slice(safeEnd);
          i = combined.length;
        } else {
          result += combined.slice(i, svgStart);
          this._svgFilterState = 'suppressing';
          i = svgStart;
        }
      } else {
        const svgEnd = this._findSvgClose(combined, i);
        if (svgEnd === -1) {
          this._svgFilterBuffer = combined.slice(Math.max(i, combined.length - 7));
          i = combined.length;
        } else {
          i = svgEnd;
          this._svgFilterState = 'passthrough';
        }
      }
    }

    return result || null;
  }

  /**
   * Find the start index of an <svg tag in data, starting from `from`.
   */
  _findSvgOpen(data: string, from: number): number {
    const searchStr = data.slice(from).replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
    const idx = searchStr.indexOf('<svg');
    if (idx === -1) return -1;

    let origIdx = from;
    let cleanCount = 0;
    while (origIdx < data.length && cleanCount < idx) {
      if (data[origIdx] === '\x1b') {
        const match = data.slice(origIdx).match(/^\x1b\[[0-9;]*[a-zA-Z]/);
        if (match) {
          origIdx += match[0].length;
          continue;
        }
      }
      origIdx++;
      cleanCount++;
    }
    return origIdx;
  }

  /**
   * Find the end position (just after </svg>) in data, starting from `from`.
   */
  _findSvgClose(data: string, from: number): number {
    const searchStr = data.slice(from).replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
    const closeTag = '</svg>';
    const idx = searchStr.indexOf(closeTag);
    if (idx === -1) return -1;

    let origIdx = from;
    let cleanCount = 0;
    const targetCount = idx + closeTag.length;
    while (origIdx < data.length && cleanCount < targetCount) {
      if (data[origIdx] === '\x1b') {
        const match = data.slice(origIdx).match(/^\x1b\[[0-9;]*[a-zA-Z]/);
        if (match) {
          origIdx += match[0].length;
          continue;
        }
      }
      origIdx++;
      cleanCount++;
    }
    return origIdx;
  }

  /**
   * Resize the PTY
   */
  resize(cols: number, rows: number): void {
    if (this.ptyProcess) {
      this.ptyProcess.resize(cols, rows);
    }
  }

  /**
   * Kill the PTY process
   */
  kill(): void {
    if (this.ptyProcess) {
      this.ptyProcess.kill();
      this.ptyProcess = null;
    }
  }
}
```

**Step 2: Verify typecheck**

Run:
```bash
npx tsc --noEmit -p tsconfig.server.json
```

Expected: No errors (or minor ones to fix — e.g. adjust types for ws message handler).

**Step 3: Commit**

```bash
git add server/pty-manager.ts
git rm server/pty-manager.js
git commit -m "refactor: migrate pty-manager to TypeScript"
```

---

### Task 6: Migrate index.js → index.ts

**Files:**
- Delete: `server/index.js`
- Create: `server/index.ts`

**Step 1: Rename and add types**

Rename `server/index.js` → `server/index.ts` and replace contents with:

```typescript
import express, { Request, Response } from 'express';
import { createServer, IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Duplex } from 'stream';
import { SessionManager } from './session-manager.js';
import { DrawingStore } from './drawing-store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Serve built frontend in production
app.use(express.static(join(__dirname, '..', 'dist')));

const sessionManager = new SessionManager();
const drawingStore = new DrawingStore();

// --- WebSocket servers (noServer mode) ---
const svgWss = new WebSocketServer({ noServer: true });
const terminalWss = new WebSocketServer({ noServer: true });

// Per-drawId SVG client sets
const svgClientsByDrawId = new Map<string, Set<WebSocket>>();

// Extend IncomingMessage to carry drawId
interface DrawIdRequest extends IncomingMessage {
  _drawId?: string;
}

function getSvgClients(drawId: string): Set<WebSocket> {
  if (!svgClientsByDrawId.has(drawId)) {
    svgClientsByDrawId.set(drawId, new Set());
  }
  return svgClientsByDrawId.get(drawId)!;
}

function broadcastSvg(drawId: string, svgContent: string): void {
  const clients = svgClientsByDrawId.get(drawId);
  if (!clients) return;
  const message = JSON.stringify({ type: 'svg_update', svg: svgContent });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// --- SVG WebSocket connection handler ---
svgWss.on('connection', (ws: WebSocket, request: DrawIdRequest) => {
  const drawId = request._drawId!;
  const clients = getSvgClients(drawId);
  clients.add(ws);
  console.log(`[SVG WS] Client connected for drawId=${drawId}, clients=${clients.size}`);

  ws.on('message', (message: Buffer | ArrayBuffer | Buffer[]) => {
    try {
      const data = JSON.parse(message.toString()) as { type: string; selection?: unknown };
      const manager = sessionManager.sessions.get(drawId);
      if (!manager) return;
      if (data.type === 'selection') {
        manager.setSelection(data.selection as import('./pty-manager.js').SelectionData);
      } else if (data.type === 'clear_selection') {
        manager.clearSelection();
      }
    } catch {
      // ignore non-JSON messages
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    if (clients.size === 0) {
      svgClientsByDrawId.delete(drawId);
    }
    console.log(`[SVG WS] Client disconnected for drawId=${drawId}, clients=${clients.size}`);
  });
});

// --- Terminal WebSocket connection handler ---
terminalWss.on('connection', async (ws: WebSocket, request: DrawIdRequest) => {
  const drawId = request._drawId!;
  console.log(`[Terminal WS] Client connected for drawId=${drawId}`);

  if (process.env.DISABLE_PTY === '1') {
    ws.send('\x1b[33m[Test mode: PTY disabled]\x1b[0m\r\n');
    ws.on('message', () => {});
    return;
  }

  // Check if terminal is already attached for this drawId
  if (sessionManager.hasActiveTerminal(drawId)) {
    ws.send('\x1b[31m*** Terminal already open in another tab ***\x1b[0m\r\n');
    ws.on('message', () => {});
    return;
  }

  // Look up drawing to get sessionId
  const drawing = await drawingStore.get(drawId);
  if (!drawing) {
    ws.send('\x1b[31m*** Drawing not found ***\x1b[0m\r\n');
    ws.close();
    return;
  }

  const manager = sessionManager.getOrCreate(drawId);
  const callbackUrl = `http://localhost:${PORT}/api/svg/${drawId}`;

  // For resume: check if there's an existing Claude session to resume
  const hasExistingSession = drawing.updatedAt !== drawing.createdAt;

  manager.attachWebSocket(ws, {
    sessionId: drawing.sessionId,
    isResume: hasExistingSession,
    callbackUrl,
  });

  // On terminal disconnect, destroy the session after a grace period
  ws.on('close', () => {
    console.log(`[Terminal WS] Client disconnected for drawId=${drawId}`);
    setTimeout(() => {
      if (!sessionManager.hasActiveTerminal(drawId)) {
        sessionManager.destroy(drawId);
      }
    }, 2000);
  });
});

// --- HTTP upgrade routing ---
server.on('upgrade', (request: DrawIdRequest, socket: Duplex, head: Buffer) => {
  const { pathname } = new URL(request.url!, `http://${request.headers.host}`);

  // Match /ws/svg/:drawId
  const svgMatch = pathname.match(/^\/ws\/svg\/(.+)$/);
  if (svgMatch) {
    request._drawId = svgMatch[1];
    svgWss.handleUpgrade(request, socket, head, (ws) => {
      svgWss.emit('connection', ws, request);
    });
    return;
  }

  // Match /ws/terminal/:drawId
  const terminalMatch = pathname.match(/^\/ws\/terminal\/(.+)$/);
  if (terminalMatch) {
    request._drawId = terminalMatch[1];
    terminalWss.handleUpgrade(request, socket, head, (ws) => {
      terminalWss.emit('connection', ws, request);
    });
    return;
  }

  socket.destroy();
});

// --- SVG callback endpoint (called by MCP Server) ---
app.post('/api/svg/:drawId', async (req: Request, res: Response) => {
  const { svg } = req.body as { svg?: string };
  const { drawId } = req.params;
  if (!svg) {
    res.status(400).json({ error: 'Missing svg field' });
    return;
  }
  broadcastSvg(drawId, svg);
  await drawingStore.updateSvg(drawId, svg);
  console.log(`[SVG] Received SVG update for drawId=${drawId}, broadcast to`, svgClientsByDrawId.get(drawId)?.size || 0, 'clients');
  res.json({ ok: true });
});

// --- Drawings REST API ---
app.get('/api/drawings', async (_req: Request, res: Response) => {
  const drawings = await drawingStore.list();
  res.json({ drawings });
});

app.post('/api/drawings', async (_req: Request, res: Response) => {
  const drawing = await drawingStore.create();
  res.json(drawing);
});

app.delete('/api/drawings/:drawId', async (req: Request, res: Response) => {
  const { drawId } = req.params;
  sessionManager.destroy(drawId);
  const deleted = await drawingStore.delete(drawId);
  if (!deleted) {
    res.status(404).json({ error: 'Drawing not found' });
    return;
  }
  res.json({ ok: true });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// SPA fallback (Express 5 requires named wildcard parameter)
app.get('/{*splat}', (_req: Request, res: Response) => {
  res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  sessionManager.destroyAll();
  process.exit(0);
});
process.on('SIGINT', () => {
  sessionManager.destroyAll();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`SVG Artist server listening on http://localhost:${PORT}`);
});

export { terminalWss };
```

**Step 2: Verify typecheck**

Run:
```bash
npx tsc --noEmit -p tsconfig.server.json
```

Expected: No errors.

**Step 3: Commit**

```bash
git add server/index.ts
git rm server/index.js
git commit -m "refactor: migrate server index to TypeScript"
```

---

### Task 7: Update scripts and test config

**Files:**
- Modify: `package.json` (scripts section)
- Modify: `playwright.config.ts` (webServer command)
- Modify: `CLAUDE.md` (update documentation)

**Step 1: Update package.json scripts**

Change scripts to use tsx:

```json
{
  "dev": "concurrently \"vite\" \"tsx server/index.ts\"",
  "dev:server": "tsx server/index.ts",
  "start": "npm run build && tsx server/index.ts",
  "typecheck": "tsc --noEmit && tsc --noEmit -p tsconfig.server.json"
}
```

Keep `test`, `test:e2e`, `test:full`, `build`, `dev:frontend` unchanged.

**Step 2: Update playwright.config.ts webServer command**

Change the webServer command from `node server/index.js` to `tsx server/index.ts`:

```typescript
webServer: {
  command: `npm run build && DATA_DIR="${testDataDir}" DISABLE_PTY=1 npx tsx server/index.ts`,
  port: 3000,
  reuseExistingServer: !process.env.CI,
  timeout: 30_000,
},
```

**Step 3: Update CLAUDE.md**

Update the "Key Design Decisions" section to change "Backend is plain JS (ES modules)" to "Backend is TypeScript (ES modules, run via tsx)".

Update commands section if `node server/index.js` is mentioned.

**Step 4: Commit**

```bash
git add package.json playwright.config.ts CLAUDE.md
git commit -m "chore: update scripts, test config, and docs for TypeScript server"
```

---

### Task 8: Full verification

**Step 1: Run typecheck on both frontend and server**

Run:
```bash
npm run typecheck
```

Expected: No errors.

**Step 2: Run dev server to verify it starts**

Run:
```bash
npm run dev:server
```

Expected: `SVG Artist server listening on http://localhost:3000` — kill with Ctrl+C after confirming.

**Step 3: Run integration tests**

Run:
```bash
npm run test
```

Expected: All integration tests pass.

**Step 4: Final commit (if any fixes needed)**

If any fixes were needed during verification, commit them:
```bash
git add -A
git commit -m "fix: resolve TypeScript migration issues found during verification"
```
