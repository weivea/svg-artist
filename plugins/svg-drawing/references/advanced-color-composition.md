# Advanced Color & Composition

## Perceptual Color Models

### Why HSL Falls Short

HSL (Hue, Saturation, Lightness) is convenient but **perceptually non-uniform**: two colors with the same L value can appear drastically different in brightness. Yellow at `hsl(60, 100%, 50%)` looks far brighter than blue at `hsl(240, 100%, 50%)` despite identical L values. This makes it unreliable for:
- Building consistent design systems
- Ensuring WCAG contrast compliance
- Creating smooth, natural-looking gradients

### OKLCH: Perceptually Uniform Color

OKLCH (Lightness, Chroma, Hue) maps colors according to human perception. Each axis is independent:

- **L** (Lightness): 0 = black, 1 = white — perceptually linear, unlike HSL
- **C** (Chroma): 0 = gray, 0.4+ = vivid — replaces "saturation" with perceptual accuracy
- **H** (Hue): 0–360° — hue angle on the color wheel

```xml
<!-- OKLCH in SVG via CSS custom properties -->
<svg viewBox="0 0 600 100">
  <style>
    .oklch-swatch { rx: 6; }
    .s1 { fill: oklch(0.7 0.15 30); }   /* Warm coral */
    .s2 { fill: oklch(0.7 0.15 150); }  /* Balanced green */
    .s3 { fill: oklch(0.7 0.15 250); }  /* Clear blue */
    /* Same L and C → all three look equally "bright" to the eye */
  </style>
  <rect class="oklch-swatch s1" x="20" y="20" width="160" height="60" />
  <rect class="oklch-swatch s2" x="220" y="20" width="160" height="60" />
  <rect class="oklch-swatch s3" x="420" y="20" width="160" height="60" />
</svg>
```

**OKLCH palette design rules:**
1. Lock L for all text colors → guarantees equal perceived contrast
2. Vary only H for hue-diverse palettes that stay harmonious
3. Reduce C for muted/background tones, increase for accents
4. Build WCAG-compliant palettes by checking L difference (ΔL ≥ 0.4 for 4.5:1 ratio approximation)

### CIE Lab & LCH

CIE Lab (L\*a\*b\*) is the foundational perceptual color model. OKLCH improves on it with better hue linearity, but understanding Lab helps with:

- **L\*** = perceptual lightness (0–100)
- **a\*** = green (−) to red (+) axis
- **b\*** = blue (−) to yellow (+) axis

**Delta E (ΔE)** measures perceptual color difference in Lab space:
- ΔE < 1: Not perceptible to most people
- ΔE 1–2: Perceptible through close observation
- ΔE 2–10: Perceptible at a glance
- ΔE > 10: Colors appear unrelated

Use ΔE when deciding if two similar colors are distinct enough for your illustration.

### Munsell Color System

Professional artists often think in Munsell terms: **Hue**, **Value** (lightness), and **Chroma** (saturation). Unlike HSL, Munsell is based on measured human perception:

- Colors are spaced so that each step looks visually equal
- Maximum chroma varies per hue (yellow can be more vivid than blue at the same value)
- Provides natural guidance for "how far can I push saturation before it looks garish?"

**SVG application:** When building a palette, test that value steps look even. If your grays in HSL look uneven, switch to OKLCH where L steps are perceptually uniform.

## Color Interaction Phenomena

### Simultaneous Contrast

A color's appearance changes based on its surroundings. This is the core insight from Josef Albers' *Interaction of Color*:

- A gray square on a red background appears greenish (the eye projects the complement)
- A gray square on a blue background appears yellowish
- The same orange looks warm on a cool background but dull on a warm background

```xml
<!-- Simultaneous contrast: identical gray looks different -->
<svg viewBox="0 0 500 200">
  <!-- Same hsl(0, 0%, 50%) gray on different backgrounds -->
  <rect x="20" y="20" width="200" height="160" fill="hsl(0, 70%, 45%)" />
  <rect x="70" y="60" width="100" height="80" fill="hsl(0, 0%, 50%)" />

  <rect x="280" y="20" width="200" height="160" fill="hsl(210, 70%, 45%)" />
  <rect x="330" y="60" width="100" height="80" fill="hsl(0, 0%, 50%)" />
  <!-- The left gray appears cooler/greenish; the right gray appears warmer/yellowish -->
</svg>
```

