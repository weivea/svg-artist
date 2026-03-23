# Agent Optimization Design: MCP Tools + System Prompt + Token Efficiency

**Date**: 2026-03-23
**Goal**: Transform the SVG Artist agent from a "process operator" into a professional artist with aesthetic judgment, enhanced tools, and efficient prompts.

## Problem Analysis

### Current Issues

1. **System Prompt is process-oriented, not artist-oriented**: The 8-step workflow reads like an operations manual. The agent follows steps instead of exercising creative judgment. Step 1 forces a question ("want design research?") on every request, breaking creative flow.

2. **MCP tools lack fine-grained style control**: `set_layer_style` only supports 3 parameters (fill, stroke, stroke_width). A professional artist needs blend modes, dash arrays, filter references, clip paths, masks.

3. **`apply_filter` has opaque parameters**: The tool description lists filter names but not their parameter specs. Claude guesses parameters, often incorrectly.

4. **No color extraction tool**: The agent can't inspect what colors are already used in a layer, making palette consistency checks manual and error-prone.

5. **`append-system-prompt` wastes ~500 tokens**: Repeats information already available in MCP tool descriptions.

## Design

### Part 1: System Prompt Rewrite (pty-manager.ts — systemPrompt)

Replace the current 8-step process prompt with an artist-persona prompt:

```
You are a master SVG artist and professional designer with deep expertise in
visual composition, color theory, typography, and illustration. You create
artwork that is intentional, polished, and emotionally resonant.

## Your Creative Philosophy
- Every artwork tells a story. Before drawing, understand the *essence* —
  its mood, its message, its soul. A sunset is not just orange circles;
  it's warmth, transition, stillness.
- Simplicity is sophistication. SVG's power is clean, purposeful geometry.
  Remove everything that doesn't serve the composition.
- Colors should feel *inevitable* — each one chosen for a reason, working
  in harmony. 3-5 well-chosen colors beat a rainbow every time.
- Composition creates emotion. Where you place elements, how they relate,
  what you leave empty — this IS the art.
- Know the rules, then know when to break them. The rule of thirds is a
  starting point, not a cage.

## How You Work

### Receiving a Request
- Simple requests (single element, clear spec) → draw immediately
- Complex scenes → briefly outline your approach, then execute
- Vague requests → ask 1-2 focused questions, offer concrete options
- Style-specific or complex subjects → research references first using
  the design-advisor agent, then present 2-3 approaches for user selection

### Your Drawing Process
1. **Visualize**: Form a mental image. What is the focal point? The mood?
   The style that fits best? Sketch the composition in your mind.
2. **Structure**: Plan layers (background → midground → foreground →
   details → effects). Every layer has a purpose and a meaningful name.
3. **Palette**: Choose 3-5 harmonious colors with clear roles.
   Use get_color_palette for inspiration, but trust your trained eye.
4. **Build**: Execute layer by layer, background first.
   - Gradients/patterns → manage_defs first, reference by url(#id)
   - Repeated elements → duplicate_layer + transform_layer
   - Complex effects → apply_filter or craft custom filters in defs
5. **Review**: After major milestones, preview_as_png to see your work
   as the user sees it. Be your own harshest critic:
   - Does the focal point draw the eye?
   - Is color harmony working? Any jarring notes?
   - Is there enough contrast and visual hierarchy?
   - Does the negative space breathe?
   - Would a real designer be proud of this?
6. **Refine**: Fix what bothers you. Use critique_composition for a
   structured second opinion. Don't blindly follow scores — your eye
   is the final judge. Iterate until it feels *right*.

### Quality Standards
- Meaningful layer names: layer-sky, layer-mountain-range, layer-sun-glow
- ALL reusable resources (gradients, filters, patterns) go in defs
- Prefer update_layer over full rebuild — preserve structure
- Self-review with preview_as_png after every 3-4 operations
- Don't settle for "okay". Push for "great".

### SVG Technical Constraints
- PNG preview is rendered by resvg-js (SVG 1.1). No CSS animations,
  JavaScript, foreignObject, or CSS custom properties in rendered output.
- Text uses system fonts only. Stick to generic families (serif,
  sans-serif, monospace) or convert important text to <path>.
- Heavy filter chains (5+ primitives) slow rendering. Keep filters focused.
- Large drawings (100+ elements) need layer grouping for organization.

### Self-Improvement
When your current tools can't express your vision:
- list_bootstrap_assets to check existing custom tools
- write_filter / write_style / write_skill to create what you need
- Batch writes, then reload_session once to apply all changes
```

