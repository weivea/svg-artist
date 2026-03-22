---
name: composition
description: "Scene composition techniques: breaking down subjects into SVG primitives, layering, perspective, shadows, and light effects. Use when planning or building complex SVG artwork."
---

# Composition

## Breaking Down Subjects into SVG Primitives

The key to drawing complex subjects in SVG is decomposition: breaking a subject into basic shapes (circles, rectangles, ellipses, paths) and assembling them layer by layer.

### Methodology

1. **Identify the silhouette** — What is the overall outline shape?
2. **Find the major forms** — Break into 3-5 large geometric areas
3. **Add structural details** — Medium-sized features (limbs, windows, branches)
4. **Add fine details** — Small accents (eyes, door knobs, leaf veins)
5. **Apply color and shading** — Gradients, shadows, highlights

### Example: Cat

```xml
<g id="cat" transform="translate(200, 150)">
  <!-- Body: large ellipse -->
  <ellipse cx="0" cy="40" rx="60" ry="45" fill="#8B7355" />

  <!-- Head: circle -->
  <circle cx="0" cy="-20" r="35" fill="#A0896C" />

  <!-- Ears: triangles using polygon -->
  <polygon points="-25,-45 -15,-75 -5,-45" fill="#A0896C" />
  <polygon points="5,-45 15,-75 25,-45" fill="#A0896C" />
  <!-- Inner ears -->
  <polygon points="-22,-48 -15,-68 -8,-48" fill="#D4A0A0" />
  <polygon points="8,-48 15,-68 22,-48" fill="#D4A0A0" />

  <!-- Eyes: ellipses with pupils -->
  <ellipse cx="-12" cy="-25" rx="8" ry="9" fill="white" />
  <ellipse cx="12" cy="-25" rx="8" ry="9" fill="white" />
  <ellipse cx="-10" cy="-25" rx="4" ry="6" fill="#2C3E50" />
  <ellipse cx="14" cy="-25" rx="4" ry="6" fill="#2C3E50" />
  <!-- Eye highlights -->
  <circle cx="-8" cy="-27" r="2" fill="white" />
  <circle cx="16" cy="-27" r="2" fill="white" />

  <!-- Nose: small triangle -->
  <polygon points="0,-12 -4,-8 4,-8" fill="#D4A0A0" />

  <!-- Whiskers: lines -->
  <line x1="-5" y1="-8" x2="-40" y2="-15" stroke="#666" stroke-width="1" />
  <line x1="-5" y1="-6" x2="-40" y2="-6" stroke="#666" stroke-width="1" />
  <line x1="5" y1="-8" x2="40" y2="-15" stroke="#666" stroke-width="1" />
  <line x1="5" y1="-6" x2="40" y2="-6" stroke="#666" stroke-width="1" />

  <!-- Tail: curved path -->
  <path d="M 55 30 C 80 20, 90 -10, 70 -25" fill="none" stroke="#8B7355" stroke-width="8" stroke-linecap="round" />

  <!-- Paws: small ellipses -->
  <ellipse cx="-25" cy="80" rx="12" ry="8" fill="#A0896C" />
  <ellipse cx="25" cy="80" rx="12" ry="8" fill="#A0896C" />
</g>
```

### Example: Tree

```xml
<g id="tree" transform="translate(200, 300)">
  <!-- Trunk: tapered rectangle using path -->
  <path d="M -15 0 L -10 -100 L 10 -100 L 15 0 Z" fill="#5D4037" />

  <!-- Branches: lines from trunk -->
  <line x1="-5" y1="-60" x2="-40" y2="-90" stroke="#5D4037" stroke-width="5" stroke-linecap="round" />
  <line x1="5" y1="-75" x2="35" y2="-100" stroke="#5D4037" stroke-width="4" stroke-linecap="round" />

  <!-- Canopy: overlapping circles for organic shape -->
  <circle cx="-30" cy="-110" r="35" fill="#2E7D32" />
  <circle cx="10" cy="-130" r="45" fill="#388E3C" />
  <circle cx="35" cy="-105" r="30" fill="#2E7D32" />
  <circle cx="-10" cy="-90" r="30" fill="#43A047" />
  <circle cx="0" cy="-120" r="40" fill="#4CAF50" />

  <!-- Optional: shadow at base -->
  <ellipse cx="0" cy="5" rx="40" ry="8" fill="rgba(0,0,0,0.15)" />
</g>
```

