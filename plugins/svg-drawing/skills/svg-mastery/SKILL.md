---
name: svg-mastery
description: "Core SVG drawing skill: distilled essentials from all drawing domains with reference document lookup workflow."
---

# SVG Mastery

Core drawing knowledge and reference document lookup workflow. For detailed techniques, SVG code snippets, and complete parameter tables, **always Read the relevant reference document** before drawing each part.

## Reference Documents

Located in `plugins/svg-drawing/references/`. Read the relevant documents before drawing each major element.

| Document | Use When |
|----------|----------|
| `bezier-and-curves.md` | Drawing paths, curves, arcs, organic shapes |
| `color-and-gradients.md` | Choosing colors, creating gradients, patterns, color filters |
| `composition.md` | Planning layout, perspective, depth, visual balance |
| `character-illustration.md` | Drawing characters, poses, proportions, clothing |
| `facial-details.md` | Drawing faces, eyes, mouths, expressions, aging |
| `hair-details.md` | Drawing hair, strand groups, highlights, braids |
| `texture-details.md` | Rendering fabric folds, leather, metal surfaces |
| `materials-and-textures.md` | Rendering materials (metal, glass, wood, water, stone, skin, etc.) |
| `svg-filters-and-effects.md` | SVG filter chains, blur, glow, displacement, lighting |
| `illustration-styles.md` | Style-specific techniques (flat, isometric, watercolor, Art Deco, etc.) |
| `layer-workflow.md` | Layer naming, organization, iteration, critique framework |
| `advanced-color-composition.md` | Color theory, accessibility, Gestalt principles, visual hierarchy |

---

## Domain Essentials

### Curves & Paths
- **Q/T** for simple curves (waves, scallops); **C/S** for complex curves (organic shapes)
- **Arc (A)**: `A rx ry rotation large-arc sweep ex ey` — use for circles, semicircles, pie slices
- Anchor points at inflection points only — fewer points = smoother curves
- **C1 continuity**: use `S` command to auto-reflect previous handle for smooth joins
- Catmull-Rom to Bezier: `cp1 = P1 + (P2-P0)/6t`, `cp2 = P2 - (P3-P1)/6t`
- Calligraphic strokes: two parallel offset paths forming closed shape for variable width
- Magic number for circular arcs: control point offset = radius x 0.5523

### Color & Gradients
- **HSL for harmony**: keep hue constant, vary S and L for natural palette variation
- **60-30-10 rule**: 60% dominant, 30% secondary, 10% accent
- `color-interpolation="linearRGB"` for sunset/sky gradients (brighter midpoint)
- **Gradient inheritance**: define stops once with `id="base-stops"`, reuse via `href="#base-stops"` with different coordinates
- **Mesh gradient simulation**: layer 3-5 radial gradients with varying centers, `stop-opacity: 0` at edges
- **Metallic gradients**: multi-stop with sharp light/dark alternation (chrome, gold, copper)
- **Atmospheric perspective**: far = light + desaturated + blue-shifted; near = full color + dark
- `feColorMatrix type="saturate"` (0-1 desaturate, >1 boost); `type="hueRotate"` (degrees)

### Composition & Layout
- **Decomposition**: silhouette -> 3-5 major forms -> structural details -> fine details -> color
- **Golden ratio**: place key elements at 38.2% and 61.8% marks (power points at intersections)
- **Notan/value planning**: reduce to 2-3 values first; squint test — if shapes read, composition works
- **Visual weight**: size, saturation, contrast, complexity, isolation, warmth, faces, edge sharpness
- **Depth cues**: overlap, size diminution, atmospheric perspective, warm/cool temperature, vertical position
- **SVG layer order**: earlier in DOM = behind; stack: background -> midground -> foreground -> overlay
- **Negative space**: form-defining void; breathing room = emphasis

### Character Illustration
- **Proportions by style**: chibi 1:1-1:2, cartoon 1:3-1:4, stylized 1:5-1:6, realistic 1:7-1:8
- **Line of action**: ONE continuous curve head-through-torso-to-feet; NEVER straight; exaggerate 20-30%
- **Contrapposto**: shoulders and hips tilt OPPOSITE directions; weight-bearing leg under head
- **Center of gravity**: must be above support base (feet/seat) for balanced pose
- **FACS expressions**: AU6+AU12 = genuine happiness; AU1+AU4+AU15+AU17 = sadness
- **7 fold types**: pipe (single hang point), zigzag (at joints), spiral (wraps cylinder), half-lock (self-fold at bend), diaper (two-point sag), drop (free hang cone), inert (rests on surface)
- **Material behavior**: silk = many soft folds + thin stroke + opacity 0.7; denim = few sharp creases + thick stroke

