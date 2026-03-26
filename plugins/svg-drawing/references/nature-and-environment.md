# Nature & Environment

Practical SVG techniques for rendering natural elements: trees, sky, water, fire, weather, terrain, and flora. Every section includes real SVG code you can adapt directly.

---

## 1. Trees & Foliage

### 1.1 Deciduous Tree

**Construction:** tapered trunk path + canopy of overlapping circles/ellipses at varying opacity and color. Trunk darker at base, lighter toward top. Canopy: 3-5 overlapping shapes, lighter on top (sun-facing), darker at bottom for form shadow.

```svg
<g id="deciduous-tree">
  <!-- Trunk: tapered path, slight curve -->
  <path d="M 48,180 Q 47,140 45,100 L 42,100 Q 44,140 44,180 Z"
        fill="#5D4037" stroke="#3E2723" stroke-width="0.5"/>
  <path d="M 46,180 Q 46,145 45,105 L 44.5,105 Q 45,145 44.5,180 Z"
        fill="#795548" opacity="0.4"/>
  <!-- Canopy: overlapping circles, darker at bottom -->
  <ellipse cx="45" cy="75" rx="30" ry="22" fill="#2E7D32" opacity="0.85"/>
  <circle cx="32" cy="70" r="18" fill="#388E3C" opacity="0.8"/>
  <circle cx="58" cy="68" r="16" fill="#388E3C" opacity="0.8"/>
  <circle cx="45" cy="58" r="20" fill="#43A047" opacity="0.85"/>
  <ellipse cx="40" cy="52" rx="14" ry="10" fill="#66BB6A" opacity="0.7"/>
  <circle cx="48" cy="48" r="10" fill="#81C784" opacity="0.5"/>
</g>
```

**Seasonal color palettes:**

| Season | Primary   | Secondary | Accent    | Notes                       |
|--------|-----------|-----------|-----------|------------------------------|
| Spring | `#90EE90` | `#98FB98` | `#FFB7C5` | Light green, cherry blossom |
| Summer | `#228B22` | `#2E7D32` | `#1B5E20` | Rich, dense greens          |
| Autumn | `#FF8C00` | `#CD5C5C` | `#DAA520` | Orange, crimson, gold       |
| Winter | `#8B7355` | `#6B4226` | `#CCCCCC` | Bare branches, no canopy    |

**Winter bare branches** — replace canopy with forking paths:

```svg
<g id="winter-tree">
  <path d="M 50,180 Q 49,130 48,90" fill="none" stroke="#5D4037" stroke-width="3"/>
  <path d="M 48,90 Q 35,70 25,55" fill="none" stroke="#5D4037" stroke-width="2"/>
  <path d="M 48,90 Q 60,65 70,50" fill="none" stroke="#5D4037" stroke-width="2"/>
  <path d="M 25,55 Q 20,48 15,42" fill="none" stroke="#795548" stroke-width="1"/>
  <path d="M 25,55 Q 28,45 32,38" fill="none" stroke="#795548" stroke-width="1"/>
  <path d="M 70,50 Q 75,42 80,36" fill="none" stroke="#795548" stroke-width="1"/>
  <path d="M 70,50 Q 65,40 62,33" fill="none" stroke="#795548" stroke-width="1"/>
</g>
```

### 1.2 Conifer / Pine Tree

Overlapping triangles stacking upward, each narrower. 4-6 layers, darker green at bottom.

```svg
<g id="pine-tree">
  <rect x="47" y="160" width="6" height="25" fill="#5D4037" rx="1"/>
  <polygon points="50,145 25,175 75,175" fill="#1B5E20"/>
  <polygon points="50,125 28,160 72,160" fill="#2E7D32"/>
  <polygon points="50,105 30,145 70,145" fill="#388E3C"/>
  <polygon points="50,88  33,130 67,130" fill="#43A047"/>
  <polygon points="50,72  36,115 64,115" fill="#4CAF50"/>
  <polygon points="50,55  40,100 60,100" fill="#66BB6A"/>
  <!-- Optional snow caps: <polygon points="50,55 43,78 57,78" fill="white" opacity="0.8"/> -->
</g>
```

### 1.3 Palm Tree

Curved trunk with ring segments, 6 arcing fronds, coconuts:

```svg
<g id="palm-tree">
  <path d="M 50,200 Q 48,160 52,120 Q 55,90 58,65"
        fill="none" stroke="#8D6E63" stroke-width="6" stroke-linecap="round"/>
  <path d="M 49,180 Q 51,178 53,180" fill="none" stroke="#6D4C41" stroke-width="0.8"/>
  <path d="M 50,140 Q 53,138 55,140" fill="none" stroke="#6D4C41" stroke-width="0.8"/>
  <circle cx="56" cy="67" r="3" fill="#8B4513"/>
  <circle cx="60" cy="69" r="2.8" fill="#A0522D"/>
  <path d="M 58,65 Q 30,40 10,55" fill="none" stroke="#2E7D32" stroke-width="2.5"/>
  <path d="M 58,65 Q 55,25 50,20" fill="none" stroke="#2E7D32" stroke-width="2.5"/>
  <path d="M 58,65 Q 70,25 75,20" fill="none" stroke="#388E3C" stroke-width="2.5"/>
  <path d="M 58,65 Q 80,30 95,35" fill="none" stroke="#2E7D32" stroke-width="2.5"/>
  <path d="M 58,65 Q 85,40 105,55" fill="none" stroke="#388E3C" stroke-width="2.5"/>
</g>
```

