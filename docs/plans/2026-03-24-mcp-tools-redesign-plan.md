# MCP Tools Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor 54+ MCP tools into 38 well-organized tools aligned with professional designer workflows, fixing architectural defects (transform overwrite, filter non-stacking, style non-incremental) and adding missing capabilities (path editing, typography, align/distribute, gradient shortcuts).

**Architecture:** The MCP server (`server/mcp-server.ts`) is a thin proxy that registers tools and forwards calls via HTTP POST to Express routes in `server/index.ts`. The SVG DOM manipulation layer (`server/svg-engine.ts`) uses linkedom for server-side SVG parsing. New capabilities (path ops, typography) get their own modules. All mutations follow the pattern: parse SVG → engine method → serialize → save → broadcast.

**Tech Stack:** TypeScript (ES modules, tsx), linkedom (SVG DOM), Express 5, paper.js (path boolean ops), @resvg/resvg-js (PNG), Playwright (tests)

**Design Doc:** `docs/plans/2026-03-24-mcp-tools-redesign-design.md`

---

## Phase 1: Foundation — Fix Core Architectural Defects

### Task 1: Transform Composition Mode

**Files:**
- Modify: `server/svg-engine.ts` (lines 263-283, `transformLayer` method)
- Modify: `server/mcp-server.ts` (lines 184-204, `transform_layer` tool registration)
- Modify: `server/index.ts` (lines 314-327, `/layers/transform` route)
- Test: `e2e/integration/layer-transform-style.spec.ts`

**Step 1: Write the failing test**

Add to `e2e/integration/layer-transform-style.spec.ts`:

```typescript
test('transform_layer compose mode appends to existing transform', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  // First transform: translate
  await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
    data: { layer_id: 'layer-sun', translate: { x: 10, y: 20 } },
  });
  // Second transform: rotate (compose mode, should append)
  await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
    data: { layer_id: 'layer-sun', rotate: { angle: 45 }, mode: 'compose' },
  });
  // Verify both transforms present
  const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
  const body = await source.json();
  expect(body.svg).toContain('translate(10, 20)');
  expect(body.svg).toMatch(/rotate\(45\)/);
});

test('transform_layer replace mode overwrites existing transform', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
    data: { layer_id: 'layer-sun', translate: { x: 10, y: 20 } },
  });
  await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
    data: { layer_id: 'layer-sun', rotate: { angle: 45 }, mode: 'replace' },
  });
  const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
  const body = await source.json();
  expect(body.svg).not.toContain('translate(10, 20)');
  expect(body.svg).toMatch(/rotate\(45\)/);
});

test('transform_layer supports skew', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
    data: { layer_id: 'layer-sun', skew: { x: 15, y: 10 } },
  });
  const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
  const body = await source.json();
  expect(body.svg).toContain('skewX(15)');
  expect(body.svg).toContain('skewY(10)');
});

test('transform_layer scale with center point', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
    data: { layer_id: 'layer-sun', scale: { x: 2, y: 2, cx: 650, cy: 100 } },
  });
  const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
  const body = await source.json();
  // Scale around center = translate(-cx,-cy) scale(sx,sy) translate(cx,cy)
  expect(body.svg).toContain('translate(650, 100)');
  expect(body.svg).toContain('scale(2, 2)');
  expect(body.svg).toContain('translate(-650, -100)');
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/layer-transform-style.spec.ts --project=integration -g "compose mode"`
Expected: FAIL — `mode` parameter not recognized, compose not implemented

**Step 3: Implement transform composition in svg-engine.ts**

Replace `transformLayer` method (lines 263-283) in `server/svg-engine.ts`:

```typescript
transformLayer(layerId: string, opts: {
  translate?: { x: number; y: number };
  scale?: { x: number; y: number; cx?: number; cy?: number };
  rotate?: { angle: number; cx?: number; cy?: number };
  skew?: { x?: number; y?: number };
  mode?: 'compose' | 'replace';
}): boolean {
  const g = this._findLayerElement(layerId);
  if (!g) return false;

  const parts: string[] = [];
  if (opts.translate) {
    parts.push(`translate(${opts.translate.x}, ${opts.translate.y})`);
  }
  if (opts.scale) {
    const { x, y, cx, cy } = opts.scale;
    if (cx !== undefined && cy !== undefined) {
      // Scale around center: translate(cx,cy) scale(sx,sy) translate(-cx,-cy)
      parts.push(`translate(${cx}, ${cy})`);
      parts.push(`scale(${x}, ${y})`);
      parts.push(`translate(${-cx}, ${-cy})`);
    } else {
      parts.push(`scale(${x}, ${y})`);
    }
  }
  if (opts.rotate) {
    const { angle, cx, cy } = opts.rotate;
    parts.push(cx !== undefined && cy !== undefined
      ? `rotate(${angle}, ${cx}, ${cy})`
      : `rotate(${angle})`);
  }
  if (opts.skew) {
    if (opts.skew.x !== undefined) parts.push(`skewX(${opts.skew.x})`);
    if (opts.skew.y !== undefined) parts.push(`skewY(${opts.skew.y})`);
  }

  if (parts.length === 0) return true;

  const mode = opts.mode || 'compose';
  if (mode === 'compose') {
    const existing = g.getAttribute('transform') || '';
    const combined = existing ? `${existing} ${parts.join(' ')}` : parts.join(' ');
    g.setAttribute('transform', combined);
  } else {
    g.setAttribute('transform', parts.join(' '));
  }
  return true;
}
```

**Step 4: Update MCP server tool registration** in `server/mcp-server.ts` (lines 184-204):

Add `skew` and `mode` parameters to the `transform_layer` tool:

```typescript
server.tool(
  'transform_layer',
  'Apply translate, scale, rotate, or skew transform to a layer. Default mode is compose (appends to existing transforms). Use replace to overwrite.',
  {
    layer_id: z.string().describe('The layer id to transform'),
    translate: z.object({
      x: z.number(),
      y: z.number(),
    }).optional().describe('Translation offset'),
    scale: z.object({
      x: z.number(),
      y: z.number(),
      cx: z.number().optional(),
      cy: z.number().optional(),
    }).optional().describe('Scale factors with optional center point'),
    rotate: z.object({
      angle: z.number(),
      cx: z.number().optional(),
      cy: z.number().optional(),
    }).optional().describe('Rotation in degrees, optionally around a center point'),
    skew: z.object({
      x: z.number().optional(),
      y: z.number().optional(),
    }).optional().describe('Skew angles in degrees for x and/or y axis'),
    mode: z.enum(['compose', 'replace']).optional().describe('compose (default): append to existing transforms. replace: overwrite.'),
  },
  async (params) => textTool('layers/transform', params),
);
```

**Step 5: Run all transform tests**

Run: `npx playwright test e2e/integration/layer-transform-style.spec.ts --project=integration`
Expected: All PASS

**Step 6: Commit**

```bash
git add server/svg-engine.ts server/mcp-server.ts
git commit -m "feat: transform composition mode with skew and scale center support"
```

---

### Task 2: Effect Chaining (replace apply_filter with apply_effect)

**Files:**
- Modify: `server/svg-engine.ts` — add `applyEffectChain` method
- Modify: `server/filter-templates.ts` — add `mergeFilterPrimitives` helper
- Modify: `server/mcp-server.ts` — replace `apply_filter` with `apply_effect`
- Modify: `server/index.ts` — update route from `filter/apply` to `effect/apply`
- Test: `e2e/integration/filter-style-api.spec.ts`

**Step 1: Write the failing test**

Add to `e2e/integration/filter-style-api.spec.ts`:

```typescript
test('apply_effect chains multiple effects', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  const res = await apiContext.post(`/api/svg/${drawId}/effect/apply`, {
    data: {
      layer_id: 'layer-sun',
      effects: [
        { type: 'drop-shadow', params: { dx: 3, dy: 3, blur: 5 } },
        { type: 'blur', params: { radius: 2 } },
      ],
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.filter_id).toBeTruthy();

  // Verify the filter contains both primitives
  const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
  const svgBody = await source.json();
  expect(svgBody.svg).toContain('feGaussianBlur');
  expect(svgBody.svg).toContain('feOffset');
  // The layer should reference a single combined filter
  expect(svgBody.svg).toMatch(/filter="url\(#effect-chain-/);
});

test('apply_effect append mode adds to existing effects', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  // First effect: drop-shadow
  await apiContext.post(`/api/svg/${drawId}/effect/apply`, {
    data: {
      layer_id: 'layer-sun',
      effects: [{ type: 'drop-shadow' }],
    },
  });
  // Append glow
  const res = await apiContext.post(`/api/svg/${drawId}/effect/apply`, {
    data: {
      layer_id: 'layer-sun',
      effects: [{ type: 'glow' }],
      mode: 'append',
    },
  });
  expect(res.ok()).toBeTruthy();

  // Verify combined filter has both shadow and glow primitives
  const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
  const svgBody = await source.json();
  // Should have feOffset (from shadow) and feFlood with glow color
  expect(svgBody.svg).toContain('feOffset');
  expect(svgBody.svg).toContain('feFlood');
});

test('apply_effect replace mode clears existing effects', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  await apiContext.post(`/api/svg/${drawId}/effect/apply`, {
    data: {
      layer_id: 'layer-sun',
      effects: [{ type: 'drop-shadow' }],
    },
  });
  // Replace with blur only
  const res = await apiContext.post(`/api/svg/${drawId}/effect/apply`, {
    data: {
      layer_id: 'layer-sun',
      effects: [{ type: 'blur', params: { radius: 3 } }],
      mode: 'replace',
    },
  });
  expect(res.ok()).toBeTruthy();
  const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
  const svgBody = await source.json();
  // Should NOT have shadow primitives
  expect(svgBody.svg).not.toContain('feOffset');
});
```

