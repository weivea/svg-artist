# Phase 3: Pipeline Macros, Hot-Reload & Self-Improvement Agent — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the self-bootstrapping architecture with reusable pipeline macros, session-isolated hot-reload, and a self-improvement decision agent.

**Architecture:** Pipeline macros are JSON-defined multi-step action sequences registered to ACTION_REGISTRY on reload. Hot-reload uses a registry pattern for custom routes/tools instead of direct Express registration, enabling global refresh without affecting other sessions' CLI processes. The self-improvement agent is a system prompt enhancement plus a `/review` slash command that spawns a bootstrap-reviewer sub-agent.

**Tech Stack:** TypeScript (ES modules, tsx), Express 5, MCP SDK (@modelcontextprotocol/sdk), Zod, Playwright (integration tests)

---

### Task 1: Pipeline Macros — bootstrap-store.ts

Add CRUD operations for custom macros to the bootstrap store, following the exact same pattern as custom tools.

**Files:**
- Modify: `server/bootstrap-store.ts`

**Step 1: Add CUSTOM_MACROS_DIR constant**

After line 16 (`const CUSTOM_ROUTES_DIR = ...`), add:

```typescript
const CUSTOM_MACROS_DIR = join(BOOTSTRAP_DIR, 'custom-macros');
```

**Step 2: Add MacroDef interface**

After the `CustomRouteDef` interface (around line 66), add:

```typescript
export interface MacroDef {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  macro: {
    steps: PipelineStepDef[];
  };
  created_by: string;
  version: number;
}
```

**Step 3: Update BootstrapAssets interface**

Add `custom_macros: string[];` to the `BootstrapAssets` interface (after `custom_routes` on line 87):

```typescript
export interface BootstrapAssets {
  skills: string[];
  custom_filters: string[];
  custom_styles: string[];
  prompt_extensions: string[];
  custom_tools: string[];
  custom_routes: string[];
  custom_macros: string[];
}
```

**Step 4: Add macro CRUD functions**

After the custom routes CRUD section, add:

```typescript
// --- Custom Macros ---

export async function writeCustomMacro(name: string, definition: {
  description: string;
  input_schema: Record<string, unknown>;
  macro: { steps: PipelineStepDef[] };
}): Promise<void> {
  await ensureDir(CUSTOM_MACROS_DIR);
  const filePath = join(CUSTOM_MACROS_DIR, `${name}.json`);
  const versionsDir = join(CUSTOM_MACROS_DIR, 'versions', name);
  await archiveBeforeWrite(filePath, versionsDir);
  const data: MacroDef = {
    name,
    description: definition.description,
    input_schema: definition.input_schema,
    macro: definition.macro,
    created_by: 'claude-bootstrap',
    version: 1,
  };
  // Increment version if file exists
  try {
    const existing = JSON.parse(await readFile(filePath, 'utf8')) as MacroDef;
    data.version = existing.version + 1;
  } catch { /* new file */ }
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function loadCustomMacro(name: string): Promise<MacroDef | null> {
  try {
    const content = await readFile(join(CUSTOM_MACROS_DIR, `${name}.json`), 'utf8');
    return JSON.parse(content) as MacroDef;
  } catch {
    return null;
  }
}

export async function listCustomMacros(): Promise<string[]> {
  try {
    const files = await readdir(CUSTOM_MACROS_DIR);
    return files
      .filter(f => f.endsWith('.json') && !f.startsWith('.'))
      .map(f => f.replace('.json', ''));
  } catch {
    return [];
  }
}

export async function loadAllCustomMacros(): Promise<MacroDef[]> {
  const names = await listCustomMacros();
  const macros: MacroDef[] = [];
  for (const name of names) {
    const macro = await loadCustomMacro(name);
    if (macro) macros.push(macro);
  }
  return macros;
}
```

**Step 5: Update getAssetDirAndExt**

Add a `'custom-macro'` case to the switch statement in `getAssetDirAndExt`:

```typescript
case 'custom-macro': return { dir: CUSTOM_MACROS_DIR, ext: '.json' };
```

**Step 6: Update listAllAssets**

Add `listCustomMacros()` to the `Promise.all` and include `custom_macros` in the return:

```typescript
export async function listAllAssets(): Promise<BootstrapAssets> {
  const [skills, custom_filters, custom_styles, prompt_extensions, custom_tools, custom_routes, custom_macros] = await Promise.all([
    listSkills(),
    listCustomFilters(),
    listCustomStyles(),
    listPromptExtensions(),
    listCustomTools(),
    listCustomRoutes(),
    listCustomMacros(),
  ]);
  return { skills, custom_filters, custom_styles, prompt_extensions, custom_tools, custom_routes, custom_macros };
}
```

**Step 7: Commit**

```bash
git add server/bootstrap-store.ts
git commit -m "feat: add custom macros CRUD to bootstrap-store"
```

---

### Task 2: Macro Validation — bootstrap-validator.ts

Add validation for macro definitions, including self-reference detection.

**Files:**
- Modify: `server/bootstrap-validator.ts`

**Step 1: Update VALID_ASSET_TYPES**

Add `'custom-macro'` to the `VALID_ASSET_TYPES` array (line 9):

```typescript
const VALID_ASSET_TYPES = [
  'custom-filter', 'custom-style', 'custom-tool', 'custom-route', 'custom-macro', 'prompt-extension', 'skill',
] as const;
```

**Step 2: Add validateMacroDefinition**

After `validateCustomRouteDefinition`, add:

```typescript
export function validateMacroDefinition(
  name: string,
  definition: {
    description?: string;
    input_schema?: unknown;
    macro?: { steps?: Array<{ action?: string; params?: unknown }> };
  },
): ValidationResult {
  if (!definition || typeof definition !== 'object') {
    return { ok: false, error: 'Macro definition must be an object' };
  }
  if (!definition.description || typeof definition.description !== 'string') {
    return { ok: false, error: 'Macro definition must have a description string' };
  }
  if (!definition.input_schema || typeof definition.input_schema !== 'object') {
    return { ok: false, error: 'Macro definition must have an input_schema object' };
  }
  if (!definition.macro || typeof definition.macro !== 'object') {
    return { ok: false, error: 'Macro definition must have a macro object' };
  }
  // Validate steps using existing pipeline handler validator
  const handlerCheck = validatePipelineHandler({
    type: 'pipeline',
    steps: definition.macro.steps,
  });
  if (!handlerCheck.ok) return handlerCheck;
  // Check for self-reference: macro_<name> must not appear in its own steps
  const selfAction = `macro_${name}`;
  for (let i = 0; i < (definition.macro.steps?.length ?? 0); i++) {
    if (definition.macro.steps![i].action === selfAction) {
      return { ok: false, error: `Step ${i}: macro cannot reference itself (${selfAction})` };
    }
  }
  return { ok: true };
}
```

**Step 3: Commit**

```bash
git add server/bootstrap-validator.ts
git commit -m "feat: add macro validation with self-reference detection"
```

---

### Task 3: Macro Registration in Pipeline Engine — pipeline-engine.ts

Add the ability to register macros as new actions in ACTION_REGISTRY.

**Files:**
- Modify: `server/pipeline-engine.ts`

**Step 1: Export ACTION_REGISTRY and add registration functions**

Change `ACTION_REGISTRY` from `const` to `let` (or keep const since objects are mutable). Add two exported functions after `getRegisteredActions()`:

