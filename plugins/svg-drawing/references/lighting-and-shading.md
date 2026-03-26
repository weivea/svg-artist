# Lighting & Shading

This reference covers practical SVG lighting techniques: light source types, SVG lighting filter primitives, shadow construction, advanced effects (rim light, subsurface scattering, caustics, volumetric light), time-of-day recipes, and composition rules. Every section includes ready-to-use SVG code.

---

## 1. Light Source Types

### 1.1 Directional Light (Sun/Moon)

Parallel rays at a consistent angle across the entire scene. Best for outdoor scenes and flat subjects.

**SVG primitive:** `feDistantLight` inside `feDiffuseLighting` or `feSpecularLighting`.

| Parameter   | Range       | Description                                                    |
|-------------|-------------|----------------------------------------------------------------|
| `azimuth`   | 0–360°      | Compass direction of light. 0°=right, 90°=bottom, 180°=left, 270°=top (SVG coords) |
| `elevation` | 0–90°       | Angle above horizon. 0°=grazing, 90°=directly above            |

```xml
<!-- Outdoor sunlight from top-left (azimuth=225, elevation=45) -->
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="sunlight" x="-20%" y="-20%" width="140%" height="140%">
      <feDiffuseLighting in="SourceAlpha" surfaceScale="4" diffuseConstant="1.0"
                         lighting-color="#FFF8E7" result="diffuse">
        <feDistantLight azimuth="225" elevation="45" />
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="diffuse" operator="arithmetic"
                   k1="0" k2="1" k3="0.8" k4="0" />
    </filter>
  </defs>
  <rect x="0" y="200" width="400" height="100" fill="#7CB342" />
  <rect x="120" y="80" width="160" height="120" fill="#B0886E" filter="url(#sunlight)" />
  <circle cx="60" cy="40" r="20" fill="#FDB813" opacity="0.9" />
</svg>
```

**Azimuth quick-reference:** 225°=top-left (classic default), 315°=top-right, 135°=bottom-left, 45°=bottom-right

### 1.2 Point Light (Lamp/Candle)

Radiates from a single point in 3D space. Intensity falls off with distance.

**SVG primitive:** `fePointLight` with `x`, `y`, `z` coordinates.

| Parameter | Description                                                         |
|-----------|---------------------------------------------------------------------|
| `x`, `y`  | Position on the 2D plane (user units)                               |
| `z`       | Height above surface. Higher z = softer, more spread; lower z = harder, concentrated |

**Typical `z` ranges:** Subtle=100–200, standard lamp=200–350, dramatic=300–500

```xml
<!-- Lamp illuminating a sphere -->
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="point-light" x="-30%" y="-30%" width="160%" height="160%">
      <feDiffuseLighting in="SourceAlpha" surfaceScale="6" diffuseConstant="1.2"
                         lighting-color="#FFE4B5" result="diffuse">
        <fePointLight x="150" y="100" z="250" />
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="diffuse" operator="arithmetic"
                   k1="0" k2="1" k3="0.7" k4="0" />
    </filter>
    <radialGradient id="sphere-base" cx="40%" cy="35%">
      <stop offset="0%" stop-color="#C0392B" />
      <stop offset="100%" stop-color="#641E16" />
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="#1A1A2E" />
  <circle cx="200" cy="220" r="80" fill="url(#sphere-base)" filter="url(#point-light)" />
</svg>
```

### 1.3 Spot Light

A cone of light from a point aimed at a target. Creates dramatic stage-lighting effects.

| Parameter            | Range    | Description                                      |
|----------------------|----------|--------------------------------------------------|
| `x`, `y`, `z`       | user units | Light source position                           |
| `pointsAtX/Y/Z`     | user units | Target the light aims at                        |
| `specularExponent`   | 1–128    | Cone sharpness. Higher = tighter spot            |
| `limitingConeAngle`  | 0–90°    | Hard cutoff angle for the cone edge              |

