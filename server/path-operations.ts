export interface PathSpec {
  type: 'line' | 'polyline' | 'polygon' | 'arc' | 'bezier' | 'star' | 'rounded-rect';
  points?: [number, number][];
  start?: [number, number];
  end?: [number, number];
  control1?: [number, number];
  control2?: [number, number];
  radius?: number;
  inner_radius?: number;
  corners?: number;
  corner_radius?: number;
}

export function buildPathD(spec: PathSpec): string {
  switch (spec.type) {
    case 'line': {
      const [sx, sy] = spec.start || [0, 0];
      const [ex, ey] = spec.end || [100, 100];
      return `M ${sx} ${sy} L ${ex} ${ey}`;
    }
    case 'polyline': {
      if (!spec.points || spec.points.length < 2) return '';
      return `M ${spec.points.map(([x, y]) => `${x} ${y}`).join(' L ')}`;
    }
    case 'polygon': {
      if (!spec.points || spec.points.length < 3) return '';
      return `M ${spec.points.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;
    }
    case 'bezier': {
      const [sx, sy] = spec.start || [0, 0];
      const [ex, ey] = spec.end || [100, 100];
      if (spec.control2) {
        const [c1x, c1y] = spec.control1 || [33, 0];
        const [c2x, c2y] = spec.control2;
        return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`;
      } else if (spec.control1) {
        const [cx, cy] = spec.control1;
        return `M ${sx} ${sy} Q ${cx} ${cy}, ${ex} ${ey}`;
      }
      return `M ${sx} ${sy} L ${ex} ${ey}`;
    }
    case 'arc': {
      const [sx, sy] = spec.start || [0, 0];
      const [ex, ey] = spec.end || [100, 0];
      const r = spec.radius || 50;
      return `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`;
    }
    case 'star': {
      const corners = spec.corners || 5;
      const r = spec.radius || 50;
      const ir = spec.inner_radius || r * 0.4;
      const cx = spec.start?.[0] || 0;
      const cy = spec.start?.[1] || 0;
      const points: string[] = [];
      for (let i = 0; i < corners * 2; i++) {
        const angle = (Math.PI * i) / corners - Math.PI / 2;
        const radius = i % 2 === 0 ? r : ir;
        const px = Math.round((cx + radius * Math.cos(angle)) * 10000) / 10000;
        const py = Math.round((cy + radius * Math.sin(angle)) * 10000) / 10000;
        points.push(`${px} ${py}`);
      }
      return `M ${points.join(' L ')} Z`;
    }
    case 'rounded-rect': {
      const [x, y] = spec.start || [0, 0];
      const w = spec.end ? spec.end[0] - x : 100;
      const h = spec.end ? spec.end[1] - y : 100;
      const cr = Math.min(spec.corner_radius || 10, w / 2, h / 2);
      return `M ${x + cr} ${y} L ${x + w - cr} ${y} Q ${x + w} ${y} ${x + w} ${y + cr} L ${x + w} ${y + h - cr} Q ${x + w} ${y + h} ${x + w - cr} ${y + h} L ${x + cr} ${y + h} Q ${x} ${y + h} ${x} ${y + h - cr} L ${x} ${y + cr} Q ${x} ${y} ${x + cr} ${y} Z`;
    }
    default:
      return '';
  }
}

