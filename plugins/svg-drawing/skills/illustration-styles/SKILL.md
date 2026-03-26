---
name: illustration-styles
description: "Technique guides for 16 illustration styles: flat, isometric, line art, watercolor, retro/vintage, minimalist, geometric, Art Nouveau, Art Deco, pixel art, ukiyo-e, paper cut, stained glass, engraving, neon glow, stipple. Includes hybridization and performance guidance."
---

# Illustration Styles Reference

Compact technical reference for 16 SVG illustration styles. Each entry covers core identity, palette, and style-specific SVG techniques.

---

## 1. Flat Design

- **Identity**: No depth cues (no gradients, shadows, bevels). Geometric shapes with bold solid fills. Hierarchy through scale, not shading.
- **Palette**: Primary `#3498db`, Secondary `#2ecc71`, Accent `#e74c3c`, Light `#ecf0f1`, Dark `#2c3e50`. 3–5 colors max, saturation 60–80%, lightness 45–60%.
- **Technique**:
  - Only `<rect>`, `<circle>`, `<ellipse>`, `<polygon>`, simple `<path>`. No `<filter>`, no gradients.
  - Long shadow: `<polygon>` at 45° with darkened fill at `opacity="0.15"`, clipped to background.
  - Darken variants by reducing HSL lightness 15–20%, never by adding black.
  - `rx` on `<rect>` for friendly rounded corners.

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

---

## 3. Line Art / Outline

- **Identity**: Defined by strokes, not fills. Three stroke levels: heavy contour (3–5px), medium structure (1.5–2.5px), fine detail (0.5–1px).
- **Palette**: Monochrome `#1a1a1a` or `#2d2d2d` on white. Optional single accent color (<10% area). Colored variant: dark hue strokes, no fills.
- **Technique**:
  - All shapes: `fill="none"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
  - `vector-effect="non-scaling-stroke"` for consistent weight on resize.
  - Cubic Bézier (`C`) for organic curves. Cross-hatch via `<pattern>` with `<line>` and `patternTransform` rotation.
  - Depth via stroke weight — foreground heavier, background finer.

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

---

## 6. Minimalist

- **Identity**: Extreme reduction — 3–8 total elements, 60%+ negative space, mathematical placement (golden ratio, grid), one idea per composition.
- **Palette**: Monochrome `#1a1a1a` on `#ffffff`. Two-color max: `#1a1a1a` + `#e63946`. High contrast.
- **Technique**:
  - Only `<circle>`, `<rect>`, `<line>`, simple `<path>`. Zero filters/gradients/effects.
  - Exact viewBox dimensions for precise composition. Offset from center using 1/3, 1/4, or golden ratio 0.618.
  - Single stroke weight throughout. If above 12 elements, reconsider.
  - Asymmetric padding for deliberate tension.

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

---

## 8. Art Nouveau

- **Identity**: Organic whiplash S-curves, nature as structural motif (vines, flowers, flowing hair), asymmetric balance, frame grows from content, vertical emphasis.
- **Palette**: Earth tones + jewel accents. Sage `#8B9E6E`, Dusty rose `#C08080`, Cream `#F5ECD7`, Deep teal `#2A5C5A`, Brown outline `#4A3228`. Gold: `linearGradient` `#D4A843` → `#F5D98A` → `#B8860B`.
- **Technique**:
  - Whiplash curves: cubic Bézier `C` with exaggerated control points, long smooth transitions.
  - Gold simulation: `<linearGradient>` with 5+ stops alternating light/dark gold.
  - Decorative borders as `<path>`, use `<use transform="scale(-1,1)">` for mirrored halves.
  - Line weight variation: construct thick strokes as filled `<path>` with varying width.

---

## 9. Art Deco

- **Identity**: Rigid geometric forms — chevrons, zigzags, sunbursts, stepped pyramids, fan shapes. Strict bilateral/radial symmetry. Luxury materials (gold, chrome). Strong verticals.
- **Palette**: Dark bg `#0A0A1A` or `#0D1B2A`. Gold gradient `#C9A84C` → `#F2D675` → `#A67C00`. Cream `#F5E6CC`, Emerald `#1B7340`, Ruby `#9B1B30`.
- **Technique**:
  - Sunburst: `<line>` elements rotated at regular intervals with `clipPath` to contain rays in semicircle/fan.
  - Stepped shapes: nested `<rect>` elements, each smaller and offset upward.
  - Fan/arch: `<path>` with arc `A` commands.
  - Chrome/gold: multi-stop `<linearGradient>` with sharp transitions.

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

---

## 12. Paper Cut / Layered Paper

- **Identity**: 3–7 depth layers, each a single flat color. Shadows between layers create physical depth. Silhouettes can be intricate. Consistent light direction.
- **Palette**: Monochromatic progression back→front. Example 5-layer: `#1B3A4B` → `#3D6B7E` → `#6BA3B5` → `#A3D5E0` → `#E8F4F8`.
- **Technique**:
  - Shadow per layer: `<feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="rgba(0,0,0,0.2)"/>`.
  - Or companion shadow `<path>` offset 2–4px, fill `rgba(0,0,0,0.15)`.
  - Paper edge: thin 0.5px lighter stroke on top/left edges.
  - Document order: farthest layer first, nearest last.

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

---

## 16. Stipple / Pointillism

- **Identity**: All value from dots — density = darkness. Uniform dot size (traditional). No lines, form defined solely by dot clustering.
- **Palette**: Monochrome `#1A1A1A` on white. Sepia variant: `#4A3228` on `#F5ECD7`. Pointillism: 3–5 pure hue dots for optical color mixing.
- **Technique**:
  - Each dot: `<circle r="0.5–2"/>` positioned with pseudo-random offsets.
  - Density zones via `<clipPath>` — different dot densities per value region.
  - Pattern approach: `<pattern>` with dots, vary tile size for density.
  - Group by zone in `<g>` with shared attributes for performance.

---

## Style Selection Guide

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

Scale technique complexity to target size: **Icon** (16–64px, 3–10 elements, silhouette only) → **Spot** (64–200px, 10–50, basic shading) → **Hero** (200–800px, 50–200, full effects) → **Scene** (800px+, 200+, full environment). Flat/Minimalist excel at icon level; Watercolor/Neon shine at hero; Paper Cut/Ukiyo-e manage scene complexity well.

## Animation Hooks

Neon: `<animate>` on `opacity`/`stdDeviation` for flicker. Watercolor: animate `feDisplacementMap` `scale` for spreading. Line Art: `stroke-dasharray`/`dashoffset` for draw-on. Isometric: `<animateTransform>` for assembly. Pixel Art: toggle `<g>` visibility for sprites. Geometric: `<animateTransform type="rotate">`. Paper Cut: animate `translate` per layer for parallax. Stained Glass: animate filter brightness.

## Combining Styles

Pick one as **structural base** (how shapes are built) and one as **surface treatment** (color/texture/effects). Proven fusions: Flat+Isometric (iso shapes, flat palette), Line Art+Watercolor (lines with wash fills), Minimalist+Geometric, Retro+Flat, Art Deco+Neon, Ukiyo-e+Paper Cut, Engraving+Stipple, Pixel Art+Isometric (voxel), Art Nouveau+Stained Glass (Tiffany style), Paper Cut+Neon (glowing cut edges).
