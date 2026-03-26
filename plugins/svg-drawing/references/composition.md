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

## Tonal Composition (Notan / Value Planning)

Before adding color, plan the value structure of your composition. "Notan" is the Japanese concept of light-dark harmony. A strong value plan works in grayscale alone.

### Two-Value Notan

Reduce the scene to just black and white. This reveals the fundamental shape relationships.

```xml
<!-- Two-value notan study of a landscape -->
<svg viewBox="0 0 400 300">
  <!-- Light (sky and water) -->
  <rect width="400" height="300" fill="white" />

  <!-- Dark (land masses, trees, foreground) -->
  <path d="M 0 150 L 80 100 L 160 140 L 280 80 L 400 130 V 300 H 0 Z" fill="black" />
  <!-- Dark tree silhouette -->
  <circle cx="120" cy="90" r="40" fill="black" />
  <rect x="115" y="90" width="10" height="60" fill="black" />
</svg>
```

### Three-Value Notan

Add a midtone to represent the transition areas. Most professional compositions can be described with three values.

```xml
<!-- Three-value study -->
<svg viewBox="0 0 400 300">
  <rect width="400" height="300" fill="white" />
  <!-- Midtone: middle distance -->
  <path d="M 0 180 Q 100 140, 200 170 T 400 160 V 220 H 0 Z" fill="#888" />
  <!-- Dark: foreground and shadows -->
  <path d="M 0 220 Q 200 200, 400 220 V 300 H 0 Z" fill="#222" />
  <circle cx="300" cy="120" r="50" fill="#222" />
  <rect x="295" y="120" width="10" height="80" fill="#222" />
</svg>
```

### Value Plan Checklist

1. **Squint test** — If you squint at the composition, can you still read the major shapes?
2. **60-30-10 value rule** — 60% one value (usually midtone), 30% another, 10% the third
3. **Focal area has maximum contrast** — The highest value contrast should be at the focal point
4. **Value grouping** — Connect similar values into large shapes; avoid scattered small spots

## Composition Frameworks

### Rule of Thirds

Place key elements at 1/3 and 2/3 points (x: 267/533, y: 200/400 for 800×600).

### Golden Ratio (Phi Grid)

The golden ratio (φ ≈ 1.618) creates divisions that feel naturally harmonious. Unlike the rule of thirds (which divides evenly into thirds), the phi grid produces asymmetric divisions at approximately 38.2% and 61.8%.

#### Phi Grid Construction

For an 800×600 canvas:
- Vertical lines at: x = 306 (800 × 0.382) and x = 494 (800 × 0.618)
- Horizontal lines at: y = 229 (600 × 0.382) and y = 371 (600 × 0.618)

```xml
<!-- Golden ratio grid overlay -->
<g id="phi-grid" opacity="0.4">
  <!-- Vertical phi lines -->
  <line x1="306" y1="0" x2="306" y2="600" stroke="#F39C12" stroke-width="1" stroke-dasharray="6 4" />
  <line x1="494" y1="0" x2="494" y2="600" stroke="#F39C12" stroke-width="1" stroke-dasharray="6 4" />
  <!-- Horizontal phi lines -->
  <line x1="0" y1="229" x2="800" y2="229" stroke="#F39C12" stroke-width="1" stroke-dasharray="6 4" />
  <line x1="0" y1="371" x2="800" y2="371" stroke="#F39C12" stroke-width="1" stroke-dasharray="6 4" />
  <!-- Power points (intersections) -->
  <circle cx="306" cy="229" r="5" fill="none" stroke="#E74C3C" stroke-width="1.5" />
  <circle cx="494" cy="229" r="5" fill="none" stroke="#E74C3C" stroke-width="1.5" />
  <circle cx="306" cy="371" r="5" fill="none" stroke="#E74C3C" stroke-width="1.5" />
  <circle cx="494" cy="371" r="5" fill="none" stroke="#E74C3C" stroke-width="1.5" />
</g>
```

#### Golden Spiral

The golden spiral guides the eye in a natural flow through the composition. Construct it from nested golden rectangles:

```xml
<!-- Approximated golden spiral using cubic Bézier -->
<path d="M 494 371
         C 494 290, 494 229, 400 229
         C 342 229, 306 229, 306 280
         C 306 320, 306 347, 340 347
         C 360 347, 373 347, 373 330
         C 373 322, 373 316, 365 316"
      fill="none" stroke="#E74C3C" stroke-width="1.5" opacity="0.5" />
```

**When to use phi grid vs rule of thirds:**
- **Phi grid** for natural, organic compositions (landscapes, portraits, still life)
- **Rule of thirds** for quick, reliable compositions (action scenes, UI design)
- **Dynamic symmetry** for the most sophisticated control of visual flow

#### Rabatment of the Rectangle

Rabatment identifies the largest square(s) that fit within a rectangle. The square's far edge creates a natural division line where the eye pauses — an excellent place for subject boundaries.

