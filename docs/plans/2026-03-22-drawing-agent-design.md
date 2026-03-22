# Drawing Agent & Layer System Design

## Overview

Enhance SVG Artist from a simple single-tool drawing app into a professional drawing agent with layer management, self-review via PNG preview, reference image search, and structured drawing skills — all delivered through Claude CLI's native plugin and MCP capabilities.

## Architecture

```
Claude CLI (spawn via node-pty)
│
├── --plugin-dir ./plugins/svg-drawing/     ← Drawing plugin (skills + agents + commands)
│     ├── .claude-plugin/plugin.json
│     ├── skills/                           Drawing techniques
│     │   ├── svg-fundamentals/SKILL.md
│     │   ├── bezier-and-curves/SKILL.md
│     │   ├── color-and-gradients/SKILL.md
│     │   ├── composition/SKILL.md
│     │   └── layer-workflow/SKILL.md
│     ├── agents/
│     │   └── reference-searcher.md         Reference image search sub-agent
│     └── commands/
│         └── reference.md                  /reference slash command
│
├── --mcp-config mcp-config.json            ← MCP tools (19 tools)
│     svg-artist server provides all layer/canvas/preview tools
│
├── --allowedTools 'mcp__svg-artist__*,WebSearch,WebFetch'
│
├── --append-system-prompt '...'            ← Layer usage guide
│
└── --system-prompt '...'                   ← Artist role definition
```

**Core principle: Plugin manages "knowledge & roles", MCP manages "actions & tools".**

## MCP Tool Set (19 tools)

### Information Query (3)

| Tool | Parameters | Returns | Description |
|------|-----------|---------|-------------|
| `get_canvas_info` | — | `{viewBox, layerCount, defsCount, totalElements}` | Canvas overview for Claude to understand current state |
| `get_element_bbox` | `element_id: string` | `{x, y, width, height}` | Bounding box for precise layout positioning |
| `get_svg_source` | — | Complete SVG string | Full SVG source (use sparingly on large drawings) |

### Layer Management (7)

| Tool | Parameters | Returns | Description |
|------|-----------|---------|-------------|
| `list_layers` | — | `{id, name, children}[]` tree | Layer tree structure overview |
| `get_layer` | `layer_id: string` | Layer innerHTML SVG content | Read single layer content |
| `add_layer` | `name: string, content: string, parent_id?: string, position?: number` | `{ok, layer_id}` | Insert new `<g>` layer |
| `update_layer` | `layer_id: string, content: string` | `{ok, layer_id}` | Replace layer innerHTML |
| `delete_layer` | `layer_id: string` | `{ok}` | Remove layer |
| `move_layer` | `layer_id: string, target_parent_id?: string, position: number` | `{ok}` | Reorder or reparent layer |
| `duplicate_layer` | `layer_id: string, new_name?: string, transform?: object` | `{ok, new_layer_id}` | Clone layer with optional transform |

### Transform & Style (3)

| Tool | Parameters | Returns | Description |
|------|-----------|---------|-------------|
| `transform_layer` | `layer_id: string, translate?: {x,y}, scale?: {x,y}, rotate?: {angle, cx?, cy?}` | `{ok}` | Apply transform without rewriting content |
| `set_layer_opacity` | `layer_id: string, opacity: number` | `{ok}` | Set layer opacity (0~1) |
| `set_layer_style` | `layer_id: string, fill?: string, stroke?: string, stroke_width?: number, ...` | `{ok}` | Batch set CSS style properties |

### Defs Resources (2)

| Tool | Parameters | Returns | Description |
|------|-----------|---------|-------------|
| `list_defs` | — | `{id, type}[]` | List all defs (gradients, filters, patterns, clipPaths) |
| `manage_defs` | `action: "add"\|"update"\|"delete", id: string, content?: string` | `{ok, id}` | CRUD operations on `<defs>` children |

### Canvas (1)

| Tool | Parameters | Returns | Description |
|------|-----------|---------|-------------|
| `set_viewbox` | `x?: number, y?: number, width?: number, height?: number` | `{ok}` | Modify SVG viewBox |

### Preview (2)