### 1.4 Stylized / Cartoon Trees

```svg
<!-- Lollipop tree -->
<g id="lollipop-tree">
  <rect x="48" y="120" width="4" height="60" fill="#795548" rx="2"/>
  <circle cx="50" cy="95" r="30" fill="#4CAF50"/>
</g>
<!-- Bushy / cloud-canopy tree -->
<g id="bushy-tree">
  <rect x="46" y="130" width="8" height="50" fill="#6D4C41" rx="2"/>
  <circle cx="35" cy="110" r="15" fill="#43A047"/>
  <circle cx="65" cy="108" r="14" fill="#43A047"/>
  <circle cx="50" cy="98"  r="16" fill="#4CAF50"/>
</g>
<!-- Minimal tree -->
<g id="minimal-tree">
  <rect x="49" y="140" width="2" height="40" fill="#795548"/>
  <polygon points="50,80 30,140 70,140" fill="#66BB6A"/>
</g>
```

### 1.5 Tree Groups & Forest

Atmospheric perspective: far trees smaller, lighter, blue-shifted; near trees larger, darker, saturated.

```svg
<g id="forest-scene">
  <g opacity="0.5"><!-- Far: small, blue-shifted -->
    <polygon points="30,120 20,145 40,145" fill="#7BA8A8"/>
    <polygon points="55,115 45,145 65,145" fill="#6E9E9E"/>
    <polygon points="80,118 70,145 90,145" fill="#7BA8A8"/>
  </g>
  <g opacity="0.75"><!-- Mid: semi-saturated -->
    <polygon points="20,100 5,145 35,145" fill="#4A7C59"/>
    <polygon points="50,95  33,145 67,145" fill="#3D6B4A"/>
    <polygon points="78,98  63,145 93,145" fill="#4A7C59"/>
  </g>
  <!-- Near: fully saturated -->
  <polygon points="10,70 -15,145 35,145" fill="#1B5E20"/>
  <polygon points="45,65 18,145 72,145" fill="#2E7D32"/>
  <polygon points="85,68 58,145 112,145" fill="#1B5E20"/>
  <ellipse cx="60" cy="148" rx="70" ry="5" fill="#1B3A1B" opacity="0.3"/>
</g>
```

### 1.6 Individual Leaves

Four leaf types as reusable `<defs>`:

```svg
<defs>
  <g id="leaf-oval">
    <ellipse cx="0" cy="0" rx="6" ry="12" fill="#4CAF50"/>
    <line x1="0" y1="-12" x2="0" y2="12" stroke="#2E7D32" stroke-width="0.5"/>
  </g>
  <g id="leaf-maple">
    <path d="M 0,12 L -3,4 L -10,2 L -5,0 L -8,-6 L -3,-3 L 0,-12
             L 3,-3 L 8,-6 L 5,0 L 10,2 L 3,4 Z"
          fill="#E65100" stroke="#BF360C" stroke-width="0.3"/>
  </g>
  <g id="leaf-oak">
    <path d="M 0,14 Q -3,10 -6,8 Q -4,6 -7,4 Q -4,2 -6,0 Q -3,-2 -5,-5 Q -2,-4 0,-8
             Q 2,-4 5,-5 Q 3,-2 6,0 Q 4,2 7,4 Q 4,6 6,8 Q 3,10 0,14 Z"
          fill="#8BC34A" stroke="#558B2F" stroke-width="0.3"/>
  </g>
  <g id="leaf-pine-needles">
    <line x1="0" y1="0" x2="-2" y2="-15" stroke="#2E7D32" stroke-width="0.5"/>
    <line x1="0" y1="0" x2="0"  y2="-16" stroke="#388E3C" stroke-width="0.5"/>
    <line x1="0" y1="0" x2="2"  y2="-15" stroke="#2E7D32" stroke-width="0.5"/>
  </g>
</defs>
```

---

## 2. Sky & Atmosphere

### 2.1 Clear Day Sky

```svg
<defs>
  <linearGradient id="sky-clear-day" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="#1E90FF"/>
    <stop offset="50%"  stop-color="#87CEEB"/>
    <stop offset="90%"  stop-color="#E0F0FF"/>
    <stop offset="100%" stop-color="#F0F8FF"/>
  </linearGradient>
</defs>
<rect x="0" y="0" width="400" height="250" fill="url(#sky-clear-day)"/>
```

### 2.2 Sunset Sky

