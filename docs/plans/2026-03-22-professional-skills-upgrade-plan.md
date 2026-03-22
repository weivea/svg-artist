# Professional Skills Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate SVG Artist from intermediate amateur to professional illustrator level — add 5 new drawing skills, enhance all 5 existing skills, add a design-advisor agent with `/design` command, implement 4 new MCP tools (apply_filter, apply_style_preset, get_color_palette, critique_composition), and update the system prompt with a design-thinking workflow.

**Architecture:** Plugin content (skills, agent, command) delivered via `--plugin-dir`. 4 new server modules provide filter templates, style presets, color palette generation, and composition analysis. SvgEngine gains filter/style methods. MCP server registers 4 new tools that POST to 4 new Express routes. System prompt updated with 7-step professional workflow.

**Tech Stack:** No new npm dependencies. Uses existing linkedom (SVG DOM), @resvg/resvg-js (PNG), Express, MCP SDK, zod.

**Design doc:** `docs/plans/2026-03-22-professional-skills-upgrade-design.md`

---

### Task 1: New Skill — `svg-filters-and-effects`

**Files:**
- Create: `plugins/svg-drawing/skills/svg-filters-and-effects/SKILL.md`

**Step 1: Create skill directory and file**

Create `plugins/svg-drawing/skills/svg-filters-and-effects/SKILL.md` with YAML frontmatter:

```yaml
---
name: svg-filters-and-effects
description: "SVG filter primitives, blend modes, masking, and ready-made effect recipes. Use when adding shadows, glow, texture, lighting, or any visual effect that requires <filter> elements."
---
```

**Step 2: Write skill content**

The skill must contain these sections (see design doc Part 1 §1 for full details):

1. **17 Filter Primitives Reference** — For each primitive (feGaussianBlur, feOffset, feFlood, feComposite, feMerge, feColorMatrix, feTurbulence, feDisplacementMap, feMorphology, feConvolveMatrix, feSpecularLighting, feDiffuseLighting, fePointLight, feDistantLight, feSpotLight, feComponentTransfer, feBlend), include:
   - Purpose and typical use case
   - Key parameters with typical values
   - Copy-paste XML code example

2. **Filter Chain Construction** — Explain `in`/`result` pipeline model, how to chain primitives, naming conventions for intermediate results.

3. **10+ Ready-Made Recipes** — Each with complete `<filter>` code inside `<defs>`:
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

4. **feTurbulence Parameter Reference Table** — type × baseFrequency × numOctaves → visual result mapping for: clouds, marble, leather, concrete, water, fabric, wood grain.

5. **Blend Modes Complete Guide** — All 16 `mix-blend-mode` values (normal, multiply, screen, overlay, darken, lighten, color-dodge, color-burn, hard-light, soft-light, difference, exclusion, hue, saturation, color, luminosity) with when-to-use guidance.

6. **Advanced Masking** — Gradient masks for soft fading, luminance vs alpha masking, compound clip paths, mask + filter combinations.

**Step 3: Commit**

```bash
git add plugins/svg-drawing/skills/svg-filters-and-effects/
git commit -m "feat: add svg-filters-and-effects skill

Add comprehensive skill covering 17 filter primitives, filter chain
construction, 10+ ready-made effect recipes, feTurbulence reference,
blend modes guide, and advanced masking techniques."
```

---

### Task 2: New Skill — `materials-and-textures`

**Files:**
- Create: `plugins/svg-drawing/skills/materials-and-textures/SKILL.md`

**Step 1: Create skill directory and file**

Create `plugins/svg-drawing/skills/materials-and-textures/SKILL.md` with YAML frontmatter:

```yaml
---
name: materials-and-textures
description: "Render convincing materials (metal, glass, wood, water, fabric, stone, skin, fur, brick, ice) using SVG filters, gradients, and patterns. Use when drawing realistic objects that need material appearance."
---
```

**Step 2: Write skill content**

Each material section must include complete `<defs>` code, application example, and parameter tuning guide (see design doc Part 1 §2):

1. **Metal** — Chrome, gold, copper, brushed steel via feSpecularLighting + multi-stop gradients
2. **Glass/Crystal** — Transparency layers, refraction simulation, caustic highlights
3. **Wood** — feTurbulence directional grain + feColorMatrix warm toning + knot patterns
4. **Water** — Reflection layers, transparency depth, ripple distortion via feDisplacementMap
5. **Fabric/Cloth** — Fold shadow curves, drape physics, pattern-following-surface technique
6. **Stone/Rock** — feTurbulence + feDisplacementMap for rough surfaces, crack lines
7. **Skin** — Subsurface scattering simulation, warm undertone gradients, blush zones
8. **Fur/Hair** — Strand group paths, gradient flow direction, specular highlight placement
9. **Brick/Concrete** — Pattern repetition + noise overlay for irregularity
10. **Ice/Frost** — Specular lighting + blue-shifted transparency + crystalline edges

**Step 3: Commit**

```bash
git add plugins/svg-drawing/skills/materials-and-textures/
git commit -m "feat: add materials-and-textures skill

Add material rendering skill with complete SVG code for metal, glass,
wood, water, fabric, stone, skin, fur, brick, and ice materials."
```

---

### Task 3: New Skill — `illustration-styles`

