# Texture Details

## Fabric Folds

### Basic fold types
- **Pipe fold:** Tubular, hangs from a point (sleeves, drapes)
- **Zigzag fold:** Compressed fabric (stacked at bottom of curtain)
- **Spiral fold:** Wraps around a cylinder (rolled sleeves, scarves)

```xml
<!-- Fabric fold shadows using overlapping curves -->
<defs>
  <linearGradient id="fold-shadow" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
    <stop offset="50%" stop-color="rgba(0,0,0,0.15)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </linearGradient>
</defs>

<!-- Layer: fold-1 -->
<path d="M 20 10 C 22 25, 18 40, 20 55"
      fill="none" stroke="url(#fold-shadow)" stroke-width="8"/>

<!-- Layer: fold-highlight -->
<path d="M 30 10 C 28 25, 32 40, 30 55"
      fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/>
```

## Metallic Reflection

```xml
<defs>
  <linearGradient id="metal-grad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#E8E8E8"/>
    <stop offset="25%" stop-color="#A0A0A0"/>
    <stop offset="50%" stop-color="#E0E0E0"/>
    <stop offset="75%" stop-color="#808080"/>
    <stop offset="100%" stop-color="#C0C0C0"/>
  </linearGradient>
</defs>

<!-- Multiple gradient bands create metallic look -->
<rect x="10" y="10" width="80" height="80" rx="4" fill="url(#metal-grad)"/>
<!-- Sharp highlight edge -->
<line x1="10" y1="35" x2="90" y2="35" stroke="white" stroke-width="0.5" opacity="0.6"/>
```

## Leather Texture

Use noise filter + subtle bump for leather grain:

```xml
<defs>
  <filter id="leather-grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/>
    <feDiffuseLighting in="noise" lighting-color="#8B4513" surfaceScale="1.5" result="lit">
      <feDistantLight azimuth="45" elevation="60"/>
    </feDiffuseLighting>
    <feComposite in="SourceGraphic" in2="lit" operator="multiply"/>
  </filter>
</defs>

<rect x="10" y="10" width="80" height="80" fill="#8B4513" filter="url(#leather-grain)"/>
```

## Advanced Fabric Folds

### Seven Fold Types (Complete Reference)

Understanding how fabric behaves under gravity and support points is essential for realistic textile rendering. Each fold type has a distinct visual signature determined by where the fabric is supported, compressed, or free-hanging.

#### 1. Pipe/Tubular Fold

Hangs from a single support point (e.g., a clothesline, shoulder seam, curtain rod). Creates parallel vertical curves that taper as they descend. The most common fold in hanging drapery.

**Key characteristics:** Parallel curved paths, consistent spacing, slight convergence at bottom.

```xml
<!-- Pipe/Tubular Fold: parallel curves descending from a support line -->
<defs>
  <linearGradient id="pipe-shadow" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
    <stop offset="40%" stop-color="rgba(0,0,0,0.18)"/>
    <stop offset="60%" stop-color="rgba(0,0,0,0.18)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </linearGradient>
  <linearGradient id="pipe-highlight" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="50%" stop-color="rgba(255,255,255,0.2)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>
</defs>

<!-- Support line at top -->
<line x1="10" y1="10" x2="90" y2="10" stroke="#666" stroke-width="1.5"/>

<!-- Shadow folds: parallel curves with slight wobble -->
<path d="M 20 10 C 21 30, 19 50, 20 80" fill="none" stroke="url(#pipe-shadow)" stroke-width="10"/>
<path d="M 40 10 C 42 30, 38 50, 40 80" fill="none" stroke="url(#pipe-shadow)" stroke-width="10"/>
<path d="M 60 10 C 58 30, 62 50, 60 80" fill="none" stroke="url(#pipe-shadow)" stroke-width="10"/>
<path d="M 80 10 C 79 30, 81 50, 80 80" fill="none" stroke="url(#pipe-shadow)" stroke-width="10"/>

<!-- Highlight ridges between shadows -->
<path d="M 30 10 C 29 30, 31 50, 30 80" fill="none" stroke="url(#pipe-highlight)" stroke-width="5"/>
<path d="M 50 10 C 51 30, 49 50, 50 80" fill="none" stroke="url(#pipe-highlight)" stroke-width="5"/>
<path d="M 70 10 C 71 30, 69 50, 70 80" fill="none" stroke="url(#pipe-highlight)" stroke-width="5"/>
```

#### 2. Zigzag/Accordion Fold

Compressed at a joint or gathered area. Creates alternating V-shapes where fabric stacks on itself. Common at the base of curtains, bunched sleeves, and compressed clothing areas.

**Key characteristics:** Sharp alternating peaks and valleys, decreasing amplitude when compressed harder.

```xml
<!-- Zigzag/Accordion Fold: alternating V-shapes from compression -->
<defs>
  <linearGradient id="zig-shadow" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="rgba(0,0,0,0.15)"/>
    <stop offset="50%" stop-color="rgba(0,0,0,0)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0.15)"/>
  </linearGradient>
</defs>

<!-- Fabric silhouette -->
<rect x="20" y="10" width="60" height="70" rx="2" fill="#6B8E9B" opacity="0.9"/>

<!-- Zigzag fold lines — alternating V-shapes -->
<path d="M 25 15 L 50 25 L 75 15" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
<path d="M 25 25 L 50 15 L 75 25" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8"/>
<path d="M 25 35 L 50 45 L 75 35" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
<path d="M 25 45 L 50 35 L 75 45" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8"/>
<path d="M 25 55 L 50 65 L 75 55" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
<path d="M 25 65 L 50 55 L 75 65" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8"/>

<!-- Shadow fill in valleys -->
<path d="M 25 25 L 50 15 L 75 25 L 50 35 Z" fill="url(#zig-shadow)" opacity="0.4"/>
<path d="M 25 45 L 50 35 L 75 45 L 50 55 Z" fill="url(#zig-shadow)" opacity="0.4"/>
<path d="M 25 65 L 50 55 L 75 65 L 50 75 Z" fill="url(#zig-shadow)" opacity="0.4"/>
```

#### 3. Spiral Fold

Wraps around a cylindrical form like an arm, leg, or column. The fabric twists and creates diagonal fold lines that follow the circumference of the form.

**Key characteristics:** Diagonal curved lines wrapping around the form, spacing follows cylinder curvature.

```xml
<!-- Spiral Fold: wrapping curves around a cylindrical form (arm/leg) -->
<!-- Cylinder base (the form underneath) -->
<rect x="30" y="5" width="40" height="90" rx="20" ry="5" fill="#C4956A"/>

<!-- Fabric layer over the cylinder -->
<rect x="28" y="5" width="44" height="90" rx="22" ry="5" fill="#4A6B8A" opacity="0.9"/>

<!-- Spiral wrap lines — diagonal curves that follow the cylinder surface -->
<path d="M 28 15 C 40 12, 60 20, 72 18" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.8"/>
<path d="M 28 30 C 40 27, 60 35, 72 33" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
<path d="M 28 45 C 40 42, 60 50, 72 48" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
<path d="M 28 60 C 40 57, 60 65, 72 63" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.8"/>
<path d="M 28 75 C 40 72, 60 80, 72 78" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>

<!-- Highlight on the leading edge of each spiral -->
<path d="M 30 18 C 42 16, 58 22, 70 20" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>
<path d="M 30 33 C 42 31, 58 37, 70 35" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>
<path d="M 30 48 C 42 46, 58 52, 70 50" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>
<path d="M 30 63 C 42 61, 58 67, 70 65" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>
```

#### 4. Half-Lock Fold

Fabric folds back onto itself at a bend point (elbow, knee, waist). Creates a tight U-shaped or J-shaped crease where two surfaces press together.

**Key characteristics:** Tight U-shaped crease, fabric direction reverses, deepest shadow at the fold apex.

```xml
<!-- Half-Lock Fold: fabric folding at a joint (elbow/knee) -->
<defs>
  <radialGradient id="halflock-shadow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </radialGradient>
</defs>

<!-- Upper fabric section (above the bend) -->
<path d="M 20 10 L 80 10 L 80 45 C 70 50, 30 50, 20 45 Z" fill="#7B5B3A"/>

<!-- Fold crease — tight U-shape at the bend -->
<path d="M 25 44 C 35 58, 65 58, 75 44" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>
<!-- Inner shadow of the fold -->
<path d="M 30 46 C 38 55, 62 55, 70 46" fill="url(#halflock-shadow)" opacity="0.5"/>

<!-- Lower fabric section (below the bend) -->
<path d="M 20 48 C 30 53, 70 53, 80 48 L 80 90 L 20 90 Z" fill="#6B4D30"/>

<!-- Secondary creases radiating from the bend -->
<path d="M 35 48 C 37 55, 38 62, 36 70" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.7"/>
<path d="M 50 50 C 50 58, 50 65, 50 75" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="0.6"/>
<path d="M 65 48 C 63 55, 62 62, 64 70" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.7"/>

<!-- Highlight on the fold ridge -->
<path d="M 28 43 C 38 48, 62 48, 72 43" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>
```

#### 5. Diaper/Sag Fold

Fabric supported at two points with gravity pulling the middle down, creating a catenary curve. Common in draped fabric between two hooks, hammocks, or fabric held at both shoulders.

**Key characteristics:** Catenary (U-shaped sag) between supports, deepest point at center, secondary folds radiate from support points.