**Step 2: Run tests to verify they fail**

Run: `npx playwright test e2e/integration/filter-style-api.spec.ts --project=integration -g "apply_effect"`
Expected: FAIL — route `effect/apply` not found (404)

**Step 3: Add `extractFilterPrimitives` helper to filter-templates.ts**

Add to end of `server/filter-templates.ts`:

```typescript
/**
 * Extract the inner primitives from a <filter> SVG string.
 * Returns the content between <filter ...> and </filter> tags.
 */
export function extractFilterPrimitives(filterSvg: string): string {
  const match = filterSvg.match(/<filter[^>]*>([\s\S]*)<\/filter>/);
  return match ? match[1].trim() : '';
}

/**
 * Build a combined <filter> element from multiple effect specifications.
 * Each effect's primitives are concatenated with unique result names to avoid conflicts.
 */
export function buildEffectChain(
  chainId: string,
  effects: Array<{ type: string; params?: FilterParams }>,
  generateFn: (type: FilterType, params?: FilterParams, suffix?: string) => FilterResult,
): { filterId: string; filterSvg: string } {
  const allPrimitives: string[] = [];

  for (let i = 0; i < effects.length; i++) {
    const effect = effects[i];
    const result = generateFn(effect.type as FilterType, effect.params, `${chainId}-${i}`);
    const primitives = extractFilterPrimitives(result.filterSvg);
    allPrimitives.push(`  <!-- effect ${i}: ${effect.type} -->\n${primitives}`);
  }

  const filterId = `effect-chain-${chainId}`;
  const filterSvg = `<filter id="${filterId}" x="-30%" y="-30%" width="160%" height="160%">\n${allPrimitives.join('\n')}\n</filter>`;
  return { filterId, filterSvg };
}
```

**Step 4: Add `applyEffectChain` method to svg-engine.ts**

Add after `applyFilterDef` method (~line 504):

