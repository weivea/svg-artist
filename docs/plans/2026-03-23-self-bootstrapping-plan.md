# Self-Bootstrapping Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable Claude to self-improve by writing custom skills, filters, styles, and prompt extensions, then reloading its own CLI session to apply changes and auto-continuing the current task.

**Architecture:** New `bootstrap-store.ts` handles file I/O for `data/bootstrap/` and `plugins/svg-drawing/skills/`. A `bootstrap-validator.ts` enforces path safety and format checks. Six new MCP tools (`write_skill`, `write_filter`, `write_style`, `write_prompt_extension`, `reload_session`, `list_bootstrap_assets`) POST to six new Express routes in `index.ts`. `filter-templates.ts` gains a custom filter lookup. `pty-manager.ts` gains `respawn()` with auto-inject continuation prompt. Dynamic prompt assembly reads `prompt-extensions/` at spawn time.

**Tech Stack:** TypeScript (server-side, ES modules via tsx), node-pty, Express, MCP SDK, Playwright (tests)

---

### Task 1: Bootstrap Validator Module

**Files:**
- Create: `server/bootstrap-validator.ts`
- Test: `e2e/integration/bootstrap-api.spec.ts` (started here, extended in later tasks)

**Step 1: Write the failing test**

Create `e2e/integration/bootstrap-api.spec.ts`:

```typescript
import { test, expect } from '../fixtures';

test.describe('Bootstrap API', () => {
  // Helper: create a drawing for bootstrap tests
  async function createDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    return (await res.json()).id;
  }

  // --- Validation tests ---

  test('write-skill rejects name with path traversal', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-skill`, {
      data: { name: '../evil', content: '# Evil' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Invalid name');
  });

  test('write-skill rejects empty content', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-skill`, {
      data: { name: 'test-skill', content: '' },
    });
    expect(res.status()).toBe(400);
  });

  test('write-filter rejects template without filter tag', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-filter`, {
      data: {
        name: 'bad-filter',
        definition: {
          description: 'Bad',
          svg_template: '<rect width="100" height="100"/>',
        },
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('filter');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/bootstrap-api.spec.ts --project=integration`
Expected: FAIL — routes don't exist yet (404 or connection error)

**Step 3: Write the validator module**

Create `server/bootstrap-validator.ts`:

```typescript
const KEBAB_CASE_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME_LEN = 50;
const MAX_SKILL_SIZE = 50 * 1024;   // 50KB
const MAX_PROMPT_SIZE = 10 * 1024;   // 10KB

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateName(name: string): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { ok: false, error: 'Invalid name: must be a non-empty string' };
  }
  if (name.length > MAX_NAME_LEN) {
    return { ok: false, error: `Invalid name: exceeds ${MAX_NAME_LEN} characters` };
  }
  if (name.includes('..') || name.includes('/') || name.includes('\\') || name.includes('\0')) {
    return { ok: false, error: 'Invalid name: contains path traversal characters' };
  }
  if (!KEBAB_CASE_RE.test(name)) {
    return { ok: false, error: 'Invalid name: must be kebab-case (e.g. "oil-paint")' };
  }
  return { ok: true };
}

export function validateSkillContent(content: string): ValidationResult {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return { ok: false, error: 'Skill content must be a non-empty string' };
  }
  if (content.length > MAX_SKILL_SIZE) {
    return { ok: false, error: `Skill content exceeds ${MAX_SKILL_SIZE / 1024}KB limit` };
  }
  return { ok: true };
}

export function validateFilterDefinition(definition: {
  description?: string;
  svg_template?: string;
  params_schema?: Record<string, { type?: string; default?: unknown; min?: number; max?: number }>;
}): ValidationResult {
  if (!definition || typeof definition !== 'object') {
    return { ok: false, error: 'Filter definition must be an object' };
  }
  if (!definition.description || typeof definition.description !== 'string') {
    return { ok: false, error: 'Filter definition must have a description string' };
  }
  if (!definition.svg_template || typeof definition.svg_template !== 'string') {
    return { ok: false, error: 'Filter definition must have an svg_template string' };
  }
  if (!definition.svg_template.includes('<filter')) {
    return { ok: false, error: 'Filter svg_template must contain a <filter> element' };
  }
  // Validate params_schema if present
  if (definition.params_schema) {
    for (const [key, schema] of Object.entries(definition.params_schema)) {
      if (!schema.type || !['number', 'string'].includes(schema.type)) {
        return { ok: false, error: `Param "${key}" must have type "number" or "string"` };
      }
      if (schema.default === undefined) {
        return { ok: false, error: `Param "${key}" must have a default value` };
      }
      if (schema.type === 'number' && schema.min !== undefined && schema.max !== undefined) {
        if (schema.min > schema.max) {
          return { ok: false, error: `Param "${key}": min must be <= max` };
        }
        const def = Number(schema.default);
        if (def < schema.min || def > schema.max) {
          return { ok: false, error: `Param "${key}": default must be between min and max` };
        }
      }
    }
  }
  return { ok: true };
}

