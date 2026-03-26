# Skill Tree Restructuring Design

## Problem Statement

The current svg-artist plugin has 12 flat SKILL.md files with no hierarchy, no dependency declarations, and no automatic loading mechanism. Claude CLI relies on a hard-coded system prompt hint to manually identify and load skills, which frequently fails - Claude often draws without loading relevant skills, resulting in repetitive trial-and-error instead of skill-guided professional drawing.

### Current Issues

1. **Passive skill loading** - Claude must manually recognize skill needs; no auto-routing
2. **Flat structure** - 12 skills with no parent/child relationships or dependency chains
3. **No composition** - Drawing a portrait should auto-combine face-structure + eyes + hair + etc., but requires manual identification
4. **No trigger metadata** - Skills lack keywords or conditions for when they should be loaded
5. **Context waste** - Loading all skills at once wastes context window; loading none means poor quality

## Solution: Hierarchical Directory + Auto-Aggregation (Approach C)

### Architecture Overview

Use the file system directory hierarchy to directly express the skill tree. Each directory level has an `_index.md` serving as an aggregation summary. The `buildDynamicPrompt()` method in `pty-manager.ts` auto-scans the directory structure and generates a compact skill registry injected into the system prompt.

```
plugins/svg-drawing/skills/
├── _index.md                          ← Global skill tree index + loading rules
│
├── fundamentals/                      ← Layer 1: Universal Fundamentals
│   ├── _index.md
│   ├── color-theory/SKILL.md
│   ├── light-and-shadow/SKILL.md
│   ├── composition/SKILL.md
│   ├── perspective/SKILL.md
│   ├── form-and-shape/SKILL.md
│   └── line-and-rhythm/SKILL.md
│
├── techniques/                        ← Layer 2: Technical Capabilities
│   ├── _index.md
│   ├── bezier-curves/SKILL.md
│   ├── svg-filters/SKILL.md
│   ├── gradients-patterns/SKILL.md
│   ├── materials-textures/SKILL.md
│   ├── illustration-styles/SKILL.md
│   └── layer-workflow/SKILL.md
│
└── domains/                           ← Layer 3: Domain Specialization
    ├── _index.md
    │
    ├── portrait/                      ← Portrait Drawing
    │   ├── _index.md
    │   ├── face-structure/SKILL.md
    │   ├── eyes/SKILL.md
    │   ├── nose/SKILL.md
    │   ├── mouth/SKILL.md
    │   ├── ears/SKILL.md
    │   ├── hair/SKILL.md
    │   ├── expressions/SKILL.md
    │   └── skin-tones/SKILL.md
    │
    ├── character/                     ← Character Design
    │   ├── _index.md
    │   ├── proportions/SKILL.md
    │   ├── poses/SKILL.md
    │   ├── hands-feet/SKILL.md
    │   ├── clothing/SKILL.md
    │   └── stylization/SKILL.md
    │
    ├── landscape/                     ← Natural Landscape
    │   ├── _index.md
    │   ├── sky-clouds/SKILL.md
    │   ├── mountains/SKILL.md
    │   ├── water/SKILL.md
    │   ├── vegetation/SKILL.md
    │   └── terrain/SKILL.md
    │
    ├── architecture/                  ← Architecture & Urban
    │   ├── _index.md
    │   ├── buildings/SKILL.md
    │   ├── interiors/SKILL.md
    │   ├── cityscape/SKILL.md
    │   └── structures/SKILL.md
    │
    └── creatures/                     ← Animals & Creatures
        ├── _index.md
        ├── mammals/SKILL.md
        ├── birds/SKILL.md
        ├── aquatic/SKILL.md
        └── fantasy/SKILL.md
```

**Total: 6 `_index.md` + ~38 `SKILL.md` = 44 files**

## _index.md Format

Each `_index.md` contains the category overview and child skill index:

```markdown
---
name: portrait
description: "Portrait drawing - human faces and busts"
triggers:
  - portrait
  - face
  - human
  - person
  - head
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

## Drawing Workflow
1. Establish head basic form (oval/Loomis method)
2. Draw facial structure lines (cross lines, feature placement)
3. Load sub-skills as needed for individual features
4. Add hair and skin texture
5. Refine expressions and lighting
```

## SKILL.md Frontmatter Extension

Each SKILL.md frontmatter is extended with:

