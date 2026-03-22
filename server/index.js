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
