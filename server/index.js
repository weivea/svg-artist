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

// SPA fallback (Express 5 requires named wildcard parameter)
app.get('/{*splat}', (req, res) => {
  res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`SVG Artist server listening on http://localhost:${PORT}`);
});

export { terminalWss };
