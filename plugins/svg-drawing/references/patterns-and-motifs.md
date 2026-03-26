# Patterns & Motifs

## 1. SVG Pattern Mechanics

### 1.1 The `<pattern>` Element
- Defined inside `<defs>`, referenced via `fill="url(#patternId)"`
- Key attributes: `id`, `width`, `height`, `patternUnits`, `patternContentUnits`, `patternTransform`

```xml
<defs>
  <pattern id="basic-dots" width="20" height="20" patternUnits="userSpaceOnUse">
    <circle cx="10" cy="10" r="3" fill="#333"/>
  </pattern>
</defs>
<rect width="400" height="300" fill="url(#basic-dots)"/>
```

### 1.2 `patternUnits`
- `userSpaceOnUse` — width/height in absolute SVG units (pixels). Pattern tile is fixed size regardless of the shape it fills. Best for textures and backgrounds.
- `objectBoundingBox` (default) — width/height as fractions (0-1) of the filled shape. `width="0.25"` = 4 repetitions across. Pattern scales with shape. Best for proportional patterns.

### 1.3 `patternContentUnits`
- `userSpaceOnUse` (default) — pattern content coordinates are absolute SVG units
- `objectBoundingBox` — content coordinates relative to the filled shape (0-1)

### 1.4 `patternTransform`
- Rotates, scales, or skews the pattern: `patternTransform="rotate(45)"`
- Common use: rotate a horizontal stripe pattern to create diagonal stripes
- Scale to adjust density: `patternTransform="scale(0.5)"` = double density

### 1.5 Pattern Sizing for Seamless Tiling
- Tile width/height must divide evenly into the overall space
- For userSpaceOnUse: elements at tile edges must continue seamlessly
- Element crossing left edge at x=3 must appear at x=width+3 too
- Same for top/bottom edges

## 2. Seamless Pattern Types

### 2.1 Block Repeat (Simple Grid)
- Pattern tile repeats in straight rows and columns
- Simplest to construct: just fill the tile, it repeats exactly

```xml
<!-- Simple block repeat: polka dots -->
<pattern id="polka" width="30" height="30" patternUnits="userSpaceOnUse">
  <circle cx="15" cy="15" r="5" fill="#E74C3C"/>
</pattern>
```

### 2.2 Half-Drop Repeat
- Even columns shifted down by 50% of tile height
- Creates more organic, less grid-like appearance
- SVG trick: make pattern tile 2x wide, with second column offset vertically

```xml
<pattern id="half-drop" width="40" height="40" patternUnits="userSpaceOnUse">
  <circle cx="10" cy="10" r="6" fill="#3498DB"/>
  <circle cx="30" cy="30" r="6" fill="#3498DB"/>
</pattern>
```

### 2.3 Brick Repeat (Half-Step)
- Even rows shifted right by 50% of tile width
- SVG: make tile 2x tall with second row offset horizontally

```xml
<pattern id="brick" width="60" height="30" patternUnits="userSpaceOnUse">
  <rect x="1" y="1" width="28" height="13" fill="#C0392B" rx="1"/>
  <rect x="31" y="1" width="28" height="13" fill="#C0392B" rx="1"/>
  <rect x="16" y="16" width="28" height="13" fill="#A93226" rx="1"/>
  <rect x="-14" y="16" width="28" height="13" fill="#A93226" rx="1"/>
  <rect x="46" y="16" width="28" height="13" fill="#A93226" rx="1"/>
</pattern>
```

### 2.4 Diamond / Diagonal Repeat
- Rotate a block repeat 45°: `patternTransform="rotate(45)"`
- Creates diamond grid alignment; useful for argyle, harlequin patterns

### 2.5 Hexagonal Repeat
- Tiles in honeycomb arrangement
- Complex tiling: use a rectangular tile containing hex offset logic
- Hex width = side x sqrt(3), height = side x 2

## 3. Geometric Patterns

