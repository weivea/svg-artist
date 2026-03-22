import express, { Request, Response } from 'express';
import { createServer, IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Duplex } from 'stream';
import { SessionManager } from './session-manager.js';
import { DrawingStore } from './drawing-store.js';
import { SvgEngine } from './svg-engine.js';

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

// --- Layer Query API (must be before /api/svg/:drawId to avoid route shadowing) ---
app.post('/api/svg/:drawId/canvas/info', async (req: Request, res: Response) => {
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  res.json(engine.getCanvasInfo());
});

app.post('/api/svg/:drawId/canvas/source', async (req: Request, res: Response) => {
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  res.json({ svg: drawing.svgContent });
});

app.post('/api/svg/:drawId/layers/list', async (req: Request, res: Response) => {
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  res.json({ layers: engine.listLayers() });
});

app.post('/api/svg/:drawId/layers/get', async (req: Request, res: Response) => {
  const { layer_id } = req.body as { layer_id?: string };
  if (!layer_id) { res.status(400).json({ error: 'Missing layer_id' }); return; }
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  const content = engine.getLayer(layer_id);
  if (content === null) { res.status(404).json({ error: 'Layer not found' }); return; }
  res.json({ content });
});

// --- Layer Mutation API ---
app.post('/api/svg/:drawId/layers/add', async (req: Request, res: Response) => {
  const { name, content, parent_id, position } = req.body as { name?: string; content?: string; parent_id?: string; position?: number };
  if (!name || !content) { res.status(400).json({ error: 'Missing name or content' }); return; }
  const drawId = req.params.drawId as string;
  const drawing = await drawingStore.get(drawId);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  const layerId = engine.addLayer(name, content, parent_id, position);
  if (!layerId) { res.status(404).json({ error: 'Parent layer not found' }); return; }
  const svg = engine.serialize();
  await drawingStore.updateSvg(drawId, svg);
  broadcastSvg(drawId, svg);
  res.json({ ok: true, layer_id: layerId });
});

app.post('/api/svg/:drawId/layers/update', async (req: Request, res: Response) => {
  const { layer_id, content } = req.body as { layer_id?: string; content?: string };
  if (!layer_id || !content) { res.status(400).json({ error: 'Missing layer_id or content' }); return; }
  const drawId = req.params.drawId as string;
  const drawing = await drawingStore.get(drawId);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  const ok = engine.updateLayer(layer_id, content);
  if (!ok) { res.status(404).json({ error: 'Layer not found' }); return; }
  const svg = engine.serialize();
  await drawingStore.updateSvg(drawId, svg);
  broadcastSvg(drawId, svg);
  res.json({ ok: true, layer_id });
});

app.post('/api/svg/:drawId/layers/delete', async (req: Request, res: Response) => {
  const { layer_id } = req.body as { layer_id?: string };
  if (!layer_id) { res.status(400).json({ error: 'Missing layer_id' }); return; }
  const drawId = req.params.drawId as string;
  const drawing = await drawingStore.get(drawId);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  const ok = engine.deleteLayer(layer_id);
  if (!ok) { res.status(404).json({ error: 'Layer not found' }); return; }
  const svg = engine.serialize();
  await drawingStore.updateSvg(drawId, svg);
  broadcastSvg(drawId, svg);
  res.json({ ok: true });
});

app.post('/api/svg/:drawId/layers/move', async (req: Request, res: Response) => {
  const { layer_id, position, target_parent_id } = req.body as { layer_id?: string; position?: number; target_parent_id?: string };
  if (!layer_id || position === undefined || position === null) { res.status(400).json({ error: 'Missing layer_id or position' }); return; }
  const drawId = req.params.drawId as string;
  const drawing = await drawingStore.get(drawId);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  const ok = engine.moveLayer(layer_id, position, target_parent_id);
  if (!ok) { res.status(404).json({ error: 'Layer not found' }); return; }
  const svg = engine.serialize();
  await drawingStore.updateSvg(drawId, svg);
  broadcastSvg(drawId, svg);
  res.json({ ok: true });
});

app.post('/api/svg/:drawId/layers/duplicate', async (req: Request, res: Response) => {
  const { layer_id, new_name, transform } = req.body as { layer_id?: string; new_name?: string; transform?: string };
  if (!layer_id) { res.status(400).json({ error: 'Missing layer_id' }); return; }
  const drawId = req.params.drawId as string;
  const drawing = await drawingStore.get(drawId);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  const newLayerId = engine.duplicateLayer(layer_id, new_name, transform);
  if (!newLayerId) { res.status(404).json({ error: 'Layer not found' }); return; }
  const svg = engine.serialize();
  await drawingStore.updateSvg(drawId, svg);
  broadcastSvg(drawId, svg);
  res.json({ ok: true, new_layer_id: newLayerId });
});

app.post('/api/svg/:drawId/layers/transform', async (req: Request, res: Response) => {
  const { layer_id, translate, scale, rotate } = req.body as any;
  if (!layer_id) { res.status(400).json({ error: 'Missing layer_id' }); return; }
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  if (!engine.transformLayer(layer_id, { translate, scale, rotate })) {
    res.status(404).json({ error: 'Layer not found' }); return;
  }
  const newSvg = engine.serialize();
  await drawingStore.updateSvg(req.params.drawId as string, newSvg);
  broadcastSvg(req.params.drawId as string, newSvg);
  res.json({ ok: true });
});

app.post('/api/svg/:drawId/layers/opacity', async (req: Request, res: Response) => {
  const { layer_id, opacity } = req.body as any;
  if (!layer_id || opacity === undefined) { res.status(400).json({ error: 'Missing layer_id or opacity' }); return; }
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  if (!engine.setLayerOpacity(layer_id, opacity)) { res.status(404).json({ error: 'Layer not found' }); return; }
  const newSvg = engine.serialize();
  await drawingStore.updateSvg(req.params.drawId as string, newSvg);
  broadcastSvg(req.params.drawId as string, newSvg);
  res.json({ ok: true });
});

app.post('/api/svg/:drawId/layers/style', async (req: Request, res: Response) => {
  const { layer_id, ...styles } = req.body as any;
  if (!layer_id) { res.status(400).json({ error: 'Missing layer_id' }); return; }
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  if (!engine.setLayerStyle(layer_id, styles)) { res.status(404).json({ error: 'Layer not found' }); return; }
  const newSvg = engine.serialize();
  await drawingStore.updateSvg(req.params.drawId as string, newSvg);
  broadcastSvg(req.params.drawId as string, newSvg);
  res.json({ ok: true });
});

// --- SVG callback endpoint (called by MCP Server) ---
app.post('/api/svg/:drawId', async (req: Request, res: Response) => {
  const { svg } = req.body as { svg?: string };
  const drawId = req.params.drawId as string;
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
  const drawId = req.params.drawId as string;
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
