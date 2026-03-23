# Agent Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the SVG Artist agent from a process-following operator into a professional artist with aesthetic judgment, enhanced style tools, and efficient prompts.

**Architecture:** Three parallel workstreams: (1) Rewrite system prompt and dynamic prompt in `pty-manager.ts`, (2) Enhance MCP tool definitions in `mcp-server.ts` and backend in `svg-engine.ts`/`index.ts`, (3) Add integration tests for new capabilities.

**Tech Stack:** TypeScript, node-pty, @modelcontextprotocol/sdk, linkedom, Playwright, zod

---

### Task 1: Rewrite System Prompt — Artist Persona

**Files:**
- Modify: `server/pty-manager.ts:65-106` (the `systemPrompt` array)

**Step 1: Replace the systemPrompt string**

In `server/pty-manager.ts`, replace lines 65-106 (the entire `const systemPrompt = [...]` block) with:

```typescript
    const systemPrompt = [
      'You are a master SVG artist and professional designer with deep expertise in',
      'visual composition, color theory, typography, and illustration. You create',
      'artwork that is intentional, polished, and emotionally resonant.',
      '',
      '## Your Creative Philosophy',
      '- Every artwork tells a story. Before drawing, understand the *essence* —',
      '  its mood, its message, its soul. A sunset is not just orange circles;',
      '  it\'s warmth, transition, stillness.',
      '- Simplicity is sophistication. SVG\'s power is clean, purposeful geometry.',
      '  Remove everything that doesn\'t serve the composition.',
      '- Colors should feel *inevitable* — each one chosen for a reason, working',
      '  in harmony. 3-5 well-chosen colors beat a rainbow every time.',
      '- Composition creates emotion. Where you place elements, how they relate,',
      '  what you leave empty — this IS the art.',
      '- Know the rules, then know when to break them. The rule of thirds is a',
      '  starting point, not a cage.',
      '',
      '## How You Work',
      '',
      '### Receiving a Request',
      '- Simple requests (single element, clear spec) → draw immediately',
      '- Complex scenes → briefly outline your approach, then execute',
      '- Vague requests → ask 1-2 focused questions, offer concrete options',
      '- Style-specific or complex subjects → research references first using',
      '  the design-advisor agent, then present 2-3 approaches for user selection',
      '',
      '### Your Drawing Process',
      '1. **Visualize**: Form a mental image. What is the focal point? The mood?',
      '   The style that fits best? Sketch the composition in your mind.',
      '2. **Structure**: Plan layers (background → midground → foreground →',
      '   details → effects). Every layer has a purpose and a meaningful name.',
      '3. **Palette**: Choose 3-5 harmonious colors with clear roles.',
      '   Use get_color_palette for inspiration, but trust your trained eye.',
      '4. **Build**: Execute layer by layer, background first.',
      '   - Gradients/patterns → manage_defs first, reference by url(#id)',
      '   - Repeated elements → duplicate_layer + transform_layer',
      '   - Complex effects → apply_filter or craft custom filters in defs',
      '5. **Review**: After major milestones, preview_as_png to see your work',
      '   as the user sees it. Be your own harshest critic:',
      '   - Does the focal point draw the eye?',
      '   - Is color harmony working? Any jarring notes?',
      '   - Is there enough contrast and visual hierarchy?',
      '   - Does the negative space breathe?',
      '   - Would a real designer be proud of this?',
      '6. **Refine**: Fix what bothers you. Use critique_composition for a',
      '   structured second opinion. Don\'t blindly follow scores — your eye',
      '   is the final judge. Iterate until it feels *right*.',
      '',
      '### Quality Standards',
      '- Meaningful layer names: layer-sky, layer-mountain-range, layer-sun-glow',
      '- ALL reusable resources (gradients, filters, patterns) go in defs',
      '- Prefer update_layer over full rebuild — preserve structure',
      '- Self-review with preview_as_png after every 3-4 operations',
      '- Don\'t settle for "okay". Push for "great".',
      '',
      '### SVG Technical Constraints',
      '- PNG preview is rendered by resvg-js (SVG 1.1). No CSS animations,',
      '  JavaScript, foreignObject, or CSS custom properties in rendered output.',
      '- Text uses system fonts only. Stick to generic families (serif,',
      '  sans-serif, monospace) or convert important text to <path>.',
      '- Heavy filter chains (5+ primitives) slow rendering. Keep filters focused.',
      '- Large drawings (100+ elements) need layer grouping for organization.',
      '',
      '### Self-Improvement',
      'When your current tools can\'t express your vision:',
      '- list_bootstrap_assets to check existing custom tools',
      '- write_filter / write_style / write_skill to create what you need',
      '- Batch writes, then reload_session once to apply all changes',
    ].join('\n');
```

