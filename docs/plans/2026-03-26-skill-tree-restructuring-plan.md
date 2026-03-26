# Skill Tree Restructuring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize the flat 12-skill plugin structure into a 3-layer hierarchical skill tree (fundamentals → techniques → domains) with automatic loading via a skill registry injected into the system prompt.

**Architecture:** Directory hierarchy expresses the skill tree. Each level has an `_index.md` with trigger keywords and dependency declarations. `buildDynamicPrompt()` in `pty-manager.ts` scans the tree at spawn time and generates a compact skill registry prompt. Skills use extended YAML frontmatter for `triggers`, `depends`, `parent`, and `auto_load_children` metadata.

**Tech Stack:** TypeScript (server), Markdown with YAML frontmatter (skills), Node.js fs APIs (directory scanning)

---

## Phase 1: Infrastructure — Skill Registry Builder

### Task 1: Create `skill-registry.ts` — types and frontmatter parser

**Files:**
- Create: `server/skill-registry.ts`

**Step 1: Write the file with types and parser**

```typescript
import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';

export interface SkillMeta {
  name: string;
  description: string;
  path: string;           // relative path from skills/ e.g. "fundamentals/color-theory"
  triggers: string[];
  depends: string[];
  contextKeywords: string[];
  parent?: string;
  children?: string[];
  autoLoadChildren?: string[];
  isIndex: boolean;       // true for _index.md files
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
        // Start of a list or empty
        currentList = [];
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline list: [a, b, c]
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

/**
 * Parse a single skill file (SKILL.md or _index.md) into SkillMeta.
 */
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
 *
 * Expected structure:
 *   skills/
 *     _index.md
 *     fundamentals/
 *       _index.md
 *       color-theory/SKILL.md
 *     techniques/
 *       _index.md
 *       bezier-curves/SKILL.md
 *     domains/
 *       _index.md
 *       portrait/
 *         _index.md
 *         eyes/SKILL.md
 */
export async function buildSkillRegistry(skillsDir: string): Promise<SkillRegistry> {
  const registry: SkillRegistry = {
    fundamentals: [],
    techniques: [],
    domains: new Map(),
  };

  // Scan fundamentals/
  const fundamentalsDir = join(skillsDir, 'fundamentals');
  if (await dirExists(fundamentalsDir)) {
    registry.fundamentals = await scanSkillCategory(fundamentalsDir, 'fundamentals');
  }

  // Scan techniques/
  const techniquesDir = join(skillsDir, 'techniques');
  if (await dirExists(techniquesDir)) {
    registry.techniques = await scanSkillCategory(techniquesDir, 'techniques');
  }

  // Scan domains/ — each subdirectory is a domain with its own _index.md and sub-skills
  const domainsDir = join(skillsDir, 'domains');
  if (await dirExists(domainsDir)) {
    const entries = await readdir(domainsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const domainDir = join(domainsDir, entry.name);
      const domainPath = `domains/${entry.name}`;

      // Read domain _index.md
      const indexPath = join(domainDir, '_index.md');
      let indexMeta: SkillMeta;
      if (await fileExists(indexPath)) {
        const content = await readFile(indexPath, 'utf-8');
        const fm = parseFrontmatter(content);
        indexMeta = toSkillMeta(fm, domainPath, true);
      } else {
        indexMeta = toSkillMeta({ name: entry.name }, domainPath, true);
      }

      // Scan sub-skills
      const skills = await scanSkillCategory(domainDir, domainPath);

      registry.domains.set(entry.name, { index: indexMeta, skills });
    }
  }

  return registry;
}

/**
 * Scan a single category directory for SKILL.md files in subdirectories.
 * Returns SkillMeta[] for all found skills (excludes _index.md).
 */
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
 * Designed to stay under ~2000 tokens while giving Claude all the info needed
 * to match tasks to skills.
 */
export function registryToPrompt(registry: SkillRegistry): string {
  const lines: string[] = [];

  lines.push('=== SKILL TREE ===');
  lines.push('IMPORTANT: Before starting ANY drawing task, analyze the task description');
  lines.push('and load relevant skills. Always explicitly state which skills you loaded.');
  lines.push('');

  // Fundamentals
  lines.push('FUNDAMENTALS (load matching ones for every drawing task):');
  for (const s of registry.fundamentals) {
    const triggers = s.triggers.slice(0, 6).join(',');
    lines.push(`  ${s.name} [${triggers}]`);
  }
  lines.push('');

  // Techniques
  lines.push('TECHNIQUES (load as needed):');
  for (const s of registry.techniques) {
    const triggers = s.triggers.slice(0, 6).join(',');
    lines.push(`  ${s.name} [${triggers}]`);
  }
  lines.push('');

  // Domains
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

  // Loading rules
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
```

**Step 2: Verify the file compiles**

Run: `npx tsx --eval "import('./server/skill-registry.js')"`
Expected: No errors

**Step 3: Commit**

```bash
git add server/skill-registry.ts
git commit -m "feat: add skill registry builder for hierarchical skill tree"
```

---

### Task 2: Modify `buildDynamicPrompt()` to use the skill registry

