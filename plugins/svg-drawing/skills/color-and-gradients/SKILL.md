---
name: color-and-gradients
description: "Color theory, gradients, patterns, and opacity techniques for SVG artwork. Use when applying colors, creating gradients, or building visual depth."
---

# Color and Gradients

## Color Formats in SVG

SVG supports multiple color formats. Choose based on readability and the task at hand.

### Named Colors

SVG supports 147 named CSS colors. Most useful ones for artwork:

```xml
<!-- Nature palette -->
<rect x="10" y="10" width="50" height="50" fill="forestgreen" />
<rect x="70" y="10" width="50" height="50" fill="skyblue" />
<rect x="130" y="10" width="50" height="50" fill="sandybrown" />
<rect x="190" y="10" width="50" height="50" fill="coral" />
<rect x="250" y="10" width="50" height="50" fill="goldenrod" />
```

**Commonly used named colors:**
- Greens: `forestgreen`, `seagreen`, `limegreen`, `darkgreen`, `olivedrab`
- Blues: `skyblue`, `steelblue`, `royalblue`, `navy`, `dodgerblue`
- Reds: `crimson`, `firebrick`, `tomato`, `salmon`, `coral`
- Warm: `goldenrod`, `sandybrown`, `sienna`, `chocolate`, `peru`
- Neutral: `dimgray`, `slategray`, `whitesmoke`, `ivory`, `linen`

### Hexadecimal

6-digit or 3-digit shorthand. Most common for precise colors.

```xml
<circle cx="50" cy="50" r="30" fill="#E74C3C" />   <!-- Vibrant red -->
<circle cx="120" cy="50" r="30" fill="#3498DB" />   <!-- Clean blue -->
<circle cx="190" cy="50" r="30" fill="#2ECC71" />   <!-- Fresh green -->
<circle cx="260" cy="50" r="30" fill="#F39C12" />   <!-- Warm amber -->
<circle cx="330" cy="50" r="30" fill="#9B59B6" />   <!-- Rich purple -->

<!-- 3-digit shorthand: #RGB expands to #RRGGBB -->
<circle cx="50" cy="120" r="30" fill="#F00" />      <!-- #FF0000 = red -->
<circle cx="120" cy="120" r="30" fill="#0AF" />      <!-- #00AAFF = light blue -->
```

### RGB and RGBA

Useful for programmatic color generation and transparency.

```xml
<rect x="10" y="10" width="100" height="100" fill="rgb(41, 128, 185)" />
<rect x="60" y="60" width="100" height="100" fill="rgba(41, 128, 185, 0.5)" />
```

### HSL and HSLA

Hue-Saturation-Lightness — most intuitive for creating color relationships.

```xml
<!-- HSL: Hue (0-360°), Saturation (0-100%), Lightness (0-100%) -->
<rect x="10" y="10" width="80" height="80" fill="hsl(0, 70%, 50%)" />     <!-- Red -->
<rect x="100" y="10" width="80" height="80" fill="hsl(120, 70%, 50%)" />  <!-- Green -->
<rect x="190" y="10" width="80" height="80" fill="hsl(240, 70%, 50%)" />  <!-- Blue -->

<!-- Creating variations by adjusting lightness -->
<rect x="10" y="100" width="60" height="60" fill="hsl(210, 70%, 20%)" />  <!-- Dark blue -->
<rect x="80" y="100" width="60" height="60" fill="hsl(210, 70%, 40%)" />  <!-- Medium blue -->
<rect x="150" y="100" width="60" height="60" fill="hsl(210, 70%, 60%)" />  <!-- Light blue -->
<rect x="220" y="100" width="60" height="60" fill="hsl(210, 70%, 80%)" />  <!-- Lighter blue -->
```

**Tips:**
- HSL is ideal for creating color palettes: keep H constant, vary S and L
- Hue wheel: 0°=red, 60°=yellow, 120°=green, 180°=cyan, 240°=blue, 300°=magenta
- Desaturated colors (low S) feel more natural and less digital

## Color Theory for Palettes

### Complementary Colors

Colors opposite on the color wheel. High contrast, energetic.

```xml
<!-- Complementary pair: blue and orange -->
<defs>
  <rect id="swatch" width="80" height="60" rx="5" />
</defs>
<use href="#swatch" x="50" y="50" fill="hsl(210, 70%, 50%)" />   <!-- Blue -->
<use href="#swatch" x="150" y="50" fill="hsl(30, 70%, 50%)" />    <!-- Orange -->
```