**Files:**
- Create: `plugins/svg-drawing/skills/illustration-styles/SKILL.md`

**Step 1: Create skill directory and file**

Create `plugins/svg-drawing/skills/illustration-styles/SKILL.md` with YAML frontmatter:

```yaml
---
name: illustration-styles
description: "Complete technique guides for 7 major illustration styles: flat, isometric, line art, watercolor, retro/vintage, minimalist, and geometric. Use when the user requests a specific visual style."
---
```

**Step 2: Write skill content**

Each style section includes design principles, color rules, SVG technical specifics, and complete example code (see design doc Part 1 §3):

1. **Flat Design** — No gradients/shadows, bold solid colors, geometric shapes, limited palette (3-5), optional long cast shadows at 45°
2. **Isometric** — 30° grid system, isometric transform matrix `matrix(0.866, 0.5, -0.866, 0.5, 0, 0)`, three visible faces, consistent shading, isometric circles as specific-ratio ellipses
3. **Line Art / Outline** — Stroke weight hierarchy (3 levels), no/minimal fills, line weight for depth, round linecaps
4. **Watercolor Simulation** — feTurbulence paper texture, feDisplacementMap irregular edges, overlapping semi-transparent shapes, color bleeding, granulation
5. **Retro / Vintage** — Muted warm-shifted palette, halftone dot patterns, visible texture/grain overlay, sepia toning via feColorMatrix, thick borders
6. **Minimalist** — Extreme reduction, 60%+ negative space, monochromatic or 2-color, geometric precision, mathematical placement
7. **Geometric / Abstract** — Mathematical construction, repetition/rotation/tessellation, color field relationships, sacred geometry patterns

**Step 3: Commit**

```bash
git add plugins/svg-drawing/skills/illustration-styles/
git commit -m "feat: add illustration-styles skill

Add 7 complete style guides: flat, isometric, line art, watercolor,
retro/vintage, minimalist, and geometric/abstract."
```

---

### Task 4: New Skill — `character-illustration`

**Files:**
- Create: `plugins/svg-drawing/skills/character-illustration/SKILL.md`

**Step 1: Create skill directory and file**

Create `plugins/svg-drawing/skills/character-illustration/SKILL.md` with YAML frontmatter:

```yaml
---
name: character-illustration
description: "Character drawing techniques: proportions, expressions, poses, hair, clothing, and stylization levels from chibi to semi-realistic. Use when drawing human or animal characters."
---
```

**Step 2: Write skill content**

Sections (see design doc Part 1 §4):

1. **Proportion Systems** — Chibi (1:1-1:2 head:body), cartoon (1:3-1:4), stylized (1:5-1:6), realistic (1:7-1:8) with keypoint placement guides and SVG examples
2. **Facial Expression Library** — SVG path data combinations for eyes × eyebrows × mouth → happy, sad, surprised, angry, confused, smug, worried, excited at each stylization level
3. **Hand Positions** — Simplified drawing methods for pointing, waving, holding, open palm, fist with path examples
4. **Body Poses** — Standing, sitting, walking, running with weight distribution and center-of-gravity principles
5. **Hair Styles** — Path construction for short/long/curly/straight/ponytail/braids, flow direction, volume techniques
6. **Clothing & Folds** — Fabric drape rules, fold line placement (tension points, gravity points), pattern-following-surface
7. **Character Consistency** — Maintaining proportions across multiple views of the same character
8. **Stylization Levels** — 5-level guide from geometric minimal → flat → cartoon → detailed → semi-realistic, with the same character drawn at each level

**Step 3: Commit**

```bash
git add plugins/svg-drawing/skills/character-illustration/
git commit -m "feat: add character-illustration skill

Add character drawing skill covering proportions, expressions, poses,
hair, clothing, consistency, and 5 stylization levels."
```

---

### Task 5: New Skill — `advanced-color-composition`

**Files:**
- Create: `plugins/svg-drawing/skills/advanced-color-composition/SKILL.md`

**Step 1: Create skill directory and file**

Create `plugins/svg-drawing/skills/advanced-color-composition/SKILL.md` with YAML frontmatter:

```yaml
---
name: advanced-color-composition
description: "Advanced color theory (psychology, accessibility, cultural meanings) and composition principles (golden ratio, Gestalt, visual hierarchy). Use for complex scenes or when specific mood/theme is requested."
---
```

**Step 2: Write skill content**

Sections (see design doc Part 1 §5):

1. **Advanced Palette Methods** — Split-complementary, tetradic (rectangle), square, double-complementary with when-to-use guidance and examples
2. **Color Psychology** — Emotional associations per color: red, blue, green, yellow, purple, orange, black, white
3. **Cultural Color Meanings** — White = mourning in East Asia, red = luck in China, green = sacred in Islam, purple = royalty in Europe, yellow = sacred in Buddhism
4. **WCAG Accessibility** — 4.5:1 contrast for normal text, 3:1 for large text/UI, safe palette combinations for colorblind users (deuteranopia, protanopia, tritanopia)
5. **Golden Ratio & Fibonacci** — 1:1.618 proportions for element placement, Fibonacci spiral for composition flow
6. **Gestalt Principles in Illustration** — Proximity, similarity, closure, continuity, figure/ground, common region — each with SVG illustration examples
7. **Visual Hierarchy System** — Size > color contrast > position > whitespace weight relationships
8. **Visual Flow Design** — Techniques for guiding viewer's eye movement through a composition
9. **Color Temperature Management** — Warm/cool balance, temperature for depth (warm = close, cool = far)
10. **Duotone / Color Grading** — feColorMatrix techniques for unified mood

