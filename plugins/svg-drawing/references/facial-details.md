# Facial Details

## 1. Face Shape Variations

Face shape establishes character identity at the most fundamental level. Choose the shape based on the character's personality, age, and body type.

### Face Shape Gallery

| Shape | Chin | Jaw | Forehead | SVG Approach |
|-------|------|-----|----------|--------------|
| Oval | Rounded | Soft, tapered | Balanced | Ellipse with `rx` slightly < `ry` |
| Round | Round | Wide, curved | Round | Circle or near-equal ellipse |
| Square | Angular | Wide, straight | Straight | Rect with low `rx` border-radius |
| Heart | Pointed | Wide cheekbones | Broad | Path: wide top, narrow pointed bottom |
| Long/Oblong | Elongated | Narrow | Tall | Ellipse with `ry` >> `rx` |
| Diamond | Narrow chin | Wide cheeks | Narrow | Path with widest point at cheeks |

```xml
<!-- Oval face — balanced, versatile, classic portrait shape -->
<!-- Good default for most character types -->
<g id="face-oval">
  <ellipse cx="50" cy="55" rx="35" ry="45"
           fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
  <!-- Chin is gently rounded, jaw softly tapers -->
</g>

<!-- Round face — friendly, youthful, approachable -->
<!-- Common for children and cheerful characters -->
<g id="face-round">
  <circle cx="50" cy="52" r="40"
          fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
  <!-- Wide jaw, full cheeks, no angular features -->
</g>

<!-- Square face — strong, determined, authoritative -->
<!-- Works well for heroic or stern characters -->
<g id="face-square">
  <rect x="15" y="12" width="70" height="80" rx="12" ry="12"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
  <!-- Angular jaw, straight hairline, strong chin -->
</g>

<!-- Heart face — romantic, expressive, distinctive -->
<!-- Wide forehead tapering to a delicate pointed chin -->
<g id="face-heart">
  <path d="M 50 10
           C 20 10, 10 30, 12 50
           C 14 65, 30 80, 50 95
           C 70 80, 86 65, 88 50
           C 90 30, 80 10, 50 10 Z"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
  <!-- Broad forehead, wide cheekbones, pointed chin -->
</g>

<!-- Long/Oblong face — elegant, mature, sophisticated -->
<!-- Tall and narrow proportions -->
<g id="face-long">
  <ellipse cx="50" cy="55" rx="30" ry="50"
           fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
  <!-- Elongated with narrow jaw and high forehead -->
</g>

<!-- Diamond face — striking, angular, high cheekbones -->
<!-- Narrow at forehead and chin, widest at cheeks -->
<g id="face-diamond">
  <path d="M 50 8
           C 38 8, 30 20, 20 45
           C 15 55, 22 70, 35 82
           Q 42 92, 50 95
           Q 58 92, 65 82
           C 78 70, 85 55, 80 45
           C 70 20, 62 8, 50 8 Z"
        fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>
  <!-- Narrow forehead, prominent cheekbones, tapered chin -->
</g>
```

---

## 2. Eyes

Eye style should match the overall illustration style. Below are the major categories from simplest to most detailed, with ready-to-use SVG code.

### Cartoon Eyes

Cartoon eyes are large, round, and simple. They prioritize expression and readability over anatomical accuracy. Key traits:

- **Large proportions** — eyes take up 30-40% of face width
- **Dot pupils or solid fills** — no iris texture needed
- **Minimal detail, maximum expression** — shape alone conveys emotion
- **Bold outlines** — thick strokes for readability at any size

```xml
<!-- Cartoon Eye Variant 1: Classic dot-pupil -->
<!-- Simple, friendly style used in many web illustrations -->
<g id="cartoon-eye-dot">
  <!-- White sclera with bold outline -->
  <ellipse cx="40" cy="30" rx="18" ry="16"
           fill="white" stroke="#2A2A2A" stroke-width="2.5"/>
  <!-- Large solid pupil — the simpler, the more expressive -->
  <circle cx="42" cy="32" r="7" fill="#1A1A1A"/>
  <!-- Single bold highlight for life -->
  <circle cx="38" cy="27" r="3.5" fill="white"/>
</g>

<!-- Cartoon Eye Variant 2: Oval expressive (Pixar-style) -->
<!-- Taller oval shape gives a wider emotional range -->
<g id="cartoon-eye-oval">
  <!-- Tall oval sclera — height > width for expressive range -->
  <ellipse cx="40" cy="30" rx="14" ry="20"
           fill="white" stroke="#2A2A2A" stroke-width="2"/>
  <!-- Large iris fills most of the eye -->
  <circle cx="40" cy="33" r="11" fill="#4A90D9"/>
  <!-- Pupil -->
  <circle cx="40" cy="33" r="5.5" fill="#0A0A0A"/>
  <!-- Two highlights: main + secondary for depth -->
  <ellipse cx="36" cy="27" rx="4" ry="3" fill="white" opacity="0.95"/>
  <circle cx="46" cy="38" r="2" fill="white" opacity="0.7"/>
</g>

<!-- Cartoon Eye Variant 3: Minimal line-art (comic strip style) -->
<!-- Just dots or simple shapes — maximum simplicity -->
<g id="cartoon-eye-minimal">
  <!-- Simple filled oval — no outline needed -->
  <ellipse cx="40" cy="30" rx="5" ry="7" fill="#1A1A1A"/>
  <!-- Tiny highlight dot -->
  <circle cx="38" cy="28" r="1.5" fill="white"/>
</g>
```

### Anime Style Eye Structure (layers back to front)

1. **Sclera (eye white):** Ellipse with slight off-white gradient
2. **Iris:** Circle with radial gradient (dark rim → mid color → lighter center)
3. **Pupil:** Dark circle, slightly above center of iris
4. **Iris texture:** Thin radial lines or subtle pattern overlay
5. **Upper shadow:** Gradient shadow from eyelid cast onto eye top
6. **Highlights:** 1-3 white shapes (main reflection + secondary sparkles)
7. **Eyelid line:** Curved path for upper eyelid, thicker at outer corner
8. **Eyelashes:** Individual curves or grouped path, thicker at base

```xml
<!-- Anime eye template on 80x60 canvas -->
<defs>
  <radialGradient id="iris-grad" cx="50%" cy="45%" r="50%">
    <stop offset="0%" stop-color="#4A90D9"/>
    <stop offset="60%" stop-color="#2C5F9E"/>
    <stop offset="100%" stop-color="#1A3A6B"/>
  </radialGradient>
  <radialGradient id="sclera-grad" cx="50%" cy="30%" r="60%">
    <stop offset="0%" stop-color="#FFFFFF"/>
    <stop offset="100%" stop-color="#E8E4E0"/>
  </radialGradient>
  <linearGradient id="lid-shadow" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="rgba(0,0,0,0.15)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </linearGradient>
</defs>

<!-- Layer: sclera -->
<ellipse cx="40" cy="32" rx="22" ry="16" fill="url(#sclera-grad)"/>

<!-- Layer: iris -->
<circle cx="40" cy="34" r="12" fill="url(#iris-grad)"/>

<!-- Layer: pupil -->
<circle cx="40" cy="33" r="5" fill="#0A0A0A"/>

<!-- Layer: lid-shadow -->
<ellipse cx="40" cy="26" rx="22" ry="8" fill="url(#lid-shadow)"/>

<!-- Layer: highlight-main -->
<ellipse cx="35" cy="28" rx="4" ry="3" fill="white" opacity="0.9"/>

<!-- Layer: highlight-secondary -->
<circle cx="46" cy="36" r="2" fill="white" opacity="0.6"/>

<!-- Layer: upper-eyelid -->
<path d="M 16 30 Q 28 16, 40 18 Q 52 16, 64 30"
      fill="none" stroke="#3A2218" stroke-width="2"
      stroke-linecap="round"/>

<!-- Layer: eyelashes -->
<path d="M 16 30 Q 14 24, 12 20 M 22 24 Q 20 18, 18 14 M 28 20 Q 27 14, 26 10"
      fill="none" stroke="#3A2218" stroke-width="1.2"
      stroke-linecap="round"/>
```

