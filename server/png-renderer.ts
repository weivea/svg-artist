import { Resvg } from '@resvg/resvg-js';
import { parseHTML } from 'linkedom';

/**
 * Render an SVG string to a PNG buffer.
 * @param background - Optional CSS color string for background (e.g. "#ffffff", "rgba(0,0,0,0.5)")
 * @param dpi - Optional DPI value (default 72). Higher DPI scales the render dimensions.
 */
export function renderSvgToPng(
  svgString: string,
  width?: number,
  height?: number,
  background?: string,
  dpi?: number,
): Buffer {
  const opts: any = {};
  if (width) {
    opts.fitTo = { mode: 'width' as const, value: width };
  }
  if (background) {
    opts.background = background;
  }
  if (dpi && dpi !== 72) {
    opts.dpi = dpi;
    // If no explicit fitTo width, scale the render based on DPI
    if (!width) {
      const scale = dpi / 72;
      opts.fitTo = { mode: 'zoom' as const, value: scale };
    }
  }

  const resvg = new Resvg(svgString, opts);
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}

/**
 * Extract a single layer from SVG and render as PNG.
 * Uses linkedom DOM parsing (same as SvgEngine) for reliable layer extraction.
 */
export function renderLayerToPng(
  svgString: string,
  layerId: string,
  width?: number,
  height?: number,
  showBackground?: boolean,
): Buffer | null {
  const { document } = parseHTML(svgString);
  const svg = document.querySelector('svg');
  if (!svg) return null;

  // Find the layer element by id
  const layer = svg.querySelector(`[id="${layerId}"]`);
  if (!layer) return null;

  // Get viewBox and xmlns from original SVG
  const viewBox = svg.getAttribute('viewBox') || '0 0 800 800';
  const xmlns = svg.getAttribute('xmlns') || 'http://www.w3.org/2000/svg';

  // Extract defs if present (layer may reference gradients, filters, etc.)
  const defs = svg.querySelector('defs');
  const defsHtml = defs ? defs.outerHTML : '';

  // Serialize the layer element via DOM — guaranteed well-formed
  const layerHtml = layer.outerHTML;

  const bg = showBackground ? `<rect width="100%" height="100%" fill="white"/>` : '';

  const layerSvg = `<svg viewBox="${viewBox}" xmlns="${xmlns}">${defsHtml}${bg}${layerHtml}</svg>`;
  return renderSvgToPng(layerSvg, width, height);
}