**Files:**
- Modify: `server/pty-manager.ts` (lines 1-7 imports, lines 269-292 buildDynamicPrompt)

**Step 1: Add import for buildSkillRegistry and registryToPrompt**

At the top of `pty-manager.ts`, add the new import:

```typescript
import { buildSkillRegistry, registryToPrompt } from './skill-registry.js';
```

**Step 2: Replace `buildDynamicPrompt()` method**

Replace lines 269-292 with:

```typescript
private async buildDynamicPrompt(): Promise<string> {
  const pluginDir = join(projectRoot, 'plugins', 'svg-drawing');
  const skillsDir = join(pluginDir, 'skills');

  // Build skill registry from directory tree
  const registry = await buildSkillRegistry(skillsDir);
  const skillTree = registryToPrompt(registry);

  const base = [
    'Layer conventions:',
    '- Name format: layer-<description> (e.g., layer-sky, layer-tree-1)',
    '- Build order: background → midground → foreground → details → effects',
    '- All gradients/filters/patterns belong in <defs>, reference by url(#id)',
    '',
    skillTree,
  ].join('\n');

  const extensions = await loadAllPromptExtensions();
  if (extensions) {
    return base + '\n\n' + extensions;
  }
  return base;
}
```

**Step 3: Verify the server compiles**

