# SVG Filters & Effects

This skill covers the complete SVG filter pipeline: all 17 filter primitives, chain construction, ready-made effect recipes, turbulence tuning, blend modes, and advanced masking. Use these techniques to add depth, texture, atmosphere, and polish to any SVG artwork.

---

## 1. Filter Primitives Reference

Every SVG filter is built from one or more **filter primitives** — atomic image-processing operations that read pixel data, transform it, and output a new image buffer. Below is the full set of 17 primitives you will use.

### 1.1 feGaussianBlur

**Purpose:** Applies a Gaussian blur to the input image. The workhorse primitive for soft shadows, glow effects, depth-of-field, and smoothing edges.

**Key parameters:**
- `stdDeviation` — Blur radius in user units. Single value for uniform blur, two values (`stdDeviation="4 2"`) for directional blur (x, y). Typical range: `1`–`20`.
- `in` — Input image (`SourceGraphic`, `SourceAlpha`, or a named result).
- `edgeMode` — How edges are handled: `duplicate` (default), `wrap`, or `none`.

```xml
<filter id="blur-basic">
  <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blurred" />
</filter>
```

### 1.2 feOffset

**Purpose:** Translates the input image by a fixed amount. Almost always used alongside blur to position a shadow away from the source element.

**Key parameters:**
- `dx` — Horizontal offset in user units. Positive = right.
- `dy` — Vertical offset in user units. Positive = down.
- `in` — Input image.

```xml
<filter id="offset-example">
  <feOffset in="SourceGraphic" dx="4" dy="4" result="shifted" />
</filter>
```

### 1.3 feFlood

**Purpose:** Generates a solid rectangle of a single color and opacity. Used to create colored shadow layers, tint overlays, or backgrounds for compositing.

**Key parameters:**
- `flood-color` — Any CSS color value (`#000`, `rgba(0,0,0,0.5)`, `steelblue`).
- `flood-opacity` — Opacity from `0` to `1`. Default `1`.

```xml
<filter id="flood-example">
  <feFlood flood-color="#000000" flood-opacity="0.35" result="shadow-color" />
</filter>
```

### 1.4 feComposite

**Purpose:** Combines two images using Porter-Duff compositing or arithmetic blending. Essential for cutting shapes, masking, and layered compositing.

**Key parameters:**
- `operator` — `over`, `in`, `out`, `atop`, `xor`, `lighter`, or `arithmetic`.
- `in` / `in2` — The two input images.
- `k1`, `k2`, `k3`, `k4` — Coefficients when `operator="arithmetic"`. Result = k1\*in\*in2 + k2\*in + k3\*in2 + k4.

```xml
<filter id="composite-example">
  <!-- Cut the flood color to the shape of the source alpha -->
  <feComposite in="shadow-color" in2="SourceAlpha" operator="in" result="colored-shadow" />
</filter>
```

### 1.5 feMerge

**Purpose:** Stacks multiple image layers on top of each other in painter's order. The standard way to combine a shadow with the original graphic.

**Key parameters:**
- Child `<feMergeNode>` elements, each with an `in` attribute. Rendered bottom-to-top.

```xml
<filter id="merge-example">
  <feMerge>
    <feMergeNode in="shadow-layer" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```

### 1.6 feColorMatrix

**Purpose:** Applies a 4x5 color transformation matrix (or preset) to every pixel. Used for hue rotation, saturation shifts, sepia/vintage tones, and channel remapping.

**Key parameters:**
- `type` — `matrix` (custom 4x5), `saturate` (0–1+), `hueRotate` (degrees), or `luminanceToAlpha`.
- `values` — Matrix coefficients (20 numbers for `matrix` type) or a single value for `saturate`/`hueRotate`.

```xml
<!-- Desaturate to 20% -->
<filter id="desaturate">
  <feColorMatrix type="saturate" values="0.2" />
</filter>

<!-- Full 4x5 sepia matrix -->
<filter id="sepia">
  <feColorMatrix type="matrix"
    values="0.393 0.769 0.189 0 0
            0.349 0.686 0.168 0 0
            0.272 0.534 0.131 0 0
            0     0     0     1 0" />
</filter>
```

### 1.7 feTurbulence

**Purpose:** Generates Perlin noise or turbulence patterns procedurally. The basis for all texture effects — clouds, marble, water, paper grain, fabric weave, and more.

**Key parameters:**
- `type` — `turbulence` (sharp, organic) or `fractalNoise` (smooth, cloudy).
- `baseFrequency` — Controls scale. Lower = larger features. Can be two values for x/y. Typical: `0.01`–`0.1`.
- `numOctaves` — Detail layers. Higher = more detail but slower. Typical: `1`–`8`.
- `seed` — Random seed for reproducibility.
- `stitchTiles` — `stitch` or `noStitch`. Use `stitch` for seamless tiling.

```xml
<filter id="noise">
  <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="42" result="noise" />
</filter>
```

### 1.8 feDisplacementMap

**Purpose:** Distorts the input image by using another image's channels as displacement vectors. Creates water ripples, heat haze, organic warping, and watercolor effects.

**Key parameters:**
- `in` — Image to be distorted.
- `in2` — Displacement map image (often from `feTurbulence`).
- `scale` — Displacement magnitude in user units. Typical: `5`–`50`.
- `xChannelSelector` / `yChannelSelector` — Which color channel (`R`, `G`, `B`, `A`) drives x/y displacement.

```xml
<filter id="distort">
  <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" result="warp-map" />
  <feDisplacementMap in="SourceGraphic" in2="warp-map" scale="15"
    xChannelSelector="R" yChannelSelector="G" result="warped" />
</filter>
```

### 1.9 feMorphology

**Purpose:** Expands (dilate) or contracts (erode) the input shape. Used to thicken outlines, create bold text effects, or shrink elements before compositing.

**Key parameters:**
- `operator` — `dilate` (expand) or `erode` (shrink).
- `radius` — Size of the morphological kernel. Can be two values for x/y. Typical: `1`–`5`.

```xml
<!-- Thicken a shape by 2px -->
<filter id="thicken">
  <feMorphology in="SourceGraphic" operator="dilate" radius="2" result="thickened" />
</filter>

<!-- Create an outline by subtracting eroded from original -->
<filter id="outline-only">
  <feMorphology in="SourceAlpha" operator="erode" radius="1" result="eroded" />
  <feComposite in="SourceAlpha" in2="eroded" operator="out" result="outline" />
</filter>
```

### 1.10 feConvolveMatrix

**Purpose:** Applies an arbitrary convolution kernel to the input. Used for sharpening, edge detection, embossing, and custom blur kernels.

**Key parameters:**
- `order` — Kernel size (e.g., `3` for 3x3, `5` for 5x5).
- `kernelMatrix` — Space-separated list of kernel values.
- `divisor` — Normalization factor (sum of positive values for blur, `1` for edge detection).
- `bias` — Added to each output pixel. Use `0.5` with edge detection to shift into visible range.
- `edgeMode` — `duplicate`, `wrap`, or `none`.

```xml
<!-- Sharpen -->
<filter id="sharpen">
  <feConvolveMatrix order="3"
    kernelMatrix="0 -1  0
                 -1  5 -1
                  0 -1  0"
    divisor="1" bias="0" edgeMode="duplicate" />
</filter>

<!-- Edge detect -->
<filter id="edge-detect">
  <feConvolveMatrix order="3"
    kernelMatrix="-1 -1 -1
                  -1  8 -1
                  -1 -1 -1"
    divisor="1" bias="0.5" />
</filter>
```

### 1.11 feSpecularLighting

**Purpose:** Simulates specular (shiny, mirror-like) reflections on a surface defined by the input alpha channel. Creates metallic sheens, wet surfaces, and glossy highlights.

**Key parameters:**
- `surfaceScale` — Height of the surface bumps. Typical: `1`–`10`.
- `specularConstant` — Intensity of the highlight. Typical: `0.5`–`2`.
- `specularExponent` — Sharpness of the highlight (higher = tighter spot). Typical: `10`–`40`.
- `lighting-color` — Color of the light source. Default `white`.

Must contain exactly one light source child: `<fePointLight>`, `<feDistantLight>`, or `<feSpotLight>`.

```xml
<filter id="specular-example">
  <feSpecularLighting in="SourceAlpha" surfaceScale="5"
    specularConstant="1" specularExponent="20" lighting-color="#ffffff" result="specular">
    <fePointLight x="100" y="50" z="200" />
  </feSpecularLighting>
  <feComposite in="specular" in2="SourceGraphic" operator="arithmetic"
    k1="0" k2="1" k3="1" k4="0" result="lit" />
</filter>
```

