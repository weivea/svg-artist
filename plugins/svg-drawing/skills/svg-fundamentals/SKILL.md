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

## SVG Animation

SVG supports two animation systems: SMIL (declarative, embedded in SVG) and CSS @keyframes (style-based). Both can create rich motion without JavaScript.

### SMIL Animation Elements

#### `<animate>` — Attribute Animation

Animates a single attribute over time.

```xml
<!-- Pulsing circle: radius grows and shrinks -->
<circle cx="200" cy="200" r="30" fill="#E74C3C">
  <animate attributeName="r" values="30;50;30" dur="2s" repeatCount="indefinite" />
</circle>

<!-- Color cycling -->
<rect x="100" y="100" width="200" height="100" fill="#3498DB">
  <animate attributeName="fill" values="#3498DB;#E74C3C;#2ECC71;#3498DB"
           dur="4s" repeatCount="indefinite" />
</rect>

<!-- Opacity fade in/out -->
<text x="200" y="150" text-anchor="middle" font-size="24" fill="#333">
  Fading Text
  <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite" />
</text>
```

**Key attributes:**
- `attributeName` — which attribute to animate
- `values` — semicolon-separated keyframe values
- `from` / `to` — simple start/end (alternative to `values`)
- `dur` — duration (e.g., `2s`, `500ms`)
- `repeatCount` — `indefinite` for looping, or a number
- `begin` — delay or event trigger (e.g., `2s`, `click`)
- `fill` — `freeze` to hold final value, `remove` to reset (default)

#### `<animateTransform>` — Transform Animation

Animates the `transform` attribute (rotate, scale, translate, skewX, skewY).

```xml
<!-- Continuous rotation (spinning wheel) -->
<g transform="translate(200, 200)">
  <rect x="-40" y="-5" width="80" height="10" fill="#E67E22">
    <animateTransform attributeName="transform" type="rotate"
                      from="0" to="360" dur="3s" repeatCount="indefinite" />
  </rect>
</g>

<!-- Bouncing scale (heartbeat effect) -->
<circle cx="200" cy="200" r="40" fill="#E74C3C">
  <animateTransform attributeName="transform" type="scale"
                    values="1;1.2;1;0.9;1" dur="1s" repeatCount="indefinite"
                    additive="sum" />
</circle>

<!-- Swinging pendulum -->
<g transform="translate(200, 50)">
  <line x1="0" y1="0" x2="0" y2="120" stroke="#333" stroke-width="2">
    <animateTransform attributeName="transform" type="rotate"
                      values="-30;30;-30" dur="2s" repeatCount="indefinite" />
  </line>
  <circle cx="0" cy="120" r="15" fill="#8E44AD">
    <animateTransform attributeName="transform" type="rotate"
                      values="-30;30;-30" dur="2s" repeatCount="indefinite" />
  </circle>
</g>
```

#### `<animateMotion>` — Path Following

Moves an element along a path.

```xml
<!-- Circle following a curved path -->
<path id="motionPath" d="M 50 200 C 100 50, 300 50, 350 200 S 550 350, 600 200"
      fill="none" stroke="#ccc" stroke-dasharray="5 5" />

<circle r="10" fill="#E74C3C">
  <animateMotion dur="4s" repeatCount="indefinite" rotate="auto">
    <mpath href="#motionPath" />
  </animateMotion>
</circle>

<!-- Arrow following a circular orbit -->
<path id="orbit" d="M 200 100 A 100 100 0 1 1 200 300 A 100 100 0 1 1 200 100 Z"
      fill="none" stroke="#ddd" stroke-width="1" />
<polygon points="0,-8 16,0 0,8" fill="#3498DB">
  <animateMotion dur="5s" repeatCount="indefinite" rotate="auto">
    <mpath href="#orbit" />
  </animateMotion>
</polygon>
```

**Tips for `<animateMotion>`:**
- `rotate="auto"` — element rotates to match path tangent direction
- `rotate="auto-reverse"` — same but flipped 180°
- `rotate="0"` — no rotation, element stays upright
- Use `keyPoints` and `keyTimes` for non-uniform speed along the path

### Stroke Draw/Undraw Animation

The most popular SVG animation pattern: revealing a path as if being drawn by a pen. Uses `stroke-dasharray` and `stroke-dashoffset`.