For an 800×600 canvas:
- Left rabatment: a 600×600 square from the left → vertical line at x = 600
- Right rabatment: a 600×600 square from the right → vertical line at x = 200
- The overlap zone (x: 200-600) is the visual "sweet spot"

```xml
<g id="rabatment-overlay" opacity="0.3">
  <!-- Left square -->
  <rect x="0" y="0" width="600" height="600" fill="none" stroke="#3498DB" stroke-width="1" stroke-dasharray="8 4" />
  <!-- Right square -->
  <rect x="200" y="0" width="600" height="600" fill="none" stroke="#E74C3C" stroke-width="1" stroke-dasharray="8 4" />
  <!-- Rabatment lines (the far edges of each square) -->
  <line x1="600" y1="0" x2="600" y2="600" stroke="#3498DB" stroke-width="2" />
  <line x1="200" y1="0" x2="200" y2="600" stroke="#E74C3C" stroke-width="2" />
  <!-- Sweet spot zone -->
  <rect x="200" y="0" width="400" height="600" fill="#F39C12" opacity="0.08" />
</g>
```

### Dynamic Symmetry

Dynamic symmetry uses diagonals and their reciprocals to create a composition grid based on root rectangles. This system, derived from Jay Hambidge's analysis of Greek art and nature, creates compositions that feel naturally balanced and energetic.

#### The Diagonal-Based Grid System

Unlike the rule-of-thirds grid (which divides evenly), dynamic symmetry uses diagonal lines from corners and their perpendicular reciprocals to find "eyes" — intersection points where the viewer's attention naturally falls.

```xml
<!-- Dynamic symmetry overlay for 800×600 canvas -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <!-- Canvas background -->
  <rect width="800" height="600" fill="#f5f5f0" />

  <!-- Main diagonals (corner to corner) -->
  <line x1="0" y1="0" x2="800" y2="600" stroke="#E74C3C" stroke-width="1" opacity="0.5" />
  <line x1="800" y1="0" x2="0" y2="600" stroke="#E74C3C" stroke-width="1" opacity="0.5" />

  <!-- Reciprocal diagonals (perpendicular to main diagonals, from corners) -->
  <!-- From bottom-left, perpendicular to main diagonal -->
  <line x1="0" y1="600" x2="533" y2="0" stroke="#3498DB" stroke-width="1" opacity="0.5" />
  <!-- From top-right, perpendicular to main diagonal -->
  <line x1="800" y1="0" x2="267" y2="600" stroke="#3498DB" stroke-width="1" opacity="0.5" />
  <!-- From bottom-right, perpendicular to counter-diagonal -->
  <line x1="800" y1="600" x2="267" y2="0" stroke="#2ECC71" stroke-width="1" opacity="0.5" />
  <!-- From top-left, perpendicular to counter-diagonal -->
  <line x1="0" y1="0" x2="533" y2="600" stroke="#2ECC71" stroke-width="1" opacity="0.5" />

  <!-- "Eyes" — key intersection points (marked with circles) -->
  <circle cx="320" cy="240" r="8" fill="none" stroke="#F39C12" stroke-width="2" />
  <circle cx="480" cy="360" r="8" fill="none" stroke="#F39C12" stroke-width="2" />
  <circle cx="320" cy="360" r="6" fill="none" stroke="#F39C12" stroke-width="1.5" />
  <circle cx="480" cy="240" r="6" fill="none" stroke="#F39C12" stroke-width="1.5" />

  <!-- Labels -->
  <text x="330" y="235" font-size="12" fill="#F39C12">Eye 1</text>
  <text x="490" y="355" font-size="12" fill="#F39C12">Eye 2</text>
</svg>
```

#### Using Dynamic Symmetry in a Scene

Place the most important elements at intersection "eyes" and align edges along diagonal lines:

```xml
<!-- Landscape composed using dynamic symmetry -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="ds-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1a1a2e" />
      <stop offset="70%" stop-color="#e94560" />
      <stop offset="100%" stop-color="#ffeaa7" />
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="800" height="600" fill="url(#ds-sky)" />

  <!-- Mountain ridge follows the main diagonal from lower-left to upper-right -->
  <path d="M 0 500 L 200 350 L 320 240 L 450 300 L 600 200 L 800 350 V 600 H 0 Z"
        fill="#2C3E50" opacity="0.6" />

  <!-- Focal tree placed at Eye 1 intersection (320, 240) -->
  <g transform="translate(320, 240)">
    <rect x="-6" y="0" width="12" height="50" fill="#4E342E" />
    <circle cx="0" cy="-15" r="30" fill="#1B5E20" />
    <circle cx="-18" cy="-5" r="22" fill="#2E7D32" />
    <circle cx="18" cy="-5" r="22" fill="#2E7D32" />
  </g>

  <!-- Reflective water element at Eye 2 (480, 360) -->
  <ellipse cx="480" cy="380" rx="120" ry="30" fill="rgba(255,255,200,0.2)" />

  <!-- River path follows reciprocal diagonal direction -->
  <path d="M 267 600 C 300 500, 400 420, 480 380 C 560 340, 650 300, 800 250"
        fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="40" stroke-linecap="round" />
</svg>
```

