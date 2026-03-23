import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
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
