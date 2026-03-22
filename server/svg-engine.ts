import { parseHTML } from 'linkedom';

export interface LayerInfo {
  id: string;
  name: string;
  children: LayerInfo[];
}

export interface CanvasInfo {
  viewBox: string;
  layerCount: number;
  defsCount: number;
  totalElements: number;
}

export class SvgEngine {
  private document: Document;
  private svgElement: Element;

  constructor(svgString: string) {
    const { document } = parseHTML(svgString);
    this.document = document;
    const svg = document.querySelector('svg');
    if (!svg) {
      throw new Error('Invalid SVG: no <svg> element found');
    }
    this.svgElement = svg;
  }

  serialize(): string {
    return this.svgElement.outerHTML;
  }

  private _isLayerGroup(el: Element): boolean {
    return el.tagName.toLowerCase() === 'g' && !!el.id && el.id.startsWith('layer-');
  }

  getCanvasInfo(): CanvasInfo {
    const viewBox = this.svgElement.getAttribute('viewBox') || '';
    const allElements = this.svgElement.querySelectorAll('*');
    const defs = this.svgElement.querySelectorAll('defs');

    // Count top-level layer groups (direct <g> children with id starting with "layer-")
    let layerCount = 0;
    for (const child of Array.from(this.svgElement.children)) {
      if (this._isLayerGroup(child)) {
        layerCount++;
      }
    }

    return {
      viewBox,
      layerCount,
      defsCount: defs.length,
      totalElements: allElements.length,
    };
  }

  listLayers(): LayerInfo[] {
    const layers: LayerInfo[] = [];

    for (const child of Array.from(this.svgElement.children)) {
      if (this._isLayerGroup(child)) {
        layers.push(this._buildLayerTree(child));
      }
    }

    return layers;
  }

  private _buildLayerTree(element: Element): LayerInfo {
    const children: LayerInfo[] = [];

    for (const child of Array.from(element.children)) {
      if (this._isLayerGroup(child)) {
        children.push(this._buildLayerTree(child));
      }
    }

    return {
      id: element.id,
      name: element.getAttribute('data-name') || element.id,
      children,
    };
  }

  getLayer(layerId: string): string | null {
    // Use attribute selector to avoid issues with CSS.escape
    const element = this.svgElement.querySelector(`[id="${layerId}"]`);
    if (!element || element.tagName.toLowerCase() !== 'g') {
      return null;
    }
    return element.innerHTML;
  }

  getSource(): string {
    return this.serialize();
  }
}
