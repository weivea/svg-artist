# MCP Tools Redesign for Professional Designers

**Date**: 2026-03-24
**Status**: Approved
**Scope**: Large-scale refactoring of MCP server tools, SVG engine, and API routes

## Problem Statement

The current 34+ MCP tools have three systemic issues when evaluated from a professional designer's perspective:

1. **Workflow inefficiency** — 9 scratch canvas tools, overlapping layer tools (move/duplicate), tools organized by implementation layer instead of design workflow
2. **Architectural defects** — transforms overwrite instead of compose, filters can't stack, styles can't be incrementally updated, no undo semantics
3. **Missing professional capabilities** — no path editing (Bezier), no boolean operations, no typography tools, no align/distribute, no gradient shortcuts

## Design Approach

Restructure tools around a professional designer's actual workflow: setup canvas → build layers → draw shapes/paths → add text → transform/align → style/color → apply effects → preview/critique.

## Tool Taxonomy (New)

### Canvas & Setup (3 tools)

| Tool | Type | Change |
|------|------|--------|
| `get_canvas_info` | Query | **Enhanced** — returns layer summary, content bounds, visible/locked states |
| `set_viewbox` | Mutation | Unchanged |
| `set_canvas_background` | Mutation | **New** — solid color or gradient background |

#### `get_canvas_info` enhanced response:
```typescript
{
  viewBox: string,
  width: number, height: number,
  layerCount: number,
  defsCount: number,
  totalElements: number,
  contentBounds: { x, y, width, height },
  layers: Array<{
    id: string, name: string,
    visible: boolean,      // display !== 'none'
    locked: boolean,       // pointer-events === 'none'
    hasFilter: boolean,
    childCount: number,
  }>,
  background: string | null,
}
```

#### `set_canvas_background` params:
```typescript
{
  color?: string,           // solid color
  gradient_id?: string,     // reference gradient in defs
  opacity?: number,
}
```
Implementation: maintains a `<rect id="canvas-bg">` as first child of SVG root.

### Layers (6 tools)

| Tool | Type | Change |
|------|------|--------|
| `list_layers` | Query | **Enhanced** — returns visible/opacity/hasTransform/hasFilter per layer |
| `get_layer` | Query | Unchanged |
| `add_layer` | Mutation | **Enhanced** — new `source_layer_id` param for duplication |
| `update_layer` | Mutation | Unchanged |
| `delete_layer` | Mutation | Unchanged |
| `reorder_layers` | Mutation | **New** — replaces `move_layer`, supports batch reordering |

#### `add_layer` enhanced params:
```typescript
{
  name: string,
  content?: string,           // SVG content (required unless source_layer_id)
  source_layer_id?: string,   // copy content from this layer (replaces duplicate_layer)
  parent_id?: string,
  position?: number,
}
```

#### `reorder_layers` params:
```typescript
{
  operations: Array<{
    layer_id: string,
    action: 'move_to' | 'move_up' | 'move_down' | 'move_to_top' | 'move_to_bottom',
    position?: number,      // for move_to
    parent_id?: string,     // for cross-group moves
  }>
}
```

### Path & Shape (3 tools) — NEW

| Tool | Type |
|------|------|
| `create_path` | Mutation |
| `edit_path` | Mutation |
| `boolean_path` | Mutation |

#### `create_path` params:
```typescript
{
  type: 'line' | 'polyline' | 'polygon' | 'arc' | 'bezier' | 'star' | 'rounded-rect',
  points?: [number, number][],     // polyline/polygon
  start?: [number, number],        // line/arc/bezier
  end?: [number, number],
  control1?: [number, number],     // bezier control point 1
  control2?: [number, number],     // cubic bezier control point 2
  radius?: number,                 // arc/star/rounded-rect
  inner_radius?: number,           // star
  corners?: number,                // star/polygon
  corner_radius?: number,          // rounded-rect
  fill?: string,
  stroke?: string,
  stroke_width?: number,
  layer_id?: string,               // add to existing layer
  layer_name?: string,             // create new layer
}
```

#### `edit_path` params:
```typescript
{
  element_id: string,
  operations: Array<
    | { type: 'move_point', index: number, x: number, y: number }
    | { type: 'add_point', after_index: number, x: number, y: number }
    | { type: 'delete_point', index: number }
    | { type: 'set_control', index: number, control1?: [number, number], control2?: [number, number] }
    | { type: 'close' | 'open' }
    | { type: 'smooth', tension?: number }
    | { type: 'simplify', tolerance?: number }
  >
}
```