```xml
<!-- Diaper/Sag Fold: fabric supported at two points, sagging in the middle -->
<defs>
  <linearGradient id="sag-depth" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
    <stop offset="70%" stop-color="rgba(0,0,0,0.2)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0.08)"/>
  </linearGradient>
</defs>

<!-- Support points (pins/hooks) -->
<circle cx="15" cy="15" r="3" fill="#888"/>
<circle cx="85" cy="15" r="3" fill="#888"/>

<!-- Main fabric body with catenary sag -->
<path d="M 15 15 C 15 20, 20 65, 50 70 C 80 65, 85 20, 85 15 L 85 18 C 80 25, 75 60, 50 65 C 25 60, 20 25, 15 18 Z"
      fill="#B85C5C"/>

<!-- Catenary shadow — deepest at center -->
<path d="M 20 20 C 25 50, 40 62, 50 65 C 60 62, 75 50, 80 20"
      fill="none" stroke="url(#sag-depth)" stroke-width="12"/>

<!-- Fold lines radiating from left support -->
<path d="M 15 15 C 20 30, 25 45, 35 55" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.7"/>
<path d="M 15 17 C 22 35, 30 50, 42 60" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>

<!-- Fold lines radiating from right support -->
<path d="M 85 15 C 80 30, 75 45, 65 55" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.7"/>
<path d="M 85 17 C 78 35, 70 50, 58 60" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>

<!-- Highlight on the top curve -->
<path d="M 18 16 C 20 18, 30 35, 50 40 C 70 35, 80 18, 82 16"
      fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
```

#### 6. Drop Fold

Free-hanging from a single support point (like a tablecloth corner or fabric pinned at one point). Creates radiating cone-like lines emanating from the support.

**Key characteristics:** Lines radiate outward from support point, cone-shaped silhouette, deeper shadows between radiating ridges.

```xml
<!-- Drop Fold: fabric hanging freely from a single point, cone-like radiating lines -->
<defs>
  <radialGradient id="drop-base" cx="50%" cy="0%" r="100%">
    <stop offset="0%" stop-color="#6A8B6A"/>
    <stop offset="100%" stop-color="#4A6B4A"/>
  </radialGradient>
</defs>

<!-- Support point -->
<circle cx="50" cy="8" r="2.5" fill="#777"/>

<!-- Fabric silhouette — cone shape -->
<path d="M 50 10 C 48 15, 15 70, 10 90 L 90 90 C 85 70, 52 15, 50 10 Z"
      fill="url(#drop-base)"/>

<!-- Radiating fold lines from the support point -->
<path d="M 50 10 C 48 25, 20 60, 15 88" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="1.2"/>
<path d="M 50 10 C 49 25, 30 60, 28 88" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.8"/>
<path d="M 50 10 C 50 25, 42 60, 40 88" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="0.6"/>
<path d="M 50 10 C 50 25, 58 60, 60 88" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="0.6"/>
<path d="M 50 10 C 51 25, 70 60, 72 88" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.8"/>
<path d="M 50 10 C 52 25, 80 60, 85 88" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="1.2"/>

<!-- Highlights on ridges between shadow folds -->
<path d="M 50 10 C 49 25, 25 60, 22 88" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
<path d="M 50 10 C 50 25, 50 60, 50 88" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>
<path d="M 50 10 C 51 25, 75 60, 78 88" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
```

#### 7. Inert Fold

Fabric at rest on a surface. Organic, pooling, irregular shapes with no tension — just gravity settling. Common for discarded clothing, blankets on a bed, or a scarf laid down.

**Key characteristics:** No tension direction, random organic curves, soft overlapping shapes, gentle shadows where layers overlap.

```xml
<!-- Inert Fold: fabric at rest on a surface, pooling organically -->
<defs>
  <filter id="inert-soft">
    <feGaussianBlur in="SourceGraphic" stdDeviation="0.3"/>
  </filter>
</defs>

<!-- Ground surface hint -->
<rect x="5" y="60" width="90" height="35" fill="#E8E0D4"/>

<!-- Pooled fabric — organic overlapping shapes -->
<path d="M 20 65 C 15 55, 25 45, 35 50 C 45 42, 55 48, 60 55 C 70 45, 82 52, 80 62 C 78 72, 65 78, 55 75 C 42 80, 25 76, 20 65 Z"
      fill="#9B6B8A" opacity="0.95"/>

<!-- Overlapping fold layer — fabric doubled over itself -->
<path d="M 30 60 C 28 52, 38 48, 45 53 C 52 47, 62 50, 60 58 C 55 65, 40 66, 30 60 Z"
      fill="#8A5B7A" opacity="0.9"/>

<!-- Soft shadow where fabric overlaps -->
<path d="M 32 58 C 35 54, 42 52, 48 55 C 54 51, 58 54, 57 58"
      fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="2" filter="url(#inert-soft)"/>

<!-- Random soft creases in the pooled area -->
<path d="M 25 62 C 30 58, 35 63, 40 60" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>
<path d="M 50 58 C 55 62, 60 57, 65 61" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>
<path d="M 35 70 C 42 67, 50 72, 58 68" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="0.4"/>

<!-- Subtle highlight on top surface -->
<path d="M 35 53 C 42 50, 52 52, 55 56" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.6"/>
```

### Fabric Material Behavior Table

Different materials fold differently. Use this reference to match stroke weight, fold count, and opacity to the material being rendered.

| Material | Fold Count | Fold Sharpness | Drape | SVG stroke-width | Opacity |
|----------|-----------|----------------|-------|-------------------|---------|
| Silk/Chiffon | Many (8-12) | Soft, rounded | Clings to form | 0.3–0.5 | 0.6–0.8 |
| Cotton | Moderate (5-8) | Medium | Natural fall | 0.6–1.0 | 0.8–1.0 |
| Wool | Few (3-5) | Broad, rounded | Heavy drape | 1.0–1.5 | 0.9–1.0 |
| Denim | Very few (2-4) | Sharp, angular | Stiff | 1.2–1.8 | 1.0 |
| Leather | Minimal (1-3) | Hard crease | Rigid | 1.5–2.0 | 1.0 |
| Satin | Few (3-5) | Smooth curves | Fluid, slippery | 0.5–0.8 | 0.7–0.9 |

### Silk vs Denim Fold Comparison

```xml
<!-- Side-by-side: Silk (left) vs Denim (right) fold rendering -->

<!-- ========== SILK (left panel) ========== -->
<!-- Silk: many soft folds, thin strokes, translucent -->
<rect x="5" y="5" width="42" height="90" rx="2" fill="#D4A5B9" opacity="0.75"/>

<!-- Many soft fold lines — silk has high fold count -->
<path d="M 10 8 C 11 20, 9 35, 10 55 C 11 70, 9 80, 10 92" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="0.4"/>
<path d="M 15 8 C 14 22, 16 38, 15 55 C 14 70, 16 82, 15 92" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.3"/>
<path d="M 20 8 C 21 20, 19 36, 20 55 C 21 72, 19 84, 20 92" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="0.4"/>
<path d="M 25 8 C 24 22, 26 38, 25 55 C 24 68, 26 80, 25 92" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.3"/>
<path d="M 30 8 C 31 20, 29 35, 30 55 C 31 72, 29 85, 30 92" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="0.4"/>
<path d="M 35 8 C 34 22, 36 38, 35 55 C 34 70, 36 82, 35 92" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.3"/>
<path d="M 40 8 C 41 20, 39 36, 40 55 C 41 72, 39 84, 40 92" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="0.4"/>

<!-- Silk highlights — soft shimmer -->
<path d="M 12 8 C 13 25, 11 45, 12 70" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.3"/>
<path d="M 22 8 C 23 25, 21 45, 22 70" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.3"/>
<path d="M 32 8 C 33 25, 31 45, 32 70" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.3"/>

<!-- Label -->
<text x="26" y="99" text-anchor="middle" font-size="4" fill="#666">Silk</text>

<!-- ========== DENIM (right panel) ========== -->
<!-- Denim: very few sharp folds, thick strokes, opaque -->
<rect x="53" y="5" width="42" height="90" rx="1" fill="#3B5998" opacity="1.0"/>

<!-- Few sharp fold lines — denim is stiff -->
<path d="M 62 8 L 62 20 L 60 35 L 63 55 L 61 75 L 62 92"
      fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1.5" stroke-linecap="round"/>
<path d="M 78 8 L 78 22 L 80 40 L 77 60 L 79 78 L 78 92"
      fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1.5" stroke-linecap="round"/>

<!-- Angular crease detail — denim holds sharp creases -->
<path d="M 68 30 L 70 38 L 67 45" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="1.2"/>
<path d="M 85 50 L 83 58 L 86 65" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="1.2"/>

<!-- Hard highlight edge — denim reflects light on fold peaks -->
<path d="M 65 8 L 65 45" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8"/>
<path d="M 82 8 L 82 45" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.8"/>

<!-- Label -->
<text x="74" y="99" text-anchor="middle" font-size="4" fill="#666">Denim</text>
```

### Cotton Fabric Rendering

Cotton has moderate fold count and natural drape. Folds are medium-width with rounded shapes. No specular sheen — matte appearance.

```xml
<!-- Cotton: moderate folds, matte finish, natural drape -->
<rect x="5" y="5" width="42" height="90" rx="2" fill="#E8D5B7" opacity="0.95"/>

<!-- Moderate number of folds — wider spacing than silk, softer than denim -->
<path d="M 12 8 C 13 25, 11 45, 12 70 C 13 80, 11 88, 12 92"
      fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.8"/>
<path d="M 22 8 C 21 28, 23 48, 22 68 C 21 78, 23 86, 22 92"
      fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.7"/>
<path d="M 32 8 C 33 25, 31 42, 32 62 C 33 75, 31 85, 32 92"
      fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.8"/>

<!-- Very subtle highlights — cotton is matte, minimal sheen -->
<path d="M 17 8 C 18 30, 16 55, 17 80"
      fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
<path d="M 27 8 C 28 30, 26 55, 27 80"
      fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
```

### Velvet Fabric Rendering

Velvet is heavy with a napped surface that catches light directionally. It shows dramatic value shifts — very dark in fold valleys, much lighter on surfaces facing the light. The key technique is wide gradient transitions.

