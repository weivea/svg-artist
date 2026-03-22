# Drawing Agent & Layer System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform SVG Artist from a single-tool drawing app into a professional drawing agent with 19 MCP tools, a drawing skills plugin, reference search, and PNG self-review.

**Architecture:** Plugin (`--plugin-dir`) delivers drawing knowledge (skills, agents, commands). MCP server provides 19 tools for layer management, canvas info, style, defs, and preview. Backend uses `linkedom` for SVG DOM manipulation and `@resvg/resvg-js` for PNG rendering. All layer write ops broadcast updated SVG via existing WebSocket.

**Tech Stack:** linkedom (SVG DOM), @resvg/resvg-js (SVG→PNG), existing Express + MCP SDK + node-pty stack.

**Design doc:** `docs/plans/2026-03-22-drawing-agent-design.md`

---

### Task 1: Install New Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install linkedom and resvg-js**

Run:
```bash
npm install linkedom @resvg/resvg-js
```

**Step 2: Verify imports work**

Run:
```bash
node -e "import('linkedom').then(m => console.log('linkedom OK:', typeof m.parseHTML))"
node -e "import('@aspect-build/resvg-js').catch(() => import('@resvg/resvg-js')).then(m => console.log('resvg OK:', typeof m.Resvg))"
```

Expected: Both print OK.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add linkedom and @resvg/resvg-js dependencies"
```

---

### Task 2: SVG Engine — Core Parser & Layer Query

**Files:**
- Create: `server/svg-engine.ts`
- Create: `e2e/integration/layer-api.spec.ts`
- Modify: `e2e/helpers/svg-samples.ts` (add layered SVG sample)

**Step 1: Add layered SVG test sample**

Add to `e2e/helpers/svg-samples.ts`:

```typescript
export const LAYERED_SCENE = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky-gradient">
      <stop offset="0%" stop-color="#87CEEB"/>
      <stop offset="100%" stop-color="#4682B4"/>
    </linearGradient>
  </defs>
  <g id="layer-bg" data-name="背景">
    <rect width="800" height="600" fill="url(#sky-gradient)"/>
  </g>
  <g id="layer-mountains" data-name="山脉">
    <g id="layer-mountain-left" data-name="左侧山">
      <polygon points="0,600 200,200 400,600" fill="#2d5016"/>
    </g>
    <g id="layer-mountain-right" data-name="右侧山">
      <polygon points="300,600 500,150 700,600" fill="#1a3a0a"/>
    </g>
  </g>
  <g id="layer-sun" data-name="太阳">
    <circle cx="650" cy="100" r="60" fill="#FFD700"/>
  </g>
</svg>`;
```

**Step 2: Write failing tests for layer query operations**

Create `e2e/integration/layer-api.spec.ts`:

```typescript
import { test, expect } from '../fixtures';
import { LAYERED_SCENE } from '../helpers/svg-samples';

test.describe('Layer API — Query Operations', () => {
  /** Helper: create drawing, push layered SVG, return drawId */
  async function setupLayeredDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: LAYERED_SCENE } });
    return drawing.id;
  }

  test('GET canvas info returns correct overview', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/canvas/info`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.viewBox).toBe('0 0 800 600');
    expect(body.layerCount).toBe(4); // bg, mountains, mountain-left, mountain-right, sun → 3 top-level, 2 nested = depends on counting
    expect(body.defsCount).toBe(1);
  });

  test('list_layers returns tree structure', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.layers).toHaveLength(3); // bg, mountains, sun (top-level)
    const mountains = body.layers.find((l: any) => l.id === 'layer-mountains');
    expect(mountains.name).toBe('山脉');
    expect(mountains.children).toHaveLength(2);
  });

  test('get_layer returns single layer content', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/get`, {
      data: { layer_id: 'layer-bg' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.content).toContain('rect');
    expect(body.content).toContain('sky-gradient');
  });

  test('get_layer returns 404 for nonexistent layer', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/get`, {
      data: { layer_id: 'nonexistent' },
    });
    expect(res.status()).toBe(404);
  });

  test('get_svg_source returns full SVG', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.svg).toContain('<svg');
    expect(body.svg).toContain('layer-bg');
    expect(body.svg).toContain('layer-mountains');
  });
});
```

**Step 3: Run tests to verify they fail**

Run: `npx playwright test e2e/integration/layer-api.spec.ts --project=integration`

Expected: All tests FAIL (routes don't exist yet).

**Step 4: Implement SvgEngine — parse, listLayers, getLayer, getCanvasInfo**

Create `server/svg-engine.ts`:

```typescript
import { parseHTML } from 'linkedom';

export interface LayerInfo {
  id: string;
  name: string;
  children: LayerInfo[];
}

