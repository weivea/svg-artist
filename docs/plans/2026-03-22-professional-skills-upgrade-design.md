# Professional Skills Upgrade — Design Document

**Date:** 2026-03-22
**Scope:** Full-stack upgrade — new skills, enhanced skills, new agents/commands, new MCP tools, system prompt changes

## Problem

The current 5 drawing skills (svg-fundamentals, bezier-and-curves, color-and-gradients, composition, layer-workflow) operate at an intermediate amateur level. A professional illustrator or designer needs:

- **Design thinking before drawing** — analyzing requirements, exploring visual concepts, choosing styles
- **Advanced rendering techniques** — SVG filters, material simulation, texture, lighting
- **Style versatility** — ability to switch between flat, isometric, watercolor, line art, etc.
- **Character illustration** — proportions, expressions, poses, clothing
- **Advanced color & composition** — color psychology, Gestalt principles, golden ratio, accessibility
- **Professional review process** — structured critique instead of "does it look right"

## Solution Overview

| Category | Changes |
|----------|---------|
| New skills | 5 new SKILL.md files |
| Enhanced skills | All 5 existing skills receive additions |
| New agent | `design-advisor` (Haiku model) |
| New command | `/design` |
| New MCP tools | 4 new tools |
| System prompt | Updated workflow with design-thinking flow |

---

## Part 1: New Skills (5 SKILL.md files)

### 1. `skills/svg-filters-and-effects/SKILL.md`

**Purpose:** SVG filters are the single biggest leap from amateur to professional. Shadows, lighting, textures, and material rendering all depend on filter primitives.

**Contents:**

- **17 filter primitives reference** — each primitive's purpose, parameters, typical values, with copy-paste code:
  - feGaussianBlur, feOffset, feFlood, feComposite, feMerge, feColorMatrix, feTurbulence, feDisplacementMap, feMorphology, feConvolveMatrix, feSpecularLighting, feDiffuseLighting, fePointLight, feDistantLight, feSpotLight, feComponentTransfer, feBlend

- **Filter chain construction** — `in`/`result` pipeline model, how to chain primitives, naming conventions

- **10+ ready-made recipes** with full `<filter>` code:
  - Realistic drop shadow (blur + offset + flood + composite + merge)
  - Soft glow (blur + merge)
  - Frosted glass (blur + opacity)
  - Paper/parchment texture (turbulence + colorMatrix + blend)
  - Watercolor edges (turbulence + displacementMap + blur)
  - Metallic sheen (specularLighting + composite)
  - Emboss/relief (diffuseLighting + composite)
  - Vintage/sepia tone (colorMatrix)
  - Duotone (componentTransfer)
  - Noise/grain overlay (turbulence + blend)
  - Neon glow (multiple blurs + merge at different scales)

- **feTurbulence parameter reference table** — type × baseFrequency × numOctaves → visual result:
  - Clouds, marble, leather, concrete, water, fabric, wood grain

- **Blend modes complete guide** — all 16 mix-blend-mode values:
  - normal, multiply, screen, overlay, darken, lighten, color-dodge, color-burn, hard-light, soft-light, difference, exclusion, hue, saturation, color, luminosity
  - When to use each (multiply for shadows, screen for lights, overlay for texture, soft-light for tinting)

- **Advanced masking** — gradient masks for soft fading, luminance vs alpha masking, compound clip paths, mask + filter combinations

### 2. `skills/materials-and-textures/SKILL.md`

**Purpose:** Teach Claude to render convincing materials using SVG filters + gradients + patterns.

**Contents — each material includes complete `<defs>` code + application example + parameter tuning guide:**

