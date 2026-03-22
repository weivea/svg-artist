# SVG Artist Skill Upgrade Design

## Problem

The existing 5 drawing skills (svg-fundamentals, bezier-and-curves, color-and-gradients, composition, layer-workflow) are syntactically complete but conceptually shallow. Claude can draw SVG, but doesn't think like a designer — it jumps straight to execution without clarifying requirements, establishing mood, or managing visual hierarchy.

## Solution

Two-pronged approach: add 3 new professional-level skills + deepen all 5 existing skills.

## New Skills (3)

### 1. `design-process` — Design Thinking Before Drawing

Purpose: Transform Claude from "receive prompt → draw immediately" to "receive prompt → clarify → explore → confirm → draw."

Content:
- **Requirements clarification framework**: Questions to ask about style (realistic / flat / watercolor / minimal), audience (children / brand / personal art), mood (warm / cold / playful / somber), context (standalone / series / UI element)
- **Visual concept phase**: Establish color direction, composition ratio, element priority hierarchy — form a complete mental image before first stroke
- **Style exploration**: Present 2-3 visual directions for the same subject (e.g., minimal vs. detailed vs. illustrative) with trade-off descriptions
- **Iteration strategy**: Decision framework for major revisions vs. refinements. When user says "make it more lively," systematically adjust saturation, contrast, element density, and color temperature

Integration: Becomes mandatory Step 2 in system prompt workflow (after reading skills, before planning layers).

### 2. `visual-hierarchy` — Guiding the Viewer's Eye

Purpose: Teach Claude to control where the viewer looks and in what order.

Content:
- **Visual weight system**: Size, color saturation, value contrast, detail density, isolation, position — how to quantify and balance
- **Focal point control**: Primary / secondary / tertiary element contrast relationships. Clear focal point vs. confused composition comparison
- **Gestalt principles in SVG**: Proximity, similarity, continuity, closure, figure-ground — not just theory but concrete SVG implementation patterns
- **De-emphasis techniques**: How to push backgrounds back through combined saturation reduction + detail simplification + opacity adjustment + edge softening
- **7 contrast tools**: Size, color, shape, value, texture, direction, density — and how to combine them

### 3. `mood-atmosphere` — Emotional Design

Purpose: Make drawings communicate emotion through intentional visual choices.

Content:
- **Color temperature spectrum**: Warm ≠ just "happy"; cool ≠ just "sad" — nuanced emotional mapping (warm can mean cozy, urgent, or dangerous depending on saturation and context)
- **Saturation-energy relationship**: High saturation = vibrant/childlike; low saturation = somber/vintage/sophisticated
- **Contrast-tension relationship**: High contrast = dramatic/modern; low contrast = gentle/classical/ethereal
- **Three-point lighting in SVG**: Key/fill/back light implementation with gradients and opacity layers
- **Time-of-day associations**: Dawn/noon/dusk/night color palettes and shadow directions
- **Atmosphere recipes**: Reusable templates — "warm afternoon" = warm palette + medium saturation + soft shadows + diffused light; "mysterious night" = cool palette + low saturation + high contrast + rim lighting

## Existing Skill Enhancements (5)

### svg-fundamentals
Add:
- SVG filters (feGaussianBlur, feDropShadow, feColorMatrix, feTurbulence) with practical examples
- Advanced masking (gradient masks for soft fading edges)
- Text-on-path for curved text
- Accessibility attributes (aria-label, role)

### bezier-and-curves
Add:
- Perceptual curve quality — what makes a curve look "right" vs. "off"
- Reverse-engineering curves from reference images
- Common body/face/natural contour curve library
- Visual debugging: how to fix a curve that doesn't look smooth

### color-and-gradients
Add:
- Color psychology (cultural and contextual associations)
- Palette generation algorithms (given base color → generate harmony)
- Color grading workflows (sepia, desaturation, hue shift)
- WCAG accessibility contrast ratios
- Banding avoidance in gradients

### composition
Add:
- Systematic visual weight analysis (saturation × size × contrast)
- Golden ratio and dynamic symmetry (beyond rule of thirds)
- Narrative composition (how layout tells a story)
- Basic character proportions and facial expression system
- Advanced depth cues (texture gradient, linear perspective, interposition)

### layer-workflow
Add:
- Large scene management (50+ layers organization)
- Non-destructive workflow thinking
- Performance optimization awareness (path simplification, defs reuse, element count)
- Cross-references to new skills (design-process, visual-hierarchy, mood-atmosphere)

## System Prompt Update

Update `pty-manager.ts` systemPrompt workflow:

```
1. PREPARE: Read ALL drawing skills (8 skills) to refresh techniques.
2. DESIGN: Follow design-process skill — clarify requirements, explore
   style directions, confirm with user before drawing.
3. Plan layer structure with mood-atmosphere and visual-hierarchy in mind.
4. Create layers one by one with add_layer.
5. Self-review with preview_as_png. Fix issues found.
6. Use get_element_bbox for precise layout positioning.
```

Update `layerGuide` to reference all 8 skills.

## Skill Cross-References

```
design-process ──→ mood-atmosphere (decides emotion)
               ──→ visual-hierarchy (decides emphasis)
               ──→ color-and-gradients (decides palette)

visual-hierarchy ──→ composition (guides layout)
                 ──→ layer-workflow (guides layer ordering)

mood-atmosphere ──→ color-and-gradients (guides color choices)
                ──→ composition (guides lighting/shadow)
```

Each skill references related skills with "See [skill-name]" pointers.

## File Changes

New files:
- `plugins/svg-drawing/skills/design-process/SKILL.md`
- `plugins/svg-drawing/skills/visual-hierarchy/SKILL.md`
- `plugins/svg-drawing/skills/mood-atmosphere/SKILL.md`

Modified files:
- `plugins/svg-drawing/skills/svg-fundamentals/SKILL.md`
- `plugins/svg-drawing/skills/bezier-and-curves/SKILL.md`
- `plugins/svg-drawing/skills/color-and-gradients/SKILL.md`
- `plugins/svg-drawing/skills/composition/SKILL.md`
- `plugins/svg-drawing/skills/layer-workflow/SKILL.md`
- `server/pty-manager.ts` (system prompt update)

## Success Criteria

- Claude reads all 8 skills before drawing
- Claude asks clarifying questions before starting (via design-process)
- Drawings show clear visual hierarchy (focal point, supporting elements, background)
- Drawings convey intentional mood through color, lighting, and contrast choices
- Existing SVG techniques are enriched with professional-level depth