### Semi-Realistic Eyes

Semi-realistic eyes are anatomically informed but still stylized. They add depth through iris texture, multiple highlights, and subtle anatomical details without full photorealism.

- **Anatomically informed** — follows real eye structure but simplifies
- **Visible iris texture** — radial lines within the iris add dimension
- **Multiple highlights** — main window reflection plus 1-2 secondary catchlights
- **Eyelid crease and tear duct** — small details that add significant realism
- **Subtle color transitions** — gradients in sclera, iris, and surrounding skin
- Sclera shows subtle blood vessel hints (very faint pink lines)
- More complex highlight reflections (window shape, multiple catchlights)
- Subtle skin tone gradient around eye socket

```xml
<!-- Semi-realistic eye with iris texture and anatomical details -->
<defs>
  <!-- Iris gradient: lighter center with dark limbal ring -->
  <radialGradient id="semi-iris" cx="50%" cy="45%" r="50%">
    <stop offset="0%" stop-color="#6BAADD"/>
    <stop offset="55%" stop-color="#3A7CB8"/>
    <stop offset="85%" stop-color="#2C5F9E"/>
    <stop offset="100%" stop-color="#1A3A6B"/>   <!-- dark limbal ring -->
  </radialGradient>
  <!-- Upper lid shadow cast onto the eyeball -->
  <linearGradient id="semi-lid-shadow" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="rgba(0,0,0,0.2)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </linearGradient>
  <!-- Clip path for iris texture confinement -->
  <clipPath id="iris-clip">
    <circle cx="40" cy="34" r="11"/>
  </clipPath>
</defs>

<!-- Layer: sclera — subtle warm tint, not pure white -->
<ellipse cx="40" cy="32" rx="22" ry="15" fill="#FAFAF6"/>

<!-- Layer: tear-duct — pink inner corner detail -->
<ellipse cx="19" cy="33" rx="3" ry="4" fill="#F0C0B0" opacity="0.5"/>

<!-- Layer: iris base -->
<circle cx="40" cy="34" r="11" fill="url(#semi-iris)"/>

<!-- Layer: iris-texture — radial fibers clipped to iris -->
<g clip-path="url(#iris-clip)" opacity="0.3">
  <!-- Radiating lines from pupil create fibrous texture -->
  <line x1="40" y1="34" x2="40" y2="23" stroke="#1A3A6B" stroke-width="0.4"/>
  <line x1="40" y1="34" x2="46" y2="24" stroke="#1A3A6B" stroke-width="0.4"/>
  <line x1="40" y1="34" x2="50" y2="30" stroke="#1A3A6B" stroke-width="0.4"/>
  <line x1="40" y1="34" x2="50" y2="38" stroke="#1A3A6B" stroke-width="0.4"/>
  <line x1="40" y1="34" x2="46" y2="44" stroke="#1A3A6B" stroke-width="0.4"/>
  <line x1="40" y1="34" x2="40" y2="45" stroke="#1A3A6B" stroke-width="0.4"/>
  <line x1="40" y1="34" x2="34" y2="44" stroke="#1A3A6B" stroke-width="0.4"/>
  <line x1="40" y1="34" x2="30" y2="38" stroke="#1A3A6B" stroke-width="0.4"/>
  <line x1="40" y1="34" x2="30" y2="30" stroke="#1A3A6B" stroke-width="0.4"/>
  <line x1="40" y1="34" x2="34" y2="24" stroke="#1A3A6B" stroke-width="0.4"/>
</g>

<!-- Layer: pupil -->
<circle cx="40" cy="33" r="4.5" fill="#0A0A0A"/>

<!-- Layer: upper-lid-shadow — shadow cast by the eyelid -->
<ellipse cx="40" cy="26" rx="22" ry="7" fill="url(#semi-lid-shadow)"/>

<!-- Layer: highlight-main — window-shaped reflection -->
<ellipse cx="35" cy="28" rx="3.5" ry="2.5" fill="white" opacity="0.9"
         transform="rotate(-10, 35, 28)"/>

<!-- Layer: highlight-secondary — small catchlight -->
<circle cx="46" cy="38" r="1.5" fill="white" opacity="0.6"/>

<!-- Layer: upper-eyelid — varies thickness: thicker outer corner -->
<path d="M 16 32 Q 28 17, 40 19 Q 52 17, 64 32"
      fill="none" stroke="#3A2218" stroke-width="1.8"
      stroke-linecap="round"/>

<!-- Layer: eyelid-crease — subtle line above the lid -->
<path d="M 20 26 Q 32 14, 42 15 Q 52 14, 60 26"
      fill="none" stroke="#C4A088" stroke-width="0.7" opacity="0.4"/>

<!-- Layer: lower-eyelid — thinner, softer line -->
<path d="M 18 35 Q 30 44, 40 45 Q 50 44, 62 35"
      fill="none" stroke="#C4A088" stroke-width="0.6" opacity="0.35"/>

<!-- Layer: eyelashes — individual curves tapering outward -->
<g stroke="#3A2218" fill="none" stroke-linecap="round">
  <path d="M 18 32 Q 15 26, 13 22" stroke-width="1.1"/>
  <path d="M 24 25 Q 22 19, 20 15" stroke-width="1.0"/>
  <path d="M 30 21 Q 29 15, 28 11" stroke-width="0.9"/>
  <path d="M 50 21 Q 52 15, 54 12" stroke-width="0.9"/>
  <path d="M 56 25 Q 59 19, 62 16" stroke-width="1.0"/>
  <path d="M 62 32 Q 66 26, 70 23" stroke-width="1.1"/>
</g>
```

### Closed Eyes

Closed eyes convey rest, contentment, pain, or other emotions. The style of the closed eye line communicates the mood.

