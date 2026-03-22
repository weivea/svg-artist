---
name: materials-and-textures
description: "Realistic material rendering using SVG filters, gradients, and patterns. Use when drawing objects that need convincing material qualities (metal, wood, water, glass, etc.)."
---

# Materials and Textures

## Metal

### Chrome / Silver

Use multi-stop linear gradient with sharp transitions for reflective surfaces:

```xml
<defs>
  <linearGradient id="chrome" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#f5f5f5" />
    <stop offset="20%" stop-color="#c0c0c0" />
    <stop offset="40%" stop-color="#f0f0f0" />
    <stop offset="60%" stop-color="#a0a0a0" />
    <stop offset="80%" stop-color="#d8d8d8" />
    <stop offset="100%" stop-color="#b0b0b0" />
  </linearGradient>
  <filter id="metal-shine">
    <feSpecularLighting in="SourceAlpha" specularExponent="40" specularConstant="0.8" surfaceScale="5" result="specular">
      <fePointLight x="200" y="50" z="300" />
    </feSpecularLighting>
    <feComposite in="specular" in2="SourceGraphic" operator="arithmetic" k1="0" k2="1" k3="0.6" k4="0" />
  </filter>
</defs>
<rect x="50" y="50" width="200" height="80" rx="10" fill="url(#chrome)" filter="url(#metal-shine)" />
```

### Gold

Warm-shifted multi-stop gradient with amber and brown tones:

```xml
<defs>
  <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#F5E6A3" />
    <stop offset="25%" stop-color="#D4A017" />
    <stop offset="50%" stop-color="#F5E6A3" />
    <stop offset="75%" stop-color="#AA8500" />
    <stop offset="100%" stop-color="#D4A017" />
  </linearGradient>
</defs>
<circle cx="200" cy="200" r="50" fill="url(#gold)" stroke="#8B6914" stroke-width="2" />
```

### Brushed Steel

Use feTurbulence with high frequency for directional grain:

```xml
<defs>
  <filter id="brushed-steel" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.01 0.5" numOctaves="2" result="grain" />
    <feColorMatrix in="grain" type="saturate" values="0" result="gray-grain" />
    <feBlend in="SourceGraphic" in2="gray-grain" mode="multiply" />
  </filter>
  <linearGradient id="steel-base" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#D0D0D0" />
    <stop offset="50%" stop-color="#B8B8B8" />
    <stop offset="100%" stop-color="#C8C8C8" />
  </linearGradient>
</defs>
<rect x="50" y="50" width="300" height="100" fill="url(#steel-base)" filter="url(#brushed-steel)" />
```

**Tuning:** Adjust `baseFrequency` — first value controls horizontal grain, second controls vertical. For horizontal brushing, use low first value (0.01) and high second (0.5).

## Glass / Crystal

### Transparent Glass

Layer multiple semi-transparent elements with highlight streaks:

```xml
<defs>
  <radialGradient id="glass-body" cx="40%" cy="35%" r="60%">
    <stop offset="0%" stop-color="rgba(200,230,255,0.3)" />
    <stop offset="100%" stop-color="rgba(100,150,200,0.15)" />
  </radialGradient>
  <linearGradient id="glass-highlight" x1="30%" y1="0%" x2="70%" y2="100%">
    <stop offset="0%" stop-color="rgba(255,255,255,0.8)" />
    <stop offset="30%" stop-color="rgba(255,255,255,0)" />
  </linearGradient>
  <filter id="glass-filter">
    <feSpecularLighting in="SourceAlpha" specularExponent="60" specularConstant="0.6" surfaceScale="3" result="specular">
      <fePointLight x="150" y="30" z="400" />
    </feSpecularLighting>
    <feComposite in="specular" in2="SourceAlpha" operator="in" result="spec-clip" />
    <feComponentTransfer in="spec-clip" result="dimmed">
      <feFuncA type="linear" slope="0.4" />
    </feComponentTransfer>
    <feBlend in="SourceGraphic" in2="dimmed" mode="screen" />
  </filter>
</defs>
<!-- Glass sphere -->
<circle cx="200" cy="200" r="60" fill="url(#glass-body)" stroke="rgba(180,210,240,0.5)" stroke-width="1" filter="url(#glass-filter)" />
<!-- Highlight streak -->
<ellipse cx="180" cy="175" rx="15" ry="30" fill="url(#glass-highlight)" transform="rotate(-20, 180, 175)" />
```