```svg
<defs>
  <linearGradient id="sky-sunset" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1A1A4E"/><stop offset="20%" stop-color="#6B3FA0"/>
    <stop offset="40%" stop-color="#C71585"/><stop offset="60%" stop-color="#FF6347"/>
    <stop offset="80%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFF8DC"/>
  </linearGradient>
  <radialGradient id="sun-glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0%" stop-color="#FFFAF0"/>
    <stop offset="40%" stop-color="#FFD700"/>
    <stop offset="100%" stop-color="#FF8C00" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect x="0" y="0" width="400" height="300" fill="url(#sky-sunset)"/>
<circle cx="200" cy="240" r="30" fill="url(#sun-glow)"/>
<g opacity="0.3"><!-- warm-tinted cloud silhouettes -->
  <ellipse cx="120" cy="100" rx="50" ry="12" fill="#FF6347"/>
  <ellipse cx="300" cy="80"  rx="40" ry="10" fill="#FF4500"/>
</g>
```

### 2.3 Night Sky

Stars at varying sizes/brightness, crescent moon, optional Milky Way:

```svg
<defs>
  <radialGradient id="night-bg" cx="0.5" cy="0.4" r="0.7">
    <stop offset="0%" stop-color="#0F0F3D"/><stop offset="100%" stop-color="#0A0A2E"/>
  </radialGradient>
  <filter id="star-glow">
    <feGaussianBlur stdDeviation="1" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<rect x="0" y="0" width="400" height="300" fill="url(#night-bg)"/>
<!-- Milky Way -->
<ellipse cx="200" cy="120" rx="180" ry="30" fill="#4444AA"
         opacity="0.08" transform="rotate(-20 200 120)"/>
<!-- Stars -->
<g filter="url(#star-glow)">
  <circle cx="50"  cy="30"  r="1.2" fill="white" opacity="0.9"/>
  <circle cx="180" cy="20"  r="1.5" fill="#FFFFDD" opacity="1.0"/>
  <circle cx="310" cy="25"  r="1.0" fill="white" opacity="0.7"/>
  <circle cx="80"  cy="100" r="1.3" fill="#EEEEFF" opacity="0.8"/>
  <circle cx="250" cy="45"  r="0.6" fill="white" opacity="0.4"/>
</g>
<!-- Crescent moon: two overlapping circles -->
<circle cx="320" cy="60" r="20" fill="#F5F5DC"/>
<circle cx="330" cy="55" r="18" fill="#0F0F3D"/>
```

### 2.4 Storm Sky

Dark gradients with yellow-green tint at horizon, lightning bolt with glow filter:

```svg
<defs>
  <linearGradient id="sky-storm" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1C1C1C"/><stop offset="50%" stop-color="#2C2C2C"/>
    <stop offset="80%" stop-color="#4A4A4A"/><stop offset="100%" stop-color="#5A5A3A"/>
  </linearGradient>
  <filter id="lightning-glow">
    <feGaussianBlur stdDeviation="3" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<rect x="0" y="0" width="400" height="300" fill="url(#sky-storm)"/>
<path d="M 180,20 L 175,60 L 190,65 L 170,120 L 185,125 L 165,200"
      fill="none" stroke="white" stroke-width="2.5" filter="url(#lightning-glow)"/>
<path d="M 170,120 L 155,160 L 148,180"
      fill="none" stroke="white" stroke-width="1.5" filter="url(#lightning-glow)" opacity="0.7"/>
```

---

## 3. Clouds

### 3.1 Cumulus (Fluffy)

Overlapping circles with flat base via `<clipPath>`, shadow at bottom, highlight on top:

```svg
<defs>
  <clipPath id="cloud-flat-base"><rect x="0" y="0" width="200" height="65"/></clipPath>
</defs>
<g id="cumulus-cloud" transform="translate(100, 50)" clip-path="url(#cloud-flat-base)">
  <circle cx="40" cy="50" r="22" fill="#F8F8FF"/>
  <circle cx="65" cy="40" r="28" fill="white"/>
  <circle cx="95" cy="35" r="32" fill="white"/>
  <circle cx="125" cy="40" r="26" fill="#F8F8FF"/>
  <circle cx="148" cy="50" r="20" fill="#F0F0F5"/>
  <ellipse cx="95" cy="62" rx="55" ry="8" fill="#D0D0E0" opacity="0.4"/>
  <circle cx="90" cy="22" r="14" fill="white" opacity="0.6"/>
</g>
```

### 3.2 Stratus (Flat) & 3.3 Cirrus (Wispy)

```svg
<!-- Stratus: wide thin layers for overcast sky -->
<g id="stratus-clouds">
  <ellipse cx="200" cy="60" rx="160" ry="8" fill="white" opacity="0.35"/>
  <ellipse cx="180" cy="75" rx="140" ry="6" fill="#F0F0F0" opacity="0.30"/>
  <ellipse cx="220" cy="88" rx="180" ry="10" fill="white" opacity="0.25"/>
</g>

<!-- Cirrus: thin curved paths, very transparent -->
<g id="cirrus-clouds" opacity="0.3">
  <path d="M 50,30 Q 100,25 150,35 Q 180,38 200,32"
        fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <path d="M 250,40 Q 300,32 350,42 Q 370,45 380,38"
        fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
</g>
```

### 3.4 Cloud via Filter (Organic Edges)

`feTurbulence` + `feDisplacementMap` warps simple shapes into natural cloud edges:

```svg
<defs>
  <filter id="cloud-organic" x="-30%" y="-30%" width="160%" height="160%">
    <feTurbulence type="fractalNoise" baseFrequency="0.025"
                  numOctaves="4" seed="2" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise"
                       scale="40" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<ellipse cx="200" cy="80" rx="60" ry="25" fill="white" opacity="0.9"
         filter="url(#cloud-organic)"/>
```

**Tip:** Change `seed` for different shapes. Lower `baseFrequency` (e.g., `0.015`) for smoother billows.

---

## 4. Water

### 4.1 Still Water / Lake

Reflection: duplicate scene, flip with `scale(1,-1)`, reduce opacity, blur, blue-shift color.

```svg
<defs>
  <filter id="water-blur"><feGaussianBlur stdDeviation="1.5 0.5"/></filter>
  <linearGradient id="water-surface" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2980B9" stop-opacity="0.6"/>
    <stop offset="100%" stop-color="#1A5276" stop-opacity="0.8"/>
  </linearGradient>
</defs>
<!-- Original scene above water line y=150 -->
<polygon points="100,80 80,150 120,150" fill="#2E7D32"/>
<!-- Reflection below water -->
<g transform="translate(0, 300) scale(1, -1)" filter="url(#water-blur)" opacity="0.5">
  <polygon points="100,80 80,150 120,150" fill="#1A5276"/>
</g>
<rect x="0" y="150" width="400" height="150" fill="url(#water-surface)"/>
<!-- Ripple lines -->
<g stroke="white" stroke-width="0.5" opacity="0.15">
  <line x1="20" y1="170" x2="380" y2="170"/>
  <line x1="10" y1="195" x2="390" y2="195"/>
  <line x1="30" y1="220" x2="370" y2="220"/>
</g>
```

### 4.2 Ocean Waves

Multiple wave layers using quadratic curves, foam on crests:

```svg
<defs>
  <linearGradient id="ocean-deep" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#5DADE2"/><stop offset="100%" stop-color="#1B4F72"/>
  </linearGradient>
</defs>
<rect x="0" y="150" width="400" height="150" fill="url(#ocean-deep)"/>
<path d="M 0,180 Q 50,170 100,180 Q 150,190 200,180 Q 250,170 300,180 Q 350,190 400,180
         L 400,300 L 0,300 Z" fill="#5DADE2" opacity="0.5"/>
<path d="M 0,200 Q 40,188 80,200 Q 120,212 160,200 Q 200,188 240,200 Q 280,212 320,200
         Q 360,188 400,200 L 400,300 L 0,300 Z" fill="#3498DB" opacity="0.6"/>
<path d="M 0,230 Q 30,215 60,230 Q 90,245 120,230 Q 150,215 180,230 Q 210,245 240,230
         Q 270,215 300,230 Q 330,245 400,230 L 400,300 L 0,300 Z" fill="#1B4F72" opacity="0.8"/>
<path d="M 0,230 Q 30,215 60,230 Q 90,245 120,230" fill="none"
      stroke="white" stroke-width="1" opacity="0.4" stroke-dasharray="4 6"/>
```

### 4.3 River / Stream

```svg
<defs>
  <linearGradient id="river-cross" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#1A5276"/><stop offset="50%" stop-color="#5DADE2"/>
    <stop offset="100%" stop-color="#1A5276"/>
  </linearGradient>
</defs>
<path d="M 180,0 Q 160,50 190,100 Q 220,150 180,200 Q 140,250 170,300"
      fill="none" stroke="url(#river-cross)" stroke-width="30" stroke-linecap="round"/>
<g fill="none" stroke="white" stroke-width="0.5" opacity="0.2">
  <path d="M 180,10 Q 165,55 188,95"/>
  <path d="M 185,60 Q 210,110 185,160"/>
</g>
```

### 4.4 Waterfall

```svg
<defs>
  <filter id="waterfall-blur"><feGaussianBlur stdDeviation="2 0.5"/></filter>
  <filter id="mist-blur"><feGaussianBlur stdDeviation="8"/></filter>
</defs>
<rect x="150" y="80" width="100" height="120" fill="#5D4E37"/><!-- cliff -->
<rect x="170" y="80" width="60" height="125" fill="white" opacity="0.7" filter="url(#waterfall-blur)"/>
<ellipse cx="200" cy="210" rx="60" ry="20" fill="white" opacity="0.3" filter="url(#mist-blur)"/>
```

### 4.5 Water Ripple Filter

Asymmetric `baseFrequency` — low horizontal, high vertical — creates characteristic water distortion:

```svg
<defs>
  <filter id="water-ripple" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="turbulence" baseFrequency="0.01 0.15" numOctaves="2" seed="5" result="ripple"/>
    <feDisplacementMap in="SourceGraphic" in2="ripple" scale="8"
                       xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
```

---

## 5. Fire & Smoke

### 5.1 Flame

Three-layer teardrop: outer red → middle orange → inner yellow. Displacement filter for irregular edges.