export interface CanvasInfo {
  viewBox: string;
  layerCount: number;
  defsCount: number;
  totalElements: number;
}

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class SvgEngine {
  private doc: Document;
  private svg: SVGSVGElement;

  constructor(svgString: string) {
    const { document } = parseHTML(`<!DOCTYPE html><html><body>${svgString}</body></html>`);
    this.doc = document;
    this.svg = document.querySelector('svg')!;
    if (!this.svg) throw new Error('Invalid SVG: no <svg> element found');
  }

  /** Serialize back to SVG string */
  serialize(): string {
    return this.svg.outerHTML;
  }

  /** Get canvas overview info */
  getCanvasInfo(): CanvasInfo {
    const viewBox = this.svg.getAttribute('viewBox') || '';
    const allGs = this.svg.querySelectorAll('g[id^="layer-"]');
    const defs = this.svg.querySelector('defs');
    const defsChildren = defs ? defs.children.length : 0;
    const totalElements = this.svg.querySelectorAll('*').length;
    return { viewBox, layerCount: allGs.length, defsCount: defsChildren, totalElements };
  }

  /** Build layer tree from top-level <g> children of <svg> */
  listLayers(): LayerInfo[] {
    const result: LayerInfo[] = [];
    for (const child of Array.from(this.svg.children)) {
      if (child.tagName === 'g' && child.id?.startsWith('layer-')) {
        result.push(this._buildLayerTree(child as Element));
      }
    }
    return result;
  }

  private _buildLayerTree(g: Element): LayerInfo {
    const children: LayerInfo[] = [];
    for (const child of Array.from(g.children)) {
      if (child.tagName === 'g' && child.id?.startsWith('layer-')) {
        children.push(this._buildLayerTree(child));
      }
    }
    return {
      id: g.id,
      name: g.getAttribute('data-name') || g.id,
      children,
    };
  }

  /** Get a layer's innerHTML by id */
  getLayer(layerId: string): string | null {
    const g = this.svg.querySelector(`#${CSS.escape(layerId)}`);
    if (!g || g.tagName !== 'g') return null;
    return g.innerHTML;
  }

  /** Get full SVG source */
  getSource(): string {
    return this.serialize();
  }
}
```

**Step 5: Register layer query API routes in index.ts**

Add to `server/index.ts` before the SPA fallback route:

```typescript
import { SvgEngine } from './svg-engine.js';

// --- Layer query API routes ---
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
```

**Step 6: Run tests to verify they pass**

Run: `npx playwright test e2e/integration/layer-api.spec.ts --project=integration`

Expected: All tests PASS.

**Step 7: Commit**

```bash
git add server/svg-engine.ts server/index.ts e2e/integration/layer-api.spec.ts e2e/helpers/svg-samples.ts
git commit -m "feat: add SvgEngine with layer query APIs (list_layers, get_layer, get_canvas_info, get_svg_source)"
```

---

### Task 3: SVG Engine — Layer Write Operations (add, update, delete, move, duplicate)

**Files:**
- Modify: `server/svg-engine.ts`
- Modify: `server/index.ts`
- Create: `e2e/integration/layer-mutations.spec.ts`

**Step 1: Write failing tests for layer mutation operations**

Create `e2e/integration/layer-mutations.spec.ts`:

```typescript
import { test, expect } from '../fixtures';
import { LAYERED_SCENE } from '../helpers/svg-samples';