### Crystal Facets

Use polygon faces with varying brightness to simulate facets:

```xml
<g id="crystal">
  <polygon points="200,100 230,180 200,250 170,180" fill="hsl(200,60%,70%)" opacity="0.7" />
  <polygon points="200,100 240,150 230,180" fill="hsl(200,60%,80%)" opacity="0.8" />
  <polygon points="200,100 170,180 160,150" fill="hsl(200,60%,55%)" opacity="0.7" />
  <polygon points="200,250 230,180 240,210" fill="hsl(200,60%,45%)" opacity="0.7" />
  <!-- Bright edge highlight -->
  <line x1="200" y1="100" x2="230" y2="180" stroke="rgba(255,255,255,0.6)" stroke-width="1" />
</g>
```

## Wood

### Wood Grain with feTurbulence

```xml
<defs>
  <filter id="wood-grain">
    <!-- Directional turbulence for grain lines -->
    <feTurbulence type="fractalNoise" baseFrequency="0.02 0.2" numOctaves="4" seed="2" result="grain" />
    <!-- Warm wood toning -->
    <feColorMatrix in="grain" type="matrix" values="
      0.8 0.3 0   0 0.15
      0.5 0.2 0   0 0.08
      0.2 0.1 0   0 0.02
      0   0   0   1 0" result="wood-color" />
    <feBlend in="SourceGraphic" in2="wood-color" mode="multiply" />
  </filter>
  <linearGradient id="wood-base" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#C19A6B" />
    <stop offset="50%" stop-color="#D2B48C" />
    <stop offset="100%" stop-color="#B8860B" />
  </linearGradient>
</defs>
<rect x="50" y="50" width="300" height="200" fill="url(#wood-base)" filter="url(#wood-grain)" />
```

**Tuning:** `baseFrequency="0.02 0.2"` — low X frequency creates long horizontal grain. Increase X for shorter grain. Change `seed` for different patterns.

### Wood Knot

Add a circular radial gradient overlay at knot positions:

```xml
<defs>
  <radialGradient id="knot" cx="50%" cy="50%" r="40%">
    <stop offset="0%" stop-color="#6B4226" />
    <stop offset="40%" stop-color="#8B5A2B" />
    <stop offset="100%" stop-color="transparent" />
  </radialGradient>
</defs>
<circle cx="150" cy="120" r="25" fill="url(#knot)" />
```

## Water

### Still Water with Reflection

```xml
<defs>
  <linearGradient id="water-depth" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="rgba(100,180,255,0.4)" />
    <stop offset="50%" stop-color="rgba(30,100,200,0.6)" />
    <stop offset="100%" stop-color="rgba(10,40,100,0.8)" />
  </linearGradient>
  <filter id="water-ripple">
    <feTurbulence type="turbulence" baseFrequency="0.01 0.08" numOctaves="3" seed="5" result="ripple" />
    <feDisplacementMap in="SourceGraphic" in2="ripple" scale="8" xChannelSelector="R" yChannelSelector="G" />
  </filter>
</defs>
<!-- Water surface -->
<rect x="0" y="300" width="800" height="300" fill="url(#water-depth)" />
<!-- Reflection (flipped and filtered) -->
<g transform="translate(0, 600) scale(1, -1)" opacity="0.4" filter="url(#water-ripple)">
  <!-- Mirror of above-water content goes here -->
</g>
```

### Ripple Distortion

Use feDisplacementMap for realistic water distortion of reflections. Higher `scale` values = rougher water.

## Fabric / Cloth

### Drape Folds

Fabric follows gravity and tension points. Draw fold lines as curves from tension points.

```xml
<g id="fabric-drape">
  <!-- Base fabric shape -->
  <path d="M 100 100 Q 150 120, 200 100 Q 250 80, 300 100
           L 310 250 Q 250 260, 200 240 Q 150 260, 100 250 Z"
        fill="#8E44AD" />
  <!-- Fold shadow lines (gravity folds) -->
  <path d="M 130 110 Q 135 170, 125 240" fill="none" stroke="#6C3483" stroke-width="1.5" opacity="0.6" />
  <path d="M 200 95 Q 205 160, 200 235" fill="none" stroke="#6C3483" stroke-width="1.5" opacity="0.6" />
  <path d="M 270 105 Q 275 170, 280 240" fill="none" stroke="#6C3483" stroke-width="1.5" opacity="0.6" />
  <!-- Highlight between folds -->
  <path d="M 165 105 Q 168 165, 162 240" fill="none" stroke="#A569BD" stroke-width="1" opacity="0.4" />
</g>
```

