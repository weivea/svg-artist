---
name: character-illustration
description: "Character and figure drawing techniques for SVG. Use when creating human or animal characters, from chibi to semi-realistic styles."
---

# Character Illustration

## Proportion Systems

Characters are defined by their head-to-body ratio. Choose the ratio based on the desired style.

### Chibi (1:1 to 1:2 head:body)

Oversized head, tiny body. Maximum cuteness. Simplified details.

```xml
<!-- Chibi proportions: 1.5 head height body -->
<g id="chibi-character" transform="translate(200, 50)">
  <!-- Head (large, ~40% of total height) -->
  <circle cx="0" cy="40" r="40" fill="#FDBCB4" />
  <!-- Hair -->
  <path d="M -40 35 Q -45 -10, 0 -5 Q 45 -10, 40 35" fill="#4A2C2A" />
  <!-- Eyes (large, round, low on face) -->
  <ellipse cx="-14" cy="45" rx="10" ry="12" fill="white" />
  <ellipse cx="14" cy="45" rx="10" ry="12" fill="white" />
  <circle cx="-12" cy="47" r="6" fill="#2C3E50" />
  <circle cx="16" cy="47" r="6" fill="#2C3E50" />
  <circle cx="-10" cy="45" r="2" fill="white" />
  <circle cx="18" cy="45" r="2" fill="white" />
  <!-- Mouth -->
  <path d="M -5 58 Q 0 63, 5 58" fill="none" stroke="#D4756B" stroke-width="1.5" />
  <!-- Body (small, stubby) -->
  <rect x="-18" y="78" width="36" height="35" rx="5" fill="#3498DB" />
  <!-- Arms (short) -->
  <line x1="-18" y1="85" x2="-30" y2="100" stroke="#FDBCB4" stroke-width="6" stroke-linecap="round" />
  <line x1="18" y1="85" x2="30" y2="100" stroke="#FDBCB4" stroke-width="6" stroke-linecap="round" />
  <!-- Legs (tiny) -->
  <line x1="-8" y1="113" x2="-10" y2="130" stroke="#2C3E50" stroke-width="6" stroke-linecap="round" />
  <line x1="8" y1="113" x2="10" y2="130" stroke="#2C3E50" stroke-width="6" stroke-linecap="round" />
</g>
```

**Chibi rules:**
- Head = 1/3 to 1/2 of total height
- Eyes take up 40-50% of face width, placed at or below center
- No neck, or extremely short neck
- Limbs are stubs — no elbows or knees
- Hands and feet are simplified circles or rounded rectangles

### Cartoon (1:3 to 1:4 head:body)

Expressive, playful proportions. Simplified anatomy.

```xml
<!-- Cartoon proportions: 3 head heights total -->
<g id="cartoon-character" transform="translate(200, 30)">
  <!-- Head -->
  <circle cx="0" cy="35" r="35" fill="#FDBCB4" />
  <!-- Eyes -->
  <ellipse cx="-10" cy="30" rx="7" ry="9" fill="white" />
  <ellipse cx="10" cy="30" rx="7" ry="9" fill="white" />
  <circle cx="-9" cy="32" r="4" fill="#2C3E50" />
  <circle cx="11" cy="32" r="4" fill="#2C3E50" />
  <!-- Nose -->
  <ellipse cx="0" cy="42" rx="3" ry="2" fill="#E8A088" />
  <!-- Mouth -->
  <path d="M -8 50 Q 0 58, 8 50" fill="none" stroke="#333" stroke-width="1.5" />
  <!-- Neck -->
  <rect x="-6" y="68" width="12" height="10" fill="#FDBCB4" />
  <!-- Torso -->
  <path d="M -22 78 L -25 140 L 25 140 L 22 78 Z" fill="#E74C3C" />
  <!-- Arms -->
  <path d="M -22 85 L -40 110 L -35 130" fill="none" stroke="#FDBCB4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 22 85 L 40 110 L 35 130" fill="none" stroke="#FDBCB4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Legs -->
  <line x1="-10" y1="140" x2="-12" y2="195" stroke="#2C3E50" stroke-width="9" stroke-linecap="round" />
  <line x1="10" y1="140" x2="12" y2="195" stroke="#2C3E50" stroke-width="9" stroke-linecap="round" />
  <!-- Feet -->
  <ellipse cx="-14" cy="198" rx="10" ry="5" fill="#333" />
  <ellipse cx="14" cy="198" rx="10" ry="5" fill="#333" />
</g>
```