```typescript
applyEffectChain(
  layerId: string,
  effects: Array<{ type: string; params?: Record<string, number | string> }>,
  mode: 'append' | 'replace' = 'append',
): { ok: boolean; filterId?: string; error?: string } {
  const g = this._findLayerElement(layerId);
  if (!g) return { ok: false, error: 'Layer not found' };

  // If append mode and layer already has a filter, extract existing primitives
  let existingPrimitives = '';
  if (mode === 'append') {
    const currentFilter = g.getAttribute('filter');
    if (currentFilter) {
      const match = currentFilter.match(/url\(#([^)]+)\)/);
      if (match) {
        const existingFilterId = match[1];
        const defs = this.svgElement.querySelector('defs');
        if (defs) {
          const existingEl = defs.querySelector(`#${existingFilterId}`);
          if (existingEl) {
            existingPrimitives = existingEl.innerHTML || '';
            // Remove old filter from defs
            existingEl.parentNode?.removeChild(existingEl);
          }
        }
      }
    }
  } else {
    // Replace mode: remove any existing filter reference
    const currentFilter = g.getAttribute('filter');
    if (currentFilter) {
      const match = currentFilter.match(/url\(#([^)]+)\)/);
      if (match) {
        const defs = this.svgElement.querySelector('defs');
        if (defs) {
          const existingEl = defs.querySelector(`#${match[1]}`);
          if (existingEl) existingEl.parentNode?.removeChild(existingEl);
        }
      }
    }
  }

  // Generate new filter primitives
  const chainSuffix = randomSuffix();
  const newPrimitives: string[] = [];
  for (let i = 0; i < effects.length; i++) {
    const effect = effects[i];
    const result = generateFilter(effect.type as FilterType, effect.params, `${chainSuffix}-${i}`);
    const primitives = extractFilterPrimitives(result.filterSvg);
    newPrimitives.push(primitives);
  }

  const allPrimitives = existingPrimitives
    ? `${existingPrimitives}\n${newPrimitives.join('\n')}`
    : newPrimitives.join('\n');

  const filterId = `effect-chain-${chainSuffix}`;
  const filterSvg = `<filter id="${filterId}" x="-30%" y="-30%" width="160%" height="160%">\n${allPrimitives}\n</filter>`;

  const added = this.manageDefs('add', filterId, filterSvg);
  if (!added) return { ok: false, error: 'Failed to add effect chain to defs' };

  g.setAttribute('filter', `url(#${filterId})`);
  return { ok: true, filterId };
}
```

Also add import of `extractFilterPrimitives`, `randomSuffix` from filter-templates at the top of svg-engine.ts.

**Step 5: Add route in index.ts**

Add new route after the existing `filter/apply` route (~line 417):

```typescript
app.post('/api/svg/:drawId/effect/apply', async (req: Request, res: Response) => {
  const { drawId } = req.params;
  const { layer_id, effects, mode } = req.body;
  if (!layer_id || !effects || !Array.isArray(effects)) {
    return res.status(400).json({ error: 'layer_id and effects array required' });
  }
  const drawing = drawingStore.get(drawId);
  if (!drawing) return res.status(404).json({ error: 'Drawing not found' });
  const engine = new SvgEngine(drawing.svgContent);
  const result = engine.applyEffectChain(layer_id, effects, mode || 'append');
  if (!result.ok) return res.status(400).json({ error: result.error });
  const svg = engine.serialize();
  drawingStore.updateSvg(drawId, svg);
  broadcastSvg(drawId, svg);
  res.json({ ok: true, filter_id: result.filterId });
});
```

**Step 6: Register `apply_effect` tool in mcp-server.ts**

Replace the `apply_filter` tool registration (lines 308-332):

```typescript
server.tool(
  'apply_effect',
  `Apply one or more effects to a layer. Effects are chainable — multiple effects stack into a single combined filter.
Supported effects: drop-shadow, blur, glow, emboss, noise-texture, paper, watercolor, metallic, glass.
Use mode "append" (default) to add effects to existing ones, or "replace" to start fresh.`,
  {
    layer_id: z.string().describe('The layer id to apply effects to'),
    effects: z.array(z.object({
      type: z.enum([
        'drop-shadow', 'blur', 'glow', 'emboss', 'noise-texture',
        'paper', 'watercolor', 'metallic', 'glass',
      ]).describe('Effect type'),
      params: z.record(z.string(), z.union([z.number(), z.string()])).optional().describe('Effect-specific parameters'),
    })).describe('Array of effects to apply (they stack in order)'),
    mode: z.enum(['append', 'replace']).optional().describe('append (default): add to existing effects. replace: clear and start fresh.'),
  },
  async (params) => textTool('effect/apply', params),
);
```

**Step 7: Run all effect tests**

Run: `npx playwright test e2e/integration/filter-style-api.spec.ts --project=integration`
Expected: All PASS

**Step 8: Commit**

```bash
git add server/svg-engine.ts server/filter-templates.ts server/mcp-server.ts server/index.ts e2e/integration/filter-style-api.spec.ts
git commit -m "feat: chainable apply_effect replacing single-shot apply_filter"
```

---

### Task 3: Incremental Style Updates

**Files:**
- Modify: `server/svg-engine.ts` (lines 295-324, `setLayerStyle` method)
- Test: `e2e/integration/layer-transform-style.spec.ts`

**Step 1: Write the failing test**

```typescript
test('set_layer_style null value removes attribute', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  // Set fill on a layer
  await apiContext.post(`/api/svg/${drawId}/layers/style`, {
    data: { layer_id: 'layer-sun', fill: '#ff0000', stroke: '#000000' },
  });
  // Remove fill by passing null, stroke should remain
  await apiContext.post(`/api/svg/${drawId}/layers/style`, {
    data: { layer_id: 'layer-sun', fill: null },
  });
  const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
  const body = await source.json();
  // The layer group should not have fill attribute but should have stroke
  const sunMatch = body.svg.match(/<g[^>]*id="layer-sun"[^>]*>/);
  expect(sunMatch[0]).not.toContain('fill=');
  expect(sunMatch[0]).toContain('stroke="#000000"');
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/layer-transform-style.spec.ts --project=integration -g "null value"`
Expected: FAIL — null is serialized as "null" string instead of removing

**Step 3: Update setLayerStyle in svg-engine.ts**

Replace lines 295-324:

```typescript
setLayerStyle(layerId: string, styles: Record<string, string | number | null>): boolean {
  const g = this._findLayerElement(layerId);
  if (!g) return false;

  const specialMappings: Record<string, string> = {
    filter_ref: 'filter',
    mask_ref: 'mask',
    clip_path: 'clip-path',
  };

  for (const [key, value] of Object.entries(styles)) {
    if (key === 'layer_id') continue;

    // null means remove the attribute
    if (value === null) {
      if (key === 'mix_blend_mode') {
        const existing = g.getAttribute('style') || '';
        const cleaned = existing.replace(/mix-blend-mode:\s*[^;]+;?\s*/g, '').trim();
        g.setAttribute('style', cleaned);
        if (!cleaned) g.removeAttribute('style');
      } else {
        const attrName = specialMappings[key] || key.replace(/_/g, '-');
        g.removeAttribute(attrName);
      }
      continue;
    }

    if (key === 'mix_blend_mode') {
      const existing = g.getAttribute('style') || '';
      const cleaned = existing.replace(/mix-blend-mode:\s*[^;]+;?\s*/g, '').trim();
      const newStyle = cleaned
        ? `${cleaned}; mix-blend-mode: ${value}`
        : `mix-blend-mode: ${value}`;
      g.setAttribute('style', newStyle);
      continue;
    }

    const attrName = specialMappings[key] || key.replace(/_/g, '-');
    g.setAttribute(attrName, String(value));
  }
  return true;
}
```

**Step 4: Run tests**

Run: `npx playwright test e2e/integration/layer-transform-style.spec.ts --project=integration`
Expected: All PASS

**Step 5: Commit**

```bash
git add server/svg-engine.ts e2e/integration/layer-transform-style.spec.ts
git commit -m "feat: incremental style updates with null-removes attributes"
```

---

## Phase 2: Layer Operations Refactor

### Task 4: Add `source_layer_id` to add_layer (replacing duplicate_layer)

**Files:**
- Modify: `server/svg-engine.ts` — update `addLayer` signature
- Modify: `server/mcp-server.ts` — update `add_layer` tool schema
- Modify: `server/index.ts` — update `/layers/add` route handler
- Test: `e2e/integration/layer-mutations.spec.ts`

**Step 1: Write the failing test**

```typescript
test('add_layer with source_layer_id copies content from existing layer', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  const res = await apiContext.post(`/api/svg/${drawId}/layers/add`, {
    data: { name: 'sun copy', source_layer_id: 'layer-sun' },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.layer_id).toBeTruthy();

  // Verify the new layer has sun's content
  const layerRes = await apiContext.post(`/api/svg/${drawId}/layers/get`, {
    data: { layer_id: body.layer_id },
  });
  const layerBody = await layerRes.json();
  expect(layerBody.content).toContain('circle');
  expect(layerBody.content).toContain('FFD700');
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/layer-mutations.spec.ts --project=integration -g "source_layer_id"`
Expected: FAIL — layer has no content (source_layer_id not recognized)

**Step 3: Update addLayer in svg-engine.ts**

Modify `addLayer` method signature and body (lines 138-172):

```typescript
addLayer(
  name: string,
  content?: string,
  parentId?: string,
  position?: number,
  sourceLayerId?: string,
): string | null {
  // If source_layer_id provided, copy content from that layer
  let layerContent = content || '';
  if (sourceLayerId) {
    const sourceElement = this._findLayerElement(sourceLayerId);
    if (!sourceElement) return null;
    layerContent = sourceElement.innerHTML;
  }

  let parent: LElement;
  if (parentId) {
    const parentEl = this._findLayerElement(parentId);
    if (!parentEl) return null;
    parent = parentEl;
  } else {
    parent = this.svgElement;
  }

  const slug = this._slugify(name);
  const id = `layer-${slug}-${Date.now().toString(36)}`;

  const g = this.document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('id', id);
  g.setAttribute('data-name', name);
  g.innerHTML = layerContent;

  if (position !== undefined && position !== null) {
    const layerChildren = this._getLayerChildren(parent);
    if (position >= layerChildren.length) {
      parent.appendChild(g);
    } else {
      parent.insertBefore(g, layerChildren[position]);
    }
  } else {
    parent.appendChild(g);
  }

  return id;
}
```

**Step 4: Update route handler** in index.ts (lines 239-252):

```typescript
app.post('/api/svg/:drawId/layers/add', async (req: Request, res: Response) => {
  const { drawId } = req.params;
  const { name, content, parent_id, position, source_layer_id } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  if (!content && !source_layer_id) return res.status(400).json({ error: 'content or source_layer_id required' });
  const drawing = drawingStore.get(drawId);
  if (!drawing) return res.status(404).json({ error: 'Drawing not found' });
  const engine = new SvgEngine(drawing.svgContent);
  const layerId = engine.addLayer(name, content, parent_id, position, source_layer_id);
  if (!layerId) return res.status(400).json({ error: 'Failed to add layer' });
  const svg = engine.serialize();
  drawingStore.updateSvg(drawId, svg);
  broadcastSvg(drawId, svg);
  res.json({ ok: true, layer_id: layerId });
});
```

**Step 5: Update MCP tool** in mcp-server.ts (lines 124-134):

```typescript
server.tool(
  'add_layer',
  'Add a new layer with SVG content, or duplicate an existing layer by providing source_layer_id',
  {
    name: z.string().describe('Name for the new layer'),
    content: z.string().optional().describe('SVG content for the layer (required unless source_layer_id is set)'),
    source_layer_id: z.string().optional().describe('Copy content from this existing layer (replaces duplicate_layer)'),
    parent_id: z.string().optional().describe('Parent layer id to nest under'),
    position: z.number().optional().describe('Insert position among siblings (0-based)'),
  },
  async (params) => textTool('layers/add', params),
);
```

**Step 6: Run tests**

Run: `npx playwright test e2e/integration/layer-mutations.spec.ts --project=integration`
Expected: All PASS

**Step 7: Commit**

```bash
git add server/svg-engine.ts server/mcp-server.ts server/index.ts e2e/integration/layer-mutations.spec.ts
git commit -m "feat: add source_layer_id to add_layer for layer duplication"
```

---

### Task 5: Batch reorder_layers tool

**Files:**
- Add: new `reorderLayers` method in `server/svg-engine.ts`
- Modify: `server/mcp-server.ts` — add `reorder_layers` tool, remove `move_layer`
- Modify: `server/index.ts` — add `/layers/reorder` route
- Test: `e2e/integration/layer-mutations.spec.ts`

**Step 1: Write the failing test**

```typescript
test('reorder_layers moves layer to top', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  // Move background layer to top (it's currently first)
  const res = await apiContext.post(`/api/svg/${drawId}/layers/reorder`, {
    data: {
      operations: [
        { layer_id: 'layer-bg', action: 'move_to_top' },
      ],
    },
  });
  expect(res.ok()).toBeTruthy();

  // Verify layer order changed
  const listRes = await apiContext.post(`/api/svg/${drawId}/layers/list`);
  const body = await listRes.json();
  expect(body.layers[body.layers.length - 1].id).toBe('layer-bg');
});

test('reorder_layers batch operations', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  const res = await apiContext.post(`/api/svg/${drawId}/layers/reorder`, {
    data: {
      operations: [
        { layer_id: 'layer-sun', action: 'move_to_bottom' },
        { layer_id: 'layer-bg', action: 'move_to_top' },
      ],
    },
  });
  expect(res.ok()).toBeTruthy();

  const listRes = await apiContext.post(`/api/svg/${drawId}/layers/list`);
  const body = await listRes.json();
  // sun should be first, bg should be last
  expect(body.layers[0].id).toBe('layer-sun');
  expect(body.layers[body.layers.length - 1].id).toBe('layer-bg');
});
```

**Step 2: Run tests to verify they fail**

Run: `npx playwright test e2e/integration/layer-mutations.spec.ts --project=integration -g "reorder_layers"`
Expected: FAIL — route `layers/reorder` not found

**Step 3: Add `reorderLayers` method to svg-engine.ts**

Add after `moveLayer` method:

```typescript
reorderLayers(operations: Array<{
  layer_id: string;
  action: 'move_to' | 'move_up' | 'move_down' | 'move_to_top' | 'move_to_bottom';
  position?: number;
  parent_id?: string;
}>): boolean {
  for (const op of operations) {
    const element = this._findLayerElement(op.layer_id);
    if (!element) continue;

    const parent = op.parent_id
      ? this._findLayerElement(op.parent_id) || this.svgElement
      : element.parentElement || this.svgElement;

    // If changing parent, remove from current parent first
    if (op.parent_id && element.parentElement !== parent) {
      element.parentNode!.removeChild(element);
    }

    const siblings = this._getLayerChildren(parent);
    // Remove self from siblings list for positioning
    const filteredSiblings = siblings.filter((s: LElement) => s !== element);

    switch (op.action) {
      case 'move_to_top':
        element.parentNode?.removeChild(element);
        parent.appendChild(element);
        break;
      case 'move_to_bottom': {
        element.parentNode?.removeChild(element);
        const first = this._getLayerChildren(parent)[0];
        if (first) {
          parent.insertBefore(element, first);
        } else {
          parent.appendChild(element);
        }
        break;
      }
      case 'move_up': {
        const currentSiblings = this._getLayerChildren(parent);
        const idx = currentSiblings.indexOf(element);
        if (idx < currentSiblings.length - 1) {
          const next = currentSiblings[idx + 1];
          element.parentNode?.removeChild(element);
          if (next.nextElementSibling) {
            parent.insertBefore(element, next.nextElementSibling);
          } else {
            parent.appendChild(element);
          }
        }
        break;
      }
      case 'move_down': {
        const currentSiblings = this._getLayerChildren(parent);
        const idx = currentSiblings.indexOf(element);
        if (idx > 0) {
          const prev = currentSiblings[idx - 1];
          element.parentNode?.removeChild(element);
          parent.insertBefore(element, prev);
        }
        break;
      }
      case 'move_to': {
        const pos = op.position ?? 0;
        element.parentNode?.removeChild(element);
        const children = this._getLayerChildren(parent);
        if (pos >= children.length) {
          parent.appendChild(element);
        } else {
          parent.insertBefore(element, children[pos]);
        }
        break;
      }
    }
  }
  return true;
}
```

**Step 4: Add route in index.ts and MCP tool in mcp-server.ts**

Route:
```typescript
app.post('/api/svg/:drawId/layers/reorder', async (req: Request, res: Response) => {
  const { drawId } = req.params;
  const { operations } = req.body;
  if (!operations || !Array.isArray(operations)) {
    return res.status(400).json({ error: 'operations array required' });
  }
  const drawing = drawingStore.get(drawId);
  if (!drawing) return res.status(404).json({ error: 'Drawing not found' });
  const engine = new SvgEngine(drawing.svgContent);
  engine.reorderLayers(operations);
  const svg = engine.serialize();
  drawingStore.updateSvg(drawId, svg);
  broadcastSvg(drawId, svg);
  res.json({ ok: true });
});
```

MCP tool:
```typescript
server.tool(
  'reorder_layers',
  'Batch reorder layers: move to position, move up/down, move to top/bottom',
  {
    operations: z.array(z.object({
      layer_id: z.string().describe('The layer id to move'),
      action: z.enum(['move_to', 'move_up', 'move_down', 'move_to_top', 'move_to_bottom']).describe('Reorder action'),
      position: z.number().optional().describe('Target position (for move_to)'),
      parent_id: z.string().optional().describe('Move to different parent group'),
    })).describe('Array of reorder operations to apply in sequence'),
  },
  async (params) => textTool('layers/reorder', params),
);
```

**Step 5: Run tests**

Run: `npx playwright test e2e/integration/layer-mutations.spec.ts --project=integration`
Expected: All PASS

**Step 6: Commit**

```bash
git add server/svg-engine.ts server/mcp-server.ts server/index.ts e2e/integration/layer-mutations.spec.ts
git commit -m "feat: add reorder_layers for batch layer repositioning"
```

---

### Task 6: Enhanced Canvas Info and Layer List

**Files:**
- Modify: `server/svg-engine.ts` — update `getCanvasInfo` and `listLayers` return types
- Modify: `server/index.ts` — update route handlers
- Modify: `server/mcp-server.ts` — update `get_canvas_info` description
- Test: `e2e/integration/layer-api.spec.ts`

**Step 1: Write the failing test**

```typescript
test('canvas info returns enhanced layer details', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  const res = await apiContext.post(`/api/svg/${drawId}/canvas/info`);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.width).toBe(800);
  expect(body.height).toBe(800);
  expect(body.layers).toBeInstanceOf(Array);
  expect(body.layers.length).toBeGreaterThan(0);
  // Each layer summary should have visibility info
  const bgLayer = body.layers.find((l: any) => l.id === 'layer-bg');
  expect(bgLayer).toBeTruthy();
  expect(bgLayer.visible).toBe(true);
  expect(bgLayer.name).toBe('背景');
});

