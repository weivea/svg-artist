export interface TextOptions {
  text: string;
  x: number;
  y: number;
  font_family?: string;
  font_size?: number;
  font_weight?: number | string;
  font_style?: 'normal' | 'italic';
  letter_spacing?: number;
  word_spacing?: number;
  line_height?: number;
  text_anchor?: 'start' | 'middle' | 'end';
  dominant_baseline?: 'auto' | 'middle' | 'hanging';
  text_decoration?: 'none' | 'underline' | 'line-through';
  fill?: string;
  stroke?: string;
  path_id?: string;
  spans?: Array<{
    text: string;
    fill?: string;
    font_size?: number;
    font_weight?: number | string;
    dx?: number;
    dy?: number;
  }>;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildTextElement(opts: TextOptions): string {
  const attrs: string[] = [];
  attrs.push(`x="${opts.x}"`);
  attrs.push(`y="${opts.y}"`);
  if (opts.font_family) attrs.push(`font-family="${opts.font_family}"`);
  if (opts.font_size !== undefined) attrs.push(`font-size="${opts.font_size}"`);
  if (opts.font_weight !== undefined) attrs.push(`font-weight="${opts.font_weight}"`);
  if (opts.font_style && opts.font_style !== 'normal') attrs.push(`font-style="${opts.font_style}"`);
  if (opts.letter_spacing !== undefined) attrs.push(`letter-spacing="${opts.letter_spacing}"`);
  if (opts.word_spacing !== undefined) attrs.push(`word-spacing="${opts.word_spacing}"`);
  if (opts.text_anchor) attrs.push(`text-anchor="${opts.text_anchor}"`);
  if (opts.dominant_baseline) attrs.push(`dominant-baseline="${opts.dominant_baseline}"`);
  if (opts.text_decoration && opts.text_decoration !== 'none') attrs.push(`text-decoration="${opts.text_decoration}"`);
  if (opts.fill) attrs.push(`fill="${opts.fill}"`);
  if (opts.stroke) attrs.push(`stroke="${opts.stroke}"`);

  let content = '';

  if (opts.path_id) {
    content = `<textPath href="#${opts.path_id}">${escapeXml(opts.text)}</textPath>`;
  } else if (opts.spans && opts.spans.length > 0) {
    content = opts.spans.map((span) => {
      const tspanAttrs: string[] = [];
      if (span.fill) tspanAttrs.push(`fill="${span.fill}"`);
      if (span.font_size !== undefined) tspanAttrs.push(`font-size="${span.font_size}"`);
      if (span.font_weight !== undefined) tspanAttrs.push(`font-weight="${span.font_weight}"`);
      if (span.dx !== undefined) tspanAttrs.push(`dx="${span.dx}"`);
      if (span.dy !== undefined) tspanAttrs.push(`dy="${span.dy}"`);
      return `<tspan ${tspanAttrs.join(' ')}>${escapeXml(span.text)}</tspan>`;
    }).join('');
  } else if (opts.line_height && opts.text.includes('\n')) {
    const lines = opts.text.split('\n');
    content = lines.map((line, i) => {
      const dy = i === 0 ? '0' : String(opts.line_height);
      return `<tspan x="${opts.x}" dy="${dy}">${escapeXml(line)}</tspan>`;
    }).join('');
  } else {
    content = escapeXml(opts.text);
  }

  return `<text ${attrs.join(' ')}>${content}</text>`;
}