### Stylized (1:5 to 1:6 head:body)

Graceful proportions, slightly elongated. Good for fashion or elegant characters.

**Key measurements (6-head character, total height 300):**
- Head: 0–50
- Chin to shoulders: 50–75
- Shoulders to waist: 75–150
- Waist to mid-thigh: 150–200
- Mid-thigh to knees: 200–240
- Knees to feet: 240–300

### Realistic (1:7 to 1:8 head:body)

Standard adult proportions. For detailed, anatomically accurate characters.

**Key measurements (8-head character, total height 400):**
- Head: 0–50 (1 head)
- Chin to chest: 50–100 (shoulders at ~75)
- Chest to waist: 100–150 (elbows at ~150)
- Waist to crotch: 150–200 (halfway point)
- Crotch to mid-thigh: 200–250 (wrists at ~225)
- Mid-thigh to knee: 250–300
- Knee to mid-shin: 300–350
- Mid-shin to feet: 350–400

## Facial Expressions

### Expression Building Blocks

Expressions are built from three components: eyes, eyebrows, and mouth.

```xml
<!-- Base face template (reuse for all expressions) -->
<defs>
  <g id="face-base">
    <circle cx="0" cy="0" r="40" fill="#FDBCB4" />
  </g>
</defs>
```

### Happy

```xml
<g id="expr-happy" transform="translate(100, 100)">
  <use href="#face-base" />
  <!-- Eyebrows: slightly raised, relaxed -->
  <path d="M -20 -18 Q -12 -23, -5 -18" fill="none" stroke="#4A2C2A" stroke-width="2" />
  <path d="M 5 -18 Q 12 -23, 20 -18" fill="none" stroke="#4A2C2A" stroke-width="2" />
  <!-- Eyes: curved, happy squint -->
  <path d="M -18 -8 Q -12 -15, -5 -8" fill="none" stroke="#2C3E50" stroke-width="2.5" stroke-linecap="round" />
  <path d="M 5 -8 Q 12 -15, 18 -8" fill="none" stroke="#2C3E50" stroke-width="2.5" stroke-linecap="round" />
  <!-- Mouth: wide smile -->
  <path d="M -12 8 Q 0 22, 12 8" fill="none" stroke="#333" stroke-width="2" />
</g>
```

### Sad

```xml
<g id="expr-sad" transform="translate(200, 100)">
  <use href="#face-base" />
  <!-- Eyebrows: inner corners raised (worry) -->
  <path d="M -20 -15 Q -12 -20, -5 -18" fill="none" stroke="#4A2C2A" stroke-width="2" />
  <path d="M 5 -18 Q 12 -20, 20 -15" fill="none" stroke="#4A2C2A" stroke-width="2" />
  <!-- Eyes: droopy, downward -->
  <ellipse cx="-12" cy="-6" rx="6" ry="7" fill="white" />
  <ellipse cx="12" cy="-6" rx="6" ry="7" fill="white" />
  <circle cx="-12" cy="-4" r="3.5" fill="#2C3E50" />
  <circle cx="12" cy="-4" r="3.5" fill="#2C3E50" />
  <!-- Mouth: downturned -->
  <path d="M -10 14 Q 0 8, 10 14" fill="none" stroke="#333" stroke-width="2" />
</g>
```

### Surprised