### 1.12 feDiffuseLighting

**Purpose:** Simulates diffuse (matte, soft) lighting on a surface. Creates subtle 3D relief, paper texture highlights, and soft emboss effects.

**Key parameters:**
- `surfaceScale` — Bump height. Typical: `1`–`8`.
- `diffuseConstant` — Brightness multiplier. Typical: `0.5`–`2`.
- `lighting-color` — Color of the light. Default `white`.

Must contain exactly one light source child.

```xml
<filter id="diffuse-example">
  <feDiffuseLighting in="SourceAlpha" surfaceScale="4"
    diffuseConstant="1" lighting-color="#fffaf0" result="diffuse">
    <feDistantLight azimuth="225" elevation="45" />
  </feDiffuseLighting>
  <feComposite in="diffuse" in2="SourceGraphic" operator="arithmetic"
    k1="1" k2="0" k3="0" k4="0" result="textured" />
</filter>
```

### 1.13 fePointLight

**Purpose:** Defines an omnidirectional point light source positioned in 3D space. Light radiates equally in all directions from the specified coordinate.

**Key parameters:**
- `x`, `y` — Position in 2D plane (user units).
- `z` — Height above the surface. Higher = more diffuse, lower = harsher. Typical: `50`–`300`.

```xml
<fePointLight x="150" y="100" z="200" />
```

### 1.14 feDistantLight

**Purpose:** Defines a directional light at infinite distance (like the sun). Produces uniform lighting across the entire surface — useful for consistent emboss and relief effects.

**Key parameters:**
- `azimuth` — Compass direction of the light in degrees (0 = right, 90 = bottom, 180 = left, 270 = top).
- `elevation` — Angle above the horizon in degrees (0 = grazing, 90 = directly overhead). Typical: `30`–`60`.

```xml
<feDistantLight azimuth="225" elevation="45" />
```

### 1.15 feSpotLight

**Purpose:** Defines a cone-shaped spotlight aimed at a target point. Creates dramatic focused lighting effects, stage lighting, and localized highlights.

**Key parameters:**
- `x`, `y`, `z` — Position of the light source.
- `pointsAtX`, `pointsAtY`, `pointsAtZ` — Target point the light is aimed at.
- `specularExponent` — Cone focus (higher = tighter cone). Typical: `5`–`30`.
- `limitingConeAngle` — Hard cutoff angle for the cone in degrees.

```xml
<feSpotLight x="200" y="0" z="300"
  pointsAtX="200" pointsAtY="200" pointsAtZ="0"
  specularExponent="15" limitingConeAngle="30" />
```

### 1.16 feComponentTransfer

**Purpose:** Applies per-channel transfer functions (lookup tables) to remap color values. Used for contrast curves, posterization, duotone effects, gamma correction, and color grading.

**Key parameters:**
- Child elements: `<feFuncR>`, `<feFuncG>`, `<feFuncB>`, `<feFuncA>` (one per channel).
- Each function has a `type`: `identity`, `table`, `discrete`, `linear`, or `gamma`.
- `table` type: `tableValues` — space-separated list mapping input 0..1 to output values.
- `linear` type: `slope` and `intercept` — output = slope * input + intercept.
- `gamma` type: `amplitude`, `exponent`, `offset` — output = amplitude * input^exponent + offset.

```xml
<!-- Increase contrast -->
<filter id="high-contrast">
  <feComponentTransfer>
    <feFuncR type="linear" slope="1.5" intercept="-0.15" />
    <feFuncG type="linear" slope="1.5" intercept="-0.15" />
    <feFuncB type="linear" slope="1.5" intercept="-0.15" />
  </feComponentTransfer>
</filter>

<!-- Posterize to 4 levels -->
<filter id="posterize">
  <feComponentTransfer>
    <feFuncR type="discrete" tableValues="0 0.33 0.67 1" />
    <feFuncG type="discrete" tableValues="0 0.33 0.67 1" />
    <feFuncB type="discrete" tableValues="0 0.33 0.67 1" />
  </feComponentTransfer>
</filter>
```

### 1.17 feBlend

**Purpose:** Blends two input images using standard compositing blend modes. Equivalent to CSS blend modes but within the filter pipeline.

**Key parameters:**
- `mode` — `normal`, `multiply`, `screen`, `darken`, `lighten`, `overlay`.
- `in` / `in2` — The two input images to blend.

```xml
<filter id="blend-example">
  <feBlend in="SourceGraphic" in2="texture" mode="multiply" result="blended" />
</filter>
```

---

## 2. Filter Chain Construction

### 2.1 The Pipeline Model

SVG filters work as a **directed acyclic graph (DAG)** of image-processing nodes. Each primitive reads one or two named input buffers, performs its operation, and writes to a named output buffer. The filter region is a rectangular area (default: element bounding box expanded by 10% on each side).

Two built-in inputs are always available:
- **`SourceGraphic`** — The element as rendered (with fill, stroke, opacity).
- **`SourceAlpha`** — The alpha channel of the element as a grayscale image (white where opaque, black where transparent).

### 2.2 in / result Wiring

Every primitive can specify:
- `in="..."` — Which buffer to read. Defaults to the output of the previous primitive.
- `result="..."` — A name for this primitive's output. Can be referenced by later primitives.

If you omit `result`, the output is an unnamed buffer that becomes the default input for the next primitive. If you omit `in`, the primitive reads the previous primitive's output (or `SourceGraphic` if it is the first primitive).

### 2.3 Chain Example

```xml
<filter id="shadow-chain" x="-20%" y="-20%" width="140%" height="140%">
  <!-- Step 1: Extract alpha silhouette -->
  <!-- in: SourceAlpha (explicit), result: "shadow-alpha" -->
  <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="shadow-blur" />

  <!-- Step 2: Move the blurred shadow down and right -->
  <!-- in: "shadow-blur" (explicit), result: "shadow-offset" -->
  <feOffset in="shadow-blur" dx="3" dy="3" result="shadow-offset" />

  <!-- Step 3: Color the shadow -->
  <feFlood flood-color="rgba(0,0,0,0.4)" result="shadow-color" />

  <!-- Step 4: Cut flood to shadow shape -->
  <feComposite in="shadow-color" in2="shadow-offset" operator="in" result="shadow-final" />

  <!-- Step 5: Stack shadow under the original -->
  <feMerge>
    <feMergeNode in="shadow-final" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```

### 2.4 Naming Conventions

Use descriptive, hyphenated names for `result` attributes to keep complex chains readable:

| Pattern | Example |
|---|---|
| Stage description | `result="blurred-alpha"` |
| Effect + step | `result="shadow-offset"` |
| Texture source | `result="noise-map"` |
| Intermediate | `result="lit-surface"` |
| Final composite | `result="final"` |

Avoid single-letter names (`result="a"`) — they make chains impossible to debug.

### 2.5 Filter Region

By default the filter region is the element's bounding box plus 10% padding on each side. For effects that extend beyond the element (shadows, glow), expand the region:

```xml
<!-- Extra room for large shadows or glow -->
<filter id="needs-space" x="-30%" y="-30%" width="160%" height="160%">
  ...
</filter>
```

Use `filterUnits="userSpaceOnUse"` when you need absolute coordinates for the filter region instead of percentages relative to the element's bounding box.

---

## 3. Ready-Made Recipes

Each recipe is a complete `<filter>` element ready to paste into `<defs>`. Apply with `filter="url(#filter-id)"` on any element or layer group.

### Recipe 1: Realistic Drop Shadow

A natural shadow with configurable color, blur, and offset.

```xml
<defs>
  <filter id="drop-shadow" x="-25%" y="-25%" width="150%" height="150%">
    <!-- Blur the alpha channel -->
    <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="shadow-blur" />
    <!-- Offset the shadow -->
    <feOffset in="shadow-blur" dx="4" dy="6" result="shadow-offset" />
    <!-- Color the shadow -->
    <feFlood flood-color="#1a1a2e" flood-opacity="0.35" result="shadow-color" />
    <!-- Cut color to shadow shape -->
    <feComposite in="shadow-color" in2="shadow-offset" operator="in" result="shadow" />
    <!-- Layer: shadow behind original -->
    <feMerge>
      <feMergeNode in="shadow" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>
```

**Tuning tips:**
- `stdDeviation="2"` for a tight, hard shadow; `8`–`12` for a soft, diffuse shadow.
- `flood-opacity="0.15"` for subtle; `0.5` for dramatic.
- Match `dx`/`dy` direction to your scene's light source.

