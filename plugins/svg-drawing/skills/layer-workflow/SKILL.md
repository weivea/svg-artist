---
name: layer-workflow
description: "Layer management workflow, naming conventions, tool usage guide, and self-review process for SVG artwork. Use when organizing layers or deciding which tool to use."
---

# Layer Workflow

## Layer Naming Convention

All layers must follow the naming pattern: `layer-<description>`

### Naming Rules

- **Prefix:** Always start with `layer-`
- **Descriptive:** Use clear, descriptive names that indicate content
- **Lowercase:** Use lowercase with hyphens for multi-word names
- **Numbered variants:** Append `-N` for multiple instances of similar elements

### Examples

```
layer-sky              — background sky gradient
layer-sun              — sun element
layer-clouds           — cloud group
layer-mountains-far    — distant mountain range
layer-mountains-near   — near mountain range
layer-ground           — ground/terrain
layer-tree-1           — first tree
layer-tree-2           — second tree
layer-tree-3           — third tree
layer-house            — house structure
layer-river            — river/water element
layer-flowers          — flower details
layer-person           — character/figure
layer-shadow-tree-1    — shadow for tree-1
layer-fog              — fog/mist overlay
layer-vignette         — vignette darkening effect
```

### Anti-Patterns (Don't Do This)

```
❌ tree1           — missing "layer-" prefix
❌ layer1          — not descriptive
❌ layer-stuff     — too vague
❌ LAYER-SKY       — not lowercase
❌ layer_sky       — use hyphens, not underscores
```

## Layer Organization Strategy

### Back-to-Front Ordering

SVG renders elements in document order. Layers defined first appear behind layers defined later. **Always organize layers from bottom (background) to top (foreground).**

### Standard Layer Stack

For a typical scene, organize layers in this order:

```
1. layer-sky           ← bottommost (rendered first, appears farthest back)
2. layer-celestial     ← sun, moon, stars
3. layer-clouds        ← atmospheric elements
4. layer-mountains-far ← distant terrain
5. layer-mountains-mid ← middle terrain
6. layer-midground     ← medium-distance objects
7. layer-ground        ← foreground terrain
8. layer-shadows       ← ground shadows
9. layer-subject       ← main subject (tree, house, person)
10. layer-details      ← small foreground details
11. layer-effects      ← lighting, fog, vignette (topmost)
```

### Layer Groups by Scene Type

**Landscape:**
```
layer-sky → layer-sun → layer-clouds → layer-mountains → layer-hills →
layer-ground → layer-trees → layer-flowers → layer-fog
```

**Portrait/Character:**
```
layer-background → layer-shadow → layer-body → layer-clothing →
layer-face → layer-hair → layer-accessories → layer-effects
```

**Still Life:**
```
layer-background → layer-surface → layer-shadow → layer-object-back →
layer-object-main → layer-object-front → layer-highlights
```

**Cityscape:**
```
layer-sky → layer-clouds → layer-buildings-far → layer-buildings-mid →
layer-street → layer-buildings-near → layer-vehicles → layer-people → layer-lights
```

## Work Order

### The Golden Rule: Background First, Details Last

Always build a scene from back to front. This ensures:
1. Each layer correctly overlaps the one behind it
2. You can see context when adding foreground elements
3. Shadows and effects are placed correctly relative to objects

### Recommended Workflow

```
Phase 0: Research & Design (for non-trivial drawings)
  → Dispatch design-advisor agent for visual reference research
  → Select from 2-3 proposed approaches
  → Lock in palette, composition strategy, and layer plan

Phase 1: Foundation
  1. Set up the canvas (viewBox dimensions)
  2. Define shared resources (gradients, patterns) using manage_defs
  3. Draw the background (sky, base color)
  4. preview_as_png → Confirm foundation

Phase 2: Construction (build back to front)
  5. Add distant elements (mountains, horizon)
  6. Add midground elements (hills, water)
  7. Add ground/terrain
  8. Add main subjects (buildings, trees, characters)
  9. Add shadows for subjects
  10. Add secondary subjects
  Mark areas needing fine detail for Phase 3

Phase 3: Detail & Polish
  → Dispatch detail-painter agent for fine details (faces, hands, hair, textures)
  → Review scratch canvas results, merge into main drawing
  11. Apply filters and effects
  12. Add atmospheric effects (fog, vignette)
  13. preview_as_png → Full visual review

Phase 4: Critique & Evolve
  14. preview_as_png → 7-dimension self-critique
  → Dispatch bootstrap-reviewer agent for self-improvement analysis
  15. Fix issues, implement improvements
  16. Final preview → Confirm artwork is great
```