### Example: House

```xml
<g id="house" transform="translate(200, 200)">
  <!-- Main wall -->
  <rect x="-60" y="-60" width="120" height="100" fill="#E8D5B7" stroke="#8B7355" stroke-width="2" />

  <!-- Roof: triangle -->
  <polygon points="-75,-60 0,-120 75,-60" fill="#C0392B" stroke="#922B21" stroke-width="2" />

  <!-- Door -->
  <rect x="-15" y="-10" width="30" height="50" rx="2" fill="#5D4037" />
  <circle cx="10" cy="15" r="2" fill="#F1C40F" />  <!-- Door knob -->

  <!-- Windows -->
  <rect x="-50" y="-45" width="25" height="25" rx="2" fill="#AED6F1" stroke="#5D6D7E" stroke-width="1" />
  <line x1="-37.5" y1="-45" x2="-37.5" y2="-20" stroke="#5D6D7E" stroke-width="1" />
  <line x1="-50" y1="-32.5" x2="-25" y2="-32.5" stroke="#5D6D7E" stroke-width="1" />

  <rect x="25" y="-45" width="25" height="25" rx="2" fill="#AED6F1" stroke="#5D6D7E" stroke-width="1" />
  <line x1="37.5" y1="-45" x2="37.5" y2="-20" stroke="#5D6D7E" stroke-width="1" />
  <line x1="25" y1="-32.5" x2="50" y2="-32.5" stroke="#5D6D7E" stroke-width="1" />

  <!-- Chimney -->
  <rect x="25" y="-110" width="20" height="40" fill="#7F8C8D" />
</g>
```

### Example: Simple Person

```xml
<g id="person" transform="translate(200, 250)">
  <!-- Head -->
  <circle cx="0" cy="-65" r="18" fill="#FDBCB4" />

  <!-- Body / torso -->
  <path d="M -15 -48 L -20 10 L 20 10 L 15 -48 Z" fill="#3498DB" />

  <!-- Arms -->
  <line x1="-15" y1="-40" x2="-40" y2="-10" stroke="#FDBCB4" stroke-width="6" stroke-linecap="round" />
  <line x1="15" y1="-40" x2="40" y2="-10" stroke="#FDBCB4" stroke-width="6" stroke-linecap="round" />

  <!-- Legs -->
  <line x1="-10" y1="10" x2="-15" y2="55" stroke="#2C3E50" stroke-width="7" stroke-linecap="round" />
  <line x1="10" y1="10" x2="15" y2="55" stroke="#2C3E50" stroke-width="7" stroke-linecap="round" />

  <!-- Eyes -->
  <circle cx="-6" cy="-68" r="2" fill="#2C3E50" />
  <circle cx="6" cy="-68" r="2" fill="#2C3E50" />

  <!-- Smile -->
  <path d="M -5 -60 Q 0 -55, 5 -60" fill="none" stroke="#2C3E50" stroke-width="1.5" />
</g>
```

## Foreground / Midground / Background Layering

SVG renders elements in document order — **earlier elements appear behind later elements**. Use this for depth layering.

