import { SvgEngine } from './svg-engine.js';

export interface ScratchCanvasInfo {
  canvasId: string;
  drawId: string;
  viewBox: string;
  layerCount: number;
  createdAt: number;
}

interface ScratchCanvas {
  svgEngine: SvgEngine;
  drawId: string;
  viewBox: string;
  createdAt: number;
}

export class ScratchCanvasStore {
  private canvases = new Map<string, ScratchCanvas>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(cleanupIntervalMs = 5 * 60 * 1000) {
    this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalMs);
  }

  create(drawId: string, viewBox: string, background?: string): { canvasId: string; viewBox: string } {
    const canvasId = `scratch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const bgRect = background ? `<rect width="100%" height="100%" fill="${background}"/>` : '';
    const svgString = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg"><defs></defs>${bgRect}</svg>`;
    const svgEngine = new SvgEngine(svgString);
    this.canvases.set(canvasId, { svgEngine, drawId, viewBox, createdAt: Date.now() });
    return { canvasId, viewBox };
  }

  get(canvasId: string): SvgEngine | null {
    const canvas = this.canvases.get(canvasId);
    return canvas ? canvas.svgEngine : null;
  }

  getWithMeta(canvasId: string): ScratchCanvas | null {
    return this.canvases.get(canvasId) || null;
  }

  list(drawId: string): ScratchCanvasInfo[] {
    const result: ScratchCanvasInfo[] = [];
    for (const [canvasId, canvas] of this.canvases) {
      if (canvas.drawId === drawId) {
        const info = canvas.svgEngine.getCanvasInfo();
        result.push({
          canvasId, drawId: canvas.drawId, viewBox: canvas.viewBox,
          layerCount: info.layerCount, createdAt: canvas.createdAt,
        });
      }
    }
    return result;
  }

  delete(canvasId: string): boolean {
    return this.canvases.delete(canvasId);
  }

  deleteByDrawId(drawId: string): number {
    let count = 0;
    for (const [canvasId, canvas] of this.canvases) {
      if (canvas.drawId === drawId) { this.canvases.delete(canvasId); count++; }
    }
    return count;
  }

  cleanup(maxAgeMs = 30 * 60 * 1000): number {
    const cutoff = Date.now() - maxAgeMs;
    let count = 0;
    for (const [canvasId, canvas] of this.canvases) {
      if (canvas.createdAt < cutoff) { this.canvases.delete(canvasId); count++; }
    }
    return count;
  }

  destroy(): void {
    if (this.cleanupInterval) { clearInterval(this.cleanupInterval); this.cleanupInterval = null; }
    this.canvases.clear();
  }
}