### 3.1 Stripes
- Horizontal: `<rect>` elements stacked vertically
- Vertical: `<rect>` elements side by side
- Diagonal: horizontal pattern with `patternTransform="rotate(45)"`

```xml
<!-- Diagonal stripes -->
<pattern id="diagonal-stripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <rect width="5" height="10" fill="#2C3E50"/>
  <rect x="5" width="5" height="10" fill="#ECF0F1"/>
</pattern>
```

```xml
<!-- Pinstripe: thin lines on dark background -->
<pattern id="pinstripe" width="8" height="8" patternUnits="userSpaceOnUse">
  <rect width="8" height="8" fill="#1C2833"/>
  <line x1="4" y1="0" x2="4" y2="8" stroke="#AEB6BF" stroke-width="0.5" opacity="0.4"/>
</pattern>
```

### 3.2 Chevron / Zigzag
- V-shaped repeating pattern
- Tile height = chevron height, tile width = chevron width

```xml
<pattern id="chevron" width="40" height="20" patternUnits="userSpaceOnUse">
  <path d="M 0 20 L 20 10 L 40 20 L 40 15 L 20 5 L 0 15 Z" fill="#27AE60"/>
</pattern>
```

### 3.3 Herringbone
- Interlocking V patterns, alternating direction
- Construction: short diagonal rectangles alternating direction

```xml
<pattern id="herringbone" width="20" height="40" patternUnits="userSpaceOnUse">
  <path d="M 0 0 L 10 10 L 10 20 L 0 10 Z" fill="#795548"/>
  <path d="M 10 0 L 20 10 L 20 0 Z" fill="#795548"/>
  <path d="M 0 10 L 0 20 L 10 30 L 10 20 Z" fill="#8D6E63"/>
  <path d="M 10 20 L 20 10 L 20 20 L 10 30 Z" fill="#8D6E63"/>
  <path d="M 10 30 L 10 40 L 20 30 L 20 20 Z" fill="#795548"/>
  <path d="M 0 20 L 0 30 L 10 40 L 10 30 Z" fill="#795548"/>
</pattern>
```

### 3.4 Quatrefoil
- Four-lobed shape (4 overlapping circles), Gothic/Moorish motif

```xml
<pattern id="quatrefoil" width="40" height="40" patternUnits="userSpaceOnUse">
  <circle cx="20" cy="10" r="10" fill="none" stroke="#8E44AD" stroke-width="1.5"/>
  <circle cx="20" cy="30" r="10" fill="none" stroke="#8E44AD" stroke-width="1.5"/>
  <circle cx="10" cy="20" r="10" fill="none" stroke="#8E44AD" stroke-width="1.5"/>
  <circle cx="30" cy="20" r="10" fill="none" stroke="#8E44AD" stroke-width="1.5"/>
</pattern>
```

### 3.5 Greek Key (Meander)
- Continuous line forming rectangular spiral motifs
- Ancient Greek border/frame pattern

```xml
<pattern id="greek-key" width="40" height="20" patternUnits="userSpaceOnUse">
  <path d="M 0 0 L 0 20 L 40 20 L 40 10 L 10 10 L 10 5 L 30 5 L 30 15 L 35 15 L 35 0 Z"
        fill="none" stroke="#8B4513" stroke-width="2" stroke-linejoin="miter"/>
</pattern>
<!-- Use as border frame -->
<rect x="20" y="20" width="360" height="260" fill="none"
      stroke="url(#greek-key)" stroke-width="20"/>
```

### 3.6 Celtic Knot
- Interlocking loops that appear to weave over and under
- Over/under illusion: interrupt one strand where another crosses
- Construction: draw full loops, then use `<mask>` or `<clipPath>` to create weaving

