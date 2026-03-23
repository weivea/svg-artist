import express, { Request, Response } from 'express';
import { createServer, IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Duplex } from 'stream';
import { rm } from 'fs/promises';
import { SessionManager } from './session-manager.js';
import { DrawingStore } from './drawing-store.js';
import { SvgEngine } from './svg-engine.js';
import { renderSvgToPng, renderLayerToPng } from './png-renderer.js';
import { generatePalettes } from './color-palettes.js';
import { analyzeComposition } from './composition-analyzer.js';
import type { FilterParams } from './filter-templates.js';
import { generateFilterOrCustom } from './filter-templates.js';
import type { StylePreset } from './style-presets.js';
import {
  validateName, validateSkillContent, validateFilterDefinition,
  validateStyleDefinition, validatePromptExtension,
  validateCustomToolDefinition, validateCustomRouteDefinition,
  validateRollback,
} from './bootstrap-validator.js';
import {
  writeSkill, writeCustomFilter, writeCustomStyle,
  writePromptExtension as storeWritePromptExtension,
  listAllAssets,
  writeCustomTool, loadCustomTool,
  writeCustomRoute, loadCustomRoute,
  getAssetHistory, rollbackAsset,
} from './bootstrap-store.js';
import { executePipeline } from './pipeline-engine.js';
import type { PipelineDeps } from './pipeline-engine.js';

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

// Pipeline execution dependencies (used by custom tools and routes)
const pipelineDeps: PipelineDeps = {
  getSvgEngine: async (drawId: string) => {
    const drawing = await drawingStore.get(drawId);
    if (!drawing) return null;
    return new SvgEngine(drawing.svgContent);
  },
  saveSvg: async (drawId: string, svg: string) => {
    await drawingStore.updateSvg(drawId, svg);
  },
  broadcastSvg: (drawId: string, svg: string) => {
    broadcastSvg(drawId, svg);
  },
};

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

  await manager.attachWebSocket(ws, {
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
  const { layer_id, new_name, transform } = req.body as { layer_id?: string; new_name?: string; transform?: { translate?: { x: number; y: number } } };
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

app.post('/api/svg/:drawId/layers/colors', async (req: Request, res: Response) => {
  const { layer_id } = req.body as { layer_id?: string };
  if (!layer_id) { res.status(400).json({ error: 'Missing layer_id' }); return; }
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  const colors = engine.getLayerColors(layer_id);
  if (colors === null) { res.status(404).json({ error: 'Layer not found' }); return; }
  res.json({ colors });
});

// --- Defs & ViewBox API ---
app.post('/api/svg/:drawId/defs/list', async (req: Request, res: Response) => {
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  res.json({ defs: engine.listDefs() });
});

app.post('/api/svg/:drawId/defs/manage', async (req: Request, res: Response) => {
  const { action, id, content } = req.body as any;
  if (!action || !id) { res.status(400).json({ error: 'Missing action or id' }); return; }
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  if (!engine.manageDefs(action, id, content)) { res.status(400).json({ error: 'Defs operation failed' }); return; }
  const newSvg = engine.serialize();
  await drawingStore.updateSvg(req.params.drawId as string, newSvg);
  broadcastSvg(req.params.drawId as string, newSvg);
  res.json({ ok: true, id });
});

app.post('/api/svg/:drawId/canvas/viewbox', async (req: Request, res: Response) => {
  const { x, y, width, height } = req.body as any;
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  engine.setViewBox(x, y, width, height);
  const newSvg = engine.serialize();
  await drawingStore.updateSvg(req.params.drawId as string, newSvg);
  broadcastSvg(req.params.drawId as string, newSvg);
  res.json({ ok: true });
});

// --- New Professional Tools API ---
app.post('/api/svg/:drawId/filter/apply', async (req: Request, res: Response) => {
  const { layer_id, filter_type, params } = req.body as { layer_id?: string; filter_type?: string; params?: FilterParams };
  if (!layer_id || !filter_type) { res.status(400).json({ error: 'Missing layer_id or filter_type' }); return; }
  const drawId = req.params.drawId as string;
  const drawing = await drawingStore.get(drawId);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }

  const filterResult = await generateFilterOrCustom(filter_type, params);
  if (!filterResult) { res.status(400).json({ error: `Unknown filter type: ${filter_type}` }); return; }

  const engine = new SvgEngine(drawing.svgContent);
  const result = engine.applyFilterDef(layer_id, filterResult.filterId, filterResult.filterSvg);
  if (!result.ok) { res.status(400).json({ error: result.error }); return; }
  const svg = engine.serialize();
  await drawingStore.updateSvg(drawId, svg);
  broadcastSvg(drawId, svg);
  res.json({ ok: true, filter_id: result.filterId });
});

app.post('/api/svg/:drawId/style/apply', async (req: Request, res: Response) => {
  const { preset, layers } = req.body as { preset?: string; layers?: string[] };
  if (!preset) { res.status(400).json({ error: 'Missing preset' }); return; }
  const drawId = req.params.drawId as string;
  const drawing = await drawingStore.get(drawId);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  const result = engine.applyStyleToLayers(preset as StylePreset, layers);
  if (!result.ok) { res.status(400).json({ error: result.error }); return; }
  const svg = engine.serialize();
  await drawingStore.updateSvg(drawId, svg);
  broadcastSvg(drawId, svg);
  res.json({ ok: true, affected_layers: result.affectedLayers, description: result.description });
});

app.post('/api/svg/:drawId/palette/generate', async (req: Request, res: Response) => {
  const { theme, mood, count } = req.body as { theme?: string; mood?: string; count?: number };
  const result = generatePalettes({ theme, mood, count });
  res.json(result);
});

app.post('/api/svg/:drawId/composition/critique', async (req: Request, res: Response) => {
  const drawId = req.params.drawId as string;
  const drawing = await drawingStore.get(drawId);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  const analysis = analyzeComposition(engine);
  res.json(analysis);
});

// --- Preview & BBox API ---
app.post('/api/svg/:drawId/preview', async (req: Request, res: Response) => {
  const { width, height } = req.body as any;
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  try {
    const png = renderSvgToPng(drawing.svgContent, width || 800, height);
    res.json({ image: png.toString('base64') });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `PNG render failed: ${msg}` });
  }
});

