# Hands & Feet

## 1. Hand Proportions

### 1.1 Realistic Proportions

- Total hand length = face length (chin to hairline)
- Palm: slightly wider than long — roughly square with slight trapezoid taper (narrower at wrist)
- Middle finger = palm length (longest finger)
- Finger segment ratios (from tip): distal 1 : middle 1.3 : proximal 1.6 (approximately 3:4:5)
- Index and ring finger = roughly equal, reach to middle finger's nail base
- Pinky = reaches to last joint of ring finger
- Thumb: 2 segments (not 3), reaches to middle of index finger's proximal segment
- Wrist width = slightly narrower than palm

### 1.2 Stylized Proportions by Art Style

| Style | Fingers | Palm Shape | Detail Level |
|-------|---------|------------|-------------|
| Chibi | nubs or mittens | circle or oval | minimal |
| Cartoon (3-finger) | 3 thick rounded | circle | low |
| Cartoon (4-finger) | 4 rounded cylinders | rounded square | medium |
| Anime | 4 slender, tapered | elongated rect | medium-high |
| Semi-realistic | 5 with joints visible | anatomical trapezoid | high |
| Realistic | 5 with tendons, veins | full anatomical | very high |

**Rule of thumb:** match hand detail to the overall character style.

## 2. Hand Construction Methods

### 2.1 Mitten Method (Simplest)

Best for: chibi, very small icons, distant characters. Palm as oval, thumb as smaller oval, fingers as single merged blob.

```xml
<!-- Mitten hand — simplest construction -->
<g id="hand-mitten">
  <ellipse cx="50" cy="65" rx="18" ry="22" fill="#FDBCB4"/>
  <ellipse cx="30" cy="60" rx="8" ry="12" fill="#FDBCB4"
           transform="rotate(-20, 30, 60)"/>
  <ellipse cx="50" cy="40" rx="16" ry="14" fill="#FDBCB4"/>
</g>

<!-- Mitten with finger-bump hints -->
<g id="hand-mitten-hints">
  <ellipse cx="50" cy="65" rx="18" ry="22" fill="#FDBCB4"/>
  <ellipse cx="30" cy="60" rx="8" ry="12" fill="#FDBCB4"
           transform="rotate(-20, 30, 60)"/>
  <path d="M 34 42 Q 38 34, 42 40 Q 46 34, 50 40
           Q 54 34, 58 40 Q 62 34, 66 42" fill="#FDBCB4"/>
</g>
```

### 2.2 Block Method (Intermediate)

Best for: stylized characters, animation-style. Each finger = 3 rounded rectangles, thumb = 2.

```xml
<!-- Block hand — open palm facing viewer -->
<g id="hand-block" transform="translate(100, 50)">
  <rect x="-20" y="0" width="40" height="45" rx="5" fill="#FDBCB4"/>
  <!-- Index (3 segments) -->
  <rect x="-18" y="-35" width="10" height="15" rx="3" fill="#FDBCB4"/>
  <rect x="-17" y="-50" width="9" height="17" rx="3" fill="#FDBCB4"/>
  <rect x="-16" y="-60" width="8" height="12" rx="4" fill="#FDBCB4"/>
  <!-- Middle (tallest) -->
  <rect x="-6" y="-40" width="10" height="17" rx="3" fill="#FDBCB4"/>
  <rect x="-5" y="-56" width="9" height="18" rx="3" fill="#FDBCB4"/>
  <rect x="-4" y="-68" width="8" height="14" rx="4" fill="#FDBCB4"/>
  <!-- Ring -->
  <rect x="6" y="-37" width="10" height="16" rx="3" fill="#FDBCB4"/>
  <rect x="7" y="-52" width="9" height="17" rx="3" fill="#FDBCB4"/>
  <rect x="8" y="-62" width="8" height="12" rx="4" fill="#FDBCB4"/>
  <!-- Pinky (shortest) -->
  <rect x="16" y="-30" width="8" height="13" rx="3" fill="#FDBCB4"/>
  <rect x="17" y="-42" width="7" height="14" rx="3" fill="#FDBCB4"/>
  <rect x="18" y="-50" width="6" height="10" rx="3" fill="#FDBCB4"/>
  <!-- Thumb (2 segments, angled) -->
  <g transform="rotate(-30, -20, 20)">
    <rect x="-35" y="5" width="12" height="18" rx="4" fill="#FDBCB4"/>
    <rect x="-34" y="-10" width="10" height="17" rx="5" fill="#FDBCB4"/>
  </g>
</g>
```

