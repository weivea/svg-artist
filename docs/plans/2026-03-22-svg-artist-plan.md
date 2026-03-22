# SVG Artist Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web-based SVG drawing tool where users interact with Claude Code via an xterm.js terminal, and SVG artwork is rendered live in a split-pane UI.

**Architecture:** React + Vite frontend with xterm.js terminal proxy (right pane) and live SVG preview with region selection (left pane). Node.js backend manages a long-running Claude Code PTY process via node-pty, bridges MCP Server SVG updates to the frontend via WebSocket, and intercepts terminal input to inject selection context.

**Tech Stack:** React, TypeScript, Vite, xterm.js, node-pty, Express, ws, @modelcontextprotocol/sdk

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.css`
- Create: `server/index.js`
- Create: `mcp-config.json`

**Step 1: Initialize npm project and install dependencies**

Run:
```bash
cd /Users/jianliwei/repos/svg-artist
npm init -y
npm install express ws node-pty @modelcontextprotocol/sdk
npm install -D vite @vitejs/plugin-react react react-dom typescript @types/react @types/react-dom @xterm/xterm @xterm/addon-fit @xterm/addon-attach
```

**Step 2: Create vite.config.ts**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
```

**Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

**Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SVG Artist</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 5: Create minimal React entry point**

`src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="app">
      <div className="svg-pane">
        <p>SVG Preview (TODO)</p>
      </div>
      <div className="terminal-pane">
        <p>Terminal (TODO)</p>
      </div>
    </div>
  );
}
```

`src/App.css`:
```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #root { height: 100%; }
.app {
  display: flex;
  height: 100%;
}
.svg-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #333;
  background: #1a1a1a;
  color: #fff;
}
.terminal-pane {
  flex: 1;
  background: #000;
  color: #fff;
}
```

**Step 6: Create minimal server entry point**

`server/index.js`:
```js
import express from 'express';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const PORT = 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

server.listen(PORT, () => {
  console.log(`SVG Artist server listening on http://localhost:${PORT}`);
});
```

**Step 7: Create mcp-config.json**

```json
{
  "mcpServers": {
    "svg-artist": {
      "command": "node",
      "args": ["./server/mcp-server.js"]
    }
  }
}
```

**Step 8: Add scripts to package.json**

Add to `package.json`:
```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "server": "node server/index.js",
    "start": "npm run build && node server/index.js"
  }
}
```

**Step 9: Verify frontend starts**

Run: `npx vite --open`
Expected: Browser opens, shows split pane with "SVG Preview (TODO)" and "Terminal (TODO)"

**Step 10: Verify backend starts**

Run: `node server/index.js`
Expected: Console prints "SVG Artist server listening on http://localhost:3000"

**Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold project with Vite + React + Express"
```

---

### Task 2: MCP Server (draw_svg tool)

**Files:**
- Create: `server/mcp-server.js`

**Step 1: Create MCP Server with draw_svg tool**

`server/mcp-server.js`:
```js
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
  async ({ svg_content }) => {
    try {
      const res = await fetch(CALLBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ svg: svg_content }),
      });

      if (!res.ok) {
        return {
          content: [{ type: 'text', text: `Failed to push SVG update: HTTP ${res.status}` }],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text', text: 'SVG rendered successfully in the preview pane.' }],
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Failed to push SVG update: ${err.message}` }],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

**Step 2: Verify MCP Server loads without error**

Run: `echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node server/mcp-server.js`
Expected: JSON response with server capabilities (no crash)

**Step 3: Commit**

```bash
git add server/mcp-server.js
git commit -m "feat: add MCP server with draw_svg tool"
```

---

### Task 3: Backend WebSocket + SVG Callback

**Files:**
- Modify: `server/index.js`

**Step 1: Add WebSocket server and SVG callback endpoint**

