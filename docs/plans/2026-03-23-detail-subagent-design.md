# Detail Sub-Agent Architecture Design

## Problem

SVG Artist's single-agent approach produces good overall composition but lacks detail precision. Complex elements like eyes, mouths, hands, and textures require focused attention that gets diluted when the main agent juggles overall composition and fine details simultaneously.

## Solution

A detail sub-agent system where a specialized `detail-painter` agent works on isolated scratch canvases. The main agent orchestrates: dispatching detail tasks, reviewing results, and merging approved work into the main canvas.

## Architecture

```
Claude CLI (Main Agent)
    │
    ├── Overall composition (layers, layout, backgrounds)
    │
    ├── dispatch detail-painter (eye task)
    │   ├── create_scratch_canvas(viewBox="0 0 120 80")
    │   ├── scratch_add_layer(canvasId, "iris", "<circle.../>")
    │   ├── scratch_add_layer(canvasId, "pupil", "<circle.../>")
    │   ├── scratch_preview(canvasId) → self-review PNG
    │   └── returns canvasId to main agent
    │
    ├── Main agent: preview_scratch(canvasId) → review PNG
    ├── Main agent: merge_scratch(canvasId, "eyes", {translate, scale})
    │   → scratch layers wrapped in <g>, inserted into main canvas
    │
    ├── dispatch detail-painter (mouth task) → same flow
    │
    └── Final composition adjustments
```

### Key Design Decisions

1. **Claude Code plugin agent** — Uses existing `agents/` mechanism in `--plugin-dir`, no new CLI processes needed
2. **Scratch canvas isolation** — Each sub-agent gets an independent in-memory SVG document via `ScratchCanvasStore`
3. **Main agent retains merge control** — Sub-agent cannot call `merge_scratch_canvas`; main agent reviews via PNG preview before merging
4. **Single agent + multiple skills** — One `detail-painter` agent with domain-specific skills (facial-details, hand-details, hair-details, texture-details) rather than one agent per body part
5. **Defs auto-migration** — On merge, scratch defs (gradients, filters) transfer to main canvas with auto-prefixed IDs to avoid conflicts

## New MCP Tools (7)

### 1. `create_scratch_canvas`
- **Input:** `viewBox: string`, `background?: string`
- **Output:** `canvasId: string`, `viewBox: string`
- Creates an in-memory SVG document with the given viewBox
- Canvas is associated with the current drawId

### 2. `scratch_add_layer`
- **Input:** `canvasId: string`, `name: string`, `content: string`, `parentId?: string`, `position?: number`
- **Output:** `layerId: string`
- Delegates to existing `SvgEngine.addLayer()` on the scratch canvas instance

### 3. `scratch_update_layer`
- **Input:** `canvasId: string`, `layerId: string`, `content: string`
- **Output:** `success: boolean`
- Delegates to existing `SvgEngine.updateLayer()`

### 4. `scratch_list_layers`
- **Input:** `canvasId: string`
- **Output:** `layers: Array<{id, name, childCount}>`
- Delegates to existing `SvgEngine.listLayers()`

### 5. `scratch_preview`
- **Input:** `canvasId: string`, `width?: number` (default 400)
- **Output:** `image: string` (base64 PNG)
- Uses existing `PngRenderer` on scratch canvas SVG

### 6. `merge_scratch_canvas`
- **Input:** `canvasId: string`, `layerName: string`, `transform?: {translate?, scale?, rotate?}`, `transferDefs?: boolean` (default true)
- **Output:** `layerId: string`, `defsTransferred: number`
- Wraps all scratch layers in a single `<g>` with transform
- Migrates defs with auto-prefixed IDs
- Inserts into main canvas, then deletes scratch canvas

### 7. `list_scratch_canvases`
- **Input:** (none, uses current drawId)
- **Output:** `canvases: Array<{canvasId, viewBox, layerCount, createdAt}>`
- Lists all active scratch canvases for this drawing

## Agent Definition

### `plugins/svg-drawing/agents/detail-painter.md`

```yaml
---
name: detail-painter
model: sonnet
description: >
  Specialized sub-agent for drawing fine details on isolated scratch canvases.
  Excels at eyes, mouths, hands, hair, textures, and other elements requiring
  high precision. Works independently on a scratch canvas, returns canvasId
  for main agent to review and merge.
allowedTools:
  - create_scratch_canvas
  - scratch_add_layer
  - scratch_update_layer
  - scratch_list_layers
  - scratch_preview
  - manage_defs
---
```

Note: `merge_scratch_canvas` is intentionally NOT in allowedTools — only the main agent can merge.

## Detail Skills (new)

### `skills/facial-details/SKILL.md`
- Eye anatomy: iris layers (gradient + texture), pupil reflection, eyelash curves, sclera gradient
- Lip structure: upper/lower lip arc contrast, lip texture, highlight points, teeth layers
- Nose: light/shadow suggestion, nostril arcs
- Ears: auricle structure