```svg
<defs>
  <filter id="flame-distort" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="turbulence" baseFrequency="0.05 0.1" numOctaves="3" seed="3" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="6"
                       xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<g id="flame" filter="url(#flame-distort)">
  <path d="M 50,100 Q 35,70 40,45 Q 45,20 50,5 Q 55,20 60,45 Q 65,70 50,100 Z"
        fill="#FF4500" opacity="0.6"/>
  <path d="M 50,100 Q 38,75 42,50 Q 46,28 50,12 Q 54,28 58,50 Q 62,75 50,100 Z"
        fill="#FF8C00" opacity="0.7"/>
  <path d="M 50,100 Q 42,80 44,60 Q 47,38 50,22 Q 53,38 56,60 Q 58,80 50,100 Z"
        fill="#FFD700" opacity="0.9"/>
  <path d="M 50,100 Q 46,88 47,72 Q 49,55 50,40 Q 51,55 53,72 Q 54,88 50,100 Z"
        fill="#FFFACD" opacity="0.6"/>
</g>
```

### 5.2 Campfire

Crossed logs + scaled flame group + embers. Reuse flame paths from 5.1 with `scale(0.6)`:

```svg
<g id="campfire">
  <rect x="30" y="108" width="45" height="6" rx="3" fill="#5D4037" transform="rotate(-15 52 111)"/>
  <rect x="35" y="108" width="45" height="6" rx="3" fill="#6D4C41" transform="rotate(15 57 111)"/>
  <!-- Flames scaled down -->
  <g transform="translate(50, 108) scale(0.6) translate(-50, -100)">
    <path d="M 50,100 Q 35,70 40,45 Q 45,20 50,5 Q 55,20 60,45 Q 65,70 50,100 Z" fill="#FF4500" opacity="0.6"/>
    <path d="M 50,100 Q 42,80 44,60 Q 47,38 50,22 Q 53,38 56,60 Q 58,80 50,100 Z" fill="#FFD700" opacity="0.9"/>
  </g>
  <circle cx="42" cy="85" r="1" fill="#FF6347" opacity="0.8"/>
  <circle cx="58" cy="78" r="0.8" fill="#FF4500" opacity="0.6"/>
</g>
```

### 5.3 Smoke

Rising plume: circles grow in size/blur upward, decrease in opacity, lighten in color, drift sideways.

```svg
<defs>
  <filter id="smoke-blur-sm"><feGaussianBlur stdDeviation="2"/></filter>
  <filter id="smoke-blur-md"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="smoke-blur-lg"><feGaussianBlur stdDeviation="8"/></filter>
</defs>
<g id="smoke-plume">
  <circle cx="50" cy="60" r="6"  fill="#333" opacity="0.40" filter="url(#smoke-blur-sm)"/>
  <circle cx="52" cy="38" r="12" fill="#777" opacity="0.20" filter="url(#smoke-blur-md)"/>
  <circle cx="55" cy="25" r="16" fill="#999" opacity="0.15" filter="url(#smoke-blur-md)"/>
  <circle cx="60" cy="10" r="22" fill="#AAA" opacity="0.08" filter="url(#smoke-blur-lg)"/>
</g>
```

### 5.4 Explosion

Central flash, radiating blast shapes, shockwave ring:

```svg
<g id="explosion">
  <circle cx="100" cy="100" r="70" fill="none" stroke="#FFD700" stroke-width="3" opacity="0.3"/>
  <path d="M 100,100 L 80,40 L 95,65 L 100,30 L 105,65 L 120,40 Z" fill="#FF4500" opacity="0.5"/>
  <path d="M 100,100 L 160,80 L 135,95 L 170,100 L 135,105 L 160,120 Z" fill="#FF6347" opacity="0.5"/>
  <circle cx="100" cy="100" r="25" fill="#FF8C00" opacity="0.8"/>
  <circle cx="100" cy="100" r="12" fill="#FFFACD" opacity="0.9"/>
</g>
```

---

## 6. Weather Effects

### 6.1 Rain

Diagonal line pattern with puddle ripples:

```svg
<defs>
  <pattern id="rain-pattern" x="0" y="0" width="20" height="40"
           patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
    <line x1="10" y1="0" x2="10" y2="18" stroke="#B0C4DE" stroke-width="1" opacity="0.4"/>
    <line x1="3"  y1="12" x2="3"  y2="25" stroke="#B0C4DE" stroke-width="0.8" opacity="0.3"/>
    <line x1="16" y1="8"  x2="16" y2="28" stroke="#B0C4DE" stroke-width="0.6" opacity="0.35"/>
  </pattern>
</defs>
<rect x="0" y="0" width="400" height="300" fill="url(#rain-pattern)"/>
<!-- Puddle -->
<ellipse cx="200" cy="280" rx="40" ry="8" fill="#5DADE2" opacity="0.3"/>
<ellipse cx="200" cy="280" rx="15" ry="3" fill="none" stroke="#85C1E9" stroke-width="0.5" opacity="0.5"/>
<ellipse cx="200" cy="280" rx="28" ry="5.5" fill="none" stroke="#85C1E9" stroke-width="0.3" opacity="0.3"/>
```

### 6.2 Snow