```xml
<!-- Velvet: heavy drape, dramatic light catching, deep shadows -->
<defs>
  <linearGradient id="velvet-directional" x1="0" y1="0" x2="1" y2="0.3">
    <stop offset="0%" stop-color="#1A0A2E"/>
    <stop offset="30%" stop-color="#4A1A6B"/>
    <stop offset="50%" stop-color="#7B3DAA"/>
    <stop offset="70%" stop-color="#4A1A6B"/>
    <stop offset="100%" stop-color="#1A0A2E"/>
  </linearGradient>
</defs>

<rect x="5" y="5" width="42" height="90" rx="2" fill="url(#velvet-directional)"/>

<!-- Few but deep folds — velvet is heavy, folds are broad -->
<path d="M 15 8 C 14 30, 16 55, 15 85"
      fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="3"/>
<path d="M 32 8 C 33 30, 31 55, 32 85"
      fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>

<!-- Strong highlight where nap catches light — characteristic velvet glow -->
<path d="M 23 8 C 22 25, 24 50, 23 80"
      fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2.5"/>
```

### Chiffon Fabric Rendering

Chiffon is sheer and nearly transparent. The key SVG technique is layering multiple semi-transparent shapes so that underlying elements show through. Folds are extremely fine and numerous.

```xml
<!-- Chiffon: sheer, transparent layers, extremely fine folds -->
<!-- Whatever is behind the chiffon shows through -->
<rect x="5" y="5" width="42" height="90" fill="#F5E6CC"/>

<!-- Sheer fabric overlay — very low opacity -->
<rect x="5" y="5" width="42" height="90" rx="2" fill="#C8DCF0" opacity="0.25"/>

<!-- Where fabric doubles over itself, opacity effectively doubles -->
<path d="M 10 30 Q 26 25, 42 30 L 42 55 Q 26 50, 10 55 Z"
      fill="#C8DCF0" opacity="0.2"/>

<!-- Many very fine fold lines — chiffon has numerous delicate wrinkles -->
<path d="M 10 8 Q 11 50, 10 92" fill="none" stroke="rgba(0,0,0,0.03)" stroke-width="0.8"/>
<path d="M 14 8 Q 13 50, 14 92" fill="none" stroke="rgba(0,0,0,0.03)" stroke-width="0.8"/>
<path d="M 18 8 Q 19 50, 18 92" fill="none" stroke="rgba(0,0,0,0.03)" stroke-width="0.8"/>
<path d="M 22 8 Q 21 50, 22 92" fill="none" stroke="rgba(0,0,0,0.03)" stroke-width="0.8"/>
<path d="M 26 8 Q 27 50, 26 92" fill="none" stroke="rgba(0,0,0,0.03)" stroke-width="0.8"/>
<path d="M 30 8 Q 29 50, 30 92" fill="none" stroke="rgba(0,0,0,0.03)" stroke-width="0.8"/>
<path d="M 34 8 Q 35 50, 34 92" fill="none" stroke="rgba(0,0,0,0.03)" stroke-width="0.8"/>
<path d="M 38 8 Q 37 50, 38 92" fill="none" stroke="rgba(0,0,0,0.03)" stroke-width="0.8"/>
```

## Wood Grain Textures

Wood grain is one of the most commonly needed textures in illustration. The key is combining regular linear patterns with organic variation using SVG filters.

### Straight Grain

Straight grain is the most common wood texture — parallel wavy lines running along the length of the board. The lines should not be perfectly parallel; slight irregularity creates realism.

```xml
<!-- Straight Wood Grain: parallel wavy lines with organic variation -->
<defs>
  <!-- Base wood color -->
  <linearGradient id="wood-base" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#DEB887"/>
    <stop offset="50%" stop-color="#D2A870"/>
    <stop offset="100%" stop-color="#C49A5C"/>
  </linearGradient>

  <!-- Turbulence for organic warp of the grain lines -->
  <filter id="wood-grain-filter" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.02 0.2"
                  numOctaves="3" seed="5" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise"
                       scale="4" xChannelSelector="R" yChannelSelector="G"/>
  </filter>

  <!-- Repeating grain line pattern -->
  <pattern id="wood-lines" x="0" y="0" width="100" height="8" patternUnits="userSpaceOnUse">
    <line x1="0" y1="2" x2="100" y2="2" stroke="#C4A060" stroke-width="0.5" opacity="0.6"/>
    <line x1="0" y1="5" x2="100" y2="5" stroke="#B8944E" stroke-width="0.3" opacity="0.4"/>
  </pattern>
</defs>

<!-- Wood plank base -->
<rect x="5" y="5" width="90" height="90" fill="url(#wood-base)" rx="1"/>

<!-- Grain lines with displacement filter for organic waviness -->
<rect x="5" y="5" width="90" height="90" fill="url(#wood-lines)"
      filter="url(#wood-grain-filter)" rx="1"/>
```

### Knot Pattern

Wood knots occur where branches grew from the trunk. Grain lines deflect around the knot in concentric ellipses, then resume their normal flow.

```xml
<!-- Wood Knot: concentric ellipses with deflecting grain -->
<defs>
  <radialGradient id="knot-center" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#5A3A1A"/>
    <stop offset="40%" stop-color="#6B4422"/>
    <stop offset="100%" stop-color="#8B6914"/>
  </radialGradient>
</defs>

<!-- Wood base -->
<rect x="5" y="5" width="90" height="90" fill="#DEB887" rx="1"/>

<!-- Regular grain lines — deflecting around the knot at (50, 50) -->
<path d="M 5 15 C 20 15, 35 12, 42 18 C 38 25, 38 35, 42 42" fill="none" stroke="#C4A060" stroke-width="0.5" opacity="0.5"/>
<path d="M 5 25 C 20 25, 32 22, 38 30 C 34 38, 34 45, 38 52" fill="none" stroke="#C4A060" stroke-width="0.5" opacity="0.5"/>
<path d="M 58 18 C 65 12, 75 15, 95 15" fill="none" stroke="#C4A060" stroke-width="0.5" opacity="0.5"/>
<path d="M 62 30 C 68 22, 78 25, 95 25" fill="none" stroke="#C4A060" stroke-width="0.5" opacity="0.5"/>

<!-- Lines below the knot resume flow -->
<path d="M 5 65 C 30 64, 50 66, 70 64 C 85 63, 90 65, 95 65" fill="none" stroke="#C4A060" stroke-width="0.5" opacity="0.5"/>
<path d="M 5 75 C 30 74, 50 76, 70 75 C 85 74, 90 75, 95 75" fill="none" stroke="#C4A060" stroke-width="0.5" opacity="0.5"/>
<path d="M 5 85 C 30 84, 50 86, 70 84 C 85 83, 90 85, 95 85" fill="none" stroke="#C4A060" stroke-width="0.5" opacity="0.5"/>

<!-- Knot: concentric ellipses -->
<ellipse cx="50" cy="45" rx="14" ry="12" fill="none" stroke="#6B4422" stroke-width="0.6" opacity="0.4"/>
<ellipse cx="50" cy="45" rx="10" ry="8" fill="none" stroke="#5A3A1A" stroke-width="0.7" opacity="0.5"/>
<ellipse cx="50" cy="45" rx="6" ry="5" fill="none" stroke="#4A2A10" stroke-width="0.8" opacity="0.6"/>
<!-- Knot center -->
<ellipse cx="50" cy="45" rx="3" ry="2.5" fill="url(#knot-center)"/>
```

### Wood Types Reference

| Type | Base Color | Grain Color | Line Weight | Pattern Spacing | Character |
|------|-----------|-------------|-------------|-----------------|-----------|
| Pine | #DEB887 | #C4A060 | 0.5px thin | Even, 6-8px | Light, even grain |
| Oak | #B8860B | #8B6914 | 0.8px medium | Irregular, 4-10px | Bold, prominent grain |
| Walnut | #5D3A1A | #3A2010 | 1.0px heavy | Tight, 3-5px | Dark, rich, tight grain |
| Birch | #F5E6C8 | #D4C4A0 | 0.3px fine | Minimal, 10-15px | Very light, subtle |
| Cherry | #8B4513 | #6B3410 | 0.6px medium | Medium, 5-8px | Warm red-brown tone |
| Mahogany | #4E1609 | #350E05 | 0.7px medium | Ribbon-like, 5-7px | Deep red, interlocked |

```xml
<!-- Oak grain panel example: prominent, irregular grain -->
<defs>
  <linearGradient id="oak-base" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#B8860B"/>
    <stop offset="100%" stop-color="#A07608"/>
  </linearGradient>
  <filter id="oak-grain-warp">
    <feTurbulence type="fractalNoise" baseFrequency="0.015 0.15" numOctaves="4" seed="12"/>
    <feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <pattern id="oak-lines" width="100" height="7" patternUnits="userSpaceOnUse">
    <line x1="0" y1="2" x2="100" y2="2" stroke="#8B6914" stroke-width="0.8" opacity="0.55"/>
    <line x1="0" y1="5.5" x2="100" y2="5.5" stroke="#9B7924" stroke-width="0.4" opacity="0.3"/>
  </pattern>
</defs>

<rect x="5" y="5" width="90" height="40" fill="url(#oak-base)" rx="1"/>
<rect x="5" y="5" width="90" height="40" fill="url(#oak-lines)" filter="url(#oak-grain-warp)" rx="1"/>

<!-- Walnut panel example: dark, tight grain -->
<defs>
  <linearGradient id="walnut-base" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#5D3A1A"/>
    <stop offset="100%" stop-color="#4D2A10"/>
  </linearGradient>
  <pattern id="walnut-lines" width="100" height="4" patternUnits="userSpaceOnUse">
    <line x1="0" y1="1.5" x2="100" y2="1.5" stroke="#3A2010" stroke-width="1.0" opacity="0.5"/>
    <line x1="0" y1="3" x2="100" y2="3" stroke="#4A3020" stroke-width="0.5" opacity="0.25"/>
  </pattern>
</defs>

<rect x="5" y="52" width="90" height="40" fill="url(#walnut-base)" rx="1"/>
<rect x="5" y="52" width="90" height="40" fill="url(#walnut-lines)" filter="url(#oak-grain-warp)" rx="1"/>
```