```xml
<g id="expr-surprised" transform="translate(300, 100)">
  <use href="#face-base" />
  <!-- Eyebrows: high, arched -->
  <path d="M -20 -22 Q -12 -30, -5 -22" fill="none" stroke="#4A2C2A" stroke-width="2" />
  <path d="M 5 -22 Q 12 -30, 20 -22" fill="none" stroke="#4A2C2A" stroke-width="2" />
  <!-- Eyes: wide open circles -->
  <circle cx="-12" cy="-6" r="8" fill="white" />
  <circle cx="12" cy="-6" r="8" fill="white" />
  <circle cx="-12" cy="-5" r="4" fill="#2C3E50" />
  <circle cx="12" cy="-5" r="4" fill="#2C3E50" />
  <!-- Mouth: open O -->
  <ellipse cx="0" cy="12" rx="7" ry="10" fill="#333" />
</g>
```

### Angry

```xml
<g id="expr-angry" transform="translate(400, 100)">
  <use href="#face-base" />
  <!-- Eyebrows: angled inward, V shape -->
  <path d="M -20 -14 L -5 -20" fill="none" stroke="#4A2C2A" stroke-width="2.5" />
  <path d="M 5 -20 L 20 -14" fill="none" stroke="#4A2C2A" stroke-width="2.5" />
  <!-- Eyes: narrowed, intense -->
  <ellipse cx="-12" cy="-6" rx="6" ry="4" fill="white" />
  <ellipse cx="12" cy="-6" rx="6" ry="4" fill="white" />
  <circle cx="-12" cy="-6" r="3" fill="#2C3E50" />
  <circle cx="12" cy="-6" r="3" fill="#2C3E50" />
  <!-- Mouth: tight line or gritted -->
  <path d="M -10 12 L 10 12" stroke="#333" stroke-width="2.5" stroke-linecap="round" />
</g>
```

### Confused / Worried / Excited / Smug

**Confused:** One eyebrow raised, one lowered. Mouth slightly open to one side.
**Worried:** Eyebrows raised at inner corners (like sad but with wider eyes). Wavy mouth line.
**Excited:** High eyebrows, wide sparkling eyes (add small white circles for sparkles). Big open smile.
**Smug:** One eyebrow raised, half-lidded eyes, asymmetric smirk (one side higher).

## Hand Positions

Hands are one of the hardest parts of character drawing. In SVG, simplify by reducing finger count and detail.

### Open Palm (5 fingers visible)

```xml
<!-- Simplified open hand -->
<g id="hand-open" transform="translate(100, 100)">
  <!-- Palm -->
  <rect x="-12" y="0" width="24" height="20" rx="4" fill="#FDBCB4" />
  <!-- Fingers (simplified as rounded rectangles) -->
  <rect x="-12" y="-18" width="5" height="20" rx="2.5" fill="#FDBCB4" /> <!-- index -->
  <rect x="-5" y="-22" width="5" height="24" rx="2.5" fill="#FDBCB4" /> <!-- middle -->
  <rect x="2" y="-20" width="5" height="22" rx="2.5" fill="#FDBCB4" />  <!-- ring -->
  <rect x="9" y="-15" width="5" height="17" rx="2.5" fill="#FDBCB4" />  <!-- pinky -->
  <!-- Thumb -->
  <rect x="-18" y="-2" width="8" height="14" rx="3" fill="#FDBCB4" transform="rotate(-20, -14, 5)" />
</g>
```

### Fist

```xml
<g id="hand-fist" transform="translate(200, 100)">
  <!-- Fist shape: rounded rectangle -->
  <rect x="-14" y="-8" width="28" height="22" rx="8" fill="#FDBCB4" />
  <!-- Thumb over fingers -->
  <rect x="-16" y="-2" width="10" height="8" rx="4" fill="#F0B4A4" />
  <!-- Finger lines -->
  <line x1="-4" y1="-6" x2="-4" y2="2" stroke="#E8A088" stroke-width="0.5" />
  <line x1="3" y1="-6" x2="3" y2="2" stroke="#E8A088" stroke-width="0.5" />
  <line x1="10" y1="-5" x2="10" y2="1" stroke="#E8A088" stroke-width="0.5" />
</g>
```

### Pointing

