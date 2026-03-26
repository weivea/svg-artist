# Materials and Textures

## 1. Metal

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

### Copper

Warm orange-brown with green patina potential:

```xml
<defs>
  <linearGradient id="copper" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#E8A87C"/>
    <stop offset="25%" stop-color="#B87333"/>
    <stop offset="50%" stop-color="#DA8A67"/>
    <stop offset="75%" stop-color="#A0522D"/>
    <stop offset="100%" stop-color="#CD7F32"/>
  </linearGradient>
  <linearGradient id="copper-patina" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="rgba(75,150,130,0)" />
    <stop offset="40%" stop-color="rgba(75,150,130,0)" />
    <stop offset="100%" stop-color="rgba(75,150,130,0.6)" />
  </linearGradient>
</defs>
<!-- Base copper -->
<rect x="50" y="50" width="200" height="150" rx="5" fill="url(#copper)"/>
<!-- Patina accumulation (gravity-dependent, more at bottom) -->
<rect x="50" y="50" width="200" height="150" rx="5" fill="url(#copper-patina)"/>
```

### Bronze

Darker, more golden-brown than copper:

```xml
<defs>
  <linearGradient id="bronze" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#CD8032"/>
    <stop offset="30%" stop-color="#A06828"/>
    <stop offset="60%" stop-color="#C89048"/>
    <stop offset="100%" stop-color="#8B6020"/>
  </linearGradient>
  <filter id="bronze-texture">
    <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="4" seed="11"/>
    <feColorMatrix type="matrix" values="
      0.3 0.2 0.1 0 0
      0.2 0.15 0.08 0 0
      0.1 0.08 0.04 0 0
      0   0    0    1 0"/>
    <feBlend in="SourceGraphic" in2="" mode="multiply"/>
  </filter>
</defs>
<rect x="50" y="50" width="200" height="150" fill="url(#bronze)" filter="url(#bronze-texture)"/>
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

### Rusted Metal

Progressive corrosion with pit marks:

```xml
<defs>
  <filter id="rust" x="0" y="0" width="100%" height="100%">
    <!-- Coarse rust texture -->
    <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="5" seed="9" result="rust-noise"/>
    <!-- Color it rusty orange-brown -->
    <feColorMatrix in="rust-noise" type="matrix" values="
      1.2 0.5  0   0 0.1
      0.5 0.2  0   0 0.02
      0.1 0.05 0   0 0
      0   0    0   1 0" result="rust-color"/>
    <!-- Fine pitting -->
    <feTurbulence type="turbulence" baseFrequency="0.4" numOctaves="2" seed="15" result="pits"/>
    <feDisplacementMap in="rust-color" in2="pits" scale="3" xChannelSelector="R" yChannelSelector="G" result="pitted"/>
    <feBlend in="SourceGraphic" in2="pitted" mode="multiply"/>
  </filter>
  <linearGradient id="old-steel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#A0A0A0"/>
    <stop offset="100%" stop-color="#888888"/>
  </linearGradient>
