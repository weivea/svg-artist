---
name: texture-details
description: "SVG techniques for fabric folds, leather, metallic surfaces, and pattern textures. Use for clothing, accessories, and material rendering."
---

# Texture Details

## Fabric Folds

### Basic fold types
- **Pipe fold:** Tubular, hangs from a point (sleeves, drapes)
- **Zigzag fold:** Compressed fabric (stacked at bottom of curtain)
- **Spiral fold:** Wraps around a cylinder (rolled sleeves, scarves)

```xml
<!-- Fabric fold shadows using overlapping curves -->
<defs>
  <linearGradient id="fold-shadow" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
    <stop offset="50%" stop-color="rgba(0,0,0,0.15)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </linearGradient>
</defs>

<!-- Layer: fold-1 -->
<path d="M 20 10 C 22 25, 18 40, 20 55"
      fill="none" stroke="url(#fold-shadow)" stroke-width="8"/>

<!-- Layer: fold-highlight -->
<path d="M 30 10 C 28 25, 32 40, 30 55"
      fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/>
```

## Metallic Reflection

```xml
<defs>
  <linearGradient id="metal-grad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#E8E8E8"/>
    <stop offset="25%" stop-color="#A0A0A0"/>
    <stop offset="50%" stop-color="#E0E0E0"/>
    <stop offset="75%" stop-color="#808080"/>
    <stop offset="100%" stop-color="#C0C0C0"/>
  </linearGradient>
</defs>

<!-- Multiple gradient bands create metallic look -->
<rect x="10" y="10" width="80" height="80" rx="4" fill="url(#metal-grad)"/>
<!-- Sharp highlight edge -->
<line x1="10" y1="35" x2="90" y2="35" stroke="white" stroke-width="0.5" opacity="0.6"/>
```

## Leather Texture

Use noise filter + subtle bump for leather grain:

```xml
<defs>
  <filter id="leather-grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/>
    <feDiffuseLighting in="noise" lighting-color="#8B4513" surfaceScale="1.5" result="lit">
      <feDistantLight azimuth="45" elevation="60"/>
    </feDiffuseLighting>
    <feComposite in="SourceGraphic" in2="lit" operator="multiply"/>
  </filter>
</defs>

<rect x="10" y="10" width="80" height="80" fill="#8B4513" filter="url(#leather-grain)"/>
```