**Practical SVG rules for simultaneous contrast:**
- Always test accent colors against their actual background, not in isolation
- Skin tones shift dramatically with background color — preview in context
- Use simultaneous contrast intentionally: warm subject on cool background makes it "pop"
- For neutral grays, add a tiny tint toward the background's complement to counteract the shift

### Color Vibration (Optical Buzzing)

When two high-chroma complementary colors meet at an edge without a neutral separator, the boundary appears to shimmer or vibrate. The eye cannot simultaneously focus on both chromatically opposed signals.

```xml
<!-- Color vibration: high-chroma complements touching directly -->
<svg viewBox="0 0 400 200">
  <!-- Intense red and green with no separator → visual vibration -->
  <rect x="0" y="0" width="200" height="200" fill="hsl(0, 100%, 50%)" />
  <rect x="200" y="0" width="200" height="200" fill="hsl(120, 100%, 40%)" />

  <!-- Fix: add a thin neutral border to reduce vibration -->
  <!--
  <rect x="0" y="0" width="198" height="200" fill="hsl(0, 100%, 50%)" />
  <rect x="198" y="0" width="4" height="200" fill="hsl(0, 0%, 20%)" />
  <rect x="202" y="0" width="198" height="200" fill="hsl(120, 100%, 40%)" />
  -->
</svg>
```

**When to use vibration:** Op-art effects, attention-grabbing elements, psychedelic styles
**When to avoid:** Text readability, UI elements, medical/accessibility contexts

**Mitigation techniques in SVG:**
1. Reduce chroma of one or both colors (lower C in OKLCH)
2. Add a 1–3px neutral stroke between shapes
3. Slightly offset lightness (one dark, one light)
4. Use `mix-blend-mode` to soften the junction

### Bezold Effect

Adding white or black to a color pattern changes the perceived appearance of all surrounding colors. In SVG:

```xml
<!-- Bezold effect: same pattern looks different with white vs black outlines -->
<svg viewBox="0 0 500 200">
  <defs>
    <pattern id="bezold-w" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="hsl(30, 80%, 55%)" />
      <rect x="5" y="5" width="10" height="10" fill="white" />
    </pattern>
    <pattern id="bezold-b" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="hsl(30, 80%, 55%)" />
      <rect x="5" y="5" width="10" height="10" fill="black" />
    </pattern>
  </defs>
  <rect x="20" y="20" width="200" height="160" fill="url(#bezold-w)" />
  <rect x="280" y="20" width="200" height="160" fill="url(#bezold-b)" />
  <!-- Same orange, but the left pattern appears lighter and more airy -->
</svg>
```

### Chromatic Adaptation & Color Constancy

The human visual system adjusts to ambient lighting, making colors appear relatively constant under different illumination (the reason a white shirt looks white under both sunlight and indoor light). In SVG illustration:

- When depicting a scene lit by warm light, don't just tint everything orange — shift shadows toward blue/violet to mimic how the eye compensates
- Under cool moonlight, shadows should shift warm (brown/amber) to feel natural
- Use `feColorMatrix` to simulate white balance shifts for the whole scene

```xml
<!-- Simulate warm indoor lighting with chromatic adaptation -->
<defs>
  <filter id="warm-light">
    <feColorMatrix type="matrix" values="
      1.1  0.05 0    0  0.03
      0.02 1.0  0    0  0.01
      0    0    0.85 0  0
      0    0    0    1  0" />
  </filter>
  <filter id="cool-shadow">
    <feColorMatrix type="matrix" values="
      0.85 0    0.05 0  0
      0    0.9  0.1  0  0
      0.05 0.1  1.1  0  0.02
      0    0    0    1  0" />
  </filter>
</defs>
```

### Metamerism in Digital Color

Metamerism occurs when two colors match under one light source but diverge under another. In digital SVG work:

- Two hex colors that look identical on your monitor may diverge on different screens
- Use perceptual color models (OKLCH) to minimize metameric mismatch
- When creating print-intended SVG, test with sRGB and Display P3 gamuts
- Avoid building palettes by eyeballing — specify colors numerically in a perceptual space

## Itten's Seven Contrasts

Johannes Itten identified seven types of color contrast. Mastering all seven gives you complete control over color relationships:

| Contrast | Description | SVG Application |
|----------|-------------|-----------------|
| **Hue** | Pure color differences (red vs blue) | Use for category distinction in data viz |
| **Light-Dark** | Value differences | Primary tool for form and depth |
| **Cold-Warm** | Temperature differences | Create spatial depth (warm = near, cool = far) |
| **Complementary** | Opposite hues (red ↔ green) | Maximum contrast, use for focal points |
| **Simultaneous** | Eye generates complement on neutral | Account for in skin tones and neutral areas |
| **Quality** | Saturated vs muted | Draw attention to saturated element |
| **Quantity** | Area ratio of colors | Balance small vivid area with large muted area |

### Quantity Contrast in Practice

Goethe assigned brightness values to colors: yellow=9, orange=8, red=6, green=6, blue=4, violet=3.
The balanced area ratio is the inverse: yellow needs the least area, violet the most.

```xml
<!-- Quantity contrast: balanced yellow + violet -->
<svg viewBox="0 0 400 200">
  <!-- Violet takes ~75% area (3/(3+9) inverted ratio) -->
  <rect x="0" y="0" width="300" height="200" fill="hsl(270, 60%, 40%)" />
  <!-- Yellow takes ~25% area but reads equally strong -->
  <rect x="300" y="0" width="100" height="200" fill="hsl(55, 90%, 60%)" />
</svg>
```

## Advanced Color Harmony Techniques

### Chromatic Gray

Pure gray is lifeless. Professional colorists always tint grays:

```xml
<defs>
  <!-- Warm gray for sunlit scenes -->
  <linearGradient id="warm-gray" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="hsl(30, 8%, 65%)" />
    <stop offset="100%" stop-color="hsl(25, 6%, 45%)" />
  </linearGradient>
  <!-- Cool gray for shadow/night scenes -->
  <linearGradient id="cool-gray" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="hsl(210, 10%, 60%)" />
    <stop offset="100%" stop-color="hsl(220, 8%, 40%)" />
  </linearGradient>
</defs>
```

**Rule:** Gray in shadows should lean toward the complement of the light source color. Warm light → cool shadows. Cool light → warm shadows.

### Color Discord & Tension

Intentional discord creates visual energy. Discord pairs are NOT complementary — they are uncomfortable neighbors:

- Colors 1–2 steps apart on a 12-hue wheel but with different values
- High-chroma color next to a muted version of a different hue
- Warm + cool with similar lightness (creates spatial ambiguity)

**Use discord for:** Unsettling scenes, dynamic energy, modern/edgy aesthetics
**Avoid discord for:** Calming, professional, or accessible designs

### 60-30-10 Rule

Professional palette distribution:
- **60%** — Dominant color (background, large areas)
- **30%** — Secondary color (supporting elements)
- **10%** — Accent color (focal points, CTAs)

```xml
<svg viewBox="0 0 800 600">
  <!-- 60% dominant: soft blue background -->
  <rect width="800" height="600" fill="hsl(210, 25%, 92%)" />
  <!-- 30% secondary: medium blue-gray for structure -->
  <rect x="100" y="100" width="600" height="400" rx="16" fill="hsl(210, 20%, 75%)" />
  <!-- 10% accent: warm coral for focal point -->
  <circle cx="400" cy="300" r="40" fill="hsl(12, 85%, 60%)" />
</svg>
```

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

### Cultural Color Meanings

**Be aware of context-dependent meanings:**

- **White:** Purity in Western cultures, mourning in East Asia
- **Red:** Danger/stop in Western cultures, luck and prosperity in China
- **Green:** Sacred in Islam, nature universally, sometimes jealousy in the West
- **Purple:** Royalty in Europe, mourning in some Asian cultures
- **Yellow:** Sacred in Buddhism, imperial in China, caution in the West
- **Black:** Mourning in Western cultures, power universally

