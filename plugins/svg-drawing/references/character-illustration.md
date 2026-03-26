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

---

## Age-Based Proportion Variations

Head-to-body ratios change dramatically across a character's lifespan. Mastering these is essential for drawing characters at different ages.

| Age | Head:Body | Key Features |
|-----|-----------|-------------|
| Infant (0-1) | 1:3 | Head = 1/4 total height. Huge cranium, tiny face. No neck. Limbs short and pudgy. Belly protrudes. |
| Toddler (1-3) | 1:4 | Forehead still dominant. Arms reach mid-thigh. Legs bowed. Round belly. |
| Child (4-8) | 1:5 | Midpoint at navel. Slim limbs, small shoulders. Wide-set eyes. |
| Pre-teen (9-12) | 1:6 | Limbs lengthen. Hands/feet grow ahead of body. Less round face. |
| Teen (13-17) | 1:6.5 | Near-adult proportions but narrower shoulders/hips. Lankier limbs. |
| Adult | 1:7 to 1:8 | Midpoint at pubic bone. Shoulders ~2-3 head-widths. Elbows at waist. |
| Elderly (65+) | 1:6.5 | Slight height loss. Shoulders curve inward. Head tilts forward. Thinner limbs. |

### Infant Proportions Detail

```xml
<!-- Infant figure: 1:3 ratio, total height ~120 -->
<g id="infant" transform="translate(200, 30)">
  <!-- Head: 1/4 of total height = 30 radius -->
  <circle cx="0" cy="30" r="30" fill="#FDBCB4" />
  <!-- Face features placed LOW: eyes at center, not above -->
  <circle cx="-8" cy="33" r="4" fill="#2C3E50" />
  <circle cx="8" cy="33" r="4" fill="#2C3E50" />
  <ellipse cx="0" cy="42" rx="5" ry="3" fill="#E8A088" opacity="0.6" />
  <!-- NO neck — head sits directly on body -->
  <!-- Torso: round, soft -->
  <ellipse cx="0" cy="78" rx="18" ry="20" fill="#87CEEB" />
  <!-- Arms: short, chubby, barely reach hip -->
  <path d="M -18 70 Q -28 80, -22 95" stroke="#FDBCB4" stroke-width="8" stroke-linecap="round" fill="none" />
  <path d="M 18 70 Q 28 80, 22 95" stroke="#FDBCB4" stroke-width="8" stroke-linecap="round" fill="none" />
  <!-- Legs: short, bowed outward -->
  <path d="M -8 96 Q -15 110, -10 120" stroke="#FDBCB4" stroke-width="8" stroke-linecap="round" fill="none" />
  <path d="M 8 96 Q 15 110, 10 120" stroke="#FDBCB4" stroke-width="8" stroke-linecap="round" fill="none" />
</g>
```

**Aging rules for SVG characters:**
- **Infant→Child:** Face grows into cranium (eyes move from 60% down to 50%). Limbs lengthen proportionally.
- **Child→Teen:** Legs become longest segment. Shoulders widen (male) or hips widen (female).
- **Adult→Elderly:** Spine compresses (shorter torso). Shoulders round forward. Jawline softens.

### Child vs Adult Eye Placement

```xml
<!-- Child: eyes at ~55% down the head circle -->
<g id="child-face">
  <circle cx="0" cy="0" r="30" fill="#FDBCB4" />
  <circle cx="-9" cy="5" r="5" fill="#2C3E50" />   <!-- 55% -->
  <circle cx="9" cy="5" r="5" fill="#2C3E50" />
</g>

<!-- Adult: eyes at ~45% down the head circle -->
<g id="adult-face" transform="translate(80, 0)">
  <ellipse cx="0" cy="0" rx="25" ry="30" fill="#FDBCB4" />
  <circle cx="-8" cy="-3" r="4" fill="#2C3E50" />  <!-- 45% -->
  <circle cx="8" cy="-3" r="4" fill="#2C3E50" />
</g>
```

## Body Type Diversity

Three foundational somatotypes create a wide range of characters. These are starting points — real bodies blend these types.

### Ectomorph (Lean/Slender)

Narrow frame, long limbs, minimal body fat. Think runners, dancers, scholars.

```xml
<g id="ectomorph" transform="translate(100, 30)">
  <circle cx="0" cy="20" r="20" fill="#FDBCB4" />
  <rect x="-3" y="38" width="6" height="10" fill="#FDBCB4" />
  <!-- Narrow torso -->
  <path d="M -14 48 L -12 110 L 12 110 L 14 48 Z" fill="#3498DB" />
  <!-- Long thin arms -->
  <path d="M -14 52 L -18 80 L -15 115" fill="none" stroke="#FDBCB4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 14 52 L 18 80 L 15 115" fill="none" stroke="#FDBCB4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Long thin legs -->
  <line x1="-6" y1="110" x2="-7" y2="185" stroke="#2C3E50" stroke-width="6" stroke-linecap="round" />
  <line x1="6" y1="110" x2="7" y2="185" stroke="#2C3E50" stroke-width="6" stroke-linecap="round" />
</g>
```

### Mesomorph (Athletic/Muscular)

Wide shoulders, narrow waist (V-taper). Defined musculature. Heroes, athletes.

```xml
<g id="mesomorph" transform="translate(250, 30)">
  <circle cx="0" cy="20" r="22" fill="#FDBCB4" />
  <rect x="-5" y="40" width="10" height="10" fill="#FDBCB4" />
  <!-- Wide shoulder, narrow waist (V-taper) -->
  <path d="M -28 50 L -20 115 L 20 115 L 28 50 Z" fill="#3498DB" />
  <!-- Thick arms -->
  <path d="M -28 55 L -35 85 L -30 120" fill="none" stroke="#FDBCB4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 28 55 L 35 85 L 30 120" fill="none" stroke="#FDBCB4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Sturdy legs -->
  <line x1="-10" y1="115" x2="-12" y2="185" stroke="#2C3E50" stroke-width="10" stroke-linecap="round" />
  <line x1="10" y1="115" x2="12" y2="185" stroke="#2C3E50" stroke-width="10" stroke-linecap="round" />
</g>
```

### Endomorph (Rounded/Stocky)

