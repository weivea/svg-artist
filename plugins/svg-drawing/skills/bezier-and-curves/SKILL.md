---
name: bezier-and-curves
description: "Bézier curves, arcs, and organic shape techniques for SVG paths. Use when drawing smooth curves, natural forms, or complex outlines."
---

# Bézier Curves and Arcs

## Overview

SVG paths support three types of curves:
- **Quadratic Bézier** (`Q`/`T`) — one control point, simpler curves
- **Cubic Bézier** (`C`/`S`) — two control points, more precise curves
- **Elliptical Arc** (`A`) — portions of ellipses

All curve commands work within `<path d="...">` and can be chained with line commands.

## Quadratic Bézier: Q and T

### Q — Quadratic Bézier Curve

`Q cx cy, ex ey` draws a curve from the current point to `(ex, ey)` using `(cx, cy)` as the control point.

**Control point intuition:** The curve is "pulled toward" the control point. Imagine holding a rubber band between the start and end points, then pulling the middle toward the control point.

```xml
<!-- Simple quadratic curve -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
  <path d="M 50 150 Q 200 20, 350 150"
        fill="none" stroke="#E74C3C" stroke-width="3" />

  <!-- Visualize the control point -->
  <circle cx="200" cy="20" r="4" fill="#999" />
  <line x1="50" y1="150" x2="200" y2="20" stroke="#ccc" stroke-dasharray="4" />
  <line x1="200" y1="20" x2="350" y2="150" stroke="#ccc" stroke-dasharray="4" />
</svg>
```

**Control point placement rules:**
- Control point **above** the line → curve bows upward
- Control point **below** the line → curve bows downward
- Control point **farther away** → more pronounced curve
- Control point at **midpoint** between start/end → symmetric arch

### T — Smooth Quadratic Continuation

`T ex ey` continues the curve smoothly by automatically reflecting the previous control point.

```xml
<!-- Smooth wave using Q + T -->
<path d="M 10 100 Q 60 20, 110 100 T 210 100 T 310 100 T 410 100"
      fill="none" stroke="#3498DB" stroke-width="3" />
```

**How T works:** It reflects the last Q control point across the current position. This creates a smooth, continuous wave. Each `T` alternates the curve direction automatically.

```xml
<!-- Wavy border for a scene -->
<path d="M 0 80 Q 50 40, 100 80 T 200 80 T 300 80 T 400 80 T 500 80 T 600 80 T 700 80 T 800 80 V 200 H 0 Z"
      fill="#87CEEB" />
```

**Tips:**
- `T` only works well immediately after `Q` or another `T`
- After a non-curve command, `T` treats the current point as the control point (straight line)
- Great for uniform oscillating patterns (waves, scalloped edges)

## Cubic Bézier: C and S

### C — Cubic Bézier Curve

`C cx1 cy1, cx2 cy2, ex ey` draws a curve from the current point to `(ex, ey)` using two control points.

**Two control point intuition:**
- **Control point 1** (`cx1, cy1`) controls the curve's departure direction from the start
- **Control point 2** (`cx2, cy2`) controls the curve's arrival direction at the end
- Think of them as "handles" that determine the tangent angle at each endpoint

```xml
<!-- S-curve using cubic Bézier -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <path d="M 50 250 C 50 100, 200 100, 200 150 C 200 200, 350 200, 350 50"
        fill="none" stroke="#9B59B6" stroke-width="3" />

  <!-- Visualize control points for first segment -->
  <circle cx="50" cy="100" r="4" fill="#E74C3C" />   <!-- cp1 -->
  <circle cx="200" cy="100" r="4" fill="#3498DB" />   <!-- cp2 -->
  <line x1="50" y1="250" x2="50" y2="100" stroke="#E74C3C" stroke-dasharray="3" />
  <line x1="200" y1="150" x2="200" y2="100" stroke="#3498DB" stroke-dasharray="3" />
</svg>
```