#### Tips for Dynamic Symmetry

- **Eyes are focal points:** Place your main subject at one of the diagonal intersection points
- **Diagonals guide movement:** Align edges of terrain, rivers, or roads along the diagonals
- **Reciprocals create tension:** The perpendicular diagonals create a secondary rhythm
- **Not a rigid grid:** Use it as a guide, not a constraint — slight deviations feel natural
- **Works with any aspect ratio:** Just draw corner-to-corner diagonals and their perpendiculars

## Visual Weight and Balance

Visual weight determines where the viewer's eye goes first. Elements with more visual weight attract attention. Understanding this lets you control the viewer's journey through your composition.

### Visual Weight Factors

| Factor | More Weight | Less Weight |
|--------|-----------|------------|
| Size | Larger elements | Smaller elements |
| Color saturation | Vivid, saturated | Desaturated, muted |
| Value contrast | High contrast (dark on light) | Low contrast |
| Complexity | Detailed, textured | Simple, flat |
| Isolation | Alone with space around it | Part of a cluster |
| Position | Higher in composition | Lower |
| Warm vs cool | Warm colors (red, orange) | Cool colors (blue, green) |
| Faces/eyes | Faces attract strongly | Abstract shapes |
| Sharp edges | Hard, defined edges | Soft, blurred edges |

### Balancing Visual Weight

A composition feels balanced when visual weight is distributed appropriately. This doesn't mean symmetrical — asymmetric balance is often more dynamic.

```xml
<!-- Asymmetric balance: large light element vs small dark element -->
<svg viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#F5F5F0" />

  <!-- Large but light element on the left (moderate weight) -->
  <circle cx="250" cy="300" r="120" fill="#AED6F1" opacity="0.6" />

  <!-- Small but dark, saturated element on the right (equal weight due to contrast) -->
  <circle cx="600" cy="300" r="40" fill="#C0392B" />

  <!-- These balance each other despite different sizes -->
</svg>
```

### Implied Lines and Visual Flow

Implied lines are invisible paths that guide the viewer's eye through a composition. They're created by:

1. **Gaze direction** — Characters looking at something create a line from their eyes to the target
2. **Pointing** — Arms, fingers, branches pointing in a direction
3. **Alignment** — Multiple elements aligned in a row create a virtual line
4. **Motion trajectory** — Moving objects imply their path
5. **Edge continuation** — An edge that stops implies continuation

```xml
<!-- Implied line through gaze and pointing -->
<svg viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#1a1a2e" />

  <!-- Person on left, looking right and pointing -->
  <g transform="translate(150, 350)">
    <circle cx="0" cy="-40" r="20" fill="#FDBCB4" />
    <!-- Eyes looking right -->
    <circle cx="4" cy="-42" r="2.5" fill="#2C3E50" />
    <circle cx="10" cy="-42" r="2.5" fill="#2C3E50" />
    <path d="M -15 -18 L -12 20 L 12 20 L 15 -18 Z" fill="#3498DB" />
    <!-- Arm pointing to the right — creates implied line to focal object -->
    <path d="M 15 -10 L 45 -30 L 70 -35" stroke="#FDBCB4" stroke-width="5" stroke-linecap="round" />
  </g>

  <!-- Implied line (invisible but felt by the viewer) -->
  <!-- The eye follows from the pointing hand to... -->

  <!-- Focal object — the "target" of the implied line -->
  <circle cx="600" cy="280" r="50" fill="#F39C12" />
  <circle cx="600" cy="280" r="30" fill="#FDD835" />
</svg>
```

### Negative Space as Active Design

Negative space (the area around and between subjects) isn't just "empty" — it's an active compositional element that defines the positive shapes and controls visual rhythm.

**Techniques:**

1. **Shape recognition** — Negative space should form recognizable or pleasing shapes of its own
2. **Breathing room** — Give the focal element generous surrounding space to emphasize it
3. **Direction** — More space in the direction a character looks/moves creates "room to breathe"
4. **Tension** — Reducing negative space between elements creates visual tension; increasing it creates calm
5. **Counter-shape** — The negative space between two objects forms a third shape — make it interesting

```xml
<!-- Negative space example: bird on a wire -->
<svg viewBox="0 0 800 400">
  <!-- Mostly negative space (sky) emphasizes the tiny bird -->
  <rect width="800" height="400" fill="#E8F4FD" />

  <!-- Wire — a thin line divides the space -->
  <line x1="0" y1="250" x2="800" y2="260" stroke="#333" stroke-width="1" />

  <!-- Bird — tiny but becomes the focal point through isolation -->
  <g transform="translate(580, 240)">
    <ellipse cx="0" cy="0" rx="8" ry="5" fill="#2C3E50" />
    <circle cx="6" cy="-3" r="3" fill="#2C3E50" />
    <circle cx="7" cy="-4" r="1" fill="white" />
    <path d="M -6 -3 L -12 -8 L -6 -1" fill="#2C3E50" />
  </g>

  <!-- The vast empty sky (negative space) IS the composition -->
</svg>
```

