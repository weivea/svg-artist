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
