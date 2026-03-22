---
name: illustration-styles
description: "Complete technique guides for 7 major illustration styles: flat, isometric, line art, watercolor, retro/vintage, minimalist, and geometric. Use when the user requests a specific visual style."
---

# Illustration Styles Reference

This skill provides complete technical guidance for producing professional SVG artwork in 7 distinct illustration styles. Each section covers design principles, color rules, SVG-specific techniques, and a full working example.

---

## 1. Flat Design

### Design Principles

- **No depth cues**: Eliminate gradients, drop shadows, bevels, and 3D perspective entirely.
- **Geometric simplification**: Reduce all forms to basic geometric shapes — circles, rectangles, rounded rectangles, triangles. Organic curves are allowed but kept smooth and simple.
- **Bold, solid fills**: Every shape gets a single flat color. Visual separation comes from color contrast, not lighting.
- **Limited palette**: Use 3–5 colors maximum plus 1–2 neutrals. Fewer colors produce stronger impact.
- **Optional long cast shadows**: A single 45° shadow at reduced opacity is the only permitted depth effect. The shadow is a polygon, never a gradient.
- **Clean edges**: No strokes on shapes unless stroke is a deliberate design element. Shapes sit edge-to-edge or overlap cleanly.
- **Hierarchy through scale**: Use size differences (not shading or detail) to establish visual hierarchy.

### Color Rules

- Choose a dominant hue, a complementary or analogous accent, and a neutral base.
- Colors should be saturated but not neon — aim for "friendly bold" (HSL saturation 60–80%, lightness 45–60%).
- Darken variants by reducing lightness 15–20% (for shadow shapes), never by adding black.
- A typical flat palette:
  - Primary: `#3498db` (blue)
  - Secondary: `#2ecc71` (green)
  - Accent: `#e74c3c` (red)
  - Light neutral: `#ecf0f1`
  - Dark neutral: `#2c3e50`

### SVG Technical Specifics

- **Use**: `<rect>`, `<circle>`, `<ellipse>`, `<polygon>`, `<path>` with simple curves.
- **Avoid**: `<linearGradient>`, `<radialGradient>`, `<filter>` (no blur, no shadows via filters), `<feDropShadow>`.
- **Long shadow technique**: Create a `<polygon>` extending at 45° from the object, filled with a darkened color at `opacity="0.15"`. Clip it to the background area using `<clipPath>`.
- **Rounded corners**: Use `rx` on `<rect>` for friendly, approachable shapes.
- **Layer order matters**: Since there are no shadows or blending, z-order (document order) is the primary depth mechanism.

### Example: Flat Design Notification Bell

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <!-- Background -->
  <rect width="200" height="200" fill="#3498db" rx="16"/>

  <!-- Long cast shadow (45° down-right) -->
  <polygon points="100,45 155,100 155,140 130,140 130,150 70,150 70,140 45,140 45,100"
           transform="translate(12,12)" fill="#1a6fb0" opacity="0.2"/>

  <!-- Bell body -->
  <path d="M100,45 C125,45 155,70 155,100 L155,140 L45,140 L45,100 C45,70 75,45 100,45Z"
        fill="#f1c40f"/>

  <!-- Bell opening (bottom bar) -->
  <rect x="45" y="132" width="110" height="12" rx="3" fill="#d4a800"/>

  <!-- Clapper -->
  <circle cx="100" cy="150" r="10" fill="#f1c40f"/>

  <!-- Top knob -->
  <circle cx="100" cy="45" r="7" fill="#f1c40f"/>

  <!-- Notification dot -->
  <circle cx="140" cy="55" r="16" fill="#e74c3c"/>
  <text x="140" y="60" text-anchor="middle" fill="#fff"
        font-family="Arial, sans-serif" font-size="16" font-weight="bold">3</text>