```xml
<!-- Simple Celtic trefoil knot -->
<g fill="none" stroke="#2E7D32" stroke-width="4" stroke-linecap="round">
  <path d="M 50 20 C 50 -5, 80 -5, 80 20 C 80 35, 65 45, 65 45"/>
  <path d="M 50 20 C 35 30, 25 55, 45 60 C 55 63, 65 50, 65 45"/>
  <path d="M 80 20 C 95 30, 105 55, 85 60 C 75 63, 65 50, 65 45"/>
  <!-- Over/under crossing: white break -->
  <path d="M 62 42 L 68 48" stroke="white" stroke-width="8"/>
</g>
```

### 3.7 Checkerboard

```xml
<pattern id="checkerboard" width="20" height="20" patternUnits="userSpaceOnUse">
  <rect width="10" height="10" fill="#333"/>
  <rect x="10" y="10" width="10" height="10" fill="#333"/>
</pattern>
```

### 3.8 Houndstooth
- Broken check or abstract four-pointed star, classic textile pattern

```xml
<pattern id="houndstooth" width="20" height="20" patternUnits="userSpaceOnUse">
  <rect width="20" height="20" fill="#F5F5F5"/>
  <rect width="10" height="10" fill="#1A1A1A"/>
  <polygon points="10,0 20,10 10,10" fill="#1A1A1A"/>
  <polygon points="0,10 10,20 0,20" fill="#1A1A1A"/>
  <rect x="10" y="10" width="5" height="5" fill="#1A1A1A"/>
</pattern>
```

### 3.9 Trellis / Lattice
- Interlocking diamond or ogee frames, open-weave look

```xml
<pattern id="trellis" width="30" height="30" patternUnits="userSpaceOnUse">
  <path d="M 0 15 L 15 0 L 30 15 L 15 30 Z" fill="none" stroke="#6D4C41" stroke-width="2"/>
</pattern>
```

## 4. Organic Patterns

### 4.1 Floral
- Center circle + radiating petals (ellipses rotated at equal angles)
- 5-petal: rotate 72° each; 6-petal: 60°; 8-petal: 45°
- Connecting vines: curved `<path>` between flowers

```xml
<pattern id="floral" width="50" height="50" patternUnits="userSpaceOnUse">
  <g transform="translate(25,25)">
    <ellipse cx="0" cy="-8" rx="4" ry="8" fill="#E91E63" opacity="0.8" transform="rotate(0)"/>
    <ellipse cx="0" cy="-8" rx="4" ry="8" fill="#E91E63" opacity="0.8" transform="rotate(60)"/>
    <ellipse cx="0" cy="-8" rx="4" ry="8" fill="#E91E63" opacity="0.8" transform="rotate(120)"/>
    <ellipse cx="0" cy="-8" rx="4" ry="8" fill="#E91E63" opacity="0.8" transform="rotate(180)"/>
    <ellipse cx="0" cy="-8" rx="4" ry="8" fill="#E91E63" opacity="0.8" transform="rotate(240)"/>
    <ellipse cx="0" cy="-8" rx="4" ry="8" fill="#E91E63" opacity="0.8" transform="rotate(300)"/>
    <circle r="3" fill="#FFC107"/>
  </g>
</pattern>
```

### 4.2 Paisley
- Teardrop/comma shape with internal decoration
- Interior: concentric curves, small flower, dot clusters
- Often arranged in half-drop repeat

```xml
<g transform="translate(25, 40) rotate(-30)">
  <path d="M 0 0 C 15 -10, 15 -35, 0 -45 C -15 -35, -15 -10, 0 0 Z"
        fill="#1A237E" stroke="#FFD54F" stroke-width="1"/>
  <path d="M 0 -5 C 10 -12, 10 -30, 0 -38 C -10 -30, -10 -12, 0 -5 Z"
        fill="none" stroke="#FFD54F" stroke-width="0.5"/>
  <circle cx="0" cy="-22" r="1.5" fill="#FFD54F"/>
  <circle cx="-3" cy="-17" r="1" fill="#FFD54F"/>
  <circle cx="3" cy="-17" r="1" fill="#FFD54F"/>
</g>
```