Scattered circles in pattern, ground accumulation:

```svg
<defs>
  <pattern id="snow-pattern" x="0" y="0" width="40" height="50" patternUnits="userSpaceOnUse">
    <circle cx="5"  cy="10" r="1.5" fill="white" opacity="0.8"/>
    <circle cx="25" cy="5"  r="2"   fill="white" opacity="0.6"/>
    <circle cx="15" cy="30" r="1"   fill="white" opacity="0.7"/>
    <circle cx="35" cy="25" r="1.8" fill="white" opacity="0.5"/>
  </pattern>
</defs>
<rect x="0" y="0" width="400" height="300" fill="url(#snow-pattern)"/>
<path d="M 0,270 Q 40,265 80,268 Q 120,272 160,267 Q 200,263 240,268
         Q 280,273 320,266 Q 360,262 400,267 L 400,300 L 0,300 Z" fill="white" opacity="0.9"/>
<!-- Snow on surface -->
<path d="M 50,150 Q 55,147 60,149 Q 65,146 70,148 Q 75,145 80,147 Q 85,146 90,150"
      fill="white"/>
```

### 6.3 Fog / Mist

Layered blurred shapes, denser at ground:

```svg
<defs><filter id="fog-blur"><feGaussianBlur stdDeviation="15"/></filter></defs>
<rect x="-20" y="100" width="440" height="60" fill="white" opacity="0.08" filter="url(#fog-blur)"/>
<rect x="-20" y="150" width="440" height="50" fill="white" opacity="0.15" filter="url(#fog-blur)"/>
<rect x="-20" y="200" width="440" height="100" fill="white" opacity="0.25" filter="url(#fog-blur)"/>
```

### 6.4 Wind

Shown via speed lines, flying debris, bent elements:

```svg
<line x1="50" y1="80" x2="120" y2="80" stroke="#B0C4DE"
      stroke-width="1" opacity="0.3" stroke-dasharray="8 12"/>
<line x1="30" y1="100" x2="140" y2="100" stroke="#B0C4DE"
      stroke-width="0.8" opacity="0.2" stroke-dasharray="12 8"/>
<use href="#leaf-oval" x="90" y="85" transform="rotate(45 90 85) scale(0.4)"/>
<path d="M 200,200 Q 195,160 210,120 Q 225,85 250,70"
      fill="none" stroke="#5D4037" stroke-width="4" stroke-linecap="round"/>
```

### 6.5 Rainbow

Seven concentric arcs in ROYGBIV order (outside → inside):

```svg
<g id="rainbow" opacity="0.5">
  <path d="M 50,250 A 150,150 0 0,1 350,250" fill="none" stroke="#FF0000" stroke-width="6"/>
  <path d="M 56,250 A 144,144 0 0,1 344,250" fill="none" stroke="#FF7F00" stroke-width="6"/>
  <path d="M 62,250 A 138,138 0 0,1 338,250" fill="none" stroke="#FFFF00" stroke-width="6"/>
  <path d="M 68,250 A 132,132 0 0,1 332,250" fill="none" stroke="#00FF00" stroke-width="6"/>
  <path d="M 74,250 A 126,126 0 0,1 326,250" fill="none" stroke="#0000FF" stroke-width="6"/>
  <path d="M 80,250 A 120,120 0 0,1 320,250" fill="none" stroke="#4B0082" stroke-width="6"/>
  <path d="M 86,250 A 114,114 0 0,1 314,250" fill="none" stroke="#8B00FF" stroke-width="6"/>
</g>
```

---

## 7. Terrain & Ground

### 7.1 Mountains

Layered ranges with atmospheric perspective:

```svg
<g id="mountain-range">
  <polygon points="0,200 60,130 100,155 150,110 200,145 260,120 320,150 400,200"
           fill="#8899AA" opacity="0.6"/><!-- distant -->
  <polygon points="0,200 40,140 90,170 140,105 190,155 250,100 300,160 350,130 400,200"
           fill="#556677" opacity="0.8"/><!-- mid -->
  <polygon points="140,105 128,130 152,130" fill="white" opacity="0.7"/><!-- snow cap -->
  <polygon points="250,100 238,125 262,125" fill="white" opacity="0.7"/>
  <polygon points="0,200 30,155 70,180 120,120 170,165 220,135 280,170 330,140 400,200"
           fill="#445566"/><!-- near -->
  <polygon points="120,120 108,142 132,142" fill="white" opacity="0.85"/>
</g>
```

### 7.2 Hills

```svg
<defs>
  <linearGradient id="hill-green" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#66BB6A"/><stop offset="100%" stop-color="#2E7D32"/>
  </linearGradient>
</defs>
<path d="M 0,220 Q 80,180 160,210 Q 240,180 320,200 Q 380,185 400,195
         L 400,300 L 0,300 Z" fill="#81C784" opacity="0.6"/><!-- far -->
<path d="M 0,240 Q 60,200 130,230 Q 200,195 280,225 Q 350,200 400,215
         L 400,300 L 0,300 Z" fill="url(#hill-green)" opacity="0.8"/><!-- mid -->
<path d="M 0,260 Q 100,220 200,250 Q 300,220 400,245 L 400,300 L 0,300 Z" fill="#2E7D32"/>
```

