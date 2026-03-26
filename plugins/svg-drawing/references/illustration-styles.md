# Illustration Styles Reference

Compact technical reference for 16 SVG illustration styles. Each entry covers core identity, palette, style-specific SVG techniques, a complete example, best subjects, and professional tips.

For quick style identification, see the [Style Selection Guide](#style-selection-guide) at the end. For style mixing, see [Combining Styles](#combining-styles).

---

## 1. Flat Design

- **Identity**: No depth cues (no gradients, shadows, bevels). Geometric shapes with bold solid fills. Hierarchy through scale, not shading.
- **Palette**: Primary `#3498db`, Secondary `#2ecc71`, Accent `#e74c3c`, Light `#ecf0f1`, Dark `#2c3e50`. 3–5 colors max, saturation 60–80%, lightness 45–60%.
- **Technique**:
  - Only `<rect>`, `<circle>`, `<ellipse>`, `<polygon>`, simple `<path>`. No `<filter>`, no gradients.
  - Long shadow: `<polygon>` at 45° with darkened fill at `opacity="0.15"`, clipped to background.
  - Darken variants by reducing HSL lightness 15–20%, never by adding black.
  - `rx` on `<rect>` for friendly rounded corners.

**Example** — A flat-style house:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#ecf0f1"/>
  <polygon points="50,20 15,50 85,50" fill="#e74c3c"/>
  <rect x="25" y="50" width="50" height="35" fill="#3498db"/>
  <rect x="40" y="60" width="12" height="15" fill="#2c3e50" rx="1"/>
  <rect x="55" y="55" width="10" height="10" fill="#ecf0f1" rx="1"/>
</svg>
```

**Best Subjects**: App icons, infographics, UI illustrations, explainer diagrams, marketing materials.

**Pro Tips**:
- Limit yourself to exactly 4 colors — constraints sharpen flat design.
- Use scale contrast (one big shape vs many small) instead of shadow for emphasis.
- Round corners consistently: pick one `rx` value (4–8px) and use it everywhere.
- Align all elements to a visible grid; pixel-perfect geometry defines this style.

**See Also**: `color-and-gradients.md` §Color harmony, `composition.md` §Visual hierarchy, `layer-workflow.md` §Layer naming.

---

## 2. Isometric Design

- **Identity**: 30° grid, three visible faces per object (top/left/right), no vanishing point. Light from top-left.
- **Palette**: Per object, one base hue with three face shades: top +15% lightness, left = base, right −15% lightness.
- **Technique**:
  - Transform matrix: `transform="matrix(0.866, 0.5, -0.866, 0.5, 0, 0)"` (cos30°, sin30°).
  - Or build each face as explicit `<polygon>` with isometric coordinates.
  - Iso circles → `<ellipse rx="50" ry="29">` (ratio 1:0.577).
  - Group each object's 3 faces in `<g>`. Stacking order: far objects first.
  - No CSS 3D transforms — those produce perspective, not isometric.

**Example** — An isometric cube:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" fill="#f0f0f0"/>
  <polygon points="60,20 95,40 60,60 25,40" fill="#5dade2"/>
  <polygon points="25,40 60,60 60,95 25,75" fill="#2e86c1"/>
  <polygon points="60,60 95,40 95,75 60,95" fill="#1b4f72"/>
</svg>
```

**Best Subjects**: Tech product illustrations, city/building scenes, game assets, data visualization, exploded diagrams.

**Pro Tips**:
- Pre-calculate a grid of iso coordinates and snap everything to it — freehand iso looks wrong.
- Always render three face shades from a single hue for material consistency.
- Stack objects back-to-front using document order; never use `z-index`.
- For complex scenes, build a reusable iso-cube `<symbol>` and instance with `<use>`.
- Add subtle 1px lighter stroke on top edges for a polished highlight.

**See Also**: `composition.md` §Perspective and depth, `color-and-gradients.md` §Shading with HSL.

---

## 3. Line Art / Outline

- **Identity**: Defined by strokes, not fills. Three stroke levels: heavy contour (3–5px), medium structure (1.5–2.5px), fine detail (0.5–1px).
- **Palette**: Monochrome `#1a1a1a` or `#2d2d2d` on white. Optional single accent color (<10% area). Colored variant: dark hue strokes, no fills.
- **Technique**:
  - All shapes: `fill="none"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
  - `vector-effect="non-scaling-stroke"` for consistent weight on resize.
  - Cubic Bézier (`C`) for organic curves. Cross-hatch via `<pattern>` with `<line>` and `patternTransform` rotation.
  - Depth via stroke weight — foreground heavier, background finer.

**Example** — A line-art star:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <polygon points="50,10 61,40 95,40 68,58 78,90 50,70 22,90 32,58 5,40 39,40"
    fill="none" stroke="#1a1a1a" stroke-width="2.5"
    stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="50" cy="50" r="8" fill="none" stroke="#1a1a1a" stroke-width="1"/>
</svg>
```

**Best Subjects**: Coloring pages, technical drawings, editorial illustrations, logo concepts.

**Pro Tips**:
- Use exactly three stroke-weight tiers; more looks messy, fewer looks flat.
- Set `vector-effect="non-scaling-stroke"` to maintain line weight at any zoom.
- For organic subjects, use cubic Béziers (`C`) — quadratic (`Q`) tends to look mechanical.
- Add a single accent color wash at 15% opacity for visual interest without losing the line-art feel.
- Close open paths for a cleaner feel: add `Z` to your `<path>` `d` attributes.
- Consider `stroke-dasharray` for dashed or dotted lines to suggest texture without fill.

**See Also**: `bezier-and-curves.md` §Cubic Béziers, `composition.md` §Stroke hierarchy.

---

## 4. Watercolor Simulation

- **Identity**: Imperfect edges, transparent overlapping washes, paper texture, color bleeding, granulation.
- **Palette**: Muted tones, saturation 30–55%. Leave 15–25% as unpainted paper. Typical: Warm red `#c0392b` 30–50% opacity, Ochre `#d4a843`, Cerulean `#5b9bd5`, Sap green `#6b8e5a`, Burnt sienna `#a0522d`.
- **Technique**:
  - Paper texture: `<feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4"/>` → `<feBlend mode="multiply"/>`.
  - Irregular edges: `<feTurbulence baseFrequency="0.03" numOctaves="3"/>` → `<feDisplacementMap scale="12"/>`.
  - Wet-in-wet: `<feGaussianBlur stdDeviation="3">` on bleeding shapes.
  - Granulation: `<feTurbulence baseFrequency="1.5" numOctaves="2">` composited at low opacity.
  - Washes: `<path>` at `opacity="0.3"–"0.5"`, stack multiple for darker areas.
  - Add spatter circles at `opacity="0.15"` for authentic artifacts.

**Example** — A watercolor tree:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
  <defs>
    <filter id="wc" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="t"/>
      <feDisplacementMap in="SourceGraphic" in2="t" scale="6"/>
    </filter>
  </defs>
  <rect width="100" height="120" fill="#faf5ef"/>
  <rect x="44" y="65" width="12" height="35" fill="#a0522d" opacity="0.6" filter="url(#wc)"/>
  <ellipse cx="50" cy="50" rx="30" ry="28" fill="#6b8e5a" opacity="0.4" filter="url(#wc)"/>
  <ellipse cx="42" cy="45" rx="20" ry="18" fill="#5b9bd5" opacity="0.25" filter="url(#wc)"/>
</svg>
```

**Best Subjects**: Botanical art, greeting cards, editorial headers, dreamy landscapes.

**Pro Tips**:
- Always leave unpainted paper — 20% negative space sells the watercolor illusion.
- Stack 2–3 semi-transparent washes for shadow areas instead of using darker colors.
- Keep `feDisplacementMap` scale between 5–15; higher values destroy recognizability.
- Use `multiply` blend mode for overlapping washes — it mimics real pigment mixing.
- Add 3–5 tiny spatter `<circle>` elements at opacity 0.1–0.2 for authentic randomness.
- Define each color wash as a separate layer group so you can adjust opacity per wash independently.

**See Also**: `svg-filters-and-effects.md` §Displacement and turbulence, `materials-and-textures.md` §Watercolor surfaces, `color-and-gradients.md` §Muted palettes.

---

## 5. Retro / Vintage

- **Identity**: Aged halftone printing look. Grain, sepia tone, thick borders, distressed edges, warm-shifted palette.
- **Palette**: Cream paper `#f4e8c1`, Aged red `#c45b3e`, Olive `#3a6b5e`, Mustard `#d4a843`, Warm brown `#3b2f2f`, Muted blue `#5a7d9a`. HSL saturation 25–50%.
- **Technique**:
  - Sepia via `<feColorMatrix>`:
    ```xml
    <feColorMatrix type="matrix" values="0.39 0.77 0.19 0 0  0.35 0.69 0.17 0 0  0.27 0.53 0.13 0 0  0 0 0 1 0"/>
    ```
  - Grain: `<feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3"/>` → `<feBlend mode="multiply"/>`.
  - Halftone: `<pattern>` with small `<circle>` at regular intervals, varying radius for value.
  - Distress: `<feTurbulence baseFrequency="0.02"/>` → `<feDisplacementMap scale="3"/>`.
  - Thick borders: `stroke-width="3"+`, use `paint-order="stroke fill"`.
  - Misregistration: duplicate shape, offset 1–2px, different color at low opacity.

**Example** — A retro coffee cup:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3"/>
      <feBlend in="SourceGraphic" mode="multiply"/></filter>
  </defs>
  <rect width="100" height="100" fill="#f4e8c1"/>
  <rect x="30" y="35" width="35" height="40" rx="3" fill="#c45b3e" stroke="#3b2f2f" stroke-width="3" filter="url(#grain)"/>
  <path d="M65,45 Q78,45 78,55 Q78,65 65,65" fill="none" stroke="#3b2f2f" stroke-width="3"/>
  <path d="M32,38 Q47,28 63,38" fill="none" stroke="#3b2f2f" stroke-width="2" opacity="0.5"/>
</svg>
```

**Best Subjects**: Poster art, badge/emblem design, restaurant branding, event flyers.

**Pro Tips**:
- Apply grain filter as the last compositing step — it unifies all elements as "printed together."
- Use `paint-order="stroke fill"` so thick strokes don't eat into the shape.
- Offset a duplicate shape by 1–2px in a contrasting color for print-misregistration effect.
- Keep saturation below 50% — oversaturated colors instantly break the vintage feel.
- Layer a cream `#f4e8c1` background rectangle first; vintage never sits on pure white.

**See Also**: `svg-filters-and-effects.md` §Color matrix and grain, `color-and-gradients.md` §Warm-shifted palettes, `materials-and-textures.md` §Aged paper.

---

## 6. Minimalist

- **Identity**: Extreme reduction — 3–8 total elements, 60%+ negative space, mathematical placement (golden ratio, grid), one idea per composition.
- **Palette**: Monochrome `#1a1a1a` on `#ffffff`. Two-color max: `#1a1a1a` + `#e63946`. High contrast.
- **Technique**:
  - Only `<circle>`, `<rect>`, `<line>`, simple `<path>`. Zero filters/gradients/effects.
  - Exact viewBox dimensions for precise composition. Offset from center using 1/3, 1/4, or golden ratio 0.618.
  - Single stroke weight throughout. If above 12 elements, reconsider.
  - Asymmetric padding for deliberate tension.

**Example** — A minimalist sun:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#ffffff"/>
  <circle cx="50" cy="62" r="16" fill="#1a1a1a"/>
  <line x1="50" y1="30" x2="50" y2="38" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
  <line x1="30" y1="62" x2="38" y2="62" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
  <line x1="62" y1="62" x2="70" y2="62" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
</svg>
```

**Best Subjects**: Logos, app icons, editorial spot illustrations, conceptual art.

**Pro Tips**:
- Remove elements until meaning breaks — then add exactly one back. That's minimalism.
- Use golden ratio (0.618) for element placement; mathematical precision replaces decoration.
- One single accent color used sparingly (< 5% area) creates maximum impact.
- Maintain uniform stroke weight — mixed weights add visual complexity that undermines the style.
- Test at 16×16px; if the idea reads at that size, the composition is strong enough.

**See Also**: `composition.md` §Golden ratio and negative space, `color-and-gradients.md` §Monochrome contrast.

---

## 7. Geometric / Abstract

- **Identity**: Mathematical construction — golden ratio, rotational/reflective/translational symmetry. Repetition creates visual power. Sacred geometry (flower of life, Metatron's cube).
- **Palette**: Systematic color by rule (position, angle, size). Bold: `#264653`, `#2a9d8f`, `#e9c46a`, `#f4a261`, `#e76f51`. Sacred: gold `#d4af37` on dark `#1a1a2e`. Op-art: pure B&W.
- **Technique**:
  - `transform="rotate(angle, cx, cy)"` for rotational patterns. `<use href="#id">` for shape reuse.
  - `<pattern>` for tessellation. `<g>` nesting for hierarchical transforms.
  - Trig positioning: `cx = center + r*cos(θ)`, `cy = center + r*sin(θ)`.
  - 3 decimal places for coordinates — rounding errors compound in geometric patterns.
  - Flower of life: 19 equal-radius circles on hexagonal grid. Metatron's cube: 13 circles with all-to-all connecting lines.
  - Uniform `stroke-width` across all elements.

**Example** — A geometric hexagon pattern:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#1a1a2e"/>
  <g fill="none" stroke-width="1.5">
    <circle cx="50" cy="50" r="20" stroke="#2a9d8f"/>
    <circle cx="50" cy="30" r="20" stroke="#e9c46a"/>
    <circle cx="67.3" cy="40" r="20" stroke="#f4a261"/>
    <circle cx="67.3" cy="60" r="20" stroke="#e76f51"/>
    <circle cx="50" cy="70" r="20" stroke="#264653"/>
    <circle cx="32.7" cy="60" r="20" stroke="#2a9d8f"/>
    <circle cx="32.7" cy="40" r="20" stroke="#e9c46a"/>
  </g>
</svg>
```

**Best Subjects**: Mandala art, tessellations, sacred geometry, decorative backgrounds, album covers.

**Pro Tips**:
- Use `<use href>` to reference a `<symbol>` — this ensures perfect copies and smaller SVG size.
- Calculate coordinates with trigonometry; eyeballing breaks symmetry at any non-trivial count.
- Use 3 decimal places minimum for coordinates — rounding errors compound with repetition.
- Assign colors systematically (by angle, ring index, or distance) rather than manually.
- Keep stroke-width uniform; varied weights make patterns look sloppy.

**See Also**: `bezier-and-curves.md` §Arc calculations, `composition.md` §Symmetry and repetition.

---

## 8. Art Nouveau

- **Identity**: Organic whiplash S-curves, nature as structural motif (vines, flowers, flowing hair), asymmetric balance, frame grows from content, vertical emphasis.
- **Palette**: Earth tones + jewel accents. Sage `#8B9E6E`, Dusty rose `#C08080`, Cream `#F5ECD7`, Deep teal `#2A5C5A`, Brown outline `#4A3228`. Gold: `linearGradient` `#D4A843` → `#F5D98A` → `#B8860B`.
- **Technique**:
  - Whiplash curves: cubic Bézier `C` with exaggerated control points, long smooth transitions.
  - Gold simulation: `<linearGradient>` with 5+ stops alternating light/dark gold.
  - Decorative borders as `<path>`, use `<use transform="scale(-1,1)">` for mirrored halves.
  - Line weight variation: construct thick strokes as filled `<path>` with varying width.

**Example** — An Art Nouveau flower stem:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120">
  <rect width="80" height="120" fill="#F5ECD7"/>
  <path d="M40,110 C40,80 20,70 25,50 C28,38 40,35 40,20" fill="none" stroke="#4A3228" stroke-width="2.5"/>
  <path d="M40,50 C50,45 55,35 50,28 C45,22 38,25 40,35" fill="#C08080" stroke="#4A3228" stroke-width="1"/>
  <path d="M40,50 C30,42 22,38 25,28 C28,20 38,25 40,35" fill="#8B9E6E" stroke="#4A3228" stroke-width="1"/>
  <circle cx="40" cy="22" r="5" fill="#C08080" stroke="#4A3228" stroke-width="1"/>
  <path d="M40,75 C55,68 60,55 50,50" fill="none" stroke="#8B9E6E" stroke-width="1.5"/>
</svg>
```

**Best Subjects**: Decorative borders and frames, botanical illustrations, poster design, typography ornaments.

**Pro Tips**:
- Build whiplash curves with cubic Béziers where control points are far from the line — exaggeration is key.
- Use `<linearGradient>` with 5+ stops for convincing gold surfaces — 2-stop gold looks cheap.
- Mirror half the border with `<use transform="scale(-1,1)">` to guarantee perfect symmetry.
- Vary stroke width by building outlines as filled paths rather than using uniform `stroke-width`.
- Let decorative elements grow organically from structural ones — the frame IS the content.

**See Also**: `bezier-and-curves.md` §Whiplash curves, `color-and-gradients.md` §Gold gradients, `materials-and-textures.md` §Organic surfaces.

---

## 9. Art Deco

- **Identity**: Rigid geometric forms — chevrons, zigzags, sunbursts, stepped pyramids, fan shapes. Strict bilateral/radial symmetry. Luxury materials (gold, chrome). Strong verticals.
- **Palette**: Dark bg `#0A0A1A` or `#0D1B2A`. Gold gradient `#C9A84C` → `#F2D675` → `#A67C00`. Cream `#F5E6CC`, Emerald `#1B7340`, Ruby `#9B1B30`.
- **Technique**:
  - Sunburst: `<line>` elements rotated at regular intervals with `clipPath` to contain rays in semicircle/fan.
  - Stepped shapes: nested `<rect>` elements, each smaller and offset upward.
  - Fan/arch: `<path>` with arc `A` commands.
  - Chrome/gold: multi-stop `<linearGradient>` with sharp transitions.

**Example** — An Art Deco sunburst badge:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F2D675"/><stop offset="50%" stop-color="#C9A84C"/>
      <stop offset="100%" stop-color="#A67C00"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="#0A0A1A"/>
  <g stroke="url(#gold)" stroke-width="1" opacity="0.8">
    <line x1="50" y1="50" x2="50" y2="5"/><line x1="50" y1="50" x2="72" y2="8"/>
    <line x1="50" y1="50" x2="88" y2="22"/><line x1="50" y1="50" x2="95" y2="50"/>
    <line x1="50" y1="50" x2="12" y2="22"/><line x1="50" y1="50" x2="5" y2="50"/>
    <line x1="50" y1="50" x2="28" y2="8"/>
  </g>
  <circle cx="50" cy="50" r="15" fill="#0A0A1A" stroke="url(#gold)" stroke-width="2"/>
  <circle cx="50" cy="50" r="10" fill="url(#gold)"/>
</svg>
```

**Best Subjects**: Luxury branding, event invitations, architectural illustrations, title cards and headers.

**Pro Tips**:
- Use multi-stop gold gradients with sharp transitions for chrome/metallic effect — smooth gradients read as plastic.
- Build sunbursts by rotating `<line>` elements at mathematically even intervals.
- Strict bilateral symmetry is non-negotiable; use `<use transform="scale(-1,1)">` for mirroring.
- Add thin 0.5px inner borders to shapes — Deco details live in precise secondary lines.
- Pair dark backgrounds with metallic accents for the signature luxury contrast.

**See Also**: `color-and-gradients.md` §Metallic gradients, `composition.md` §Radial symmetry, `materials-and-textures.md` §Metal surfaces.

---

## 10. Pixel Art

- **Identity**: Grid-locked, no anti-aliasing, small canvas (16×16 to 64×64), no rotation, no curves. Dithering for gradients.
- **Palette**: 4–16 colors. Game Boy: `#0F380F`, `#306230`, `#8BAC0F`, `#9BBC0F`. PICO-8: 16 curated colors. Each color has a role: base, shadow, highlight, outline, accent.
- **Technique**:
  - Each pixel = `<rect x="N" y="N" width="1" height="1"/>` at integer coordinates.
  - `shape-rendering="crispEdges"` on root `<svg>`.
  - `viewBox="0 0 32 32"` displayed at 320×320 with CSS `image-rendering: pixelated`.
  - Dithering: `<pattern>` with alternating colored rects.
  - No `<circle>`, `<ellipse>`, curves, `transform="rotate()"`.

**Example** — A pixel-art heart (8×8):
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" width="128" height="128" shape-rendering="crispEdges">
  <rect width="8" height="8" fill="#0F380F"/>
  <g fill="#8BAC0F">
    <rect x="1" y="1" width="1" height="1"/><rect x="2" y="1" width="1" height="1"/>
    <rect x="4" y="1" width="1" height="1"/><rect x="5" y="1" width="1" height="1"/>
    <rect x="0" y="2" width="1" height="1"/><rect x="1" y="2" width="1" height="1"/>
    <rect x="2" y="2" width="1" height="1"/><rect x="3" y="2" width="1" height="1"/>
    <rect x="4" y="2" width="1" height="1"/><rect x="5" y="2" width="1" height="1"/>
    <rect x="6" y="2" width="1" height="1"/><rect x="1" y="3" width="1" height="1"/>
    <rect x="2" y="3" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/>
    <rect x="4" y="3" width="1" height="1"/><rect x="5" y="3" width="1" height="1"/>
    <rect x="2" y="4" width="1" height="1"/><rect x="3" y="4" width="1" height="1"/>
    <rect x="4" y="4" width="1" height="1"/><rect x="3" y="5" width="1" height="1"/>
  </g>
</svg>
```

**Best Subjects**: Game sprites, retro icons, avatar portraits, nostalgic badges.

**Pro Tips**:
- Always use `shape-rendering="crispEdges"` — anti-aliased pixel art is ruined pixel art.
- Pick a small canvas (16×16 or 32×32) and commit; scaling up later is the whole point.
- Limit palette to 4–8 colors — constraints force creative color choices.
- Use checkerboard dithering patterns for gradients; never use actual `<linearGradient>`.
- Merge adjacent same-color pixels into single wider/taller `<rect>` for smaller file size.

**See Also**: `color-and-gradients.md` §Limited palette techniques, `layer-workflow.md` §Sprite organization.

---

## 11. Ukiyo-e / Japanese Woodblock

- **Identity**: Bold uniform black outlines (mimicking carved key block), flat color blocks (one per carved block), asymmetric composition, nature subjects, atmospheric perspective.
- **Palette**: Indigo `#264E70`, Prussian blue `#003153`, Vermillion `#CF3A24`, Ochre `#CC8833`, Sap green `#4A7C59`, Pale skin `#F5DEB3`, Paper `#F5F0E1`, Outline `#1A1A1A`. No pure white.
- **Technique**:
  - Key block: `stroke="#1A1A1A" stroke-width="2"` uniformly, `paint-order="stroke fill"`.
  - Each color area = separate `<path>` with flat fill, no gradients.
  - Seigaiha wave pattern: `<pattern>` with concentric arcs.
  - Bokashi (sole gradient exception): subtle `<linearGradient>` at sky top, color → paper cream.
  - Patterns within forms: `<pattern>` fills for fabric textures (asanoha, seigaiha, yagasuri).

**Example** — A ukiyo-e mountain with wave:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#264E70"/><stop offset="100%" stop-color="#F5F0E1"/>
    </linearGradient>
  </defs>
  <rect width="120" height="80" fill="url(#sky)"/>
  <polygon points="40,30 70,30 85,65 25,65" fill="#4A7C59" stroke="#1A1A1A" stroke-width="2"/>
  <polygon points="50,30 60,30 55,20" fill="#F5F0E1" stroke="#1A1A1A" stroke-width="1.5"/>
  <path d="M0,60 Q15,50 30,60 Q45,70 60,58 Q75,48 90,60 Q105,70 120,58 L120,80 L0,80Z"
    fill="#003153" stroke="#1A1A1A" stroke-width="2"/>
</svg>
```

**Best Subjects**: Landscapes and seascapes, nature scenes (waves, mountains, flora), figure portraits, seasonal vignettes.

**Pro Tips**:
- Use `paint-order="stroke fill"` so the outline doesn't eat into flat color fills.
- Avoid pure white — use cream/paper tones (`#F5F0E1`) for authenticity.
- Bokashi gradient is the ONLY gradient permitted; everything else is flat fill.
- Build wave crests as individual `<path>` curves, not repeated patterns — each wave is unique.
- Create depth through color temperature: cool blues recede, warm vermillion advances.

**See Also**: `composition.md` §Asymmetric balance, `color-and-gradients.md` §Atmospheric perspective, `materials-and-textures.md` §Paper textures.

---

## 12. Paper Cut / Layered Paper

- **Identity**: 3–7 depth layers, each a single flat color. Shadows between layers create physical depth. Silhouettes can be intricate. Consistent light direction.
- **Palette**: Monochromatic progression back→front. Example 5-layer: `#1B3A4B` → `#3D6B7E` → `#6BA3B5` → `#A3D5E0` → `#E8F4F8`.
- **Technique**:
  - Shadow per layer: `<feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="rgba(0,0,0,0.2)"/>`.
  - Or companion shadow `<path>` offset 2–4px, fill `rgba(0,0,0,0.15)`.
  - Paper edge: thin 0.5px lighter stroke on top/left edges.
  - Document order: farthest layer first, nearest last.

**Example** — A paper-cut landscape (3 layers):
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
  <defs>
    <filter id="shadow"><feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.2)"/></filter>
  </defs>
  <rect width="120" height="80" fill="#E8F4F8"/>
  <path d="M0,50 Q30,30 60,45 Q90,55 120,35 L120,80 L0,80Z" fill="#6BA3B5" filter="url(#shadow)"/>
  <path d="M0,60 Q40,45 70,58 Q100,68 120,50 L120,80 L0,80Z" fill="#3D6B7E" filter="url(#shadow)"/>
  <path d="M0,70 Q35,60 60,68 Q90,75 120,62 L120,80 L0,80Z" fill="#1B3A4B" filter="url(#shadow)"/>
