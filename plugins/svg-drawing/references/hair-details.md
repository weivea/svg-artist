# Hair Details

## Strand Group Technique

Hair is drawn as groups of overlapping paths, not individual strands.

### Layer Structure (back to front)
1. **Base mass:** Overall hair silhouette as a filled path
2. **Shadow sections:** Darker-colored path groups for depth
3. **Mid-tone strands:** Main visible strand groups
4. **Highlight bands:** Lighter strips following hair flow
5. **Edge wisps:** Fine loose strands at hairline and tips

```xml
<!-- Anime hair: flowing side-swept bangs -->
<defs>
  <linearGradient id="hair-base" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="#2A1810"/>
    <stop offset="100%" stop-color="#4A2C1A"/>
  </linearGradient>
  <linearGradient id="hair-highlight" x1="0.3" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="40%" stop-color="rgba(255,255,255,0.15)"/>
    <stop offset="60%" stop-color="rgba(255,255,255,0.15)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>
</defs>

<!-- Layer: hair-base-mass -->
<path d="M 30 10 C 20 5, 10 15, 15 40
         C 18 55, 25 65, 30 70
         L 70 70 C 75 65, 82 55, 85 40
         C 90 15, 80 5, 70 10
         Q 60 5, 50 8 Q 40 5, 30 10 Z"
      fill="url(#hair-base)"/>

<!-- Layer: shadow-sections -->
<path d="M 20 30 C 22 40, 25 55, 30 65
         C 32 55, 28 40, 25 30 Z"
      fill="#1A0E08" opacity="0.4"/>

<!-- Layer: strand-group-1 (bangs) -->
<path d="M 35 12 C 30 15, 28 25, 25 40"
      fill="none" stroke="#5A3820" stroke-width="3" stroke-linecap="round"/>
<path d="M 42 10 C 38 14, 35 22, 32 38"
      fill="none" stroke="#5A3820" stroke-width="2.5" stroke-linecap="round"/>

<!-- Layer: highlight-band -->
<path d="M 45 12 C 42 20, 40 35, 42 55"
      fill="none" stroke="url(#hair-highlight)" stroke-width="8" stroke-linecap="round"/>
```

## Hair Style References

| Style | Key Features | Strand Width | Highlight Approach |
|-------|-------------|-------------|-------------------|
| Anime | Bold sections, sharp highlights | 2-4px | Hard-edge white bands |
| Realistic | Many thin overlapping strands | 0.5-1.5px | Gradient overlay |
| Cartoon | Simple mass + few accent lines | 3-6px | None or single spot |
| Watercolor | Soft edges, color bleeding | Variable | Wet-edge effect |

## Hair Physics and Flow

### Crown Point and Flow Direction

All hair originates from the **crown point** — located at the top-center-back of the head (roughly 60-65% up from chin, centered or slightly behind center). Every strand group radiates outward from this point, following the curvature of the skull before gravity pulls it downward.

**Rules of hair flow:**
- Hair flows FROM the crown outward in all directions
- Gravity is the dominant force — hair hangs down unless supported or styled
- Hair follows the contour of the head (forehead, temples, ears) before falling free
- Part lines create a division where hair flows to opposite sides
- The forehead hairline is a key anchor — bangs originate from just behind the crown

```xml
<!-- Hair flow lines from crown point -->
<defs>
  <marker id="flow-arrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
    <path d="M 0 0 L 6 2 L 0 4 Z" fill="#888"/>
  </marker>
</defs>

<!-- Crown point -->
<circle cx="50" cy="15" r="2" fill="#E44"/>

<!-- Flow lines radiating from crown -->
<!-- Forward flow (becomes bangs) -->
<path d="M 50 15 C 48 12, 42 10, 35 15 C 28 20, 25 30, 24 45"
      fill="none" stroke="#888" stroke-width="0.5" stroke-dasharray="3,2"
      marker-end="url(#flow-arrow)"/>
<path d="M 50 15 C 50 10, 50 8, 50 12 C 50 18, 48 25, 46 40"
      fill="none" stroke="#888" stroke-width="0.5" stroke-dasharray="3,2"
      marker-end="url(#flow-arrow)"/>

<!-- Side flow (left) -->
<path d="M 50 15 C 44 14, 35 15, 25 20 C 18 25, 14 35, 12 50"
      fill="none" stroke="#888" stroke-width="0.5" stroke-dasharray="3,2"
      marker-end="url(#flow-arrow)"/>

<!-- Side flow (right) -->
<path d="M 50 15 C 56 14, 65 15, 75 20 C 82 25, 86 35, 88 50"
      fill="none" stroke="#888" stroke-width="0.5" stroke-dasharray="3,2"
      marker-end="url(#flow-arrow)"/>

<!-- Back flow (falls straight down) -->
<path d="M 50 15 C 50 20, 50 30, 50 55"
      fill="none" stroke="#888" stroke-width="0.5" stroke-dasharray="3,2"
      marker-end="url(#flow-arrow)"/>
<path d="M 50 15 C 55 18, 60 28, 62 55"
      fill="none" stroke="#888" stroke-width="0.5" stroke-dasharray="3,2"
      marker-end="url(#flow-arrow)"/>
<path d="M 50 15 C 45 18, 40 28, 38 55"
      fill="none" stroke="#888" stroke-width="0.5" stroke-dasharray="3,2"
      marker-end="url(#flow-arrow)"/>
```

### Hair in Motion

Hair reacts to forces with a slight delay — it is attached at the scalp but the rest is free-hanging mass affected by inertia, gravity, and air resistance.

#### Wind Effect
All strands curve in the wind direction. The tips deflect more than the roots. Lighter/thinner strands move more.

```xml
<!-- Wind blowing from left to right -->
<defs>
  <linearGradient id="wind-hair-grad" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="#3A2010"/>
    <stop offset="100%" stop-color="#5A3820"/>
  </linearGradient>
</defs>

<!-- Base mass pushed by wind -->
<path d="M 30 12 C 25 8, 15 12, 18 35
         C 20 50, 28 60, 35 65
         L 40 68 C 55 72, 70 70, 82 60
         C 90 52, 95 40, 88 28
         C 82 15, 72 8, 65 10
         Q 55 6, 45 9 Q 38 6, 30 12 Z"
      fill="url(#wind-hair-grad)"/>

<!-- Wind-swept strand groups — all curve rightward -->
<path d="M 35 14 C 40 16, 52 22, 65 30 C 72 35, 80 38, 88 36"
      fill="none" stroke="#5A3820" stroke-width="2" stroke-linecap="round"/>
<path d="M 32 18 C 38 22, 48 30, 60 40 C 70 48, 80 50, 90 46"
      fill="none" stroke="#5A3820" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 28 25 C 35 30, 45 40, 58 50 C 68 58, 78 60, 86 56"
      fill="none" stroke="#4A2C1A" stroke-width="1.5" stroke-linecap="round"/>

<!-- Flyaway wisps blown further -->
<path d="M 82 30 C 88 28, 94 26, 100 28"
      fill="none" stroke="#6B4830" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>
<path d="M 86 42 C 92 40, 98 39, 105 42"
      fill="none" stroke="#6B4830" stroke-width="0.6" stroke-linecap="round" opacity="0.5"/>
```

#### Turning Head
Hair lags behind the head's movement direction due to inertia. The side opposite to the turn direction shows more hair volume.

```xml
<!-- Head turning right — hair lags to the left -->
<path d="M 35 10 C 25 6, 10 14, 12 38
         C 14 52, 22 62, 30 68
         L 65 65 C 70 60, 75 50, 76 38
         C 78 20, 72 10, 65 12
         Q 55 8, 45 10 Q 40 7, 35 10 Z"
      fill="#3A2010"/>

<!-- Lagging strand groups sweep left -->
<path d="M 40 12 C 34 15, 22 22, 15 35 C 10 45, 8 55, 12 62"
      fill="none" stroke="#5A3820" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 48 10 C 40 14, 30 24, 22 38 C 16 50, 14 58, 18 64"
      fill="none" stroke="#5A3820" stroke-width="2" stroke-linecap="round"/>

<!-- Right side stays closer to head -->
<path d="M 62 14 C 66 18, 70 28, 72 40"
      fill="none" stroke="#5A3820" stroke-width="1.5" stroke-linecap="round"/>
```