## Tension and Resolution

Composition can create visual energy (tension) or calm (resolution). Understanding when to use each is key to conveying mood and emotion.

### Dynamic Compositions (Tension)

Dynamic compositions create visual energy, movement, and excitement. They make the viewer's eye move actively across the artwork.

**Techniques for creating tension:**

```xml
<!-- Diagonal-dominant dynamic composition -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#1a1a2e" />

  <!-- Strong diagonals create tension -->
  <path d="M 0 600 L 500 50 L 800 300"
        fill="none" stroke="#E74C3C" stroke-width="4" opacity="0.8" />

  <!-- Asymmetric element placement (off-center = tension) -->
  <circle cx="580" cy="120" r="80" fill="#F39C12" opacity="0.8" />

  <!-- Sharp, angular shapes -->
  <polygon points="100,500 250,200 180,500" fill="#3498DB" opacity="0.7" />
  <polygon points="350,580 500,300 420,580" fill="#2ECC71" opacity="0.6" />

  <!-- Converging lines (perspective tension) -->
  <line x1="0" y1="400" x2="700" y2="100" stroke="white" stroke-width="1" opacity="0.2" />
  <line x1="0" y1="500" x2="750" y2="150" stroke="white" stroke-width="1" opacity="0.2" />
  <line x1="0" y1="600" x2="800" y2="200" stroke="white" stroke-width="1" opacity="0.2" />

  <!-- Small element near large creates scale tension -->
  <circle cx="550" cy="420" r="8" fill="white" />
</svg>
```

**Key tension techniques:**
- **Diagonal lines** — diagonals are inherently dynamic (vs. horizontals/verticals)
- **Asymmetric balance** — off-center placement creates visual pull
- **Scale contrast** — very large next to very small creates tension
- **Sharp angles** — triangles and angular shapes feel energetic
- **Converging lines** — perspective lines create depth tension
- **Cropping** — elements cut off by the edge imply continuation beyond the frame
- **Tilted elements** — rotation from vertical/horizontal axes adds instability

### Calm Compositions (Resolution)

Calm compositions create visual stability, peace, and restfulness. The viewer's eye settles comfortably.

```xml
<!-- Horizontal-dominant calm composition -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="calm-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#AED6F1" />
      <stop offset="100%" stop-color="#EBF5FB" />
    </linearGradient>
  </defs>

  <rect width="800" height="600" fill="url(#calm-sky)" />

  <!-- Strong horizontal lines create calm -->
  <rect y="380" width="800" height="220" fill="#82E0AA" opacity="0.4" />
  <rect y="420" width="800" height="180" fill="#58D68D" opacity="0.3" />
  <rect y="460" width="800" height="140" fill="#2ECC71" opacity="0.3" />

  <!-- Symmetrical element placement (centered = stability) -->
  <circle cx="400" cy="200" r="60" fill="#F9E79F" opacity="0.8" />

  <!-- Gentle curves (soft, organic shapes = calm) -->
  <path d="M 0 380 Q 200 350, 400 370 T 800 380" fill="none" stroke="#7DCEA0" stroke-width="2" />

  <!-- Evenly spaced elements (rhythm = calm) -->
  <circle cx="200" cy="450" r="5" fill="#2C3E50" opacity="0.3" />
  <circle cx="350" cy="450" r="5" fill="#2C3E50" opacity="0.3" />
  <circle cx="500" cy="450" r="5" fill="#2C3E50" opacity="0.3" />
  <circle cx="650" cy="450" r="5" fill="#2C3E50" opacity="0.3" />

  <!-- Reflected symmetry reinforces stability -->
  <ellipse cx="400" cy="500" rx="60" ry="15" fill="#F9E79F" opacity="0.2" />
</svg>
```

**Key calm techniques:**
- **Horizontal lines** — horizontals feel stable and grounded
- **Symmetry** — centered and mirrored elements create balance
- **Soft curves** — gentle arcs and circles feel peaceful
- **Even spacing** — rhythmic, regular placement is restful
- **Low contrast** — muted colors and subtle value differences
- **Ample negative space** — breathing room prevents visual stress
- **Warm, desaturated palette** — soft pastels and earth tones

### Mixing Tension and Resolution

The most compelling compositions combine both — a mostly calm scene with one element of tension creates a focal point:

```xml
<!-- Calm scene with one tension element -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#EBF5FB" />

  <!-- Calm: horizontal landscape bands -->
  <rect y="350" width="800" height="250" fill="#82E0AA" opacity="0.3" />
  <rect y="400" width="800" height="200" fill="#58D68D" opacity="0.3" />

  <!-- Calm: gentle rolling hills -->
  <path d="M 0 380 Q 200 340, 400 370 T 800 360 V 600 H 0 Z" fill="#27AE60" opacity="0.2" />

  <!-- TENSION: single diagonal tree breaking the horizontals -->
  <g transform="translate(500, 300) rotate(-12)">
    <rect x="-5" y="-80" width="10" height="80" fill="#4E342E" />
    <circle cx="0" cy="-100" r="35" fill="#1B5E20" />
  </g>

  <!-- Calm: distant horizontal clouds -->
  <ellipse cx="200" cy="100" rx="80" ry="15" fill="white" opacity="0.6" />
  <ellipse cx="600" cy="80" rx="60" ry="12" fill="white" opacity="0.5" />
</svg>
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

### Color Depth Hierarchy

Color creates spatial depth beyond simple atmospheric perspective. Warm colors appear to advance toward the viewer; cool colors appear to recede.

| Property | Advancing (Foreground) | Receding (Background) |
|----------|----------------------|---------------------|
| Temperature | Warm (red, orange, yellow) | Cool (blue, green, violet) |
| Saturation | High saturation | Low saturation |
| Value | High contrast | Low contrast |
| Detail | Sharp edges, texture | Soft edges, smooth |
| Size | Larger elements | Smaller elements |

```xml
<!-- Color depth hierarchy demonstration -->
<svg viewBox="0 0 800 600">
  <!-- Sky: cool, desaturated (farthest) -->
  <rect width="800" height="600" fill="hsl(210, 30%, 75%)" />

  <!-- Mountains: cool, low saturation (far) -->
  <path d="M 0 350 L 200 200 L 400 300 L 600 180 L 800 280 V 400 H 0 Z"
        fill="hsl(220, 20%, 60%)" />

  <!-- Hills: warmer, more saturated (middle) -->
  <path d="M 0 420 Q 200 360, 400 400 T 800 380 V 500 H 0 Z"
        fill="hsl(140, 35%, 45%)" />

  <!-- Ground: warm, saturated, detailed (nearest) -->
  <path d="M 0 480 Q 400 450, 800 470 V 600 H 0 Z"
        fill="hsl(100, 50%, 35%)" />

  <!-- Foreground flowers: warmest, most saturated -->
  <circle cx="150" cy="530" r="6" fill="hsl(0, 80%, 55%)" />
  <circle cx="300" cy="520" r="5" fill="hsl(30, 85%, 55%)" />
  <circle cx="600" cy="540" r="7" fill="hsl(350, 75%, 50%)" />
</svg>
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

### Perspective Grid Construction

#### One-Point Perspective

All parallel lines converge at a single vanishing point on the horizon. Best for roads, hallways, tunnels.

```xml
<svg viewBox="0 0 800 600">
  <!-- Vanishing point at center of horizon -->
  <circle cx="400" cy="250" r="3" fill="#E74C3C" />

  <!-- Horizon line -->
  <line x1="0" y1="250" x2="800" y2="250" stroke="#999" stroke-width="0.5" stroke-dasharray="6 3" />

  <!-- Converging lines from corners toward vanishing point -->
  <line x1="0" y1="600" x2="400" y2="250" stroke="#3498DB" stroke-width="0.8" opacity="0.5" />
  <line x1="800" y1="600" x2="400" y2="250" stroke="#3498DB" stroke-width="0.8" opacity="0.5" />
  <line x1="0" y1="0" x2="400" y2="250" stroke="#3498DB" stroke-width="0.8" opacity="0.5" />
  <line x1="800" y1="0" x2="400" y2="250" stroke="#3498DB" stroke-width="0.8" opacity="0.5" />

  <!-- Road demonstrating one-point perspective -->
  <path d="M 300 600 L 390 250 L 410 250 L 500 600 Z" fill="#555" />
  <!-- Road center line -->
  <path d="M 400 600 L 400 260" stroke="#FFD700" stroke-width="2" stroke-dasharray="15 10" />
</svg>
```

#### Two-Point Perspective

Two vanishing points on the horizon. Best for buildings, boxes, architectural scenes.

