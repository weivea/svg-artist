# Phase 3: Pipeline Macros, Hot-Reload, and Self-Improvement Agent

## Overview

Complete the self-bootstrapping architecture (Phase 1 + 2) with three capabilities:
1. **Pipeline macros** — Claude defines reusable multi-step actions via JSON; they register as new pipeline actions and MCP tools on reload
2. **Server hot-reload** — Reload custom routes/macros globally without affecting other sessions' Claude CLI processes
3. **Self-improvement agent** — System prompt guidance for proactive self-bootstrapping + `/review` command triggering a sub-agent analysis

## Decisions

- **Extension model**: JSON declarative macros (sandboxed, reuses pipeline engine)
- **Hot-reload scope**: Global registry refresh + per-session CLI respawn
- **Agent approach**: System prompt enhancement + `/review` slash command with bootstrap-reviewer sub-agent

## 1. Pipeline Macros

### Concept

Pipeline macros allow Claude to compose existing pipeline actions into higher-level reusable operations. A macro is a named sequence of pipeline steps stored as JSON. On reload, macros register as new actions in `ACTION_REGISTRY` and as MCP tools with `macro_` prefix.

### Directory Layout

```
data/bootstrap/
├── custom-macros/                    # NEW (Phase 3)
│   ├── <name>.json                  # Current version
│   └── versions/                    # Version history
│       └── <name>.v<N>.json
```

### JSON Format (`data/bootstrap/custom-macros/<name>.json`)

```json
{
  "name": "mirror-layer",
  "description": "Duplicate a layer and flip it horizontally",
  "input_schema": {
    "layer_id": { "type": "string", "description": "Layer to mirror" },
    "offset_x": { "type": "number", "description": "Horizontal offset", "optional": true }
  },
  "macro": {
    "steps": [
      {
        "action": "duplicate_layer",
        "params": { "layer_id": "{{layer_id}}" },
        "store_as": "dup"
      },
      {
        "action": "transform_layer",
        "params": {
          "layer_id": "{{$dup.new_layer_id}}",
          "scale": { "x": -1, "y": 1 }
        }
      }
    ]
  },
  "created_by": "claude-bootstrap",
  "version": 1
}
```

### Registration Mechanism

On MCP server startup (and after reload):

1. Load all `data/bootstrap/custom-macros/*.json`
2. For each valid macro:
   a. Create an `ActionFn` wrapper that calls `executePipeline(macro.steps, ctx, deps)`
   b. Register in `ACTION_REGISTRY` as `macro_<name>` (e.g., `macro_mirror-layer`)
   c. Register as MCP tool with `macro_` prefix
3. Macros can reference other macros (but not themselves — no recursion)

### Macro ActionFn Factory

```typescript
function createMacroAction(macroDef: MacroDef): ActionFn {
  return async (params, ctx, deps) => {
    // Create a sub-context with the macro's input as ctx.input
    const subCtx: PipelineContext = {
      drawId: ctx.drawId,
      vars: {},
      prev: undefined,
      input: params,
    };
    return executePipeline(macroDef.macro.steps, subCtx, deps);
  };
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| name | kebab-case, ≤50 chars, no path traversal |
| description | Non-empty string |
| input_schema | Object with typed properties |
| macro.steps | Non-empty array |
| macro.steps[].action | Must exist in ACTION_REGISTRY (excluding self) |
| No self-reference | Macro name must not appear in its own steps |
| Total size | < 50KB |

### New MCP Tool

| Tool | Parameters | Description |
|------|-----------|-------------|
| `write_macro` | `name: string`, `definition: { description, input_schema, macro }` | Create/update pipeline macro. Available as `macro_<name>` after reload_session. |

### MCP Tool Schema

```typescript
// write_macro
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
    macro: z.object({
      steps: z.array(z.object({
        action: z.string(),
        params: z.record(z.string(), z.any()).optional(),
        for_each: z.string().optional(),
        store_as: z.string().optional(),
      })),
    }),
  }),
}
```

## 2. Server Hot-Reload

### Problem

When Claude calls `reload_session()`:
- Custom routes registered via `app.post()` cannot be removed from Express
- Other sessions' Claude CLI processes are unaffected (good), but they see stale route handlers until server restart

### Solution: Registry Pattern

Replace direct Express route registration with a single middleware + in-memory registry.

### Custom Route Registry (`server/custom-route-registry.ts`)

```typescript
import type { Request, Response } from 'express';
import { loadAllCustomRoutes, loadAllCustomTools } from './bootstrap-store.js';
import { executePipeline, PipelineContext, PipelineDeps } from './pipeline-engine.js';

type RouteHandler = (req: Request, res: Response) => Promise<void>;

class CustomRouteRegistry {
  private routes: Map<string, RouteHandler> = new Map();
  private tools: Map<string, RouteHandler> = new Map();

  register(name: string, handler: RouteHandler): void {
    this.routes.set(name, handler);
  }