</svg>
```

**Best Subjects**: Scenic landscapes, greeting cards, book covers, theatrical set-like compositions.

**Pro Tips**:
- Use exactly one monochromatic progression — multi-hue palettes break the paper illusion.
- Apply `<feDropShadow>` to every layer except the background for consistent depth.
- Lighten each successive back layer; the nearest layer should be darkest.
- Add a 0.5px stroke slightly lighter than the fill on each layer's top edge for a paper-edge highlight.
- Complex silhouettes (trees, cityscapes) work best on middle layers, simple shapes on front/back.
- 5–7 layers is the sweet spot; fewer looks flat, more gets visually confusing.

**See Also**: `composition.md` §Depth and layering, `svg-filters-and-effects.md` §Drop shadow.

---

## 13. Stained Glass

- **Identity**: Thick dark lead lines (2–4px) separating every region. Luminous jewel-tone fills. Radial/medallion/rose window composition. Each piece = single color.
- **Palette**: Ruby `#C41E3A`, Sapphire `#0F52BA`, Emerald `#046307`, Amber `#FFBF00`, Amethyst `#9B59B6`, Clear `#87CEEB`. Lead `#2C2C2C`.
- **Technique**:
  - Every `<path>`: `stroke="#2C2C2C" stroke-width="3" stroke-linejoin="round"`.
  - Paths must share edges exactly — no gaps.
  - Glass glow:
    ```xml
    <filter id="glass-glow">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="glow"/>
      <feBlend in="SourceGraphic" in2="glow" mode="screen"/>
    </filter>
    ```