#### Jumping / Upward Motion
Hair lifts upward as the body rises — strands float and spread. Tips point upward or outward.

```xml
<!-- Hair lifting during upward jump -->
<path d="M 30 20 C 22 18, 10 10, 8 0
         C 6 -8, 10 -12, 18 -8
         L 82 -8 C 90 -12, 94 -8, 92 0
         C 90 10, 78 18, 70 20
         Q 60 18, 50 20 Q 40 18, 30 20 Z"
      fill="#3A2010"/>

<!-- Strands floating upward -->
<path d="M 35 18 C 30 12, 24 2, 20 -8 C 18 -14, 16 -18, 14 -22"
      fill="none" stroke="#5A3820" stroke-width="2" stroke-linecap="round"/>
<path d="M 50 18 C 50 10, 50 0, 50 -10 C 50 -16, 50 -20, 50 -24"
      fill="none" stroke="#5A3820" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 65 18 C 70 12, 76 2, 80 -8 C 82 -14, 84 -18, 86 -22"
      fill="none" stroke="#5A3820" stroke-width="2" stroke-linecap="round"/>

<!-- Light wisps floating highest -->
<path d="M 28 -5 C 24 -12, 20 -20, 18 -28"
      fill="none" stroke="#6B4830" stroke-width="0.7" stroke-linecap="round" opacity="0.5"/>
<path d="M 72 -5 C 76 -12, 80 -20, 82 -28"
      fill="none" stroke="#6B4830" stroke-width="0.7" stroke-linecap="round" opacity="0.5"/>
```

## Highlight Systems

Highlights give hair its three-dimensional, lustrous appearance. The approach varies dramatically by illustration style.

### Anime Highlight (Hard Edge)

Anime hair highlights are bold, graphic shapes with sharp boundaries. They follow the curvature of the major hair sections and are typically placed where light hits the largest curved surface.

**Characteristics:**
- Single bright band following hair curve
- Sharp edges, high contrast
- Often pure white or very light tint of hair color
- Placed on the topmost curve of each major strand group
- May be clipped to the hair silhouette to keep clean edges

```xml
<!-- Anime-style hard-edge highlight -->
<defs>
  <clipPath id="hair-clip">
    <path d="M 30 10 C 20 5, 10 15, 15 40
             C 18 55, 25 65, 30 70
             L 70 70 C 75 65, 82 55, 85 40
             C 90 15, 80 5, 70 10
             Q 60 5, 50 8 Q 40 5, 30 10 Z"/>
  </clipPath>
</defs>

<!-- Hair base mass -->
<path d="M 30 10 C 20 5, 10 15, 15 40
         C 18 55, 25 65, 30 70
         L 70 70 C 75 65, 82 55, 85 40
         C 90 15, 80 5, 70 10
         Q 60 5, 50 8 Q 40 5, 30 10 Z"
      fill="#2A1810"/>

<!-- Hard-edge highlight band (clipped to hair) -->
<g clip-path="url(#hair-clip)">
  <!-- Primary highlight: bright band across top curve -->
  <path d="M 32 18 C 38 15, 45 14, 52 15
           C 58 16, 64 18, 68 22
           L 65 28 C 60 24, 54 22, 48 22
           C 42 22, 36 24, 33 26 Z"
        fill="#FFFFFF" opacity="0.85"/>

  <!-- Secondary smaller highlight on bangs -->
  <path d="M 38 30 C 40 28, 44 27, 46 28
           L 44 34 C 42 33, 40 33, 38 34 Z"
        fill="#FFFFFF" opacity="0.6"/>
</g>
```

### Realistic Highlight (Gradient)

Realistic hair highlights simulate how light reflects off cylindrical strand groups. Multiple soft highlight areas overlap, creating a nuanced luminous effect.

**Characteristics:**
- Multiple soft highlight areas across hair volume
- Follows the cylindrical form of strand groups
- Uses gradient overlays (transparent → white → transparent)
- Each strand group has its own highlight position
- Secondary reflections in darker areas add realism

```xml
<!-- Realistic gradient highlight system -->
<defs>
  <!-- Primary specular highlight gradient -->
  <linearGradient id="highlight-spec" x1="0.3" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="35%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="45%" stop-color="rgba(255,255,255,0.25)"/>
    <stop offset="50%" stop-color="rgba(255,255,255,0.35)"/>
    <stop offset="55%" stop-color="rgba(255,255,255,0.25)"/>
    <stop offset="65%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>

  <!-- Softer secondary highlight -->
  <linearGradient id="highlight-soft" x1="0.2" y1="0" x2="0.8" y2="1">
    <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="40%" stop-color="rgba(255,255,255,0.08)"/>
    <stop offset="60%" stop-color="rgba(255,255,255,0.08)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>

  <!-- Rim light for edge definition -->
  <linearGradient id="highlight-rim" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="rgba(255,255,255,0.2)"/>
    <stop offset="15%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="85%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0.15)"/>
  </linearGradient>
</defs>

<!-- Apply highlights as overlay strokes on strand groups -->
<path d="M 40 12 C 36 18, 34 30, 35 50"
      fill="none" stroke="url(#highlight-spec)" stroke-width="10" stroke-linecap="round"/>
<path d="M 55 10 C 54 16, 52 28, 50 48"
      fill="none" stroke="url(#highlight-spec)" stroke-width="12" stroke-linecap="round"/>
<path d="M 65 14 C 68 22, 70 34, 68 52"
      fill="none" stroke="url(#highlight-soft)" stroke-width="8" stroke-linecap="round"/>

<!-- Rim light along hair edge -->
<path d="M 30 10 C 20 5, 10 15, 15 40 C 18 55, 25 65, 30 70"
      fill="none" stroke="url(#highlight-rim)" stroke-width="4" stroke-linecap="round"/>
```

### Ring Light Highlight

A modern illustration technique where the highlight forms a circular or arc-shaped band across the top of the head, simulating ring light photography.

**Characteristics:**
- Circular or arc-shaped highlight on top of head
- Popular in modern digital illustration and portrait art
- Creates a distinctive "studio lit" look
- Usually a gradient stroke that fades at the ends

```xml
<!-- Ring light highlight on hair -->
<defs>
  <linearGradient id="ring-light-grad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="20%" stop-color="rgba(255,255,255,0.5)"/>
    <stop offset="50%" stop-color="rgba(255,255,255,0.7)"/>
    <stop offset="80%" stop-color="rgba(255,255,255,0.5)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>
  <clipPath id="ring-hair-clip">
    <path d="M 30 10 C 20 5, 10 15, 15 40
             C 18 55, 25 65, 30 70
             L 70 70 C 75 65, 82 55, 85 40
             C 90 15, 80 5, 70 10
             Q 60 5, 50 8 Q 40 5, 30 10 Z"/>
  </clipPath>
</defs>

<!-- Ring light arc across top of hair -->
<g clip-path="url(#ring-hair-clip)">
  <path d="M 25 25 C 30 12, 42 6, 50 5
           C 58 6, 70 12, 75 25"
        fill="none" stroke="url(#ring-light-grad)"
        stroke-width="6" stroke-linecap="round"/>

  <!-- Thinner secondary ring -->
  <path d="M 28 30 C 33 18, 43 12, 50 11
           C 57 12, 67 18, 72 30"
        fill="none" stroke="url(#ring-light-grad)"
        stroke-width="3" stroke-linecap="round" opacity="0.5"/>
</g>
```

## Hairstyle Templates