```xml
<svg viewBox="0 0 800 600">
  <!-- Horizon -->
  <line x1="0" y1="300" x2="800" y2="300" stroke="#999" stroke-width="0.5" stroke-dasharray="6 3" />

  <!-- Vanishing points (often outside the canvas) -->
  <circle cx="50" cy="300" r="3" fill="#E74C3C" />  <!-- VP Left -->
  <circle cx="750" cy="300" r="3" fill="#3498DB" />  <!-- VP Right -->

  <!-- A box in two-point perspective -->
  <!-- Vertical edge (closest to viewer) -->
  <line x1="400" y1="200" x2="400" y2="450" stroke="#333" stroke-width="2" />

  <!-- Lines to left VP from top and bottom of vertical edge -->
  <line x1="400" y1="200" x2="50" y2="300" stroke="#E74C3C" stroke-width="0.8" opacity="0.4" />
  <line x1="400" y1="450" x2="50" y2="300" stroke="#E74C3C" stroke-width="0.8" opacity="0.4" />

  <!-- Lines to right VP from top and bottom of vertical edge -->
  <line x1="400" y1="200" x2="750" y2="300" stroke="#3498DB" stroke-width="0.8" opacity="0.4" />
  <line x1="400" y1="450" x2="750" y2="300" stroke="#3498DB" stroke-width="0.8" opacity="0.4" />

  <!-- Building face (left side) — follow lines to left VP -->
  <path d="M 400 200 L 250 248 L 250 398 L 400 450 Z" fill="#BDC3C7" stroke="#333" stroke-width="1" />
  <!-- Building face (right side) — follow lines to right VP -->
  <path d="M 400 200 L 550 248 L 550 398 L 400 450 Z" fill="#95A5A6" stroke="#333" stroke-width="1" />
</svg>
```

#### Isometric Projection Grid

Isometric uses 30° angles for all three axes, with no vanishing points. Objects don't diminish with distance. Ideal for technical illustration, game art, and infographics.

```xml
<svg viewBox="0 0 800 600">
  <defs>
    <!-- Isometric grid pattern: 30° angles -->
    <pattern id="iso-grid" width="52" height="30" patternUnits="userSpaceOnUse">
      <!-- Lines at 30° (rise 15 over run 26) -->
      <line x1="0" y1="30" x2="26" y2="15" stroke="#DDD" stroke-width="0.5" />
      <line x1="26" y1="15" x2="52" y2="30" stroke="#DDD" stroke-width="0.5" />
      <line x1="0" y1="0" x2="26" y2="15" stroke="#DDD" stroke-width="0.5" />
      <line x1="26" y1="15" x2="52" y2="0" stroke="#DDD" stroke-width="0.5" />
    </pattern>
  </defs>

  <rect width="800" height="600" fill="url(#iso-grid)" />

  <!-- Isometric cube example -->
  <!-- Top face (parallelogram) -->
  <path d="M 400 200 L 460 170 L 520 200 L 460 230 Z" fill="#3498DB" />
  <!-- Left face -->
  <path d="M 400 200 L 460 230 L 460 300 L 400 270 Z" fill="#2980B9" />
  <!-- Right face -->
  <path d="M 460 230 L 520 200 L 520 270 L 460 300 Z" fill="#1A5276" />
</svg>
```

**Isometric coordinate conversion:**
- X-axis: 30° right and down → `translate(dx × cos30, dx × sin30)` ≈ `translate(dx × 0.866, dx × 0.5)`
- Y-axis: 30° left and down → `translate(-dy × 0.866, dy × 0.5)`
- Z-axis: straight up → `translate(0, -dz)`

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

### Composition for Different Formats

| Format | Aspect Ratio | Best For | viewBox |
|--------|-------------|----------|---------|
| Landscape | 4:3 or 16:9 | Panoramic scenes, environments | `0 0 800 600` or `0 0 960 540` |
| Portrait | 3:4 or 9:16 | Character focus, tall scenes | `0 0 600 800` or `0 0 540 960` |
| Square | 1:1 | Centered compositions, icons | `0 0 600 600` |
| Panoramic | 2:1 or 3:1 | Epic landscapes, cityscapes | `0 0 1200 400` |
| Circular | N/A | Medallions, vignettes | Use `<clipPath>` with circle |

**Format-specific composition tips:**
- **Landscape:** Emphasize horizontal bands; horizon at 1/3 or 2/3
- **Portrait:** Vertical flow; stack foreground-midground-background
- **Square:** Strong central element or diagonal balance; avoid dull centering
- **Panoramic:** Multiple focal points; use leading lines to connect them

## Large Scene Management

### Zone Strategies for Complex Scenes

When building scenes with many elements (cityscapes, forests, crowd scenes), divide the canvas into zones and work on each systematically.

#### Three-Zone Depth Strategy

Divide the canvas vertically into three depth zones, each with its own detail level and rendering rules:

```xml
<!-- Zone map for a complex cityscape -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <!-- ZONE 1: Background (y: 0-250) — simplified, low detail -->
  <rect y="0" width="800" height="250" fill="none" stroke="#3498DB" stroke-dasharray="8 4" />
  <text x="400" y="130" text-anchor="middle" font-size="14" fill="#3498DB">
    Zone 1: Background — low detail, muted colors, small scale
  </text>

  <!-- ZONE 2: Midground (y: 200-420) — moderate detail -->
  <rect y="200" width="800" height="220" fill="none" stroke="#F39C12" stroke-dasharray="8 4" />
  <text x="400" y="315" text-anchor="middle" font-size="14" fill="#F39C12">
    Zone 2: Midground — moderate detail, medium scale
  </text>

  <!-- ZONE 3: Foreground (y: 380-600) — full detail -->
  <rect y="380" width="800" height="220" fill="none" stroke="#E74C3C" stroke-dasharray="8 4" />
  <text x="400" y="495" text-anchor="middle" font-size="14" fill="#E74C3C">
    Zone 3: Foreground — full detail, vivid colors, large scale
  </text>
</svg>
```