### Recipe 2: Soft Glow

A luminous glow that bleeds outward from the element.

```xml
<defs>
  <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
    <!-- Create blurred copy -->
    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="glow" />
    <!-- Stack glow behind original -->
    <feMerge>
      <feMergeNode in="glow" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>
```

**Tuning tips:**
- For a colored glow, add `feFlood` + `feComposite` before the merge to tint the blur.
- Increase `stdDeviation` for a wider, more ethereal glow.

### Recipe 3: Frosted Glass

A translucent blurred background effect, ideal for UI panels and overlay cards.

```xml
<defs>
  <filter id="frosted-glass" x="-5%" y="-5%" width="110%" height="110%">
    <!-- Heavy blur to obscure background detail -->
    <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blurred" />
    <!-- Add a white tint overlay -->
    <feFlood flood-color="#ffffff" flood-opacity="0.25" result="tint" />
    <feBlend in="tint" in2="blurred" mode="normal" result="tinted" />
    <!-- Subtle noise for glass texture -->
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1"
      result="fine-noise" />
    <feColorMatrix in="fine-noise" type="saturate" values="0" result="grey-noise" />
    <feBlend in="tinted" in2="grey-noise" mode="overlay" result="frosted" />
  </filter>
</defs>
```

### Recipe 4: Paper / Parchment Texture

An organic, fibrous texture resembling aged paper.

```xml
<defs>
  <filter id="paper-texture" x="0%" y="0%" width="100%" height="100%">
    <!-- Generate fibrous noise -->
    <feTurbulence type="fractalNoise" baseFrequency="0.04 0.06"
      numOctaves="5" seed="7" result="paper-noise" />
    <!-- Warm tint: shift towards parchment tones -->
    <feColorMatrix in="paper-noise" type="matrix"
      values="0.95 0.15 0.05 0 0.05
              0.85 0.20 0.05 0 0.02
              0.70 0.10 0.05 0 0.00
              0    0    0    1 0" result="warm-noise" />
    <!-- Blend noise with the original -->
    <feBlend in="SourceGraphic" in2="warm-noise" mode="multiply" result="textured" />
  </filter>
</defs>
```

### Recipe 5: Watercolor Edges

Soft, irregular edges that simulate watercolor bleeding.

```xml
<defs>
  <filter id="watercolor-edges" x="-10%" y="-10%" width="120%" height="120%">
    <!-- Organic displacement map -->
    <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="3"
      seed="12" result="warp" />
    <!-- Distort the edges -->
    <feDisplacementMap in="SourceGraphic" in2="warp" scale="18"
      xChannelSelector="R" yChannelSelector="G" result="warped" />
    <!-- Soften the distorted edges -->
    <feGaussianBlur in="warped" stdDeviation="1.5" result="soft-warped" />
    <!-- Slight color bleed via low-opacity blur merge -->
    <feGaussianBlur in="warped" stdDeviation="4" result="color-bleed" />
    <feMerge>
      <feMergeNode in="color-bleed" />
      <feMergeNode in="soft-warped" />
    </feMerge>
  </filter>
</defs>
```

### Recipe 6: Metallic Sheen

A brushed-metal look with specular highlights.

```xml
<defs>
  <filter id="metallic-sheen" x="-5%" y="-5%" width="110%" height="110%">
    <!-- Fine horizontal grain for brushed metal -->
    <feTurbulence type="fractalNoise" baseFrequency="0.02 0.5"
      numOctaves="2" seed="33" result="grain" />
    <feDisplacementMap in="SourceGraphic" in2="grain" scale="3"
      xChannelSelector="R" yChannelSelector="G" result="brushed" />
    <!-- Specular highlight from upper left -->
    <feSpecularLighting in="SourceAlpha" surfaceScale="6"
      specularConstant="1.2" specularExponent="25" lighting-color="#ffffff" result="specular">
      <fePointLight x="80" y="40" z="250" />
    </feSpecularLighting>
    <!-- Cut specular to the element shape -->
    <feComposite in="specular" in2="SourceAlpha" operator="in" result="specular-masked" />
    <!-- Combine: brushed base + specular highlight -->
    <feComposite in="specular-masked" in2="brushed" operator="arithmetic"
      k1="0" k2="0.6" k3="1" k4="0" result="metal" />
  </filter>
</defs>
```

### Recipe 7: Emboss / Relief

A raised 3D look using diffuse lighting.

```xml
<defs>
  <filter id="emboss-relief" x="0%" y="0%" width="100%" height="100%">
    <!-- Diffuse lighting creates the 3D surface -->
    <feDiffuseLighting in="SourceAlpha" surfaceScale="6"
      diffuseConstant="1" lighting-color="#f5f0e8" result="relief">
      <feDistantLight azimuth="225" elevation="35" />
    </feDiffuseLighting>
    <!-- Multiply the lit surface with the original colors -->
    <feComposite in="relief" in2="SourceGraphic" operator="arithmetic"
      k1="1" k2="0" k3="0" k4="0" result="embossed" />
  </filter>
</defs>
```

**Tuning tips:**
- `azimuth="315"` for light from upper-right; `azimuth="225"` for upper-left.
- Increase `surfaceScale` for more dramatic relief.
- Lower `elevation` for more grazing light and stronger relief contrast.

### Recipe 8: Vintage / Sepia Tone

A warm vintage color grade.

```xml
<defs>
  <filter id="vintage-sepia">
    <!-- Desaturate slightly -->
    <feColorMatrix type="saturate" values="0.3" result="desat" />
    <!-- Apply sepia tone matrix -->
    <feColorMatrix in="desat" type="matrix"
      values="0.393 0.769 0.189 0 0
              0.349 0.686 0.168 0 0
              0.272 0.534 0.131 0 0
              0     0     0     1 0" result="sepia" />
    <!-- Slight warm color shift and contrast reduction -->
    <feComponentTransfer in="sepia">
      <feFuncR type="linear" slope="1.05" intercept="0.02" />
      <feFuncG type="linear" slope="0.95" intercept="0.02" />
      <feFuncB type="linear" slope="0.85" intercept="0.0" />
    </feComponentTransfer>
  </filter>
</defs>
```

### Recipe 9: Duotone

Maps the luminance range to two custom colors. Change the `tableValues` to any two-color palette.

```xml
<defs>
  <filter id="duotone-coral-navy">
    <!-- Convert to luminance-based greyscale -->
    <feColorMatrix type="saturate" values="0" result="grey" />
    <!-- Map greyscale to two colors:
         Shadows  = navy  (#1a1a4e → R:0.10, G:0.10, B:0.31)
         Highlights = coral (#ff6b6b → R:1.00, G:0.42, B:0.42) -->
    <feComponentTransfer in="grey">
      <feFuncR type="table" tableValues="0.10 1.00" />
      <feFuncG type="table" tableValues="0.10 0.42" />
      <feFuncB type="table" tableValues="0.31 0.42" />
    </feComponentTransfer>
  </filter>
</defs>
```

**Palette swaps — just change `tableValues`:**
- Midnight-gold: `R="0.05 1.0"` `G="0.05 0.84"` `B="0.20 0.0"`
- Forest-cream: `R="0.10 0.98"` `G="0.22 0.95"` `B="0.08 0.88"`

### Recipe 10: Noise / Grain Overlay

Film-grain texture blended over artwork.

```xml
<defs>
  <filter id="noise-grain" x="0%" y="0%" width="100%" height="100%">
    <!-- Fine monochrome noise -->
    <feTurbulence type="fractalNoise" baseFrequency="0.65"
      numOctaves="1" seed="0" result="raw-noise" />
    <!-- Desaturate to pure grey grain -->
    <feColorMatrix in="raw-noise" type="saturate" values="0" result="grey-grain" />
    <!-- Blend on top of original (overlay mode adds contrast too) -->
    <feBlend in="SourceGraphic" in2="grey-grain" mode="overlay" result="grained" />
  </filter>
</defs>
```

**Tuning tips:**
- `baseFrequency="0.8"` for finer grain, `0.3"` for coarser.
- Use `mode="soft-light"` (via CSS) for subtler grain; `mode="multiply"` for darker grain.

### Recipe 11: Neon Glow

Multi-layered glow at different blur radii for a convincing neon tube effect.