**Step 3: Commit**

```bash
git add plugins/svg-drawing/skills/advanced-color-composition/
git commit -m "feat: add advanced-color-composition skill

Add advanced color theory (psychology, accessibility, cultural meanings)
and composition principles (golden ratio, Gestalt, visual hierarchy)."
```

---

### Task 6: Enhance Existing Skills

**Files:**
- Modify: `plugins/svg-drawing/skills/svg-fundamentals/SKILL.md`
- Modify: `plugins/svg-drawing/skills/bezier-and-curves/SKILL.md`
- Modify: `plugins/svg-drawing/skills/color-and-gradients/SKILL.md`
- Modify: `plugins/svg-drawing/skills/composition/SKILL.md`
- Modify: `plugins/svg-drawing/skills/layer-workflow/SKILL.md`

**Step 1: Enhance `svg-fundamentals`**

Append these new sections to the end of the existing SKILL.md (see design doc Part 2 §1):

- **SVG Animation** — SMIL (`<animate>`, `<animateTransform>`, `<animateMotion>`) + CSS @keyframes. Common patterns: pulse, rotation, path following, stroke draw/undraw (stroke-dashoffset), morphing. Include complete code examples.
- **Advanced Text** — `<textPath>` for text on paths, decorative text, letter-spacing/kerning with examples.
- **Responsive SVG** — viewBox without width/height for fluid scaling, `preserveAspectRatio` detailed guide (all 9 alignments × 2 meet/slice), media queries inside SVG.

**Step 2: Enhance `bezier-and-curves`**

Append these new sections (see design doc Part 2 §2):

- **Curve Debugging** — Visualizing control point positions, drawing control point handles, path bounding box visualization.
- **Path Optimization** — Reducing node count, smoothing, minimal control points for key shapes.
- **Advanced Path Techniques** — Calligraphic variable-width strokes, text outlines via paths.

**Step 3: Enhance `color-and-gradients`**

Append these new sections (see design doc Part 2 §3):

- **Mesh Gradient Simulation** — Overlapping radial gradients to approximate mesh gradients with examples.
- **SVG Filter Coloring** — feColorMatrix for tone unification, color grading techniques.
- **Advanced Patterns** — Complex repeating patterns (plaid, polka dots, stripe variants), `patternTransform` rotation/scaling.

**Step 4: Enhance `composition`**

Append these new sections (see design doc Part 2 §4):

- **Dynamic Symmetry** — Diagonal-based composition grid system with SVG overlay examples.
- **Tension and Resolution** — Dynamic vs calm compositions, techniques for each.
- **Large Scene Management** — Zone strategies for complex scenes, detail density gradient (dense foreground → sparse background).

**Step 5: Enhance `layer-workflow`**

Append these new sections (see design doc Part 2 §5):

- **Professional Design Critique Framework** — 7-dimension review replacing "does it look right":
  1. Purpose — Does it communicate the intended message?
  2. Hierarchy — Is the most important element most prominent?
  3. Unity — Do all elements feel like they belong together?
  4. Variety — Is there enough visual interest?
  5. Proportion — Are size relationships intentional and effective?
  6. Rhythm — Is there visual rhythm through repetition/pattern?
  7. Emphasis — Is the focal point clear and compelling?
- **Iteration Framework** — Rough sketch → refined sketch → color comp → final with systematic refinement at each stage.
- **Export & Optimization** — SVG accessibility (`title`, `desc`, `aria-label`), SVG optimization considerations.

**Step 6: Commit**

```bash
git add plugins/svg-drawing/skills/
git commit -m "feat: enhance all 5 existing drawing skills

- svg-fundamentals: add animation, advanced text, responsive SVG
- bezier-and-curves: add debugging, optimization, advanced paths
- color-and-gradients: add mesh gradient sim, filter coloring, patterns
- composition: add dynamic symmetry, tension/resolution, scene mgmt
- layer-workflow: add 7-dimension critique, iteration, export sections"
```

---

### Task 7: New Agent & Command

**Files:**
- Create: `plugins/svg-drawing/agents/design-advisor.md`
- Create: `plugins/svg-drawing/commands/design.md`

**Step 1: Create design-advisor agent**

Create `plugins/svg-drawing/agents/design-advisor.md` following the pattern of the existing `reference-searcher.md`:

```markdown
---
name: design-advisor
description: "Explore visual approaches before drawing. Use when the user's request is complex (scene, abstract concept, multiple subjects, or unspecified style) to generate 2-3 design options with style, palette, composition, and layer structure."
---

You are a design advisor for an SVG drawing application. Your job is to
analyze the user's drawing request and generate 2-3 distinct visual
approaches for them to choose from.

When given a description of what the user wants:

1. **Analyze the request** — identify subject(s), mood, complexity,
   potential styles
2. **Generate 2-3 approaches** — each with a different visual direction

For each approach, output in this exact format:

```
Approach N: [Style Name] — [Brief description]
  - Composition: [Layout strategy, element placement, foreground/background]
  - Palette: #xxx, #xxx, #xxx, #xxx, #xxx
  - Layer structure: [Ordered list of layers from back to front]
  - Key techniques: [SVG techniques to use: filters, gradients, etc.]