```xml
<!-- Stage spotlight effect -->
<svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="spotlight" x="-50%" y="-50%" width="200%" height="200%">
      <feDiffuseLighting in="SourceAlpha" surfaceScale="5" diffuseConstant="1.5"
                         lighting-color="#FFFDE7" result="diffuse">
        <feSpotLight x="250" y="-100" z="400"
                     pointsAtX="250" pointsAtY="250" pointsAtZ="0"
                     specularExponent="20" limitingConeAngle="30" />
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="diffuse" operator="arithmetic"
                   k1="0" k2="0.4" k3="1.0" k4="0" />
    </filter>
  </defs>
  <rect width="500" height="400" fill="#0A0A14" />
  <rect x="0" y="300" width="500" height="100" fill="#1A1A1A" />
  <ellipse cx="250" cy="280" rx="40" ry="80" fill="#2C3E50" filter="url(#spotlight)" />
</svg>
```

### 1.4 Ambient Light

Uniform illumination with no direction. SVG has no dedicated ambient primitive — simulate with `feFlood` composited over the source.

```xml
<filter id="ambient-light">
  <feColorMatrix type="saturate" values="0.7" in="SourceGraphic" result="desat" />
  <feFlood flood-color="#FFF8E1" flood-opacity="0.15" result="ambient" />
  <feComposite in="ambient" in2="desat" operator="atop" />
</filter>
```

---

## 2. SVG Lighting Filters

### 2.1 Diffuse Lighting (`feDiffuseLighting`)

Simulates matte surface illumination — paper, fabric, unfinished wood, skin.

| Parameter          | Range     | Description                                    |
|--------------------|-----------|------------------------------------------------|
| `surfaceScale`     | 1–10      | Height of the bump map surface                 |
| `diffuseConstant`  | 0.5–1.5   | Overall brightness multiplier                  |
| `lighting-color`   | CSS color | Color of the light                             |
| `in`               | —         | Must be `SourceAlpha` or a height map          |

```xml
<filter id="diffuse-texture" x="-10%" y="-10%" width="120%" height="120%">
  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" seed="7" result="bump" />
  <feDiffuseLighting in="bump" surfaceScale="3" diffuseConstant="0.9"
                     lighting-color="#FFFFFF" result="diffuse">
    <feDistantLight azimuth="225" elevation="50" />
  </feDiffuseLighting>
  <feComposite in="diffuse" in2="SourceGraphic" operator="arithmetic"
               k1="0.8" k2="0.4" k3="0" k4="0" />
</filter>
```

### 2.2 Specular Lighting (`feSpecularLighting`)

Simulates shiny surface highlights — metal, glass, wet surfaces, polished materials.

| Parameter           | Range     | Description                                                 |
|---------------------|-----------|-------------------------------------------------------------|
| `surfaceScale`      | 1–10      | Surface height for specular calculation                     |
| `specularConstant`  | 0.5–2.0   | Brightness of the highlight                                 |
| `specularExponent`  | 1–128     | Tightness of highlight. Higher = smaller, sharper (mirror-like) |
| `lighting-color`    | CSS color | Highlight color                                             |

**Specular exponent guide:**
- 1–5: Very wide, soft sheen (satin, brushed metal)
- 10–20: Medium highlight (plastic, skin sheen)
- 40–80: Tight, bright (polished metal, lacquer)
- 80–128: Pinpoint mirror highlight (chrome, glass)

```xml
<filter id="specular-shine" x="-20%" y="-20%" width="140%" height="140%">
  <feSpecularLighting in="SourceAlpha" surfaceScale="5"
                      specularConstant="1.2" specularExponent="40"
                      lighting-color="#FFFFFF" result="specular">
    <fePointLight x="100" y="80" z="300" />
  </feSpecularLighting>
  <feComposite in="specular" in2="SourceAlpha" operator="in" result="spec-masked" />
  <feMerge>
    <feMergeNode in="SourceGraphic" />
    <feMergeNode in="spec-masked" />
  </feMerge>
</filter>
```

### 2.3 Combined Lighting (Phong Shading Model)

Combine diffuse + specular for realistic shading. Use `feComposite operator="arithmetic"` to blend.