```xml
<defs>
  <filter id="neon-glow" x="-40%" y="-40%" width="180%" height="180%">
    <!-- Core: tight bright glow -->
    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="glow-tight" />
    <!-- Mid: medium spread -->
    <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="glow-mid" />
    <!-- Outer: wide ambient glow -->
    <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="glow-wide" />
    <!-- Stack all layers: widest on bottom, original on top -->
    <feMerge>
      <feMergeNode in="glow-wide" />
      <feMergeNode in="glow-mid" />
      <feMergeNode in="glow-tight" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>
```

**Tuning tips:**
- Set the element's `fill` and `stroke` to a bright neon color (`#00ffff`, `#ff00ff`, `#39ff14`).
- Add a dark or black background behind the element for maximum neon contrast.
- Use `stroke-width="2"` and `fill="none"` for a true neon tube outline look.

### Recipe 12: Long Shadow (Flat Design)

A popular flat-design technique where a shadow extends diagonally.

```xml
<defs>
  <filter id="long-shadow" x="-10%" y="-10%" width="150%" height="150%">
    <!-- Offset many copies of the alpha at increasing distances -->
    <feOffset in="SourceAlpha" dx="1" dy="1" result="s1" />
    <feOffset in="s1" dx="1" dy="1" result="s2" />
    <feOffset in="s2" dx="1" dy="1" result="s3" />
    <feOffset in="s3" dx="1" dy="1" result="s4" />
    <feOffset in="s4" dx="1" dy="1" result="s5" />
    <feOffset in="s5" dx="1" dy="1" result="s6" />
    <feOffset in="s6" dx="1" dy="1" result="s7" />
    <feOffset in="s7" dx="1" dy="1" result="s8" />
    <!-- Merge all offset copies into a solid shadow -->
    <feMerge result="long-shadow-stack">
      <feMergeNode in="s8" />
      <feMergeNode in="s7" />
      <feMergeNode in="s6" />
      <feMergeNode in="s5" />
      <feMergeNode in="s4" />
      <feMergeNode in="s3" />
      <feMergeNode in="s2" />
      <feMergeNode in="s1" />
    </feMerge>
    <!-- Color and fade the shadow -->
    <feFlood flood-color="#000000" flood-opacity="0.15" result="shadow-fill" />
    <feComposite in="shadow-fill" in2="long-shadow-stack" operator="in" result="colored-shadow" />
    <!-- Blur slightly for softness -->
    <feGaussianBlur in="colored-shadow" stdDeviation="0.5" result="soft-shadow" />
    <feMerge>
      <feMergeNode in="soft-shadow" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>
```

---

## 4. feTurbulence Parameter Reference Table

The `feTurbulence` primitive is the most versatile texture generator in SVG. Tuning its parameters produces radically different visual results. Use this table as a starting point and fine-tune for your scene.

| Visual Result | `type` | `baseFrequency` | `numOctaves` | `seed` | Notes |
|---|---|---|---|---|---|
| **Clouds / Smoke** | `fractalNoise` | `0.01 0.01` | `4`–`5` | any | Large, soft billows. Scale down for wispy cirrus. |
| **Marble** | `fractalNoise` | `0.02 0.06` | `6`–`8` | any | Asymmetric frequency creates directional veining. |
| **Leather** | `turbulence` | `0.06 0.06` | `3`–`4` | any | Medium-scale pebbled texture. Increase octaves for finer pores. |
| **Concrete / Stone** | `turbulence` | `0.04 0.04` | `4`–`5` | any | Gritty, rough surface. Pair with diffuse lighting for relief. |
| **Water / Ripples** | `turbulence` | `0.02 0.08` | `2`–`3` | any | Horizontal stretching mimics ripple direction. Use as displacement map. |
| **Fabric / Linen** | `fractalNoise` | `0.1 0.08` | `2` | any | Higher frequency for tight weave. Asymmetry suggests thread direction. |
| **Wood Grain** | `fractalNoise` | `0.01 0.15` | `3`–`4` | any | Strong y-frequency stretches noise into grain lines. |
| **Fine Noise / Grain** | `fractalNoise` | `0.5`–`0.8` | `1` | any | High frequency, single octave = film grain. |
| **Paper Fiber** | `fractalNoise` | `0.04 0.06` | `5`–`6` | any | Medium frequency with many octaves = complex fiber structure. |
| **Plasma / Energy** | `turbulence` | `0.015 0.015` | `6`–`8` | any | Low frequency, many octaves = swirling energy. Animate `seed` for motion. |

**Key intuitions:**
- **`baseFrequency`** controls feature size: lower = larger features, higher = finer detail.
- **Two-value `baseFrequency`** (e.g., `0.01 0.15`) creates directional patterns by scaling noise differently on x vs y.
- **`numOctaves`** adds detail layers: `1` = smooth blobs, `8` = complex fractal detail. Each octave doubles the computation cost.
- **`type="fractalNoise"`** produces smooth, continuous patterns (clouds, marble). **`type="turbulence"`** produces sharper, more organic patterns (leather, stone).
- **`seed`** changes the random pattern without affecting its character. Try different seeds until the pattern looks right for your composition.

---

## 5. Blend Modes Complete Guide

Blend modes control how two visual layers combine their pixel colors. They can be applied via CSS `mix-blend-mode` on any SVG element, or within filters via `<feBlend mode="...">`.

### Normal Modes

| Mode | Formula | When to Use |
|---|---|---|
| **`normal`** | Top layer replaces bottom (respecting alpha) | Default compositing. Simple layering with opacity. |

### Darkening Modes

| Mode | Formula | When to Use |
|---|---|---|
| **`multiply`** | `a * b` | Shadows, tinting, printing simulation. White disappears, black stays. Two colored lights on a surface. |
| **`darken`** | `min(a, b)` | Keep the darker pixel of the two layers. Useful for combining dark elements from two versions. |
| **`color-burn`** | `1 - (1-b)/a` | Intense darkening with high contrast. Deep shadows, burnt edges, dramatic color interaction. |

### Lightening Modes

| Mode | Formula | When to Use |
|---|---|---|
| **`screen`** | `1 - (1-a)(1-b)` | Glow, light bloom, lightning. Black disappears, white stays. Two projectors on a screen. |
| **`lighten`** | `max(a, b)` | Keep the lighter pixel of the two layers. Combine highlights from two sources. |
| **`color-dodge`** | `b / (1-a)` | Intense brightening, specular reflections, explosive highlights. Can blow out to white. |

### Contrast Modes

| Mode | Formula | When to Use |
|---|---|---|
| **`overlay`** | multiply if `b<0.5`, screen if `b>=0.5` | General-purpose contrast boost. Texture overlays, vignettes. Preserves highlights and shadows of base. |
| **`hard-light`** | multiply if `a<0.5`, screen if `a>=0.5` | Similar to overlay but driven by the top layer. Dramatic lighting effects, strong texture imprint. |
| **`soft-light`** | Softened version of hard-light | Gentle contrast and color adjustments. Subtle texture. Less aggressive than overlay. |

### Inversion Modes

| Mode | Formula | When to Use |
|---|---|---|
| **`difference`** | `abs(a - b)` | Psychedelic color effects, image comparison, finding changes between versions. Black = identical. |
| **`exclusion`** | `a + b - 2ab` | Softer version of difference. Low-contrast inversion effect. Midtones go grey. |

### HSL Component Modes

| Mode | Formula | When to Use |
|---|---|---|
| **`hue`** | Hue from top, saturation + luminosity from bottom | Recolor an element while preserving its lighting and saturation. Color theme swaps. |
| **`saturation`** | Saturation from top, hue + luminosity from bottom | Apply vibrancy from one layer to another. Selective desaturation effects. |
| **`color`** | Hue + saturation from top, luminosity from bottom | Colorize a greyscale image. Apply a color palette while preserving shading. |
| **`luminosity`** | Luminosity from top, hue + saturation from bottom | Apply the brightness pattern of one image with the colors of another. |

### Usage in SVG

```xml
<!-- CSS approach: on any element or group -->
<g style="mix-blend-mode: multiply;">
  <rect ... />
</g>

<!-- Filter approach: within a filter chain -->
<filter id="multiply-blend">
  <feImage href="#texture-rect" result="texture" />
  <feBlend in="SourceGraphic" in2="texture" mode="multiply" />
</filter>

<!-- Isolation context: prevent blend from affecting elements outside the group -->
<g style="isolation: isolate;">
  <rect fill="blue" />
  <circle fill="red" style="mix-blend-mode: screen;" />
</g>
```

**Best practices:**
- Wrap blended content in a group with `isolation: isolate` to prevent blend modes from leaking into parent layers.
- `multiply` and `screen` are the most universally useful modes — master these first.
- `overlay` is the best mode for texture application (noise, grain, paper).
- `color` mode is perfect for colorizing greyscale artwork.