test('list_layers returns visibility and opacity', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  // Set opacity on sun layer
  await apiContext.post(`/api/svg/${drawId}/layers/opacity`, {
    data: { layer_id: 'layer-sun', opacity: 0.5 },
  });
  const res = await apiContext.post(`/api/svg/${drawId}/layers/list`);
  const body = await res.json();
  const sun = body.layers.find((l: any) => l.id === 'layer-sun');
  expect(sun.opacity).toBe(0.5);
  expect(sun.visible).toBe(true);
  expect(sun.hasTransform).toBe(false);
  expect(sun.hasFilter).toBe(false);
});
```

**Step 2: Run tests to verify they fail**

Run: `npx playwright test e2e/integration/layer-api.spec.ts --project=integration -g "enhanced"`
Expected: FAIL — `body.width` undefined, `body.layers` not present in canvas info

**Step 3: Update CanvasInfo interface and method in svg-engine.ts**

Update the `CanvasInfo` interface (lines 18-23):
```typescript
export interface CanvasInfo {
  viewBox: string;
  width: number;
  height: number;
  layerCount: number;
  defsCount: number;
  totalElements: number;
  layers: Array<{
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    hasFilter: boolean;
    childCount: number;
  }>;
  background: string | null;
}
```

Update `LayerInfo` interface (lines 12-16):
```typescript
export interface LayerInfo {
  id: string;
  name: string;
  children: LayerInfo[];
  visible: boolean;
  opacity: number;
  hasTransform: boolean;
  hasFilter: boolean;
}
```

Update `getCanvasInfo` method:
```typescript
getCanvasInfo(): CanvasInfo {
  const viewBox = this.svgElement.getAttribute('viewBox') || '0 0 800 800';
  const vbParts = viewBox.split(/\s+/).map(Number);
  const width = vbParts[2] || 800;
  const height = vbParts[3] || 800;

  const allElements = this.svgElement.querySelectorAll('*');
  const defs = this.svgElement.querySelector('defs');
  const defsCount = defs ? Array.from(defs.children).length : 0;

  const allLayerGroups = this.svgElement.querySelectorAll('[id^="layer-"]');
  let layerCount = 0;
  for (const child of Array.from(allLayerGroups) as LElement[]) {
    if (child.tagName.toLowerCase() === 'g') layerCount++;
  }

  // Build layer summaries from top-level layers
  const layers: CanvasInfo['layers'] = [];
  for (const child of Array.from(this.svgElement.children) as LElement[]) {
    if (this._isLayerGroup(child)) {
      const display = child.getAttribute('display');
      const pointerEvents = child.getAttribute('pointer-events');
      layers.push({
        id: child.id,
        name: child.getAttribute('data-name') || child.id,
        visible: display !== 'none',
        locked: pointerEvents === 'none',
        hasFilter: !!child.getAttribute('filter'),
        childCount: Array.from(child.querySelectorAll('*')).length,
      });
    }
  }

  // Detect background
  const bgEl = this.svgElement.querySelector('#canvas-bg');
  const background = bgEl ? (bgEl.getAttribute('fill') || null) : null;

  return { viewBox, width, height, layerCount, defsCount, totalElements: allElements.length, layers, background };
}
```

Update `_buildLayerTree` to include new fields:
```typescript
private _buildLayerTree(element: LElement): LayerInfo {
  const children: LayerInfo[] = [];
  for (const child of Array.from(element.children)) {
    if (this._isLayerGroup(child)) {
      children.push(this._buildLayerTree(child));
    }
  }
  const display = element.getAttribute('display');
  const opacityStr = element.getAttribute('opacity');
  return {
    id: element.id,
    name: element.getAttribute('data-name') || element.id,
    children,
    visible: display !== 'none',
    opacity: opacityStr !== null ? parseFloat(opacityStr) : 1,
    hasTransform: !!element.getAttribute('transform'),
    hasFilter: !!element.getAttribute('filter'),
  };
}
```

**Step 4: Run tests**

Run: `npx playwright test e2e/integration/layer-api.spec.ts --project=integration`
Expected: All PASS

**Step 5: Commit**

```bash
git add server/svg-engine.ts server/mcp-server.ts e2e/integration/layer-api.spec.ts
git commit -m "feat: enhanced canvas info with layer summaries and layer list with status"
```

---

## Phase 3: New Professional Design Capabilities

### Task 7: Canvas Background

**Files:**
- Add: `setCanvasBackground` method in `server/svg-engine.ts`
- Add: route `/api/svg/:drawId/canvas/background` in `server/index.ts`
- Add: `set_canvas_background` tool in `server/mcp-server.ts`
- Test: `e2e/integration/layer-api.spec.ts`

**Step 1: Write the failing test**

```typescript
test('set_canvas_background adds background rect', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  const res = await apiContext.post(`/api/svg/${drawId}/canvas/background`, {
    data: { color: '#ffffff' },
  });
  expect(res.ok()).toBeTruthy();
  const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
  const body = await source.json();
  expect(body.svg).toContain('id="canvas-bg"');
  expect(body.svg).toContain('fill="#ffffff"');
});

