# Phase 2: Custom MCP Tools, API Routes, and Asset Versioning

## Overview

Extend the self-bootstrapping architecture (Phase 1) with three capabilities:
1. **Custom MCP tools** — Claude defines new tools via JSON; they register dynamically on reload
2. **Custom API routes** — Claude defines new Express endpoints via JSON with pipeline handlers
3. **Asset versioning and rollback** — All bootstrap assets get version history and rollback support

## Decisions

- **Tool visibility**: Reload-after-write (consistent with Phase 1)
- **API route handler model**: JSON declarative with pipeline engine (sandboxed, no arbitrary code execution)
- **Version scope**: All asset types (filters, styles, tools, routes, skills, prompt extensions)
- **Approach**: Unified asset engine — tools and routes share the same pipeline handler mechanism

## Directory Layout

```
data/bootstrap/
├── custom-filters/                  # Phase 1 (existing)
│   ├── <name>.json                  # Current version
│   └── versions/                    # NEW — version history
│       └── <name>.v<N>.json
├── custom-styles/                   # Phase 1 (existing)
│   ├── <name>.json
│   └── versions/
│       └── <name>.v<N>.json
├── custom-tools/                    # NEW (Phase 2)
│   ├── <name>.json
│   └── versions/
│       └── <name>.v<N>.json
├── custom-routes/                   # NEW (Phase 2)
│   ├── <name>.json
│   └── versions/
│       └── <name>.v<N>.json
├── prompt-extensions/               # Phase 1 (existing)
│   ├── <name>.md
│   └── versions/
│       └── <name>.v<N>.md
plugins/svg-drawing/
└── skills/
    ├── <name>/
    │   ├── SKILL.md
    │   └── versions/                # NEW — version history for skills
    │       └── SKILL.v<N>.md
```

## JSON Definition Formats

### Custom Tool (`data/bootstrap/custom-tools/<name>.json`)

```json
{
  "name": "batch-apply-filter",
  "description": "Apply a filter to multiple layers at once",
  "input_schema": {
    "layer_ids": { "type": "array", "items": { "type": "string" }, "description": "Layer IDs" },
    "filter_type": { "type": "string", "description": "Filter type name" },
    "filter_params": { "type": "object", "description": "Filter parameters", "optional": true }
  },
  "handler": {
    "type": "pipeline",
    "steps": [
      {
        "action": "apply_filter",
        "for_each": "{{layer_ids}}",
        "params": { "layer_id": "{{$item}}", "filter_type": "{{filter_type}}", "params": "{{filter_params}}" }
      }
    ]
  },
  "created_by": "claude-bootstrap",
  "version": 1
}
```

### Custom Route (`data/bootstrap/custom-routes/<name>.json`)

```json
{
  "name": "batch-transform",
  "path": "/custom/batch-transform",
  "method": "POST",
  "description": "Apply the same transform to multiple layers",
  "input_schema": {
    "layer_ids": { "type": "array", "items": { "type": "string" } },
    "transform": { "type": "string" }
  },
  "handler": {
    "type": "pipeline",
    "steps": [
      {
        "action": "transform_layer",
        "for_each": "{{layer_ids}}",
        "params": { "layer_id": "{{$item}}", "transform": "{{transform}}" }
      }
    ]
  },
  "created_by": "claude-bootstrap",
  "version": 1
}
```

## Pipeline Engine

### Architecture

New file `server/pipeline-engine.ts` provides a sandboxed execution engine for custom tool/route handlers.

```typescript
interface PipelineStep {
  action: string;                    // Must exist in ACTION_REGISTRY
  params?: Record<string, any>;     // Supports {{}} template placeholders
  for_each?: string;                // Iterate over array parameter
  store_as?: string;                // Store result as named variable
}

interface PipelineContext {
  inputs: Record<string, any>;      // User-provided parameters
  variables: Record<string, any>;   // Inter-step shared variables
  prev: any;                        // Previous step result ({{$prev}})
  drawId: string;
}
```

### Template Syntax

- `{{param}}` — Reference input parameter by name
- `{{$item}}` — Current element in `for_each` iteration
- `{{$index}}` — Current index in `for_each` iteration
- `{{$prev}}` — Result of the previous step
- `{{$var_name}}` — Reference a stored variable (from `store_as`)

### Action Registry (Sandbox)

Pipeline steps can only call predefined actions. Each action maps to an existing SvgEngine/service operation:

| Action | Maps To | Description |
|--------|---------|-------------|
| `get_canvas_info` | SvgEngine.getCanvasInfo() | Get canvas info |
| `get_layers` | SvgEngine.listLayers() | List layers |
| `get_layer` | SvgEngine.getLayer() | Get single layer |
| `add_layer` | SvgEngine.addLayer() | Add layer |
| `update_layer` | SvgEngine.updateLayer() | Update layer content |
| `delete_layer` | SvgEngine.deleteLayer() | Delete layer |
| `transform_layer` | SvgEngine.transformLayer() | Transform layer |
| `style_layer` | SvgEngine.styleLayer() | Set layer styles |
| `move_layer` | SvgEngine.moveLayer() | Move layer order |
| `duplicate_layer` | SvgEngine.duplicateLayer() | Duplicate layer |
| `set_opacity` | SvgEngine.setOpacity() | Set layer opacity |
| `apply_filter` | filterTemplates.generateFilterOrCustom() | Apply SVG filter |
| `apply_style` | stylePresets.applyStylePreset() | Apply style preset |
| `manage_defs` | SvgEngine.manageDefs() | Manage defs |
| `set_viewbox` | SvgEngine.setViewBox() | Set viewBox |
| `get_svg_source` | SvgEngine.getSource() | Get SVG source |
| `compute_bbox` | SvgEngine.getBBox() | Compute bounding box |
| `preview_png` | PngRenderer.render() | Render PNG preview |

**Security guarantee**: Custom tools/routes can ONLY call actions in the registry. No arbitrary code execution.

## Version Control and Rollback

### Write-With-Archive Flow

Every write operation follows this pattern:

```
1. Read current file → extract version N
2. Copy current → versions/<name>.v<N>.json (archive)
3. Write new content with version N+1
4. Prune: if versions/ count > 10, delete oldest
```

Implemented via a shared `archiveBeforeWrite(assetDir, name, extension)` function.

### Version File Format

Version files are copies of the asset at that version, with an added `archived_at` timestamp:

```json
{
  "name": "oil-paint",
  "description": "...",
  "svg_template": "...",
  "version": 3,
  "archived_at": "2026-03-23T12:34:56.789Z"
}
```

### Rollback Behavior