**Example** — A stained-glass diamond:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <filter id="glow"><feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="g"/>
      <feBlend in="SourceGraphic" in2="g" mode="screen"/></filter>
  </defs>
  <rect width="100" height="100" fill="#1a1a1a"/>
  <g stroke="#2C2C2C" stroke-width="3" stroke-linejoin="round" filter="url(#glow)">
    <polygon points="50,10 75,50 50,90 25,50" fill="#0F52BA"/>
    <polygon points="50,10 75,50 50,50" fill="#87CEEB"/>
    <polygon points="50,50 75,50 50,90" fill="#046307"/>
    <polygon points="25,50 50,50 50,90" fill="#C41E3A"/>
    <polygon points="25,50 50,10 50,50" fill="#FFBF00"/>
  </g>
</svg>
```

**Best Subjects**: Rose windows, religious/spiritual motifs, decorative panels, nature medallions.

**Pro Tips**:
- Paths MUST share exact edge coordinates — gaps ruin the illusion; lead lines connect everything.
- Apply a subtle screen-mode blur filter to all glass pieces for luminous inner glow.
- Use `stroke-linejoin="round"` to mimic how real lead caming bends at corners.
- Limit each region to one flat color; gradients within panes break authenticity.
- Radial composition with a central focal point is the strongest layout for this style.
- On a dark background, the jewel tones appear to glow from within — always add a dark surround.

**See Also**: `svg-filters-and-effects.md` §Glow and blend modes, `color-and-gradients.md` §Jewel-tone palettes.

---

## 14. Engraving / Woodcut

- **Identity**: Line density = value. Hatching follows surface contour. Cross-hatching for deep shadow. High contrast black on white, no gray. Thick contour, thin internal lines.
- **Palette**: Ink `#1A1A1A` or warm `#2C1810` on paper `#FFFFFF` or aged `#F5ECD7`. Optional spot color (red `#8B2500` or blue `#1B3F5F`).
- **Technique**:
  - Three hatch densities via `<pattern>`:
    ```xml
    <pattern id="dense" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="3" stroke="#1A1A1A" stroke-width="0.8"/>
    </pattern>
    <!-- medium: width/height=5, stroke-width=0.6; light: width/height=10, stroke-width=0.5 -->
    ```
  - Cross-hatch: stack two pattern fills at 45° and −45° via `<clipPath>`.
  - Form-following: individual curved `<path>` elements instead of straight-line patterns.
  - Stipple zones: `<circle>` at varying density for soft areas (skin, clouds).