---

## 6. Advanced Masking

### 6.1 Gradient Masks for Soft Fading

Masks use luminance (white = visible, black = hidden) to control element visibility with smooth transitions.

```xml
<defs>
  <!-- Horizontal fade: fully visible on left, fading to transparent on right -->
  <linearGradient id="fade-right" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="white" />
    <stop offset="70%" stop-color="white" />
    <stop offset="100%" stop-color="black" />
  </linearGradient>
  <mask id="mask-fade-right">
    <rect x="0" y="0" width="100%" height="100%" fill="url(#fade-right)" />
  </mask>

  <!-- Radial spotlight: visible in center, fading at edges -->
  <radialGradient id="spotlight" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="white" />
    <stop offset="60%" stop-color="white" />
    <stop offset="100%" stop-color="black" />
  </radialGradient>
  <mask id="mask-spotlight">
    <rect x="0" y="0" width="100%" height="100%" fill="url(#spotlight)" />
  </mask>
</defs>

<!-- Apply mask -->
<g mask="url(#mask-fade-right)">
  <image href="scene.jpg" width="800" height="600" />
</g>

<!-- Spotlight effect on a layer -->
<g mask="url(#mask-spotlight)">
  <rect x="0" y="0" width="800" height="600" fill="url(#scenic-gradient)" />
</g>
```

### 6.2 Luminance vs Alpha Masking

SVG supports two mask content types:

**Luminance masking (default):** `mask-type: luminance`
- White areas of the mask = fully visible.
- Black areas = fully hidden.
- Grey areas = partially visible (proportional to brightness).
- Best for gradient fades, spotlight effects, and painterly masks.

```xml
<mask id="luminance-mask" mask-type="luminance">
  <!-- Greyscale image: brighter = more visible -->
  <rect width="400" height="400" fill="white" />
  <circle cx="200" cy="200" r="100" fill="black" />
</mask>
```

**Alpha masking:** `mask-type: alpha`
- Only the alpha channel matters, not color.
- Fully opaque mask areas = visible; transparent = hidden.
- Useful when your mask source is colored (e.g., an SVG pattern).

```xml
<mask id="alpha-mask" mask-type="alpha">
  <!-- Semi-transparent elements control visibility -->
  <circle cx="200" cy="200" r="150" fill="rgba(0,0,0,0.7)" />
</mask>
```

### 6.3 Compound Clip Paths

Clip paths provide hard-edge masking (binary: visible or clipped). Combine multiple shapes for complex clip regions.

```xml
<defs>
  <!-- Simple shape clip -->
  <clipPath id="clip-circle">
    <circle cx="200" cy="200" r="150" />
  </clipPath>

  <!-- Compound clip: intersection of shapes using clip-rule -->
  <clipPath id="clip-compound">
    <rect x="50" y="50" width="300" height="300" />
    <circle cx="200" cy="200" r="120" />
  </clipPath>

  <!-- Text clip: reveal through text shapes -->
  <clipPath id="clip-text">
    <text x="200" y="220" font-size="120" font-weight="bold"
      text-anchor="middle" font-family="Arial">SVG</text>
  </clipPath>

  <!-- Path-based clip for irregular shapes -->
  <clipPath id="clip-organic">
    <path d="M100,50 Q200,0 300,50 T500,100 Q450,250 300,300
             T100,250 Q50,150 100,50 Z" />
  </clipPath>
</defs>

<!-- Apply clip paths -->
<image href="photo.jpg" width="400" height="400" clip-path="url(#clip-circle)" />
<g clip-path="url(#clip-text)">
  <rect width="400" height="400" fill="url(#gradient-bg)" />
</g>
```

**Clip-rule:** Controls how overlapping paths in a clip are combined:
- `clip-rule="nonzero"` (default) — All enclosed areas are visible.
- `clip-rule="evenodd"` — Overlapping regions toggle visibility (creates holes).

```xml
<defs>
  <clipPath id="clip-donut" clip-rule="evenodd">
    <!-- Outer circle minus inner circle = donut shape -->
    <path d="M200,50 A150,150 0 1,1 200,350 A150,150 0 1,1 200,50 Z
             M200,120 A80,80 0 1,0 200,280 A80,80 0 1,0 200,120 Z" />
  </clipPath>
</defs>
```

### 6.4 Mask + Filter Combinations

The most powerful effects combine masks with filters. Apply a filter to generate texture or lighting, then use a mask to control where the effect is visible.

```xml
<defs>
  <!-- Fog filter: blurred white noise -->
  <filter id="fog-filter" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.015"
      numOctaves="4" seed="5" result="fog-noise" />
    <feColorMatrix in="fog-noise" type="matrix"
      values="0 0 0 0 1
              0 0 0 0 1
              0 0 0 0 1
              0 0 0 0.6 0" result="white-fog" />
  </filter>

  <!-- Mask: fog only in the lower half, fading upward -->
  <linearGradient id="fog-gradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="black" />
    <stop offset="40%" stop-color="black" />
    <stop offset="100%" stop-color="white" />
  </linearGradient>
  <mask id="fog-mask">
    <rect x="0" y="0" width="100%" height="100%" fill="url(#fog-gradient)" />
  </mask>
</defs>

<!-- Fog layer: filtered rect, masked to lower portion -->
<rect x="0" y="0" width="800" height="600"
  filter="url(#fog-filter)" mask="url(#fog-mask)"
  style="mix-blend-mode: screen;" />
```

**Pattern: Selective filter application**

```xml
<defs>
  <!-- Blur filter -->
  <filter id="depth-blur">
    <feGaussianBlur stdDeviation="6" />
  </filter>

  <!-- Mask: sharp in center, blurred at edges (depth of field) -->
  <radialGradient id="dof-gradient" cx="50%" cy="50%" r="40%">
    <stop offset="0%" stop-color="black" />
    <stop offset="100%" stop-color="white" />
  </radialGradient>
  <mask id="dof-mask">
    <rect x="0" y="0" width="100%" height="100%" fill="url(#dof-gradient)" />
  </mask>
</defs>

<!-- Background layer: blurred -->
<g filter="url(#depth-blur)" mask="url(#dof-mask)">
  <use href="#background-scene" />
</g>
<!-- Foreground layer: sharp (no filter) -->
<use href="#foreground-subject" />
```

**Pattern: Reveal through animated mask**

Masks can be combined with CSS animations or SMIL to create reveal effects:

```xml
<defs>
  <mask id="reveal-mask">
    <circle cx="200" cy="200" r="0" fill="white">
      <animate attributeName="r" from="0" to="300"
        dur="2s" fill="freeze" />
    </circle>
  </mask>
</defs>

<g mask="url(#reveal-mask)">
  <!-- Content revealed by expanding circle -->
  <rect width="400" height="400" fill="url(#scene-gradient)" />
</g>
```

### 6.5 Performance Considerations

- **Filter region size** matters: larger regions (e.g., `x="-50%"`) mean more pixels to process. Keep regions tight.
- **Blur radius** is the single biggest performance factor. `stdDeviation > 15` on large elements can be slow. Use the smallest blur that achieves the visual goal.
- **`numOctaves`** in `feTurbulence`: each octave roughly doubles computation. Cap at `5`–`6` unless fine detail is essential.
- **Nested filters** (filter on a group that contains filtered elements) multiply the performance cost. Flatten where possible.
- **Masks + filters together** are expensive. Use them on small elements or final compositing layers, not on every shape.
- **`filterUnits="userSpaceOnUse"`** can prevent unnecessary recomputation when elements are transformed.

---

## 7. Advanced Color Manipulation

### 7.1 feColorMatrix Deep Dive

The `feColorMatrix` is the most versatile color tool in SVG. The `type="matrix"` mode applies a 5×4 matrix multiplication to every pixel:

```
| R' |   | a00 a01 a02 a03 a04 |   | R |
| G' | = | a10 a11 a12 a13 a14 | × | G |
| B' |   | a20 a21 a22 a23 a24 |   | B |
| A' |   | a30 a31 a32 a33 a34 |   | A |
                                    | 1 |
```

The 5th column (a04, a14, a24, a34) adds constant offsets — this is how you shift color without input.

#### Identity Matrix (no change)

```xml
<feColorMatrix type="matrix" values="
  1 0 0 0 0
  0 1 0 0 0
  0 0 1 0 0
  0 0 0 1 0"/>
```

#### Common Color Transformations