### 4.3 Damask
- Symmetrical floral/scroll motif, bilaterally symmetric
- Construction: draw half, mirror with `<use transform="scale(-1,1)">`
- Dense, interlocking, formal appearance

```xml
<pattern id="damask" width="60" height="80" patternUnits="userSpaceOnUse">
  <rect width="60" height="80" fill="#1B2631"/>
  <g transform="translate(30, 40)">
    <g id="damask-half">
      <path d="M 0 -30 C 10 -28, 18 -18, 15 -5 C 12 8, 5 15, 0 20"
            fill="none" stroke="#D4AC0D" stroke-width="1.2"/>
      <path d="M 0 -20 C 6 -18, 10 -12, 8 -2"
            fill="none" stroke="#D4AC0D" stroke-width="0.8"/>
      <ellipse cx="12" cy="-12" rx="3" ry="5" fill="#D4AC0D" opacity="0.4"
               transform="rotate(30, 12, -12)"/>
    </g>
    <use href="#damask-half" transform="scale(-1, 1)"/>
  </g>
</pattern>
```

### 4.4 Vine Scroll / Arabesque
- Continuous spiraling vine with branching leaves and flowers
- Islamic/Moorish geometric arabesque: star and polygon tessellation

```xml
<pattern id="vine-scroll" width="80" height="40" patternUnits="userSpaceOnUse">
  <path d="M 0 20 C 20 5, 40 5, 40 20 C 40 35, 60 35, 80 20"
        fill="none" stroke="#2E7D32" stroke-width="2"/>
  <path d="M 20 12 C 18 5, 25 2, 28 8" fill="#4CAF50" stroke="none"/>
  <path d="M 60 28 C 58 35, 65 38, 68 32" fill="#4CAF50" stroke="none"/>
  <circle cx="40" cy="20" r="2.5" fill="#E91E63"/>
</pattern>
```

### 4.5 Leaf / Foliage
- Scattered leaves at random angles using `<use>` with different transforms
- Overlapping layers at different opacities for depth

```xml
<pattern id="leaves" width="60" height="60" patternUnits="userSpaceOnUse">
  <defs>
    <path id="leaf" d="M 0 0 C 5 -8, 12 -10, 15 -5 C 12 0, 5 2, 0 0 Z"/>
  </defs>
  <use href="#leaf" fill="#388E3C" transform="translate(10,15) rotate(20)"/>
  <use href="#leaf" fill="#4CAF50" transform="translate(35,8) rotate(-45) scale(1.2)"/>
  <use href="#leaf" fill="#2E7D32" transform="translate(45,40) rotate(60) scale(0.8)"/>
  <use href="#leaf" fill="#66BB6A" transform="translate(15,45) rotate(-15) scale(1.1)"/>
  <use href="#leaf" fill="#1B5E20" transform="translate(50,25) rotate(110) scale(0.9)"/>
</pattern>
```

## 5. Japanese / East Asian Patterns

### 5.1 Seigaiha (Wave)
- Concentric semicircular arcs in overlapping rows
- Each "wave" = 3-5 concentric arcs, stacked in brick-like offset

```xml
<pattern id="seigaiha" width="40" height="20" patternUnits="userSpaceOnUse">
  <path d="M 0 20 A 10 10 0 0 1 20 20" fill="none" stroke="#264E70" stroke-width="0.8"/>
  <path d="M 0 20 A 8 8 0 0 1 16 12.4" fill="none" stroke="#264E70" stroke-width="0.5"/>
  <path d="M 0 20 A 6 6 0 0 1 12 14" fill="none" stroke="#264E70" stroke-width="0.3"/>
  <path d="M 20 20 A 10 10 0 0 1 40 20" fill="none" stroke="#264E70" stroke-width="0.8"/>
  <path d="M 20 20 A 8 8 0 0 1 36 12.4" fill="none" stroke="#264E70" stroke-width="0.5"/>
  <path d="M 20 20 A 6 6 0 0 1 32 14" fill="none" stroke="#264E70" stroke-width="0.3"/>
</pattern>
```

