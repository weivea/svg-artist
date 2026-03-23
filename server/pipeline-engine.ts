import { SvgEngine } from './svg-engine.js';
import type { FilterParams, FilterResult } from './filter-templates.js';
import { generateFilterOrCustom } from './filter-templates.js';
import type { StylePreset } from './style-presets.js';
import { renderSvgToPng, renderLayerToPng } from './png-renderer.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PipelineStep {
  action: string;
  params?: Record<string, unknown>;
  store_as?: string;
  for_each?: string;
}

export interface PipelineContext {
  drawId: string;
  /** Variables stored by previous steps via `store_as` */
  vars: Record<string, unknown>;
  /** The result of the previous step */
  prev: unknown;
  /** Body params from the incoming request */
  input: Record<string, unknown>;
}

export interface PipelineDeps {
  getSvgEngine: (drawId: string) => Promise<SvgEngine | null>;
  saveSvg: (drawId: string, svg: string) => Promise<void>;
  broadcastSvg: (drawId: string, svg: string) => void;
}

// ---------------------------------------------------------------------------
// Action type
// ---------------------------------------------------------------------------

type ActionFn = (
  params: Record<string, unknown>,
  ctx: PipelineContext,
  deps: PipelineDeps,
) => Promise<unknown>;

// ---------------------------------------------------------------------------
// Helpers: template resolution
// ---------------------------------------------------------------------------

/**
 * Resolve template placeholders in a string value.
 * - `{{$prev}}`, `{{$item}}`, `{{$index}}` — special variables
 * - `{{$input.key}}`, `{{$vars.key}}` — namespaced lookups
 * - `{{$var_name}}` — stored variable (falls back to ctx.vars)
 * - `{{param}}` (no $) — direct input parameter reference
 *
 * When the entire string is a single placeholder (e.g. `"{{filter_params}}"`),
 * the raw value is returned without String coercion, preserving objects/arrays.
 */
export function resolveTemplate(value: string, ctx: PipelineContext, item?: unknown, index?: number): unknown {
  // Whole-value optimization: if entire string is one placeholder, return raw value
  const wholeMatch = value.match(/^\{\{(\$?)(\w+(?:\.\w+)*)\}\}$/);
  if (wholeMatch) {
    const [, prefix, path] = wholeMatch;
    if (prefix === '$') {
      return resolveVariable(path, ctx, item, index);
    }
    return ctx.input[path] ?? '';
  }

  // Multiple or partial placeholders: string interpolation with String() coercion
  return value.replace(/\{\{(\$?)(\w+(?:\.\w+)*)\}\}/g, (_match, prefix: string, path: string) => {
    if (prefix === '$') {
      return String(resolveVariable(path, ctx, item, index));
    }
    // No $ prefix → direct input parameter reference
    return String(ctx.input[path] ?? '');
  });
}

export function resolveVariable(path: string, ctx: PipelineContext, item?: unknown, index?: number): unknown {
  if (path === 'prev') return ctx.prev ?? '';
  if (path === 'item') return item ?? '';
  if (path === 'index') return index ?? 0;
  if (path.startsWith('input.')) {
    const key = path.slice('input.'.length);
    return ctx.input[key] ?? '';
  }
  if (path.startsWith('vars.')) {
    const key = path.slice('vars.'.length);
    return ctx.vars[key] ?? '';
  }
  // Fallback: check stored variables by bare name (e.g. {{$all_layers}})
  if (path in ctx.vars) {
    return ctx.vars[path];
  }
  return '';
}

/**
 * Recursively resolve templates in params object.
 * Handles the case where resolveTemplate returns a raw value (object/array)
 * when the entire string is a single placeholder.
 */
export function resolveParams(
  params: Record<string, unknown> | undefined,
  ctx: PipelineContext,
  item?: unknown,
  index?: number,
): Record<string, unknown> {
  if (!params) return {};
  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      resolved[key] = resolveTemplate(value, ctx, item, index);
    } else if (Array.isArray(value)) {
      resolved[key] = value.map(v =>
        typeof v === 'string' ? resolveTemplate(v, ctx, item, index) : v
      );
    } else if (value !== null && typeof value === 'object') {
      resolved[key] = resolveParams(value as Record<string, unknown>, ctx, item, index);
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}

// ---------------------------------------------------------------------------
// Action implementations
// ---------------------------------------------------------------------------