```xml
<!-- Closed Eye Style 1: Peaceful/sleeping — gentle curved line -->
<!-- A single smooth downward curve suggests relaxation -->
<g id="closed-eye-peaceful">
  <path d="M 18 32 Q 30 40, 40 41 Q 50 40, 62 32"
        fill="none" stroke="#3A2218" stroke-width="1.8"
        stroke-linecap="round"/>
  <!-- Optional: subtle lash hints at outer corner -->
  <path d="M 60 33 Q 63 30, 66 28" fill="none"
        stroke="#3A2218" stroke-width="0.8" stroke-linecap="round"/>
</g>

<!-- Closed Eye Style 2: Thick-lashed closed — glamorous/dramatic -->
<!-- Thicker line with prominent lash details -->
<g id="closed-eye-lashed">
  <path d="M 18 32 Q 30 42, 40 43 Q 50 42, 62 32"
        fill="none" stroke="#2A1810" stroke-width="2.5"
        stroke-linecap="round"/>
  <!-- Lash cluster: multiple curves radiating downward -->
  <g stroke="#2A1810" fill="none" stroke-linecap="round">
    <path d="M 22 35 Q 19 30, 16 26" stroke-width="1.2"/>
    <path d="M 28 38 Q 26 32, 24 28" stroke-width="1.1"/>
    <path d="M 52 38 Q 55 32, 58 28" stroke-width="1.1"/>
    <path d="M 58 35 Q 62 30, 66 27" stroke-width="1.2"/>
  </g>
</g>

<!-- Closed Eye Style 3: Anime-style ^ eyes — happy/cheerful -->
<!-- Inverted V shape common in manga for joyful expressions -->
<g id="closed-eye-anime-happy">
  <!-- Upward curved arc (^) — conveys happiness -->
  <path d="M 22 38 Q 32 24, 40 24 Q 48 24, 58 38"
        fill="none" stroke="#2A2A2A" stroke-width="2.5"
        stroke-linecap="round"/>
</g>

<!-- Closed Eye Style 4: Squinting — pain, bright light, laughter -->
<g id="closed-eye-squint">
  <!-- Tight compressed lines -->
  <path d="M 20 32 Q 30 35, 40 36 Q 50 35, 60 32"
        fill="none" stroke="#3A2218" stroke-width="1.5"
        stroke-linecap="round"/>
  <!-- Wrinkle lines from squinting -->
  <path d="M 16 30 Q 18 28, 20 30" fill="none"
        stroke="#C4A088" stroke-width="0.5" opacity="0.5"/>
  <path d="M 60 30 Q 62 28, 64 30" fill="none"
        stroke="#C4A088" stroke-width="0.5" opacity="0.5"/>
</g>
```

### Eye Expression Variations

| Expression | Upper lid | Lower lid | Iris visible | Pupil size |
|-----------|-----------|-----------|-------------|------------|
| Neutral | Mid-curve | Gentle curve | 70-80% | Normal |
| Wide/Surprised | High arch | Drops slightly | 90-100% | Small |
| Happy/Smile | Drops/curves down | Rises up | 50-60% | Normal |
| Angry | Low, angled inward | Rises slightly | 60-70% | Small |
| Sleepy | Very low | Normal | 30-40% | Normal |

### Eye Color Variations

Use these iris gradient recipes for consistent, natural-looking eye colors. Each recipe defines three stops for a radial gradient: a lighter center, mid-tone band, and dark limbal ring.

| Color  | Center (0%) | Mid (55%) | Rim (100%) |
|--------|-------------|-----------|------------|
| Brown  | `#8B6914`   | `#5D3A1A` | `#3A2010`  |
| Blue   | `#7CB9E8`   | `#4A90D9` | `#1A3A6B`  |
| Green  | `#5DAE5D`   | `#2D7D2D` | `#1A4A1A`  |
| Hazel  | `#B8860B`   | `#6B8E23`  | `#3A4A1A`  |
| Gray   | `#B0B0B0`   | `#808080` | `#505050`  |
| Violet | `#9370DB`   | `#6A3D9A` | `#3A1A5E`  |

```xml
<!-- Example: applying eye color via radialGradient -->
<!-- Brown eyes — warm, earthy tones -->
<radialGradient id="iris-brown" cx="50%" cy="45%" r="50%">
  <stop offset="0%" stop-color="#8B6914"/>    <!-- warm golden center -->
  <stop offset="55%" stop-color="#5D3A1A"/>   <!-- rich brown mid-tone -->
  <stop offset="100%" stop-color="#3A2010"/>   <!-- very dark limbal ring -->
</radialGradient>

<!-- Green eyes — forest tones with dark rim -->
<radialGradient id="iris-green" cx="50%" cy="45%" r="50%">
  <stop offset="0%" stop-color="#5DAE5D"/>    <!-- bright green center -->
  <stop offset="55%" stop-color="#2D7D2D"/>   <!-- deep green mid-tone -->
  <stop offset="100%" stop-color="#1A4A1A"/>   <!-- near-black green rim -->
</radialGradient>

<!-- Violet eyes — rare, fantasy/supernatural characters -->
<radialGradient id="iris-violet" cx="50%" cy="45%" r="50%">
  <stop offset="0%" stop-color="#9370DB"/>    <!-- light purple center -->
  <stop offset="55%" stop-color="#6A3D9A"/>   <!-- deep purple mid-tone -->
  <stop offset="100%" stop-color="#3A1A5E"/>   <!-- dark violet rim -->
</radialGradient>

<!-- Usage: replace the iris fill with the desired gradient -->
<circle cx="40" cy="34" r="11" fill="url(#iris-brown)"/>
```

---

## 3. Eyebrow Architecture

Eyebrows are the most important feature for conveying emotion at a distance. Their shape communicates personality even before expression is applied.

### Eyebrow Shapes

| Style | Shape | Association | Key SVG Property |
|-------|-------|-------------|-----------------|
| Arched | High arch, defined peak | Feminine, elegant | Tall Q-curve control point |
| Straight | Minimal arch, horizontal | Masculine, stern | Nearly flat path |
| Rounded | Soft continuous curve | Approachable, friendly | Gentle arc, no peak |
| Angular | Sharp peak, abrupt angle | Intense, dramatic | Pointed junction in path |
| Thick bushy | Wide stroke, irregular | Powerful, natural | stroke-width 3+, rough edges |
| Thin/groomed | Thin stroke, clean | Refined, precise | stroke-width 1, smooth curve |

```xml
<!-- Arched eyebrow — elegant, defined peak -->
<path d="M 20 22 Q 30 12, 40 16 Q 50 12, 58 20"
      fill="none" stroke="#4A3020" stroke-width="2"
      stroke-linecap="round"/>

<!-- Straight eyebrow — minimal arch, strong/serious -->
<path d="M 20 20 Q 30 18, 40 18 Q 50 18, 58 20"
      fill="none" stroke="#4A3020" stroke-width="2.5"
      stroke-linecap="round"/>

<!-- Rounded eyebrow — soft, friendly curve -->
<path d="M 20 22 Q 38 14, 58 22"
      fill="none" stroke="#4A3020" stroke-width="2"
      stroke-linecap="round"/>

<!-- Angular eyebrow — sharp peak, intense look -->
<path d="M 20 22 L 36 14 L 58 20"
      fill="none" stroke="#4A3020" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round"/>

<!-- Thick bushy eyebrow — natural, powerful -->
<!-- Uses a filled path instead of stroke for irregular edges -->
<path d="M 18 22
         Q 24 14, 34 14
         Q 44 13, 56 18
         Q 58 20, 56 22
         Q 44 18, 34 18
         Q 24 18, 18 22 Z"
      fill="#3A2818"/>

<!-- Thin groomed eyebrow — refined, precise -->
<path d="M 22 20 Q 32 15, 42 16 Q 52 15, 58 18"
      fill="none" stroke="#4A3020" stroke-width="1"
      stroke-linecap="round"/>
```

### Eyebrow Expression Guide

Eyebrow position adjustments are measured relative to neutral resting position. Combine with eye and mouth expressions for full emotional range.