app.post('/api/svg/:drawId/preview/layer', async (req: Request, res: Response) => {
  const { layer_id, width, height, show_background } = req.body as any;
  if (!layer_id) { res.status(400).json({ error: 'Missing layer_id' }); return; }
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  try {
    const png = renderLayerToPng(drawing.svgContent, layer_id, width || 400, height, show_background);
    if (!png) { res.status(404).json({ error: 'Layer not found' }); return; }
    res.json({ image: png.toString('base64') });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `PNG render failed: ${msg}` });
  }
});

app.post('/api/svg/:drawId/canvas/bbox', async (req: Request, res: Response) => {
  const { element_id } = req.body as any;
  if (!element_id) { res.status(400).json({ error: 'Missing element_id' }); return; }
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  const bbox = engine.getElementBBox(element_id);
  if (!bbox) { res.status(404).json({ error: 'Element not found' }); return; }
  res.json(bbox);
});

// --- Bootstrap / Self-improvement API ---

app.post('/api/svg/:drawId/bootstrap/write-skill', async (req: Request, res: Response) => {
  const { name, content } = req.body as { name?: string; content?: string };
  if (!name || !content) { res.status(400).json({ error: 'Missing name or content' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  const contentCheck = validateSkillContent(content);
  if (!contentCheck.ok) { res.status(400).json({ error: contentCheck.error }); return; }
  try {
    await writeSkill(name, content);
    res.json({ ok: true, path: `plugins/svg-drawing/skills/${name}/SKILL.md` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to write skill: ${msg}` });
  }
});

app.post('/api/svg/:drawId/bootstrap/write-filter', async (req: Request, res: Response) => {
  const { name, definition } = req.body as { name?: string; definition?: any };
  if (!name || !definition) { res.status(400).json({ error: 'Missing name or definition' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  const defCheck = validateFilterDefinition(definition);
  if (!defCheck.ok) { res.status(400).json({ error: defCheck.error }); return; }
  try {
    await writeCustomFilter(name, definition);
    res.json({ ok: true, path: `data/bootstrap/custom-filters/${name}.json` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to write filter: ${msg}` });
  }
});

app.post('/api/svg/:drawId/bootstrap/write-style', async (req: Request, res: Response) => {
  const { name, definition } = req.body as { name?: string; definition?: any };
  if (!name || !definition) { res.status(400).json({ error: 'Missing name or definition' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  const defCheck = validateStyleDefinition(definition);
  if (!defCheck.ok) { res.status(400).json({ error: defCheck.error }); return; }
  try {
    await writeCustomStyle(name, definition);
    res.json({ ok: true, path: `data/bootstrap/custom-styles/${name}.json` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to write style: ${msg}` });
  }
});

app.post('/api/svg/:drawId/bootstrap/write-prompt-extension', async (req: Request, res: Response) => {
  const { name, content } = req.body as { name?: string; content?: string };
  if (!name || !content) { res.status(400).json({ error: 'Missing name or content' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  const contentCheck = validatePromptExtension(content);
  if (!contentCheck.ok) { res.status(400).json({ error: contentCheck.error }); return; }
  try {
    await storeWritePromptExtension(name, content);
    res.json({ ok: true, path: `data/bootstrap/prompt-extensions/${name}.md` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to write prompt extension: ${msg}` });
  }
});

app.post('/api/svg/:drawId/bootstrap/reload', async (req: Request, res: Response) => {
  const { reason } = req.body as { reason?: string };
  const drawId = req.params.drawId as string;
  const ok = await sessionManager.respawn(drawId, reason);
  if (!ok) {
    res.status(404).json({ error: 'No active session for this drawing' });
    return;
  }
  res.json({ ok: true, reloaded_at: new Date().toISOString() });
});

app.post('/api/svg/:drawId/bootstrap/list', async (_req: Request, res: Response) => {
  try {
    const assets = await listAllAssets();
    res.json(assets);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to list assets: ${msg}` });
  }
});

// --- Bootstrap: Custom Tool CRUD ---

app.post('/api/svg/:drawId/bootstrap/write-custom-tool', async (req: Request, res: Response) => {
  const { name, definition } = req.body as { name?: string; definition?: any };
  if (!name || !definition) { res.status(400).json({ error: 'Missing name or definition' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  const defCheck = validateCustomToolDefinition(definition);
  if (!defCheck.ok) { res.status(400).json({ error: defCheck.error }); return; }
  try {
    await writeCustomTool(name, definition);
    res.json({ ok: true, path: `data/bootstrap/custom-tools/${name}.json` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to write custom tool: ${msg}` });
  }
});

// --- Bootstrap: Custom Route CRUD ---

app.post('/api/svg/:drawId/bootstrap/write-custom-route', async (req: Request, res: Response) => {
  const { name, definition } = req.body as { name?: string; definition?: any };
  if (!name || !definition) { res.status(400).json({ error: 'Missing name or definition' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  const defCheck = validateCustomRouteDefinition(definition);
  if (!defCheck.ok) { res.status(400).json({ error: defCheck.error }); return; }
  try {
    await writeCustomRoute(name, definition);
    res.json({ ok: true, path: `data/bootstrap/custom-routes/${name}.json` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to write custom route: ${msg}` });
  }
});

// --- Bootstrap: Rollback ---

// Map short MCP type names to internal asset type names
const ASSET_TYPE_MAP: Record<string, string> = {
  'filter': 'custom-filter',
  'style': 'custom-style',
  'tool': 'custom-tool',
  'route': 'custom-route',
  'prompt': 'prompt-extension',
  'skill': 'skill',
  // Also accept the full internal names directly
  'custom-filter': 'custom-filter',
  'custom-style': 'custom-style',
  'custom-tool': 'custom-tool',
  'custom-route': 'custom-route',
  'prompt-extension': 'prompt-extension',
};

app.post('/api/svg/:drawId/bootstrap/rollback', async (req: Request, res: Response) => {
  const { type: rawType, name, version } = req.body as { type?: string; name?: string; version?: number };
  const type = rawType ? (ASSET_TYPE_MAP[rawType] || rawType) : rawType;
  const check = validateRollback({ type, name, version });
  if (!check.ok) { res.status(400).json({ error: check.error }); return; }
  try {
    const ok = await rollbackAsset(
      type as 'custom-filter' | 'custom-style' | 'custom-tool' | 'custom-route' | 'prompt-extension' | 'skill',
      name!,
      version!,
    );
    if (!ok) { res.status(404).json({ error: 'Version not found' }); return; }
    res.json({ ok: true, rolled_back_to: version });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Rollback failed: ${msg}` });
  }
});

// --- Bootstrap: History ---

app.post('/api/svg/:drawId/bootstrap/history', async (req: Request, res: Response) => {
  const { type: rawType, name } = req.body as { type?: string; name?: string };
  const type = rawType ? (ASSET_TYPE_MAP[rawType] || rawType) : rawType;
  if (!type || !name) { res.status(400).json({ error: 'Missing type or name' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  try {
    const history = await getAssetHistory(
      type as 'custom-filter' | 'custom-style' | 'custom-tool' | 'custom-route' | 'prompt-extension' | 'skill',
      name,
    );
    res.json({ ok: true, versions: history });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to get history: ${msg}` });
  }
});

// --- Custom Tool Execution ---

app.post('/api/svg/:drawId/custom-tool/:toolName', async (req: Request, res: Response) => {
  const drawId = req.params.drawId as string;
  const toolName = req.params.toolName as string;
  const tool = await loadCustomTool(toolName);
  if (!tool) { res.status(404).json({ error: `Custom tool not found: ${toolName}` }); return; }
  try {
    const result = await executePipeline(tool.handler.steps, {
      drawId,
      vars: {},
      prev: undefined,
      input: req.body as Record<string, unknown>,
    }, pipelineDeps);
    res.json({ ok: true, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Custom tool execution failed: ${msg}` });
  }
});

// --- Custom Route Execution ---

app.post('/api/svg/:drawId/custom/:routeName', async (req: Request, res: Response) => {
  const drawId = req.params.drawId as string;
  const routeName = req.params.routeName as string;
  const route = await loadCustomRoute(routeName);
  if (!route) { res.status(404).json({ error: `Custom route not found: ${routeName}` }); return; }
  try {
    const result = await executePipeline(route.handler.steps, {
      drawId,
      vars: {},
      prev: undefined,
      input: req.body as Record<string, unknown>,
    }, pipelineDeps);
    res.json({ ok: true, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Custom route execution failed: ${msg}` });
  }
});

// --- Bootstrap: Custom Tool Definition (for MCP server) ---

app.post('/api/svg/:drawId/bootstrap/custom-tool-def/:toolName', async (req: Request, res: Response) => {
  const toolName = req.params.toolName as string;
  const tool = await loadCustomTool(toolName);
  if (!tool) { res.status(404).json({ error: `Custom tool not found: ${toolName}` }); return; }
  res.json(tool);
});

// --- SVG direct update endpoint (used by tests and internal tools) ---
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
  // Clean up reference images for this drawing
  const refsDir = join(__dirname, '..', 'data', 'references', drawId);
  rm(refsDir, { recursive: true, force: true }).catch(() => {});
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