const addLayer: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  const layerId = engine.addLayer(
    params.name as string,
    params.content as string,
    params.parent_id as string | undefined,
    params.position as number | undefined,
  );
  if (!layerId) throw new Error('Failed to add layer');
  const svg = engine.serialize();
  await deps.saveSvg(ctx.drawId, svg);
  deps.broadcastSvg(ctx.drawId, svg);
  return { ok: true, layer_id: layerId };
};

const updateLayer: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  const ok = engine.updateLayer(params.layer_id as string, params.content as string);
  if (!ok) throw new Error('Layer not found');
  const svg = engine.serialize();
  await deps.saveSvg(ctx.drawId, svg);
  deps.broadcastSvg(ctx.drawId, svg);
  return { ok: true, layer_id: params.layer_id };
};

const deleteLayer: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  const ok = engine.deleteLayer(params.layer_id as string);
  if (!ok) throw new Error('Layer not found');
  const svg = engine.serialize();
  await deps.saveSvg(ctx.drawId, svg);
  deps.broadcastSvg(ctx.drawId, svg);
  return { ok: true };
};

const listLayers: ActionFn = async (_params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  return { layers: engine.listLayers() };
};

const getLayer: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  const content = engine.getLayer(params.layer_id as string);
  if (content === null) throw new Error('Layer not found');
  return { content };
};

const moveLayer: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  const ok = engine.moveLayer(
    params.layer_id as string,
    params.position as number,
    params.target_parent_id as string | undefined,
  );
  if (!ok) throw new Error('Layer not found');
  const svg = engine.serialize();
  await deps.saveSvg(ctx.drawId, svg);
  deps.broadcastSvg(ctx.drawId, svg);
  return { ok: true };
};

const duplicateLayer: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  const newId = engine.duplicateLayer(
    params.layer_id as string,
    params.new_name as string | undefined,
    params.transform as { translate?: { x: number; y: number } } | undefined,
  );
  if (!newId) throw new Error('Layer not found');
  const svg = engine.serialize();
  await deps.saveSvg(ctx.drawId, svg);
  deps.broadcastSvg(ctx.drawId, svg);
  return { ok: true, new_layer_id: newId };
};

const transformLayer: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  const ok = engine.transformLayer(params.layer_id as string, {
    translate: params.translate as { x: number; y: number } | undefined,
    scale: params.scale as { x: number; y: number } | undefined,
    rotate: params.rotate as { angle: number; cx?: number; cy?: number } | undefined,
  });
  if (!ok) throw new Error('Layer not found');
  const svg = engine.serialize();
  await deps.saveSvg(ctx.drawId, svg);
  deps.broadcastSvg(ctx.drawId, svg);
  return { ok: true };
};

const setLayerOpacity: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  const ok = engine.setLayerOpacity(params.layer_id as string, Number(params.opacity));
  if (!ok) throw new Error('Layer not found');
  const svg = engine.serialize();
  await deps.saveSvg(ctx.drawId, svg);
  deps.broadcastSvg(ctx.drawId, svg);
  return { ok: true };
};

const setLayerStyle: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  const { layer_id, ...styles } = params;
  const ok = engine.setLayerStyle(layer_id as string, styles as Record<string, string | number>);
  if (!ok) throw new Error('Layer not found');
  const svg = engine.serialize();
  await deps.saveSvg(ctx.drawId, svg);
  deps.broadcastSvg(ctx.drawId, svg);
  return { ok: true };
};

const getCanvasInfo: ActionFn = async (_params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  return engine.getCanvasInfo();
};

const getSvgSource: ActionFn = async (_params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  return { svg: engine.serialize() };
};

const setViewBox: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  engine.setViewBox(
    params.x as number | undefined,
    params.y as number | undefined,
    params.width as number | undefined,
    params.height as number | undefined,
  );
  const svg = engine.serialize();
  await deps.saveSvg(ctx.drawId, svg);
  deps.broadcastSvg(ctx.drawId, svg);
  return { ok: true };
};

const manageDefs: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  const ok = engine.manageDefs(
    params.action as 'add' | 'update' | 'delete',
    params.id as string,
    params.content as string | undefined,
  );
  if (!ok) throw new Error('Defs operation failed');
  const svg = engine.serialize();
  await deps.saveSvg(ctx.drawId, svg);
  deps.broadcastSvg(ctx.drawId, svg);
  return { ok: true, id: params.id };
};

