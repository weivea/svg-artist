# Icon & UI Design

Practical reference for designing system icons, app icons, UI components, badges, and
icon families in SVG. Covers grid systems, optical alignment, stroke/fill techniques,
optimization, and accessibility.

---

## 1. Icon Grid Systems

### 1.1 Material Design Icon Grid

System icons: **24×24dp**, 2dp padding → **20×20dp live area**.
Product icons: **48×48dp** (artwork at 192×192dp). Grid unit: 1dp.

```xml
<!-- Material Design system icon template -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <!-- Live area: x=2,y=2 to x=22,y=22 (20×20dp) -->
  <rect x="2" y="2" width="20" height="20"
        fill="none" stroke="#E0E0E0" stroke-width="0.25" stroke-dasharray="1"/>
  <!-- Center crosshairs -->
  <line x1="12" y1="0" x2="12" y2="24" stroke="#F0F0F0" stroke-width="0.25"/>
  <line x1="0" y1="12" x2="24" y2="12" stroke="#F0F0F0" stroke-width="0.25"/>
</svg>
```

### 1.2 Keyline Shapes

Keyline shapes define maximum bounds for icon artwork within the grid:

| Shape                | Dimensions     | Position (24dp grid)  |
|----------------------|----------------|-----------------------|
| Circle               | 20dp diameter  | Centered at (12, 12)  |
| Square               | 18×18dp        | Centered at (12, 12)  |
| Vertical rectangle   | 16×20dp        | Centered at (12, 12)  |
| Horizontal rectangle | 20×16dp        | Centered at (12, 12)  |

```xml
<!-- Keyline overlay for 24×24 system icon -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="240" height="240">
  <rect width="24" height="24" fill="#FAFAFA"/>
  <rect x="2" y="2" width="20" height="20" fill="none" stroke="#E0E0E0" stroke-width="0.15"/>
  <!-- Circle: 20dp --> <circle cx="12" cy="12" r="10" fill="none" stroke="#1DE9B6" stroke-width="0.2" opacity="0.6"/>
  <!-- Square: 18dp --> <rect x="3" y="3" width="18" height="18" fill="none" stroke="#00BCD4" stroke-width="0.2" opacity="0.6"/>
  <!-- Vert rect: 16×20 --> <rect x="4" y="2" width="16" height="20" fill="none" stroke="#536DFE" stroke-width="0.2" opacity="0.6"/>
  <!-- Horiz rect: 20×16 --> <rect x="2" y="4" width="20" height="16" fill="none" stroke="#FF4081" stroke-width="0.2" opacity="0.6"/>
  <circle cx="12" cy="12" r="0.5" fill="#F44336"/>
</svg>
```

### 1.3 iOS / Apple Guidelines

App icons: **1024×1024px** master, auto-scaled. Squircle corner radius ≈ **22.37% of width** (continuous curvature superellipse).

```xml
<!-- iOS squircle via cubic Bézier approximation (200×200) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <clipPath id="squircle-clip">
      <path d="M200,100 C200,18.7 181.3,0 100,0 C18.7,0 0,18.7 0,100
               C0,181.3 18.7,200 100,200 C181.3,200 200,181.3 200,100Z"/>
    </clipPath>
  </defs>
  <path d="M200,100 C200,18.7 181.3,0 100,0 C18.7,0 0,18.7 0,100
           C0,181.3 18.7,200 100,200 C181.3,200 200,181.3 200,100Z" fill="#007AFF"/>
  <g clip-path="url(#squircle-clip)"><!-- icon content --></g>
</svg>
```

### 1.4 Custom Grid Construction

1. **Base unit**: 1/24 of total size (1px in a 24px icon)
2. **Padding**: 1-2 units on each side
3. **Keyline shapes**: circle + square + rectangles for family consistency
4. **Snap to half-pixel**: `x="3.5"` renders crisply on 1x screens

---

## 2. Stroke-Based Icons

### 2.1 Line Weight Standards