```typescript
/**
 * Register a macro as a new action in the registry.
 * The macro's steps are executed as a sub-pipeline with the params as input.
 */
export function registerMacroAction(name: string, steps: PipelineStep[]): void {
  const actionName = `macro_${name}`;
  ACTION_REGISTRY[actionName] = async (params, ctx, deps) => {
    // Create a sub-context: macro params become the input
    const subCtx: PipelineContext = {
      drawId: ctx.drawId,
      vars: {},
      prev: undefined,
      input: params,
    };
    return executePipeline(steps, subCtx, deps);
  };
}

/**
 * Unregister all macro actions (called before reload).
 */
export function clearMacroActions(): void {
  for (const key of Object.keys(ACTION_REGISTRY)) {
    if (key.startsWith('macro_')) {
      delete ACTION_REGISTRY[key];
    }
  }
}
```

**Step 2: Commit**

```bash
git add server/pipeline-engine.ts
git commit -m "feat: add macro action registration/clearing to pipeline engine"
```

---

### Task 4: Custom Route Registry — server/custom-route-registry.ts

Create the registry that replaces direct Express route registration for custom routes and tools.

**Files:**
- Create: `server/custom-route-registry.ts`

**Step 1: Write the registry**

```typescript
import type { Request, Response } from 'express';
import { loadAllCustomRoutes, loadAllCustomTools, loadAllCustomMacros } from './bootstrap-store.js';
import { executePipeline, registerMacroAction, clearMacroActions } from './pipeline-engine.js';
import type { PipelineContext, PipelineDeps, PipelineStep } from './pipeline-engine.js';

type RouteHandler = (req: Request, res: Response) => Promise<void>;

function createPipelineHandler(steps: PipelineStep[], deps: PipelineDeps): RouteHandler {
  return async (req: Request, res: Response) => {
    const drawId = req.params.drawId as string;
    const ctx: PipelineContext = {
      drawId,
      vars: {},
      prev: undefined,
      input: req.body as Record<string, unknown>,
    };
    try {
      const result = await executePipeline(steps, ctx, deps);
      res.json({ ok: true, result });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  };
}

class CustomRouteRegistry {
  private routes: Map<string, RouteHandler> = new Map();
  private tools: Map<string, RouteHandler> = new Map();

  getRouteHandler(name: string): RouteHandler | undefined {
    return this.routes.get(name);
  }

  getToolHandler(name: string): RouteHandler | undefined {
    return this.tools.get(name);
  }

  /**
   * Reload all custom routes, tools, and macros from disk.
   * Clears existing handlers and re-registers from bootstrap store.
   */
  async reloadAll(deps: PipelineDeps): Promise<void> {
    this.routes.clear();
    this.tools.clear();

    // Reload macros first (they register as actions that routes/tools can use)
    clearMacroActions();
    const macros = await loadAllCustomMacros();
    for (const macro of macros) {
      registerMacroAction(macro.name, macro.macro.steps as PipelineStep[]);
    }

    // Reload custom routes
    const routes = await loadAllCustomRoutes();
    for (const route of routes) {
      this.routes.set(route.name, createPipelineHandler(route.handler.steps as PipelineStep[], deps));
    }

    // Reload custom tools
    const tools = await loadAllCustomTools();
    for (const tool of tools) {
      this.tools.set(tool.name, createPipelineHandler(tool.handler.steps as PipelineStep[], deps));
    }
  }
}

export const routeRegistry = new CustomRouteRegistry();
```

**Step 2: Commit**

```bash
git add server/custom-route-registry.ts
git commit -m "feat: add custom route registry with middleware pattern for hot-reload"
```

---

### Task 5: Integrate Registry into Express — server/index.ts

Replace direct custom route/tool handlers with registry middleware and add the macro write endpoint.

**Files:**
- Modify: `server/index.ts`

**Step 1: Add imports**

Add to the existing imports:

```typescript
import { routeRegistry } from './custom-route-registry.js';
import { writeCustomMacro, loadCustomMacro } from './bootstrap-store.js';
import { validateMacroDefinition } from './bootstrap-validator.js';
```

**Step 2: Add ASSET_TYPE_MAP entry for macro**

Add to `ASSET_TYPE_MAP` (around line 610):

```typescript
'macro': 'custom-macro',
'custom-macro': 'custom-macro',
```