**Blending formula:** `Result = k1*in*in2 + k2*in + k3*in2 + k4`
- Typical: k1=0, k2=1 (keep source), k3=0.6 (add specular at 60%), k4=0

```xml
<!-- Sphere with combined diffuse and specular (Phong model) -->
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="phong-lighting" x="-20%" y="-20%" width="140%" height="140%">
      <feDiffuseLighting in="SourceAlpha" surfaceScale="6" diffuseConstant="1.0"
                         lighting-color="#FFF8E7" result="diffuse">
        <feDistantLight azimuth="225" elevation="45" />
      </feDiffuseLighting>
      <feSpecularLighting in="SourceAlpha" surfaceScale="6"
                          specularConstant="1.0" specularExponent="25"
                          lighting-color="#FFFFFF" result="specular">
        <feDistantLight azimuth="225" elevation="45" />
      </feSpecularLighting>
      <feComposite in="specular" in2="SourceAlpha" operator="in" result="spec-cut" />
      <feComposite in="SourceGraphic" in2="diffuse" operator="arithmetic"
                   k1="1.2" k2="0.2" k3="0" k4="0" result="diffuse-applied" />
      <feComposite in="diffuse-applied" in2="spec-cut" operator="arithmetic"
                   k1="0" k2="1" k3="0.6" k4="0" />
    </filter>
    <radialGradient id="sphere-grad" cx="40%" cy="35%">
      <stop offset="0%" stop-color="#E74C3C" />
      <stop offset="100%" stop-color="#922B21" />
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="#1C2833" />
  <circle cx="200" cy="200" r="100" fill="url(#sphere-grad)" filter="url(#phong-lighting)" />
</svg>
```

### 2.4 Multi-Light Setup

Use `feMerge` to combine multiple independent light passes. Each light gets its own diffuse/specular primitive.

```xml
<!-- Warm key light + cool fill light + rim light -->
<filter id="three-lights" x="-30%" y="-30%" width="160%" height="160%">
  <!-- Key light: warm, from top-left -->
  <feDiffuseLighting in="SourceAlpha" surfaceScale="5" diffuseConstant="1.0"
                     lighting-color="#FFE0B2" result="key">
    <feDistantLight azimuth="225" elevation="45" />
  </feDiffuseLighting>
  <feComposite in="SourceGraphic" in2="key" operator="arithmetic"
               k1="1" k2="0" k3="0" k4="0" result="key-applied" />
  <!-- Fill light: cool, from right -->
  <feDiffuseLighting in="SourceAlpha" surfaceScale="3" diffuseConstant="0.5"
                     lighting-color="#BBDEFB" result="fill">
    <feDistantLight azimuth="350" elevation="30" />
  </feDiffuseLighting>
  <feComposite in="SourceGraphic" in2="fill" operator="arithmetic"
               k1="0.5" k2="0" k3="0" k4="0" result="fill-applied" />
  <!-- Rim/back light: bright, from behind -->
  <feSpecularLighting in="SourceAlpha" surfaceScale="4"
                      specularConstant="1.5" specularExponent="15"
                      lighting-color="#FFFDE7" result="rim">
    <feDistantLight azimuth="45" elevation="20" />
  </feSpecularLighting>
  <feComposite in="rim" in2="SourceAlpha" operator="in" result="rim-cut" />
  <!-- Merge all passes -->
  <feMerge>
    <feMergeNode in="key-applied" />
    <feMergeNode in="fill-applied" />
    <feMergeNode in="rim-cut" />
  </feMerge>
</filter>
```

---

## 3. Shadow Construction

### 3.1 Drop Shadow

Simple offset shadow below or behind an object.

**Recipe:** `feGaussianBlur(SourceAlpha)` → `feOffset` → `feFlood` + `feComposite(in)` → `feMerge`

**Shadow softness by distance:** Contact=stdDeviation 1–2, near=3–5, far=8–12
**Shadow opacity:** Subtle=0.10–0.20, medium=0.30–0.40, dramatic=0.50–0.70