| Emotion | Inner End | Outer End | Arch Change | Notes |
|---------|-----------|-----------|-------------|-------|
| Neutral | Resting | Resting | Normal | Default position |
| Surprise | Up 3-5px | Up 3-5px | Higher | Both ends rise evenly |
| Anger | Down 4-6px | Up 2-3px | Steeper inward | Inner ends converge toward nose |
| Sadness | Up 3-4px | Down 2-3px | Inverted | Inner rises, outer droops — "worried" look |
| Skeptical | One neutral | One up 5px | Asymmetric | One brow raised, other normal |
| Disgust | Down 2px | Down 1px | Flatter | Overall compression, slight asymmetry |
| Fear | Up 5-7px | Up 2-3px | High inner peak | Similar to sadness but more extreme |
| Concentration | Down 2-3px | Neutral | Slightly flatter | Mild furrowing, less extreme than anger |

```xml
<!-- Eyebrow expression examples -->

<!-- Neutral: natural resting position -->
<path d="M 20 22 Q 30 15, 40 16 Q 50 15, 58 20"
      fill="none" stroke="#4A3020" stroke-width="2" stroke-linecap="round"/>

<!-- Surprise: both endpoints lifted 5 units -->
<path d="M 20 17 Q 30 8, 40 10 Q 50 8, 58 15"
      fill="none" stroke="#4A3020" stroke-width="2" stroke-linecap="round"/>

<!-- Anger: inner ends drop down, outer ends rise — steep angry angle -->
<path d="M 24 28 Q 30 18, 40 16 Q 50 14, 56 17"
      fill="none" stroke="#4A3020" stroke-width="2.5" stroke-linecap="round"/>

<!-- Sadness/Worry: inner ends rise, outer ends droop -->
<path d="M 22 18 Q 30 14, 40 18 Q 50 20, 58 24"
      fill="none" stroke="#4A3020" stroke-width="2" stroke-linecap="round"/>

<!-- Skeptical: left normal, right raised (asymmetric) -->
<!-- Left eyebrow — neutral -->
<path d="M 20 22 Q 30 15, 40 16 Q 50 15, 58 20"
      fill="none" stroke="#4A3020" stroke-width="2" stroke-linecap="round"/>
<!-- Right eyebrow — raised -->
<path d="M 62 15 Q 72 8, 82 10 Q 92 8, 100 17"
      fill="none" stroke="#4A3020" stroke-width="2" stroke-linecap="round"/>
```

---

## 4. Nose

### Nose Shapes

Different nose shapes communicate character traits and ethnic diversity. Choose the shape that fits your character's personality and background.

| Shape | Description | SVG Technique |
|-------|-------------|---------------|
| Button | Small, rounded, minimal shadow | Small circle + faint shadow arc |
| Aquiline/Roman | Prominent bridge with outward curve | Tall path with bridge bump |
| Upturned | Tip points slightly upward | Short path, upward-angled terminus |
| Wide | Broader nostril spread | Wider base, larger nostril ellipses |
| Narrow/Thin | Long, slim profile | Thin path, close-set nostrils |

```xml
<!-- Button Nose — small, cute, minimal detail -->
<!-- Works well for children, cartoon, and kawaii styles -->
<g id="nose-button">
  <!-- Nose tip: simple circle with very soft shadow -->
  <circle cx="40" cy="52" r="4" fill="#E8C0A8" opacity="0.3"/>
  <!-- Tiny nostril hints -->
  <circle cx="37" cy="53" r="1.2" fill="#C4988A" opacity="0.3"/>
  <circle cx="43" cy="53" r="1.2" fill="#C4988A" opacity="0.3"/>
  <!-- Minimal highlight on tip -->
  <circle cx="40" cy="50.5" r="1.5" fill="white" opacity="0.1"/>
</g>

<!-- Aquiline / Roman Nose — strong bridge, prominent profile -->
<!-- Conveys authority, classical beauty, or dramatic character -->
<g id="nose-aquiline">
  <!-- Bridge line with characteristic outward bump -->
  <path d="M 40 30
           C 40 34, 42 38, 43 42
           C 44 46, 42 50, 40 52
           Q 38 54, 36 52"
        fill="none" stroke="#C4988A" stroke-width="1.2" opacity="0.5"/>
  <!-- Shadow on one side for volume -->
  <path d="M 42 36
           C 44 40, 45 46, 43 50
           Q 42 52, 40 52"
        fill="#C4988A" opacity="0.15"/>
  <!-- Nostrils — slightly visible from front -->
  <ellipse cx="36" cy="52" rx="3" ry="1.8" fill="#B8846C" opacity="0.3"/>
  <ellipse cx="44" cy="52" rx="3" ry="1.8" fill="#B8846C" opacity="0.3"/>
  <!-- Bridge highlight -->
  <path d="M 40 32 L 40 46" stroke="white" stroke-width="0.8" opacity="0.08"/>
</g>

<!-- Upturned Nose — tip angles upward, youthful feel -->
<!-- Common in stylized feminine faces and cheerful characters -->
<g id="nose-upturned">
  <!-- Short bridge ending with upward curve -->
  <path d="M 40 36
           C 40 40, 39 44, 38 46
           Q 36 49, 34 48"
        fill="none" stroke="#C4988A" stroke-width="1" opacity="0.4"/>
  <!-- Nose tip curves up — nostrils more visible -->
  <ellipse cx="37" cy="48" rx="2.5" ry="2" fill="#C4988A" opacity="0.25"/>
  <ellipse cx="43" cy="48" rx="2.5" ry="2" fill="#C4988A" opacity="0.25"/>
  <!-- Highlight on upturned tip -->
  <circle cx="40" cy="46" r="2" fill="white" opacity="0.1"/>
</g>

<!-- Wide Nose — broad base, prominent nostrils -->
<g id="nose-wide">
  <!-- Broad shadow shape -->
  <path d="M 39 35
           C 38 40, 36 46, 32 52
           Q 36 55, 40 54
           Q 44 55, 48 52
           C 44 46, 42 40, 41 35"
        fill="#C4988A" opacity="0.12"/>
  <!-- Wide-set nostrils -->
  <ellipse cx="34" cy="52" rx="4" ry="2.2" fill="#B8846C" opacity="0.3"/>
  <ellipse cx="46" cy="52" rx="4" ry="2.2" fill="#B8846C" opacity="0.3"/>
  <!-- Nose tip highlight -->
  <ellipse cx="40" cy="50" rx="3" ry="2" fill="white" opacity="0.1"/>
</g>

<!-- Narrow / Thin Nose — long, slim, elegant -->
<g id="nose-narrow">
  <!-- Thin bridge line -->
  <path d="M 40 30
           C 40 36, 40 42, 39 48
           Q 38 51, 37 50"
        fill="none" stroke="#C4988A" stroke-width="0.8" opacity="0.4"/>
  <!-- Close-set small nostrils -->
  <ellipse cx="38" cy="50" rx="2" ry="1.3" fill="#B8846C" opacity="0.25"/>
  <ellipse cx="42" cy="50" rx="2" ry="1.3" fill="#B8846C" opacity="0.25"/>
  <!-- Thin highlight along bridge -->
  <line x1="40" y1="32" x2="40" y2="46" stroke="white"
        stroke-width="0.5" opacity="0.08"/>
</g>
```

### Side-light Nose (minimal detail, implied by shadow)