</svg>
```

**Key techniques demonstrated**: Solid fills only, geometric shapes, single 45° cast shadow polygon, limited 4-color palette, no gradients or filters.

---

## 2. Isometric Design

### Design Principles

- **30° grid system**: All horizontal lines run at 30° from the true horizontal. Vertical lines remain vertical. This produces the characteristic "2.5D" look.
- **Three visible faces**: Every object shows a top face, a left face, and a right face. Each face gets a different shade of the same hue to simulate consistent lighting.
- **Consistent light source**: Light comes from the top-left. The top face is lightest, the left face is medium, and the right face is darkest.
- **No vanishing point**: Unlike true perspective, parallel lines stay parallel. Objects do not diminish with distance.
- **Pixel-perfect alignment**: Edges of adjacent objects must align exactly on the isometric grid. Gaps or overlaps break the illusion.
- **Stacking order**: Objects further from the viewer (higher and to the left) are rendered first. Closer objects overlap them.

### Color Rules

- For each object, pick one base hue and derive three face colors:
  - **Top face**: Base lightness + 15% (e.g., `hsl(210, 60%, 65%)`)
  - **Left face**: Base lightness (e.g., `hsl(210, 60%, 50%)`)
  - **Right face**: Base lightness - 15% (e.g., `hsl(210, 60%, 35%)`)
- Maintain the same lightness offsets across all objects for consistency.
- Ground planes and shadows use a neutral dark at low opacity (`rgba(0,0,0,0.1)`).

### SVG Technical Specifics

- **Isometric transform matrix**: Apply `transform="matrix(0.866, 0.5, -0.866, 0.5, 0, 0)"` to convert flat 2D drawings into isometric projection. `0.866 ≈ cos(30°)` and `0.5 = sin(30°)`.
- **Building faces manually**: For precise control, define each face as a `<polygon>` with explicit isometric coordinates rather than relying on the matrix transform.
- **Isometric circles**: True circles become ellipses in isometric view. Use `<ellipse rx="50" ry="29">` (ratio ≈ 1 : 0.577) on the top face, rotated appropriately for side faces.
- **Use `<g>` groups**: Group each object's three faces into a `<g>` element for easy positioning with `transform="translate(x, y)"`.
- **Avoid**: `perspective`, `rotate3d`, or CSS 3D transforms — these produce perspective projection, not isometric.

### Example: Isometric Cube Stack

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <defs>
    <!-- Reusable isometric cube: each cube is 60 iso-units wide -->
    <!-- Top face color, left face color, right face color passed via groups -->
  </defs>

  <!-- Ground shadow -->
  <polygon points="150,260 230,220 150,180 70,220" fill="#000" opacity="0.08"/>

  <!-- Bottom cube -->
  <g>
    <!-- Top face (lightest) -->
    <polygon points="150,140 230,180 150,220 70,180" fill="#74b9ff"/>
    <!-- Left face (medium) -->
    <polygon points="70,180 150,220 150,260 70,220" fill="#0984e3"/>
    <!-- Right face (darkest) -->
    <polygon points="150,220 230,180 230,220 150,260" fill="#0652a3"/>
  </g>

  <!-- Top cube (offset up and slightly right) -->
  <g>
    <!-- Top face -->
    <polygon points="150,80 210,110 150,140 90,110" fill="#55efc4"/>
    <!-- Left face -->
    <polygon points="90,110 150,140 150,180 90,150" fill="#00b894"/>
    <!-- Right face -->
    <polygon points="150,140 210,110 210,150 150,180" fill="#007a63"/>
  </g>

  <!-- Small cube on the right (ground level) -->
  <g>
    <!-- Top face -->
    <polygon points="200,165 240,185 200,205 160,185" fill="#ffeaa7"/>
    <!-- Left face -->
    <polygon points="160,185 200,205 200,230 160,210" fill="#fdcb6e"/>
    <!-- Right face -->
    <polygon points="200,205 240,185 240,210 200,230" fill="#c8960c"/>
  </g>
</svg>
```

**Key techniques demonstrated**: Manual polygon faces for each cube, three-shade lighting per object, no vanishing point, 30° grid alignment, stacking order for depth.

---

## 3. Line Art / Outline

### Design Principles

- **Stroke is king**: The drawing is defined entirely by its outlines. Fill is absent or purely secondary.
- **Three-level stroke hierarchy**:
  - **Heavy / contour** (3–5px): Outer silhouette of the primary subject.
  - **Medium / structure** (1.5–2.5px): Internal divisions, major features.
  - **Fine / detail** (0.5–1px): Texture, small features, hatching.
- **Depth through line weight**: Foreground objects use heavier strokes; background objects use finer strokes. This creates spatial separation without shading.
- **Consistent line character**: Choose round (`stroke-linecap="round"`, `stroke-linejoin="round"`) for organic/friendly subjects, or square/miter for architectural/technical subjects.
- **Minimal or no fill**: If fills are used, they are flat, muted, and clearly secondary to the line work. The drawing must read clearly with fills removed.
- **Cross-hatching for value**: Represent shadows and gradation through parallel line groups at varying density, not through opacity or gradient fills.

### Color Rules

- **Monochrome default**: Pure black strokes (`#1a1a1a` or `#2d2d2d` — not pure `#000` which is too harsh) on white or off-white.
- **Single accent color**: Optionally add one color for emphasis (e.g., red on a key element). Keep it to less than 10% of the total drawing area.
- **Colored line art variant**: Use a dark version of each object's "true" color as the stroke color (e.g., dark blue lines for sky, dark green for trees). Fills remain absent.
- If using fills, keep them at 10–20% opacity of the stroke color — just a tint, not a solid shape.

### SVG Technical Specifics

- **Use**: `<path>`, `<line>`, `<polyline>`, `<circle>`, `<ellipse>` — all with `stroke` and `fill="none"`.
- **Stroke attributes**: Always set `stroke-linecap="round"` and `stroke-linejoin="round"` for organic work. Set `vector-effect="non-scaling-stroke"` if the SVG will be resized and you want consistent line weight.
- **Path precision**: Use cubic Bézier (`C`) for smooth organic curves. Quadratic (`Q`) is acceptable for simpler curves. Avoid jagged multi-segment straight lines for organic subjects.
- **Cross-hatching**: Create hatch patterns with `<pattern>` containing parallel `<line>` elements. Vary the `patternTransform` rotation and line spacing for different values.
- **Avoid**: `<filter>`, `fill-opacity` on shapes, gradients, drop shadows. The drawing should render identically with all filters stripped.