**Step 3: Add write-macro bootstrap route**

After the `write-custom-route` route (around line 605), add:

```typescript
// --- Bootstrap: Write Custom Macro ---

app.post('/api/svg/:drawId/bootstrap/write-macro', async (req: Request, res: Response) => {
  const { name, definition } = req.body as { name?: string; definition?: any };
  if (!name || !definition) { res.status(400).json({ error: 'Missing name or definition' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  const defCheck = validateMacroDefinition(name, definition);
  if (!defCheck.ok) { res.status(400).json({ error: defCheck.error }); return; }
  try {
    await writeCustomMacro(name, definition);
    res.json({ ok: true, path: `data/bootstrap/custom-macros/${name}.json` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to write macro: ${msg}` });
  }
});
```

**Step 4: Add macro definition endpoint (for MCP server)**

After the `custom-tool-def` route (around line 713), add:

```typescript
app.post('/api/svg/:drawId/bootstrap/macro-def/:macroName', async (req: Request, res: Response) => {
  const macroName = req.params.macroName as string;
  const macro = await loadCustomMacro(macroName);
  if (!macro) { res.status(404).json({ error: `Macro not found: ${macroName}` }); return; }
  res.json(macro);
});
```

**Step 5: Replace custom tool execution handler**

Replace the existing custom tool execution route (lines 666-683) with the registry-based version:

```typescript
app.post('/api/svg/:drawId/custom-tool/:toolName', async (req: Request, res: Response) => {
  const handler = routeRegistry.getToolHandler(req.params.toolName as string);
  if (!handler) {
    res.status(404).json({ error: `Custom tool not found: ${req.params.toolName}` });
    return;
  }
  await handler(req, res);
});
```

**Step 6: Replace custom route execution handler**

Replace the existing custom route execution route (lines 687-704) with the registry-based version:

```typescript
app.post('/api/svg/:drawId/custom/:routeName', async (req: Request, res: Response) => {
  const handler = routeRegistry.getRouteHandler(req.params.routeName as string);
  if (!handler) {
    res.status(404).json({ error: `Custom route not found: ${req.params.routeName}` });
    return;
  }
  await handler(req, res);
});
```

**Step 7: Initialize registry on server startup**

Find where the server starts listening (the `server.listen(PORT, ...)` call) and add before it:

```typescript
// Load custom routes/tools/macros into registry
await routeRegistry.reloadAll(pipelineDeps);
```

**Step 8: Commit**

```bash
git add server/index.ts
git commit -m "feat: integrate route registry, add macro endpoints, replace direct handlers"
```

---

### Task 6: Hot-Reload in Session Manager

Wire up the reload callback so `respawn()` refreshes the global registry before restarting the CLI.

**Files:**
- Modify: `server/session-manager.ts`
- Modify: `server/index.ts`

**Step 1: Add reload callback to SessionManager**

Read `server/session-manager.ts` first. Then add a reload callback mechanism:

```typescript
export class SessionManager {
  private sessions: Map<string, PtyManager> = new Map();
  private onReloadCallback?: () => Promise<void>;

  setOnReload(cb: () => Promise<void>): void {
    this.onReloadCallback = cb;
  }

  // ... existing methods stay the same ...