| Framework        | Stroke | Notes                    |
|------------------|--------|--------------------------|
| Material Design  | 2dp    | Standard system icons    |
| Feather Icons    | 2px    | Round caps and joins     |
| Phosphor Icons   | 1.5px  | Lighter feel             |
| Heroicons        | 1.5px  | Tailwind ecosystem       |

Key rules:
- **Consistent weight** across ALL icons (never mix 1.5 and 2)
- `stroke-linecap="round"` for friendly; `"square"` for technical
- `stroke-linejoin="round"` prevents spiky corners
- `vector-effect="non-scaling-stroke"` maintains weight on resize

```xml
<!-- Stroke icon: Settings gear -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="3"/>
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06
    a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09
    A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83
    l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
    A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83
    l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09
    a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83
    l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09
    a1.65 1.65 0 0 0-1.51 1z"/>
</svg>
```

### 2.2 Corner Radius & Endpoints

- **Exterior corners**: 2dp radius (Material Design)
- **Interior corners**: 0dp (sharp) — contrast aids readability
- **Round cap** (`stroke-linecap="round"`): default for UI icons
- **Square cap**: for technical/engineering icons
- **Butt cap**: rarely used (looks clipped)

```xml
<!-- File icon: rounded exterior, sharp interior fold -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
  <polyline points="14 2 14 8 20 8"/>
</svg>
```

---

## 3. Filled Icons

### 3.1 Filled vs Outline States

Outline = inactive/unselected. Filled = active/selected. Both must share identical silhouette.

```xml
<!-- Heart: outline (inactive) vs filled (active) -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
    a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
    1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
</svg>

<!-- Same path, filled -->
<svg viewBox="0 0 24 24" fill="#E53935" stroke="none">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
    a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
    1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
</svg>
```

### 3.2 Cutout Details

**`fill-rule="evenodd"`**: overlapping sub-paths are automatically cut out.

```xml
<!-- Filled home with window cutout -->
<svg viewBox="0 0 24 24" fill="currentColor">
  <path fill-rule="evenodd" clip-rule="evenodd"
        d="M12 2.5L2 12h3v8h14v-8h3L12 2.5z M10 14h4v4h-4v-4z"/>
</svg>
```

### 3.3 Dual-Tone Icons

Two opacity levels of the same color create depth:

```xml
<!-- Dual-tone folder -->
<svg viewBox="0 0 24 24">
  <path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v2H2V6z"
        fill="currentColor" opacity="0.4"/>
  <path d="M2 10h20v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10z"
        fill="currentColor"/>
</svg>
```

---

## 4. Optical Alignment

### 4.1 Visual vs Mathematical Centering

| Shape          | Adjustment                          | Reason                            |
|----------------|-------------------------------------|-----------------------------------|
| Circle         | Make ~5% larger than grid           | Circles look smaller than squares |
| Triangle/Play  | Shift right ~8% of width           | Centroid is left of bounding box  |
| Horizontal line| 5-10% thicker than vertical         | Appears thinner to human eye      |
| Round shapes   | Extend slightly beyond grid         | Optical overshoot needed          |

```xml
<!-- Play button: shifted right for optical centering -->
<svg viewBox="0 0 24 24" fill="currentColor">
  <polygon points="9,5 9,19 20,12"/>
  <!-- Left edge at 9, right at 20 (shifted ~1dp right from mathematical center) -->
</svg>
```

### 4.2 Visual Weight

- **Pointed shapes** (arrows): low visual mass → extend to grid edges
- **Dense shapes** (gears): high visual mass → use more padding
- **Open shapes** (rings): light → can be slightly larger

### 4.3 Pixel-Perfect Snapping

```
GOOD: x="4"   x="4.5"  x="12"    (whole or half-pixel)
BAD:  x="3.7" x="5.33" x="11.8"  (blurry at 1x)

Even stroke (2px): center on pixel boundary   → x="4"
Odd stroke  (1px): center on half-pixel       → x="4.5"
```

---

## 5. Common Icon Categories & Construction

### 5.1 Navigation Icons