```xml
<g id="hand-pointing" transform="translate(300, 100)">
  <!-- Palm (smaller, foreshortened) -->
  <rect x="-10" y="0" width="20" height="16" rx="5" fill="#FDBCB4" />
  <!-- Pointing finger (extended) -->
  <rect x="-3" y="-25" width="6" height="27" rx="3" fill="#FDBCB4" />
  <!-- Curled fingers (rounded bumps) -->
  <ellipse cx="-8" cy="-2" rx="5" ry="4" fill="#F0B4A4" />
  <ellipse cx="8" cy="-2" rx="4" ry="3.5" fill="#F0B4A4" />
  <!-- Thumb -->
  <rect x="-15" y="-5" width="7" height="10" rx="3" fill="#FDBCB4" transform="rotate(-15, -12, 0)" />
</g>
```

### Waving

Use the open palm rotated 15-30° with curved wrist, and optionally add motion lines.

```xml
<g id="hand-wave" transform="translate(400, 100) rotate(-20)">
  <use href="#hand-open" />
  <!-- Motion lines -->
  <path d="M 20 -10 Q 30 -5, 20 5" fill="none" stroke="#999" stroke-width="1" stroke-dasharray="3 2" />
  <path d="M 25 -15 Q 35 -5, 25 10" fill="none" stroke="#999" stroke-width="1" stroke-dasharray="3 2" />
</g>
```

## Body Poses

### Standing (neutral)

Weight evenly distributed. Shoulders level. Hips level.

```xml
<g id="pose-standing" transform="translate(200, 50)">
  <circle cx="0" cy="25" r="25" fill="#FDBCB4" />        <!-- Head -->
  <rect x="-4" y="48" width="8" height="12" fill="#FDBCB4" /> <!-- Neck -->
  <path d="M -20 60 L -25 120 L 25 120 L 20 60 Z" fill="#3498DB" /> <!-- Torso -->
  <!-- Arms hanging naturally -->
  <path d="M -20 65 L -28 95 L -25 125" fill="none" stroke="#FDBCB4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 20 65 L 28 95 L 25 125" fill="none" stroke="#FDBCB4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Legs -->
  <line x1="-10" y1="120" x2="-12" y2="190" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" />
  <line x1="10" y1="120" x2="12" y2="190" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" />
  <!-- Feet -->
  <ellipse cx="-14" cy="193" rx="10" ry="5" fill="#333" />
  <ellipse cx="14" cy="193" rx="10" ry="5" fill="#333" />
</g>
```

### Walking

Weight on front leg. Back leg pushes off. Arms swing opposite to legs (contraposto).

```xml
<g id="pose-walking" transform="translate(200, 50)">
  <circle cx="2" cy="25" r="25" fill="#FDBCB4" />
  <rect x="-2" y="48" width="8" height="12" fill="#FDBCB4" />
  <!-- Torso (slight forward lean) -->
  <path d="M -18 60 L -22 120 L 24 120 L 20 60 Z" fill="#3498DB" />
  <!-- Left arm forward -->
  <path d="M -18 65 L -10 95 L -5 115" fill="none" stroke="#FDBCB4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Right arm back -->
  <path d="M 20 65 L 30 90 L 35 110" fill="none" stroke="#FDBCB4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Front leg (left, bent at knee) -->
  <path d="M -8 120 L -20 155 L -15 190" fill="none" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Back leg (right, extended) -->
  <path d="M 12 120 L 25 160 L 30 190" fill="none" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
</g>
```

### Sitting

Torso upright or slightly reclined. Legs bent at ~90° at knees.

```xml
<g id="pose-sitting" transform="translate(200, 50)">
  <circle cx="0" cy="25" r="25" fill="#FDBCB4" />
  <rect x="-4" y="48" width="8" height="12" fill="#FDBCB4" />
  <path d="M -20 60 L -22 120 L 22 120 L 20 60 Z" fill="#3498DB" />
  <!-- Arms resting on thighs -->
  <path d="M -20 65 L -25 90 L -15 115" fill="none" stroke="#FDBCB4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 20 65 L 25 90 L 15 115" fill="none" stroke="#FDBCB4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Thighs (horizontal) -->
  <line x1="-10" y1="120" x2="-30" y2="122" stroke="#2C3E50" stroke-width="9" stroke-linecap="round" />
  <line x1="10" y1="120" x2="30" y2="122" stroke="#2C3E50" stroke-width="9" stroke-linecap="round" />
  <!-- Lower legs (vertical, hanging down) -->
  <line x1="-30" y1="122" x2="-32" y2="170" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" />
  <line x1="30" y1="122" x2="32" y2="170" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" />
</g>
```