export function validateStyleDefinition(definition: {
  description?: string;
  layer_styles?: Record<string, Record<string, string>>;
}): ValidationResult {
  if (!definition || typeof definition !== 'object') {
    return { ok: false, error: 'Style definition must be an object' };
  }
  if (!definition.description || typeof definition.description !== 'string') {
    return { ok: false, error: 'Style definition must have a description string' };
  }
  if (!definition.layer_styles || typeof definition.layer_styles !== 'object' || Object.keys(definition.layer_styles).length === 0) {
    return { ok: false, error: 'Style definition must have non-empty layer_styles' };
  }
  return { ok: true };
}

export function validatePromptExtension(content: string): ValidationResult {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return { ok: false, error: 'Prompt extension content must be a non-empty string' };
  }
  if (content.length > MAX_PROMPT_SIZE) {
    return { ok: false, error: `Prompt extension exceeds ${MAX_PROMPT_SIZE / 1024}KB limit` };
  }
  return { ok: true };
}
```

**Step 4: Commit**

```bash
git add server/bootstrap-validator.ts e2e/integration/bootstrap-api.spec.ts
git commit -m "feat: add bootstrap validator and initial test scaffold"
```

---

### Task 2: Bootstrap Store Module

**Files:**
- Create: `server/bootstrap-store.ts`

**Step 1: Write the bootstrap store**

Create `server/bootstrap-store.ts`:

```typescript
import { readFile, writeFile, mkdir, readdir, rm } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const BOOTSTRAP_DIR = join(projectRoot, 'data', 'bootstrap');
const SKILLS_DIR = join(projectRoot, 'plugins', 'svg-drawing', 'skills');

// Sub-directories under data/bootstrap/
const CUSTOM_FILTERS_DIR = join(BOOTSTRAP_DIR, 'custom-filters');
const CUSTOM_STYLES_DIR = join(BOOTSTRAP_DIR, 'custom-styles');
const PROMPT_EXTENSIONS_DIR = join(BOOTSTRAP_DIR, 'prompt-extensions');

export interface CustomFilterDef {
  name: string;
  description: string;
  svg_template: string;
  params_schema?: Record<string, {
    type: 'number' | 'string';
    default: number | string;
    min?: number;
    max?: number;
  }>;
  created_by: string;
  version: number;
}

export interface CustomStyleDef {
  name: string;
  description: string;
  layer_styles: Record<string, Record<string, string>>;
  created_by: string;
  version: number;
}

export interface BootstrapAssets {
  skills: string[];
  custom_filters: string[];
  custom_styles: string[];
  prompt_extensions: string[];
}

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

async function listJsonFiles(dir: string): Promise<string[]> {
  try {
    const files = await readdir(dir);
    return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
  } catch {
    return [];
  }
}

async function listMdFiles(dir: string): Promise<string[]> {
  try {
    const files = await readdir(dir);
    return files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
  } catch {
    return [];
  }
}

// --- Skills ---

export async function writeSkill(name: string, content: string): Promise<void> {
  const skillDir = join(SKILLS_DIR, name);
  await ensureDir(skillDir);
  await writeFile(join(skillDir, 'SKILL.md'), content, 'utf8');
}

export async function listSkills(): Promise<string[]> {
  try {
    const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
    return entries.filter(e => e.isDirectory()).map(e => e.name);
  } catch {
    return [];
  }
}

// --- Custom Filters ---

export async function writeCustomFilter(name: string, definition: {
  description: string;
  svg_template: string;
  params_schema?: Record<string, { type: string; default: number | string; min?: number; max?: number }>;
}): Promise<void> {
  await ensureDir(CUSTOM_FILTERS_DIR);
  const data: CustomFilterDef = {
    name,
    description: definition.description,
    svg_template: definition.svg_template,
    params_schema: definition.params_schema as CustomFilterDef['params_schema'],
    created_by: 'claude-bootstrap',
    version: 1,
  };
  // Bump version if exists
  try {
    const existing = await readFile(join(CUSTOM_FILTERS_DIR, `${name}.json`), 'utf8');
    const prev = JSON.parse(existing) as CustomFilterDef;
    data.version = (prev.version || 0) + 1;
  } catch {
    // New file
  }
  await writeFile(join(CUSTOM_FILTERS_DIR, `${name}.json`), JSON.stringify(data, null, 2), 'utf8');
}

export async function loadCustomFilter(name: string): Promise<CustomFilterDef | null> {
  try {
    const raw = await readFile(join(CUSTOM_FILTERS_DIR, `${name}.json`), 'utf8');
    return JSON.parse(raw) as CustomFilterDef;
  } catch {
    return null;
  }
}

export async function listCustomFilters(): Promise<string[]> {
  return listJsonFiles(CUSTOM_FILTERS_DIR);
}

// --- Custom Styles ---

export async function writeCustomStyle(name: string, definition: {
  description: string;
  layer_styles: Record<string, Record<string, string>>;
}): Promise<void> {
  await ensureDir(CUSTOM_STYLES_DIR);
  const data: CustomStyleDef = {
    name,
    description: definition.description,
    layer_styles: definition.layer_styles,
    created_by: 'claude-bootstrap',
    version: 1,
  };
  try {
    const existing = await readFile(join(CUSTOM_STYLES_DIR, `${name}.json`), 'utf8');
    const prev = JSON.parse(existing) as CustomStyleDef;
    data.version = (prev.version || 0) + 1;
  } catch {
    // New file
  }
  await writeFile(join(CUSTOM_STYLES_DIR, `${name}.json`), JSON.stringify(data, null, 2), 'utf8');
}

