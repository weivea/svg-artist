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