```xml
<!-- Parameterized drop shadow — adjust stdDeviation, dx/dy, and opacity for distance -->
<filter id="drop-shadow" x="-20%" y="-20%" width="150%" height="160%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
  <feOffset dx="3" dy="5" result="offset" />
  <feFlood flood-color="#000" flood-opacity="0.25" result="color" />
  <feComposite in="color" in2="offset" operator="in" result="shadow" />
  <feMerge>
    <feMergeNode in="shadow" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```

### 3.2 Cast Shadow

Projected shadow following light direction. Constructed as a transformed shape.

**Transform approach:** Use `matrix(a, b, c, d, e, f)` to skew and compress.
- Floor shadow: `matrix(1, 0, -0.5, 0.3, 0, 0)` — skews horizontally, compresses vertically
- Shadow angle follows light: light at 45° from left → shadow extends at 45° to the right

```xml
<!-- Character with cast floor shadow -->
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow-blur">
      <feGaussianBlur stdDeviation="4" />
    </filter>
  </defs>
  <rect width="400" height="400" fill="#E8E8E8" />
  <rect x="0" y="300" width="400" height="100" fill="#C8C8C8" />
  <!-- Cast shadow: skewed, compressed, blurred copy -->
  <g transform="translate(200,300)" opacity="0.2" filter="url(#shadow-blur)">
    <rect x="-25" y="-120" width="50" height="120" rx="10" fill="#000"
          transform="matrix(1,0,-0.6,0.25,0,0)" />
  </g>
  <!-- Character -->
  <g transform="translate(200,300)">
    <rect x="-25" y="-120" width="50" height="120" rx="10" fill="#5D4E37" />
    <circle cx="0" cy="-140" r="20" fill="#FDBCB4" />
  </g>
</svg>
```

### 3.3 Form Shadow (Self-Shadow)

Shadow on the object itself, on the side facing away from the light. Use radial/linear gradient from lit color to shadow color. Include a core-shadow line: a darker band at the transition (darker than general shadow).

```xml
<!-- Sphere with form shadow gradient and core shadow -->
<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="form-shadow" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#E74C3C" />     <!-- Lit area -->
      <stop offset="50%" stop-color="#C0392B" />     <!-- Mid transition -->
      <stop offset="65%" stop-color="#7B241C" />     <!-- Core shadow (darkest band) -->
      <stop offset="75%" stop-color="#922B21" />     <!-- Shadow side -->
      <stop offset="100%" stop-color="#641E16" />    <!-- Deep shadow -->
    </radialGradient>
    <radialGradient id="highlight" cx="30%" cy="25%" r="20%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.6)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
  </defs>
  <rect width="300" height="300" fill="#2C3E50" />
  <circle cx="150" cy="150" r="80" fill="url(#form-shadow)" />
  <circle cx="150" cy="150" r="80" fill="url(#highlight)" />
</svg>
```

### 3.4 Contact Shadow / Ambient Occlusion

Darkening where objects meet surfaces. Very narrow (stdDeviation 1–3), relatively dark (opacity 0.30–0.50), present even in flat ambient lighting.

```xml
<!-- Object on surface with contact shadow -->
<svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="contact-blur">
      <feGaussianBlur stdDeviation="2" />
    </filter>
    <radialGradient id="contact-shadow" cx="50%" cy="50%" rx="50%" ry="20%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.45)" />
      <stop offset="60%" stop-color="rgba(0,0,0,0.2)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
  </defs>
  <rect width="300" height="250" fill="#E0E0E0" />
  <ellipse cx="150" cy="182" rx="55" ry="8" fill="url(#contact-shadow)"
           filter="url(#contact-blur)" />
  <rect x="105" y="100" width="90" height="80" rx="5" fill="#5C6BC0" />
</svg>
```

### 3.5 Inner Shadow

Shadow inside an element, creating depth or inset/carved appearance.

**Recipe:** Invert `SourceAlpha` → blur → offset → composite inside original shape.