- **Metal** — chrome, gold, copper, brushed steel via feSpecularLighting + multi-stop gradients
- **Glass/Crystal** — transparency layers, refraction simulation, caustic highlights
- **Wood** — feTurbulence directional grain + feColorMatrix warm toning + knot patterns
- **Water** — reflection layers, transparency depth, ripple distortion via feDisplacementMap
- **Fabric/Cloth** — fold shadow curves, drape physics, pattern-following-surface technique
- **Stone/Rock** — feTurbulence + feDisplacementMap for rough surfaces, crack lines
- **Skin** — subsurface scattering simulation, warm undertone gradients, blush zones
- **Fur/Hair** — strand group paths, gradient flow direction, specular highlight placement
- **Brick/Concrete** — pattern repetition + noise overlay for irregularity
- **Ice/Frost** — specular lighting + blue-shifted transparency + crystalline edges

### 3. `skills/illustration-styles/SKILL.md`

**Purpose:** Professional illustrators switch styles per project. This skill provides complete technique guides for 7 major styles.

**Contents — each style includes design principles + color rules + SVG technical specifics + complete example code:**

- **Flat Design** — no gradients, no shadows, bold solid colors, geometric shapes, limited palette (3-5), optional long cast shadows at 45°
- **Isometric** — 30° grid system, isometric transform matrix `matrix(0.866, 0.5, -0.866, 0.5, 0, 0)`, three visible faces with consistent shading, isometric circles as specific-ratio ellipses, consistent top-left light source
- **Line Art / Outline** — stroke weight hierarchy (3 levels), no fills or minimal flat fills, line weight for depth (thick foreground, thin background), round linecaps
- **Watercolor Simulation** — feTurbulence paper texture, feDisplacementMap irregular edges, overlapping semi-transparent shapes, color bleeding at edges via gradient masks, granulation
- **Retro / Vintage** — muted warm-shifted palette, halftone dot patterns, visible texture/grain overlay, sepia toning via feColorMatrix, thick borders
- **Minimalist** — extreme reduction to essentials, 60%+ negative space, monochromatic or 2-color, geometric precision, mathematical placement
- **Geometric / Abstract** — mathematical construction, repetition/rotation/tessellation, color field relationships, sacred geometry patterns (flower of life, Metatron's cube)

### 4. `skills/character-illustration/SKILL.md`

**Purpose:** Characters are the most commonly requested subjects. From chibi to semi-realistic.

**Contents:**

- **Proportion systems** — chibi (1:1-1:2 head:body), cartoon (1:3-1:4), stylized (1:5-1:6), realistic (1:7-1:8) with keypoint placement guides
- **Facial expression library** — SVG path data combinations for eyes × eyebrows × mouth producing: happy, sad, surprised, angry, confused, smug, worried, excited — at each stylization level
- **Hand positions** — simplified drawing methods for pointing, waving, holding, open palm, fist
- **Body poses** — standing, sitting, walking, running — with weight distribution and center-of-gravity principles
- **Hair styles** — path construction for short/long/curly/straight/ponytail/braids, flow direction, volume techniques
- **Clothing & folds** — fabric drape rules, fold line placement (tension points, gravity points), pattern-following-surface
- **Character consistency** — maintaining proportions across multiple views of the same character
- **Stylization levels** — 5-level guide from geometric minimal → flat → cartoon → detailed → semi-realistic, with the same character drawn at each level

### 5. `skills/advanced-color-composition/SKILL.md`

**Purpose:** Elevate from "colors don't clash" to "colors have design intent", from "elements are there" to "composition is harmonious".

**Contents:**

- **Advanced palette methods** — split-complementary, tetradic (rectangle), square, double-complementary — when to use each and examples
- **Color psychology** — emotional associations per color: red (urgency/passion), blue (trust/calm), green (nature/growth), yellow (optimism/warning), purple (luxury/mystery), orange (energy/warmth), black (power/elegance), white (purity/simplicity)
- **Cultural color meanings** — white = mourning in East Asia, red = luck in China, green = sacred in Islam, purple = royalty in Europe, yellow = sacred in Buddhism
- **WCAG accessibility** — 4.5:1 contrast for normal text, 3:1 for large text/UI, don't rely on color alone, safe palette combinations for colorblind users (deuteranopia, protanopia, tritanopia)
- **Golden ratio & Fibonacci** — 1:1.618 proportions for element placement, Fibonacci spiral for composition flow
- **Gestalt principles in illustration** — proximity (group related), similarity (consistent attributes), closure (suggest shapes), continuity (guide eye along curves), figure/ground (foreground-background interplay), common region (enclose related elements) — each with SVG illustration examples
- **Visual hierarchy system** — size > color contrast > position > whitespace weight relationships
- **Visual flow design** — techniques for guiding viewer's eye movement path through a composition
- **Color temperature management** — warm/cool balance in scenes, temperature for depth (warm = close, cool = far)
- **Duotone / color grading** — feColorMatrix techniques for unified mood

---

## Part 2: Existing Skill Enhancements

### `svg-fundamentals` additions

- **SVG Animation** — SMIL (`<animate>`, `<animateTransform>`, `<animateMotion>`) + CSS @keyframes
  - Common patterns: pulse, rotation, path following, stroke draw/undraw (stroke-dashoffset), morphing
- **Advanced text** — `<textPath>` for text on paths, decorative text, letter-spacing/kerning
- **Responsive SVG** — viewBox without width/height for fluid scaling, preserveAspectRatio detailed guide, media queries inside SVG

### `bezier-and-curves` additions

- **Curve debugging** — visualizing control point positions for path debugging
- **Path optimization** — reducing node count, smoothing, minimal control points for key shapes
- **Advanced path techniques** — calligraphic variable-width strokes, text outlines via paths

### `color-and-gradients` additions

- **Mesh gradient simulation** — overlapping radial gradients to approximate mesh gradients
- **SVG filter coloring** — feColorMatrix for tone unification, color grading
- **Advanced patterns** — complex repeating patterns (plaid, polka dots, stripe variants), patternTransform rotation/scaling

### `composition` additions

- **Dynamic symmetry** — diagonal-based composition grid system
- **Tension and resolution** — dynamic vs calm compositions and how to design each
- **Large scene management** — zone strategies for complex scenes, detail density gradient (dense foreground → sparse background)

### `layer-workflow` additions

- **Professional design critique framework** — 7-dimension review replacing "does it look right":
  1. Purpose — Does it communicate the intended message?
  2. Hierarchy — Is the most important element most prominent?
  3. Unity — Do all elements feel like they belong together?
  4. Variety — Is there enough visual interest?
  5. Proportion — Are size relationships intentional and effective?
  6. Rhythm — Is there visual rhythm through repetition/pattern?
  7. Emphasis — Is the focal point clear and compelling?
- **Iteration framework** — rough sketch → refined sketch → color comp → final with systematic refinement at each stage
- **Export & optimization** — SVG accessibility (title, desc, aria-label), SVG optimization considerations

---

## Part 3: New Agent and Command

### Agent: `design-advisor`

**Model:** Haiku (fast, low-cost)

**Role:** Before drawing, generate 2-3 visual approach options for the user to choose from.

**Trigger logic (smart judgment):**
- **Trigger** when: user description > 15 words OR contains abstract concepts ("draw something about loneliness") OR specifies multiple subjects OR is a complex scene
- **Skip** when: user description is simple and specific ("draw a red circle", "add a tree to the left")

**Output format:**
```
Approach 1: [Style Name] — [Brief description]
  - Composition: ...
  - Palette: #xxx, #xxx, #xxx, #xxx, #xxx
  - Layer structure: ...
  - Key techniques: ...

Approach 2: [Style Name] — [Brief description]
  ...

Approach 3: [Style Name] — [Brief description]
  ...
```

**Agent file location:** `plugins/svg-drawing/agents/design-advisor.md`

### Command: `/design`

**Location:** `plugins/svg-drawing/commands/design.md`

**Purpose:** Allow users to manually trigger the design-advisor agent for design exploration, even for simple requests where auto-trigger wouldn't fire.

**Usage:** `/design [description of what you want to create]`

---

## Part 4: New MCP Tools (4 tools)

### 1. `apply_filter`

```typescript
// Parameters
layer_id: string          // Target layer
filter_type: string       // One of the preset types
params?: Record<string, any>  // Optional filter-specific parameters

// filter_type options:
"drop-shadow"    // params: { dx, dy, blur, color, opacity }
"blur"           // params: { radius }
"glow"           // params: { radius, color, opacity }
"emboss"         // params: { strength }
"noise-texture"  // params: { frequency, octaves, type }
"paper"          // params: { frequency, intensity }
"watercolor"     // params: { displacement, blur }
"metallic"       // params: { shininess, light_x, light_y }
"glass"          // params: { shininess, opacity }

// Returns: { ok: true, filter_id: string }
```

**Implementation:** Backend maintains filter templates. Given filter_type and params, generates a `<filter>` element, inserts it into `<defs>`, and sets `filter="url(#...)"` on the target layer.

### 2. `apply_style_preset`

```typescript
// Parameters
preset: string        // Style preset name
layers?: string[]     // Specific layers (default: all)

// preset options:
"flat"         // Remove gradients/shadows, bold solid colors, clean edges
"isometric"    // Apply isometric transforms, three-face shading
"line-art"     // Convert to outlines only, stroke weight hierarchy
"watercolor"   // Apply watercolor filter chain, reduce opacity
"retro"        // Muted warm palette, grain overlay, sepia hints
"minimalist"   // Reduce to essentials, increase negative space indicators

// Returns: { ok: true, affected_layers: string[] }
```

**Implementation:** Backend maintains style rule sets per preset. Iterates target layers, batch-applies fill/stroke/filter/opacity attributes.

### 3. `get_color_palette`

```typescript
// Parameters
theme?: string    // e.g., "ocean", "autumn", "sunset", "forest", "urban"
mood?: string     // e.g., "calm", "energetic", "mysterious", "warm", "cold"
count?: number    // Number of palette options to return (default: 3)

// Returns
{
  palettes: [
    {
      name: string,
      description: string,
      colors: string[],           // 5 hex colors
      usage: {                     // Suggested role for each color
        primary: string,
        secondary: string,
        accent: string,
        background: string,
        text: string
      }
    }
  ]
}
```

**Implementation:** Backend has a built-in color knowledge base (color theory + psychology mappings). Matches input parameters to generate harmonious palettes using HSL math.

### 4. `critique_composition`

```typescript
// Parameters: none (analyzes current canvas)

// Returns
{
  score: number,              // 0-100 overall score
  dimensions: {
    purpose: { score: number, notes: string },
    hierarchy: { score: number, notes: string },
    unity: { score: number, notes: string },
    variety: { score: number, notes: string },
    proportion: { score: number, notes: string },
    rhythm: { score: number, notes: string },
    emphasis: { score: number, notes: string }
  },
  issues: [
    {
      category: string,       // e.g., "balance", "contrast", "spacing"
      severity: "high" | "medium" | "low",
      description: string,
      suggestion: string
    }
  ],
  strengths: string[]         // What's working well
}
```

**Implementation:** Backend parses SVG DOM, uses bbox calculations for element distribution analysis, color contrast computation, whitespace ratio, and structural balance. Outputs structured improvement suggestions with severity levels.

---

## Part 5: System Prompt Changes

### Updated Drawing Workflow

Replace the current system prompt workflow with:

```
You are a professional SVG artist and designer. Users describe artwork
and you create it through layer operations.

Workflow:
1. ASSESS: Analyze user request complexity.
   - Simple (specific object, clear style, e.g., "draw a red star")
     → skip to step 3
   - Complex (scene, abstract concept, no style specified, multiple
     subjects) → step 2
2. DESIGN: Use design-advisor agent to explore visual approaches.
   - Present 2-3 approaches to user with style, palette, composition
   - Wait for user selection before proceeding
   - User can also trigger this manually with /design
3. PREPARE: Load relevant drawing skills based on what you need.
   - Always load: layer-workflow
   - Load based on task: svg-fundamentals (basics), bezier-and-curves
     (organic shapes), color-and-gradients (color work), composition
     (scene planning), svg-filters-and-effects (filters/textures),
     materials-and-textures (realistic materials), illustration-styles
     (specific style), character-illustration (characters/figures),
     advanced-color-composition (advanced color/layout)
4. PLAN: Define layer structure, color palette, key techniques.
   - Use get_color_palette for palette suggestions when appropriate
5. EXECUTE: Build layers background → foreground.
   - Use apply_filter for complex filter effects
   - Use apply_style_preset for unified style application
6. REVIEW: Use critique_composition for automated analysis,
   then preview_as_png for visual review.
   - Apply 7-dimension professional critique:
     Purpose → Hierarchy → Unity → Variety → Proportion → Rhythm → Emphasis
7. REFINE: Fix issues found in review. Repeat steps 6-7 until
   the critique score is satisfactory and the preview looks right.

Always give layers and elements meaningful id and data-name attributes.
```

### Layer Guide Update

Add to the appended layer guide:

```
Skill loading strategy:
- Load only the skills relevant to the current task (not all 10)
- For any drawing task, always load layer-workflow first
- Load svg-filters-and-effects when textures, shadows, or lighting are needed
- Load illustration-styles when a specific visual style is requested
- Load character-illustration for any human/animal characters
- Load materials-and-textures for realistic object rendering
- Load advanced-color-composition for complex scenes or specific mood requests

New tools available:
- apply_filter: Apply preset filter effects (drop-shadow, glow, metallic, etc.)
- apply_style_preset: Apply unified style across layers (flat, isometric, etc.)
- get_color_palette: Generate harmonious color palettes by theme/mood
- critique_composition: Get automated composition analysis with scores and suggestions
```

---

## Implementation Notes

### File Changes Summary

**New files (plugins):**
- `plugins/svg-drawing/skills/svg-filters-and-effects/SKILL.md`
- `plugins/svg-drawing/skills/materials-and-textures/SKILL.md`
- `plugins/svg-drawing/skills/illustration-styles/SKILL.md`
- `plugins/svg-drawing/skills/character-illustration/SKILL.md`
- `plugins/svg-drawing/skills/advanced-color-composition/SKILL.md`
- `plugins/svg-drawing/agents/design-advisor.md`
- `plugins/svg-drawing/commands/design.md`

**Modified files (plugins):**
- `plugins/svg-drawing/skills/svg-fundamentals/SKILL.md` — add animation, advanced text, responsive SVG sections
- `plugins/svg-drawing/skills/bezier-and-curves/SKILL.md` — add debugging, optimization, advanced path sections
- `plugins/svg-drawing/skills/color-and-gradients/SKILL.md` — add mesh gradient simulation, filter coloring, advanced patterns
- `plugins/svg-drawing/skills/composition/SKILL.md` — add dynamic symmetry, tension/resolution, large scene management
- `plugins/svg-drawing/skills/layer-workflow/SKILL.md` — add 7-dimension critique framework, iteration framework, export section

**Modified files (server):**
- `server/mcp-server.ts` — add 4 new tool definitions (apply_filter, apply_style_preset, get_color_palette, critique_composition)
- `server/svg-engine.ts` — add filter application logic, style preset logic, composition analysis
- `server/index.ts` — add 4 new API routes for the new MCP tools
- `server/pty-manager.ts` — update system prompt and layer guide

**New files (server):**
- `server/filter-templates.ts` — filter chain templates for apply_filter
- `server/style-presets.ts` — style rule sets for apply_style_preset
- `server/color-palettes.ts` — color knowledge base for get_color_palette
- `server/composition-analyzer.ts` — composition analysis logic for critique_composition

**Test files:**
- New Playwright test files for the 4 new MCP tools/API routes

### Dependencies

No new npm dependencies required. All features use existing SVG capabilities, linkedom for DOM manipulation, and resvg-js for rendering.

### Backward Compatibility

- All existing 18 MCP tools remain unchanged
- All existing 5 skills remain functional (only enhanced with new sections)
- Existing drawings and sessions are unaffected
- The design-advisor agent is optional (smart trigger logic, can be skipped)