### 5.2 Asanoha (Hemp Leaf)
- Six-pointed star geometric pattern
- Radiating triangles forming star shapes in hexagonal grid

```xml
<pattern id="asanoha" width="40" height="34.64" patternUnits="userSpaceOnUse">
  <g fill="none" stroke="#4A148C" stroke-width="0.8">
    <g transform="translate(20, 17.32)">
      <line x1="0" y1="0" x2="10" y2="0"/>
      <line x1="0" y1="0" x2="5" y2="8.66"/>
      <line x1="0" y1="0" x2="-5" y2="8.66"/>
      <line x1="0" y1="0" x2="-10" y2="0"/>
      <line x1="0" y1="0" x2="-5" y2="-8.66"/>
      <line x1="0" y1="0" x2="5" y2="-8.66"/>
    </g>
  </g>
</pattern>
```

### 5.3 Shippo (Seven Treasures)
- Interlocking circles creating vesica piscis (almond) shapes

```xml
<pattern id="shippo" width="30" height="30" patternUnits="userSpaceOnUse">
  <circle cx="0" cy="0" r="15" fill="none" stroke="#1B4F72" stroke-width="1"/>
  <circle cx="30" cy="0" r="15" fill="none" stroke="#1B4F72" stroke-width="1"/>
  <circle cx="0" cy="30" r="15" fill="none" stroke="#1B4F72" stroke-width="1"/>
  <circle cx="30" cy="30" r="15" fill="none" stroke="#1B4F72" stroke-width="1"/>
  <circle cx="15" cy="15" r="15" fill="none" stroke="#1B4F72" stroke-width="1"/>
</pattern>
```

### 5.4 Yagasuri (Arrow Feather)
- Chevron-like fletching pattern, traditional kimono pattern
- Alternating up/down arrows in columns

```xml
<pattern id="yagasuri" width="20" height="40" patternUnits="userSpaceOnUse">
  <path d="M 0 20 L 10 10 L 20 20" fill="none" stroke="#B71C1C" stroke-width="1.5"/>
  <path d="M 0 15 L 10 5 L 20 15" fill="none" stroke="#B71C1C" stroke-width="1"/>
  <path d="M 0 25 L 10 15 L 20 25" fill="none" stroke="#B71C1C" stroke-width="1"/>
  <path d="M 0 40 L 10 30 L 20 40" fill="none" stroke="#D32F2F" stroke-width="1.5"/>
  <path d="M 0 35 L 10 25 L 20 35" fill="none" stroke="#D32F2F" stroke-width="1"/>
</pattern>
```