Each template provides a complete SVG code example that can be adapted. All templates assume a head centered at roughly (50, 40) with a radius of about 25 units.

### Short Styles

#### 1. Buzz Cut
Very close to the head with a stubble-like texture. The hair barely extends beyond the skull outline.

```xml
<!-- Buzz cut: stipple texture on scalp -->
<defs>
  <filter id="buzz-texture" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="turbulence" baseFrequency="1.5" numOctaves="3" seed="42" result="noise"/>
    <feColorMatrix type="saturate" values="0" in="noise" result="gray-noise"/>
    <feComponentTransfer in="gray-noise" result="threshold">
      <feFuncA type="discrete" tableValues="0 0 0 0.6 0.8"/>
    </feComponentTransfer>
    <feFlood flood-color="#1A1A1A" result="hair-color"/>
    <feComposite in="hair-color" in2="threshold" operator="in" result="dots"/>
    <feComposite in="dots" in2="SourceGraphic" operator="over"/>
  </filter>
  <clipPath id="buzz-clip">
    <!-- Slightly larger than head to show hair coverage -->
    <ellipse cx="50" cy="35" rx="27" ry="30"/>
  </clipPath>
</defs>

<!-- Scalp area with buzz texture -->
<g clip-path="url(#buzz-clip)">
  <ellipse cx="50" cy="35" rx="27" ry="30" fill="#D4A574"/>
  <ellipse cx="50" cy="35" rx="27" ry="30" fill="#2A2A2A" opacity="0.35" filter="url(#buzz-texture)"/>
</g>

<!-- Subtle hairline definition -->
<path d="M 28 28 C 32 18, 40 14, 50 13 C 60 14, 68 18, 72 28"
      fill="none" stroke="#1A1A1A" stroke-width="0.5" opacity="0.4"/>
```

#### 3. Pixie Cut
Short with styled bangs — longer on top, shorter at the sides and back. Textured, piece-y look.

```xml
<!-- Pixie cut: short textured style -->
<defs>
  <linearGradient id="pixie-grad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#5A3820"/>
    <stop offset="100%" stop-color="#3A2010"/>
  </linearGradient>
</defs>

<!-- Base mass: short overall, longer bangs -->
<path d="M 28 30 C 24 22, 28 14, 35 10
         C 42 7, 50 6, 58 7
         C 66 9, 74 14, 76 22
         C 78 28, 76 34, 74 36
         L 72 32 C 72 28, 70 24, 65 22
         L 50 20 L 30 28 Z"
      fill="url(#pixie-grad)"/>

<!-- Styled bangs sweeping to the right -->
<path d="M 35 10 C 32 14, 30 20, 28 28"
      fill="none" stroke="#5A3820" stroke-width="3" stroke-linecap="round"/>
<path d="M 40 8 C 36 12, 33 18, 30 26"
      fill="none" stroke="#4A2C1A" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 46 7 C 42 11, 38 18, 35 26"
      fill="none" stroke="#5A3820" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 52 7 C 46 10, 42 16, 38 24"
      fill="none" stroke="#4A2C1A" stroke-width="2" stroke-linecap="round"/>

<!-- Short textured pieces on sides -->
<path d="M 74 24 C 76 28, 76 32, 74 36"
      fill="none" stroke="#3A2010" stroke-width="1.5" stroke-linecap="round"/>
<path d="M 72 22 C 74 26, 75 30, 73 34"
      fill="none" stroke="#4A2C1A" stroke-width="1" stroke-linecap="round"/>

<!-- Top texture/highlight -->
<path d="M 42 9 C 48 7, 55 7, 62 10"
      fill="none" stroke="#8B6B50" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
```

#### 4. Undercut
Long on top (can be slicked back or flopped to one side), shaved/very short on the sides.

```xml
<!-- Undercut: long top, shaved sides -->
<defs>
  <linearGradient id="undercut-top" x1="0" y1="0" x2="0.8" y2="1">
    <stop offset="0%" stop-color="#2A1810"/>
    <stop offset="100%" stop-color="#4A2C1A"/>
  </linearGradient>
</defs>

<!-- Shaved sides (stubble) -->
<path d="M 25 28 C 24 32, 24 38, 26 42 L 28 42 C 26 38, 26 32, 27 28 Z"
      fill="#1A1A1A" opacity="0.25"/>
<path d="M 75 28 C 76 32, 76 38, 74 42 L 72 42 C 74 38, 74 32, 73 28 Z"
      fill="#1A1A1A" opacity="0.25"/>

<!-- Long top section, swept to one side -->
<path d="M 30 24 C 28 16, 34 8, 42 6
         C 50 4, 60 5, 66 8
         C 72 11, 76 18, 78 26
         C 80 32, 82 36, 84 38
         L 76 34 C 74 30, 70 24, 64 20
         C 58 16, 48 14, 40 16
         C 34 18, 30 22, 30 24 Z"
      fill="url(#undercut-top)"/>

<!-- Strand groups flowing to one side -->
<path d="M 42 8 C 50 10, 62 16, 72 26 C 76 30, 80 34, 82 36"
      fill="none" stroke="#5A3820" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 48 6 C 56 8, 66 14, 74 22 C 78 28, 82 32, 84 34"
      fill="none" stroke="#4A2C1A" stroke-width="2" stroke-linecap="round"/>
<path d="M 38 10 C 46 12, 58 18, 68 28 C 72 32, 76 36, 78 38"
      fill="none" stroke="#5A3820" stroke-width="1.5" stroke-linecap="round"/>

<!-- Dividing line between shaved and long -->
<path d="M 28 26 C 40 22, 55 20, 72 24"
      fill="none" stroke="#1A0E08" stroke-width="0.8" opacity="0.6"/>
```

### Medium Styles

#### 5. Bob
Chin-length cut, can be straight or wavy. Clean silhouette with inward-curving tips.

```xml
<!-- Bob: chin-length with inward-curving tips -->
<defs>
  <linearGradient id="bob-grad" x1="0.2" y1="0" x2="0.5" y2="1">
    <stop offset="0%" stop-color="#1A0E08"/>
    <stop offset="60%" stop-color="#3A2010"/>
    <stop offset="100%" stop-color="#4A2C1A"/>
  </linearGradient>
  <linearGradient id="bob-highlight" x1="0.4" y1="0" x2="0.6" y2="1">
    <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="40%" stop-color="rgba(255,255,255,0.12)"/>
    <stop offset="60%" stop-color="rgba(255,255,255,0.12)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>
</defs>

<!-- Base mass: smooth bob silhouette -->
<path d="M 25 18 C 22 12, 30 6, 40 5
         C 50 4, 60 4, 68 6
         C 76 8, 80 14, 78 22
         C 76 35, 76 50, 72 58
         C 68 64, 62 66, 58 64
         L 42 64 C 38 66, 32 64, 28 58
         C 24 50, 24 35, 25 18 Z"
      fill="url(#bob-grad)"/>

<!-- Shadow under top layer -->
<path d="M 28 30 C 30 34, 32 44, 34 54 C 36 60, 38 62, 40 62"
      fill="none" stroke="#0D0705" stroke-width="4" stroke-linecap="round" opacity="0.3"/>
<path d="M 72 30 C 70 34, 68 44, 66 54 C 64 60, 62 62, 60 62"
      fill="none" stroke="#0D0705" stroke-width="4" stroke-linecap="round" opacity="0.3"/>

<!-- Strand groups -->
<path d="M 38 8 C 36 14, 34 28, 33 44 C 32 54, 34 60, 38 62"
      fill="none" stroke="#4A2C1A" stroke-width="2" stroke-linecap="round"/>
<path d="M 50 5 C 50 12, 49 28, 48 44 C 47 54, 48 60, 50 62"
      fill="none" stroke="#4A2C1A" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 62 7 C 64 14, 66 28, 67 44 C 68 54, 66 60, 62 62"
      fill="none" stroke="#4A2C1A" stroke-width="2" stroke-linecap="round"/>

<!-- Inward curl at tips (signature bob detail) -->
<path d="M 34 58 C 36 62, 40 64, 44 62"
      fill="none" stroke="#3A2010" stroke-width="1.5" stroke-linecap="round"/>
<path d="M 66 58 C 64 62, 60 64, 56 62"
      fill="none" stroke="#3A2010" stroke-width="1.5" stroke-linecap="round"/>

<!-- Highlight band -->
<path d="M 44 8 C 44 18, 44 34, 44 52"
      fill="none" stroke="url(#bob-highlight)" stroke-width="10" stroke-linecap="round"/>
```