Wide torso, rounded midsection, shorter limbs relative to body. Softer contours.

```xml
<g id="endomorph" transform="translate(400, 30)">
  <circle cx="0" cy="20" r="22" fill="#FDBCB4" />
  <!-- Wider, rounded torso -->
  <ellipse cx="0" cy="85" rx="28" ry="35" fill="#3498DB" />
  <!-- Shorter, thicker arms -->
  <path d="M -25 60 L -32 85 L -28 105" fill="none" stroke="#FDBCB4" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 25 60 L 32 85 L 28 105" fill="none" stroke="#FDBCB4" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Shorter legs -->
  <line x1="-10" y1="118" x2="-12" y2="175" stroke="#2C3E50" stroke-width="10" stroke-linecap="round" />
  <line x1="10" y1="118" x2="12" y2="175" stroke="#2C3E50" stroke-width="10" stroke-linecap="round" />
</g>
```

**Body type SVG tips:**
- Ectomorph: Use `stroke-width` 4-6 for limbs. Torso path nearly parallel sides.
- Mesomorph: Shoulder width = 3× head width. Waist = 1.5× head width. Use stroke-width 7-9.
- Endomorph: Replace torso `<path>` with `<ellipse>`. Limbs use stroke-width 9-11. Round all corners with high `rx` values.

## Gesture Drawing & Line of Action

Every dynamic pose starts with a single curved line — the **line of action**. This S-curve or C-curve captures the energy and direction of the entire figure before any anatomy is drawn.

### Line of Action Principles

```xml
<!-- Line of action: one sweeping curve through the figure -->
<g id="line-of-action-demo">
  <!-- The gesture line — draw this FIRST -->
  <path d="M 200 50 Q 180 120, 210 200 Q 230 270, 200 340"
        fill="none" stroke="#E74C3C" stroke-width="2" stroke-dasharray="6 3" />
  <!-- Then build the figure around it -->
  <circle cx="200" cy="60" r="20" fill="#FDBCB4" opacity="0.7" />
  <path d="M 190 80 Q 178 140, 200 180" fill="none" stroke="#FDBCB4" stroke-width="12" stroke-linecap="round" opacity="0.7" />
  <path d="M 200 180 Q 225 250, 210 320" fill="none" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" opacity="0.7" />
</g>
```

**Rules:**
1. **Never straight** — Even a standing figure has a slight curve (contrapposto).
2. **One continuous sweep** — The line flows from head through torso to the weight-bearing foot.
3. **Exaggerate** — Push the curve 20-30% beyond what feels natural. Dynamic poses demand it.
4. **Asymmetry** — If the left side curves out, the right side curves in (opposing curves create rhythm).

### Contrapposto (Weight Shift)

When a character stands on one leg, the hip on the weight-bearing side rises and the shoulder on that same side drops, creating an S-curve through the torso.

```xml
<g id="contrapposto" transform="translate(200, 40)">
  <!-- Tilted shoulder line (left higher) -->
  <line x1="-25" y1="55" x2="25" y2="60" stroke="#999" stroke-width="1" stroke-dasharray="4 2" />
  <!-- Tilted hip line (right higher — opposite tilt!) -->
  <line x1="-20" y1="120" x2="20" y2="115" stroke="#999" stroke-width="1" stroke-dasharray="4 2" />
  <!-- Head (tilts toward raised shoulder) -->
  <circle cx="-3" cy="25" r="22" fill="#FDBCB4" />
  <!-- Torso: S-curve between shoulder/hip -->
  <path d="M -20 58 Q -15 90, -10 117 L 15 115 Q 18 88, 22 58 Z" fill="#3498DB" />
  <!-- Weight leg (straight, directly under head) -->
  <line x1="10" y1="115" x2="8" y2="190" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" />
  <!-- Free leg (bent, relaxed) -->
  <path d="M -10 118 Q -20 155, -15 190" fill="none" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" />
</g>
```

**Contrapposto checklist:**
- Shoulders and hips tilt in OPPOSITE directions
- Weight-bearing leg is nearly vertical, positioned under the head
- Free leg bends at the knee, foot may point outward
- Spine forms a gentle S between the two tilt lines
- Head tilts toward the raised shoulder

## Dynamic Poses & Weight Distribution

### Center of Gravity (CoG)

The CoG sits roughly at the navel. For a pose to look balanced, a vertical line from the CoG must fall within the base of support (feet, chair, or ground contact).

| Pose | CoG Position | Base of Support | Key Detail |
|------|-------------|----------------|------------|
| Standing | Above feet | Between both feet | Plumb line from head hits between feet |
| Walking | Shifted forward | Front foot | Slight forward lean; CoG ahead of back foot |
| Running | Far forward | Single foot | Extreme lean (30-45°); body nearly diagonal |
| Jumping | Above launch point | No ground contact | Limbs spread for balance; spine arched |
| Sitting | Above pelvis | Seat surface | Spine can recline; arms rest naturally |
| Crouching | Low, between feet | Wide stance | Knees past toes; back rounds forward |
| Leaning | Shifted toward support | Hand/arm + feet | Diagonal body line toward support surface |

### Running Pose

```xml
<g id="pose-running" transform="translate(200, 30)">
  <!-- Body tilted forward ~30° -->
  <g transform="rotate(15, 0, 120)">
    <circle cx="0" cy="25" r="22" fill="#FDBCB4" />
    <path d="M -18 50 L -20 110 L 20 110 L 18 50 Z" fill="#E74C3C" />
    <!-- Front arm (opposite to front leg) swings forward -->
    <path d="M -18 55 L -5 75 L 10 60" fill="none" stroke="#FDBCB4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
    <!-- Back arm swings behind -->
    <path d="M 18 55 L 30 80 L 35 100" fill="none" stroke="#FDBCB4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
    <!-- Front leg (driving forward, knee high) -->
    <path d="M -5 110 L -20 140 L -10 165" fill="none" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
    <!-- Back leg (extended behind, pushing off) -->
    <path d="M 10 110 L 25 145 L 40 170" fill="none" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</g>
```

### Jumping Pose