- Version numbers are **monotonically increasing** — rollback creates a new version (e.g., rolling back v4 to v2's content produces v5)
- Rollback does NOT auto-reload; Claude batches multiple rollbacks before a single `reload_session`
- Maximum 10 historical versions per asset; oldest pruned on overflow

### Rollback Flow

```
rollback_asset({ type: "filter", name: "oil-paint", version: 2 })
│
├── 1. Validate type + name + version exists
├── 2. Read versions/oil-paint.v2.json → target content
├── 3. Archive current oil-paint.json → versions/oil-paint.v4.json
├── 4. Write target content as oil-paint.json, version: 5
└── 5. Return { ok, rolled_back_from: 4, content_from_version: 2, new_version: 5 }
```

## Dynamic MCP Tool Registration

On MCP server startup (`ListToolsRequestSchema` handler):

1. Load all `data/bootstrap/custom-tools/*.json`
2. For each valid definition, register as MCP tool with `custom_` prefix
3. Tool name: `custom_<kebab-name>` (e.g., `custom_batch-apply-filter`)

On tool call (`CallToolRequestSchema` handler):

1. If tool name starts with `custom_`, strip prefix and look up definition
2. Validate input against `input_schema`
3. Execute pipeline handler via `executePipeline()`
4. Return result as JSON text

## Dynamic API Route Registration

### Route Mounting

Custom routes mount at: `POST /api/svg/:drawId/custom/<route-name>`

### Loader (`server/custom-route-loader.ts`)

```
loadCustomRoutes(app):
  1. Remove all previously registered custom routes
  2. Read all data/bootstrap/custom-routes/*.json
  3. For each valid definition:
     - Register Express POST handler at /api/svg/:drawId/custom/<name>
     - Handler validates input, executes pipeline, returns result
```

### Reload Integration

`PtyManager.respawn()` triggers `loadCustomRoutes()` to refresh routes after bootstrap changes.

## New MCP Tools (4 additions → 33 total)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `write_custom_tool` | `name: string`, `definition: { description, input_schema, handler }` | Create/update custom MCP tool definition |
| `write_custom_route` | `name: string`, `definition: { path, method, description, input_schema, handler }` | Create/update custom API route |
| `rollback_asset` | `type: enum`, `name: string`, `version?: number` | Roll back asset to previous version |
| `get_asset_history` | `type: enum`, `name: string` | View version history of an asset |

### MCP Tool Schemas

```typescript
// write_custom_tool
{
  name: z.string(),
  definition: z.object({
    description: z.string(),
    input_schema: z.record(z.string(), z.object({
      type: z.string(),
      description: z.string().optional(),
      items: z.any().optional(),
      optional: z.boolean().optional(),
    })),
    handler: z.object({
      type: z.literal('pipeline'),
      steps: z.array(z.object({
        action: z.string(),
        params: z.record(z.string(), z.any()).optional(),
        for_each: z.string().optional(),
        store_as: z.string().optional(),
      })),
    }),
  }),
}

// write_custom_route
{
  name: z.string(),
  definition: z.object({
    path: z.string(),      // Must start with /custom/
    method: z.literal('POST'),
    description: z.string(),
    input_schema: z.record(z.string(), z.object({
      type: z.string(),
      description: z.string().optional(),
      items: z.any().optional(),
      optional: z.boolean().optional(),
    })),
    handler: z.object({
      type: z.literal('pipeline'),
      steps: z.array(z.object({
        action: z.string(),
        params: z.record(z.string(), z.any()).optional(),
        for_each: z.string().optional(),
        store_as: z.string().optional(),
      })),
    }),
  }),
}

// rollback_asset
{
  type: z.enum(['filter', 'style', 'tool', 'route', 'skill', 'prompt']),
  name: z.string(),
  version: z.number().int().positive().optional(),
}

// get_asset_history
{
  type: z.enum(['filter', 'style', 'tool', 'route', 'skill', 'prompt']),
  name: z.string(),
}
```

## API Routes (4 new endpoints)

```
POST /api/svg/:drawId/bootstrap/write-custom-tool
POST /api/svg/:drawId/bootstrap/write-custom-route
POST /api/svg/:drawId/bootstrap/rollback
POST /api/svg/:drawId/bootstrap/history
```

## Validation Rules

### Custom Tool Validation

| Field | Rules |
|-------|-------|
| name | kebab-case, ≤50 chars, no path traversal |
| description | Non-empty string |
| input_schema | Object with typed properties |
| handler.type | Must be `"pipeline"` |
| handler.steps | Non-empty array |
| handler.steps[].action | Must exist in ACTION_REGISTRY |
| Total size | < 50KB |

### Custom Route Validation

| Field | Rules |
|-------|-------|
| name | kebab-case, ≤50 chars, no path traversal |
| path | Must start with `/custom/` |
| method | Must be `"POST"` |
| handler | Same as custom tool validation |
| Total size | < 50KB |

### Rollback Validation

| Field | Rules |
|-------|-------|
| type | One of: filter, style, tool, route, skill, prompt |
| name | kebab-case, exists |
| version | Positive integer, version file must exist |

## System Prompt Addition

Appended to existing `layerGuide`:

```
Phase 2 self-improvement capabilities:
- write_custom_tool: Define new MCP tools with pipeline handlers
- write_custom_route: Define new API endpoints with pipeline handlers
- rollback_asset: Roll back any asset to a previous version
- get_asset_history: View version history of any asset

Custom tools use a pipeline model — each step calls a predefined action
(get_layers, apply_filter, transform_layer, etc.). Design pipelines
that compose existing actions into higher-level operations.

Custom routes are mounted at /api/svg/:drawId/custom/<name>.
They share the same pipeline handler as custom tools.

All assets now support versioning. Use get_asset_history to see versions,
and rollback_asset to revert. Rollback does not auto-reload — batch
rollbacks before a single reload_session.
```

## Files to Modify

| File | Changes |
|------|---------|
| `server/pipeline-engine.ts` | **NEW** — Pipeline execution engine + Action Registry |
| `server/custom-route-loader.ts` | **NEW** — Dynamic Express route loading/unloading |
| `server/bootstrap-store.ts` | Add custom-tools/ and custom-routes/ CRUD + version archive/rollback/history for ALL asset types |
| `server/bootstrap-validator.ts` | Add validateCustomTool, validateCustomRoute, validateRollback |
| `server/mcp-server.ts` | Add 4 new tool definitions + dynamic custom tool registration + custom tool call handler |
| `server/index.ts` | Add 4 new API routes + load custom routes on startup + reload on respawn |
| `server/pty-manager.ts` | Trigger route reload on respawn |
| `server/session-manager.ts` | Pass app reference for route reloading |
| `e2e/integration/bootstrap-api.spec.ts` | Add Phase 2 test cases |

## Example Scenarios

### Creating a Custom Tool

```
Claude: I need a tool to apply the same filter to all layers at once.

Claude → write_custom_tool("batch-filter", {
  description: "Apply filter to all layers",
  input_schema: { filter_type: { type: "string" }, params: { type: "object", optional: true } },
  handler: {
    type: "pipeline",
    steps: [
      { action: "get_layers", store_as: "all_layers" },
      { action: "apply_filter", for_each: "{{$all_layers}}", params: { layer_id: "{{$item.id}}", filter_type: "{{filter_type}}", params: "{{params}}" } }
    ]
  }
})

Claude → reload_session("Added batch-filter custom tool")

--- [Reloading...] ---

Claude → custom_batch-filter({ filter_type: "watercolor", params: { intensity: 0.8 } })
```

### Rolling Back an Asset

```
Claude: The new oil-paint filter doesn't look right. Let me check history.

Claude → get_asset_history({ type: "filter", name: "oil-paint" })
  → { versions: [{ version: 1, archived_at: "..." }, { version: 2, archived_at: "..." }, { version: 3, archived_at: "..." }], current_version: 4 }

Claude → rollback_asset({ type: "filter", name: "oil-paint", version: 2 })
  → { ok: true, rolled_back_from: 4, content_from_version: 2, new_version: 5 }

Claude → reload_session("Rolled back oil-paint filter to v2")
```