### Common Cubic Bézier Patterns

```xml
<!-- Smooth hill / bump -->
<path d="M 0 200 C 100 200, 100 50, 200 50 C 300 50, 300 200, 400 200"
      fill="none" stroke="#27AE60" stroke-width="3" />

<!-- Teardrop shape -->
<path d="M 200 50 C 260 50, 300 130, 200 250 C 100 130, 140 50, 200 50 Z"
      fill="#3498DB" />

<!-- Heart shape -->
<path d="M 200 280 C 200 280, 50 200, 50 130 C 50 50, 130 30, 200 100
         C 270 30, 350 50, 350 130 C 350 200, 200 280, 200 280 Z"
      fill="#E74C3C" />
```

### S — Smooth Cubic Continuation

`S cx2 cy2, ex ey` continues smoothly by reflecting the previous second control point to create cp1 automatically.

```xml
<!-- Smooth undulating path -->
<path d="M 10 100 C 40 20, 80 20, 110 100 S 180 180, 210 100 S 280 20, 310 100"
      fill="none" stroke="#E67E22" stroke-width="3" />
```

**Tips:**
- `S` mirrors the previous C's second control point across the endpoint
- Use `C` for the first segment, then `S` for smooth continuations
- This is ideal for smooth, flowing shapes like rivers, hair, and ribbons

## Elliptical Arc: A

### Arc Command Syntax

`A rx ry x-rotation large-arc-flag sweep-flag ex ey`

| Parameter | Meaning |
|-----------|---------|
| `rx` | Horizontal radius of the ellipse |
| `ry` | Vertical radius of the ellipse |
| `x-rotation` | Rotation of the ellipse in degrees |
| `large-arc-flag` | `0` = smaller arc, `1` = larger arc |
| `sweep-flag` | `0` = counter-clockwise, `1` = clockwise |
| `ex ey` | End point of the arc |

```xml
<!-- Four possible arcs between the same two points -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <!-- large=0, sweep=0 -->
  <path d="M 100 200 A 80 80 0 0 0 300 200" fill="none" stroke="red" stroke-width="2" />
  <!-- large=0, sweep=1 -->
  <path d="M 100 200 A 80 80 0 0 1 300 200" fill="none" stroke="blue" stroke-width="2" />
  <!-- large=1, sweep=0 -->
  <path d="M 100 200 A 80 80 0 1 0 300 200" fill="none" stroke="green" stroke-width="2" />
  <!-- large=1, sweep=1 -->
  <path d="M 100 200 A 80 80 0 1 1 300 200" fill="none" stroke="orange" stroke-width="2" />
</svg>
```

### Common Arc Patterns

```xml
<!-- Semicircle -->
<path d="M 50 150 A 100 100 0 0 1 250 150" fill="#3498DB" />

<!-- Full circle using two arcs -->
<path d="M 200 100 A 50 50 0 1 1 200 200 A 50 50 0 1 1 200 100 Z"
      fill="#E74C3C" />

<!-- Pie slice / wedge -->
<path d="M 200 200 L 200 100 A 100 100 0 0 1 283 150 Z" fill="#F1C40F" />

<!-- Crescent moon -->
<path d="M 200 50 A 100 100 0 1 1 200 250 A 70 100 0 1 0 200 50 Z"
      fill="#F4D03F" />

<!-- Rounded tab / pill shape -->
<path d="M 50 100 H 150 A 30 30 0 0 1 150 160 H 50 A 30 30 0 0 1 50 100 Z"
      fill="#1ABC9C" />
```