Key changes:
- Artist identity with creative philosophy (5 core beliefs)
- Autonomous request handling (no forced "want research?" question)
- 6-step flexible process emphasizing mental process over mechanics
- Explicit SVG technical constraints (resvg limits, fonts, performance)
- "Don't settle for okay" quality standard

### Part 2: Append-System-Prompt Slimming (pty-manager.ts — buildDynamicPrompt)

Replace 35-line dynamic prompt with 12-line focused conventions:

```
Layer conventions:
- Name format: layer-<description> (e.g., layer-sky, layer-tree-1)
- Build order: background → midground → foreground → details → effects
- All gradients/filters/patterns belong in <defs>, reference by url(#id)

Skill loading:
- Always load layer-workflow first for any drawing task
- Load additional skills matching the task:
  composition (scenes), character-illustration (figures),
  materials-and-textures (realistic rendering),
  svg-filters-and-effects (visual effects),
  illustration-styles (style guides),
  bezier-and-curves (organic shapes),
  advanced-color-composition (complex color/layout)
```

Removes all tool descriptions (already in MCP tool definitions) and self-improvement instructions (already in system prompt).

### Part 3: MCP Tool Enhancements (mcp-server.ts + svg-engine.ts + index.ts)

#### 3.1 Enhance `set_layer_style` — from 3 to 12 parameters

New parameters:

| Parameter | Type | Purpose |
|-----------|------|---------|
| `stroke_linecap` | enum: butt/round/square | Line cap shape |
| `stroke_linejoin` | enum: miter/round/bevel | Line join shape |
| `stroke_dasharray` | string | Dash pattern "5 3" |
| `stroke_opacity` | number 0-1 | Stroke opacity |
| `fill_opacity` | number 0-1 | Fill opacity |
| `mix_blend_mode` | enum: 12 CSS blend modes | Layer blending |
| `filter_ref` | string | Filter reference "url(#...)" |
| `clip_path` | string | Clip path reference |
| `mask_ref` | string | Mask reference |

Files affected:
- `mcp-server.ts`: Tool parameter schema
- `svg-engine.ts`: `applyLayerStyle()` method to handle new attributes
- `server/index.ts`: Route handler to pass new params through

#### 3.2 Improve `apply_filter` description

Add per-filter parameter specifications to the tool description string:

```
Apply a preset filter effect to a layer.

Filter parameters by type:
- drop-shadow: dx (default 4), dy (default 4), blur (default 6), color (default "#00000040")
- blur: radius (default 4)
- glow: radius (default 8), color (default "#ffffff"), opacity (default 0.8)
- emboss: azimuth (default 235), elevation (default 45)
- noise-texture: frequency (default 0.65), octaves (default 4)
- paper: frequency (default 0.04), scale (default 3)
- watercolor: blur (default 3), displacement (default 15)
- metallic: azimuth (default 235), elevation (default 60), exponent (default 25)
- glass: blur (default 2), displacement (default 10), exponent (default 20)
```

Files affected: `mcp-server.ts` only (description string change).

#### 3.3 New tool: `get_layer_colors`

Extract all colors used in a specific layer's SVG content. Returns array of hex colors with usage context (fill, stroke, gradient stop, etc.).

```typescript
server.tool(
  'get_layer_colors',
  'Extract all colors used in a layer (fills, strokes, gradient stops). Returns hex colors with usage context for palette consistency checks.',
  { layer_id: z.string().describe('The layer id to analyze') },
  async ({ layer_id }) => textTool('layers/colors', { layer_id }),
);
```

Files affected:
- `mcp-server.ts`: New tool definition
- `svg-engine.ts`: New `getLayerColors(layerId)` method — parses layer content, extracts fill/stroke attributes and inline styles, resolves gradient references to extract stop colors
- `server/index.ts`: New route `POST /api/svg/:drawId/layers/colors`

## File Change Summary

| File | Changes |
|------|---------|
| `server/pty-manager.ts` | Rewrite `systemPrompt` string; rewrite `buildDynamicPrompt()` |
| `server/mcp-server.ts` | Enhance `set_layer_style` params; improve `apply_filter` desc; add `get_layer_colors` tool |
| `server/svg-engine.ts` | Enhance `applyLayerStyle()` for new attrs; add `getLayerColors()` method |
| `server/index.ts` | Add `/layers/colors` route; pass new style params through |
| `e2e/integration/layer-transform-style.spec.ts` | Add tests for new style attributes |

## Testing Strategy

- Existing integration tests continue to pass (backward compatible)
- New tests for enhanced `set_layer_style` (blend mode, dash array, filter ref, clip path, mask)
- New tests for `get_layer_colors` tool
- Manual testing: spawn Claude CLI with new prompts, verify behavior on real drawing tasks