## Self-Review Workflow

After completing major phases, always perform a self-review cycle:

### The Review Loop

```
1. preview_as_png → View the current state of the artwork
2. Analyze:
   - Are proportions correct?
   - Is the color balance good?
   - Are elements properly positioned?
   - Is there sufficient contrast?
   - Does depth/layering look right?
   - Are there any visual artifacts?
3. Fix: Make adjustments using update_layer or transform_layer
4. preview_as_png → Verify the fix
5. Repeat until satisfied
```

### What to Check

**Composition:**
- Is the focal point clear?
- Is the scene balanced?
- Are layers in correct z-order?

**Color:**
- Do colors harmonize?
- Is there sufficient contrast?
- Do distant elements fade appropriately?

**Proportions:**
- Are relative sizes realistic?
- Do elements fit the scene scale?
- Are repeated elements varied enough?

**Technical:**
- Are elements inside the viewBox?
- Are there any gaps between elements that should be seamless?
- Do gradients render correctly?

## Precise Layout with get_element_bbox

Use `get_element_bbox` to get exact coordinates and dimensions of existing elements, then calculate positions for new elements.

### Common Positioning Patterns

**Center an element on another:**
```
1. bbox = get_element_bbox("layer-target")
2. center_x = bbox.x + bbox.width / 2
3. center_y = bbox.y + bbox.height / 2
4. Place new element at (center_x, center_y)
```

**Place an element above another:**
```
1. bbox = get_element_bbox("layer-base")
2. top_center_x = bbox.x + bbox.width / 2
3. above_y = bbox.y - gap
4. Place new element at (top_center_x, above_y)
```

**Place an element to the right of another:**
```
1. bbox = get_element_bbox("layer-left-item")
2. right_x = bbox.x + bbox.width + gap
3. Place new element at (right_x, bbox.y)
```

**Align shadows with objects:**
```
1. bbox = get_element_bbox("layer-object")
2. shadow_x = bbox.x + bbox.width / 2 + offset_x
3. shadow_y = bbox.y + bbox.height
4. Add shadow ellipse at (shadow_x, shadow_y)
```

### Example: Placing a Bird on a Branch

```
1. branch_bbox = get_element_bbox("layer-branch")
   → { x: 100, y: 200, width: 150, height: 10 }
2. bird_x = branch_bbox.x + branch_bbox.width * 0.7   → 205
3. bird_y = branch_bbox.y - 15                          → 185
4. add_layer("layer-bird", bird_svg_at(205, 185))
```

## Tool Usage Guide

### `add_layer` — Create New Elements

**When to use:**
- Adding a new visual element to the scene
- Creating the initial version of any layer

**Best practices:**
- Always use the `layer-<description>` naming convention
- Include the complete SVG content for the layer
- Add layers in back-to-front order when possible

```
add_layer("layer-sky", '<rect width="800" height="600" fill="url(#sky-gradient)" />')
add_layer("layer-sun", '<circle cx="650" cy="100" r="50" fill="#FDD835" />')
```

### `update_layer` — Modify Content

**When to use:**
- Changing the SVG content of an existing layer
- Fixing visual issues after review
- Adding details to an existing element

**Best practices:**
- Use when the content itself needs to change (not just position/size)
- Provide the complete new SVG content for the layer
- Don't use this for position changes — use `transform_layer` instead

```
update_layer("layer-sun", '<g><circle cx="650" cy="100" r="50" fill="#FDD835" /><circle cx="650" cy="100" r="80" fill="rgba(255,215,0,0.2)" /></g>')
```

