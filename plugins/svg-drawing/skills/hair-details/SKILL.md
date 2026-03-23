---
name: hair-details
description: "Techniques for drawing detailed hair in SVG: strand groups, highlights, styles from anime to realistic."
---

# Hair Details

## Strand Group Technique

Hair is drawn as groups of overlapping paths, not individual strands.

### Layer Structure (back to front)
1. **Base mass:** Overall hair silhouette as a filled path
2. **Shadow sections:** Darker-colored path groups for depth
3. **Mid-tone strands:** Main visible strand groups
4. **Highlight bands:** Lighter strips following hair flow
5. **Edge wisps:** Fine loose strands at hairline and tips

```xml
<!-- Anime hair: flowing side-swept bangs -->
<defs>
  <linearGradient id="hair-base" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="#2A1810"/>
    <stop offset="100%" stop-color="#4A2C1A"/>
  </linearGradient>
  <linearGradient id="hair-highlight" x1="0.3" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
    <stop offset="40%" stop-color="rgba(255,255,255,0.15)"/>
    <stop offset="60%" stop-color="rgba(255,255,255,0.15)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>
</defs>

<!-- Layer: hair-base-mass -->
<path d="M 30 10 C 20 5, 10 15, 15 40
         C 18 55, 25 65, 30 70
         L 70 70 C 75 65, 82 55, 85 40
         C 90 15, 80 5, 70 10
         Q 60 5, 50 8 Q 40 5, 30 10 Z"
      fill="url(#hair-base)"/>

<!-- Layer: shadow-sections -->
<path d="M 20 30 C 22 40, 25 55, 30 65
         C 32 55, 28 40, 25 30 Z"
      fill="#1A0E08" opacity="0.4"/>

<!-- Layer: strand-group-1 (bangs) -->
<path d="M 35 12 C 30 15, 28 25, 25 40"
      fill="none" stroke="#5A3820" stroke-width="3" stroke-linecap="round"/>
<path d="M 42 10 C 38 14, 35 22, 32 38"
      fill="none" stroke="#5A3820" stroke-width="2.5" stroke-linecap="round"/>

<!-- Layer: highlight-band -->
<path d="M 45 12 C 42 20, 40 35, 42 55"
      fill="none" stroke="url(#hair-highlight)" stroke-width="8" stroke-linecap="round"/>
```

## Hair Style References

| Style | Key Features | Strand Width | Highlight Approach |
|-------|-------------|-------------|-------------------|
| Anime | Bold sections, sharp highlights | 2-4px | Hard-edge white bands |
| Realistic | Many thin overlapping strands | 0.5-1.5px | Gradient overlay |
| Cartoon | Simple mass + few accent lines | 3-6px | None or single spot |
| Watercolor | Soft edges, color bleeding | Variable | Wet-edge effect |