Replace `server/index.js` with:
```js
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Serve built frontend in production
app.use(express.static(join(__dirname, '..', 'dist')));

// --- WebSocket A: SVG updates ---
const svgWss = new WebSocketServer({ noServer: true });
const svgClients = new Set();

svgWss.on('connection', (ws) => {
  svgClients.add(ws);
  console.log('[SVG WS] Client connected');
  ws.on('close', () => svgClients.delete(ws));
});

function broadcastSvg(svgContent) {
  const message = JSON.stringify({ type: 'svg_update', svg: svgContent });
  for (const client of svgClients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

// --- WebSocket B: Terminal PTY (placeholder, implemented in Task 4) ---
const terminalWss = new WebSocketServer({ noServer: true });

terminalWss.on('connection', (ws) => {
  console.log('[Terminal WS] Client connected');
  ws.send('\r\n*** Terminal will be connected in Task 4 ***\r\n');
});

// --- HTTP upgrade routing ---
server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);

  if (pathname === '/ws/svg') {
    svgWss.handleUpgrade(request, socket, head, (ws) => {
      svgWss.emit('connection', ws, request);
    });
  } else if (pathname === '/ws/terminal') {
    terminalWss.handleUpgrade(request, socket, head, (ws) => {
      terminalWss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// --- SVG callback endpoint (called by MCP Server) ---
app.post('/api/svg', (req, res) => {
  const { svg } = req.body;
  if (!svg) {
    return res.status(400).json({ error: 'Missing svg field' });
  }
  broadcastSvg(svg);
  console.log('[SVG] Received SVG update, broadcast to', svgClients.size, 'clients');
  res.json({ ok: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`SVG Artist server listening on http://localhost:${PORT}`);
});

export { terminalWss };
```

**Step 2: Test SVG callback manually**

Run server: `node server/index.js &`
Run: `curl -X POST http://localhost:3000/api/svg -H "Content-Type: application/json" -d '{"svg":"<svg><circle r=\"50\"/></svg>"}'`
Expected: `{"ok":true}` and server logs "Received SVG update"

**Step 3: Commit**

```bash
git add server/index.js
git commit -m "feat: add WebSocket servers and SVG callback endpoint"
```

---

### Task 4: PTY Manager

**Files:**
- Create: `server/pty-manager.js`
- Modify: `server/index.js` (integrate PTY manager with terminal WebSocket)

**Step 1: Create PTY Manager**