### Facial Details
- **Eye styles**: cartoon (large, dot pupils), anime (8-layer: sclera->iris->pupil->shadow->highlight->eyelid->lashes), semi-realistic (iris texture with radial fibers)
- **Eye color radial gradient**: center (lightest) -> mid -> dark rim; add clipped fiber lines for realism
- **Eyebrow expression**: surprise = both ends up; anger = inner down + outer up; sadness = inner up + outer down
- **Nose by view**: front = subtle center shadow + nostril dots; 3/4 = bridge on near side + far shadow; profile = full contour
- **Lip expressions**: smile = corners up + upper lip thins; frown = corners droop + lower lip protrudes
- **Aging layers**: forehead wrinkles (3-4 lines) -> crow's feet (radiating) -> nasolabial folds (deep) -> under-eye bags -> lip thinning -> jowls

### Hair Rendering
- **5-layer structure** (back to front): base mass -> shadow sections (opacity 0.2-0.4) -> mid-tone strands (3-8 groups) -> highlight bands -> edge wisps (opacity 0.15-0.5)
- **Crown point**: top-center-back of head; ALL hair radiates outward from here
- **Highlight systems**: anime = hard-edge white band; realistic = multiple soft gradient highlights; ring light = arc across top
- **Color formula**: black (#1A1A1A -> #333 -> #555), brown (#3A2010 -> #5A3820 -> #8B6B50), blonde (#C4A870 -> #E0C88A -> #F5E6C0), red (#8B2500 -> #B03000 -> #D45030)
- **Braid construction**: alternating ellipses at +/-15 degree rotation, alternate overlap side, center shadow line
- **Hair in motion**: wind = all strands curve in direction, tips deflect more; jump = strands lift upward and spread

### Materials & Textures
- **Metal**: multi-stop linear gradient with specular lighting (`feSpecularLighting` + `fePointLight`)
- **Glass**: layered semi-transparent elements + highlight streaks via radial gradient
- **Wood**: directional `feTurbulence baseFrequency="0.02 0.2"` + `feColorMatrix` for wood tone
- **Water**: depth gradient + `feDisplacementMap` with low scale for subtle ripple
- **Stone/marble**: turbulence displacement + sharp color matrix
- **Skin**: overlapping warm radial gradients simulating subsurface scattering; always warm undertones
- **Fabric fold shadows**: gradient from transparent -> 15% black -> transparent; stroke-width 8 on curve path

### SVG Filters & Effects
- **Filter region**: expand beyond default with `x="-20%" y="-20%" width="140%" height="140%"` for shadows/glow
- **Drop shadow pattern**: `feGaussianBlur(SourceAlpha)` -> `feOffset` -> `feFlood` + `feComposite(in)` -> `feMerge` with SourceGraphic
- **Glow**: `feGaussianBlur(SourceGraphic)` -> `feMerge(blur, SourceGraphic)`
- **Turbulence tuning**: low baseFrequency (0.01-0.02) = large clouds; high (0.5-0.8) = fine grain; `fractalNoise` = smooth, `turbulence` = sharp
- **Blend modes**: `multiply` for shadows/tinting, `screen` for glow, `overlay` for texture
- **Performance**: `stdDeviation < 5` = cheap; `> 10` = expensive; limit filter chains to 4 primitives
- **S-curve contrast**: `feComponentTransfer` with `type="table"` tableValues for photographic contrast

### Illustration Styles
- **Flat design**: solid fills, no gradients/filters, long shadow at 45 degrees via polygon, round corners
- **Isometric**: `transform="matrix(0.866, 0.5, -0.866, 0.5, 0, 0)"`; 3 face shades (top +15%, left base, right -15%)
- **Line art**: `fill="none"`, 3 stroke weights (heavy 3-5px, medium 1.5-2.5px, detail 0.5-1px), round caps/joins
- **Watercolor**: `feTurbulence` paper texture + `feDisplacementMap` edges; stack 3-5 washes at opacity 0.3-0.5
- **Neon glow**: multi-layer blur filter (8px + 3px + source merged); dark bg #0A0A14; core white highlight
- **Pixel art**: `<rect width="1" height="1">` at integer coords; `shape-rendering="crispEdges"`; 4-16 colors
- **Stained glass**: dark lead stroke `#2C2C2C` width 3 on every path; jewel-tone fills; glass glow filter

### Layer Workflow & Critique
- **Naming**: always `layer-<description>` lowercase with hyphens
- **Build order**: background -> midground -> foreground -> details -> effects
- **Preview frequency**: every 3-4 operations call `preview_as_png`
- **Non-destructive editing**: use `transform_layer` for position, never modify SVG content
- **7-dimension critique**: Purpose, Hierarchy, Unity, Variety, Proportion, Rhythm, Emphasis
- **6-pass iteration**: silhouette -> color block -> depth -> light -> detail -> polish
- **Element budget**: simple icon 3-8 layers, spot illustration 8-20, full illustration 20-50, complex scene 50-100

### Advanced Color & Composition
- **OKLCH model**: L (lightness 0-1), C (chroma 0-0.4+), H (hue 0-360 degrees) — perceptually uniform
- **Simultaneous contrast**: always test accent colors against actual backgrounds
- **Color vibration fix**: reduce chroma, add neutral borders, offset lightness
- **WCAG contrast**: text needs 4.5:1 (normal) or 3:1 (large); UI components need 3:1
- **Colorblind-safe palette (Okabe-Ito)**: #0072B2, #E69F00, #999999, #56B4E9, #D55E00
- **Aerial perspective layers**: far = hsl(215,15%,72%) -> near = hsl(80,55%,35%), shift from blue/desaturated to warm/saturated
- **Gestalt principles**: proximity, similarity, continuity, closure, figure-ground — use to create visual groupings

---

## Reference Lookup Workflow

**IMPORTANT: Before drawing each major part of an artwork, Read the relevant reference documents.**

### When to look up references

| Drawing Task | Read These Documents |
|-------------|---------------------|
| Setting up canvas, planning layout | `composition.md`, `layer-workflow.md` |
| Choosing palette, creating gradients | `color-and-gradients.md`, `advanced-color-composition.md` |
| Drawing paths, curves, shapes | `bezier-and-curves.md` |
| Drawing a character (body, pose) | `character-illustration.md` |
| Drawing a face (eyes, mouth, nose) | `facial-details.md` |
| Drawing hair | `hair-details.md` |
| Rendering fabric, folds, leather | `texture-details.md` |
| Rendering materials (metal, glass, wood, water) | `materials-and-textures.md` |
| Applying filters and effects | `svg-filters-and-effects.md` |
| Choosing an illustration style | `illustration-styles.md` |
| Self-critique and iteration | `layer-workflow.md` |
| Color accessibility check | `advanced-color-composition.md` |

### How to look up references

1. **Identify** which part of the drawing you're about to work on
2. **Read** the corresponding reference document(s) from the table above using the Read tool
3. **Apply** the specific techniques and SVG code patterns from the document
4. **Draw** the element using the MCP tools
5. **Preview** with `preview_as_png` to verify the result

### Example workflow

Drawing a character portrait:
1. Read `composition.md` -> plan layout, golden ratio placement
2. Read `character-illustration.md` -> choose proportion system, establish pose
3. Read `facial-details.md` -> construct face shape, eyes, nose, mouth
4. Read `hair-details.md` -> 5-layer hair structure, highlights
5. Read `color-and-gradients.md` -> skin tone gradients, palette harmony
6. Read `texture-details.md` -> clothing folds and material rendering
7. Read `svg-filters-and-effects.md` -> final effects (shadow, glow, atmosphere)

---

## Quality Checklist

After completing a drawing, verify:

- [ ] **Composition**: focal point clear, visual flow guides the eye, negative space intentional
- [ ] **Color harmony**: 60-30-10 distribution, no unintentional color vibration
- [ ] **Depth**: atmospheric perspective applied, overlap creates spatial hierarchy
- [ ] **Layer naming**: all layers follow `layer-<description>` convention
- [ ] **Defs usage**: all gradients, filters, patterns in `<defs>`, referenced by `url(#id)`
- [ ] **Filter performance**: no more than 4 primitives per chain, stdDeviation < 10
- [ ] **Curves**: anchor points at inflection points only, smooth continuity
- [ ] **Proportions**: character proportions match chosen style system
- [ ] **7-dimension score**: Purpose, Hierarchy, Unity, Variety, Proportion, Rhythm, Emphasis — each at least 7/10