```xml
<!-- Hand-drawing effect: stroke draws itself -->
<path d="M 50 150 C 100 50, 200 50, 250 150 S 400 250, 450 150"
      fill="none" stroke="#2C3E50" stroke-width="3"
      stroke-dasharray="500" stroke-dashoffset="500">
  <animate attributeName="stroke-dashoffset" from="500" to="0"
           dur="2s" fill="freeze" />
</path>

<!-- Text outline draw effect -->
<text x="200" y="200" text-anchor="middle" font-size="72" font-family="Arial"
      font-weight="bold" fill="none" stroke="#E74C3C" stroke-width="2"
      stroke-dasharray="400" stroke-dashoffset="400">
  HELLO
  <animate attributeName="stroke-dashoffset" from="400" to="0"
           dur="3s" fill="freeze" />
</text>

<!-- Drawing then filling -->
<path d="M 100 250 L 200 50 L 300 250 Z"
      stroke="#3498DB" stroke-width="3" stroke-dasharray="600" stroke-dashoffset="600"
      fill="#3498DB" fill-opacity="0">
  <!-- Draw the outline -->
  <animate attributeName="stroke-dashoffset" from="600" to="0"
           dur="2s" fill="freeze" />
  <!-- Then fill in -->
  <animate attributeName="fill-opacity" from="0" to="0.8"
           dur="0.5s" begin="2s" fill="freeze" />
</path>
```

**How it works:**
1. Set `stroke-dasharray` to the total path length (or larger)
2. Set `stroke-dashoffset` to the same value (hides the entire stroke)
3. Animate `stroke-dashoffset` from the path length to `0` (reveals the stroke)

**Tip:** To find exact path length, you can estimate or use a value larger than needed — any value ≥ actual length works.

### CSS @keyframes in SVG