`server/pty-manager.js`:
```js
import pty from 'node-pty';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

export class PtyManager {
  constructor() {
    this.ptyProcess = null;
    this.terminalWs = null;
    this.selectionContext = null; // current region selection
    this.inputBuffer = '';
  }

  /**
   * Spawn claude CLI in a real PTY
   */
  spawn() {
    const mcpConfigPath = join(projectRoot, 'mcp-config.json');
    const systemPrompt = [
      'You are an SVG artist. The user will describe what they want you to draw.',
      'Use the draw_svg tool to render your artwork. Always provide complete SVG content.',
      'Give each SVG element a meaningful id attribute for easy identification.',
      'Use viewBox="0 0 800 600" unless the user specifies otherwise.',
      'When the user selects a region and asks for changes, only modify the specified elements.',
    ].join(' ');

    this.ptyProcess = pty.spawn('claude', [
      '--mcp-config', mcpConfigPath,
      '--system-prompt', systemPrompt,
      '--allowedTools', 'mcp__svg-artist__draw_svg',
    ], {
      name: 'xterm-256color',
      cols: 120,
      rows: 40,
      cwd: projectRoot,
      env: {
        ...process.env,
        SVG_CALLBACK_URL: `http://localhost:${process.env.PORT || 3000}/api/svg`,
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
  attachWebSocket(ws) {
    if (!this.ptyProcess) {
      this.spawn();
    }

    this.terminalWs = ws;

    // PTY stdout → WebSocket → xterm.js
    const dataHandler = this.ptyProcess.onData((data) => {
      if (ws.readyState === 1) {
        ws.send(data);
      }
    });

    // xterm.js → WebSocket → PTY stdin (with interception)
    ws.on('message', (message) => {
      const input = message.toString();
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
  handleInput(input) {
    if (!this.ptyProcess) return;

    // Check if input contains Enter/Return (carriage return)
    if (input === '\r' && this.selectionContext && this.inputBuffer.trim().length > 0) {
      // Inject selection context before user's message
      const contextPrefix = this.formatSelectionContext();
      // Clear the current line, write context + user input, then send Enter
      // We use a trick: erase the line, write prefixed content, then Enter
      const fullInput = contextPrefix + this.inputBuffer;

      // Clear current line: move to start, clear line
      this.ptyProcess.write('\x1b[2K\r');
      // Write the full input with context
      this.ptyProcess.write(fullInput + '\r');

      this.inputBuffer = '';
      this.selectionContext = null; // clear selection after use
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
  setSelection(selection) {
    this.selectionContext = selection;
    console.log('[PTY] Selection set:', selection?.region);
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.selectionContext = null;
  }

  /**
   * Format selection context as a prefix string for Claude
   */
  formatSelectionContext() {
    const { region, elements } = this.selectionContext;
    const lines = [
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
   * Resize the PTY
   */
  resize(cols, rows) {
    if (this.ptyProcess) {
      this.ptyProcess.resize(cols, rows);
    }
  }

  /**
   * Kill the PTY process
   */
  kill() {
    if (this.ptyProcess) {
      this.ptyProcess.kill();
      this.ptyProcess = null;
    }
  }
}
```

**Step 2: Integrate PTY Manager into server/index.js**

Add to `server/index.js` after the terminal WebSocket setup:

Replace the terminalWss connection handler:
```js
import { PtyManager } from './pty-manager.js';

const ptyManager = new PtyManager();

terminalWss.on('connection', (ws) => {
  console.log('[Terminal WS] Client connected');
  ptyManager.attachWebSocket(ws);
});

// Update SVG WebSocket to handle selection messages
svgWss.on('connection', (ws) => {
  svgClients.add(ws);
  console.log('[SVG WS] Client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'selection') {
        ptyManager.setSelection(data.selection);
      } else if (data.type === 'clear_selection') {
        ptyManager.clearSelection();
      }
    } catch (e) {
      // ignore non-JSON messages
    }
  });

  ws.on('close', () => svgClients.delete(ws));
});
```

**Step 3: Test PTY starts with server**

Run: `node server/index.js`
Expected: Server starts without crash. When a WebSocket connects to `/ws/terminal`, Claude Code PTY should spawn.

**Step 4: Commit**

```bash
git add server/pty-manager.js server/index.js
git commit -m "feat: add PTY manager with stdin interception for selection context"
```

---

### Task 5: Frontend Terminal Component (xterm.js)

**Files:**
- Create: `src/components/Terminal.tsx`
- Modify: `src/App.tsx`

**Step 1: Create Terminal component**

`src/components/Terminal.tsx`:
```tsx
import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  wsUrl: string;
}

export default function Terminal({ wsUrl }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      theme: {
        background: '#1a1a2e',
        foreground: '#eee',
        cursor: '#eee',
      },
      fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", monospace',
      fontSize: 14,
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();
    termRef.current = term;

    // Connect WebSocket
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[Terminal] WebSocket connected');
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    ws.onclose = () => {
      term.write('\r\n\x1b[31m*** Connection closed ***\x1b[0m\r\n');
    };

    // User input → WebSocket → backend → PTY stdin
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'resize',
          cols: term.cols,
          rows: term.rows,
        }));
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      ws.close();
      term.dispose();
    };
  }, [wsUrl]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', padding: '4px' }}
    />
  );
}
```

**Step 2: Integrate Terminal into App**

Update `src/App.tsx`:
```tsx
import Terminal from './components/Terminal';