### Pattern on Curved Surface

When fabric curves, the pattern compresses:

```xml
<defs>
  <pattern id="stripe-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
    <rect width="5" height="10" fill="#E74C3C" />
    <rect x="5" width="5" height="10" fill="white" />
  </pattern>
</defs>
<!-- Stripes on a curved surface — use patternTransform to skew at folds -->
<path d="M 100 150 Q 200 130, 300 150 L 300 250 Q 200 270, 100 250 Z"
      fill="url(#stripe-pattern)" />
```

## Stone / Rock

### Rough Stone Surface

```xml
<defs>
  <filter id="stone-texture">
    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="6" seed="3" result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="rough" />
    <feColorMatrix in="rough" type="matrix" values="
      0.6 0.15 0.05 0 0.1
      0.5 0.15 0.05 0 0.08
      0.4 0.12 0.05 0 0.06
      0   0    0    1 0" />
  </filter>
</defs>
<ellipse cx="200" cy="200" rx="80" ry="60" fill="#808080" filter="url(#stone-texture)" />
```

### Crack Lines

Add thin dark paths with irregular routes:

```xml
<path d="M 160 180 L 170 190 L 165 200 L 175 215 L 180 230"
      fill="none" stroke="#444" stroke-width="0.8" opacity="0.6" />
```

## Skin

### Subsurface Scattering Simulation

Skin has warm undertones. Use overlapping radial gradients with warm centers:

```xml
<defs>
  <radialGradient id="skin-base" cx="50%" cy="40%" r="55%" fx="45%" fy="35%">
    <stop offset="0%" stop-color="#FFE0D0" />
    <stop offset="60%" stop-color="#FDBCB4" />
    <stop offset="100%" stop-color="#D4937A" />
  </radialGradient>
  <!-- Blush zone -->
  <radialGradient id="blush" cx="50%" cy="50%" r="40%">
    <stop offset="0%" stop-color="rgba(255,120,120,0.25)" />
    <stop offset="100%" stop-color="transparent" />
  </radialGradient>
</defs>
<!-- Face -->
<circle cx="200" cy="200" r="50" fill="url(#skin-base)" />
<!-- Cheek blush -->
<circle cx="175" cy="215" r="18" fill="url(#blush)" />
<circle cx="225" cy="215" r="18" fill="url(#blush)" />
```

**Skin color ranges (hex):**
- Very light: #FFE8D6 → #FDD5B4
- Light: #FDBCB4 → #E8A088
- Medium: #D4937A → #C68642
- Dark: #8D5524 → #6B3A2A
- Very dark: #5C3018 → #3B1E0A

Always use warm undertones (bias toward orange/red) for lifelike skin.

## Fur / Hair

### Strand Groups

Don't draw individual hairs — draw groups of strands as flowing paths:

```xml
<g id="fur-texture">
  <!-- Each path is a strand group flowing in the same direction -->
  <path d="M 100 100 Q 105 80, 110 60 Q 115 50, 120 55" fill="none" stroke="#4A2C2A" stroke-width="3" stroke-linecap="round" />
  <path d="M 108 102 Q 113 78, 118 58 Q 122 48, 126 52" fill="none" stroke="#5C3D2E" stroke-width="2.5" stroke-linecap="round" />
  <path d="M 116 104 Q 120 82, 125 62 Q 128 52, 132 56" fill="none" stroke="#4A2C2A" stroke-width="3" stroke-linecap="round" />
  <!-- Highlight strands (lighter color) -->
  <path d="M 112 101 Q 117 79, 122 59" fill="none" stroke="#7B5B42" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
</g>
```

**Tips:**
- All strands flow in the same general direction
- Vary strand width slightly (2-4px)
- Add lighter strands for highlights on the side facing light
- Overlap strand groups for volume

## Brick / Concrete

### Brick Pattern

