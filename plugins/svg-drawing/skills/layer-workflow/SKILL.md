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
Phase 1: Foundation
  1. Set up the canvas (viewBox dimensions)
  2. Define shared resources (gradients, patterns) using manage_defs
  3. Draw the background (sky, base color)

Phase 2: Environment
  4. Add distant elements (mountains, horizon)
  5. Add midground elements (hills, water)
  6. Add ground/terrain

Phase 3: Subjects
  7. Add main subjects (buildings, trees, characters)
  8. Add shadows for subjects
  9. Add secondary subjects

Phase 4: Details
  10. Add small details (flowers, textures, facial features)
  11. Add lighting effects
  12. Add atmospheric effects (fog, vignette)

Phase 5: Review
  13. Preview → analyze → fix → preview again
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
