---
name: svg-fundamentals
description: "Basic SVG drawing techniques including shapes, paths, and transforms. Use when creating any SVG artwork."
---

# SVG Fundamentals

## SVG Root Element

Every SVG drawing starts with the `<svg>` root element. Always set `xmlns`, `viewBox`, and optionally `width`/`height`.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <!-- drawing content here -->
</svg>
```

**Tips:**
- Use `viewBox` to define the coordinate system independently of display size
- The format is `viewBox="minX minY width height"`
- Omitting `width`/`height` lets the SVG scale to its container
- Always include the xmlns attribute for standalone SVG files

## Coordinate System

SVG uses a coordinate system where:
- The origin `(0, 0)` is at the **top-left** corner
- The **x-axis** increases to the right
- The **y-axis** increases downward
- Units are unitless by default (user units), mapped to the viewport via `viewBox`

```xml
<!-- A 400x300 canvas where (0,0) is top-left -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <!-- (0,0) is top-left, (400,300) is bottom-right -->
  <circle cx="200" cy="150" r="10" fill="red" />  <!-- center of canvas -->
</svg>
```

**Tips:**
- Remember y increases downward — this is opposite to standard math coordinates
- Use `viewBox="0 0 100 100"` for percentage-like positioning
- Negative viewBox values let you shift the visible area

## Basic Shapes

### Rectangle (`<rect>`)

```xml
<!-- Simple rectangle -->
<rect x="10" y="10" width="200" height="100" fill="#4A90D9" />

<!-- Rounded rectangle -->
<rect x="10" y="130" width="200" height="100" rx="15" ry="15"
      fill="#E8A838" stroke="#333" stroke-width="2" />

<!-- Square -->
<rect x="230" y="10" width="100" height="100" fill="#7BC67E" />
```

**Attributes:** `x`, `y` (top-left corner), `width`, `height`, `rx`, `ry` (corner radius)

**Tips:**
- Set `rx` only and `ry` defaults to match, giving uniform rounded corners
- Use `rx="50%"` with equal width/height to make a circle (but prefer `<circle>`)
- Rectangles are the most common building block for architectural elements

### Circle (`<circle>`)

```xml
<!-- Simple circle -->
<circle cx="100" cy="100" r="80" fill="#D94A4A" />

<!-- Circle with stroke only -->
<circle cx="300" cy="100" r="60" fill="none" stroke="#333" stroke-width="3" />

<!-- Semi-transparent circle -->
<circle cx="200" cy="200" r="50" fill="#4A90D9" fill-opacity="0.5" />
```

**Attributes:** `cx`, `cy` (center), `r` (radius)

**Tips:**
- Circles are great for suns, eyes, wheels, dots, and decorative elements
- Use `fill="none"` with stroke for ring/outline effects
- Layer multiple semi-transparent circles for bokeh or bubble effects

### Ellipse (`<ellipse>`)

```xml
<!-- Horizontal ellipse -->
<ellipse cx="200" cy="100" rx="150" ry="80" fill="#9B59B6" />

<!-- Vertical ellipse (for egg shapes) -->
<ellipse cx="200" cy="250" rx="60" ry="90" fill="#F5D76E" stroke="#C9A830" stroke-width="2" />
```

**Attributes:** `cx`, `cy` (center), `rx` (horizontal radius), `ry` (vertical radius)

**Tips:**
- Use ellipses for shadows on the ground (flat, wide ellipse with low opacity)
- Egg shapes use a slightly larger ry than rx
- Ellipses work well for cloud puffs and organic shapes

### Line (`<line>`)

```xml
<!-- Simple line -->
<line x1="10" y1="10" x2="200" y2="150" stroke="#333" stroke-width="2" />

<!-- Dashed line -->
<line x1="10" y1="50" x2="300" y2="50"
      stroke="#999" stroke-width="1" stroke-dasharray="8 4" />
```

**Attributes:** `x1`, `y1` (start), `x2`, `y2` (end)

**Tips:**
- Lines must have a `stroke` to be visible (they have no fill area)
- Use `stroke-dasharray` for dashed/dotted effects: `"5 5"` for dashes, `"2 2"` for dots
- Use `stroke-linecap="round"` for rounded line endpoints

### Polygon (`<polygon>`)

Closed shape defined by a series of points.

```xml
<!-- Triangle -->
<polygon points="200,10 250,190 160,210" fill="#E74C3C" />

<!-- Pentagon -->
<polygon points="200,10 295,90 260,200 140,200 105,90" fill="#3498DB" />

<!-- Star -->
<polygon points="200,10 230,80 305,80 245,130 265,205 200,160 135,205 155,130 95,80 170,80"
         fill="#F1C40F" stroke="#E67E22" stroke-width="2" />