### Example: Line Art Coffee Cup

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220">
  <!-- All strokes use round caps and joins for organic feel -->
  <g fill="none" stroke="#2d2d2d" stroke-linecap="round" stroke-linejoin="round">

    <!-- Cup body (heavy contour - 3.5px) -->
    <path d="M45,80 L55,190 C55,200 145,200 145,190 L155,80"
          stroke-width="3.5"/>

    <!-- Cup rim (heavy) -->
    <ellipse cx="100" cy="80" rx="55" ry="14" stroke-width="3.5"/>

    <!-- Handle (medium - 2px) -->
    <path d="M155,100 C185,100 185,160 155,160" stroke-width="2.5"/>

    <!-- Coffee surface (medium) -->
    <ellipse cx="100" cy="88" rx="42" ry="10" stroke-width="1.8"/>

    <!-- Saucer (heavy contour) -->
    <ellipse cx="100" cy="200" rx="75" ry="16" stroke-width="3.5"/>
    <ellipse cx="100" cy="196" rx="50" ry="10" stroke-width="1.5"/>

    <!-- Steam wisps (fine detail - 0.8px) -->
    <path d="M80,65 C80,50 90,55 85,40 C85,30 90,25 88,15" stroke-width="0.8"/>
    <path d="M100,60 C100,45 110,50 105,35 C105,22 112,18 108,8" stroke-width="0.8"/>
    <path d="M120,65 C120,50 130,55 125,40 C125,30 130,25 128,15" stroke-width="0.8"/>

    <!-- Cup texture lines (fine detail) -->
    <line x1="65" y1="100" x2="70" y2="175" stroke-width="0.5" opacity="0.4"/>
    <line x1="100" y1="95" x2="100" y2="185" stroke-width="0.5" opacity="0.4"/>
    <line x1="135" y1="100" x2="130" y2="175" stroke-width="0.5" opacity="0.4"/>
  </g>
</svg>
```

**Key techniques demonstrated**: Three-level stroke hierarchy (3.5 / 2.5 / 0.8), `fill="none"` throughout, round linecaps and linejoins, depth via stroke weight (steam wisps are finest), no filters or gradients.

---

## 4. Watercolor Simulation

### Design Principles

- **Imperfect edges**: Nothing in watercolor has a clean, geometric edge. Every shape boundary must show irregularity — feathering, bleeding, or roughness.
- **Transparency and layering**: Watercolor is a transparent medium. Colors are built up through overlapping semi-transparent washes. Each layer modifies the ones beneath it.
- **Color bleeding**: Where two wet washes meet, colors blend into each other. Simulate this with soft gradient transitions at shape boundaries.
- **Paper texture**: The paper's grain affects paint distribution. Heavier texture shows through in lighter washes.
- **Granulation**: Some pigments settle into paper valleys, creating a speckled texture. Simulate with fine noise.
- **Value through layering, not opacity**: Build dark areas by overlapping multiple semi-transparent shapes rather than using a single dark fill.
- **Wet-in-wet vs. wet-on-dry**: Wet-in-wet produces soft, diffused edges (blur). Wet-on-dry produces crisper (but still imperfect) edges.

### Color Rules

- Use muted, natural tones — watercolor pigments are inherently less saturated than screen colors.
- Reduce saturation by 20–30% from your instinct. HSL saturation 30–55% is the sweet spot.
- Let white (paper) show through — watercolor never covers every inch. Leave 15–25% of the canvas as unpainted paper.
- Colors become richer (darker, more saturated) where layers overlap. Plan for this additive effect.
- Typical watercolor palette:
  - Warm red: `#c0392b` at 30–50% opacity
  - Yellow ochre: `#d4a843` at 40–60% opacity
  - Cerulean blue: `#5b9bd5` at 30–50% opacity
  - Sap green: `#6b8e5a` at 35–55% opacity
  - Burnt sienna: `#a0522d` at 30–45% opacity

### SVG Technical Specifics

- **Paper texture filter**: Use `<feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4"/>` piped into `<feColorMatrix>` to create a paper grain overlay. Apply to a full-canvas rect.
- **Irregular edges**: Apply `<feDisplacementMap>` driven by `<feTurbulence>` to shape boundaries. This warps the clean vector edges into organic, water-shaped boundaries.
- **Color bleeding**: Use `<radialGradient>` at shape edges with the shape's color fading to transparent. Layer a blurred edge shape beneath each main shape.
- **Wash layers**: Each wash is a `<path>` with `opacity="0.3"` to `opacity="0.5"`. Stack multiple paths for darker areas.
- **Granulation**: A noise filter (`<feTurbulence baseFrequency="1.5" numOctaves="2">`) composited at low opacity over colored areas.
- **Wet-in-wet edges**: Apply `<feGaussianBlur stdDeviation="3">` to shapes that should bleed into neighbors.
- **Use `<clipPath>` and `<mask>`**: Mask wash shapes so bleeding stays controlled within composition boundaries.