export function buildPathSvg(spec: PathSpec, style?: {
  fill?: string;
  stroke?: string;
  stroke_width?: number;
}): string {
  const d = buildPathD(spec);
  if (!d) return '';

  const pathId = `path-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const attrs: string[] = [`id="${pathId}"`, `d="${d}"`];
  if (style?.fill !== undefined) attrs.push(`fill="${style.fill}"`);
  else attrs.push('fill="none"');
  if (style?.stroke) attrs.push(`stroke="${style.stroke}"`);
  else attrs.push('stroke="#000000"');
  if (style?.stroke_width) attrs.push(`stroke-width="${style.stroke_width}"`);

  return `<path ${attrs.join(' ')}/>`;
}

// ---------------------------------------------------------------------------
// Path Editing
// ---------------------------------------------------------------------------

export interface PathPoint {
  command: string;
  x: number;
  y: number;
  control1?: [number, number];
  control2?: [number, number];
}

export function parsePath(d: string): PathPoint[] {
  const points: PathPoint[] = [];
  const commands = d.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
  let cx = 0, cy = 0;
  for (const cmd of commands) {
    const type = cmd[0];
    const nums = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
    switch (type.toUpperCase()) {
      case 'M': cx = nums[0]; cy = nums[1]; points.push({ command: 'M', x: cx, y: cy }); break;
      case 'L': cx = nums[0]; cy = nums[1]; points.push({ command: 'L', x: cx, y: cy }); break;
      case 'H': cx = nums[0]; points.push({ command: 'L', x: cx, y: cy }); break;
      case 'V': cy = nums[0]; points.push({ command: 'L', x: cx, y: cy }); break;
      case 'C':
        cx = nums[4]; cy = nums[5];
        points.push({ command: 'C', x: cx, y: cy, control1: [nums[0], nums[1]], control2: [nums[2], nums[3]] });
        break;
      case 'Q':
        cx = nums[2]; cy = nums[3];
        points.push({ command: 'Q', x: cx, y: cy, control1: [nums[0], nums[1]] });
        break;
      case 'Z': points.push({ command: 'Z', x: cx, y: cy }); break;
      default: break;
    }
  }
  return points;
}

export function serializePath(points: PathPoint[]): string {
  return points.map((p) => {
    switch (p.command) {
      case 'M': return `M ${p.x} ${p.y}`;
      case 'L': return `L ${p.x} ${p.y}`;
      case 'C': return `C ${p.control1![0]} ${p.control1![1]}, ${p.control2![0]} ${p.control2![1]}, ${p.x} ${p.y}`;
      case 'Q': return `Q ${p.control1![0]} ${p.control1![1]}, ${p.x} ${p.y}`;
      case 'Z': return 'Z';
      default: return '';
    }
  }).join(' ');
}

export type PathEditOp =
  | { type: 'move_point'; index: number; x: number; y: number }
  | { type: 'add_point'; after_index: number; x: number; y: number }
  | { type: 'delete_point'; index: number }
  | { type: 'set_control'; index: number; control1?: [number, number]; control2?: [number, number] }
  | { type: 'close' }
  | { type: 'open' }
  | { type: 'smooth'; tension?: number }
  | { type: 'simplify'; tolerance?: number };

export function applyPathEdits(d: string, operations: PathEditOp[]): string {
  const points = parsePath(d);
  for (const op of operations) {
    switch (op.type) {
      case 'move_point':
        if (op.index >= 0 && op.index < points.length) {
          points[op.index].x = op.x;
          points[op.index].y = op.y;
        }
        break;
      case 'add_point':
        if (op.after_index >= 0 && op.after_index < points.length) {
          points.splice(op.after_index + 1, 0, { command: 'L', x: op.x, y: op.y });
        }
        break;
      case 'delete_point':
        if (op.index >= 0 && op.index < points.length && points.length > 2) {
          points.splice(op.index, 1);
        }
        break;
      case 'set_control':
        if (op.index >= 0 && op.index < points.length) {
          if (op.control1) {
            points[op.index].control1 = op.control1;
            if (!points[op.index].control2) {
              points[op.index].command = 'Q';
            }
          }
          if (op.control2) {
            points[op.index].control2 = op.control2;
            points[op.index].command = 'C';
          }
        }
        break;
      case 'close':
        if (points.length > 0 && points[points.length - 1].command !== 'Z') {
          points.push({ command: 'Z', x: points[0].x, y: points[0].y });
        }
        break;
      case 'open':
        if (points.length > 0 && points[points.length - 1].command === 'Z') {
          points.pop();
        }
        break;
      case 'smooth': {
        const tension = op.tension ?? 0.5;
        for (let i = 1; i < points.length; i++) {
          if (points[i].command === 'L') {
            const prev = points[i - 1];
            const curr = points[i];
            const next = i < points.length - 1 ? points[i + 1] : curr;
            const prevPrev = i > 1 ? points[i - 2] : prev;

            const cp1x = prev.x + (curr.x - prevPrev.x) * tension;
            const cp1y = prev.y + (curr.y - prevPrev.y) * tension;
            const cp2x = curr.x - (next.x - prev.x) * tension;
            const cp2y = curr.y - (next.y - prev.y) * tension;

            points[i].command = 'C';
            points[i].control1 = [cp1x, cp1y];
            points[i].control2 = [cp2x, cp2y];
          }
        }
        break;
      }
      case 'simplify': {
        const tolerance = op.tolerance ?? 1.0;
        const keepIndices = rdpSimplify(points, tolerance);
        const hasZ = points.length > 0 && points[points.length - 1].command === 'Z';
        // Filter points keeping only those at the kept indices (excluding Z)
        const nonZ = hasZ ? points.slice(0, -1) : points;
        const kept = keepIndices.map((idx) => nonZ[idx]).filter(Boolean);
        // Rebuild points array
        points.length = 0;
        points.push(...kept);
        if (hasZ && points.length > 0) {
          points.push({ command: 'Z', x: points[0].x, y: points[0].y });
        }
        break;
      }
    }
  }
  return serializePath(points);
}

// ---------------------------------------------------------------------------
// Ramer-Douglas-Peucker simplification helpers
// ---------------------------------------------------------------------------

function perpendicularDistance(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
}

function rdpSimplify(points: { x: number; y: number }[], tolerance: number): number[] {
  if (points.length <= 2) return points.map((_, i) => i);

  let maxDist = 0;
  let maxIdx = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }

  if (maxDist > tolerance) {
    const left = rdpSimplify(points.slice(0, maxIdx + 1), tolerance);
    const right = rdpSimplify(points.slice(maxIdx), tolerance);
    return [...left, ...right.slice(1).map((i) => i + maxIdx)];
  }
  return [0, points.length - 1];
}

// ---------------------------------------------------------------------------
// Boolean Path Operations (via path-bool)
// ---------------------------------------------------------------------------

import {
  pathFromPathData,
  pathToPathData,
  pathBoolean,
  PathBooleanOperation,
  FillRule,
} from 'path-bool';

export type BooleanOp = 'union' | 'subtract' | 'intersect' | 'exclude';

const BOOLEAN_OP_MAP: Record<BooleanOp, PathBooleanOperation> = {
  union: PathBooleanOperation.Union,
  subtract: PathBooleanOperation.Difference,
  intersect: PathBooleanOperation.Intersection,
  exclude: PathBooleanOperation.Exclusion,
};

export function booleanPathOp(
  dA: string,
  dB: string,
  operation: BooleanOp,
): { ok: boolean; resultD?: string; error?: string } {
  try {
    const pathA = pathFromPathData(dA);
    const pathB = pathFromPathData(dB);
    const op = BOOLEAN_OP_MAP[operation];
    if (op === undefined) {
      return { ok: false, error: `Unknown operation: ${operation}` };
    }
    const results = pathBoolean(pathA, FillRule.NonZero, pathB, FillRule.NonZero, op);
    if (results.length === 0) {
      return { ok: true, resultD: '' };
    }
    // Combine multiple result paths into a single d string
    const resultD = results.map(pathToPathData).join(' ');
    return { ok: true, resultD };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Boolean operation failed: ${msg}` };
  }
}