```

**Tips:**
- Points are comma-separated x,y pairs, space-separated from each other
- The shape is automatically closed (last point connects to first)
- Stars are polygon points alternating between inner and outer radii
- Calculate regular polygon points using trigonometry: `x = cx + r*cos(angle)`, `y = cy + r*sin(angle)`

### Polyline (`<polyline>`)

Open series of connected lines (not automatically closed).

```xml
<!-- Mountain silhouette -->
<polyline points="0,300 100,100 150,200 250,50 350,180 400,120 500,300"
          fill="none" stroke="#2C3E50" stroke-width="3" stroke-linejoin="round" />

<!-- Zigzag pattern -->
<polyline points="10,100 40,20 70,100 100,20 130,100 160,20 190,100"
          fill="none" stroke="#E74C3C" stroke-width="2" />
```

**Tips:**
- Similar to polygon but does NOT auto-close
- Great for charts, mountain outlines, and decorative lines
- Use `stroke-linejoin="round"` for smooth corners

## The `<path>` Element

The path element is the most powerful SVG primitive. All shapes can be expressed as paths.

### Move and Line Commands

| Command | Meaning | Parameters |
|---------|---------|------------|
| `M` / `m` | Move to | `x y` |
| `L` / `l` | Line to | `x y` |
| `H` / `h` | Horizontal line to | `x` |
| `V` / `v` | Vertical line to | `y` |
| `Z` / `z` | Close path | — |

Uppercase = absolute coordinates, lowercase = relative coordinates.

```xml
<!-- Triangle using path -->
<path d="M 100 10 L 200 190 L 10 190 Z" fill="#3498DB" />

<!-- Rectangle using path -->
<path d="M 10 10 H 210 V 110 H 10 Z" fill="#E8A838" />

<!-- Arrow shape -->
<path d="M 10 60 H 120 V 30 L 180 75 L 120 120 V 90 H 10 Z" fill="#2ECC71" />

<!-- Using relative commands for a step pattern -->
<path d="M 10 100 h 40 v -20 h 40 v -20 h 40 v -20 h 40"
      fill="none" stroke="#333" stroke-width="2" />
```

**Tips:**
- Prefer relative commands (`l`, `h`, `v`) when drawing patterns that might be repositioned
- Use `Z` to close paths cleanly — it draws a line back to the last `M` point
- Spaces between numbers are optional when unambiguous: `M10 10L200 190` works
- Chain multiple subpaths with additional `M` commands within the same `d` attribute

## Transforms

Transforms modify the coordinate system of an element or group. They are applied via the `transform` attribute.

### translate(tx, ty)

Moves an element by (tx, ty) from its original position.

```xml
<rect width="50" height="50" fill="blue" />
<rect width="50" height="50" fill="red" transform="translate(100, 50)" />
```

### rotate(angle, cx, cy)

Rotates around point (cx, cy). If cx/cy are omitted, rotates around the origin (0,0).

```xml
<!-- Rotate 45° around center of rectangle -->
<rect x="100" y="100" width="80" height="40" fill="green"
      transform="rotate(45, 140, 120)" />

<!-- Fan of lines from a point -->
<g transform="translate(200, 200)">
  <line x2="100" stroke="#333" stroke-width="2" />
  <line x2="100" stroke="#333" stroke-width="2" transform="rotate(30)" />
  <line x2="100" stroke="#333" stroke-width="2" transform="rotate(60)" />
  <line x2="100" stroke="#333" stroke-width="2" transform="rotate(90)" />
</g>
```

### scale(sx, sy)

Scales by sx horizontally and sy vertically. If sy is omitted, uniform scale.

```xml
<!-- Double size -->
<circle cx="50" cy="50" r="20" fill="blue" transform="scale(2)" />
<!-- Note: this also scales the position! cx becomes 100, cy becomes 100 -->

<!-- Scale from center using translate+scale+translate -->
<circle cx="50" cy="50" r="20" fill="red"
        transform="translate(50,50) scale(2) translate(-50,-50)" />
```

### Combining Transforms

Transforms are applied right-to-left. Order matters!

```xml
<!-- First translate, then rotate (rotate happens in translated space) -->
<rect width="40" height="40" fill="purple"
      transform="translate(200, 100) rotate(45)" />

<!-- First rotate, then translate (different result!) -->
<rect width="40" height="40" fill="orange"
      transform="rotate(45) translate(200, 100)" />
```

**Tips:**
- Transform order matters — they compose right-to-left
- To rotate an element around its own center: `rotate(angle, cx, cy)`
- To scale from center: `translate(cx,cy) scale(s) translate(-cx,-cy)`
- Use `<g transform="...">` to transform groups of elements together

## Grouping and Reuse

### `<g>` — Group Element

Groups elements together. Transforms and styles on the group apply to all children.

```xml
<!-- A grouped tree: trunk + canopy -->
<g id="tree" transform="translate(100, 200)">
  <rect x="-10" y="0" width="20" height="60" fill="#8B4513" />
  <circle cx="0" cy="-20" r="40" fill="#228B22" />
</g>
```

### `<defs>` — Definitions

Elements inside `<defs>` are defined but not rendered until referenced.

```xml
<defs>
  <circle id="dot" r="5" fill="red" />