### Example: Watercolor Flower

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <defs>
    <!-- Paper texture -->
    <filter id="paper" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4"
                    seed="2" result="noise"/>
      <feColorMatrix type="saturate" values="0" in="noise" result="grain"/>
      <feBlend in="SourceGraphic" in2="grain" mode="multiply"/>
    </filter>

    <!-- Watercolor edge distortion -->
    <filter id="watercolor-edge" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="3"
                    seed="5" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="12"
                         xChannelSelector="R" yChannelSelector="G"/>
    </filter>

    <!-- Soft bleed for wet-in-wet areas -->
    <filter id="bleed">
      <feGaussianBlur stdDeviation="4"/>
    </filter>

    <!-- Granulation overlay -->
    <filter id="granulation" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="2"
                    seed="8" result="grain"/>
      <feColorMatrix type="saturate" values="0" in="grain" result="bw"/>
      <feBlend in="SourceGraphic" in2="bw" mode="multiply"/>
    </filter>
  </defs>

  <!-- Paper background -->
  <rect width="300" height="300" fill="#faf6f0" filter="url(#paper)"/>

  <!-- Background wash (wet-in-wet, very soft) -->
  <ellipse cx="150" cy="160" rx="120" ry="100" fill="#5b9bd5" opacity="0.08"
           filter="url(#bleed)"/>

  <!-- Stem and leaves (painted first, beneath petals) -->
  <g filter="url(#watercolor-edge)">
    <path d="M148,180 C145,210 140,250 142,280" stroke="#6b8e5a" stroke-width="4"
          fill="none" opacity="0.6"/>
    <path d="M142,230 C125,215 110,218 108,225 C106,232 120,235 142,230"
          fill="#6b8e5a" opacity="0.4"/>
    <path d="M145,250 C162,238 175,242 176,249 C177,256 163,257 145,250"
          fill="#6b8e5a" opacity="0.35"/>
  </g>

  <!-- Flower petals — overlapping transparent washes -->
  <g filter="url(#watercolor-edge)">
    <!-- First wash: base petal shapes -->
    <ellipse cx="130" cy="130" rx="35" ry="50" transform="rotate(-30,150,150)"
             fill="#c0392b" opacity="0.3"/>
    <ellipse cx="170" cy="125" rx="33" ry="48" transform="rotate(20,150,150)"
             fill="#c0392b" opacity="0.28"/>
    <ellipse cx="150" cy="110" rx="30" ry="52" transform="rotate(-5,150,150)"
             fill="#d45d5d" opacity="0.25"/>
    <ellipse cx="125" cy="150" rx="32" ry="45" transform="rotate(-60,150,150)"
             fill="#c0392b" opacity="0.32"/>
    <ellipse cx="175" cy="150" rx="30" ry="44" transform="rotate(50,150,150)"
             fill="#c0392b" opacity="0.3"/>

    <!-- Second wash: deeper values in petal centers -->
    <ellipse cx="145" cy="140" rx="20" ry="30" transform="rotate(-30,150,150)"
             fill="#922b21" opacity="0.25"/>
    <ellipse cx="160" cy="135" rx="18" ry="28" transform="rotate(20,150,150)"
             fill="#922b21" opacity="0.2"/>
  </g>

  <!-- Flower center -->
  <circle cx="150" cy="148" r="12" fill="#d4a843" opacity="0.6"
          filter="url(#granulation)"/>
  <circle cx="150" cy="148" r="6" fill="#a0522d" opacity="0.5"
          filter="url(#watercolor-edge)"/>

  <!-- Spatter marks (characteristic watercolor artifact) -->
  <g opacity="0.15" fill="#c0392b">
    <circle cx="200" cy="100" r="2"/>
    <circle cx="210" cy="115" r="1.2"/>
    <circle cx="195" cy="90" r="1.5"/>
    <circle cx="85" cy="200" r="1.8"/>
    <circle cx="92" cy="210" r="1"/>
  </g>
</svg>
```

**Key techniques demonstrated**: `feTurbulence` paper texture, `feDisplacementMap` irregular edges, overlapping semi-transparent washes, `feGaussianBlur` for wet-in-wet bleeding, granulation filter, paint spatter details.

---

## 5. Retro / Vintage

### Design Principles

- **Aged appearance**: The illustration should look like it was printed decades ago — slightly worn, imperfect, and warm-shifted.
- **Halftone printing simulation**: Replace smooth gradients with visible dot patterns, simulating old CMYK printing where individual ink dots are visible.
- **Visible texture overlay**: A grain or noise texture over the entire image simulates aged paper or worn printing.
- **Thick borders and outlines**: Bold, slightly rough borders around key elements. Line weight is heavier than modern standards.
- **Limited "ink" palette**: Old printing used fewer ink passes. Limit to 3–5 spot colors that look like they came from ink mixing, not a screen.
- **Distressed details**: Small imperfections — slightly misregistered colors, worn edges, ink bleed.
- **Typography as decoration**: If text is present, use bold slab-serif or hand-lettered styles. Text is a visual element, not just information.

### Color Rules

- **Warm shift everything**: Add warmth to every color. Pure blues become teal; pure greens become olive; grays become warm grays.
- **Muted and desaturated**: HSL saturation 25–50%. Nothing should look digitally bright.
- **Sepia base tone**: The "paper" background is warm cream, not pure white (`#f4e8c1` or similar).
- **Typical retro palette**:
  - Cream paper: `#f4e8c1`
  - Aged red: `#c45b3e`
  - Olive/dark teal: `#3a6b5e`
  - Mustard yellow: `#d4a843`
  - Warm brown/black: `#3b2f2f`
  - Muted blue: `#5a7d9a`
- Apply an overall sepia tint via `<feColorMatrix>` to unify all colors.

### SVG Technical Specifics