#### 7. Side-Swept
Asymmetric style where hair sweeps heavily to one side, creating dramatic volume on one side.

```xml
<!-- Side-swept: heavy asymmetric sweep to the right -->
<defs>
  <linearGradient id="sweep-grad" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0%" stop-color="#3A2010"/>
    <stop offset="100%" stop-color="#5A3820"/>
  </linearGradient>
</defs>

<!-- Base mass: much more volume on the right -->
<path d="M 38 16 C 34 10, 38 4, 46 3
         C 54 2, 62 3, 68 6
         C 76 10, 82 18, 84 28
         C 86 38, 86 48, 82 56
         C 78 62, 72 64, 68 60
         L 32 55 C 28 52, 26 46, 26 38
         C 26 30, 30 22, 38 16 Z"
      fill="url(#sweep-grad)"/>

<!-- Swept strand groups — all flowing to the right -->
<path d="M 42 5 C 50 6, 62 12, 72 22 C 78 30, 82 40, 80 52"
      fill="none" stroke="#4A2C1A" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 46 4 C 54 5, 66 10, 76 20 C 82 28, 84 38, 82 50"
      fill="none" stroke="#5A3820" stroke-width="2" stroke-linecap="round"/>
<path d="M 40 8 C 48 10, 58 16, 68 26 C 74 34, 78 44, 76 54"
      fill="none" stroke="#4A2C1A" stroke-width="2" stroke-linecap="round"/>

<!-- Left side: hair pulled tight, close to head -->
<path d="M 38 16 C 34 20, 30 28, 28 38"
      fill="none" stroke="#2A1810" stroke-width="1.5" stroke-linecap="round"/>
<path d="M 40 14 C 36 18, 32 26, 30 36"
      fill="none" stroke="#2A1810" stroke-width="1" stroke-linecap="round"/>

<!-- Highlight on the sweep's crest -->
<path d="M 50 5 C 60 8, 72 16, 78 26"
      fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="6" stroke-linecap="round"/>
```

### Long Styles

#### 9. Wavy Hair
Long with gentle S-curves throughout. Each strand group undulates independently.

```xml
<!-- Wavy long hair: flowing S-curves -->
<defs>
  <linearGradient id="wavy-grad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#5A3820"/>
    <stop offset="100%" stop-color="#3A2010"/>
  </linearGradient>
</defs>

<!-- Base mass with wavy silhouette -->
<path d="M 28 14 C 22 8, 28 2, 38 1
         C 48 0, 58 0, 68 2
         C 78 4, 82 10, 80 18
         C 78 30, 82 42, 78 54
         C 74 66, 78 78, 74 88
         C 70 96, 62 98, 56 96
         L 44 96 C 38 98, 30 96, 26 88
         C 22 78, 26 66, 22 54
         C 18 42, 22 30, 28 14 Z"
      fill="url(#wavy-grad)"/>

<!-- Shadow sections in the wave valleys -->
<path d="M 26 40 C 22 48, 24 56, 28 62"
      fill="none" stroke="#1A0E08" stroke-width="5" stroke-linecap="round" opacity="0.3"/>
<path d="M 74 40 C 78 48, 76 56, 72 62"
      fill="none" stroke="#1A0E08" stroke-width="5" stroke-linecap="round" opacity="0.3"/>

<!-- Wavy strand groups with S-curves -->
<path d="M 36 4 C 34 14, 30 24, 34 36
         C 38 48, 32 58, 36 70
         C 40 82, 34 90, 38 96"
      fill="none" stroke="#6B4830" stroke-width="2" stroke-linecap="round"/>
<path d="M 44 2 C 42 12, 38 22, 42 34
         C 46 46, 40 56, 44 68
         C 48 80, 42 88, 44 94"
      fill="none" stroke="#5A3820" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 56 2 C 58 12, 62 22, 58 34
         C 54 46, 60 56, 56 68
         C 52 80, 58 88, 56 94"
      fill="none" stroke="#5A3820" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 64 4 C 66 14, 70 24, 66 36
         C 62 48, 68 58, 64 70
         C 60 82, 66 90, 62 96"
      fill="none" stroke="#6B4830" stroke-width="2" stroke-linecap="round"/>

<!-- Highlights on wave crests -->
<path d="M 42 34 C 46 36, 48 38, 44 42"
      fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="4" stroke-linecap="round"/>
<path d="M 58 34 C 54 36, 52 38, 56 42"
      fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="4" stroke-linecap="round"/>
<path d="M 40 68 C 44 70, 46 72, 42 76"
      fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3" stroke-linecap="round"/>
```

#### 11. Braided Hair
A single braid hanging down the back or over one shoulder. The braid is built from a repeating pattern of overlapping segments.

```xml
<!-- Single braid: woven pattern -->
<defs>
  <linearGradient id="braid-grad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#3A2010"/>
    <stop offset="100%" stop-color="#2A1810"/>
  </linearGradient>
</defs>

<!-- Hair at top of head flowing into braid start -->
<path d="M 30 14 C 26 8, 32 2, 40 1
         C 48 0, 56 0, 64 2
         C 72 4, 76 10, 74 18
         C 72 24, 66 28, 60 30
         L 40 30 C 34 28, 28 24, 30 14 Z"
      fill="url(#braid-grad)"/>

<!-- Gathered nape area -->
<path d="M 40 30 C 42 34, 46 36, 50 37 C 54 36, 58 34, 60 30"
      fill="#2A1810"/>

<!-- Braid segments: alternating left-right overlapping ellipses -->
<!-- Segment 1 -->
<ellipse cx="47" cy="42" rx="6" ry="4" fill="#4A2C1A"
         transform="rotate(-15, 47, 42)"/>
<ellipse cx="53" cy="42" rx="6" ry="4" fill="#3A2010"
         transform="rotate(15, 53, 42)"/>

<!-- Segment 2 -->
<ellipse cx="47" cy="50" rx="6" ry="4" fill="#3A2010"
         transform="rotate(15, 47, 50)"/>
<ellipse cx="53" cy="50" rx="6" ry="4" fill="#4A2C1A"
         transform="rotate(-15, 53, 50)"/>

<!-- Segment 3 -->
<ellipse cx="47" cy="58" rx="6" ry="4" fill="#4A2C1A"
         transform="rotate(-15, 47, 58)"/>
<ellipse cx="53" cy="58" rx="6" ry="4" fill="#3A2010"
         transform="rotate(15, 53, 58)"/>

<!-- Segment 4 -->
<ellipse cx="47" cy="66" rx="6" ry="4" fill="#3A2010"
         transform="rotate(15, 47, 66)"/>
<ellipse cx="53" cy="66" rx="6" ry="4" fill="#4A2C1A"
         transform="rotate(-15, 53, 66)"/>

<!-- Segment 5 -->
<ellipse cx="47" cy="74" rx="6" ry="4" fill="#4A2C1A"
         transform="rotate(-15, 47, 74)"/>
<ellipse cx="53" cy="74" rx="6" ry="4" fill="#3A2010"
         transform="rotate(15, 53, 74)"/>

<!-- Braid tie -->
<ellipse cx="50" cy="80" rx="4" ry="2.5" fill="#C4A870"/>

<!-- Tassel below tie -->
<path d="M 46 82 C 44 86, 46 90, 48 92"
      fill="none" stroke="#3A2010" stroke-width="1.5" stroke-linecap="round"/>
<path d="M 50 82 C 50 86, 50 90, 50 94"
      fill="none" stroke="#4A2C1A" stroke-width="1.5" stroke-linecap="round"/>
<path d="M 54 82 C 56 86, 54 90, 52 92"
      fill="none" stroke="#3A2010" stroke-width="1.5" stroke-linecap="round"/>

<!-- Center line detail on each braid segment -->
<path d="M 50 38 L 50 80" fill="none" stroke="#1A0E08" stroke-width="0.5" opacity="0.3"/>
```