| Tool | Parameters | Returns | Description |
|------|-----------|---------|-------------|
| `preview_as_png` | `width?: number, height?: number` | base64 PNG image | Full canvas preview for Claude self-review |
| `preview_layer` | `layer_id: string, width?: number, height?: number, show_background?: boolean` | base64 PNG image | Single layer preview |

### Design Decisions

- **No `draw_svg`**: Removed. Claude builds scenes through layer operations, not full SVG writes.
- **Write operations return minimal responses**: Only `{ok, layer_id}` etc., not full SVG. Complex SVGs can be very large; full SVG is broadcast via WebSocket to the browser separately.
- **Read operations return only the requested part**: `get_layer` returns one layer, `list_layers` returns structure only.

## Layer Data Model

SVG layers use `<g>` tags with `id` and `data-name` attributes. Layers support nesting.

```xml
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
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
  <g id="layer-foreground" data-name="前景">
    <circle cx="650" cy="100" r="60" fill="#FFD700"/>
  </g>
</svg>
```

## Plugin Structure

### plugin.json

```json
{
  "name": "svg-drawing",
  "description": "Professional SVG drawing skills, agents, and workflows",
  "version": "0.1.0",
  "author": { "name": "SVG Artist" }
}
```

### Skills (5)

**`svg-fundamentals/SKILL.md`** — SVG basics:
- Basic shapes: rect, circle, ellipse, line, polygon, polyline
- `<path>` commands: M, L, H, V, Z for straight lines
- Transform attribute: translate, scale, rotate, matrix
- Coordinate system, viewBox understanding
- Grouping with `<g>` and referencing with `<use>`

**`bezier-and-curves/SKILL.md`** — Curve mastery:
- Quadratic Bézier Q/T commands with control point intuition
- Cubic Bézier C/S commands for complex curves
- Arc A command parameter meanings
- Common curve patterns: waves, petals, spirals, organic shapes

**`color-and-gradients/SKILL.md`** — Color & gradients:
- Color theory: complementary, analogous, triadic palettes
- `<linearGradient>` direction and stop design
- `<radialGradient>` focal point and spread
- `<pattern>` tiling textures
- Opacity and layered color blending techniques

**`composition/SKILL.md`** — Complex scene building:
- Composing complex figures from basic shapes (people, buildings, animals)
- Foreground/midground/background layering approach
- Perspective and depth: size diminution, color fading
- Shadow and lighting effects
- Efficient repetitive patterns via `duplicate_layer` + `transform_layer`

**`layer-workflow/SKILL.md`** — Layer best practices:
- Layer naming conventions and organization strategies
- Work order: large structures first, then details
- Self-review workflow using `preview_as_png`
- Precise layout using `get_element_bbox`

### Agent (1)

**`reference-searcher.md`**:
```markdown
---
name: reference-searcher
description: "Search for reference images to guide SVG drawing"
model: haiku
---

You are a visual reference search assistant. When the user describes what they want to draw:
1. Use WebSearch to find relevant SVG/illustration/vector references
2. Use WebFetch to get descriptive information about reference images
3. Summarize key visual features (composition, colors, shapes)
4. Provide specific SVG implementation suggestions
```

Uses `haiku` model — search doesn't need strong reasoning, saves cost.

### Command (1)

**`reference.md`** — `/reference` slash command:
Triggers the reference-searcher agent to find visual references for the user's description.

## Backend Changes

### New API Routes

MCP server POSTs layer operations to the Express backend:

```
POST /api/svg/:drawId/layers/list        → list_layers
POST /api/svg/:drawId/layers/get         → get_layer
POST /api/svg/:drawId/layers/add         → add_layer
POST /api/svg/:drawId/layers/update      → update_layer
POST /api/svg/:drawId/layers/delete      → delete_layer
POST /api/svg/:drawId/layers/move        → move_layer
POST /api/svg/:drawId/layers/duplicate   → duplicate_layer
POST /api/svg/:drawId/layers/transform   → transform_layer
POST /api/svg/:drawId/layers/opacity     → set_layer_opacity
POST /api/svg/:drawId/layers/style       → set_layer_style
POST /api/svg/:drawId/defs/list          → list_defs
POST /api/svg/:drawId/defs/manage        → manage_defs
POST /api/svg/:drawId/canvas/info        → get_canvas_info
POST /api/svg/:drawId/canvas/viewbox     → set_viewbox
POST /api/svg/:drawId/canvas/bbox        → get_element_bbox
POST /api/svg/:drawId/canvas/source      → get_svg_source
POST /api/svg/:drawId/preview            → preview_as_png
POST /api/svg/:drawId/preview/layer      → preview_layer
```