**Example** — An engraved star:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="4" stroke="#1A1A1A" stroke-width="0.7"/>
    </pattern>
  </defs>
  <rect width="100" height="100" fill="#F5ECD7"/>
  <polygon points="50,15 61,40 88,40 66,56 76,82 50,66 24,82 34,56 12,40 39,40"
    fill="url(#hatch)" stroke="#1A1A1A" stroke-width="2.5"/>
  <polygon points="50,28 56,42 72,42 60,52 64,66 50,57 36,66 40,52 28,42 44,42"
    fill="#F5ECD7" stroke="#1A1A1A" stroke-width="1"/>
</svg>
```

**Best Subjects**: Currency/certificate art, editorial illustrations, botanical/anatomical diagrams, historical reproductions, book plate art.

**Pro Tips**:
- Use three distinct hatch densities (spacing 3/5/10) for shadow/mid/highlight zones.
- Follow the surface contour with your hatch lines — straight uniform hatching looks flat.
- Cross-hatching reads as deeper shadow: stack two hatch patterns at 90° angles via clip regions.
- Keep outer contour strokes 3× thicker than internal detail lines for clear figure/ground separation.
- Add an aged paper background (`#F5ECD7`) for warmth; pure white can feel clinical.

**See Also**: `materials-and-textures.md` §Line-based textures, `bezier-and-curves.md` §Contour-following paths.