**Sepia tone:**
```xml
<feColorMatrix type="matrix" values="
  0.393 0.769 0.189 0 0
  0.349 0.686 0.168 0 0
  0.272 0.534 0.131 0 0
  0     0     0     1 0"/>
```

**Night vision (green channel emphasis):**
```xml
<feColorMatrix type="matrix" values="
  0.2 0.5 0.1 0 0
  0.1 0.8 0.1 0 0.05
  0   0.2 0.1 0 0
  0   0   0   1 0"/>
```

**Warm shift (sunset):**
```xml
<feColorMatrix type="matrix" values="
  1.2 0.1 0   0 0.05
  0   1.0 0   0 0.02
  0   0   0.8 0 0
  0   0   0   1 0"/>
```

**Cool shift (moonlight):**
```xml
<feColorMatrix type="matrix" values="
  0.8 0   0.1 0 0
  0   0.9 0.1 0 0
  0   0.1 1.2 0 0.05
  0   0   0   1 0"/>
```

**Increase contrast:**
```xml
<feColorMatrix type="matrix" values="
  1.5 0   0   0 -0.25
  0   1.5 0   0 -0.25
  0   0   1.5 0 -0.25
  0   0   0   1 0"/>
```

**Decrease contrast (flatten):**
```xml
<feColorMatrix type="matrix" values="
  0.7 0   0   0 0.15
  0   0.7 0   0 0.15
  0   0   0.7 0 0.15
  0   0   0   1 0"/>
```

**Channel swap (R↔B for alien/fantasy effect):**
```xml
<feColorMatrix type="matrix" values="
  0 0 1 0 0
  0 1 0 0 0
  1 0 0 0 0
  0 0 0 1 0"/>
```

**Extract single channel as grayscale (red channel):**
```xml
<feColorMatrix type="matrix" values="
  1 0 0 0 0
  1 0 0 0 0
  1 0 0 0 0
  0 0 0 1 0"/>
```

### 7.2 feComponentTransfer Curves

Where `feColorMatrix` applies a single linear transformation, `feComponentTransfer` gives you independent per-channel control with non-linear functions.

#### Function Types

| Type | Formula | Use case |
|------|---------|----------|
| `identity` | `C' = C` | No change (passthrough) |
| `linear` | `C' = slope × C + intercept` | Brightness, contrast |
| `gamma` | `C' = amplitude × C^exponent + offset` | Gamma correction, tone |
| `table` | Piecewise linear interpolation | Custom tone curves |
| `discrete` | Step function (quantize) | Posterization |

#### S-Curve Contrast (Photographic)

The most useful curve — boosts contrast by darkening darks and brightening lights:

```xml
<filter id="s-curve">
  <feComponentTransfer>
    <feFuncR type="table" tableValues="0 0.02 0.06 0.15 0.35 0.65 0.85 0.94 0.98 1"/>
    <feFuncG type="table" tableValues="0 0.02 0.06 0.15 0.35 0.65 0.85 0.94 0.98 1"/>
    <feFuncB type="table" tableValues="0 0.02 0.06 0.15 0.35 0.65 0.85 0.94 0.98 1"/>
  </feComponentTransfer>
</filter>
```

**How tableValues works:** The input range [0, 1] is divided into N-1 equal intervals (where N = number of values). Each value defines the output at that input point. Values between points are linearly interpolated.

#### Posterization (Reduce Color Levels)

```xml
<filter id="posterize-4">
  <feComponentTransfer>
    <!-- 4 discrete levels per channel = 64 total colors -->
    <feFuncR type="discrete" tableValues="0 0.33 0.67 1"/>
    <feFuncG type="discrete" tableValues="0 0.33 0.67 1"/>
    <feFuncB type="discrete" tableValues="0 0.33 0.67 1"/>
  </feComponentTransfer>
</filter>
```

#### Gamma Correction

```xml
<filter id="gamma-bright">
  <feComponentTransfer>
    <!-- exponent < 1 brightens, > 1 darkens -->
    <feFuncR type="gamma" amplitude="1" exponent="0.6" offset="0"/>
    <feFuncG type="gamma" amplitude="1" exponent="0.6" offset="0"/>
    <feFuncB type="gamma" amplitude="1" exponent="0.6" offset="0"/>
  </feComponentTransfer>
</filter>
```

---

## 8. Advanced Lighting Techniques

### 8.1 Multi-Light Rig

Real scenes have multiple light sources. Build a multi-light setup by running separate lighting primitives and compositing their results:

```xml
<filter id="two-light-rig" x="-5%" y="-5%" width="110%" height="110%">
  <!-- Generate surface normal from alpha -->
  <!-- Key light (strong, directional) -->
  <feDiffuseLighting in="SourceAlpha" surfaceScale="3" diffuseConstant="1"
                     result="key-light">
    <feDistantLight azimuth="225" elevation="50"/>
  </feDiffuseLighting>

  <!-- Fill light (softer, from opposite side) -->
  <feDiffuseLighting in="SourceAlpha" surfaceScale="2" diffuseConstant="0.4"
                     result="fill-light">
    <feDistantLight azimuth="45" elevation="35"/>
  </feDiffuseLighting>

  <!-- Specular highlight from key light -->
  <feSpecularLighting in="SourceAlpha" surfaceScale="3"
                      specularConstant="0.8" specularExponent="30"
                      result="specular">
    <feDistantLight azimuth="225" elevation="50"/>
  </feSpecularLighting>

  <!-- Combine: original + key + fill + specular -->
  <feComposite in="key-light" in2="fill-light" operator="arithmetic"
               k1="0" k2="0.7" k3="0.3" k4="0" result="combined-light"/>
  <feComposite in="SourceGraphic" in2="combined-light" operator="arithmetic"
               k1="0" k2="0.6" k3="0.5" k4="0" result="lit"/>
  <feComposite in="specular" in2="SourceAlpha" operator="in" result="spec-clip"/>
  <feBlend in="lit" in2="spec-clip" mode="screen"/>
</filter>
```

### 8.2 Light Type Comparison

| Light type | Element | Use case | Effect |
|-----------|---------|----------|--------|
| **Distant** | `<feDistantLight>` | Sun, moon, general ambient | Even lighting across surface, no falloff |
| **Point** | `<fePointLight>` | Lamp, candle, spotlight | Falls off with distance from source |
| **Spot** | `<feSpotLight>` | Focused beam, flashlight | Cone of light with falloff at edges |

**feSpotLight parameters:**
- `x`, `y`, `z` — Light position
- `pointsAtX`, `pointsAtY`, `pointsAtZ` — Where the spotlight aims
- `specularExponent` — Cone tightness (higher = narrower beam)
- `limitingConeAngle` — Hard cutoff angle in degrees

```xml
<feSpecularLighting surfaceScale="4" specularExponent="20" specularConstant="1">
  <feSpotLight x="200" y="50" z="300"
               pointsAtX="200" pointsAtY="200" pointsAtZ="0"
               specularExponent="15" limitingConeAngle="30"/>
</feSpecularLighting>
```

### 8.3 Ambient Occlusion Simulation

Simulate soft shadows in crevices and corners where ambient light is blocked:

```xml
<filter id="ambient-occlusion" x="-5%" y="-5%" width="110%" height="110%">
  <!-- Dilate the alpha slightly -->
  <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="expanded"/>
  <!-- Blur the expanded alpha -->
  <feGaussianBlur in="expanded" stdDeviation="4" result="ao-shadow"/>
  <!-- Darken and clip -->
  <feFlood flood-color="#000000" flood-opacity="0.3" result="dark"/>
  <feComposite in="dark" in2="ao-shadow" operator="in" result="ao"/>
  <!-- Subtract original shape to leave only the shadow -->
  <feComposite in="ao" in2="SourceAlpha" operator="out" result="ao-only"/>
  <!-- Layer behind original -->
  <feMerge>
    <feMergeNode in="ao-only"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

---

## 9. Advanced Displacement Techniques

### 9.1 feDisplacementMap Explained

Displacement maps shift each pixel's position based on the color values of a displacement source:

```
newX = originalX + scale × (displacement.channelX - 0.5)
newY = originalY + scale × (displacement.channelY - 0.5)
```

Values at 0.5 (128 in 8-bit) = no displacement. Values > 0.5 shift positive, < 0.5 shift negative.

### 9.2 Controlled Displacement Patterns

**Horizontal wave (flag ripple):**
```xml
<filter id="flag-wave">
  <feTurbulence type="turbulence" baseFrequency="0.005 0.05" numOctaves="2"
                seed="10" result="wave"/>
  <feDisplacementMap in="SourceGraphic" in2="wave" scale="20"
                     xChannelSelector="R" yChannelSelector="G"/>