### Three-Layer Scene Structure

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <!-- === BACKGROUND LAYER === -->
  <!-- Sky -->
  <rect width="800" height="600" fill="#87CEEB" />
  <!-- Sun -->
  <circle cx="650" cy="100" r="50" fill="#FDD835" />
  <!-- Distant mountains (smallest, lightest) -->
  <path d="M 0 350 L 150 200 L 300 320 L 500 180 L 700 300 L 800 350"
        fill="#B0C4DE" opacity="0.5" />

  <!-- === MIDGROUND LAYER === -->
  <!-- Rolling hills -->
  <path d="M 0 400 Q 200 300, 400 380 T 800 400 V 600 H 0 Z"
        fill="#6B8E23" opacity="0.7" />
  <!-- Trees at medium distance -->
  <g transform="translate(250, 340) scale(0.6)">
    <rect x="-5" y="0" width="10" height="40" fill="#5D4037" />
    <circle cx="0" cy="-15" r="25" fill="#388E3C" />
  </g>
  <g transform="translate(500, 350) scale(0.5)">
    <rect x="-5" y="0" width="10" height="40" fill="#5D4037" />
    <circle cx="0" cy="-15" r="25" fill="#2E7D32" />
  </g>

  <!-- === FOREGROUND LAYER === -->
  <!-- Ground -->
  <path d="M 0 450 Q 400 420, 800 450 V 600 H 0 Z" fill="#4CAF50" />
  <!-- Large foreground tree -->
  <g transform="translate(100, 450)">
    <rect x="-12" y="-80" width="24" height="80" fill="#4E342E" />
    <circle cx="0" cy="-110" r="50" fill="#2E7D32" />
    <circle cx="-30" cy="-90" r="35" fill="#388E3C" />
    <circle cx="30" cy="-90" r="35" fill="#388E3C" />
  </g>
  <!-- Flowers in foreground -->
  <circle cx="300" cy="480" r="5" fill="#E74C3C" />
  <circle cx="350" cy="490" r="4" fill="#F39C12" />
  <circle cx="380" cy="475" r="5" fill="#E74C3C" />
</svg>
```

### Layering Principles

1. **Background** — sky, distant elements, large fills (rendered first)
2. **Midground** — medium-distance objects, secondary elements
3. **Foreground** — closest objects, largest detail, overlapping background
4. **Overlay** — effects like fog, vignette, lighting (rendered last)

## Perspective and Depth

### Size Diminution

Farther objects are smaller. Use `scale()` or smaller dimensions.

```xml
<!-- Row of trees receding into distance -->
<g id="tree-row">
  <!-- Farthest (smallest) -->
  <g transform="translate(400, 200) scale(0.3)">
    <rect x="-5" y="0" width="10" height="40" fill="#5D4037" />
    <circle cy="-15" r="20" fill="#4CAF50" />
  </g>
  <!-- Middle -->
  <g transform="translate(350, 280) scale(0.6)">
    <rect x="-5" y="0" width="10" height="40" fill="#5D4037" />
    <circle cy="-15" r="20" fill="#43A047" />
  </g>
  <!-- Nearest (largest) -->
  <g transform="translate(280, 380) scale(1.0)">
    <rect x="-8" y="0" width="16" height="60" fill="#4E342E" />
    <circle cy="-20" r="30" fill="#388E3C" />
  </g>
</g>
```

### Color Fading (Atmospheric Perspective)

Distant objects appear:
- **Less saturated** (more gray)
- **Lighter** (higher lightness)
- **More blue-shifted** (atmospheric haze)

```xml
<!-- Mountains showing atmospheric perspective -->
<!-- Far: light, desaturated, blue-gray -->
<path d="M 0 300 L 200 150 L 400 280 L 600 170 L 800 300"
      fill="hsl(220, 15%, 75%)" />
<!-- Mid: medium saturation -->
<path d="M 0 350 L 250 200 L 500 320 L 700 220 L 800 350"
      fill="hsl(210, 30%, 55%)" />
<!-- Near: full color, dark -->
<path d="M 0 400 L 300 250 L 600 380 L 800 400"
      fill="hsl(200, 50%, 35%)" />