export async function loadCustomStyle(name: string): Promise<CustomStyleDef | null> {
  try {
    const raw = await readFile(join(CUSTOM_STYLES_DIR, `${name}.json`), 'utf8');
    return JSON.parse(raw) as CustomStyleDef;
  } catch {
    return null;
  }
}

export async function listCustomStyles(): Promise<string[]> {
  return listJsonFiles(CUSTOM_STYLES_DIR);
}

// --- Prompt Extensions ---

export async function writePromptExtension(name: string, content: string): Promise<void> {
  await ensureDir(PROMPT_EXTENSIONS_DIR);
  await writeFile(join(PROMPT_EXTENSIONS_DIR, `${name}.md`), content, 'utf8');
}

export async function loadAllPromptExtensions(): Promise<string> {
  try {
    const files = await readdir(PROMPT_EXTENSIONS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md')).sort();
    const contents: string[] = [];
    for (const file of mdFiles) {
      const raw = await readFile(join(PROMPT_EXTENSIONS_DIR, file), 'utf8');
      contents.push(raw.trim());
    }
    return contents.join('\n\n');
  } catch {
    return '';
  }
}

export async function listPromptExtensions(): Promise<string[]> {
  return listMdFiles(PROMPT_EXTENSIONS_DIR);
}

// --- Aggregate ---

export async function listAllAssets(): Promise<BootstrapAssets> {
  const [skills, custom_filters, custom_styles, prompt_extensions] = await Promise.all([
    listSkills(),
    listCustomFilters(),
    listCustomStyles(),
    listPromptExtensions(),
  ]);
  return { skills, custom_filters, custom_styles, prompt_extensions };
}
```

**Step 2: Commit**

```bash
git add server/bootstrap-store.ts
git commit -m "feat: add bootstrap store for reading/writing custom assets"
```

---

### Task 3: Custom Filter Rendering in filter-templates.ts

**Files:**
- Modify: `server/filter-templates.ts` (lines 1-179)

**Step 1: Write the failing test**

Add to `e2e/integration/bootstrap-api.spec.ts`:

```typescript
  test('write-filter creates custom filter and apply-filter uses it', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    // Set up a drawing with a layer
    await apiContext.post(`/api/svg/${drawId}`, {
      data: { svg: '<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"><defs></defs><g id="layer-test" data-name="test"><circle cx="100" cy="100" r="50" fill="red"/></g></svg>' },
    });

    // Write a custom filter
    const writeRes = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-filter`, {
      data: {
        name: 'test-grit',
        definition: {
          description: 'A test grit filter',
          svg_template: '<filter id="{{id}}"><feGaussianBlur in="SourceGraphic" stdDeviation="{{blur:2}}"/></filter>',
          params_schema: {
            blur: { type: 'number', default: 2, min: 0, max: 10 },
          },
        },
      },
    });
    expect(writeRes.ok()).toBeTruthy();

    // Apply custom filter to a layer
    const applyRes = await apiContext.post(`/api/svg/${drawId}/filter/apply`, {
      data: { layer_id: 'layer-test', filter_type: 'test-grit', params: { blur: 3 } },
    });
    expect(applyRes.ok()).toBeTruthy();
    const body = await applyRes.json();
    expect(body.ok).toBe(true);
    expect(body.filter_id).toContain('filter-test-grit');

    // Verify filter is in SVG source
    const sourceRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await sourceRes.json()).svg;
    expect(svg).toContain('stdDeviation="3"');
  });
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/bootstrap-api.spec.ts --project=integration -g "write-filter creates custom"`
Expected: FAIL — route doesn't exist

**Step 3: Modify filter-templates.ts to support custom filters**

Add these functions at the end of `server/filter-templates.ts`:

```typescript
import { loadCustomFilter } from './bootstrap-store.js';

// Render a custom filter template by replacing {{param:default}} placeholders
function renderTemplate(template: string, id: string, params?: FilterParams): string {
  let result = template.replace(/\{\{id\}\}/g, id);
  // Replace {{param:default}} with provided value or default
  result = result.replace(/\{\{(\w+):([^}]*)\}\}/g, (_match, name, defaultVal) => {
    if (params && params[name] !== undefined) {
      return String(params[name]);
    }
    return defaultVal;
  });
  return result;
}

export async function generateFilterOrCustom(
  filterType: string,
  params?: FilterParams,
  suffix?: string,
): Promise<FilterResult | null> {
  // 1. Try built-in first
  if (filterType in builders) {
    return generateFilter(filterType as FilterType, params, suffix);
  }
  // 2. Try custom filter from bootstrap store
  const custom = await loadCustomFilter(filterType);
  if (!custom) return null;
  const sfx = suffix ?? randomSuffix();
  const filterId = `filter-${filterType}-${sfx}`;
  const filterSvg = renderTemplate(custom.svg_template, filterId, params);
  return { filterId, filterSvg };
}
```

Also export `randomSuffix` (change from `function` to `export function`).

Also change `FilterType` to allow any string in `generateFilterOrCustom` while keeping the strict type for `generateFilter`.

**Step 4: Update svg-engine.ts to use the async custom filter function**

Modify `server/svg-engine.ts` — change `applyFilter` to accept a pre-generated filter result:

```typescript
// Add a new method alongside existing applyFilter
applyFilterDef(layerId: string, filterId: string, filterSvg: string): { ok: boolean; filterId?: string; error?: string } {
  const g = this._findLayerElement(layerId);
  if (!g) return { ok: false, error: 'Layer not found' };
  const added = this.manageDefs('add', filterId, filterSvg);
  if (!added) return { ok: false, error: 'Failed to add filter to defs' };
  g.setAttribute('filter', `url(#${filterId})`);
  return { ok: true, filterId };
}
```

**Step 5: Update the filter/apply route in index.ts to use async custom lookup**

In `server/index.ts`, change the `/api/svg/:drawId/filter/apply` route handler to:

```typescript
import { generateFilterOrCustom } from './filter-templates.js';

// Replace the existing filter/apply route handler
app.post('/api/svg/:drawId/filter/apply', async (req: Request, res: Response) => {
  const { layer_id, filter_type, params } = req.body as { layer_id?: string; filter_type?: string; params?: FilterParams };
  if (!layer_id || !filter_type) { res.status(400).json({ error: 'Missing layer_id or filter_type' }); return; }
  const drawId = req.params.drawId as string;
  const drawing = await drawingStore.get(drawId);
  if (!drawing) { res.status(404).json({ error: 'Drawing not found' }); return; }

  // Try built-in or custom filter
  const filterResult = await generateFilterOrCustom(filter_type, params);
  if (!filterResult) { res.status(400).json({ error: `Unknown filter type: ${filter_type}` }); return; }

  const engine = new SvgEngine(drawing.svgContent);
  const result = engine.applyFilterDef(layer_id, filterResult.filterId, filterResult.filterSvg);
  if (!result.ok) { res.status(400).json({ error: result.error }); return; }
  const svg = engine.serialize();
  await drawingStore.updateSvg(drawId, svg);
  broadcastSvg(drawId, svg);
  res.json({ ok: true, filter_id: result.filterId });
});
```

**Step 6: Run existing filter tests to ensure no regression**

Run: `npx playwright test e2e/integration/filter-style-api.spec.ts --project=integration`
Expected: All existing tests PASS

**Step 7: Commit**

```bash
git add server/filter-templates.ts server/svg-engine.ts server/index.ts
git commit -m "feat: support custom filters via bootstrap store with template rendering"
```

---

### Task 4: Bootstrap API Routes (write-skill, write-filter, write-style, write-prompt-extension, list)

**Files:**
- Modify: `server/index.ts` (add 6 new route groups)
- Test: `e2e/integration/bootstrap-api.spec.ts`

**Step 1: Expand the test file**

Add the following tests to `e2e/integration/bootstrap-api.spec.ts`:

```typescript
  // --- write-skill ---

  test('write-skill creates a new skill', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-skill`, {
      data: { name: 'e2e-test-skill', content: '# E2E Test Skill\n\nThis is a test skill.' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.path).toContain('e2e-test-skill');
  });

  // --- write-style ---

  test('write-style creates a custom style', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-style`, {
      data: {
        name: 'e2e-test-style',
        definition: {
          description: 'Test style',
          layer_styles: { '*': { fill: '#ff0000' } },
        },
      },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  // --- write-prompt-extension ---

  test('write-prompt-extension creates a prompt extension', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-prompt-extension`, {
      data: { name: 'e2e-test-prompt', content: 'Always use bold colors.' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  // --- list ---

  test('list returns all bootstrap assets', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    // Write one asset first
    await apiContext.post(`/api/svg/${drawId}/bootstrap/write-prompt-extension`, {
      data: { name: 'e2e-list-test', content: 'Test extension' },
    });
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/list`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.skills).toBeInstanceOf(Array);
    expect(body.custom_filters).toBeInstanceOf(Array);
    expect(body.custom_styles).toBeInstanceOf(Array);
    expect(body.prompt_extensions).toBeInstanceOf(Array);
  });
```

**Step 2: Run test to verify they fail**

Run: `npx playwright test e2e/integration/bootstrap-api.spec.ts --project=integration`
Expected: FAIL — routes don't exist

**Step 3: Add bootstrap routes to index.ts**

Add these routes in `server/index.ts` before the `// --- SVG direct update endpoint ---` comment:

```typescript
import {
  validateName, validateSkillContent, validateFilterDefinition,
  validateStyleDefinition, validatePromptExtension,
} from './bootstrap-validator.js';
import {
  writeSkill, writeCustomFilter, writeCustomStyle,
  writePromptExtension as storeWritePromptExtension,
  listAllAssets,
} from './bootstrap-store.js';

// --- Bootstrap / Self-improvement API ---

app.post('/api/svg/:drawId/bootstrap/write-skill', async (req: Request, res: Response) => {
  const { name, content } = req.body as { name?: string; content?: string };
  if (!name || !content) { res.status(400).json({ error: 'Missing name or content' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  const contentCheck = validateSkillContent(content);
  if (!contentCheck.ok) { res.status(400).json({ error: contentCheck.error }); return; }
  try {
    await writeSkill(name, content);
    res.json({ ok: true, path: `plugins/svg-drawing/skills/${name}/SKILL.md` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to write skill: ${msg}` });
  }
});