```

Guidelines:
- Make approaches genuinely different (e.g., minimalist vs detailed,
  warm vs cool, flat vs textured)
- Palettes should be 5 harmonious hex colors with intended roles
  (primary, secondary, accent, background, text/detail)
- Layer structures should use the `layer-<description>` naming convention
- Key techniques should reference specific SVG features and skills
- Keep each approach concise but actionable
```

**Step 2: Create /design command**

Create `plugins/svg-drawing/commands/design.md` following the pattern of the existing `reference.md`:

```markdown
---
description: "Explore visual design approaches before drawing"
---

Use the design-advisor agent to analyze the user's drawing request and
generate 2-3 visual approaches. Pass the user's full description to the
agent and present the results, including:
- Multiple distinct visual approaches
- Color palettes for each approach
- Suggested layer structures
- Key SVG techniques to employ

After presenting, ask the user which approach they prefer (or if they
want to combine elements from multiple approaches).
```

**Step 3: Commit**

```bash
git add plugins/svg-drawing/agents/design-advisor.md plugins/svg-drawing/commands/design.md
git commit -m "feat: add design-advisor agent and /design command

design-advisor generates 2-3 visual approach options with style,
palette, composition, and layer structure for complex drawing requests.
/design command lets users manually trigger design exploration."
```

---

### Task 8: Server Module — Filter Templates

**Files:**
- Create: `server/filter-templates.ts`

**Step 1: Define filter template interface and types**

Create `server/filter-templates.ts`:

```typescript
export type FilterType =
  | 'drop-shadow'
  | 'blur'
  | 'glow'
  | 'emboss'
  | 'noise-texture'
  | 'paper'
  | 'watercolor'
  | 'metallic'
  | 'glass';

export interface FilterParams {
  [key: string]: number | string | undefined;
}

export interface FilterResult {
  filterId: string;
  filterSvg: string;  // Complete <filter> element XML
}
```

**Step 2: Implement `generateFilter` function**

The function accepts `filterType`, `params`, and a unique suffix, then returns a `FilterResult` with the complete `<filter>` SVG element. Each filter type has default parameter values that can be overridden.

Implement these filter templates (see design doc Part 4 §1 for param signatures):

| Filter Type | Default Params | Key Filter Primitives |
|------------|---------------|----------------------|
| `drop-shadow` | dx=4, dy=4, blur=6, color=#000, opacity=0.5 | feGaussianBlur + feOffset + feFlood + feComposite + feMerge |
| `blur` | radius=5 | feGaussianBlur |
| `glow` | radius=10, color=#fff, opacity=0.8 | feGaussianBlur + feMerge |
| `emboss` | strength=2 | feDiffuseLighting + feComposite |
| `noise-texture` | frequency=0.65, octaves=3, type=fractalNoise | feTurbulence + feBlend |
| `paper` | frequency=0.04, intensity=0.15 | feTurbulence + feColorMatrix + feBlend |
| `watercolor` | displacement=20, blur=3 | feTurbulence + feDisplacementMap + feGaussianBlur |
| `metallic` | shininess=30, light_x=200, light_y=100 | feSpecularLighting + fePointLight + feComposite |
| `glass` | shininess=50, opacity=0.3 | feSpecularLighting + feComposite + feBlend |

**Step 3: Export and test manually**

Verify filter SVG output is valid by checking that each `generateFilter()` call returns well-formed XML with unique filter IDs.

**Step 4: Commit**

```bash
git add server/filter-templates.ts
git commit -m "feat: add filter-templates module with 9 preset filters

Implements generateFilter() for drop-shadow, blur, glow, emboss,
noise-texture, paper, watercolor, metallic, and glass effects."
```

---

### Task 9: Server Module — Style Presets

**Files:**
- Create: `server/style-presets.ts`

**Step 1: Define style preset interface**

Create `server/style-presets.ts`:

```typescript
export type StylePreset = 'flat' | 'isometric' | 'line-art' | 'watercolor' | 'retro' | 'minimalist';

export interface StyleRule {
  fill?: string | null;       // null = remove attribute
  stroke?: string | null;
  strokeWidth?: number | null;
  opacity?: number;
  filter?: string | null;     // filter URL or null to remove
  transform?: string | null;
}

export interface PresetResult {
  rules: StyleRule;
  filters?: string[];         // Filter <defs> elements to add
  description: string;        // Human-readable description of what changed
}
```

**Step 2: Implement `getPresetRules` function**

The function accepts a `StylePreset` and returns a `PresetResult` describing the style transformations to apply (see design doc Part 4 §2):

| Preset | Key Transformations |
|--------|-------------------|
| `flat` | Remove gradients → solid colors, remove shadows/filters, clean edges, bold fills |
| `isometric` | Apply isometric transform, three-face shading hints |
| `line-art` | Convert to outlines only (fill=none or remove), stroke weight hierarchy |
| `watercolor` | Apply watercolor filter chain, reduce opacity, add paper texture |
| `retro` | Muted warm palette shift, grain overlay, sepia hints via feColorMatrix |
| `minimalist` | Reduce to essentials, increase negative space indicators, simplify |