export default function App() {
  const wsBase = `ws://${window.location.host}`;

  return (
    <div className="app">
      <div className="svg-pane">
        <p style={{ padding: '1rem' }}>SVG Preview (TODO)</p>
      </div>
      <div className="terminal-pane">
        <Terminal wsUrl={`${wsBase}/ws/terminal`} />
      </div>
    </div>
  );
}
```

**Step 3: Handle resize messages in backend**

Add to the WebSocket message handler in `server/pty-manager.js` `handleInput` method, before the current logic:
```js
// At the start of ws.on('message') in attachWebSocket:
try {
  const parsed = JSON.parse(input);
  if (parsed.type === 'resize') {
    this.resize(parsed.cols, parsed.rows);
    return;
  }
} catch (e) {
  // not JSON, treat as terminal input
}
```

**Step 4: Verify terminal connects and shows Claude Code**

Run backend: `node server/index.js`
Run frontend: `npx vite`
Open `http://localhost:5173`
Expected: Right pane shows xterm.js with Claude Code CLI loaded. Can type and interact.

**Step 5: Commit**

```bash
git add src/components/Terminal.tsx src/App.tsx server/pty-manager.js
git commit -m "feat: add xterm.js terminal component with PTY WebSocket"
```

---

### Task 6: Frontend SVG Preview Component

**Files:**
- Create: `src/components/SvgPreview.tsx`
- Create: `src/hooks/useWebSocket.ts`
- Modify: `src/App.tsx`

**Step 1: Create useWebSocket hook**

`src/hooks/useWebSocket.ts`:
```ts
import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    return () => ws.close();
  }, [url]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { ws: wsRef, isConnected, send };
}
```

**Step 2: Create SvgPreview component**

`src/components/SvgPreview.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';

interface SvgPreviewProps {
  svgContent: string;
  onSelectionChange: (selection: SelectionData | null) => void;
}

export interface SelectionData {
  region: { x: number; y: number; width: number; height: number };
  elements: string[];
}

export default function SvgPreview({ svgContent, onSelectionChange }: SvgPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);

  // Convert screen coordinates to SVG viewBox coordinates
  function screenToSvg(clientX: number, clientY: number) {
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) return { x: clientX, y: clientY };

    const rect = svgEl.getBoundingClientRect();
    const viewBox = svgEl.viewBox.baseVal;

    return {
      x: ((clientX - rect.left) / rect.width) * viewBox.width + viewBox.x,
      y: ((clientY - rect.top) / rect.height) * viewBox.height + viewBox.y,
    };
  }

  // Detect SVG elements within a selection rectangle
  function detectElements(selRect: { x: number; y: number; width: number; height: number }) {
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) return [];

    const elements: string[] = [];
    const allElements = svgEl.querySelectorAll('*');

    for (const el of allElements) {
      if (el.tagName === 'svg' || el.tagName === 'defs') continue;
      try {
        const bbox = (el as SVGGraphicsElement).getBBox?.();
        if (!bbox) continue;

        // Check intersection
        const intersects =
          bbox.x < selRect.x + selRect.width &&
          bbox.x + bbox.width > selRect.x &&
          bbox.y < selRect.y + selRect.height &&
          bbox.y + bbox.height > selRect.y;

        if (intersects) {
          const id = el.getAttribute('id');
          const tag = el.tagName;
          const attrs = Array.from(el.attributes)
            .filter(a => ['id', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'd', 'fill'].includes(a.name))
            .map(a => `${a.name}="${a.value}"`)
            .join(' ');
          elements.push(`<${tag} ${attrs}/>`);
        }
      } catch {
        // skip elements that don't support getBBox
      }
    }

    return elements;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    const pos = screenToSvg(e.clientX, e.clientY);
    setDragStart(pos);
    setIsDragging(true);
    setSelection(null);
    onSelectionChange(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    const pos = screenToSvg(e.clientX, e.clientY);
    setSelection({
      x: Math.min(dragStart.x, pos.x),
      y: Math.min(dragStart.y, pos.y),
      width: Math.abs(pos.x - dragStart.x),
      height: Math.abs(pos.y - dragStart.y),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (selection && selection.width > 5 && selection.height > 5) {
      const elements = detectElements(selection);
      const selectionData: SelectionData = {
        region: selection,
        elements,
      };
      onSelectionChange(selectionData);
    }
  };

  // Render SVG with selection overlay
  const svgWithOverlay = selection
    ? svgContent.replace(
        '</svg>',
        `<rect x="${selection.x}" y="${selection.y}" width="${selection.width}" height="${selection.height}" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="2" stroke-dasharray="6 3" pointer-events="none"/></svg>`
      )
    : svgContent;

  return (
    <div
      ref={containerRef}
      className="svg-preview-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ flex: 1, cursor: isDragging ? 'crosshair' : 'default', overflow: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: svgWithOverlay }}
    />
  );
}
```