---

## 15. Neon Glow

- **Identity**: Dark background, glowing strokes (not fills), multi-layer glow (core → inner → outer → ambient spill). Smooth curves, no sharp corners. Surface reflection.
- **Palette**: Background `#0A0A14`. Hot pink `#FF1493`, Electric blue `#00BFFF`, Green `#39FF14`, Red `#FF0000`, Violet `#BF00FF`. Core is always near-white.
- **Technique**:
  - Multi-layer glow filter:
    ```xml
    <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur1"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur2"/>
      <feMerge><feMergeNode in="blur1"/><feMergeNode in="blur2"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    ```
  - Tube: `<path fill="none" stroke-linecap="round" stroke-linejoin="round"/>`.
  - Core highlight: duplicate path with thinner stroke, lighter/whiter color.
  - Wall ambient: large blurred `<ellipse>` at very low opacity behind neon.

**Example** — A neon lightning bolt:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b1"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b2"/>
      <feMerge><feMergeNode in="b1"/><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100" height="100" fill="#0A0A14"/>
  <ellipse cx="50" cy="55" rx="25" ry="8" fill="#00BFFF" opacity="0.06"/>
  <polyline points="55,15 40,48 55,48 38,85" fill="none" stroke="#00BFFF" stroke-width="4"
    stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
  <polyline points="55,15 40,48 55,48 38,85" fill="none" stroke="#E0F7FF" stroke-width="1.5"
    stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