### 7.3 Rocks & Boulders

```svg
<defs>
  <linearGradient id="rock-shade" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#9E9E9E"/><stop offset="100%" stop-color="#616161"/>
  </linearGradient>
</defs>
<g id="boulder">
  <polygon points="20,50 35,20 55,15 70,25 75,50 65,60 30,58"
           fill="url(#rock-shade)" stroke="#555" stroke-width="0.5"/>
  <polygon points="35,20 55,15 60,30 40,35" fill="#BDBDBD" opacity="0.3"/><!-- highlight -->
  <path d="M 40,25 L 45,40 L 50,55" fill="none" stroke="#424242" stroke-width="0.5" opacity="0.6"/>
</g>
```

### 7.4 Sand / Desert

```svg
<defs>
  <linearGradient id="sand-gradient" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#F4D03F"/><stop offset="100%" stop-color="#D4A017"/>
  </linearGradient>
  <pattern id="sand-stipple" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
    <circle cx="2" cy="3" r="0.4" fill="#C19A1A" opacity="0.3"/>
    <circle cx="6" cy="6" r="0.3" fill="#B8860B" opacity="0.2"/>
  </pattern>
</defs>
<path d="M 0,200 Q 100,160 200,190 Q 300,155 400,180 L 400,300 L 0,300 Z"
      fill="url(#sand-gradient)" opacity="0.6"/>
<path d="M 0,230 Q 80,190 180,225 Q 280,185 400,210 L 400,300 L 0,300 Z"
      fill="url(#sand-gradient)"/>
<path d="M 0,230 Q 80,190 180,225 Q 280,185 400,210 L 400,300 L 0,300 Z"
      fill="url(#sand-stipple)"/>
```

### 7.5 Grass

Pattern fill of blade paths plus foreground blades:

```svg
<defs>
  <pattern id="grass-pattern" x="0" y="0" width="12" height="15" patternUnits="userSpaceOnUse">
    <path d="M 3,15 Q 2,8 1,2"  fill="none" stroke="#228B22" stroke-width="0.8"/>
    <path d="M 6,15 Q 7,6 5,0"  fill="none" stroke="#32CD32" stroke-width="0.7"/>
    <path d="M 9,15 Q 8,7 10,1" fill="none" stroke="#006400" stroke-width="0.8"/>
  </pattern>
</defs>
<rect x="0" y="250" width="400" height="50" fill="#2E7D32"/>
<rect x="0" y="250" width="400" height="50" fill="url(#grass-pattern)"/>
<path d="M 30,270 Q 28,255 25,240" fill="none" stroke="#228B22" stroke-width="1.2" stroke-linecap="round"/>
<path d="M 35,270 Q 37,250 34,235" fill="none" stroke="#32CD32" stroke-width="1" stroke-linecap="round"/>
```

---

## 8. Flowers & Plants

### 8.1 Simple Flower (5-Petal)

Five ellipses rotated at 72° intervals, center disk with dot texture, stem with leaf:

```svg
<g id="flower-5-petal">
  <path d="M 50,200 Q 48,170 50,140" fill="none" stroke="#2E7D32" stroke-width="2"/>
  <path d="M 49,175 Q 35,165 40,155 Q 45,165 49,170" fill="#43A047"/>
  <g transform="translate(50, 130)">
    <ellipse cx="0" cy="-14" rx="6" ry="14" fill="#E91E63" transform="rotate(0)"/>
    <ellipse cx="0" cy="-14" rx="6" ry="14" fill="#EC407A" transform="rotate(72)"/>
    <ellipse cx="0" cy="-14" rx="6" ry="14" fill="#E91E63" transform="rotate(144)"/>
    <ellipse cx="0" cy="-14" rx="6" ry="14" fill="#EC407A" transform="rotate(216)"/>
    <ellipse cx="0" cy="-14" rx="6" ry="14" fill="#E91E63" transform="rotate(288)"/>
    <circle cx="0" cy="0" r="5" fill="#FFD600"/>
    <circle cx="-1.5" cy="-1" r="0.6" fill="#F9A825" opacity="0.7"/>
    <circle cx="1" cy="-1.5" r="0.5" fill="#F9A825" opacity="0.7"/>
    <circle cx="0" cy="1" r="0.7" fill="#F9A825" opacity="0.6"/>
  </g>
</g>
```

### 8.2 Rose