**Step 3: Update App.tsx to wire SVG preview with WebSocket**

```tsx
import { useState, useEffect, useCallback } from 'react';
import Terminal from './components/Terminal';
import SvgPreview, { SelectionData } from './components/SvgPreview';

export default function App() {
  const wsBase = `ws://${window.location.host}`;
  const [svgContent, setSvgContent] = useState('<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><text x="400" y="300" text-anchor="middle" fill="#666" font-size="24">Waiting for artwork...</text></svg>');
  const [selection, setSelection] = useState<SelectionData | null>(null);
  const [svgWs, setSvgWs] = useState<WebSocket | null>(null);

  // SVG WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`${wsBase}/ws/svg`);

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
  }, [wsBase]);

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
    <div className="app">
      <div className="svg-pane">
        <SvgPreview
          svgContent={svgContent}
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
        <Terminal wsUrl={`${wsBase}/ws/terminal`} />
      </div>
    </div>
  );
}
```

**Step 4: Add selection info bar styles to App.css**

Append to `src/App.css`:
```css
.svg-preview-container svg {
  width: 100%;
  height: 100%;
}
.selection-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #2a2a3e;
  color: #93c5fd;
  font-size: 13px;
  font-family: monospace;
  border-top: 1px solid #333;
}
.selection-info button {
  margin-left: auto;
  padding: 2px 10px;
  background: #374151;
  color: #eee;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.selection-info button:hover {
  background: #4b5563;
}
```

**Step 5: Verify SVG preview renders and selection works**

Run backend + frontend, open browser.
Test: Send a manual SVG update via curl to `/api/svg`.
Expected: SVG appears in left pane. Can drag to select a region. Selection info bar shows coordinates.

**Step 6: Commit**

```bash
git add src/components/SvgPreview.tsx src/hooks/useWebSocket.ts src/App.tsx src/App.css
git commit -m "feat: add SVG preview with live updates and region selection"
```

---

### Task 7: End-to-End Integration Test

**Files:** No new files

**Step 1: Build frontend**

Run: `npx vite build`
Expected: Build succeeds, output in `dist/`

**Step 2: Start the full application**

Run: `node server/index.js`
Open: `http://localhost:3000`
Expected: Split-pane UI. Right pane shows Claude Code terminal. Left pane shows placeholder SVG.

**Step 3: Test drawing flow**

In the xterm terminal, type: "Draw a red circle in the center"
Expected:
- Claude calls `draw_svg` MCP tool
- Left pane updates with SVG containing a red circle
- Terminal shows Claude's response

**Step 4: Test region selection flow**

1. Drag-select the circle area in the left pane
2. Selection info bar shows coordinates and element
3. In terminal, type: "Make it blue"
4. Expected: Claude modifies only the selected element

**Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: integration adjustments from end-to-end testing"
```

---

### Task 8: Polish and Production Readiness

**Files:**
- Modify: `package.json` (finalize scripts)
- Create: `.gitignore`

**Step 1: Create .gitignore**

```
node_modules/
dist/
*.log
.DS_Store
```

**Step 2: Finalize package.json scripts**

```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"node server/index.js\"",
    "dev:frontend": "vite",
    "dev:server": "node server/index.js",
    "build": "vite build",
    "start": "npm run build && node server/index.js"
  }
}
```

Run: `npm install -D concurrently`

**Step 3: Verify `npm start` works end-to-end**

Run: `npm start`
Expected: Builds frontend, starts server, opens on `:3000`, fully functional.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: add gitignore and finalize scripts"
```