- **Halftone pattern**: Create a `<pattern>` filled with small circles at regular intervals. Vary circle radius for value (larger dots = darker). Apply as a mask or a clipped overlay.
- **Grain texture**: `<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3">` composited over the illustration at low opacity via `<feBlend mode="multiply">`.
- **Sepia toning via `<feColorMatrix>`**:
  ```xml
  <feColorMatrix type="matrix"
    values="0.39 0.77 0.19 0 0
            0.35 0.69 0.17 0 0
            0.27 0.53 0.13 0 0
            0    0    0    1 0"/>
  ```
- **Thick borders**: Apply `stroke-width="3"` or greater on primary shapes. Use `paint-order="stroke fill"` so the stroke draws behind the fill for cleaner results.
- **Distress overlay**: A large-scale `<feTurbulence>` combined with `<feDisplacementMap>` at low `scale` (2–4) adds subtle edge roughness everywhere.
- **Misregistration effect**: Duplicate a shape, offset it by 1–2px in one direction, fill with a different channel color at low opacity.

### Example: Retro Badge

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <defs>
    <!-- Sepia tone filter -->
    <filter id="sepia" x="0" y="0" width="100%" height="100%">
      <feColorMatrix type="matrix"
        values="0.39 0.77 0.19 0 0.05
                0.35 0.69 0.17 0 0.03
                0.27 0.53 0.13 0 0.01
                0    0    0    1 0"/>
    </filter>

    <!-- Grain overlay -->
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3"
                    seed="12" result="noise"/>
      <feColorMatrix type="saturate" values="0" in="noise" result="mono"/>
      <feBlend in="SourceGraphic" in2="mono" mode="multiply"/>
    </filter>

    <!-- Halftone dot pattern -->
    <pattern id="halftone" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="#f4e8c1"/>
      <circle cx="3" cy="3" r="1.5" fill="#3b2f2f" opacity="0.15"/>
    </pattern>

    <!-- Distress texture -->
    <filter id="distress" x="-2%" y="-2%" width="104%" height="104%">
      <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3"
                    seed="7" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="3"
                         xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>

  <!-- Aged paper background -->
  <rect width="300" height="300" fill="#f4e8c1" filter="url(#grain)"/>

  <!-- Main badge group with distress -->
  <g filter="url(#distress)">
    <!-- Outer ring -->
    <circle cx="150" cy="150" r="120" fill="none" stroke="#3b2f2f"
            stroke-width="6"/>
    <circle cx="150" cy="150" r="110" fill="none" stroke="#3b2f2f"
            stroke-width="2"/>

    <!-- Badge fill -->
    <circle cx="150" cy="150" r="108" fill="#c45b3e"/>

    <!-- Halftone overlay on badge -->
    <circle cx="150" cy="150" r="108" fill="url(#halftone)" opacity="0.5"/>

    <!-- Inner decorative ring -->
    <circle cx="150" cy="150" r="85" fill="none" stroke="#f4e8c1"
            stroke-width="2" stroke-dasharray="4,4"/>

    <!-- Star shape in center -->
    <polygon points="150,75 162,120 210,120 170,148 183,195 150,168 117,195 130,148 90,120 138,120"
             fill="#d4a843" stroke="#3b2f2f" stroke-width="2.5"
             paint-order="stroke fill"/>

    <!-- Banner across middle -->
    <path d="M40,155 L80,145 L220,145 L260,155 L220,165 L80,165 Z"
          fill="#3a6b5e" stroke="#3b2f2f" stroke-width="2.5"/>

    <!-- Banner text -->
    <text x="150" y="160" text-anchor="middle" fill="#f4e8c1"
          font-family="Georgia, serif" font-size="16" font-weight="bold"
          letter-spacing="3">PREMIUM</text>

    <!-- Year text -->
    <text x="150" y="210" text-anchor="middle" fill="#3b2f2f"
          font-family="Georgia, serif" font-size="14"
          letter-spacing="5">EST. 1962</text>

    <!-- Top text arc (simplified as straight text) -->
    <text x="150" y="105" text-anchor="middle" fill="#f4e8c1"
          font-family="Georgia, serif" font-size="11"
          letter-spacing="4">QUALITY</text>
  </g>

  <!-- Misregistration ghost (subtle color offset) -->
  <circle cx="151.5" cy="151.5" r="120" fill="none" stroke="#c45b3e"
          stroke-width="2" opacity="0.12"/>
</svg>
```

**Key techniques demonstrated**: Sepia `feColorMatrix`, halftone dot `<pattern>`, grain `feTurbulence` overlay, `feDisplacementMap` distress, thick borders with `paint-order`, warm-shifted muted palette, misregistration effect.

---

## 6. Minimalist

### Design Principles

- **Extreme reduction**: Strip every element to its absolute essence. If removing a shape doesn't change the meaning, remove it. A minimalist cat might be two triangles (ears) and a circle (head) — nothing more.
- **Negative space is active**: At least 60% of the canvas should be empty. The white space is not "unused" — it is a deliberate compositional element that gives the subject room to breathe.
- **Mathematical precision**: Shapes are positioned with exact intent. Use grid alignment, golden ratio, or center-axis placement. Nothing is "roughly" placed.
- **One idea per composition**: Each illustration communicates exactly one concept. No secondary subjects, decorative elements, or visual noise.
- **Geometric forms**: All shapes are primitive geometry — circles, rectangles, lines, triangles. Organic curves are used only when the subject demands it and are kept as smooth Bézier curves.
- **Scale creates drama**: With so few elements, the relative size of shapes carries enormous visual weight. A tiny circle below a massive rectangle tells a story through scale alone.

### Color Rules

- **Monochromatic**: One hue at various lightness levels, plus white. Example: black, dark gray, medium gray on white.
- **Two-color maximum**: If a second color appears, it should be used sparingly (less than 15% of filled area) for maximum impact.
- **High contrast**: The few elements present must be clearly distinct from the background. Dark on light or light on dark — no subtle mid-tone differences.
- **Typical palettes**:
  - Pure monochrome: `#1a1a1a` on `#ffffff`
  - Warm monochrome: `#2c2c2c`, `#8c8c8c` on `#f5f5f0`
  - Two-color: `#1a1a1a` + `#e63946` on `#ffffff`
  - Inverted: `#ffffff` + `#aaaaaa` on `#1a1a1a`