test.describe('Layer API — Mutations', () => {
  async function setupLayeredDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: LAYERED_SCENE } });
    return drawing.id;
  }

  test('add_layer inserts new layer', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/add`, {
      data: { name: '云朵', content: '<ellipse cx="200" cy="80" rx="60" ry="30" fill="white"/>' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.layer_id).toBeTruthy();

    // Verify layer exists
    const listRes = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    const layers = (await listRes.json()).layers;
    expect(layers.find((l: any) => l.id === body.layer_id)).toBeTruthy();
  });

  test('add_layer with parent_id nests inside parent', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/add`, {
      data: { name: '山顶雪', content: '<polygon points="200,200 220,180 240,200" fill="white"/>', parent_id: 'layer-mountains' },
    });
    expect(res.ok()).toBeTruthy();

    const listRes = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    const layers = (await listRes.json()).layers;
    const mountains = layers.find((l: any) => l.id === 'layer-mountains');
    expect(mountains.children).toHaveLength(3); // left, right, + new
  });

  test('update_layer replaces layer content', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/update`, {
      data: { layer_id: 'layer-bg', content: '<rect width="800" height="600" fill="red"/>' },
    });
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).ok).toBe(true);

    const getRes = await apiContext.post(`/api/svg/${drawId}/layers/get`, {
      data: { layer_id: 'layer-bg' },
    });
    const body = await getRes.json();
    expect(body.content).toContain('fill="red"');
    expect(body.content).not.toContain('sky-gradient');
  });

  test('delete_layer removes layer', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/delete`, {
      data: { layer_id: 'layer-sun' },
    });
    expect(res.ok()).toBeTruthy();

    const listRes = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    const layers = (await listRes.json()).layers;
    expect(layers.find((l: any) => l.id === 'layer-sun')).toBeUndefined();
  });

  test('move_layer changes position', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    // Move sun to position 0 (before bg)
    const res = await apiContext.post(`/api/svg/${drawId}/layers/move`, {
      data: { layer_id: 'layer-sun', position: 0 },
    });
    expect(res.ok()).toBeTruthy();

    const listRes = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    const layers = (await listRes.json()).layers;
    expect(layers[0].id).toBe('layer-sun');
  });

  test('duplicate_layer creates copy', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/duplicate`, {
      data: { layer_id: 'layer-sun', new_name: '月亮' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.new_layer_id).toBeTruthy();
    expect(body.new_layer_id).not.toBe('layer-sun');

    const listRes = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    const layers = (await listRes.json()).layers;
    const moon = layers.find((l: any) => l.id === body.new_layer_id);
    expect(moon).toBeTruthy();
    expect(moon.name).toBe('月亮');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx playwright test e2e/integration/layer-mutations.spec.ts --project=integration`

Expected: All FAIL.

**Step 3: Implement layer mutations in SvgEngine**

Add to `server/svg-engine.ts`:

```typescript
  /** Add a new layer. Returns the generated layer id. */
  addLayer(name: string, content: string, parentId?: string, position?: number): string {
    const id = `layer-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const g = this.doc.createElement('g');
    g.setAttribute('id', id);
    g.setAttribute('data-name', name);
    g.innerHTML = content;

    const parent = parentId ? this.svg.querySelector(`#${CSS.escape(parentId)}`) : this.svg;
    if (!parent) throw new Error(`Parent layer "${parentId}" not found`);

    const layerChildren = Array.from(parent.children).filter(
      c => c.tagName === 'g' && c.id?.startsWith('layer-')
    );

    if (position !== undefined && position < layerChildren.length) {
      parent.insertBefore(g, layerChildren[position]);
    } else {
      parent.appendChild(g);
    }
    return id;
  }

  /** Update a layer's innerHTML */
  updateLayer(layerId: string, content: string): boolean {
    const g = this.svg.querySelector(`#${CSS.escape(layerId)}`);
    if (!g || g.tagName !== 'g') return false;
    g.innerHTML = content;
    return true;
  }

  /** Delete a layer */
  deleteLayer(layerId: string): boolean {
    const g = this.svg.querySelector(`#${CSS.escape(layerId)}`);
    if (!g || g.tagName !== 'g') return false;
    g.parentNode?.removeChild(g);
    return true;
  }

  /** Move a layer to a new position, optionally under a new parent */
  moveLayer(layerId: string, position: number, targetParentId?: string): boolean {
    const g = this.svg.querySelector(`#${CSS.escape(layerId)}`);
    if (!g || g.tagName !== 'g') return false;

    const parent = targetParentId
      ? this.svg.querySelector(`#${CSS.escape(targetParentId)}`)
      : g.parentNode;
    if (!parent) return false;

    // Remove from current position
    g.parentNode?.removeChild(g);

    // Insert at new position
    const layerChildren = Array.from(parent.children).filter(
      c => c.tagName === 'g' && c.id?.startsWith('layer-')
    );

    if (position < layerChildren.length) {
      parent.insertBefore(g, layerChildren[position]);
    } else {
      parent.appendChild(g);
    }
    return true;
  }

  /** Duplicate a layer, returning new layer id */
  duplicateLayer(layerId: string, newName?: string, transform?: { translate?: { x: number; y: number } }): string | null {
    const g = this.svg.querySelector(`#${CSS.escape(layerId)}`);
    if (!g || g.tagName !== 'g') return null;

    const clone = g.cloneNode(true) as Element;
    const name = newName || (g.getAttribute('data-name') || layerId) + ' copy';
    const newId = `layer-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    clone.setAttribute('id', newId);
    clone.setAttribute('data-name', name);

    // Recursively update nested layer ids to avoid duplicates
    const nestedLayers = clone.querySelectorAll('g[id^="layer-"]');
    for (const nested of Array.from(nestedLayers)) {
      nested.setAttribute('id', nested.id + '-copy-' + Date.now().toString(36));
    }

    if (transform?.translate) {
      const existing = clone.getAttribute('transform') || '';
      clone.setAttribute('transform', `${existing} translate(${transform.translate.x}, ${transform.translate.y})`.trim());
    }

    g.parentNode?.insertBefore(clone, g.nextSibling);
    return newId;
  }
```

**Step 4: Register mutation API routes in index.ts**

Add to `server/index.ts`:

```typescript
app.post('/api/svg/:drawId/layers/add', async (req: Request, res: Response) => {
  const { name, content, parent_id, position } = req.body as any;
  if (!name || !content) { res.status(400).json({ error: 'Missing name or content' }); return; }
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  const layerId = engine.addLayer(name, content, parent_id, position);
  const newSvg = engine.serialize();
  await drawingStore.updateSvg(req.params.drawId as string, newSvg);
  broadcastSvg(req.params.drawId as string, newSvg);
  res.json({ ok: true, layer_id: layerId });
});

app.post('/api/svg/:drawId/layers/update', async (req: Request, res: Response) => {
  const { layer_id, content } = req.body as any;
  if (!layer_id || content === undefined) { res.status(400).json({ error: 'Missing layer_id or content' }); return; }
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  if (!engine.updateLayer(layer_id, content)) { res.status(404).json({ error: 'Layer not found' }); return; }
  const newSvg = engine.serialize();
  await drawingStore.updateSvg(req.params.drawId as string, newSvg);
  broadcastSvg(req.params.drawId as string, newSvg);
  res.json({ ok: true, layer_id });
});

app.post('/api/svg/:drawId/layers/delete', async (req: Request, res: Response) => {
  const { layer_id } = req.body as any;
  if (!layer_id) { res.status(400).json({ error: 'Missing layer_id' }); return; }
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  if (!engine.deleteLayer(layer_id)) { res.status(404).json({ error: 'Layer not found' }); return; }
  const newSvg = engine.serialize();
  await drawingStore.updateSvg(req.params.drawId as string, newSvg);
  broadcastSvg(req.params.drawId as string, newSvg);
  res.json({ ok: true });
});

app.post('/api/svg/:drawId/layers/move', async (req: Request, res: Response) => {
  const { layer_id, target_parent_id, position } = req.body as any;
  if (!layer_id || position === undefined) { res.status(400).json({ error: 'Missing layer_id or position' }); return; }
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  if (!engine.moveLayer(layer_id, position, target_parent_id)) { res.status(404).json({ error: 'Layer not found' }); return; }
  const newSvg = engine.serialize();
  await drawingStore.updateSvg(req.params.drawId as string, newSvg);
  broadcastSvg(req.params.drawId as string, newSvg);
  res.json({ ok: true });
});

app.post('/api/svg/:drawId/layers/duplicate', async (req: Request, res: Response) => {
  const { layer_id, new_name, transform } = req.body as any;
  if (!layer_id) { res.status(400).json({ error: 'Missing layer_id' }); return; }
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const engine = new SvgEngine(drawing.svgContent);
  const newId = engine.duplicateLayer(layer_id, new_name, transform);
  if (!newId) { res.status(404).json({ error: 'Layer not found' }); return; }
  const newSvg = engine.serialize();
  await drawingStore.updateSvg(req.params.drawId as string, newSvg);
  broadcastSvg(req.params.drawId as string, newSvg);
  res.json({ ok: true, new_layer_id: newId });
});
```

**Step 5: Run tests to verify they pass**

Run: `npx playwright test e2e/integration/layer-mutations.spec.ts --project=integration`

Expected: All PASS.

**Step 6: Run all existing tests to verify no regressions**

Run: `npx playwright test --project=integration`

Expected: All PASS.

**Step 7: Commit**

```bash
git add server/svg-engine.ts server/index.ts e2e/integration/layer-mutations.spec.ts
git commit -m "feat: add layer mutation APIs (add, update, delete, move, duplicate)"
```

---

### Task 4: SVG Engine — Transform, Style, Opacity

**Files:**
- Modify: `server/svg-engine.ts`
- Modify: `server/index.ts`
- Create: `e2e/integration/layer-transform-style.spec.ts`

**Step 1: Write failing tests**

Create `e2e/integration/layer-transform-style.spec.ts`:

```typescript
import { test, expect } from '../fixtures';
import { LAYERED_SCENE } from '../helpers/svg-samples';

test.describe('Layer API — Transform & Style', () => {
  async function setupLayeredDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: LAYERED_SCENE } });
    return drawing.id;
  }

  test('transform_layer applies translate', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
      data: { layer_id: 'layer-sun', translate: { x: 100, y: 50 } },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('translate(100');
  });

  test('transform_layer applies rotate', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
      data: { layer_id: 'layer-sun', rotate: { angle: 45, cx: 650, cy: 100 } },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('rotate(45');
  });

  test('set_layer_opacity sets opacity attribute', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/opacity`, {
      data: { layer_id: 'layer-sun', opacity: 0.5 },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('opacity="0.5"');
  });

  test('set_layer_style sets fill and stroke', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-bg', fill: 'red', stroke: 'black', stroke_width: 2 },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    // Style should be on the <g> element
    expect(svg).toMatch(/layer-bg.*fill="red"/s);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx playwright test e2e/integration/layer-transform-style.spec.ts --project=integration`

**Step 3: Implement transform, opacity, style in SvgEngine**

Add to `server/svg-engine.ts`:

```typescript
  /** Apply transform to a layer */
  transformLayer(layerId: string, opts: {
    translate?: { x: number; y: number };
    scale?: { x: number; y: number };
    rotate?: { angle: number; cx?: number; cy?: number };
  }): boolean {
    const g = this.svg.querySelector(`#${CSS.escape(layerId)}`);
    if (!g || g.tagName !== 'g') return false;

    const parts: string[] = [];
    if (opts.translate) parts.push(`translate(${opts.translate.x}, ${opts.translate.y})`);
    if (opts.scale) parts.push(`scale(${opts.scale.x}, ${opts.scale.y})`);
    if (opts.rotate) {
      const { angle, cx, cy } = opts.rotate;
      parts.push(cx !== undefined ? `rotate(${angle}, ${cx}, ${cy})` : `rotate(${angle})`);
    }

    const existing = g.getAttribute('transform') || '';
    const newTransform = (existing + ' ' + parts.join(' ')).trim();
    g.setAttribute('transform', newTransform);
    return true;
  }

  /** Set layer opacity */
  setLayerOpacity(layerId: string, opacity: number): boolean {
    const g = this.svg.querySelector(`#${CSS.escape(layerId)}`);
    if (!g || g.tagName !== 'g') return false;
    g.setAttribute('opacity', String(opacity));
    return true;
  }

  /** Set style attributes on a layer */
  setLayerStyle(layerId: string, styles: Record<string, string | number>): boolean {
    const g = this.svg.querySelector(`#${CSS.escape(layerId)}`);
    if (!g || g.tagName !== 'g') return false;
    for (const [key, value] of Object.entries(styles)) {
      const attrName = key.replace(/_/g, '-'); // stroke_width → stroke-width
      g.setAttribute(attrName, String(value));
    }
    return true;
  }
```

**Step 4: Register API routes**

Add to `server/index.ts`:

```typescript
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
```

**Step 5: Run tests**

Run: `npx playwright test e2e/integration/layer-transform-style.spec.ts --project=integration`

Expected: All PASS.

**Step 6: Commit**

```bash
git add server/svg-engine.ts server/index.ts e2e/integration/layer-transform-style.spec.ts
git commit -m "feat: add transform_layer, set_layer_opacity, set_layer_style APIs"
```

---

### Task 5: SVG Engine — Defs & ViewBox

**Files:**
- Modify: `server/svg-engine.ts`
- Modify: `server/index.ts`
- Create: `e2e/integration/defs-viewbox.spec.ts`

**Step 1: Write failing tests**

Create `e2e/integration/defs-viewbox.spec.ts`:

```typescript
import { test, expect } from '../fixtures';
import { LAYERED_SCENE } from '../helpers/svg-samples';

test.describe('Defs & ViewBox API', () => {
  async function setupLayeredDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: LAYERED_SCENE } });
    return drawing.id;
  }

  test('list_defs returns existing defs', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/defs/list`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.defs).toHaveLength(1);
    expect(body.defs[0].id).toBe('sky-gradient');
    expect(body.defs[0].type).toBe('linearGradient');
  });

  test('manage_defs add creates new gradient', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/defs/manage`, {
      data: {
        action: 'add',
        id: 'sunset-gradient',
        content: '<linearGradient id="sunset-gradient"><stop offset="0%" stop-color="#FF6B35"/><stop offset="100%" stop-color="#F7C59F"/></linearGradient>',
      },
    });
    expect(res.ok()).toBeTruthy();

    const listRes = await apiContext.post(`/api/svg/${drawId}/defs/list`);
    const defs = (await listRes.json()).defs;
    expect(defs).toHaveLength(2);
    expect(defs.find((d: any) => d.id === 'sunset-gradient')).toBeTruthy();
  });

  test('manage_defs delete removes def', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/defs/manage`, {
      data: { action: 'delete', id: 'sky-gradient' },
    });
    expect(res.ok()).toBeTruthy();

    const listRes = await apiContext.post(`/api/svg/${drawId}/defs/list`);
    const defs = (await listRes.json()).defs;
    expect(defs).toHaveLength(0);
  });

  test('set_viewbox changes viewBox', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/canvas/viewbox`, {
      data: { x: 0, y: 0, width: 1200, height: 900 },
    });
    expect(res.ok()).toBeTruthy();

    const infoRes = await apiContext.post(`/api/svg/${drawId}/canvas/info`);
    const info = await infoRes.json();
    expect(info.viewBox).toBe('0 0 1200 900');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx playwright test e2e/integration/defs-viewbox.spec.ts --project=integration`

**Step 3: Implement defs and viewbox operations in SvgEngine**

Add to `server/svg-engine.ts`:

```typescript
  /** List all defs */
  listDefs(): Array<{ id: string; type: string }> {
    const defs = this.svg.querySelector('defs');
    if (!defs) return [];
    return Array.from(defs.children).map(child => ({
      id: child.id || '',
      type: child.tagName,
    }));
  }

  /** Add, update, or delete a def */
  manageDefs(action: 'add' | 'update' | 'delete', id: string, content?: string): boolean {
    let defs = this.svg.querySelector('defs');

    if (action === 'add') {
      if (!content) return false;
      if (!defs) {
        defs = this.doc.createElement('defs');
        this.svg.insertBefore(defs, this.svg.firstChild);
      }
      // Parse the content to extract the element
      const { document: tempDoc } = parseHTML(`<!DOCTYPE html><html><body>${content}</body></html>`);
      const newEl = tempDoc.body.firstElementChild;
      if (!newEl) return false;
      defs.appendChild(newEl.cloneNode(true));
      return true;
    }

    if (action === 'update') {
      if (!content || !defs) return false;
      const existing = defs.querySelector(`#${CSS.escape(id)}`);
      if (!existing) return false;
      const { document: tempDoc } = parseHTML(`<!DOCTYPE html><html><body>${content}</body></html>`);
      const newEl = tempDoc.body.firstElementChild;
      if (!newEl) return false;
      defs.replaceChild(newEl.cloneNode(true), existing);
      return true;
    }

    if (action === 'delete') {
      if (!defs) return false;
      const existing = defs.querySelector(`#${CSS.escape(id)}`);
      if (!existing) return false;
      defs.removeChild(existing);
      return true;
    }

    return false;
  }

  /** Set viewBox */
  setViewBox(x?: number, y?: number, width?: number, height?: number): boolean {
    const current = (this.svg.getAttribute('viewBox') || '0 0 800 600').split(' ').map(Number);
    const newVB = [
      x ?? current[0],
      y ?? current[1],
      width ?? current[2],
      height ?? current[3],
    ];
    this.svg.setAttribute('viewBox', newVB.join(' '));
    return true;
  }
