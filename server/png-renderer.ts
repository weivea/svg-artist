import { Resvg } from '@resvg/resvg-js';

/**
 * Render an SVG string to a PNG buffer.
 */
export function renderSvgToPng(svgString: string, width?: number, height?: number): Buffer {
  const opts: any = {};
  if (width) {
    opts.fitTo = { mode: 'width' as const, value: width };
  }

  const resvg = new Resvg(svgString, opts);
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}

/**
 * Extract a single layer from SVG and render as PNG.
 * Wraps the layer in a new SVG with the same viewBox and defs.
 */
export function renderLayerToPng(
  svgString: string,
  layerId: string,
  width?: number,
  height?: number,
  showBackground?: boolean,
): Buffer | null {
  // Extract viewBox
  const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 800 800';

  // Extract the xmlns
  const xmlnsMatch = svgString.match(/xmlns="([^"]+)"/);
  const xmlns = xmlnsMatch ? xmlnsMatch[1] : 'http://www.w3.org/2000/svg';

  // Find the layer element (handle nested <g> properly)
  // Use a non-greedy approach: find the opening tag, then match until the proper closing </g>
  const layerOpenRegex = new RegExp(`<g[^>]*\\bid="${layerId}"[^>]*>`);
  const openMatch = svgString.match(layerOpenRegex);
  if (!openMatch || openMatch.index === undefined) return null;

  // Find matching closing tag by counting <g> and </g> nesting
  let depth = 1;
  let pos = openMatch.index + openMatch[0].length;
  while (depth > 0 && pos < svgString.length) {
    const nextOpen = svgString.indexOf('<g', pos);
    const nextClose = svgString.indexOf('</g>', pos);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 2;
    } else {
      depth--;
      if (depth === 0) {
        pos = nextClose + 5; // '</g>'.length = 4, +1
        break;
      }
      pos = nextClose + 4;
    }
  }
  const layerContent = svgString.slice(openMatch.index, pos);

  // Extract defs if present (layer may reference gradients)
  const defsMatch = svgString.match(/<defs>[\s\S]*?<\/defs>/i);
  const defs = defsMatch ? defsMatch[0] : '';

  const bg = showBackground ? `<rect width="100%" height="100%" fill="white"/>` : '';

  const layerSvg = `<svg viewBox="${viewBox}" xmlns="${xmlns}">${defs}${bg}${layerContent}</svg>`;
  return renderSvgToPng(layerSvg, width, height);
}
