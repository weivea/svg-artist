---
name: advanced-color-composition
description: "Advanced color theory, accessibility, Gestalt principles, and composition frameworks for professional SVG artwork. Use when planning color palettes, ensuring accessibility, or designing complex compositions."
---

# Advanced Color & Composition

## Advanced Palette Methods

### Split-Complementary

One base color + two colors adjacent to its complement. Provides contrast with less tension than pure complementary.

```xml
<defs>
  <rect id="swatch" width="60" height="40" rx="4" />
</defs>
<!-- Split-complementary: Blue (210°) + Red-Orange (30°) + Yellow-Orange (60°) -->
<use href="#swatch" x="20" y="20" fill="hsl(210, 70%, 50%)" />  <!-- Base -->
<use href="#swatch" x="90" y="20" fill="hsl(30, 70%, 50%)" />   <!-- Split 1 -->
<use href="#swatch" x="160" y="20" fill="hsl(60, 70%, 50%)" />  <!-- Split 2 -->
```

**When to use:** When you want contrast but the full complementary is too harsh. Good for illustrations with a clear dominant color.

### Tetradic (Rectangle)

Four colors forming a rectangle on the color wheel (two complementary pairs).

```xml
<!-- Tetradic: Teal (180°) + Red (0°) + Yellow-Green (90°) + Purple (270°) -->
<use href="#swatch" x="20" y="20" fill="hsl(180, 60%, 45%)" />
<use href="#swatch" x="90" y="20" fill="hsl(0, 60%, 45%)" />
<use href="#swatch" x="160" y="20" fill="hsl(90, 60%, 45%)" />
<use href="#swatch" x="230" y="20" fill="hsl(270, 60%, 45%)" />
```

**When to use:** Complex scenes with many elements. Let one color dominate (60%), use one for secondary (25%), and two as accents (15%).

### Square

Four colors evenly spaced (90° apart). Maximum color variety.

```xml
<!-- Square: Red (0°) + Yellow-Green (90°) + Cyan (180°) + Blue-Violet (270°) -->
<use href="#swatch" x="20" y="20" fill="hsl(0, 65%, 50%)" />
<use href="#swatch" x="90" y="20" fill="hsl(90, 65%, 45%)" />
<use href="#swatch" x="160" y="20" fill="hsl(180, 65%, 45%)" />
<use href="#swatch" x="230" y="20" fill="hsl(270, 65%, 50%)" />
```

**When to use:** Playful, vibrant illustrations. Requires careful balance to avoid chaos.

### Double-Complementary

Two complementary pairs that are close to each other on the wheel.

**When to use:** Rich, full illustrations. Similar to tetradic but more balanced.

## Color Psychology

### Emotional Associations

| Color | Positive | Negative | Best For |
|-------|----------|----------|----------|
| **Red** | Passion, love, energy | Danger, aggression | Call to action, food, urgency |
| **Blue** | Trust, calm, professional | Cold, distant | Corporate, technology, water |
| **Green** | Nature, growth, health | Envy, stagnation | Environment, wellness, money |
| **Yellow** | Optimism, warmth, joy | Caution, anxiety | Children, sunshine, warnings |
| **Purple** | Luxury, mystery, creativity | Arrogance, decadence | Premium brands, magic, royalty |
| **Orange** | Energy, enthusiasm, warmth | Cheapness, impatience | Sports, autumn, food |
| **Black** | Power, elegance, sophistication | Death, evil | Luxury, tech, formal |
| **White** | Purity, simplicity, space | Sterile, empty | Minimalism, healthcare |

### Applying Psychology in SVG

```xml
<!-- Trust-building scene: blue dominant with white accents -->
<rect width="800" height="600" fill="hsl(210, 70%, 25%)" />
<rect x="50" y="50" width="700" height="500" rx="20" fill="hsl(210, 60%, 95%)" />
<text x="400" y="300" text-anchor="middle" fill="hsl(210, 70%, 35%)" font-size="24">
  Trustworthy & Professional
</text>
```

## Cultural Color Meanings

**Be aware of context-dependent meanings:**

- **White:** Purity in Western cultures, mourning in East Asia
- **Red:** Danger/stop in Western cultures, luck and prosperity in China
- **Green:** Sacred in Islam, nature universally, sometimes jealousy in the West
- **Purple:** Royalty in Europe, mourning in some Asian cultures
- **Yellow:** Sacred in Buddhism, imperial in China, caution in the West
- **Black:** Mourning in Western cultures, power universally