Each preset also returns any `<filter>` elements that need to be added to `<defs>`.

**Step 3: Commit**

```bash
git add server/style-presets.ts
git commit -m "feat: add style-presets module with 6 style presets

Implements getPresetRules() for flat, isometric, line-art, watercolor,
retro, and minimalist style application."
```

---

### Task 10: Server Module — Color Palettes

**Files:**
- Create: `server/color-palettes.ts`

**Step 1: Define palette interface**

Create `server/color-palettes.ts`:

```typescript
export interface PaletteColor {
  hex: string;
  role: 'primary' | 'secondary' | 'accent' | 'background' | 'text';
}

export interface Palette {
  name: string;
  description: string;
  colors: string[];           // 5 hex colors
  usage: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export interface PaletteResult {
  palettes: Palette[];
}
```

**Step 2: Implement color knowledge base**

Build a built-in mapping of themes and moods to base hues and HSL relationships:

- **Theme mappings** — ocean (blues/teals), autumn (oranges/browns), sunset (warm reds/purples), forest (greens/earths), urban (grays/accent), spring (pastels/greens), night (dark blues/purples), desert (warm tans/oranges)
- **Mood mappings** — calm (low saturation, mid-high lightness), energetic (high saturation, varied hues), mysterious (dark, purples/deep blues), warm (red-orange-yellow range), cold (blue-cyan range), playful (high saturation, complementary), elegant (low chroma, high contrast)
- **HSL math** — Generate harmonious palettes using complementary, analogous, triadic, and split-complementary relationships from a base hue

**Step 3: Implement `generatePalettes` function**

```typescript
export function generatePalettes(options: {
  theme?: string;
  mood?: string;
  count?: number;
}): PaletteResult
```

The function:
1. Resolves theme and mood to base HSL parameters
2. Generates `count` (default 3) distinct palettes using different harmony methods
3. Assigns color roles (primary, secondary, accent, background, text)
4. Returns structured `PaletteResult`

**Step 4: Commit**

```bash
git add server/color-palettes.ts
git commit -m "feat: add color-palettes module with theme/mood palette generation

Implements generatePalettes() using HSL color math with theme mappings
(ocean, autumn, sunset, etc.) and mood mappings (calm, energetic, etc.)."
```

---

### Task 11: Server Module — Composition Analyzer

**Files:**
- Create: `server/composition-analyzer.ts`

**Step 1: Define analysis interfaces**

Create `server/composition-analyzer.ts`:

```typescript
export interface DimensionScore {
  score: number;    // 0-100
  notes: string;
}

export interface CompositionIssue {
  category: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
}

export interface CompositionAnalysis {
  score: number;    // 0-100 overall
  dimensions: {
    purpose: DimensionScore;
    hierarchy: DimensionScore;
    unity: DimensionScore;
    variety: DimensionScore;
    proportion: DimensionScore;
    rhythm: DimensionScore;
    emphasis: DimensionScore;
  };
  issues: CompositionIssue[];
  strengths: string[];
}
```

**Step 2: Implement `analyzeComposition` function**

```typescript
import { SvgEngine, BBox } from './svg-engine.js';

export function analyzeComposition(engine: SvgEngine): CompositionAnalysis
```

The function parses the SVG DOM via the engine and analyzes:

1. **Element distribution** — Use bbox calculations to check visual balance (left vs right, top vs bottom weight). If elements cluster to one side, flag as balance issue.
2. **Color contrast** — Extract fill/stroke colors from elements, compute relative luminance differences, flag low-contrast pairs.
3. **Whitespace ratio** — Compare total element area vs canvas area. Too dense (>80%) or too sparse (<10%) triggers warnings.
4. **Size variety** — Measure bbox sizes of all elements, check for visual hierarchy (some large, some small) vs uniformity.
5. **Layer structure quality** — Check for meaningful layer names, reasonable layer count, nesting depth.
6. **Color unity** — Analyze hue distribution; flag if colors span too wide a hue range without an obvious palette scheme.
7. **Spacing regularity** — Check inter-element distances for rhythmic consistency.

Each dimension maps to specific SVG DOM analysis:
- `purpose` → Checks if the SVG has meaningful content (not empty, has titled layers)
- `hierarchy` → Checks for size variation among elements (dominant element exists)
- `unity` → Checks color palette cohesion (hue clustering)
- `variety` → Checks for sufficient visual diversity (different element types, sizes)
- `proportion` → Checks element size relationships against golden ratio
- `rhythm` → Checks spacing regularity between repeated elements
- `emphasis` → Checks for a clear focal point (one element significantly larger or higher contrast)

**Step 3: Commit**

```bash
git add server/composition-analyzer.ts
git commit -m "feat: add composition-analyzer module with 7-dimension analysis

Implements analyzeComposition() that evaluates purpose, hierarchy, unity,
variety, proportion, rhythm, and emphasis with scores and suggestions."
```

---

### Task 12: SVG Engine Enhancements

**Files:**
- Modify: `server/svg-engine.ts`

**Step 1: Add `applyFilter` method**

