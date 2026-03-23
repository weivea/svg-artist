import { readFile, writeFile, mkdir, readdir, unlink, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const BOOTSTRAP_DIR = join(projectRoot, 'data', 'bootstrap');
const SKILLS_DIR = join(projectRoot, 'plugins', 'svg-drawing', 'skills');

const CUSTOM_FILTERS_DIR = join(BOOTSTRAP_DIR, 'custom-filters');
const CUSTOM_STYLES_DIR = join(BOOTSTRAP_DIR, 'custom-styles');
const PROMPT_EXTENSIONS_DIR = join(BOOTSTRAP_DIR, 'prompt-extensions');
const CUSTOM_TOOLS_DIR = join(BOOTSTRAP_DIR, 'custom-tools');
const CUSTOM_ROUTES_DIR = join(BOOTSTRAP_DIR, 'custom-routes');

const MAX_VERSIONS = 10;

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

export interface CustomToolDef {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  handler: {
    type: 'pipeline';
    steps: PipelineStepDef[];
  };
  created_by: string;
  version: number;
}

export interface CustomRouteDef {
  name: string;
  description: string;
  path: string;
  method: string;
  input_schema: Record<string, unknown>;
  handler: {
    type: 'pipeline';
    steps: PipelineStepDef[];
  };
  created_by: string;
  version: number;
}

export interface PipelineStepDef {
  action: string;
  params?: Record<string, unknown>;
  store_as?: string;
  for_each?: string;
}

export interface VersionInfo {
  version: number;
  timestamp: string;
  size: number;
}

export interface BootstrapAssets {
  skills: string[];
  custom_filters: string[];
  custom_styles: string[];
  prompt_extensions: string[];
  custom_tools: string[];
  custom_routes: string[];
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

// --- Version Management Helpers ---

/**
 * Archive the current file before overwriting. Copies it to a `versions/` subdir.
 */
async function archiveBeforeWrite(filePath: string, versionsDir: string): Promise<void> {
  try {
    const content = await readFile(filePath, 'utf8');
    await ensureDir(versionsDir);
    // Determine next version number
    const existing = await readdir(versionsDir);
    const versionNums = existing
      .map(f => {
        const match = f.match(/^v(\d+)\./);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);
    const nextVersion = versionNums.length > 0 ? Math.max(...versionNums) + 1 : 1;
    const ext = filePath.endsWith('.md') ? '.md' : '.json';
    const archiveName = `v${nextVersion}${ext}`;
    await writeFile(join(versionsDir, archiveName), content, 'utf8');
    await pruneVersions(versionsDir, ext);
  } catch {
    // File doesn't exist yet, nothing to archive
  }
}

/**
 * Keep only the most recent MAX_VERSIONS versions, delete older ones.
 */
async function pruneVersions(versionsDir: string, ext: string): Promise<void> {
  try {
    const files = await readdir(versionsDir);
    const versionFiles = files
      .filter(f => f.endsWith(ext) && /^v\d+\./.test(f))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/^v(\d+)\./)?.[1] || '0', 10);
        const bNum = parseInt(b.match(/^v(\d+)\./)?.[1] || '0', 10);
        return aNum - bNum;
      });
    if (versionFiles.length > MAX_VERSIONS) {
      const toDelete = versionFiles.slice(0, versionFiles.length - MAX_VERSIONS);
      for (const file of toDelete) {
        await unlink(join(versionsDir, file)).catch(() => {});
      }
    }
  } catch {
    // Versions dir may not exist
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get the history (version list) of an asset.
 */
export async function getAssetHistory(
  type: 'custom-filter' | 'custom-style' | 'custom-tool' | 'custom-route' | 'prompt-extension' | 'skill',
  name: string,
): Promise<VersionInfo[]> {
  const { dir, ext } = getAssetDirAndExt(type);
  const versionsDir = type === 'skill'
    ? join(dir, name, 'versions')
    : join(dir, 'versions', name);

  try {
    const files = await readdir(versionsDir);
    const pattern = new RegExp(`^v(\\d+)${escapeRegex(ext)}$`);
    const versions: VersionInfo[] = [];
    for (const file of files) {
      const match = file.match(pattern);
      if (match) {
        const version = parseInt(match[1], 10);
        const fileStat = await stat(join(versionsDir, file));
        versions.push({
          version,
          timestamp: fileStat.mtime.toISOString(),
          size: fileStat.size,
        });
      }
    }
    return versions.sort((a, b) => a.version - b.version);
  } catch {
    return [];
  }
}

/**
 * Rollback an asset to a specific version.
 */
export async function rollbackAsset(
  type: 'custom-filter' | 'custom-style' | 'custom-tool' | 'custom-route' | 'prompt-extension' | 'skill',
  name: string,
  version: number,
): Promise<boolean> {
  const { dir, ext } = getAssetDirAndExt(type);
  const versionsDir = type === 'skill'
    ? join(dir, name, 'versions')
    : join(dir, 'versions', name);

  const versionFile = join(versionsDir, `v${version}${ext}`);
  try {
    const content = await readFile(versionFile, 'utf8');
    // Determine target file
    let targetFile: string;
    if (type === 'skill') {
      targetFile = join(dir, name, 'SKILL.md');
    } else {
      targetFile = join(dir, `${name}${ext}`);
    }
    // Archive current before rollback
    await archiveBeforeWrite(targetFile, versionsDir);
    await writeFile(targetFile, content, 'utf8');
    return true;
  } catch {
    return false;
  }
}

function getAssetDirAndExt(type: string): { dir: string; ext: string } {
  switch (type) {
    case 'custom-filter': return { dir: CUSTOM_FILTERS_DIR, ext: '.json' };
    case 'custom-style': return { dir: CUSTOM_STYLES_DIR, ext: '.json' };
    case 'custom-tool': return { dir: CUSTOM_TOOLS_DIR, ext: '.json' };
    case 'custom-route': return { dir: CUSTOM_ROUTES_DIR, ext: '.json' };
    case 'prompt-extension': return { dir: PROMPT_EXTENSIONS_DIR, ext: '.md' };
    case 'skill': return { dir: SKILLS_DIR, ext: '.md' };
    default: return { dir: BOOTSTRAP_DIR, ext: '.json' };
  }
}

// --- Skills ---

export async function writeSkill(name: string, content: string): Promise<void> {
  const skillDir = join(SKILLS_DIR, name);
  await ensureDir(skillDir);
  // Archive existing skill before overwrite
  const skillFile = join(skillDir, 'SKILL.md');
  const versionsDir = join(skillDir, 'versions');
  await archiveBeforeWrite(skillFile, versionsDir);
  await writeFile(skillFile, content, 'utf8');
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
  const filePath = join(CUSTOM_FILTERS_DIR, `${name}.json`);
  const versionsDir = join(CUSTOM_FILTERS_DIR, 'versions', name);
  await archiveBeforeWrite(filePath, versionsDir);
  const data: CustomFilterDef = {
    name,
    description: definition.description,
    svg_template: definition.svg_template,
    params_schema: definition.params_schema as CustomFilterDef['params_schema'],
    created_by: 'claude-bootstrap',
    version: 1,
  };
  try {
    const existing = await readFile(filePath, 'utf8');
    const prev = JSON.parse(existing) as CustomFilterDef;
    data.version = (prev.version || 0) + 1;
  } catch {
    // New file
  }
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
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
  const filePath = join(CUSTOM_STYLES_DIR, `${name}.json`);
  const versionsDir = join(CUSTOM_STYLES_DIR, 'versions', name);
  await archiveBeforeWrite(filePath, versionsDir);
  const data: CustomStyleDef = {
    name,
    description: definition.description,
    layer_styles: definition.layer_styles,
    created_by: 'claude-bootstrap',
    version: 1,
  };
  try {
    const existing = await readFile(filePath, 'utf8');
    const prev = JSON.parse(existing) as CustomStyleDef;
    data.version = (prev.version || 0) + 1;
  } catch {
    // New file
  }
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
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
  const filePath = join(PROMPT_EXTENSIONS_DIR, `${name}.md`);
  const versionsDir = join(PROMPT_EXTENSIONS_DIR, 'versions', name);
  await archiveBeforeWrite(filePath, versionsDir);
  await writeFile(filePath, content, 'utf8');
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

// --- Custom Tools ---

export async function writeCustomTool(name: string, definition: {
  description: string;
  input_schema: Record<string, unknown>;
  handler: { type: 'pipeline'; steps: PipelineStepDef[] };
}): Promise<void> {
  await ensureDir(CUSTOM_TOOLS_DIR);
  const filePath = join(CUSTOM_TOOLS_DIR, `${name}.json`);
  const versionsDir = join(CUSTOM_TOOLS_DIR, 'versions', name);
  await archiveBeforeWrite(filePath, versionsDir);
  const data: CustomToolDef = {
    name,
    description: definition.description,
    input_schema: definition.input_schema,
    handler: definition.handler,
    created_by: 'claude-bootstrap',
    version: 1,
  };
  try {
    const existing = await readFile(filePath, 'utf8');
    const prev = JSON.parse(existing) as CustomToolDef;
    data.version = (prev.version || 0) + 1;
  } catch {
    // New file
  }
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
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
  description: string;
  path: string;
  method: string;
  handler: { type: 'pipeline'; steps: PipelineStepDef[] };
}): Promise<void> {
  await ensureDir(CUSTOM_ROUTES_DIR);
  const filePath = join(CUSTOM_ROUTES_DIR, `${name}.json`);
  const versionsDir = join(CUSTOM_ROUTES_DIR, 'versions', name);
  await archiveBeforeWrite(filePath, versionsDir);
  const data: CustomRouteDef = {
    name,
    description: definition.description,
    path: definition.path,
    method: definition.method,
    handler: definition.handler,
    created_by: 'claude-bootstrap',
    version: 1,
  };
  try {
    const existing = await readFile(filePath, 'utf8');
    const prev = JSON.parse(existing) as CustomRouteDef;
    data.version = (prev.version || 0) + 1;
  } catch {
    // New file
  }
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
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

// --- Aggregate ---

export async function listAllAssets(): Promise<BootstrapAssets> {
  const [skills, custom_filters, custom_styles, prompt_extensions, custom_tools, custom_routes] = await Promise.all([
    listSkills(),
    listCustomFilters(),
    listCustomStyles(),
    listPromptExtensions(),
    listCustomTools(),
    listCustomRoutes(),
  ]);
  return { skills, custom_filters, custom_styles, prompt_extensions, custom_tools, custom_routes };
}