### Updos

#### 12. Bun
Hair gathered and twisted at the back or top of the head into a round shape.

```xml
<!-- Hair bun: gathered at top-back of head -->
<defs>
  <radialGradient id="bun-grad" cx="50%" cy="40%" r="50%">
    <stop offset="0%" stop-color="#5A3820"/>
    <stop offset="70%" stop-color="#3A2010"/>
    <stop offset="100%" stop-color="#2A1810"/>
  </radialGradient>
</defs>

<!-- Hair swept up from sides -->
<path d="M 28 30 C 26 22, 30 14, 38 10
         C 42 8, 46 7, 50 7
         C 54 7, 58 8, 62 10
         C 70 14, 74 22, 72 30
         L 68 28 C 66 22, 60 16, 54 14
         L 46 14 C 40 16, 34 22, 32 28 Z"
      fill="#3A2010"/>

<!-- Gathering lines showing hair being pulled up -->
<path d="M 32 28 C 36 22, 42 16, 50 14"
      fill="none" stroke="#4A2C1A" stroke-width="1.5" stroke-linecap="round"/>
<path d="M 68 28 C 64 22, 58 16, 50 14"
      fill="none" stroke="#4A2C1A" stroke-width="1.5" stroke-linecap="round"/>
<path d="M 34 26 C 38 20, 44 15, 50 13"
      fill="none" stroke="#2A1810" stroke-width="1" stroke-linecap="round"/>

<!-- The bun itself -->
<circle cx="50" cy="8" r="10" fill="url(#bun-grad)"/>

<!-- Swirl detail showing twisted hair -->
<path d="M 44 6 C 46 2, 52 2, 54 6 C 56 10, 50 12, 48 8"
      fill="none" stroke="#2A1810" stroke-width="1" opacity="0.5"/>
<path d="M 46 4 C 48 1, 53 1, 55 4"
      fill="none" stroke="#6B4830" stroke-width="0.8" opacity="0.4"/>

<!-- Wispy escaped strands (realistic detail) -->
<path d="M 36 18 C 34 20, 33 24, 34 28"
      fill="none" stroke="#5A3820" stroke-width="0.6" stroke-linecap="round" opacity="0.6"/>
<path d="M 64 18 C 66 20, 67 24, 66 28"
      fill="none" stroke="#5A3820" stroke-width="0.6" stroke-linecap="round" opacity="0.6"/>
<path d="M 50 18 C 48 20, 48 22, 49 24"
      fill="none" stroke="#5A3820" stroke-width="0.5" stroke-linecap="round" opacity="0.5"/>
```

#### 15. Messy Updo
Loosely gathered hair with intentional escaped wisps and visible texture. Romantic and natural.

```xml
<!-- Messy updo: loosely gathered with escaped wisps -->
<defs>
  <radialGradient id="messy-bun-grad" cx="50%" cy="45%" r="50%">
    <stop offset="0%" stop-color="#6B4830"/>
    <stop offset="60%" stop-color="#4A2C1A"/>
    <stop offset="100%" stop-color="#3A2010"/>
  </radialGradient>
</defs>

<!-- Hair swept up loosely from sides -->
<path d="M 26 34 C 24 24, 28 14, 36 10
         C 44 6, 56 6, 64 10
         C 72 14, 76 24, 74 34
         L 70 30 C 68 22, 62 16, 54 13
         L 46 13 C 38 16, 32 22, 30 30 Z"
      fill="#3A2010"/>

<!-- Loosely gathered visible strands -->
<path d="M 30 30 C 34 22, 40 16, 48 12"
      fill="none" stroke="#5A3820" stroke-width="2" stroke-linecap="round"/>
<path d="M 70 30 C 66 22, 60 16, 52 12"
      fill="none" stroke="#5A3820" stroke-width="2" stroke-linecap="round"/>

<!-- Messy bun shape (irregular, not a perfect circle) -->
<path d="M 40 4 C 36 0, 38 -6, 44 -8
         C 48 -10, 54 -10, 58 -8
         C 64 -6, 66 0, 62 4
         C 60 8, 56 10, 50 10
         C 44 10, 40 8, 40 4 Z"
      fill="url(#messy-bun-grad)"/>

<!-- Texture loops on the bun -->
<path d="M 44 -2 C 46 -6, 50 -8, 54 -6 C 56 -4, 54 -1, 52 0"
      fill="none" stroke="#2A1810" stroke-width="1" opacity="0.5"/>
<path d="M 48 2 C 50 -2, 54 -4, 56 -2 C 58 0, 56 3, 52 4"
      fill="none" stroke="#2A1810" stroke-width="0.8" opacity="0.4"/>
<path d="M 42 0 C 44 -4, 48 -6, 50 -4"
      fill="none" stroke="#6B4830" stroke-width="0.8" opacity="0.4"/>

<!-- Escaped wisps — the key "messy" detail -->
<path d="M 32 22 C 30 26, 28 32, 30 38"
      fill="none" stroke="#5A3820" stroke-width="0.7" stroke-linecap="round" opacity="0.7"/>
<path d="M 34 18 C 30 22, 28 28, 29 34"
      fill="none" stroke="#4A2C1A" stroke-width="0.6" stroke-linecap="round" opacity="0.6"/>
<path d="M 68 22 C 70 26, 72 32, 70 38"
      fill="none" stroke="#5A3820" stroke-width="0.7" stroke-linecap="round" opacity="0.7"/>
<path d="M 66 18 C 70 22, 72 28, 71 34"
      fill="none" stroke="#4A2C1A" stroke-width="0.6" stroke-linecap="round" opacity="0.6"/>

<!-- Nape wisps (hair at back of neck) -->
<path d="M 42 30 C 40 34, 38 40, 40 46"
      fill="none" stroke="#3A2010" stroke-width="0.5" stroke-linecap="round" opacity="0.5"/>
<path d="M 58 30 C 60 34, 62 40, 60 46"
      fill="none" stroke="#3A2010" stroke-width="0.5" stroke-linecap="round" opacity="0.5"/>

<!-- Face-framing tendrils -->
<path d="M 36 14 C 32 18, 30 26, 28 36 C 26 42, 28 48, 30 52"
      fill="none" stroke="#5A3820" stroke-width="0.8" stroke-linecap="round" opacity="0.7"/>
<path d="M 64 14 C 68 18, 70 26, 72 36 C 74 42, 72 48, 70 52"
      fill="none" stroke="#5A3820" stroke-width="0.8" stroke-linecap="round" opacity="0.7"/>
```

## Braids and Complex Styles

### Three-Strand Braid Pattern

A braid is built from repeating overlapping segments. Each "link" consists of two interlocking rounded shapes that alternate left-right dominance.

**Construction method:**
1. Draw a column of evenly spaced ellipses
2. Alternate their rotation angle (+15° / -15°)
3. Alternate which side overlaps (left over right, then right over left)
4. Add a center line shadow for depth

