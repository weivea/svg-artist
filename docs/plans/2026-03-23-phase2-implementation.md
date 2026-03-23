# Phase 2: Custom MCP Tools, API Routes & Asset Versioning — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend self-bootstrapping with custom MCP tools, custom API routes (both using a pipeline engine), and version history + rollback for all bootstrap assets.

**Architecture:** Pipeline engine executes JSON-defined step sequences against a sandboxed action registry mapping to existing SvgEngine/service operations. Versioning uses a `versions/` subdirectory per asset type with monotonically increasing version numbers. Custom tools register as MCP tools with `custom_` prefix on reload; custom routes mount at `/api/svg/:drawId/custom/<name>`.

**Tech Stack:** TypeScript (ES modules, tsx), Express 5, MCP SDK (@modelcontextprotocol/sdk), Zod, Playwright (integration tests)

---

### Task 1: Asset Versioning — bootstrap-store.ts

Add version archiving, rollback, and history to `server/bootstrap-store.ts`. This is the foundation all other tasks depend on.

**Files:**
- Modify: `server/bootstrap-store.ts` (197 lines)
- Test: `e2e/integration/bootstrap-api.spec.ts`

**Step 1: Write the failing test for version archiving**

Add to `e2e/integration/bootstrap-api.spec.ts` before the closing `});`:

```typescript
  // --- Phase 2: Version history ---

  test('writing a filter twice creates version history', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    // Write v1
    await apiContext.post(`/api/svg/${drawId}/bootstrap/write-filter`, {
      data: {
        name: 'versioned-filter',
        definition: {
          description: 'V1',
          svg_template: '<filter id="{{id}}"><feGaussianBlur stdDeviation="{{blur:1}}"/></filter>',
        },
      },
    });
    // Write v2 (triggers archive of v1)
    await apiContext.post(`/api/svg/${drawId}/bootstrap/write-filter`, {
      data: {
        name: 'versioned-filter',
        definition: {
          description: 'V2',
          svg_template: '<filter id="{{id}}"><feGaussianBlur stdDeviation="{{blur:5}}"/></filter>',
        },
      },
    });
    // Check history
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/history`, {
      data: { type: 'filter', name: 'versioned-filter' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.current_version).toBe(2);
    expect(body.versions).toBeInstanceOf(Array);
    expect(body.versions.length).toBe(1);
    expect(body.versions[0].version).toBe(1);
  });
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/bootstrap-api.spec.ts --project=integration -g "version history"`
Expected: FAIL — 404 on `/bootstrap/history` endpoint (doesn't exist yet)

**Step 3: Add versioning infrastructure to bootstrap-store.ts**

Add these constants after line 14 (`PROMPT_EXTENSIONS_DIR`):

```typescript
const CUSTOM_TOOLS_DIR = join(BOOTSTRAP_DIR, 'custom-tools');
const CUSTOM_ROUTES_DIR = join(BOOTSTRAP_DIR, 'custom-routes');

const MAX_VERSIONS = 10;
```

Add these new interfaces after the `BootstrapAssets` interface (after line 43):

```typescript
export interface CustomToolDef {
  name: string;
  description: string;
  input_schema: Record<string, { type: string; description?: string; items?: any; optional?: boolean }>;
  handler: {
    type: 'pipeline';
    steps: PipelineStepDef[];
  };
  created_by: string;
  version: number;
}

export interface CustomRouteDef {
  name: string;
  path: string;
  method: 'POST';
  description: string;
  input_schema: Record<string, { type: string; description?: string; items?: any; optional?: boolean }>;
  handler: {
    type: 'pipeline';
    steps: PipelineStepDef[];
  };
  created_by: string;
  version: number;
}

export interface PipelineStepDef {
  action: string;
  params?: Record<string, any>;
  for_each?: string;
  store_as?: string;
}

export interface VersionInfo {
  version: number;
  archived_at: string;
}
```

Update `BootstrapAssets` interface to include new types:

```typescript
export interface BootstrapAssets {
  skills: string[];
  custom_filters: string[];
  custom_styles: string[];
  custom_tools: string[];
  custom_routes: string[];
  prompt_extensions: string[];
}
```

Add the core versioning helper functions after `listMdFiles` (after line 65):

```typescript
// --- Version management helpers ---

async function archiveBeforeWrite(assetDir: string, name: string, ext: string): Promise<void> {
  const currentPath = join(assetDir, `${name}${ext}`);
  try {
    const raw = await readFile(currentPath, 'utf8');
    const parsed = ext === '.json' ? JSON.parse(raw) : { content: raw };
    const version = parsed.version || 1;
    const versionsDir = join(assetDir, 'versions');
    await ensureDir(versionsDir);
    const archiveData = ext === '.json'
      ? { ...parsed, archived_at: new Date().toISOString() }
      : raw;
    const archivePath = join(versionsDir, `${name}.v${version}${ext}`);
    await writeFile(archivePath, ext === '.json' ? JSON.stringify(archiveData, null, 2) : archiveData, 'utf8');
    // Prune old versions
    await pruneVersions(versionsDir, name, ext);
  } catch {
    // File doesn't exist yet — nothing to archive
  }
}

