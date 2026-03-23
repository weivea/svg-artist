# Detail Sub-Agent with Scratch Canvas — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a scratch canvas system and detail-painter sub-agent so the main agent can dispatch fine-detail work to an isolated temporary SVG canvas, review it, and merge results into the main drawing.

**Architecture:** New `ScratchCanvasStore` manages in-memory temporary SVG documents. 7 new MCP tools (`create_scratch_canvas`, `scratch_add_layer`, `scratch_update_layer`, `scratch_list_layers`, `scratch_preview`, `merge_scratch_canvas`, `list_scratch_canvases`) route through Express to manipulate these documents using the existing `SvgEngine`. A `detail-painter` plugin agent uses the scratch tools to draw fine details, and the main agent merges results.

**Tech Stack:** TypeScript, Express, linkedom (SvgEngine), resvg-js (PngRenderer), Zod (MCP schema), Playwright (tests), Claude Code plugin system (agent + skills)

---

### Task 1: Create ScratchCanvasStore

**Files:**
- Create: `server/scratch-canvas-store.ts`
- Test: `e2e/integration/scratch-canvas-api.spec.ts`

**Step 1: Write the failing test for scratch canvas creation**

Create `e2e/integration/scratch-canvas-api.spec.ts`:

```typescript
import { test, expect } from '../fixtures';

test.describe('Scratch Canvas API', () => {
  async function createDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    return drawing.id;
  }

  test('create scratch canvas returns canvasId and viewBox', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.canvasId).toBeTruthy();
    expect(body.canvasId).toMatch(/^scratch-/);
    expect(body.viewBox).toBe('0 0 120 80');
  });

  test('create scratch canvas with background', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 100 100', background: '#ffffff' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.canvasId).toBeTruthy();
  });

  test('create scratch canvas fails for nonexistent drawing', async ({ apiContext }) => {
    const res = await apiContext.post(`/api/svg/nonexistent/scratch/create`, {
      data: { viewBox: '0 0 100 100' },
    });
    expect(res.status()).toBe(404);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/scratch-canvas-api.spec.ts --project=integration`
Expected: FAIL — route `/api/svg/:drawId/scratch/create` does not exist (404)

**Step 3: Implement ScratchCanvasStore**

Create `server/scratch-canvas-store.ts`:

```typescript
import { SvgEngine } from './svg-engine.js';

export interface ScratchCanvasInfo {
  canvasId: string;
  drawId: string;
  viewBox: string;
  layerCount: number;
  createdAt: number;
}

interface ScratchCanvas {
  svgEngine: SvgEngine;
  drawId: string;
  viewBox: string;
  createdAt: number;
}

export class ScratchCanvasStore {
  private canvases = new Map<string, ScratchCanvas>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(cleanupIntervalMs = 5 * 60 * 1000) {
    // Clean up expired canvases every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalMs);
  }

  create(drawId: string, viewBox: string, background?: string): { canvasId: string; viewBox: string } {
    const canvasId = `scratch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    const bgRect = background
      ? `<rect width="100%" height="100%" fill="${background}"/>`
      : '';
    const svgString = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg"><defs></defs>${bgRect}</svg>`;

    const svgEngine = new SvgEngine(svgString);
    this.canvases.set(canvasId, {
      svgEngine,
      drawId,
      viewBox,
      createdAt: Date.now(),
    });

    return { canvasId, viewBox };
  }

  get(canvasId: string): SvgEngine | null {
    const canvas = this.canvases.get(canvasId);
    return canvas ? canvas.svgEngine : null;
  }

  getWithMeta(canvasId: string): ScratchCanvas | null {
    return this.canvases.get(canvasId) || null;
  }

  list(drawId: string): ScratchCanvasInfo[] {
    const result: ScratchCanvasInfo[] = [];
    for (const [canvasId, canvas] of this.canvases) {
      if (canvas.drawId === drawId) {
        const info = canvas.svgEngine.getCanvasInfo();
        result.push({
          canvasId,
          drawId: canvas.drawId,
          viewBox: canvas.viewBox,
          layerCount: info.layerCount,
          createdAt: canvas.createdAt,
        });
      }
    }
    return result;
  }

  delete(canvasId: string): boolean {
    return this.canvases.delete(canvasId);
  }

  /** Remove all scratch canvases for a given drawing */
  deleteByDrawId(drawId: string): number {
    let count = 0;
    for (const [canvasId, canvas] of this.canvases) {
      if (canvas.drawId === drawId) {
        this.canvases.delete(canvasId);
        count++;
      }
    }
    return count;
  }

  /** Remove canvases older than maxAgeMs (default 30 minutes) */
  cleanup(maxAgeMs = 30 * 60 * 1000): number {
    const cutoff = Date.now() - maxAgeMs;
    let count = 0;
    for (const [canvasId, canvas] of this.canvases) {
      if (canvas.createdAt < cutoff) {
        this.canvases.delete(canvasId);
        count++;
      }
    }
    return count;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.canvases.clear();
  }
}
```

**Step 4: Add scratch canvas route for creation in `server/index.ts`**

Add import at top of file:
```typescript
import { ScratchCanvasStore } from './scratch-canvas-store.js';
```

Add initialization near other store instances (after `const drawingStore = new DrawingStore();`):
```typescript
const scratchStore = new ScratchCanvasStore();
```

Add route (after the existing bootstrap routes, before the REST API routes):
```typescript
// ── Scratch Canvas Routes ──────────────────────────────────────────
app.post('/api/svg/:drawId/scratch/create', async (req: Request, res: Response) => {
  const { viewBox, background } = req.body as { viewBox?: string; background?: string };
  if (!viewBox) { res.status(400).json({ error: 'Missing viewBox' }); return; }
  const drawId = req.params.drawId as string;
  const drawing = await drawingStore.get(drawId);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const result = scratchStore.create(drawId, viewBox, background);
  res.json(result);
});
```

Also update the DELETE drawing route to clean up scratch canvases:
```typescript
// In the existing DELETE /api/drawings/:drawId handler, add:
scratchStore.deleteByDrawId(drawId);
```

**Step 5: Run test to verify it passes**

Run: `npx playwright test e2e/integration/scratch-canvas-api.spec.ts --project=integration`
Expected: PASS — all 3 tests pass

**Step 6: Commit**

```bash
git add server/scratch-canvas-store.ts server/index.ts e2e/integration/scratch-canvas-api.spec.ts
git commit -m "feat: add ScratchCanvasStore and create endpoint"
```

---

### Task 2: Scratch Canvas Layer Operations

**Files:**
- Modify: `server/index.ts` (add routes)
- Modify: `e2e/integration/scratch-canvas-api.spec.ts` (add tests)

**Step 1: Write failing tests for layer add/update/list**

Append to `e2e/integration/scratch-canvas-api.spec.ts`:

```typescript
  test('add layer to scratch canvas', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'iris', content: '<circle cx="60" cy="40" r="20" fill="blue"/>' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.layer_id).toBeTruthy();
    expect(body.layer_id).toMatch(/^layer-iris-/);
  });

  test('update layer on scratch canvas', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    const addRes = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'iris', content: '<circle cx="60" cy="40" r="20" fill="blue"/>' },
    });
    const { layer_id } = await addRes.json();

    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/update`, {
      data: { layer_id, content: '<circle cx="60" cy="40" r="25" fill="green"/>' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('list layers on scratch canvas', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'iris', content: '<circle cx="60" cy="40" r="20" fill="blue"/>' },
    });
    await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'pupil', content: '<circle cx="60" cy="40" r="8" fill="black"/>' },
    });

    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/list`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.layers).toHaveLength(2);
    expect(body.layers[0].name).toBe('iris');
    expect(body.layers[1].name).toBe('pupil');
  });

  test('scratch canvas operations fail for nonexistent canvasId', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/nonexistent/layers/list`);
    expect(res.status()).toBe(404);
  });
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/scratch-canvas-api.spec.ts --project=integration`
Expected: FAIL — routes don't exist yet

**Step 3: Add layer routes to `server/index.ts`**

Add after the scratch create route:

```typescript
app.post('/api/svg/:drawId/scratch/:canvasId/layers/add', async (req: Request, res: Response) => {
  const { name, content, parent_id, position } = req.body as { name?: string; content?: string; parent_id?: string; position?: number };
  if (!name || !content) { res.status(400).json({ error: 'Missing name or content' }); return; }
  const engine = scratchStore.get(req.params.canvasId as string);
  if (!engine) { res.status(404).json({ error: 'Scratch canvas not found' }); return; }
  const layerId = engine.addLayer(name, content, parent_id, position);
  if (!layerId) { res.status(404).json({ error: 'Parent layer not found' }); return; }
  res.json({ ok: true, layer_id: layerId });
});

app.post('/api/svg/:drawId/scratch/:canvasId/layers/update', async (req: Request, res: Response) => {
  const { layer_id, content } = req.body as { layer_id?: string; content?: string };
  if (!layer_id || !content) { res.status(400).json({ error: 'Missing layer_id or content' }); return; }
  const engine = scratchStore.get(req.params.canvasId as string);
  if (!engine) { res.status(404).json({ error: 'Scratch canvas not found' }); return; }
  const ok = engine.updateLayer(layer_id, content);
  if (!ok) { res.status(404).json({ error: 'Layer not found' }); return; }
  res.json({ ok: true });
});

app.post('/api/svg/:drawId/scratch/:canvasId/layers/list', async (req: Request, res: Response) => {
  const engine = scratchStore.get(req.params.canvasId as string);
  if (!engine) { res.status(404).json({ error: 'Scratch canvas not found' }); return; }
  res.json({ layers: engine.listLayers() });
});
```

**Step 4: Run test to verify it passes**

Run: `npx playwright test e2e/integration/scratch-canvas-api.spec.ts --project=integration`
Expected: PASS

**Step 5: Commit**

```bash
git add server/index.ts e2e/integration/scratch-canvas-api.spec.ts
git commit -m "feat: add scratch canvas layer CRUD routes"
```

---

### Task 3: Scratch Canvas Preview + List

**Files:**
- Modify: `server/index.ts` (add routes)
- Modify: `e2e/integration/scratch-canvas-api.spec.ts` (add tests)

**Step 1: Write failing tests for preview and list**

Append to `e2e/integration/scratch-canvas-api.spec.ts`:

```typescript
  test('preview scratch canvas as PNG', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'circle', content: '<circle cx="60" cy="40" r="30" fill="red"/>' },
    });

    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/preview`, {
      data: { width: 200 },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.image).toBeTruthy();
    // base64 PNG starts with iVBOR
    expect(body.image.slice(0, 5)).toBe('iVBOR');
  });

  test('list scratch canvases for a drawing', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);

    await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 200 100' },
    });

    const res = await apiContext.post(`/api/svg/${drawId}/scratch/list`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.canvases).toHaveLength(2);
    expect(body.canvases[0].canvasId).toMatch(/^scratch-/);
    expect(body.canvases[0].viewBox).toBeTruthy();
    expect(body.canvases[0].layerCount).toBeDefined();
  });

  test('list scratch canvases returns empty for drawing with none', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/list`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.canvases).toHaveLength(0);
  });
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/scratch-canvas-api.spec.ts --project=integration`
Expected: FAIL

**Step 3: Add preview and list routes to `server/index.ts`**

```typescript
app.post('/api/svg/:drawId/scratch/:canvasId/preview', async (req: Request, res: Response) => {
  const { width } = req.body as { width?: number };
  const engine = scratchStore.get(req.params.canvasId as string);
  if (!engine) { res.status(404).json({ error: 'Scratch canvas not found' }); return; }
  try {
    const png = renderSvgToPng(engine.serialize(), width || 400);
    res.json({ image: png.toString('base64') });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `PNG render failed: ${msg}` });
  }
});

app.post('/api/svg/:drawId/scratch/list', async (req: Request, res: Response) => {
  const drawId = req.params.drawId as string;
  res.json({ canvases: scratchStore.list(drawId) });
});
```

**Step 4: Run test to verify it passes**

Run: `npx playwright test e2e/integration/scratch-canvas-api.spec.ts --project=integration`
Expected: PASS

**Step 5: Commit**

```bash
git add server/index.ts e2e/integration/scratch-canvas-api.spec.ts
git commit -m "feat: add scratch canvas preview and list routes"
```

---

### Task 4: Merge Scratch Canvas into Main Drawing

**Files:**
- Modify: `server/svg-engine.ts` (add `mergeScratchLayers` method)
- Modify: `server/index.ts` (add merge route)
- Modify: `e2e/integration/scratch-canvas-api.spec.ts` (add tests)

**Step 1: Write failing tests for merge**

Append to `e2e/integration/scratch-canvas-api.spec.ts`:

```typescript
  test('merge scratch canvas into main drawing', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    // Add layers to scratch
    await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'iris', content: '<circle cx="60" cy="40" r="20" fill="blue"/>' },
    });
    await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'pupil', content: '<circle cx="60" cy="40" r="8" fill="black"/>' },
    });

    // Merge into main drawing
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/merge`, {
      data: {
        layerName: 'left-eye',
        transform: { translate: [100, 150], scale: 0.8 },
      },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.layer_id).toMatch(/^layer-left-eye-/);

    // Verify the layer exists in main drawing
    const layersRes = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    const layersBody = await layersRes.json();
    const merged = layersBody.layers.find((l: any) => l.id === body.layer_id);
    expect(merged).toBeTruthy();
    expect(merged.name).toBe('left-eye');

    // Verify scratch canvas is deleted after merge
    const listRes = await apiContext.post(`/api/svg/${drawId}/scratch/list`);
    const listBody = await listRes.json();
    expect(listBody.canvases).toHaveLength(0);
  });

  test('merge scratch canvas transfers defs', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    // Add a gradient def to scratch canvas via manage_defs pattern
    // We need to use the scratch engine's defs — so we add a layer that references a gradient
    // and also add the gradient as a def
    // For this test, add layer content that includes a gradient reference
    await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: {
        name: 'gradient-circle',
        content: '<circle cx="60" cy="40" r="20" fill="url(#scratch-grad)"/>',
      },
    });

    // Add a def to the scratch canvas
    await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/defs/manage`, {
      data: {
        action: 'add',
        id: 'scratch-grad',
        content: '<linearGradient id="scratch-grad"><stop offset="0%" stop-color="blue"/><stop offset="100%" stop-color="green"/></linearGradient>',
      },
    });

    // Merge
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/merge`, {
      data: { layerName: 'eye-with-gradient', transferDefs: true },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.defs_transferred).toBeGreaterThanOrEqual(1);

    // Check main drawing has the gradient (with prefix)
    const defsRes = await apiContext.post(`/api/svg/${drawId}/defs/list`);
    const defsBody = await defsRes.json();
    const transferred = defsBody.defs.find((d: any) => d.id.includes('scratch-grad'));
    expect(transferred).toBeTruthy();
  });

  test('merge fails for nonexistent scratch canvas', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/nonexistent/merge`, {
      data: { layerName: 'test' },
    });
    expect(res.status()).toBe(404);
  });
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/scratch-canvas-api.spec.ts --project=integration`
Expected: FAIL

**Step 3: Add `mergeScratchLayers` method to `server/svg-engine.ts`**

Add this method to the `SvgEngine` class:

```typescript
  /**
   * Merge layers and defs from a scratch canvas into this SVG.
   * Returns the new layer ID and count of transferred defs.
   */
  mergeScratchCanvas(
    scratchEngine: SvgEngine,
    layerName: string,
    transform?: { translate?: [number, number]; scale?: number; rotate?: number },
    transferDefs = true,
  ): { layerId: string; defsTransferred: number } {
    const slug = this._slugify(layerName);
    const layerId = `layer-${slug}-${Date.now().toString(36)}`;

    // Build transform string
    const parts: string[] = [];
    if (transform?.translate) parts.push(`translate(${transform.translate[0]}, ${transform.translate[1]})`);
    if (transform?.scale !== undefined) parts.push(`scale(${transform.scale})`);
    if (transform?.rotate !== undefined) parts.push(`rotate(${transform.rotate})`);
    const transformStr = parts.length > 0 ? ` transform="${parts.join(' ')}"` : '';

    // Collect scratch layers' innerHTML
    const scratchLayers = scratchEngine.listLayers();
    let innerContent = '';
    for (const layer of scratchLayers) {
      const scratchSvg = scratchEngine.serialize();
      // Extract the full <g> element for this layer from the scratch SVG
      const regex = new RegExp(`<g[^>]*id="${layer.id}"[^>]*>[\\s\\S]*?</g>`);
      const match = scratchSvg.match(regex);
      if (match) {
        innerContent += match[0];
      }
    }

    // Transfer defs
    let defsTransferred = 0;
    if (transferDefs) {
      const scratchDefs = scratchEngine.listDefs();
      for (const def of scratchDefs) {
        if (!def.id) continue;
        // Get the def content from scratch SVG
        const scratchSvg = scratchEngine.serialize();
        const defRegex = new RegExp(`<[^>]*id="${def.id}"[^>]*>[\\s\\S]*?</${def.type}>|<[^>]*id="${def.id}"[^/]*/>`);
        const defMatch = scratchSvg.match(defRegex);
        if (defMatch) {
          // Add to main canvas defs (id already has context from scratch)
          this.manageDefs('add', def.id, defMatch[0]);
          defsTransferred++;
        }
      }
    }

    // Create wrapper group and add to main canvas
    const g = this.document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', layerId);
    g.setAttribute('data-name', layerName);
    if (transformStr) {
      const transformValue = parts.join(' ');
      g.setAttribute('transform', transformValue);
    }
    g.innerHTML = innerContent;
    this.svgElement.appendChild(g);

    return { layerId, defsTransferred };
  }
```

**Step 4: Add merge route and defs manage route to `server/index.ts`**

```typescript
app.post('/api/svg/:drawId/scratch/:canvasId/defs/manage', async (req: Request, res: Response) => {
  const { action, id, content } = req.body as { action?: string; id?: string; content?: string };
  if (!action || !id) { res.status(400).json({ error: 'Missing action or id' }); return; }
  const engine = scratchStore.get(req.params.canvasId as string);
  if (!engine) { res.status(404).json({ error: 'Scratch canvas not found' }); return; }
  const ok = engine.manageDefs(action as 'add' | 'update' | 'delete', id, content);
  if (!ok) { res.status(400).json({ error: 'Defs operation failed' }); return; }
  res.json({ ok: true });
});

app.post('/api/svg/:drawId/scratch/:canvasId/merge', async (req: Request, res: Response) => {
  const { layerName, transform, transferDefs } = req.body as {
    layerName?: string;
    transform?: { translate?: [number, number]; scale?: number; rotate?: number };
    transferDefs?: boolean;
  };
  if (!layerName) { res.status(400).json({ error: 'Missing layerName' }); return; }

  const drawId = req.params.drawId as string;
  const canvasId = req.params.canvasId as string;

  const scratchEngine = scratchStore.get(canvasId);
  if (!scratchEngine) { res.status(404).json({ error: 'Scratch canvas not found' }); return; }

  const drawing = await drawingStore.get(drawId);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }

  const mainEngine = new SvgEngine(drawing.svgContent);
  const result = mainEngine.mergeScratchCanvas(scratchEngine, layerName, transform, transferDefs !== false);

  const svg = mainEngine.serialize();
  await drawingStore.updateSvg(drawId, svg);
  broadcastSvg(drawId, svg);

  // Delete scratch canvas after successful merge
  scratchStore.delete(canvasId);

  res.json({ ok: true, layer_id: result.layerId, defs_transferred: result.defsTransferred });
});
```

**Step 5: Run test to verify it passes**

Run: `npx playwright test e2e/integration/scratch-canvas-api.spec.ts --project=integration`
Expected: PASS

**Step 6: Commit**

```bash
git add server/svg-engine.ts server/index.ts e2e/integration/scratch-canvas-api.spec.ts
git commit -m "feat: add scratch canvas merge with defs transfer"
```

---

### Task 5: Register MCP Tools for Scratch Canvas

**Files:**
- Modify: `server/mcp-server.ts` (add 7 tool definitions)

**Step 1: Write the 7 MCP tool definitions**

Add after the existing bootstrap/phase-2 tools in `server/mcp-server.ts`:

```typescript
// ── Scratch Canvas Tools ────────────────────────────────────────────

server.tool(
  'create_scratch_canvas',
  'Create an isolated temporary SVG canvas for detail work. Returns a canvasId to use with other scratch_* tools. The canvas lives in memory and is deleted after merge or after 30 minutes.',
  {
    viewBox: z.string().describe('SVG viewBox for the scratch canvas (e.g. "0 0 120 80")'),
    background: z.string().optional().describe('Optional background color (e.g. "#ffffff"). Default: transparent'),
  },
  async (params) => textTool('scratch/create', params),
);

server.tool(
  'scratch_add_layer',
  'Add a layer to a scratch canvas. Same as add_layer but on the temporary canvas.',
  {
    canvasId: z.string().describe('The scratch canvas ID from create_scratch_canvas'),
    name: z.string().describe('Name for the new layer'),
    content: z.string().describe('SVG content for the layer'),
    parent_id: z.string().optional().describe('Parent layer id to nest under'),
    position: z.number().optional().describe('Insert position among siblings (0-based)'),
  },
  async ({ canvasId, ...rest }) => textTool(`scratch/${canvasId}/layers/add`, rest),
);

server.tool(
  'scratch_update_layer',
  'Update a layer on a scratch canvas. Same as update_layer but on the temporary canvas.',
  {
    canvasId: z.string().describe('The scratch canvas ID'),
    layer_id: z.string().describe('The layer id to update'),
    content: z.string().describe('New SVG content for the layer'),
  },
  async ({ canvasId, ...rest }) => textTool(`scratch/${canvasId}/layers/update`, rest),
);

server.tool(
  'scratch_list_layers',
  'List all layers on a scratch canvas.',
  {
    canvasId: z.string().describe('The scratch canvas ID'),
  },
  async ({ canvasId }) => textTool(`scratch/${canvasId}/layers/list`),
);

server.tool(
  'scratch_preview',
  'Render a scratch canvas as PNG for visual self-review.',
  {
    canvasId: z.string().describe('The scratch canvas ID'),
    width: z.number().optional().describe('Output image width in pixels (default 400)'),
  },
  async ({ canvasId, ...rest }) => imageTool(`scratch/${canvasId}/preview`, rest),
);

server.tool(
  'merge_scratch_canvas',
  'Merge a completed scratch canvas into the main drawing as a single layer. Transfers defs (gradients, filters) automatically. Deletes the scratch canvas after merge.',
  {
    canvasId: z.string().describe('The scratch canvas ID to merge'),
    layerName: z.string().describe('Name for the merged layer in the main drawing'),
    transform: z.object({
      translate: z.tuple([z.number(), z.number()]).optional().describe('Position [x, y] on main canvas'),
      scale: z.number().optional().describe('Scale factor'),
      rotate: z.number().optional().describe('Rotation angle in degrees'),
    }).optional().describe('Transform to position the merged content on the main canvas'),
    transferDefs: z.boolean().optional().describe('Transfer gradients/filters from scratch to main (default true)'),
  },
  async ({ canvasId, ...rest }) => textTool(`scratch/${canvasId}/merge`, rest),
);

server.tool(
  'list_scratch_canvases',
  'List all active scratch canvases for this drawing. Use to check for orphaned canvases.',
  {},
  async () => textTool('scratch/list'),
);
```

**Step 2: Verify MCP server compiles**

Run: `npx tsx server/mcp-server.ts --help 2>&1 || echo "Compilation check"` (just a syntax check)
Or better: `npx tsc --noEmit -p tsconfig.server.json`

**Step 3: Commit**

```bash
git add server/mcp-server.ts
git commit -m "feat: register 7 scratch canvas MCP tools"
```

---

### Task 6: Create Detail Painter Agent

**Files:**
- Create: `plugins/svg-drawing/agents/detail-painter.md`

**Step 1: Write the detail-painter agent definition**

Create `plugins/svg-drawing/agents/detail-painter.md`:

```markdown
---
name: detail-painter
model: sonnet
description: >
  Specialized sub-agent for drawing fine details on isolated scratch canvases.
  Excels at eyes, mouths, hands, hair, textures, and other elements requiring
  high precision. Works independently on a scratch canvas and returns canvasId
  for the main agent to review and merge. Cannot merge — only the main agent can.
allowedTools:
  - create_scratch_canvas
  - scratch_add_layer
  - scratch_update_layer
  - scratch_list_layers
  - scratch_preview
---

# Detail Painter

You are a detail-focused SVG artist specializing in fine, precise elements. You work on an isolated scratch canvas and return your work for the main agent to review and merge.

## Workflow

1. **Receive task** — The main agent tells you what to draw (e.g., "anime-style eyes, blue iris, star highlights") along with the desired canvas size
2. **Create scratch canvas** — Call `create_scratch_canvas` with an appropriate viewBox for the detail
3. **Build layers** — Add layers one at a time using `scratch_add_layer`, working from back to front:
   - Base shapes first (sclera, skin base)
   - Main features (iris, lips shape)
   - Detail elements (pupil, texture, veins)
   - Highlights and effects last (reflections, shine)
4. **Self-review** — Call `scratch_preview` to see your work as a PNG image. Critically assess:
   - Are proportions correct?
   - Is the detail level sufficient?
   - Do colors harmonize?
   - Are edges clean?
5. **Iterate** — If the preview reveals issues, use `scratch_update_layer` to fix them. Preview again.
6. **Return canvasId** — When satisfied, return the canvasId so the main agent can review and merge.

## Guidelines

### Quality Standards
- **Layer separation** — Each visually distinct element gets its own layer (don't cram everything into one)
- **Gradient use** — Use `<linearGradient>` and `<radialGradient>` for realistic shading (define in defs, reference with `url(#id)`)
- **Precision** — Use decimal coordinates for smooth curves (e.g., `cx="60.5"` not just `cx="60"`)
- **Clean paths** — Minimize control points in Bézier curves; fewer well-placed points beat many sloppy ones
- **Consistent style** — Match the style described by the main agent (anime, realistic, flat, etc.)

### SVG Techniques for Detail Work
- **Eyes:** Radial gradients for iris depth, clip-paths for iris edge, small circles for reflections
- **Mouths:** Cubic Béziers for lip curves, gradient for volume, subtle teeth if visible
- **Hair:** Groups of path strands, gradient highlights, varying stroke widths
- **Hands:** Overlapping rounded shapes for fingers, subtle joint lines
- **Textures:** `<pattern>` for repeating textures, `<filter>` for noise/grain effects

### viewBox Sizing Guide
- Eyes (pair): `0 0 120 60` to `0 0 200 100`
- Single eye: `0 0 80 60`
- Mouth: `0 0 100 60`
- Nose: `0 0 60 60`
- Hand: `0 0 120 150`
- Hair detail section: `0 0 200 200`
- Texture swatch: `0 0 100 100`

### What NOT to Do
- Do NOT call `merge_scratch_canvas` — that is the main agent's job
- Do NOT try to match exact pixel positions on the main canvas — the main agent handles positioning via transform during merge
- Do NOT add background layers unless asked — scratch canvases are transparent by default
- Do NOT create overly complex SVG (keep under 50KB) — if a detail is too complex, simplify
```

**Step 2: Commit**

```bash
git add plugins/svg-drawing/agents/detail-painter.md
git commit -m "feat: add detail-painter sub-agent for fine detail work"
```

---

### Task 7: Create Facial Details Skill

**Files:**
- Create: `plugins/svg-drawing/skills/facial-details/SKILL.md`

**Step 1: Write the facial-details skill**

Create `plugins/svg-drawing/skills/facial-details/SKILL.md`:

```markdown
---
name: facial-details
description: "Techniques for drawing precise facial features in SVG: eyes, mouths, noses, ears. Use when the detail-painter agent is working on face elements."
---

# Facial Details

## Eyes

### Anime Style Eye Structure (layers back to front)

1. **Sclera (eye white):** Ellipse with slight off-white gradient
2. **Iris:** Circle with radial gradient (dark rim → mid color → lighter center)
3. **Pupil:** Dark circle, slightly above center of iris
4. **Iris texture:** Thin radial lines or subtle pattern overlay
5. **Upper shadow:** Gradient shadow from eyelid cast onto eye top
6. **Highlights:** 1-3 white shapes (main reflection + secondary sparkles)
7. **Eyelid line:** Curved path for upper eyelid, thicker at outer corner
8. **Eyelashes:** Individual curves or grouped path, thicker at base

```xml
<!-- Anime eye template on 80x60 canvas -->
<defs>
  <radialGradient id="iris-grad" cx="50%" cy="45%" r="50%">
    <stop offset="0%" stop-color="#4A90D9"/>
    <stop offset="60%" stop-color="#2C5F9E"/>
    <stop offset="100%" stop-color="#1A3A6B"/>
  </radialGradient>
  <radialGradient id="sclera-grad" cx="50%" cy="30%" r="60%">
    <stop offset="0%" stop-color="#FFFFFF"/>
    <stop offset="100%" stop-color="#E8E4E0"/>
  </radialGradient>
  <linearGradient id="lid-shadow" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="rgba(0,0,0,0.15)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </linearGradient>
</defs>

<!-- Layer: sclera -->
<ellipse cx="40" cy="32" rx="22" ry="16" fill="url(#sclera-grad)"/>

<!-- Layer: iris -->
<circle cx="40" cy="34" r="12" fill="url(#iris-grad)"/>

<!-- Layer: pupil -->
<circle cx="40" cy="33" r="5" fill="#0A0A0A"/>

<!-- Layer: lid-shadow -->
<ellipse cx="40" cy="26" rx="22" ry="8" fill="url(#lid-shadow)"/>

<!-- Layer: highlight-main -->
<ellipse cx="35" cy="28" rx="4" ry="3" fill="white" opacity="0.9"/>

<!-- Layer: highlight-secondary -->
<circle cx="46" cy="36" r="2" fill="white" opacity="0.6"/>

<!-- Layer: upper-eyelid -->
<path d="M 16 30 Q 28 16, 40 18 Q 52 16, 64 30"
      fill="none" stroke="#3A2218" stroke-width="2"
      stroke-linecap="round"/>

<!-- Layer: eyelashes -->
<path d="M 16 30 Q 14 24, 12 20 M 22 24 Q 20 18, 18 14 M 28 20 Q 27 14, 26 10"
      fill="none" stroke="#3A2218" stroke-width="1.2"
      stroke-linecap="round"/>
```

### Realistic Eye Differences
- Iris has visible fibrous texture (radial thin lines)
- Sclera shows subtle blood vessel hints (very faint pink lines)
- More complex highlight reflections (window shape, multiple catchlights)
- Eyelid crease line above the eye
- Subtle skin tone gradient around eye socket

### Eye Expression Variations
| Expression | Upper lid | Lower lid | Iris visible | Pupil size |
|-----------|-----------|-----------|-------------|------------|
| Neutral | Mid-curve | Gentle curve | 70-80% | Normal |
| Wide/Surprised | High arch | Drops slightly | 90-100% | Small |
| Happy/Smile | Drops/curves down | Rises up | 50-60% | Normal |
| Angry | Low, angled inward | Rises slightly | 60-70% | Small |
| Sleepy | Very low | Normal | 30-40% | Normal |

## Mouth / Lips

### Basic Lip Structure

Upper lip has a cupid's bow (M-shape), lower lip is fuller and rounder.

```xml
<defs>
  <linearGradient id="lip-grad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#D4756B"/>
    <stop offset="50%" stop-color="#C4615A"/>
    <stop offset="100%" stop-color="#B85550"/>
  </linearGradient>
</defs>

<!-- Layer: upper-lip -->
<path d="M 20 30
         C 25 30, 30 24, 40 26
         C 50 24, 55 30, 60 30
         C 55 33, 45 34, 40 33
         C 35 34, 25 33, 20 30 Z"
      fill="url(#lip-grad)"/>

<!-- Layer: lower-lip -->
<path d="M 20 30
         C 25 33, 30 40, 40 42
         C 50 40, 55 33, 60 30
         C 55 33, 45 34, 40 33
         C 35 34, 25 33, 20 30 Z"
      fill="#C4615A"/>

<!-- Layer: lip-line (the meeting line) -->
<path d="M 22 30 Q 31 32, 40 30 Q 49 32, 58 30"
      fill="none" stroke="#8B3A3A" stroke-width="0.8" opacity="0.6"/>

<!-- Layer: lower-lip-highlight -->
<ellipse cx="40" cy="36" rx="10" ry="3" fill="white" opacity="0.15"/>
```

## Nose

### Side-light Nose (minimal detail, implied by shadow)

```xml
<!-- Layer: nose-shadow -->
<path d="M 38 35
         C 36 42, 34 48, 32 52
         Q 36 54, 40 53
         Q 44 54, 48 52
         C 46 48, 44 42, 42 35"
      fill="none" stroke="#D4A088" stroke-width="1" opacity="0.4"/>

<!-- Layer: nose-tip-highlight -->
<ellipse cx="40" cy="50" rx="4" ry="2.5" fill="white" opacity="0.12"/>

<!-- Layer: nostrils -->
<ellipse cx="36" cy="52" rx="2.5" ry="1.5" fill="#B8846C" opacity="0.3"/>
<ellipse cx="44" cy="52" rx="2.5" ry="1.5" fill="#B8846C" opacity="0.3"/>
```

## Ear

### Simplified Ear Structure

```xml
<!-- Layer: ear-base -->
<path d="M 10 20
         C 5 15, 0 25, 2 35
         C 3 42, 8 48, 10 45
         C 12 42, 8 38, 7 35
         C 6 30, 8 22, 10 20 Z"
      fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>

<!-- Layer: ear-inner -->
<path d="M 9 25
         C 6 28, 5 33, 7 37
         C 8 40, 9 42, 10 40"
      fill="none" stroke="#D4978A" stroke-width="0.8" opacity="0.5"/>
```
```

**Step 2: Commit**

```bash
git add plugins/svg-drawing/skills/facial-details/SKILL.md
git commit -m "feat: add facial-details skill for detail sub-agent"
```

---

### Task 8: Create Additional Detail Skills (Hair + Texture)

**Files:**
- Create: `plugins/svg-drawing/skills/hair-details/SKILL.md`
- Create: `plugins/svg-drawing/skills/texture-details/SKILL.md`

**Step 1: Write hair-details skill**

Create `plugins/svg-drawing/skills/hair-details/SKILL.md`:

```markdown
---
name: hair-details
description: "Techniques for drawing detailed hair in SVG: strand groups, highlights, styles from anime to realistic."
---

# Hair Details

## Strand Group Technique

Hair is drawn as groups of overlapping paths, not individual strands.

### Layer Structure (back to front)
1. **Base mass:** Overall hair silhouette as a filled path
2. **Shadow sections:** Darker-colored path groups for depth
3. **Mid-tone strands:** Main visible strand groups
4. **Highlight bands:** Lighter strips following hair flow
5. **Edge wisps:** Fine loose strands at hairline and tips

```xml
<!-- Anime hair: flowing side-swept bangs -->
<defs>
  <linearGradient id="hair-base" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="#2A1810"/>
    <stop offset="100%" stop-color="#4A2C1A"/>
  </linearGradient>
  <linearGradient id="hair-highlight" x1="0.3" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="40%" stop-color="rgba(255,255,255,0.15)"/>
    <stop offset="60%" stop-color="rgba(255,255,255,0.15)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>
</defs>

<!-- Layer: hair-base-mass -->
<path d="M 30 10 C 20 5, 10 15, 15 40
         C 18 55, 25 65, 30 70
         L 70 70 C 75 65, 82 55, 85 40
         C 90 15, 80 5, 70 10
         Q 60 5, 50 8 Q 40 5, 30 10 Z"
      fill="url(#hair-base)"/>

<!-- Layer: shadow-sections -->
<path d="M 20 30 C 22 40, 25 55, 30 65
         C 32 55, 28 40, 25 30 Z"
      fill="#1A0E08" opacity="0.4"/>

<!-- Layer: strand-group-1 (bangs) -->
<path d="M 35 12 C 30 15, 28 25, 25 40"
      fill="none" stroke="#5A3820" stroke-width="3" stroke-linecap="round"/>
<path d="M 42 10 C 38 14, 35 22, 32 38"
      fill="none" stroke="#5A3820" stroke-width="2.5" stroke-linecap="round"/>

<!-- Layer: highlight-band -->
<path d="M 45 12 C 42 20, 40 35, 42 55"
      fill="none" stroke="url(#hair-highlight)" stroke-width="8" stroke-linecap="round"/>
```

## Hair Style References

| Style | Key Features | Strand Width | Highlight Approach |
|-------|-------------|-------------|-------------------|
| Anime | Bold sections, sharp highlights | 2-4px | Hard-edge white bands |
| Realistic | Many thin overlapping strands | 0.5-1.5px | Gradient overlay |
| Cartoon | Simple mass + few accent lines | 3-6px | None or single spot |
| Watercolor | Soft edges, color bleeding | Variable | Wet-edge effect |
```

**Step 2: Write texture-details skill**

Create `plugins/svg-drawing/skills/texture-details/SKILL.md`:

```markdown
---
name: texture-details
description: "SVG techniques for fabric folds, leather, metallic surfaces, and pattern textures. Use for clothing, accessories, and material rendering."
---

# Texture Details

## Fabric Folds

### Basic fold types
- **Pipe fold:** Tubular, hangs from a point (sleeves, drapes)
- **Zigzag fold:** Compressed fabric (stacked at bottom of curtain)
- **Spiral fold:** Wraps around a cylinder (rolled sleeves, scarves)

```xml
<!-- Fabric fold shadows using overlapping curves -->
<defs>
  <linearGradient id="fold-shadow" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
    <stop offset="50%" stop-color="rgba(0,0,0,0.15)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </linearGradient>
</defs>

<!-- Layer: fold-1 -->
<path d="M 20 10 C 22 25, 18 40, 20 55"
      fill="none" stroke="url(#fold-shadow)" stroke-width="8"/>

<!-- Layer: fold-highlight -->
<path d="M 30 10 C 28 25, 32 40, 30 55"
      fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/>
```

## Metallic Reflection

```xml
<defs>
  <linearGradient id="metal-grad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#E8E8E8"/>
    <stop offset="25%" stop-color="#A0A0A0"/>
    <stop offset="50%" stop-color="#E0E0E0"/>
    <stop offset="75%" stop-color="#808080"/>
    <stop offset="100%" stop-color="#C0C0C0"/>
  </linearGradient>
</defs>

<!-- Multiple gradient bands create metallic look -->
<rect x="10" y="10" width="80" height="80" rx="4" fill="url(#metal-grad)"/>
<!-- Sharp highlight edge -->
<line x1="10" y1="35" x2="90" y2="35" stroke="white" stroke-width="0.5" opacity="0.6"/>
```

## Leather Texture

Use noise filter + subtle bump for leather grain:

```xml
<defs>
  <filter id="leather-grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/>
    <feDiffuseLighting in="noise" lighting-color="#8B4513" surfaceScale="1.5" result="lit">
      <feDistantLight azimuth="45" elevation="60"/>
    </feDiffuseLighting>
    <feComposite in="SourceGraphic" in2="lit" operator="multiply"/>
  </filter>
</defs>

<rect x="10" y="10" width="80" height="80" fill="#8B4513" filter="url(#leather-grain)"/>
```
```

**Step 3: Commit**

```bash
git add plugins/svg-drawing/skills/hair-details/SKILL.md plugins/svg-drawing/skills/texture-details/SKILL.md
git commit -m "feat: add hair-details and texture-details skills"
```

---

### Task 9: Update System Prompt to Teach Main Agent About Sub-Agent

**Files:**
- Modify: `server/pty-manager.ts` (update the appended system prompt to mention detail-painter)

**Step 1: Check current system prompt in pty-manager.ts**

Read `server/pty-manager.ts` and find the `--append-system-prompt` content.

**Step 2: Add detail-painter guidance to the system prompt**

Find the section in the system prompt that describes available tools/agents and append guidance:

```
## Detail Sub-Agent

When drawing complex scenes with fine details (faces, hands, hair, textures), use the detail-painter sub-agent:

1. Build the overall composition first (rough shapes, layout, backgrounds)
2. For each area needing fine detail, dispatch detail-painter:
   - Describe what to draw, the style, colors, and desired canvas size
   - detail-painter works on an isolated scratch canvas
   - It returns a canvasId when done
3. Review the result: call `merge_scratch_canvas` with preview first, or call `scratch_preview` on the canvasId
4. Merge with appropriate transform: `merge_scratch_canvas(canvasId, layerName, {translate: [x, y], scale: s})`

### Scratch Canvas Tools (for main agent)
- `create_scratch_canvas` — Create temp canvas (also available to detail-painter)
- `merge_scratch_canvas` — Merge completed scratch into main drawing (main agent only)
- `list_scratch_canvases` — Check for orphaned scratch canvases

### When to Use detail-painter
- Eyes, eyebrows, eyelashes
- Mouths, teeth, lips
- Hands, fingers
- Hair sections needing individual strand detail
- Fabric folds, texture patterns
- Jewelry, accessories with intricate detail
```

**Step 3: Commit**

```bash
git add server/pty-manager.ts
git commit -m "feat: update system prompt with detail sub-agent guidance"
```

---

### Task 10: Run Full Integration Test Suite

**Files:** None (verification only)

**Step 1: Run all integration tests**

Run: `npx playwright test --project=integration`
Expected: All tests pass, including the new scratch canvas tests

**Step 2: Run scratch canvas tests specifically**

Run: `npx playwright test e2e/integration/scratch-canvas-api.spec.ts --project=integration -v`
Expected: All scratch canvas tests pass with detailed output

**Step 3: Verify no regressions in existing tests**

Run: `npx playwright test e2e/integration/layer-api.spec.ts e2e/integration/layer-mutations.spec.ts --project=integration`
Expected: All existing layer tests still pass

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: integration test fixes for scratch canvas"
```