```xml
<filter id="inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
  <feComponentTransfer in="SourceAlpha" result="invert">
    <feFuncA type="table" tableValues="1 0" />
  </feComponentTransfer>
  <feGaussianBlur in="invert" stdDeviation="4" result="blur" />
  <feOffset dx="3" dy="3" result="offset" />
  <feFlood flood-color="#000000" flood-opacity="0.5" result="color" />
  <feComposite in="color" in2="offset" operator="in" result="shadow" />
  <feComposite in="shadow" in2="SourceAlpha" operator="in" result="clipped" />
  <feMerge>
    <feMergeNode in="SourceGraphic" />
    <feMergeNode in="clipped" />
  </feMerge>
</filter>
```

---

## 4. Advanced Lighting Techniques

### 4.1 Rim Lighting / Edge Light

Bright outline on the edge facing away from the viewer, toward a back light. Essential for separating subjects from dark backgrounds.

```xml
<!-- Rim light via dilate-and-subtract filter -->
<filter id="rim-light" x="-10%" y="-10%" width="120%" height="120%">
  <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="dilated" />
  <feComposite in="dilated" in2="SourceAlpha" operator="out" result="edge" />
  <feFlood flood-color="#E3F2FD" flood-opacity="0.85" result="rim-color" />
  <feComposite in="rim-color" in2="edge" operator="in" result="rim" />
  <feGaussianBlur in="rim" stdDeviation="0.8" result="rim-soft" />
  <feMerge>
    <feMergeNode in="SourceGraphic" />
    <feMergeNode in="rim-soft" />
  </feMerge>
</filter>
```

**Alternative:** Draw a bright path along the back edge manually:

```xml
<path d="M 195 160 Q 210 200 200 280 Q 195 330 185 340"
      fill="none" stroke="#E3F2FD" stroke-width="2" opacity="0.7"
      stroke-linecap="round" />
```

### 4.2 Subsurface Scattering (SSS)

Light passing through translucent materials — skin, leaves, wax, marble. Visible at thin areas (ears, fingers, nostrils, leaf edges) against strong backlight.

**SVG simulation:** Layer a warm-colored blurred shape BEHIND the material at the translucent edges.

```xml
<!-- Backlit ear showing subsurface scattering -->
<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="sss-blur">
      <feGaussianBlur stdDeviation="8" />
    </filter>
    <radialGradient id="sss-glow" cx="60%" cy="40%">
      <stop offset="0%" stop-color="#FF6B35" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#E53935" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#E53935" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="skin" cx="40%" cy="40%">
      <stop offset="0%" stop-color="#FDBCB4" />
      <stop offset="100%" stop-color="#D4956B" />
    </radialGradient>
  </defs>
  <rect width="300" height="300" fill="#1A1A2E" />
  <!-- SSS glow layer BEHIND the ear (light passing through) -->
  <ellipse cx="155" cy="150" rx="35" ry="55" fill="url(#sss-glow)"
           filter="url(#sss-blur)" />
  <!-- Ear shape on top -->
  <ellipse cx="150" cy="150" rx="30" ry="50" fill="url(#skin)"
           stroke="#C4956B" stroke-width="1" />
</svg>
```