**Center of gravity rule:** The center of gravity (roughly at the navel) must be above the support base (feet when standing, seat when sitting). If it falls outside, the character looks off-balance.

## Hair Styles

### Short Hair

```xml
<!-- Short crop -->
<path d="M -28 20 Q -30 -5, 0 -10 Q 30 -5, 28 20 L 25 10 Q 0 -2, -25 10 Z" fill="#4A2C2A" />
```

### Long Straight Hair

```xml
<!-- Long hair flowing down -->
<path d="M -30 20 Q -35 -5, 0 -12 Q 35 -5, 30 20
         L 35 80 Q 30 90, 25 85 L 20 60
         L 0 20
         L -20 60 L -25 85 Q -30 90, -35 80 Z" fill="#4A2C2A" />
```

### Curly Hair

Build with overlapping circles of varying sizes:

```xml
<g id="curly-hair">
  <!-- Volume circles -->
  <circle cx="-25" cy="-5" r="18" fill="#4A2C2A" />
  <circle cx="0" cy="-15" r="20" fill="#4A2C2A" />
  <circle cx="25" cy="-5" r="18" fill="#4A2C2A" />
  <circle cx="-30" cy="15" r="15" fill="#4A2C2A" />
  <circle cx="30" cy="15" r="15" fill="#4A2C2A" />
  <circle cx="-20" cy="30" r="14" fill="#4A2C2A" />
  <circle cx="20" cy="30" r="14" fill="#4A2C2A" />
</g>
```

### Ponytail

```xml
<g id="ponytail-hair">
  <!-- Top of hair -->
  <path d="M -28 15 Q -30 -10, 0 -12 Q 30 -10, 28 15" fill="#4A2C2A" />
  <!-- Ponytail band position -->
  <rect x="18" y="-5" width="8" height="6" rx="2" fill="#E74C3C" />
  <!-- Ponytail flow -->
  <path d="M 22 -2 C 35 5, 40 25, 30 50 C 25 65, 20 55, 25 40" fill="#4A2C2A" />
</g>
```

**Hair drawing tips:**
- Hair flows FROM the crown (top-center-back of head) OUTWARD
- Use gradient overlays for shine highlights (lighter streak on one side)
- Volume: hair extends 5-15% beyond the head circle
- Wind direction: all strands flow the same direction

## Clothing & Folds

### Fold Types

1. **Tension folds** — radiate from tension points (shoulders, elbows, knees) outward like a starburst
2. **Gravity folds** — hang straight down from unsupported fabric (sleeves, skirt hems)
3. **Compression folds** — zigzag/accordion pattern at joints where fabric bunches (inside elbow, waist)

### T-Shirt Example

```xml
<g id="tshirt">
  <!-- Main body -->
  <path d="M -22 0 L -30 8 L -45 5 L -40 -5 L -25 -10
           Q 0 -15, 25 -10 L 40 -5 L 45 5 L 30 8 L 22 0
           L 25 60 L -25 60 Z" fill="#E74C3C" />
  <!-- Gravity folds at hem -->
  <path d="M -15 50 L -15 60" stroke="#C0392B" stroke-width="0.8" />
  <path d="M 0 48 L 0 60" stroke="#C0392B" stroke-width="0.8" />
  <path d="M 15 50 L 15 60" stroke="#C0392B" stroke-width="0.8" />
  <!-- Tension folds from shoulder -->
  <path d="M -22 0 Q -15 15, -10 25" fill="none" stroke="#C0392B" stroke-width="0.7" />
  <path d="M 22 0 Q 15 15, 10 25" fill="none" stroke="#C0392B" stroke-width="0.7" />
</g>
```