## Stone and Concrete Textures

### Stone Wall

A stone wall texture uses irregular polygons arranged in a masonry-like pattern with visible mortar lines between them. Each stone should have slight color variation.

```xml
<!-- Stone Wall: irregular polygons with mortar lines -->
<defs>
  <!-- Subtle noise for stone surface variation -->
  <filter id="stone-noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise"/>
    <feColorMatrix type="saturate" values="0" in="noise" result="gray-noise"/>
    <feBlend in="SourceGraphic" in2="gray-noise" mode="multiply" result="textured"/>
    <feComposite in="textured" in2="SourceGraphic" operator="in"/>
  </filter>
</defs>

<!-- Mortar background -->
<rect x="5" y="5" width="90" height="90" fill="#B0A898" rx="1"/>

<!-- Individual stones — irregular shapes with slight color variation -->
<!-- Row 1 -->
<polygon points="7,7 32,7 30,22 8,20" fill="#8B8378" filter="url(#stone-noise)"/>
<polygon points="34,7 58,8 56,24 32,22" fill="#9B9388" filter="url(#stone-noise)"/>
<polygon points="60,7 93,7 93,20 58,23" fill="#868076" filter="url(#stone-noise)"/>

<!-- Row 2 (offset for masonry pattern) -->
<polygon points="7,23 22,22 24,40 7,42" fill="#7B7568" filter="url(#stone-noise)"/>
<polygon points="25,22 52,24 50,42 26,40" fill="#918B80" filter="url(#stone-noise)"/>
<polygon points="54,23 78,22 80,38 52,40" fill="#838076" filter="url(#stone-noise)"/>
<polygon points="80,21 93,22 93,40 82,39" fill="#8A847A" filter="url(#stone-noise)"/>

<!-- Row 3 -->
<polygon points="7,44 35,42 33,60 8,58" fill="#928C82" filter="url(#stone-noise)"/>
<polygon points="37,41 65,43 63,62 35,60" fill="#7E7870" filter="url(#stone-noise)"/>
<polygon points="67,42 93,42 93,58 65,61" fill="#888278" filter="url(#stone-noise)"/>

<!-- Row 4 (offset) -->
<polygon points="7,60 25,59 27,78 7,80" fill="#858078" filter="url(#stone-noise)"/>
<polygon points="28,60 55,62 53,80 29,78" fill="#9A9488" filter="url(#stone-noise)"/>
<polygon points="57,61 80,60 82,76 55,78" fill="#7C766C" filter="url(#stone-noise)"/>
<polygon points="82,59 93,60 93,78 84,77" fill="#8E887E" filter="url(#stone-noise)"/>

<!-- Row 5 -->
<polygon points="7,82 38,80 36,93 7,93" fill="#868278" filter="url(#stone-noise)"/>
<polygon points="40,79 70,81 68,93 38,93" fill="#928E84" filter="url(#stone-noise)"/>
<polygon points="72,80 93,80 93,93 70,93" fill="#807A70" filter="url(#stone-noise)"/>
```

### Rough Stone Surface

For a single rough stone surface (not a wall), use feTurbulence noise combined with feDiffuseLighting to create a 3D bumpy appearance.

```xml
<!-- Rough Stone Surface: noise + diffuse lighting for 3D bumps -->
<defs>
  <filter id="rough-stone" x="0%" y="0%" width="100%" height="100%">
    <!-- Generate fractal noise for surface bumps -->
    <feTurbulence type="fractalNoise" baseFrequency="0.15"
                  numOctaves="6" seed="8" result="stone-noise"/>

    <!-- Apply diffuse lighting to create 3D appearance -->
    <feDiffuseLighting in="stone-noise" lighting-color="#A0968A"
                       surfaceScale="3" diffuseConstant="0.8" result="lit-stone">
      <feDistantLight azimuth="225" elevation="50"/>
    </feDiffuseLighting>

    <!-- Composite with original shape -->
    <feComposite in="lit-stone" in2="SourceGraphic" operator="in" result="clipped"/>

    <!-- Blend with base color for depth -->
    <feBlend in="clipped" in2="SourceGraphic" mode="multiply"/>
  </filter>
</defs>

<!-- Stone shape with rough surface filter -->
<path d="M 20 25 C 25 15, 45 10, 60 15 C 75 18, 85 30, 82 45
         C 85 60, 75 75, 60 80 C 45 85, 25 78, 18 65
         C 12 50, 15 35, 20 25 Z"
      fill="#A0968A" filter="url(#rough-stone)"/>
```

### Concrete/Cement

Concrete has a very subtle, fine-grained texture. Use low baseFrequency feTurbulence for the slight unevenness characteristic of poured concrete.

```xml
<!-- Concrete/Cement: subtle noise at low frequency for fine grain -->
<defs>
  <filter id="concrete-texture" x="0%" y="0%" width="100%" height="100%">
    <!-- Very fine noise — concrete is subtle -->
    <feTurbulence type="fractalNoise" baseFrequency="0.65"
                  numOctaves="5" seed="42" result="concrete-noise"/>

    <!-- Desaturate the noise -->
    <feColorMatrix type="saturate" values="0" in="concrete-noise" result="gray"/>

    <!-- Very subtle lighting for micro-bumps -->
    <feDiffuseLighting in="gray" lighting-color="#C0BCB6"
                       surfaceScale="0.5" diffuseConstant="1.0" result="lit">
      <feDistantLight azimuth="200" elevation="65"/>
    </feDiffuseLighting>

    <!-- Clip to shape -->
    <feComposite in="lit" in2="SourceGraphic" operator="in" result="clipped"/>

    <!-- Multiply blend for depth -->
    <feBlend in="clipped" in2="SourceGraphic" mode="multiply"/>
  </filter>

  <!-- Optional: hairline crack overlay -->
  <filter id="concrete-cracks">
    <feTurbulence type="turbulence" baseFrequency="0.01 0.04"
                  numOctaves="2" seed="7" result="crack-noise"/>
    <feColorMatrix type="discrete" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
                   in="crack-noise" result="crack-thresh"/>
    <feComposite in="SourceGraphic" in2="crack-thresh" operator="in"/>
  </filter>
</defs>

<!-- Concrete slab -->
<rect x="5" y="5" width="90" height="90" fill="#B8B4AE" filter="url(#concrete-texture)" rx="1"/>

<!-- Subtle surface imperfections — tiny dark specs -->
<circle cx="25" cy="30" r="0.5" fill="rgba(0,0,0,0.08)"/>
<circle cx="60" cy="45" r="0.3" fill="rgba(0,0,0,0.06)"/>
<circle cx="40" cy="70" r="0.4" fill="rgba(0,0,0,0.07)"/>
<circle cx="75" cy="20" r="0.3" fill="rgba(0,0,0,0.05)"/>
<circle cx="15" cy="80" r="0.5" fill="rgba(0,0,0,0.08)"/>

<!-- Hairline crack (optional decorative detail) -->
<path d="M 30 5 C 32 20, 28 35, 35 50 C 38 55, 33 65, 36 80"
      fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="0.3"/>
```

## Glass and Transparency

Glass textures require careful handling of transparency, reflections, and refraction cues. The key is layering: tinted transparent fill, edge highlights, and specular reflections.

### Clear Glass

Clear glass shows the background with a slight color tint, sharp specular highlights, and visible edges.

```xml
<!-- Clear Glass: transparent fill + specular highlight + edge glow -->
<defs>
  <linearGradient id="glass-edge" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
    <stop offset="15%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="85%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0.2)"/>
  </linearGradient>

  <linearGradient id="glass-sheen" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="rgba(255,255,255,0.25)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>
</defs>

<!-- Background content visible through the glass -->
<rect x="20" y="25" width="15" height="15" fill="#E74C3C" opacity="0.8"/>
<circle cx="60" cy="50" r="10" fill="#3498DB" opacity="0.8"/>

<!-- Glass panel — very low opacity tint -->
<rect x="15" y="15" width="70" height="70" rx="3"
      fill="rgba(200,220,240,0.08)" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>

<!-- Edge highlight gradient -->
<rect x="15" y="15" width="70" height="70" rx="3" fill="url(#glass-edge)"/>

<!-- Specular highlight — sharp diagonal reflection -->
<path d="M 20 18 L 35 18 L 20 45 Z" fill="url(#glass-sheen)"/>

<!-- Secondary subtle reflection -->
<path d="M 40 18 L 48 18 L 40 32 Z" fill="rgba(255,255,255,0.08)"/>

<!-- Bottom edge shadow (glass thickness) -->
<line x1="16" y1="85" x2="84" y2="85" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
```

### Frosted Glass

Frosted glass obscures what's behind it with a blur effect while maintaining a white-ish translucent appearance.

```xml
<!-- Frosted Glass: blurred background + white overlay -->
<defs>
  <!-- Blur filter for the "frosted" effect on content behind -->
  <filter id="frost-blur" x="-5%" y="-5%" width="110%" height="110%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="3"/>
  </filter>

  <!-- Noise texture for frosted surface grain -->
  <filter id="frost-grain" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="3" result="grain"/>
    <feColorMatrix type="saturate" values="0" in="grain" result="gray-grain"/>
    <feBlend in="SourceGraphic" in2="gray-grain" mode="overlay"/>
  </filter>
</defs>

<!-- Background objects (these would normally be visible) -->
<rect x="25" y="30" width="20" height="20" fill="#E74C3C"/>
<circle cx="65" cy="50" r="12" fill="#2ECC71"/>

<!-- Blurred copy of background (simulates what you see through frosted glass) -->
<g filter="url(#frost-blur)" opacity="0.5">
  <rect x="25" y="30" width="20" height="20" fill="#E74C3C"/>
  <circle cx="65" cy="50" r="12" fill="#2ECC71"/>
</g>

<!-- Frosted glass panel -->
<rect x="15" y="15" width="70" height="70" rx="3"
      fill="rgba(255,255,255,0.45)" filter="url(#frost-grain)"/>

<!-- Subtle edge highlight -->
<rect x="15" y="15" width="70" height="70" rx="3"
      fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>

<!-- Soft specular -->
<ellipse cx="40" cy="30" rx="18" ry="8" fill="rgba(255,255,255,0.12)"/>
```