**Rules per zone:**

| Property | Background (Zone 1) | Midground (Zone 2) | Foreground (Zone 3) |
|----------|---------------------|---------------------|---------------------|
| Detail level | Silhouettes, simple shapes | Basic features visible | Full detail, textures |
| Colors | Desaturated, blue-shifted | Moderate saturation | Full saturation |
| Opacity | 0.3–0.5 | 0.6–0.8 | 0.9–1.0 |
| Element size | Small (scale 0.2–0.4) | Medium (scale 0.5–0.7) | Large (scale 0.8–1.0) |
| Stroke width | 0.5–1px | 1–2px | 2–4px |
| Path complexity | 3-5 path segments | 5-10 path segments | 10+ path segments |

### Detail Density Gradient

The principle of detail density gradient means: **dense detail in the foreground, progressively sparse toward the background.** This mimics how human vision works — we see nearby objects in detail and distant ones as shapes.

```xml
<!-- Forest scene demonstrating detail density gradient -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="forest-sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#87CEEB" />
      <stop offset="100%" stop-color="#B0E0E6" />
    </linearGradient>
  </defs>

  <rect width="800" height="600" fill="url(#forest-sky)" />

  <!-- BACKGROUND TREES: Simple triangles, no detail, muted colors -->
  <g opacity="0.35">
    <polygon points="100,280 115,200 130,280" fill="#5D7B6F" />
    <polygon points="150,270 168,185 186,270" fill="#4A6B5D" />
    <polygon points="220,275 240,195 260,275" fill="#5D7B6F" />
    <polygon points="300,280 315,210 330,280" fill="#4A6B5D" />
    <polygon points="380,272 398,190 416,272" fill="#5D7B6F" />
    <polygon points="450,278 465,205 480,278" fill="#4A6B5D" />
    <polygon points="530,275 548,195 566,275" fill="#5D7B6F" />
    <polygon points="600,280 618,208 636,280" fill="#4A6B5D" />
    <polygon points="690,276 705,200 720,276" fill="#5D7B6F" />
  </g>

  <!-- MIDGROUND TREES: Basic tree shape with trunk, moderate detail -->
  <g opacity="0.65">
    <g transform="translate(120, 350) scale(0.7)">
      <rect x="-5" y="-10" width="10" height="40" fill="#5D4037" />
      <ellipse cx="0" cy="-30" rx="25" ry="30" fill="#2E7D32" />
    </g>
    <g transform="translate(300, 360) scale(0.6)">
      <rect x="-5" y="-10" width="10" height="40" fill="#5D4037" />
      <ellipse cx="0" cy="-30" rx="25" ry="30" fill="#388E3C" />
    </g>
    <g transform="translate(550, 345) scale(0.7)">
      <rect x="-5" y="-10" width="10" height="40" fill="#5D4037" />
      <ellipse cx="0" cy="-30" rx="25" ry="30" fill="#2E7D32" />
    </g>
    <g transform="translate(700, 355) scale(0.65)">
      <rect x="-5" y="-10" width="10" height="40" fill="#5D4037" />
      <ellipse cx="0" cy="-30" rx="25" ry="30" fill="#388E3C" />
    </g>
  </g>

  <!-- Ground -->
  <path d="M 0 420 Q 200 400, 400 415 T 800 410 V 600 H 0 Z" fill="#4CAF50" />

  <!-- FOREGROUND TREES: Full detail — trunk texture, branch structure, leaf clusters -->
  <g transform="translate(200, 480)">
    <!-- Detailed trunk with bark lines -->
    <rect x="-12" y="-120" width="24" height="120" fill="#4E342E" />
    <line x1="-8" y1="-100" x2="-6" y2="-60" stroke="#3E2723" stroke-width="1" />
    <line x1="4" y1="-110" x2="6" y2="-50" stroke="#3E2723" stroke-width="1" />
    <line x1="-2" y1="-90" x2="0" y2="-30" stroke="#3E2723" stroke-width="1" />
    <!-- Branches -->
    <line x1="0" y1="-90" x2="-35" y2="-120" stroke="#5D4037" stroke-width="4" stroke-linecap="round" />
    <line x1="0" y1="-80" x2="30" y2="-105" stroke="#5D4037" stroke-width="3" stroke-linecap="round" />
    <!-- Detailed leaf clusters -->
    <circle cx="-40" cy="-135" r="22" fill="#1B5E20" />
    <circle cx="-20" cy="-145" r="28" fill="#2E7D32" />
    <circle cx="5" cy="-150" r="32" fill="#388E3C" />
    <circle cx="30" cy="-140" r="25" fill="#2E7D32" />
    <circle cx="35" cy="-118" r="20" fill="#1B5E20" />
    <circle cx="0" cy="-125" r="30" fill="#4CAF50" />
    <!-- Leaf detail highlights -->
    <circle cx="-15" cy="-150" r="8" fill="#66BB6A" opacity="0.5" />
    <circle cx="15" cy="-145" r="10" fill="#66BB6A" opacity="0.4" />
  </g>

  <g transform="translate(620, 500)">
    <!-- Another detailed foreground tree -->
    <rect x="-10" y="-100" width="20" height="100" fill="#4E342E" />
    <line x1="-5" y1="-80" x2="-4" y2="-30" stroke="#3E2723" stroke-width="1" />
    <line x1="5" y1="-90" x2="3" y2="-20" stroke="#3E2723" stroke-width="1" />
    <line x1="0" y1="-75" x2="-30" y2="-100" stroke="#5D4037" stroke-width="3" stroke-linecap="round" />
    <line x1="0" y1="-65" x2="25" y2="-88" stroke="#5D4037" stroke-width="3" stroke-linecap="round" />
    <circle cx="-30" cy="-115" r="20" fill="#1B5E20" />
    <circle cx="-10" cy="-125" r="26" fill="#2E7D32" />
    <circle cx="15" cy="-120" r="22" fill="#388E3C" />
    <circle cx="25" cy="-100" r="18" fill="#2E7D32" />
    <circle cx="0" cy="-110" r="25" fill="#4CAF50" />
  </g>

  <!-- Foreground details: flowers and grass at bottom -->
  <g opacity="0.9">
    <circle cx="100" cy="540" r="4" fill="#E74C3C" />
    <circle cx="130" cy="535" r="3" fill="#F39C12" />
    <circle cx="160" cy="545" r="4" fill="#E74C3C" />
    <circle cx="350" cy="530" r="3" fill="#9B59B6" />
    <circle cx="380" cy="540" r="4" fill="#F39C12" />
    <circle cx="500" cy="535" r="3" fill="#E74C3C" />
    <circle cx="750" cy="545" r="4" fill="#9B59B6" />
  </g>
</svg>
```