```xml
<!-- Home --> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  <polyline points="9 22 9 12 15 12 15 22"/></svg>

<!-- Hamburger menu -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
  <line x1="4" y1="6" x2="20" y2="6"/>
  <line x1="4" y1="12" x2="20" y2="12"/>
  <line x1="4" y1="18" x2="20" y2="18"/></svg>

<!-- Back arrow -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="19" y1="12" x2="5" y2="12"/>
  <polyline points="12 19 5 12 12 5"/></svg>

<!-- Close/X -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
  <line x1="18" y1="6" x2="6" y2="18"/>
  <line x1="6" y1="6" x2="18" y2="18"/></svg>

<!-- Search -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8"/>
  <line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
```

### 5.2 Action Icons

```xml
<!-- Plus --> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>

<!-- Edit/Pencil -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>

<!-- Trash -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="3 6 5 6 21 6"/>
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>

<!-- Share (3 nodes) -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>

<!-- Download -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
```

### 5.3 Communication & Media Icons

```xml
<!-- Chat bubble -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>

<!-- Email -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 4 12 13 2 4"/></svg>

<!-- Bell -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
  <path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>

<!-- Play (filled, optically centered) -->
<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="9,4 9,20 20,12"/></svg>

<!-- Volume with waves -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
```

### 5.4 Status Icons

```xml
<!-- Checkmark -->
<svg viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="5 13 9 17 19 7"/></svg>

<!-- Warning triangle -->
<svg viewBox="0 0 24 24" fill="none" stroke="#FF9800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

<!-- Info circle -->
<svg viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>

<!-- Error circle -->
<svg viewBox="0 0 24 24" fill="none" stroke="#F44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
```

---

## 6. App Icon Design

### 6.1 Platform Shapes

- **iOS**: squircle mask applied by OS, design full-bleed
- **Android adaptive**: foreground (72×72dp in 108×108dp) + background (108×108dp), safe zone = inner 66dp circle

```xml
<!-- Android adaptive icon -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">
  <rect width="108" height="108" fill="#1976D2"/>
  <circle cx="54" cy="54" r="33" fill="none" stroke="#FFF" stroke-width="0.5" stroke-dasharray="2" opacity="0.3"/>
  <g transform="translate(18, 18)">
    <circle cx="36" cy="36" r="24" fill="#FFF" opacity="0.9"/>
  </g>
</svg>
```

### 6.2 Depth & Shadow

```xml
<!-- App icon with gradient, shadow, and edge tint -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <defs>
    <linearGradient id="app-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#42A5F5"/>
      <stop offset="100%" stop-color="#1565C0"/>
    </linearGradient>
    <filter id="icon-shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="192" height="192" rx="43" fill="url(#app-bg)"/>
  <!-- Edge highlight -->
  <rect x="0.5" y="0.5" width="191" height="191" rx="43" fill="none" stroke="rgba(255,255,255,0.2)"/>
  <!-- Symbol with shadow -->
  <g transform="translate(48, 48)" filter="url(#icon-shadow)">
    <rect x="16" y="4" width="48" height="64" rx="4" fill="#FFF"/>
    <rect x="24" y="30" width="32" height="3" rx="1.5" fill="#90CAF9"/>
    <rect x="24" y="38" width="24" height="3" rx="1.5" fill="#90CAF9"/>
    <rect x="24" y="46" width="28" height="3" rx="1.5" fill="#90CAF9"/>
  </g>
</svg>
```

### 6.3 Color Guidelines

- Max **2 colors** (primary + accent) for recognizability
- Gradients: top-to-bottom, same color family
- Avoid pure #FFF/#000 backgrounds
- Test at 16×16 — must still be recognizable
- Background-to-foreground contrast ≥ 3:1

---

## 7. Icon Families & Consistency

### 7.1 Design System Rules