```xml
<!-- Layer: nose-shadow -->
<path d="M 38 35
         C 36 42, 34 48, 32 52
         Q 36 54, 40 53
         Q 44 54, 48 52
         C 46 48, 44 42, 42 35"
      fill="none" stroke="#D4A088" stroke-width="1" opacity="0.4"/>

<!-- Layer: nose-tip-highlight -->
<ellipse cx="40" cy="50" rx="4" ry="2.5" fill="white" opacity="0.12"/>

<!-- Layer: nostrils -->
<ellipse cx="36" cy="52" rx="2.5" ry="1.5" fill="#B8846C" opacity="0.3"/>
<ellipse cx="44" cy="52" rx="2.5" ry="1.5" fill="#B8846C" opacity="0.3"/>
```

### Nose from Different Angles

The nose changes dramatically based on viewing angle. These three views cover the most common portrait perspectives.

```xml
<!-- FRONT VIEW: shadow-only representation, nostrils as dots -->
<!-- Most common for flat/cartoon illustration -->
<g id="nose-front">
  <!-- Very subtle center shadow — implies the nose bridge -->
  <path d="M 40 35 L 40 48" stroke="#C4988A" stroke-width="0.6" opacity="0.2"/>
  <!-- Nose tip shadow: small arc -->
  <path d="M 36 50 Q 40 53, 44 50"
        fill="none" stroke="#C4988A" stroke-width="0.8" opacity="0.3"/>
  <!-- Two nostril dots -->
  <circle cx="37" cy="51" r="1.5" fill="#B8846C" opacity="0.3"/>
  <circle cx="43" cy="51" r="1.5" fill="#B8846C" opacity="0.3"/>
</g>

<!-- 3/4 VIEW: one nostril visible, shadow on far side -->
<!-- Most dynamic and natural portrait angle -->
<g id="nose-three-quarter">
  <!-- Bridge visible on near side -->
  <path d="M 42 32
           C 42 38, 43 44, 42 48
           Q 40 52, 38 50"
        fill="none" stroke="#C4988A" stroke-width="1" opacity="0.5"/>
  <!-- Shadow on far side (left) — wider, softer -->
  <path d="M 38 40
           C 36 44, 34 48, 33 50
           Q 35 52, 38 50"
        fill="#C4988A" opacity="0.12"/>
  <!-- Near nostril (visible) -->
  <ellipse cx="42" cy="50" rx="2.5" ry="1.5" fill="#B8846C" opacity="0.3"/>
  <!-- Far nostril (barely visible / hidden by bridge shadow) -->
  <ellipse cx="36" cy="50.5" rx="1.5" ry="1" fill="#B8846C" opacity="0.15"/>
  <!-- Highlight on near side of bridge -->
  <path d="M 43 34 L 43 46" stroke="white" stroke-width="0.5" opacity="0.08"/>
</g>

<!-- PROFILE VIEW: full bridge line, one nostril visible -->
<!-- Side view for silhouettes and profile portraits -->
<g id="nose-profile">
  <!-- Full bridge contour from brow to tip -->
  <path d="M 42 25
           C 42 30, 44 36, 46 40
           C 48 44, 48 48, 46 50
           Q 44 52, 42 50
           L 42 48"
        fill="none" stroke="#8B7060" stroke-width="1.2"/>
  <!-- Nostril shape — fully visible from side -->
  <path d="M 42 48
           C 40 50, 40 52, 42 52
           Q 44 52, 46 50"
        fill="#C4988A" opacity="0.4"/>
  <!-- Underside shadow -->
  <path d="M 42 50 Q 44 52, 46 50"
        fill="#B8846C" opacity="0.2"/>
</g>
```

---

## 5. Mouth / Lips

### Basic Lip Structure

Upper lip has a cupid's bow (M-shape), lower lip is fuller and rounder.

```xml
<defs>
  <linearGradient id="lip-grad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#D4756B"/>
    <stop offset="50%" stop-color="#C4615A"/>
    <stop offset="100%" stop-color="#B85550"/>
  </linearGradient>
</defs>

<!-- Layer: upper-lip -->
<path d="M 20 30
         C 25 30, 30 24, 40 26
         C 50 24, 55 30, 60 30
         C 55 33, 45 34, 40 33
         C 35 34, 25 33, 20 30 Z"
      fill="url(#lip-grad)"/>

<!-- Layer: lower-lip -->
<path d="M 20 30
         C 25 33, 30 40, 40 42
         C 50 40, 55 33, 60 30
         C 55 33, 45 34, 40 33
         C 35 34, 25 33, 20 30 Z"
      fill="#C4615A"/>

<!-- Layer: lip-line (the meeting line) -->
<path d="M 22 30 Q 31 32, 40 30 Q 49 32, 58 30"
      fill="none" stroke="#8B3A3A" stroke-width="0.8" opacity="0.6"/>

<!-- Layer: lower-lip-highlight -->
<ellipse cx="40" cy="36" rx="10" ry="3" fill="white" opacity="0.15"/>
```

### Lip Expression Variations

Lips are second only to eyes in conveying emotion. Below are the key expression shapes with SVG path data.

- **Smile:** corners curve up, upper lip thins slightly, teeth may show
- **Frown:** corners curve down, lower lip may protrude
- **Pout:** both lips push forward, fuller rounder shape
- **Open mouth:** jaw drops, teeth visible, dark interior
- **Pursed:** lips compress into small circular shape