### Stained Glass

Stained glass features bold dark outlines (lead came), bright saturated color fills, and slight texture variation within each pane.

```xml
<!-- Stained Glass Panel: bold outlines + bright saturated fills -->
<defs>
  <!-- Subtle texture for each glass piece -->
  <filter id="glass-texture">
    <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="2" result="tex"/>
    <feColorMatrix type="saturate" values="0" in="tex" result="gray"/>
    <feBlend in="SourceGraphic" in2="gray" mode="overlay"/>
  </filter>
</defs>

<!-- Background (dark, representing the frame/wall) -->
<rect x="5" y="5" width="90" height="90" fill="#1A1A1A" rx="2"/>

<!-- Glass panes — bright saturated colors with texture -->
<!-- Top section: sky -->
<path d="M 10 10 L 50 10 L 48 35 L 12 30 Z"
      fill="#4AA5D8" filter="url(#glass-texture)" opacity="0.9"/>
<path d="M 52 10 L 90 10 L 88 32 L 50 35 Z"
      fill="#5BC0EB" filter="url(#glass-texture)" opacity="0.9"/>

<!-- Middle section: focal element (e.g., flower/sun motif) -->
<path d="M 12 33 L 48 37 L 50 55 L 30 60 L 10 55 Z"
      fill="#E8433E" filter="url(#glass-texture)" opacity="0.9"/>
<path d="M 50 37 L 88 34 L 90 55 L 70 60 L 52 55 Z"
      fill="#F4A142" filter="url(#glass-texture)" opacity="0.9"/>
<path d="M 35 55 L 50 50 L 65 55 L 55 68 L 45 68 Z"
      fill="#FCE94F" filter="url(#glass-texture)" opacity="0.9"/>

<!-- Bottom section: earth tones -->
<path d="M 10 58 L 30 62 L 28 90 L 10 90 Z"
      fill="#2D8B46" filter="url(#glass-texture)" opacity="0.9"/>
<path d="M 32 62 L 50 58 L 68 62 L 65 90 L 35 90 Z"
      fill="#1D6B36" filter="url(#glass-texture)" opacity="0.9"/>
<path d="M 70 62 L 90 58 L 90 90 L 68 90 Z"
      fill="#3DA858" filter="url(#glass-texture)" opacity="0.9"/>

<!-- Lead came outlines — thick dark lines between panes -->
<path d="M 10 10 L 50 10 L 48 35 L 12 30 Z" fill="none" stroke="#1A1A1A" stroke-width="2.5"/>
<path d="M 52 10 L 90 10 L 88 32 L 50 35 Z" fill="none" stroke="#1A1A1A" stroke-width="2.5"/>
<path d="M 12 33 L 48 37 L 50 55 L 30 60 L 10 55 Z" fill="none" stroke="#1A1A1A" stroke-width="2.5"/>
<path d="M 50 37 L 88 34 L 90 55 L 70 60 L 52 55 Z" fill="none" stroke="#1A1A1A" stroke-width="2.5"/>
<path d="M 35 55 L 50 50 L 65 55 L 55 68 L 45 68 Z" fill="none" stroke="#1A1A1A" stroke-width="2.5"/>
<path d="M 10 58 L 30 62 L 28 90 L 10 90 Z" fill="none" stroke="#1A1A1A" stroke-width="2.5"/>
<path d="M 32 62 L 50 58 L 68 62 L 65 90 L 35 90 Z" fill="none" stroke="#1A1A1A" stroke-width="2.5"/>
<path d="M 70 62 L 90 58 L 90 90 L 68 90 Z" fill="none" stroke="#1A1A1A" stroke-width="2.5"/>

<!-- Outer frame -->
<rect x="8" y="8" width="84" height="84" fill="none" stroke="#111" stroke-width="4" rx="2"/>
```

### Glass with Refraction Distortion

Thick glass distorts objects seen through it. Use `feDisplacementMap` with `feTurbulence` to warp content behind the glass pane.

```xml
<!-- Glass Refraction: distorting content behind thick glass -->
<defs>
  <!-- Refraction displacement filter -->
  <filter id="glass-refraction" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="turbulence" baseFrequency="0.015"
                  numOctaves="2" seed="9" result="lens-distort"/>
    <feDisplacementMap in="SourceGraphic" in2="lens-distort" scale="8"
                       xChannelSelector="R" yChannelSelector="G"/>
  </filter>

  <!-- Glass surface sheen -->
  <linearGradient id="refraction-sheen" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
    <stop offset="30%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>
</defs>

<!-- Background scene objects (unrefracted, behind the glass) -->
<rect x="10" y="10" width="20" height="30" fill="#E74C3C"/>
<circle cx="70" cy="40" r="15" fill="#27AE60"/>
<rect x="50" y="60" width="30" height="20" fill="#3498DB"/>

<!-- Refracted copy of background (only within the glass area) -->
<g filter="url(#glass-refraction)">
  <rect x="10" y="10" width="20" height="30" fill="#E74C3C"/>
  <circle cx="70" cy="40" r="15" fill="#27AE60"/>
  <rect x="50" y="60" width="30" height="20" fill="#3498DB"/>
</g>

<!-- Glass pane overlay — very slight tint + edge highlight -->
<rect x="15" y="15" width="70" height="70" rx="2"
      fill="rgba(200,230,255,0.06)" stroke="rgba(255,255,255,0.35)" stroke-width="0.5"/>

<!-- Specular reflection -->
<rect x="15" y="15" width="70" height="70" rx="2" fill="url(#refraction-sheen)"/>

<!-- Small bright specular spot -->
<ellipse cx="30" cy="28" rx="6" ry="2.5" fill="rgba(255,255,255,0.4)"
         transform="rotate(-15 30 28)"/>
```

## Woven Fabric Patterns

Woven textures are created using SVG `<pattern>` elements that tile to fill any shape. The weave structure determines the visual character of the fabric.

### Basic Weave (Plain/Tabby)

The simplest weave: alternating over-under pattern creating a checkerboard-like grid. Used for muslin, canvas, and burlap.

```xml
<!-- Plain Weave Pattern: alternating over-under grid -->
<defs>
  <pattern id="plain-weave" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
    <!-- Background (warp threads going vertical) -->
    <rect width="8" height="8" fill="#C4A56E"/>

    <!-- Weft threads (horizontal, alternating visibility) -->
    <!-- Row 1: visible over columns 0-3, hidden under columns 4-7 -->
    <rect x="0" y="0" width="4" height="4" fill="#B89858" opacity="0.8"/>
    <!-- Row 2: offset — visible over columns 4-7, hidden under columns 0-3 -->
    <rect x="4" y="4" width="4" height="4" fill="#B89858" opacity="0.8"/>

    <!-- Thread shadow for depth -->
    <line x1="0" y1="4" x2="4" y2="4" stroke="rgba(0,0,0,0.1)" stroke-width="0.3"/>
    <line x1="4" y1="0" x2="4" y2="4" stroke="rgba(0,0,0,0.08)" stroke-width="0.3"/>
    <line x1="4" y1="8" x2="8" y2="8" stroke="rgba(0,0,0,0.1)" stroke-width="0.3"/>
    <line x1="8" y1="4" x2="8" y2="8" stroke="rgba(0,0,0,0.08)" stroke-width="0.3"/>
  </pattern>
</defs>

<!-- Apply plain weave to a shape -->
<rect x="10" y="10" width="80" height="80" fill="url(#plain-weave)" rx="2"/>

<!-- Optional: subtle shadow along edges for fabric depth -->
<rect x="10" y="10" width="80" height="80" fill="none"
      stroke="rgba(0,0,0,0.15)" stroke-width="1" rx="2"/>
```

### Twill Weave

Diagonal pattern characteristic of denim and tweed. The weft threads pass over two or more warp threads, creating a diagonal ridge (the "twill line").

```xml
<!-- Twill Weave Pattern: diagonal lines characteristic of denim -->
<defs>
  <pattern id="twill-weave" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
    <!-- Base denim color -->
    <rect width="8" height="8" fill="#3B5998"/>

    <!-- Diagonal twill lines — offset each row to create the diagonal -->
    <rect x="0" y="0" width="3" height="2" fill="#4A6BA8" opacity="0.7"/>
    <rect x="2" y="2" width="3" height="2" fill="#4A6BA8" opacity="0.7"/>
    <rect x="4" y="4" width="3" height="2" fill="#4A6BA8" opacity="0.7"/>
    <rect x="6" y="6" width="3" height="2" fill="#4A6BA8" opacity="0.7"/>

    <!-- Shadow along the diagonal for thread depth -->
    <line x1="0" y1="2" x2="3" y2="2" stroke="rgba(0,0,0,0.12)" stroke-width="0.3"/>
    <line x1="2" y1="4" x2="5" y2="4" stroke="rgba(0,0,0,0.12)" stroke-width="0.3"/>
    <line x1="4" y1="6" x2="7" y2="6" stroke="rgba(0,0,0,0.12)" stroke-width="0.3"/>
    <line x1="6" y1="8" x2="9" y2="8" stroke="rgba(0,0,0,0.12)" stroke-width="0.3"/>
  </pattern>
</defs>

<!-- Denim swatch with twill weave -->
<rect x="10" y="10" width="80" height="80" fill="url(#twill-weave)" rx="1"/>

<!-- Worn/faded highlight for realistic denim -->
<ellipse cx="50" cy="50" rx="25" ry="20" fill="rgba(255,255,255,0.05)"/>
```