```

### Overlap

Elements that overlap others appear in front, reinforcing depth.

```xml
<!-- Overlapping circles showing depth -->
<circle cx="150" cy="200" r="80" fill="#3498DB" />  <!-- Behind -->
<circle cx="220" cy="180" r="80" fill="#E74C3C" />  <!-- Middle -->
<circle cx="290" cy="200" r="80" fill="#2ECC71" />  <!-- Front -->
```

### Vertical Position

In a scene, objects placed **lower on the canvas** appear closer (higher y values = foreground).

```xml
<!-- Bird placement showing depth via vertical position -->
<!-- Far birds: high on canvas, small -->
<text x="300" y="80" font-size="12">🐦</text>
<text x="350" y="95" font-size="14">🐦</text>
<!-- Near birds: lower on canvas, larger -->
<text x="200" y="200" font-size="24">🐦</text>
```

## Shadows

### Drop Shadow with Duplicated Shape

The simplest shadow technique: duplicate the shape, offset it, darken it, and lower opacity.

```xml
<!-- Circle with drop shadow -->
<g id="circle-with-shadow">
  <!-- Shadow (offset down-right, blurred edges via larger shape, low opacity) -->
  <circle cx="205" cy="205" r="52" fill="rgba(0,0,0,0.2)" />
  <!-- Main shape -->
  <circle cx="200" cy="200" r="50" fill="#3498DB" />
</g>

<!-- Rectangle with shadow -->
<g id="rect-with-shadow">
  <rect x="105" y="105" width="152" height="82" rx="5" fill="rgba(0,0,0,0.15)" />
  <rect x="100" y="100" width="150" height="80" rx="5" fill="#E74C3C" />
</g>
```

### Ground Shadow

Objects cast shadows on the ground. Use a flattened, skewed ellipse.

```xml
<g id="tree-with-shadow">
  <!-- Ground shadow: flat ellipse, offset, semi-transparent -->
  <ellipse cx="220" cy="400" rx="60" ry="12" fill="rgba(0,0,0,0.15)" />

  <!-- Tree trunk -->
  <rect x="190" y="320" width="20" height="80" fill="#5D4037" />
  <!-- Tree canopy -->
  <circle cx="200" cy="300" r="40" fill="#4CAF50" />
</g>
```

### Contact Shadow

A thin, dark shadow right where an object meets the ground.

```xml
<!-- Object sitting on surface with contact shadow -->
<g>
  <!-- Contact shadow: thin dark line at base -->
  <ellipse cx="200" cy="301" rx="45" ry="3" fill="rgba(0,0,0,0.3)" />
  <!-- Object -->
  <rect x="160" y="240" width="80" height="60" rx="5" fill="#9B59B6" />
</g>
```

### Long Cast Shadow (Stylized)

```xml
<!-- Flat design long shadow -->
<g>
  <!-- Long shadow polygon extending to bottom-right -->
  <polygon points="250,200 350,300 350,360 250,260"
           fill="rgba(0,0,0,0.1)" />
  <!-- Main shape -->
  <rect x="180" y="150" width="100" height="100" rx="10" fill="#2ECC71" />
</g>
```

## Light Effects

### Highlight with Gradient

```xml
<defs>
  <!-- 3D sphere lighting -->
  <radialGradient id="sphere-light" cx="35%" cy="35%" r="65%" fx="30%" fy="30%">
    <stop offset="0%" stop-color="white" stop-opacity="0.7" />
    <stop offset="40%" stop-color="#3498DB" />
    <stop offset="100%" stop-color="#1A5276" />
  </radialGradient>
</defs>

<circle cx="200" cy="200" r="80" fill="url(#sphere-light)" />
```

### Rim Lighting

A bright edge on one side of an object, suggesting backlighting.

```xml
<!-- Object with rim light on the right edge -->
<defs>
  <linearGradient id="rim-light" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#2C3E50" />
    <stop offset="85%" stop-color="#34495E" />
    <stop offset="100%" stop-color="#85C1E9" />
  </linearGradient>
</defs>