### New Files

**`server/svg-engine.ts`** — SVG DOM manipulation layer:
- Parse SVG string → DOM (using `linkedom`)
- Execute layer/defs/viewBox operations on DOM
- Serialize back to SVG string
- Each write operation triggers WebSocket broadcast to browser

**`server/png-renderer.ts`** — SVG to PNG conversion:
- Uses `resvg-js` for SVG → PNG rendering
- Supports full canvas and single-layer preview
- Returns base64-encoded PNG for Claude to "see"

### Modified Files

**`server/mcp-server.ts`** — Expand from 1 tool to 19 tools:
- Each tool POSTs to the corresponding backend API route
- Reads `SVG_CALLBACK_URL` env var for base URL (existing pattern)

**`server/pty-manager.ts`** — Update spawn args:
- Add `--plugin-dir ./plugins/svg-drawing`
- Add `--append-system-prompt` with layer guide
- Update `--allowedTools` to `mcp__svg-artist__*,WebSearch,WebFetch`
- Simplify `--system-prompt` to artist role definition

**`server/index.ts`** — Register new API routes for layer/canvas/preview operations

**`server/drawing-store.ts`** — No schema changes needed. SVG is still stored as a single string; layer structure is parsed on-the-fly from SVG content.

### Dependencies to Add

- `linkedom` — Lightweight DOM parser for SVG manipulation (~1MB vs jsdom ~20MB)
- `@aspect-build/resvg-js` or `@aspect-build/resvg-js` — SVG → PNG rendering

## System Prompt Changes

### Base system prompt (--system-prompt)

```
You are a professional SVG artist. Users describe artwork and you create it through layer operations.

Workflow:
1. Analyze user request. Use reference-searcher agent for visual references when helpful.
2. Plan layer structure (background → midground → foreground).
3. Create layers one by one with add_layer.
4. Self-review with preview_as_png. Fix issues found.
5. Use get_element_bbox for precise layout positioning.

Always give layers and elements meaningful id and data-name attributes.
```

### Appended layer guide (--append-system-prompt)

```
Layer tool usage:
- Each independent visual element goes in its own layer
- Name layers with layer-<description> format (e.g., layer-sky, layer-tree-1)
- Prefer update_layer over rebuilding layers
- Use duplicate_layer + transform_layer for repeated elements
- Put gradients/filters in manage_defs, reference by id in layers
- Self-review with preview_as_png after major changes
```

## Data Flow

### Layer Operation Flow

```
Claude calls update_layer("layer-bg", "<rect .../>")
  → MCP server POSTs to /api/svg/:drawId/layers/update
    → Express backend:
      1. Read current SVG from DrawingStore
      2. Parse SVG DOM with linkedom
      3. Find <g id="layer-bg">, replace innerHTML
      4. Serialize back to SVG string
      5. Save to DrawingStore + broadcast via WebSocket
      6. Return {ok: true, layer_id: "layer-bg"}
  → MCP server returns {ok} to Claude
  → Browser receives SVG update via WebSocket, re-renders preview
```

### Self-Review Flow

```
Claude calls preview_as_png(800, 600)
  → MCP server POSTs to /api/svg/:drawId/preview
    → Express backend:
      1. Read current SVG from DrawingStore
      2. Render to PNG via resvg-js
      3. Return base64 PNG
  → MCP server returns image to Claude
  → Claude analyzes the image, decides if adjustments needed
  → If needed, Claude calls update_layer/transform_layer/etc.
```

### Reference Search Flow

```
User: "画一只在月光下的猫"
  → Claude spawns reference-searcher agent
    → Agent uses WebSearch: "cat silhouette moonlight SVG illustration"
    → Agent uses WebFetch on top results
    → Agent summarizes: "Key features: sitting cat silhouette, large moon circle, starry sky..."
  → Claude uses summary to plan layers and draw
```
