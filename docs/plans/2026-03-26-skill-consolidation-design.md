# Skill Consolidation Design

## Problem

The SVG artist plugin has 12 SKILL.md files totaling ~14,577 lines. Claude does not proactively load these skills during drawing sessions, resulting in suboptimal output despite having extensive knowledge available. The skills are loaded via `--plugin-dir` but Claude rarely invokes them because there are too many to choose from and no strong prompt-level obligation to consult them.

## Solution: Single Core Skill + Reference Documents + System Prompt Guidance

### Architecture

Replace 12 separate skills with:
1. **One core skill** (`svg-mastery`) — ~400 lines of distilled essentials, always loaded
2. **Reference documents** — full content reorganized into `references/` directory, consulted via Read tool
3. **System prompt changes** — explicit instructions to Read reference docs before drawing each part

### Directory Structure

**Before:**
```
plugins/svg-drawing/skills/
├── bezier-and-curves/SKILL.md        (1,007 lines)
├── color-and-gradients/SKILL.md      (1,400 lines)
├── composition/SKILL.md              (1,227 lines)
├── character-illustration/SKILL.md   (1,383 lines)
├── facial-details/SKILL.md           (1,220 lines)
├── hair-details/SKILL.md             (1,307 lines)
├── texture-details/SKILL.md          (1,581 lines)
├── materials-and-textures/SKILL.md   (1,143 lines)
├── svg-filters-and-effects/SKILL.md  (1,778 lines)
├── illustration-styles/SKILL.md      (277 lines)
├── layer-workflow/SKILL.md           (1,309 lines)
└── advanced-color-composition/SKILL.md (925 lines)
```

**After:**
```
plugins/svg-drawing/
├── skills/
│   └── svg-mastery/SKILL.md          ← single core skill (~400 lines)
├── references/                        ← reference docs (old skill content, reorganized)
│   ├── bezier-and-curves.md
│   ├── color-and-gradients.md
│   ├── composition.md
│   ├── character-illustration.md
│   ├── facial-details.md
│   ├── hair-details.md
│   ├── texture-details.md
│   ├── materials-and-textures.md
│   ├── svg-filters-and-effects.md
│   ├── illustration-styles.md
│   ├── layer-workflow.md
│   └── advanced-color-composition.md
├── agents/  (unchanged)
└── commands/  (unchanged)
```

### Core Skill Content (svg-mastery/SKILL.md, ~400 lines)

Four sections:

1. **Document Index (~30 lines)** — lists every reference doc path and what it covers, so Claude knows where to find what
2. **Domain Essentials (~300 lines, ~25-30 lines per domain)** — distilled key principles and common techniques from each of the 12 old skills. No full SVG code snippets (those stay in reference docs). Includes:
   - Key decision rules (e.g. "when to use quadratic vs cubic bezier")
   - Most common patterns (e.g. "5-layer hair structure: base → shadow → mid-tone → highlights → wisps")
   - Common mistake warnings
3. **Reference Lookup Workflow (~50 lines)** — step-by-step instructions for when and how to consult reference docs during drawing
4. **Quality Checklist (~20 lines)** — post-drawing self-check items extracted from old skills

### System Prompt Changes (pty-manager.ts)

Minimal changes to the existing 225-line system prompt. Add 1-3 lines of reference lookup instructions at each Phase:

**Phase 1 (Foundation):**
```
Before setting up canvas and defs, Read the relevant reference documents:
- composition.md for layout and viewBox decisions
- color-and-gradients.md for palette and gradient defs
```

**Phase 2 (Construction):**
```
Before drawing each major element, Read the relevant reference document:
- Drawing a character? → character-illustration.md, facial-details.md, hair-details.md
- Drawing curves/paths? → bezier-and-curves.md
- Adding materials/textures? → materials-and-textures.md, texture-details.md
- Choosing a style? → illustration-styles.md
```

**Phase 3 (Detail & Polish):**
```
Before applying effects and fine details:
- svg-filters-and-effects.md for filter chains
- texture-details.md for material rendering
```

`buildDynamicPrompt()` remains unchanged — it only loads layer conventions and prompt extensions.

### Reference Documents

Each reference doc is the old SKILL.md content with frontmatter removed, kept as pure reference material. The files retain their original content including SVG code snippets, parameter tables, and detailed techniques. No content is lost — it's reorganized from "skills Claude should load" to "documents Claude should read when needed".

### Impact on Other Files

| Component | Impact |
|-----------|--------|
| MCP server (`write_skill`, `list_bootstrap_assets`) | No change — operates on `data/bootstrap/`, not `plugins/svg-drawing/skills/` |
| Agents (design-advisor, detail-painter, bootstrap-reviewer) | No change — use MCP tools, not skill files |
| Commands (/reference, /design, /review) | No change — dispatch agents |
| Tests | No change — test API and functionality, not skill content |
| CLAUDE.md | Update Project Structure section to reflect new structure |

### Files Changed

1. **Delete** 12 old skill directories under `plugins/svg-drawing/skills/`
2. **Create** `plugins/svg-drawing/references/` with 12 reference docs
3. **Create** `plugins/svg-drawing/skills/svg-mastery/SKILL.md`
4. **Modify** `server/pty-manager.ts` — add reference lookup instructions to system prompt Phases
5. **Update** `CLAUDE.md` — Project Structure section