```xml
<g id="pose-jumping" transform="translate(200, 30)">
  <circle cx="0" cy="20" r="22" fill="#FDBCB4" />
  <path d="M -18 45 L -16 105 L 16 105 L 18 45 Z" fill="#2ECC71" />
  <!-- Arms raised high -->
  <path d="M -18 50 L -30 30 L -25 5" fill="none" stroke="#FDBCB4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 18 50 L 30 30 L 25 5" fill="none" stroke="#FDBCB4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Legs tucked up (knees bent) -->
  <path d="M -8 105 L -20 125 L -15 145" fill="none" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 8 105 L 20 125 L 15 145" fill="none" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Shadow on ground (shows height) -->
  <ellipse cx="0" cy="185" rx="20" ry="5" fill="#000" opacity="0.15" />
</g>
```

### Crouching Pose

```xml
<g id="pose-crouching" transform="translate(200, 80)">
  <circle cx="5" cy="0" r="22" fill="#FDBCB4" />
  <!-- Torso hunched forward -->
  <path d="M -12 22 L -18 65 L 22 65 L 15 22 Z" fill="#9B59B6" />
  <!-- Arms resting on knees or reaching forward -->
  <path d="M -12 30 L -20 50 L -25 65" fill="none" stroke="#FDBCB4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 15 30 L 22 50 L 20 65" fill="none" stroke="#FDBCB4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Legs deeply bent — thighs nearly horizontal -->
  <path d="M -10 65 L -30 68 L -35 100" fill="none" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 12 65 L 28 68 L 30 100" fill="none" stroke="#2C3E50" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
</g>
```

## Foreshortening in SVG

Foreshortening creates the illusion that a limb extends toward or away from the viewer. In 2D SVG, achieve this through:

1. **Size reduction** — The extended part appears smaller (shorter stroke, smaller circle).
2. **Overlap** — Nearer forms overlap farther forms.
3. **Elliptical joints** — Circles become ellipses to show angle.

```xml
<!-- Arm reaching toward viewer -->
<g id="foreshortened-arm" transform="translate(200, 100)">
  <!-- Shoulder (full size) -->
  <circle cx="0" cy="0" r="12" fill="#FDBCB4" />
  <!-- Upper arm (shortened — appears to come toward us) -->
  <ellipse cx="0" cy="10" rx="10" ry="6" fill="#F0B4A4" />
  <!-- Elbow (overlaps upper arm) -->
  <circle cx="0" cy="18" r="9" fill="#FDBCB4" />
  <!-- Forearm (even shorter) -->
  <ellipse cx="0" cy="26" rx="8" ry="5" fill="#F0B4A4" />
  <!-- Hand (largest — closest to viewer) -->
  <circle cx="0" cy="38" r="14" fill="#FDBCB4" />
  <!-- Fingers splayed -->
  <circle cx="-8" cy="30" r="3" fill="#FDBCB4" />
  <circle cx="8" cy="30" r="3" fill="#FDBCB4" />
  <circle cx="-5" cy="26" r="3" fill="#FDBCB4" />
  <circle cx="5" cy="26" r="3" fill="#FDBCB4" />
</g>
```

## FACS-Based Expression System

The Facial Action Coding System (FACS) developed by Paul Ekman maps facial movements to specific muscle groups called **Action Units (AU)**. This provides a systematic, precise way to construct expressions.

### Key Action Units for Illustration

| AU | Muscle | Visual Effect | SVG Technique |
|----|--------|--------------|---------------|
| AU1 | Frontalis (inner) | Inner eyebrow raise | Raise inner endpoint of eyebrow path |
| AU2 | Frontalis (outer) | Outer eyebrow raise | Raise outer endpoint of eyebrow path |
| AU4 | Corrugator | Brow lowerer / frown | Move both eyebrow paths down and inward |
| AU5 | Levator palpebrae | Upper eyelid raise | Increase eye ellipse ry (taller eyes) |
| AU6 | Orbicularis oculi | Cheek raise / crow's feet | Compress eye to squint arc; add cheek line |
| AU7 | Orbicularis oculi (lower) | Eyelid tightener | Raise lower eyelid line |
| AU9 | Levator labii | Nose wrinkler | Add wrinkle lines beside nose |
| AU10 | Levator labii sup. | Upper lip raiser | Raise upper lip arc control point |
| AU12 | Zygomaticus major | Lip corner pull (smile) | Raise mouth path endpoints |
| AU15 | Depressor anguli oris | Lip corner depressor | Lower mouth path endpoints |
| AU17 | Mentalis | Chin raiser | Add dimple/bump below lower lip |
| AU20 | Risorius | Lip stretcher | Widen mouth path horizontally |
| AU23 | Orbicularis oris | Lip tightener | Compress mouth to thin line |
| AU24 | Orbicularis oris | Lip presser | Flatten both lips, reduce gap |
| AU25 | Various | Lips part | Add gap between upper/lower lip |
| AU26 | Masseter | Jaw drop | Lower chin, increase mouth opening |
| AU27 | Pterygoids | Mouth stretch wide | Maximum jaw opening, circular mouth |
| AU43 | Relaxation | Eyes closed | Replace eye ellipses with horizontal lines |

### Expression Recipes (AU Combinations)

**Genuine happiness (Duchenne smile):** AU6 + AU12
- Cheeks push up, eyes squint, mouth corners rise

```xml
<g id="genuine-happy" transform="translate(100, 100)">
  <use href="#face-base" />
  <!-- AU6: cheek raise squints eyes -->
  <path d="M -18 -8 Q -12 -14, -5 -8" fill="none" stroke="#2C3E50" stroke-width="2.5" stroke-linecap="round" />
  <path d="M 5 -8 Q 12 -14, 18 -8" fill="none" stroke="#2C3E50" stroke-width="2.5" stroke-linecap="round" />
  <!-- AU6: subtle crow's feet -->
  <path d="M -20 -10 L -23 -13" stroke="#D4A998" stroke-width="0.7" />
  <path d="M 20 -10 L 23 -13" stroke="#D4A998" stroke-width="0.7" />
  <!-- AU12: lip corners pulled up high -->
  <path d="M -14 8 Q 0 22, 14 8" fill="none" stroke="#333" stroke-width="2" />
  <!-- Cheek highlight -->
  <circle cx="-15" cy="5" r="6" fill="#FFB6C1" opacity="0.3" />
  <circle cx="15" cy="5" r="6" fill="#FFB6C1" opacity="0.3" />
</g>
```