**Step 2: Verify no syntax errors**

Run: `npx tsx --no-warnings server/pty-manager.ts 2>&1 | head -5` — should not show TS/syntax errors (will exit because it's not the entry point, but no compile errors means success).

**Step 3: Commit**

```bash
git add server/pty-manager.ts
git commit -m "feat: rewrite system prompt with artist persona and creative philosophy"
```

---

### Task 2: Slim Down Dynamic Prompt (buildDynamicPrompt)

**Files:**
- Modify: `server/pty-manager.ts:150-193` (the `buildDynamicPrompt` method)

**Step 1: Replace the buildDynamicPrompt method body**

Replace the `base` array inside `buildDynamicPrompt()` (lines 151-186) with:

```typescript
    const base = [
      'Layer conventions:',
      '- Name format: layer-<description> (e.g., layer-sky, layer-tree-1)',
      '- Build order: background → midground → foreground → details → effects',
      '- All gradients/filters/patterns belong in <defs>, reference by url(#id)',
      '',
      'Skill loading:',
      '- Always load layer-workflow first for any drawing task',
      '- Load additional skills matching the task:',
      '  composition (scenes), character-illustration (figures),',
      '  materials-and-textures (realistic rendering),',
      '  svg-filters-and-effects (visual effects),',
      '  illustration-styles (style guides),',
      '  bezier-and-curves (organic shapes),',
      '  advanced-color-composition (complex color/layout)',
    ].join('\n');
```

The rest of the method (lines 188-193, extension loading) stays as-is.

**Step 2: Verify no syntax errors**

Run: `npx tsx --no-warnings server/pty-manager.ts 2>&1 | head -5`

**Step 3: Commit**

```bash
git add server/pty-manager.ts
git commit -m "feat: slim down dynamic prompt, remove redundant tool descriptions"
```

---

### Task 3: Enhance `set_layer_style` MCP Tool — Schema

**Files:**
- Modify: `server/mcp-server.ts:209-219` (the `set_layer_style` tool definition)

**Step 1: Replace the set_layer_style tool definition**

Replace the current `set_layer_style` tool (lines 209-219) with the enhanced version:

```typescript
server.tool(
  'set_layer_style',
  'Set visual style attributes on a layer. Supports fill, stroke, blend modes, filter/clip/mask references, and more.',
  {
    layer_id: z.string().describe('The layer id'),
    fill: z.string().optional().describe('Fill color, gradient url(#id), or "none"'),
    stroke: z.string().optional().describe('Stroke color or "none"'),
    stroke_width: z.number().optional().describe('Stroke width'),
    stroke_linecap: z.enum(['butt', 'round', 'square']).optional().describe('Line cap shape'),
    stroke_linejoin: z.enum(['miter', 'round', 'bevel']).optional().describe('Line join shape'),
    stroke_dasharray: z.string().optional().describe('Dash pattern, e.g. "5 3" or "10 5 2 5"'),
    stroke_opacity: z.number().optional().describe('Stroke opacity 0-1'),
    fill_opacity: z.number().optional().describe('Fill opacity 0-1'),
    mix_blend_mode: z.enum([
      'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
      'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion',
    ]).optional().describe('CSS blend mode for layer compositing'),
    filter_ref: z.string().optional().describe('Filter reference, e.g. "url(#my-filter)"'),
    clip_path: z.string().optional().describe('Clip path reference, e.g. "url(#my-clip)"'),
    mask_ref: z.string().optional().describe('Mask reference, e.g. "url(#my-mask)"'),
  },
  async (params) => textTool('layers/style', params),
);
```

**Step 2: Verify compilation**

Run: `npx tsx --no-warnings server/mcp-server.ts 2>&1 | head -5`

**Step 3: Commit**

```bash
git add server/mcp-server.ts
git commit -m "feat: enhance set_layer_style with blend modes, dash arrays, filter/clip/mask refs"
```

---

### Task 4: Enhance `set_layer_style` Backend — SVG Engine

**Files:**
- Modify: `server/svg-engine.ts:294-303` (the `setLayerStyle` method)

**Step 1: Update `setLayerStyle` to handle special attribute mappings**

The current `setLayerStyle` method already converts `_` to `-` and sets attributes generically. This works for most new parameters out of the box because:

- `stroke_linecap` → `stroke-linecap` ✓
- `stroke_linejoin` → `stroke-linejoin` ✓
- `stroke_dasharray` → `stroke-dasharray` ✓
- `stroke_opacity` → `stroke-opacity` ✓
- `fill_opacity` → `fill-opacity` ✓
- `stroke_width` → `stroke-width` ✓
- `fill` → `fill` ✓
- `stroke` → `stroke` ✓

However, we need special handling for:
- `mix_blend_mode` → needs to be set as `style` attribute (`mix-blend-mode: value`)
- `filter_ref` → needs to map to attribute `filter`
- `clip_path` → needs to map to attribute `clip-path`
- `mask_ref` → needs to map to attribute `mask`

Replace the `setLayerStyle` method:

```typescript
  /** Set style attributes on a layer <g> element */
  setLayerStyle(layerId: string, styles: Record<string, string | number>): boolean {
    const g = this._findLayerElement(layerId);
    if (!g) return false;

    // Special attribute mappings
    const specialMappings: Record<string, string> = {
      filter_ref: 'filter',
      mask_ref: 'mask',
      clip_path: 'clip-path',
    };

    for (const [key, value] of Object.entries(styles)) {
      if (key === 'layer_id') continue; // skip the id param

      if (key === 'mix_blend_mode') {
        // mix-blend-mode must be set via style attribute
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

**Step 2: Verify compilation**

Run: `npx tsx --no-warnings server/svg-engine.ts 2>&1 | head -5`

**Step 3: Commit**

```bash
git add server/svg-engine.ts
git commit -m "feat: handle special style mappings (blend mode, filter/clip/mask refs) in setLayerStyle"
```

---

### Task 5: Write Failing Tests for Enhanced `set_layer_style`

**Files:**
- Modify: `e2e/integration/layer-transform-style.spec.ts` (add new tests at end)

**Step 1: Add tests for new style attributes**

Append before the closing `});` of the describe block:

```typescript
  test('set_layer_style sets stroke-dasharray', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-bg', stroke: 'black', stroke_width: 2, stroke_dasharray: '5 3' },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('stroke-dasharray="5 3"');
  });

  test('set_layer_style sets stroke-linecap and stroke-linejoin', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-sun', stroke: '#000', stroke_linecap: 'round', stroke_linejoin: 'bevel' },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('stroke-linecap="round"');
    expect(svg).toContain('stroke-linejoin="bevel"');
  });

  test('set_layer_style sets mix-blend-mode via style attribute', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-sun', mix_blend_mode: 'multiply' },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('mix-blend-mode: multiply');
  });

  test('set_layer_style sets filter_ref as filter attribute', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-sun', filter_ref: 'url(#my-filter)' },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('filter="url(#my-filter)"');
  });

  test('set_layer_style sets clip-path and mask', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-bg', clip_path: 'url(#clip-1)', mask_ref: 'url(#mask-1)' },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('clip-path="url(#clip-1)"');
    expect(svg).toContain('mask="url(#mask-1)"');
  });

  test('set_layer_style sets fill-opacity and stroke-opacity', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-sun', fill_opacity: 0.5, stroke_opacity: 0.8 },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('fill-opacity="0.5"');
    expect(svg).toContain('stroke-opacity="0.8"');
  });
