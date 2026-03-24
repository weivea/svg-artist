import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const CALLBACK_URL = process.env.SVG_CALLBACK_URL || 'http://localhost:3000/api/svg';

const server = new McpServer({
  name: 'svg-artist',
  version: '1.0.0',
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function callApi(
  path: string,
  body: Record<string, unknown> = {},
): Promise<{ ok: boolean; status: number; data?: unknown; error?: string }> {
  const url = `${CALLBACK_URL}/${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.text();
    return { ok: false, status: res.status, error };
  }
  const data = await res.json();
  return { ok: true, status: res.status, data };
}

function textResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(status: number, error: string) {
  return {
    content: [{ type: 'text' as const, text: `Error (${status}): ${error}` }],
    isError: true,
  };
}

async function textTool(path: string, params: Record<string, unknown> = {}) {
  try {
    const res = await callApi(path, params);
    if (!res.ok) return errorResult(res.status, res.error!);
    return textResult(res.data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResult(500, message);
  }
}

async function imageTool(path: string, params: Record<string, unknown> = {}) {
  try {
    const res = await callApi(path, params);
    if (!res.ok) return errorResult(res.status, res.error!);
    const data = res.data as { image: string };
    return {
      content: [{
        type: 'image' as const,
        data: data.image,
        mimeType: 'image/png' as const,
      }],
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResult(500, message);
  }
}

// ---------------------------------------------------------------------------
// Information Query (3 → 2: get_svg_source merged into get_canvas_info)
// ---------------------------------------------------------------------------

server.tool(
  'get_canvas_info',
  'Get canvas overview: viewBox, layer count, defs count, total elements. Optionally include full SVG source (replaces get_svg_source).',
  {
    include_source: z.boolean().optional().describe('Include the full SVG source string in the response (use sparingly on large drawings)'),
  },
  async ({ include_source }) => {
    try {
      const infoRes = await callApi('canvas/info');
      if (!infoRes.ok) return errorResult(infoRes.status, infoRes.error!);
      if (!include_source) return textResult(infoRes.data);

      const sourceRes = await callApi('canvas/source');
      if (!sourceRes.ok) return errorResult(sourceRes.status, sourceRes.error!);
      const merged = { ...(infoRes.data as Record<string, unknown>), svg_source: (sourceRes.data as Record<string, unknown>).svg };
      return textResult(merged);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return errorResult(500, message);
    }
  },
);

server.tool(
  'get_element_bbox',
  'Get bounding box (x, y, width, height) of an element for precise positioning',
  { element_id: z.string().describe('The id attribute of the SVG element') },
  async ({ element_id }) => textTool('canvas/bbox', { element_id }),
);

server.tool(
  'get_layer_colors',
  'Extract all colors used in a layer (fills, strokes, stop-colors). Returns color values with usage context for palette consistency checks.',
  { layer_id: z.string().describe('The layer id to analyze') },
  async ({ layer_id }) => textTool('layers/colors', { layer_id }),
);

// ---------------------------------------------------------------------------
// Layer Management (7 → 5: move_layer/duplicate_layer removed)
// ---------------------------------------------------------------------------

server.tool(
  'list_layers',
  'List all layers as a tree structure with ids, names, and nested children',
  {},
  async () => textTool('layers/list'),
);

server.tool(
  'get_layer',
  'Get the SVG content of a specific layer by id',
  { layer_id: z.string().describe('The layer id to retrieve') },
  async ({ layer_id }) => textTool('layers/get', { layer_id }),
);

server.tool(
  'add_layer',
  'Add a new layer with SVG content, or duplicate an existing layer by providing source_layer_id',
  {
    name: z.string().describe('Name for the new layer'),
    content: z.string().optional().describe('SVG content for the layer (required unless source_layer_id is set)'),
    source_layer_id: z.string().optional().describe('Copy content from this existing layer (replaces duplicate_layer)'),
    parent_id: z.string().optional().describe('Parent layer id to nest under'),
    position: z.number().optional().describe('Insert position among siblings (0-based)'),
  },
  async (params) => textTool('layers/add', params),
);

server.tool(
  'update_layer',
  'Replace the content of an existing layer',
  {
    layer_id: z.string().describe('The layer id to update'),
    content: z.string().describe('New SVG content for the layer'),
  },
  async (params) => textTool('layers/update', params),
);

server.tool(
  'delete_layer',
  'Delete a layer by id',
  { layer_id: z.string().describe('The layer id to delete') },
  async ({ layer_id }) => textTool('layers/delete', { layer_id }),
);

server.tool(
  'reorder_layers',
  'Batch reorder layers: move to position, move up/down, move to top/bottom',
  {
    operations: z.array(z.object({
      layer_id: z.string().describe('The layer id to move'),
      action: z.enum(['move_to', 'move_up', 'move_down', 'move_to_top', 'move_to_bottom']).describe('Reorder action'),
      position: z.number().optional().describe('Target position (for move_to)'),
      parent_id: z.string().optional().describe('Move to different parent group'),
    })).describe('Array of reorder operations to apply in sequence'),
  },
  async (params) => textTool('layers/reorder', params),
);

// ---------------------------------------------------------------------------
// Transform & Style (3)
// ---------------------------------------------------------------------------

server.tool(
  'transform_layer',
  'Apply translate, scale, rotate, or skew transform to a layer. Default mode is compose (appends to existing transforms). Use replace to overwrite.',
  {
    layer_id: z.string().describe('The layer id to transform'),
    translate: z.object({
      x: z.number(),
      y: z.number(),
    }).optional().describe('Translation offset'),
    scale: z.object({
      x: z.number(),
      y: z.number(),
      cx: z.number().optional(),
      cy: z.number().optional(),
    }).optional().describe('Scale factors with optional center point'),
    rotate: z.object({
      angle: z.number(),
      cx: z.number().optional(),
      cy: z.number().optional(),
    }).optional().describe('Rotation in degrees, optionally around a center point'),
    skew: z.object({
      x: z.number().optional(),
      y: z.number().optional(),
    }).optional().describe('Skew angles in degrees for x and/or y axis'),
    mode: z.enum(['compose', 'replace']).optional().describe('compose (default): append to existing transforms. replace: overwrite.'),
  },
  async (params) => textTool('layers/transform', params),
);

server.tool(
  'set_layer_opacity',
  'Set layer opacity (0 to 1)',
  {
    layer_id: z.string().describe('The layer id'),
    opacity: z.number().describe('Opacity value between 0 and 1'),
  },
  async (params) => textTool('layers/opacity', params),
);

server.tool(
  'set_layer_style',
  'Set visual style attributes on a layer. Supports fill, stroke, blend modes, filter/clip/mask references, and more. Pass null to remove an attribute.',
  {
    layer_id: z.string().describe('The layer id'),
    fill: z.string().nullable().optional().describe('Fill color, gradient url(#id), or "none". Null to remove.'),
    stroke: z.string().nullable().optional().describe('Stroke color or "none". Null to remove.'),
    stroke_width: z.number().nullable().optional().describe('Stroke width. Null to remove.'),
    stroke_linecap: z.enum(['butt', 'round', 'square']).nullable().optional().describe('Line cap shape. Null to remove.'),
    stroke_linejoin: z.enum(['miter', 'round', 'bevel']).nullable().optional().describe('Line join shape. Null to remove.'),
    stroke_dasharray: z.string().nullable().optional().describe('Dash pattern, e.g. "5 3" or "10 5 2 5". Null to remove.'),
    stroke_opacity: z.number().nullable().optional().describe('Stroke opacity 0-1. Null to remove.'),
    fill_opacity: z.number().nullable().optional().describe('Fill opacity 0-1. Null to remove.'),
    mix_blend_mode: z.enum([
      'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
      'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion',
    ]).nullable().optional().describe('CSS blend mode for layer compositing. Null to remove.'),
    filter_ref: z.string().nullable().optional().describe('Filter reference, e.g. "url(#my-filter)". Null to remove.'),
    clip_path: z.string().nullable().optional().describe('Clip path reference, e.g. "url(#my-clip)". Null to remove.'),
    mask_ref: z.string().nullable().optional().describe('Mask reference, e.g. "url(#my-mask)". Null to remove.'),
  },
  async (params) => textTool('layers/style', params),
);

// ---------------------------------------------------------------------------
// Defs (2)
// ---------------------------------------------------------------------------

server.tool(
  'list_defs',
  'List all defined resources (gradients, filters, patterns, clipPaths)',
  {},
  async () => textTool('defs/list'),
);

server.tool(
  'manage_defs',
  'Add, update, or delete items in <defs>. Use create_gradient/create_pattern/create_clip_mask actions for structured shortcuts.',
  {
    action: z.enum(['add', 'update', 'delete', 'create_gradient', 'create_pattern', 'create_clip_mask']).describe('Operation to perform'),
    id: z.string().describe('Id of the def element'),
    content: z.string().optional().describe('SVG content (required for add/update)'),
    gradient_type: z.enum(['linear', 'radial']).optional().describe('Gradient type (for create_gradient)'),
    stops: z.array(z.object({
      offset: z.string().describe('Stop offset (e.g. "0%", "50%", "100%")'),
      color: z.string().describe('Stop color (e.g. "#ff0000", "red")'),
      opacity: z.number().optional().describe('Stop opacity (0-1)'),
    })).optional().describe('Gradient color stops (for create_gradient)'),
    x1: z.string().optional().describe('Linear gradient start x'),
    y1: z.string().optional().describe('Linear gradient start y'),
    x2: z.string().optional().describe('Linear gradient end x'),
    y2: z.string().optional().describe('Linear gradient end y'),
    cx: z.string().optional().describe('Radial gradient center x'),
    cy: z.string().optional().describe('Radial gradient center y'),
    r: z.string().optional().describe('Radial gradient radius'),
    fx: z.string().optional().describe('Radial gradient focal x'),
    fy: z.string().optional().describe('Radial gradient focal y'),
    units: z.enum(['userSpaceOnUse', 'objectBoundingBox']).optional().describe('gradientUnits or patternUnits value'),
    spread: z.enum(['pad', 'reflect', 'repeat']).optional().describe('Gradient spreadMethod'),
    pattern_content: z.string().optional().describe('SVG content inside <pattern> (for create_pattern)'),
    pattern_width: z.string().optional().describe('Pattern tile width (for create_pattern)'),
    pattern_height: z.string().optional().describe('Pattern tile height (for create_pattern)'),
    pattern_units: z.enum(['userSpaceOnUse', 'objectBoundingBox']).optional().describe('patternUnits value (for create_pattern)'),
    clip_content: z.string().optional().describe('SVG content inside <clipPath> (for create_clip_mask)'),
    mask_content: z.string().optional().describe('SVG content inside <mask> (for create_clip_mask, takes priority over clip_content)'),
  },
  async (params) => textTool('defs/manage', params),
);

// ---------------------------------------------------------------------------
// Canvas (1)
// ---------------------------------------------------------------------------

server.tool(
  'set_viewbox',
  'Change the SVG viewBox dimensions. Partial updates preserve unset values',
  {
    x: z.number().optional().describe('viewBox min-x'),
    y: z.number().optional().describe('viewBox min-y'),
    width: z.number().optional().describe('viewBox width'),
    height: z.number().optional().describe('viewBox height'),
  },
  async (params) => textTool('canvas/viewbox', params),
);

server.tool(
  'set_canvas_background',
  'Set canvas background color or gradient. Creates or updates a full-size rect behind all layers.',
  {
    color: z.string().optional().describe('Background fill color (e.g. "#ffffff", "white")'),
    gradient_id: z.string().optional().describe('Id of a gradient defined in <defs> to use as fill'),
    opacity: z.number().optional().describe('Background opacity (0 to 1)'),
  },
  async (params) => textTool('canvas/background', params),
);

server.tool(
  'align_distribute',
  'Align layers to an edge/center or distribute them with equal spacing. Provide at least 2 layer_ids. Reference defaults to canvas viewBox.',
  {
    layer_ids: z.array(z.string()).min(2).describe('Layer ids to align/distribute (minimum 2)'),
    align: z.enum(['left', 'center', 'right', 'top', 'middle', 'bottom']).optional().describe('Alignment edge or center axis'),
    distribute: z.enum(['horizontal', 'vertical']).optional().describe('Distribute layers with equal spacing along axis'),
    reference: z.string().optional().describe('Reference layer id or "canvas" (default: canvas viewBox)'),
  },
  async (params) => textTool('align', params),
);

// ---------------------------------------------------------------------------
// Preview (2)
// ---------------------------------------------------------------------------

server.tool(
  'preview_as_png',
  'Render the entire canvas as PNG for visual self-review. Supports background color and DPI control.',
  {
    width: z.number().optional().describe('Output image width in pixels'),
    height: z.number().optional().describe('Output image height in pixels'),
    background: z.string().optional().describe('Background color (CSS3 format, e.g. "#ffffff", "rgba(0,0,0,0.5)"). Default: transparent'),
    dpi: z.number().min(1).optional().describe('Render DPI (default 72). Higher values produce larger images (e.g. 144 = 2x).'),
  },
  async (params) => imageTool('preview', params),
);

server.tool(
  'preview_layer',
  'Render a single layer as PNG for targeted visual review',
  {
    layer_id: z.string().describe('The layer id to render'),
    width: z.number().optional().describe('Output image width in pixels'),
    height: z.number().optional().describe('Output image height in pixels'),
    show_background: z.boolean().optional().describe('Whether to show background layers'),
  },
  async (params) => imageTool('preview/layer', params),
);

// ---------------------------------------------------------------------------
// Typography & Path Operations
// ---------------------------------------------------------------------------

server.tool(
  'create_text',
  `Create a text element with rich typography options. Supports single-line, multi-line (with line_height), rich text (with spans), and text on a path (with path_id). Creates a new layer by default, or appends to an existing layer via layer_id.`,
  {
    text: z.string().describe('The text content. Use \\n for multi-line (requires line_height)'),
    x: z.number().describe('X position'),
    y: z.number().describe('Y position'),
    font_family: z.string().optional().describe('Font family (e.g. "Arial", "Georgia")'),
    font_size: z.number().optional().describe('Font size in px'),
    font_weight: z.union([z.number(), z.string()]).optional().describe('Font weight (e.g. 400, 700, "bold")'),
    font_style: z.enum(['normal', 'italic']).optional().describe('Font style'),
    letter_spacing: z.number().optional().describe('Letter spacing in px'),
    word_spacing: z.number().optional().describe('Word spacing in px'),
    line_height: z.number().optional().describe('Line height for multi-line text (dy between tspan lines)'),
    text_anchor: z.enum(['start', 'middle', 'end']).optional().describe('Horizontal text anchor'),
    dominant_baseline: z.enum(['auto', 'middle', 'hanging']).optional().describe('Vertical baseline alignment'),
    text_decoration: z.enum(['none', 'underline', 'line-through']).optional().describe('Text decoration'),
    fill: z.string().optional().describe('Text fill color'),
    stroke: z.string().optional().describe('Text stroke color'),
    path_id: z.string().optional().describe('Id of a <path> in defs to place text along'),
    spans: z.array(z.object({
      text: z.string().describe('Span text content'),
      fill: z.string().optional().describe('Override fill color'),
      font_size: z.number().optional().describe('Override font size'),
      font_weight: z.union([z.number(), z.string()]).optional().describe('Override font weight'),
      dx: z.number().optional().describe('Horizontal offset from previous span'),
      dy: z.number().optional().describe('Vertical offset from previous span'),
    })).optional().describe('Rich text spans (overrides plain text)'),
    layer_id: z.string().optional().describe('Add text to this existing layer (appends)'),
    layer_name: z.string().optional().describe('Create a new layer with this name'),
  },
  async (params) => textTool('text/create', params),
);

server.tool(
  'create_path',
  `Create an SVG path element from a high-level spec. Supported types:
- line: start, end
- polyline: points array
- polygon: points array (auto-closed)
- bezier: start, end, control1 (quadratic) or control1+control2 (cubic)
- arc: start, end, radius
- star: start (center), radius, inner_radius, corners
- rounded-rect: start, end, corner_radius`,
  {
    type: z.enum(['line', 'polyline', 'polygon', 'arc', 'bezier', 'star', 'rounded-rect']).describe('Path type'),
    points: z.array(z.tuple([z.number(), z.number()])).optional().describe('Array of [x,y] points (for polyline/polygon)'),
    start: z.tuple([z.number(), z.number()]).optional().describe('Start point [x,y] or center (for star)'),
    end: z.tuple([z.number(), z.number()]).optional().describe('End point [x,y] or bottom-right corner (for rounded-rect)'),
    control1: z.tuple([z.number(), z.number()]).optional().describe('First control point [x,y] (bezier)'),
    control2: z.tuple([z.number(), z.number()]).optional().describe('Second control point [x,y] (cubic bezier)'),
    radius: z.number().optional().describe('Arc radius or star outer radius'),
    inner_radius: z.number().optional().describe('Star inner radius (default: 40% of radius)'),
    corners: z.number().optional().describe('Number of star points (default: 5)'),
    corner_radius: z.number().optional().describe('Corner rounding for rounded-rect (default: 10)'),
    fill: z.string().optional().describe('Fill color (default: "none")'),
    stroke: z.string().optional().describe('Stroke color (default: "#000000")'),
    stroke_width: z.number().optional().describe('Stroke width'),
    layer_id: z.string().optional().describe('Add path to this existing layer (appends)'),
    layer_name: z.string().optional().describe('Create a new layer with this name'),
  },
  async ({ layer_id, layer_name, fill, stroke, stroke_width, ...spec }) =>
    textTool('path/create', { ...spec, fill, stroke, stroke_width, layer_id, layer_name }),
);

server.tool(
  'edit_path',
  `Edit an existing path element's geometry. Operations are applied in sequence:
- move_point: Move a point to new coordinates (index, x, y)
- add_point: Insert a new L point after an existing one (after_index, x, y)
- delete_point: Remove a point by index (minimum 2 points preserved)
- set_control: Set/change control points to create curves (index, control1?, control2?)
- close: Add Z to close the path
- open: Remove closing Z command
- smooth: Convert polyline L commands to smooth cubic Bézier curves (tension, default 0.5)
- simplify: Reduce point count using Ramer-Douglas-Peucker algorithm (tolerance, default 1.0)
Use path/find to get the element_id of a path inside a layer.`,
  {
    element_id: z.string().describe('The id attribute of the <path> element to edit'),
    operations: z.array(z.discriminatedUnion('type', [
      z.object({
        type: z.literal('move_point'),
        index: z.number().describe('Index of the point to move (0-based)'),
        x: z.number().describe('New x coordinate'),
        y: z.number().describe('New y coordinate'),
      }),
      z.object({
        type: z.literal('add_point'),
        after_index: z.number().describe('Insert new point after this index'),
        x: z.number().describe('X coordinate of the new point'),
        y: z.number().describe('Y coordinate of the new point'),
      }),
      z.object({
        type: z.literal('delete_point'),
        index: z.number().describe('Index of the point to delete'),
      }),
      z.object({
        type: z.literal('set_control'),
        index: z.number().describe('Index of the point to modify'),
        control1: z.tuple([z.number(), z.number()]).optional().describe('First control point [x, y] (creates Q curve)'),
        control2: z.tuple([z.number(), z.number()]).optional().describe('Second control point [x, y] (creates C curve)'),
      }),
      z.object({ type: z.literal('close') }),
      z.object({ type: z.literal('open') }),
      z.object({
        type: z.literal('smooth'),
        tension: z.number().optional().describe('Smoothing tension (0-1, default 0.5). Higher = tighter curves'),
      }),
      z.object({
        type: z.literal('simplify'),
        tolerance: z.number().optional().describe('Simplification tolerance in SVG units (default 1.0). Higher = fewer points'),
      }),
    ])).describe('Array of edit operations to apply in order'),
  },
  async (params) => textTool('path/edit', params),
);

server.tool(
  'boolean_path',
  `Perform a boolean operation on two path elements, creating a new path with the result.
- union: Combine both shapes into one
- subtract: Remove path_b's shape from path_a
- intersect: Keep only the overlapping area
- exclude: Keep everything except the overlapping area
Uses path element ids (find them with path/find). Result is placed in a new layer.`,
  {
    operation: z.enum(['union', 'subtract', 'intersect', 'exclude']).describe('Boolean operation to perform'),
    path_a: z.string().describe('Element id of the first <path>'),
    path_b: z.string().describe('Element id of the second <path>'),
    result_layer: z.string().optional().describe('Name for the result layer (auto-generated if omitted)'),
  },
  async (params) => textTool('path/boolean', params),
);

// ---------------------------------------------------------------------------
// Professional Tools (4 → 2: apply_filter/apply_style_preset removed)
// ---------------------------------------------------------------------------

server.tool(
  'apply_effect',
  `Apply one or more effects to a layer. Effects are chainable — multiple effects stack into a single combined filter.
Supported effects: drop-shadow, blur, glow, emboss, noise-texture, paper, watercolor, metallic, glass.
Use mode "append" (default) to add effects to existing ones, or "replace" to start fresh.`,
  {
    layer_id: z.string().describe('The layer id to apply effects to'),
    effects: z.array(z.object({
      type: z.enum([
        'drop-shadow', 'blur', 'glow', 'emboss', 'noise-texture',
        'paper', 'watercolor', 'metallic', 'glass',
      ]).describe('Effect type'),
      params: z.record(z.string(), z.union([z.number(), z.string()])).optional().describe('Effect-specific parameters'),
    })).describe('Array of effects to apply (they stack in order)'),
    mode: z.enum(['append', 'replace']).optional().describe('append (default): add to existing effects. replace: clear and start fresh.'),
  },
  async (params) => textTool('effect/apply', params),
);

server.tool(
  'get_color_palette',
  'Generate harmonious color palettes by theme and/or mood. Returns palette options with hex colors and usage roles',
  {
    theme: z.string().optional().describe('Theme: ocean, autumn, sunset, forest, urban, spring, night, desert'),
    mood: z.string().optional().describe('Mood: calm, energetic, mysterious, warm, cold, playful, elegant'),
    count: z.number().optional().describe('Number of palette options to return (default: 3)'),
  },
  async (params) => textTool('palette/generate', params),
);

server.tool(
  'critique_composition',
  'Analyze the current canvas composition. Returns a score (0-100), 7-dimension breakdown, issues, and strengths',
  {},
  async () => textTool('composition/critique'),
);

// ---------------------------------------------------------------------------
// Bootstrap / Self-improvement Tools (6)
// ---------------------------------------------------------------------------

server.tool(
  'write_skill',
  'Create or update a drawing skill (SKILL.md file). Requires reload_session to take effect.',
  {
    name: z.string().describe('Skill name in kebab-case (e.g. "advanced-shading")'),
    content: z.string().describe('Full SKILL.md content with frontmatter and instructions'),
  },
  async (params) => textTool('bootstrap/write-skill', params),
);

server.tool(
  'write_filter',
  'Create or update a custom SVG filter template (JSON). Requires reload_session to take effect. Use {{id}} for filter id and {{param:default}} for parameters in svg_template.',
  {
    name: z.string().describe('Filter name in kebab-case (e.g. "oil-paint")'),
    definition: z.object({
      description: z.string().describe('What this filter does'),
      svg_template: z.string().describe('SVG filter template with {{id}} and {{param:default}} placeholders'),
      params_schema: z.record(z.string(), z.object({
        type: z.enum(['number', 'string']),
        default: z.union([z.number(), z.string()]),
        min: z.number().optional(),
        max: z.number().optional(),
      })).optional().describe('Parameter definitions with types and ranges'),
    }),
  },
  async (params) => textTool('bootstrap/write-filter', params),
);

server.tool(
  'write_style',
  'Create or update a custom style preset (JSON). Requires reload_session to take effect.',
  {
    name: z.string().describe('Style name in kebab-case (e.g. "pixel-art")'),
    definition: z.object({
      description: z.string().describe('What this style achieves'),
      layer_styles: z.record(z.string(), z.record(z.string(), z.string())).describe(
        'Map of layer name pattern to CSS-like style attributes (e.g. {"*": {"fill": "#000"}})',
      ),
    }),
  },
  async (params) => textTool('bootstrap/write-style', params),
);

server.tool(
  'write_prompt_extension',
  'Add or update a system prompt extension. Appended to your context after reload_session.',
  {
    name: z.string().describe('Extension name in kebab-case (e.g. "shading-tips")'),
    content: z.string().describe('Markdown content to add to system prompt'),
  },
  async (params) => textTool('bootstrap/write-prompt-extension', params),
);

server.tool(
  'reload_session',
  'Reload the Claude CLI to apply all changes (new skills, filters, styles, prompt extensions). Automatically kills this process, restarts with --resume, and continues the current task. No user action required.',
  {
    reason: z.string().describe('Summary of what was changed and why (shown in continuation prompt)'),
  },
  async (params) => textTool('bootstrap/reload', params),
);

server.tool(
  'list_bootstrap_assets',
  'List all available skills, custom filters, custom styles, and prompt extensions',
  {},
  async () => textTool('bootstrap/list'),
);

// ---------------------------------------------------------------------------
// Phase 2: Custom Tools, Routes, Versioning (4)
// ---------------------------------------------------------------------------

server.tool(
  'write_custom_tool',
  'Define a new MCP tool with a pipeline handler. The tool becomes available as custom_<name> after reload_session. Pipeline steps call predefined actions (get_layers, apply_filter, transform_layer, etc.).',
  {
    name: z.string().describe('Tool name in kebab-case (e.g. "batch-filter")'),
    definition: z.object({
      description: z.string().describe('What this tool does'),
      input_schema: z.record(z.string(), z.object({
        type: z.string(),
        description: z.string().optional(),
        items: z.any().optional(),
        optional: z.boolean().optional(),
      })).describe('Input parameter definitions'),
      handler: z.object({
        type: z.literal('pipeline'),
        steps: z.array(z.object({
          action: z.string().describe('Action name from registry'),
          params: z.record(z.string(), z.any()).optional().describe('Parameters with {{}} template syntax'),
          for_each: z.string().optional().describe('Array to iterate over'),
          store_as: z.string().optional().describe('Variable name to store result'),
        })),
      }),
    }),
  },
  async (params) => textTool('bootstrap/write-custom-tool', params),
);

server.tool(
  'write_custom_route',
  'Define a new API route with a pipeline handler. Route mounts at /api/svg/:drawId/custom/<name> after reload_session.',
  {
    name: z.string().describe('Route name in kebab-case'),
    definition: z.object({
      path: z.string().describe('Route path (must start with /custom/)'),
      method: z.literal('POST'),
      description: z.string().describe('What this route does'),
      input_schema: z.record(z.string(), z.object({
        type: z.string(),
        description: z.string().optional(),
        items: z.any().optional(),
        optional: z.boolean().optional(),
      })).describe('Input parameter definitions'),
      handler: z.object({
        type: z.literal('pipeline'),
        steps: z.array(z.object({
          action: z.string(),
          params: z.record(z.string(), z.any()).optional(),
          for_each: z.string().optional(),
          store_as: z.string().optional(),
        })),
      }),
    }),
  },
  async (params) => textTool('bootstrap/write-custom-route', params),
);

server.tool(
  'rollback_asset',
  'Roll back any bootstrap asset to a previous version. Does NOT auto-reload — call reload_session after.',
  {
    type: z.enum(['filter', 'style', 'tool', 'route', 'macro', 'skill', 'prompt']).describe('Asset type'),
    name: z.string().describe('Asset name'),
    version: z.number().int().positive().optional().describe('Target version (default: previous)'),
  },
  async (params) => textTool('bootstrap/rollback', params),
);

server.tool(
  'get_asset_history',
  'View version history of a bootstrap asset',
  {
    type: z.enum(['filter', 'style', 'tool', 'route', 'macro', 'skill', 'prompt']).describe('Asset type'),
    name: z.string().describe('Asset name'),
  },
  async (params) => textTool('bootstrap/history', params),
);

server.tool(
  'write_macro',
  'Define a reusable pipeline macro — a named sequence of actions. Available as macro_<name> action in pipelines and as MCP tool after reload_session.',
  {
    name: z.string().describe('Macro name in kebab-case (e.g. "mirror-layer")'),
    definition: z.object({
      description: z.string().describe('What this macro does'),
      input_schema: z.record(z.string(), z.object({
        type: z.string(),
        description: z.string().optional(),
        items: z.any().optional(),
        optional: z.boolean().optional(),
      })).describe('Input parameter definitions'),
      macro: z.object({
        steps: z.array(z.object({
          action: z.string().describe('Action name from registry'),
          params: z.record(z.string(), z.any()).optional().describe('Parameters with {{}} template syntax'),
          for_each: z.string().optional().describe('Array to iterate over'),
          store_as: z.string().optional().describe('Variable name to store result'),
        })),
      }),
    }),
  },
  async (params) => textTool('bootstrap/write-macro', params),
);

// ---------------------------------------------------------------------------
// Scratch Canvas Tools (2 consolidated from 9)
// ---------------------------------------------------------------------------

server.tool(
  'scratch_canvas',
  `Manage temporary scratch canvases for isolated detail work. Actions:
- create: Create new scratch canvas (returns canvasId)
- add_layer: Add a layer to scratch canvas
- update_layer: Update a layer on scratch canvas
- delete_layer: Delete a layer from scratch canvas
- list_layers: List layers on a scratch canvas
- manage_defs: CRUD defs on scratch canvas
- preview: Render scratch canvas as PNG
- list_all: List all active scratch canvases`,
  {
    action: z.enum(['create', 'add_layer', 'update_layer', 'delete_layer',
      'list_layers', 'manage_defs', 'preview', 'list_all']).describe('Operation to perform'),
    canvas_id: z.string().optional().describe('Scratch canvas ID (not needed for create/list_all)'),
    viewBox: z.string().optional().describe('SVG viewBox for new scratch canvas'),
    background: z.string().optional().describe('Background color for new scratch canvas'),
    name: z.string().optional().describe('Layer name (for add_layer)'),
    content: z.string().optional().describe('SVG content (for add_layer/update_layer)'),
    layer_id: z.string().optional().describe('Layer ID (for update_layer/delete_layer)'),
    parent_id: z.string().optional().describe('Parent layer ID (for add_layer)'),
    position: z.number().optional().describe('Insert position (for add_layer)'),
    defs_action: z.enum(['add', 'update', 'delete']).optional().describe('Defs operation (for manage_defs)'),
    id: z.string().optional().describe('Def element ID (for manage_defs)'),
    defs_content: z.string().optional().describe('Def SVG content (for manage_defs)'),
    width: z.number().optional().describe('Preview width in pixels'),
  },
  async (params) => {
    const { action, canvas_id: canvasId, ...rest } = params;
    switch (action) {
      case 'create': return textTool('scratch/create', rest);
      case 'list_all': return textTool('scratch/list');
      case 'add_layer': return textTool(`scratch/${canvasId}/layers/add`, rest);
      case 'update_layer': return textTool(`scratch/${canvasId}/layers/update`, rest);
      case 'delete_layer': return textTool(`scratch/${canvasId}/layers/delete`, rest);
      case 'list_layers': return textTool(`scratch/${canvasId}/layers/list`);
      case 'manage_defs': {
        const defsParams = { action: rest.defs_action, id: rest.id, content: rest.defs_content };
        return textTool(`scratch/${canvasId}/defs/manage`, defsParams);
      }
      case 'preview': return imageTool(`scratch/${canvasId}/preview`, rest);
      default: return errorResult(400, `Unknown action: ${action}`);
    }
  },
);

server.tool(
  'merge_scratch',
  'Merge a completed scratch canvas into the main drawing. Transfers defs automatically. Deletes scratch canvas after merge.',
  {
    canvas_id: z.string().describe('Scratch canvas ID to merge'),
    layer_name: z.string().describe('Name for the merged layer'),
    transform: z.object({
      translate: z.tuple([z.number(), z.number()]).optional(),
      scale: z.number().optional(),
      rotate: z.number().optional(),
    }).optional().describe('Transform to position merged content'),
    transfer_defs: z.boolean().optional().describe('Transfer gradients/filters (default true)'),
    merge_as: z.enum(['single_layer', 'separate_layers']).optional().describe('Merge as single layer or keep separate layers'),
  },
  async ({ canvas_id: canvasId, layer_name, ...rest }) =>
    textTool(`scratch/${canvasId}/merge`, { layerName: layer_name, ...rest }),
);

// ---------------------------------------------------------------------------
// Dynamic custom tool registration (loaded at startup)
// ---------------------------------------------------------------------------

async function registerCustomTools(): Promise<void> {
  try {
    const res = await callApi('bootstrap/list');
    if (!res.ok || !res.data) return;
    const assets = res.data as { custom_tools?: string[]; custom_macros?: string[] };

    // Register custom tools as MCP tools
    if (assets.custom_tools && assets.custom_tools.length > 0) {
      for (const toolName of assets.custom_tools) {
        const toolRes = await fetch(`${CALLBACK_URL}/bootstrap/custom-tool-def/${toolName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        if (!toolRes.ok) continue;
        const toolDef = await toolRes.json() as {
          name: string;
          description: string;
          input_schema: Record<string, any>;
        };

        server.tool(
          `custom_${toolDef.name}`,
          toolDef.description,
          { params: z.record(z.string(), z.any()).optional().describe('Custom tool parameters') },
          async ({ params }) => textTool(`custom-tool/${toolDef.name}`, params || {}),
        );
      }
    }

    // Register custom macros as MCP tools
    if (assets.custom_macros && assets.custom_macros.length > 0) {
      for (const macroName of assets.custom_macros) {
        const macroRes = await fetch(`${CALLBACK_URL}/bootstrap/macro-def/${macroName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
        if (!macroRes.ok) continue;
        const macroDef = await macroRes.json() as {
          name: string;
          description: string;
          input_schema: Record<string, any>;
        };

        server.tool(
          `macro_${macroDef.name}`,
          macroDef.description,
          { params: z.record(z.string(), z.any()).optional().describe('Macro parameters') },
          async ({ params }) => textTool(`macro/${macroDef.name}`, params || {}),
        );
      }
    }
  } catch {
    // Custom tools unavailable — not fatal, continue with built-in tools only
  }
}

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  await registerCustomTools();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