### `transform_layer` — Position and Size Changes

**When to use:**
- Moving a layer to a different position
- Scaling a layer up or down
- Rotating a layer
- Any geometric transformation that doesn't change content

**Best practices:**
- Use `translate(x, y)` for repositioning
- Use `scale(factor)` for resizing (apply from the element's center)
- Combine transforms: `translate(x, y) scale(s) rotate(angle)`
- For centering a scale: `translate(cx, cy) scale(s) translate(-cx, -cy)`

```
transform_layer("layer-tree-2", "translate(200, 50) scale(0.8)")
transform_layer("layer-bird", "translate(300, 150) rotate(-15, 300, 150)")
```

### `duplicate_layer` — Copy Elements

**When to use:**
- Creating multiple similar elements (trees in a forest, stars, flowers)
- Making a backup before major changes
- Creating shadow copies of objects

**Best practices:**
- Duplicate first, then transform the copy
- Give the copy a meaningful name (not just incrementing numbers blindly)
- Modify duplicates to add variation (different colors, slight shape changes)

```
duplicate_layer("layer-tree-1", "layer-tree-2")
transform_layer("layer-tree-2", "translate(200, 30) scale(0.7)")
duplicate_layer("layer-tree-1", "layer-tree-3")
transform_layer("layer-tree-3", "translate(-150, 20) scale(0.85)")
```

### `set_layer_opacity` — Depth and Transparency

**When to use:**
- Creating atmospheric depth (distant objects more transparent)
- Making shadow layers semi-transparent
- Creating fog or mist effects
- Subtle background elements

**Best practices:**
- Background/far elements: opacity 0.3–0.5
- Midground elements: opacity 0.6–0.8
- Foreground elements: opacity 0.9–1.0
- Shadows: opacity 0.1–0.3
- Fog/mist overlays: opacity 0.2–0.4

```
set_layer_opacity("layer-mountains-far", 0.4)
set_layer_opacity("layer-mountains-near", 0.7)
set_layer_opacity("layer-shadow", 0.15)
set_layer_opacity("layer-fog", 0.3)
```

### `manage_defs` — Gradients, Patterns, and Filters

**When to use:**
- Adding gradient definitions (linear or radial)
- Adding pattern definitions for textures
- Adding filter definitions
- Adding reusable symbols or clip paths

**Best practices:**
- Define defs early in the workflow (Phase 1)
- Use meaningful IDs: `sky-gradient`, `water-pattern`, `shadow-filter`
- Reference in layers with `url(#id)` syntax
- One defs block can contain multiple definitions

```
manage_defs("add", '<linearGradient id="sky-gradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1a1a2e" /><stop offset="100%" stop-color="#e94560" /></linearGradient>')
```

### `preview_as_png` — Visual Review

**When to use:**
- After completing a major phase of work
- After fixing a visual issue
- Before moving to a new phase
- Final review before declaring artwork complete

**Best practices:**
- Preview after every 3-5 layer additions
- Always preview after transform or opacity changes
- Use preview to catch issues early before building on top of problems

## Common Mistakes to Avoid

### Layer Ordering Mistakes

❌ **Adding foreground before background:**
The foreground layer will be rendered behind layers added later. Always add in back-to-front order, or use layer reordering if available.

❌ **Forgetting shadows go behind objects:**
```
Wrong:  add_layer("layer-tree") → add_layer("layer-tree-shadow")
Right:  add_layer("layer-tree-shadow") → add_layer("layer-tree")
```

### Transform Mistakes

❌ **Scaling from origin instead of center:**
`scale(0.5)` scales toward (0,0), moving the element. Use:
`translate(cx,cy) scale(0.5) translate(-cx,-cy)` to scale in place.

❌ **Forgetting that transforms are cumulative:**
Each `transform_layer` call replaces the previous transform, not adds to it. Include all desired transforms in a single call.

### Content Mistakes

❌ **Not closing paths:**
Forgetting `Z` at the end of a filled path creates visual gaps.

❌ **Hardcoding positions for repeated elements:**
Use `duplicate_layer` + `transform_layer` instead of manually copying SVG with different coordinates.

❌ **Making elements too small or too large for the viewBox:**
Always check that elements fit within the viewBox dimensions. Use `get_element_bbox` to verify.

### Workflow Mistakes

❌ **Not previewing after changes:**
Always use `preview_as_png` after significant modifications. Small issues compound quickly.

❌ **Modifying defs after layers reference them:**
Changing a gradient ID or removing a def will break layers that reference it. Update references when modifying defs.

❌ **Over-detailing background elements:**
Background elements should be simpler (fewer path points, less detail) since they're small and partially obscured. Save detail for foreground elements.

### Color Mistakes

❌ **Using full saturation everywhere:**
Full-saturation colors (rgb 255,0,0) look artificial. Desaturate slightly for natural appearance.

❌ **Same opacity for all depth levels:**
Distant elements should be more transparent/lighter than near elements. Use `set_layer_opacity` to create depth.

❌ **Not defining gradients for large fills:**
Large flat-color areas look dull. Even a subtle gradient (e.g., 5% lighter at top) adds life.

## Quick Reference: Tool Decision Tree

```
Need to...
├── Add something new?
│   ├── New visual element → add_layer
│   └── New gradient/pattern → manage_defs
├── Change something existing?
│   ├── Change what it looks like → update_layer
│   ├── Change where/how big it is → transform_layer
│   └── Change transparency → set_layer_opacity
├── Copy something?
│   └── Make a variant → duplicate_layer + transform_layer
└── Check your work?
    └── See current state → preview_as_png
```

## Workflow Example: Complete Scene

Here's a complete workflow for drawing a sunset landscape:

```
1. manage_defs("add", sky-gradient + sun-glow gradient)
2. add_layer("layer-sky", sky rectangle with gradient)
3. add_layer("layer-sun", sun circles with glow)
4. preview_as_png → check sky looks good

5. add_layer("layer-mountains-far", distant mountain path)
6. set_layer_opacity("layer-mountains-far", 0.4)
7. add_layer("layer-mountains-near", near mountain path)
8. set_layer_opacity("layer-mountains-near", 0.7)
9. preview_as_png → check mountain depth

10. add_layer("layer-ground", green foreground terrain)
11. add_layer("layer-tree-1", first tree group)
12. duplicate_layer("layer-tree-1", "layer-tree-2")
13. transform_layer("layer-tree-2", "translate(200, 20) scale(0.7)")
14. duplicate_layer("layer-tree-1", "layer-tree-3")
15. transform_layer("layer-tree-3", "translate(-180, 10) scale(0.85)")
16. preview_as_png → check tree placement

17. add_layer("layer-shadow-tree-1", shadow ellipse for tree 1)
18. add_layer("layer-flowers", foreground flower details)
19. manage_defs("add", fog gradient)
20. add_layer("layer-fog", fog rectangle overlay)
21. set_layer_opacity("layer-fog", 0.25)
22. preview_as_png → final review

23. Done!
```

## Professional Design Critique Framework

Replace vague "does it look right?" reviews with a structured 7-dimension assessment. After each major phase, evaluate the artwork on these seven criteria:

### The 7 Dimensions

#### 1. Purpose — Does it communicate the intended message?

Ask: What should the viewer feel or understand? Is that coming through?

```
Review checklist:
- Can you identify the subject within 2 seconds?
- Does the mood match the intent? (e.g., peaceful scene shouldn't feel chaotic)
- Is the theme consistent throughout? (e.g., all elements fit the "winter" theme)
- Would someone unfamiliar with the prompt understand what this depicts?
```

#### 2. Hierarchy — Is the most important element most prominent?

Ask: Where does the eye go first? Is that the right place?

```
Review checklist:
- The focal element should be the LARGEST, most DETAILED, or most COLORFUL
- Supporting elements should be smaller, simpler, or more muted
- Check: cover the main subject — does the rest of the scene still make sense as support?
- No secondary element should compete with the primary subject for attention
```

#### 3. Unity — Do all elements feel like they belong together?

Ask: Does everything look like it's part of the same artwork?

```
Review checklist:
- Consistent color palette (3-5 colors, not random)
- Consistent style (don't mix realistic and cartoon in one scene)
- Consistent lighting direction (shadows all point the same way)
- Consistent level of detail (similar complexity across similar-depth elements)
- Shared visual language (similar line weights, curve styles, shape vocabulary)
```

#### 4. Variety — Is there enough visual interest?

Ask: Is there enough difference to prevent monotony?

```
Review checklist:
- Variety in sizes (not everything the same scale)
- Variety in shapes (mix of organic curves and geometric shapes)
- Variety in spacing (not everything equidistant)
- Variety in color temperature (some warm, some cool areas)
- HOWEVER: variety should serve unity — varied within a coherent system
```

#### 5. Proportion — Are size relationships intentional and effective?

Ask: Do the relative sizes make visual sense?

```
Review checklist:
- Foreground objects larger than background objects
- Related elements are proportional (a person's head isn't bigger than a nearby house)
- Intentional exaggeration is clearly stylistic, not accidental
- Negative space is proportional (not too cramped, not too sparse)
- Elements fit comfortably within the viewBox with appropriate margins
```

#### 6. Rhythm — Is there visual rhythm through repetition and pattern?

Ask: Is there a visual "beat" that moves the eye through the composition?

```
Review checklist:
- Repeated elements create visual rhythm (row of trees, pattern of windows)
- Rhythm has variation (not perfectly mechanical — slight differences)
- Leading lines guide the eye through the composition in a deliberate path
- The eye can "travel" through the scene without getting stuck
- Spacing between repeated elements varies subtly (closer in background, wider in foreground)
```

#### 7. Emphasis — Is the focal point clear and compelling?

Ask: Is there one clear star of the show?

```
Review checklist:
- One element stands out through contrast (color, size, detail, or isolation)
- The focal point is positioned at a strong composition point (rule of thirds, dynamic symmetry)
- Supporting elements point toward or frame the focal point
- The focal point has the most detail and strongest colors
- Remove the focal point mentally — does the scene feel incomplete? (It should)
```

### Using the Framework in Practice

After `preview_as_png`, run through a quick 7-point check:

```
Quick review template:
1. Purpose:   ✓ Message clear / ✗ Unclear, need to [fix]
2. Hierarchy:  ✓ Focal point dominant / ✗ [Element] competes, reduce its [size/color/detail]
3. Unity:      ✓ Cohesive / ✗ [Element] feels out of place, adjust [property]
4. Variety:    ✓ Enough interest / ✗ Too uniform, vary [sizes/shapes/colors]
5. Proportion: ✓ Relationships work / ✗ [Element] too [large/small] relative to [other]
6. Rhythm:     ✓ Eye flows well / ✗ Eye gets stuck at [location], add [guide]
7. Emphasis:   ✓ Clear focal point / ✗ Multiple elements compete, strengthen [main] or reduce [others]
```

Not every dimension needs to be perfect in every piece — but being aware of all seven helps you identify exactly what's off when something "doesn't look right."

## Iteration Framework

Professional artwork is never created in a single pass. Use a systematic 4-stage refinement process, with each stage building on and refining the previous one.

### Stage 1: Rough Sketch (Block-in)

**Goal:** Establish overall composition, proportions, and spatial layout using simple shapes.

```
What to do:
- Set viewBox dimensions
- Place major shapes as simple primitives (rectangles, circles, polygons)
- No gradients, no detail — just flat colors to mark zones
- Focus: "Is the big picture right?"

Typical tools: add_layer, manage_defs (basic gradients only)
Review criteria: Purpose, Proportion, Hierarchy
```

```
Example rough sketch workflow:
1. add_layer("layer-sky", '<rect width="800" height="400" fill="#87CEEB" />')
2. add_layer("layer-ground", '<rect y="400" width="800" height="200" fill="#4CAF50" />')
3. add_layer("layer-mountain", '<polygon points="100,400 350,150 600,400" fill="#7B8D8E" />')
4. add_layer("layer-tree-main", '<circle cx="500" cy="320" r="60" fill="#2E7D32" />')
5. preview_as_png → Check: Is the composition balanced? Is the tree well-placed?
```

**Decision gate:** If the composition doesn't work at this stage, restructure now — it's cheap to move simple shapes. Don't proceed until the big picture is right.

### Stage 2: Refined Sketch (Structure)

**Goal:** Replace rough shapes with more accurate forms. Add structural detail but not fine detail.

```
What to do:
- Replace primitive shapes with proper outlines (paths, compound shapes)
- Add secondary elements (minor trees, clouds, rocks)
- Establish proper layering order
- Begin defining gradients for major areas
- Focus: "Are the shapes right?"

Typical tools: update_layer, add_layer, manage_defs, transform_layer
Review criteria: Unity, Proportion, Rhythm
```

```
Example refined sketch workflow:
1. update_layer("layer-mountain", proper mountain path with curves)
2. update_layer("layer-tree-main", detailed tree with trunk + canopy circles)
3. add_layer("layer-tree-2", second smaller tree)
4. add_layer("layer-clouds", cloud shapes)
5. manage_defs("add", sky gradient)
6. update_layer("layer-sky", '<rect width="800" height="400" fill="url(#sky-gradient)" />')
7. preview_as_png → Check: Do shapes look right? Is layering correct?
```

### Stage 3: Color Comp (Color & Light)

**Goal:** Establish final colors, gradients, lighting, and atmospheric effects.

```
What to do:
- Apply final gradients and color palette
- Add shadows and highlights
- Set proper opacity for depth layers
- Add atmospheric effects (fog, vignette)
- Focus: "Do the colors and lighting work?"

Typical tools: manage_defs, update_layer, set_layer_opacity, add_layer
Review criteria: Unity (color consistency), Variety (color temperature), Emphasis
```

```
Example color comp workflow:
1. manage_defs("add", refined gradients for sky, mountains, ground)
2. update layers to use gradient fills
3. add_layer("layer-shadows", shadow shapes behind trees)
4. set_layer_opacity("layer-mountain", 0.6) for atmospheric depth
5. add_layer("layer-sunlight", golden highlight overlay)
6. preview_as_png → Check: Does the palette work? Is the lighting consistent?
```

### Stage 4: Final (Detail & Polish)

**Goal:** Add fine details, textures, and final touches. Polish everything.

```
What to do:
- Add fine details (leaf texture, bark lines, flower petals)
- Add small foreground elements
- Refine any rough edges
- Final lighting adjustments
- Add any animation if needed
- Focus: "Is it polished?"

Typical tools: update_layer, add_layer, preview_as_png (frequent)
Review criteria: All 7 dimensions — full review
```

```
Example final polish workflow:
1. update foreground tree with bark detail lines
2. add_layer("layer-flowers", small foreground flowers)
3. add_layer("layer-birds", small bird silhouettes in sky)
4. add_layer("layer-vignette", subtle edge darkening)
5. preview_as_png → Full 7-dimension review
6. Fix any issues found
7. preview_as_png → Confirm fixes
```

### Iteration Rules

1. **Never skip stages** — even simple artwork benefits from this progression
2. **Don't detail too early** — resist adding fine detail before composition is locked
3. **Preview at every stage gate** — always check before moving to the next stage
4. **It's OK to go back** — if Stage 3 reveals a composition issue, go back to Stage 1/2
5. **Time allocation** — roughly 15% rough, 25% refined, 30% color, 30% final

## Export & Optimization

### SVG Accessibility

Making SVG artwork accessible ensures it can be understood by screen readers and assistive technologies. Add semantic information using `<title>`, `<desc>`, and ARIA attributes.

```xml
<!-- Accessible SVG with title and description -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"
     role="img" aria-labelledby="svg-title svg-desc">
  <title id="svg-title">Sunset Mountain Landscape</title>
  <desc id="svg-desc">
    A serene mountain landscape at sunset with orange and purple sky,
    layered mountain ridges in blue-gray tones, and pine trees in the foreground.
  </desc>

  <!-- Scene content -->
  <rect width="800" height="600" fill="#87CEEB" />
  <!-- ... -->
</svg>
```

**Accessibility best practices:**

```xml
<!-- 1. Always add <title> for the overall image description -->
<svg role="img" aria-labelledby="title-id">
  <title id="title-id">Brief description of the artwork</title>
  <!-- ... -->
</svg>

<!-- 2. Add <desc> for longer descriptions of complex artwork -->
<svg role="img" aria-labelledby="title-id desc-id">
  <title id="title-id">City Skyline at Night</title>
  <desc id="desc-id">
    A dramatic nighttime cityscape featuring illuminated skyscrapers
    against a deep blue sky with scattered stars and a crescent moon.
  </desc>
</svg>

<!-- 3. Use aria-label for interactive or decorative elements -->
<g aria-label="Navigation menu icon">
  <line x1="10" y1="15" x2="40" y2="15" stroke="#333" stroke-width="3" />
  <line x1="10" y1="25" x2="40" y2="25" stroke="#333" stroke-width="3" />
  <line x1="10" y1="35" x2="40" y2="35" stroke="#333" stroke-width="3" />
</g>

<!-- 4. Mark purely decorative SVGs to skip screen readers -->
<svg aria-hidden="true" role="presentation">
  <!-- Decorative divider line — no informational content -->
  <line x1="0" y1="0" x2="800" y2="0" stroke="#ccc" />
</svg>

<!-- 5. Add titles to individual groups for complex interactive SVGs -->
<g>
  <title>Mountain range in the background</title>
  <path d="M 0 300 L 200 150 L 400 280 L 600 170 L 800 300" fill="#7B8D8E" />
</g>
```

**When to use what:**
- `<title>` — Always. Brief label for the SVG (like `alt` text on images)
- `<desc>` — For complex artwork that needs a longer explanation
- `role="img"` — Tells assistive tech to treat the SVG as a single image
- `aria-labelledby` — Points to the title/desc elements by ID
- `aria-hidden="true"` — For purely decorative SVGs with no informational content

### SVG Optimization Considerations

When preparing SVG artwork for production use, consider these optimization strategies:

**Reduce redundancy:**
- Use `<defs>` + `<use>` for repeated elements instead of duplicating SVG content
- Define shared styles in a `<style>` block rather than inline on every element
- Use CSS classes for common visual properties

```xml
<!-- Before: repeated inline styles -->
<circle cx="100" cy="100" r="10" fill="#E74C3C" stroke="#333" stroke-width="1" />
<circle cx="150" cy="100" r="10" fill="#E74C3C" stroke="#333" stroke-width="1" />
<circle cx="200" cy="100" r="10" fill="#E74C3C" stroke="#333" stroke-width="1" />

<!-- After: shared class -->
<style>.dot { fill: #E74C3C; stroke: #333; stroke-width: 1; }</style>
<circle cx="100" cy="100" r="10" class="dot" />
<circle cx="150" cy="100" r="10" class="dot" />
<circle cx="200" cy="100" r="10" class="dot" />
```

**Simplify paths:**
- Remove unnecessary precision in coordinates (e.g., `200.000` → `200`)
- Reduce control points where possible without losing visual quality
- Use basic shapes (`<rect>`, `<circle>`) instead of equivalent `<path>` elements

**Clean up structure:**
- Remove empty groups and unused defs
- Remove unnecessary attributes that match defaults (e.g., `fill-opacity="1"`)
- Remove comments and metadata in production builds

**Keep file size manageable:**
- Large SVGs (>100KB) may benefit from simplifying background detail
- Prefer gradients over complex textures when possible (gradient defs are smaller)
- Consider splitting very complex scenes into layered SVG components

**Maintain readability:**
- Use meaningful `id` values (`id="sky-gradient"` not `id="g1"`)
- Maintain consistent indentation for maintainability
- Group related elements in `<g>` tags with descriptive `id` or `data-name` attributes