### SVG Technical Specifics

- **Use**: `<circle>`, `<rect>`, `<line>`, `<path>` (simple arcs and curves only). `<text>` only if typography is the subject.
- **Avoid**: `<filter>`, `<pattern>`, `<gradient>`, `<clipPath>`, `<mask>`. No effects of any kind. If you need a filter, the design isn't minimalist enough.
- **ViewBox precision**: Set the viewBox to exact dimensions that place the composition perfectly. Use asymmetric padding for deliberate tension.
- **Alignment**: Use the center of the viewBox as an anchor. Offset elements from center using clean fractions (1/3, 1/4, golden ratio 0.618).
- **Stroke consistency**: If strokes are used, every stroke in the composition should be the same weight. A single stroke weight reinforces unity.
- **Element count**: A truly minimalist illustration typically has 3–8 total SVG shape elements. If you're above 12, reconsider what can be removed.

### Example: Minimalist Sunrise

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <!-- Sky (negative space — the white background IS the sky) -->

  <!-- Sun: single circle, mathematically centered horizontally,
       placed at golden ratio height (400 * 0.382 ≈ 153) -->
  <circle cx="200" cy="153" r="40" fill="#1a1a1a"/>

  <!-- Horizon line -->
  <line x1="60" y1="240" x2="340" y2="240" stroke="#1a1a1a" stroke-width="1.5"/>

  <!-- Sun reflection: subtle presence below horizon -->
  <line x1="175" y1="255" x2="225" y2="255" stroke="#1a1a1a" stroke-width="1"
        opacity="0.4"/>
  <line x1="185" y1="268" x2="215" y2="268" stroke="#1a1a1a" stroke-width="1"
        opacity="0.25"/>
  <line x1="192" y1="281" x2="208" y2="281" stroke="#1a1a1a" stroke-width="1"
        opacity="0.12"/>
</svg>
```

**Key techniques demonstrated**: 5 total elements, 60%+ negative space, golden ratio placement, monochromatic palette, zero filters/gradients/effects, diminishing opacity for depth, mathematical precision.

---

## 7. Geometric / Abstract

### Design Principles

- **Mathematical construction**: Every element derives from mathematical relationships — proportions, angles, ratios. Nothing is placed by "feel." Use golden ratio (1.618), root-2 (1.414), π, and integer ratios.
- **Repetition and pattern**: Geometric art gains visual power through repetition. A single triangle is a shape; 36 triangles rotated at 10° intervals become a mandala.
- **Rotation and symmetry**: Use rotational symmetry (elements repeated around a center point), reflective symmetry (mirrored across axes), or translational symmetry (tessellation grid).
- **Tessellation**: Shapes that tile the plane without gaps or overlaps — triangles, squares, hexagons, and their combinations. The pattern should theoretically extend to infinity.
- **Color field relationships**: Color is applied to geometric regions. The interaction between adjacent color fields (contrast, harmony, tension) is a primary compositional tool.
- **Sacred geometry**: Traditional mathematical patterns — flower of life (overlapping circles), Metatron's cube (13 circles with connecting lines), seed of life, Sri Yantra. These carry inherent visual harmony from their mathematical foundations.
- **Emergence**: Individual simple elements combine to create complex visual effects (moiré, optical illusion, implied curves from straight lines).

### Color Rules

- **Systematic color assignment**: Don't randomly color shapes. Assign color based on rules — position, angle, size, or sequence.
- **Gradient through sequence**: Create the illusion of gradients by incrementally shifting hue or lightness across repeated elements (e.g., each successive ring is 5% lighter).
- **High contrast palette**: Geometric art benefits from strong color differentiation between adjacent regions.
- **Complementary pairs**: Use 2–3 complementary pairs for vibrant energy, or analogous groups for harmony.
- **Typical palettes**:
  - Bold geometric: `#264653`, `#2a9d8f`, `#e9c46a`, `#f4a261`, `#e76f51`
  - Sacred geometry: `#1a1a2e`, `#d4af37` (gold on dark)
  - Op-art: `#000000`, `#ffffff` (pure contrast)
  - Prismatic: 6+ equally-spaced hues around the color wheel at consistent saturation and lightness

### SVG Technical Specifics