### 2.3 Curve Method (Advanced)

Best for: semi-realistic to realistic, large-scale. Entire hand as `<path>` with Bezier curves.

- Finger sides: nearly parallel with slight taper; fingertips: small arc (180 degrees)
- Knuckle joints: subtle inward bumps; use `Q` for simple curves, `C` for S-curves

```xml
<!-- Curve-method hand outline with separate thumb -->
<g id="hand-curves">
  <path d="M 50 110 Q 35 108, 30 95 L 28 70
    Q 26 60, 22 48 Q 20 40, 22 35 Q 25 30, 27 35 Q 29 42, 30 50 L 30 58
    Q 30 52, 28 40 Q 26 28, 28 22 Q 30 16, 33 22 Q 36 32, 35 45 L 35 55
    Q 35 48, 34 35 Q 33 20, 34 12 Q 36 6, 39 12 Q 42 24, 40 42 L 40 55
    Q 40 48, 40 35 Q 39 22, 41 16 Q 43 10, 46 16 Q 48 26, 46 42 L 45 55
    Q 45 50, 46 40 Q 47 32, 49 28 Q 51 24, 53 28 Q 54 34, 52 45 L 50 58
    Q 55 65, 58 78 Q 62 90, 60 100 Q 58 108, 50 110 Z"
    fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
  <path d="M 28 70 Q 22 72, 16 68 Q 10 62, 12 55
    Q 14 48, 20 50 Q 24 52, 26 58 L 28 65"
    fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
</g>
```

## 3. Common Hand Poses

### 3.1 Open Palm (Facing Viewer)

All fingers extended, slightly spread. Thumb at ~45 degrees. Palm lines: 3 curves (heart, head, life).

```xml
<g id="hand-open-palm" transform="translate(50, 20)">
  <path d="M -18 45 L -20 0 Q -18 -5, -10 -5 L 10 -5
           Q 18 -5, 20 0 L 18 45 Q 0 50, -18 45 Z"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
  <!-- Fingers (curve method) -->
  <path d="M -15 -5 Q -16 -30, -14 -40 Q -12 -45, -10 -40 Q -8 -30, -9 -5"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <path d="M -6 -5 Q -7 -38, -5 -50 Q -3 -55, -1 -50 Q 1 -38, 0 -5"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <path d="M 3 -5 Q 2 -35, 4 -46 Q 6 -51, 8 -46 Q 10 -35, 9 -5"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <path d="M 12 -5 Q 13 -25, 14 -33 Q 15 -37, 17 -33 Q 18 -25, 17 -5"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <!-- Thumb -->
  <path d="M -18 35 Q -30 28, -35 18 Q -38 10, -33 8
           Q -28 6, -26 14 Q -24 22, -20 30"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <!-- Palm lines -->
  <path d="M -14 15 Q -5 8, 10 12" fill="none" stroke="#DEAA96" stroke-width="0.5"/>
  <path d="M -16 25 Q -2 18, 14 22" fill="none" stroke="#DEAA96" stroke-width="0.5"/>
  <path d="M -10 40 Q -12 20, -14 10" fill="none" stroke="#DEAA96" stroke-width="0.5"/>
</g>
```

### 3.2 Fist

Palm foreshortened. Thumb wraps OVER fingers (front layer). 4 knuckle bumps across top.

```xml
<g id="hand-fist" transform="translate(50, 30)">
  <rect x="-22" y="-5" width="44" height="40" rx="10" fill="#FDBCB4"
        stroke="#E8A088" stroke-width="0.5"/>
  <!-- Knuckle bumps -->
  <circle cx="-12" cy="-3" r="5" fill="#F5C2B2"/>
  <circle cx="-1" cy="-5" r="5.5" fill="#F5C2B2"/>
  <circle cx="10" cy="-3" r="5" fill="#F5C2B2"/>
  <circle cx="19" cy="0" r="4.5" fill="#F5C2B2"/>
  <!-- Curled finger creases -->
  <path d="M -18 10 Q -12 8, -6 10" fill="none" stroke="#DEAA96" stroke-width="0.5"/>
  <path d="M -6 9 Q 0 7, 6 9" fill="none" stroke="#DEAA96" stroke-width="0.5"/>
  <path d="M 6 10 Q 12 8, 18 10" fill="none" stroke="#DEAA96" stroke-width="0.5"/>
  <!-- Thumb wrapping over (FRONT layer) -->
  <path d="M -22 30 Q -28 22, -26 12 Q -24 5, -18 8
           L -10 14 Q -8 18, -12 22 Q -18 28, -22 30 Z"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
</g>
```

