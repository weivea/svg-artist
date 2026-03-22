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