### Knit Pattern (Stockinette Stitch)

Interlocking V-shapes forming the classic knit stockinette stitch. Each row of V's is offset to interlock with the row above.

```xml
<!-- Knit Pattern: interlocking V-shapes (stockinette stitch) -->
<defs>
  <pattern id="knit-stitch" x="0" y="0" width="10" height="12" patternUnits="userSpaceOnUse">
    <!-- Background yarn color -->
    <rect width="10" height="12" fill="#C0392B"/>

    <!-- V-stitch: two angled lines forming a V -->
    <!-- Left leg of V -->
    <line x1="1" y1="1" x2="5" y2="6" stroke="#D4534A" stroke-width="1.2" stroke-linecap="round"/>
    <!-- Right leg of V -->
    <line x1="9" y1="1" x2="5" y2="6" stroke="#D4534A" stroke-width="1.2" stroke-linecap="round"/>

    <!-- Offset V for next row (half-drop repeat) -->
    <line x1="-4" y1="7" x2="0" y2="12" stroke="#D4534A" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="4" y1="7" x2="0" y2="12" stroke="#D4534A" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="6" y1="7" x2="10" y2="12" stroke="#D4534A" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="14" y1="7" x2="10" y2="12" stroke="#D4534A" stroke-width="1.2" stroke-linecap="round"/>

    <!-- Subtle shadow in the V valley -->
    <circle cx="5" cy="6" r="0.5" fill="rgba(0,0,0,0.1)"/>
    <circle cx="0" cy="12" r="0.5" fill="rgba(0,0,0,0.1)"/>
    <circle cx="10" cy="12" r="0.5" fill="rgba(0,0,0,0.1)"/>
  </pattern>
</defs>

<!-- Knit fabric swatch -->
<rect x="10" y="10" width="80" height="80" fill="url(#knit-stitch)" rx="3"/>

<!-- Fabric edge detail (ribbing suggestion) -->
<rect x="10" y="80" width="80" height="10" fill="#A83228" rx="1"/>
<line x1="15" y1="82" x2="15" y2="89" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
<line x1="20" y1="82" x2="20" y2="89" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
<line x1="25" y1="82" x2="25" y2="89" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
<line x1="30" y1="82" x2="30" y2="89" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
<line x1="35" y1="82" x2="35" y2="89" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
<line x1="40" y1="82" x2="40" y2="89" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
<line x1="45" y1="82" x2="45" y2="89" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
<line x1="50" y1="82" x2="50" y2="89" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
```

### Herringbone Weave

V-shaped pattern created by reversing the twill direction at regular intervals. Creates a distinctive zigzag appearance common in wool coats, suits, and upholstery.

```xml
<!-- Herringbone Weave: reversed twill creating V-pattern -->
<defs>
  <pattern id="herringbone-weave" x="0" y="0" width="16" height="12" patternUnits="userSpaceOnUse">
    <!-- Base color -->
    <rect width="16" height="12" fill="#7A7060"/>

    <!-- Right-leaning section (left half) — twill going up-right -->
    <line x1="0" y1="12" x2="4" y2="0" stroke="#8A806E" stroke-width="1.5" opacity="0.7"/>
    <line x1="2" y1="12" x2="6" y2="0" stroke="#8A806E" stroke-width="1.5" opacity="0.7"/>
    <line x1="4" y1="12" x2="8" y2="0" stroke="#8A806E" stroke-width="1.5" opacity="0.7"/>

    <!-- Left-leaning section (right half) — twill going up-left -->
    <line x1="8" y1="0" x2="12" y2="12" stroke="#6A6050" stroke-width="1.5" opacity="0.7"/>
    <line x1="10" y1="0" x2="14" y2="12" stroke="#6A6050" stroke-width="1.5" opacity="0.7"/>
    <line x1="12" y1="0" x2="16" y2="12" stroke="#6A6050" stroke-width="1.5" opacity="0.7"/>

    <!-- Center spine where directions meet -->
    <line x1="8" y1="0" x2="8" y2="12" stroke="rgba(0,0,0,0.06)" stroke-width="0.3"/>
  </pattern>
</defs>

<!-- Herringbone fabric swatch -->
<rect x="10" y="10" width="80" height="80" fill="url(#herringbone-weave)" rx="1"/>
```

### Basket Weave

Groups of 2-3 threads pass over and under together, creating a checkerboard of small squares. More textured than plain weave, common in actual baskets and heavy upholstery.

```xml
<!-- Basket Weave: grouped thread over-under creating blocky checkerboard -->
<defs>
  <pattern id="basket-weave" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
    <rect width="16" height="16" fill="#C8B080"/>

    <!-- Top-left: horizontal pair (weft threads on top) -->
    <rect x="0" y="0" width="8" height="3.5" fill="#B8A070" rx="0.5"/>
    <rect x="0" y="4" width="8" height="3.5" fill="#B8A070" rx="0.5"/>

    <!-- Top-right: vertical pair (warp threads on top) -->
    <rect x="8" y="0" width="3.5" height="8" fill="#D8C090" rx="0.5"/>
    <rect x="12" y="0" width="3.5" height="8" fill="#D8C090" rx="0.5"/>

    <!-- Bottom-left: vertical pair -->
    <rect x="0" y="8" width="3.5" height="8" fill="#D8C090" rx="0.5"/>
    <rect x="4" y="8" width="3.5" height="8" fill="#D8C090" rx="0.5"/>

    <!-- Bottom-right: horizontal pair -->
    <rect x="8" y="8" width="8" height="3.5" fill="#B8A070" rx="0.5"/>
    <rect x="8" y="12" width="8" height="3.5" fill="#B8A070" rx="0.5"/>

    <!-- Shadow at each boundary for depth -->
    <line x1="8" y1="0" x2="8" y2="16" stroke="rgba(0,0,0,0.08)" stroke-width="0.3"/>
    <line x1="0" y1="8" x2="16" y2="8" stroke="rgba(0,0,0,0.08)" stroke-width="0.3"/>
  </pattern>
</defs>

<!-- Basket weave swatch -->
<rect x="10" y="10" width="80" height="80" fill="url(#basket-weave)" rx="2"/>
```

## Rust and Weathering

Weathering effects add age and realism. Rust and patina are the most common weathering textures.

### Rust Effect

Rust forms in organic patches on metal surfaces. Layer: base metal → irregular rust patches → edge detail and pitting.

```xml
<!-- Rust Effect: organic orange-brown patches on metal -->
<defs>
  <!-- Metal base gradient -->
  <linearGradient id="rust-metal-base" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#7A7A7A"/>
    <stop offset="100%" stop-color="#606060"/>
  </linearGradient>

  <!-- Turbulence for organic rust patch shapes -->
  <filter id="rust-patches" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.06"
                  numOctaves="4" seed="15" result="rust-noise"/>
    <!-- Threshold to create patches instead of uniform coverage -->
    <feColorMatrix type="matrix"
      values="0 0 0 0 0.7
              0 0 0 0 0.35
              0 0 0 0 0.1
              0 0 0 3 -1.5"
      in="rust-noise" result="rust-color"/>
    <feComposite in="rust-color" in2="SourceGraphic" operator="in" result="clipped-rust"/>
    <feBlend in="clipped-rust" in2="SourceGraphic" mode="normal"/>
  </filter>

  <!-- Pitting/texture for the rust surface -->
  <filter id="rust-pitting">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="pits"/>
    <feDiffuseLighting in="pits" lighting-color="#B8652A" surfaceScale="1" result="lit-pits">
      <feDistantLight azimuth="135" elevation="55"/>
    </feDiffuseLighting>
    <feComposite in="lit-pits" in2="SourceGraphic" operator="in"/>
  </filter>
</defs>

<!-- Layer 1: Base metal surface -->
<rect x="10" y="10" width="80" height="80" fill="url(#rust-metal-base)" rx="2"/>

<!-- Layer 2: Rust patches (organic, turbulence-shaped) -->
<rect x="10" y="10" width="80" height="80" fill="#8B4513"
      filter="url(#rust-patches)" opacity="0.75" rx="2"/>

<!-- Layer 3: Rust pitting texture on top -->
<rect x="10" y="10" width="80" height="80" fill="#A0522D"
      filter="url(#rust-pitting)" opacity="0.3" rx="2"/>

<!-- Layer 4: Edge detail — rust is thicker at edges and seams -->
<path d="M 12 12 L 88 12" fill="none" stroke="#8B4513" stroke-width="1.5" opacity="0.4"/>
<path d="M 12 88 L 88 88" fill="none" stroke="#6B3410" stroke-width="2" opacity="0.5"/>
<path d="M 12 12 L 12 88" fill="none" stroke="#7B4020" stroke-width="1" opacity="0.3"/>
```

### Patina (Green on Copper/Bronze)

Patina forms as verdigris (green copper carbonate) on copper or bronze surfaces exposed to weather. The patina concentrates in recessed areas and crevices.