**Fear:** AU1 + AU2 + AU4 + AU5 + AU20 + AU25
- Brows raised and pulled together, eyes wide, mouth stretched horizontally

```xml
<g id="fear" transform="translate(200, 100)">
  <use href="#face-base" />
  <!-- AU1+AU2+AU4: brows raised high but pulled together -->
  <path d="M -18 -22 Q -12 -28, -5 -24" fill="none" stroke="#4A2C2A" stroke-width="2" />
  <path d="M 5 -24 Q 12 -28, 18 -22" fill="none" stroke="#4A2C2A" stroke-width="2" />
  <!-- Worry lines -->
  <path d="M -8 -27 Q 0 -30, 8 -27" fill="none" stroke="#D4A998" stroke-width="0.6" />
  <!-- AU5: eyes wide open -->
  <ellipse cx="-12" cy="-6" rx="7" ry="9" fill="white" />
  <ellipse cx="12" cy="-6" rx="7" ry="9" fill="white" />
  <circle cx="-12" cy="-5" r="3.5" fill="#2C3E50" />
  <circle cx="12" cy="-5" r="3.5" fill="#2C3E50" />
  <!-- AU20+AU25: mouth stretched wide, lips parted -->
  <path d="M -13 10 Q 0 8, 13 10" fill="none" stroke="#333" stroke-width="1.5" />
  <path d="M -11 13 Q 0 16, 11 13" fill="none" stroke="#333" stroke-width="1" />
</g>
```

**Disgust:** AU9 + AU10 + AU17 + AU25
- Nose wrinkles, upper lip raises asymmetrically, chin pushes up

```xml
<g id="disgust" transform="translate(300, 100)">
  <use href="#face-base" />
  <!-- AU4: slight brow lower -->
  <path d="M -18 -16 Q -12 -18, -5 -17" fill="none" stroke="#4A2C2A" stroke-width="2" />
  <path d="M 5 -18 Q 12 -17, 18 -15" fill="none" stroke="#4A2C2A" stroke-width="2" />
  <!-- Standard eyes, slightly narrowed -->
  <ellipse cx="-12" cy="-6" rx="6" ry="5" fill="white" />
  <ellipse cx="12" cy="-6" rx="6" ry="5" fill="white" />
  <circle cx="-12" cy="-5" r="3" fill="#2C3E50" />
  <circle cx="12" cy="-5" r="3" fill="#2C3E50" />
  <!-- AU9: nose wrinkle lines -->
  <path d="M -6 1 Q -8 -2, -4 -3" fill="none" stroke="#D4A998" stroke-width="0.8" />
  <path d="M 6 1 Q 8 -2, 4 -3" fill="none" stroke="#D4A998" stroke-width="0.8" />
  <!-- AU10+AU25: upper lip raised asymmetrically -->
  <path d="M -10 9 Q -3 5, 0 8 Q 5 7, 10 10" fill="none" stroke="#333" stroke-width="1.8" />
  <!-- AU17: chin dimple -->
  <circle cx="0" cy="20" r="2" fill="#E8A088" opacity="0.5" />
</g>
```

**Contempt:** AU12R + AU14R (one-sided only)
- Single lip corner raised. The only asymmetric universal expression.

```xml
<g id="contempt" transform="translate(400, 100)">
  <use href="#face-base" />
  <!-- Neutral brows, slightly raised on one side -->
  <path d="M -18 -16 Q -12 -20, -5 -16" fill="none" stroke="#4A2C2A" stroke-width="2" />
  <path d="M 5 -17 Q 12 -21, 18 -15" fill="none" stroke="#4A2C2A" stroke-width="2" />
  <!-- Half-lidded eyes -->
  <ellipse cx="-12" cy="-6" rx="6" ry="5" fill="white" />
  <ellipse cx="12" cy="-6" rx="6" ry="5" fill="white" />
  <circle cx="-12" cy="-5" r="3" fill="#2C3E50" />
  <circle cx="12" cy="-5" r="3" fill="#2C3E50" />
  <!-- AU12R: ONE side of mouth raised (asymmetric smirk) -->
  <path d="M -8 10 Q 0 12, 10 6" fill="none" stroke="#333" stroke-width="2" />
</g>
```

### Complex Emotion Blends

Realistic characters show blended emotions. Combine AU sets from two emotions, giving dominance to one:

| Blend | Recipe | Visual Key |
|-------|--------|-----------|
| Bittersweet | Sad eyes (AU1) + slight smile (AU12 at 50%) | Inner brows raised, lips gently curved up |
| Nervous | Fear brows (AU1+AU2) + compressed lips (AU24) + wide eyes (AU5) | Tense mouth, darting eyes |
| Skeptical | One brow raised (AU2 unilateral) + lip press (AU24) | Asymmetric brow, flat mouth |
| Determined | Brow lower (AU4) + lip press (AU24) + jaw clench (AU28) | Intense gaze, tight jaw |
| Amused disbelief | Surprise brows (AU1+AU2) + one-sided smile (AU12R) | High brows, crooked grin |
| Pained smile | Genuine smile (AU6+AU12) + brow furrow (AU4) | Squinted eyes with furrowed brow |
| Wistful | Sad inner brows (AU1) + gentle eye close (AU43 partial) + tiny smile (AU12 low) | Dreamy, slightly melancholic |

## Advanced Hand Anatomy

### Hand Proportions

- Palm length ≈ finger length (from base to tip)
- Middle finger is longest; index and ring are nearly equal; pinky reaches the top knuckle of ring finger
- Thumb reaches the middle knuckle of the index finger
- When open, the hand spans roughly a face-width

### Extended Hand Vocabulary