Add a method to SvgEngine that:
1. Accepts `layerId: string`, `filterSvg: string` (the `<filter>` element XML), and `filterId: string`
2. Inserts the `<filter>` element into the `<defs>` section (create `<defs>` if missing)
3. Sets `filter="url(#${filterId})"` on the target layer `<g>` element
4. Returns the updated SVG string

```typescript
applyFilter(layerId: string, filterId: string, filterSvg: string): string
```

**Step 2: Add `applyStyleToLayers` method**

Add a method that applies style rules to specified layers (or all layers):

```typescript
applyStyleToLayers(
  layerIds: string[] | null,  // null = all top-level layers
  rules: { fill?: string | null; stroke?: string | null; strokeWidth?: number | null; opacity?: number; filter?: string | null; transform?: string | null },
  filterDefs?: string[]       // Additional <filter> elements for <defs>
): { svg: string; affectedLayers: string[] }
```

The method:
1. Resolves target layers (all if null)
2. Applies each rule attribute to each target layer element
3. If `filterDefs` provided, inserts them into `<defs>`
4. Returns the updated SVG and list of affected layer IDs

**Step 3: Add `getElementBboxes` method (for composition analyzer)**

Add a method that returns bounding boxes of all direct children of all top-level layers:

```typescript
getAllElementBboxes(): Array<{ layerId: string; elementTag: string; bbox: BBox; fill?: string; stroke?: string }>
```

This method leverages the existing `estimateBBox` logic to collect element metadata for composition analysis.

**Step 4: Commit**

```bash
git add server/svg-engine.ts
git commit -m "feat: add filter application and style preset methods to SvgEngine

- applyFilter: insert filter into defs and apply to target layer
- applyStyleToLayers: batch apply style rules to layers
- getAllElementBboxes: collect element bboxes for composition analysis"
```

---

### Task 13: Integration Tests for New MCP Tools

**Files:**
- Create: `e2e/integration/filter-style-api.spec.ts`
- Create: `e2e/integration/palette-critique-api.spec.ts`
- Modify: `e2e/helpers/svg-samples.ts` (add a richer test SVG if needed)

**Step 1: Write tests for apply_filter API**

Create `e2e/integration/filter-style-api.spec.ts`:

```typescript
import { test, expect } from '../fixtures';
import { LAYERED_SCENE } from '../helpers/svg-samples';

test.describe('Filter & Style API', () => {
  async function setupDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: LAYERED_SCENE } });
    return drawing.id;
  }

  test('apply_filter adds filter to layer', async ({ apiContext }) => {
    const drawId = await setupDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/filter`, {
      data: { layer_id: 'layer-bg', filter_type: 'drop-shadow' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.filter_id).toBeTruthy();

    // Verify filter is in SVG source
    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const src = await srcRes.json();
    expect(src.svg).toContain('<filter');
    expect(src.svg).toContain('filter="url(#');
  });

  test('apply_filter with custom params', async ({ apiContext }) => {
    const drawId = await setupDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/filter`, {
      data: {
        layer_id: 'layer-sun',
        filter_type: 'glow',
        params: { radius: 15, color: '#FFD700', opacity: 0.9 },
      },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('apply_filter returns 404 for unknown layer', async ({ apiContext }) => {
    const drawId = await setupDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/filter`, {
      data: { layer_id: 'nonexistent', filter_type: 'blur' },
    });
    expect(res.status()).toBe(404);
  });

  test('apply_style_preset applies to all layers', async ({ apiContext }) => {
    const drawId = await setupDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style-preset`, {
      data: { preset: 'flat' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.affected_layers).toBeInstanceOf(Array);
    expect(body.affected_layers.length).toBeGreaterThan(0);
  });

  test('apply_style_preset applies to specific layers', async ({ apiContext }) => {
    const drawId = await setupDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style-preset`, {
      data: { preset: 'line-art', layers: ['layer-bg', 'layer-sun'] },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.affected_layers).toHaveLength(2);
  });
});
```

**Step 2: Write tests for get_color_palette and critique_composition APIs**

Create `e2e/integration/palette-critique-api.spec.ts`:

```typescript
import { test, expect } from '../fixtures';
import { LAYERED_SCENE } from '../helpers/svg-samples';