**Practical tip:** For international audiences, rely on color combinations rather than single colors for meaning. Use icons and text alongside color to reinforce intent.

## Color Temperature & Atmospheric Design

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

### Aerial Perspective Color Shifts

As objects recede in distance, three things happen to their color:
1. **Saturation decreases** (chroma approaches 0)
2. **Lightness increases** (values move toward the sky color)
3. **Hue shifts toward blue** (atmospheric scattering)

```xml
<!-- 5-layer aerial perspective depth -->
<svg viewBox="0 0 800 400">
  <!-- Sky -->
  <rect width="800" height="400" fill="hsl(210, 50%, 80%)" />
  <!-- Far mountains: low chroma, high lightness, blue-shifted -->
  <path d="M 0 280 L 150 180 L 350 240 L 500 160 L 700 220 L 800 200 V 400 H 0 Z"
        fill="hsl(215, 15%, 72%)" />
  <!-- Mid mountains: moderate chroma -->
  <path d="M 0 320 L 200 220 L 400 280 L 600 200 L 800 260 V 400 H 0 Z"
        fill="hsl(160, 25%, 55%)" />
  <!-- Near hills: more saturated, warmer -->
  <path d="M 0 360 L 250 300 L 500 340 L 750 290 L 800 310 V 400 H 0 Z"
        fill="hsl(120, 40%, 40%)" />
  <!-- Foreground: highest chroma, warmest hue -->
  <path d="M 0 380 Q 200 360 400 375 Q 600 390 800 370 V 400 H 0 Z"
        fill="hsl(80, 55%, 35%)" />
</svg>
```

### Time-of-Day Color Palettes

| Time | Sky Color | Light Color | Shadow Color | Key Mood |
|------|-----------|-------------|--------------|----------|
| **Dawn** | Soft pink-lavender | Warm gold | Cool violet | Hope, fresh start |
| **Morning** | Clear blue | Neutral white | Blue-gray | Clarity, energy |
| **Noon** | Intense blue | Hot white | Deep, short | Harsh, vibrant |
| **Golden Hour** | Orange-gold | Deep amber | Long blue-violet | Romance, warmth |
| **Dusk** | Purple-magenta | Dim orange | Deep indigo | Mystery, transition |
| **Night** | Dark navy-black | Cool blue (moon) | Near-black blue | Quiet, introspection |
| **Overcast** | Flat gray-blue | Diffused white | Soft, directionless | Melancholy, soft |

```xml
<!-- Golden hour scene color setup -->
<defs>
  <linearGradient id="golden-sky" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="hsl(270, 40%, 45%)" />
    <stop offset="40%" stop-color="hsl(30, 70%, 60%)" />
    <stop offset="100%" stop-color="hsl(40, 80%, 70%)" />
  </linearGradient>
</defs>
<rect width="800" height="600" fill="url(#golden-sky)" />
<!-- Objects: warm highlights (hsl 35-45), cool violet shadows (hsl 260-280) -->
```

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

### Tritone and Gradient Mapping

Extend duotone to three or more color stops for richer tonal range:

```xml
<defs>
  <filter id="tritone-shadows-mids-highlights">
    <!-- Desaturate first -->
    <feColorMatrix type="saturate" values="0" result="gray" />
    <!-- Map shadows → deep purple, midtones → teal, highlights → gold -->
    <feComponentTransfer in="gray">
      <feFuncR type="table" tableValues="0.15 0.1  0.95" />
      <feFuncG type="table" tableValues="0.05 0.55 0.85" />
      <feFuncB type="table" tableValues="0.25 0.50 0.20" />
    </feComponentTransfer>
  </filter>
</defs>
```

**Table values mapping:** First value = shadow color, middle = midtone, last = highlight. Add more stops for finer control over tonal regions.

**Tips:**
- Apply color grading as the LAST filter on the top-level group
- Subtle grading (5-15% shift) unifies without looking artificial
- Strong grading (50%+) creates a distinct stylistic look
- Combine with opacity to blend graded and original: use two layers

## WCAG Accessibility & Colorblind Design

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