  async respawn(drawId: string, reason: string): Promise<void> {
    // 1. Reload global registries (custom routes, tools, macros)
    if (this.onReloadCallback) {
      await this.onReloadCallback();
    }
    // 2. Respawn only this session's CLI
    const manager = this.sessions.get(drawId);
    if (!manager) throw new Error(`No session for drawId: ${drawId}`);
    await manager.respawn(reason);
  }
}
```

**Step 2: Wire up in index.ts**

In `server/index.ts`, after creating the `sessionManager` instance and the `routeRegistry.reloadAll()` call, add:

```typescript
sessionManager.setOnReload(async () => {
  await routeRegistry.reloadAll(pipelineDeps);
});
```

**Step 3: Commit**

```bash
git add server/session-manager.ts server/index.ts
git commit -m "feat: add hot-reload callback to session manager for global registry refresh"
```

---

### Task 7: MCP Tools — mcp-server.ts

Add `write_macro` tool definition and dynamic macro registration.

**Files:**
- Modify: `server/mcp-server.ts`

**Step 1: Add write_macro tool**

After the `get_asset_history` tool (around line 514), add:

```typescript
server.tool(
  'write_macro',
  'Define a reusable pipeline macro — a named sequence of actions. Available as macro_<name> action in pipelines and as MCP tool after reload_session.',
  {
    name: z.string().describe('Macro name in kebab-case (e.g. "mirror-layer")'),
    definition: z.object({
      description: z.string().describe('What this macro does'),
      input_schema: z.record(z.string(), z.object({
        type: z.string(),
        description: z.string().optional(),
        items: z.any().optional(),
        optional: z.boolean().optional(),
      })).describe('Input parameter definitions'),
      macro: z.object({
        steps: z.array(z.object({
          action: z.string().describe('Action name from registry'),
          params: z.record(z.string(), z.any()).optional().describe('Parameters with {{}} template syntax'),
          for_each: z.string().optional().describe('Array to iterate over'),
          store_as: z.string().optional().describe('Variable name to store result'),
        })),
      }),
    }),
  },
  async (params) => textTool('bootstrap/write-macro', params),
);
```

**Step 2: Add dynamic macro registration to registerCustomTools()**

Update `registerCustomTools()` to also register macros. After the custom tools loop (around line 547), add:

```typescript
    // Register custom macros
    const macroAssets = res.data as { custom_macros?: string[] };
    if (macroAssets.custom_macros && macroAssets.custom_macros.length > 0) {
      for (const macroName of macroAssets.custom_macros) {
        const macroRes = await fetch(`${CALLBACK_URL}/bootstrap/macro-def/${macroName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        if (!macroRes.ok) continue;
        const macroDef = await macroRes.json() as {
          name: string;
          description: string;
          input_schema: Record<string, any>;
        };

        server.tool(
          `macro_${macroDef.name}`,
          macroDef.description,
          { params: z.record(z.string(), z.any()).optional().describe('Macro parameters') },
          async ({ params }) => textTool(`custom-tool/${macroDef.name}`, params || {}),
        );
      }
    }
```

Note: Macros execute through the same `custom-tool/:toolName` endpoint since the registry handles both. But actually macros need their own execution path. Let me adjust: macros registered in the route registry are already handled via `routeRegistry.getToolHandler()`. For MCP, we route macro calls through a new pipeline execution path.

Actually, the cleanest approach: When a macro MCP tool is called, it posts to the server which executes the pipeline. We need a macro execution endpoint in index.ts. Add to Step 4 of Task 5 — but let's add it here:

In `server/index.ts`, add a macro execution endpoint:

```typescript
app.post('/api/svg/:drawId/macro/:macroName', async (req: Request, res: Response) => {
  const drawId = req.params.drawId as string;
  const macroName = req.params.macroName as string;
  const macro = await loadCustomMacro(macroName);
  if (!macro) { res.status(404).json({ error: `Macro not found: ${macroName}` }); return; }
  try {
    const ctx: PipelineContext = {
      drawId,
      vars: {},
      prev: undefined,
      input: req.body as Record<string, unknown>,
    };
    const result = await executePipeline(macro.macro.steps as any, ctx, pipelineDeps);
    res.json({ ok: true, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Macro execution failed: ${msg}` });
  }
});
```

Then in `registerCustomTools()`, the macro MCP tool calls:

```typescript
async ({ params }) => textTool(`macro/${macroDef.name}`, params || {}),
```

**Step 3: Commit**

```bash
git add server/mcp-server.ts server/index.ts
git commit -m "feat: add write_macro MCP tool and dynamic macro registration"
```

---

### Task 8: Self-Improvement Agent — System Prompt + Plugin Files

Add the self-improvement decision guide to the system prompt, create the `/review` command and `bootstrap-reviewer` agent.

**Files:**
- Modify: `server/pty-manager.ts`
- Create: `plugins/svg-drawing/commands/review.md`
- Create: `plugins/svg-drawing/agents/bootstrap-reviewer.md`

**Step 1: Update system prompt in pty-manager.ts**

Replace the self-improvement section (lines 129-139) with:

```typescript
      '### Self-Improvement',
      'When your current tools can\'t express your vision:',
      '- list_bootstrap_assets to check existing custom tools/macros',
      '- write_filter / write_style / write_skill to create what you need',
      '- write_custom_tool to define new pipeline-based tools',
      '- write_macro to define reusable multi-step action sequences',
      '- write_custom_route to define new API endpoints',
      '- get_asset_history / rollback_asset to manage versions',
      '- Batch writes, then reload_session once to apply all changes',
      '',
      '### Self-Improvement Decision Guide',
      'Proactively identify opportunities to extend your capabilities:',
      '- Repeating the same 3+ step sequence? → write_macro to encapsulate it',
      '- Need a drawing effect that doesn\'t exist? → write_filter',
      '- Adjusting the same style across layers? → write_style',
      '- Notice a knowledge gap? → write_skill or write_prompt_extension',
      '- Need a higher-level operation? → write_custom_tool',
      '- Use /review for a detailed analysis of improvement opportunities',