  registerTool(name: string, handler: RouteHandler): void {
    this.tools.set(name, handler);
  }

  getRouteHandler(name: string): RouteHandler | undefined {
    return this.routes.get(name);
  }

  getToolHandler(name: string): RouteHandler | undefined {
    return this.tools.get(name);
  }

  async reloadAll(pipelineDeps: PipelineDeps): Promise<void> {
    this.routes.clear();
    this.tools.clear();
    // Load and register custom routes
    const routes = await loadAllCustomRoutes();
    for (const route of routes) {
      this.register(route.name, createPipelineHandler(route.handler.steps, pipelineDeps));
    }
    // Load and register custom tools
    const tools = await loadAllCustomTools();
    for (const tool of tools) {
      this.registerTool(tool.name, createPipelineHandler(tool.handler.steps, pipelineDeps));
    }
  }
}

function createPipelineHandler(steps: PipelineStep[], deps: PipelineDeps): RouteHandler {
  return async (req, res) => {
    const drawId = req.params.drawId;
    const ctx: PipelineContext = { drawId, vars: {}, prev: undefined, input: req.body };
    try {
      const result = await executePipeline(steps, ctx, deps);
      res.json({ ok: true, result });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  };
}

export const routeRegistry = new CustomRouteRegistry();
```

### Express Integration

Register middleware once at startup (replaces per-route registration):

```typescript
// Single middleware for all custom routes
app.post('/api/svg/:drawId/custom/:routeName', (req, res) => {
  const handler = routeRegistry.getRouteHandler(req.params.routeName);
  if (!handler) return res.status(404).json({ error: 'Custom route not found' });
  return handler(req, res);
});

// Single middleware for all custom tools
app.post('/api/svg/:drawId/custom-tool/:toolName', (req, res) => {
  const handler = routeRegistry.getToolHandler(req.params.toolName);
  if (!handler) return res.status(404).json({ error: 'Custom tool not found' });
  return handler(req, res);
});

// Initial load
await routeRegistry.reloadAll(pipelineDeps);
```

### Hot-Reload Flow

```
Claude calls reload_session(reason) for drawing A:
│
├── 1. routeRegistry.reloadAll()     ← Global: refresh routes/tools/macros
├── 2. Only kill/respawn drawing A's Claude CLI process
│      (PtyManager.respawn() — already per-session)
├── 3. Other sessions (B, C) continue running
│      - Their Claude CLI processes stay alive
│      - Server has updated routes/tools immediately
│      - Next MCP call from B/C uses fresh routes
└── 4. Drawing A's new CLI picks up all changes on startup
```

### Session Manager Changes

```typescript
// session-manager.ts — add reload callback
export class SessionManager {
  private onReloadCallback?: () => Promise<void>;

  setOnReload(cb: () => Promise<void>): void {
    this.onReloadCallback = cb;
  }

  async respawn(drawId: string, reason: string): Promise<void> {
    // 1. Reload global registries
    if (this.onReloadCallback) await this.onReloadCallback();
    // 2. Respawn only this session's CLI
    const manager = this.sessions.get(drawId);
    if (manager) await manager.respawn(reason);
  }
}
```

## 3. Self-Improvement Agent

### System Prompt Enhancement

Add to the dynamic prompt in `pty-manager.ts`:

```
### Self-Improvement Decision Guide
Proactively identify opportunities to extend your capabilities:

Trigger signals:
- You're about to repeat the same 3+ step sequence for the third time
  → write_custom_tool or write_macro to encapsulate it
- A drawing effect you want doesn't exist in current filters
  → write_filter to create a custom SVG filter template
- You keep adjusting the same style parameters across layers
  → write_style to create a reusable style preset
- You notice a gap in your drawing knowledge
  → write_skill or write_prompt_extension to fill it

Strategy:
- Batch multiple writes before a single reload_session
- Use list_bootstrap_assets to check what exists first
- Use get_asset_history / rollback_asset if a change doesn't work
- After reload, test your new capabilities immediately
- Use /review to get a detailed analysis of improvement opportunities
```

### `/review` Command

New file: `plugins/svg-drawing/commands/review.md`

```markdown
---
name: review
description: Analyze current drawing session for self-improvement opportunities
---

Use the bootstrap-reviewer agent to analyze the current drawing and identify
opportunities for self-improvement. The agent will check existing bootstrap
assets, analyze the current canvas state, and propose specific improvements.
```

### `bootstrap-reviewer` Agent

New file: `plugins/svg-drawing/agents/bootstrap-reviewer.md`

```markdown
---
name: bootstrap-reviewer
model: sonnet
description: >
  Analyze the current drawing session to identify self-improvement opportunities.
  Reviews existing bootstrap assets, canvas state, and layer structure to propose
  specific new filters, styles, tools, macros, or skills that would improve the
  drawing workflow.
allowedTools:
  - list_bootstrap_assets
  - list_layers
  - get_canvas_info
  - get_svg_source
  - list_defs
  - get_layer_colors
  - critique_composition
---

# Bootstrap Reviewer Agent

You are analyzing a drawing session to identify opportunities for the artist
to extend their capabilities through self-bootstrapping.

## Analysis Process

1. **Check current assets**: Call list_bootstrap_assets to see existing
   custom filters, styles, tools, macros, and skills
2. **Analyze canvas**: Call get_canvas_info and list_layers to understand
   the drawing structure
3. **Review patterns**: Look at layer naming, defs usage, and style patterns
   for repetition or gaps
4. **Check composition**: Call critique_composition to identify quality issues
   that custom tools could address

## Output Format

Provide a structured report:

### Existing Assets Summary
List what's already available.

### Identified Opportunities
For each opportunity:
- **Type**: filter / style / tool / macro / skill
- **Name**: Suggested kebab-case name
- **Rationale**: Why this would help
- **Definition**: Ready-to-use parameters for write_filter / write_custom_tool / etc.

### Recommended Actions
Ordered list of write_* calls the artist should execute, followed by
a single reload_session.

Keep suggestions practical and specific. Only suggest improvements that
would clearly benefit the current drawing session.
```

## New MCP Tools (1 addition → 34+ total)

| Tool | Parameters | Description |
|------|-----------|-------------|
| `write_macro` | `name: string`, `definition: { description, input_schema, macro }` | Create/update pipeline macro definition |

(Rollback and history already work for macros via the existing `rollback_asset` and `get_asset_history` tools with type `'macro'`.)

## API Routes (1 new endpoint)

```
POST /api/svg/:drawId/bootstrap/write-macro
```

(Custom route and tool execution already handled by registry middleware.)

## Validation Rules

### Macro Validation

| Field | Rules |
|-------|-------|
| name | kebab-case, ≤50 chars, no path traversal |
| description | Non-empty string |
| input_schema | Object with typed properties |
| macro.steps | Non-empty array |
| macro.steps[].action | Must exist in ACTION_REGISTRY |
| No self-reference | `macro_<name>` must not appear in steps |
| Total size | < 50KB |

## Files to Modify

| File | Changes |
|------|---------|
| `server/custom-route-registry.ts` | **NEW** — Route/tool registry with middleware pattern |
| `server/bootstrap-store.ts` | Add custom-macros CRUD + versioning |
| `server/bootstrap-validator.ts` | Add validateMacroDefinition |
| `server/pipeline-engine.ts` | Add macro registration (loadMacros → ACTION_REGISTRY) |
| `server/mcp-server.ts` | Add write_macro tool + dynamic macro_* tool registration |
| `server/index.ts` | Replace direct route/tool registration with registry middleware; add write-macro route |
| `server/pty-manager.ts` | Add self-improvement decision guide to system prompt |
| `server/session-manager.ts` | Add onReload callback for global registry refresh |
| `plugins/svg-drawing/commands/review.md` | **NEW** — /review slash command |
| `plugins/svg-drawing/agents/bootstrap-reviewer.md` | **NEW** — Bootstrap analysis agent |
| `CLAUDE.md` | Update documentation for Phase 3 |
| `e2e/integration/bootstrap-api.spec.ts` | Add Phase 3 test cases |

## Example Scenarios

### Creating a Pipeline Macro

```
Claude: I keep duplicating and flipping layers. Let me make a macro for it.

Claude → write_macro("mirror-layer", {
  description: "Duplicate a layer and flip it horizontally",
  input_schema: { layer_id: { type: "string" } },
  macro: {
    steps: [
      { action: "duplicate_layer", params: { layer_id: "{{layer_id}}" }, store_as: "dup" },
      { action: "transform_layer", params: {
        layer_id: "{{$dup.new_layer_id}}", scale: { x: -1, y: 1 }
      }}
    ]
  }
})

Claude → reload_session("Added mirror-layer macro")

--- [Reloading...] ---

Claude → macro_mirror-layer({ layer_id: "layer-tree" })
```

### Using /review

```
User: /review

[bootstrap-reviewer agent runs]

Agent: ## Bootstrap Review

### Existing Assets
- 2 custom filters (oil-paint, watercolor-v2)
- 1 custom tool (batch-filter)

### Identified Opportunities
1. **macro: center-on-canvas** — You've manually calculated center
   positions 4 times. A macro could automate get_element_bbox +
   transform_layer to center any element.
2. **filter: pencil-sketch** — The current drawing uses hand-drawn
   aesthetics but no sketch filter exists.

### Recommended Actions
1. write_macro("center-on-canvas", { ... })
2. write_filter("pencil-sketch", { ... })
3. reload_session("Added center-on-canvas macro and pencil-sketch filter")
```

### Hot-Reload Isolation

```
Drawing A: Claude → reload_session("Added new filter")
  → Server reloads route registry (global)
  → Server kills only drawing A's Claude CLI
  → Drawing A's CLI respawns with --resume
  → Drawing B's Claude CLI continues uninterrupted
  → Drawing B can use the new filter on its next tool call
```