**Best Subjects**: Signage, cyberpunk scenes, nightlife branding, UI accents, title graphics, music artwork.

**Pro Tips**:
- Always add a near-white core stroke on top of the colored glow — it sells the "hot tube" effect.
- Set filter region to `x="-50%" y="-50%" width="200%" height="200%"` to avoid glow clipping.
- Add a very low-opacity (0.05–0.10) blurred ellipse behind the sign for wall ambient spill.
- Use `stroke-linecap="round"` and `stroke-linejoin="round"` — real neon tubes can't make sharp corners.
- Limit to 2 neon colors per composition; more looks chaotic rather than dramatic.

**See Also**: `svg-filters-and-effects.md` §Gaussian blur and glow chains, `color-and-gradients.md` §High-saturation palettes.

---

## 16. Stipple / Pointillism

- **Identity**: All value from dots — density = darkness. Uniform dot size (traditional). No lines, form defined solely by dot clustering.
- **Palette**: Monochrome `#1A1A1A` on white. Sepia variant: `#4A3228` on `#F5ECD7`. Pointillism: 3–5 pure hue dots for optical color mixing.
- **Technique**:
  - Each dot: `<circle r="0.5–2"/>` positioned with pseudo-random offsets.
  - Density zones via `<clipPath>` — different dot densities per value region.
  - Pattern approach: `<pattern>` with dots, vary tile size for density.
  - Group by zone in `<g>` with shared attributes for performance.