```xml
<!-- Patina: green-blue oxidation on copper/bronze surface -->
<defs>
  <!-- Copper base -->
  <linearGradient id="copper-base" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#B87333"/>
    <stop offset="50%" stop-color="#A66528"/>
    <stop offset="100%" stop-color="#C68040"/>
  </linearGradient>

  <!-- Patina overlay — green patches via turbulence -->
  <filter id="patina-filter" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.05"
                  numOctaves="5" seed="22" result="patina-noise"/>
    <feColorMatrix type="matrix"
      values="0 0 0 0 0.3
              0 0 0 0 0.6
              0 0 0 0 0.45
              0 0 0 2.5 -1.2"
      in="patina-noise" result="green-patches"/>
    <feComposite in="green-patches" in2="SourceGraphic" operator="in"/>
  </filter>

  <!-- Subtle surface texture -->
  <filter id="patina-grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3"/>
    <feDiffuseLighting lighting-color="#90B89A" surfaceScale="0.8">
      <feDistantLight azimuth="180" elevation="60"/>
    </feDiffuseLighting>
    <feComposite in2="SourceGraphic" operator="in"/>
  </filter>
</defs>

<!-- Layer 1: Copper base -->
<rect x="10" y="10" width="80" height="80" fill="url(#copper-base)" rx="3"/>

<!-- Layer 2: Green patina patches -->
<rect x="10" y="10" width="80" height="80" fill="#4A8B6A"
      filter="url(#patina-filter)" opacity="0.6" rx="3"/>

<!-- Layer 3: Surface grain texture -->
<rect x="10" y="10" width="80" height="80" fill="#7AAA8A"
      filter="url(#patina-grain)" opacity="0.15" rx="3"/>

<!-- Layer 4: Patina concentrated in crevices and edges -->
<path d="M 12 12 C 20 14, 30 11, 40 13 C 50 11, 60 14, 70 12 C 78 13, 85 11, 88 12"
      fill="none" stroke="#4A8B6A" stroke-width="1.5" opacity="0.4"/>
<path d="M 12 88 C 20 86, 35 89, 50 87 C 65 89, 80 86, 88 88"
      fill="none" stroke="#3A7B5A" stroke-width="2" opacity="0.5"/>

<!-- Remaining copper showing through (highlights) -->
<ellipse cx="55" cy="45" rx="12" ry="8" fill="rgba(184,115,51,0.3)"/>
```

### Weathered Paint Peeling

Paint that has cracked and peeled over time, revealing the substrate underneath. Uses turbulence-based masking to create organic peel shapes.

```xml
<!-- Weathered Paint Peeling: paint layer with organic holes revealing substrate -->
<defs>
  <!-- Create organic peel mask using turbulence thresholding -->
  <filter id="peel-mask" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="turbulence" baseFrequency="0.04"
                  numOctaves="3" seed="77" result="cracks"/>
    <!-- Hard threshold creates discrete peel patches -->
    <feComponentTransfer in="cracks" result="mask">
      <feFuncR type="discrete" tableValues="0 0 0 1 1 1"/>
      <feFuncG type="discrete" tableValues="0 0 0 1 1 1"/>
      <feFuncB type="discrete" tableValues="0 0 0 1 1 1"/>
    </feComponentTransfer>
    <feComposite in="SourceGraphic" in2="mask" operator="in"/>
  </filter>

  <!-- Crack line texture -->
  <filter id="crack-lines" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="turbulence" baseFrequency="0.02 0.08"
                  numOctaves="2" seed="80" result="cracks"/>
    <feColorMatrix in="cracks" type="saturate" values="0" result="bw"/>
    <feComponentTransfer in="bw" result="thresh">
      <feFuncR type="discrete" tableValues="0 0 0 0 0 1"/>
      <feFuncG type="discrete" tableValues="0 0 0 0 0 1"/>
      <feFuncB type="discrete" tableValues="0 0 0 0 0 1"/>
    </feComponentTransfer>
    <feComposite in="SourceGraphic" in2="thresh" operator="in"/>
  </filter>
</defs>

<!-- Layer 1: Exposed substrate (wood/primer/rust underneath) -->
<rect x="10" y="10" width="80" height="80" fill="#A8957C" rx="2"/>

<!-- Layer 2: Substrate texture — slight grain -->
<rect x="10" y="10" width="80" height="80" fill="#9A876E" opacity="0.3" rx="2"/>

<!-- Layer 3: Remaining paint with peeled-away patches -->
<rect x="10" y="10" width="80" height="80" fill="#4A7A6A"
      filter="url(#peel-mask)" rx="2"/>

<!-- Layer 4: Hairline crack network across surviving paint -->
<rect x="10" y="10" width="80" height="80" fill="rgba(0,0,0,0.15)"
      filter="url(#crack-lines)" rx="2"/>

<!-- Layer 5: Shadow at peel edges — paint curling creates shadow -->
<rect x="10" y="10" width="80" height="80" fill="rgba(0,0,0,0.1)"
      filter="url(#peel-mask)" opacity="0.3" rx="2"
      transform="translate(0.5, 0.5)"/>
```

## Paper & Parchment

Paper and parchment textures are essential for backgrounds, labels, scrolls, and mixed-media illustration effects.

### Clean Paper

Clean paper has a very subtle fiber texture visible up close. Use high-frequency fractalNoise at very low contrast to simulate the slight unevenness of paper fibers.

```xml
<!-- Clean Paper: subtle fiber texture, warm white -->
<defs>
  <filter id="paper-fibers" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.5"
                  numOctaves="4" seed="80" result="fibers"/>
    <feColorMatrix in="fibers" type="saturate" values="0" result="bw"/>
    <feBlend in="SourceGraphic" in2="bw" mode="multiply" result="textured"/>
    <!-- Very low contrast — paper is mostly uniform -->
    <feComponentTransfer in="textured">
      <feFuncR type="linear" slope="0.12" intercept="0.88"/>
      <feFuncG type="linear" slope="0.12" intercept="0.87"/>
      <feFuncB type="linear" slope="0.12" intercept="0.84"/>
    </feComponentTransfer>
  </filter>
</defs>

<!-- Paper sheet -->
<rect x="10" y="10" width="80" height="80" fill="#FDFBF5"
      filter="url(#paper-fibers)" rx="1"/>

<!-- Optional: very subtle shadow at bottom edge for thickness -->
<line x1="11" y1="90" x2="89" y2="90" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>
<line x1="90" y1="11" x2="90" y2="89" stroke="rgba(0,0,0,0.06)" stroke-width="0.5"/>
```

### Aged Parchment

Aged parchment shows yellowing, staining, and darker edges (vignette). Use warm-toned turbulence noise for stains and a radial gradient for the edge darkening.

```xml
<!-- Aged Parchment: yellowed, stained, darkened edges -->
<defs>
  <filter id="parchment-stains" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.04"
                  numOctaves="5" seed="85" result="stains"/>
    <!-- Map noise to warm yellowed tones -->
    <feColorMatrix in="stains" type="matrix"
      values="0.3 0.1 0   0 0.65
              0.2 0.15 0  0 0.55
              0   0   0.1 0 0.35
              0   0   0   1 0" result="aged"/>
    <feBlend in="SourceGraphic" in2="aged" mode="multiply"/>
  </filter>

  <!-- Edge darkening vignette -->
  <radialGradient id="parchment-vignette" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
    <stop offset="65%" stop-color="rgba(0,0,0,0)"/>
    <stop offset="100%" stop-color="rgba(80,50,20,0.4)"/>
  </radialGradient>
</defs>

<!-- Parchment base -->
<rect x="10" y="10" width="80" height="80" fill="#E8D8B0"
      filter="url(#parchment-stains)" rx="1"/>

<!-- Edge darkening overlay -->
<rect x="10" y="10" width="80" height="80" fill="url(#parchment-vignette)" rx="1"/>

<!-- Optional: scattered dark spots (foxing) -->
<circle cx="30" cy="25" r="1" fill="rgba(100,60,20,0.12)"/>
<circle cx="65" cy="40" r="0.8" fill="rgba(100,60,20,0.1)"/>
<circle cx="45" cy="70" r="1.2" fill="rgba(100,60,20,0.08)"/>
<circle cx="75" cy="65" r="0.6" fill="rgba(100,60,20,0.1)"/>
```

### Crumpled Paper

Crumpled paper has visible crease lines and uneven lighting from wrinkles. Use feDiffuseLighting with turbulence to create the 3D wrinkle appearance.

```xml
<!-- Crumpled Paper: visible creases with 3D lighting -->
<defs>
  <filter id="crumple-lighting" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="turbulence" baseFrequency="0.03"
                  numOctaves="3" seed="88" result="wrinkles"/>
    <feDiffuseLighting in="wrinkles" surfaceScale="4"
                       lighting-color="white" result="lit">
      <feDistantLight azimuth="135" elevation="55"/>
    </feDiffuseLighting>
    <feBlend in="SourceGraphic" in2="lit" mode="multiply"/>
  </filter>
</defs>

<!-- Crumpled paper -->
<rect x="10" y="10" width="80" height="80" fill="#F0ECE0"
      filter="url(#crumple-lighting)" rx="1"/>

<!-- Sharp crease lines where paper was folded hard -->
<path d="M 10 35 L 55 40 L 90 33"
      fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="0.4"/>
<path d="M 35 10 L 40 50 L 38 90"
      fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="0.4"/>
```

### Torn Paper Edge

Torn edges create fibrous, irregular boundaries. Use an irregular path combined with displacement for the fibrous look, plus a slight shadow along the tear.

```xml
<!-- Torn Paper: irregular edge with fiber effect + shadow -->
<defs>
  <filter id="fiber-edge" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="turbulence" baseFrequency="0.08"
                  numOctaves="4" seed="90" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3"
                       xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>

<!-- Paper body with torn right edge -->
<path d="M 10 10 L 62 10 L 64 14 L 60 19 L 65 26 L 61 32
         L 63 38 L 59 44 L 64 50 L 60 56 L 63 62 L 61 68
         L 64 74 L 60 80 L 63 86 L 10 86 Z"
      fill="#FDFBF5" filter="url(#fiber-edge)"/>

<!-- Shadow along the torn edge — paper thickness creates shadow -->
<path d="M 62 10 L 64 14 L 60 19 L 65 26 L 61 32 L 63 38
         L 59 44 L 64 50 L 60 56 L 63 62 L 61 68 L 64 74
         L 60 80 L 63 86"
      fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="1.5"/>

<!-- Fiber wisps along the tear — tiny strokes extending from the edge -->
<path d="M 64 16 L 67 15" fill="none" stroke="rgba(180,170,150,0.3)" stroke-width="0.3"/>
<path d="M 63 30 L 66 29" fill="none" stroke="rgba(180,170,150,0.3)" stroke-width="0.3"/>
<path d="M 61 45 L 64 44" fill="none" stroke="rgba(180,170,150,0.3)" stroke-width="0.3"/>
<path d="M 64 52 L 67 53" fill="none" stroke="rgba(180,170,150,0.3)" stroke-width="0.3"/>
<path d="M 62 70 L 65 69" fill="none" stroke="rgba(180,170,150,0.3)" stroke-width="0.3"/>
```