**SSS color guide by material:**
- Skin: warm orange-red (#FF6B35 to #E53935)
- Leaf: bright yellow-green (#8BC34A to #4CAF50)
- Wax/candle: warm amber (#FFB74D to #FF8F00)
- Marble: soft warm pink (#FFCDD2 to #EF9A9A)

### 4.3 Caustics

Bright, focused light patterns when light passes through transparent/curved objects (glass, water).

```xml
<defs>
  <filter id="caustic-pattern" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="turbulence" baseFrequency="0.03 0.05"
                  numOctaves="3" seed="12" result="noise" />
    <feColorMatrix type="luminanceToAlpha" in="noise" result="luma" />
    <feComponentTransfer in="luma" result="sharp">
      <feFuncA type="gamma" amplitude="1" exponent="3" offset="-0.2" />
    </feComponentTransfer>
    <feFlood flood-color="#FFFDE7" flood-opacity="0.4" result="light-color" />
    <feComposite in="light-color" in2="sharp" operator="in" />
  </filter>
  <clipPath id="caustic-clip">
    <ellipse cx="200" cy="320" rx="60" ry="20" />
  </clipPath>
</defs>
<!-- Apply caustics on the surface beneath glass, clipped to the area below the object -->
<rect x="100" y="280" width="200" height="60"
      filter="url(#caustic-pattern)" clip-path="url(#caustic-clip)" />
```

### 4.4 Volumetric Light (God Rays)

Visible light beams through atmosphere — windows, forest canopy, clouds. Use semi-transparent trapezoids radiating from the light source with gradient opacity (dense near source → fading away).

```xml
<!-- Light rays through a window -->
<svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ray-fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFDE7" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#FFFDE7" stop-opacity="0" />
    </linearGradient>
    <filter id="ray-blur">
      <feGaussianBlur stdDeviation="3" />
    </filter>
  </defs>
  <rect width="500" height="400" fill="#0D1117" />
  <rect x="0" y="0" width="500" height="250" fill="#1A1F2E" />
  <rect x="150" y="30" width="80" height="100" fill="#87CEEB" rx="3" />
  <rect x="270" y="30" width="80" height="100" fill="#87CEEB" rx="3" />
  <!-- God rays spreading from windows -->
  <g filter="url(#ray-blur)">
    <polygon points="150,130 230,130 320,400 80,400" fill="url(#ray-fade)" />
    <polygon points="270,130 350,130 440,400 200,400" fill="url(#ray-fade)" />
  </g>
</svg>
```

---

## 5. Time-of-Day Lighting Recipes

### 5.1 Dawn / Golden Hour

| Property         | Value                                          |
|------------------|------------------------------------------------|
| Light color      | Warm gold `#FDB813`                            |
| Elevation        | 5–15° (low angle)                              |
| Azimuth          | From east (~0° or 350°)                        |
| Shadow           | Very long, warm brown `#3D2B1F` at opacity 0.2 |
| Ambient          | Warm, low contrast                             |

```xml
<defs>
  <linearGradient id="dawn-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1A237E" />
    <stop offset="30%" stop-color="#E65100" />
    <stop offset="55%" stop-color="#FDB813" />
    <stop offset="80%" stop-color="#FFF9C4" />
    <stop offset="100%" stop-color="#FFF8E1" />
  </linearGradient>
</defs>
<rect width="400" height="300" fill="url(#dawn-sky)" />
```

### 5.2 Midday / High Noon

| Property         | Value                                          |
|------------------|------------------------------------------------|
| Light color      | Bright white `#FFFEF0`                         |
| Elevation        | 70–85° (nearly overhead)                       |
| Shadow           | Very short, directly below, cool `#1A1A2E`     |
| Contrast         | High, harsh transitions                        |

```xml
<filter id="noon-shadow" x="-10%" y="-5%" width="120%" height="120%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
  <feOffset dx="0" dy="3" result="offset" />
  <feFlood flood-color="#1A1A2E" flood-opacity="0.4" result="color" />
  <feComposite in="color" in2="offset" operator="in" result="shadow" />
  <feMerge>
    <feMergeNode in="shadow" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```

### 5.3 Sunset / Dusk

| Property         | Value                                          |
|------------------|------------------------------------------------|
| Light color      | Deep orange `#FF6B35`                          |
| Elevation        | 2–8° (very low)                                |
| Shadow           | Very long, dramatic                            |
| Sky palette      | Dark blue → purple → magenta → orange → gold   |
| Subjects         | Often silhouetted against bright sky            |

```xml
<defs>
  <linearGradient id="sunset-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1A1A4E" />
    <stop offset="25%" stop-color="#6A1B9A" />
    <stop offset="45%" stop-color="#C2185B" />
    <stop offset="65%" stop-color="#FF6B35" />
    <stop offset="85%" stop-color="#FFB74D" />
    <stop offset="100%" stop-color="#FFF9C4" />
  </linearGradient>
</defs>
<rect width="400" height="300" fill="url(#sunset-sky)" />
<!-- Silhouetted tree -->
<path d="M 180 300 L 180 200 Q 140 180 130 150 Q 120 120 150 100 Q 160 80 180 90
         Q 190 70 210 80 Q 230 60 250 80 Q 270 90 260 120 Q 280 140 260 160
         Q 250 180 220 200 L 220 300 Z"
      fill="#0A0A0F" />
```

### 5.4 Night / Moonlight

| Property         | Value                                          |
|------------------|------------------------------------------------|
| Light color      | Cold blue `#B4C7DC`                            |
| Contrast         | Very low, deep shadows                         |
| Ambient          | Dark blue-gray `#1A1F2E`                       |
| Artificial pools | Candle `#FFB347`, streetlamp `#FFD700`         |

```xml
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="lamp-pool" cx="50%" cy="50%">
      <stop offset="0%" stop-color="#FFD700" stop-opacity="0.3" />
      <stop offset="40%" stop-color="#FFB347" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#FFB347" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="400" height="300" fill="#0D1117" />
  <circle cx="320" cy="50" r="20" fill="#B4C7DC" opacity="0.9" />
  <rect width="400" height="300" fill="#B4C7DC" opacity="0.04" />
  <rect x="0" y="220" width="400" height="80" fill="#1A1F2E" />
  <!-- Street lamp with warm pool -->
  <rect x="148" y="120" width="4" height="100" fill="#333" />
  <circle cx="150" cy="118" r="8" fill="#FFD700" opacity="0.9" />
  <ellipse cx="150" cy="240" rx="80" ry="30" fill="url(#lamp-pool)" />
  <!-- Stars -->
  <circle cx="50" cy="30" r="1" fill="#FFF" opacity="0.6" />
  <circle cx="250" cy="25" r="1.2" fill="#FFF" opacity="0.7" />
</svg>
```

### 5.5 Overcast

| Property         | Value                                          |
|------------------|------------------------------------------------|
| Light color      | Uniform soft gray `#C8C8D0`                    |
| Shadows          | None, or very faint and diffuse                |
| Colors           | Slightly desaturated                           |

```xml
<filter id="overcast">
  <feColorMatrix type="saturate" values="0.6" />
  <feFlood flood-color="#C8C8D0" flood-opacity="0.08" result="haze" />
  <feComposite in="haze" in2="SourceGraphic" operator="atop" />
</filter>
```

### 5.6 Indoor — Warm Tungsten

| Property         | Value                                          |
|------------------|------------------------------------------------|
| Light color      | Warm `#FFE4B5`                                 |
| Source type      | Point light from above                         |
| Shadows          | Soft, warm-tinted, multi-directional           |
| Falloff          | Gradient from bright center to dim edges        |

```xml
<defs>
  <radialGradient id="tungsten-falloff" cx="50%" cy="30%">
    <stop offset="0%" stop-color="#FFE4B5" stop-opacity="0.25" />
    <stop offset="60%" stop-color="#FFE4B5" stop-opacity="0.08" />
    <stop offset="100%" stop-color="#FFE4B5" stop-opacity="0" />
  </radialGradient>
  <filter id="warm-light" x="-20%" y="-20%" width="140%" height="140%">
    <feDiffuseLighting in="SourceAlpha" surfaceScale="4" diffuseConstant="1.0"
                       lighting-color="#FFE4B5" result="diffuse">
      <fePointLight x="200" y="50" z="200" />
    </feDiffuseLighting>
    <feComposite in="SourceGraphic" in2="diffuse" operator="arithmetic"
                 k1="0" k2="1" k3="0.5" k4="0" />
  </filter>
</defs>
<rect width="400" height="300" fill="#2C2416" />
<rect width="400" height="300" fill="url(#tungsten-falloff)" />
```

### 5.7 Indoor — Cool Fluorescent

| Property         | Value                                          |
|------------------|------------------------------------------------|
| Light color      | Cool white `#F0F4FF` with slight green tint    |
| Shadows          | Flat, minimal, slight green-gray cast          |

```xml
<filter id="fluorescent">
  <feColorMatrix type="matrix"
    values="0.95 0    0    0 0.02
            0    1.02 0    0 0.02
            0    0    1.05 0 0.03
            0    0    0    1 0" />
  <feComponentTransfer>
    <feFuncR type="linear" slope="0.85" intercept="0.08" />
    <feFuncG type="linear" slope="0.85" intercept="0.08" />
    <feFuncB type="linear" slope="0.85" intercept="0.10" />
  </feComponentTransfer>
</filter>
```

---

## 6. Lighting Composition Rules

### 6.1 Three-Point Lighting

The standard lighting setup for most illustrations.

| Light       | Position                         | Intensity | Role                          |
|-------------|----------------------------------|-----------|-------------------------------|
| Key light   | 45° from camera, 45° elevation   | 100%      | Main light, creates form shadows |
| Fill light  | Opposite side of key             | 50–70%    | Softens shadows               |
| Back/rim    | Behind subject                   | 80–120%   | Separates from background      |

```xml
<!-- Three-point lighting (see Section 2.4 for full filter) -->
<!-- Key:  azimuth="225" elevation="45", diffuseConstant="1.0" -->
<!-- Fill: azimuth="350" elevation="30", diffuseConstant="0.5" -->
<!-- Rim:  azimuth="45"  elevation="20", specularConstant="1.5" -->
```

### 6.2 Chiaroscuro

Extreme contrast between light and dark. Most of the scene in deep shadow, dramatic key light reveals the subject.

**Key settings:**
- Shadow fill: very low opacity (0.05–0.10)
- Background: near-black `#0A0A0F`
- Key light: high `diffuseConstant` (1.2–1.5), concentrated
- No fill light or extremely dim

```xml
<!-- Chiaroscuro: dramatic single-source light -->
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="chiaroscuro" x="-30%" y="-30%" width="160%" height="160%">
      <feDiffuseLighting in="SourceAlpha" surfaceScale="8" diffuseConstant="1.4"
                         lighting-color="#FFE0B2" result="key">
        <feSpotLight x="100" y="50" z="300"
                     pointsAtX="200" pointsAtY="200" pointsAtZ="0"
                     specularExponent="8" limitingConeAngle="40" />
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="key" operator="arithmetic"
                   k1="1.5" k2="0" k3="0" k4="0" />
    </filter>
  </defs>
  <rect width="400" height="400" fill="#0A0A0F" />
  <circle cx="200" cy="200" r="80" fill="#C0392B" filter="url(#chiaroscuro)" />
</svg>
```

### 6.3 Light-to-Dark Value Planning

Plan values BEFORE adding color. If the value structure reads clearly in grayscale, the lighting works.

**5-value scale:**

| Value            | Hex       | Usage                         |
|------------------|-----------|-------------------------------|
| Highlight        | `#FFFFFF` | Direct light reflection        |
| Light            | `#CCCCCC` | Lit surfaces facing light      |
| Mid              | `#888888` | Transition areas, neutral      |
| Dark             | `#444444` | Form shadow, receding planes   |
| Deepest shadow   | `#111111` | Cast shadow, crevices, folds   |

**Squint test:** Convert the artwork to grayscale. If you can still read the composition clearly, the value structure is sound.

```xml
<!-- Value study: 5-value sphere (grayscale planning) -->
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="value-study" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="20%" stop-color="#CCCCCC" />
      <stop offset="50%" stop-color="#888888" />
      <stop offset="75%" stop-color="#444444" />
      <stop offset="100%" stop-color="#111111" />
    </radialGradient>
  </defs>
  <rect width="200" height="200" fill="#333333" />
  <circle cx="100" cy="100" r="70" fill="url(#value-study)" />
</svg>
```

**Workflow:** Block in shapes with 5-value grayscale → verify composition reads clearly → map values to colors → add specular highlights and cast shadows last

---

## Related References

- `materials-and-textures.md` — Material-specific light responses (metal specular, glass refraction, skin SSS)
- `svg-filters-and-effects.md` — Complete filter primitive reference and chain construction
- `color-and-gradients.md` — Gradient techniques for light falloff and color temperature
- `composition.md` — Focal point and visual hierarchy through lighting
