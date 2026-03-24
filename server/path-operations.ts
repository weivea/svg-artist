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

  const attrs: string[] = [`d="${d}"`];
  if (style?.fill !== undefined) attrs.push(`fill="${style.fill}"`);
  else attrs.push('fill="none"');
  if (style?.stroke) attrs.push(`stroke="${style.stroke}"`);
  else attrs.push('stroke="#000000"');
  if (style?.stroke_width) attrs.push(`stroke-width="${style.stroke_width}"`);

  return `<path ${attrs.join(' ')}/>`;
}