```xml
<!-- Smile — corners lift, slight teeth peek -->
<g id="lips-smile">
  <!-- Upper lip — thinner when smiling, cupid's bow flattens -->
  <path d="M 18 30
           C 24 29, 32 24, 40 26
           C 48 24, 56 29, 62 30
           C 56 32, 44 33, 40 32
           C 36 33, 24 32, 18 30 Z"
        fill="#D4756B"/>
  <!-- Lower lip — corners pulled up by smile -->
  <path d="M 18 30
           C 24 32, 30 38, 40 39
           C 50 38, 56 32, 62 30
           C 56 32, 44 33, 40 32
           C 36 33, 24 32, 18 30 Z"
        fill="#C4615A"/>
  <!-- Lip line curves upward at corners -->
  <path d="M 18 30 Q 30 28, 40 30 Q 50 28, 62 30"
        fill="none" stroke="#8B3A3A" stroke-width="0.6" opacity="0.5"/>
  <!-- Teeth hint: white sliver visible between lips -->
  <path d="M 28 31 Q 34 33, 40 33 Q 46 33, 52 31"
        fill="white" opacity="0.7"/>
</g>

<!-- Frown — corners droop, lower lip pushes out -->
<g id="lips-frown">
  <!-- Upper lip — slightly compressed -->
  <path d="M 20 28
           C 26 28, 32 24, 40 25
           C 48 24, 54 28, 60 28
           C 54 30, 44 31, 40 30
           C 36 31, 26 30, 20 28 Z"
        fill="#D4756B"/>
  <!-- Lower lip — corners droop, lip protrudes -->
  <path d="M 20 28
           C 24 31, 30 38, 40 40
           C 50 38, 56 31, 60 28
           C 54 30, 44 31, 40 30
           C 36 31, 26 30, 20 28 Z"
        fill="#C4615A"/>
  <!-- Lip line droops at corners -->
  <path d="M 20 28 Q 30 32, 40 30 Q 50 32, 60 28"
        fill="none" stroke="#8B3A3A" stroke-width="0.7" opacity="0.5"/>
</g>

<!-- Pout — lips pushed forward, fuller and rounder -->
<g id="lips-pout">
  <!-- Upper lip — exaggerated cupid's bow, fuller shape -->
  <path d="M 24 30
           C 28 28, 34 22, 40 24
           C 46 22, 52 28, 56 30
           C 50 32, 44 33, 40 32
           C 36 33, 30 32, 24 30 Z"
        fill="#E07070"/>
  <!-- Lower lip — prominent, rounded, full -->
  <path d="M 24 30
           C 28 34, 32 42, 40 44
           C 48 42, 52 34, 56 30
           C 50 32, 44 33, 40 32
           C 36 33, 30 32, 24 30 Z"
        fill="#D06060"/>
  <!-- Strong lower-lip highlight for the pout effect -->
  <ellipse cx="40" cy="37" rx="8" ry="3.5" fill="white" opacity="0.2"/>
</g>

<!-- Open Mouth — jaw drops, teeth and interior visible -->
<g id="lips-open">
  <!-- Dark mouth interior -->
  <ellipse cx="40" cy="38" rx="14" ry="10" fill="#2A0A0A"/>
  <!-- Upper teeth row -->
  <rect x="28" y="32" width="24" height="6" rx="1" fill="#F5F0E8"/>
  <!-- Tooth dividers -->
  <line x1="34" y1="32" x2="34" y2="38" stroke="#E0D8D0" stroke-width="0.3"/>
  <line x1="40" y1="32" x2="40" y2="38" stroke="#E0D8D0" stroke-width="0.3"/>
  <line x1="46" y1="32" x2="46" y2="38" stroke="#E0D8D0" stroke-width="0.3"/>
  <!-- Upper lip -->
  <path d="M 20 30
           C 26 30, 32 24, 40 26
           C 48 24, 54 30, 60 30
           C 56 32, 44 33, 40 32
           C 36 33, 24 32, 20 30 Z"
        fill="#D4756B"/>
  <!-- Lower lip — pulled down -->
  <path d="M 22 42
           C 28 48, 34 50, 40 50
           C 46 50, 52 48, 58 42
           C 52 44, 44 46, 40 46
           C 36 46, 28 44, 22 42 Z"
        fill="#C4615A"/>
  <!-- Tongue hint -->
  <ellipse cx="40" cy="44" rx="8" ry="4" fill="#E88080" opacity="0.7"/>
</g>

<!-- Pursed Lips — compressed into small circle (kiss / thinking) -->
<g id="lips-pursed">
  <!-- Upper lip compressed inward -->
  <path d="M 32 30
           C 34 28, 38 26, 40 27
           C 42 26, 46 28, 48 30
           C 46 31, 42 31.5, 40 31
           C 38 31.5, 34 31, 32 30 Z"
        fill="#D4756B"/>
  <!-- Lower lip compressed -->
  <path d="M 32 30
           C 34 32, 36 36, 40 37
           C 44 36, 46 32, 48 30
           C 46 31, 42 31.5, 40 31
           C 38 31.5, 34 31, 32 30 Z"
        fill="#C4615A"/>
  <!-- Radiating pucker lines around the lips -->
  <g stroke="#C4A088" stroke-width="0.3" opacity="0.3" fill="none">
    <path d="M 30 28 L 28 26"/>
    <path d="M 50 28 L 52 26"/>
    <path d="M 30 34 L 28 36"/>
    <path d="M 50 34 L 52 36"/>
  </g>
</g>
```

### Lip Gloss / Shine Effect

A glossy lip effect uses a radial gradient highlight positioned on the fullest part of the lower lip, plus a subtle specular highlight on the upper lip.

```xml
<!-- Glossy lip effect using radial gradient overlays -->
<defs>
  <!-- Main gloss on lower lip center -->
  <radialGradient id="lip-gloss-lower" cx="50%" cy="35%" r="45%">
    <stop offset="0%" stop-color="white" stop-opacity="0.35"/>
    <stop offset="100%" stop-color="white" stop-opacity="0"/>
  </radialGradient>
  <!-- Small specular highlight on upper lip peak -->
  <radialGradient id="lip-gloss-upper" cx="50%" cy="60%" r="30%">
    <stop offset="0%" stop-color="white" stop-opacity="0.25"/>
    <stop offset="100%" stop-color="white" stop-opacity="0"/>
  </radialGradient>
</defs>

<!-- Apply over existing lip paths -->
<!-- Lower lip gloss overlay -->
<ellipse cx="40" cy="37" rx="11" ry="4" fill="url(#lip-gloss-lower)"/>
<!-- Upper lip specular highlight — small, centered on cupid's bow -->
<ellipse cx="40" cy="27" rx="5" ry="2" fill="url(#lip-gloss-upper)"/>
<!-- Edge highlight for wet-look effect -->
<path d="M 22 30 Q 30 28, 40 29 Q 50 28, 58 30"
      fill="none" stroke="white" stroke-width="0.4" opacity="0.2"/>
```

### Teeth and Mouth Interior

When the mouth is open, you need three layers: dark interior, teeth, and tongue.

```xml
<!-- Teeth and mouth interior for open-mouth expressions -->
<defs>
  <!-- Dark gradient for mouth depth -->
  <radialGradient id="mouth-interior" cx="50%" cy="40%" r="55%">
    <stop offset="0%" stop-color="#1A0505"/>   <!-- deep dark center -->
    <stop offset="100%" stop-color="#3A1010"/>  <!-- slightly lighter edges -->
  </radialGradient>
</defs>

<!-- Layer: mouth-interior — dark cavity -->
<ellipse cx="40" cy="40" rx="15" ry="11" fill="url(#mouth-interior)"/>

<!-- Layer: upper-teeth — white row with subtle dividers -->
<g id="upper-teeth">
  <!-- Teeth base shape -->
  <rect x="27" y="33" width="26" height="7" rx="1.5" fill="#F5F0E8"/>
  <!-- Individual tooth dividers -->
  <line x1="31" y1="33" x2="31" y2="40" stroke="#E8E0D8" stroke-width="0.4"/>
  <line x1="35.3" y1="33" x2="35.3" y2="40" stroke="#E8E0D8" stroke-width="0.4"/>
  <line x1="40" y1="33" x2="40" y2="40" stroke="#E8E0D8" stroke-width="0.4"/>
  <line x1="44.7" y1="33" x2="44.7" y2="40" stroke="#E8E0D8" stroke-width="0.4"/>
  <line x1="49" y1="33" x2="49" y2="40" stroke="#E8E0D8" stroke-width="0.4"/>
  <!-- Subtle shadow at gum line -->
  <line x1="27" y1="33.5" x2="53" y2="33.5" stroke="#DDD0C8" stroke-width="0.5"/>
</g>

<!-- Layer: tongue — pink ellipse nestled at bottom of mouth -->
<ellipse cx="40" cy="46" rx="9" ry="5" fill="#E88888"/>
<!-- Tongue center line for dimension -->
<path d="M 40 42 Q 40 48, 40 50" fill="none"
      stroke="#D07070" stroke-width="0.5" opacity="0.4"/>
```

---

## 6. Ear

### Simplified Ear Structure

```xml
<!-- Layer: ear-base -->
<path d="M 10 20
         C 5 15, 0 25, 2 35
         C 3 42, 8 48, 10 45
         C 12 42, 8 38, 7 35
         C 6 30, 8 22, 10 20 Z"
      fill="#FDBCB4" stroke="#E8A088" stroke-width="0.5"/>

<!-- Layer: ear-inner -->
<path d="M 9 25
         C 6 28, 5 33, 7 37
         C 8 40, 9 42, 10 40"
      fill="none" stroke="#D4978A" stroke-width="0.8" opacity="0.5"/>
```