```

Note: the `parseHTML` import is already at the top of the file.

**Step 4: Register API routes**

Add to `server/index.ts`:

```typescript
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
```

**Step 5: Run tests**

Run: `npx playwright test e2e/integration/defs-viewbox.spec.ts --project=integration`

Expected: All PASS.

**Step 6: Run full integration suite**

Run: `npx playwright test --project=integration`

Expected: All PASS.

**Step 7: Commit**

```bash
git add server/svg-engine.ts server/index.ts e2e/integration/defs-viewbox.spec.ts
git commit -m "feat: add defs management (list, add, update, delete) and set_viewbox APIs"
```

---

### Task 6: SVG Engine — BBox & PNG Preview

**Files:**
- Create: `server/png-renderer.ts`
- Modify: `server/svg-engine.ts`
- Modify: `server/index.ts`
- Create: `e2e/integration/preview-api.spec.ts`

**Step 1: Write failing tests**

Create `e2e/integration/preview-api.spec.ts`:

```typescript
import { test, expect } from '../fixtures';
import { LAYERED_SCENE } from '../helpers/svg-samples';

test.describe('Preview & BBox API', () => {
  async function setupLayeredDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: LAYERED_SCENE } });
    return drawing.id;
  }

  test('preview_as_png returns base64 PNG', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/preview`, {
      data: { width: 400, height: 300 },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.image).toBeTruthy();
    // Verify it's valid base64 PNG (starts with PNG header in base64)
    const buf = Buffer.from(body.image, 'base64');
    expect(buf[0]).toBe(0x89); // PNG magic byte
    expect(buf[1]).toBe(0x50); // 'P'
  });

  test('preview_layer returns base64 PNG for single layer', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/preview/layer`, {
      data: { layer_id: 'layer-sun', width: 200, height: 200 },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.image).toBeTruthy();
    const buf = Buffer.from(body.image, 'base64');
    expect(buf[0]).toBe(0x89);
  });

  test('preview_layer returns 404 for nonexistent layer', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/preview/layer`, {
      data: { layer_id: 'nonexistent', width: 200, height: 200 },
    });
    expect(res.status()).toBe(404);
  });

  test('get_element_bbox returns bounding box', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/canvas/bbox`, {
      data: { element_id: 'layer-sun' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    // The sun is <circle cx="650" cy="100" r="60"/>
    // BBox should be roughly x:590, y:40, w:120, h:120
    expect(body.x).toBeDefined();
    expect(body.y).toBeDefined();
    expect(body.width).toBeDefined();
    expect(body.height).toBeDefined();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx playwright test e2e/integration/preview-api.spec.ts --project=integration`

**Step 3: Create PNG renderer**

Create `server/png-renderer.ts`:

```typescript
import { Resvg } from '@resvg/resvg-js';

export function renderSvgToPng(svgString: string, width?: number, height?: number): Buffer {
  const opts: any = {};
  if (width) opts.fitTo = { mode: 'width', value: width };

  const resvg = new Resvg(svgString, opts);
  const pngData = resvg.render();
  return pngData.asPng();
}

/**
 * Extract a single layer from SVG and render it as PNG.
 * Wraps the layer content in a new SVG with the same viewBox.
 */
export function renderLayerToPng(
  svgString: string,
  layerId: string,
  width?: number,
  height?: number,
  showBackground?: boolean,
): Buffer | null {
  // Use a simple regex/parse to extract viewBox and layer content
  const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 800 600';

  // Find the layer element
  const layerRegex = new RegExp(`(<g[^>]*id="${layerId}"[^>]*>[\\s\\S]*?<\\/g>)`, 'm');
  const layerMatch = svgString.match(layerRegex);
  if (!layerMatch) return null;

  // Also extract defs if present (layer may reference gradients)
  const defsMatch = svgString.match(/<defs>[\s\S]*?<\/defs>/);
  const defs = defsMatch ? defsMatch[0] : '';

  const bg = showBackground ? `<rect width="100%" height="100%" fill="white"/>` : '';

  const layerSvg = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">${defs}${bg}${layerMatch[1]}</svg>`;
  return renderSvgToPng(layerSvg, width, height);
}
```

**Step 4: Add getBBox to SvgEngine**

Add to `server/svg-engine.ts`:

```typescript
  /** Get bounding box of an element by parsing its geometry attributes.
   * Note: linkedom doesn't support getBBox(), so we estimate from attributes. */
  getElementBBox(elementId: string): BBox | null {
    const el = this.svg.querySelector(`#${CSS.escape(elementId)}`);
    if (!el) return null;

    const tag = el.tagName;

    // For <g> elements, compute union of children bboxes
    if (tag === 'g') {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const child of Array.from(el.querySelectorAll('circle, rect, ellipse, polygon, polyline, line, path'))) {
        const bbox = this._elementBBox(child);
        if (bbox) {
          minX = Math.min(minX, bbox.x);
          minY = Math.min(minY, bbox.y);
          maxX = Math.max(maxX, bbox.x + bbox.width);
          maxY = Math.max(maxY, bbox.y + bbox.height);
        }
      }
      if (minX === Infinity) return { x: 0, y: 0, width: 0, height: 0 };
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    return this._elementBBox(el);
  }

  private _elementBBox(el: Element): BBox | null {
    const tag = el.tagName;
    if (tag === 'rect') {
      return {
        x: parseFloat(el.getAttribute('x') || '0'),
        y: parseFloat(el.getAttribute('y') || '0'),
        width: parseFloat(el.getAttribute('width') || '0'),
        height: parseFloat(el.getAttribute('height') || '0'),
      };
    }
    if (tag === 'circle') {
      const cx = parseFloat(el.getAttribute('cx') || '0');
      const cy = parseFloat(el.getAttribute('cy') || '0');
      const r = parseFloat(el.getAttribute('r') || '0');
      return { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
    }
    if (tag === 'ellipse') {
      const cx = parseFloat(el.getAttribute('cx') || '0');
      const cy = parseFloat(el.getAttribute('cy') || '0');
      const rx = parseFloat(el.getAttribute('rx') || '0');
      const ry = parseFloat(el.getAttribute('ry') || '0');
      return { x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2 };
    }
    if (tag === 'polygon' || tag === 'polyline') {
      const points = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < points.length; i += 2) {
        minX = Math.min(minX, points[i]);
        maxX = Math.max(maxX, points[i]);
        minY = Math.min(minY, points[i + 1]);
        maxY = Math.max(maxY, points[i + 1]);
      }
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    if (tag === 'line') {
      const x1 = parseFloat(el.getAttribute('x1') || '0');
      const y1 = parseFloat(el.getAttribute('y1') || '0');
      const x2 = parseFloat(el.getAttribute('x2') || '0');
      const y2 = parseFloat(el.getAttribute('y2') || '0');
      return {
        x: Math.min(x1, x2), y: Math.min(y1, y2),
        width: Math.abs(x2 - x1), height: Math.abs(y2 - y1),
      };
    }
    return null;
  }
```

**Step 5: Register preview and bbox routes**

Add to `server/index.ts`:

```typescript
import { renderSvgToPng, renderLayerToPng } from './png-renderer.js';

app.post('/api/svg/:drawId/preview', async (req: Request, res: Response) => {
  const { width, height } = req.body as any;
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const png = renderSvgToPng(drawing.svgContent, width || 800, height);
  res.json({ image: png.toString('base64') });
});

app.post('/api/svg/:drawId/preview/layer', async (req: Request, res: Response) => {
  const { layer_id, width, height, show_background } = req.body as any;
  if (!layer_id) { res.status(400).json({ error: 'Missing layer_id' }); return; }
  const drawing = await drawingStore.get(req.params.drawId as string);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }
  const png = renderLayerToPng(drawing.svgContent, layer_id, width || 400, height, show_background);
  if (!png) { res.status(404).json({ error: 'Layer not found' }); return; }
  res.json({ image: png.toString('base64') });
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
```

**Step 6: Run tests**

Run: `npx playwright test e2e/integration/preview-api.spec.ts --project=integration`

Expected: All PASS.

**Step 7: Run full integration suite**

Run: `npx playwright test --project=integration`

Expected: All PASS.

**Step 8: Commit**

```bash
git add server/png-renderer.ts server/svg-engine.ts server/index.ts e2e/integration/preview-api.spec.ts
git commit -m "feat: add PNG preview (full + layer) and element bbox APIs"
```

---

### Task 7: Expand MCP Server — All 19 Tools

**Files:**
- Modify: `server/mcp-server.ts`

**Step 1: Rewrite MCP server with all 19 tools**

Replace `server/mcp-server.ts` with the expanded version. Each tool POSTs to the corresponding backend API route using the `SVG_CALLBACK_URL` env var as base URL.

The pattern for each tool is identical:

```typescript
server.tool(
  'tool_name',
  'Description of the tool',
  { /* zod schema */ },
  async (params) => {
    const res = await fetch(`${CALLBACK_URL}/path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) return { content: [{ type: 'text', text: `Error: ${res.status}` }], isError: true };
    const data = await res.json();
    return { content: [{ type: 'text', text: JSON.stringify(data) }] };
  }
);
```

For `preview_as_png` and `preview_layer`, return as image content:

```typescript
server.tool(
  'preview_as_png',
  'Render current SVG as PNG for self-review',
  { width: z.number().optional(), height: z.number().optional() },
  async (params) => {
    const res = await fetch(`${CALLBACK_URL}/preview`, { ... });
    const data = await res.json();
    return {
      content: [{
        type: 'image' as const,
        data: data.image,
        mimeType: 'image/png',
      }],
    };
  }
);
```

Implement all 19 tools:
1. `get_canvas_info` → POST `/canvas/info`
2. `get_element_bbox` → POST `/canvas/bbox`
3. `get_svg_source` → POST `/canvas/source`
4. `list_layers` → POST `/layers/list`
5. `get_layer` → POST `/layers/get`
6. `add_layer` → POST `/layers/add`
7. `update_layer` → POST `/layers/update`
8. `delete_layer` → POST `/layers/delete`
9. `move_layer` → POST `/layers/move`
10. `duplicate_layer` → POST `/layers/duplicate`
11. `transform_layer` → POST `/layers/transform`
12. `set_layer_opacity` → POST `/layers/opacity`
13. `set_layer_style` → POST `/layers/style`
14. `list_defs` → POST `/defs/list`
15. `manage_defs` → POST `/defs/manage`
16. `set_viewbox` → POST `/canvas/viewbox`
17. `preview_as_png` → POST `/preview` (returns image content)
18. `preview_layer` → POST `/preview/layer` (returns image content)
19. `draw_svg` → POST `/` (keep for backward compat, but deprioritize)

Note: Keep `draw_svg` for backward compatibility. The system prompt will guide Claude to prefer layer operations.

**Step 2: Run typecheck**

Run: `npm run typecheck`

Expected: No type errors.

**Step 3: Commit**

```bash
git add server/mcp-server.ts
git commit -m "feat: expand MCP server from 1 to 19 tools (layers, canvas, defs, preview)"
```

---

### Task 8: Update PTY Manager — Plugin & New CLI Args

**Files:**
- Modify: `server/pty-manager.ts`

**Step 1: Update spawn method**

Modify the `spawn()` method in `server/pty-manager.ts`:

```typescript
spawn(opts: SpawnOptions = {}): IPty {
  const mcpConfigPath = join(projectRoot, 'mcp-config.json');
  const pluginDir = join(projectRoot, 'plugins', 'svg-drawing');

  const systemPrompt = [
    'You are a professional SVG artist. Users describe artwork and you create it through layer operations.',
    '',
    'Workflow:',
    '1. Analyze user request. Use reference-searcher agent for visual references when helpful.',
    '2. Plan layer structure (background → midground → foreground).',
    '3. Create layers one by one with add_layer.',
    '4. Self-review with preview_as_png. Fix issues found.',
    '5. Use get_element_bbox for precise layout positioning.',
    '',
    'Always give layers and elements meaningful id and data-name attributes.',
  ].join('\n');

  const layerGuide = [
    'Layer tool usage:',
    '- Each independent visual element goes in its own layer',
    '- Name layers with layer-<description> format (e.g., layer-sky, layer-tree-1)',
    '- Prefer update_layer over rebuilding layers',
    '- Use duplicate_layer + transform_layer for repeated elements',
    '- Put gradients/filters in manage_defs, reference by id in layers',
    '- Self-review with preview_as_png after major changes',
  ].join('\n');

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
  args.push('--append-system-prompt', layerGuide);
  args.push('--plugin-dir', pluginDir);
  args.push('--mcp-config', mcpConfigPath);
  args.push('--allowedTools', 'mcp__svg-artist__*,WebSearch,WebFetch');

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

  // ... rest unchanged
}
```

**Step 2: Run typecheck**

Run: `npm run typecheck`

Expected: No errors.

**Step 3: Commit**

```bash
git add server/pty-manager.ts
git commit -m "feat: update PTY spawn with --plugin-dir, --append-system-prompt, expanded --allowedTools"
```

---

### Task 9: Create Drawing Plugin — Skills

**Files:**
- Create: `plugins/svg-drawing/.claude-plugin/plugin.json`
- Create: `plugins/svg-drawing/skills/svg-fundamentals/SKILL.md`
- Create: `plugins/svg-drawing/skills/bezier-and-curves/SKILL.md`
- Create: `plugins/svg-drawing/skills/color-and-gradients/SKILL.md`
- Create: `plugins/svg-drawing/skills/composition/SKILL.md`
- Create: `plugins/svg-drawing/skills/layer-workflow/SKILL.md`

**Step 1: Create plugin.json**

```json
{
  "name": "svg-drawing",
  "description": "Professional SVG drawing skills, agents, and workflows for Claude-powered artwork creation",
  "version": "0.1.0",
  "author": { "name": "SVG Artist" }
}
```

**Step 2: Create svg-fundamentals/SKILL.md**

Write skill covering: basic shapes (rect, circle, ellipse, line, polygon, polyline), `<path>` M/L/H/V/Z commands, transform attribute, coordinate system, viewBox, grouping with `<g>`, `<use>` references. Include concrete SVG code examples for each concept.

**Step 3: Create bezier-and-curves/SKILL.md**

Write skill covering: quadratic Bézier Q/T with control point diagrams, cubic Bézier C/S, arc A command, common patterns (wave, petal, spiral). Include SVG path examples.

**Step 4: Create color-and-gradients/SKILL.md**

Write skill covering: color theory palettes, linearGradient direction and stops, radialGradient focal point, pattern tiling, opacity blending. Include complete `<defs>` examples.

**Step 5: Create composition/SKILL.md**

Write skill covering: composing complex figures from basic shapes, foreground/midground/background, perspective and depth, shadows, repetitive patterns via duplicate_layer + transform_layer.

**Step 6: Create layer-workflow/SKILL.md**

Write skill covering: layer naming conventions, work order (large→details), self-review with preview_as_png workflow, precise layout with get_element_bbox, when to use which tool.

**Step 7: Validate plugin**

Run: `claude plugin validate plugins/svg-drawing`

Expected: Validation passed (possibly with author warning only).

**Step 8: Commit**

```bash
git add plugins/
git commit -m "feat: create svg-drawing plugin with 5 drawing skills"
```

---

### Task 10: Create Drawing Plugin — Agent & Command

**Files:**
- Create: `plugins/svg-drawing/agents/reference-searcher.md`
- Create: `plugins/svg-drawing/commands/reference.md`

**Step 1: Create reference-searcher agent**

Create `plugins/svg-drawing/agents/reference-searcher.md`:

```markdown
---
name: reference-searcher
description: "Search for reference images to guide SVG drawing. Use when the user describes complex subjects (animals, landscapes, objects) to find visual references before drawing."
model: haiku
---

You are a visual reference search assistant for an SVG drawing application. Your job is to find and analyze reference images that will help guide SVG artwork creation.

When given a description of what the user wants drawn:

1. **Search for references** using WebSearch:
   - Search for: "[subject] SVG illustration vector art"
   - Also search: "[subject] simple flat design illustration"
   - Focus on vector art and flat illustrations (easier to recreate in SVG)

2. **Analyze results** using WebFetch on the most promising URLs:
   - Look for images with clear, simple shapes
   - Prefer flat design over photorealistic references
   - Note the color palette used

3. **Summarize for the artist** — provide:
   - Key shapes and their relationships (e.g., "body is an oval, legs are rectangles")
   - Suggested color palette (3-5 hex colors)
   - Composition advice (what goes in foreground/midground/background)
   - Which SVG elements to use (circle, path, polygon, etc.)
   - Suggested layer structure

Keep summaries concise and actionable. The artist needs to translate your description into SVG code.
```

**Step 2: Create /reference command**

Create `plugins/svg-drawing/commands/reference.md`:

```markdown
---
description: "Search for visual references to guide your drawing"
---

Use the reference-searcher agent to find visual references for the subject described. Pass the user's description to the agent and relay the results.
```

**Step 3: Validate plugin**

Run: `claude plugin validate plugins/svg-drawing`

Expected: Validation passed.

**Step 4: Commit**

```bash
git add plugins/svg-drawing/agents/ plugins/svg-drawing/commands/
git commit -m "feat: add reference-searcher agent and /reference command to drawing plugin"
```

---

### Task 11: Integration Verification

**Step 1: Run full integration test suite**

Run: `npx playwright test --project=integration`

Expected: All tests PASS (old + new).

**Step 2: Run typecheck**

Run: `npm run typecheck`

Expected: No errors.

**Step 3: Verify plugin loads correctly**

Run:
```bash
claude --plugin-dir plugins/svg-drawing --print "List all your available skills that start with 'svg-drawing'. Just list the names." 2>&1 | head -20
```

Expected output includes:
- `svg-drawing:svg-fundamentals`
- `svg-drawing:bezier-and-curves`
- `svg-drawing:color-and-gradients`
- `svg-drawing:composition`
- `svg-drawing:layer-workflow`

**Step 4: Verify agent loads**

Run:
```bash
claude --plugin-dir plugins/svg-drawing --print "List all your available agents that start with 'svg-drawing'. Just list the names." 2>&1 | head -10
```

Expected: `svg-drawing:reference-searcher`

**Step 5: Manual smoke test (optional)**

Start server: `npm run dev`

Open browser, create a new drawing, and verify in the terminal that Claude now has access to the layer tools and drawing skills.

**Step 6: Commit any fixes needed**

```bash
git add -A
git commit -m "fix: integration verification fixes"
```

---

### Task 12: Update Default SVG & Documentation

**Files:**
- Modify: `server/drawing-store.ts` (update DEFAULT_SVG to use layers)
- Modify: `CLAUDE.md` (update architecture docs)

**Step 1: Update DEFAULT_SVG to include a layer structure**

Modify `server/drawing-store.ts`:

```typescript
const DEFAULT_SVG = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <g id="layer-canvas" data-name="画布">
    <rect width="800" height="600" fill="#f5f5f5"/>
  </g>
  <g id="layer-content" data-name="内容">
    <text x="400" y="300" text-anchor="middle" fill="#999" font-size="20">Waiting for artwork...</text>
  </g>
</svg>`;
```

**Step 2: Update CLAUDE.md architecture section**

Add a section describing the new 19 MCP tools, plugin structure, and updated data flow.

**Step 3: Run tests to verify DEFAULT_SVG change doesn't break anything**

Run: `npx playwright test --project=integration`

Expected: All PASS (tests create their own drawings).

**Step 4: Commit**

```bash
git add server/drawing-store.ts CLAUDE.md
git commit -m "docs: update default SVG to use layers, update CLAUDE.md architecture"
```