Run: `npx tsx --eval "import('./server/pty-manager.js')"`
Expected: No errors (may warn about missing directories, that's fine)

**Step 4: Commit**

```bash
git add server/pty-manager.ts
git commit -m "feat: use skill registry builder in buildDynamicPrompt"
```

---

## Phase 2: Create Directory Structure and _index.md Files

### Task 3: Create the hierarchical directory structure

**Files:**
- Create directories: `fundamentals/`, `techniques/`, `domains/`, `domains/portrait/`, `domains/character/`, `domains/landscape/`, `domains/architecture/`, `domains/creatures/`

**Step 1: Create all directories**

```bash
cd plugins/svg-drawing/skills
mkdir -p fundamentals techniques domains/portrait domains/character domains/landscape domains/architecture domains/creatures
```

**Step 2: Create global `_index.md`**

Create `plugins/svg-drawing/skills/_index.md`:

```markdown
---
name: skill-tree-root
description: "SVG Artist skill tree — hierarchical drawing skills organized as fundamentals → techniques → domains"
---

# SVG Artist Skill Tree

## Structure

- **fundamentals/** — Universal art foundations (color, light, composition, perspective, form, line)
- **techniques/** — SVG-specific technical skills (curves, filters, gradients, materials, styles, workflow)
- **domains/** — Subject-matter expertise (portrait, character, landscape, architecture, creatures)

## How Skills Are Loaded

1. Claude analyzes the drawing task description
2. Matching fundamentals are loaded first (they are prerequisites)
3. If a domain matches, its _index.md and auto-load children are loaded
4. Specific sub-skills are loaded based on task details
5. Dependencies declared in `depends` are loaded before dependent skills
```

**Step 3: Create `fundamentals/_index.md`**

Create `plugins/svg-drawing/skills/fundamentals/_index.md`:

```markdown
---
name: fundamentals
description: "Universal art foundations that apply to all drawing tasks"
triggers:
  - drawing
  - art
  - create
  - paint
  - illustrate
  - render
children:
  - color-theory
  - light-and-shadow
  - composition
  - perspective
  - form-and-shape
  - line-and-rhythm
---

# Art Fundamentals

These are the universal foundations of visual art. At least one fundamental skill should be loaded for any drawing task. They provide the theoretical basis that all domain-specific skills build upon.

## When to Load Each

- **color-theory** — Any task involving color choices, palettes, or gradients
- **light-and-shadow** — Any task involving 3D appearance, depth, or mood
- **composition** — Any scene or multi-element layout
- **perspective** — Any scene with depth or architectural elements
- **form-and-shape** — Any task involving shape design or silhouettes
- **line-and-rhythm** — Any task where line quality or visual flow matters
```

**Step 4: Create `techniques/_index.md`**

Create `plugins/svg-drawing/skills/techniques/_index.md`:

```markdown
---
name: techniques
description: "SVG-specific technical skills and implementation methods"
triggers:
  - svg
  - vector
  - technical
  - implement
  - render
children:
  - bezier-curves
  - svg-filters
  - gradients-patterns
  - materials-textures
  - illustration-styles
  - layer-workflow
---

# SVG Techniques

Technical skills specific to SVG artwork creation. These provide implementation-level guidance for translating artistic concepts into SVG code.

## When to Load Each

- **bezier-curves** — Organic shapes, curved paths, smooth outlines
- **svg-filters** — Visual effects (blur, glow, shadow, emboss, etc.)
- **gradients-patterns** — Gradient fills, pattern fills, texture fills
- **materials-textures** — Realistic material rendering (metal, glass, wood, etc.)
- **illustration-styles** — Style-specific techniques (flat, isometric, watercolor, etc.)
- **layer-workflow** — Layer organization, naming, and build order
```

**Step 5: Create `domains/_index.md`**

Create `plugins/svg-drawing/skills/domains/_index.md`:

```markdown
---
name: domains
description: "Subject-matter specific drawing expertise"
triggers:
  - draw
  - create
  - paint
  - illustrate
children:
  - portrait
  - character
  - landscape
  - architecture
  - creatures
---

# Drawing Domains

Specialized skills for specific subject matter. Each domain has its own sub-skill tree with auto-loading rules.
```

**Step 6: Create `domains/portrait/_index.md`**

Create `plugins/svg-drawing/skills/domains/portrait/_index.md`:

```markdown
---
name: portrait
description: "Human face and bust portrait drawing"
triggers:
  - portrait
  - face
  - facial
  - head
  - bust
  - headshot
  - selfie
  - mugshot
depends:
  - fundamentals/color-theory
  - fundamentals/light-and-shadow
  - fundamentals/form-and-shape
children:
  - face-structure
  - eyes
  - nose
  - mouth
  - ears
  - hair
  - expressions
  - skin-tones
auto_load_children:
  - face-structure
---

# Portrait Drawing

## The Loomis Method for Head Construction

1. Draw a sphere for the cranium
2. Flatten the sides to define head width
3. Add the jaw: from ear-level points, converge to chin
4. Divide vertically: center line follows head angle
5. Divide horizontally: eye line at sphere's equator

## Facial Proportions (Front View)

```
      ┌──────────────────────┐
      │    Hair / Forehead    │  1/3
      ├──────────────────────┤
      │  Eyebrows ──────     │
      │  Eyes     ○    ○     │  1/3
      │  Nose      ▽         │
      ├──────────────────────┤
      │  Mouth    ───        │  1/3
      │  Chin     ╰──╯       │
      └──────────────────────┘
```

- Eyes sit at the vertical midpoint of the head
- Nose bottom is halfway between eyes and chin
- Mouth is 1/3 down from nose to chin
- Face width = approximately 5 eye-widths
- Inter-eye distance = 1 eye-width
- Ears: top at eyebrow level, bottom at nose bottom

## Drawing Workflow

1. **Structure first** — Head shape and proportions (load: face-structure)
2. **Major features** — Eyes, nose, mouth placement (load: eyes, nose, mouth)
3. **Supporting features** — Ears, eyebrows (load: ears)
4. **Hair** — Hairstyle and volume (load: hair)
5. **Expression** — Emotion and gaze direction (load: expressions)
6. **Skin and color** — Skin tones, shadows, highlights (load: skin-tones)
7. **Refinement** — Details, textures, final touches
```

**Step 7: Create `domains/character/_index.md`**

Create `plugins/svg-drawing/skills/domains/character/_index.md`:

```markdown
---
name: character
description: "Full-body character design and illustration"
triggers:
  - character
  - figure
  - body
  - full-body
  - person
  - human
  - man
  - woman
  - child
  - girl
  - boy
  - standing
  - sitting
  - walking
  - running
depends:
  - fundamentals/color-theory
  - fundamentals/form-and-shape
  - fundamentals/light-and-shadow
children:
  - proportions
  - poses
  - hands-feet
  - clothing
  - stylization
auto_load_children:
  - proportions
---

# Character Illustration

## Proportion Systems (Head-to-Body Ratios)

| Style | Ratio | Use |
|-------|-------|-----|
| Chibi / SD | 2-3 heads | Cute, mascot, emoji |
| Cartoon | 4-5 heads | Comics, animation |
| Stylized | 6-7 heads | Fashion, design |
| Realistic | 7.5-8 heads | Portrait, anatomy |
| Heroic | 8.5-9 heads | Superhero, idealized |

## Drawing Workflow

1. **Gesture line** — Action line capturing the pose's energy
2. **Proportions** — Head-to-body ratio and major landmarks (load: proportions)
3. **Body volumes** — Torso, limbs as simplified shapes
4. **Pose** — Weight distribution and dynamic balance (load: poses)
5. **Hands & feet** — Detail these separately (load: hands-feet)
6. **Clothing** — Fabric, folds, design (load: clothing)
7. **Style** — Apply stylization level (load: stylization)
8. **Face** — If face visible, load portrait domain skills
```

**Step 8: Create `domains/landscape/_index.md`**

Create `plugins/svg-drawing/skills/domains/landscape/_index.md`:

```markdown
---
name: landscape
description: "Natural scenery and outdoor environment illustration"
triggers:
  - landscape
  - scenery
  - nature
  - outdoor
  - horizon
  - vista
  - panorama
depends:
  - fundamentals/composition
  - fundamentals/perspective
  - fundamentals/color-theory
children:
  - sky-clouds
  - mountains
  - water
  - vegetation
  - terrain
auto_load_children:
  - sky-clouds
---

# Landscape Drawing

## Depth Planes

Every landscape has three depth planes:
1. **Background** — Sky, distant mountains, horizon (subtle colors, low contrast)
2. **Middleground** — Hills, water, buildings (moderate detail)
3. **Foreground** — Trees, rocks, path (highest detail, strongest colors)

## Atmospheric Perspective

- Distant objects: lighter, bluer, lower contrast
- Near objects: darker, warmer, higher contrast
- Use opacity and color shift to create depth layers

## Workflow

1. **Sky** — Establish mood and lighting direction (load: sky-clouds)
2. **Background** — Distant elements with atmospheric perspective
3. **Middleground** — Main landscape features (load: mountains, water as needed)
4. **Foreground** — Detailed elements close to viewer (load: vegetation, terrain)
5. **Lighting** — Consistent light source across all planes
6. **Atmosphere** — Haze, mist, fog effects
```

**Step 9: Create `domains/architecture/_index.md`**

Create `plugins/svg-drawing/skills/domains/architecture/_index.md`:

```markdown
---
name: architecture
description: "Buildings, interiors, and urban environments"
triggers:
  - architecture
  - building
  - house
  - city
  - urban
  - street
  - interior
  - room
  - skyline
depends:
  - fundamentals/perspective
  - fundamentals/composition
  - fundamentals/light-and-shadow
children:
  - buildings
  - interiors
  - cityscape
  - structures
auto_load_children:
  - buildings
---

# Architecture & Urban Drawing

## Perspective is Key

Architecture drawing demands accurate perspective. Always establish:
1. Horizon line (eye level)
2. Vanishing points (1-point for corridors, 2-point for corners, 3-point for dramatic angles)
3. Grid lines for consistent proportions

## Workflow

1. **Perspective grid** — Set up vanishing points and horizon
2. **Major volumes** — Block out main building shapes
3. **Structural details** — Windows, doors, roof lines (load: buildings)
4. **Environment** — Street, sidewalk, surrounding elements (load: cityscape or interiors)
5. **Material textures** — Brick, glass, concrete, wood
6. **Lighting** — Shadows and reflections on surfaces
```

**Step 10: Create `domains/creatures/_index.md`**

Create `plugins/svg-drawing/skills/domains/creatures/_index.md`:

```markdown
---
name: creatures
description: "Animals, pets, wildlife, and fantasy creatures"
triggers:
  - animal
  - creature
  - pet
  - wildlife
  - bird
  - fish
  - cat
  - dog
  - dragon
  - horse
  - rabbit
  - fox
depends:
  - fundamentals/form-and-shape
  - fundamentals/light-and-shadow
children:
  - mammals
  - birds
  - aquatic
  - fantasy
auto_load_children: []
---

# Animals & Creatures

## Core Principle: Animals Are Built from Simple Forms

All animals can be broken down into basic geometric shapes:
- **Torso** — Oval or bean shape
- **Head** — Circle or oval with muzzle addition
- **Limbs** — Cylinders with joint articulation
- **Tail** — Tapered curve

## Workflow

1. **Reference study** — Understand the animal's anatomy
2. **Gesture sketch** — Capture the pose with simple lines
3. **Basic forms** — Block out body as geometric shapes
4. **Anatomy** — Add muscle groups and skeletal landmarks
5. **Surface detail** — Fur, feathers, scales, skin (load: specific sub-skill)
6. **Expression** — Eyes and face convey personality
```

**Step 11: Commit all _index.md files**

```bash
git add plugins/svg-drawing/skills/_index.md
git add plugins/svg-drawing/skills/fundamentals/_index.md
git add plugins/svg-drawing/skills/techniques/_index.md
git add plugins/svg-drawing/skills/domains/_index.md
git add plugins/svg-drawing/skills/domains/portrait/_index.md
git add plugins/svg-drawing/skills/domains/character/_index.md
git add plugins/svg-drawing/skills/domains/landscape/_index.md
git add plugins/svg-drawing/skills/domains/architecture/_index.md
git add plugins/svg-drawing/skills/domains/creatures/_index.md
git commit -m "feat: add hierarchical directory structure with _index.md files for skill tree"
```

---

## Phase 3: Migrate Existing Skills

### Task 4: Migrate fundamentals (split color-and-gradients, composition, advanced-color-composition)

**Files:**
- Read: `plugins/svg-drawing/skills/color-and-gradients/SKILL.md`
- Read: `plugins/svg-drawing/skills/composition/SKILL.md`
- Read: `plugins/svg-drawing/skills/advanced-color-composition/SKILL.md`
- Create: `plugins/svg-drawing/skills/fundamentals/color-theory/SKILL.md`
- Create: `plugins/svg-drawing/skills/fundamentals/light-and-shadow/SKILL.md`
- Create: `plugins/svg-drawing/skills/fundamentals/composition/SKILL.md`
- Create: `plugins/svg-drawing/skills/fundamentals/perspective/SKILL.md`
- Create: `plugins/svg-drawing/skills/fundamentals/form-and-shape/SKILL.md`
- Create: `plugins/svg-drawing/skills/fundamentals/line-and-rhythm/SKILL.md`

**Step 1: Create `fundamentals/color-theory/SKILL.md`**

Extract color theory content from `color-and-gradients/SKILL.md` (color formats, color wheel, color harmony, color psychology, HSL manipulation, accessibility). The gradient-specific and SVG pattern content goes to `techniques/gradients-patterns` in Task 5.

Frontmatter:
```yaml
---
name: color-theory
description: "Color theory foundations: color wheel, harmony schemes, color psychology, HSL/RGB manipulation, contrast and accessibility, palette construction"
triggers:
  - color
  - colour
  - palette
  - hue
  - saturation
  - warm
  - cool
  - monochrome
  - complementary
  - analogous
context_keywords:
  - painting
  - illustration
  - design
---
```

Content should include: color formats (hex, rgb, hsl), color wheel, harmony schemes (complementary, analogous, triadic, split-complementary, tetradic), color temperature (warm/cool), color psychology, contrast ratios, WCAG accessibility, palette construction rules.

**Step 2: Create `fundamentals/light-and-shadow/SKILL.md`**

New skill. Frontmatter:
```yaml
---
name: light-and-shadow
description: "Light and shadow rendering: light source types, shadow anatomy (form shadow, cast shadow, reflected light), value scales, ambient occlusion, SVG techniques for shading"
triggers:
  - light
  - shadow
  - shading
  - highlight
  - reflection
  - ambient
  - luminance
  - brightness
  - darkness
  - glow
context_keywords:
  - depth
  - volume
  - 3d
  - realistic
---
```

Content should cover: light source types (directional, point, ambient), shadow anatomy (form shadow, cast shadow, core shadow, reflected light, highlight, halftone), value scales (5-value system), SVG shading techniques (gradient-based shading, filter-based shadows, opacity layering), ambient occlusion via darkened crevices.

**Step 3: Create `fundamentals/composition/SKILL.md`**

Merge universal composition content from existing `composition/SKILL.md` and `advanced-color-composition/SKILL.md`. Strip out scene-building specifics (those stay in domain skills).

Frontmatter:
```yaml
---
name: composition
description: "Visual composition principles: rule of thirds, golden ratio, visual hierarchy, focal point, balance, rhythm, emphasis, leading lines, negative space"
triggers:
  - composition
  - layout
  - arrangement
  - balance
  - hierarchy
  - focal
  - thirds
  - golden
  - spacing
  - alignment
context_keywords:
  - scene
  - design
  - placement
---
```

**Step 4: Create `fundamentals/perspective/SKILL.md`**

New skill. Frontmatter:
```yaml
---
name: perspective
description: "Perspective drawing: 1/2/3-point perspective, vanishing points, horizon line, foreshortening, atmospheric perspective, depth cues in SVG"
triggers:
  - perspective
  - depth
  - vanishing
  - horizon
  - foreshortening
  - distance
  - 3d
  - dimensional
context_keywords:
  - building
  - architecture
  - landscape
  - scene
---
```

Content should cover: 1-point perspective (corridors, roads), 2-point perspective (building corners), 3-point perspective (looking up/down), atmospheric perspective (color/contrast shifts with distance), foreshortening, SVG implementation of perspective using transforms, scale gradients, and layered opacity.

**Step 5: Create `fundamentals/form-and-shape/SKILL.md`**

New skill. Frontmatter:
```yaml
---
name: form-and-shape
description: "Form and shape language: basic geometric forms (sphere, cube, cylinder, cone), shape psychology (circle=friendly, square=stable, triangle=dynamic), silhouette design, volume construction"
triggers:
  - form
  - shape
  - silhouette
  - geometry
  - volume
  - contour
  - outline
  - structure
context_keywords:
  - character
  - design
  - object
---
```

**Step 6: Create `fundamentals/line-and-rhythm/SKILL.md`**

New skill. Frontmatter:
```yaml
---
name: line-and-rhythm
description: "Line quality and visual rhythm: stroke weight variation, line confidence, S-curves (line of beauty), visual flow, repetition patterns, movement in composition"
triggers:
  - line
  - stroke
  - rhythm
  - flow
  - contour
  - outline
  - calligraphy
  - brushwork
context_keywords:
  - drawing
  - sketch
  - illustration
---
```

**Step 7: Commit all fundamentals**

```bash
git add plugins/svg-drawing/skills/fundamentals/
git commit -m "feat: create 6 fundamental skills (color-theory, light-shadow, composition, perspective, form-shape, line-rhythm)"
```

---

### Task 5: Migrate techniques (move existing skills to new locations)

**Files:**
- Move: `bezier-and-curves` → `techniques/bezier-curves`
- Move: `svg-filters-and-effects` → `techniques/svg-filters`
- Move: `materials-and-textures` + `texture-details` → `techniques/materials-textures`
- Move: `illustration-styles` → `techniques/illustration-styles`
- Move: `layer-workflow` → `techniques/layer-workflow`
- Create: `techniques/gradients-patterns` (from split of `color-and-gradients`)

**Step 1: Move and update frontmatter for each technique skill**

For each moved skill, copy the existing SKILL.md content to the new location and update the frontmatter to add `triggers`, `depends`, and `context_keywords` fields.

Example for `techniques/bezier-curves/SKILL.md`:
```yaml
---
name: bezier-curves
description: "Bezier curves and path operations..."
triggers:
  - curve
  - bezier
  - path
  - arc
  - spline
  - organic
  - smooth
  - wave
depends: []
context_keywords:
  - shape
  - outline
  - drawing
---
```

**Step 2: Create `techniques/gradients-patterns/SKILL.md`**

Extract gradient engineering and pattern content from `color-and-gradients/SKILL.md`:
- Linear gradients (units, spreadMethod, transform)
- Radial gradients (focal point tricks)
- Pattern fills
- Gradient inheritance
- Mesh gradient simulation

Frontmatter:
```yaml
---
name: gradients-patterns
description: "SVG gradient engineering and pattern fills: linear/radial gradients, gradient units, spreadMethod, pattern creation, mesh gradient simulation"
triggers:
  - gradient
  - pattern
  - fill
  - linear-gradient
  - radial-gradient
  - texture-fill
depends:
  - fundamentals/color-theory
context_keywords:
  - background
  - sky
  - material
---
```

**Step 3: Commit all techniques**

```bash
git add plugins/svg-drawing/skills/techniques/
git commit -m "feat: migrate 6 technique skills to techniques/ directory"
```

---

### Task 6: Create portrait domain sub-skills (split facial-details)

**Files:**
- Read: `plugins/svg-drawing/skills/facial-details/SKILL.md`
- Read: `plugins/svg-drawing/skills/hair-details/SKILL.md`
- Create: `domains/portrait/face-structure/SKILL.md`
- Create: `domains/portrait/eyes/SKILL.md`
- Create: `domains/portrait/nose/SKILL.md`
- Create: `domains/portrait/mouth/SKILL.md`
- Create: `domains/portrait/ears/SKILL.md`
- Move: `hair-details` → `domains/portrait/hair/SKILL.md`
- Create: `domains/portrait/expressions/SKILL.md`
- Create: `domains/portrait/skin-tones/SKILL.md`

**Step 1: Create `domains/portrait/face-structure/SKILL.md`**

Extract from `facial-details`: face shape variations (oval, round, square, heart, long, diamond) with SVG code examples, Loomis method placement guides, facial proportion rules.

Frontmatter:
```yaml
---
name: face-structure
parent: portrait
description: "Face structure and proportions: head shapes (oval, round, square, heart), Loomis method, facial landmark placement, jaw and chin variations"
triggers:
  - face
  - head-shape
  - proportions
  - jaw
  - chin
  - cheekbones
  - skull
depends:
  - fundamentals/form-and-shape
context_keywords:
  - portrait
  - character
---
```

**Step 2: Create `domains/portrait/eyes/SKILL.md`**

Extract eye content from `facial-details`: eye anatomy, iris/pupil, eyelashes, gaze direction, eye styles (realistic, anime, cartoon), eye expressions. Include SVG code examples.

Frontmatter:
```yaml
---
name: eyes
parent: portrait
description: "Eye rendering: iris structure, pupil highlights, eyelash patterns, gaze direction, eye shapes across styles (realistic, anime, cartoon), emotional expression through eyes"
triggers:
  - eye
  - eyes
  - iris
  - pupil
  - gaze
  - eyelash
  - eyelid
  - brow
  - eyebrow
depends:
  - fundamentals/color-theory
  - fundamentals/light-and-shadow
context_keywords:
  - face
  - expression
  - portrait
---
```

**Step 3: Create `domains/portrait/nose/SKILL.md`**

Extract nose content from `facial-details`: nose anatomy, nostril rendering, nose shapes, lighting/shadow on nose, angle variations.

Frontmatter:
```yaml
---
name: nose
parent: portrait
description: "Nose rendering: nostril shapes, bridge line, nose tip, lighting angles, style variations (realistic, simplified, anime), profile and 3/4 view"
triggers:
  - nose
  - nostril
  - bridge
  - nasal
depends:
  - fundamentals/light-and-shadow
context_keywords:
  - face
  - portrait
---
```

**Step 4: Create `domains/portrait/mouth/SKILL.md`**

Extract mouth/lip content from `facial-details`: lip anatomy, teeth, smile variations, expression through mouth, SVG code.

Frontmatter:
```yaml
---
name: mouth
parent: portrait
description: "Mouth and lip rendering: lip shapes, cupid's bow, teeth, smile types, expressions (open/closed, speaking, emotions), lipstick/color"
triggers:
  - mouth
  - lip
  - lips
  - teeth
  - smile
  - grin
  - frown
depends:
  - fundamentals/color-theory
  - fundamentals/light-and-shadow
context_keywords:
  - face
  - expression
  - portrait
---
```

**Step 5: Create `domains/portrait/ears/SKILL.md`**

Extract ear content from `facial-details`: ear anatomy (helix, antihelix, tragus, lobule), ear placement, angle variations.

Frontmatter:
```yaml
---
name: ears
parent: portrait
description: "Ear rendering: helix and antihelix structure, tragus, lobule, ear placement relative to eyes/nose, front/side/3-4 view, earrings and accessories"
triggers:
  - ear
  - ears
  - earlobe
depends:
  - fundamentals/form-and-shape
context_keywords:
  - face
  - portrait
  - profile
---
```

**Step 6: Move hair-details to `domains/portrait/hair/SKILL.md`**

Copy existing `hair-details/SKILL.md` content, update frontmatter:

```yaml
---
name: hair
parent: portrait
description: "Hair rendering: strand group technique, style templates (bob, pixie, braids, bun), anime/realistic/cartoon/watercolor hair, physics and motion, highlight systems, facial hair, color gradients"
triggers:
  - hair
  - hairstyle
  - bangs
  - braid
  - ponytail
  - bun
  - curls
  - beard
  - mustache
depends:
  - fundamentals/color-theory
  - techniques/bezier-curves
context_keywords:
  - face
  - portrait
  - character
---
```

**Step 7: Create `domains/portrait/expressions/SKILL.md`**

Extract expression content from `character-illustration/SKILL.md` (FACS system, emotion mapping, micro-expressions) + `facial-details/SKILL.md` (wrinkle and aging indicators).

Frontmatter:
```yaml
---
name: expressions
parent: portrait
description: "Facial expressions: FACS-based emotion system, 6 basic emotions (happy, sad, angry, surprised, disgusted, afraid), micro-expressions, wrinkles and aging, eyebrow-mouth coordination"
triggers:
  - expression
  - emotion
  - feeling
  - happy
  - sad
  - angry
  - surprised
  - crying
  - laughing
  - worried
depends:
  - domains/portrait/eyes
  - domains/portrait/mouth
context_keywords:
  - face
  - portrait
  - character
---
```

**Step 8: Create `domains/portrait/skin-tones/SKILL.md`**

New skill for skin rendering.

Frontmatter:
```yaml
---
name: skin-tones
parent: portrait
description: "Skin tone rendering: Fitzpatrick scale, undertone (warm/cool/neutral), skin color mixing, subsurface scattering simulation, blush zones, shadow colors for different skin tones"
triggers:
  - skin
  - skin-tone
  - complexion
  - flesh
  - blush
  - freckles
depends:
  - fundamentals/color-theory
  - fundamentals/light-and-shadow
context_keywords:
  - face
  - portrait
  - character
---
```

Content should cover: Fitzpatrick skin type scale (I-VI) with hex color ranges, warm/cool/neutral undertones, shadow color formulas for different skin tones (never use pure black/gray for skin shadows), blush and flush zones (cheeks, nose, ears, knuckles), freckle patterns, subsurface scattering simulation with gradients.

**Step 9: Commit portrait domain**

```bash
git add plugins/svg-drawing/skills/domains/portrait/
git commit -m "feat: create 8 portrait sub-skills (face-structure, eyes, nose, mouth, ears, hair, expressions, skin-tones)"
```

---

### Task 7: Create stub skills for remaining domains (character, landscape, architecture, creatures)

**Files:**
- Create: `domains/character/proportions/SKILL.md`
- Create: `domains/character/poses/SKILL.md`
- Create: `domains/character/hands-feet/SKILL.md`
- Create: `domains/character/clothing/SKILL.md`
- Create: `domains/character/stylization/SKILL.md`
- Create: stubs for landscape, architecture, creatures sub-skills

**Step 1: Create character sub-skills**

Extract from `character-illustration/SKILL.md`:
- `proportions` — Head-to-body ratios, age variations, body types
- `poses` — Gesture line, weight distribution, dynamic poses, contrapposto
- `hands-feet` — Hand anatomy, finger positions, foot structure
- `clothing` — Fabric folds, wrinkle physics, costume design
- `stylization` — Chibi, cartoon, anime, realistic style differences

Each with proper frontmatter (triggers, depends, parent: character).

**Step 2: Create landscape sub-skill stubs**

Create minimal but useful SKILL.md files for:
- `sky-clouds` — Sky gradients, cloud types, sun/moon, stars, weather
- `mountains` — Mountain shapes, rock textures, snow caps, geological forms
- `water` — Rivers, oceans, lakes, reflections, waves, ripples, waterfalls
- `vegetation` — Trees (types), grass, bushes, flowers, leaves, forests
- `terrain` — Ground surfaces, roads, paths, sand, snow, dirt

Each should have proper frontmatter and at least basic SVG code examples.

**Step 3: Create architecture sub-skill stubs**

Create minimal SKILL.md files for:
- `buildings` — Building facades, windows, doors, rooflines, materials
- `interiors` — Furniture, room layout, lighting, walls, floors
- `cityscape` — Street scenes, roads, vehicles, street lights, crowds
- `structures` — Bridges, fences, walls, towers, utility structures

**Step 4: Create creatures sub-skill stubs**

Create minimal SKILL.md files for:
- `mammals` — Body structure, fur rendering, common animals (cat, dog, horse)
- `birds` — Wing anatomy, feather rendering, flight poses, common birds
- `aquatic` — Fish anatomy, scale patterns, underwater effects
- `fantasy` — Dragon design principles, hybrid creature construction

**Step 5: Commit all domain stubs**

```bash
git add plugins/svg-drawing/skills/domains/
git commit -m "feat: create sub-skills for character, landscape, architecture, and creatures domains"
```

---

## Phase 4: Cleanup and Testing

### Task 8: Remove old flat skill files

**Files:**
- Delete: All 12 original skills in `plugins/svg-drawing/skills/` (the flat ones at root level)

**Step 1: Remove old skill directories**

After verifying all content has been migrated, remove the old flat skill directories:

```bash
rm -rf plugins/svg-drawing/skills/color-and-gradients
rm -rf plugins/svg-drawing/skills/composition
rm -rf plugins/svg-drawing/skills/advanced-color-composition
rm -rf plugins/svg-drawing/skills/bezier-and-curves
rm -rf plugins/svg-drawing/skills/svg-filters-and-effects
rm -rf plugins/svg-drawing/skills/materials-and-textures
rm -rf plugins/svg-drawing/skills/illustration-styles
rm -rf plugins/svg-drawing/skills/layer-workflow
rm -rf plugins/svg-drawing/skills/character-illustration
rm -rf plugins/svg-drawing/skills/facial-details
rm -rf plugins/svg-drawing/skills/hair-details
rm -rf plugins/svg-drawing/skills/texture-details
```

**Step 2: Verify no references to old skill names**

Check that the system prompt and any other references have been updated:

```bash
grep -r "color-and-gradients\|bezier-and-curves\|svg-filters-and-effects\|materials-and-textures\|advanced-color-composition\|facial-details\|hair-details\|texture-details" server/ plugins/ --include="*.ts" --include="*.md"
```

Expected: No matches in server/ code. May find matches in design docs (that's fine).

**Step 3: Commit cleanup**

```bash
git add -A plugins/svg-drawing/skills/
git commit -m "chore: remove old flat skill files after migration to hierarchical structure"
```

---

### Task 9: Update CLAUDE.md to reflect new structure

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update the Project Structure section**

Replace the skills listing in the project structure section to reflect the new hierarchical organization:

```markdown
  - `skills/` — Hierarchical skill tree (fundamentals → techniques → domains)
    - `_index.md` — Global skill tree index
    - `fundamentals/` — 6 universal art foundations (color-theory, light-and-shadow, composition, perspective, form-and-shape, line-and-rhythm)
    - `techniques/` — 6 SVG technical skills (bezier-curves, svg-filters, gradients-patterns, materials-textures, illustration-styles, layer-workflow)
    - `domains/` — Subject-matter expertise
      - `portrait/` — 8 face/bust skills (face-structure, eyes, nose, mouth, ears, hair, expressions, skin-tones)
      - `character/` — 5 full-body skills (proportions, poses, hands-feet, clothing, stylization)
      - `landscape/` — 5 nature skills (sky-clouds, mountains, water, vegetation, terrain)
      - `architecture/` — 4 building skills (buildings, interiors, cityscape, structures)
      - `creatures/` — 4 animal skills (mammals, birds, aquatic, fantasy)
```

**Step 2: Update the Key Design Decisions section**

Add a bullet about the skill tree auto-loading mechanism.

**Step 3: Commit CLAUDE.md update**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md to reflect hierarchical skill tree structure"
```

---

### Task 10: Manual testing — verify skill registry generation

**Step 1: Write a quick test script**

Create a temporary test file to verify the registry builds correctly:

```bash
npx tsx -e "
import { buildSkillRegistry, registryToPrompt } from './server/skill-registry.js';
import { join } from 'path';

const skillsDir = join(process.cwd(), 'plugins', 'svg-drawing', 'skills');
const registry = await buildSkillRegistry(skillsDir);

console.log('=== FUNDAMENTALS ===');
console.log(registry.fundamentals.map(s => s.name));

console.log('\n=== TECHNIQUES ===');
console.log(registry.techniques.map(s => s.name));

console.log('\n=== DOMAINS ===');
for (const [name, domain] of registry.domains) {
  console.log(\`\n\${name}: \${domain.skills.map(s => s.name).join(', ')}\`);
  console.log('  auto-load:', domain.index.autoLoadChildren);
  console.log('  depends:', domain.index.depends);
}

console.log('\n=== PROMPT ===');
console.log(registryToPrompt(registry));
"
```

Expected: All 6 fundamentals, 6 techniques, and 5 domains with their sub-skills listed correctly.

**Step 2: Verify the prompt is reasonably sized**

The generated prompt should be under ~2000 tokens. Count the lines:

```bash
npx tsx -e "..." | wc -l
```

Expected: ~50-80 lines.

**Step 3: Start the dev server and verify no errors**

```bash
npm run dev:server
```

Expected: Server starts without errors. The skill registry is built when a PTY is spawned (when a drawing session starts).

---

### Task 11: Integration test — verify existing tests still pass

**Step 1: Run integration tests**

```bash
npm run test
```

Expected: All existing tests pass. The skill loading change is in the system prompt only, which doesn't affect the integration tests (they use DISABLE_PTY=1).

**Step 2: If any tests fail, investigate and fix**

The most likely failure would be if bootstrap-api tests reference old skill names. Check and update as needed.

**Step 3: Final commit if any test fixes needed**

```bash
git add -A
git commit -m "fix: update tests for skill tree restructuring"
```
