import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = process.env.DATA_DIR || join(__dirname, '..', 'data');
const DATA_FILE = join(DATA_DIR, 'drawings.json');

const DEFAULT_SVG = '<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><defs></defs><g id="layer-bg" data-name="background"><rect width="800" height="600" fill="#f5f5f5"/></g><g id="layer-content" data-name="content"><text x="400" y="300" text-anchor="middle" fill="#999" font-size="24">Waiting for artwork...</text></g></svg>';

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