**Tips:**
- For a semicircle: `rx = ry = radius`, `large-arc = 0`, set sweep direction as needed
- For a full circle, you need two arc commands (a single arc can't draw a complete circle)
- Use `x-rotation` when you want a tilted elliptical arc
- Arcs are perfect for pie charts, gauge dials, and rounded UI elements

## Compound Curves: Building Organic Shapes

### Wave Pattern

```xml
<!-- Ocean waves -->
<path d="M 0 150
         C 50 100, 100 100, 150 150
         C 200 200, 250 200, 300 150
         C 350 100, 400 100, 450 150
         C 500 200, 550 200, 600 150
         V 300 H 0 Z"
      fill="#2980B9" opacity="0.7" />

<!-- Layered waves with different phases -->
<path d="M 0 170
         C 60 130, 120 130, 180 170
         C 240 210, 300 210, 360 170
         C 420 130, 480 130, 540 170
         C 600 210, 660 210, 720 170
         V 300 H 0 Z"
      fill="#3498DB" opacity="0.5" />
```

### Petal and Flower Shapes

```xml
<!-- Single petal -->
<path d="M 200 200 C 200 150, 230 100, 200 50 C 170 100, 200 150, 200 200 Z"
      fill="#FF69B4" />

<!-- 5-petal flower using rotation -->
<g transform="translate(200, 200)">
  <path d="M 0 0 C 0 -50, 30 -100, 0 -120 C -30 -100, 0 -50, 0 0 Z"
        fill="#FF69B4" opacity="0.8" />
  <path d="M 0 0 C 0 -50, 30 -100, 0 -120 C -30 -100, 0 -50, 0 0 Z"
        fill="#FF69B4" opacity="0.8" transform="rotate(72)" />
  <path d="M 0 0 C 0 -50, 30 -100, 0 -120 C -30 -100, 0 -50, 0 0 Z"
        fill="#FF69B4" opacity="0.8" transform="rotate(144)" />
  <path d="M 0 0 C 0 -50, 30 -100, 0 -120 C -30 -100, 0 -50, 0 0 Z"
        fill="#FF69B4" opacity="0.8" transform="rotate(216)" />
  <path d="M 0 0 C 0 -50, 30 -100, 0 -120 C -30 -100, 0 -50, 0 0 Z"
        fill="#FF69B4" opacity="0.8" transform="rotate(288)" />
  <!-- Center -->
  <circle r="15" fill="#FFD700" />
</g>
```

### Spiral

```xml
<!-- Approximated spiral using cubic Béziers -->
<path d="M 200 200
         C 200 170, 230 160, 240 180
         C 250 200, 250 230, 220 240
         C 190 250, 160 230, 155 200
         C 150 170, 170 140, 200 130
         C 230 120, 270 140, 280 180
         C 290 220, 270 260, 230 270
         C 190 280, 140 260, 130 220
         C 120 180, 140 130, 190 110"
      fill="none" stroke="#8E44AD" stroke-width="2" />
```

### Cloud Shape

```xml
<!-- Cloud using overlapping arcs -->
<path d="M 100 200
         A 40 40 0 0 1 140 160
         A 50 50 0 0 1 220 140
         A 40 40 0 0 1 280 140
         A 45 45 0 0 1 320 180
         A 30 30 0 0 1 320 220
         H 100 Z"
      fill="white" stroke="#BDC3C7" stroke-width="1" />

<!-- Simpler cloud using circles (alternative approach) -->
<g id="cloud-simple">
  <ellipse cx="200" cy="180" rx="90" ry="40" fill="white" />
  <circle cx="160" cy="160" r="40" fill="white" />
  <circle cx="210" cy="145" r="50" fill="white" />
  <circle cx="255" cy="160" r="35" fill="white" />
</g>
```

### Leaf Shape

```xml
<!-- Simple leaf -->
<path d="M 200 300 Q 150 200, 200 80 Q 250 200, 200 300 Z"
      fill="#27AE60" />
<!-- Leaf with midrib -->
<line x1="200" y1="300" x2="200" y2="80" stroke="#1E8449" stroke-width="1.5" />

<!-- Organic asymmetric leaf -->
<path d="M 200 300
         C 170 250, 130 180, 200 80
         C 260 160, 240 240, 200 300 Z"
      fill="#2ECC71" stroke="#27AE60" stroke-width="1" />
```

### Organic Blob Shape

```xml
<!-- Amoeba-like blob using smooth cubic Béziers -->
<path d="M 200 100
         C 260 80, 320 120, 310 180
         C 300 240, 280 280, 220 290
         S 120 280, 110 220
         S 80 140, 140 110
         S 170 100, 200 100 Z"
      fill="#1ABC9C" opacity="0.7" />
```

## Tips for Working with Curves

### Achieving Smoothness

1. **Tangent continuity:** For smooth joins, make sure the control point handle is collinear with the previous segment's handle
2. **Use S after C:** The `S` command automatically maintains tangent continuity
3. **Use T after Q:** The `T` command automatically reflects the previous Q control point
4. **Symmetric curves:** Place control points at equal distances from endpoints

### Estimating Control Point Positions

- For a **quarter circle** approximation: place control points at `0.5523 * radius` from the endpoint, perpendicular to the radius
- For a **gentle curve**: control points should be about 1/3 of the chord length from the endpoints
- For a **sharp curve**: move control points farther from the chord line
- For **S-curves**: place control points on opposite sides of the chord

### Common Mistakes

- **Forgetting Z:** Unclosed paths may render with fill artifacts — always close shapes with `Z`
- **Control points too far away:** Creates unexpected loops or overshooting curves
- **Mixing absolute/relative:** Be consistent within a segment; uppercase for absolute, lowercase for relative
- **Arc flag confusion:** Remember: large-arc = which of the two arcs, sweep = which direction

### Performance Tip

- Fewer control points = simpler SVG = better performance
- A smooth shape with 4-6 cubic Bézier segments is usually sufficient
- Use `<use>` to reuse curve shapes instead of duplicating path data

## Curve Debugging

When curves don't look right, visualizing the control points and their handles is the fastest way to diagnose issues.

### Visualizing Control Point Positions

Draw the control points as colored circles alongside the curve to see exactly where they are.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300">
  <!-- The actual curve -->
  <path d="M 50 250 C 50 100, 200 50, 250 150 C 300 250, 450 200, 450 100"
        fill="none" stroke="#2C3E50" stroke-width="3" />

  <!-- Start/end points (green) -->
  <circle cx="50" cy="250" r="6" fill="#2ECC71" stroke="white" stroke-width="2" />
  <circle cx="250" cy="150" r="6" fill="#2ECC71" stroke="white" stroke-width="2" />
  <circle cx="450" cy="100" r="6" fill="#2ECC71" stroke="white" stroke-width="2" />

  <!-- Control points (red) with labels -->
  <circle cx="50" cy="100" r="5" fill="#E74C3C" />
  <text x="55" y="95" font-size="10" fill="#E74C3C">cp1</text>
  <circle cx="200" cy="50" r="5" fill="#E74C3C" />
  <text x="205" y="45" font-size="10" fill="#E74C3C">cp2</text>
  <circle cx="300" cy="250" r="5" fill="#3498DB" />
  <text x="305" y="245" font-size="10" fill="#3498DB">cp3</text>
  <circle cx="450" cy="200" r="5" fill="#3498DB" />
  <text x="415" y="215" font-size="10" fill="#3498DB">cp4</text>
</svg>
```

### Drawing Control Point Handles

Connect endpoints to their control points with dashed lines to see the "handles" — this reveals the tangent direction at each point.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300">
  <defs>
    <style>
      .handle { stroke-dasharray: 4 3; stroke-width: 1; }
      .cp { r: 4; stroke: white; stroke-width: 1.5; }
      .anchor { r: 5; stroke: white; stroke-width: 2; }
    </style>
  </defs>

  <!-- The curve -->
  <path d="M 50 200 C 100 50, 200 50, 250 150 S 400 250, 450 100"
        fill="none" stroke="#2C3E50" stroke-width="3" />

  <!-- Segment 1: M 50,200 → C 100,50  200,50  250,150 -->
  <!-- Handle from start point to cp1 -->
  <line x1="50" y1="200" x2="100" y2="50" class="handle" stroke="#E74C3C" />
  <!-- Handle from endpoint to cp2 -->
  <line x1="250" y1="150" x2="200" y2="50" class="handle" stroke="#3498DB" />

  <!-- Segment 2: S 400,250  450,100 (cp1 is reflected from prev cp2) -->
  <!-- Reflected cp1 = (250 + (250-200), 150 + (150-50)) = (300, 250) -->
  <line x1="250" y1="150" x2="300" y2="250" class="handle" stroke="#E74C3C" />
  <line x1="450" y1="100" x2="400" y2="250" class="handle" stroke="#3498DB" />

  <!-- Anchor points -->
  <circle cx="50" cy="200" class="anchor" fill="#2ECC71" />
  <circle cx="250" cy="150" class="anchor" fill="#2ECC71" />
  <circle cx="450" cy="100" class="anchor" fill="#2ECC71" />

  <!-- Control points -->
  <circle cx="100" cy="50" class="cp" fill="#E74C3C" />
  <circle cx="200" cy="50" class="cp" fill="#3498DB" />
  <circle cx="300" cy="250" class="cp" fill="#E74C3C" />
  <circle cx="400" cy="250" class="cp" fill="#3498DB" />
</svg>
```

**Color convention for debugging:**
- **Green** — anchor points (where the curve passes through)
- **Red** — first control points (cp1 — controls departure direction)
- **Blue** — second control points (cp2 — controls arrival direction)
- **Dashed lines** — handle connections from anchor to control point

### Path Bounding Box Visualization

Draw a rectangle around the path's bounding area to check positioning and size.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300">
  <!-- Bounding box (drawn first, behind the path) -->
  <rect x="50" y="50" width="400" height="200"
        fill="none" stroke="#E74C3C" stroke-width="1" stroke-dasharray="6 3" />

  <!-- The curve being debugged -->
  <path d="M 50 200 C 100 50, 200 80, 250 150 C 300 220, 400 100, 450 120"
        fill="none" stroke="#2C3E50" stroke-width="3" />

  <!-- Corner labels for bounding box -->
  <text x="50" y="45" font-size="10" fill="#E74C3C">(50, 50)</text>
  <text x="380" y="265" font-size="10" fill="#E74C3C">(450, 250)</text>

  <!-- Center crosshair -->
  <line x1="245" y1="140" x2="255" y2="140" stroke="#999" stroke-width="1" />
  <line x1="250" y1="135" x2="250" y2="145" stroke="#999" stroke-width="1" />
</svg>
```

**Debugging workflow:**
1. Draw the curve with control point visualizations
2. Identify which control point is causing the issue
3. Adjust that control point's position
4. Remove debug visualization once the curve looks correct

## Path Optimization

### Reducing Node Count

Complex paths with too many nodes are bloated and harder to edit. Focus on using the minimum nodes needed to capture the essential shape.

**Strategy: Anchor points at inflection points only**

Place anchor points only where the curve changes direction. Smooth, flowing sections between inflection points should be handled by control point handles, not extra anchors.

```xml
<!-- Over-detailed circle approximation (too many points) -->
<path d="M 200 100 C 210 100, 220 102, 228 106 C 236 110, 242 116, 248 124
         C 254 132, 258 142, 260 152 C 262 162, 262 172, 260 182
         C 258 192, 254 200, 248 208 C 242 216, 236 222, 228 226
         C 220 230, 210 232, 200 232 C 190 232, 180 230, 172 226
         C 164 222, 158 216, 152 208 C 146 200, 142 192, 140 182
         C 138 172, 138 162, 140 152 C 142 142, 146 132, 152 124
         C 158 116, 164 110, 172 106 C 180 102, 190 100, 200 100 Z"
      fill="none" stroke="#ccc" stroke-width="1" />

<!-- Optimized circle: 4 cubic Bézier segments (standard approach) -->
<path d="M 200 100 C 233 100, 260 127, 260 166
         C 260 199, 233 232, 200 232
         C 167 232, 140 199, 140 166
         C 140 127, 167 100, 200 100 Z"
      fill="none" stroke="#E74C3C" stroke-width="2" />
```

### Smoothing Techniques

When a path looks jagged or has unnecessary kinks:

1. **Remove redundant anchor points** — If three consecutive anchors are nearly collinear, remove the middle one
2. **Extend handles** — Longer handles create smoother curves through anchor points
3. **Align handles** — For smooth joins, the two handles at an anchor should be collinear (180° apart)

```xml
<!-- Jagged path (too many anchors, handles too short) -->
<path d="M 50 200 C 60 180, 70 170, 80 180
         C 90 190, 100 170, 120 160
         C 140 150, 150 140, 170 150
         C 190 160, 200 150, 220 140"
      fill="none" stroke="#ccc" stroke-width="2" stroke-dasharray="4" />

<!-- Smoothed equivalent (fewer anchors, longer handles) -->
<path d="M 50 200 C 80 150, 120 170, 150 150
         C 180 130, 200 150, 220 140"
      fill="none" stroke="#2C3E50" stroke-width="2" />
```

### Minimal Control Points for Key Shapes

Reference patterns using the fewest points possible:

```xml
<!-- Perfect circle: 4 anchors, 4 cubic segments -->
<!-- Magic number: handle length = radius × 0.5523 -->
<path d="M 200 100
         C 233.1 100, 260 126.9, 260 160
         C 260 193.1, 233.1 220, 200 220
         C 166.9 220, 140 193.1, 140 160
         C 140 126.9, 166.9 100, 200 100 Z"
      fill="none" stroke="#3498DB" stroke-width="2" />

<!-- Smooth teardrop: 3 anchors -->
<path d="M 200 50 C 250 100, 260 180, 200 250
         C 140 180, 150 100, 200 50 Z"
      fill="#5DADE2" />

<!-- Egg shape: 4 anchors (wider top, narrower bottom) -->
<path d="M 200 60
         C 255 60, 280 130, 280 180
         C 280 235, 240 280, 200 280
         C 160 280, 120 235, 120 180
         C 120 130, 145 60, 200 60 Z"
      fill="#F5D76E" stroke="#C9A830" stroke-width="1" />

<!-- Smooth S-curve: 2 anchors + start/end -->
<path d="M 50 250 C 50 100, 200 200, 200 100
         C 200 0, 350 100, 350 250"
      fill="none" stroke="#8E44AD" stroke-width="3" />
```

**Rule of thumb:**
- Circle → 4 anchor points
- Oval/egg → 4 anchor points
- Teardrop → 3 anchor points
- S-curve → 4 anchor points
- Wave segment → 2 anchor points (with `S` continuation)
- Heart → 4-5 anchor points

## Advanced Path Techniques

### Calligraphic Variable-Width Strokes

SVG doesn't natively support variable-width strokes, but you can simulate them by drawing the stroke as a filled shape — one side following the path closely, the other side offset.

```xml
<!-- Calligraphic brush stroke: thick-to-thin -->
<path d="M 50 200
         C 80 190, 110 150, 150 140
         C 190 130, 230 140, 270 160
         C 310 180, 350 170, 380 140
         L 385 145
         C 355 175, 315 190, 275 170
         C 235 150, 195 142, 155 150
         C 115 158, 85 195, 55 205 Z"
      fill="#2C3E50" />

<!-- Variable-width stroke using two parallel paths -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
  <!-- Outer edge (wider offset from center) -->
  <path d="M 30 120
           C 80 50, 180 30, 250 80
           C 320 130, 400 100, 470 60
           L 470 70
           C 400 115, 320 145, 250 95
           C 180 50, 80 70, 30 130 Z"
        fill="#8E44AD" />
</svg>

<!-- Brush stroke with varying thickness (thin-thick-thin) -->
<path d="M 50 150
         C 100 150, 120 100, 170 90
         C 220 80, 250 80, 280 90
         C 310 100, 340 130, 380 150
         L 375 160
         C 335 138, 305 108, 275 100
         C 245 92, 215 92, 175 100
         C 135 108, 105 155, 55 158 Z"
      fill="#C0392B" opacity="0.85" />
```

**How to construct variable-width strokes:**
1. Draw the "center line" path of your stroke
2. Create the top edge by offsetting points outward (greater offset = thicker)
3. Create the bottom edge by offsetting points inward
4. Connect both edges into a single closed path
5. The varying offset distance creates the width variation

### Simulating Brush Pressure

```xml
<!-- Pressure-sensitive stroke simulation using overlapping ellipses -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
  <!-- Light initial pressure (thin) -->
  <ellipse cx="60" cy="120" rx="12" ry="3" fill="#2C3E50" transform="rotate(-20, 60, 120)" />
  <ellipse cx="85" cy="110" rx="15" ry="4" fill="#2C3E50" transform="rotate(-15, 85, 110)" />
  <!-- Heavy pressure (thick) -->
  <ellipse cx="115" cy="100" rx="18" ry="6" fill="#2C3E50" transform="rotate(-10, 115, 100)" />
  <ellipse cx="150" cy="92" rx="22" ry="8" fill="#2C3E50" transform="rotate(-5, 150, 92)" />
  <ellipse cx="190" cy="88" rx="25" ry="9" fill="#2C3E50" transform="rotate(0, 190, 88)" />
  <ellipse cx="230" cy="90" rx="22" ry="8" fill="#2C3E50" transform="rotate(5, 230, 90)" />
  <!-- Lifting pressure (thinning) -->
  <ellipse cx="265" cy="95" rx="18" ry="6" fill="#2C3E50" transform="rotate(10, 265, 95)" />
  <ellipse cx="295" cy="105" rx="14" ry="4" fill="#2C3E50" transform="rotate(15, 295, 105)" />
  <ellipse cx="320" cy="115" rx="10" ry="3" fill="#2C3E50" transform="rotate(20, 320, 115)" />
  <ellipse cx="340" cy="125" rx="6" ry="2" fill="#2C3E50" transform="rotate(25, 340, 125)" />
</svg>
```

### Text Outlines via Paths

Convert text concepts into path outlines for full artistic control. Since you can't use actual font-to-path conversion in SVG directly, build letterforms from paths.

```xml
<!-- Hand-crafted "SVG" text as paths (blocky/geometric style) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
  <!-- Letter S -->
  <path d="M 80 60 C 40 60, 30 80, 50 100 C 70 120, 30 140, 50 155
           C 70 170, 100 160, 100 145"
        fill="none" stroke="#E74C3C" stroke-width="8" stroke-linecap="round" />

  <!-- Letter V -->
  <path d="M 140 60 L 180 155 L 220 60"
        fill="none" stroke="#3498DB" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Letter G -->
  <path d="M 310 80 C 310 55, 270 50, 250 65
           C 230 80, 230 130, 250 145
           C 270 160, 310 155, 310 130 H 280"
        fill="none" stroke="#2ECC71" stroke-width="8" stroke-linecap="round" />
</svg>

<!-- Decorative monogram in a circle -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <!-- Circle border -->
  <circle cx="100" cy="100" r="85" fill="none" stroke="#2C3E50" stroke-width="3" />

  <!-- Letter A as a path -->
  <path d="M 70 150 L 100 55 L 130 150 M 80 120 H 120"
        fill="none" stroke="#2C3E50" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
```

**Benefits of path-based text:**
- Full control over every curve and angle
- No font dependency issues
- Can be animated, morphed, and transformed freely
- Works reliably across all SVG renderers
- Can apply variable-width stroke techniques for calligraphic letterforms