All icons in a family MUST share:
- Same **stroke weight** (all 2px — never mix 1.5 and 2)
- Same **corner radius** (all 2dp exterior)
- Same **padding** / safe zone
- Same **visual weight** (simple plus ≈ complex gear)
- Same **detail level** (don't mix minimalist and detailed)

### 7.2 Size Variants

| Size  | Stroke  | Detail Level | Notes                         |
|-------|---------|--------------|-------------------------------|
| 16px  | 1px     | Minimal      | Drop interior details         |
| 24px  | 2px     | Standard     | Default system icon size      |
| 32px  | 2-2.5px | Moderate     | Minor interior shapes OK      |
| 48px+ | 2-3px   | Full         | Fine details, subtle fills    |

```xml
<!-- 16px: simplified lock (no keyhole) -->
<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="7" width="10" height="8" rx="1"/>
  <path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg>

<!-- 24px: lock with keyhole -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="11" width="18" height="11" rx="2"/>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  <circle cx="12" cy="16" r="1"/></svg>

<!-- 48px: lock with keyhole + key slot -->
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="6" y="22" width="36" height="22" rx="3"/>
  <path d="M14 22v-8a10 10 0 0 1 20 0v8"/>
  <circle cx="24" cy="32" r="2.5"/>
  <line x1="24" y1="34.5" x2="24" y2="38"/></svg>
```

---

## 8. Badge & Indicator Design

### 8.1 Notification Badges

```xml
<!-- Bell with numbered badge -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
  <g transform="translate(2, 2)" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </g>
  <circle cx="22" cy="6" r="6" fill="#F44336"/>
  <text x="22" y="6" text-anchor="middle" dominant-baseline="central"
        font-size="8" font-weight="700" fill="#FFF" font-family="system-ui">3</text>
</svg>

<!-- Dot badge (no number): just a small circle -->
<!-- <circle cx="23" cy="5" r="4" fill="#F44336"/> -->
```

### 8.2 Status Indicators

| Status  | Color | Hex     |
|---------|-------|---------|
| Online  | Green | #4CAF50 |
| Offline | Gray  | #9E9E9E |
| Busy    | Red   | #F44336 |
| Away    | Amber | #FFC107 |

```xml
<!-- Avatar with status dot (white ring for contrast) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="20" fill="#E0E0E0"/>
  <circle cx="24" cy="20" r="8" fill="#BDBDBD"/>
  <path d="M8 44c0-8.84 7.16-16 16-16s16 7.16 16 16" fill="#BDBDBD"/>
  <circle cx="38" cy="38" r="6" fill="#FFF"/>
  <circle cx="38" cy="38" r="4.5" fill="#4CAF50"/>
</svg>
```

### 8.3 Progress Indicators

Circular progress: `stroke-dasharray` = circumference, `stroke-dashoffset` = circumference × (1 − progress/100).

```xml
<!-- Circular progress at 75% (r=20, circumference=125.66) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <defs><style>
    .track { fill:none; stroke:#E0E0E0; stroke-width:4 }
    .bar { fill:none; stroke:#1976D2; stroke-width:4; stroke-linecap:round;
           transform-origin:center; transform:rotate(-90deg);
           stroke-dasharray:125.66; stroke-dashoffset:31.42 }
  </style></defs>
  <circle cx="24" cy="24" r="20" class="track"/>
  <circle cx="24" cy="24" r="20" class="bar"/>
  <text x="24" y="24" text-anchor="middle" dominant-baseline="central"
        font-size="12" font-weight="600" fill="#333">75%</text>
</svg>
```

---

## 9. SVG Icon Optimization

### 9.1 Path Simplification

```xml
<!-- BEFORE: verbose -->
<path d="M 12.0000,2.0000 L 2.0000,12.0000 L 5.0000,12.0000
  L 5.0000,20.0000 L 11.0000,20.0000 L 11.0000,14.0000
  L 13.0000,14.0000 L 13.0000,20.0000 L 19.0000,20.0000
  L 19.0000,12.0000 L 22.0000,12.0000 Z" fill="#000000" fill-opacity="1.0"/>

<!-- AFTER: optimized -->
<path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3z" fill="currentColor"/>
```

- Max 2 decimal places for icon coordinates
- Use relative commands (`l`, `c`, `a`) for shorter data
- Remove editor metadata and default attributes
- Merge connected shapes where possible

### 9.2 `currentColor` Pattern

```xml
<!-- Icon inherits color from CSS -->
<svg viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3z"/>
</svg>
<!-- CSS: .icon { color: #333 } .icon:hover { color: #1976D2 } -->
```

### 9.3 Accessibility

```xml
<!-- Meaningful icon: announce to screen readers -->
<svg viewBox="0 0 24 24" role="img" aria-label="Settings" fill="currentColor">
  <title>Settings</title>
  <!-- ... icon paths ... -->
</svg>

<!-- Decorative icon: hide from screen readers -->
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
  <!-- ... icon paths ... -->
</svg>
```

Key attributes:
- `role="img"` + `aria-label` — meaningful icons
- `aria-hidden="true"` + `focusable="false"` — decorative icons
- `<title>` inside `<svg>` — tooltip + accessible name

---

## 10. UI Component Patterns

### 10.1 Toggle Switch

```xml
<!-- OFF state -->
<svg viewBox="0 0 48 28" width="48" height="28">
  <rect x="2" y="2" width="44" height="24" rx="12" fill="#BDBDBD"/>
  <circle cx="14" cy="14" r="10" fill="#FFF"/></svg>

<!-- ON state -->
<svg viewBox="0 0 48 28" width="48" height="28">
  <rect x="2" y="2" width="44" height="24" rx="12" fill="#4CAF50"/>
  <circle cx="34" cy="14" r="10" fill="#FFF"/></svg>
```

### 10.2 Checkbox & Radio

```xml
<!-- Checkbox: unchecked / checked -->
<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="#757575" stroke-width="2"/></svg>

<svg viewBox="0 0 24 24">
  <rect x="3" y="3" width="18" height="18" rx="3" fill="#1976D2"/>
  <polyline points="7 12 10 15 17 8" fill="none" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>

<!-- Radio: unselected / selected -->
<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#757575" stroke-width="2"/></svg>

<svg viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9" fill="none" stroke="#1976D2" stroke-width="2"/>
  <circle cx="12" cy="12" r="5" fill="#1976D2"/></svg>
```

### 10.3 Star Rating

```xml
<!-- 3.5 out of 5 stars -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 28">
  <defs>
    <polygon id="star" points="14,2 17.5,9.5 26,10.5 19.5,16.5 21.5,25 14,21 6.5,25 8.5,16.5 2,10.5 10.5,9.5"/>
    <clipPath id="half"><rect width="14" height="28"/></clipPath>
  </defs>
  <use href="#star" x="0" fill="#FFC107"/>
  <use href="#star" x="28" fill="#FFC107"/>
  <use href="#star" x="56" fill="#FFC107"/>
  <g transform="translate(84,0)">
    <use href="#star" fill="#E0E0E0"/>
    <use href="#star" fill="#FFC107" clip-path="url(#half)"/>
  </g>
  <use href="#star" x="112" fill="#E0E0E0"/>
</svg>
```

---

## 11. Icon Sprite Systems

### 11.1 Symbol + Use Pattern

```xml
<!-- Sprite sheet (hidden, loaded once) -->
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="icon-home" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="9 22 9 12 15 12 15 22"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <symbol id="icon-search" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </symbol>
</svg>

<!-- Usage: <svg width="24" height="24"><use href="#icon-home"/></svg> -->
```

External reference: `<use href="/icons/sprite.svg#icon-home"/>` — note that `currentColor` inheritance may not work cross-file in all browsers.

---

## Related References

- `illustration-styles.md` — Flat design and minimalist style for icon aesthetics
- `composition.md` — Visual hierarchy and balance for icon layout
- `bezier-and-curves.md` — Path construction for custom icon shapes
- `color-and-gradients.md` — Color theory and gradient techniques for icon coloring
- `advanced-color-composition.md` — Accessibility contrast ratios for icon visibility