```

**Step 2: Run all tests to verify new ones pass**

Run: `npx playwright test e2e/integration/layer-transform-style.spec.ts --project=integration`

Expected: All tests PASS (including the existing 4 and the new 6).

**Step 3: Commit**

```bash
git add e2e/integration/layer-transform-style.spec.ts
git commit -m "test: add integration tests for enhanced set_layer_style (blend mode, dash, clip, mask)"
```

---

### Task 6: Improve `apply_filter` Tool Description

**Files:**
- Modify: `server/mcp-server.ts:289-303` (the `apply_filter` tool definition)

**Step 1: Replace the apply_filter description with per-filter param specs**

Replace lines 289-303:

```typescript
server.tool(
  'apply_filter',
  `Apply a preset filter effect to a layer. Each filter accepts specific parameters:
- drop-shadow: dx (4), dy (4), blur (6), color ("#000000"), opacity (0.5)
- blur: radius (5)
- glow: radius (10), color ("#ffffff"), opacity (0.8)
- emboss: strength (2)
- noise-texture: frequency (0.65), octaves (3), type ("fractalNoise")
- paper: frequency (0.04), intensity (0.15)
- watercolor: displacement (20), blur (3)
- metallic: shininess (30), light_x (200), light_y (100)
- glass: shininess (50), opacity (0.3)
Values in parentheses are defaults. Pass params as key-value pairs.`,
  {
    layer_id: z.string().describe('The layer id to apply the filter to'),
    filter_type: z.enum([
      'drop-shadow', 'blur', 'glow', 'emboss', 'noise-texture',
      'paper', 'watercolor', 'metallic', 'glass',
    ]).describe('Type of filter to apply'),
    params: z.record(z.string(), z.union([z.number(), z.string()])).optional().describe(
      'Filter-specific parameters (see description for each filter type)',
    ),
  },
  async (params) => textTool('filter/apply', params),
);
```

**Step 2: Verify compilation**

Run: `npx tsx --no-warnings server/mcp-server.ts 2>&1 | head -5`

**Step 3: Commit**

```bash
git add server/mcp-server.ts
git commit -m "feat: add per-filter parameter specs to apply_filter tool description"
```

---

### Task 7: Add `get_layer_colors` — SVG Engine Method

**Files:**
- Modify: `server/svg-engine.ts` (add `getLayerColors` method after `setLayerStyle`)

**Step 1: Write the failing test first**

Create a test in a new file or append to existing. Append to `e2e/integration/layer-api.spec.ts` before the closing `});`:

First, read the current end of the file to know where to append.

Add this test:

```typescript
  test('get_layer_colors extracts colors from layer content', async ({ apiContext }) => {
    // Create a drawing with a layer containing multiple colors
    const createRes = await apiContext.post('/api/drawings');
    const drawing = await createRes.json();
    const drawId = drawing.id;

    const colorSvg = `<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <g id="layer-colorful" data-name="colorful">
        <rect x="0" y="0" width="400" height="400" fill="#ff0000" stroke="#00ff00"/>
        <circle cx="200" cy="200" r="50" fill="#0000ff"/>
        <ellipse cx="600" cy="600" rx="100" ry="50" fill="rgb(255,128,0)" stroke="#purple"/>
      </g>
    </svg>`;
    await apiContext.post(`/api/svg/${drawId}`, { data: { svg: colorSvg } });

    const res = await apiContext.post(`/api/svg/${drawId}/layers/colors`, {
      data: { layer_id: 'layer-colorful' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.colors).toBeDefined();
    expect(body.colors.length).toBeGreaterThanOrEqual(3);
    // Should find the hex colors
    const hexColors = body.colors.map((c: any) => c.color);
    expect(hexColors).toContain('#ff0000');
    expect(hexColors).toContain('#00ff00');
    expect(hexColors).toContain('#0000ff');
  });
```

**Step 2: Run test — expect FAIL (route not found)**

Run: `npx playwright test e2e/integration/layer-api.spec.ts --project=integration -g "get_layer_colors"`

Expected: FAIL with 404.

**Step 3: Add `getLayerColors` method to SvgEngine**

Add this method to `server/svg-engine.ts` after the `setLayerStyle` method (after line 303):

```typescript
  /** Extract all colors used in a layer's content */
  getLayerColors(layerId: string): Array<{ color: string; usage: string; element: string }> | null {
    const element = this._findLayerElement(layerId);
    if (!element) return null;

    const colors: Array<{ color: string; usage: string; element: string }> = [];
    const seen = new Set<string>();

    const colorAttrs = ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color'];
    const allChildren = element.querySelectorAll('*');
    const elements = [element, ...Array.from(allChildren) as LElement[]];

    for (const el of elements) {
      const tag = el.tagName?.toLowerCase() || 'unknown';
      for (const attr of colorAttrs) {
        const value = el.getAttribute(attr);
        if (value && value !== 'none' && !value.startsWith('url(')) {
          const key = `${value}:${attr}`;
          if (!seen.has(key)) {
            seen.add(key);
            colors.push({ color: value, usage: attr, element: tag });
          }
        }
      }

      // Also check inline style for color properties
      const style = el.getAttribute('style') || '';
      if (style) {
        for (const attr of colorAttrs) {
          const regex = new RegExp(`${attr}\\s*:\\s*([^;]+)`);
          const match = style.match(regex);
          if (match) {
            const value = match[1].trim();
            if (value !== 'none' && !value.startsWith('url(')) {
              const key = `${value}:${attr}:style`;
              if (!seen.has(key)) {
                seen.add(key);
                colors.push({ color: value, usage: `${attr} (inline)`, element: tag });
              }
            }
          }
        }
      }
    }

    return colors;
  }
```

**Step 4: Add route in `server/index.ts`**

Add after the `/api/svg/:drawId/layers/style` route (after line 326):

```typescript
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
```

**Step 5: Add MCP tool definition in `server/mcp-server.ts`**

Add after the `get_svg_source` tool (after line 97), in the Information Query section:

```typescript
server.tool(
  'get_layer_colors',
  'Extract all colors used in a layer (fills, strokes, stop-colors). Returns color values with usage context for palette consistency checks.',
  { layer_id: z.string().describe('The layer id to analyze') },
  async ({ layer_id }) => textTool('layers/colors', { layer_id }),
);
```

**Step 6: Run the failing test — expect PASS now**

Run: `npx playwright test e2e/integration/layer-api.spec.ts --project=integration -g "get_layer_colors"`

Expected: PASS

**Step 7: Run full test suite to verify no regressions**

Run: `npx playwright test --project=integration`

Expected: All tests PASS

**Step 8: Commit**

```bash
git add server/svg-engine.ts server/index.ts server/mcp-server.ts e2e/integration/layer-api.spec.ts
git commit -m "feat: add get_layer_colors MCP tool for palette consistency checks"
```

---

### Task 8: Run Full Test Suite and Verify

**Files:** None (verification only)

**Step 1: Run all integration tests**

Run: `npx playwright test --project=integration`

Expected: All tests PASS with 0 failures.

**Step 2: Verify MCP server starts without errors**

Run: `echo '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}' | SVG_CALLBACK_URL=http://localhost:3000/api/svg npx tsx server/mcp-server.ts 2>/dev/null | head -1`

Expected: JSON response with server capabilities (no errors).

**Step 3: Update CLAUDE.md if needed**

Check if the MCP tool count changed (28 → 29 with `get_layer_colors`). Update the count in `CLAUDE.md` where it says "28 MCP tools" to "29 MCP tools". Also update references to the tool list.

**Step 4: Commit docs update**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for 29 MCP tools and revised system prompt"
```