app.post('/api/svg/:drawId/bootstrap/write-filter', async (req: Request, res: Response) => {
  const { name, definition } = req.body as { name?: string; definition?: any };
  if (!name || !definition) { res.status(400).json({ error: 'Missing name or definition' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  const defCheck = validateFilterDefinition(definition);
  if (!defCheck.ok) { res.status(400).json({ error: defCheck.error }); return; }
  try {
    await writeCustomFilter(name, definition);
    res.json({ ok: true, path: `data/bootstrap/custom-filters/${name}.json` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to write filter: ${msg}` });
  }
});

app.post('/api/svg/:drawId/bootstrap/write-style', async (req: Request, res: Response) => {
  const { name, definition } = req.body as { name?: string; definition?: any };
  if (!name || !definition) { res.status(400).json({ error: 'Missing name or definition' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  const defCheck = validateStyleDefinition(definition);
  if (!defCheck.ok) { res.status(400).json({ error: defCheck.error }); return; }
  try {
    await writeCustomStyle(name, definition);
    res.json({ ok: true, path: `data/bootstrap/custom-styles/${name}.json` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to write style: ${msg}` });
  }
});

app.post('/api/svg/:drawId/bootstrap/write-prompt-extension', async (req: Request, res: Response) => {
  const { name, content } = req.body as { name?: string; content?: string };
  if (!name || !content) { res.status(400).json({ error: 'Missing name or content' }); return; }
  const nameCheck = validateName(name);
  if (!nameCheck.ok) { res.status(400).json({ error: nameCheck.error }); return; }
  const contentCheck = validatePromptExtension(content);
  if (!contentCheck.ok) { res.status(400).json({ error: contentCheck.error }); return; }
  try {
    await storeWritePromptExtension(name, content);
    res.json({ ok: true, path: `data/bootstrap/prompt-extensions/${name}.md` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to write prompt extension: ${msg}` });
  }
});

app.post('/api/svg/:drawId/bootstrap/list', async (_req: Request, res: Response) => {
  try {
    const assets = await listAllAssets();
    res.json(assets);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Failed to list assets: ${msg}` });
  }
});
```

**Step 4: Run tests**

Run: `npx playwright test e2e/integration/bootstrap-api.spec.ts --project=integration`
Expected: All PASS

**Step 5: Run full integration suite for regression**

Run: `npx playwright test --project=integration`
Expected: All PASS

**Step 6: Commit**

```bash
git add server/index.ts e2e/integration/bootstrap-api.spec.ts
git commit -m "feat: add bootstrap API routes for write-skill, write-filter, write-style, write-prompt-extension, list"
```

---

### Task 5: PtyManager Respawn + Dynamic Prompt + Auto-Continue

**Files:**
- Modify: `server/pty-manager.ts` (lines 46-162)
- Modify: `server/session-manager.ts` (lines 1-50)

**Step 1: Modify pty-manager.ts**

Changes needed in `server/pty-manager.ts`:

1. Import `loadAllPromptExtensions` from bootstrap-store
2. Save spawn opts for respawn
3. Add `buildDynamicPrompt()` method
4. Add `respawn(reason?)` method
5. Add `waitForReadyAndInject(reason?)` method
6. Add `reattachWebSocket(ws)` helper
7. Add bootstrap tool description to layerGuide

```typescript
// At top of file, add import:
import { loadAllPromptExtensions } from './bootstrap-store.js';

// In the PtyManager class, add fields after existing fields:
  private _lastSpawnOpts: SpawnOptions | null = null;
  private _dataHandler: { dispose: () => void } | null = null;

// Modify spawn() to save opts and use dynamic prompt:
  async spawn(opts: SpawnOptions = {}): Promise<IPty> {
    this._lastSpawnOpts = { ...opts };

    const mcpConfigPath = join(projectRoot, 'mcp-config.json');
    const pluginDir = join(projectRoot, 'plugins', 'svg-drawing');

    const systemPrompt = [
      // ... existing systemPrompt lines (unchanged) ...
    ].join('\n');

    const layerGuide = await this.buildDynamicPrompt();

    // ... rest of spawn logic unchanged except:
    // - change `spawn` return type to Promise<IPty>
    // - await the buildDynamicPrompt call
  }

// New method: build dynamic prompt from base + extensions
  private async buildDynamicPrompt(): Promise<string> {
    const base = [
      'Layer tool usage:',
      '- Each independent visual element goes in its own layer',
      '- Name layers with layer-<description> format (e.g., layer-sky, layer-tree-1)',
      '- Prefer update_layer over rebuilding layers',
      '- Use duplicate_layer + transform_layer for repeated elements',
      '- Put gradients/filters in manage_defs, reference by id in layers',
      '- Self-review with preview_as_png after major changes',
      '',
      'Skill loading strategy:',
      '- Load only the skills relevant to the current task (not all 10)',
      '- For any drawing task, always load layer-workflow first',
      '- Load svg-filters-and-effects when textures, shadows, or lighting are needed',
      '- Load illustration-styles when a specific visual style is requested',
      '- Load character-illustration for any human/animal characters',
      '- Load materials-and-textures for realistic object rendering',
      '- Load advanced-color-composition for complex scenes or specific mood requests',
      '',
      'New tools available:',
      '- apply_filter: Apply preset filter effects (drop-shadow, glow, metallic, etc.)',
      '- apply_style_preset: Apply unified style across layers (flat, isometric, etc.)',
      '- get_color_palette: Generate harmonious color palettes by theme/mood',
      '- critique_composition: Get automated composition analysis with scores and suggestions',
      '',
      'Self-improvement capabilities:',
      '- write_skill: Create/update drawing skills for future use',
      '- write_filter: Create custom SVG filter templates',
      '- write_style: Create custom style presets',
      '- write_prompt_extension: Add to your own system prompt',
      '- reload_session: Apply all changes (auto-restarts and continues)',
      '- list_bootstrap_assets: View all custom assets',
      '',
      'When you find your current tools insufficient for a task,',
      'create the tools/skills you need, reload, and continue.',
      'Batch multiple writes before a single reload for efficiency.',
    ].join('\n');

    // Load prompt extensions from data/bootstrap/prompt-extensions/
    const extensions = await loadAllPromptExtensions();
    if (extensions) {
      return base + '\n\n' + extensions;
    }
    return base;
  }

// New method: respawn with auto-continue
  async respawn(reason?: string): Promise<void> {
    const sessionId = this._lastSpawnOpts?.sessionId;
    const callbackUrl = this._lastSpawnOpts?.callbackUrl;
    const ws = this.terminalWs;

    // Notify terminal
    if (ws && ws.readyState === 1) {
      ws.send('\r\n\x1b[33m[Reloading with upgraded capabilities...]\x1b[0m\r\n');
    }

    // Dispose existing data handler
    if (this._dataHandler) {
      this._dataHandler.dispose();
      this._dataHandler = null;
    }

    // Kill current process
    if (this.ptyProcess) {
      this.ptyProcess.kill();
      this.ptyProcess = null;
    }

    // Brief pause for process cleanup
    await new Promise(r => setTimeout(r, 500));

    // Respawn with resume
    await this.spawn({
      sessionId,
      isResume: true,
      callbackUrl,
    });

    // Reattach WebSocket to new PTY
    if (ws && ws.readyState === 1) {
      this.reattachWebSocket(ws);
    }

    // Wait for ready, then inject continuation prompt
    this.waitForReadyAndInject(reason);
  }

// New method: reattach a WebSocket to the current PTY
  private reattachWebSocket(ws: WebSocket): void {
    if (!this.ptyProcess) return;
    this.terminalWs = ws;

    // PTY stdout → filter → WebSocket
    this._dataHandler = this.ptyProcess.onData((data: string) => {
      if (ws.readyState === 1) {
        const filtered = this._filterSvgContent(data);
        if (filtered) {
          ws.send(filtered);
        }
      }
    });
  }

// New method: wait for CLI to be ready, then inject continuation prompt
  private waitForReadyAndInject(reason?: string): void {
    if (!this.ptyProcess) return;

    let buffer = '';
    let injected = false;

    const readyCheck = this.ptyProcess.onData((data: string) => {
      if (injected) return;
      buffer += data;
      // Claude CLI shows a prompt when ready for input after resume.
      // Detect readiness by looking for the input prompt pattern
      // (a line ending without active output for a brief moment).
      // We use a debounce approach: if no new data for 2 seconds, assume ready.
    });

    // Debounce-based ready detection
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const debouncedCheck = this.ptyProcess.onData(() => {
      if (injected) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!injected) {
          injected = true;
          readyCheck.dispose();
          debouncedCheck.dispose();
          this.injectContinuationPrompt(reason);
        }
      }, 2000);
    });

    // Hard timeout fallback: 15 seconds
    setTimeout(() => {
      if (!injected) {
        injected = true;
        readyCheck.dispose();
        debouncedCheck.dispose();
        if (debounceTimer) clearTimeout(debounceTimer);
        this.injectContinuationPrompt(reason);
      }
    }, 15_000);
  }