async function pruneVersions(versionsDir: string, name: string, ext: string): Promise<void> {
  try {
    const files = await readdir(versionsDir);
    const pattern = new RegExp(`^${escapeRegex(name)}\\.v(\\d+)${escapeRegex(ext)}$`);
    const versionFiles = files
      .map(f => ({ file: f, match: f.match(pattern) }))
      .filter(v => v.match)
      .map(v => ({ file: v.file, version: parseInt(v.match![1], 10) }))
      .sort((a, b) => a.version - b.version);
    if (versionFiles.length > MAX_VERSIONS) {
      const toDelete = versionFiles.slice(0, versionFiles.length - MAX_VERSIONS);
      for (const { file } of toDelete) {
        await unlink(join(versionsDir, file)).catch(() => {});
      }
    }
  } catch {
    // versions dir doesn't exist — nothing to prune
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getAssetHistory(
  type: string,
  name: string,
): Promise<{ current_version: number; versions: VersionInfo[] }> {
  const { dir, ext } = getAssetDirAndExt(type);
  const currentPath = join(dir, `${name}${ext}`);
  let currentVersion = 0;
  try {
    const raw = await readFile(currentPath, 'utf8');
    if (ext === '.json') {
      currentVersion = JSON.parse(raw).version || 1;
    } else {
      currentVersion = 1; // MD files start at 1
    }
  } catch {
    // Asset doesn't exist
  }
  const versionsDir = join(dir, 'versions');
  const versions: VersionInfo[] = [];
  try {
    const files = await readdir(versionsDir);
    const pattern = new RegExp(`^${escapeRegex(name)}\\.v(\\d+)${escapeRegex(ext)}$`);
    for (const file of files) {
      const m = file.match(pattern);
      if (!m) continue;
      const version = parseInt(m[1], 10);
      let archivedAt = '';
      if (ext === '.json') {
        try {
          const raw = await readFile(join(versionsDir, file), 'utf8');
          archivedAt = JSON.parse(raw).archived_at || '';
        } catch { /* ignore */ }
      } else {
        const { mtime } = await stat(join(versionsDir, file));
        archivedAt = mtime.toISOString();
      }
      versions.push({ version, archived_at: archivedAt });
    }
    versions.sort((a, b) => a.version - b.version);
  } catch {
    // No versions dir
  }
  return { current_version: currentVersion, versions };
}

export async function rollbackAsset(
  type: string,
  name: string,
  targetVersion?: number,
): Promise<{ rolled_back_from: number; content_from_version: number; new_version: number }> {
  const { dir, ext } = getAssetDirAndExt(type);
  const versionsDir = join(dir, 'versions');

  // Determine target version
  if (targetVersion === undefined) {
    // Roll back to the latest archived version
    const history = await getAssetHistory(type, name);
    if (history.versions.length === 0) {
      throw new Error(`No version history found for ${type}/${name}`);
    }
    targetVersion = history.versions[history.versions.length - 1].version;
  }

  // Read target version
  const targetPath = join(versionsDir, `${name}.v${targetVersion}${ext}`);
  let targetContent: string;
  try {
    targetContent = await readFile(targetPath, 'utf8');
  } catch {
    throw new Error(`Version ${targetVersion} not found for ${type}/${name}`);
  }

  // Archive current version before overwriting
  await archiveBeforeWrite(dir, name, ext);

  // Read current version number
  const currentPath = join(dir, `${name}${ext}`);
  let currentVersion = 0;
  try {
    const raw = await readFile(currentPath, 'utf8');
    currentVersion = ext === '.json' ? (JSON.parse(raw).version || 1) : 1;
  } catch { /* doesn't exist */ }

  const newVersion = currentVersion + 1;

  // Write the rolled-back content with new version number
  if (ext === '.json') {
    const parsed = JSON.parse(targetContent);
    delete parsed.archived_at;
    parsed.version = newVersion;
    await writeFile(currentPath, JSON.stringify(parsed, null, 2), 'utf8');
  } else {
    // For skills, we handle versioning via SKILL.md (no inline version)
    if (type === 'skill') {
      await writeSkillVersioned(name, targetContent, newVersion);
    } else {
      await writeFile(currentPath, targetContent, 'utf8');
    }
  }

  return {
    rolled_back_from: currentVersion,
    content_from_version: targetVersion,
    new_version: newVersion,
  };
}

function getAssetDirAndExt(type: string): { dir: string; ext: string } {
  switch (type) {
    case 'filter': return { dir: CUSTOM_FILTERS_DIR, ext: '.json' };
    case 'style': return { dir: CUSTOM_STYLES_DIR, ext: '.json' };
    case 'tool': return { dir: CUSTOM_TOOLS_DIR, ext: '.json' };
    case 'route': return { dir: CUSTOM_ROUTES_DIR, ext: '.json' };
    case 'skill': return { dir: SKILLS_DIR, ext: '.md' };
    case 'prompt': return { dir: PROMPT_EXTENSIONS_DIR, ext: '.md' };
    default: throw new Error(`Unknown asset type: ${type}`);
  }
}

// Skill-specific version helper: store version in versions dir with SKILL naming
async function writeSkillVersioned(name: string, content: string, _version: number): Promise<void> {
  const skillDir = join(SKILLS_DIR, name);
  await ensureDir(skillDir);
  await writeFile(join(skillDir, 'SKILL.md'), content, 'utf8');
}
```

Add `unlink` and `stat` to the fs imports at line 1:

```typescript
import { readFile, writeFile, mkdir, readdir, unlink, stat } from 'fs/promises';
```

Now modify existing write functions to archive before write. For `writeCustomFilter` (line 86–108), replace the version increment logic:

```typescript
export async function writeCustomFilter(name: string, definition: {
  description: string;
  svg_template: string;
  params_schema?: Record<string, { type: string; default: number | string; min?: number; max?: number }>;
}): Promise<void> {
  await ensureDir(CUSTOM_FILTERS_DIR);
  await archiveBeforeWrite(CUSTOM_FILTERS_DIR, name, '.json');
  const data: CustomFilterDef = {
    name,
    description: definition.description,
    svg_template: definition.svg_template,
    params_schema: definition.params_schema as CustomFilterDef['params_schema'],
    created_by: 'claude-bootstrap',
    version: 1,
  };
  try {
    const existing = await readFile(join(CUSTOM_FILTERS_DIR, `${name}.json`), 'utf8');
    const prev = JSON.parse(existing) as CustomFilterDef;
    data.version = (prev.version || 0) + 1;
  } catch {
    // New file
  }
  await writeFile(join(CUSTOM_FILTERS_DIR, `${name}.json`), JSON.stringify(data, null, 2), 'utf8');
}
```

Same pattern for `writeCustomStyle` (line 125–145) — add `await archiveBeforeWrite(CUSTOM_STYLES_DIR, name, '.json');` after `ensureDir`.

For `writeSkill` (line 69–73) — add archiving for skills:

```typescript
export async function writeSkill(name: string, content: string): Promise<void> {
  const skillDir = join(SKILLS_DIR, name);
  await ensureDir(skillDir);
  // Archive existing skill if present
  const skillPath = join(skillDir, 'SKILL.md');
  try {
    const existing = await readFile(skillPath, 'utf8');
    const versionsDir = join(skillDir, 'versions');
    await ensureDir(versionsDir);
    // Count existing versions to determine version number
    const files = await readdir(versionsDir).catch(() => [] as string[]);
    const versionNum = files.filter(f => f.match(/^SKILL\.v\d+\.md$/)).length + 1;
    await writeFile(join(versionsDir, `SKILL.v${versionNum}.md`), existing, 'utf8');
  } catch {
    // No existing skill
  }
  await writeFile(skillPath, content, 'utf8');
}
```

For `writePromptExtension` (line 162–164) — add archiving:

```typescript
export async function writePromptExtension(name: string, content: string): Promise<void> {
  await ensureDir(PROMPT_EXTENSIONS_DIR);
  await archiveBeforeWrite(PROMPT_EXTENSIONS_DIR, name, '.md');
  await writeFile(join(PROMPT_EXTENSIONS_DIR, `${name}.md`), content, 'utf8');
}
```

**Step 4: Add custom-tools and custom-routes CRUD**

Add after the Prompt Extensions section (after line 184):

```typescript
// --- Custom Tools ---

export async function writeCustomTool(name: string, definition: {
  description: string;
  input_schema: Record<string, any>;
  handler: { type: 'pipeline'; steps: PipelineStepDef[] };
}): Promise<void> {
  await ensureDir(CUSTOM_TOOLS_DIR);
  await archiveBeforeWrite(CUSTOM_TOOLS_DIR, name, '.json');
  const data: CustomToolDef = {
    name,
    description: definition.description,
    input_schema: definition.input_schema,
    handler: definition.handler,
    created_by: 'claude-bootstrap',
    version: 1,
  };
  try {
    const existing = await readFile(join(CUSTOM_TOOLS_DIR, `${name}.json`), 'utf8');
    const prev = JSON.parse(existing) as CustomToolDef;
    data.version = (prev.version || 0) + 1;
  } catch {
    // New file
  }
  await writeFile(join(CUSTOM_TOOLS_DIR, `${name}.json`), JSON.stringify(data, null, 2), 'utf8');
}

export async function loadCustomTool(name: string): Promise<CustomToolDef | null> {
  try {
    const raw = await readFile(join(CUSTOM_TOOLS_DIR, `${name}.json`), 'utf8');
    return JSON.parse(raw) as CustomToolDef;
  } catch {
    return null;
  }
}

export async function listCustomTools(): Promise<string[]> {
  return listJsonFiles(CUSTOM_TOOLS_DIR);
}

export async function loadAllCustomTools(): Promise<CustomToolDef[]> {
  const names = await listCustomTools();
  const tools: CustomToolDef[] = [];
  for (const name of names) {
    const tool = await loadCustomTool(name);
    if (tool) tools.push(tool);
  }
  return tools;
}

// --- Custom Routes ---

export async function writeCustomRoute(name: string, definition: {
  path: string;
  method: 'POST';
  description: string;
  input_schema: Record<string, any>;
  handler: { type: 'pipeline'; steps: PipelineStepDef[] };
}): Promise<void> {
  await ensureDir(CUSTOM_ROUTES_DIR);
  await archiveBeforeWrite(CUSTOM_ROUTES_DIR, name, '.json');
  const data: CustomRouteDef = {
    name,
    path: definition.path,
    method: definition.method,
    description: definition.description,
    input_schema: definition.input_schema,
    handler: definition.handler,
    created_by: 'claude-bootstrap',
    version: 1,
  };
  try {
    const existing = await readFile(join(CUSTOM_ROUTES_DIR, `${name}.json`), 'utf8');
    const prev = JSON.parse(existing) as CustomRouteDef;
    data.version = (prev.version || 0) + 1;
  } catch {
    // New file
  }
  await writeFile(join(CUSTOM_ROUTES_DIR, `${name}.json`), JSON.stringify(data, null, 2), 'utf8');
}

export async function loadCustomRoute(name: string): Promise<CustomRouteDef | null> {
  try {
    const raw = await readFile(join(CUSTOM_ROUTES_DIR, `${name}.json`), 'utf8');
    return JSON.parse(raw) as CustomRouteDef;
  } catch {
    return null;
  }
}

export async function listCustomRoutes(): Promise<string[]> {
  return listJsonFiles(CUSTOM_ROUTES_DIR);
}

export async function loadAllCustomRoutes(): Promise<CustomRouteDef[]> {
  const names = await listCustomRoutes();
  const routes: CustomRouteDef[] = [];
  for (const name of names) {
    const route = await loadCustomRoute(name);
    if (route) routes.push(route);
  }
  return routes;
}
```

Update `listAllAssets` to include new types:

```typescript
export async function listAllAssets(): Promise<BootstrapAssets> {
  const [skills, custom_filters, custom_styles, custom_tools, custom_routes, prompt_extensions] = await Promise.all([
    listSkills(),
    listCustomFilters(),
    listCustomStyles(),
    listCustomTools(),
    listCustomRoutes(),
    listPromptExtensions(),
  ]);
  return { skills, custom_filters, custom_styles, custom_tools, custom_routes, prompt_extensions };
}
```

**Step 5: Run test to verify it passes**

Run: `npx playwright test e2e/integration/bootstrap-api.spec.ts --project=integration -g "version history"`
Expected: Still FAIL — need to add the `/bootstrap/history` endpoint (Task 4)

**Step 6: Commit**

```bash
git add server/bootstrap-store.ts
git commit -m "feat: add version archiving, rollback, and custom tool/route CRUD to bootstrap store"
```

---

### Task 2: Pipeline Engine — server/pipeline-engine.ts

Create the sandboxed pipeline execution engine.

**Files:**
- Create: `server/pipeline-engine.ts`
- Test: `e2e/integration/bootstrap-api.spec.ts`

**Step 1: Write the failing test for pipeline execution via custom tool**

Add to `e2e/integration/bootstrap-api.spec.ts`:

```typescript
  // --- Phase 2: Custom tools ---

  test('write-custom-tool creates a tool definition', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-custom-tool`, {
      data: {
        name: 'test-batch-tool',
        definition: {
          description: 'Test batch tool',
          input_schema: {
            layer_ids: { type: 'array', items: { type: 'string' }, description: 'Layer IDs' },
          },
          handler: {
            type: 'pipeline',
            steps: [
              { action: 'get_layers' },
            ],
          },
        },
      },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('custom tool executes pipeline and returns result', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    // Set up SVG with a layer
    await apiContext.post(`/api/svg/${drawId}`, {
      data: { svg: '<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"><defs></defs><g id="layer-test" data-name="test"><circle cx="100" cy="100" r="50" fill="red"/></g></svg>' },
    });

    // Write a custom tool that lists layers
    await apiContext.post(`/api/svg/${drawId}/bootstrap/write-custom-tool`, {
      data: {
        name: 'list-all-layers',
        definition: {
          description: 'List all layers',
          input_schema: {},
          handler: {
            type: 'pipeline',
            steps: [{ action: 'get_layers' }],
          },
        },
      },
    });

    // Execute the custom tool
    const res = await apiContext.post(`/api/svg/${drawId}/custom-tool/list-all-layers`, {
      data: {},
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.result).toBeDefined();
  });
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/bootstrap-api.spec.ts --project=integration -g "custom tool"`
Expected: FAIL — endpoints don't exist

**Step 3: Create pipeline-engine.ts**

```typescript
import type { SvgEngine } from './svg-engine.js';
import type { DrawingStore } from './drawing-store.js';
import { generateFilterOrCustom } from './filter-templates.js';
import type { StylePreset } from './style-presets.js';
import { renderSvgToPng, renderLayerToPng } from './png-renderer.js';

export interface PipelineStep {
  action: string;
  params?: Record<string, any>;
  for_each?: string;
  store_as?: string;
}

export interface PipelineContext {
  inputs: Record<string, any>;
  variables: Record<string, any>;
  prev: any;
  drawId: string;
}

type ActionHandler = (
  params: Record<string, any>,
  ctx: PipelineContext,
  deps: PipelineDeps,
) => Promise<any>;

export interface PipelineDeps {
  getSvgEngine: (drawId: string) => Promise<{ engine: SvgEngine; svgContent: string } | null>;
  saveSvg: (drawId: string, engine: SvgEngine) => Promise<void>;
  broadcastSvg: (drawId: string, svg: string) => void;
}

const ACTION_REGISTRY: Record<string, ActionHandler> = {
  get_canvas_info: async (_params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    return result.engine.getCanvasInfo();
  },

  get_layers: async (_params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    return result.engine.listLayers();
  },

  get_layer: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    const content = result.engine.getLayer(params.layer_id);
    if (content === null) throw new Error(`Layer not found: ${params.layer_id}`);
    return content;
  },

  add_layer: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    const layerId = result.engine.addLayer(params.name, params.content, params.parent_id, params.position);
    if (!layerId) throw new Error('Failed to add layer');
    await deps.saveSvg(ctx.drawId, result.engine);
    return { layer_id: layerId };
  },

  update_layer: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    const ok = result.engine.updateLayer(params.layer_id, params.content);
    if (!ok) throw new Error(`Layer not found: ${params.layer_id}`);
    await deps.saveSvg(ctx.drawId, result.engine);
    return { ok: true };
  },

  delete_layer: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    const ok = result.engine.deleteLayer(params.layer_id);
    if (!ok) throw new Error(`Layer not found: ${params.layer_id}`);
    await deps.saveSvg(ctx.drawId, result.engine);
    return { ok: true };
  },

  transform_layer: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    const ok = result.engine.transformLayer(params.layer_id, {
      translate: params.translate,
      scale: params.scale,
      rotate: params.rotate,
    });
    if (!ok) throw new Error(`Layer not found: ${params.layer_id}`);
    await deps.saveSvg(ctx.drawId, result.engine);
    return { ok: true };
  },

  style_layer: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    const { layer_id, ...styles } = params;
    const ok = result.engine.setLayerStyle(layer_id, styles);
    if (!ok) throw new Error(`Layer not found: ${layer_id}`);
    await deps.saveSvg(ctx.drawId, result.engine);
    return { ok: true };
  },

  move_layer: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    const ok = result.engine.moveLayer(params.layer_id, params.position, params.target_parent_id);
    if (!ok) throw new Error(`Layer not found: ${params.layer_id}`);
    await deps.saveSvg(ctx.drawId, result.engine);
    return { ok: true };
  },

  duplicate_layer: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    const newId = result.engine.duplicateLayer(params.layer_id, params.new_name, params.transform);
    if (!newId) throw new Error(`Layer not found: ${params.layer_id}`);
    await deps.saveSvg(ctx.drawId, result.engine);
    return { layer_id: newId };
  },

  set_opacity: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    const ok = result.engine.setLayerOpacity(params.layer_id, params.opacity);
    if (!ok) throw new Error(`Layer not found: ${params.layer_id}`);
    await deps.saveSvg(ctx.drawId, result.engine);
    return { ok: true };
  },

  apply_filter: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    const filterResult = await generateFilterOrCustom(params.filter_type, params.params);
    if (!filterResult) throw new Error(`Unknown filter type: ${params.filter_type}`);
    const applyResult = result.engine.applyFilterDef(params.layer_id, filterResult.filterId, filterResult.filterSvg);
    if (!applyResult.ok) throw new Error(applyResult.error || 'Failed to apply filter');
    await deps.saveSvg(ctx.drawId, result.engine);
    return { filter_id: filterResult.filterId };
  },

  apply_style: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    const styleResult = result.engine.applyStyleToLayers(params.preset as StylePreset, params.layers);
    if (!styleResult.ok) throw new Error(styleResult.error || 'Failed to apply style');
    await deps.saveSvg(ctx.drawId, result.engine);
    return { affected_layers: styleResult.affectedLayers };
  },

  manage_defs: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    const ok = result.engine.manageDefs(params.action, params.id, params.content);
    if (!ok) throw new Error('Defs operation failed');
    await deps.saveSvg(ctx.drawId, result.engine);
    return { ok: true };
  },

  set_viewbox: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    result.engine.setViewBox(params.x, params.y, params.width, params.height);
    await deps.saveSvg(ctx.drawId, result.engine);
    return { ok: true };
  },

  get_svg_source: async (_params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    return { svg: result.engine.serialize() };
  },

  compute_bbox: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    const bbox = result.engine.getElementBBox(params.element_id);
    if (!bbox) throw new Error(`Element not found: ${params.element_id}`);
    return bbox;
  },

  preview_png: async (params, ctx, deps) => {
    const result = await deps.getSvgEngine(ctx.drawId);
    if (!result) throw new Error('Drawing not found');
    const png = renderSvgToPng(result.svgContent, params.width || 800, params.height);
    return { image: png.toString('base64') };
  },
};

export function getRegisteredActions(): string[] {
  return Object.keys(ACTION_REGISTRY);
}

// --- Template resolution ---

function resolveTemplate(template: string, ctx: PipelineContext): any {
  if (typeof template !== 'string') return template;
  // Exact match: {{varName}} → return the raw value (not stringified)
  const exactMatch = template.match(/^\{\{(\$?\w+)\}\}$/);
  if (exactMatch) {
    const key = exactMatch[1];
    return resolveVariable(key, ctx);
  }
  // Partial replacement: strings containing {{...}}
  return template.replace(/\{\{(\$?\w+)\}\}/g, (_match, key) => {
    const val = resolveVariable(key, ctx);
    return val === undefined ? '' : String(val);
  });
}

function resolveVariable(key: string, ctx: PipelineContext): any {
  if (key === '$prev') return ctx.prev;
  if (key === '$item') return ctx.variables['$item'];
  if (key === '$index') return ctx.variables['$index'];
  if (key.startsWith('$')) return ctx.variables[key];
  if (key in ctx.inputs) return ctx.inputs[key];
  return undefined;
}

function resolveParams(params: Record<string, any> | undefined, ctx: PipelineContext): Record<string, any> {
  if (!params) return {};
  const resolved: Record<string, any> = {};
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'string') {
      resolved[k] = resolveTemplate(v, ctx);
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      resolved[k] = resolveParams(v, ctx);
    } else {
      resolved[k] = v;
    }
  }
  return resolved;
}

// --- Pipeline executor ---

export async function executePipeline(
  steps: PipelineStep[],
  inputs: Record<string, any>,
  drawId: string,
  deps: PipelineDeps,
): Promise<any> {
  const ctx: PipelineContext = { inputs, variables: {}, prev: null, drawId };

  for (const step of steps) {
    const handler = ACTION_REGISTRY[step.action];
    if (!handler) {
      throw new Error(`Unknown pipeline action: ${step.action}. Available: ${Object.keys(ACTION_REGISTRY).join(', ')}`);
    }

    if (step.for_each) {
      const items = resolveTemplate(step.for_each, ctx);
      if (!Array.isArray(items)) {
        throw new Error(`for_each target "${step.for_each}" did not resolve to an array`);
      }
      const results: any[] = [];
      for (let i = 0; i < items.length; i++) {
        ctx.variables['$item'] = items[i];
        ctx.variables['$index'] = i;
        const resolvedParams = resolveParams(step.params, ctx);
        results.push(await handler(resolvedParams, ctx, deps));
      }
      delete ctx.variables['$item'];
      delete ctx.variables['$index'];
      ctx.prev = results;
    } else {
      const resolvedParams = resolveParams(step.params, ctx);
      ctx.prev = await handler(resolvedParams, ctx, deps);
    }

    if (step.store_as) {
      ctx.variables[`$${step.store_as}`] = ctx.prev;
    }
  }

  return ctx.prev;
}
```

**Step 4: Run test to verify it compiles**

Run: `npx tsx server/pipeline-engine.ts` (should compile without runtime errors)

**Step 5: Commit**

```bash
git add server/pipeline-engine.ts
git commit -m "feat: add pipeline execution engine with sandboxed action registry"
```

---

### Task 3: Validation — bootstrap-validator.ts

Add validation for custom tools, custom routes, and rollback.

**Files:**
- Modify: `server/bootstrap-validator.ts` (101 lines)

**Step 1: Write the failing test**

Add to `e2e/integration/bootstrap-api.spec.ts`:

```typescript
  test('write-custom-tool rejects invalid action in pipeline', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-custom-tool`, {
      data: {
        name: 'bad-tool',
        definition: {
          description: 'Bad tool',
          input_schema: {},
          handler: {
            type: 'pipeline',
            steps: [{ action: 'exec_arbitrary_code' }],
          },
        },
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Unknown action');
  });

  test('write-custom-route rejects path not starting with /custom/', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-custom-route`, {
      data: {
        name: 'bad-route',
        definition: {
          path: '/api/evil',
          method: 'POST',
          description: 'Evil route',
          input_schema: {},
          handler: { type: 'pipeline', steps: [{ action: 'get_layers' }] },
        },
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('/custom/');
  });
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/bootstrap-api.spec.ts --project=integration -g "rejects"`
Expected: FAIL — endpoints don't exist

**Step 3: Add validators to bootstrap-validator.ts**

Add at the end of the file (after line 100):

```typescript
import { getRegisteredActions } from './pipeline-engine.js';

const MAX_TOOL_SIZE = 50 * 1024; // 50KB

export function validateCustomToolDefinition(definition: any): ValidationResult {
  if (!definition || typeof definition !== 'object') {
    return { ok: false, error: 'Tool definition must be an object' };
  }
  if (!definition.description || typeof definition.description !== 'string') {
    return { ok: false, error: 'Tool definition must have a description string' };
  }
  if (!definition.input_schema || typeof definition.input_schema !== 'object') {
    return { ok: false, error: 'Tool definition must have an input_schema object' };
  }
  const handlerResult = validatePipelineHandler(definition.handler);
  if (!handlerResult.ok) return handlerResult;
  if (JSON.stringify(definition).length > MAX_TOOL_SIZE) {
    return { ok: false, error: `Tool definition exceeds ${MAX_TOOL_SIZE / 1024}KB limit` };
  }
  return { ok: true };
}

export function validateCustomRouteDefinition(definition: any): ValidationResult {
  if (!definition || typeof definition !== 'object') {
    return { ok: false, error: 'Route definition must be an object' };
  }
  if (!definition.path || typeof definition.path !== 'string') {
    return { ok: false, error: 'Route definition must have a path string' };
  }
  if (!definition.path.startsWith('/custom/')) {
    return { ok: false, error: 'Route path must start with /custom/' };
  }
  if (definition.method !== 'POST') {
    return { ok: false, error: 'Route method must be POST' };
  }
  if (!definition.description || typeof definition.description !== 'string') {
    return { ok: false, error: 'Route definition must have a description string' };
  }
  if (!definition.input_schema || typeof definition.input_schema !== 'object') {
    return { ok: false, error: 'Route definition must have an input_schema object' };
  }
  const handlerResult = validatePipelineHandler(definition.handler);
  if (!handlerResult.ok) return handlerResult;
  if (JSON.stringify(definition).length > MAX_TOOL_SIZE) {
    return { ok: false, error: `Route definition exceeds ${MAX_TOOL_SIZE / 1024}KB limit` };
  }
  return { ok: true };
}

function validatePipelineHandler(handler: any): ValidationResult {
  if (!handler || typeof handler !== 'object') {
    return { ok: false, error: 'Handler must be an object' };
  }
  if (handler.type !== 'pipeline') {
    return { ok: false, error: 'Handler type must be "pipeline"' };
  }
  if (!Array.isArray(handler.steps) || handler.steps.length === 0) {
    return { ok: false, error: 'Handler must have a non-empty steps array' };
  }
  const validActions = getRegisteredActions();
  for (let i = 0; i < handler.steps.length; i++) {
    const step = handler.steps[i];
    if (!step.action || typeof step.action !== 'string') {
      return { ok: false, error: `Step ${i}: must have an action string` };
    }
    if (!validActions.includes(step.action)) {
      return { ok: false, error: `Step ${i}: Unknown action "${step.action}". Valid actions: ${validActions.join(', ')}` };
    }
  }
  return { ok: true };
}

export function validateRollback(type: any, name: any, version?: any): ValidationResult {
  const validTypes = ['filter', 'style', 'tool', 'route', 'skill', 'prompt'];
  if (!type || typeof type !== 'string' || !validTypes.includes(type)) {
    return { ok: false, error: `Type must be one of: ${validTypes.join(', ')}` };
  }
  const nameResult = validateName(name);
  if (!nameResult.ok) return nameResult;
  if (version !== undefined) {
    if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
      return { ok: false, error: 'Version must be a positive integer' };
    }
  }
  return { ok: true };
}
```

**Step 4: Commit**

```bash
git add server/bootstrap-validator.ts
git commit -m "feat: add validators for custom tools, routes, and rollback"
```

---

### Task 4: API Routes — server/index.ts

Add the 4 new bootstrap API routes plus custom tool/route execution endpoints.

**Files:**
- Modify: `server/index.ts` (613 lines)

**Step 1: Add imports**

At the top of `server/index.ts`, update the bootstrap imports (lines 17–25):

```typescript
import {
  validateName, validateSkillContent, validateFilterDefinition,
  validateStyleDefinition, validatePromptExtension,
  validateCustomToolDefinition, validateCustomRouteDefinition,
  validateRollback,
} from './bootstrap-validator.js';
import {
  writeSkill, writeCustomFilter, writeCustomStyle,
  writePromptExtension as storeWritePromptExtension,
  writeCustomTool, writeCustomRoute,
  loadCustomTool, loadAllCustomRoutes,
  listAllAssets, getAssetHistory, rollbackAsset,
} from './bootstrap-store.js';
import { executePipeline } from './pipeline-engine.js';
import type { PipelineDeps } from './pipeline-engine.js';
import { SvgEngine } from './svg-engine.js';
```

**Step 2: Add pipeline deps factory**

After the `drawingStore` initialization (after line 40), add:

```typescript
// Pipeline execution dependencies
const pipelineDeps: PipelineDeps = {
  getSvgEngine: async (drawId: string) => {
    const drawing = await drawingStore.get(drawId);
    if (!drawing) return null;
    return { engine: new SvgEngine(drawing.svgContent), svgContent: drawing.svgContent };
  },
  saveSvg: async (drawId: string, engine: SvgEngine) => {
    const svg = engine.serialize();
    await drawingStore.updateSvg(drawId, svg);
    broadcastSvg(drawId, svg);
  },
  broadcastSvg,
};
```

**Step 3: Add new bootstrap routes**

Add after the existing `bootstrap/list` route (after line 547):

```typescript
// --- Phase 2 Bootstrap Routes ---

app.post('/api/svg/:drawId/bootstrap/write-custom-tool', async (req: Request, res: Response) => {
  const { name, definition } = req.body as { name?: string; definition?: any };
  if (!name || !definition) { res.status(400).json({ error: 'Missing name or definition' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  const defCheck = validateCustomToolDefinition(definition);
  if (!defCheck.ok) { res.status(400).json({ error: defCheck.error }); return; }
  try {
    await writeCustomTool(name, definition);
    res.json({ ok: true, path: `data/bootstrap/custom-tools/${name}.json` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to write custom tool: ${msg}` });
  }
});

