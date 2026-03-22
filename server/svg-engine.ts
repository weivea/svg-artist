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

  private _slugify(name: string): string {
    // Convert to lowercase, replace non-alphanumeric (including unicode) with dashes
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'layer';
  }

  private _getLayerChildren(parent: Element): Element[] {
    return Array.from(parent.children).filter(child => this._isLayerGroup(child));
  }

  private _findLayerElement(layerId: string): Element | null {
    const element = this.svgElement.querySelector(`[id="${layerId}"]`);
    if (!element || element.tagName.toLowerCase() !== 'g') {
      return null;
    }
    return element;
  }

  addLayer(name: string, content: string, parentId?: string, position?: number): string | null {
    // Determine parent element
    let parent: Element;
    if (parentId) {
      const parentEl = this._findLayerElement(parentId);
      if (!parentEl) return null;
      parent = parentEl;
    } else {
      parent = this.svgElement;
    }

    // Generate unique id
    const slug = this._slugify(name);
    const id = `layer-${slug}-${Date.now().toString(36)}`;

    // Create the <g> element
    const g = this.document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', id);
    g.setAttribute('data-name', name);
    g.innerHTML = content;

    // Insert at position or append
    if (position !== undefined && position !== null) {
      const layerChildren = this._getLayerChildren(parent);
      if (position >= layerChildren.length) {
        parent.appendChild(g);
      } else {
        parent.insertBefore(g, layerChildren[position]);
      }
    } else {
      parent.appendChild(g);
    }

    return id;
  }

  updateLayer(layerId: string, content: string): boolean {
    const element = this._findLayerElement(layerId);
    if (!element) return false;
    element.innerHTML = content;
    return true;
  }

  deleteLayer(layerId: string): boolean {
    const element = this._findLayerElement(layerId);
    if (!element) return false;
    element.parentNode!.removeChild(element);
    return true;
  }

  moveLayer(layerId: string, position: number, targetParentId?: string): boolean {
    const element = this._findLayerElement(layerId);
    if (!element) return false;

    // Determine target parent
    let targetParent: Element;
    if (targetParentId) {
      const parentEl = this._findLayerElement(targetParentId);
      if (!parentEl) return false;
      targetParent = parentEl;
    } else {
      // Stay under current parent
      targetParent = element.parentElement || this.svgElement;
    }

    // Remove from current position
    element.parentNode!.removeChild(element);

    // Insert at new position
    const layerChildren = this._getLayerChildren(targetParent);
    if (position >= layerChildren.length) {
      targetParent.appendChild(element);
    } else {
      targetParent.insertBefore(element, layerChildren[position]);
    }

    return true;
  }

  duplicateLayer(layerId: string, newName?: string, transform?: string): string | null {
    const element = this._findLayerElement(layerId);
    if (!element) return null;

    // Clone the element
    const clone = element.cloneNode(true) as Element;

    // Generate new id
    const name = newName || (element.getAttribute('data-name') || layerId) + ' copy';
    const slug = this._slugify(name);
    const newId = `layer-${slug}-${Date.now().toString(36)}`;

    clone.setAttribute('id', newId);
    clone.setAttribute('data-name', name);

    // Update nested layer ids to avoid duplicates
    const nestedLayers = clone.querySelectorAll('[id^="layer-"]');
    for (const nested of Array.from(nestedLayers)) {
      const oldId = nested.getAttribute('id');
      if (oldId) {
        nested.setAttribute('id', `${oldId}-${Date.now().toString(36)}`);
      }
    }

    // Apply transform if provided
    if (transform) {
      clone.setAttribute('transform', transform);
    }

    // Insert after the original element
    const parent = element.parentElement || this.svgElement;
    const nextSibling = element.nextElementSibling;
    if (nextSibling) {
      parent.insertBefore(clone, nextSibling);
    } else {
      parent.appendChild(clone);
    }

    return newId;
  }
}