### `skills/hand-details/SKILL.md`
- Finger proportions, joint suggestions, nail details
- Grip poses, gesture references

### `skills/hair-details/SKILL.md`
- Hair strand groups, layered gradients, highlight bands
- Style-specific techniques (anime, realistic, stylized)

### `skills/texture-details/SKILL.md`
- Fabric folds, leather texture, metallic reflection
- Pattern fills, noise-based textures

## Backend Implementation

### ScratchCanvasStore (`server/scratch-canvas-store.ts`)

```typescript
class ScratchCanvasStore {
  private canvases: Map<string, {
    svgEngine: SvgEngine,
    drawId: string,
    createdAt: number,
    viewBox: string
  }>

  create(drawId: string, viewBox: string, background?: string): string  // returns canvasId
  get(canvasId: string): SvgEngine | null
  list(drawId: string): ScratchCanvasInfo[]
  delete(canvasId: string): void
  cleanup(maxAgeMs?: number): void  // default 30 minutes
}
```

- In-memory only (not persisted to drawings.json)
- canvasId format: `scratch-{nanoid(8)}`
- Periodic cleanup via setInterval (every 5 minutes, removes canvases older than 30 min)

### API Routes

All mounted under existing drawId namespace:

```
POST /api/svg/:drawId/scratch/create
POST /api/svg/:drawId/scratch/:canvasId/layers/add
POST /api/svg/:drawId/scratch/:canvasId/layers/update
POST /api/svg/:drawId/scratch/:canvasId/layers/list
POST /api/svg/:drawId/scratch/:canvasId/preview
POST /api/svg/:drawId/scratch/:canvasId/merge
GET  /api/svg/:drawId/scratch/list
```

### Defs Migration on Merge

1. Scan all elements in scratch `<defs>`
2. For each element with an `id`, prefix it: `grad1` → `scratch-{canvasId}-grad1`
3. Update all references in scratch SVG content (`url(#grad1)` → `url(#scratch-xxx-grad1)`)
4. Copy defs elements to main canvas `<defs>`
5. Copy layer `<g>` elements to main canvas

### MCP Server Changes (`server/mcp-server.ts`)

Add 7 new tool definitions to the MCP server's tool list. Each tool:
1. Receives params via MCP stdin/stdout
2. POSTs to Express backend scratch API route
3. Returns result to Claude

## Error Handling

| Scenario | Handling |
|----------|----------|
| canvasId not found | 404 + clear error message |
| Scratch canvas > 30 min old | Auto-cleanup, return error if accessed |
| SVG content > 50KB per scratch | Reject with size limit error |
| Sub-agent crashes without returning canvasId | Main agent calls `list_scratch_canvases` to find orphaned canvases |
| Defs ID collision | Auto-prefix guarantees uniqueness |
| Drawing deleted while scratch exists | Cleanup all scratch canvases for that drawId |

## Example Workflow

```
User: "Draw an anime girl portrait"

Main Agent:
1. Set viewBox 0 0 400 500
2. add_layer("background", gradient sky)
3. add_layer("hair-back", rough hair shape)
4. add_layer("face", oval shape)

5. dispatch detail-painter:
   "Draw a pair of anime-style eyes on a 120x80 canvas.
    Large irises with deep blue color, star-shaped highlights,
    long curved eyelashes. Refer to facial-details skill."

6. detail-painter works:
   - create_scratch_canvas("0 0 120 80")
   - scratch_add_layer("left-eye-white", sclera ellipse)
   - scratch_add_layer("left-eye-iris", gradient circle with texture)
   - scratch_add_layer("left-eye-pupil", dark circle)
   - scratch_add_layer("left-eye-highlight", white star shapes)
   - scratch_add_layer("right-eye-*", mirror of left)
   - scratch_preview → self-check, iterate if needed
   - Returns canvasId

7. Main agent:
   - preview_scratch(canvasId) → review PNG
   - merge_scratch(canvasId, "eyes", {translate: [140, 160], scale: 0.9})

8. Repeat for mouth, hair details, accessories...
9. Final adjustments: overall color harmony, shadows, highlights
```

## File Changes Summary

### New files:
- `server/scratch-canvas-store.ts` — ScratchCanvasStore class
- `plugins/svg-drawing/agents/detail-painter.md` — Detail painter agent
- `plugins/svg-drawing/skills/facial-details/SKILL.md` — Facial detail techniques
- `plugins/svg-drawing/skills/hand-details/SKILL.md` — Hand detail techniques
- `plugins/svg-drawing/skills/hair-details/SKILL.md` — Hair detail techniques
- `plugins/svg-drawing/skills/texture-details/SKILL.md` — Texture detail techniques

### Modified files:
- `server/mcp-server.ts` — Add 7 scratch canvas tool definitions
- `server/index.ts` — Add scratch canvas API routes, initialize ScratchCanvasStore
- `mcp-config.json` — No changes needed (tools auto-register in MCP server)

### Test files:
- `e2e/integration/scratch-canvas-api.spec.ts` — Scratch canvas CRUD + merge tests