```xml
<!-- Thumbs up -->
<g id="hand-thumbsup" transform="translate(100, 100)">
  <rect x="-10" y="0" width="22" height="18" rx="6" fill="#FDBCB4" />
  <!-- Curled fingers -->
  <rect x="-8" y="-4" width="18" height="8" rx="4" fill="#F0B4A4" />
  <!-- Thumb extending upward -->
  <rect x="-14" y="-25" width="8" height="25" rx="4" fill="#FDBCB4" />
</g>

<!-- Peace sign / V -->
<g id="hand-peace" transform="translate(200, 100)">
  <rect x="-10" y="5" width="20" height="18" rx="5" fill="#FDBCB4" />
  <!-- Two extended fingers -->
  <rect x="-8" y="-22" width="6" height="28" rx="3" fill="#FDBCB4" transform="rotate(-8, -5, -8)" />
  <rect x="3" y="-22" width="6" height="28" rx="3" fill="#FDBCB4" transform="rotate(8, 6, -8)" />
  <!-- Curled ring + pinky -->
  <ellipse cx="2" cy="2" rx="8" ry="5" fill="#F0B4A4" />
  <!-- Thumb tucked -->
  <ellipse cx="-13" cy="8" rx="5" ry="4" fill="#FDBCB4" />
</g>

<!-- Holding a cup / cylindrical grip -->
<g id="hand-holding-cup" transform="translate(300, 100)">
  <!-- Cup shape -->
  <rect x="-8" y="-15" width="20" height="35" rx="3" fill="#D5D5D5" />
  <!-- Fingers wrap around (arcs) -->
  <path d="M -8 -10 Q -15 -5, -12 5 Q -10 12, -8 18" fill="none" stroke="#FDBCB4" stroke-width="5" stroke-linecap="round" />
  <path d="M -8 -5 Q -18 2, -15 10" fill="none" stroke="#F0B4A4" stroke-width="4" stroke-linecap="round" />
  <!-- Thumb on other side -->
  <path d="M 12 -8 Q 18 -2, 15 5" fill="none" stroke="#FDBCB4" stroke-width="5" stroke-linecap="round" />
</g>

<!-- Writing grip (pinch) -->
<g id="hand-writing" transform="translate(400, 100)">
  <!-- Pencil -->
  <line x1="-5" y1="-20" x2="15" y2="15" stroke="#F4D03F" stroke-width="3" />
  <!-- Thumb and index pinch the pencil -->
  <ellipse cx="2" cy="-5" rx="6" ry="4" fill="#FDBCB4" transform="rotate(-20, 2, -5)" />
  <ellipse cx="8" cy="-3" rx="5" ry="4" fill="#FDBCB4" transform="rotate(25, 8, -3)" />
  <!-- Other fingers curled -->
  <path d="M 10 2 Q 15 8, 12 14 Q 8 18, 4 15" fill="#F0B4A4" />
</g>
```

### Hand Simplification by Style Level

| Level | Fingers | Palm | Technique |
|-------|---------|------|-----------|
| Chibi | Tiny bumps or mittens | Circle | 0-3 visible fingers |
| Cartoon | 3-4 rounded rectangles | Rounded rect | No knuckle detail |
| Stylized | 4-5 tapered shapes | Shaped path | Subtle knuckle curves |
| Detailed | 5 with joints visible | Anatomical path | Knuckle bumps, nail shapes |
| Realistic | Full articulation | Complex path | Tendons, veins, skin folds |

## Foot & Shoe Design

### Basic Foot Shape

The foot is a wedge in side view — high at the heel, tapering to the toes. From the front, it fans out slightly from ankle to toes.

```xml
<!-- Side view foot -->
<g id="foot-side" transform="translate(100, 100)">
  <!-- Ankle -->
  <circle cx="0" cy="0" r="5" fill="#FDBCB4" />
  <!-- Heel -->
  <path d="M -3 5 Q -8 15, -5 20" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5" />
  <!-- Arch and ball -->
  <path d="M -5 20 Q 5 18, 15 20 Q 25 22, 30 20" fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5" />
  <!-- Toes (simplified) -->
  <ellipse cx="32" cy="19" rx="5" ry="3" fill="#FDBCB4" />
</g>

<!-- Front view foot -->
<g id="foot-front" transform="translate(200, 100)">
  <path d="M -8 0 L -12 20 Q -10 25, 0 25 Q 10 25, 12 20 L 8 0 Z" fill="#FDBCB4" />
  <!-- Toes as bumps -->
  <circle cx="-6" cy="24" r="2.5" fill="#F0B4A4" />
  <circle cx="-1" cy="23" r="2.5" fill="#F0B4A4" />
  <circle cx="4" cy="24" r="2.5" fill="#F0B4A4" />
</g>
```

### Shoe Types (Simplified SVG)

```xml
<!-- Sneaker -->
<g id="shoe-sneaker" transform="translate(100, 200)">
  <path d="M -5 0 Q -10 10, -8 15 L 25 15 Q 30 13, 30 8 L 20 0 Z" fill="#E74C3C" />
  <path d="M -8 15 L 30 15 Q 32 18, 28 18 L -6 18 Z" fill="white" /> <!-- sole -->
  <circle cx="8" cy="6" r="1.5" fill="white" /> <!-- lace hole -->
  <circle cx="14" cy="4" r="1.5" fill="white" />
</g>

<!-- Boot -->
<g id="shoe-boot" transform="translate(200, 170)">
  <path d="M -5 0 L -6 25 Q -10 35, -8 40 L 20 40 Q 25 38, 25 33 L 18 0 Z" fill="#5D4037" />
  <path d="M -8 40 L 25 40 Q 27 44, 23 44 L -6 44 Z" fill="#3E2723" /> <!-- thick sole -->
  <line x1="0" y1="10" x2="13" y2="10" stroke="#795548" stroke-width="0.8" />
  <line x1="-1" y1="18" x2="14" y2="18" stroke="#795548" stroke-width="0.8" />
</g>

<!-- High heel -->
<g id="shoe-heel" transform="translate(320, 195)">
  <path d="M 0 0 Q -2 8, -3 12 L 22 12 Q 28 10, 28 5 L 15 0 Z" fill="#2C3E50" />
  <!-- Heel spike -->
  <path d="M -1 12 L -3 28 L 2 28 L 3 12" fill="#2C3E50" />
  <!-- Sole -->
  <path d="M -3 12 L 28 12 L 28 14 L -3 14 Z" fill="#1A1A1A" />
</g>
```

## Character Turnaround Sheets

A turnaround shows the same character from multiple angles to ensure consistency in multi-view illustrations or animation.