// New method: inject the continuation prompt into PTY stdin
  private injectContinuationPrompt(reason?: string): void {
    if (!this.ptyProcess) return;

    const message = [
      'I just upgraded my capabilities:',
      reason || 'System reload with latest changes',
      '',
      'Continue where I left off with the current task.',
    ].join('\n');

    this.ptyProcess.write(message + '\r');
  }
```

Also update `attachWebSocket` to store the data handler reference:

```typescript
  attachWebSocket(ws: WebSocket, spawnOpts: SpawnOptions = {}): void {
    if (!this.ptyProcess) {
      this.spawn(spawnOpts);  // Note: this is now async — needs await
    }
    this.terminalWs = ws;

    // PTY stdout -> filter SVG content -> WebSocket -> xterm.js
    this._dataHandler = this.ptyProcess!.onData((data: string) => {
      // ... existing logic ...
    });

    // ... rest unchanged, but on ws close, also dispose _dataHandler ...
    ws.on('close', () => {
      if (this._dataHandler) {
        this._dataHandler.dispose();
        this._dataHandler = null;
      }
      this.terminalWs = null;
      console.log('[PTY] WebSocket disconnected');
    });
  }
```

**Important**: `spawn()` becomes `async` (returns `Promise<IPty>`), so `attachWebSocket` needs to become `async` as well. Update the terminal WS connection handler in `index.ts` accordingly (it already uses `await`).

**Step 2: Modify session-manager.ts**

Add respawn method to `server/session-manager.ts`:

```typescript
  /**
   * Respawn the Claude CLI for a drawId (kill + resume with new capabilities).
   * Returns false if no session exists for this drawId.
   */
  async respawn(drawId: string, reason?: string): Promise<boolean> {
    const manager = this.sessions.get(drawId);
    if (!manager) return false;
    await manager.respawn(reason);
    return true;
  }