**Example** — A stippled circle:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <rect width="80" height="80" fill="#F5ECD7"/>
  <defs>
    <clipPath id="outer"><circle cx="40" cy="40" r="28"/></clipPath>
    <clipPath id="inner"><circle cx="40" cy="40" r="14"/></clipPath>
  </defs>
  <g fill="#4A3228" clip-path="url(#outer)">
    <circle cx="18" cy="20" r="1"/><circle cx="25" cy="18" r="1"/><circle cx="32" cy="22" r="1"/>
    <circle cx="45" cy="19" r="1"/><circle cx="55" cy="21" r="1"/><circle cx="60" cy="25" r="1"/>
    <circle cx="20" cy="30" r="1"/><circle cx="38" cy="28" r="1"/><circle cx="52" cy="32" r="1"/>
    <circle cx="22" cy="55" r="1"/><circle cx="35" cy="58" r="1"/><circle cx="48" cy="56" r="1"/>
    <circle cx="58" cy="52" r="1"/><circle cx="42" cy="62" r="1"/><circle cx="30" cy="48" r="1"/>
  </g>
  <g fill="#4A3228" clip-path="url(#inner)">
    <circle cx="35" cy="36" r="1"/><circle cx="40" cy="38" r="1"/><circle cx="45" cy="35" r="1"/>
    <circle cx="38" cy="42" r="1"/><circle cx="43" cy="44" r="1"/><circle cx="36" cy="46" r="1"/>
    <circle cx="42" cy="40" r="1"/><circle cx="39" cy="34" r="1"/><circle cx="44" cy="48" r="1"/>
    <circle cx="37" cy="50" r="1"/><circle cx="41" cy="37" r="1"/><circle cx="46" cy="42" r="1"/>
  </g>