**Complementary pairs for artwork:**
- Blue (#2980B9) + Orange (#E67E22) — ocean sunset
- Red (#C0392B) + Green (#27AE60) — holiday, nature contrast
- Purple (#8E44AD) + Yellow (#F1C40F) — royal, vibrant

### Analogous Colors

Three adjacent colors on the wheel. Harmonious, calming.

```xml
<!-- Analogous: blue-green family -->
<rect x="30" y="50" width="70" height="70" fill="hsl(180, 60%, 45%)" />   <!-- Cyan -->
<rect x="110" y="50" width="70" height="70" fill="hsl(200, 60%, 45%)" />  <!-- Blue-cyan -->
<rect x="190" y="50" width="70" height="70" fill="hsl(220, 60%, 45%)" />  <!-- Blue -->
```

**Analogous sets for artwork:**
- Sunset: hsl(0°), hsl(20°), hsl(40°) — red → orange → amber
- Forest: hsl(90°), hsl(120°), hsl(150°) — yellow-green → green → teal
- Ocean: hsl(190°), hsl(210°), hsl(230°) — cyan → blue → indigo

### Triadic Colors

Three colors equally spaced (120° apart). Balanced, vibrant.

```xml
<!-- Triadic: red, blue, yellow -->
<circle cx="100" cy="100" r="40" fill="hsl(0, 65%, 50%)" />    <!-- Red -->
<circle cx="200" cy="100" r="40" fill="hsl(120, 65%, 40%)" />  <!-- Green -->
<circle cx="300" cy="100" r="40" fill="hsl(240, 65%, 50%)" />  <!-- Blue -->
```

### Monochromatic

Single hue, varied lightness and saturation. Elegant, unified.

```xml
<!-- Monochromatic blue palette -->
<rect x="10" y="50" width="60" height="100" fill="hsl(210, 80%, 20%)" />  <!-- Darkest -->
<rect x="80" y="50" width="60" height="100" fill="hsl(210, 70%, 35%)" />
<rect x="150" y="50" width="60" height="100" fill="hsl(210, 60%, 50%)" />
<rect x="220" y="50" width="60" height="100" fill="hsl(210, 50%, 65%)" />
<rect x="290" y="50" width="60" height="100" fill="hsl(210, 40%, 80%)" />  <!-- Lightest -->
```

**Tips:**
- Use monochromatic palettes for backgrounds and subtle depth
- Limit your palette to 3-5 colors plus neutrals
- Choose one dominant color, one accent, and 1-2 supporting colors
- Dark colors recede (background), light/bright colors advance (foreground)

## Linear Gradients

### Basic Linear Gradient

```xml
<defs>
  <linearGradient id="sunset-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#FF6B35" />
    <stop offset="50%" stop-color="#D4145A" />
    <stop offset="100%" stop-color="#2E1065" />
  </linearGradient>
</defs>

<rect width="400" height="300" fill="url(#sunset-gradient)" />
```

### Gradient Direction

The `x1, y1, x2, y2` attributes control direction:

```xml
<defs>
  <!-- Top to bottom (default) -->
  <linearGradient id="grad-tb" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#3498DB" />
    <stop offset="100%" stop-color="#2C3E50" />
  </linearGradient>

  <!-- Left to right -->
  <linearGradient id="grad-lr" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#E74C3C" />
    <stop offset="100%" stop-color="#F39C12" />
  </linearGradient>

  <!-- Diagonal (top-left to bottom-right) -->
  <linearGradient id="grad-diag" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#8E44AD" />
    <stop offset="100%" stop-color="#3498DB" />
  </linearGradient>
</defs>

<rect x="10" y="10" width="120" height="80" fill="url(#grad-tb)" />
<rect x="140" y="10" width="120" height="80" fill="url(#grad-lr)" />
<rect x="270" y="10" width="120" height="80" fill="url(#grad-diag)" />
```

### Multi-Stop Gradient

```xml
<defs>
  <!-- Rainbow gradient -->
  <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#FF0000" />
    <stop offset="17%" stop-color="#FF8000" />
    <stop offset="33%" stop-color="#FFFF00" />
    <stop offset="50%" stop-color="#00FF00" />
    <stop offset="67%" stop-color="#0000FF" />
    <stop offset="83%" stop-color="#4B0082" />
    <stop offset="100%" stop-color="#8B00FF" />
  </linearGradient>

  <!-- Sky gradient with sharp horizon -->
  <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#1a1a2e" />
    <stop offset="30%" stop-color="#16213e" />
    <stop offset="60%" stop-color="#e94560" />
    <stop offset="75%" stop-color="#f5a623" />
    <stop offset="85%" stop-color="#f5d76e" />
    <stop offset="100%" stop-color="#ffeaa7" />
  </linearGradient>
</defs>
```

### spreadMethod

Controls what happens beyond gradient bounds:

```xml
<defs>
  <!-- pad (default): extends the end colors -->
  <linearGradient id="grad-pad" x1="30%" y1="0%" x2="70%" y2="0%" spreadMethod="pad">
    <stop offset="0%" stop-color="red" />
    <stop offset="100%" stop-color="blue" />
  </linearGradient>

  <!-- reflect: mirrors the gradient -->
  <linearGradient id="grad-reflect" x1="30%" y1="0%" x2="70%" y2="0%" spreadMethod="reflect">
    <stop offset="0%" stop-color="red" />
    <stop offset="100%" stop-color="blue" />
  </linearGradient>

  <!-- repeat: tiles the gradient -->
  <linearGradient id="grad-repeat" x1="30%" y1="0%" x2="70%" y2="0%" spreadMethod="repeat">
    <stop offset="0%" stop-color="red" />
    <stop offset="100%" stop-color="blue" />
  </linearGradient>
</defs>
```

## Radial Gradients

### Basic Radial Gradient

```xml
<defs>
  <radialGradient id="sphere-gradient">
    <stop offset="0%" stop-color="#FFFFFF" />
    <stop offset="50%" stop-color="#3498DB" />
    <stop offset="100%" stop-color="#1A5276" />
  </radialGradient>
</defs>

<circle cx="200" cy="200" r="100" fill="url(#sphere-gradient)" />
```

### Center and Focal Point

`cx, cy` — center of the gradient ellipse
`fx, fy` — focal point (where the inner color is brightest)
`r` — radius

```xml
<defs>
  <!-- Off-center focal point creates 3D sphere illusion -->
  <radialGradient id="sphere-3d" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
    <stop offset="0%" stop-color="white" />
    <stop offset="30%" stop-color="#5DADE2" />
    <stop offset="100%" stop-color="#154360" />
  </radialGradient>
</defs>

<circle cx="200" cy="200" r="80" fill="url(#sphere-3d)" />
```

### Radial Gradient for Lighting Effects

```xml
<defs>
  <!-- Spotlight effect -->
  <radialGradient id="spotlight" cx="50%" cy="30%" r="60%" fx="50%" fy="25%">
    <stop offset="0%" stop-color="rgba(255,255,200,0.8)" />
    <stop offset="40%" stop-color="rgba(255,255,200,0.2)" />
    <stop offset="100%" stop-color="rgba(0,0,0,0)" />
  </radialGradient>

  <!-- Warm glow (for lanterns, fire) -->
  <radialGradient id="warm-glow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#FFF3B0" />
    <stop offset="30%" stop-color="#FFD93D" />
    <stop offset="60%" stop-color="#FF8C00" stop-opacity="0.6" />
    <stop offset="100%" stop-color="#FF4500" stop-opacity="0" />
  </radialGradient>

  <!-- Vignette effect -->
  <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
    <stop offset="0%" stop-color="transparent" />
    <stop offset="70%" stop-color="transparent" />
    <stop offset="100%" stop-color="rgba(0,0,0,0.6)" />
  </radialGradient>
</defs>
```

## Patterns

### Basic Tiling Pattern

```xml
<defs>
  <!-- Polka dots -->
  <pattern id="polka-dots" x="0" y="0" width="30" height="30"
           patternUnits="userSpaceOnUse">
    <circle cx="15" cy="15" r="5" fill="#E74C3C" />
  </pattern>
</defs>

<rect width="400" height="300" fill="url(#polka-dots)" />
```

### patternUnits

- `userSpaceOnUse` — pattern dimensions in user coordinates (absolute size)
- `objectBoundingBox` — pattern dimensions relative to the filled element (0–1)

```xml
<defs>
  <!-- Stripes (absolute sizing) -->
  <pattern id="stripes" width="20" height="20" patternUnits="userSpaceOnUse">
    <rect width="10" height="20" fill="#3498DB" />
    <rect x="10" width="10" height="20" fill="#2980B9" />
  </pattern>

  <!-- Checkerboard -->
  <pattern id="checkerboard" width="40" height="40" patternUnits="userSpaceOnUse">
    <rect width="20" height="20" fill="#333" />
    <rect x="20" y="20" width="20" height="20" fill="#333" />
    <rect x="20" width="20" height="20" fill="#666" />
    <rect y="20" width="20" height="20" fill="#666" />
  </pattern>

  <!-- Diagonal lines -->
  <pattern id="diagonal-lines" width="10" height="10" patternUnits="userSpaceOnUse"
           patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="10" stroke="#999" stroke-width="2" />
  </pattern>
</defs>
```

### patternTransform

Rotate or scale the entire pattern:

```xml
<defs>
  <pattern id="rotated-grid" width="20" height="20" patternUnits="userSpaceOnUse"
           patternTransform="rotate(30)">
    <rect width="20" height="20" fill="white" />
    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ddd" stroke-width="1" />
  </pattern>
</defs>
```

### Natural Patterns

```xml
<defs>
  <!-- Grass-like texture -->
  <pattern id="grass" width="20" height="30" patternUnits="userSpaceOnUse">
    <rect width="20" height="30" fill="#4CAF50" />
    <path d="M 5 30 Q 5 15, 3 5" fill="none" stroke="#388E3C" stroke-width="1" />
    <path d="M 12 30 Q 13 18, 15 8" fill="none" stroke="#2E7D32" stroke-width="1" />
    <path d="M 18 30 Q 17 20, 19 10" fill="none" stroke="#43A047" stroke-width="1" />
  </pattern>

  <!-- Water ripple -->
  <pattern id="water" width="60" height="20" patternUnits="userSpaceOnUse">
    <rect width="60" height="20" fill="#2196F3" />
    <path d="M 0 10 Q 15 5, 30 10 T 60 10"
          fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
  </pattern>

  <!-- Brick wall -->
  <pattern id="brick" width="60" height="30" patternUnits="userSpaceOnUse">
    <rect width="60" height="30" fill="#8D6E63" />
    <rect x="1" y="1" width="28" height="13" rx="1" fill="#A1887F" />
    <rect x="31" y="1" width="28" height="13" rx="1" fill="#A1887F" />
    <rect x="16" y="16" width="28" height="13" rx="1" fill="#A1887F" />
    <rect x="-14" y="16" width="28" height="13" rx="1" fill="#A1887F" />
    <rect x="46" y="16" width="28" height="13" rx="1" fill="#A1887F" />
  </pattern>
</defs>
```

## Opacity and Blending

### Opacity Attributes

```xml
<!-- fill-opacity: only the fill is transparent -->
<rect x="10" y="10" width="100" height="100"
      fill="#E74C3C" fill-opacity="0.5" stroke="#333" stroke-width="2" />

<!-- stroke-opacity: only the stroke is transparent -->
<rect x="130" y="10" width="100" height="100"
      fill="#3498DB" stroke="#333" stroke-width="4" stroke-opacity="0.3" />

<!-- opacity: entire element (fill + stroke) is transparent -->
<rect x="250" y="10" width="100" height="100"
      fill="#2ECC71" stroke="#333" stroke-width="2" opacity="0.5" />
```

### Layered Transparency for Depth

```xml
<!-- Atmospheric depth: more transparent = farther away -->
<g id="mountains">
  <!-- Far mountains (most transparent, lightest) -->
  <path d="M 0 250 L 100 120 L 200 200 L 350 100 L 500 220 L 600 250"
        fill="#7FB3D8" opacity="0.4" />
  <!-- Mid mountains -->
  <path d="M 0 280 L 150 150 L 250 220 L 400 130 L 600 280"
        fill="#5B9BD5" opacity="0.6" />
  <!-- Near mountains (most opaque, darkest) -->
  <path d="M 0 300 L 200 180 L 350 250 L 500 160 L 600 300"
        fill="#2E75B6" opacity="0.85" />
</g>
```

### Using stop-opacity in Gradients

```xml
<defs>
  <!-- Fade to transparent -->
  <linearGradient id="fade-out" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#E74C3C" stop-opacity="1" />
    <stop offset="100%" stop-color="#E74C3C" stop-opacity="0" />
  </linearGradient>

  <!-- Fog / mist effect -->
  <linearGradient id="fog" x1="0%" y1="100%" x2="0%" y2="0%">
    <stop offset="0%" stop-color="white" stop-opacity="0.9" />
    <stop offset="50%" stop-color="white" stop-opacity="0.3" />
    <stop offset="100%" stop-color="white" stop-opacity="0" />
  </linearGradient>
</defs>

<!-- Apply fog over a scene -->
<rect width="800" height="400" fill="url(#fog)" />
```

## Complete Defs Examples

### Sky with Sun Scene

```xml
<defs>
  <!-- Sky gradient -->
  <linearGradient id="sky-bg" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#1e3c72" />
    <stop offset="60%" stop-color="#ff6f61" />
    <stop offset="80%" stop-color="#ffb347" />
    <stop offset="100%" stop-color="#ffe082" />
  </linearGradient>

  <!-- Sun glow -->
  <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#FFF9C4" />
    <stop offset="40%" stop-color="#FFD54F" />
    <stop offset="70%" stop-color="#FF8F00" stop-opacity="0.4" />
    <stop offset="100%" stop-color="#FF6F00" stop-opacity="0" />
  </radialGradient>

  <!-- Water reflection -->
  <linearGradient id="water-surface" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#ffb347" stop-opacity="0.6" />
    <stop offset="30%" stop-color="#4FC3F7" stop-opacity="0.5" />
    <stop offset="100%" stop-color="#0D47A1" stop-opacity="0.8" />
  </linearGradient>
</defs>

<!-- Sky -->
<rect width="800" height="400" fill="url(#sky-bg)" />
<!-- Sun -->
<circle cx="400" cy="280" r="120" fill="url(#sun-glow)" />
<circle cx="400" cy="280" r="40" fill="#FDD835" />
<!-- Water -->
<rect y="350" width="800" height="250" fill="url(#water-surface)" />
```

### Metallic Effect

```xml
<defs>
  <linearGradient id="chrome" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#f5f5f5" />
    <stop offset="25%" stop-color="#c0c0c0" />
    <stop offset="50%" stop-color="#f0f0f0" />
    <stop offset="75%" stop-color="#a0a0a0" />
    <stop offset="100%" stop-color="#d0d0d0" />
  </linearGradient>

  <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#F5E6A3" />
    <stop offset="25%" stop-color="#D4A017" />
    <stop offset="50%" stop-color="#F5E6A3" />
    <stop offset="75%" stop-color="#AA8500" />
    <stop offset="100%" stop-color="#D4A017" />
  </linearGradient>
</defs>

<rect x="50" y="50" width="200" height="60" rx="10" fill="url(#chrome)" stroke="#888" stroke-width="1" />
<rect x="50" y="130" width="200" height="60" rx="10" fill="url(#gold)" stroke="#8B7500" stroke-width="1" />
```

## Tips and Best Practices

1. **Limit your palette:** 3-5 colors plus shades. Too many colors look chaotic
2. **Use HSL for variations:** Keep hue constant, adjust saturation and lightness for harmony
3. **Gradients add realism:** Even subtle gradients (5% lightness difference) add depth
4. **Opacity for atmosphere:** Layer semi-transparent shapes for fog, depth, and soft shadows
5. **Name your gradients meaningfully:** `id="sky-gradient"` not `id="grad1"`
6. **Reuse defs:** Multiple elements can reference the same gradient/pattern
7. **stop-opacity vs element opacity:** `stop-opacity` affects individual gradient stops; `opacity` affects the whole element
8. **Test dark and light:** Ensure your colors work against both dark and light backgrounds
9. **Contrast matters:** Ensure sufficient contrast between foreground text/elements and backgrounds
10. **Color temperature:** Warm colors (red, orange, yellow) feel closer; cool colors (blue, green, purple) feel farther

## Mesh Gradient Simulation

SVG does not natively support mesh gradients, but you can approximate them by layering multiple overlapping radial gradients with varying centers, radii, and transparency. The overlapping regions blend visually to create rich, multi-directional color transitions.

### Basic Technique: Overlapping Radial Gradients

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <!-- Base gradient (covers entire area) -->
    <radialGradient id="mesh-base" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1a1a2e" />
      <stop offset="100%" stop-color="#16213e" />
    </radialGradient>

    <!-- Top-left warm spot -->
    <radialGradient id="mesh-warm" cx="25%" cy="25%" r="50%">
      <stop offset="0%" stop-color="#E74C3C" stop-opacity="0.8" />
      <stop offset="60%" stop-color="#E74C3C" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#E74C3C" stop-opacity="0" />
    </radialGradient>

    <!-- Bottom-right cool spot -->
    <radialGradient id="mesh-cool" cx="75%" cy="75%" r="50%">
      <stop offset="0%" stop-color="#3498DB" stop-opacity="0.7" />
      <stop offset="50%" stop-color="#3498DB" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#3498DB" stop-opacity="0" />
    </radialGradient>

    <!-- Center accent -->
    <radialGradient id="mesh-accent" cx="55%" cy="40%" r="35%">
      <stop offset="0%" stop-color="#F39C12" stop-opacity="0.6" />
      <stop offset="70%" stop-color="#F39C12" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#F39C12" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Stack the layers -->
  <rect width="400" height="400" fill="url(#mesh-base)" />
  <rect width="400" height="400" fill="url(#mesh-warm)" />
  <rect width="400" height="400" fill="url(#mesh-cool)" />
  <rect width="400" height="400" fill="url(#mesh-accent)" />
</svg>
```

### Realistic Mesh Gradient: Sunset Sky

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <!-- Deep sky base -->
    <linearGradient id="sky-base" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0c0c3a" />
      <stop offset="100%" stop-color="#1a1a4e" />
    </linearGradient>

    <!-- Warm horizon glow -->
    <radialGradient id="horizon-glow" cx="50%" cy="85%" r="60%">
      <stop offset="0%" stop-color="#FF6B35" stop-opacity="0.9" />
      <stop offset="40%" stop-color="#FF4500" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#FF4500" stop-opacity="0" />
    </radialGradient>

    <!-- Pink mid-sky -->
    <radialGradient id="pink-bloom" cx="40%" cy="60%" r="45%">
      <stop offset="0%" stop-color="#D4145A" stop-opacity="0.7" />
      <stop offset="60%" stop-color="#D4145A" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#D4145A" stop-opacity="0" />
    </radialGradient>

    <!-- Purple upper sky -->
    <radialGradient id="purple-haze" cx="65%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#6C3483" stop-opacity="0.6" />
      <stop offset="70%" stop-color="#6C3483" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#6C3483" stop-opacity="0" />
    </radialGradient>

    <!-- Golden sun center -->
    <radialGradient id="sun-center" cx="50%" cy="90%" r="25%">
      <stop offset="0%" stop-color="#FFF9C4" stop-opacity="0.95" />
      <stop offset="30%" stop-color="#FFD54F" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#FFD54F" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="800" height="600" fill="url(#sky-base)" />
  <rect width="800" height="600" fill="url(#horizon-glow)" />
  <rect width="800" height="600" fill="url(#pink-bloom)" />
  <rect width="800" height="600" fill="url(#purple-haze)" />
  <rect width="800" height="600" fill="url(#sun-center)" />
</svg>
```

### Tips for Mesh Gradient Simulation

- **Start with a solid or linear gradient base** that sets the overall tone
- **Layer 3-5 radial gradients** with different centers and colors
- **Use `stop-opacity: 0`** at the outer edge so gradients fade smoothly
- **Vary the radius** — smaller radii create focused color spots, larger ones create washes
- **Offset centers** — avoid centering everything; offset creates more organic transitions
- **Reduce overall opacity** on upper layers if colors are too intense

## SVG Filter Coloring

SVG filters provide powerful color manipulation capabilities. `feColorMatrix` is the workhorse for color grading, tone unification, and artistic effects.

### feColorMatrix for Tone Unification

`feColorMatrix` applies a 4×5 matrix to every pixel's RGBA values. This is the SVG equivalent of color grading in photo/video editing.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
  <defs>
    <!-- Warm sepia tone: shifts all colors toward warm amber -->
    <filter id="sepia">
      <feColorMatrix type="matrix"
        values="0.393 0.769 0.189 0 0
                0.349 0.686 0.168 0 0
                0.272 0.534 0.131 0 0
                0     0     0     1 0" />
    </filter>

    <!-- Cool blue tone: desaturate + blue shift -->
    <filter id="cool-tone">
      <feColorMatrix type="matrix"
        values="0.5  0.1  0.1  0  0
                0.1  0.5  0.2  0  0
                0.1  0.1  0.8  0  0.1
                0    0    0    1  0" />
    </filter>

    <!-- Desaturate (convert to grayscale) -->
    <filter id="grayscale">
      <feColorMatrix type="saturate" values="0" />
    </filter>

    <!-- Boost saturation (more vivid colors) -->
    <filter id="vivid">
      <feColorMatrix type="saturate" values="2.5" />
    </filter>

    <!-- Hue rotation (shift all hues by 90°) -->
    <filter id="hue-shift">
      <feColorMatrix type="hueRotate" values="90" />
    </filter>
  </defs>

  <!-- Original -->
  <g>
    <rect x="10" y="10" width="120" height="80" fill="#3498DB" />
    <rect x="10" y="50" width="120" height="80" fill="#E74C3C" />
    <text x="70" y="155" text-anchor="middle" font-size="12">Original</text>
  </g>

  <!-- With sepia filter -->
  <g filter="url(#sepia)" transform="translate(150, 0)">
    <rect x="10" y="10" width="120" height="80" fill="#3498DB" />
    <rect x="10" y="50" width="120" height="80" fill="#E74C3C" />
    <text x="70" y="155" text-anchor="middle" font-size="12">Sepia</text>
  </g>

  <!-- With cool tone filter -->
  <g filter="url(#cool-tone)" transform="translate(300, 0)">
    <rect x="10" y="10" width="120" height="80" fill="#3498DB" />
    <rect x="10" y="50" width="120" height="80" fill="#E74C3C" />
    <text x="70" y="155" text-anchor="middle" font-size="12">Cool</text>
  </g>
</svg>
```

### Color Grading Techniques

```xml
<defs>
  <!-- Golden hour: warm highlights, cool shadows -->
  <filter id="golden-hour">
    <feColorMatrix type="matrix"
      values="1.2  0.1  0    0  0.05
              0.1  1.0  0    0  0.02
              0    0    0.8  0  0
              0    0    0    1  0" />
  </filter>

  <!-- Moonlit night: blue shadows, desaturated -->
  <filter id="moonlight">
    <feColorMatrix type="matrix"
      values="0.4  0.1  0.1  0  0
              0.1  0.4  0.2  0  0
              0.15 0.15 0.6  0  0.1
              0    0    0    1  0" />
  </filter>

  <!-- High contrast dramatic -->
  <filter id="dramatic">
    <feColorMatrix type="matrix"
      values="1.5  -0.2  -0.2  0  -0.1
              -0.2  1.5  -0.2  0  -0.1
              -0.2  -0.2  1.5  0  -0.1
              0     0     0    1   0" />
  </filter>

  <!-- Vintage fade: reduced contrast + slight color cast -->
  <filter id="vintage">
    <feColorMatrix type="matrix"
      values="0.9  0.1  0.1  0  0.05
              0.1  0.8  0.1  0  0.05
              0.1  0.1  0.7  0  0.1
              0    0    0    1  0" />
  </filter>
</defs>

<!-- Apply to an entire scene for unified mood -->
<g filter="url(#golden-hour)">
  <!-- All scene elements go here; the filter unifies their colors -->
</g>
```

### Combining Filters for Complex Effects

```xml
<defs>
  <!-- Glow + color shift combo -->
  <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
    <!-- Blur for glow -->
    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blurred" />
    <!-- Brighten the blur -->
    <feColorMatrix in="blurred" type="matrix"
      values="2 0 0 0 0
              0 2 0 0 0
              0 0 2 0 0
              0 0 0 1 0" result="brightened" />
    <!-- Composite: original on top of glow -->
    <feComposite in="SourceGraphic" in2="brightened" operator="over" />
  </filter>
</defs>
```

**Tips:**
- Apply filters to `<g>` groups to color-grade entire scenes at once
- `type="saturate"` with values `0`–`1` desaturates, `>1` boosts
- `type="hueRotate"` accepts degrees (0–360) for color wheel rotation
- The 4×5 matrix gives complete control: rows are output R, G, B, A; columns are input R, G, B, A, and a constant offset
- Filters can be performance-heavy — use sparingly on complex scenes

## Advanced Patterns

### Complex Repeating Patterns

#### Plaid / Tartan

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <pattern id="plaid" width="80" height="80" patternUnits="userSpaceOnUse">
      <!-- Base color -->
      <rect width="80" height="80" fill="#2C3E50" />

      <!-- Horizontal stripes -->
      <rect y="0" width="80" height="10" fill="#E74C3C" opacity="0.5" />
      <rect y="15" width="80" height="4" fill="#F1C40F" opacity="0.4" />
      <rect y="35" width="80" height="10" fill="#E74C3C" opacity="0.5" />
      <rect y="50" width="80" height="4" fill="#F1C40F" opacity="0.4" />
      <rect y="65" width="80" height="8" fill="#2980B9" opacity="0.3" />

      <!-- Vertical stripes (overlapping creates crosshatch) -->
      <rect x="0" width="10" height="80" fill="#E74C3C" opacity="0.5" />
      <rect x="15" width="4" height="80" fill="#F1C40F" opacity="0.4" />
      <rect x="35" width="10" height="80" fill="#E74C3C" opacity="0.5" />
      <rect x="50" width="4" height="80" fill="#F1C40F" opacity="0.4" />
      <rect x="65" width="8" height="80" fill="#2980B9" opacity="0.3" />
    </pattern>
  </defs>

  <rect width="400" height="400" fill="url(#plaid)" />
</svg>
```

#### Polka Dots (Offset Rows)

```xml
<defs>
  <!-- Offset polka dots (like real fabric) -->
  <pattern id="polka-offset" width="40" height="36" patternUnits="userSpaceOnUse">
    <rect width="40" height="36" fill="#FDEBD0" />
    <!-- Row 1 dots -->
    <circle cx="10" cy="9" r="6" fill="#E74C3C" />
    <circle cx="30" cy="9" r="6" fill="#E74C3C" />
    <!-- Row 2 dots (offset by half the width) -->
    <circle cx="0" cy="27" r="6" fill="#E74C3C" />
    <circle cx="20" cy="27" r="6" fill="#E74C3C" />
    <circle cx="40" cy="27" r="6" fill="#E74C3C" />
  </pattern>

  <!-- Gradient polka dots -->
  <radialGradient id="dot-gradient">
    <stop offset="0%" stop-color="#FF69B4" />
    <stop offset="100%" stop-color="#C0392B" />
  </radialGradient>
  <pattern id="polka-fancy" width="50" height="50" patternUnits="userSpaceOnUse">
    <rect width="50" height="50" fill="#FFF5F5" />
    <circle cx="25" cy="25" r="10" fill="url(#dot-gradient)" />
  </pattern>
</defs>
```

#### Stripe Variants

```xml
<defs>
  <!-- Diagonal stripes -->
  <pattern id="diagonal-stripes" width="20" height="20" patternUnits="userSpaceOnUse"
           patternTransform="rotate(45)">
    <rect width="10" height="20" fill="#3498DB" />
    <rect x="10" width="10" height="20" fill="#2980B9" />
  </pattern>

  <!-- Pinstripes (thin lines on solid background) -->
  <pattern id="pinstripes" width="10" height="10" patternUnits="userSpaceOnUse">
    <rect width="10" height="10" fill="#2C3E50" />
    <line x1="5" y1="0" x2="5" y2="10" stroke="#34495E" stroke-width="0.5" />
  </pattern>

  <!-- Candy stripes (multi-color diagonal) -->
  <pattern id="candy-stripes" width="30" height="30" patternUnits="userSpaceOnUse"
           patternTransform="rotate(-45)">
    <rect width="30" height="30" fill="white" />
    <rect width="10" height="30" fill="#E74C3C" />
    <rect x="20" width="10" height="30" fill="#E74C3C" />
  </pattern>

  <!-- Herringbone -->
  <pattern id="herringbone" width="24" height="24" patternUnits="userSpaceOnUse">
    <rect width="24" height="24" fill="#D5C4A1" />
    <path d="M 0 12 L 6 0 L 12 12 L 6 24 Z" fill="#C4A882" />
    <path d="M 12 12 L 18 0 L 24 12 L 18 24 Z" fill="#B8976A" />
  </pattern>
</defs>
```

### `patternTransform` Rotation and Scaling

`patternTransform` applies transforms to the pattern tile itself, without affecting the element being filled.

```xml
<defs>
  <!-- Base pattern: simple grid -->
  <pattern id="grid-base" width="20" height="20" patternUnits="userSpaceOnUse">
    <rect width="20" height="20" fill="#ECF0F1" />
    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#BDC3C7" stroke-width="0.5" />
  </pattern>

  <!-- Same pattern rotated 45° (diamond grid) -->
  <pattern id="grid-rotated" width="20" height="20" patternUnits="userSpaceOnUse"
           patternTransform="rotate(45)">
    <rect width="20" height="20" fill="#ECF0F1" />
    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#BDC3C7" stroke-width="0.5" />
  </pattern>

  <!-- Scaled up pattern (larger tiles) -->
  <pattern id="grid-large" width="20" height="20" patternUnits="userSpaceOnUse"
           patternTransform="scale(2)">
    <rect width="20" height="20" fill="#ECF0F1" />
    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#BDC3C7" stroke-width="0.5" />
  </pattern>

  <!-- Combined rotation and scale -->
  <pattern id="grid-combo" width="20" height="20" patternUnits="userSpaceOnUse"
           patternTransform="rotate(30) scale(1.5)">
    <rect width="20" height="20" fill="#ECF0F1" />
    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#BDC3C7" stroke-width="0.5" />
  </pattern>
</defs>

<rect x="10" y="10" width="180" height="120" fill="url(#grid-base)" stroke="#999" />
<rect x="210" y="10" width="180" height="120" fill="url(#grid-rotated)" stroke="#999" />
<rect x="10" y="150" width="180" height="120" fill="url(#grid-large)" stroke="#999" />
<rect x="210" y="150" width="180" height="120" fill="url(#grid-combo)" stroke="#999" />
```

### Creating Seamless Complex Patterns

The key to seamless patterns is ensuring edges match. Elements that cross the tile boundary must appear on the opposite edge too.

```xml
<defs>
  <!-- Seamless flower pattern -->
  <pattern id="flowers" width="60" height="60" patternUnits="userSpaceOnUse">
    <rect width="60" height="60" fill="#F0E6D2" />
    <!-- Center flower -->
    <circle cx="30" cy="30" r="4" fill="#E74C3C" />
    <circle cx="30" cy="22" r="3" fill="#FF69B4" />
    <circle cx="30" cy="38" r="3" fill="#FF69B4" />
    <circle cx="22" cy="30" r="3" fill="#FF69B4" />
    <circle cx="38" cy="30" r="3" fill="#FF69B4" />
    <!-- Corner flowers (shared across 4 tiles — place at 0,0 and repeat at edges) -->
    <circle cx="0" cy="0" r="4" fill="#3498DB" />
    <circle cx="60" cy="0" r="4" fill="#3498DB" />
    <circle cx="0" cy="60" r="4" fill="#3498DB" />
    <circle cx="60" cy="60" r="4" fill="#3498DB" />
    <!-- Small leaves -->
    <ellipse cx="15" cy="15" rx="5" ry="2" fill="#27AE60" transform="rotate(45, 15, 15)" />
    <ellipse cx="45" cy="45" rx="5" ry="2" fill="#27AE60" transform="rotate(45, 45, 45)" />
  </pattern>
</defs>
```

**Tips for advanced patterns:**
- Use `patternTransform="rotate(N)"` for diagonal versions of any pattern
- Scale patterns with `patternTransform="scale(N)"` to adjust density
- Combine: `patternTransform="rotate(30) scale(0.8)"` for rotated and scaled
- Elements at tile edges must be duplicated at the opposite edge for seamlessness
- Layer multiple patterns by stacking filled rectangles with varying opacity