```markdown
---
name: eyes
parent: portrait
description: "Eye rendering: iris, pupil, eyelashes, gaze direction, multi-angle drawing"
triggers:
  - eyes
  - pupils
  - gaze
  - eyelash
  - iris
depends:
  - fundamentals/color-theory
  - fundamentals/light-and-shadow
context_keywords:
  - face
  - expression
  - portrait
---
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier (kebab-case) |
| `description` | Yes | What this skill covers |
| `parent` | No | Parent domain (for domain sub-skills) |
| `triggers` | Yes | Keywords that indicate this skill is needed |
| `depends` | No | Skills that must be loaded before this one |
| `context_keywords` | No | Broader keywords suggesting this skill may be useful |
| `auto_load_children` | No | Children to always load with this parent (_index.md only) |

## buildDynamicPrompt() Redesign

### Current Implementation (pty-manager.ts:269-292)

```typescript
private async buildDynamicPrompt(): Promise<string> {
  const base = [
    'Layer conventions:',
    '- Name format: layer-<description>',
    '- Build order: background -> midground -> foreground -> details -> effects',
    '',
    'Skill loading:',
    '- Always load layer-workflow first for any drawing task',
    '- Load additional skills matching the task:',
    '  composition (scenes), character-illustration (figures), ...',
  ].join('\n');
  // ...
}
```

### New Implementation

```typescript
private async buildDynamicPrompt(): Promise<string> {
  const registry = await buildSkillRegistry(this.pluginDir);

  const base = [
    'Layer conventions:',
    '- Name format: layer-<description>',
    '- Build order: background -> midground -> foreground -> details -> effects',
    '',
    registry.toPromptString(),  // Generated skill tree index
  ].join('\n');

  const extensions = await loadAllPromptExtensions();
  if (extensions) {
    return base + '\n\n' + extensions;
  }
  return base;
}
```

### New Helper: buildSkillRegistry()

```typescript
interface SkillMeta {
  name: string;
  description: string;
  path: string;           // relative path from skills/
  triggers: string[];
  depends: string[];
  contextKeywords?: string[];
  parent?: string;
  children?: string[];
  autoLoadChildren?: string[];
}

interface SkillRegistry {
  fundamentals: SkillMeta[];
  techniques: SkillMeta[];
  domains: Map<string, {
    index: SkillMeta;
    skills: SkillMeta[];
  }>;
  toPromptString(): string;
}

async function buildSkillRegistry(pluginDir: string): Promise<SkillRegistry> {
  // 1. Recursively scan skills/ directory
  // 2. Parse YAML frontmatter from each _index.md and SKILL.md
  // 3. Build SkillRegistry structure
  // 4. Generate compact prompt string
}
```

### Generated Prompt Format

```
=== SKILL TREE ===
IMPORTANT: Before starting ANY drawing task, analyze the task description
and load relevant skills. Always explicitly state which skills you loaded.

FUNDAMENTALS (load matching ones for every drawing task):
  color-theory     [color,palette,gradient,hue,saturation]
  light-and-shadow [light,shadow,highlight,shading,reflection]
  composition      [composition,layout,rule-of-thirds,visual-hierarchy]
  perspective      [perspective,depth,vanishing-point,foreshortening]
  form-and-shape   [form,shape,silhouette,geometry,volume]
  line-and-rhythm  [line,stroke,rhythm,flow,contour]

TECHNIQUES (load as needed):
  bezier-curves       [curve,bezier,path,arc,spline]
  svg-filters         [filter,blur,glow,shadow-effect,emboss]
  gradients-patterns  [gradient,pattern,fill,texture-fill]
  materials-textures  [material,wood,metal,glass,fabric,stone]
  illustration-styles [flat,isometric,line-art,watercolor,retro]
  layer-workflow      [layer,workflow,naming,organization]

DOMAINS (load domain + auto-load children when task matches):
  portrait/ [portrait,face,human,person,head]
    ALWAYS-LOAD: face-structure
    DEPENDS: color-theory, light-and-shadow, form-and-shape
    ├── face-structure  [face-structure,facial-proportions,bone-structure]
    ├── eyes           [eyes,pupils,gaze,eyelash,iris]
    ├── nose           [nose,nostril,bridge]
    ├── mouth          [mouth,lips,teeth,smile]
    ├── ears           [ears,ear-canal,helix]
    ├── hair           [hair,hairstyle,bangs,braid]
    ├── expressions    [expression,emotion,micro-expression]
    └── skin-tones     [skin,skin-tone,complexion,texture]

  character/ [character,full-body,figure,pose]
    ALWAYS-LOAD: proportions
    DEPENDS: color-theory, form-and-shape, light-and-shadow
    ├── proportions    [proportions,head-ratio,body,anatomy]
    ├── poses          [pose,gesture,action,dynamic,stance]
    ├── hands-feet     [hands,feet,fingers,toes]
    ├── clothing       [clothing,fabric,wrinkles,costume]
    └── stylization    [chibi,realistic,cartoon,anime]

  landscape/ [landscape,scenery,nature,outdoor]
    ...
  architecture/ [building,architecture,interior,city]
    ...
  creatures/ [animal,creature,pet,wildlife]
    ...