test('set_canvas_background updates existing background', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  await apiContext.post(`/api/svg/${drawId}/canvas/background`, {
    data: { color: '#ffffff' },
  });
  await apiContext.post(`/api/svg/${drawId}/canvas/background`, {
    data: { color: '#000000', opacity: 0.5 },
  });
  const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
  const body = await source.json();
  expect(body.svg).toContain('fill="#000000"');
  expect(body.svg).toContain('opacity="0.5"');
  // Should only have one canvas-bg
  const matches = body.svg.match(/id="canvas-bg"/g);
  expect(matches).toHaveLength(1);
});
```

**Step 2: Implement `setCanvasBackground` in svg-engine.ts**

```typescript
setCanvasBackground(opts: {
  color?: string;
  gradient_id?: string;
  opacity?: number;
}): boolean {
  const viewBox = this.svgElement.getAttribute('viewBox') || '0 0 800 800';
  const parts = viewBox.split(/\s+/).map(Number);
  const [vbX, vbY, vbW, vbH] = [parts[0] || 0, parts[1] || 0, parts[2] || 800, parts[3] || 800];

  let bgRect = this.svgElement.querySelector('#canvas-bg');
  if (!bgRect) {
    bgRect = this.document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('id', 'canvas-bg');
    // Insert as first child (behind all layers)
    const firstChild = this.svgElement.firstElementChild;
    // Skip defs if present
    const defs = this.svgElement.querySelector('defs');
    const insertBefore = defs ? defs.nextElementSibling : firstChild;
    if (insertBefore) {
      this.svgElement.insertBefore(bgRect, insertBefore);
    } else {
      this.svgElement.appendChild(bgRect);
    }
  }

  bgRect.setAttribute('x', String(vbX));
  bgRect.setAttribute('y', String(vbY));
  bgRect.setAttribute('width', String(vbW));
  bgRect.setAttribute('height', String(vbH));

  if (opts.color) bgRect.setAttribute('fill', opts.color);
  if (opts.gradient_id) bgRect.setAttribute('fill', `url(#${opts.gradient_id})`);
  if (opts.opacity !== undefined) bgRect.setAttribute('opacity', String(opts.opacity));

  return true;
}
```

**Step 3: Add route and MCP tool (same pattern as other routes)**

**Step 4: Run tests and commit**

```bash
git commit -m "feat: add set_canvas_background tool"
```

---

### Task 8: Align & Distribute

**Files:**
- Add: `alignDistribute` method in `server/svg-engine.ts`
- Add: route `/api/svg/:drawId/align` in `server/index.ts`
- Add: `align_distribute` tool in `server/mcp-server.ts`
- Test: new `e2e/integration/align-distribute.spec.ts`

**Step 1: Write the failing test**

Create `e2e/integration/align-distribute.spec.ts`:

```typescript
import { test, expect } from '../fixtures';

const ALIGNED_SVG = `<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <g id="layer-a" data-name="A"><rect x="50" y="100" width="100" height="80" fill="red"/></g>
  <g id="layer-b" data-name="B"><rect x="200" y="200" width="120" height="60" fill="blue"/></g>
  <g id="layer-c" data-name="C"><rect x="400" y="150" width="80" height="100" fill="green"/></g>
</svg>`;

test.describe('Align & Distribute API', () => {
  async function setup(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: ALIGNED_SVG } });
    return drawing.id;
  }

  test('align layers to left', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/align`, {
      data: {
        layer_ids: ['layer-a', 'layer-b', 'layer-c'],
        align: 'left',
      },
    });
    expect(res.ok()).toBeTruthy();
    // After left-align, all layers should start at x=50 (the leftmost)
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    // All layers should have been translated
    expect(body.svg).toContain('translate');
  });

  test('distribute layers horizontally', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/align`, {
      data: {
        layer_ids: ['layer-a', 'layer-b', 'layer-c'],
        distribute: 'horizontal',
      },
    });
    expect(res.ok()).toBeTruthy();
  });
});
```

**Step 2: Implement `alignDistribute` in svg-engine.ts**

```typescript
alignDistribute(opts: {
  layer_ids: string[];
  align?: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
  distribute?: 'horizontal' | 'vertical';
  reference?: string | 'canvas';
}): boolean {
  if (opts.layer_ids.length < 2) return false;

  // Collect bounding boxes
  const bboxes: Array<{ id: string; bbox: BBox }> = [];
  for (const id of opts.layer_ids) {
    const bbox = this.getElementBBox(id);
    if (bbox) bboxes.push({ id, bbox });
  }
  if (bboxes.length < 2) return false;

  // Determine reference bounds
  let refBbox: BBox;
  if (opts.reference === 'canvas' || !opts.reference) {
    const vb = this.svgElement.getAttribute('viewBox') || '0 0 800 800';
    const parts = vb.split(/\s+/).map(Number);
    refBbox = { x: parts[0] || 0, y: parts[1] || 0, width: parts[2] || 800, height: parts[3] || 800 };
  } else {
    const ref = this.getElementBBox(opts.reference);
    if (!ref) return false;
    refBbox = ref;
  }

  // Align
  if (opts.align) {
    for (const item of bboxes) {
      let dx = 0, dy = 0;
      switch (opts.align) {
        case 'left': dx = refBbox.x - item.bbox.x; break;
        case 'center': dx = (refBbox.x + refBbox.width / 2) - (item.bbox.x + item.bbox.width / 2); break;
        case 'right': dx = (refBbox.x + refBbox.width) - (item.bbox.x + item.bbox.width); break;
        case 'top': dy = refBbox.y - item.bbox.y; break;
        case 'middle': dy = (refBbox.y + refBbox.height / 2) - (item.bbox.y + item.bbox.height / 2); break;
        case 'bottom': dy = (refBbox.y + refBbox.height) - (item.bbox.y + item.bbox.height); break;
      }
      if (dx !== 0 || dy !== 0) {
        this.transformLayer(item.id, { translate: { x: dx, y: dy }, mode: 'compose' });
      }
    }
  }

  // Distribute
  if (opts.distribute) {
    const sorted = [...bboxes].sort((a, b) =>
      opts.distribute === 'horizontal' ? a.bbox.x - b.bbox.x : a.bbox.y - b.bbox.y,
    );
    if (sorted.length >= 3) {
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const isHoriz = opts.distribute === 'horizontal';
      const totalSpan = isHoriz
        ? (last.bbox.x + last.bbox.width) - first.bbox.x
        : (last.bbox.y + last.bbox.height) - first.bbox.y;
      const totalItemSize = sorted.reduce((sum, s) => sum + (isHoriz ? s.bbox.width : s.bbox.height), 0);
      const gap = (totalSpan - totalItemSize) / (sorted.length - 1);

      let pos = isHoriz ? first.bbox.x : first.bbox.y;
      for (let i = 0; i < sorted.length; i++) {
        const item = sorted[i];
        const currentPos = isHoriz ? item.bbox.x : item.bbox.y;
        const delta = pos - currentPos;
        if (Math.abs(delta) > 0.01) {
          const translate = isHoriz ? { x: delta, y: 0 } : { x: 0, y: delta };
          this.transformLayer(item.id, { translate, mode: 'compose' });
        }
        pos += (isHoriz ? item.bbox.width : item.bbox.height) + gap;
      }
    }
  }

  return true;
}
```

**Step 3: Add route and MCP tool, run tests, commit**

```bash
git commit -m "feat: add align_distribute tool for layer alignment and distribution"
```

---

### Task 9: Typography — create_text Tool

**Files:**
- Create: `server/typography.ts`
- Add: `createText` method in `server/svg-engine.ts`
- Add: route `/api/svg/:drawId/text/create` in `server/index.ts`
- Add: `create_text` tool in `server/mcp-server.ts`
- Test: new `e2e/integration/typography.spec.ts`

**Step 1: Create `server/typography.ts`**

```typescript
export interface TextOptions {
  text: string;
  x: number;
  y: number;
  font_family?: string;
  font_size?: number;
  font_weight?: number | string;
  font_style?: 'normal' | 'italic';
  letter_spacing?: number;
  word_spacing?: number;
  line_height?: number;
  text_anchor?: 'start' | 'middle' | 'end';
  dominant_baseline?: 'auto' | 'middle' | 'hanging';
  text_decoration?: 'none' | 'underline' | 'line-through';
  fill?: string;
  stroke?: string;
  path_id?: string;
  spans?: Array<{
    text: string;
    fill?: string;
    font_size?: number;
    font_weight?: number | string;
    dx?: number;
    dy?: number;
  }>;
}