### 3.3 Pointing

Index extended, other fingers curled. Thumb rests on side.

```xml
<g id="hand-pointing" transform="translate(50, 80)">
  <path d="M -15 0 Q -18 -10, -12 -15 L 12 -15
           Q 18 -10, 15 0 L 15 20 Q 0 25, -15 20 Z"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
  <rect x="-6" y="-55" width="10" height="42" rx="4"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.4"/>
  <ellipse cx="-1" cy="-55" rx="5" ry="3" fill="#FDBCB4"
           stroke="#E8A088" stroke-width="0.4"/>
  <path d="M -15 15 Q -25 10, -28 0 Q -30 -8, -24 -8
           Q -18 -8, -16 -2 L -15 8"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.4"/>
</g>
```

### 3.4 Holding / Gripping

Fingers curve to follow object surface. Thumb opposes on other side. Gaps = loose; tight contact = firm. Layer order matters for occlusion.

```xml
<g id="hand-gripping" transform="translate(50, 30)">
  <!-- Object being held -->
  <rect x="-12" y="-30" width="24" height="60" rx="4"
        fill="#8B7355" stroke="#6B5335" stroke-width="0.5"/>
  <!-- Fingers wrapping around (behind object) -->
  <path d="M -12 -10 Q -20 -8, -22 0 Q -24 8, -20 12 L -12 10"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <path d="M -12 2 Q -22 4, -24 12 Q -26 20, -22 24 L -12 22"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <path d="M -12 14 Q -20 16, -22 24 Q -24 30, -20 34 L -12 32"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <!-- Thumb on opposite side (front layer) -->
  <path d="M 12 5 Q 20 2, 24 8 Q 26 14, 22 18 L 12 15"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
</g>
```

### 3.5 Peace Sign / Victory

Index and middle in V (~30-45 degrees). Ring and pinky curled. Thumb tucked.

```xml
<g id="hand-peace" transform="translate(50, 80)">
  <path d="M -15 0 L -15 25 Q 0 30, 15 25 L 15 0
           Q 12 -5, 8 -2 L -8 -2 Q -12 -5, -15 0 Z"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
  <rect x="-14" y="-45" width="9" height="45" rx="4" fill="#FDBCB4"
        stroke="#E8A088" stroke-width="0.4" transform="rotate(15, -10, 0)"/>
  <rect x="5" y="-48" width="9" height="48" rx="4" fill="#FDBCB4"
        stroke="#E8A088" stroke-width="0.4" transform="rotate(-15, 10, 0)"/>
  <ellipse cx="-18" cy="12" rx="6" ry="8" fill="#FDBCB4"
           stroke="#E8A088" stroke-width="0.4"/>
</g>
```

### 3.6 Waving

Open hand tilted ~15-20 degrees. Motion lines suggest movement.

### 3.7 Thumbs Up

Fist with thumb extended upward. Thumbnail visible on front face.

```xml
<g id="hand-thumbs-up" transform="translate(50, 60)">
  <rect x="-15" y="-5" width="30" height="32" rx="8" fill="#FDBCB4"
        stroke="#E8A088" stroke-width="0.5"/>
  <path d="M -10 5 Q -5 3, 0 5" fill="none" stroke="#DEAA96" stroke-width="0.4"/>
  <path d="M -10 13 Q -5 11, 0 13" fill="none" stroke="#DEAA96" stroke-width="0.4"/>
  <path d="M -10 21 Q -5 19, 0 21" fill="none" stroke="#DEAA96" stroke-width="0.4"/>
  <rect x="-8" y="-38" width="14" height="35" rx="6" fill="#FDBCB4"
        stroke="#E8A088" stroke-width="0.5"/>
  <rect x="-4" y="-36" width="8" height="6" rx="2" fill="#F5D5CB"
        stroke="#DEAA96" stroke-width="0.3"/>
</g>
```

