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
// Information Query (3)
// ---------------------------------------------------------------------------

server.tool(
  'get_canvas_info',
  'Get canvas overview: viewBox, layer count, defs count, total elements',
  {},
  async () => textTool('canvas/info'),
);

server.tool(
  'get_element_bbox',
  'Get bounding box (x, y, width, height) of an element for precise positioning',
  { element_id: z.string().describe('The id attribute of the SVG element') },
  async ({ element_id }) => textTool('canvas/bbox', { element_id }),
);

server.tool(
  'get_svg_source',
  'Get the complete SVG source code (use sparingly on large drawings)',
  {},
  async () => textTool('canvas/source'),
);

// ---------------------------------------------------------------------------
// Layer Management (7)
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
  'Add a new layer with SVG content. Optionally nest under a parent or set position',
  {
    name: z.string().describe('Name for the new layer'),
    content: z.string().describe('SVG content for the layer'),
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
  'move_layer',
  'Move a layer to a new position or under a different parent',
  {
    layer_id: z.string().describe('The layer id to move'),
    target_parent_id: z.string().optional().describe('New parent layer id (omit for root)'),
    position: z.number().describe('New position among siblings (0-based)'),
  },
  async (params) => textTool('layers/move', params),
);

server.tool(
  'duplicate_layer',
  'Duplicate a layer with a new name, optionally applying a transform',
  {
    layer_id: z.string().describe('The layer id to duplicate'),
    new_name: z.string().optional().describe('Name for the duplicated layer'),
    transform: z.object({
      translate: z.object({
        x: z.number(),
        y: z.number(),
      }),
    }).optional().describe('Transform to apply to the duplicate'),
  },
  async (params) => textTool('layers/duplicate', params),
);

// ---------------------------------------------------------------------------
// Transform & Style (3)
// ---------------------------------------------------------------------------

server.tool(
  'transform_layer',
  'Apply translate, scale, or rotate transform to a layer without rewriting content',
  {
    layer_id: z.string().describe('The layer id to transform'),
    translate: z.object({
      x: z.number(),
      y: z.number(),
    }).optional().describe('Translation offset'),
    scale: z.object({
      x: z.number(),
      y: z.number(),
    }).optional().describe('Scale factors'),
    rotate: z.object({
      angle: z.number(),
      cx: z.number().optional(),
      cy: z.number().optional(),
    }).optional().describe('Rotation in degrees, optionally around a center point'),
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
  'Set visual style attributes on a layer. Supports fill, stroke, blend modes, filter/clip/mask references, and more.',
  {
    layer_id: z.string().describe('The layer id'),
    fill: z.string().optional().describe('Fill color, gradient url(#id), or "none"'),
    stroke: z.string().optional().describe('Stroke color or "none"'),
    stroke_width: z.number().optional().describe('Stroke width'),
    stroke_linecap: z.enum(['butt', 'round', 'square']).optional().describe('Line cap shape'),
    stroke_linejoin: z.enum(['miter', 'round', 'bevel']).optional().describe('Line join shape'),
    stroke_dasharray: z.string().optional().describe('Dash pattern, e.g. "5 3" or "10 5 2 5"'),
    stroke_opacity: z.number().optional().describe('Stroke opacity 0-1'),
    fill_opacity: z.number().optional().describe('Fill opacity 0-1'),
    mix_blend_mode: z.enum([
      'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
      'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion',
    ]).optional().describe('CSS blend mode for layer compositing'),
    filter_ref: z.string().optional().describe('Filter reference, e.g. "url(#my-filter)"'),
    clip_path: z.string().optional().describe('Clip path reference, e.g. "url(#my-clip)"'),
    mask_ref: z.string().optional().describe('Mask reference, e.g. "url(#my-mask)"'),
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
  'Add, update, or delete items in <defs> (gradients, patterns, filters)',
  {
    action: z.enum(['add', 'update', 'delete']).describe('Operation to perform'),
    id: z.string().describe('Id of the def element'),
    content: z.string().optional().describe('SVG content (required for add/update)'),
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

// ---------------------------------------------------------------------------
// Preview (2)
// ---------------------------------------------------------------------------

server.tool(
  'preview_as_png',
  'Render the entire canvas as PNG for visual self-review',
  {
    width: z.number().optional().describe('Output image width in pixels'),
    height: z.number().optional().describe('Output image height in pixels'),
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
// Professional Tools (4)
// ---------------------------------------------------------------------------

server.tool(
  'apply_filter',
  `Apply a preset filter effect to a layer. Each filter accepts specific parameters:
- drop-shadow: dx (4), dy (4), blur (6), color ("#000000"), opacity (0.5)
- blur: radius (5)
- glow: radius (10), color ("#ffffff"), opacity (0.8)
- emboss: strength (2)
- noise-texture: frequency (0.65), octaves (3), type ("fractalNoise")
- paper: frequency (0.04), intensity (0.15)
- watercolor: displacement (20), blur (3)
- metallic: shininess (30), light_x (200), light_y (100)
- glass: shininess (50), opacity (0.3)
Values in parentheses are defaults. Pass params as key-value pairs.`,
  {
    layer_id: z.string().describe('The layer id to apply the filter to'),
    filter_type: z.enum([
      'drop-shadow', 'blur', 'glow', 'emboss', 'noise-texture',
      'paper', 'watercolor', 'metallic', 'glass',
    ]).describe('Type of filter to apply'),
    params: z.record(z.string(), z.union([z.number(), z.string()])).optional().describe(
      'Filter-specific parameters (see description for each filter type)',
    ),
  },
  async (params) => textTool('filter/apply', params),
);

server.tool(
  'apply_style_preset',
  'Apply a unified style preset (flat, isometric, line-art, watercolor, retro, minimalist) across layers',
  {
    preset: z.enum(['flat', 'isometric', 'line-art', 'watercolor', 'retro', 'minimalist']).describe('Style preset name'),
    layers: z.array(z.string()).optional().describe('Specific layer ids to affect (default: all layers)'),
  },
  async (params) => textTool('style/apply', params),
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
// Start server
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