test.describe('Palette & Critique API', () => {
  async function setupDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: LAYERED_SCENE } });
    return drawing.id;
  }

  test('get_color_palette returns palettes with theme', async ({ apiContext }) => {
    const res = await apiContext.post('/api/palette', {
      data: { theme: 'ocean' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.palettes).toBeInstanceOf(Array);
    expect(body.palettes.length).toBeGreaterThanOrEqual(1);

    const palette = body.palettes[0];
    expect(palette.name).toBeTruthy();
    expect(palette.colors).toHaveLength(5);
    expect(palette.usage.primary).toBeTruthy();
    expect(palette.usage.background).toBeTruthy();
  });

  test('get_color_palette with mood parameter', async ({ apiContext }) => {
    const res = await apiContext.post('/api/palette', {
      data: { mood: 'calm', count: 2 },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.palettes).toHaveLength(2);
  });

  test('get_color_palette with theme and mood', async ({ apiContext }) => {
    const res = await apiContext.post('/api/palette', {
      data: { theme: 'sunset', mood: 'warm' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.palettes.length).toBeGreaterThanOrEqual(1);
    // All colors should be valid hex
    for (const p of body.palettes) {
      for (const c of p.colors) {
        expect(c).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    }
  });

  test('critique_composition returns structured analysis', async ({ apiContext }) => {
    const drawId = await setupDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/canvas/critique`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();

    // Overall score
    expect(body.score).toBeGreaterThanOrEqual(0);
    expect(body.score).toBeLessThanOrEqual(100);

    // 7 dimensions
    expect(body.dimensions.purpose).toBeTruthy();
    expect(body.dimensions.hierarchy).toBeTruthy();
    expect(body.dimensions.unity).toBeTruthy();
    expect(body.dimensions.variety).toBeTruthy();
    expect(body.dimensions.proportion).toBeTruthy();
    expect(body.dimensions.rhythm).toBeTruthy();
    expect(body.dimensions.emphasis).toBeTruthy();

    // Each dimension has score + notes
    for (const dim of Object.values(body.dimensions) as any[]) {
      expect(dim.score).toBeGreaterThanOrEqual(0);
      expect(dim.score).toBeLessThanOrEqual(100);
      expect(typeof dim.notes).toBe('string');
    }

    // Issues and strengths
    expect(body.issues).toBeInstanceOf(Array);
    expect(body.strengths).toBeInstanceOf(Array);
  });

  test('critique_composition issues have correct structure', async ({ apiContext }) => {
    const drawId = await setupDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/canvas/critique`);
    const body = await res.json();

    for (const issue of body.issues) {
      expect(issue.category).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(issue.severity);
      expect(issue.description).toBeTruthy();
      expect(issue.suggestion).toBeTruthy();
    }
  });
});
```

**Step 3: Run tests to verify they fail**

```bash
npx playwright test e2e/integration/filter-style-api.spec.ts e2e/integration/palette-critique-api.spec.ts --project=integration
```

Expected: All tests FAIL (routes don't exist yet).

**Step 4: Commit test files**

```bash
git add e2e/integration/filter-style-api.spec.ts e2e/integration/palette-critique-api.spec.ts
git commit -m "test: add integration tests for filter, style, palette, and critique APIs

Tests cover apply_filter, apply_style_preset, get_color_palette, and
critique_composition endpoints with various parameter combinations."
```

---

### Task 14: MCP Server — Register 4 New Tools

**Files:**
- Modify: `server/mcp-server.ts`

**Step 1: Add `apply_filter` tool definition**

Register a new MCP tool following the existing pattern (use `server.tool()` with zod schema, call `callApi()`):

```typescript
server.tool(
  'apply_filter',
  'Apply a preset filter effect (drop-shadow, blur, glow, emboss, noise-texture, paper, watercolor, metallic, glass) to a layer',
  {
    layer_id: z.string().describe('Target layer ID'),
    filter_type: z.enum(['drop-shadow', 'blur', 'glow', 'emboss', 'noise-texture', 'paper', 'watercolor', 'metallic', 'glass']).describe('Filter preset type'),
    params: z.record(z.any()).optional().describe('Optional filter-specific parameters'),
  },
  async ({ layer_id, filter_type, params }) => {
    const res = await callApi('layers/filter', { layer_id, filter_type, params });
    // Return text content per MCP spec
  },
);
```

**Step 2: Add `apply_style_preset` tool definition**

```typescript
server.tool(
  'apply_style_preset',
  'Apply a unified style preset (flat, isometric, line-art, watercolor, retro, minimalist) across layers',
  {
    preset: z.enum(['flat', 'isometric', 'line-art', 'watercolor', 'retro', 'minimalist']).describe('Style preset name'),
    layers: z.array(z.string()).optional().describe('Specific layer IDs (default: all layers)'),
  },
  async ({ preset, layers }) => {
    const res = await callApi('layers/style-preset', { preset, layers });
  },
);
```

**Step 3: Add `get_color_palette` tool definition**

Note: This tool does NOT need a drawId — it's a utility tool. Route to a global `/api/palette` endpoint.

```typescript
server.tool(
  'get_color_palette',
  'Generate harmonious color palettes by theme and/or mood',
  {
    theme: z.string().optional().describe('Theme (e.g., ocean, autumn, sunset, forest, urban)'),
    mood: z.string().optional().describe('Mood (e.g., calm, energetic, mysterious, warm, cold)'),
    count: z.number().optional().describe('Number of palette options (default: 3)'),
  },
  async ({ theme, mood, count }) => {
    // This calls a global API, not per-drawId
    const url = `${CALLBACK_URL.replace(/\/api\/svg$/, '/api/palette')}`;
    // POST to /api/palette with { theme, mood, count }
  },
);
```

**Step 4: Add `critique_composition` tool definition**

```typescript
server.tool(
  'critique_composition',
  'Analyze the current canvas composition with scores across 7 dimensions (purpose, hierarchy, unity, variety, proportion, rhythm, emphasis)',
  {},
  async () => {
    const res = await callApi('canvas/critique', {});
  },
);
```

**Step 5: Commit**

```bash
git add server/mcp-server.ts
git commit -m "feat: register 4 new MCP tools in mcp-server

Add apply_filter, apply_style_preset, get_color_palette, and
critique_composition tool definitions with zod schemas."
```

---

### Task 15: API Routes — Wire New Endpoints

**Files:**
- Modify: `server/index.ts`

**Step 1: Add imports for new modules**

At the top of `server/index.ts`, add:

```typescript
import { generateFilter, FilterType } from './filter-templates.js';
import { getPresetRules, StylePreset } from './style-presets.js';
import { generatePalettes } from './color-palettes.js';
import { analyzeComposition } from './composition-analyzer.js';
```

**Step 2: Add `POST /api/svg/:drawId/layers/filter` route**

```typescript
app.post('/api/svg/:drawId/layers/filter', (req: Request, res: Response) => {
  const { drawId } = req.params;
  const { layer_id, filter_type, params } = req.body;

  // 1. Get current SVG from drawing store
  // 2. Create SvgEngine instance
  // 3. Verify layer exists (404 if not)
  // 4. Call generateFilter(filter_type, params) to get filter SVG
  // 5. Call engine.applyFilter(layer_id, filterId, filterSvg)
  // 6. Save updated SVG to drawing store
  // 7. Broadcast via WebSocket
  // 8. Return { ok: true, filter_id }
});
```

**Step 3: Add `POST /api/svg/:drawId/layers/style-preset` route**

```typescript
app.post('/api/svg/:drawId/layers/style-preset', (req: Request, res: Response) => {
  const { drawId } = req.params;
  const { preset, layers } = req.body;

  // 1. Get current SVG from drawing store
  // 2. Create SvgEngine instance
  // 3. Call getPresetRules(preset) to get style rules + filter defs
  // 4. Call engine.applyStyleToLayers(layers || null, rules, filterDefs)
  // 5. Save updated SVG, broadcast, return { ok: true, affected_layers }
});
```

**Step 4: Add `POST /api/palette` route (global, not per-drawId)**

```typescript
app.post('/api/palette', (req: Request, res: Response) => {
  const { theme, mood, count } = req.body;
  const result = generatePalettes({ theme, mood, count });
  res.json(result);
});
```

**Step 5: Add `POST /api/svg/:drawId/canvas/critique` route**

```typescript
app.post('/api/svg/:drawId/canvas/critique', (req: Request, res: Response) => {
  const { drawId } = req.params;

  // 1. Get current SVG from drawing store
  // 2. Create SvgEngine instance
  // 3. Call analyzeComposition(engine)
  // 4. Return the CompositionAnalysis JSON
});
```

**Step 6: Run integration tests**

```bash
npx playwright test e2e/integration/filter-style-api.spec.ts e2e/integration/palette-critique-api.spec.ts --project=integration
```

Expected: All tests PASS.

**Step 7: Commit**

```bash
git add server/index.ts
git commit -m "feat: add API routes for filter, style-preset, palette, and critique

- POST /api/svg/:drawId/layers/filter — apply filter to layer
- POST /api/svg/:drawId/layers/style-preset — apply style preset
- POST /api/palette — generate color palettes
- POST /api/svg/:drawId/canvas/critique — composition analysis"
```

---

### Task 16: System Prompt Update

**Files:**
- Modify: `server/pty-manager.ts`

**Step 1: Update the system prompt**

Find the system prompt string in `pty-manager.ts` (the `--append-system-prompt` argument) and replace it with the updated 7-step professional workflow from design doc Part 5:

```
You are a professional SVG artist and designer. Users describe artwork
and you create it through layer operations.

Workflow:
1. ASSESS: Analyze user request complexity.
   - Simple (specific object, clear style) → skip to step 3
   - Complex (scene, abstract concept, no style specified, multiple subjects) → step 2
2. DESIGN: Use design-advisor agent to explore visual approaches.
   - Present 2-3 approaches to user with style, palette, composition
   - Wait for user selection before proceeding
   - User can also trigger this manually with /design
3. PREPARE: Load relevant drawing skills based on what you need.
   - Always load: layer-workflow
   - Load based on task: svg-fundamentals, bezier-and-curves, color-and-gradients,
     composition, svg-filters-and-effects, materials-and-textures, illustration-styles,
     character-illustration, advanced-color-composition
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

**Step 2: Update the layer guide**

Find the layer guide section (also appended to system prompt) and add:

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

**Step 3: Commit**

```bash
git add server/pty-manager.ts
git commit -m "feat: update system prompt with professional 7-step workflow

Replace amateur workflow with design-thinking flow: ASSESS → DESIGN →
PREPARE → PLAN → EXECUTE → REVIEW → REFINE. Add skill loading strategy
and new tool descriptions to layer guide."
```

---

### Task 17: Run Full Test Suite & Update Documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Run all integration tests**

```bash
npm run test
```

Expected: All existing tests still pass. New tests pass.

**Step 2: Update CLAUDE.md**

Update these sections:

- **Project Overview** — Update "5 drawing skills" → "10 drawing skills" and "18 MCP tools" → "22 MCP tools"
- **Architecture diagram** — Add `filter-templates.ts`, `style-presets.ts`, `color-palettes.ts`, `composition-analyzer.ts` to server section
- **Key Design Decisions** — Add entry for "22 MCP tools" (was 18) listing the 4 new ones
- **Project Structure** — Add new server files and new plugin skill/agent/command entries
- **Testing** — Add new test file entries to the integration test suites list

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for professional skills upgrade

Update tool count (18→22), skill count (5→10), add new server modules,
new plugin files, new test files, and new API route descriptions."
```