Concentric curved petals: outer larger/lighter (#F48FB1 → #F06292), mid (#E91E63 → #D81B60), inner tight/darkest (#C2185B). Each layer uses the same petal path at different `rotate()` angles.

```svg
<g id="rose" transform="translate(50, 50)">
  <path d="M -20,5 Q -25,-10 -10,-18 Q 0,-22 10,-18 Q 15,-10 10,5 Q 0,0 -20,5 Z"
        fill="#F48FB1" opacity="0.8"/>
  <path d="M -15,10 Q -20,-5 -8,-15 Q 5,-20 15,-12 Q 18,0 5,10 Q -5,5 -15,10 Z"
        fill="#EC407A" opacity="0.8" transform="rotate(120)"/>
  <path d="M -12,3 Q -15,-8 -5,-14 Q 3,-16 10,-10 Q 12,-2 5,6 Q -3,2 -12,3 Z"
        fill="#E91E63" opacity="0.85" transform="rotate(30)"/>
  <path d="M -12,3 Q -15,-8 -5,-14 Q 3,-16 10,-10 Q 12,-2 5,6 Q -3,2 -12,3 Z"
        fill="#D81B60" opacity="0.85" transform="rotate(100)"/>
  <path d="M -6,2 Q -8,-4 -3,-8 Q 2,-10 6,-6 Q 7,-1 3,3 Q -1,1 -6,2 Z"
        fill="#C2185B" opacity="0.9" transform="rotate(15)"/>
  <circle cx="0" cy="-1" r="3" fill="#880E4F" opacity="0.85"/>
</g>
```

### 8.3 Sunflower

20 petal ellipses at 18° intervals (`rotate(0)`, `rotate(18)`, ... `rotate(342)`) around a brown center with seed dot pattern:

```svg
<g id="sunflower" transform="translate(100, 100)">
  <!-- 20 petals: ellipse cx="0" cy="-30" rx="5" ry="16" at rotate(N*18) for N=0..19 -->
  <g fill="#FDD835">
    <ellipse cx="0" cy="-30" rx="5" ry="16" transform="rotate(0)"/>
    <ellipse cx="0" cy="-30" rx="5" ry="16" transform="rotate(36)"/>
    <ellipse cx="0" cy="-30" rx="5" ry="16" transform="rotate(72)"/>
    <ellipse cx="0" cy="-30" rx="5" ry="16" transform="rotate(108)"/>
    <ellipse cx="0" cy="-30" rx="5" ry="16" transform="rotate(144)"/>
    <ellipse cx="0" cy="-30" rx="5" ry="16" transform="rotate(180)"/>
    <ellipse cx="0" cy="-30" rx="5" ry="16" transform="rotate(216)"/>
    <ellipse cx="0" cy="-30" rx="5" ry="16" transform="rotate(252)"/>
    <ellipse cx="0" cy="-30" rx="5" ry="16" transform="rotate(288)"/>
    <ellipse cx="0" cy="-30" rx="5" ry="16" transform="rotate(324)"/>
    <!-- Add 10 more at rotate(18), rotate(54), etc. for full 20 petals -->
  </g>
  <circle cx="0" cy="0" r="18" fill="#5D4037"/>
  <circle cx="0" cy="0" r="18" fill="url(#seed-dots)" opacity="0.5"/>
</g>
```

### 8.4 Grass & Weeds

Blade clusters fanning from a base point, dandelion puffball (radial lines with seed circles at tips):

```svg
<g id="weeds-and-grass">
  <g transform="translate(60, 280)">
    <path d="M 0,0 Q -8,-15 -12,-30" fill="none" stroke="#2E7D32" stroke-width="1"/>
    <path d="M 0,0 Q -3,-18 -5,-35"  fill="none" stroke="#388E3C" stroke-width="1"/>
    <path d="M 0,0 Q 2,-20 0,-38"    fill="none" stroke="#2E7D32" stroke-width="1.2"/>
    <path d="M 0,0 Q 5,-18 8,-33"    fill="none" stroke="#388E3C" stroke-width="1"/>
  </g>
  <!-- Dandelion: stem + 8 radial lines with seed circles -->
  <g transform="translate(150, 280)">
    <path d="M 0,0 Q -1,-20 0,-45" fill="none" stroke="#6D8B4E" stroke-width="1"/>
    <g transform="translate(0, -45)">
      <g stroke="#CCC" stroke-width="0.3">
        <line x1="0" y1="0" x2="0" y2="-10"/><line x1="0" y1="0" x2="7" y2="-7"/>
        <line x1="0" y1="0" x2="10" y2="0"/><line x1="0" y1="0" x2="7" y2="7"/>
        <line x1="0" y1="0" x2="0" y2="10"/><line x1="0" y1="0" x2="-7" y2="7"/>
        <line x1="0" y1="0" x2="-10" y2="0"/><line x1="0" y1="0" x2="-7" y2="-7"/>
      </g>
      <g fill="white" opacity="0.6">
        <circle cx="0" cy="-10" r="1"/><circle cx="7" cy="-7" r="1"/>
        <circle cx="10" cy="0" r="1"/><circle cx="-10" cy="0" r="1"/>
      </g>
    </g>
  </g>
</g>
```

---

## Related References

- `color-and-gradients.md` — Gradient techniques for sky, water, and natural lighting
- `svg-filters-and-effects.md` — Filter chains for cloud edges, water ripples, smoke blur
- `composition.md` — Landscape composition, depth layering, horizon placement
- `bezier-and-curves.md` — Organic curves for natural shapes (tree trunks, rivers, flames)
- `materials-and-textures.md` — Surface rendering for rock, bark, sand, water
- `illustration-styles.md` — Stylistic approaches (flat, watercolor, line-art) applied to nature scenes