### Layer Management for Complex Scenes

For scenes with 15+ layers, organize into logical groups:

```
Layer structure for a complex scene:
├── layer-sky                    (background base)
├── layer-clouds                 (atmospheric)
├── layer-bg-buildings-left      (background zone)
├── layer-bg-buildings-right     (background zone)
├── layer-bg-mountains           (background zone)
├── layer-mid-buildings          (midground zone)
├── layer-mid-trees              (midground zone)
├── layer-street                 (transition zone)
├── layer-fg-building-main       (foreground zone)
├── layer-fg-building-detail     (foreground zone)
├── layer-fg-people              (foreground zone)
├── layer-fg-vehicle             (foreground zone)
├── layer-fg-streetlamp          (foreground zone)
├── layer-shadows                (effects)
├── layer-lighting               (effects)
└── layer-atmosphere             (effects overlay)
```

**Workflow tips for large scenes:**
1. **Plan all layers before starting** — sketch the layer list with zones
2. **Build one zone at a time** — complete background before moving to midground
3. **Preview after each zone** — catch issues before building on top
4. **Use consistent naming** — prefix with zone: `layer-bg-*`, `layer-mid-*`, `layer-fg-*`
5. **Keep background simple** — resist the urge to detail things that will be partially hidden
6. **Detail budget** — allocate most path complexity to 2-3 focal foreground elements

## Composition Checklist

Before finalizing any SVG scene, verify:

1. **Focal point** — Is there one clear primary subject?
2. **Value structure** — Does the composition read in grayscale? (squint test)
3. **Depth cues** — Are at least 3 of these present: overlap, size diminution, atmospheric perspective, color temperature, vertical position?
4. **Balance** — Does the composition feel stable (or intentionally unstable)?
5. **Flow** — Does the eye move naturally through the scene via implied lines?
6. **Negative space** — Is empty space purposeful, not accidental?
7. **Edge treatment** — Are elements that touch the canvas edge intentional? Do they lead in or out?
8. **Detail budget** — Is maximum detail concentrated on the focal area?
9. **Layer count** — Are there at least 3 distinct depth zones?
10. **Preview check** — Does it read at thumbnail size (50×50)?

## Related References
- `layer-workflow.md` — Layer ordering, naming, and critique framework
- `lighting-and-shading.md` — Lighting composition rules, three-point lighting, chiaroscuro
- `advanced-color-composition.md` — Color harmony, visual hierarchy, Gestalt grouping
- `nature-and-environment.md` — Landscape composition, depth layers, horizon placement
- `architecture-and-perspective.md` — Perspective systems, street scene composition
- `icon-and-ui-design.md` — Compact composition within icon grid constraints