=== LOADING RULES ===
1. Analyze task keywords against trigger lists above
2. Load ALL matching fundamentals first
3. If a domain matches, load its _index + ALWAYS-LOAD children
4. Load specific sub-skills based on detailed task requirements
5. Load dependencies before the skills that need them
6. State explicitly: "Loading skills: [list]" before drawing
7. During drawing, if you realize you need additional sub-skills, load them
```

## Existing Skill Migration Map

| Current Skill | New Location | Action |
|--------------|-------------|--------|
| `color-and-gradients` | `fundamentals/color-theory` + `techniques/gradients-patterns` | Split |
| `composition` | `fundamentals/composition` | Reorganize (extract universal parts) |
| `bezier-and-curves` | `techniques/bezier-curves` | Rename & move |
| `svg-filters-and-effects` | `techniques/svg-filters` | Rename & move |
| `materials-and-textures` | `techniques/materials-textures` | Rename & move |
| `illustration-styles` | `techniques/illustration-styles` | Move |
| `layer-workflow` | `techniques/layer-workflow` | Move |
| `advanced-color-composition` | Merge into `fundamentals/composition` + `fundamentals/color-theory` | Split & merge |
| `character-illustration` | `domains/character/_index.md` + split into sub-skills | Split |
| `facial-details` | Split into `domains/portrait/eyes`, `/nose`, `/mouth`, `/ears` | Split |
| `hair-details` | `domains/portrait/hair` | Move |
| `texture-details` | Merge into `techniques/materials-textures` | Merge |

## New Skills to Create (Phase 1)

| Skill | Source |
|-------|--------|
| `fundamentals/light-and-shadow` | New (based on art fundamentals research) |
| `fundamentals/perspective` | New |
| `fundamentals/form-and-shape` | New |
| `fundamentals/line-and-rhythm` | New |
| `domains/portrait/_index.md` | New |
| `domains/portrait/face-structure` | Extract from `facial-details` |
| `domains/portrait/eyes` | Extract from `facial-details` |
| `domains/portrait/nose` | Extract from `facial-details` |
| `domains/portrait/mouth` | Extract from `facial-details` |
| `domains/portrait/ears` | Extract from `facial-details` |
| `domains/portrait/expressions` | Extract from `character-illustration` |
| `domains/portrait/skin-tones` | New |

## Implementation Phases

### Phase 1 (This Implementation)
1. Create new directory structure
2. Migrate/reorganize existing 12 skills
3. Create all `_index.md` files
4. Implement `buildSkillRegistry()` helper
5. Modify `buildDynamicPrompt()` to use skill registry
6. Complete fundamentals + techniques + portrait domain
7. Test and validate

### Phase 2 (Future): Character domain
### Phase 3 (Future): Landscape domain
### Phase 4 (Future): Architecture + Creatures domains

## Backend Changes

**Files to modify: 1**
- `server/pty-manager.ts` - `buildDynamicPrompt()` method + new `buildSkillRegistry()` helper

**Files NOT modified:**
- MCP server (mcp-server.ts)
- Express routes (index.ts)
- Frontend code
- Existing tests

**New utility file (optional):**
- `server/skill-registry.ts` - Extracted skill registry logic for cleanliness

## Loading Flow Example

```
User: "Draw a portrait of a red-haired girl with a bright smile"

Claude analyzes keywords:
  - "red-haired" → hair (trigger match)
  - "girl" → portrait (trigger match) → character
  - "portrait" → portrait (trigger match)
  - "smile" → expressions, mouth (trigger match)

Auto-load sequence:
  1. fundamentals: color-theory, light-and-shadow, form-and-shape (portrait depends)
  2. domain: portrait/_index.md
  3. auto-load: face-structure (always loaded with portrait)
  4. keyword-matched: hair, expressions, mouth
  5. implicit: eyes, nose (drawing a face usually needs all features)

Claude output:
  "Loading skills: color-theory, light-and-shadow, form-and-shape,
   portrait/face-structure, portrait/eyes, portrait/nose,
   portrait/mouth, portrait/hair, portrait/expressions,
   portrait/skin-tones

   Beginning portrait of red-haired girl..."
```

## Success Criteria

1. Claude automatically loads relevant skills when given any drawing task
2. Skills are organized in a navigable tree structure
3. Adding new skills requires only creating a SKILL.md file with proper frontmatter
4. The system prompt skill registry stays compact (<2000 tokens)
5. Drawing quality improves with proper skill guidance
6. No breaking changes to existing functionality