const applyFilter: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  const filterResult: FilterResult | null = await generateFilterOrCustom(
    params.filter_type as string,
    params.params as FilterParams | undefined,
  );
  if (!filterResult) throw new Error(`Unknown filter type: ${params.filter_type}`);
  const result = engine.applyFilterDef(params.layer_id as string, filterResult.filterId, filterResult.filterSvg);
  if (!result.ok) throw new Error(result.error || 'Failed to apply filter');
  const svg = engine.serialize();
  await deps.saveSvg(ctx.drawId, svg);
  deps.broadcastSvg(ctx.drawId, svg);
  return { ok: true, filter_id: result.filterId };
};

const applyStylePreset: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  const result = engine.applyStyleToLayers(
    params.preset as StylePreset,
    params.layers as string[] | undefined,
  );
  if (!result.ok) throw new Error(result.error || 'Failed to apply style');
  const svg = engine.serialize();
  await deps.saveSvg(ctx.drawId, svg);
  deps.broadcastSvg(ctx.drawId, svg);
  return { ok: true, affected_layers: result.affectedLayers, description: result.description };
};

const getElementBBox: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  const bbox = engine.getElementBBox(params.element_id as string);
  if (!bbox) throw new Error('Element not found');
  return bbox;
};

const previewAsPng: ActionFn = async (params, ctx, deps) => {
  const engine = await deps.getSvgEngine(ctx.drawId);
  if (!engine) throw new Error('Drawing not found');
  const svgStr = engine.serialize();
  const png = renderSvgToPng(svgStr, (params.width as number) || 800, params.height as number | undefined);
  return { image: png.toString('base64') };
};

// ---------------------------------------------------------------------------
// Action Registry
// ---------------------------------------------------------------------------

const ACTION_REGISTRY: Record<string, ActionFn> = {
  'add_layer': addLayer,
  'update_layer': updateLayer,
  'delete_layer': deleteLayer,
  'list_layers': listLayers,
  'get_layer': getLayer,
  'move_layer': moveLayer,
  'duplicate_layer': duplicateLayer,
  'transform_layer': transformLayer,
  'set_layer_opacity': setLayerOpacity,
  'set_layer_style': setLayerStyle,
  'get_canvas_info': getCanvasInfo,
  'get_svg_source': getSvgSource,
  'set_viewbox': setViewBox,
  'manage_defs': manageDefs,
  'apply_filter': applyFilter,
  'apply_style_preset': applyStylePreset,
  'get_element_bbox': getElementBBox,
  'preview_as_png': previewAsPng,
  // Spec aliases — accept both spec names and original names
  'get_layers': listLayers,
  'set_opacity': setLayerOpacity,
  'style_layer': setLayerStyle,
  'apply_style': applyStylePreset,
  'compute_bbox': getElementBBox,
  'preview_png': previewAsPng,
};

/**
 * Get the list of registered action names. Used by validators.
 */
export function getRegisteredActions(): string[] {
  return Object.keys(ACTION_REGISTRY);
}

// ---------------------------------------------------------------------------
// Pipeline executor
// ---------------------------------------------------------------------------

export async function executePipeline(
  steps: PipelineStep[],
  ctx: PipelineContext,
  deps: PipelineDeps,
): Promise<unknown> {
  let lastResult: unknown = undefined;

  for (const step of steps) {
    const actionFn = ACTION_REGISTRY[step.action];
    if (!actionFn) {
      throw new Error(`Unknown pipeline action: ${step.action}`);
    }

    if (step.for_each) {
      // Resolve the iterable — for_each can be a template like "{{layer_ids}}" or "{{$all_layers}}"
      const iterableRaw = resolveTemplate(step.for_each, ctx);
      const iterable = Array.isArray(iterableRaw) ? iterableRaw : [];
      const results: unknown[] = [];

      for (let i = 0; i < iterable.length; i++) {
        const item = iterable[i];
        const resolvedParams = resolveParams(step.params, ctx, item, i);
        const result = await actionFn(resolvedParams, ctx, deps);
        results.push(result);
        ctx.prev = result;
      }

      lastResult = results;
    } else {
      const resolvedParams = resolveParams(step.params, ctx);
      lastResult = await actionFn(resolvedParams, ctx, deps);
      ctx.prev = lastResult;
    }

    if (step.store_as) {
      ctx.vars[step.store_as] = lastResult;
    }
  }

  return lastResult;
}