</defs>
<!-- Base metal showing through -->
<rect x="50" y="50" width="200" height="150" fill="url(#old-steel)" filter="url(#rust)"/>
```

**Rust progression levels:**
- **Light surface rust**: Low turbulence opacity (0.3), original metal visible
- **Medium corrosion**: Medium opacity (0.5), color shift to orange-brown
- **Heavy rust**: Full opacity, displacement for pitting, flaking edges

## 2. Glass / Crystal

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

### Frosted Glass

```xml
<defs>
  <filter id="frosted-glass" x="-5%" y="-5%" width="110%" height="110%">
    <!-- Background blur (what's behind the glass) -->
    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blurred"/>
    <!-- Frost texture -->
    <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="3" result="frost"/>
    <feColorMatrix in="frost" type="saturate" values="0" result="frost-gray"/>
    <!-- Combine blur with frost texture -->
    <feBlend in="blurred" in2="frost-gray" mode="overlay" result="frosted"/>
    <!-- Lighten overall -->
    <feComponentTransfer in="frosted">
      <feFuncR type="linear" slope="0.8" intercept="0.2"/>
      <feFuncG type="linear" slope="0.8" intercept="0.2"/>
      <feFuncB type="linear" slope="0.8" intercept="0.2"/>
    </feComponentTransfer>
  </filter>
</defs>
<rect x="50" y="50" width="200" height="200" rx="10"
      fill="rgba(200,220,240,0.5)" filter="url(#frosted-glass)"
      stroke="rgba(180,200,220,0.6)" stroke-width="1"/>
```

### Stained Glass (Material)

When used as a material on objects (not the stained-glass illustration style):

```xml
<defs>
  <filter id="glass-color-depth">
    <!-- Inner glow effect for light-through-glass look -->
    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="inner-blur"/>
    <feComponentTransfer in="inner-blur" result="glow">
      <feFuncA type="linear" slope="0.5"/>
    </feComponentTransfer>
    <feFlood flood-color="currentColor" result="color"/>
    <feComposite in="color" in2="glow" operator="in" result="colored-glow"/>
    <feMerge>
      <feMergeNode in="colored-glow"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>
<!-- Colored glass panel -->
<rect x="50" y="50" width="100" height="150" fill="#C41E3A" opacity="0.7"
      filter="url(#glass-color-depth)" stroke="#333" stroke-width="3"/>
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

## 3. Wood

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

### Wood Type Color Palettes

| Wood | Base | Medium | Dark | Grain |
|------|------|--------|------|-------|
| **Oak** | `#D4B483` | `#C19A6B` | `#8B6914` | Wide, visible |
| **Pine** | `#F0D8A8` | `#DEC287` | `#B8860B` | Tight, light |
| **Walnut** | `#6B4226` | `#5C3317` | `#3B1E0A` | Dense, dark |
| **Cherry** | `#B5651D` | `#954535` | `#6B2F1D` | Fine, reddish |
| **Maple** | `#F5DEB3` | `#E8C98A` | `#C8A870` | Very fine, pale |
| **Ebony** | `#3C3024` | `#2C2018` | `#1A1410` | Nearly invisible |
| **Mahogany** | `#C04000` | `#8B3A2F` | `#6B2A20` | Interlocked |

### Plywood / End-Grain

```xml
<defs>
  <pattern id="plywood-rings" width="30" height="30" patternUnits="userSpaceOnUse">
    <!-- Concentric rings visible in cross-section -->
    <circle cx="15" cy="15" r="14" fill="none" stroke="#C19A6B" stroke-width="0.5"/>
    <circle cx="15" cy="15" r="11" fill="none" stroke="#B8860B" stroke-width="0.5"/>
    <circle cx="15" cy="15" r="8" fill="none" stroke="#C19A6B" stroke-width="0.5"/>
    <circle cx="15" cy="15" r="5" fill="none" stroke="#B8860B" stroke-width="0.5"/>
    <circle cx="15" cy="15" r="2" fill="#8B6914"/>
  </pattern>
</defs>
<rect x="50" y="50" width="200" height="200" fill="#D4B483"/>
<rect x="50" y="50" width="200" height="200" fill="url(#plywood-rings)" opacity="0.3"/>
```

## 4. Water

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

### Ocean Waves

```xml
<defs>
  <linearGradient id="ocean-deep" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1A5276"/>
    <stop offset="50%" stop-color="#154360"/>
    <stop offset="100%" stop-color="#0E2F44"/>
  </linearGradient>
  <filter id="ocean-surface">
    <!-- Large-scale wave motion -->
    <feTurbulence type="turbulence" baseFrequency="0.005 0.02" numOctaves="3" seed="42" result="waves"/>
    <feDisplacementMap in="SourceGraphic" in2="waves" scale="15" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>

<!-- Deep water base -->
<rect x="0" y="200" width="800" height="400" fill="url(#ocean-deep)"/>

<!-- Wave crests (white foam lines) -->
<g opacity="0.5" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round">
  <path d="M 0 250 Q 100 240, 200 250 Q 300 260, 400 250 Q 500 240, 600 250 Q 700 260, 800 250"/>
  <path d="M 0 310 Q 80 300, 160 310 Q 240 320, 320 310 Q 400 300, 480 310 Q 560 320, 640 310 Q 720 300, 800 310" opacity="0.3"/>
</g>

<!-- Specular highlights on water -->
<g opacity="0.15" fill="white">
  <ellipse cx="300" cy="260" rx="40" ry="3"/>
  <ellipse cx="500" cy="280" rx="30" ry="2"/>
  <ellipse cx="150" cy="300" rx="25" ry="2"/>
</g>
```

### Rain Drops on Surface

```xml
<defs>
  <radialGradient id="raindrop" cx="40%" cy="35%" r="60%">
    <stop offset="0%" stop-color="rgba(200,230,255,0.6)"/>
    <stop offset="70%" stop-color="rgba(150,200,240,0.3)"/>
    <stop offset="100%" stop-color="rgba(100,170,220,0.1)"/>
  </radialGradient>
  <!-- Ripple ring pattern -->
  <g id="ripple-ring">
    <circle r="8" fill="none" stroke="rgba(200,230,255,0.3)" stroke-width="0.5"/>
    <circle r="14" fill="none" stroke="rgba(200,230,255,0.15)" stroke-width="0.5"/>
    <circle r="20" fill="none" stroke="rgba(200,230,255,0.08)" stroke-width="0.5"/>
    <!-- Central drop highlight -->
    <circle r="2" fill="url(#raindrop)"/>
  </g>
</defs>
<!-- Scatter ripples across a wet surface -->
<use href="#ripple-ring" x="100" y="150"/>
<use href="#ripple-ring" x="250" y="120"/>
<use href="#ripple-ring" x="180" y="200"/>
<use href="#ripple-ring" x="350" y="170"/>
```

## 5. Fabric / Cloth

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

### Silk

Silk has smooth, flowing highlights with high sheen:

```xml
<defs>
  <linearGradient id="silk" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#C41E3A"/>
    <stop offset="20%" stop-color="#E8405F"/>
    <stop offset="40%" stop-color="#C41E3A"/>
    <stop offset="55%" stop-color="#F0607A"/>
    <stop offset="70%" stop-color="#C41E3A"/>
    <stop offset="85%" stop-color="#D83050"/>
    <stop offset="100%" stop-color="#A01830"/>
  </linearGradient>
  <filter id="silk-sheen">
    <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
  </filter>
</defs>
<path d="M 50 50 Q 150 30, 250 50 Q 350 70, 350 200 Q 250 220, 150 200 Q 50 180, 50 50 Z"
      fill="url(#silk)" filter="url(#silk-sheen)"/>
```

**Key silk properties:** Many closely-spaced gradient stops create the characteristic shimmer. Silk folds are smooth, flowing curves — never sharp creases.

### Denim

Stiff fabric with visible weave texture:

```xml
<defs>
  <pattern id="denim-weave" width="4" height="4" patternUnits="userSpaceOnUse">
    <!-- Twill weave pattern -->
    <rect width="4" height="4" fill="#3B5998"/>
    <rect x="0" y="0" width="2" height="1" fill="#4A6CAD"/>
    <rect x="2" y="1" width="2" height="1" fill="#4A6CAD"/>
    <rect x="0" y="2" width="2" height="1" fill="#4A6CAD"/>
    <rect x="2" y="3" width="2" height="1" fill="#4A6CAD"/>
  </pattern>
  <filter id="denim-noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="5"/>
    <feColorMatrix type="saturate" values="0"/>
    <feBlend in="SourceGraphic" mode="multiply"/>
  </filter>
</defs>
<rect x="50" y="50" width="200" height="200" fill="url(#denim-weave)" filter="url(#denim-noise)"/>
```

**Denim fold characteristics:** Angular, stiff folds. Denim resists draping — creases are sharp, not flowing. Fade/wear at stress points (knees, pockets) shows lighter color.

### Velvet

Rich, deep color with light-angle-dependent appearance:

```xml
<defs>
  <radialGradient id="velvet" cx="50%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#4A0E4E"/>
    <stop offset="40%" stop-color="#2D0A30"/>
    <stop offset="100%" stop-color="#1A0520"/>
  </radialGradient>
  <filter id="velvet-nap">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="7" result="nap"/>
    <feColorMatrix in="nap" type="saturate" values="0" result="nap-gray"/>
    <feBlend in="SourceGraphic" in2="nap-gray" mode="soft-light"/>
  </filter>
</defs>
<rect x="50" y="50" width="200" height="200" fill="url(#velvet)" filter="url(#velvet-nap)"/>
```

**Velvet characteristics:** The nap (fiber surface) catches light differently depending on viewing angle. Highlights appear where light hits the fibers at a grazing angle, and the fabric appears darker where light hits head-on (reverse of most materials).

### Leather

Full leather material with stitching:

```xml
<defs>
  <filter id="leather-pro" x="0" y="0" width="100%" height="100%">
    <!-- Grain texture -->
    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4" seed="3" result="grain"/>
    <!-- Surface variation -->
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="8" result="variation"/>
    <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.5" result="grained"/>
    <!-- Subtle lighting -->
    <feDiffuseLighting in="grain" surfaceScale="0.8" diffuseConstant="0.7" result="lit">
      <feDistantLight azimuth="135" elevation="55"/>
    </feDiffuseLighting>
    <feBlend in="grained" in2="lit" mode="multiply"/>
  </filter>
</defs>
<rect x="50" y="50" width="200" height="200" rx="5" fill="#6B3A2A" filter="url(#leather-pro)"/>
<!-- Stitching line -->
<path d="M 70 60 L 70 240" fill="none" stroke="#4A2515"
      stroke-width="1" stroke-dasharray="4,3"
      stroke-linecap="round"/>
```

**Leather types color guide:**
| Type | Color | Texture density |
|------|-------|----------------|
| Full-grain | `#6B3A2A` | Fine, visible pore |
| Suede | `#8B6B4A` | Soft, matte (no specular) |
| Patent | `#1A0A05` | Very smooth, high gloss |
| Distressed | `#7B5B3A` | Heavy, cracked |
| Tan | `#C8A882` | Light, natural |

## 6. Stone / Rock

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

### Marble

Veined marble with translucency:

```xml
<defs>
  <filter id="marble">
    <!-- Vein structure -->
    <feTurbulence type="turbulence" baseFrequency="0.015 0.005" numOctaves="5" seed="12" result="veins"/>
    <!-- Sharpen veins into lines -->
    <feColorMatrix in="veins" type="matrix" values="
      3 -1 -1 0 -0.3
      -1 3 -1 0 -0.3
      -1 -1 3 0 -0.3
      0 0 0 1 0" result="sharp-veins"/>
    <feBlend in="SourceGraphic" in2="sharp-veins" mode="multiply"/>
  </filter>
</defs>
<!-- White Carrara marble -->
<rect x="50" y="50" width="200" height="200" fill="#F0EDE8" filter="url(#marble)"/>
```

**Marble color varieties:**
| Type | Base | Vein color |
|------|------|-----------|
| Carrara (white) | `#F0EDE8` | Gray `#888` |
| Calacatta | `#FAF5EF` | Gold-gray `#B8A080` |
| Nero Marquina (black) | `#1A1A1A` | White `#DDD` |
| Verde Guatemala | `#1B4D3E` | White `#AAA` |
| Rosa Portogallo | `#E8B0A0` | White-pink `#F5D5C8` |

### Granite

Speckled, multi-colored stone:

```xml
<defs>
  <filter id="granite" x="0" y="0" width="100%" height="100%">
    <!-- Multi-frequency speckle -->
    <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="6" seed="20" result="speckle"/>
    <!-- Sharpen into distinct grains -->
    <feComponentTransfer in="speckle" result="grains">
      <feFuncR type="discrete" tableValues="0.3 0.5 0.7 0.9"/>
      <feFuncG type="discrete" tableValues="0.25 0.45 0.65 0.85"/>
      <feFuncB type="discrete" tableValues="0.2 0.4 0.6 0.8"/>
    </feComponentTransfer>
    <feBlend in="SourceGraphic" in2="grains" mode="multiply"/>
  </filter>
</defs>
<rect x="50" y="50" width="200" height="200" fill="#A0A0A0" filter="url(#granite)"/>
```

### Sandstone

Warm, layered sedimentary look:

```xml
<defs>
  <filter id="sandstone">
    <feTurbulence type="fractalNoise" baseFrequency="0.03 0.15" numOctaves="4" seed="25"/>
    <feColorMatrix type="matrix" values="
      0.8 0.4 0.1 0 0.1
      0.6 0.3 0.08 0 0.08
      0.3 0.15 0.05 0 0.04
      0 0 0 1 0"/>
    <feBlend in="SourceGraphic" mode="multiply"/>
  </filter>
</defs>
<rect x="50" y="50" width="200" height="200" fill="#D2B48C" filter="url(#sandstone)"/>
```

## 7. Skin

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

## 8. Fur / Hair

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

## 9. Brick / Concrete

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

## 10. Ice / Frost

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

## 11. Fire & Smoke

### Flame

```xml
<defs>
  <radialGradient id="flame-core" cx="50%" cy="80%" r="60%">
    <stop offset="0%" stop-color="#FFFFCC"/>
    <stop offset="30%" stop-color="#FFD700"/>
    <stop offset="60%" stop-color="#FF8C00"/>
    <stop offset="85%" stop-color="#FF4500"/>
    <stop offset="100%" stop-color="rgba(255,0,0,0)"/>
  </radialGradient>
  <filter id="flame-flicker" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="turbulence" baseFrequency="0.03 0.08" numOctaves="3" seed="7" result="warp"/>
    <feDisplacementMap in="SourceGraphic" in2="warp" scale="12" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>

<!-- Multiple overlapping flame shapes for volume -->
<g filter="url(#flame-flicker)">
  <!-- Outer flame (red-orange) -->
  <path d="M 100 200 Q 80 150, 95 100 Q 100 70, 105 100 Q 120 150, 100 200 Z"
        fill="#FF4500" opacity="0.6"/>
  <!-- Middle flame (orange-yellow) -->
  <path d="M 100 200 Q 88 160, 97 120 Q 100 95, 103 120 Q 112 160, 100 200 Z"
        fill="#FF8C00" opacity="0.7"/>
  <!-- Core flame (yellow-white) -->
  <path d="M 100 200 Q 93 170, 98 140 Q 100 125, 102 140 Q 107 170, 100 200 Z"
        fill="url(#flame-core)"/>
</g>
```

### Smoke

```xml
<defs>
  <filter id="smoke-blur" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="6"/>
  </filter>
  <radialGradient id="smoke-puff" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="rgba(80,80,80,0.3)"/>
    <stop offset="60%" stop-color="rgba(120,120,120,0.15)"/>
    <stop offset="100%" stop-color="rgba(160,160,160,0)"/>
  </radialGradient>
</defs>
<!-- Overlapping smoke puffs -->
<g filter="url(#smoke-blur)">
  <circle cx="100" cy="80" r="30" fill="url(#smoke-puff)"/>
  <circle cx="90" cy="55" r="35" fill="url(#smoke-puff)"/>
  <circle cx="110" cy="35" r="28" fill="url(#smoke-puff)"/>
  <circle cx="95" cy="15" r="25" fill="url(#smoke-puff)" opacity="0.5"/>
</g>
```

## 12. Clouds & Atmospheric Effects

### Cumulus Clouds

```xml
<defs>
  <radialGradient id="cloud-body" cx="50%" cy="60%" r="50%">
    <stop offset="0%" stop-color="#FFFFFF"/>
    <stop offset="70%" stop-color="#F0F0F0"/>
    <stop offset="100%" stop-color="#D8D8E0"/>
  </radialGradient>
  <filter id="cloud-soft" x="-10%" y="-10%" width="120%" height="120%">
    <feGaussianBlur stdDeviation="3"/>
  </filter>
</defs>
<!-- Build cloud from overlapping circles -->
<g filter="url(#cloud-soft)">
  <circle cx="100" cy="90" r="30" fill="url(#cloud-body)"/>
  <circle cx="130" cy="80" r="40" fill="url(#cloud-body)"/>
  <circle cx="170" cy="85" r="35" fill="url(#cloud-body)"/>
  <circle cx="150" cy="100" r="30" fill="url(#cloud-body)"/>
  <!-- Bottom flat edge -->
  <rect x="70" y="95" width="130" height="20" rx="5" fill="#F0F0F0"/>
  <!-- Shadow on bottom -->
  <rect x="80" y="105" width="110" height="10" rx="3" fill="#D0D0D8" opacity="0.5"/>
</g>
```

### Fog / Mist Layer

```xml
<defs>
  <linearGradient id="fog-layer" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="rgba(240,240,248,0)"/>
    <stop offset="30%" stop-color="rgba(240,240,248,0.4)"/>
    <stop offset="70%" stop-color="rgba(240,240,248,0.6)"/>
    <stop offset="100%" stop-color="rgba(240,240,248,0.3)"/>
  </linearGradient>
  <filter id="fog-texture">
    <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="14"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer>
      <feFuncA type="table" tableValues="0 0.2 0.4 0.3 0.1"/>
    </feComponentTransfer>
    <feBlend in="SourceGraphic" mode="screen"/>
  </filter>
</defs>
<rect x="0" y="200" width="800" height="200" fill="url(#fog-layer)" filter="url(#fog-texture)"/>
```

## 13. Sand & Earth

### Desert Sand

```xml
<defs>
  <filter id="sand-grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" seed="30"/>
    <feColorMatrix type="matrix" values="
      0.6 0.4 0.1 0 0.15
      0.5 0.35 0.08 0 0.12
      0.3 0.2 0.05 0 0.06
      0 0 0 1 0"/>
    <feBlend in="SourceGraphic" mode="multiply"/>
  </filter>
</defs>
<rect x="0" y="250" width="800" height="350" fill="#E8D4A0" filter="url(#sand-grain)"/>
```

### Rich Soil / Earth

```xml
<defs>
  <filter id="earth-texture">
    <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="5" seed="33"/>
    <feColorMatrix type="matrix" values="
      0.4 0.2 0.1 0 0.05
      0.3 0.15 0.08 0 0.03
      0.15 0.08 0.04 0 0.01
      0 0 0 1 0"/>
    <feBlend in="SourceGraphic" mode="multiply"/>
  </filter>
</defs>
<rect x="0" y="300" width="800" height="300" fill="#5C4033" filter="url(#earth-texture)"/>
```

## 14. Paper & Parchment

### Clean Paper

```xml
<defs>
  <filter id="paper-texture" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4" seed="2"/>
    <feColorMatrix type="saturate" values="0"/>
    <feBlend in="SourceGraphic" mode="multiply"/>
  </filter>
</defs>
<rect width="300" height="400" fill="#FAFAF5" filter="url(#paper-texture)"/>
```

### Aged Parchment

```xml
<defs>
  <filter id="parchment" x="0" y="0" width="100%" height="100%">
    <!-- Age spots -->
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="5" result="age"/>
    <feColorMatrix in="age" type="matrix" values="
      0.4 0.3 0.1 0 0.1
      0.3 0.25 0.08 0 0.08
      0.1 0.08 0.04 0 0.02
      0 0 0 1 0" result="aged-color"/>
    <!-- Fine paper texture -->
    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" seed="8" result="fiber"/>
    <feColorMatrix in="fiber" type="saturate" values="0" result="fiber-gray"/>
    <!-- Combine -->
    <feBlend in="SourceGraphic" in2="aged-color" mode="multiply" result="aged"/>
    <feBlend in="aged" in2="fiber-gray" mode="multiply"/>
  </filter>
  <!-- Darkened edges for age effect -->
  <radialGradient id="edge-darkening" cx="50%" cy="50%" r="70%">
    <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
    <stop offset="80%" stop-color="rgba(0,0,0,0)"/>
    <stop offset="100%" stop-color="rgba(80,50,20,0.3)"/>
  </radialGradient>
</defs>
<rect width="300" height="400" fill="#F4E8C1" filter="url(#parchment)"/>
<rect width="300" height="400" fill="url(#edge-darkening)"/>
```

## 15. Enamel & Ceramic

### Glossy Enamel

```xml
<defs>
  <radialGradient id="enamel-gloss" cx="35%" cy="30%" r="60%">
    <stop offset="0%" stop-color="rgba(255,255,255,0.5)"/>
    <stop offset="40%" stop-color="rgba(255,255,255,0.1)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0.05)"/>
  </radialGradient>
</defs>
<!-- Base enamel color -->
<circle cx="100" cy="100" r="50" fill="#C41E3A"/>
<!-- Gloss highlight overlay -->
<circle cx="100" cy="100" r="50" fill="url(#enamel-gloss)"/>
```

### Ceramic / Porcelain

```xml
<defs>
  <filter id="ceramic-glaze">
    <feSpecularLighting specularExponent="25" specularConstant="0.5" surfaceScale="2" result="spec">
      <fePointLight x="120" y="60" z="200"/>
    </feSpecularLighting>
    <feComposite in="spec" in2="SourceAlpha" operator="in" result="spec-clip"/>
    <feComponentTransfer in="spec-clip" result="soft-spec">
      <feFuncA type="linear" slope="0.3"/>
    </feComponentTransfer>
    <feBlend in="SourceGraphic" in2="soft-spec" mode="screen"/>
  </filter>
</defs>
<circle cx="150" cy="150" r="60" fill="#F5F0E8" filter="url(#ceramic-glaze)"
        stroke="#E8E0D0" stroke-width="1"/>
```

---

## PBR-Inspired Material Property Table

Use this table to guide your gradient/filter choices for any material:

| Material | Roughness | Metallic | Opacity | Specular | Key SVG technique |
|----------|-----------|----------|---------|----------|-------------------|
| Chrome | Very low | 1.0 | 1.0 | Very high | Multi-stop gradient + feSpecularLighting |
| Gold | Low | 1.0 | 1.0 | High | Warm multi-stop + specular |
| Copper | Low-med | 1.0 | 1.0 | Medium-high | Orange gradient + patina overlay |
| Bronze | Medium | 1.0 | 1.0 | Medium | Brown gradient + noise texture |
| Brushed steel | Medium | 1.0 | 1.0 | Medium (anisotropic) | Directional feTurbulence |
| Rust | High | 0.7 | 1.0 | Low | feTurbulence + displacement |
| Glass | Very low | 0.0 | 0.1–0.3 | High | Low-opacity fills + specular |
| Crystal | Very low | 0.0 | 0.5–0.8 | Very high | Polygon facets + highlight lines |
| Wood | High | 0.0 | 1.0 | Very low | Directional feTurbulence + colorMatrix |
| Marble | Low-med | 0.0 | 1.0 | Medium | feTurbulence veins + sharp colorMatrix |
| Water | Very low | 0.0 | 0.4–0.8 | High (Fresnel) | Gradient + displacement + specular ellipses |
| Silk | Low | 0.0 | 1.0 | High (anisotropic) | Multi-stop shimmer gradient |
| Denim | High | 0.0 | 1.0 | Very low | Weave pattern + noise |
| Velvet | Medium | 0.0 | 1.0 | Medium (inverted) | Radial gradient (dark center) |
| Leather | Medium-high | 0.0 | 1.0 | Low | feTurbulence grain + diffuse lighting |
| Stone | Very high | 0.0 | 1.0 | Very low | High-octave turbulence + displacement |
| Skin | Medium | 0.0 | 1.0 | Low | Warm radial gradients (SSS) |
| Ice | Low | 0.0 | 0.4–0.8 | High | Blue transparency + high specular |
| Fire | N/A | 0.0 | 0.6–1.0 | Emissive | Radial gradient + displacement flicker |
| Smoke | Very high | 0.0 | 0.1–0.3 | None | Blurred radial gradients |
| Paper | High | 0.0 | 1.0 | Very low | Fine feTurbulence noise |
| Ceramic | Low | 0.0 | 1.0 | Medium | Specular highlight overlay |

### How to read this table:
- **Roughness** → Controls how many gradient stops / how soft highlights are. Low roughness = sharp, concentrated highlights. High roughness = soft, spread-out or absent highlights.
- **Metallic** → Metallic materials reflect environment color in their highlights. Non-metallic materials have white highlights.
- **Opacity** → How transparent the material is. Low opacity = use transparent fills and show background through.
- **Specular** → How bright the specular highlight is. Controls `specularConstant` and `specularExponent` in filters.

## Material Selection Guide

| Material | Key Technique | Primary Tool | Filter cost |
|----------|--------------|--------------|-------------|
| Chrome/Silver | Multi-stop gradient + specularLighting | linearGradient + filter | 🟧 Medium |
| Gold | Warm multi-stop gradient + specular | linearGradient + filter | 🟧 Medium |
| Copper | Orange gradient + patina overlay | linearGradient | 🟨 Low |
| Bronze | Brown gradient + noise texture | linearGradient + filter | 🟧 Medium |
| Rust | Turbulence + displacement | filter | 🟥 High |
| Glass (clear) | Low-opacity fills + specular | radialGradient + filter | 🟧 Medium |
| Glass (frosted) | Blur + frost turbulence | filter | 🟥 High |
| Crystal | Polygon facets + highlight lines | polygon + line | ⬜ None |
| Wood | Directional feTurbulence + warm colorMatrix | filter | 🟧 Medium |
| Marble | Turbulence veins + sharp matrix | filter | 🟧 Medium |
| Granite | Multi-freq discrete speckle | filter | 🟧 Medium |
| Water (still) | Transparency gradient + displacementMap | gradient + filter | 🟥 High |
| Water (ocean) | Wave paths + specular ellipses | path + gradient | 🟨 Low |
| Silk | Multi-stop shimmer gradient | linearGradient | ⬜ None |
| Denim | Weave pattern + noise | pattern + filter | 🟨 Low |
| Velvet | Radial gradient + nap noise | radialGradient + filter | 🟨 Low |
| Leather | Turbulence grain + diffuse lighting | filter | 🟧 Medium |
| Stone | High-octave turbulence + displacement | filter | 🟥 High |
| Skin | Warm radial gradients (SSS) | radialGradient | ⬜ None |
| Fur/Hair | Flowing strand group paths | path groups | ⬜ None |
| Brick | Offset pattern + noise | pattern + filter | 🟨 Low |
| Concrete | Gray fill + noise | filter | 🟨 Low |
| Ice | Blue transparency + high specular | gradient + filter | 🟧 Medium |
| Fire | Radial gradient + displacement | gradient + filter | 🟧 Medium |
| Smoke | Blurred radial gradients | gradient + filter | 🟧 Medium |
| Sand | Warm turbulence | filter | 🟨 Low |
| Paper | Fine noise | filter | 🟨 Low |
| Parchment | Age turbulence + edge darkening | filter + gradient | 🟧 Medium |
| Enamel | Color fill + gloss gradient | radialGradient | ⬜ None |
| Ceramic | Specular highlight overlay | filter | 🟨 Low |

## Material Interaction Rules

When combining materials in a scene, follow these consistency rules:

### 1. Shared Light Source

All materials in the scene must respond to the same light direction:

```
Light from top-left (most common):
- Highlights appear on top-left surfaces
- Shadows fall toward bottom-right
- Specular spots on shiny materials align to same quadrant
- Gradient directions on similar materials share angle
```

### 2. Reflection Influence

Nearby materials affect each other:
- **Shiny metal near red cloth** → Metal reflects a hint of red (add subtle red tint to metal gradient near cloth edge)
- **Glass on wood** → Glass picks up warm brown tint from wood below
- **Water reflecting sky** → Water surface color influenced by sky gradient

### 3. Contact Shadows

Where two objects meet, add a dark contact shadow:
- Harder for smooth materials (glass on marble → sharp shadow line)
- Softer for rough materials (stone on earth → diffused gradient)
- Contact shadow is always darker than either surface's shadow color

### 4. Material Weathering Guidelines

Real objects weather over time. Add subtle weathering for realism:

| Material | Weathering effect | SVG technique |
|----------|------------------|---------------|
| Metal | Rust, tarnish, scratches | Turbulence overlay, thin dark lines |
| Wood | Splitting, fading, lichen | Lighter base color, green speckles |
| Stone | Erosion, moss, water stains | Dark drip paths, green patches |
| Fabric | Fading, fraying, stains | Lower saturation, rough edges |
| Glass | Fogging, chips, dirt | Low-opacity gray overlay, edge marks |
| Brick | Crumbling mortar, moss | Missing brick shapes, green in gaps |
| Paint | Peeling, cracking, chalking | Turbulence-displaced light patches |

**General tips:**
- Combine multiple techniques for realism (e.g., wood = turbulence grain + knot gradient + warm toning)
- Use the `apply_effect` MCP tool for quick preset effects
- Real materials are never perfectly uniform — always add some noise or variation
- Light direction should be consistent across all materials in a scene
- Consider filter render cost when adding multiple material filters to a single scene