export function buildTextElement(opts: TextOptions): string {
  const attrs: string[] = [];
  attrs.push(`x="${opts.x}"`);
  attrs.push(`y="${opts.y}"`);
  if (opts.font_family) attrs.push(`font-family="${opts.font_family}"`);
  if (opts.font_size) attrs.push(`font-size="${opts.font_size}"`);
  if (opts.font_weight) attrs.push(`font-weight="${opts.font_weight}"`);
  if (opts.font_style && opts.font_style !== 'normal') attrs.push(`font-style="${opts.font_style}"`);
  if (opts.letter_spacing) attrs.push(`letter-spacing="${opts.letter_spacing}"`);
  if (opts.word_spacing) attrs.push(`word-spacing="${opts.word_spacing}"`);
  if (opts.text_anchor) attrs.push(`text-anchor="${opts.text_anchor}"`);
  if (opts.dominant_baseline) attrs.push(`dominant-baseline="${opts.dominant_baseline}"`);
  if (opts.text_decoration && opts.text_decoration !== 'none') attrs.push(`text-decoration="${opts.text_decoration}"`);
  if (opts.fill) attrs.push(`fill="${opts.fill}"`);
  if (opts.stroke) attrs.push(`stroke="${opts.stroke}"`);

  let content = '';

  if (opts.path_id) {
    // Text along a path
    content = `<textPath href="#${opts.path_id}">${opts.text}</textPath>`;
  } else if (opts.spans && opts.spans.length > 0) {
    // Rich text with tspan
    content = opts.spans.map((span) => {
      const tspanAttrs: string[] = [];
      if (span.fill) tspanAttrs.push(`fill="${span.fill}"`);
      if (span.font_size) tspanAttrs.push(`font-size="${span.font_size}"`);
      if (span.font_weight) tspanAttrs.push(`font-weight="${span.font_weight}"`);
      if (span.dx) tspanAttrs.push(`dx="${span.dx}"`);
      if (span.dy) tspanAttrs.push(`dy="${span.dy}"`);
      return `<tspan ${tspanAttrs.join(' ')}>${span.text}</tspan>`;
    }).join('');
  } else if (opts.line_height && opts.text.includes('\n')) {
    // Multi-line text
    const lines = opts.text.split('\n');
    content = lines.map((line, i) => {
      const dy = i === 0 ? '0' : String(opts.line_height);
      return `<tspan x="${opts.x}" dy="${dy}">${line}</tspan>`;
    }).join('');
  } else {
    content = opts.text;
  }

  return `<text ${attrs.join(' ')}>${content}</text>`;
}
```

**Step 2: Write test, implement route and MCP tool, run tests, commit**

```bash
git commit -m "feat: add create_text tool for professional typography"
```

---

### Task 10: Path Operations — create_path

**Files:**
- Create: `server/path-operations.ts`
- Add: route `/api/svg/:drawId/path/create` in `server/index.ts`
- Add: `create_path` tool in `server/mcp-server.ts`
- Test: new `e2e/integration/path-operations.spec.ts`

**Step 1: Install paper dependency**

Run: `npm install paper`

**Step 2: Create `server/path-operations.ts`**

```typescript
export interface PathSpec {
  type: 'line' | 'polyline' | 'polygon' | 'arc' | 'bezier' | 'star' | 'rounded-rect';
  points?: [number, number][];
  start?: [number, number];
  end?: [number, number];
  control1?: [number, number];
  control2?: [number, number];
  radius?: number;
  inner_radius?: number;
  corners?: number;
  corner_radius?: number;
}

export function buildPathD(spec: PathSpec): string {
  switch (spec.type) {
    case 'line': {
      const [sx, sy] = spec.start || [0, 0];
      const [ex, ey] = spec.end || [100, 100];
      return `M ${sx} ${sy} L ${ex} ${ey}`;
    }
    case 'polyline': {
      if (!spec.points || spec.points.length < 2) return '';
      return `M ${spec.points.map(([x, y]) => `${x} ${y}`).join(' L ')}`;
    }
    case 'polygon': {
      if (!spec.points || spec.points.length < 3) return '';
      return `M ${spec.points.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;
    }
    case 'bezier': {
      const [sx, sy] = spec.start || [0, 0];
      const [ex, ey] = spec.end || [100, 100];
      if (spec.control2) {
        // Cubic bezier
        const [c1x, c1y] = spec.control1 || [33, 0];
        const [c2x, c2y] = spec.control2;
        return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`;
      } else if (spec.control1) {
        // Quadratic bezier
        const [cx, cy] = spec.control1;
        return `M ${sx} ${sy} Q ${cx} ${cy}, ${ex} ${ey}`;
      }
      return `M ${sx} ${sy} L ${ex} ${ey}`;
    }
    case 'arc': {
      const [sx, sy] = spec.start || [0, 0];
      const [ex, ey] = spec.end || [100, 0];
      const r = spec.radius || 50;
      return `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`;
    }
    case 'star': {
      const corners = spec.corners || 5;
      const r = spec.radius || 50;
      const ir = spec.inner_radius || r * 0.4;
      const cx = spec.start?.[0] || 0;
      const cy = spec.start?.[1] || 0;
      const points: string[] = [];
      for (let i = 0; i < corners * 2; i++) {
        const angle = (Math.PI * i) / corners - Math.PI / 2;
        const radius = i % 2 === 0 ? r : ir;
        points.push(`${cx + radius * Math.cos(angle)} ${cy + radius * Math.sin(angle)}`);
      }
      return `M ${points.join(' L ')} Z`;
    }
    case 'rounded-rect': {
      const [x, y] = spec.start || [0, 0];
      const w = spec.end ? spec.end[0] - x : 100;
      const h = spec.end ? spec.end[1] - y : 100;
      const cr = spec.corner_radius || 10;
      return `M ${x + cr} ${y} L ${x + w - cr} ${y} Q ${x + w} ${y} ${x + w} ${y + cr} L ${x + w} ${y + h - cr} Q ${x + w} ${y + h} ${x + w - cr} ${y + h} L ${x + cr} ${y + h} Q ${x} ${y + h} ${x} ${y + h - cr} L ${x} ${y + cr} Q ${x} ${y} ${x + cr} ${y} Z`;
    }
    default:
      return '';
  }
}

export function buildPathSvg(spec: PathSpec, style?: {
  fill?: string;
  stroke?: string;
  stroke_width?: number;
}): string {
  const d = buildPathD(spec);
  if (!d) return '';

  const attrs: string[] = [`d="${d}"`];
  if (style?.fill !== undefined) attrs.push(`fill="${style.fill}"`);
  else attrs.push('fill="none"');
  if (style?.stroke) attrs.push(`stroke="${style.stroke}"`);
  else attrs.push('stroke="#000000"');
  if (style?.stroke_width) attrs.push(`stroke-width="${style.stroke_width}"`);

  return `<path ${attrs.join(' ')}/>`;
}
```

**Step 3: Write tests, add route and MCP tool, run tests, commit**

```bash
git commit -m "feat: add create_path tool for shapes, beziers, stars, and rounded rects"
```

---

### Task 11: Path Editing — edit_path

**Files:**
- Add: `editPath` function in `server/path-operations.ts`
- Add: `editPathElement` method in `server/svg-engine.ts`
- Add: route `/api/svg/:drawId/path/edit` in `server/index.ts`
- Add: `edit_path` tool in `server/mcp-server.ts`
- Test: `e2e/integration/path-operations.spec.ts`

**Step 1: Implement path point parsing and editing in path-operations.ts**

```typescript
export interface PathPoint {
  command: string;
  x: number;
  y: number;
  control1?: [number, number];
  control2?: [number, number];
}

export function parsePath(d: string): PathPoint[] {
  // Parse SVG path d attribute into point array
  const points: PathPoint[] = [];
  const commands = d.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
  let cx = 0, cy = 0;
  for (const cmd of commands) {
    const type = cmd[0];
    const nums = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
    switch (type.toUpperCase()) {
      case 'M': cx = nums[0]; cy = nums[1]; points.push({ command: 'M', x: cx, y: cy }); break;
      case 'L': cx = nums[0]; cy = nums[1]; points.push({ command: 'L', x: cx, y: cy }); break;
      case 'C':
        cx = nums[4]; cy = nums[5];
        points.push({ command: 'C', x: cx, y: cy, control1: [nums[0], nums[1]], control2: [nums[2], nums[3]] });
        break;
      case 'Q':
        cx = nums[2]; cy = nums[3];
        points.push({ command: 'Q', x: cx, y: cy, control1: [nums[0], nums[1]] });
        break;
      case 'Z': points.push({ command: 'Z', x: cx, y: cy }); break;
      default: break;
    }
  }
  return points;
}