</filter>
```

**Circular distortion (lens effect):**
```xml
<filter id="lens-distort">
  <!-- Radial gradient as displacement source -->
  <feFlood flood-color="rgb(128,128,128)" result="gray"/>
  <!-- Use SourceAlpha as a radial displacement source -->
  <feGaussianBlur in="SourceAlpha" stdDeviation="15" result="radial"/>
  <feDisplacementMap in="SourceGraphic" in2="radial" scale="25"
                     xChannelSelector="R" yChannelSelector="G"/>
</filter>
```

**Heat shimmer (atmospheric distortion):**
```xml
<filter id="heat-shimmer" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="turbulence" baseFrequency="0.02 0.06" numOctaves="2"
                seed="42" result="shimmer"/>
  <feDisplacementMap in="SourceGraphic" in2="shimmer" scale="8"
                     xChannelSelector="R" yChannelSelector="G"/>
</filter>
```

### 9.3 Displacement Scale Guide

| Effect | Scale value | baseFrequency |
|--------|-------------|---------------|
| Subtle texture | 2–5 | 0.1–0.3 |
| Watercolor edge | 8–15 | 0.02–0.05 |
| Water reflection | 10–20 | 0.01–0.03 |
| Heat shimmer | 5–10 | 0.02–0.06 |
| Explosion/shatter | 20–50 | 0.01–0.02 |
| Glass refraction | 3–8 | 0.05–0.1 |
| Flag wave | 15–25 | 0.005–0.01 |
| Rough stone edge | 3–6 | 0.05–0.1 |

---

## 10. Convolution Matrix Guide

### 10.1 feConvolveMatrix Basics

Applies a custom convolution kernel to the image. Extremely powerful for edge detection, sharpening, and embossing.

```xml
<filter id="convolution">
  <feConvolveMatrix order="3"
    kernelMatrix="values..."
    divisor="auto"
    bias="0"
    preserveAlpha="true"/>
</filter>
```

- `order` — Kernel size (3 = 3×3, 5 = 5×5). Larger = more computation.
- `kernelMatrix` — Space-separated values, read left-to-right, top-to-bottom.
- `divisor` — Sum of positive values (auto-calculated if omitted). Normalizes output.
- `bias` — Added to each output pixel (use 0.5 for emboss to center around gray).
- `preserveAlpha` — If `true`, alpha channel is not convolved.

### 10.2 Common Kernels

**Sharpen (3×3):**
```xml
<feConvolveMatrix order="3"
  kernelMatrix="0  -1  0
               -1   5 -1
                0  -1  0"
  preserveAlpha="true"/>
```

**Edge detect (Laplacian):**
```xml
<feConvolveMatrix order="3"
  kernelMatrix="-1 -1 -1
               -1  8 -1
               -1 -1 -1"
  preserveAlpha="true" bias="0.5"/>
```

**Emboss (directional):**
```xml
<feConvolveMatrix order="3"
  kernelMatrix="-2 -1  0
               -1  1  1
                0  1  2"
  preserveAlpha="true" bias="0.5"/>
```

**Unsharp mask (5×5):**
```xml
<feConvolveMatrix order="5"
  kernelMatrix="0  0 -1  0  0
                0 -1 -2 -1  0
               -1 -2 16 -2 -1
                0 -1 -2 -1  0
                0  0 -1  0  0"
  preserveAlpha="true"/>
```

**Horizontal motion blur (1×5):**
```xml
<feConvolveMatrix order="5 1"
  kernelMatrix="0.2 0.2 0.2 0.2 0.2"
  preserveAlpha="true"/>
```

---

## 11. Filter Animation

### 11.1 Animating Filter Parameters

Many filter parameters can be animated using SMIL `<animate>` elements:

**Pulsing glow:**
```xml
<filter id="pulse-glow">
  <feGaussianBlur in="SourceGraphic" result="blur">
    <animate attributeName="stdDeviation" values="2;8;2"
             dur="2s" repeatCount="indefinite"/>
  </feGaussianBlur>
  <feMerge>
    <feMergeNode in="blur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

**Animated turbulence (flowing water):**
```xml
<filter id="flowing-water">
  <feTurbulence type="turbulence" baseFrequency="0.01 0.05" numOctaves="3"
                result="water">
    <animate attributeName="seed" from="1" to="100"
             dur="5s" repeatCount="indefinite"/>
  </feTurbulence>
  <feDisplacementMap in="SourceGraphic" in2="water" scale="12"
                     xChannelSelector="R" yChannelSelector="G"/>
</filter>
```

**Color cycling via animated feColorMatrix:**
```xml
<filter id="color-cycle">
  <feColorMatrix type="hueRotate">
    <animate attributeName="values" from="0" to="360"
             dur="10s" repeatCount="indefinite"/>
  </feColorMatrix>
</filter>
```

### 11.2 Animatable Filter Properties

| Filter primitive | Animatable properties |
|-----------------|---------------------|
| feGaussianBlur | `stdDeviation` |
| feOffset | `dx`, `dy` |
| feFlood | `flood-color`, `flood-opacity` |
| feTurbulence | `baseFrequency`, `seed` |
| feDisplacementMap | `scale` |
| feColorMatrix | `values` (all types) |
| feMorphology | `radius` |
| feConvolveMatrix | `kernelMatrix`, `bias` |
| feComponentTransfer | `slope`, `intercept`, `amplitude`, `exponent`, `offset` |
| feDiffuseLighting | `surfaceScale`, `diffuseConstant` |
| feSpecularLighting | `surfaceScale`, `specularConstant`, `specularExponent` |
| fePointLight | `x`, `y`, `z` |
| feSpotLight | All position/direction attributes |
| feDistantLight | `azimuth`, `elevation` |

---

## 12. Advanced Recipe Collection

### 12.1 Chromatic Aberration

Simulates lens color fringing by offsetting color channels:

```xml
<filter id="chromatic-aberration" x="-5%" y="-5%" width="110%" height="110%">
  <!-- Extract red channel, offset left -->
  <feColorMatrix in="SourceGraphic" type="matrix" values="
    1 0 0 0 0
    0 0 0 0 0
    0 0 0 0 0
    0 0 0 1 0" result="red"/>
  <feOffset in="red" dx="-3" dy="0" result="red-shifted"/>

  <!-- Extract blue channel, offset right -->
  <feColorMatrix in="SourceGraphic" type="matrix" values="
    0 0 0 0 0
    0 0 0 0 0
    0 0 1 0 0
    0 0 0 1 0" result="blue"/>
  <feOffset in="blue" dx="3" dy="0" result="blue-shifted"/>

  <!-- Green stays in place -->
  <feColorMatrix in="SourceGraphic" type="matrix" values="
    0 0 0 0 0
    0 1 0 0 0
    0 0 0 0 0
    0 0 0 1 0" result="green"/>

  <!-- Combine channels -->
  <feBlend in="red-shifted" in2="green" mode="screen" result="rg"/>
  <feBlend in="rg" in2="blue-shifted" mode="screen"/>
</filter>
```

### 12.2 Duotone Effect

Converts image to two-color tone mapping:

```xml
<filter id="duotone-blue-orange">
  <!-- Convert to grayscale -->
  <feColorMatrix type="saturate" values="0" result="gray"/>
  <!-- Map: shadows → dark blue, highlights → orange -->
  <feComponentTransfer in="gray">
    <feFuncR type="table" tableValues="0.1 0.95"/>
    <feFuncG type="table" tableValues="0.15 0.55"/>
    <feFuncB type="table" tableValues="0.45 0.2"/>
  </feComponentTransfer>
</filter>
```

Change `tableValues` to map to different color pairs:
- **Shadow-to-highlight mapping**: First value = shadow color channel, second = highlight color channel
- Purple/gold: R `0.3 0.95`, G `0.1 0.75`, B `0.5 0.1`
- Teal/magenta: R `0.1 0.9`, G `0.4 0.2`, B `0.45 0.6`

### 12.3 Vintage Film Grain