### Standard 5-View Turnaround

The canonical views are: **Front → ¾ Front → Profile → ¾ Back → Back**

**Construction method:**
1. Draw the front view with clear horizontal guidelines at key landmarks (crown, eyes, chin, shoulders, waist, hips, knees, feet).
2. Extend guidelines horizontally across the sheet.
3. Draw each subsequent view aligned to those guidelines.
4. Mirror the front view as a starting point for the back view.

```xml
<!-- Turnaround alignment guide structure -->
<g id="turnaround-guides">
  <!-- Horizontal alignment lines -->
  <line x1="0" y1="0" x2="500" y2="0" stroke="#CCC" stroke-width="0.5" stroke-dasharray="4 2" />    <!-- crown -->
  <line x1="0" y1="25" x2="500" y2="25" stroke="#CCC" stroke-width="0.5" stroke-dasharray="4 2" />   <!-- eyes -->
  <line x1="0" y1="50" x2="500" y2="50" stroke="#CCC" stroke-width="0.5" stroke-dasharray="4 2" />   <!-- chin -->
  <line x1="0" y1="75" x2="500" y2="75" stroke="#CCC" stroke-width="0.5" stroke-dasharray="4 2" />   <!-- shoulders -->
  <line x1="0" y1="150" x2="500" y2="150" stroke="#CCC" stroke-width="0.5" stroke-dasharray="4 2" /> <!-- waist -->
  <line x1="0" y1="200" x2="500" y2="200" stroke="#CCC" stroke-width="0.5" stroke-dasharray="4 2" /> <!-- hips -->
  <line x1="0" y1="300" x2="500" y2="300" stroke="#CCC" stroke-width="0.5" stroke-dasharray="4 2" /> <!-- knees -->
  <line x1="0" y1="400" x2="500" y2="400" stroke="#CCC" stroke-width="0.5" stroke-dasharray="4 2" /> <!-- feet -->

  <!-- Labels -->
  <text x="-30" y="3" font-size="8" fill="#999">crown</text>
  <text x="-30" y="28" font-size="8" fill="#999">eyes</text>
  <text x="-30" y="53" font-size="8" fill="#999">chin</text>
  <text x="-30" y="78" font-size="8" fill="#999">shoulders</text>
  <text x="-30" y="153" font-size="8" fill="#999">waist</text>
  <text x="-30" y="203" font-size="8" fill="#999">hips</text>
  <text x="-30" y="303" font-size="8" fill="#999">knees</text>
  <text x="-30" y="403" font-size="8" fill="#999">feet</text>

  <!-- View labels -->
  <text x="50" y="420" text-anchor="middle" font-size="10" fill="#666">Front</text>
  <text x="150" y="420" text-anchor="middle" font-size="10" fill="#666">¾ Front</text>
  <text x="250" y="420" text-anchor="middle" font-size="10" fill="#666">Profile</text>
  <text x="350" y="420" text-anchor="middle" font-size="10" fill="#666">¾ Back</text>
  <text x="450" y="420" text-anchor="middle" font-size="10" fill="#666">Back</text>
</g>
```

**Key rules for ¾ view:**
- The center line of the face shifts toward the near side
- The far eye appears narrower (foreshortened)
- The far ear becomes visible; the near ear is hidden by the head volume
- The nose projects past the far cheek outline
- Body width narrows by ~25% compared to front view

**Key rules for profile:**
- Only one eye, one ear, half the mouth visible
- The nose extends past the face circle/ellipse
- Head shape is deeper front-to-back than it is wide
- Ear sits at vertical center, behind the jaw line

## Advanced Clothing & Fabric Physics

### Seven Fold Types (Extended)

The traditional seven fold types, each with distinct SVG construction approaches:

| Fold Type | Cause | Shape | SVG Pattern |
|-----------|-------|-------|-------------|
| **Pipe/Tubular** | Hanging from single point | Parallel vertical curves | Multiple parallel `<path>` with gentle S-curves |
| **Zigzag** | Compressed at joint | Alternating peaks and valleys | Zigzag `<polyline>` or connected V-shapes |
| **Spiral** | Wrapping around cylindrical form | Diagonal lines around limb | Curved `<path>` elements with increasing width |
| **Half-lock** | Fabric folds on itself at bend | Thin U-shape | Tight curve `<path>` with overlapping edges |
| **Diaper/Sag** | Supported at two points, sagging between | U-shape or catenary | Quadratic Bézier `Q` with low control point |
| **Drop** | Hanging freely from support | Cone-like radiating lines | Fan of lines from attachment point |
| **Inert** | Resting on surface | Irregular, pooling shapes | Organic blob `<path>` with soft curves |

### Fabric Material Behavior

| Material | Weight | Fold Character | SVG Approach |
|----------|--------|---------------|-------------|
| Silk/Chiffon | Ultra-light | Many small, soft folds. Clings to body. Translucent. | Thin stroke-width (0.3-0.5), high fold count, add `opacity="0.7"` |
| Cotton | Light-medium | Moderate folds, relaxed draping | Medium stroke-width (0.6-1.0), natural curves |
| Wool | Medium-heavy | Broad, rounded folds. Maintains shape. | Wider curves, fewer folds, thicker stroke (1.0-1.5) |
| Denim | Heavy-stiff | Few, sharp creases. Resists draping. | Straight-line segments, angular folds, stroke-width 1.2-1.8 |
| Leather | Heavy-stiff | Broad, rigid folds. Creases permanently. | Minimal folds, hard edges, add subtle sheen with gradient |
| Satin | Light | Smooth with sharp highlights. Reflects light. | Few fold lines but prominent highlight `<path>` with gradient fill |