**Practical tip:** For international audiences, rely on color combinations rather than single colors for meaning. Use icons and text alongside color to reinforce intent.

## WCAG Accessibility

### Contrast Requirements

- **Normal text (< 18pt):** minimum 4.5:1 contrast ratio
- **Large text (≥ 18pt or ≥ 14pt bold):** minimum 3:1 contrast ratio
- **UI components:** minimum 3:1 against background

### Contrast Calculation

Relative luminance formula: `L = 0.2126 * R + 0.7152 * G + 0.0722 * B`
Contrast ratio: `(L1 + 0.05) / (L2 + 0.05)` where L1 > L2

### Safe Palette Combinations

```xml
<!-- High contrast combinations -->
<g id="accessible-pairs">
  <!-- Black on white: 21:1 ratio ✅ -->
  <rect x="20" y="20" width="120" height="40" fill="white" stroke="#333" />
  <text x="80" y="45" text-anchor="middle" fill="black" font-size="14">21:1</text>

  <!-- Dark blue on light yellow: ~10:1 ratio ✅ -->
  <rect x="160" y="20" width="120" height="40" fill="#FFF8DC" stroke="#333" />
  <text x="220" y="45" text-anchor="middle" fill="#1a237e" font-size="14">~10:1</text>

  <!-- Dark green on white: ~5:1 ratio ✅ -->
  <rect x="300" y="20" width="120" height="40" fill="white" stroke="#333" />
  <text x="360" y="45" text-anchor="middle" fill="#1B5E20" font-size="14">~5:1</text>
</g>
```

### Colorblind-Safe Palettes

Avoid relying on red-green distinctions. Use these safe combinations:

```xml
<!-- Colorblind-safe palette using blue + orange + gray -->
<circle cx="80" cy="100" r="30" fill="#0072B2" />   <!-- Blue -->
<circle cx="160" cy="100" r="30" fill="#E69F00" />   <!-- Orange -->
<circle cx="240" cy="100" r="30" fill="#999999" />   <!-- Gray -->
<circle cx="320" cy="100" r="30" fill="#56B4E9" />   <!-- Light blue -->
<circle cx="400" cy="100" r="30" fill="#D55E00" />   <!-- Vermillion -->
```

**Tips:**
- Don't rely on color ALONE to convey information
- Use patterns, labels, or icons alongside color
- Test with a colorblind simulation tool
- The safe palette above (Okabe-Ito) works for all common color vision deficiencies

## Golden Ratio & Fibonacci

### Golden Ratio Placement

Place key elements at golden ratio divisions: at 38.2% and 61.8% of width/height.

```xml
<!-- Golden ratio grid on 800×600 canvas -->
<svg viewBox="0 0 800 600">
  <!-- Golden ratio vertical lines: 800 × 0.382 = 306, 800 × 0.618 = 494 -->
  <line x1="306" y1="0" x2="306" y2="600" stroke="rgba(255,215,0,0.3)" stroke-dasharray="5 5" />
  <line x1="494" y1="0" x2="494" y2="600" stroke="rgba(255,215,0,0.3)" stroke-dasharray="5 5" />
  <!-- Golden ratio horizontal lines: 600 × 0.382 = 229, 600 × 0.618 = 371 -->
  <line x1="0" y1="229" x2="800" y2="229" stroke="rgba(255,215,0,0.3)" stroke-dasharray="5 5" />
  <line x1="0" y1="371" x2="800" y2="371" stroke="rgba(255,215,0,0.3)" stroke-dasharray="5 5" />
  <!-- Focal point at intersection: (494, 229) -->
  <circle cx="494" cy="229" r="5" fill="gold" />
</svg>
```

### Fibonacci Spiral for Composition Flow

Use the Fibonacci sequence (1, 1, 2, 3, 5, 8, 13) to create natural-feeling proportions:

```xml
<!-- Fibonacci spiral guide (approximate) -->
<path d="M 494 371
         Q 494 229, 306 229
         Q 190 229, 190 300
         Q 190 350, 230 371
         Q 260 371, 260 350
         Q 260 340, 250 340"
      fill="none" stroke="rgba(255,215,0,0.5)" stroke-width="1" />
```

**Practical rule:** Place your focal element at a golden ratio intersection point. Let the eye follow the spiral path through secondary and tertiary elements.

## Gestalt Principles