```xml
<!-- Reusable three-strand braid pattern -->
<defs>
  <pattern id="braid-pattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
    <!-- Left strand crossing over -->
    <ellipse cx="5" cy="4" rx="6" ry="3.5" fill="#4A2C1A"
             transform="rotate(-12, 5, 4)"/>
    <ellipse cx="11" cy="4" rx="6" ry="3.5" fill="#3A2010"
             transform="rotate(12, 11, 4)"/>
    <!-- Right strand crossing over -->
    <ellipse cx="5" cy="12" rx="6" ry="3.5" fill="#3A2010"
             transform="rotate(12, 5, 12)"/>
    <ellipse cx="11" cy="12" rx="6" ry="3.5" fill="#4A2C1A"
             transform="rotate(-12, 11, 12)"/>
    <!-- Center shadow -->
    <line x1="8" y1="0" x2="8" y2="16" stroke="#1A0E08" stroke-width="0.4" opacity="0.3"/>
  </pattern>
</defs>

<!-- Apply braid pattern to a braid-shaped path -->
<path d="M 46 40 L 44 90 L 56 90 L 54 40 Z"
      fill="url(#braid-pattern)" stroke="#2A1810" stroke-width="0.5"/>

<!-- Braid tie at bottom -->
<ellipse cx="50" cy="90" rx="5" ry="3" fill="#C4A870"/>
```

### French Braid

A french braid starts thin at the crown and gets progressively thicker as more hair is incorporated. Each segment is wider than the one above it.

```xml
<!-- French braid: expanding from crown -->
<defs>
  <linearGradient id="french-braid-grad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#4A2C1A"/>
    <stop offset="100%" stop-color="#3A2010"/>
  </linearGradient>
</defs>

<!-- Hair smoothly gathered toward center from sides -->
<path d="M 32 20 C 36 22, 42 24, 48 25"
      fill="none" stroke="#3A2010" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
<path d="M 68 20 C 64 22, 58 24, 52 25"
      fill="none" stroke="#3A2010" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
<path d="M 34 30 C 38 32, 44 34, 48 35"
      fill="none" stroke="#3A2010" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
<path d="M 66 30 C 62 32, 56 34, 52 35"
      fill="none" stroke="#3A2010" stroke-width="1" stroke-linecap="round" opacity="0.6"/>

<!-- Braid segments expanding in width -->
<!-- Segment 1: narrow at top (width ~6) -->
<ellipse cx="48" cy="22" rx="3.5" ry="2.5" fill="#4A2C1A" transform="rotate(-12, 48, 22)"/>
<ellipse cx="52" cy="22" rx="3.5" ry="2.5" fill="#3A2010" transform="rotate(12, 52, 22)"/>

<!-- Segment 2: slightly wider (width ~8) -->
<ellipse cx="47" cy="30" rx="4.5" ry="3" fill="#3A2010" transform="rotate(12, 47, 30)"/>
<ellipse cx="53" cy="30" rx="4.5" ry="3" fill="#4A2C1A" transform="rotate(-12, 53, 30)"/>

<!-- Segment 3: wider still (width ~10) -->
<ellipse cx="47" cy="38" rx="5.5" ry="3.5" fill="#4A2C1A" transform="rotate(-12, 47, 38)"/>
<ellipse cx="53" cy="38" rx="5.5" ry="3.5" fill="#3A2010" transform="rotate(12, 53, 38)"/>

<!-- Segment 4: near full width (width ~12) -->
<ellipse cx="46" cy="46" rx="6.5" ry="4" fill="#3A2010" transform="rotate(12, 46, 46)"/>
<ellipse cx="54" cy="46" rx="6.5" ry="4" fill="#4A2C1A" transform="rotate(-12, 54, 46)"/>

<!-- Segment 5: full width (width ~14) -->
<ellipse cx="46" cy="54" rx="7" ry="4" fill="#4A2C1A" transform="rotate(-12, 46, 54)"/>
<ellipse cx="54" cy="54" rx="7" ry="4" fill="#3A2010" transform="rotate(12, 54, 54)"/>

<!-- Continues at full width... -->
<ellipse cx="46" cy="62" rx="7" ry="4" fill="#3A2010" transform="rotate(12, 46, 62)"/>
<ellipse cx="54" cy="62" rx="7" ry="4" fill="#4A2C1A" transform="rotate(-12, 54, 62)"/>

<!-- Braid tie -->
<ellipse cx="50" cy="68" rx="5" ry="2.5" fill="#C4A870"/>

<!-- Center shadow line -->
<path d="M 50 18 L 50 68" fill="none" stroke="#1A0E08" stroke-width="0.5" opacity="0.25"/>
```

## Facial Hair

### Stubble

Stubble is rendered as a scatter of tiny dots covering the jaw, chin, and upper lip area. Can use either manual dot placement for control or a filter-based noise approach for speed.

```xml
<!-- Stubble: filter-based approach -->
<defs>
  <filter id="stubble-filter" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="turbulence" baseFrequency="2.5" numOctaves="4" seed="7" result="noise"/>
    <feColorMatrix type="saturate" values="0" in="noise" result="gray"/>
    <feComponentTransfer in="gray" result="dots">
      <feFuncA type="discrete" tableValues="0 0 0 0 0.3 0.5"/>
    </feComponentTransfer>
    <feFlood flood-color="#2A2A2A" result="color"/>
    <feComposite in="color" in2="dots" operator="in"/>
  </filter>
  <clipPath id="stubble-area">
    <!-- Jaw, chin, and upper lip region -->
    <path d="M 34 50 C 34 54, 36 62, 40 66
             C 44 70, 48 72, 50 72
             C 52 72, 56 70, 60 66
             C 64 62, 66 54, 66 50
             L 62 48 L 56 46 L 44 46 L 38 48 Z"/>
  </clipPath>
</defs>

<!-- Stubble applied to jaw area -->
<g clip-path="url(#stubble-area)">
  <rect x="30" y="44" width="40" height="32" fill="#2A2A2A" opacity="0.15"/>
  <rect x="30" y="44" width="40" height="32" filter="url(#stubble-filter)"/>
</g>
```

```xml
<!-- Stubble: manual dot approach (more control) -->
<g opacity="0.4" fill="#2A2A2A">
  <!-- Chin dots -->
  <circle cx="48" cy="68" r="0.3"/><circle cx="50" cy="69" r="0.25"/>
  <circle cx="52" cy="68" r="0.3"/><circle cx="46" cy="67" r="0.25"/>
  <circle cx="54" cy="67" r="0.3"/><circle cx="49" cy="70" r="0.2"/>
  <circle cx="51" cy="70" r="0.25"/><circle cx="47" cy="69" r="0.2"/>
  <circle cx="53" cy="69" r="0.3"/>
  <!-- Jaw line dots -->
  <circle cx="38" cy="56" r="0.25"/><circle cx="40" cy="58" r="0.3"/>
  <circle cx="42" cy="60" r="0.25"/><circle cx="60" cy="58" r="0.3"/>
  <circle cx="62" cy="56" r="0.25"/><circle cx="58" cy="60" r="0.25"/>
  <!-- Upper lip dots -->
  <circle cx="46" cy="50" r="0.2"/><circle cx="48" cy="49" r="0.25"/>
  <circle cx="50" cy="48" r="0.2"/><circle cx="52" cy="49" r="0.25"/>
  <circle cx="54" cy="50" r="0.2"/>
</g>
```

### Beard Styles

| Style | SVG Approach |
|-------|-------------|
| Full beard | Filled path covering jaw, chin, connecting to sideburns |
| Goatee | Small path on chin only |
| Mustache | Curved path above upper lip |
| Van Dyke | Separate mustache + pointed chin patch |

#### Full Beard

