# Multi-Session Architecture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform SVG Artist from a single-PTY app into a multi-session app with a landing page, per-drawing Claude CLI instances, and JSON-based persistence.

**Architecture:** React Router (hash mode) for frontend routing. Path-parameter WebSocket isolation (`/ws/svg/:drawId`, `/ws/terminal/:drawId`). SessionManager on the backend manages a `Map<drawId, PtyManager>`. Drawings persisted in `data/drawings.json`.

**Tech Stack:** React Router DOM, nanoid, Express 5, node-pty, ws, Playwright

---

### Task 1: Install new dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install react-router-dom and nanoid**

Run: `cd /Users/jianliwei/repos/svg-artist && npm install react-router-dom nanoid`

**Step 2: Verify installation**

Run: `node -e "import('nanoid').then(m => console.log(m.nanoid(8)))"`
Expected: An 8-character random string

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add react-router-dom and nanoid dependencies"
```

---

### Task 2: Create DrawingStore (backend persistence)

**Files:**
- Create: `server/drawing-store.js`
- Test: `e2e/integration/drawing-api.spec.ts`

**Step 1: Write the failing test**

Create `e2e/integration/drawing-api.spec.ts`:

```typescript
import { test, expect } from '../fixtures';

test.describe('Drawings REST API', () => {
  test('POST /api/drawings creates a new drawing', async ({ apiContext }) => {
    const response = await apiContext.post('/api/drawings');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.id).toBeTruthy();
    expect(body.sessionId).toBeTruthy();
    expect(body.title).toContain('绘画');
    expect(body.svgContent).toContain('<svg');
  });

  test('GET /api/drawings returns list including created drawing', async ({ apiContext }) => {
    // Create a drawing first
    const createRes = await apiContext.post('/api/drawings');
    const created = await createRes.json();

    const listRes = await apiContext.get('/api/drawings');
    expect(listRes.ok()).toBeTruthy();

    const body = await listRes.json();
    expect(body.drawings).toBeInstanceOf(Array);
    const found = body.drawings.find((d: any) => d.id === created.id);
    expect(found).toBeTruthy();
    expect(found.title).toBe(created.title);
  });

  test('DELETE /api/drawings/:id removes the drawing', async ({ apiContext }) => {
    const createRes = await apiContext.post('/api/drawings');
    const created = await createRes.json();

    const deleteRes = await apiContext.delete(`/api/drawings/${created.id}`);
    expect(deleteRes.ok()).toBeTruthy();

    const listRes = await apiContext.get('/api/drawings');
    const body = await listRes.json();
    const found = body.drawings.find((d: any) => d.id === created.id);
    expect(found).toBeUndefined();
  });

  test('DELETE /api/drawings/:nonexistent returns 404', async ({ apiContext }) => {
    const response = await apiContext.delete('/api/drawings/nonexistent');
    expect(response.status()).toBe(404);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/drawing-api.spec.ts --project=integration`
Expected: FAIL — `/api/drawings` routes don't exist yet

**Step 3: Create DrawingStore**

Create `server/drawing-store.js`:

```javascript
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');
const DATA_FILE = join(DATA_DIR, 'drawings.json');

const DEFAULT_SVG = '<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><text x="400" y="300" text-anchor="middle" fill="#666" font-size="24">Waiting for artwork...</text></svg>';

export class DrawingStore {
  constructor() {
    this._cache = null; // in-memory cache
  }

  async _ensureDir() {
    await mkdir(DATA_DIR, { recursive: true });
  }

  async _load() {
    if (this._cache) return this._cache;
    try {
      const raw = await readFile(DATA_FILE, 'utf8');
      this._cache = JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') {
        this._cache = { drawings: [] };
      } else {
        throw err;
      }
    }
    return this._cache;
  }

  async _save() {
    await this._ensureDir();
    const tmp = DATA_FILE + '.tmp';
    await writeFile(tmp, JSON.stringify(this._cache, null, 2));
    await writeFile(DATA_FILE, JSON.stringify(this._cache, null, 2));
    // Note: ideally use rename for atomic write, but writeFile is fine for single-user
  }

  async list() {
    const data = await this._load();
    return data.drawings;
  }

  async create() {
    const data = await this._load();
    const now = new Date();
    const title = `绘画 ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const drawing = {
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

  async get(id) {
    const data = await this._load();
    return data.drawings.find(d => d.id === id) || null;
  }

  async updateSvg(id, svgContent) {
    const data = await this._load();
    const drawing = data.drawings.find(d => d.id === id);
    if (!drawing) return null;
    drawing.svgContent = svgContent;
    drawing.updatedAt = new Date().toISOString();
    await this._save();
    return drawing;
  }

  async delete(id) {
    const data = await this._load();
    const index = data.drawings.findIndex(d => d.id === id);
    if (index === -1) return false;
    data.drawings.splice(index, 1);
    await this._save();
    return true;
  }
}
```

**Step 4: Add REST API routes to server/index.js**

Add these routes in `server/index.js` **before** the SPA fallback route. Also import DrawingStore at the top:

Add import at top:
```javascript
import { DrawingStore } from './drawing-store.js';
```

Add instance after `const ptyManager = new PtyManager();`:
```javascript
const drawingStore = new DrawingStore();
```

Add routes before `// SPA fallback`:
```javascript
// --- Drawings REST API ---
app.get('/api/drawings', async (req, res) => {
  const drawings = await drawingStore.list();
  res.json({ drawings });
});

app.post('/api/drawings', async (req, res) => {
  const drawing = await drawingStore.create();
  res.json(drawing);
});

app.delete('/api/drawings/:drawId', async (req, res) => {
  const deleted = await drawingStore.delete(req.params.drawId);
  if (!deleted) {
    return res.status(404).json({ error: 'Drawing not found' });
  }
  res.json({ ok: true });
});
```

**Step 5: Run test to verify it passes**

Run: `npx playwright test e2e/integration/drawing-api.spec.ts --project=integration`
Expected: All 4 tests PASS

**Step 6: Commit**

```bash
git add server/drawing-store.js e2e/integration/drawing-api.spec.ts server/index.js
git commit -m "feat: add DrawingStore and drawings REST API"
```

---

### Task 3: Create SessionManager (multi-instance PTY management)

**Files:**
- Create: `server/session-manager.js`
- Modify: `server/pty-manager.js`

**Step 1: Modify PtyManager to accept spawn options**

In `server/pty-manager.js`, change the `spawn()` method to accept an options object so it can support both new and resumed sessions with per-drawing callback URLs:

Replace the entire `spawn()` method (lines 36-69) with:

```javascript
  /**
   * Spawn claude CLI in a real PTY.
   * @param {object} opts
   * @param {string} opts.sessionId - Claude CLI session UUID
   * @param {boolean} opts.isResume - true to use --resume instead of --session-id
   * @param {string} opts.callbackUrl - SVG callback URL including drawId
   */
  spawn(opts = {}) {
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

    const args = [];
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
      cols: 120,
      rows: 40,
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
```

Also update `attachWebSocket` to accept spawn opts. Change lines 74-77:

From:
```javascript
  attachWebSocket(ws) {
    if (!this.ptyProcess) {
      this.spawn();
    }
```

To:
```javascript
  attachWebSocket(ws, spawnOpts = {}) {
    if (!this.ptyProcess) {
      this.spawn(spawnOpts);
    }
```

**Step 2: Create SessionManager**

Create `server/session-manager.js`:

```javascript
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
```

**Step 3: Run existing tests to verify nothing is broken**

Run: `npx playwright test --project=integration`
Expected: All existing tests still PASS (PtyManager.spawn() defaults are backward-compatible)

**Step 4: Commit**

```bash
git add server/session-manager.js server/pty-manager.js
git commit -m "feat: add SessionManager and extend PtyManager spawn options"
```

---

### Task 4: Rewire server/index.js for multi-session WebSocket routing

**Files:**
- Modify: `server/index.js`

**Step 1: Write the failing test for per-drawId SVG isolation**

Create `e2e/integration/multi-session.spec.ts`:

```typescript
import { test, expect } from '../fixtures';
import { SIMPLE_CIRCLE, TWO_RECTS } from '../helpers/svg-samples';

test.describe('Multi-Session SVG Isolation', () => {
  test('POST /api/svg/:drawId broadcasts only to that drawId WebSocket', async ({ page, apiContext }) => {
    // Create two drawings
    const res1 = await apiContext.post('/api/drawings');
    const drawing1 = await res1.json();
    const res2 = await apiContext.post('/api/drawings');
    const drawing2 = await res2.json();

    // Open page and connect to drawing1's SVG WebSocket
    await page.goto(`/#/draw/${drawing1.id}`);
    await page.waitForTimeout(1000);

    // Post SVG to drawing1 — should appear
    await apiContext.post(`/api/svg/${drawing1.id}`, {
      data: { svg: SIMPLE_CIRCLE },
    });

    const circle = page.locator('.svg-preview-container circle[id="main-circle"]');
    await expect(circle).toBeAttached({ timeout: 5000 });

    // Post SVG to drawing2 — should NOT appear in drawing1's view
    await apiContext.post(`/api/svg/${drawing2.id}`, {
      data: { svg: TWO_RECTS },
    });

    // Wait a moment to make sure no unexpected update arrives
    await page.waitForTimeout(500);
    const rectLeft = page.locator('.svg-preview-container rect[id="rect-left"]');
    await expect(rectLeft).not.toBeAttached();

    // drawing1's circle should still be there
    await expect(circle).toBeAttached();
  });

  test('POST /api/svg/:drawId persists SVG to drawings.json', async ({ apiContext }) => {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();

    await apiContext.post(`/api/svg/${drawing.id}`, {
      data: { svg: SIMPLE_CIRCLE },
    });

    // Verify persistence via GET
    const listRes = await apiContext.get('/api/drawings');
    const body = await listRes.json();
    const found = body.drawings.find((d: any) => d.id === drawing.id);
    expect(found.svgContent).toBe(SIMPLE_CIRCLE);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/multi-session.spec.ts --project=integration`
Expected: FAIL — routes `/api/svg/:drawId` and `/#/draw/:drawId` don't exist yet

**Step 3: Rewrite server/index.js**

Replace the entire content of `server/index.js` with:

```javascript
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
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
/** @type {Map<string, Set<import('ws').WebSocket>>} */
const svgClientsByDrawId = new Map();

function getSvgClients(drawId) {
  if (!svgClientsByDrawId.has(drawId)) {
    svgClientsByDrawId.set(drawId, new Set());
  }
  return svgClientsByDrawId.get(drawId);
}

function broadcastSvg(drawId, svgContent) {
  const clients = svgClientsByDrawId.get(drawId);
  if (!clients) return;
  const message = JSON.stringify({ type: 'svg_update', svg: svgContent });
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

// --- SVG WebSocket connection handler ---
svgWss.on('connection', (ws, request) => {
  const drawId = request._drawId; // attached during upgrade
  const clients = getSvgClients(drawId);
  clients.add(ws);
  console.log(`[SVG WS] Client connected for drawId=${drawId}, clients=${clients.size}`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      const manager = sessionManager.sessions.get(drawId);
      if (!manager) return;
      if (data.type === 'selection') {
        manager.setSelection(data.selection);
      } else if (data.type === 'clear_selection') {
        manager.clearSelection();
      }
    } catch (e) {
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
terminalWss.on('connection', async (ws, request) => {
  const drawId = request._drawId;
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

  // Determine if this is a resume (has existing PTY) or fresh start
  const isResume = manager.ptyProcess !== null ? false : true;
  // For resume: check if there's an existing Claude session to resume
  // A session should be resumed if the drawing was previously created (not brand new)
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
      // Only destroy if no new terminal connected
      if (!sessionManager.hasActiveTerminal(drawId)) {
        sessionManager.destroy(drawId);
      }
    }, 2000);
  });
});

// --- HTTP upgrade routing ---
server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);

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
app.post('/api/svg/:drawId', async (req, res) => {
  const { svg } = req.body;
  const { drawId } = req.params;
  if (!svg) {
    return res.status(400).json({ error: 'Missing svg field' });
  }
  broadcastSvg(drawId, svg);
  await drawingStore.updateSvg(drawId, svg);
  console.log(`[SVG] Received SVG update for drawId=${drawId}, broadcast to`, svgClientsByDrawId.get(drawId)?.size || 0, 'clients');
  res.json({ ok: true });
});

// --- Drawings REST API ---
app.get('/api/drawings', async (req, res) => {
  const drawings = await drawingStore.list();
  res.json({ drawings });
});

app.post('/api/drawings', async (req, res) => {
  const drawing = await drawingStore.create();
  res.json(drawing);
});

app.delete('/api/drawings/:drawId', async (req, res) => {
  const { drawId } = req.params;
  // Kill active session if any
  sessionManager.destroy(drawId);
  const deleted = await drawingStore.delete(drawId);
  if (!deleted) {
    return res.status(404).json({ error: 'Drawing not found' });
  }
  res.json({ ok: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// SPA fallback (Express 5 requires named wildcard parameter)
app.get('/{*splat}', (req, res) => {
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

**Step 4: Run all integration tests**

Run: `npx playwright test --project=integration`
Expected: `drawing-api` tests PASS. Existing tests for page-layout, websocket-svg, and region-selection will FAIL because the frontend hasn't been updated yet. That's expected — we'll fix those in the next tasks.

**Step 5: Commit**

```bash
git add server/index.js e2e/integration/multi-session.spec.ts
git commit -m "feat: rewire server for multi-session WebSocket routing"
```

---

### Task 5: Frontend — Add React Router and create DrawPage

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Create: `src/pages/DrawPage.tsx`
- Create: `src/pages/DrawPage.css`

**Step 1: Create DrawPage component**

This extracts the current App.tsx canvas logic into a route-specific page. Create `src/pages/DrawPage.tsx`:

```tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Terminal from '../components/Terminal';
import SvgPreview, { SelectionData } from '../components/SvgPreview';
import './DrawPage.css';

const DEFAULT_SVG = '<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><text x="400" y="300" text-anchor="middle" fill="#666" font-size="24">Waiting for artwork...</text></svg>';

export default function DrawPage() {
  const { drawId } = useParams<{ drawId: string }>();
  const navigate = useNavigate();
  const wsBase = `ws://${window.location.host}`;

  const [svgContent, setSvgContent] = useState(DEFAULT_SVG);
  const [title, setTitle] = useState('');
  const [selection, setSelection] = useState<SelectionData | null>(null);
  const [svgWs, setSvgWs] = useState<WebSocket | null>(null);

  // Load drawing metadata and initial SVG
  useEffect(() => {
    if (!drawId) return;
    fetch(`/api/drawings`)
      .then(res => res.json())
      .then(data => {
        const drawing = data.drawings.find((d: any) => d.id === drawId);
        if (drawing) {
          setTitle(drawing.title);
          if (drawing.svgContent) {
            setSvgContent(drawing.svgContent);
          }
        }
      })
      .catch(console.error);
  }, [drawId]);

  // SVG WebSocket connection (per drawId)
  useEffect(() => {
    if (!drawId) return;
    const ws = new WebSocket(`${wsBase}/ws/svg/${drawId}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'svg_update') {
          setSvgContent(data.svg);
        }
      } catch {
        // ignore
      }
    };

    setSvgWs(ws);
    return () => ws.close();
  }, [wsBase, drawId]);

  // Send selection to backend
  const handleSelectionChange = useCallback((sel: SelectionData | null) => {
    setSelection(sel);
    if (svgWs?.readyState === WebSocket.OPEN) {
      if (sel) {
        svgWs.send(JSON.stringify({ type: 'selection', selection: sel }));
      } else {
        svgWs.send(JSON.stringify({ type: 'clear_selection' }));
      }
    }
  }, [svgWs]);

  return (
    <div className="draw-page">
      <div className="top-bar">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <span className="drawing-title">{title}</span>
      </div>
      <div className="draw-content">
        <div className="svg-pane">
          <SvgPreview
            svgContent={svgContent}
            externalSelection={selection}
            onSelectionChange={handleSelectionChange}
          />
          {selection && (
            <div className="selection-info">
              <span>
                Selected: ({Math.round(selection.region.x)}, {Math.round(selection.region.y)}) {Math.round(selection.region.width)}x{Math.round(selection.region.height)}
              </span>
              {selection.elements.length > 0 && (
                <span> | {selection.elements.length} element(s)</span>
              )}
              <button onClick={() => handleSelectionChange(null)}>Clear</button>
            </div>
          )}
        </div>
        <div className="terminal-pane">
          <Terminal wsUrl={`${wsBase}/ws/terminal/${drawId}`} />
        </div>
      </div>
    </div>
  );
}
```

Create `src/pages/DrawPage.css`:

```css
.draw-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #16162a;
  border-bottom: 1px solid #333;
  min-height: 44px;
}

.back-button {
  padding: 4px 12px;
  background: #374151;
  color: #eee;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.back-button:hover {
  background: #4b5563;
}

.drawing-title {
  color: #93c5fd;
  font-size: 14px;
  font-family: monospace;
}

.draw-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
```

**Step 2: Update App.tsx to be a route container**

Replace `src/App.tsx` with:

```tsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DrawPage from './pages/DrawPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/draw/:drawId" element={<DrawPage />} />
    </Routes>
  );
}
```

**Step 3: Update main.tsx to add HashRouter**

Replace `src/main.tsx` with:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './App.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
```

**Step 4: Create placeholder HomePage (will be fully built in Task 6)**

Create `src/pages/HomePage.tsx`:

```tsx
export default function HomePage() {
  return (
    <div className="home-page">
      <h1>SVG Artist</h1>
      <p>Loading...</p>
    </div>
  );
}
```

**Step 5: Build and verify no TypeScript errors**

Run: `npx vite build`
Expected: Build succeeds with no errors

**Step 6: Commit**

```bash
git add src/main.tsx src/App.tsx src/pages/DrawPage.tsx src/pages/DrawPage.css src/pages/HomePage.tsx
git commit -m "feat: add React Router, extract DrawPage from App"
```

---

### Task 6: Frontend — Build HomePage with create + history + delete

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Create: `src/pages/HomePage.css`
- Create: `src/components/DrawingCard.tsx`
- Create: `src/components/DrawingCard.css`

**Step 1: Write the failing test**

Create `e2e/integration/homepage.spec.ts`:

```typescript
import { test, expect } from '../fixtures';

test.describe('Homepage', () => {
  test('homepage renders with SVG Artist title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'SVG Artist' })).toBeVisible();
  });

  test('create button exists and creates new drawing', async ({ page }) => {
    await page.goto('/');
    const createButton = page.getByRole('button', { name: /create|新建|创建/i });
    await expect(createButton).toBeVisible();

    await createButton.click();

    // Should navigate to /draw/:id
    await page.waitForURL(/\/#\/draw\/.+/);
    // Should see the draw page layout
    await expect(page.locator('.draw-content')).toBeVisible({ timeout: 5000 });
  });

  test('created drawing appears in history list', async ({ page, apiContext }) => {
    // Create a drawing via API
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();

    await page.goto('/');

    // Should see the drawing card
    await expect(page.getByText(drawing.title)).toBeVisible({ timeout: 5000 });
  });

  test('clicking history card navigates to draw page', async ({ page, apiContext }) => {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();

    await page.goto('/');
    await page.getByText(drawing.title).click();

    await page.waitForURL(`/#/draw/${drawing.id}`);
    await expect(page.locator('.draw-content')).toBeVisible({ timeout: 5000 });
  });

  test('delete button removes drawing from list', async ({ page, apiContext }) => {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();

    await page.goto('/');
    await expect(page.getByText(drawing.title)).toBeVisible({ timeout: 5000 });

    // Click the delete button on the card
    const card = page.locator('.drawing-card', { has: page.getByText(drawing.title) });
    const deleteButton = card.locator('.delete-button');
    await deleteButton.click();

    // Drawing should be removed
    await expect(page.getByText(drawing.title)).not.toBeVisible({ timeout: 5000 });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/homepage.spec.ts --project=integration`
Expected: FAIL

**Step 3: Create DrawingCard component**

Create `src/components/DrawingCard.tsx`:

```tsx
import './DrawingCard.css';

interface Drawing {
  id: string;
  title: string;
  createdAt: string;
  svgContent: string;
}

interface DrawingCardProps {
  drawing: Drawing;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export default function DrawingCard({ drawing, onClick, onDelete }: DrawingCardProps) {
  return (
    <div className="drawing-card" onClick={onClick}>
      <div
        className="card-thumbnail"
        dangerouslySetInnerHTML={{ __html: drawing.svgContent }}
      />
      <div className="card-info">
        <span className="card-title">{drawing.title}</span>
        <button
          className="delete-button"
          onClick={onDelete}
          title="Delete drawing"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
```

Create `src/components/DrawingCard.css`:

```css
.drawing-card {
  background: #1e1e3a;
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
}

.drawing-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.card-thumbnail {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #2a2a3e;
}

.card-thumbnail svg {
  width: 100%;
  height: 100%;
}

.card-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid #333;
}

.card-title {
  color: #ccc;
  font-size: 12px;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
}

.delete-button:hover {
  background: #dc2626;
  color: #fff;
}
```

**Step 4: Build full HomePage**

Replace `src/pages/HomePage.tsx` with:

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DrawingCard from '../components/DrawingCard';
import './HomePage.css';

interface Drawing {
  id: string;
  title: string;
  createdAt: string;
  svgContent: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/drawings')
      .then(res => res.json())
      .then(data => {
        setDrawings(data.drawings || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load drawings:', err);
        setLoading(false);
      });
  }, []);

  const handleCreate = async () => {
    const res = await fetch('/api/drawings', { method: 'POST' });
    const drawing = await res.json();
    navigate(`/draw/${drawing.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Don't navigate when clicking delete
    await fetch(`/api/drawings/${id}`, { method: 'DELETE' });
    setDrawings(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>SVG Artist</h1>
        <button className="create-button" onClick={handleCreate}>
          + Create New Drawing
        </button>
      </div>

      {loading ? (
        <p className="home-loading">Loading...</p>
      ) : drawings.length === 0 ? (
        <p className="home-empty">No drawings yet. Create your first one!</p>
      ) : (
        <div className="drawings-grid">
          {drawings
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(drawing => (
              <DrawingCard
                key={drawing.id}
                drawing={drawing}
                onClick={() => navigate(`/draw/${drawing.id}`)}
                onDelete={(e) => handleDelete(e, drawing.id)}
              />
            ))}
        </div>
      )}
    </div>
  );
}
```

Create `src/pages/HomePage.css`:

```css
.home-page {
  height: 100%;
  padding: 40px;
  background: #0f0f23;
  color: #fff;
  overflow-y: auto;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.home-header h1 {
  font-size: 28px;
  color: #93c5fd;
}

.create-button {
  padding: 10px 20px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
}

.create-button:hover {
  background: #2563eb;
}

.home-loading,
.home-empty {
  color: #666;
  font-size: 16px;
  text-align: center;
  margin-top: 60px;
}

.drawings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}
```

**Step 5: Run test to verify it passes**

Run: `npx playwright test e2e/integration/homepage.spec.ts --project=integration`
Expected: All 5 tests PASS

**Step 6: Commit**

```bash
git add src/pages/HomePage.tsx src/pages/HomePage.css src/components/DrawingCard.tsx src/components/DrawingCard.css e2e/integration/homepage.spec.ts
git commit -m "feat: build HomePage with create, history list, and delete"
```

---

### Task 7: Update existing tests for new routing

**Files:**
- Modify: `e2e/integration/page-layout.spec.ts`
- Modify: `e2e/integration/websocket-svg.spec.ts`
- Modify: `e2e/integration/region-selection.spec.ts`

The existing tests navigate to `/` and expect the draw page layout. Now `/` shows the HomePage instead. Tests need to create a drawing first and navigate to `/draw/:id`.

**Step 1: Add a shared helper to create and navigate to a drawing**

Create `e2e/helpers/navigate-to-drawing.ts`:

```typescript
import type { Page, APIRequestContext } from '@playwright/test';

/**
 * Create a drawing via API and navigate to its draw page.
 * Returns the drawId.
 */
export async function createAndNavigateToDrawing(
  page: Page,
  apiContext: APIRequestContext,
): Promise<string> {
  const res = await apiContext.post('/api/drawings');
  const drawing = await res.json();
  await page.goto(`/#/draw/${drawing.id}`);
  return drawing.id;
}
```

**Step 2: Update page-layout.spec.ts**

Replace `e2e/integration/page-layout.spec.ts` with:

```typescript
import { test, expect } from '../fixtures';
import { createAndNavigateToDrawing } from '../helpers/navigate-to-drawing';

test.describe('Page Layout', () => {
  test('page loads with title "SVG Artist"', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('SVG Artist');
  });

  test('split pane layout is visible on draw page', async ({ page, apiContext }) => {
    await createAndNavigateToDrawing(page, apiContext);
    const svgPane = page.locator('.svg-pane');
    const terminalPane = page.locator('.terminal-pane');

    await expect(svgPane).toBeVisible();
    await expect(terminalPane).toBeVisible();
  });

  test('xterm.js terminal container renders in the terminal pane', async ({ page, apiContext }) => {
    await createAndNavigateToDrawing(page, apiContext);
    const xterm = page.locator('.terminal-pane .xterm');

    await expect(xterm).toBeVisible({ timeout: 10_000 });
  });

  test('placeholder SVG displays "Waiting for artwork..." text', async ({ page, apiContext }) => {
    await createAndNavigateToDrawing(page, apiContext);
    const placeholder = page.getByText('Waiting for artwork...');

    await expect(placeholder).toBeVisible();
  });
});
```

**Step 3: Update websocket-svg.spec.ts**

Replace `e2e/integration/websocket-svg.spec.ts` with:

```typescript
import { test, expect } from '../fixtures';
import { SIMPLE_CIRCLE, TWO_RECTS } from '../helpers/svg-samples';
import { createAndNavigateToDrawing } from '../helpers/navigate-to-drawing';

/**
 * Navigate to a draw page and ensure the SVG WebSocket is connected.
 */
async function gotoDrawingAndEnsureSvgWsReady(
  page: import('@playwright/test').Page,
  apiContext: import('@playwright/test').APIRequestContext,
) {
  const drawId = await createAndNavigateToDrawing(page, apiContext);

  // Wait for the page to be interactive (xterm renders)
  await expect(page.locator('.xterm')).toBeAttached({ timeout: 10_000 });

  // Poll: keep posting a probe SVG until it appears in the DOM
  const probeSvg = '<svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg"><circle id="ws-probe" cx="0" cy="0" r="1"/></svg>';
  const probeLocator = page.locator('.svg-preview-container circle[id="ws-probe"]');

  for (let attempt = 0; attempt < 10; attempt++) {
    await apiContext.post(`/api/svg/${drawId}`, { data: { svg: probeSvg } });
    try {
      await expect(probeLocator).toBeAttached({ timeout: 500 });
      break;
    } catch {
      await page.waitForTimeout(200);
    }
  }

  return drawId;
}

test.describe('SVG WebSocket Updates', () => {
  test('SVG update via API renders in the preview', async ({ page, apiContext }) => {
    const drawId = await gotoDrawingAndEnsureSvgWsReady(page, apiContext);

    const response = await apiContext.post(`/api/svg/${drawId}`, {
      data: { svg: SIMPLE_CIRCLE },
    });
    expect(response.ok()).toBeTruthy();

    const circle = page.locator('.svg-preview-container circle[id="main-circle"]');
    await expect(circle).toBeAttached({ timeout: 5000 });
  });

  test('sequential updates replace previous SVG content', async ({ page, apiContext }) => {
    const drawId = await gotoDrawingAndEnsureSvgWsReady(page, apiContext);

    await apiContext.post(`/api/svg/${drawId}`, {
      data: { svg: SIMPLE_CIRCLE },
    });
    const circle = page.locator('.svg-preview-container circle[id="main-circle"]');
    await expect(circle).toBeAttached({ timeout: 5000 });

    await apiContext.post(`/api/svg/${drawId}`, {
      data: { svg: TWO_RECTS },
    });
    const rectLeft = page.locator('.svg-preview-container rect[id="rect-left"]');
    const rectRight = page.locator('.svg-preview-container rect[id="rect-right"]');
    await expect(rectLeft).toBeAttached({ timeout: 5000 });
    await expect(rectRight).toBeAttached({ timeout: 5000 });

    await expect(circle).not.toBeAttached();
  });

  test('invalid request returns 400', async ({ apiContext }) => {
    // Need a drawId for the new route format
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();

    const response = await apiContext.post(`/api/svg/${drawing.id}`, {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test('health check returns 200 with status ok', async ({ apiContext }) => {
    const response = await apiContext.get('/api/health');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toEqual({ status: 'ok' });
  });
});
```

**Step 4: Update region-selection.spec.ts**

Replace `e2e/integration/region-selection.spec.ts` with:

```typescript
import { test, expect } from '../fixtures';
import { COMPLEX_SCENE } from '../helpers/svg-samples';
import { createAndNavigateToDrawing } from '../helpers/navigate-to-drawing';

/**
 * Post SVG via API and reliably wait for it to render in the browser.
 */
async function postSvgAndWaitForRender(
  page: import('@playwright/test').Page,
  apiContext: import('@playwright/test').APIRequestContext,
  drawId: string,
  svg: string,
  selectorToWait: string,
) {
  const locator = page.locator(selectorToWait);

  for (let attempt = 0; attempt < 10; attempt++) {
    await apiContext.post(`/api/svg/${drawId}`, { data: { svg } });
    try {
      await expect(locator).toBeAttached({ timeout: 500 });
      return;
    } catch {
      await page.waitForTimeout(200);
    }
  }

  await apiContext.post(`/api/svg/${drawId}`, { data: { svg } });
  await expect(locator).toBeAttached({ timeout: 5000 });
}

test.describe('Region Selection', () => {
  let drawId: string;

  test.beforeEach(async ({ page, apiContext }) => {
    drawId = await createAndNavigateToDrawing(page, apiContext);

    // Wait for the page to be interactive
    await expect(page.locator('.xterm')).toBeAttached({ timeout: 10_000 });

    // Post the complex scene SVG and wait for it to render
    await postSvgAndWaitForRender(
      page,
      apiContext,
      drawId,
      COMPLEX_SCENE,
      '.svg-preview-container rect[id="background"]',
    );
  });

  async function performDrag(page: import('@playwright/test').Page) {
    const container = page.locator('.svg-preview-container');
    const box = await container.boundingBox();

    const startX = box!.x + box!.width * 0.25;
    const startY = box!.y + box!.height * 0.5;
    const endX = box!.x + box!.width * 0.75;
    const endY = box!.y + box!.height * 0.75;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(300);
  }

  test('drag selection creates overlay', async ({ page }) => {
    await performDrag(page);
    const selectionInfo = page.locator('.selection-info');
    await expect(selectionInfo).toBeVisible({ timeout: 5000 });
  });

  test('selection info shows coordinates', async ({ page }) => {
    await performDrag(page);
    const selectionInfo = page.locator('.selection-info');
    await expect(selectionInfo).toBeVisible({ timeout: 5000 });
    await expect(selectionInfo).toContainText('Selected:');
  });

  test('selection info shows element count', async ({ page }) => {
    await performDrag(page);
    const selectionInfo = page.locator('.selection-info');
    await expect(selectionInfo).toBeVisible({ timeout: 5000 });
    await expect(selectionInfo).toContainText('element(s)');
  });

  test('clear button removes selection', async ({ page }) => {
    await performDrag(page);
    const selectionInfo = page.locator('.selection-info');
    await expect(selectionInfo).toBeVisible({ timeout: 5000 });

    const clearButton = selectionInfo.locator('button', { hasText: 'Clear' });
    await clearButton.click();
    await expect(selectionInfo).not.toBeVisible();
  });
});
```

**Step 5: Run all integration tests**

Run: `npx playwright test --project=integration`
Expected: ALL tests PASS

**Step 6: Commit**

```bash
git add e2e/helpers/navigate-to-drawing.ts e2e/integration/page-layout.spec.ts e2e/integration/websocket-svg.spec.ts e2e/integration/region-selection.spec.ts
git commit -m "test: update existing tests for multi-session routing"
```

---

### Task 8: Add data/ to .gitignore and clean up unused code

**Files:**
- Modify: `.gitignore`
- Delete (or remove content from): `src/hooks/useWebSocket.ts`

**Step 1: Add data/ to .gitignore**

Append to `.gitignore`:

```
# Drawing persistence
data/
```

**Step 2: Delete unused useWebSocket hook**

Run: `rm src/hooks/useWebSocket.ts && rmdir src/hooks 2>/dev/null; true`

(The hook is not imported anywhere and was noted as unused in the architecture analysis.)

**Step 3: Run all integration tests to confirm nothing broke**

Run: `npx playwright test --project=integration`
Expected: ALL tests PASS

**Step 4: Commit**

```bash
git add .gitignore
git rm src/hooks/useWebSocket.ts
git commit -m "chore: add data/ to gitignore, remove unused useWebSocket hook"
```

---

### Task 9: Final integration verification

**Step 1: Run full integration test suite**

Run: `npx playwright test --project=integration`
Expected: ALL tests PASS (homepage, drawing-api, multi-session, page-layout, websocket-svg, region-selection)

**Step 2: Manual smoke test**

Run: `npm run dev`

Verify manually:
1. Open `http://localhost:5173` — see Homepage with "SVG Artist" title and "Create New Drawing" button
2. Click "Create New Drawing" — navigates to `/#/draw/<id>`, see split pane with terminal
3. Open another tab, go to `http://localhost:5173` — see the drawing in history list
4. Click the history card — navigates to the same drawing
5. Go back to homepage, click delete — drawing removed from list
6. Create two drawings, open them in separate tabs — each has independent terminal

**Step 3: Commit any final adjustments if needed**

```bash
git add -A
git commit -m "feat: multi-session architecture complete"
```