#### `boolean_path` params:
```typescript
{
  operation: 'union' | 'subtract' | 'intersect' | 'exclude',
  path_a: string,        // element id
  path_b: string,        // element id
  result_layer?: string, // target layer for result
}
```

Implementation: use `paper` (paper.js) for path boolean operations and point-level editing.

### Typography (1 tool) — NEW

| Tool | Type |
|------|------|
| `create_text` | Mutation |

#### `create_text` params:
```typescript
{
  text: string,
  x: number, y: number,
  font_family?: string,
  font_size?: number,
  font_weight?: number | string,
  font_style?: 'normal' | 'italic',
  letter_spacing?: number,
  word_spacing?: number,
  line_height?: number,
  text_anchor?: 'start' | 'middle' | 'end',
  dominant_baseline?: 'auto' | 'middle' | 'hanging',
  text_decoration?: 'none' | 'underline' | 'line-through',
  fill?: string,
  stroke?: string,
  path_id?: string,           // text along path (textPath)
  spans?: Array<{
    text: string,
    fill?: string,
    font_size?: number,
    font_weight?: number | string,
    dx?: number, dy?: number,
  }>,
  layer_id?: string,
  layer_name?: string,
}
```

### Transform (2 tools)

| Tool | Type | Change |
|------|------|--------|
| `transform_layer` | Mutation | **Refactored** — compose/replace mode, add skew and scale center |
| `align_distribute` | Mutation | **New** |

#### `transform_layer` refactored params:
```typescript
{
  layer_id: string,
  translate?: { x: number, y: number },
  scale?: { x: number, y: number, cx?: number, cy?: number },  // NEW: scale center
  rotate?: { angle: number, cx?: number, cy?: number },
  skew?: { x?: number, y?: number },                            // NEW: skew
  mode?: 'compose' | 'replace',                                 // NEW: default 'compose'
}
```

In `compose` mode, new transforms append to the existing `transform` attribute (SVG transforms are matrix left-multiplication; appending = composing). `replace` overwrites for special cases.

#### `align_distribute` params:
```typescript
{
  layer_ids: string[],
  align?: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom',
  distribute?: 'horizontal' | 'vertical',
  reference?: string | 'canvas',  // reference layer id or 'canvas' for canvas bounds
}
```

### Style & Color (4 tools)

| Tool | Type | Change |
|------|------|--------|
| `set_layer_style` | Mutation | **Refactored** — incremental updates, `null` removes attributes |
| `set_layer_opacity` | Mutation | Unchanged |
| `get_layer_colors` | Query | **Enhanced** — gradient penetration, HSL output |
| `get_color_palette` | Query | Unchanged |

#### `set_layer_style` behavior change:
- Properties passed with values: set/update normally
- Properties passed with `null`: remove from element
- Properties not passed: left untouched (no change)

#### `get_layer_colors` enhanced response:
```typescript
Array<{
  color: string,          // hex value
  hsl: { h: number, s: number, l: number },  // NEW
  usage: string,          // 'fill' | 'stroke' | 'stop-color' | etc.
  element: string,        // element tag name
  source: string,         // 'attribute' | 'gradient-stop' | 'inherited'  // NEW
}>
```

### Effects & Defs (3 tools)

| Tool | Type | Change |
|------|------|--------|
| `apply_effect` | Mutation | **Refactored** — replaces `apply_filter`, chainable effects |
| `manage_defs` | Mutation | **Enhanced** — add create_gradient/create_pattern/create_clip_mask actions |
| `list_defs` | Query | Unchanged |

#### `apply_effect` params:
```typescript
{
  layer_id: string,
  effects: Array<{
    type: 'drop-shadow' | 'blur' | 'glow' | 'emboss' | 'noise-texture' |
          'paper' | 'watercolor' | 'metallic' | 'glass',
    params?: Record<string, number | string>,
  }>,
  mode?: 'append' | 'replace',  // default 'append'
}
```

Implementation: merges multiple filter primitives into a single `<filter>` element. If mode is `append`, reads existing filter's primitives and adds new ones.

#### `manage_defs` new actions:
```typescript
{
  action: 'add' | 'update' | 'delete' | 'create_gradient' | 'create_pattern' | 'create_clip_mask',
  id: string,
  content?: string,              // for add/update

  // create_gradient params
  gradient_type?: 'linear' | 'radial',
  stops?: Array<{ offset: string, color: string, opacity?: number }>,
  x1?: string, y1?: string, x2?: string, y2?: string,    // linear
  cx?: string, cy?: string, r?: string, fx?: string, fy?: string,  // radial
  units?: 'userSpaceOnUse' | 'objectBoundingBox',
  spread?: 'pad' | 'reflect' | 'repeat',

  // create_pattern params
  pattern_content?: string,
  pattern_width?: number, pattern_height?: number,
  pattern_units?: 'userSpaceOnUse' | 'objectBoundingBox',

  // create_clip_mask params
  clip_content?: string,
  mask_content?: string,
}
```