## Texture Adaptation by Style

Not every illustration style requires full texture rendering. Match your texture detail level to the overall illustration style for visual consistency.

| Illustration Style | Texture Approach | Detail Level | Technique |
|-------------------|-----------------|--------------|-----------|
| Flat design | No texture, solid colors only | None | Pure fill colors, no filters or patterns |
| Cartoon | Simplified, 2-3 suggestion lines per surface | Low | Minimal stroke hints, no filter textures |
| Stylized | Selective texture on focal areas only | Medium | Patterns on key elements, simple filters |
| Detailed/realistic | Full texture rendering on all surfaces | High | Patterns + filters + lighting + layered effects |
| Watercolor | Soft, blended texture edges | Medium | Soft opacity, feGaussianBlur edges, wet-edge effects |
| Pixel art | No SVG texture; rely on sharp color blocks | None | Hard-edged rects only, no curves or gradients |

### Style-Specific Guidelines

**Flat design:** Use only solid `fill` colors. No gradients, no patterns, no filters. Texture is implied by color contrast between adjacent shapes.

**Cartoon style:** Add 2-3 fold lines maximum per fabric surface. Use simple strokes (no filters). Wood grain = 2-3 curved lines. Metal = single highlight line.

```xml
<!-- Cartoon-style wood: just a few curved suggestion lines -->
<rect x="10" y="10" width="80" height="40" fill="#C49A5C" rx="2"/>
<path d="M 10 20 C 30 18, 50 22, 90 20" fill="none" stroke="#A0804A" stroke-width="0.6" opacity="0.4"/>
<path d="M 10 32 C 35 30, 65 34, 90 32" fill="none" stroke="#A0804A" stroke-width="0.5" opacity="0.3"/>
```

**Detailed/realistic:** Layer multiple techniques — base fill → pattern overlay → filter texture → lighting → highlight/shadow strokes. Use all available SVG filter primitives.

**Watercolor style:** Soften all texture edges with feGaussianBlur. Use low opacity (0.3-0.6) for texture layers. Allow colors to bleed slightly beyond boundaries.

```xml
<!-- Watercolor-style fabric: soft opacity, blurred edges -->
<defs>
  <filter id="watercolor-edge">
    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5"/>
  </filter>
</defs>
<path d="M 20 10 C 22 30, 18 50, 20 80" fill="none"
      stroke="rgba(100,60,80,0.25)" stroke-width="6" filter="url(#watercolor-edge)"/>
<path d="M 40 10 C 38 30, 42 50, 40 80" fill="none"
      stroke="rgba(100,60,80,0.2)" stroke-width="4" filter="url(#watercolor-edge)"/>
```

## Practical Checklist

Follow this workflow when rendering any textured surface:

1. **Identify the material** — What is the surface? (fabric type, wood species, metal, stone, glass)
2. **Choose fold type(s)** — For fabric: select from the 7 fold types based on how the fabric is supported and where gravity acts
3. **Set stroke weight and opacity** — Use the Fabric Material Behavior Table to match the material's physical properties
4. **Apply base color** — Fill the shape with the material's base color (solid or gradient)
5. **Add shadow folds** — Layer fold shadow paths using `rgba(0,0,0,...)` at appropriate opacity
6. **Add highlight bands** — Place `rgba(255,255,255,...)` strokes on ridges and light-facing surfaces
7. **Apply material-specific texture** — Add grain (wood), noise (stone/concrete), pattern (weave), or filter (rust/patina)
8. **Match texture detail to style** — Use the Texture Adaptation table to avoid over-rendering or under-rendering
9. **Preview at final size** — Textures must read clearly at the intended display size; simplify if details become noise at small sizes
10. **Performance check** — Complex filters (especially high-octave feTurbulence) can be slow; keep `numOctaves` ≤ 5 and `baseFrequency` reasonable

## Performance Considerations

SVG filter primitives are powerful but computationally expensive. Understanding the cost model helps you make the right tradeoff between visual quality and render speed.

### Filter Primitive Cost Reference

| Primitive           | Relative Cost | Key Cost Driver                          |
|---------------------|---------------|------------------------------------------|
| `feFlood`           | Minimal       | Constant fill — negligible cost          |
| `feBlend`           | Low           | Per-pixel blend of two inputs            |
| `feColorMatrix`     | Low           | Per-pixel matrix multiply                |
| `feComponentTransfer` | Low         | Per-channel lookup table                 |
| `feComposite`       | Low           | Per-pixel composite of two inputs        |
| `feGaussianBlur`    | Medium        | Cost scales with `stdDeviation` squared  |
| `feTurbulence`      | High          | CPU-intensive Perlin noise per pixel     |
| `feDiffuseLighting` | High          | Per-pixel lighting with normal estimation |
| `feSpecularLighting`| High          | Per-pixel specular with normal estimation |
| `feDisplacementMap` | High          | Per-pixel lookup into displacement source |
| `feConvolveMatrix`  | Very High     | Cost scales with kernel size             |
| `feMorphology`      | High          | Cost scales with radius                  |

### Optimization Strategies

**1. Minimize filtered area**

Apply filters to the smallest element possible. A filter on a 50x50 rect is 16x cheaper than the same filter on a 200x200 rect (cost scales with pixel area).

```xml
<!-- BAD: filtering a large area -->
<rect x="0" y="0" width="500" height="500" fill="#888" filter="url(#texture)"/>

<!-- GOOD: filter only the focal element -->
<rect x="200" y="200" width="100" height="100" fill="#888" filter="url(#texture)"/>
```

**2. Reduce `numOctaves` for distant/background elements**

Each octave roughly doubles the computation of `feTurbulence`. Use 2-3 for backgrounds, reserve 4-6 for hero close-up elements.

```xml
<!-- Background texture: low detail (fast) -->
<feTurbulence baseFrequency="0.05" numOctaves="2"/>

<!-- Hero element texture: high detail (expensive but worth it) -->
<feTurbulence baseFrequency="0.05" numOctaves="5"/>
```

**3. Use patterns instead of filters for repeating textures**

SVG `<pattern>` tiles render once and are stamped efficiently. They are dramatically faster than generating texture procedurally via `feTurbulence` for every pixel.

```xml
<!-- FAST: pattern-based weave texture -->
<pattern id="weave" width="8" height="8" patternUnits="userSpaceOnUse">
  <rect width="4" height="4" fill="#B8A070"/>
  <rect x="4" y="4" width="4" height="4" fill="#B8A070"/>
</pattern>
<rect fill="url(#weave)" width="500" height="500"/>

<!-- SLOW: filter-based weave texture (avoid for large areas) -->
<filter id="weave-filter">
  <feTurbulence baseFrequency="0.5" numOctaves="3"/>
</filter>
<rect fill="#B8A070" filter="url(#weave-filter)" width="500" height="500"/>
```

**4. Reuse filter noise results**

Within a filter chain, generate turbulence once and reference the `result` in multiple primitives. Never call `feTurbulence` twice in the same filter.

```xml
<!-- GOOD: single noise generation, used twice -->
<filter id="efficient">
  <feTurbulence baseFrequency="0.05" numOctaves="3" result="noise"/>
  <feDiffuseLighting in="noise" surfaceScale="2" result="lit">
    <feDistantLight azimuth="225" elevation="50"/>
  </feDiffuseLighting>
  <feDisplacementMap in="SourceGraphic" in2="noise" scale="5"/>
</filter>
```

**5. Set explicit filter bounds**

By default, filters process 10% beyond the element boundaries. For elements where edge bleeding isn't needed, constrain the filter region.

```xml
<filter id="constrained" filterUnits="userSpaceOnUse"
        x="10" y="10" width="80" height="80">
  <!-- Filter only processes the specified 80x80 region -->
  <feTurbulence baseFrequency="0.1" numOctaves="3"/>
</filter>
```

**6. Cache complex textures as raster images**

For static textures that won't change, render them once to PNG using `preview_as_png`, then embed as `<image>`. This eliminates per-frame filter computation.

**7. Match detail level to display size**

High-frequency noise (`baseFrequency` > 0.3) becomes indistinguishable mush at small sizes. Use lower frequencies for small elements and reserve detail for large/zoomed views.

| Element Size | Max Useful `baseFrequency` | Max Useful `numOctaves` |
|-------------|---------------------------|------------------------|
| < 50px      | 0.1                       | 2                      |
| 50-200px    | 0.3                       | 3                      |
| 200-500px   | 0.5                       | 4                      |
| > 500px     | 0.8+                      | 5-6                    |

### When to Use Each Technique

| Scenario                    | Recommended Approach                    |
|-----------------------------|-----------------------------------------|
| Small/distant objects       | Flat fill or simple gradient            |
| Repeating geometric texture | `<pattern>` tile                        |
| Organic surface texture     | `feTurbulence` + `feDiffuseLighting`    |
| Surface distortion          | `feTurbulence` + `feDisplacementMap`    |
| Material with grain         | `<pattern>` + displacement filter       |
| Transparency/glass          | Semi-transparent fills + gradient overlay |
| Large background texture    | `<pattern>` (never filter)              |
| Hero/close-up element       | Full filter chain (worth the cost)      |