### 3.8 OK Sign

Thumb + index form circle. Other 3 fingers extended and fanned.

## 4. Hand Tips for SVG

### 4.1 Simplification Rules

- **Under 50px:** use mitten or 3-finger — individual fingers indistinguishable
- **50-150px:** block method with 4-5 fingers — distinct but no joint details
- **150px+:** curve method with joint details, nail hints, palm lines
- **ALWAYS** check in context — a hand doesn't need detail if the character is small

### 4.2 Common Mistakes

1. **Fingers all same length** — middle is longest, pinky shortest
2. **Thumb on wrong side** — check left vs right hand!
3. **Thumb too thin or too long** — thumb is thick, stubby, 2 segments only
4. **Fingers too straight** — natural rest = slight inward curl
5. **Wrist same width as palm** — wrist is always narrower
6. **Sausage fingers** — fingers taper toward tips, not uniform cylinders
7. **All fingers same thickness** — pinky thinnest, thumb thickest
8. **Flat palm** — palm has natural curve/cup shape

### 4.3 Foreshortening

- **Pointing at viewer:** fingers = short circles/ovals, nails visible, length compressed
- **Side view:** only thumb or pinky side visible; 4 fingers overlap/stack
- **Dramatic perspective:** palm shrinks, nearest finger dominates

```xml
<!-- Foreshortened hand — pointing at viewer -->
<g id="hand-foreshortened">
  <ellipse cx="50" cy="60" rx="22" ry="12" fill="#FDBCB4"
           stroke="#E8A088" stroke-width="0.4"/>
  <ellipse cx="38" cy="50" rx="5" ry="4" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <ellipse cx="47" cy="47" rx="5" ry="4" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <ellipse cx="56" cy="48" rx="5" ry="4" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <ellipse cx="63" cy="52" rx="4" ry="3.5" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <ellipse cx="38" cy="48" rx="3" ry="2" fill="#F5D5CB"/>
  <ellipse cx="47" cy="45" rx="3" ry="2" fill="#F5D5CB"/>
  <ellipse cx="56" cy="46" rx="3" ry="2" fill="#F5D5CB"/>
</g>
```

### 4.4 Nail Details (When Visible)

- Rounded rectangle on distal segment; width ~60% of fingertip; length ~40% of distal segment. Pink/nude color lighter than skin; cuticle = subtle arc at base

```xml
<g id="fingertip-detail">
  <rect x="0" y="0" width="12" height="16" rx="5" fill="#FDBCB4"/>
  <rect x="2" y="1" width="8" height="9" rx="3" fill="#F5D5CB"
        stroke="#E8C4B8" stroke-width="0.3"/>
  <path d="M 3 10 Q 6 12, 9 10" fill="none" stroke="#DEAA96" stroke-width="0.3"/>
  <rect x="4" y="2" width="3" height="4" rx="1.5" fill="#FFF" opacity="0.3"/>
</g>
```

## 5. Foot Anatomy

### 5.1 Proportions

- Foot length = approximately forearm length (elbow to wrist)
- Foot length ≈ 1 head height (realistic proportions)
- Widest point: ball of foot (at base of toes)
- Big toe: largest, 2 segments (like thumb)
- Other toes: 3 segments each, progressively shorter toward pinky
- Arch: inner side curves UP from heel, outer side relatively flat
- Heel: rounded, roughly circular from behind

### 5.2 Views

#### Top View (Dorsal)

Wedge/fan shape — wider at toes, narrower at heel. 5 toe bumps, big toe largest.

```xml
<g id="foot-top-view" transform="translate(50, 20)">
  <path d="M -5 80 Q -12 70, -18 40 Q -20 20, -16 5
           Q -12 -2, -4 -5 L 6 -5 Q 16 -2, 20 10
           Q 22 30, 18 50 Q 14 70, 8 80 Z"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
  <!-- Toes (big to pinky) -->
  <ellipse cx="-10" cy="-8" rx="6" ry="5" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <ellipse cx="-1" cy="-10" rx="4.5" ry="4" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <ellipse cx="7" cy="-9" rx="4" ry="3.5" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <ellipse cx="13" cy="-6" rx="3.5" ry="3" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <ellipse cx="18" cy="-2" rx="3" ry="2.5" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <!-- Toenails -->
  <ellipse cx="-10" cy="-10" rx="3.5" ry="2.5" fill="#F5D5CB"/>
  <!-- Ankle bumps (inner higher than outer) -->
  <circle cx="-8" cy="60" r="4" fill="#F0B8A8" opacity="0.5"/>
  <circle cx="12" cy="64" r="3.5" fill="#F0B8A8" opacity="0.5"/>
</g>
```