```

**Step 2: Create /review command**

Create `plugins/svg-drawing/commands/review.md`:

```markdown
---
description: "Analyze current drawing session for self-improvement opportunities"
---

Use the bootstrap-reviewer agent to analyze the current drawing and identify
opportunities for self-improvement. The agent will:
1. Check existing bootstrap assets (filters, styles, tools, macros)
2. Analyze the current canvas state and layer structure
3. Identify repeated patterns or capability gaps
4. Propose specific new assets with ready-to-use definitions

Pass the current drawId to the agent so it can access the drawing.
Present the agent's recommendations and ask if the user wants to
execute any of the suggested improvements.
```

**Step 3: Create bootstrap-reviewer agent**

Create `plugins/svg-drawing/agents/bootstrap-reviewer.md`:

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
3. **Review defs and colors**: Call list_defs and get_layer_colors to check
   for repeated patterns in gradients, filters, and color usage
4. **Check composition**: Call critique_composition to identify quality issues
   that custom tools could address

## Output Format

Provide a structured report:

### Existing Assets Summary
List what's already available as custom filters, styles, tools, and macros.

### Identified Opportunities
For each opportunity, provide:
- **Type**: filter / style / tool / macro / skill
- **Name**: Suggested kebab-case name
- **Rationale**: Why this would help the current drawing
- **Definition**: Ready-to-use parameters for the corresponding write_* tool

### Recommended Actions
Ordered list of write_* calls the artist should execute, followed by
a single reload_session. Format each as a concrete tool call example.

Keep suggestions practical and specific. Only suggest improvements that
would clearly benefit the current drawing session. Prefer macros for
repeated step sequences and filters for visual effects.
```

**Step 4: Commit**

```bash
git add server/pty-manager.ts plugins/svg-drawing/commands/review.md plugins/svg-drawing/agents/bootstrap-reviewer.md
git commit -m "feat: add self-improvement decision guide, /review command, and bootstrap-reviewer agent"
```

---

### Task 9: Update CLAUDE.md Documentation

Update the project documentation to reflect Phase 3 additions.

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update MCP tool count**

Change "33+ MCP tools" to "34+ MCP tools" wherever it appears (add 1 for write_macro + dynamic macro_* tools).

**Step 2: Add macro mentions**