```xml
<defs>
  <pattern id="brick" width="62" height="32" patternUnits="userSpaceOnUse">
    <rect width="62" height="32" fill="#8D6E63" />
    <!-- Row 1 -->
    <rect x="1" y="1" width="28" height="14" rx="1" fill="#A1887F" />
    <rect x="32" y="1" width="28" height="14" rx="1" fill="#9C7B6E" />
    <!-- Row 2 (offset by half) -->
    <rect x="-14" y="17" width="28" height="14" rx="1" fill="#A1887F" />
    <rect x="17" y="17" width="28" height="14" rx="1" fill="#9C7B6E" />
    <rect x="48" y="17" width="28" height="14" rx="1" fill="#A1887F" />
  </pattern>
  <filter id="brick-roughness">
    <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" />
    <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
  </filter>
</defs>
<rect x="50" y="50" width="300" height="200" fill="url(#brick)" filter="url(#brick-roughness)" />
```

### Concrete

Plain gray with noise overlay for rough texture:

```xml
<defs>
  <filter id="concrete">
    <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="5" seed="7" result="noise" />
    <feColorMatrix in="noise" type="saturate" values="0" result="gray-noise" />
    <feBlend in="SourceGraphic" in2="gray-noise" mode="multiply" />
  </filter>
</defs>
<rect x="50" y="50" width="300" height="200" fill="#B0B0B0" filter="url(#concrete)" />
```

## Ice / Frost

### Ice Surface

Blue-shifted transparency with specular highlights:

```xml
<defs>
  <radialGradient id="ice-surface" cx="40%" cy="35%" r="65%">
    <stop offset="0%" stop-color="rgba(220,240,255,0.8)" />
    <stop offset="50%" stop-color="rgba(150,200,240,0.6)" />
    <stop offset="100%" stop-color="rgba(100,160,220,0.4)" />
  </radialGradient>
  <filter id="ice-shine">
    <feSpecularLighting in="SourceAlpha" specularExponent="80" specularConstant="1.2" surfaceScale="2" result="specular">
      <fePointLight x="200" y="50" z="400" />
    </feSpecularLighting>
    <feComposite in="specular" in2="SourceAlpha" operator="in" result="specClip" />
    <feComponentTransfer in="specClip" result="dimmed">
      <feFuncA type="linear" slope="0.5" />
    </feComponentTransfer>
    <feBlend in="SourceGraphic" in2="dimmed" mode="screen" />
  </filter>
</defs>
<circle cx="200" cy="200" r="60" fill="url(#ice-surface)" filter="url(#ice-shine)" stroke="rgba(180,220,255,0.6)" stroke-width="1" />
```

### Frost Crystals

Small crystalline shapes radiating from a point:

```xml
<g id="frost-crystal" transform="translate(200, 200)" opacity="0.7">
  <!-- 6-fold symmetry frost pattern -->
  <line x1="0" y1="0" x2="0" y2="-30" stroke="rgba(200,230,255,0.8)" stroke-width="1" />
  <line x1="0" y1="-15" x2="-8" y2="-22" stroke="rgba(200,230,255,0.6)" stroke-width="0.5" />
  <line x1="0" y1="-15" x2="8" y2="-22" stroke="rgba(200,230,255,0.6)" stroke-width="0.5" />
  <!-- Rotate 5 more times for 6-fold symmetry -->
  <use href="#frost-branch" transform="rotate(60)" />
  <use href="#frost-branch" transform="rotate(120)" />
  <use href="#frost-branch" transform="rotate(180)" />
  <use href="#frost-branch" transform="rotate(240)" />
  <use href="#frost-branch" transform="rotate(300)" />
</g>
```

## Material Selection Guide

| Material | Key Technique | Primary Tool |
|----------|--------------|--------------|
| Metal | Multi-stop gradient + specularLighting | linearGradient + filter |
| Glass | Low-opacity fills + specular highlight | radialGradient + filter |
| Wood | Directional feTurbulence + warm colorMatrix | filter |
| Water | Transparency gradient + displacementMap | gradient + filter |
| Fabric | Fold shadow curves + pattern | path + pattern |
| Stone | High-octave turbulence + displacement | filter |
| Skin | Warm radial gradients + blush overlays | radialGradient |
| Fur/Hair | Flowing strand group paths | path groups |
| Brick | Offset pattern + noise | pattern + filter |
| Ice | Blue-shifted transparency + high specular | gradient + filter |

**General tips:**
- Combine multiple techniques for realism (e.g., wood = turbulence grain + knot gradient + warm toning)
- Use the `apply_filter` MCP tool for quick preset filters
- Real materials are never perfectly uniform — always add some noise or variation
- Light direction should be consistent across all materials in a scene