#### Side View (Inner)

Shows the arch — defining feature of inner foot profile. Ankle bone bump on inner side sits higher.

```xml
<g id="foot-side-inner" transform="translate(10, 40)">
  <path d="M 5 50 Q 0 45, 0 35 Q 2 20, 15 12 Q 25 6, 40 3
           Q 55 0, 70 2 Q 80 4, 85 8 L 88 15
           Q 90 25, 88 35 Q 86 42, 80 48 L 70 50
           Q 55 52, 40 50 Q 20 55, 5 50 Z"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
  <path d="M 15 50 Q 30 38, 55 48" fill="none" stroke="#DEAA96"
        stroke-width="0.4" stroke-dasharray="2,1"/>
  <circle cx="18" cy="18" r="5" fill="#F0B8A8" opacity="0.4"/>
  <ellipse cx="86" cy="12" rx="4" ry="5" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.3"/>
  <line x1="0" y1="52" x2="95" y2="52" stroke="#CCC" stroke-width="0.3"/>
</g>
```

#### Side View (Outer)

Flatter than inner side. Toes cascade in height. Outer anklebone slightly lower than inner. Sole nearly flat on outer edge.

#### Bottom View (Plantar)

Heel pad (large oval), ball pad (wide), arch area (doesn't bear weight), toe pads (small circles).

```xml
<g id="foot-bottom-view" transform="translate(30, 10)">
  <path d="M 10 90 Q 5 80, 3 60 Q 0 40, 5 20 Q 10 5, 20 0 L 30 0
           Q 42 5, 45 15 Q 48 30, 45 55 Q 42 75, 38 90 Q 25 95, 10 90 Z"
        fill="#F0B8A8" stroke="#E8A088" stroke-width="0.5"/>
  <ellipse cx="22" cy="82" rx="14" ry="10" fill="#E8A088" opacity="0.4"/>
  <ellipse cx="22" cy="15" rx="18" ry="8" fill="#E8A088" opacity="0.4"/>
  <path d="M 8 30 Q 5 50, 10 68 Q 18 55, 22 40 Q 18 30, 8 30 Z"
        fill="#FDBCB4" opacity="0.5"/>
  <circle cx="8" cy="4" r="4" fill="#E8A088" opacity="0.3"/>
  <circle cx="16" cy="1" r="3.5" fill="#E8A088" opacity="0.3"/>
  <circle cx="24" cy="0" r="3" fill="#E8A088" opacity="0.3"/>
  <circle cx="31" cy="2" r="2.5" fill="#E8A088" opacity="0.3"/>
  <circle cx="37" cy="5" r="2" fill="#E8A088" opacity="0.3"/>
</g>
```

### 5.3 Stylized Feet

- **Chibi:** tiny triangles or rounded nubs, no toe detail
- **Cartoon:** simplified wedge, 3-4 toe bumps max
- **Anime:** defined arch, slender, toes suggested not detailed
- **Realistic:** full toe articulation, visible tendons, ankle definition

```xml
<!-- Chibi foot — minimal -->
<ellipse cx="15" cy="10" rx="12" ry="7" fill="#FDBCB4"/>

<!-- Cartoon foot — wedge with bumps -->
<g id="foot-cartoon">
  <path d="M 5 25 Q 0 15, 5 5 Q 12 0, 25 0 Q 35 2, 38 10 L 35 25 Z"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
  <circle cx="10" cy="2" r="4" fill="#FDBCB4"/>
  <circle cx="20" cy="0" r="4" fill="#FDBCB4"/>
  <circle cx="29" cy="2" r="3.5" fill="#FDBCB4"/>
</g>

<!-- Anime foot — slender arch -->
<g id="foot-anime">
  <path d="M 5 30 Q 0 20, 3 10 Q 8 2, 18 0 Q 30 0, 38 5
           Q 42 12, 40 25 L 35 30 Z"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.4"/>
  <ellipse cx="14" cy="0" rx="4" ry="3" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.2"/>
  <ellipse cx="22" cy="-1" rx="3.5" ry="2.5" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.2"/>
  <ellipse cx="29" cy="0" rx="3" ry="2.2" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.2"/>
</g>
```

## 6. Shoe Construction

### 6.1 Sneaker / Athletic Shoe

Layered construction: outsole, midsole (cushion, white), upper (main color), toe cap, laces, heel tab.

```xml
<g id="sneaker" transform="translate(5, 5)">
  <path d="M 10 100 Q 5 95, 10 90 L 80 90 Q 90 92, 85 100 Z" fill="#333"/>
  <path d="M 12 90 L 82 90 Q 88 88, 83 85 L 15 85 Q 8 88, 12 90"
        fill="white" stroke="#DDD" stroke-width="0.3"/>
  <path d="M 15 85 Q 10 50, 35 40 L 55 38 Q 75 42, 83 85 Z" fill="#E74C3C"/>
  <path d="M 15 85 Q 10 60, 30 50 L 40 50 Q 35 70, 30 85 Z" fill="#C0392B"/>
  <line x1="35" y1="48" x2="55" y2="45" stroke="white" stroke-width="1.5"/>
  <line x1="33" y1="55" x2="53" y2="52" stroke="white" stroke-width="1.5"/>
  <line x1="31" y1="62" x2="51" y2="59" stroke="white" stroke-width="1.5"/>
  <rect x="75" y="40" width="8" height="12" rx="2" fill="#C0392B"/>
  <path d="M 25 70 Q 45 55, 70 65" fill="none" stroke="white"
        stroke-width="2" stroke-linecap="round"/>
</g>
```

### 6.2 Boot

Higher ankle coverage. Shaft above ankle, thicker sole with heel block. Key parts: sole, tall upper, toe cap, lace hooks (circles), pull tab.

### 6.3 High Heel

Sole angles from high heel to low toe. Heights: kitten 1-2", standard 3-4", stiletto 4-6".

```xml
<g id="high-heel" transform="translate(10, 10)">
  <path d="M 10 60 Q 5 58, 5 55 L 20 20 Q 22 15, 30 14
           L 75 14 Q 82 16, 80 22 L 78 30 Q 76 35, 70 38 L 15 60 Z"
        fill="#2C2C2C"/>
  <path d="M 10 55 Q 15 40, 28 22 L 45 18 Q 55 16, 60 20
           L 55 35 Q 40 42, 10 55 Z"
        fill="#E74C3C" stroke="#C0392B" stroke-width="0.5"/>
  <path d="M 5 55 Q 3 52, 8 50 L 15 48 Q 12 53, 10 56 Z" fill="#E74C3C"/>
  <path d="M 72 22 L 78 18 L 80 55 Q 80 60, 76 60
           L 74 60 Q 72 58, 73 55 Z" fill="#2C2C2C"/>
  <rect x="73" y="58" width="5" height="3" rx="1" fill="#1A1A1A"/>
</g>
```

### 6.4 Sandal / Flat

Minimal upper: 1-3 straps across foot. Thin flat sole. Toes visible underneath.

### 6.5 Formal Shoe / Oxford

Smooth upper, low heel, cap toe with stitching. Brogue perforations (tiny circles).

```xml
<g id="oxford-shoe" transform="translate(5, 10)">
  <path d="M 8 80 L 80 80 Q 85 78, 84 75 L 12 75 Q 6 78, 8 80 Z" fill="#1A1A1A"/>
  <rect x="70" y="70" width="14" height="10" rx="2" fill="#1A1A1A"/>
  <path d="M 12 75 Q 8 55, 15 40 Q 22 30, 40 28 L 60 28
           Q 72 30, 76 40 Q 80 55, 82 75 Z"
        fill="#2C1810" stroke="#1A0E08" stroke-width="0.5"/>
  <path d="M 12 75 Q 10 55, 20 42 L 30 42 Q 25 58, 22 75" fill="#241510"/>
  <circle cx="20" cy="44" r="0.8" fill="#3A2518"/>
  <circle cx="23" cy="42" r="0.8" fill="#3A2518"/>
  <circle cx="26" cy="41" r="0.8" fill="#3A2518"/>
  <line x1="38" y1="38" x2="50" y2="35" stroke="#1A0E08" stroke-width="0.5"/>
  <line x1="37" y1="42" x2="49" y2="39" stroke="#1A0E08" stroke-width="0.5"/>
</g>
```

## 7. Age-Based Variations

### 7.1 Baby / Infant Hands

- Very short, chubby fingers with dimples at joints
- Palm wider relative to fingers than adult
- Fingers all roughly same length
- Fingertips very rounded, almost spherical

```xml
<g id="hand-baby" transform="translate(40, 30)">
  <ellipse cx="0" cy="10" rx="18" ry="16" fill="#FDBCB4"/>
  <ellipse cx="-12" cy="-8" rx="4.5" ry="7" fill="#FDBCB4"/>
  <ellipse cx="-4" cy="-10" rx="4.5" ry="8" fill="#FDBCB4"/>
  <ellipse cx="4" cy="-10" rx="4.5" ry="8" fill="#FDBCB4"/>
  <ellipse cx="12" cy="-8" rx="4" ry="7" fill="#FDBCB4"/>
  <ellipse cx="-20" cy="5" rx="5" ry="7" fill="#FDBCB4"
           transform="rotate(-25, -20, 5)"/>
  <!-- Knuckle dimples -->
  <circle cx="-12" cy="-1" r="1" fill="#DEAA96" opacity="0.5"/>
  <circle cx="-4" cy="-2" r="1" fill="#DEAA96" opacity="0.5"/>
  <circle cx="4" cy="-2" r="1" fill="#DEAA96" opacity="0.5"/>
  <circle cx="12" cy="-1" r="1" fill="#DEAA96" opacity="0.5"/>
  <path d="M -10 24 Q 0 28, 10 24" fill="none" stroke="#DEAA96" stroke-width="0.5"/>
</g>
```

### 7.2 Child Hands

Smaller, chubbier than adult but fingers more distinct than baby. Shorter fingers relative to palm. Smooth joint transitions, no visible tendons.

### 7.3 Elderly Hands

Visible tendons/veins (thin lines on hand back). Bony joints, enlarged knuckles. Slight finger curl at rest. More wrinkle lines; age spots (small darker circles).

```xml
<g id="hand-elderly" transform="translate(50, 30)">
  <path d="M -16 45 L -18 5 Q -15 -3, -8 -3 L 8 -3
           Q 15 -3, 18 5 L 16 45 Q 0 50, -16 45 Z"
        fill="#EBCAB4" stroke="#D4A890" stroke-width="0.5"/>
  <!-- Bonier fingers with natural curl -->
  <path d="M -12 -3 Q -14 -25, -13 -32 Q -12 -38, -10 -36
           Q -8 -30, -8 -25 Q -7 -15, -8 -3"
        fill="#EBCAB4" stroke="#D4A890" stroke-width="0.3"/>
  <path d="M -3 -3 Q -5 -32, -4 -42 Q -3 -48, -1 -45
           Q 1 -38, 1 -30 Q 2 -15, 1 -3"
        fill="#EBCAB4" stroke="#D4A890" stroke-width="0.3"/>
  <!-- Tendons, vein, knuckles, wrinkles, age spots -->
  <line x1="-10" y1="40" x2="-12" y2="5" stroke="#D4A890" stroke-width="0.4" opacity="0.5"/>
  <line x1="-2" y1="38" x2="-3" y2="3" stroke="#D4A890" stroke-width="0.4" opacity="0.5"/>
  <path d="M -5 42 Q -8 35, -4 28 Q 0 22, -3 15"
        fill="none" stroke="#8CA8C0" stroke-width="0.5" opacity="0.4"/>
  <circle cx="-11" cy="-1" r="2.5" fill="#DDB8A0" opacity="0.5"/>
  <circle cx="-3" cy="-2" r="2.5" fill="#DDB8A0" opacity="0.5"/>
  <path d="M -14 -15 L -8 -15" stroke="#D4A890" stroke-width="0.3"/>
  <circle cx="2" cy="25" r="1.5" fill="#C8956A" opacity="0.3"/>
</g>
```

## Related References
- `character-illustration.md` — Full body proportions and pose construction
- `bezier-and-curves.md` — Curve techniques for finger and toe shapes
- `facial-details.md` — Anatomy proportions for consistent character detail level
- `texture-details.md` — Skin texture, nail rendering, material behavior for shoes