---

## 7. Aging Indicators

Faces change dramatically with age. Adjusting proportions, adding wrinkles, and modifying skin texture creates convincing age differences.

### Youth (Child: ages 2-10)

Children's faces follow different proportions than adults:

- **Large eyes** relative to face (eyes take up 35-40% of face width)
- **Small nose** — barely indicated, often just a dot or tiny shadow
- **Full, rounded cheeks** — face shape is rounder overall
- **High forehead** — eyes sit lower on the face (at 60% height, not 50%)
- **No wrinkles** — completely smooth skin
- **Soft features** — no sharp angles or defined jawline
- **Larger head-to-body ratio** than adults

```xml
<!-- Child face proportions — note larger eyes, smaller nose -->
<g id="child-face">
  <!-- Round face shape -->
  <circle cx="50" cy="52" r="38" fill="#FDBCB4"/>
  <!-- Chubby cheeks — low-opacity circles -->
  <circle cx="32" cy="58" r="10" fill="#F0A0A0" opacity="0.15"/>
  <circle cx="68" cy="58" r="10" fill="#F0A0A0" opacity="0.15"/>
  <!-- Eyes: large, placed lower on face (60% down) -->
  <!-- Each eye is ~18px wide on a 100px face — proportionally huge -->
  <ellipse cx="36" cy="56" rx="9" ry="8" fill="white" stroke="#3A2218" stroke-width="1.5"/>
  <ellipse cx="64" cy="56" rx="9" ry="8" fill="white" stroke="#3A2218" stroke-width="1.5"/>
  <circle cx="37" cy="57" r="5" fill="#4A90D9"/>
  <circle cx="65" cy="57" r="5" fill="#4A90D9"/>
  <circle cx="37" cy="57" r="2.5" fill="#0A0A0A"/>
  <circle cx="65" cy="57" r="2.5" fill="#0A0A0A"/>
  <!-- Nose: tiny, just a hint -->
  <circle cx="50" cy="64" r="2" fill="#E8B0A0" opacity="0.3"/>
  <!-- Mouth: small, soft -->
  <path d="M 42 72 Q 50 77, 58 72"
        fill="none" stroke="#D08080" stroke-width="1.2" stroke-linecap="round"/>
</g>
```

### Adult (ages 20-40)

Adult faces have balanced, proportioned features with minimal aging signs:

- **Proportioned features** — eyes at 50% of face height, standard ratios
- **Subtle nasolabial folds** — faint lines from nose corners to mouth corners
- **Defined jawline** — clear jaw structure visible
- **Potential early crow's feet** — very faint lines at eye corners (late 30s)
- **Full lips** — no thinning yet

```xml
<!-- Adult face with subtle aging — nasolabial folds and hint of crow's feet -->
<g id="adult-aging-hints">
  <!-- Nasolabial folds: lines from nose to mouth corners -->
  <!-- Very subtle in young adults, becoming more pronounced with age -->
  <path d="M 36 54 Q 34 62, 30 72"
        fill="none" stroke="#D4A898" stroke-width="0.6" opacity="0.25"/>
  <path d="M 64 54 Q 66 62, 70 72"
        fill="none" stroke="#D4A898" stroke-width="0.6" opacity="0.25"/>
  <!-- Early crow's feet at eye corners (age 35+) -->
  <g stroke="#D4A898" stroke-width="0.4" opacity="0.15" fill="none">
    <path d="M 18 48 L 14 46"/>
    <path d="M 18 50 L 14 50"/>
    <path d="M 82 48 L 86 46"/>
    <path d="M 82 50 L 86 50"/>
  </g>
  <!-- Defined jawline contour -->
  <path d="M 15 55 Q 20 80, 50 90 Q 80 80, 85 55"
        fill="none" stroke="#E0A898" stroke-width="0.5" opacity="0.3"/>
</g>
```

### Elderly (ages 65+)

Elderly faces accumulate multiple visible signs of aging. Layer these effects for convincing age portrayal:

- **Deep nasolabial folds** — prominent lines from nose to mouth
- **Forehead wrinkles** — horizontal lines across the forehead
- **Crow's feet** — lines radiating from outer eye corners
- **Under-eye bags** — slight puffiness and shadow below eyes
- **Thinning lips** — lips lose volume, become narrower
- **Jowls** — jawline softens, skin sags below jaw
- **Neck lines** — horizontal creases on the neck
- **Deeper eye sockets** — more shadow around the eyes

```xml
<!-- Elderly wrinkle system — thin, low-opacity paths layered for realism -->
<g id="elderly-wrinkles">

  <!-- Forehead wrinkles: 3-4 horizontal lines with varying depth -->
  <g stroke="#C4988A" fill="none" stroke-linecap="round">
    <path d="M 25 22 Q 38 20, 50 20 Q 62 20, 75 22"
          stroke-width="0.7" opacity="0.35"/>
    <path d="M 27 27 Q 40 25, 50 25 Q 60 25, 73 27"
          stroke-width="0.6" opacity="0.3"/>
    <path d="M 29 32 Q 42 30, 50 30 Q 58 30, 71 32"
          stroke-width="0.5" opacity="0.25"/>
  </g>

  <!-- Crow's feet: lines radiating from outer eye corners -->
  <!-- Left eye -->
  <g stroke="#C4988A" fill="none" stroke-linecap="round">
    <path d="M 16 46 L 10 42" stroke-width="0.5" opacity="0.35"/>
    <path d="M 16 48 L 9 48" stroke-width="0.5" opacity="0.3"/>
    <path d="M 16 50 L 10 54" stroke-width="0.4" opacity="0.25"/>
  </g>
  <!-- Right eye -->
  <g stroke="#C4988A" fill="none" stroke-linecap="round">
    <path d="M 84 46 L 90 42" stroke-width="0.5" opacity="0.35"/>
    <path d="M 84 48 L 91 48" stroke-width="0.5" opacity="0.3"/>
    <path d="M 84 50 L 90 54" stroke-width="0.4" opacity="0.25"/>
  </g>

  <!-- Deep nasolabial folds: more pronounced than adult -->
  <path d="M 36 54 Q 32 64, 28 74"
        fill="none" stroke="#C4988A" stroke-width="1" opacity="0.4"
        stroke-linecap="round"/>
  <path d="M 64 54 Q 68 64, 72 74"
        fill="none" stroke="#C4988A" stroke-width="1" opacity="0.4"
        stroke-linecap="round"/>

  <!-- Under-eye bags: slight puffiness shown as shadow + highlight -->
  <!-- Left eye bag -->
  <path d="M 24 54 Q 32 58, 42 55"
        fill="none" stroke="#C4988A" stroke-width="0.6" opacity="0.3"/>
  <path d="M 25 56 Q 33 59, 41 57"
        fill="none" stroke="white" stroke-width="0.3" opacity="0.1"/>
  <!-- Right eye bag -->
  <path d="M 58 55 Q 68 58, 76 54"
        fill="none" stroke="#C4988A" stroke-width="0.6" opacity="0.3"/>
  <path d="M 59 57 Q 67 59, 75 56"
        fill="none" stroke="white" stroke-width="0.3" opacity="0.1"/>

  <!-- Jowls: jawline softening, skin sags below jaw -->
  <path d="M 20 75 Q 18 82, 22 86"
        fill="none" stroke="#D4A898" stroke-width="0.6" opacity="0.25"/>
  <path d="M 80 75 Q 82 82, 78 86"
        fill="none" stroke="#D4A898" stroke-width="0.6" opacity="0.25"/>

  <!-- Lip thinning: elderly lips are narrower -->
  <!-- Compare with adult lip path: vertical extent is reduced -->
  <!-- Upper lip, thinner -->
  <path d="M 34 74 C 38 73, 42 71, 50 72 C 58 71, 62 73, 66 74
           C 62 75, 54 75.5, 50 75 C 46 75.5, 38 75, 34 74 Z"
        fill="#C4908A"/>
  <!-- Lower lip, thinner -->
  <path d="M 34 74 C 38 76, 42 79, 50 80 C 58 79, 62 76, 66 74
           C 62 75, 54 75.5, 50 75 C 46 75.5, 38 75, 34 74 Z"
        fill="#B88080"/>

  <!-- Neck lines: horizontal creases -->
  <g stroke="#D4A898" fill="none" stroke-linecap="round">
    <path d="M 30 96 Q 50 94, 70 96" stroke-width="0.5" opacity="0.25"/>
    <path d="M 32 100 Q 50 98, 68 100" stroke-width="0.4" opacity="0.2"/>
  </g>

</g>
```