export function serializePath(points: PathPoint[]): string {
  return points.map((p) => {
    switch (p.command) {
      case 'M': return `M ${p.x} ${p.y}`;
      case 'L': return `L ${p.x} ${p.y}`;
      case 'C': return `C ${p.control1![0]} ${p.control1![1]}, ${p.control2![0]} ${p.control2![1]}, ${p.x} ${p.y}`;
      case 'Q': return `Q ${p.control1![0]} ${p.control1![1]}, ${p.x} ${p.y}`;
      case 'Z': return 'Z';
      default: return '';
    }
  }).join(' ');
}

export type PathEditOp =
  | { type: 'move_point'; index: number; x: number; y: number }
  | { type: 'add_point'; after_index: number; x: number; y: number }
  | { type: 'delete_point'; index: number }
  | { type: 'set_control'; index: number; control1?: [number, number]; control2?: [number, number] }
  | { type: 'close' }
  | { type: 'open' };

export function applyPathEdits(d: string, operations: PathEditOp[]): string {
  const points = parsePath(d);
  for (const op of operations) {
    switch (op.type) {
      case 'move_point':
        if (op.index >= 0 && op.index < points.length) {
          points[op.index].x = op.x;
          points[op.index].y = op.y;
        }
        break;
      case 'add_point':
        if (op.after_index >= 0 && op.after_index < points.length) {
          points.splice(op.after_index + 1, 0, { command: 'L', x: op.x, y: op.y });
        }
        break;
      case 'delete_point':
        if (op.index >= 0 && op.index < points.length && points.length > 2) {
          points.splice(op.index, 1);
        }
        break;
      case 'set_control':
        if (op.index >= 0 && op.index < points.length) {
          if (op.control1) {
            points[op.index].control1 = op.control1;
            if (!points[op.index].control2) {
              points[op.index].command = 'Q';
            }
          }
          if (op.control2) {
            points[op.index].control2 = op.control2;
            points[op.index].command = 'C';
          }
        }
        break;
      case 'close':
        if (points.length > 0 && points[points.length - 1].command !== 'Z') {
          points.push({ command: 'Z', x: points[0].x, y: points[0].y });
        }
        break;
      case 'open':
        if (points.length > 0 && points[points.length - 1].command === 'Z') {
          points.pop();
        }
        break;
    }
  }
  return serializePath(points);
}
```

**Step 2: Write tests, add route, add MCP tool, commit**

```bash
git commit -m "feat: add edit_path tool for point-level path editing"
```

---

### Task 12: Boolean Path Operations

**Files:**
- Add: boolean ops to `server/path-operations.ts` using paper.js
- Add: route `/api/svg/:drawId/path/boolean` in `server/index.ts`
- Add: `boolean_path` tool in `server/mcp-server.ts`
- Test: `e2e/integration/path-operations.spec.ts`

**Step 1: Implement boolean operations**

```typescript
import paper from 'paper';

// Initialize paper.js in headless mode
paper.setup(new paper.Size(800, 800));