### Types of Color Vision Deficiency

| Type | Affected | Prevalence | Confusion Pairs |
|------|----------|------------|-----------------|
| **Protanopia** | Red cone missing | ~1% males | Red↔Green, Red↔Brown |
| **Deuteranopia** | Green cone missing | ~1% males | Red↔Green, Green↔Brown |
| **Tritanopia** | Blue cone missing | ~0.003% | Blue↔Green, Yellow↔Violet |
| **Achromatopsia** | No cones | ~0.003% | All hue distinctions lost |

### Colorblind-Safe Palettes

Avoid relying on red-green distinctions. Use these safe combinations:

```xml
<!-- Colorblind-safe palette using blue + orange + gray (Okabe-Ito) -->
<circle cx="80" cy="100" r="30" fill="#0072B2" />   <!-- Blue -->
<circle cx="160" cy="100" r="30" fill="#E69F00" />   <!-- Orange -->
<circle cx="240" cy="100" r="30" fill="#999999" />   <!-- Gray -->
<circle cx="320" cy="100" r="30" fill="#56B4E9" />   <!-- Light blue -->
<circle cx="400" cy="100" r="30" fill="#D55E00" />   <!-- Vermillion -->
```

### Simulating CVD in SVG

Use `feColorMatrix` to simulate how colorblind users see your artwork:

```xml
<defs>
  <!-- Protanopia simulation -->
  <filter id="sim-protanopia">
    <feColorMatrix type="matrix" values="
      0.567 0.433 0.000 0 0
      0.558 0.442 0.000 0 0
      0.000 0.242 0.758 0 0
      0     0     0     1 0" />
  </filter>

  <!-- Deuteranopia simulation -->
  <filter id="sim-deuteranopia">
    <feColorMatrix type="matrix" values="
      0.625 0.375 0.000 0 0
      0.700 0.300 0.000 0 0
      0.000 0.300 0.700 0 0
      0     0     0     1 0" />
  </filter>

  <!-- Tritanopia simulation -->
  <filter id="sim-tritanopia">
    <feColorMatrix type="matrix" values="
      0.950 0.050 0.000 0 0
      0.000 0.433 0.567 0 0
      0.000 0.475 0.525 0 0
      0     0     0     1 0" />
  </filter>
</defs>

<!-- Preview your scene under CVD simulation -->
<g filter="url(#sim-deuteranopia)">
  <!-- Scene content here -->
</g>
```

### Universal Design Strategies

Beyond the Okabe-Ito palette, these techniques ensure accessibility:

1. **Redundant coding:** Never use color alone — combine with shape, pattern, or label
2. **Luminance variation:** Ensure colors differ in lightness, not just hue (use OKLCH L values)
3. **Pattern fills for data:** Use hatching/dots/stripes alongside color in charts
4. **Thick borders:** 2–3px borders around colored regions aid distinction
5. **Test early:** Apply CVD simulation filters during development, not just at the end

```xml
<!-- Accessible chart: color + pattern + label -->
<defs>
  <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,0,0,0.3)" stroke-width="2" />
  </pattern>
  <pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse">
    <circle cx="3" cy="3" r="1.5" fill="rgba(0,0,0,0.3)" />
  </pattern>
</defs>
<rect x="50" y="50" width="80" height="120" fill="#0072B2" />
<rect x="50" y="50" width="80" height="120" fill="url(#hatch)" />
<text x="90" y="190" text-anchor="middle" font-size="12">Category A</text>

<rect x="160" y="80" width="80" height="90" fill="#E69F00" />
<rect x="160" y="80" width="80" height="90" fill="url(#dots)" />
<text x="200" y="190" text-anchor="middle" font-size="12">Category B</text>
```

## Composition Frameworks

### Golden Ratio & Fibonacci

#### Golden Ratio Placement

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

#### Fibonacci Spiral for Composition Flow

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

### Visual Hierarchy System

#### Priority Order

1. **Size** — Largest element is seen first
2. **Color contrast** — High-contrast element draws eye
3. **Position** — Center and upper-left attract attention first
4. **Whitespace** — Element surrounded by space stands out
5. **Detail** — More detailed element appears more important