```xml
<filter id="film-grain" x="0" y="0" width="100%" height="100%">
  <!-- Base grain -->
  <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3"
                seed="1" result="grain"/>
  <feColorMatrix in="grain" type="saturate" values="0" result="bw-grain"/>

  <!-- Reduce grain intensity -->
  <feComponentTransfer in="bw-grain" result="soft-grain">
    <feFuncR type="linear" slope="0.15" intercept="0.425"/>
    <feFuncG type="linear" slope="0.15" intercept="0.425"/>
    <feFuncB type="linear" slope="0.15" intercept="0.425"/>
  </feComponentTransfer>

  <!-- Vignette (darkened edges) -->
  <feFlood flood-color="black" result="black"/>
  <feComposite in="black" in2="SourceAlpha" operator="in" result="black-clip"/>
  <feGaussianBlur in="black-clip" stdDeviation="40" result="vignette-blur"/>
  <feComponentTransfer in="vignette-blur" result="vignette">
    <feFuncA type="table" tableValues="0.3 0.1 0 0 0 0.1 0.3"/>
  </feComponentTransfer>

  <!-- Combine: original + grain + vignette -->
  <feBlend in="SourceGraphic" in2="soft-grain" mode="multiply" result="grained"/>
  <feBlend in="grained" in2="vignette" mode="multiply"/>
</filter>
```

### 12.4 X-Ray / Invert Effect

```xml
<filter id="xray">
  <!-- Invert colors -->
  <feComponentTransfer>
    <feFuncR type="table" tableValues="1 0"/>
    <feFuncG type="table" tableValues="1 0"/>
    <feFuncB type="table" tableValues="1 0"/>
  </feComponentTransfer>
  <!-- Desaturate partially for medical look -->
  <feColorMatrix type="saturate" values="0.15"/>
  <!-- Slight blue tint -->
  <feColorMatrix type="matrix" values="
    0.8 0   0   0 0
    0   0.9 0   0 0.05
    0   0   1.1 0 0.1
    0   0   0   1 0"/>
</filter>
```

### 12.5 Frosted Glass Overlay

```xml
<filter id="frosted-overlay" x="-5%" y="-5%" width="110%" height="110%">
  <!-- Blur the background -->
  <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blurred"/>
  <!-- Add noise texture -->
  <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3"
                result="frost-noise"/>
  <feColorMatrix in="frost-noise" type="saturate" values="0" result="frost-gray"/>
  <!-- Combine blur with frost -->
  <feBlend in="blurred" in2="frost-gray" mode="overlay" result="frosted"/>
  <!-- Lighten slightly -->
  <feComponentTransfer in="frosted">
    <feFuncR type="linear" slope="0.85" intercept="0.15"/>
    <feFuncG type="linear" slope="0.85" intercept="0.15"/>
    <feFuncB type="linear" slope="0.85" intercept="0.15"/>
  </feComponentTransfer>
</filter>
```

### 12.6 Outline / Stroke Effect (via Filter)

Create an outline around any element without modifying its stroke:

```xml
<filter id="outline-effect" x="-10%" y="-10%" width="120%" height="120%">
  <!-- Expand the alpha channel -->
  <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="expanded"/>
  <!-- Color the expanded region -->
  <feFlood flood-color="#FF0000" result="color"/>
  <feComposite in="color" in2="expanded" operator="in" result="colored-outline"/>
  <!-- Layer: outline behind original -->
  <feMerge>
    <feMergeNode in="colored-outline"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

---

## 13. Debugging & Troubleshooting

### 13.1 Common Filter Problems

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Filter output is all black | Missing `in` attribute | Explicitly set `in="SourceGraphic"` on first primitive |
| Element disappears | Filter region too small | Add `x="-20%" y="-20%" width="140%" height="140%"` |
| Blur looks clipped | Default filter region clips blur | Increase filter region percentages |
| Colors look wrong | feColorMatrix values off | Check matrix math — use identity matrix as baseline |
| Glow only appears on one side | Filter region asymmetric | Center the filter region with negative x/y |
| Performance very slow | Too many high-cost primitives | Reduce blur radius, turbulence octaves, or filter region |
| Filter works in Chrome but not Safari | Browser implementation differences | Test with simpler filter chain |
| Turbulence looks different on each render | `seed` attribute not set | Always specify `seed` for reproducible results |

### 13.2 Debugging Strategy

When a filter doesn't produce the expected result:

```
1. Isolate: Apply the filter to a simple rectangle to rule out element issues
2. Build incrementally: Start with one primitive, add one at a time
3. Use named results: Give every intermediate `result` a descriptive name
4. Test each stage: Temporarily route intermediate results to output
   → Set the last <feMergeNode in="intermediate-name"/> to see that stage
5. Check region: Temporarily set filter region to x="-50%" y="-50%" width="200%" height="200%"
6. Check inputs: Ensure each primitive's `in` references an existing result
7. Validate math: For feColorMatrix, multiply sample pixel values by hand
```

### 13.3 Filter Result Naming Convention

Use a consistent naming scheme for filter intermediate results:

```
Source stages:    src-alpha, src-graphic
Processing:       blurred, offset, expanded, tinted
Lighting:         key-light, fill-light, specular, combined-light
Color:            grayscale, warm-shifted, posterized
Noise:            noise, grain, turbulence, frost
Compositing:      clipped, masked, blended, merged
Final stages:     pre-final, final
```

### 13.4 Performance Profiling Approach

When a filter chain is too slow:

```
1. Measure baseline: Time the render without any filters
2. Add filters one at a time: Identify the expensive primitive
3. Optimize the bottleneck:
   - feGaussianBlur: Reduce stdDeviation
   - feTurbulence: Reduce numOctaves (each one doubles cost)
   - feDisplacementMap: Reduce scale
   - feConvolveMatrix: Use 3×3 instead of 5×5
   - Lighting primitives: Reduce surfaceScale
4. Shrink filter region: Every pixel in the region is processed
5. Consider pre-rendering: For static elements, render to PNG and use <image>
```

---

## 14. Filter Chain Design Patterns

### 14.1 The Sandwich Pattern

Many effects follow this structure: process the input, then layer the result with the original.

```
SourceGraphic → [Process] → result
SourceGraphic + result → [Blend/Merge] → output
```

Example (soft focus):
```xml
<filter id="soft-focus">
  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="soft"/>
  <feBlend in="SourceGraphic" in2="soft" mode="normal" result="blended">
    <!-- Use feComposite arithmetic for custom mix: 70% sharp + 30% soft -->
  </feBlend>
  <feComposite in="SourceGraphic" in2="soft" operator="arithmetic"
               k1="0" k2="0.7" k3="0.3" k4="0"/>
</filter>
```

### 14.2 The Alpha Mask Pattern

Extract shape → process → clip back to shape. Used for effects that need to stay within the element's bounds.

```
SourceAlpha → [Process (blur, flood, etc.)] → processed
processed + SourceAlpha → feComposite operator="in" → clipped
clipped + SourceGraphic → feMerge → output
```

### 14.3 The Texture Overlay Pattern

Generate texture → color/tone it → blend with original.

```
feTurbulence → feColorMatrix (tone) → texture
SourceGraphic + texture → feBlend (multiply/overlay/screen) → output
```

### 14.4 The Dual-Path Pattern

Process the input two different ways, then combine:

```
SourceGraphic → [Path A: e.g., blur] → result-a
SourceGraphic → [Path B: e.g., edge detect] → result-b
result-a + result-b → [Combine] → output
```

---

## 15. Cross-Browser Compatibility

### 15.1 Known Differences

| Feature | Chrome/Edge | Firefox | Safari |
|---------|------------|---------|--------|
| `feDropShadow` | ✅ | ✅ | ✅ (14.1+) |
| `feTurbulence` seed consistency | Varies | Consistent | Varies |
| `feComposite arithmetic` | Full support | Full support | Occasional issues |
| `feConvolveMatrix` | Full support | Full support | May be slow |
| `feSpecularLighting` | Full support | Full support | Slight color diff |
| `mix-blend-mode` on SVG | ✅ | ✅ | ⚠️ (some modes) |
| Filter animation (SMIL) | ✅ | ✅ | ⚠️ (limited) |
| `color-interpolation-filters` | Default: `linearRGB` | Default: `linearRGB` | Default: `linearRGB` |

### 15.2 Safe Practices

1. **Always set `seed`** on `feTurbulence` for reproducible results
2. **Test complex chains** in all target browsers early
3. **Prefer `feGaussianBlur` + `feOffset` + `feComposite`** over `feDropShadow` for maximum compatibility
4. **Use `color-interpolation-filters="sRGB"`** when you need consistent color behavior:
   ```xml
   <filter id="my-filter" color-interpolation-filters="sRGB">
     <!-- Filter primitives -->
   </filter>
   ```
5. **Avoid nesting more than 2 filter levels** (filter on group inside filtered group)
6. **Keep total filter chain under 10 primitives** for consistent performance across browsers