<circle cx="200" cy="200" r="60" fill="url(#rim-light)" />
```

### Glow Effect

```xml
<!-- Glowing orb -->
<defs>
  <radialGradient id="glow">
    <stop offset="0%" stop-color="#FFF9C4" />
    <stop offset="30%" stop-color="#FFD54F" stop-opacity="0.8" />
    <stop offset="60%" stop-color="#FFB300" stop-opacity="0.3" />
    <stop offset="100%" stop-color="#FF6F00" stop-opacity="0" />
  </radialGradient>
</defs>

<!-- Glow (large, transparent) -->
<circle cx="200" cy="200" r="120" fill="url(#glow)" />
<!-- Core (small, bright) -->
<circle cx="200" cy="200" r="20" fill="#FFF9C4" />
```

### Window Light

```xml
<!-- Light streaming from a window -->
<defs>
  <linearGradient id="window-beam" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="rgba(255,255,200,0.4)" />
    <stop offset="100%" stop-color="rgba(255,255,200,0)" />
  </linearGradient>
</defs>

<!-- Window -->
<rect x="100" y="100" width="60" height="80" fill="#FFF9C4" />
<!-- Light beam (trapezoid) -->
<polygon points="100,180 160,180 250,350 50,350" fill="url(#window-beam)" />
```

## Efficient Repetition

When creating scenes with repeated elements (forest, starfield, city skyline), use the `duplicate_layer` and `transform_layer` tools:

### Strategy for Repeated Elements

1. **Create a template** — Draw one instance as a layer (e.g., `layer-tree-template`)
2. **Duplicate** — Use `duplicate_layer` to create copies (e.g., `layer-tree-2`, `layer-tree-3`)
3. **Transform** — Use `transform_layer` to position, scale, and rotate each copy
4. **Vary** — Adjust colors or small details on each copy for natural variation

```
Example workflow:
1. add_layer("layer-tree-1", "<g>...</g>")           — draw first tree
2. duplicate_layer("layer-tree-1", "layer-tree-2")    — copy it
3. transform_layer("layer-tree-2", translate(200, 0) scale(0.8))  — reposition & shrink
4. duplicate_layer("layer-tree-1", "layer-tree-3")    — another copy
5. transform_layer("layer-tree-3", translate(400, 20) scale(0.6)) — even farther back
```

### Variation Techniques

- **Scale** — Vary size by ±10-30% for natural look
- **Rotation** — Small random rotations (±5-15°) prevent rigid appearance
- **Color shift** — Slightly different hue/lightness for each instance
- **Flip** — Use `scale(-1, 1)` to mirror some copies horizontally

## Scene Planning Methodology

### Step-by-Step Planning Process

1. **Understand the subject** — What is being drawn? What mood/time of day?
2. **Choose the viewBox** — Standard 800×600 for landscapes, 600×600 for portraits
3. **Plan the palette** — Select 3-5 colors using color theory (see color-and-gradients skill)
4. **Sketch the layers** — List layers from back to front:
   - `layer-sky` — gradient background
   - `layer-clouds` — atmospheric elements
   - `layer-mountains` — distant terrain
   - `layer-trees` — midground vegetation
   - `layer-ground` — foreground terrain
   - `layer-details` — flowers, rocks, etc.
   - `layer-effects` — lighting, fog, vignette
5. **Build bottom-up** — Start with background, work toward foreground
6. **Review and refine** — Use `preview_as_png` to check, adjust as needed

### Composition Rules

- **Rule of thirds** — Place key elements at 1/3 and 2/3 points (x: 267/533, y: 200/400 for 800×600)
- **Leading lines** — Use paths, rivers, or roads to guide the eye
- **Focal point** — One element should dominate; make it the most detailed/colorful
- **Balance** — Distribute visual weight; a large shape on one side needs something on the other
- **Negative space** — Don't fill every area; empty space provides breathing room
- **Odd numbers** — Groups of 3 or 5 objects look more natural than 2 or 4