```xml
<!-- Full beard: covers jaw, chin, connects to sideburns -->
<defs>
  <linearGradient id="beard-grad" x1="0.5" y1="0" x2="0.5" y2="1">
    <stop offset="0%" stop-color="#2A1810"/>
    <stop offset="100%" stop-color="#1A0E08"/>
  </linearGradient>
  <filter id="beard-texture" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="turbulence" baseFrequency="1.8" numOctaves="3" seed="15" result="noise"/>
    <feColorMatrix type="saturate" values="0" in="noise" result="gray"/>
    <feComponentTransfer in="gray" result="hair">
      <feFuncA type="discrete" tableValues="0 0 0.1 0.2 0.3"/>
    </feComponentTransfer>
    <feFlood flood-color="#1A0E08" result="color"/>
    <feComposite in="color" in2="hair" operator="in" result="beard-hair"/>
    <feComposite in="beard-hair" in2="SourceGraphic" operator="over"/>
  </filter>
</defs>

<!-- Beard base mass -->
<path d="M 30 44 C 28 46, 26 52, 28 58
         C 30 64, 34 70, 38 74
         C 42 78, 46 80, 50 82
         C 54 80, 58 78, 62 74
         C 66 70, 70 64, 72 58
         C 74 52, 72 46, 70 44
         L 66 46 C 64 42, 58 40, 50 40
         C 42 40, 36 42, 34 46 Z"
      fill="url(#beard-grad)" filter="url(#beard-texture)"/>

<!-- Beard strand groups for texture -->
<path d="M 36 50 C 38 58, 40 66, 44 74"
      fill="none" stroke="#3A2010" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
<path d="M 50 44 C 50 54, 50 66, 50 80"
      fill="none" stroke="#3A2010" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>
<path d="M 64 50 C 62 58, 60 66, 56 74"
      fill="none" stroke="#3A2010" stroke-width="1" stroke-linecap="round" opacity="0.4"/>

<!-- Mustache (part of full beard) -->
<path d="M 42 46 C 44 44, 48 43, 50 44
         C 52 43, 56 44, 58 46
         C 56 48, 52 49, 50 48
         C 48 49, 44 48, 42 46 Z"
      fill="#1A0E08" opacity="0.7"/>
```

#### Mustache

```xml
<!-- Standalone mustache: curved above upper lip -->
<defs>
  <linearGradient id="mustache-grad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#3A2010"/>
    <stop offset="100%" stop-color="#1A0E08"/>
  </linearGradient>
</defs>

<!-- Mustache shape -->
<path d="M 38 46 C 40 42, 44 40, 48 41
         L 50 42
         L 52 41 C 56 40, 60 42, 62 46
         C 60 48, 56 49, 54 48
         C 52 47, 50 47, 50 47
         C 50 47, 48 47, 46 48
         C 44 49, 40 48, 38 46 Z"
      fill="url(#mustache-grad)"/>

<!-- Texture strands radiating from center -->
<path d="M 50 42 C 46 43, 42 44, 38 46"
      fill="none" stroke="#2A1810" stroke-width="0.6" stroke-linecap="round" opacity="0.5"/>
<path d="M 50 42 C 54 43, 58 44, 62 46"
      fill="none" stroke="#2A1810" stroke-width="0.6" stroke-linecap="round" opacity="0.5"/>
<path d="M 50 43 C 47 44, 43 45, 40 46"
      fill="none" stroke="#2A1810" stroke-width="0.5" stroke-linecap="round" opacity="0.4"/>
<path d="M 50 43 C 53 44, 57 45, 60 46"
      fill="none" stroke="#2A1810" stroke-width="0.5" stroke-linecap="round" opacity="0.4"/>

<!-- Highlight on mustache curve -->
<path d="M 44 42 C 46 41, 48 41, 50 41"
      fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-linecap="round"/>
<path d="M 50 41 C 52 41, 54 41, 56 42"
      fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-linecap="round"/>
```

## Hair Color Techniques

### Natural Colors

Each natural hair color uses a gradient from root (darker) to mid-shaft, with highlight colors for specular reflection.

| Color | Base (Dark) | Mid-Tone | Highlight | Shadow |
|-------|-----------|----------|-----------|--------|
| Black | `#0A0A0A` | `#1A1A1A` | `#555555` | `#000000` |
| Brown | `#2A1810` | `#3A2010` | `#8B6B50` | `#1A0E08` |
| Blonde | `#8B7530` | `#C4A870` | `#F5E6C0` | `#6B5520` |
| Red/Auburn | `#5A1500` | `#8B2500` | `#D45030` | `#3A0A00` |
| Gray/Silver | `#606060` | `#808080` | `#E0E0E0` | `#404040` |
| White | `#D0D0D0` | `#E8E8E8` | `#FFFFFF` | `#B0B0B0` |

```xml
<!-- Gradient definitions for all natural hair colors -->
<defs>
  <!-- Black hair -->
  <linearGradient id="hair-black" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1A1A1A"/>
    <stop offset="100%" stop-color="#333333"/>
  </linearGradient>
  <linearGradient id="hair-black-highlight" x1="0.3" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="rgba(85,85,85,0)"/>
    <stop offset="45%" stop-color="rgba(85,85,85,0.4)"/>
    <stop offset="55%" stop-color="rgba(85,85,85,0.4)"/>
    <stop offset="100%" stop-color="rgba(85,85,85,0)"/>
  </linearGradient>

  <!-- Brown hair -->
  <linearGradient id="hair-brown" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="#3A2010"/>
    <stop offset="100%" stop-color="#5A3820"/>
  </linearGradient>
  <linearGradient id="hair-brown-highlight" x1="0.3" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="rgba(139,107,80,0)"/>
    <stop offset="45%" stop-color="rgba(139,107,80,0.3)"/>
    <stop offset="55%" stop-color="rgba(139,107,80,0.3)"/>
    <stop offset="100%" stop-color="rgba(139,107,80,0)"/>
  </linearGradient>

  <!-- Blonde hair -->
  <linearGradient id="hair-blonde" x1="0" y1="0" x2="0.2" y2="1">
    <stop offset="0%" stop-color="#C4A870"/>
    <stop offset="100%" stop-color="#E0C88A"/>
  </linearGradient>
  <linearGradient id="hair-blonde-highlight" x1="0.3" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="rgba(245,230,192,0)"/>
    <stop offset="45%" stop-color="rgba(245,230,192,0.5)"/>
    <stop offset="55%" stop-color="rgba(245,230,192,0.5)"/>
    <stop offset="100%" stop-color="rgba(245,230,192,0)"/>
  </linearGradient>

  <!-- Red/Auburn hair -->
  <linearGradient id="hair-red" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="#8B2500"/>
    <stop offset="100%" stop-color="#B03000"/>
  </linearGradient>
  <linearGradient id="hair-red-highlight" x1="0.3" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="rgba(212,80,48,0)"/>
    <stop offset="45%" stop-color="rgba(212,80,48,0.35)"/>
    <stop offset="55%" stop-color="rgba(212,80,48,0.35)"/>
    <stop offset="100%" stop-color="rgba(212,80,48,0)"/>
  </linearGradient>

  <!-- Gray/Silver hair -->
  <linearGradient id="hair-gray" x1="0" y1="0" x2="0.2" y2="1">
    <stop offset="0%" stop-color="#808080"/>
    <stop offset="100%" stop-color="#B0B0B0"/>
  </linearGradient>
  <linearGradient id="hair-gray-highlight" x1="0.3" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="rgba(224,224,224,0)"/>
    <stop offset="45%" stop-color="rgba(224,224,224,0.5)"/>
    <stop offset="55%" stop-color="rgba(224,224,224,0.5)"/>
    <stop offset="100%" stop-color="rgba(224,224,224,0)"/>
  </linearGradient>

  <!-- White hair -->
  <linearGradient id="hair-white" x1="0" y1="0" x2="0.2" y2="1">
    <stop offset="0%" stop-color="#E8E8E8"/>
    <stop offset="100%" stop-color="#F5F5F5"/>
  </linearGradient>
  <linearGradient id="hair-white-highlight" x1="0.3" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="45%" stop-color="rgba(255,255,255,0.6)"/>
    <stop offset="55%" stop-color="rgba(255,255,255,0.6)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>
</defs>
```

### Fantasy/Unnatural Colors

Fantasy hair colors use vibrant, saturated hues. Pastel variants use lighter tints with higher luminosity.

