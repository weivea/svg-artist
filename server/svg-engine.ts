import { parseHTML } from 'linkedom';
import { generateFilter, FilterType, FilterParams } from './filter-templates.js';
import { getPresetRules, StylePreset } from './style-presets.js';

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

// linkedom types - DOM types (Document, Element) are not available in server tsconfig
// (no lib: "DOM"). We use `any` for linkedom's DOM-like objects.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LDocument = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LElement = any;

export class SvgEngine {
  private document: LDocument;
  private svgElement: LElement;

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

  private _isLayerGroup(el: LElement): boolean {
    return el.tagName.toLowerCase() === 'g' && !!el.id && el.id.startsWith('layer-');
  }

  getCanvasInfo(): CanvasInfo {
    const viewBox = this.svgElement.getAttribute('viewBox') || '';
    const allElements = this.svgElement.querySelectorAll('*');
    const defs = this.svgElement.querySelector('defs');
    const defsCount = defs ? Array.from(defs.children).length : 0;

    // Count all layer groups (including nested ones)
    const allLayerGroups = this.svgElement.querySelectorAll('[id^="layer-"]');
    let layerCount = 0;
    for (const child of Array.from(allLayerGroups) as LElement[]) {
      if (child.tagName.toLowerCase() === 'g') {
        layerCount++;
      }
    }

    return {
      viewBox,
      layerCount,
      defsCount,
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

  private _buildLayerTree(element: LElement): LayerInfo {
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

  private _getLayerChildren(parent: LElement): LElement[] {
    return Array.from(parent.children).filter((child: LElement) => this._isLayerGroup(child));
  }

  private _findLayerElement(layerId: string): LElement | null {
    const element = this.svgElement.querySelector(`[id="${layerId}"]`);
    if (!element || element.tagName.toLowerCase() !== 'g') {
      return null;
    }
    return element;
  }

  addLayer(name: string, content: string, parentId?: string, position?: number): string | null {
    // Determine parent element
    let parent: LElement;
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
    let targetParent: LElement;
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

  duplicateLayer(layerId: string, newName?: string, transform?: { translate?: { x: number; y: number } }): string | null {
    const element = this._findLayerElement(layerId);
    if (!element) return null;

    // Clone the element
    const clone = element.cloneNode(true) as LElement;

    // Generate new id
    const name = newName || (element.getAttribute('data-name') || layerId) + ' copy';
    const slug = this._slugify(name);
    const newId = `layer-${slug}-${Date.now().toString(36)}`;

    clone.setAttribute('id', newId);
    clone.setAttribute('data-name', name);

    // Update nested layer ids to avoid duplicates
    const nestedLayers = clone.querySelectorAll('[id^="layer-"]');
    for (const nested of Array.from(nestedLayers) as LElement[]) {
      const oldId = nested.getAttribute('id');
      if (oldId) {
        nested.setAttribute('id', `${oldId}-${Date.now().toString(36)}`);
      }
    }

    // Apply transform if provided
    if (transform) {
      const parts: string[] = [];
      if (transform.translate) parts.push(`translate(${transform.translate.x}, ${transform.translate.y})`);
      if (parts.length > 0) {
        clone.setAttribute('transform', parts.join(' '));
      }
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

  /** Apply transform to a layer */
  transformLayer(layerId: string, opts: {
    translate?: { x: number; y: number };
    scale?: { x: number; y: number };
    rotate?: { angle: number; cx?: number; cy?: number };
  }): boolean {
    const g = this._findLayerElement(layerId);
    if (!g) return false;

    const parts: string[] = [];
    if (opts.translate) parts.push(`translate(${opts.translate.x}, ${opts.translate.y})`);
    if (opts.scale) parts.push(`scale(${opts.scale.x}, ${opts.scale.y})`);
    if (opts.rotate) {
      const { angle, cx, cy } = opts.rotate;
      parts.push(cx !== undefined && cy !== undefined ? `rotate(${angle}, ${cx}, ${cy})` : `rotate(${angle})`);
    }

    if (parts.length === 0) return true; // no-op

    g.setAttribute('transform', parts.join(' '));
    return true;
  }

  /** Set layer opacity */
  setLayerOpacity(layerId: string, opacity: number): boolean {
    const g = this._findLayerElement(layerId);
    if (!g) return false;
    const clamped = Math.max(0, Math.min(1, opacity));
    g.setAttribute('opacity', String(clamped));
    return true;
  }

  /** Set style attributes on a layer <g> element */
  setLayerStyle(layerId: string, styles: Record<string, string | number>): boolean {
    const g = this._findLayerElement(layerId);
    if (!g) return false;
    for (const [key, value] of Object.entries(styles)) {
      const attrName = key.replace(/_/g, '-'); // stroke_width → stroke-width
      g.setAttribute(attrName, String(value));
    }
    return true;
  }

  /** List all defs (gradients, filters, patterns, clipPaths) */
  listDefs(): Array<{ id: string; type: string }> {
    const defs = this.svgElement.querySelector('defs');
    if (!defs) return [];
    return (Array.from(defs.children) as LElement[]).map((child: LElement) => ({
      id: child.id || child.getAttribute('id') || '',
      type: child.tagName.toLowerCase(),
    }));
  }

  /** Manage defs: add, update, or delete */
  manageDefs(action: 'add' | 'update' | 'delete', id: string, content?: string): boolean {
    let defs = this.svgElement.querySelector('defs');

    if (action === 'delete') {
      if (!defs) return false;
      const existing = defs.querySelector(`[id="${id}"]`);
      if (!existing) return false;
      existing.remove();
      return true;
    }

    if (action === 'add') {
      if (!content) return false;
      if (!defs) {
        // Create <defs> and insert as first child of <svg>
        defs = this.document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        this.svgElement.insertBefore(defs, this.svgElement.firstChild);
      }
      // Parse content into temp doc
      const { document: tempDoc } = parseHTML(`<!DOCTYPE html><html><body>${content}</body></html>`);
      const newEl = tempDoc.body.firstElementChild;
      if (!newEl) return false;
      defs.appendChild(newEl.cloneNode(true));
      return true;
    }

    if (action === 'update') {
      if (!content || !defs) return false;
      const existing = defs.querySelector(`[id="${id}"]`);
      if (!existing) return false;
      const { document: tempDoc } = parseHTML(`<!DOCTYPE html><html><body>${content}</body></html>`);
      const newEl = tempDoc.body.firstElementChild;
      if (!newEl) return false;
      existing.replaceWith(newEl.cloneNode(true));
      return true;
    }

    return false;
  }

  /** Set SVG viewBox. Partial updates preserve existing values. */
  setViewBox(x?: number, y?: number, width?: number, height?: number): boolean {
    const current = (this.svgElement.getAttribute('viewBox') || '0 0 800 800').split(/\s+/).map(Number);
    const newVB = [
      x ?? current[0],
      y ?? current[1],
      width ?? current[2],
      height ?? current[3],
    ];
    this.svgElement.setAttribute('viewBox', newVB.join(' '));
    return true;
  }

  /** Get bounding box of an element by parsing its geometry attributes.
   * linkedom doesn't support getBBox(), so we estimate from attributes. */
  getElementBBox(elementId: string): BBox | null {
    const el = this.svgElement.querySelector(`[id="${elementId}"]`);
    if (!el) return null;

    const tag = el.tagName.toLowerCase();

    // For <g> elements, compute union of children bboxes
    if (tag === 'g') {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const shapeChildren = el.querySelectorAll('circle, rect, ellipse, polygon, polyline, line, path, text');
      for (const child of Array.from(shapeChildren) as LElement[]) {
        const bbox = this._elementBBox(child);
        if (bbox) {
          minX = Math.min(minX, bbox.x);
          minY = Math.min(minY, bbox.y);
          maxX = Math.max(maxX, bbox.x + bbox.width);
          maxY = Math.max(maxY, bbox.y + bbox.height);
        }
      }
      if (minX === Infinity) return { x: 0, y: 0, width: 0, height: 0 };
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    return this._elementBBox(el);
  }

  /** Get bounding boxes for all layers */
  getAllElementBboxes(): Map<string, BBox> {
    const result = new Map<string, BBox>();
    const layers = this.listLayers();
    for (const layer of layers) {
      const bbox = this.getElementBBox(layer.id);
      if (bbox && (bbox.width > 0 || bbox.height > 0)) {
        result.set(layer.id, bbox);
      }
    }
    return result;
  }

  /** Apply a preset filter to a layer. Adds filter def and sets filter attribute. */
  applyFilter(layerId: string, filterType: FilterType, params?: FilterParams): { ok: boolean; filterId?: string; error?: string } {
    const g = this._findLayerElement(layerId);
    if (!g) return { ok: false, error: 'Layer not found' };

    const { filterId, filterSvg } = generateFilter(filterType, params);

    // Add filter to defs
    const added = this.manageDefs('add', filterId, filterSvg);
    if (!added) return { ok: false, error: 'Failed to add filter to defs' };

    // Set filter attribute on the layer
    g.setAttribute('filter', `url(#${filterId})`);

    return { ok: true, filterId };
  }

  /** Apply a style preset to specified layers (or all layers if none specified). */
  applyStyleToLayers(preset: StylePreset, layerIds?: string[]): { ok: boolean; affectedLayers: string[]; filters?: string[]; description?: string; error?: string } {
    const presetResult = getPresetRules(preset);
    const { rules, filters, description } = presetResult;

    // If filters are needed, add them to defs
    if (filters) {
      for (const filterSvg of filters) {
        // Extract id from filter SVG
        const idMatch = filterSvg.match(/id="([^"]+)"/);
        if (idMatch) {
          this.manageDefs('add', idMatch[1], filterSvg);
        }
      }
    }

    // Get target layers
    const layers = this.listLayers();
    const targetIds = layerIds && layerIds.length > 0
      ? layerIds
      : layers.map((l) => l.id);

    const affected: string[] = [];

    for (const id of targetIds) {
      const g = this._findLayerElement(id);
      if (!g) continue;

      // Apply style rules to the layer group
      if (rules.fill !== undefined) {
        if (rules.fill === null) {
          g.removeAttribute('fill');
        } else {
          g.setAttribute('fill', rules.fill);
        }
      }
      if (rules.stroke !== undefined) {
        if (rules.stroke === null) {
          g.removeAttribute('stroke');
        } else {
          g.setAttribute('stroke', rules.stroke);
        }
      }
      if (rules.strokeWidth !== undefined) {
        if (rules.strokeWidth === null) {
          g.removeAttribute('stroke-width');
        } else {
          g.setAttribute('stroke-width', String(rules.strokeWidth));
        }
      }
      if (rules.opacity !== undefined) {
        g.setAttribute('opacity', String(rules.opacity));
      }
      if (rules.filter !== undefined) {
        if (rules.filter === null) {
          g.removeAttribute('filter');
        } else {
          g.setAttribute('filter', rules.filter);
        }
      }
      if (rules.transform !== undefined && rules.transform !== null) {
        g.setAttribute('transform', rules.transform);
      }

      affected.push(id);
    }

    return { ok: true, affectedLayers: affected, filters: filters, description };
  }

  private _elementBBox(el: LElement): BBox | null {
    const tag = el.tagName.toLowerCase();
    if (tag === 'rect') {
      return {
        x: parseFloat(el.getAttribute('x') || '0'),
        y: parseFloat(el.getAttribute('y') || '0'),
        width: parseFloat(el.getAttribute('width') || '0'),
        height: parseFloat(el.getAttribute('height') || '0'),
      };
    }
    if (tag === 'circle') {
      const cx = parseFloat(el.getAttribute('cx') || '0');
      const cy = parseFloat(el.getAttribute('cy') || '0');
      const r = parseFloat(el.getAttribute('r') || '0');
      return { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
    }
    if (tag === 'ellipse') {
      const cx = parseFloat(el.getAttribute('cx') || '0');
      const cy = parseFloat(el.getAttribute('cy') || '0');
      const rx = parseFloat(el.getAttribute('rx') || '0');
      const ry = parseFloat(el.getAttribute('ry') || '0');
      return { x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2 };
    }
    if (tag === 'polygon' || tag === 'polyline') {
      const points = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
      if (points.length < 2) return null;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < points.length; i += 2) {
        if (!isNaN(points[i]) && !isNaN(points[i + 1])) {
          minX = Math.min(minX, points[i]);
          maxX = Math.max(maxX, points[i]);
          minY = Math.min(minY, points[i + 1]);
          maxY = Math.max(maxY, points[i + 1]);
        }
      }
      if (minX === Infinity) return null;
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    if (tag === 'line') {
      const x1 = parseFloat(el.getAttribute('x1') || '0');
      const y1 = parseFloat(el.getAttribute('y1') || '0');
      const x2 = parseFloat(el.getAttribute('x2') || '0');
      const y2 = parseFloat(el.getAttribute('y2') || '0');
      return { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) };
    }
    return null;
  }
}