- Add `write_macro` to the bootstrap MCP tools list (update count from 10 to 11)
- Add `custom-macros/` to bootstrap data directory listing
- Add `custom-route-registry.ts` to server file descriptions
- Update self-bootstrapping section to mention macros and hot-reload
- Add `/review` to the commands list
- Add `bootstrap-reviewer` to the agents list

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for Phase 3 — macros, hot-reload, self-improvement agent"
```

---

### Task 10: Integration Tests

Add tests for macros, hot-reload registry, and validation.

**Files:**
- Modify: `e2e/integration/bootstrap-api.spec.ts`

**Step 1: Add macro tests**

After the existing Phase 2 tests (before the closing `});`), add:

```typescript
  // --- Phase 3: Custom macros ---

  test('write-macro creates and macro executes via pipeline', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    await apiContext.post(`/api/svg/${drawId}`, {
      data: { svg: '<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"><defs></defs><g id="layer-test" data-name="test"><circle cx="100" cy="100" r="50" fill="red"/></g></svg>' },
    });

    // Write macro
    const writeRes = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-macro`, {
      data: {
        name: 'get-info-macro',
        definition: {
          description: 'Get canvas info via macro',
          input_schema: {},
          macro: {
            steps: [{ action: 'get_canvas_info' }],
          },
        },
      },
    });
    expect(writeRes.ok()).toBeTruthy();

    // Execute macro
    const execRes = await apiContext.post(`/api/svg/${drawId}/macro/get-info-macro`, { data: {} });
    expect(execRes.ok()).toBeTruthy();
    const body = await execRes.json();
    expect(body.ok).toBe(true);
    expect(body.result).toBeDefined();
  });

  test('write-macro rejects self-referencing macro', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-macro`, {
      data: {
        name: 'recursive-macro',
        definition: {
          description: 'Bad recursive macro',
          input_schema: {},
          macro: {
            steps: [{ action: 'macro_recursive-macro' }],
          },
        },
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('cannot reference itself');
  });

  test('list returns custom_macros', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    await apiContext.post(`/api/svg/${drawId}/bootstrap/write-macro`, {
      data: {
        name: 'list-test-macro',
        definition: {
          description: 'Test',
          input_schema: {},
          macro: { steps: [{ action: 'get_canvas_info' }] },
        },
      },
    });
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/list`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.custom_macros).toBeInstanceOf(Array);
    expect(body.custom_macros).toContain('list-test-macro');
  });

  test('macro versioning and history work', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    // Write v1
    await apiContext.post(`/api/svg/${drawId}/bootstrap/write-macro`, {
      data: {
        name: 'versioned-macro',
        definition: {
          description: 'V1',
          input_schema: {},
          macro: { steps: [{ action: 'get_canvas_info' }] },
        },
      },
    });
    // Write v2
    await apiContext.post(`/api/svg/${drawId}/bootstrap/write-macro`, {
      data: {
        name: 'versioned-macro',
        definition: {
          description: 'V2',
          input_schema: {},
          macro: { steps: [{ action: 'get_layers' }] },
        },
      },
    });
    // Check history
    const historyRes = await apiContext.post(`/api/svg/${drawId}/bootstrap/history`, {
      data: { type: 'macro', name: 'versioned-macro' },
    });
    expect(historyRes.ok()).toBeTruthy();
    const body = await historyRes.json();
    expect(body.versions.length).toBe(1);
    expect(body.versions[0].version).toBe(1);
  });
```

**Step 2: Run tests**

Run: `npx playwright test e2e/integration/bootstrap-api.spec.ts --project=integration`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add e2e/integration/bootstrap-api.spec.ts
git commit -m "test: add Phase 3 integration tests — macros, validation, versioning"
```

---

### Task 11: Final Verification

Run the full integration test suite to confirm no regressions.

**Step 1: Run all integration tests**

Run: `npx playwright test --project=integration`
Expected: All tests PASS, no regressions

**Step 2: Verify server starts clean**

Run: `timeout 5 npx tsx server/index.ts 2>&1 || true`
Expected: No startup errors

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address any issues found during final verification"
```