```xml
<!-- Fantasy hair color gradient recipes -->
<defs>
  <!-- Pastel Pink -->
  <linearGradient id="hair-pastel-pink" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FFB6C1"/>
    <stop offset="100%" stop-color="#FF69B4"/>
  </linearGradient>

  <!-- Pastel Blue -->
  <linearGradient id="hair-pastel-blue" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#87CEEB"/>
    <stop offset="100%" stop-color="#4A90D9"/>
  </linearGradient>

  <!-- Pastel Purple -->
  <linearGradient id="hair-pastel-purple" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#D8B4FE"/>
    <stop offset="100%" stop-color="#A855F7"/>
  </linearGradient>

  <!-- Pastel Green -->
  <linearGradient id="hair-pastel-green" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#86EFAC"/>
    <stop offset="100%" stop-color="#22C55E"/>
  </linearGradient>
</defs>
```

#### Two-Tone / Ombre Technique

Ombre hair transitions from one color to another along the hair length. The gradient runs vertically from roots to tips. Use `gradientUnits="userSpaceOnUse"` for precise control over where the color transition occurs.

```xml
<!-- Ombre: dark roots fading to blonde tips -->
<defs>
  <linearGradient id="ombre-dark-to-blonde" x1="0" y1="0" x2="0" y2="1"
                  gradientUnits="userSpaceOnUse" y1="10" y2="90">
    <stop offset="0%" stop-color="#2A1810"/>
    <stop offset="40%" stop-color="#3A2010"/>
    <stop offset="60%" stop-color="#8B6B50"/>
    <stop offset="100%" stop-color="#C4A870"/>
  </linearGradient>

  <!-- Ombre highlight that follows the color transition -->
  <linearGradient id="ombre-highlight" x1="0.4" y1="0" x2="0.6" y2="1"
                  gradientUnits="userSpaceOnUse" y1="10" y2="90">
    <stop offset="0%" stop-color="rgba(139,107,80,0)"/>
    <stop offset="30%" stop-color="rgba(139,107,80,0.2)"/>
    <stop offset="70%" stop-color="rgba(245,230,192,0.3)"/>
    <stop offset="100%" stop-color="rgba(245,230,192,0)"/>
  </linearGradient>
</defs>

<!-- Long hair with ombre effect -->
<path d="M 28 14 C 22 8, 28 2, 40 1
         C 50 0, 60 0, 68 2
         C 76 6, 80 12, 78 20
         C 76 35, 76 55, 72 72
         C 68 85, 58 90, 50 90
         C 42 90, 32 85, 28 72
         C 24 55, 24 35, 28 14 Z"
      fill="url(#ombre-dark-to-blonde)"/>

<!-- Strand groups show color transition -->
<path d="M 40 4 C 38 20, 36 45, 38 70 C 40 80, 42 86, 44 88"
      fill="none" stroke="url(#ombre-highlight)" stroke-width="6" stroke-linecap="round"/>
<path d="M 60 4 C 62 20, 64 45, 62 70 C 60 80, 58 86, 56 88"
      fill="none" stroke="url(#ombre-highlight)" stroke-width="6" stroke-linecap="round"/>
```

### Hair Transparency and Flyaway Strands

Realistic hair never has a perfectly clean edge. Flyaway strands with decreasing opacity break the silhouette and add a natural, soft quality.

```xml
<!-- Flyaway strands at hair edges -->
<!-- Main hair mass (simplified) -->
<path d="M 30 10 C 20 5, 10 15, 15 40
         C 18 55, 25 65, 30 70
         L 70 70 C 75 65, 82 55, 85 40
         C 90 15, 80 5, 70 10
         Q 60 5, 50 8 Q 40 5, 30 10 Z"
      fill="#3A2010"/>

<!-- Flyaway strands breaking the silhouette -->
<!-- Left edge flyaways -->
<path d="M 16 35 C 12 30, 10 25, 12 20"
      fill="none" stroke="#5A3820" stroke-width="0.5" stroke-linecap="round" opacity="0.4"/>
<path d="M 14 42 C 10 38, 8 32, 9 26"
      fill="none" stroke="#4A2C1A" stroke-width="0.4" stroke-linecap="round" opacity="0.3"/>
<path d="M 18 50 C 14 46, 12 40, 13 34"
      fill="none" stroke="#5A3820" stroke-width="0.3" stroke-linecap="round" opacity="0.25"/>

<!-- Right edge flyaways -->
<path d="M 84 35 C 88 30, 90 25, 88 20"
      fill="none" stroke="#5A3820" stroke-width="0.5" stroke-linecap="round" opacity="0.4"/>
<path d="M 86 42 C 90 38, 92 32, 91 26"
      fill="none" stroke="#4A2C1A" stroke-width="0.4" stroke-linecap="round" opacity="0.3"/>

<!-- Top edge flyaways (baby hairs at hairline) -->
<path d="M 35 12 C 34 8, 36 5, 38 4"
      fill="none" stroke="#5A3820" stroke-width="0.4" stroke-linecap="round" opacity="0.35"/>
<path d="M 55 10 C 56 6, 58 4, 60 3"
      fill="none" stroke="#5A3820" stroke-width="0.3" stroke-linecap="round" opacity="0.3"/>

<!-- Bottom edge flyaways (tip wisps) -->
<path d="M 32 70 C 30 74, 28 78, 30 80"
      fill="none" stroke="#4A2C1A" stroke-width="0.5" stroke-linecap="round" opacity="0.35"/>
<path d="M 45 70 C 44 75, 42 79, 44 82"
      fill="none" stroke="#5A3820" stroke-width="0.4" stroke-linecap="round" opacity="0.3"/>
<path d="M 55 70 C 56 75, 58 79, 56 82"
      fill="none" stroke="#5A3820" stroke-width="0.4" stroke-linecap="round" opacity="0.3"/>
<path d="M 68 70 C 70 74, 72 78, 70 80"
      fill="none" stroke="#4A2C1A" stroke-width="0.5" stroke-linecap="round" opacity="0.35"/>

<!-- Ultra-fine barely-visible wisps (furthest from mass) -->
<path d="M 10 28 C 7 24, 6 18, 8 14"
      fill="none" stroke="#5A3820" stroke-width="0.25" stroke-linecap="round" opacity="0.15"/>
<path d="M 92 28 C 95 24, 96 18, 94 14"
      fill="none" stroke="#5A3820" stroke-width="0.25" stroke-linecap="round" opacity="0.15"/>
```

## Practical Checklist

Follow this order when drawing hair to ensure consistent, professional results:

1. **Establish crown point and flow direction** — Mark where the crown is, decide on part line (center, side, none), and sketch flow lines showing where hair will fall
2. **Draw base mass silhouette first** — Single filled path defining the overall hair shape; should extend 5-15% past the head boundary
3. **Add shadow sections** — Darkened areas where hair overlaps itself (behind ears, under top layers, between strand groups); use 20-40% opacity dark fills
4. **Add mid-tone strand groups following flow lines** — 3-8 major strand groups as paths with stroke or fill; all must follow the flow direction from step 1
5. **Apply highlight system matching illustration style** — Choose anime (hard edge), realistic (gradient), or ring light; place highlights on the outward-facing curves
6. **Add edge detail** — Wisps, flyaways, and baby hairs at the hairline; varying opacity (0.15-0.5) and width (0.3-0.8px)
7. **Verify proportions** — Hair should extend past head boundary by 5-15% on all sides to look natural; check that volume feels appropriate for the style

### Quick Validation Questions
- Does the hair flow logically from the crown point?
- Are shadow areas placed where hair layers overlap?
- Do highlights follow the curvature of strand groups?
- Are there flyaway strands breaking the silhouette?
- Does the hair volume extend beyond the head outline?
- Is the strand width consistent with the chosen style (anime: 2-4px, realistic: 0.5-1.5px)?