### Proximity

Elements close together are perceived as a group.

```xml
<!-- Proximity: two distinct groups -->
<g id="gestalt-proximity">
  <!-- Group 1 (close together) -->
  <circle cx="50" cy="100" r="8" fill="#3498DB" />
  <circle cx="70" cy="100" r="8" fill="#3498DB" />
  <circle cx="60" cy="82" r="8" fill="#3498DB" />
  <!-- Gap -->
  <!-- Group 2 (close together) -->
  <circle cx="140" cy="100" r="8" fill="#E74C3C" />
  <circle cx="160" cy="100" r="8" fill="#E74C3C" />
  <circle cx="150" cy="82" r="8" fill="#E74C3C" />
</g>
```

### Similarity

Elements that look alike are perceived as related.

```xml
<!-- Similarity: shape distinguishes groups -->
<circle cx="50" cy="100" r="10" fill="#3498DB" />
<rect x="90" y="90" width="20" height="20" fill="#3498DB" />
<circle cx="140" cy="100" r="10" fill="#3498DB" />
<rect x="170" y="90" width="20" height="20" fill="#3498DB" />
<!-- We see: circles as one group, squares as another -->
```

### Closure

The brain completes incomplete shapes.

```xml
<!-- Closure: we see a circle even though it's incomplete -->
<path d="M 100 50 A 50 50 0 1 1 100 150" fill="none" stroke="#333" stroke-width="3" stroke-dasharray="8 12" />
<!-- Closure: Kanizsa triangle — we see a white triangle -->
<circle cx="100" cy="50" r="20" fill="#333" />
<circle cx="50" cy="140" r="20" fill="#333" />
<circle cx="150" cy="140" r="20" fill="#333" />
<!-- "Bite" marks in the circles suggest triangle vertices -->
<circle cx="100" cy="50" r="20" fill="white" />
<path d="M 100 50 L 85 76 A 20 20 0 0 1 115 76 Z" fill="white" />
```

### Continuity

The eye follows smooth paths and lines.

```xml
<!-- Continuity: the eye follows the curve smoothly -->
<path d="M 50 150 C 150 50, 250 250, 350 100 C 450 -50, 550 200, 650 100"
      fill="none" stroke="#E74C3C" stroke-width="3" />
```

### Figure/Ground

We naturally separate foreground objects from the background.

```xml
<!-- Figure/Ground: dark shape on light background reads as "figure" -->
<rect width="200" height="200" fill="#ECF0F1" />
<circle cx="100" cy="100" r="60" fill="#2C3E50" />
```

### Common Region

Elements within a boundary are perceived as a group.

```xml
<!-- Common region: enclosing rectangle groups elements -->
<rect x="30" y="30" width="150" height="80" rx="10" fill="none" stroke="#999" stroke-width="1" />
<circle cx="65" cy="70" r="15" fill="#3498DB" />
<circle cx="105" cy="70" r="15" fill="#E74C3C" />
<circle cx="145" cy="70" r="15" fill="#2ECC71" />
```

## Visual Hierarchy System

### Priority Order

1. **Size** — Largest element is seen first
2. **Color contrast** — High-contrast element draws eye
3. **Position** — Center and upper-left attract attention first
4. **Whitespace** — Element surrounded by space stands out
5. **Detail** — More detailed element appears more important

### Implementation

```xml
<!-- Visual hierarchy example: hero element + supporting -->
<svg viewBox="0 0 800 600">
  <!-- Background (lowest hierarchy) -->
  <rect width="800" height="600" fill="#F5F5F5" />

  <!-- Supporting elements (small, muted) -->
  <circle cx="200" cy="500" r="20" fill="#BDC3C7" />
  <circle cx="600" cy="500" r="15" fill="#BDC3C7" />

  <!-- Hero element (large, high contrast, centered) -->
  <circle cx="400" cy="280" r="100" fill="#E74C3C" />

  <!-- Label (secondary importance, close to hero) -->
  <text x="400" y="450" text-anchor="middle" font-size="18" fill="#2C3E50">
    Primary Focus Here
  </text>
</svg>
```

## Visual Flow Design

### Z-Pattern

For simple layouts: eye moves left-to-right, diagonal down, left-to-right again.

### F-Pattern

For text-heavy content: eye scans top, then left side downward.

### Circular Flow

Use curves and placement to guide the eye in a circle through the scene:

```xml
<!-- Guide the eye: large element → medium → small → back to large -->
<circle cx="200" cy="150" r="80" fill="#E74C3C" />  <!-- Start here (largest) -->
<path d="M 280 150 Q 400 100, 500 200" fill="none" stroke="#ddd" stroke-width="1" stroke-dasharray="4" />
<circle cx="500" cy="250" r="50" fill="#3498DB" />   <!-- Follow here -->
<path d="M 500 300 Q 450 400, 350 400" fill="none" stroke="#ddd" stroke-width="1" stroke-dasharray="4" />
<circle cx="300" cy="400" r="30" fill="#2ECC71" />   <!-- Then here -->
<!-- Eye naturally returns to largest element -->
```

**Flow techniques:**
- Leading lines (rivers, roads, glance direction) guide the eye
- Size progression (large → medium → small) creates reading order
- Color intensity progression (saturated → muted) guides attention
- Overlapping elements create a chain the eye follows

## Color Temperature Management

### Warm vs Cool

- **Warm colors** (red, orange, yellow): hues 0-60° and 300-360° — feel closer, energetic
- **Cool colors** (green, blue, purple): hues 120-270° — feel distant, calm

### Temperature for Depth

```xml
<!-- Warm foreground, cool background creates depth -->
<defs>
  <linearGradient id="depth-bg" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="hsl(220, 40%, 60%)" />  <!-- Cool sky -->
    <stop offset="100%" stop-color="hsl(200, 30%, 70%)" /> <!-- Cool horizon -->
  </linearGradient>
</defs>
<rect width="800" height="600" fill="url(#depth-bg)" />
<!-- Distant mountains: cool blue-gray -->
<path d="M 0 400 L 200 250 L 400 350 L 600 200 L 800 400"
      fill="hsl(210, 20%, 65%)" />
<!-- Near ground: warm green-brown -->
<path d="M 0 450 Q 400 400, 800 450 V 600 H 0 Z"
      fill="hsl(80, 40%, 40%)" />
<!-- Foreground flowers: warm red-orange -->
<circle cx="200" cy="520" r="8" fill="hsl(15, 80%, 55%)" />
<circle cx="350" cy="530" r="6" fill="hsl(30, 85%, 60%)" />
```

### Temperature Balance

- Mostly cool scene + one warm accent = focal point draws attention
- Mostly warm scene + cool shadows = natural depth
- Equal warm and cool = visual tension (can be intentional)

## Duotone & Color Grading

### feColorMatrix for Tone Unification

Apply a color matrix to unify all colors in a scene to a specific mood:

```xml
<defs>
  <!-- Sepia tone -->
  <filter id="sepia-grade">
    <feColorMatrix type="matrix" values="
      0.393 0.769 0.189 0 0
      0.349 0.686 0.168 0 0
      0.272 0.534 0.131 0 0
      0     0     0     1 0" />
  </filter>

  <!-- Cool blue grade -->
  <filter id="cool-grade">
    <feColorMatrix type="matrix" values="
      0.8  0    0.1  0 0
      0    0.8  0.2  0 0
      0.1  0.2  1.0  0 0
      0    0    0    1 0" />
  </filter>

  <!-- Warm sunset grade -->
  <filter id="warm-grade">
    <feColorMatrix type="matrix" values="
      1.2  0.1  0    0 0.05
      0.1  0.9  0    0 0
      0    0    0.7  0 0
      0    0    0    1 0" />
  </filter>
</defs>

<!-- Apply to entire scene -->
<g filter="url(#sepia-grade)">
  <!-- All scene content here gets unified color grading -->
</g>
```

### Duotone Effect

Map all colors to a two-color range:

```xml
<defs>
  <filter id="duotone-blue-orange">
    <!-- First desaturate -->
    <feColorMatrix type="saturate" values="0" result="gray" />
    <!-- Then map to duotone -->
    <feComponentTransfer in="gray">
      <feFuncR type="table" tableValues="0.2 1.0" />  <!-- dark=blue, light=orange R -->
      <feFuncG type="table" tableValues="0.3 0.6" />
      <feFuncB type="table" tableValues="0.8 0.2" />
    </feComponentTransfer>
  </filter>
</defs>
```

**Tips:**
- Apply color grading as the LAST filter on the top-level group
- Subtle grading (5-15% shift) unifies without looking artificial
- Strong grading (50%+) creates a distinct stylistic look
- Combine with opacity to blend graded and original: use two layers