```

**Step 3: Commit**

```bash
git add server/pty-manager.ts server/session-manager.ts
git commit -m "feat: add PtyManager.respawn() with dynamic prompt and auto-continue injection"
```

---

### Task 6: Reload Session API Route + MCP Tool Definitions

**Files:**
- Modify: `server/index.ts` (add reload route)
- Modify: `server/mcp-server.ts` (add 6 bootstrap tools)

**Step 1: Write the reload test**

Add to `e2e/integration/bootstrap-api.spec.ts`:

```typescript
  test('reload returns error when no active session (DISABLE_PTY mode)', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/reload`, {
      data: { reason: 'test reload' },
    });
    // In test mode (DISABLE_PTY=1), no session exists, so reload should fail gracefully
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
```

**Step 2: Add reload route to index.ts**

Add before the other bootstrap routes:

```typescript
app.post('/api/svg/:drawId/bootstrap/reload', async (req: Request, res: Response) => {
  const { reason } = req.body as { reason?: string };
  const drawId = req.params.drawId as string;
  const ok = await sessionManager.respawn(drawId, reason);
  if (!ok) {
    res.status(404).json({ error: 'No active session for this drawing' });
    return;
  }
  res.json({ ok: true, reloaded_at: new Date().toISOString() });
});
```

**Step 3: Add 6 bootstrap tools to mcp-server.ts**

Add after the existing "Professional Tools (4)" section in `server/mcp-server.ts`:

```typescript
// ---------------------------------------------------------------------------
// Bootstrap / Self-improvement Tools (6)
// ---------------------------------------------------------------------------

server.tool(
  'write_skill',
  'Create or update a drawing skill (SKILL.md file). Requires reload_session to take effect.',
  {
    name: z.string().describe('Skill name in kebab-case (e.g. "advanced-shading")'),
    content: z.string().describe('Full SKILL.md content with frontmatter and instructions'),
  },
  async (params) => textTool('bootstrap/write-skill', params),
);

server.tool(
  'write_filter',
  'Create or update a custom SVG filter template (JSON). Requires reload_session to take effect. Use {{id}} for filter id and {{param:default}} for parameters in svg_template.',
  {
    name: z.string().describe('Filter name in kebab-case (e.g. "oil-paint")'),
    definition: z.object({
      description: z.string().describe('What this filter does'),
      svg_template: z.string().describe('SVG filter template with {{id}} and {{param:default}} placeholders'),
      params_schema: z.record(z.string(), z.object({
        type: z.enum(['number', 'string']),
        default: z.union([z.number(), z.string()]),
        min: z.number().optional(),
        max: z.number().optional(),
      })).optional().describe('Parameter definitions with types and ranges'),
    }),
  },
  async (params) => textTool('bootstrap/write-filter', params),
);

server.tool(
  'write_style',
  'Create or update a custom style preset (JSON). Requires reload_session to take effect.',
  {
    name: z.string().describe('Style name in kebab-case (e.g. "pixel-art")'),
    definition: z.object({
      description: z.string().describe('What this style achieves'),
      layer_styles: z.record(z.string(), z.record(z.string(), z.string())).describe(
        'Map of layer name pattern → CSS-like style attributes (e.g. {"*": {"fill": "#000"}})',
      ),
    }),
  },
  async (params) => textTool('bootstrap/write-style', params),
);

server.tool(
  'write_prompt_extension',
  'Add or update a system prompt extension. Appended to your context after reload_session.',
  {
    name: z.string().describe('Extension name in kebab-case (e.g. "shading-tips")'),
    content: z.string().describe('Markdown content to add to system prompt'),
  },
  async (params) => textTool('bootstrap/write-prompt-extension', params),
);

server.tool(
  'reload_session',
  'Reload the Claude CLI to apply all changes (new skills, filters, styles, prompt extensions). Automatically kills this process, restarts with --resume, and continues the current task. No user action required.',
  {
    reason: z.string().describe('Summary of what was changed and why (shown in continuation prompt)'),
  },
  async (params) => textTool('bootstrap/reload', params),
);

server.tool(
  'list_bootstrap_assets',
  'List all available skills, custom filters, custom styles, and prompt extensions',
  {},
  async () => textTool('bootstrap/list'),
);
```

**Step 4: Run tests**

Run: `npx playwright test e2e/integration/bootstrap-api.spec.ts --project=integration`
Expected: All PASS

**Step 5: Run full integration suite**

Run: `npx playwright test --project=integration`
Expected: All PASS

**Step 6: Commit**

```bash
git add server/index.ts server/mcp-server.ts
git commit -m "feat: add reload_session route and 6 bootstrap MCP tool definitions"
```

---

### Task 7: Update System Prompt in pty-manager.ts

**Files:**
- Modify: `server/pty-manager.ts` (lines 61-97 — systemPrompt)

The system prompt given to Claude via `--system-prompt` needs to mention self-improvement capabilities so Claude knows it can bootstrap itself.

**Step 1: Add to the systemPrompt array in spawn()**

After the existing step 7 (REFINE), add:

```typescript
      '8. SELF-IMPROVE: If you encounter a capability gap during drawing:',
      '   - Use list_bootstrap_assets to see what custom tools exist',
      '   - Use write_filter/write_style/write_skill to create what you need',
      '   - Use reload_session to apply changes (auto-continues your work)',
      '   - Batch multiple writes before a single reload for efficiency',
```

**Step 2: Commit**

```bash
git add server/pty-manager.ts
git commit -m "feat: add self-improvement step to Claude system prompt"
```

---

### Task 8: Update CLAUDE.md Documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add bootstrap section to CLAUDE.md**

Add the following after the "Key Design Decisions" section:

```markdown
## Self-Bootstrapping

Claude can self-improve during a drawing session by creating custom capabilities and reloading:

**Bootstrap MCP tools (6):**
- `write_skill` — Create/update SKILL.md in plugins directory
- `write_filter` — Create custom SVG filter template (JSON with `{{param:default}}` syntax)
- `write_style` — Create custom style preset (JSON with layer pattern matching)
- `write_prompt_extension` — Append to system prompt (Markdown)
- `reload_session` — Kill CLI + respawn with `--resume` + auto-inject continuation prompt
- `list_bootstrap_assets` — List all custom and built-in assets

**Bootstrap data:** `data/bootstrap/` (custom-filters/, custom-styles/, prompt-extensions/)

**Custom filter template syntax:** `{{id}}` for filter element id, `{{param:default}}` for parameters

**Reload flow:** MCP tool → POST `/api/svg/:drawId/bootstrap/reload` → PtyManager.respawn() → kill PTY → wait 500ms → spawn with `--resume` → wait for CLI ready (2s debounce, 15s timeout) → inject continuation prompt to stdin → Claude auto-continues

**Validation:** kebab-case names, no path traversal, `<filter` tag required in templates, size limits (skills 50KB, prompts 10KB)
```

**Step 2: Add to the architecture diagram**

Update the ASCII diagram to include bootstrap flow.

**Step 3: Add to project structure section**

Add:
```
  - `bootstrap-store.ts` — CRUD for `data/bootstrap/` custom filters, styles, prompt extensions, and skills
  - `bootstrap-validator.ts` — Path safety and format validation for bootstrap writes
```

**Step 4: Add to testing section**

Add:
```
- `bootstrap-api.spec.ts` — Bootstrap write/list operations, validation, custom filter application
```

**Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add self-bootstrapping documentation to CLAUDE.md"
```

---

### Task 9: Test Cleanup + E2E Verification

**Files:**
- Modify: `e2e/integration/bootstrap-api.spec.ts` (add cleanup)

**Step 1: Add test cleanup for skill files created during tests**

The skill write tests create files in `plugins/svg-drawing/skills/`. Add afterAll cleanup:

```typescript
import { rm } from 'fs/promises';
import { join } from 'path';

test.afterAll(async () => {
  // Clean up test-created skills
  const skillsToClean = ['e2e-test-skill'];
  for (const name of skillsToClean) {
    await rm(join(process.cwd(), 'plugins', 'svg-drawing', 'skills', name), { recursive: true, force: true }).catch(() => {});
  }
  // Clean up test bootstrap data
  await rm(join(process.cwd(), 'data', 'bootstrap'), { recursive: true, force: true }).catch(() => {});
});
```

**Step 2: Run full test suite**

Run: `npx playwright test --project=integration`
Expected: All PASS with no leftover test artifacts

**Step 3: Commit**

```bash
git add e2e/integration/bootstrap-api.spec.ts
git commit -m "test: add cleanup for bootstrap test artifacts"
```

---

### Task 10: Final Integration Verification

**Step 1: Run the full integration test suite**

Run: `npx playwright test --project=integration`
Expected: All tests PASS including new bootstrap tests and all existing tests

**Step 2: Manual smoke test** (if server is running)

```bash
# Start server
npm run dev:server

# Test bootstrap write
curl -X POST http://localhost:3000/api/svg/test123/bootstrap/write-filter \
  -H 'Content-Type: application/json' \
  -d '{"name":"smoke-test","definition":{"description":"test","svg_template":"<filter id=\"{{id}}\"><feGaussianBlur stdDeviation=\"{{blur:1}}\"/></filter>"}}'

# Test list
curl -X POST http://localhost:3000/api/svg/test123/bootstrap/list

# Cleanup
rm -rf data/bootstrap/
```

**Step 3: Final commit with all files verified**

Run `git status` and ensure no untracked files are missed. If all clean, the implementation is complete.