- **`transform="rotate(angle, cx, cy)"`**: The workhorse for rotational patterns. Create one element and repeat it with incremental rotation.
- **`<use href="#id">`**: Define a base shape once, then instance it with different transforms. Essential for patterns with dozens of repeated elements.
- **`<pattern>` for tessellation**: Define the tile unit in `<defs>` and apply as a fill to cover any area.
- **Trigonometric positioning**: Calculate element positions using `cx = centerX + radius * cos(angle)`, `cy = centerY + radius * sin(angle)`. Pre-compute coordinates for the SVG since SVG doesn't support runtime math.
- **`<g>` nesting for hierarchical transforms**: Group elements and apply transforms at the group level. Nest groups for compound rotations (e.g., elements rotating around a point that itself rotates around the center).
- **Precision**: Use 3 decimal places for coordinates to ensure perfect alignment. Rounding errors compound in geometric patterns and produce visible gaps.
- **Sacred geometry construction**:
  - **Flower of life**: 19 circles of equal radius, centers positioned at vertices of a hexagonal grid, each circle's center is one radius away from its neighbors.
  - **Metatron's cube**: 13 circles (1 center + 6 inner ring + 6 outer ring), with straight lines connecting every center to every other center.
- **`stroke-width` consistency**: In geometric/sacred geometry, all strokes should be identical weight to maintain the mathematical equality of all elements.

### Example: Geometric Mandala with Rotational Symmetry

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <!-- Base petal shape -->
    <path id="petal" d="M0,-80 C22,-75 35,-40 18,0 C10,18 0,25 0,25
                        C0,25 -10,18 -18,0 C-35,-40 -22,-75 0,-80Z"/>

    <!-- Small diamond for inner ring -->
    <polygon id="diamond" points="0,-15 6,0 0,15 -6,0"/>

    <!-- Outer triangle tick -->
    <polygon id="tick" points="0,-155 5,-140 -5,-140"/>
  </defs>

  <!-- Background -->
  <rect width="400" height="400" fill="#1a1a2e"/>

  <!-- Outer guide circle -->
  <circle cx="200" cy="200" r="160" fill="none" stroke="#d4af37"
          stroke-width="0.5" opacity="0.3"/>
  <circle cx="200" cy="200" r="140" fill="none" stroke="#d4af37"
          stroke-width="0.5" opacity="0.3"/>

  <!-- Outer tick marks — 36 ticks at 10° intervals -->
  <g fill="#d4af37" opacity="0.5">
    <use href="#tick" transform="translate(200,200) rotate(0)"/>
    <use href="#tick" transform="translate(200,200) rotate(10)"/>
    <use href="#tick" transform="translate(200,200) rotate(20)"/>
    <use href="#tick" transform="translate(200,200) rotate(30)"/>
    <use href="#tick" transform="translate(200,200) rotate(40)"/>
    <use href="#tick" transform="translate(200,200) rotate(50)"/>
    <use href="#tick" transform="translate(200,200) rotate(60)"/>
    <use href="#tick" transform="translate(200,200) rotate(70)"/>
    <use href="#tick" transform="translate(200,200) rotate(80)"/>
    <use href="#tick" transform="translate(200,200) rotate(90)"/>
    <use href="#tick" transform="translate(200,200) rotate(100)"/>
    <use href="#tick" transform="translate(200,200) rotate(110)"/>
    <use href="#tick" transform="translate(200,200) rotate(120)"/>
    <use href="#tick" transform="translate(200,200) rotate(130)"/>
    <use href="#tick" transform="translate(200,200) rotate(140)"/>
    <use href="#tick" transform="translate(200,200) rotate(150)"/>
    <use href="#tick" transform="translate(200,200) rotate(160)"/>
    <use href="#tick" transform="translate(200,200) rotate(170)"/>
    <use href="#tick" transform="translate(200,200) rotate(180)"/>
    <use href="#tick" transform="translate(200,200) rotate(190)"/>
    <use href="#tick" transform="translate(200,200) rotate(200)"/>
    <use href="#tick" transform="translate(200,200) rotate(210)"/>
    <use href="#tick" transform="translate(200,200) rotate(220)"/>
    <use href="#tick" transform="translate(200,200) rotate(230)"/>
    <use href="#tick" transform="translate(200,200) rotate(240)"/>
    <use href="#tick" transform="translate(200,200) rotate(250)"/>
    <use href="#tick" transform="translate(200,200) rotate(260)"/>
    <use href="#tick" transform="translate(200,200) rotate(270)"/>
    <use href="#tick" transform="translate(200,200) rotate(280)"/>
    <use href="#tick" transform="translate(200,200) rotate(290)"/>
    <use href="#tick" transform="translate(200,200) rotate(300)"/>
    <use href="#tick" transform="translate(200,200) rotate(310)"/>
    <use href="#tick" transform="translate(200,200) rotate(320)"/>
    <use href="#tick" transform="translate(200,200) rotate(330)"/>
    <use href="#tick" transform="translate(200,200) rotate(340)"/>
    <use href="#tick" transform="translate(200,200) rotate(350)"/>
  </g>

  <!-- Primary petal ring — 12 petals at 30° intervals -->
  <g fill="#e76f51" opacity="0.85">
    <use href="#petal" transform="translate(200,200) rotate(0)"/>
    <use href="#petal" transform="translate(200,200) rotate(30)"/>
    <use href="#petal" transform="translate(200,200) rotate(60)"/>
    <use href="#petal" transform="translate(200,200) rotate(90)"/>
    <use href="#petal" transform="translate(200,200) rotate(120)"/>
    <use href="#petal" transform="translate(200,200) rotate(150)"/>
    <use href="#petal" transform="translate(200,200) rotate(180)"/>
    <use href="#petal" transform="translate(200,200) rotate(210)"/>
    <use href="#petal" transform="translate(200,200) rotate(240)"/>
    <use href="#petal" transform="translate(200,200) rotate(270)"/>
    <use href="#petal" transform="translate(200,200) rotate(300)"/>
    <use href="#petal" transform="translate(200,200) rotate(330)"/>
  </g>

  <!-- Secondary petal ring — 12 petals offset by 15°, smaller scale -->
  <g fill="#2a9d8f" opacity="0.7">
    <use href="#petal" transform="translate(200,200) rotate(15) scale(0.6)"/>
    <use href="#petal" transform="translate(200,200) rotate(45) scale(0.6)"/>
    <use href="#petal" transform="translate(200,200) rotate(75) scale(0.6)"/>
    <use href="#petal" transform="translate(200,200) rotate(105) scale(0.6)"/>
    <use href="#petal" transform="translate(200,200) rotate(135) scale(0.6)"/>
    <use href="#petal" transform="translate(200,200) rotate(165) scale(0.6)"/>
    <use href="#petal" transform="translate(200,200) rotate(195) scale(0.6)"/>
    <use href="#petal" transform="translate(200,200) rotate(225) scale(0.6)"/>
    <use href="#petal" transform="translate(200,200) rotate(255) scale(0.6)"/>
    <use href="#petal" transform="translate(200,200) rotate(285) scale(0.6)"/>
    <use href="#petal" transform="translate(200,200) rotate(315) scale(0.6)"/>
    <use href="#petal" transform="translate(200,200) rotate(345) scale(0.6)"/>
  </g>

  <!-- Inner diamond ring — 12 diamonds at 30° intervals, radius 100 -->
  <g fill="#e9c46a">
    <use href="#diamond" transform="translate(200,200) rotate(0) translate(0,-100)"/>
    <use href="#diamond" transform="translate(200,200) rotate(30) translate(0,-100)"/>
    <use href="#diamond" transform="translate(200,200) rotate(60) translate(0,-100)"/>
    <use href="#diamond" transform="translate(200,200) rotate(90) translate(0,-100)"/>
    <use href="#diamond" transform="translate(200,200) rotate(120) translate(0,-100)"/>
    <use href="#diamond" transform="translate(200,200) rotate(150) translate(0,-100)"/>
    <use href="#diamond" transform="translate(200,200) rotate(180) translate(0,-100)"/>
    <use href="#diamond" transform="translate(200,200) rotate(210) translate(0,-100)"/>
    <use href="#diamond" transform="translate(200,200) rotate(240) translate(0,-100)"/>
    <use href="#diamond" transform="translate(200,200) rotate(270) translate(0,-100)"/>
    <use href="#diamond" transform="translate(200,200) rotate(300) translate(0,-100)"/>
    <use href="#diamond" transform="translate(200,200) rotate(330) translate(0,-100)"/>
  </g>

  <!-- Center circle -->
  <circle cx="200" cy="200" r="22" fill="#f4a261"/>
  <circle cx="200" cy="200" r="14" fill="#1a1a2e"/>
  <circle cx="200" cy="200" r="5" fill="#d4af37"/>