app.post('/api/svg/:drawId/bootstrap/write-custom-route', async (req: Request, res: Response) => {
  const { name, definition } = req.body as { name?: string; definition?: any };
  if (!name || !definition) { res.status(400).json({ error: 'Missing name or definition' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  const defCheck = validateCustomRouteDefinition(definition);
  if (!defCheck.ok) { res.status(400).json({ error: defCheck.error }); return; }
  try {
    await writeCustomRoute(name, definition);
    res.json({ ok: true, path: `data/bootstrap/custom-routes/${name}.json` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to write custom route: ${msg}` });
  }
});

app.post('/api/svg/:drawId/bootstrap/rollback', async (req: Request, res: Response) => {
  const { type, name, version } = req.body as { type?: string; name?: string; version?: number };
  if (!type || !name) { res.status(400).json({ error: 'Missing type or name' }); return; }
  const check = validateRollback(type, name, version);
  if (!check.ok) { res.status(400).json({ error: check.error }); return; }
  try {
    const result = await rollbackAsset(type, name, version);
    res.json({ ok: true, ...result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: msg });
  }
});

app.post('/api/svg/:drawId/bootstrap/history', async (req: Request, res: Response) => {
  const { type, name } = req.body as { type?: string; name?: string };
  if (!type || !name) { res.status(400).json({ error: 'Missing type or name' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  try {
    const history = await getAssetHistory(type, name);
    res.json(history);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

// --- Custom tool execution endpoint ---
app.post('/api/svg/:drawId/custom-tool/:toolName', async (req: Request, res: Response) => {
  const { drawId, toolName } = req.params;
  const tool = await loadCustomTool(toolName);
  if (!tool) { res.status(404).json({ error: `Custom tool not found: ${toolName}` }); return; }
  try {
    const result = await executePipeline(tool.handler.steps, req.body, drawId, pipelineDeps);
    res.json({ ok: true, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Pipeline execution failed: ${msg}` });
  }
});

// --- Custom route execution (dynamic) ---
app.post('/api/svg/:drawId/custom/:routeName', async (req: Request, res: Response) => {
  const { drawId, routeName } = req.params;
  const { loadCustomRoute } = await import('./bootstrap-store.js');
  const route = await loadCustomRoute(routeName);
  if (!route) { res.status(404).json({ error: `Custom route not found: ${routeName}` }); return; }
  try {
    const result = await executePipeline(route.handler.steps, req.body, drawId, pipelineDeps);
    res.json({ ok: true, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Pipeline execution failed: ${msg}` });
  }
});
```

**Step 4: Run tests to verify they pass**

Run: `npx playwright test e2e/integration/bootstrap-api.spec.ts --project=integration`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add server/index.ts
git commit -m "feat: add Phase 2 bootstrap API routes — custom tools, routes, rollback, history"
```

---

### Task 5: MCP Tools — server/mcp-server.ts

Add 4 new MCP tool definitions and dynamic custom tool registration.

**Files:**
- Modify: `server/mcp-server.ts` (446 lines)

**Step 1: Add new MCP tool definitions**

After the existing bootstrap tools section (after line 434, before `main()`), add:

```typescript
// ---------------------------------------------------------------------------
// Phase 2: Custom Tools, Routes, Versioning (4)
// ---------------------------------------------------------------------------

server.tool(
  'write_custom_tool',
  'Define a new MCP tool with a pipeline handler. The tool becomes available as custom_<name> after reload_session. Pipeline steps call predefined actions (get_layers, apply_filter, transform_layer, etc.).',
  {
    name: z.string().describe('Tool name in kebab-case (e.g. "batch-filter")'),
    definition: z.object({
      description: z.string().describe('What this tool does'),
      input_schema: z.record(z.string(), z.object({
        type: z.string(),
        description: z.string().optional(),
        items: z.any().optional(),
        optional: z.boolean().optional(),
      })).describe('Input parameter definitions'),
      handler: z.object({
        type: z.literal('pipeline'),
        steps: z.array(z.object({
          action: z.string().describe('Action name from registry'),
          params: z.record(z.string(), z.any()).optional().describe('Parameters with {{}} template syntax'),
          for_each: z.string().optional().describe('Array to iterate over'),
          store_as: z.string().optional().describe('Variable name to store result'),
        })),
      }),
    }),
  },
  async (params) => textTool('bootstrap/write-custom-tool', params),
);

server.tool(
  'write_custom_route',
  'Define a new API route with a pipeline handler. Route mounts at /api/svg/:drawId/custom/<name> after reload_session.',
  {
    name: z.string().describe('Route name in kebab-case'),
    definition: z.object({
      path: z.string().describe('Route path (must start with /custom/)'),
      method: z.literal('POST'),
      description: z.string().describe('What this route does'),
      input_schema: z.record(z.string(), z.object({
        type: z.string(),
        description: z.string().optional(),
        items: z.any().optional(),
        optional: z.boolean().optional(),
      })).describe('Input parameter definitions'),
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
  },
  async (params) => textTool('bootstrap/write-custom-route', params),
);

server.tool(
  'rollback_asset',
  'Roll back any bootstrap asset to a previous version. Does NOT auto-reload — call reload_session after.',
  {
    type: z.enum(['filter', 'style', 'tool', 'route', 'skill', 'prompt']).describe('Asset type'),
    name: z.string().describe('Asset name'),
    version: z.number().int().positive().optional().describe('Target version (default: previous)'),
  },
  async (params) => textTool('bootstrap/rollback', params),
);

server.tool(
  'get_asset_history',
  'View version history of a bootstrap asset',
  {
    type: z.enum(['filter', 'style', 'tool', 'route', 'skill', 'prompt']).describe('Asset type'),
    name: z.string().describe('Asset name'),
  },
  async (params) => textTool('bootstrap/history', params),
);
```

**Step 2: Add dynamic custom tool registration**

The MCP SDK's `server.tool()` registers tools statically. Since custom tools need to be available after reload, and `mcp-server.ts` runs fresh each time Claude CLI starts, we add dynamic registration at startup.

Add after the Phase 2 tools section, before `main()`:

```typescript
// ---------------------------------------------------------------------------
// Dynamic custom tool registration (loaded at startup)
// ---------------------------------------------------------------------------

async function registerCustomTools(): Promise<void> {
  try {
    const res = await callApi('bootstrap/list');
    if (!res.ok || !res.data) return;
    const assets = res.data as { custom_tools?: string[] };
    if (!assets.custom_tools || assets.custom_tools.length === 0) return;

    for (const toolName of assets.custom_tools) {
      // Fetch tool definition via a custom endpoint
      const toolRes = await fetch(`${CALLBACK_URL}/bootstrap/custom-tool-def/${toolName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!toolRes.ok) continue;
      const toolDef = await toolRes.json() as {
        name: string;
        description: string;
        input_schema: Record<string, any>;
      };

      // Register as MCP tool with custom_ prefix
      server.tool(
        `custom_${toolDef.name}`,
        toolDef.description,
        // Use a permissive schema since custom tools define their own
        z.record(z.string(), z.any()).optional().describe('Custom tool parameters'),
        async (params) => textTool(`custom-tool/${toolDef.name}`, params || {}),
      );
    }
  } catch {
    // Custom tools unavailable — not fatal, continue with built-in tools only
  }
}
```

Update `main()`:

```typescript
async function main(): Promise<void> {
  await registerCustomTools();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

**Step 3: Add custom-tool-def endpoint to index.ts**

Add to `server/index.ts` (in the Phase 2 routes section):

```typescript
// Endpoint for MCP server to fetch custom tool definitions
app.post('/api/svg/bootstrap/custom-tool-def/:toolName', async (req: Request, res: Response) => {
  const tool = await loadCustomTool(req.params.toolName);
  if (!tool) { res.status(404).json({ error: 'Tool not found' }); return; }
  res.json({ name: tool.name, description: tool.description, input_schema: tool.input_schema });
});
```

**Step 4: Commit**

```bash
git add server/mcp-server.ts server/index.ts
git commit -m "feat: add 4 Phase 2 MCP tools and dynamic custom tool registration"
```

---

### Task 6: System Prompt Update — server/pty-manager.ts

Update the dynamic prompt to document Phase 2 capabilities.

**Files:**
- Modify: `server/pty-manager.ts` (lines 128–134, 178–201)

**Step 1: Update self-improvement section in system prompt**

In `pty-manager.ts`, replace lines 129–134 (the self-improvement section):

```typescript
      '### Self-Improvement',
      'When your current tools can\'t express your vision:',
      '- list_bootstrap_assets to check existing custom tools',
      '- write_filter / write_style / write_skill to create what you need',
      '- write_custom_tool to define new pipeline-based tools',
      '- write_custom_route to define new API endpoints',
      '- get_asset_history / rollback_asset to manage versions',
      '- Batch writes, then reload_session once to apply all changes',
      '- Custom tools use pipeline steps: get_layers, apply_filter,',
      '  transform_layer, style_layer, etc. Design pipelines that',
      '  compose existing actions into higher-level operations.',
```

**Step 2: Commit**

```bash
git add server/pty-manager.ts
git commit -m "feat: update system prompt with Phase 2 self-improvement capabilities"
```

---

### Task 7: Update CLAUDE.md documentation

Update the project documentation to reflect Phase 2 additions.

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update relevant sections**

- Update "29 MCP tools" → "33+ MCP tools" (29 built-in + 4 Phase 2 + dynamic custom tools)
- Add custom-tools and custom-routes to directory listings
- Add pipeline-engine.ts to server file descriptions
- Update Bootstrap data section to include new asset types
- Update BootstrapAssets listing to include custom_tools and custom_routes

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for Phase 2 — custom tools, routes, versioning"
```

---

### Task 8: Integration Tests — Full Test Suite

Run all existing + new tests to verify nothing is broken.

**Files:**
- Modify: `e2e/integration/bootstrap-api.spec.ts`

**Step 1: Add remaining Phase 2 tests**

Add these tests to cover the full Phase 2 surface:

```typescript
  // --- Phase 2: Custom routes ---

  test('write-custom-route and execute it', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    await apiContext.post(`/api/svg/${drawId}`, {
      data: { svg: '<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"><defs></defs><g id="layer-test" data-name="test"><circle cx="100" cy="100" r="50" fill="red"/></g></svg>' },
    });

    const writeRes = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-custom-route`, {
      data: {
        name: 'get-info',
        definition: {
          path: '/custom/get-info',
          method: 'POST',
          description: 'Get canvas info via custom route',
          input_schema: {},
          handler: {
            type: 'pipeline',
            steps: [{ action: 'get_canvas_info' }],
          },
        },
      },
    });
    expect(writeRes.ok()).toBeTruthy();

    const execRes = await apiContext.post(`/api/svg/${drawId}/custom/get-info`, { data: {} });
    expect(execRes.ok()).toBeTruthy();
    const body = await execRes.json();
    expect(body.ok).toBe(true);
    expect(body.result).toBeDefined();
  });

  // --- Phase 2: Rollback ---

  test('rollback restores previous version of filter', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    // Write v1
    await apiContext.post(`/api/svg/${drawId}/bootstrap/write-filter`, {
      data: {
        name: 'rollback-test',
        definition: {
          description: 'V1 filter',
          svg_template: '<filter id="{{id}}"><feGaussianBlur stdDeviation="{{blur:1}}"/></filter>',
        },
      },
    });
    // Write v2
    await apiContext.post(`/api/svg/${drawId}/bootstrap/write-filter`, {
      data: {
        name: 'rollback-test',
        definition: {
          description: 'V2 filter',
          svg_template: '<filter id="{{id}}"><feGaussianBlur stdDeviation="{{blur:5}}"/></filter>',
        },
      },
    });
    // Rollback to v1
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/rollback`, {
      data: { type: 'filter', name: 'rollback-test', version: 1 },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.rolled_back_from).toBe(2);
    expect(body.content_from_version).toBe(1);
    expect(body.new_version).toBe(3);
  });

  // --- Phase 2: list includes new types ---

  test('list returns custom_tools and custom_routes', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    await apiContext.post(`/api/svg/${drawId}/bootstrap/write-custom-tool`, {
      data: {
        name: 'list-test-tool',
        definition: {
          description: 'Test',
          input_schema: {},
          handler: { type: 'pipeline', steps: [{ action: 'get_layers' }] },
        },
      },
    });
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/list`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.custom_tools).toBeInstanceOf(Array);
    expect(body.custom_routes).toBeInstanceOf(Array);
    expect(body.custom_tools).toContain('list-test-tool');
  });
```

**Step 2: Update afterAll cleanup**

Update the cleanup to also remove custom-tools and custom-routes data:

```typescript
  test.afterAll(async () => {
    const skillsToClean = ['e2e-test-skill'];
    for (const name of skillsToClean) {
      await rm(join(process.cwd(), 'plugins', 'svg-drawing', 'skills', name), { recursive: true, force: true }).catch(() => {});
    }
    await rm(join(process.cwd(), 'data', 'bootstrap'), { recursive: true, force: true }).catch(() => {});
  });
```

(No change needed — the existing cleanup already removes the entire `data/bootstrap` directory.)

**Step 3: Run full test suite**

Run: `npx playwright test --project=integration`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add e2e/integration/bootstrap-api.spec.ts
git commit -m "test: add Phase 2 integration tests — custom tools, routes, rollback, history"
```

---

### Task 9: Final Verification

Run the full integration test suite to confirm everything works together.

**Step 1: Run all integration tests**

Run: `npx playwright test --project=integration`
Expected: All tests PASS, no regressions

**Step 2: Verify server starts clean**

Run: `npm run dev:server` (confirm no startup errors)

**Step 3: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address any issues found during final verification"
```