</defs>

<!-- Use the defined dot multiple times -->
<use href="#dot" x="50" y="50" />
<use href="#dot" x="100" y="80" />
<use href="#dot" x="150" y="50" />
```

### `<use>` — Reuse Elements

References a defined element by id. Can override position with `x`/`y` and add transforms.

```xml
<defs>
  <g id="flower">
    <circle cx="0" cy="0" r="8" fill="#E74C3C" />
    <circle cx="12" cy="0" r="6" fill="#FF69B4" />
    <circle cx="-12" cy="0" r="6" fill="#FF69B4" />
    <circle cx="0" cy="12" r="6" fill="#FF69B4" />
    <circle cx="0" cy="-12" r="6" fill="#FF69B4" />
  </g>
</defs>

<use href="#flower" x="100" y="100" />
<use href="#flower" x="200" y="150" transform="scale(1.5)" />
<use href="#flower" x="300" y="100" transform="rotate(45, 300, 100)" />
```

### `<symbol>` — Reusable Template

Like a group inside `<defs>`, but can define its own `viewBox`.

```xml
<defs>
  <symbol id="icon-star" viewBox="0 0 100 100">
    <polygon points="50,5 63,35 95,38 72,60 78,92 50,76 22,92 28,60 5,38 37,35"
             fill="currentColor" />
  </symbol>
</defs>

<!-- Render at different sizes -->
<use href="#icon-star" x="10" y="10" width="30" height="30" fill="gold" />
<use href="#icon-star" x="50" y="10" width="50" height="50" fill="orange" />
```

**Tips:**
- Use `<g>` for logical grouping and shared transforms
- Use `<defs>` + `<use>` for repeated elements (trees in a forest, stars in the sky)
- Use `<symbol>` when you need independent viewBox scaling
- Give meaningful `id` values to groups for layer management

## Stroke Properties

Control how outlines are drawn.

```xml
<!-- Various stroke styles -->
<line x1="10" y1="30" x2="290" y2="30"
      stroke="#333" stroke-width="4" stroke-linecap="round" />

<line x1="10" y1="60" x2="290" y2="60"
      stroke="#333" stroke-width="4" stroke-linecap="square" />

<polyline points="10,100 80,140 150,100 220,140 290,100"
          fill="none" stroke="#E74C3C" stroke-width="3"
          stroke-linejoin="round" stroke-linecap="round" />

<!-- Dashed stroke -->
<rect x="10" y="160" width="280" height="80"
      fill="none" stroke="#3498DB" stroke-width="2"
      stroke-dasharray="10 5 2 5" />
```

**Key properties:**
- `stroke` — color
- `stroke-width` — thickness
- `stroke-linecap` — `butt` (default), `round`, `square`
- `stroke-linejoin` — `miter` (default), `round`, `bevel`
- `stroke-dasharray` — dash pattern (dash length, gap length, ...)
- `stroke-opacity` — transparency of stroke (0–1)

## Text

```xml
<!-- Basic text -->
<text x="200" y="50" text-anchor="middle" font-family="Arial" font-size="24"
      fill="#333">Hello SVG</text>

<!-- Multi-line text using tspan -->
<text x="200" y="100" text-anchor="middle" font-family="serif" font-size="18" fill="#555">
  <tspan x="200" dy="0">First line</tspan>
  <tspan x="200" dy="24">Second line</tspan>
  <tspan x="200" dy="24">Third line</tspan>
</text>

<!-- Styled text -->
<text x="50" y="200" font-family="Georgia" font-size="36"
      fill="#2C3E50" font-weight="bold" font-style="italic"
      letter-spacing="3">Styled Text</text>
```

**Tips:**
- `text-anchor`: `start` (default), `middle`, `end` — controls horizontal alignment
- `dominant-baseline`: `auto`, `middle`, `hanging` — controls vertical alignment
- Use `<tspan>` with `dy` for multi-line text
- SVG text is not automatically wrapped — you must position each line manually

## Clipping and Masking

### Clip Path

Restricts visibility to a shape.

```xml
<defs>
  <clipPath id="circle-clip">
    <circle cx="150" cy="150" r="100" />
  </clipPath>
</defs>

<!-- Image or shape clipped to a circle -->
<rect x="0" y="0" width="300" height="300" fill="#3498DB"
      clip-path="url(#circle-clip)" />
```

### Mask

Uses grayscale luminance to control transparency.

```xml
<defs>
  <mask id="fade-mask">
    <rect width="300" height="300" fill="white" />
    <rect x="100" y="100" width="100" height="100" fill="black" />
  </mask>
</defs>

<!-- White areas of mask = visible, black areas = hidden -->
<rect width="300" height="300" fill="#E74C3C" mask="url(#fade-mask)" />
```

**Tips:**
- Clip paths use geometry only (sharp edges)
- Masks use luminance (allowing gradual fading with gradients)
- Both are defined in `<defs>` and referenced via `url(#id)`