</svg>
```

**Best Subjects**: Portraits, scientific illustration, editorial art, tattoo design, fine art prints.

**Pro Tips**:
- Keep dot size uniform — varying dot radius turns stipple into a different technique.
- Control value through spacing only: tight clusters = dark, sparse = light.
- Use `<clipPath>` to define value zones and fill each with a different dot density.
- Group dots by zone in `<g>` with shared `fill` and `clip-path` for performance.
- For pointillism, place dots of 3–4 pure hues close together for optical color mixing when viewed at distance.
- Pre-generate dot positions with pseudo-random offsets from a grid — pure random placement creates uneven patches.

**See Also**: `materials-and-textures.md` §Dot-based textures, `composition.md` §Value hierarchy.

---

## Style Selection Guide

Use this table to map user requests to the appropriate style. Match on any keyword.

| Keywords | Style |
|---|---|
| "flat", "modern", "app-style", "material" | Flat Design |
| "isometric", "3D", "2.5D", "game-style" | Isometric |
| "line art", "sketch", "outline", "drawn" | Line Art |
| "watercolor", "painted", "artistic", "soft" | Watercolor |
| "retro", "vintage", "old", "poster", "aged" | Retro / Vintage |
| "minimal", "clean", "simple", "zen" | Minimalist |
| "geometric", "pattern", "mandala", "sacred" | Geometric |
| "art nouveau", "organic", "mucha", "vine" | Art Nouveau |
| "art deco", "gatsby", "1920s", "luxury" | Art Deco |
| "pixel", "8-bit", "retro game", "sprite" | Pixel Art |
| "japanese", "ukiyo-e", "woodblock", "wave" | Ukiyo-e |
| "paper cut", "layered", "shadow box" | Paper Cut |
| "stained glass", "church window", "mosaic" | Stained Glass |
| "engraving", "woodcut", "etching", "hatch" | Engraving |
| "neon", "glow", "cyberpunk", "night sign" | Neon Glow |
| "stipple", "dots", "pointillism" | Stipple |

## Performance by Style

Filter cost and render weight guide — consider these when choosing styles for complex scenes or animations.

| Style | Filter cost | Render weight |
|---|---|---|
| Flat Design, Minimalist | None | ⬜ Lightest |
| Pixel Art, Line Art, Isometric | None | 🟨 Light |
| Geometric, Stipple, Engraving | None | 🟨 Medium |
| Paper Cut, Ukiyo-e, Art Deco, Art Nouveau, Stained Glass | Low | 🟧 Medium |
| Retro/Vintage | Medium | 🟥 Heavy |
| Neon Glow | High | 🟥 Heavy |
| Watercolor | High | 🟥 Heaviest |

## Adaptive Complexity

Scale technique complexity to target size:

| Level | Size | Elements | Approach |
|---|---|---|---|
| **Icon** | 16–64px | 3–10 | Silhouette only, 1–2 colors, no filters |
| **Spot** | 64–200px | 10–50 | Basic shading, simple details |
| **Hero** | 200–800px | 50–200 | Full effects, textures, fine detail |
| **Scene** | 800px+ | 200+ | Full environment, multiple subjects |

Flat/Minimalist excel at icon level. Watercolor/Neon shine at hero. Paper Cut/Ukiyo-e/Isometric manage scene complexity well. Pixel Art is uniquely suited for icon-to-spot range. Engraving and Stipple require hero size or larger for hatch/dot patterns to read.

## Animation Hooks

| Style | Technique | Property |
|---|---|---|
| Neon Glow | Flicker | `<animate>` on `opacity` and `stdDeviation` |
| Watercolor | Wash spread | Animate `feDisplacementMap` `scale` |
| Line Art | Draw-on reveal | `stroke-dasharray` + `stroke-dashoffset` |
| Isometric | Assembly build | `<animateTransform>` on `translate` |
| Pixel Art | Sprite swap | Toggle `<g>` `visibility` |
| Geometric | Rotation | `<animateTransform type="rotate">` |
| Paper Cut | Parallax depth | Animate `translate` per layer at different speeds |
| Stained Glass | Light shift | Animate filter brightness or hue-rotate |
| Art Deco | Sunburst pulse | Animate `opacity` on ray elements |
| Stipple | Dot emergence | Stagger `opacity` animations per dot group |

## Combining Styles

Pick one as **structural base** (how shapes are built) and one as **surface treatment** (color/texture/effects). Never mix two structural bases — the geometry will conflict.

**Proven fusions:**
| Base | Surface | Result |
|---|---|---|
| Flat | Isometric | Iso shapes with flat palette — "2.5D app style" |
| Line Art | Watercolor | Clean outlines with transparent wash fills |
| Minimalist | Geometric | Reduced geometric motifs — Bauhaus influence |
| Retro | Flat | Modern flat shapes with vintage grain overlay |
| Art Deco | Neon | Geometric Deco forms with neon glow — "retro-futurism" |
| Ukiyo-e | Paper Cut | Woodblock scenes layered with paper-cut depth |
| Engraving | Stipple | Cross-hatch structure with stipple transitions |
| Pixel Art | Isometric | Voxel-style 3D pixel constructions |
| Art Nouveau | Stained Glass | Organic curves with leaded glass — "Tiffany style" |
| Paper Cut | Neon | Silhouette layers with glowing cut edges |

## Related References

- `color-and-gradients.md` — Color harmony and gradient techniques
- `svg-filters-and-effects.md` — Filter chains for watercolor, glow, vintage effects
- `composition.md` — Layout and visual hierarchy
- `materials-and-textures.md` — Material rendering techniques
- `bezier-and-curves.md` — Curve construction for organic and geometric shapes
- `advanced-color-composition.md` — OKLCH, accessibility, color psychology
- `layer-workflow.md` — Layer organization and naming conventions for multi-style projects
- `texture-details.md` — Surface texture rendering for material-specific styles