</svg>
```

**Key techniques demonstrated**: `<use href>` for shape reuse, rotational symmetry via `rotate(angle)`, `<defs>` for base shape definitions, hierarchical layering (tick marks → primary petals → secondary petals → diamonds → center), systematic color assignment, mathematical precision.

---

## Quick Style Selection Guide

| Request Keywords | Style | Key Feature |
|---|---|---|
| "flat", "modern", "app-style", "simple icons" | Flat Design | Solid fills, no gradients |
| "isometric", "3D", "2.5D", "game-style" | Isometric | 30° grid, three-face shading |
| "line art", "sketch", "outline", "drawn" | Line Art | Strokes only, weight hierarchy |
| "watercolor", "painted", "artistic", "soft" | Watercolor | Filters, transparency, texture |
| "retro", "vintage", "old", "poster", "aged" | Retro / Vintage | Halftone, grain, sepia toning |
| "minimal", "clean", "simple", "zen" | Minimalist | Few elements, much white space |
| "geometric", "pattern", "mandala", "sacred" | Geometric / Abstract | Rotation, repetition, math |

## Combining Styles

Styles can be hybridized for unique results:

- **Flat + Isometric**: Isometric shapes with flat-design color rules (no face shading — use different flat colors per face instead of brightness variants).
- **Line Art + Watercolor**: Line drawing with watercolor wash fills behind the lines. Apply watercolor filters to fill shapes only, keeping strokes clean.
- **Minimalist + Geometric**: A small number of geometric elements arranged with minimalist composition rules. The mathematical precision of geometric art supports minimalist clarity.
- **Retro + Flat**: Flat-design shapes with retro color palettes and halftone texture overlays. Omit gradients but add grain.

When combining, pick one style as the **structural base** (how shapes are constructed) and the other as the **surface treatment** (how color, texture, and effects are applied).