```xml
<!-- Silk scarf: many thin, flowing folds -->
<g id="silk-fabric">
  <path d="M 0 0 Q 10 15, 5 30 Q -5 45, 0 60 Q 8 75, 3 90"
        fill="none" stroke="#E91E63" stroke-width="0.4" opacity="0.6" />
  <path d="M 3 0 Q 13 15, 8 30 Q -2 45, 3 60 Q 11 75, 6 90"
        fill="none" stroke="#E91E63" stroke-width="0.4" opacity="0.6" />
  <path d="M 6 0 Q 16 15, 11 30 Q 1 45, 6 60 Q 14 75, 9 90"
        fill="none" stroke="#E91E63" stroke-width="0.4" opacity="0.6" />
</g>

<!-- Denim jacket: few sharp, angular creases -->
<g id="denim-fabric">
  <!-- Major crease at elbow -->
  <path d="M 0 40 L 5 42 L 2 48 L 7 50" fill="none" stroke="#1565C0" stroke-width="1.5" />
  <!-- Minimal fold at shoulder -->
  <path d="M 0 0 L 3 8" fill="none" stroke="#1565C0" stroke-width="1.2" />
</g>
```

### Tension Point Map

Folds radiate FROM tension points. Know where tension occurs on the body:

- **Shoulders** → Folds radiate downward and outward (drop folds)
- **Elbows (bent)** → Zigzag and half-lock folds on the inside; stretched smooth on the outside
- **Armpits** → Tension pulls fabric diagonally from shoulder to armpit
- **Knees (bent)** → Similar to elbows: compressed inside, stretched outside
- **Waist/belt** → Pipe folds hang below; compression folds above if shirt is tucked
- **Hips** → Diagonal tension folds from hip bone to opposite knee (in fitted pants)
- **Crotch** → Star-burst of folds radiating outward

## Cultural Clothing Diversity

### East Asian

```xml
<!-- Simplified kimono structure -->
<g id="kimono">
  <!-- Main robe: overlapping front panels -->
  <path d="M -25 0 L -30 100 L 30 100 L 25 0 Z" fill="#D32F2F" />
  <!-- Left-over-right overlap (CRITICAL: right-over-left is for deceased) -->
  <path d="M 0 0 L -20 0 L -25 100 L 0 100 Z" fill="#C62828" />
  <!-- Obi (wide belt) -->
  <rect x="-28" y="40" width="56" height="18" rx="2" fill="#FFD700" />
  <!-- Wide sleeves -->
  <path d="M -25 5 L -55 10 L -55 45 L -30 40 Z" fill="#D32F2F" />
  <path d="M 25 5 L 55 10 L 55 45 L 30 40 Z" fill="#D32F2F" />
</g>
```

### South Asian

```xml
<!-- Simplified sari drape -->
<g id="sari">
  <!-- Underskirt -->
  <path d="M -20 50 L -25 130 L 25 130 L 20 50 Z" fill="#1A237E" />
  <!-- Sari wrap around waist -->
  <path d="M 20 50 Q 25 80, 20 130" fill="none" stroke="#283593" stroke-width="2" />
  <!-- Pallu (draped over shoulder) -->
  <path d="M -15 20 Q -20 40, -18 60 Q -22 80, -30 90 Q -35 95, -40 100"
        fill="none" stroke="#FF6F00" stroke-width="12" stroke-linecap="round" opacity="0.9" />
  <!-- Border detail -->
  <path d="M -20 50 L 20 50" stroke="#FFD700" stroke-width="2" />
  <path d="M -25 130 L 25 130" stroke="#FFD700" stroke-width="2" />
</g>
```

### Middle Eastern

```xml
<!-- Simplified thobe/kaftan -->
<g id="thobe">
  <!-- Long flowing robe -->
  <path d="M -22 0 L -28 140 Q -20 145, 0 145 Q 20 145, 28 140 L 22 0 Z" fill="white" />
  <!-- Collar detail -->
  <path d="M -8 0 Q 0 8, 8 0" fill="none" stroke="#C0C0C0" stroke-width="1" />
  <!-- Wide sleeves -->
  <path d="M -22 5 L -50 15 L -50 50 L -28 40 Z" fill="white" stroke="#EEE" stroke-width="0.5" />
  <path d="M 22 5 L 50 15 L 50 50 L 28 40 Z" fill="white" stroke="#EEE" stroke-width="0.5" />
  <!-- Keffiyeh (head covering) -->
  <path d="M -25 -25 Q 0 -35, 25 -25 L 30 10 L -30 10 Z" fill="#F5F5F5" />
  <circle cx="0" cy="-10" r="2" fill="none" stroke="#333" stroke-width="8" opacity="0.15" /> <!-- agal band -->
</g>
```

### West African

```xml
<!-- Simplified dashiki -->
<g id="dashiki">
  <!-- Wide, flowing top -->
  <path d="M -30 0 L -35 80 L 35 80 L 30 0 Z" fill="#FF6F00" />
  <!-- Embroidered V-neckline -->
  <path d="M -10 0 L 0 20 L 10 0" fill="none" stroke="#FFD700" stroke-width="2" />
  <path d="M -12 0 L 0 22 L 12 0" fill="none" stroke="#FFD700" stroke-width="1" />
  <!-- Geometric pattern on chest -->
  <rect x="-8" y="5" width="16" height="12" fill="none" stroke="#FFD700" stroke-width="1" />
  <line x1="-8" y1="5" x2="8" y2="17" stroke="#FFD700" stroke-width="0.5" />
  <line x1="8" y1="5" x2="-8" y2="17" stroke="#FFD700" stroke-width="0.5" />
  <!-- Wide sleeves -->
  <path d="M -30 5 L -55 12 L -55 40 L -35 35 Z" fill="#FF6F00" />
  <path d="M 30 5 L 55 12 L 55 40 L 35 35 Z" fill="#FF6F00" />
</g>
```

### Latin American

```xml
<!-- Simplified poncho -->
<g id="poncho">
  <!-- Poncho body: diamond draped over shoulders -->
  <path d="M 0 -5 L -50 40 L 0 90 L 50 40 Z" fill="#E65100" />
  <!-- Neck hole -->
  <ellipse cx="0" cy="10" rx="10" ry="6" fill="#FDBCB4" />
  <!-- Horizontal stripe pattern -->
  <line x1="-40" y1="30" x2="40" y2="30" stroke="#FFD54F" stroke-width="3" />
  <line x1="-45" y1="40" x2="45" y2="40" stroke="#D32F2F" stroke-width="2" />
  <line x1="-40" y1="50" x2="40" y2="50" stroke="#FFD54F" stroke-width="3" />
  <!-- Fringe at bottom -->
  <path d="M -20 75 L -22 82 M -15 78 L -17 85 M -10 80 L -12 87
           M 10 80 L 12 87 M 15 78 L 17 85 M 20 75 L 22 82"
        fill="none" stroke="#E65100" stroke-width="1" />
</g>
```