CSS animations work inside SVG via `<style>` elements. Useful for complex timing and easing.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <style>
    @keyframes pulse {
      0%, 100% { opacity: 0.3; r: 20; }
      50% { opacity: 1; r: 35; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .pulsing { animation: pulse 2s ease-in-out infinite; }
    .floating { animation: float 3s ease-in-out infinite; }
    .spinning {
      transform-origin: 300px 150px;
      animation: spin 4s linear infinite;
    }
  </style>

  <circle cx="100" cy="150" r="20" fill="#E74C3C" class="pulsing" />

  <g class="floating">
    <rect x="160" y="120" width="60" height="60" rx="10" fill="#3498DB" />
  </g>

  <rect x="280" y="130" width="40" height="40" fill="#2ECC71" class="spinning" />
</svg>
```

### Shape Morphing

Animate between two path shapes by interpolating the `d` attribute (paths must have the same number and type of commands).

```xml
<!-- Square morphing to circle and back -->
<path fill="#9B59B6">
  <animate attributeName="d" dur="3s" repeatCount="indefinite"
    values="M 150,100 L 250,100 L 250,200 L 150,200 Z;
            M 150,100 C 150,45 250,45 250,100 C 305,100 305,200 250,200 C 250,255 150,255 150,200 C 95,200 95,100 150,100 Z;
            M 150,100 L 250,100 L 250,200 L 150,200 Z" />
</path>

<!-- Star morphing to pentagon -->
<path fill="#F1C40F" stroke="#E67E22" stroke-width="2">
  <animate attributeName="d" dur="2s" repeatCount="indefinite"
    values="M 200,50 L 230,120 L 305,120 L 245,165 L 265,240 L 200,195 L 135,240 L 155,165 L 95,120 L 170,120 Z;
            M 200,50 L 255,105 L 280,175 L 230,230 L 170,230 L 120,175 L 145,105 L 200,50 L 200,50 L 200,50 Z;
            M 200,50 L 230,120 L 305,120 L 245,165 L 265,240 L 200,195 L 135,240 L 155,165 L 95,120 L 170,120 Z" />
</path>
```

**Important:** For morphing to work correctly, both path shapes must have the **same number of commands** and the **same command types** (e.g., both use `C` commands in the same positions). Restructure paths to match if needed.

## Advanced Text

### `<textPath>` — Text on a Path

Renders text along any SVG path, creating curved, circular, or wavy text.

```xml
<!-- Text on a curve -->
<defs>
  <path id="curve" d="M 50 200 C 100 50, 300 50, 350 200" fill="none" />
</defs>
<text font-family="Arial" font-size="18" fill="#2C3E50">
  <textPath href="#curve">Text flowing along a curve</textPath>
</text>

<!-- Circular text -->
<defs>
  <path id="circle-path" d="M 200 100 A 100 100 0 1 1 200 300 A 100 100 0 1 1 200 100" />
</defs>
<text font-family="Georgia" font-size="16" fill="#8E44AD">
  <textPath href="#circle-path">
    Text wrapping around a circle — adjust startOffset to position ★
  </textPath>
</text>

<!-- Text on a wavy path with startOffset -->
<defs>
  <path id="wave" d="M 0 150 Q 100 80, 200 150 T 400 150 T 600 150" fill="none" />
</defs>
<text font-family="sans-serif" font-size="20" fill="#E74C3C">
  <textPath href="#wave" startOffset="10%">Riding the wave ~</textPath>
</text>
```

**Key `<textPath>` attributes:**
- `href` — reference to the path element
- `startOffset` — where along the path to start (e.g., `50%` for centered)
- `method` — `align` (default) or `stretch` (stretches glyphs to fit)
- `spacing` — `auto` (default) or `exact`

### Decorative Text Effects

```xml
<!-- Outlined text (stroke only, no fill) -->
<text x="200" y="100" text-anchor="middle" font-family="Impact" font-size="60"
      fill="none" stroke="#2C3E50" stroke-width="2">OUTLINE</text>

<!-- Double stroke effect -->
<text x="200" y="180" text-anchor="middle" font-family="Arial Black" font-size="48"
      fill="#F1C40F" stroke="#E67E22" stroke-width="3" paint-order="stroke">BOLD</text>

<!-- Text with gradient fill -->
<defs>
  <linearGradient id="text-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#E74C3C" />
    <stop offset="50%" stop-color="#F39C12" />
    <stop offset="100%" stop-color="#3498DB" />
  </linearGradient>
</defs>
<text x="200" y="260" text-anchor="middle" font-family="Georgia" font-size="42"
      font-weight="bold" fill="url(#text-gradient)">Rainbow Text</text>

<!-- Shadow text using two layers -->
<text x="202" y="342" text-anchor="middle" font-family="Arial" font-size="36"
      fill="rgba(0,0,0,0.3)">Shadow Text</text>
<text x="200" y="340" text-anchor="middle" font-family="Arial" font-size="36"
      fill="#ECF0F1">Shadow Text</text>
```

### Letter Spacing and Kerning

```xml
<!-- Wide letter spacing for headings -->
<text x="200" y="60" text-anchor="middle" font-family="Arial" font-size="24"
      fill="#2C3E50" letter-spacing="8">SPACED OUT</text>

<!-- Tight letter spacing for compact labels -->
<text x="200" y="120" text-anchor="middle" font-family="Arial" font-size="18"
      fill="#7F8C8D" letter-spacing="-1">Tightly Packed Text</text>

<!-- Word spacing adjustment -->
<text x="200" y="180" text-anchor="middle" font-family="serif" font-size="20"
      fill="#333" word-spacing="12">Wide Word Spacing</text>

<!-- Per-character positioning with dx/dy -->
<text x="100" y="250" font-family="monospace" font-size="30" fill="#E74C3C">
  <tspan>D</tspan>
  <tspan dy="-5">r</tspan>
  <tspan dy="-5">o</tspan>
  <tspan dy="0">p</tspan>
  <tspan dy="5">p</tspan>
  <tspan dy="5">i</tspan>
  <tspan dy="0">n</tspan>
  <tspan dy="-5">g</tspan>
</text>

<!-- Vertical text -->
<text x="50" y="100" font-family="serif" font-size="24" fill="#8E44AD"
      writing-mode="tb" glyph-orientation-vertical="0">
  Vertical Text
</text>
```

**Tips:**
- `letter-spacing` accepts positive (wider) or negative (tighter) values
- `word-spacing` only affects spaces between words
- Use `dx` and `dy` on `<tspan>` for individual character offsets (great for decorative effects)
- `paint-order="stroke"` draws stroke behind fill, preventing stroke from overlapping the fill

## Responsive SVG

### Fluid Scaling with viewBox

The key to responsive SVG is using `viewBox` without fixed `width` and `height` attributes. This lets the SVG scale fluidly to fill its container.

```xml
<!-- Responsive: scales to container width, maintains aspect ratio -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#87CEEB" />
  <circle cx="400" cy="300" r="100" fill="#E74C3C" />
</svg>

<!-- Fixed size: always 800×600 pixels regardless of container -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#87CEEB" />
  <circle cx="400" cy="300" r="100" fill="#E74C3C" />
</svg>

<!-- Percentage-based sizing: fills 100% width, auto height -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%">
  <rect width="800" height="600" fill="#87CEEB" />
  <circle cx="400" cy="300" r="100" fill="#E74C3C" />
</svg>
```

**When to use what:**
- **No width/height** → SVG fills container, ideal for responsive web
- **Fixed width/height** → SVG is always that pixel size, good for icons/exports
- **Percentage width** → SVG fills percentage of container, height derived from viewBox ratio

### `preserveAspectRatio` Detailed Guide

Controls how the viewBox maps to the viewport when aspect ratios differ. Format: `preserveAspectRatio="<alignment> <meet|slice>"`

**Alignment values** (9 combinations of x and y):

| Value | X Position | Y Position |
|-------|-----------|------------|
| `xMinYMin` | Left | Top |
| `xMidYMin` | Center | Top |
| `xMaxYMin` | Right | Top |
| `xMinYMid` | Left | Middle |
| `xMidYMid` | Center | Middle (default) |
| `xMaxYMid` | Right | Middle |
| `xMinYMax` | Left | Bottom |
| `xMidYMax` | Center | Bottom |
| `xMaxYMax` | Right | Bottom |

**Meet vs Slice:**
- `meet` (default) — scales to fit entirely within viewport (letterboxing, like `contain` in CSS)
- `slice` — scales to cover entire viewport (cropping, like `cover` in CSS)

```xml
<!-- Default: centered, fit within viewport (letterboxed) -->
<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
  <!-- Content scales uniformly, centered, fully visible -->
</svg>

<!-- Cover viewport, crop overflow (like CSS background-size: cover) -->
<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
  <!-- Content scales to fill, centered, edges may be cropped -->
</svg>

<!-- Pin to top-left corner, fit within viewport -->
<svg viewBox="0 0 800 600" preserveAspectRatio="xMinYMin meet">
  <!-- Content anchored to top-left, empty space on right/bottom -->
</svg>

<!-- Pin to bottom-center, cover viewport -->
<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMax slice">
  <!-- Content anchored to bottom-center, top may be cropped -->
</svg>

<!-- Stretch to fill (no aspect ratio preservation) — USE SPARINGLY -->
<svg viewBox="0 0 800 600" preserveAspectRatio="none">
  <!-- Content stretches to fill viewport, aspect ratio NOT maintained -->
</svg>
```

**Common use cases:**
- `xMidYMid meet` — Default, best for most artwork (shows everything, centered)
- `xMidYMid slice` — Full-bleed backgrounds (fills area, crops edges)
- `xMinYMin meet` — UI elements anchored to top-left
- `xMidYMax meet` — Anchored to bottom-center (landscape with ground)
- `none` — Stretchy UI elements that should fill available space

### Media Queries Inside SVG

SVG supports CSS media queries for responsive behavior based on SVG viewport size.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <style>
    /* Default styles (large viewport) */
    .detail { opacity: 1; }
    .label { font-size: 14px; }
    .small-only { display: none; }

    /* When SVG viewport is narrow (< 400px wide) */
    @media (max-width: 400px) {
      .detail { opacity: 0; }  /* Hide fine details */
      .label { font-size: 20px; }  /* Larger text for readability */
      .small-only { display: block; }  /* Show mobile-only elements */
    }

    /* When SVG viewport is very small (< 200px) */
    @media (max-width: 200px) {
      .label { display: none; }  /* Hide all text at icon size */
    }
  </style>

  <!-- Always visible: main shape -->
  <circle cx="400" cy="300" r="150" fill="#3498DB" />

  <!-- Hidden at small sizes: decorative details -->
  <g class="detail">
    <circle cx="350" cy="260" r="20" fill="white" />
    <circle cx="450" cy="260" r="20" fill="white" />
    <path d="M 360 350 Q 400 390, 440 350" fill="none" stroke="white" stroke-width="4" />
  </g>

  <!-- Text that scales with viewport -->
  <text x="400" y="500" text-anchor="middle" fill="#2C3E50" class="label">
    Smiley Face
  </text>

  <!-- Only shown when small -->
  <text x="400" y="300" text-anchor="middle" font-size="80" class="small-only"
        fill="white">:)</text>
</svg>
```

**Tips:**
- Media queries in SVG respond to the **SVG element's viewport**, not the browser window
- Use media queries to progressively simplify artwork at smaller sizes
- Hide fine details, increase text sizes, and simplify shapes at small viewports
- `@media (prefers-color-scheme: dark)` also works for dark mode support inside SVG
