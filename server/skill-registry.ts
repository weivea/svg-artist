import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

export interface SkillMeta {
  name: string;
  description: string;
  path: string;
  triggers: string[];
  depends: string[];
  contextKeywords: string[];
  parent?: string;
  children?: string[];
  autoLoadChildren?: string[];
  isIndex: boolean;
}

export interface DomainEntry {
  index: SkillMeta;
  skills: SkillMeta[];
}

export interface SkillRegistry {
  fundamentals: SkillMeta[];
  techniques: SkillMeta[];
  domains: Map<string, DomainEntry>;
}

/**
 * Parse YAML frontmatter from a markdown file.
 * Handles: name, description, triggers, depends, context_keywords,
 *          parent, children, auto_load_children
 */
export function parseFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result: Record<string, unknown> = {};

  let currentKey = '';
  let currentList: string[] | null = null;

  for (const line of yaml.split('\n')) {
    // List item: "  - value"
    const listMatch = line.match(/^\s+-\s+(.+)$/);
    if (listMatch && currentList) {
      currentList.push(listMatch[1].trim().replace(/^["']|["']$/g, ''));
      continue;
    }

    // Key-value: "key: value" or "key:"
    const kvMatch = line.match(/^(\w[\w_]*)\s*:\s*(.*)$/);
    if (kvMatch) {
      // Save previous list if any
      if (currentList && currentKey) {
        result[currentKey] = currentList;
      }

      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();

      if (value === '' || value === '[]') {
        currentList = [];
      } else if (value.startsWith('[') && value.endsWith(']')) {
        result[currentKey] = value
          .slice(1, -1)
          .split(',')
          .map(s => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        currentList = null;
      } else {
        result[currentKey] = value.replace(/^["']|["']$/g, '');
        currentList = null;
      }
    }
  }

  // Save final list
  if (currentList && currentKey) {
    result[currentKey] = currentList;
  }

  return result;
}

function toSkillMeta(
  fm: Record<string, unknown>,
  relPath: string,
  isIndex: boolean,
): SkillMeta {
  return {
    name: (fm.name as string) || relPath.split('/').pop() || '',
    description: (fm.description as string) || '',
    path: relPath,
    triggers: (fm.triggers as string[]) || [],
    depends: (fm.depends as string[]) || [],
    contextKeywords: (fm.context_keywords as string[]) || [],
    parent: fm.parent as string | undefined,
    children: fm.children as string[] | undefined,
    autoLoadChildren: fm.auto_load_children as string[] | undefined,
    isIndex,
  };
}

/**
 * Recursively scan a skills directory and build a SkillRegistry.
 */
export async function buildSkillRegistry(skillsDir: string): Promise<SkillRegistry> {
  const registry: SkillRegistry = {
    fundamentals: [],
    techniques: [],
    domains: new Map(),
  };

  const fundamentalsDir = join(skillsDir, 'fundamentals');
  if (await dirExists(fundamentalsDir)) {
    registry.fundamentals = await scanSkillCategory(fundamentalsDir, 'fundamentals');
  }

  const techniquesDir = join(skillsDir, 'techniques');
  if (await dirExists(techniquesDir)) {
    registry.techniques = await scanSkillCategory(techniquesDir, 'techniques');
  }

  const domainsDir = join(skillsDir, 'domains');
  if (await dirExists(domainsDir)) {
    const entries = await readdir(domainsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const domainDir = join(domainsDir, entry.name);
      const domainPath = `domains/${entry.name}`;

      const indexPath = join(domainDir, '_index.md');
      let indexMeta: SkillMeta;
      if (await fileExists(indexPath)) {
        const content = await readFile(indexPath, 'utf-8');
        const fm = parseFrontmatter(content);
        indexMeta = toSkillMeta(fm, domainPath, true);
      } else {
        indexMeta = toSkillMeta({ name: entry.name }, domainPath, true);
      }

      const skills = await scanSkillCategory(domainDir, domainPath);
      registry.domains.set(entry.name, { index: indexMeta, skills });
    }
  }

  return registry;
}

async function scanSkillCategory(dir: string, categoryPath: string): Promise<SkillMeta[]> {
  const skills: SkillMeta[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillFile = join(dir, entry.name, 'SKILL.md');
    if (await fileExists(skillFile)) {
      const content = await readFile(skillFile, 'utf-8');
      const fm = parseFrontmatter(content);
      const relPath = `${categoryPath}/${entry.name}`;
      skills.push(toSkillMeta(fm, relPath, false));
    }
  }

  return skills;
}

async function dirExists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isFile();
  } catch {
    return false;
  }
}

/**
 * Generate a compact skill registry string for injection into the system prompt.
 */
export function registryToPrompt(registry: SkillRegistry): string {
  const lines: string[] = [];

  lines.push('=== SKILL TREE ===');
  lines.push('IMPORTANT: Before starting ANY drawing task, analyze the task description');
  lines.push('and load relevant skills. Always explicitly state which skills you loaded.');
  lines.push('');

  lines.push('FUNDAMENTALS (load matching ones for every drawing task):');
  for (const s of registry.fundamentals) {
    const triggers = s.triggers.slice(0, 6).join(',');
    lines.push(`  ${s.name} [${triggers}]`);
  }
  lines.push('');

  lines.push('TECHNIQUES (load as needed):');
  for (const s of registry.techniques) {
    const triggers = s.triggers.slice(0, 6).join(',');
    lines.push(`  ${s.name} [${triggers}]`);
  }
  lines.push('');

  lines.push('DOMAINS (load domain + auto-load children when task matches):');
  for (const [name, domain] of registry.domains) {
    const triggers = domain.index.triggers.slice(0, 6).join(',');
    const autoLoad = domain.index.autoLoadChildren?.join(', ') || 'none';
    const deps = domain.index.depends.map(d => d.split('/').pop()).join(', ');
    lines.push(`  ${name}/ [${triggers}]`);
    if (autoLoad !== 'none') lines.push(`    ALWAYS-LOAD: ${autoLoad}`);
    if (deps) lines.push(`    DEPENDS: ${deps}`);
    for (const s of domain.skills) {
      const st = s.triggers.slice(0, 5).join(',');
      lines.push(`    ├── ${s.name} [${st}]`);
    }
    lines.push('');
  }

  lines.push('=== LOADING RULES ===');
  lines.push('1. Analyze task keywords against trigger lists above');
  lines.push('2. Load ALL matching fundamentals first');
  lines.push('3. If a domain matches, load its _index + ALWAYS-LOAD children');
  lines.push('4. Load specific sub-skills based on detailed task requirements');
  lines.push('5. Load dependencies before the skills that need them');
  lines.push('6. State explicitly: "Loading skills: [list]" before drawing');
  lines.push('7. During drawing, if you need additional sub-skills, load them');

  return lines.join('\n');
}