### 5.5 Sashiko (Stitching)
- Geometric patterns rendered as dashed lines (emulating hand stitching)
- `stroke-dasharray="5 3"` for stitch-like appearance
- White stitching on indigo (#264E70) background

```xml
<pattern id="sashiko" width="20" height="20" patternUnits="userSpaceOnUse">
  <rect width="20" height="20" fill="#264E70"/>
  <line x1="0" y1="10" x2="20" y2="10"
        stroke="#F0F0F0" stroke-width="1" stroke-dasharray="5 3"/>
  <line x1="10" y1="0" x2="10" y2="20"
        stroke="#F0F0F0" stroke-width="1" stroke-dasharray="5 3"/>
  <line x1="0" y1="0" x2="20" y2="20"
        stroke="#F0F0F0" stroke-width="0.8" stroke-dasharray="4 4"/>
</pattern>
```

### 5.6 Kumiko (Woodwork)
- Intricate geometric patterns from thin wood strips
- Hexagonal and triangular arrangements, fine-line strokes

```xml
<pattern id="kumiko" width="34.64" height="40" patternUnits="userSpaceOnUse">
  <g fill="none" stroke="#8D6E63" stroke-width="0.8">
    <polygon points="17.32,0 34.64,10 34.64,30 17.32,40 0,30 0,10"/>
    <line x1="17.32" y1="0" x2="17.32" y2="40"/>
    <line x1="0" y1="10" x2="34.64" y2="30"/>
    <line x1="0" y1="30" x2="34.64" y2="10"/>
  </g>
</pattern>
```

## 6. Texture Patterns

### 6.1 Linen / Canvas
- Fine cross-hatch at perpendicular angles
- Very thin stroke (0.3-0.5px), low opacity (0.1-0.2)

```xml
<pattern id="linen" width="4" height="4" patternUnits="userSpaceOnUse">
  <line x1="0" y1="0" x2="0" y2="4" stroke="#8B7355" stroke-width="0.3" opacity="0.15"/>
  <line x1="0" y1="0" x2="4" y2="0" stroke="#8B7355" stroke-width="0.3" opacity="0.15"/>
</pattern>
```

### 6.2 Crosshatch Shading
- Hatching: parallel lines at one angle for light shadow
- Cross-hatching: two sets at different angles for deeper shadow
- 3 density levels: light (8px spacing), medium (4px), dense (2px)

```xml
<!-- Light hatching -->
<pattern id="hatch-light" width="8" height="8" patternUnits="userSpaceOnUse"
         patternTransform="rotate(45)">
  <line x1="0" y1="0" x2="0" y2="8" stroke="#000" stroke-width="0.5" opacity="0.3"/>
</pattern>

<!-- Medium cross-hatching -->
<pattern id="crosshatch-med" width="4" height="4" patternUnits="userSpaceOnUse">
  <line x1="0" y1="0" x2="4" y2="4" stroke="#000" stroke-width="0.4" opacity="0.4"/>
  <line x1="4" y1="0" x2="0" y2="4" stroke="#000" stroke-width="0.4" opacity="0.4"/>
</pattern>

<!-- Dense cross-hatching for deep shadow -->
<pattern id="crosshatch-dense" width="2" height="2" patternUnits="userSpaceOnUse">
  <line x1="0" y1="0" x2="2" y2="2" stroke="#000" stroke-width="0.5" opacity="0.6"/>
  <line x1="2" y1="0" x2="0" y2="2" stroke="#000" stroke-width="0.5" opacity="0.6"/>
</pattern>
```

### 6.3 Halftone
- Dots of varying size: small = light, large = dark
- CMYK halftone: 4 overlapping dot grids at different angles (C=15°, M=75°, Y=0°, K=45°)

```xml
<pattern id="halftone" width="10" height="10" patternUnits="userSpaceOnUse">
  <circle cx="5" cy="5" r="2.5" fill="#000"/>
</pattern>

<!-- CMYK-style: cyan channel at 15° -->
<pattern id="halftone-C" width="8" height="8" patternUnits="userSpaceOnUse"
         patternTransform="rotate(15)">
  <circle cx="4" cy="4" r="2" fill="cyan" opacity="0.6"/>
</pattern>
```

### 6.4 Noise / Grain
- Film-grain texture via `feTurbulence`
- Overlay at low opacity for subtle texture on flat fills

```xml
<defs>
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feBlend in="SourceGraphic" mode="multiply"/>
  </filter>
</defs>
<rect width="400" height="300" fill="#F5E6D3" filter="url(#grain)" opacity="0.15"/>
```

### 6.5 Stipple
- Random dots for value shading (pointillism)
- Dense dots = dark, sparse = light
- Uniform dot size for traditional stipple; variable for painterly

```xml
<pattern id="stipple" width="20" height="20" patternUnits="userSpaceOnUse">
  <circle cx="3" cy="7" r="0.6" fill="#333"/>
  <circle cx="8" cy="2" r="0.6" fill="#333"/>
  <circle cx="15" cy="5" r="0.6" fill="#333"/>
  <circle cx="11" cy="12" r="0.6" fill="#333"/>
  <circle cx="5" cy="16" r="0.6" fill="#333"/>
  <circle cx="17" cy="14" r="0.6" fill="#333"/>
  <circle cx="1" cy="11" r="0.6" fill="#333"/>
  <circle cx="13" cy="18" r="0.6" fill="#333"/>
</pattern>
```

### 6.6 Wood Grain
- Flowing parallel curves with varying spacing and thickness
- Color: warm browns (#8B6914, #A0522D, #D2691E)

```xml
<pattern id="wood-grain" width="100" height="10" patternUnits="userSpaceOnUse">
  <rect width="100" height="10" fill="#D2B48C"/>
  <path d="M 0 3 C 25 1, 50 5, 75 2 S 100 4, 100 3"
        fill="none" stroke="#A0522D" stroke-width="0.5" opacity="0.4"/>
  <path d="M 0 7 C 20 5, 60 9, 80 6 S 100 8, 100 7"
        fill="none" stroke="#8B6914" stroke-width="0.3" opacity="0.3"/>
</pattern>
```

### 6.7 Marble Veining
- Irregular meandering lines on a smooth base
- Low opacity for realism

```xml
<pattern id="marble" width="100" height="100" patternUnits="userSpaceOnUse">
  <rect width="100" height="100" fill="#F5F5F0"/>
  <path d="M 10 0 C 20 25, 35 30, 25 50 C 15 70, 30 85, 20 100"
        fill="none" stroke="#9E9E9E" stroke-width="0.8" opacity="0.3"/>
  <path d="M 60 0 C 55 20, 70 40, 65 60 C 60 80, 75 90, 70 100"
        fill="none" stroke="#BDBDBD" stroke-width="0.5" opacity="0.2"/>
  <path d="M 25 50 C 35 55, 45 48, 55 52"
        fill="none" stroke="#9E9E9E" stroke-width="0.4" opacity="0.2"/>
</pattern>
```

## 7. Pattern-as-Fill Techniques

### 7.1 Using Pattern for Shading
- Apply darker pattern fills in shadow areas using `<clipPath>`
- Hatching within shadow region creates form and depth

```xml
<defs>
  <clipPath id="shadow-clip">
    <ellipse cx="55" cy="55" rx="30" ry="35"/>
  </clipPath>
  <pattern id="shadow-hatch" width="4" height="4" patternUnits="userSpaceOnUse"
           patternTransform="rotate(-30)">
    <line x1="0" y1="0" x2="0" y2="4" stroke="#000" stroke-width="0.6"/>
  </pattern>
</defs>
<circle cx="50" cy="50" r="40" fill="#FFE082"/>
<ellipse cx="55" cy="55" rx="30" ry="35" fill="url(#shadow-hatch)" opacity="0.25"
         clip-path="url(#shadow-clip)"/>
```

### 7.2 Pattern + Gradient Combo
- Use gradient to define overall value structure
- Layer subtle pattern on top for texture

```xml
<defs>
  <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#87CEEB"/>
    <stop offset="100%" stop-color="#E0F7FA"/>
  </linearGradient>
  <pattern id="texture-overlay" width="3" height="3" patternUnits="userSpaceOnUse">
    <rect width="1" height="1" fill="#000" opacity="0.04"/>
    <rect x="2" y="2" width="1" height="1" fill="#FFF" opacity="0.04"/>
  </pattern>
</defs>
<rect width="400" height="300" fill="url(#sky-grad)"/>
<rect width="400" height="300" fill="url(#texture-overlay)"/>
```

### 7.3 Pattern Masking
- `<mask>` with gradient controls where pattern is visible
- Dense in foreground, fading out in background (atmospheric effect)

```xml
<defs>
  <pattern id="grass-pat" width="6" height="12" patternUnits="userSpaceOnUse">
    <path d="M 3 12 Q 2 6 3 0" fill="none" stroke="#2E7D32" stroke-width="1"/>
    <path d="M 5 12 Q 6 8 4 3" fill="none" stroke="#388E3C" stroke-width="0.8"/>
  </pattern>
  <mask id="fade-mask">
    <linearGradient id="fade-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black"/>
      <stop offset="40%" stop-color="black"/>
      <stop offset="100%" stop-color="white"/>
    </linearGradient>
    <rect width="400" height="300" fill="url(#fade-grad)"/>
  </mask>
</defs>
<rect width="400" height="300" fill="url(#grass-pat)" mask="url(#fade-mask)"/>
```

### 7.4 Nested Patterns
- Pattern within pattern: define one pattern, use it as fill inside another
- Creates complex textures with minimal code

```xml
<defs>
  <pattern id="inner-dots" width="4" height="4" patternUnits="userSpaceOnUse">
    <circle cx="2" cy="2" r="0.8" fill="#FFF" opacity="0.5"/>
  </pattern>
  <pattern id="dotted-stripes" width="20" height="20" patternUnits="userSpaceOnUse"
           patternTransform="rotate(45)">
    <rect width="10" height="20" fill="#2C3E50"/>
    <rect x="10" width="10" height="20" fill="url(#inner-dots)"/>
  </pattern>
</defs>
```

## 8. Pattern Design Guidelines

### 8.1 Scale & Density

| Context | Pattern Tile Size | Detail Level |
|---------|------------------|-------------|
| Background texture | 4-10px | Minimal, subtle |
| Fabric/material | 10-30px | Medium detail |
| Decorative border | 20-50px | Full detail |
| Feature pattern | 40-100px | High detail |

### 8.2 Positive:Negative Space Ratios
- Dense pattern: 1:1 (equal pattern and background) — bold, statement
- Balanced: 1:2 — comfortable, readable
- Airy: 1:3 — subtle, background-friendly
- Sparse: 1:4+ — minimal, texture only

### 8.3 Color in Patterns
- Monochrome: safest, always works
- Two-color: strong contrast, graphic feel
- Multi-color: use related hues, watch for vibration
- Low-contrast pattern + high-contrast focal point = good hierarchy

### 8.4 Common Pattern Pitfalls
- **Moire artifacts**: overlapping fine-line patterns at similar angles. Fix: ensure angle difference > 15 degrees
- **Visible seams**: elements don't match at tile boundaries. Fix: duplicate edge elements at opposite edge
- **Pattern overwhelm**: too dense or high-contrast patterns dominate. Fix: reduce opacity or increase tile spacing
- **Inconsistent stroke width**: pattern looks uneven when zoomed. Fix: use consistent stroke-width relative to tile size

### 8.5 Performance Considerations
- Small tiles repeat more but render faster
- Complex tiles (many elements per tile) slow down rendering
- Avoid `<filter>` inside patterns — apply filter to the filled shape instead
- `patternUnits="userSpaceOnUse"` is generally faster than `objectBoundingBox`
- Limit nested patterns to 2 levels deep to avoid rendering overhead
- For large fills, prefer simpler pattern tiles (< 10 elements per tile)

### 8.6 Accessibility
- Patterns alone should not convey meaning — always pair with color or labels
- High-frequency patterns (very small tiles) can cause visual discomfort
- Ensure sufficient contrast between pattern and background for readability
- Test patterns at multiple zoom levels for visual stability

## Related References
- `illustration-styles.md` — Style-specific pattern usage (ukiyo-e, engraving, watercolor paper)
- `texture-details.md` — Material textures implemented as patterns
- `materials-and-textures.md` — Material surface patterns (wood grain, marble, fabric weave)
- `svg-filters-and-effects.md` — feTurbulence-based procedural patterns
- `color-and-gradients.md` — Color theory and gradient foundations for pattern design