## Accessories & Props

### Glasses

```xml
<!-- Round glasses -->
<g id="glasses-round">
  <circle cx="-12" cy="0" r="9" fill="none" stroke="#333" stroke-width="1.5" />
  <circle cx="12" cy="0" r="9" fill="none" stroke="#333" stroke-width="1.5" />
  <line x1="-3" y1="0" x2="3" y2="0" stroke="#333" stroke-width="1.5" /> <!-- bridge -->
  <line x1="-21" y1="-2" x2="-28" y2="-4" stroke="#333" stroke-width="1" /> <!-- temple arm -->
  <line x1="21" y1="-2" x2="28" y2="-4" stroke="#333" stroke-width="1" />
  <!-- Lens reflection highlight -->
  <path d="M -15 -3 Q -13 -6, -10 -4" fill="none" stroke="white" stroke-width="0.8" opacity="0.6" />
  <path d="M 9 -3 Q 11 -6, 14 -4" fill="none" stroke="white" stroke-width="0.8" opacity="0.6" />
</g>

<!-- Rectangular glasses -->
<g id="glasses-rect">
  <rect x="-20" y="-6" width="16" height="12" rx="2" fill="none" stroke="#333" stroke-width="1.5" />
  <rect x="4" y="-6" width="16" height="12" rx="2" fill="none" stroke="#333" stroke-width="1.5" />
  <line x1="-4" y1="0" x2="4" y2="0" stroke="#333" stroke-width="1.5" />
</g>
```

### Hats

```xml
<!-- Baseball cap -->
<g id="hat-cap">
  <path d="M -28 0 Q -30 -10, 0 -15 Q 30 -10, 28 0" fill="#2C3E50" />
  <!-- Brim -->
  <path d="M -20 0 Q -10 8, 25 5 L 28 0 Z" fill="#34495E" />
  <!-- Crown curve -->
  <path d="M -28 0 Q -28 -5, -20 -10 Q 0 -18, 20 -10 Q 28 -5, 28 0" fill="#2C3E50" />
</g>

<!-- Beanie -->
<g id="hat-beanie">
  <path d="M -25 5 Q -28 -5, -20 -15 Q 0 -25, 20 -15 Q 28 -5, 25 5"
        fill="#E74C3C" />
  <!-- Fold line at bottom -->
  <path d="M -25 5 Q 0 8, 25 5" fill="none" stroke="#C0392B" stroke-width="1.5" />
  <path d="M -25 3 Q 0 6, 25 3" fill="none" stroke="#C0392B" stroke-width="0.8" />
</g>
```

### Scarf

```xml
<!-- Wrapped scarf -->
<g id="scarf">
  <!-- Wrap around neck (layer OVER clothing) -->
  <path d="M -18 15 Q -10 20, 0 18 Q 10 16, 18 20"
        fill="none" stroke="#8E24AA" stroke-width="10" stroke-linecap="round" />
  <!-- Hanging ends -->
  <path d="M -15 22 L -20 55 Q -18 58, -15 55 L -12 22"
        fill="#8E24AA" />
  <path d="M 12 22 L 18 60 Q 20 63, 22 60 L 16 22"
        fill="#8E24AA" />
  <!-- Fringe on ends -->
  <path d="M -20 55 L -21 60 M -18 56 L -19 61 M -16 57 L -17 62 M -14 56 L -15 61"
        fill="none" stroke="#8E24AA" stroke-width="0.8" />
</g>
```

## Character Animation Concepts for SVG

While full animation is beyond static SVG illustration, understanding key animation principles helps create more dynamic static poses:

### Squash & Stretch (Applied to Poses)

Exaggerate compression and extension to convey energy:
- A landing pose: legs compressed (squash), torso compressed
- A jumping pose: body elongated (stretch), limbs extended

### Anticipation Pose

Before a major action, characters wind up in the opposite direction:
- Before jumping UP → crouch DOWN
- Before throwing RIGHT → wind up LEFT
- Before punching → pull arm BACK

```xml
<!-- Anticipation: about to throw a ball -->
<g id="anticipation-throw" transform="translate(200, 50)">
  <circle cx="-5" cy="25" r="22" fill="#FDBCB4" />
  <!-- Body leans BACK (opposite of throw direction) -->
  <path d="M -20 50 L -25 115 L 15 115 L 20 50 Z" fill="#3498DB"
        transform="rotate(10, 0, 80)" />
  <!-- Throwing arm wound BACK -->
  <path d="M 18 55 L 30 40 L 40 25" fill="none" stroke="#FDBCB4" stroke-width="7"
        stroke-linecap="round" stroke-linejoin="round" />
  <!-- Ball in hand -->
  <circle cx="42" cy="22" r="6" fill="#F39C12" />
  <!-- Front arm braces forward -->
  <path d="M -18 55 L -30 70 L -20 80" fill="none" stroke="#FDBCB4" stroke-width="7"
        stroke-linecap="round" stroke-linejoin="round" />
</g>
```

### Follow-Through

After an action, parts of the character continue moving (hair, clothing, accessories lag behind the body's movement):
- After stopping: hair swings forward
- After turning: scarf trails behind
- After landing: skirt settles downward

## Practical Checklist

When creating a character in SVG, follow this order:

1. **Choose proportion system** — Select head:body ratio based on style and age
2. **Establish line of action** — Draw the gesture curve first
3. **Block in major forms** — Head circle, torso shape, limb lines
4. **Check center of gravity** — Ensure the pose feels balanced (or intentionally unbalanced)
5. **Add facial expression** — Use AU combinations for the target emotion
6. **Construct hands** — Match simplification level to overall style
7. **Design clothing** — Identify tension points, choose fold types for the fabric
8. **Apply consistent style** — Use the character sheet for colors, proportions, signature details
9. **Add accessories** — Layer glasses, hats, scarves ON TOP of the base character
10. **Self-review** — Preview as PNG and check: Does the pose read at thumbnail size? Is the expression clear? Do the proportions feel right?