### Skirt / Dress Folds

```xml
<g id="skirt">
  <!-- Skirt shape with drape -->
  <path d="M -20 0 L -35 60 Q -30 62, -20 58 L -15 40 L -5 60 Q 0 63, 5 60
           L 15 40 L 20 58 Q 25 62, 35 60 L 20 0 Z" fill="#9B59B6" />
  <!-- Fold shadows -->
  <path d="M -15 10 L -25 55" stroke="#7D3C98" stroke-width="1" />
  <path d="M 0 5 L -5 58" stroke="#7D3C98" stroke-width="1" />
  <path d="M 15 10 L 25 55" stroke="#7D3C98" stroke-width="1" />
</g>
```

**Fabric rule:** Thin fabrics (silk) have many small folds; thick fabrics (denim, leather) have fewer, broader folds.

## Character Consistency

To draw the same character across multiple views or poses:

### Define a Character Sheet

Create a reference set of key measurements:

```
Character: "Luna"
- Head radius: 25
- Eye size: 6×7 ellipse
- Eye spacing: 24 apart (centers)
- Eye position: 3 units below head center
- Nose: 3×2 ellipse, 10 below center
- Mouth width: 16 units
- Hair color: #4A2C2A
- Skin color: #FDBCB4
- Eye color: #2C3E50
- Signature clothing color: #9B59B6
- Head-to-body ratio: 1:4 (cartoon)
```

### Consistency Checklist

1. **Same head shape** and size in every drawing
2. **Same eye style** (shape, size, color, highlight position)
3. **Same color palette** for skin, hair, eyes, clothing
4. **Same proportions** (head:body ratio) unless deliberately changing style
5. **Signature details** (hairstyle, accessories, clothing color) remain constant

## Stylization Levels

The same character at 5 levels of detail:

### Level 1: Geometric Minimal

Simple geometric shapes. No facial features beyond dots.

```xml
<g id="level-1">
  <circle cx="0" cy="0" r="15" fill="#FDBCB4" />            <!-- Head -->
  <rect x="-10" y="18" width="20" height="30" rx="3" fill="#3498DB" /> <!-- Body -->
  <circle cx="-5" cy="-2" r="1.5" fill="#333" />             <!-- Eye L -->
  <circle cx="5" cy="-2" r="1.5" fill="#333" />              <!-- Eye R -->
</g>
```

### Level 2: Flat

Flat colors, clear shapes, no gradients or shading.

```xml
<g id="level-2">
  <circle cx="0" cy="0" r="20" fill="#FDBCB4" />
  <path d="M -20 -5 Q -22 -18, 0 -22 Q 22 -18, 20 -5" fill="#4A2C2A" />
  <circle cx="-7" cy="0" r="3" fill="white" />
  <circle cx="7" cy="0" r="3" fill="white" />
  <circle cx="-6" cy="0" r="1.5" fill="#333" />
  <circle cx="8" cy="0" r="1.5" fill="#333" />
  <path d="M -4 8 Q 0 12, 4 8" fill="none" stroke="#333" stroke-width="1" />
  <rect x="-5" y="22" width="10" height="8" fill="#FDBCB4" />
  <path d="M -15 30 L -18 65 L 18 65 L 15 30 Z" fill="#3498DB" />
</g>
```

### Level 3: Cartoon

Expressive features, slight shading, defined outlines.

Add to Level 2: eyebrows, expression lines, outlined shapes, hair detail, clothing folds.

### Level 4: Detailed

Gradients for skin/hair, defined musculature, fabric texture, accessories.

Add to Level 3: radial gradient on skin for volume, hair highlights, clothing patterns, accessories (earrings, glasses).

### Level 5: Semi-Realistic

Proportions closer to 1:7, subtle gradients, detailed features, realistic shadows.

**Tips for choosing level:**
- Chibi/cartoon proportions → Levels 1-3
- Stylized proportions → Levels 3-4
- Realistic proportions → Levels 4-5
- Mix and match: realistic proportions with flat coloring (Level 2 style) is a valid choice