### Preview & Critique (3 tools)

| Tool | Type | Change |
|------|------|--------|
| `preview_as_png` | Query | **Enhanced** — add background color, DPI control |
| `preview_layer` | Query | Unchanged |
| `critique_composition` | Query | Unchanged |

#### `preview_as_png` enhanced params:
```typescript
{
  width?: number,
  height?: number,
  background?: string,   // NEW: background color for transparent SVGs
  dpi?: number,          // NEW: render DPI (default 72)
}
```

### Scratch Canvas (2 tools — was 9)

| Tool | Type | Change |
|------|------|--------|
| `scratch_canvas` | Mixed | **Merged** — 9 tools consolidated into 1 action-driven tool |
| `merge_scratch` | Mutation | **Enhanced** — new merge_as option |

#### `scratch_canvas` params:
```typescript
{
  action: 'create' | 'add_layer' | 'update_layer' | 'delete_layer' |
          'list_layers' | 'manage_defs' | 'preview' | 'list_all',
  canvas_id?: string,
  // create
  viewBox?: string,
  background?: string,
  // add_layer
  name?: string,
  content?: string,
  parent_id?: string,
  position?: number,
  // update_layer / delete_layer
  layer_id?: string,
  // manage_defs
  defs_action?: 'add' | 'update' | 'delete',
  id?: string,
  defs_content?: string,
  // preview
  width?: number,
}
```

#### `merge_scratch` params:
```typescript
{
  canvas_id: string,
  layer_name: string,
  transform?: { translate?: [number, number], scale?: number, rotate?: number },
  transfer_defs?: boolean,
  merge_as?: 'single_layer' | 'separate_layers',  // NEW
}
```

### Bootstrap (7 tools) — Unchanged
### Phase 2 (4 tools) — Unchanged

## Removed Tools

| Old Tool | Replaced By |
|----------|-------------|
| `move_layer` | `reorder_layers` (batch operations) |
| `duplicate_layer` | `add_layer` with `source_layer_id` |
| `apply_filter` | `apply_effect` (chainable) |
| `apply_style_preset` | `apply_effect` + `set_layer_style` combination |
| `get_svg_source` | `get_canvas_info` with `include_source` param |
| 9x `scratch_*` tools | `scratch_canvas` + `merge_scratch` |

## Key Architectural Changes

### 1. Transform Composition
- Default mode `compose`: appends to existing transform attribute
- `replace` mode: overwrites for special cases
- New capabilities: skew, scale with center point

### 2. Effect Chaining
- Multiple effects applied as merged filter primitives in single `<filter>` element
- `append` mode reads existing filter primitives and extends them
- `replace` mode for clean slate

### 3. Incremental Style Updates
- Only explicitly passed properties are changed
- `null` value removes an attribute
- Omitted properties are untouched

### 4. Path Operations
- Point-level editing (move, add, delete, set control points)
- Path smoothing and simplification
- Boolean operations (union, subtract, intersect, exclude)
- Dependency: `paper` (paper.js) for path math

## New Dependencies

- `paper` — path boolean operations and point-level path editing

## Files Changed

| File | Change Type |
|------|-------------|
| `server/mcp-server.ts` | **Rewrite** — new tool registrations, updated schemas |
| `server/svg-engine.ts` | **Major changes** — transform compose, effect chain, align/distribute, background, enhanced queries |
| `server/index.ts` | **Routes added** — path/*, typography/*, align/*, canvas/background |
| `server/filter-templates.ts` | **Refactored** — effect-chain architecture |
| `server/path-operations.ts` | **New file** — path parsing, editing, boolean operations |
| `server/typography.ts` | **New file** — text creation and layout |
| `e2e/integration/*.spec.ts` | **Updated** — tests for new/changed tools |
| `package.json` | **Updated** — add `paper` dependency |

## Tool Count Summary

- **Before**: 34 core + 9 scratch + bootstrap/phase2 = 54+ tools
- **After**: 25 core + 2 scratch + 11 bootstrap/phase2 = 38 tools
- **Net reduction**: ~16 fewer tools with significantly more capability