---

## 8. Freckles, Moles, and Skin Detail

Skin details add personality and realism. Apply these as the final layer over completed facial features.

### Freckles

Freckles are small, randomly scattered dots concentrated on the cheeks and nose bridge. Vary size and opacity for natural appearance.

```xml
<!-- Freckle pattern — scatter across cheeks and nose bridge -->
<!-- Tip: randomize positions slightly each time for natural look -->
<g id="freckles" fill="#A0784A" opacity="0.35">
  <!-- Left cheek cluster -->
  <circle cx="28" cy="56" r="0.8"/>
  <circle cx="32" cy="54" r="1.0"/>
  <circle cx="26" cy="60" r="0.7"/>
  <circle cx="34" cy="58" r="0.9"/>
  <circle cx="30" cy="52" r="0.6"/>
  <circle cx="27" cy="63" r="1.1"/>
  <circle cx="35" cy="55" r="0.7"/>
  <circle cx="31" cy="61" r="0.8"/>
  <!-- Nose bridge -->
  <circle cx="46" cy="50" r="0.7"/>
  <circle cx="50" cy="48" r="0.9"/>
  <circle cx="54" cy="50" r="0.6"/>
  <circle cx="48" cy="52" r="0.8"/>
  <circle cx="52" cy="51" r="0.7"/>
  <!-- Right cheek cluster -->
  <circle cx="68" cy="54" r="1.0"/>
  <circle cx="72" cy="56" r="0.8"/>
  <circle cx="66" cy="58" r="0.9"/>
  <circle cx="74" cy="60" r="0.7"/>
  <circle cx="70" cy="52" r="0.6"/>
  <circle cx="73" cy="63" r="1.1"/>
  <circle cx="65" cy="55" r="0.7"/>
  <circle cx="69" cy="61" r="0.8"/>
</g>
```

### Moles / Beauty Marks

Moles are single darker spots placed at specific, intentional positions. Classic placements include above the lip, on the cheek, or near the eye.

```xml
<!-- Moles at classic beauty mark positions -->
<g id="moles" fill="#6B4A3A">
  <!-- Above upper lip (Marilyn Monroe style) -->
  <circle cx="58" cy="68" r="1.5"/>
  <!-- High on cheekbone -->
  <circle cx="72" cy="50" r="1.2"/>
  <!-- Near outer eye corner (optional) -->
  <!-- <circle cx="78" cy="44" r="1.0"/> -->
</g>
```

### Blush

Blush adds warmth and life to cheeks. Use large, soft, low-opacity circles or radial gradients for a natural flush.

```xml
<!-- Cheek blush — soft radial circles -->
<defs>
  <radialGradient id="blush-grad" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#FF8888" stop-opacity="0.2"/>
    <stop offset="70%" stop-color="#FF8888" stop-opacity="0.08"/>
    <stop offset="100%" stop-color="#FF8888" stop-opacity="0"/>
  </radialGradient>
</defs>
<!-- Left cheek blush -->
<circle cx="30" cy="62" r="14" fill="url(#blush-grad)"/>
<!-- Right cheek blush -->
<circle cx="70" cy="62" r="14" fill="url(#blush-grad)"/>

<!-- Alternative: simple circle blush for cartoon styles -->
<!-- <circle cx="30" cy="62" r="8" fill="#FF8080" opacity="0.15"/> -->
<!-- <circle cx="70" cy="62" r="8" fill="#FF8080" opacity="0.15"/> -->
```

### Skin Texture (Subtle Noise)

For semi-realistic or realistic styles, a very subtle noise filter adds skin texture that prevents the flat-plastic look.

```xml
<!-- Subtle skin texture using SVG noise filter -->
<defs>
  <filter id="skin-texture" x="0%" y="0%" width="100%" height="100%">
    <!-- Very fine noise — barely visible but adds organic feel -->
    <feTurbulence type="fractalNoise" baseFrequency="0.9"
                  numOctaves="4" seed="42" result="noise"/>
    <!-- Reduce noise intensity dramatically -->
    <feColorMatrix type="saturate" values="0" in="noise" result="gray-noise"/>
    <!-- Blend noise over the face at very low opacity -->
    <feBlend mode="overlay" in="SourceGraphic" in2="gray-noise"/>
  </filter>
</defs>

<!-- Apply to the face group — wrap all skin-colored elements -->
<g filter="url(#skin-texture)" opacity="0.97">
  <!-- ... face shape, cheeks, etc. go here ... -->
</g>
```

---

## 9. Practical Checklist

Follow this order when constructing a face to ensure consistent, professional results:

1. **Choose face shape** based on character personality and body type
   - Round → friendly/youthful, Square → strong/determined, Heart → romantic/expressive
2. **Set eye style** matching the overall illustration style
   - Cartoon → simple dots/ovals, Semi-realistic → iris detail + highlights, Anime → large with dramatic highlights
3. **Place features using proportion guidelines**
   - Eyes at vertical center of the head (50%)
   - Nose at 2/3 down from top of head (~66%)
   - Mouth at 3/4 down from top of head (~75%)
   - Ears align with eye-line to nose-tip
4. **Add expression** through eyebrows and mouth shape
   - Eyebrows are the #1 long-distance emotion communicator
   - Mouth shape reinforces the emotion set by brows
5. **Apply nose and ear details** appropriate to the style level
   - Minimal styles: shadow-only nose, no ears unless profile view
   - Detailed styles: full bridge, nostril shape, ear structure
6. **Apply age indicators** if the character is not a default young adult
   - Children: enlarge eyes, shrink nose, round everything
   - Elderly: add wrinkles layer by layer, thin the lips, soften the jawline
7. **Add skin details last** — blush, freckles, moles
   - These are personality touches applied over completed features
8. **Verify in preview** at multiple sizes
   - Features should be readable at small sizes (64×64 thumbnail)
   - Details should hold up at large sizes (full-screen display)
   - Test with `preview_as_png` at different DPI values