#### Implementation

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

### Visual Flow Design

#### Z-Pattern

For simple layouts: eye moves left-to-right, diagonal down, left-to-right again.

#### F-Pattern

For text-heavy content: eye scans top, then left side downward.

#### Circular Flow

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

### Common Fate

Elements moving in the same direction are perceived as a group. In static SVG, simulate motion with aligned angles or curves:

```xml
<!-- Common fate: arrows pointing same direction feel grouped -->
<g fill="#3498DB">
  <polygon points="50,80 70,60 70,70 100,70 100,90 70,90 70,100" />
  <polygon points="50,130 70,110 70,120 100,120 100,140 70,140 70,150" />
</g>
<!-- This arrow points differently → reads as separate -->
<polygon points="250,120 230,100 240,100 240,70 260,70 260,100 270,100"
         fill="#E74C3C" />
```

### Prägnanz (Good Form)

The brain prefers simple, regular, symmetrical forms. Use this principle to make complex SVG illustrations feel organized:

- Group related elements into simple geometric containers
- Align elements to a visible or implied grid
- Use symmetry as a foundation, then break it strategically for interest

### Focal Point (Von Restorff Effect)

An element that differs from its surroundings in a single attribute stands out dramatically:

```xml
<!-- Von Restorff: one element breaks the pattern -->
<svg viewBox="0 0 500 120">
  <circle cx="60" cy="60" r="30" fill="hsl(210, 15%, 70%)" />
  <circle cx="140" cy="60" r="30" fill="hsl(210, 15%, 70%)" />
  <circle cx="220" cy="60" r="30" fill="hsl(210, 15%, 70%)" />
  <!-- This one is different in color AND size → instant focal point -->
  <circle cx="320" cy="60" r="40" fill="hsl(350, 80%, 55%)" />
  <circle cx="420" cy="60" r="30" fill="hsl(210, 15%, 70%)" />
</svg>
```

## Multi-Principle Integration

### Combining Gestalt + Color Theory + Hierarchy

Professional illustrations combine multiple principles simultaneously:

```xml
<!-- Integrated example: poster design -->
<svg viewBox="0 0 600 800">
  <!-- 60-30-10 color distribution -->
  <rect width="600" height="800" fill="hsl(220, 25%, 15%)" /> <!-- 60% dark bg -->

  <!-- Proximity + Similarity: grouped info elements (30% secondary) -->
  <g transform="translate(60, 500)">
    <rect width="480" height="200" rx="12" fill="hsl(220, 20%, 25%)" />
    <circle cx="50" cy="50" r="20" fill="hsl(200, 40%, 55%)" />
    <circle cx="50" cy="110" r="20" fill="hsl(200, 40%, 55%)" />
    <circle cx="50" cy="170" r="20" fill="hsl(200, 40%, 55%)" />
    <!-- Text labels would go here -->
  </g>

  <!-- Von Restorff + Golden Ratio: focal point at phi intersection -->
  <!-- 600 × 0.618 = 371, 800 × 0.382 = 306 -->
  <circle cx="371" cy="250" r="80" fill="hsl(15, 85%, 55%)" /> <!-- 10% accent -->

  <!-- Continuity: leading line guides eye from focal to info -->
  <path d="M 371 330 C 371 400, 300 450, 300 500"
        fill="none" stroke="hsl(15, 60%, 45%)" stroke-width="2" stroke-dasharray="6 4" />
</svg>
```

### Practical Checklist for Color Decisions

Before finalizing any color scheme, verify:

1. **Contrast:** Text passes WCAG AA (4.5:1 body, 3:1 large text)?
2. **CVD safe:** Apply protanopia/deuteranopia filter — still distinguishable?
3. **Hierarchy:** Squint test — are focal points still visible when blurred?
4. **Temperature:** Do warm/cool relationships support depth intent?
5. **Quantity:** Is the 60-30-10 ratio approximately maintained?
6. **Simultaneous contrast:** Do neutrals look "right" against their actual backgrounds?
7. **Color grading:** Does a subtle feColorMatrix unify the scene mood?
8. **Cultural context:** Are colors appropriate for target audience?