export function booleanPathOp(
  pathD_A: string,
  pathD_B: string,
  operation: 'union' | 'subtract' | 'intersect' | 'exclude',
): string | null {
  const pathA = new paper.CompoundPath(pathD_A);
  const pathB = new paper.CompoundPath(pathD_B);

  let result: paper.PathItem;
  switch (operation) {
    case 'union': result = pathA.unite(pathB); break;
    case 'subtract': result = pathA.subtract(pathB); break;
    case 'intersect': result = pathA.intersect(pathB); break;
    case 'exclude': result = pathA.exclude(pathB); break;
  }

  const pathData = result.pathData;
  // Cleanup
  pathA.remove();
  pathB.remove();
  result.remove();

  return pathData || null;
}
```

**Step 2: Write tests, add route, add MCP tool, commit**

Note: paper.js requires canvas in Node.js. If canvas is not available, we can use a pure-JS alternative like `svg-path-commander` + `path-bool` or implement simple polygon boolean ops. Test in step 2 will reveal if paper.js works headless.

```bash
git commit -m "feat: add boolean_path tool for union/subtract/intersect/exclude"
```

---

### Task 13: Enhanced manage_defs with Gradient/Pattern Shortcuts

**Files:**
- Modify: `server/svg-engine.ts` — extend `manageDefs` method
- Modify: `server/mcp-server.ts` — update `manage_defs` tool schema
- Modify: `server/index.ts` — update `/defs/manage` route
- Test: `e2e/integration/defs-viewbox.spec.ts`

**Step 1: Write the failing test**

```typescript
test('manage_defs create_gradient creates linear gradient', async ({ apiContext }) => {
  const drawId = await setupDrawing(apiContext);
  const res = await apiContext.post(`/api/svg/${drawId}/defs/manage`, {
    data: {
      action: 'create_gradient',
      id: 'my-gradient',
      gradient_type: 'linear',
      stops: [
        { offset: '0%', color: '#ff0000' },
        { offset: '100%', color: '#0000ff' },
      ],
      x1: '0%', y1: '0%', x2: '100%', y2: '0%',
    },
  });
  expect(res.ok()).toBeTruthy();
  const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
  const body = await source.json();
  expect(body.svg).toContain('linearGradient');
  expect(body.svg).toContain('id="my-gradient"');
  expect(body.svg).toContain('#ff0000');
  expect(body.svg).toContain('#0000ff');
});
```

**Step 2: Implement gradient/pattern shortcut in manageDefs**

Extend the existing `manageDefs` method to handle `create_gradient`, `create_pattern`, `create_clip_mask` actions by building the SVG markup from structured parameters, then delegating to the existing `add` action.

```typescript
// Inside manageDefs, add new action cases:
if (action === 'create_gradient') {
  const { gradient_type, stops, x1, y1, x2, y2, cx, cy, r, fx, fy, units, spread } = params;
  const tag = gradient_type === 'radial' ? 'radialGradient' : 'linearGradient';
  const attrs: string[] = [`id="${id}"`];
  if (gradient_type === 'linear') {
    if (x1) attrs.push(`x1="${x1}"`); if (y1) attrs.push(`y1="${y1}"`);
    if (x2) attrs.push(`x2="${x2}"`); if (y2) attrs.push(`y2="${y2}"`);
  } else {
    if (cx) attrs.push(`cx="${cx}"`); if (cy) attrs.push(`cy="${cy}"`);
    if (r) attrs.push(`r="${r}"`);
    if (fx) attrs.push(`fx="${fx}"`); if (fy) attrs.push(`fy="${fy}"`);
  }
  if (units) attrs.push(`gradientUnits="${units}"`);
  if (spread) attrs.push(`spreadMethod="${spread}"`);
  const stopsHtml = (stops || []).map((s: any) => {
    let stopAttrs = `offset="${s.offset}" stop-color="${s.color}"`;
    if (s.opacity !== undefined) stopAttrs += ` stop-opacity="${s.opacity}"`;
    return `<stop ${stopAttrs}/>`;
  }).join('\n  ');
  const content = `<${tag} ${attrs.join(' ')}>\n  ${stopsHtml}\n</${tag}>`;
  return this.manageDefs('add', id, content);
}
```

**Step 3: Update MCP tool schema, run tests, commit**

```bash
git commit -m "feat: add gradient/pattern shortcuts to manage_defs"
```

---

### Task 14: Enhanced get_layer_colors (gradient penetration + HSL)

**Files:**
- Modify: `server/svg-engine.ts` — update `getLayerColors`
- Test: `e2e/integration/layer-api.spec.ts`

**Step 1: Write the failing test**

```typescript
test('get_layer_colors penetrates gradient references', async ({ apiContext }) => {
  const drawId = await setupLayeredDrawing(apiContext);
  // layer-bg uses url(#sky-gradient) — should extract stop-colors
  const res = await apiContext.post(`/api/svg/${drawId}/layers/colors`, {
    data: { layer_id: 'layer-bg' },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  const colors = body.colors;
  // Should find the gradient stop colors
  expect(colors.some((c: any) => c.color === '#87CEEB')).toBe(true);
  expect(colors.some((c: any) => c.color === '#4682B4')).toBe(true);
  // Should have HSL values
  expect(colors[0].hsl).toBeTruthy();
  expect(colors[0].hsl.h).toBeGreaterThanOrEqual(0);
});
```

**Step 2: Implement gradient penetration and HSL conversion**

Add to `getLayerColors` method: when a `fill` or `stroke` value starts with `url(#`, look up the referenced element in `<defs>`, extract `stop-color` values from gradient stops.

Add HSL conversion utility:
```typescript
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  let r = parseInt(match[1], 16) / 255;
  let g = parseInt(match[2], 16) / 255;
  let b = parseInt(match[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
```

**Step 3: Run tests, commit**

```bash
git commit -m "feat: gradient penetration and HSL output in get_layer_colors"
```

---

### Task 15: Enhanced preview_as_png (background + DPI)

**Files:**
- Modify: `server/png-renderer.ts` — add background and DPI params
- Modify: `server/index.ts` — update `/preview` route
- Modify: `server/mcp-server.ts` — update `preview_as_png` tool
- Test: `e2e/integration/preview-api.spec.ts`

**Step 1: Update renderSvgToPng to accept background and DPI**

Add `background` parameter that prepends a `<rect>` before rendering, and `dpi` that adjusts the render scale.

**Step 2: Write test, update route and MCP tool, run tests, commit**

```bash
git commit -m "feat: add background and DPI control to preview_as_png"
```

---

## Phase 4: Scratch Canvas Consolidation & MCP Server Cleanup

### Task 16: Consolidate Scratch Canvas Tools (9→2)

**Files:**
- Modify: `server/mcp-server.ts` — replace 9 scratch tools with `scratch_canvas` + `merge_scratch`
- Keep: `server/index.ts` routes unchanged (the routes work fine, only MCP tool layer changes)
- Test: `e2e/integration/scratch-api.spec.ts` (new)

**Step 1: Create consolidated `scratch_canvas` tool in mcp-server.ts**

```typescript
server.tool(
  'scratch_canvas',
  `Manage temporary scratch canvases for isolated detail work. Actions:
- create: Create new scratch canvas (returns canvasId)
- add_layer: Add a layer to scratch canvas
- update_layer: Update a layer on scratch canvas
- delete_layer: Delete a layer from scratch canvas
- list_layers: List layers on a scratch canvas
- manage_defs: CRUD defs on scratch canvas
- preview: Render scratch canvas as PNG
- list_all: List all active scratch canvases`,
  {
    action: z.enum(['create', 'add_layer', 'update_layer', 'delete_layer',
      'list_layers', 'manage_defs', 'preview', 'list_all']).describe('Operation to perform'),
    canvas_id: z.string().optional().describe('Scratch canvas ID (not needed for create/list_all)'),
    // create params
    viewBox: z.string().optional().describe('SVG viewBox for new scratch canvas'),
    background: z.string().optional().describe('Background color for new scratch canvas'),
    // layer params
    name: z.string().optional().describe('Layer name (for add_layer)'),
    content: z.string().optional().describe('SVG content (for add_layer/update_layer)'),
    layer_id: z.string().optional().describe('Layer ID (for update_layer/delete_layer)'),
    parent_id: z.string().optional().describe('Parent layer ID (for add_layer)'),
    position: z.number().optional().describe('Insert position (for add_layer)'),
    // defs params
    defs_action: z.enum(['add', 'update', 'delete']).optional().describe('Defs operation (for manage_defs)'),
    id: z.string().optional().describe('Def element ID (for manage_defs)'),
    defs_content: z.string().optional().describe('Def SVG content (for manage_defs)'),
    // preview params
    width: z.number().optional().describe('Preview width in pixels'),
  },
  async (params) => {
    const { action, canvas_id: canvasId, ...rest } = params;
    switch (action) {
      case 'create': return textTool('scratch/create', rest);
      case 'list_all': return textTool('scratch/list');
      case 'add_layer': return textTool(`scratch/${canvasId}/layers/add`, rest);
      case 'update_layer': return textTool(`scratch/${canvasId}/layers/update`, rest);
      case 'delete_layer': return textTool(`scratch/${canvasId}/layers/delete`, rest);
      case 'list_layers': return textTool(`scratch/${canvasId}/layers/list`);
      case 'manage_defs': {
        const defsParams = { action: rest.defs_action, id: rest.id, content: rest.defs_content };
        return textTool(`scratch/${canvasId}/defs/manage`, defsParams);
      }
      case 'preview': return imageTool(`scratch/${canvasId}/preview`, rest);
      default: return errorResult(400, `Unknown action: ${action}`);
    }
  },
);

server.tool(
  'merge_scratch',
  'Merge a completed scratch canvas into the main drawing. Transfers defs automatically. Deletes scratch canvas after merge.',
  {
    canvas_id: z.string().describe('Scratch canvas ID to merge'),
    layer_name: z.string().describe('Name for the merged layer'),
    transform: z.object({
      translate: z.tuple([z.number(), z.number()]).optional(),
      scale: z.number().optional(),
      rotate: z.number().optional(),
    }).optional().describe('Transform to position merged content'),
    transfer_defs: z.boolean().optional().describe('Transfer gradients/filters (default true)'),
    merge_as: z.enum(['single_layer', 'separate_layers']).optional().describe('Merge as single layer or keep separate layers'),
  },
  async ({ canvas_id: canvasId, layer_name: layerName, ...rest }) =>
    textTool(`scratch/${canvasId}/merge`, { layerName, ...rest }),
);
```

**Step 2: Remove old 9 scratch tools from mcp-server.ts (lines 547-643)**

**Step 3: Write tests, run, commit**

```bash
git commit -m "feat: consolidate 9 scratch tools into scratch_canvas + merge_scratch"
```

---

### Task 17: Remove Deprecated Tools & Final MCP Server Cleanup

**Files:**
- Modify: `server/mcp-server.ts` — remove `move_layer`, `duplicate_layer`, `apply_filter`, `apply_style_preset`, `get_svg_source`
- Modify: `server/mcp-server.ts` — add `get_svg_source` as optional param on `get_canvas_info`
- Test: Run full test suite

**Step 1: Remove deprecated tool registrations**

Remove:
- `move_layer` (lines 153-162) — replaced by `reorder_layers`
- `duplicate_layer` (lines 164-178) — replaced by `add_layer` with `source_layer_id`
- `apply_filter` (lines 308-332) — replaced by `apply_effect`
- `apply_style_preset` (lines 334-342) — replaced by `apply_effect` + `set_layer_style`
- `get_svg_source` (lines 92-97) — merge into `get_canvas_info`

**Step 2: Add `include_source` param to `get_canvas_info`**

```typescript
server.tool(
  'get_canvas_info',
  'Get canvas overview: viewBox, dimensions, layer summaries, defs count, total elements. Optionally include full SVG source.',
  {
    include_source: z.boolean().optional().describe('If true, include full SVG source in response (use sparingly on large drawings)'),
  },
  async (params) => {
    if (params.include_source) {
      // Need both canvas/info and canvas/source
      const infoRes = await callApi('canvas/info');
      const sourceRes = await callApi('canvas/source');
      if (!infoRes.ok) return errorResult(infoRes.status, infoRes.error!);
      if (!sourceRes.ok) return errorResult(sourceRes.status, sourceRes.error!);
      const data = { ...(infoRes.data as object), ...(sourceRes.data as object) };
      return textResult(data);
    }
    return textTool('canvas/info');
  },
);
```

**Step 3: Keep backend routes for backward compatibility**

The old routes (`/layers/move`, `/layers/duplicate`, `/filter/apply`, `/style/apply`, `/canvas/source`) stay in `index.ts` as internal API endpoints — they may be used by custom tools/pipelines. Only the MCP tool layer changes.

**Step 4: Run full test suite**

Run: `npx playwright test --project=integration`
Expected: All PASS (old route tests still work, new MCP tool names tested separately)

**Step 5: Commit**

```bash
git add server/mcp-server.ts
git commit -m "feat: remove deprecated MCP tools, consolidate get_svg_source into get_canvas_info"
```

---

### Task 18: Update CLAUDE.md Documentation

**Files:**
- Modify: `CLAUDE.md` — update tool count, tool list, architecture description

**Step 1: Update the "34+ MCP tools" references** to reflect the new 38-tool count and new tool names.

**Step 2: Update the tool categories list** to match the new taxonomy.

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for MCP tools redesign"
```

---

### Task 19: Final Integration Test Run & Fix

**Step 1: Run full integration test suite**

Run: `npx playwright test --project=integration`

**Step 2: Fix any failing tests** — tests that reference old tool names or expect old behavior need updating.

**Step 3: Commit fixes**

```bash
git commit -m "fix: update integration tests for MCP tools redesign"
```

---

## Summary

| Phase | Tasks | What It Delivers |
|-------|-------|------------------|
| **1: Foundation** | Tasks 1-3 | Transform composition, effect chaining, incremental styles |
| **2: Layer Refactor** | Tasks 4-6 | source_layer_id duplication, batch reorder, enhanced queries |
| **3: New Capabilities** | Tasks 7-15 | Background, align/distribute, typography, path ops, gradients, color HSL, preview DPI |
| **4: Cleanup** | Tasks 16-19 | Scratch consolidation, deprecated tool removal, docs update, test fixes |

**Total tasks: 19**
**Estimated tool count after: 38 (25 core + 2 scratch + 11 bootstrap/phase2)**
**New dependencies: paper (paper.js)**
