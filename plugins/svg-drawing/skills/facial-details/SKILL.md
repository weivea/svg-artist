---
name: facial-details
description: "Techniques for drawing precise facial features in SVG: eyes, mouths, noses, ears. Use when the detail-painter agent is working on face elements."
---

# Facial Details

## Eyes

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

### Realistic Eye Differences
- Iris has visible fibrous texture (radial thin lines)
- Sclera shows subtle blood vessel hints (very faint pink lines)
- More complex highlight reflections (window shape, multiple catchlights)
- Eyelid crease line above the eye
- Subtle skin tone gradient around eye socket

### Eye Expression Variations
| Expression | Upper lid | Lower lid | Iris visible | Pupil size |
|-----------|-----------|-----------|-------------|------------|
| Neutral | Mid-curve | Gentle curve | 70-80% | Normal |
| Wide/Surprised | High arch | Drops slightly | 90-100% | Small |
| Happy/Smile | Drops/curves down | Rises up | 50-60% | Normal |
| Angry | Low, angled inward | Rises slightly | 60-70% | Small |
| Sleepy | Very low | Normal | 30-40% | Normal |

## Mouth / Lips

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

## Nose

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

## Ear

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
