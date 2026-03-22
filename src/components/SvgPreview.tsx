import { useRef, useState } from 'react';

interface SvgPreviewProps {
  svgContent: string;
  onSelectionChange: (selection: SelectionData | null) => void;
}

export interface SelectionData {
  region: { x: number; y: number; width: number; height: number };
  elements: string[];
}

export default function SvgPreview({ svgContent, onSelectionChange }: SvgPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);

  // Convert screen coordinates to SVG viewBox coordinates
  function screenToSvg(clientX: number, clientY: number) {
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) return { x: clientX, y: clientY };

    const rect = svgEl.getBoundingClientRect();
    const viewBox = svgEl.viewBox.baseVal;

    return {
      x: ((clientX - rect.left) / rect.width) * viewBox.width + viewBox.x,
      y: ((clientY - rect.top) / rect.height) * viewBox.height + viewBox.y,
    };
  }

  // Detect SVG elements within a selection rectangle
  function detectElements(selRect: { x: number; y: number; width: number; height: number }) {
    const svgEl = containerRef.current?.querySelector('svg');
    if (!svgEl) return [];

    const elements: string[] = [];
    const allElements = svgEl.querySelectorAll('*');

    for (const el of allElements) {
      if (el.tagName === 'svg' || el.tagName === 'defs') continue;
      try {
        const bbox = (el as SVGGraphicsElement).getBBox?.();
        if (!bbox) continue;

        // Check intersection
        const intersects =
          bbox.x < selRect.x + selRect.width &&
          bbox.x + bbox.width > selRect.x &&
          bbox.y < selRect.y + selRect.height &&
          bbox.y + bbox.height > selRect.y;

        if (intersects) {
          const id = el.getAttribute('id');
          const tag = el.tagName;
          const attrs = Array.from(el.attributes)
            .filter(a => ['id', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'd', 'fill'].includes(a.name))
            .map(a => `${a.name}="${a.value}"`)
            .join(' ');
          elements.push(`<${tag} ${attrs}/>`);
        }
      } catch {
        // skip elements that don't support getBBox
      }
    }

    return elements;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    const pos = screenToSvg(e.clientX, e.clientY);
    setDragStart(pos);
    setIsDragging(true);
    setSelection(null);
    onSelectionChange(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    const pos = screenToSvg(e.clientX, e.clientY);
    setSelection({
      x: Math.min(dragStart.x, pos.x),
      y: Math.min(dragStart.y, pos.y),
      width: Math.abs(pos.x - dragStart.x),
      height: Math.abs(pos.y - dragStart.y),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (selection && selection.width > 5 && selection.height > 5) {
      const elements = detectElements(selection);
      const selectionData: SelectionData = {
        region: selection,
        elements,
      };
      onSelectionChange(selectionData);
    }
  };

  // Render SVG with selection overlay
  const svgWithOverlay = selection
    ? svgContent.replace(
        '</svg>',
        `<rect x="${selection.x}" y="${selection.y}" width="${selection.width}" height="${selection.height}" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="2" stroke-dasharray="6 3" pointer-events="none"/></svg>`
      )
    : svgContent;

  return (
    <div
      ref={containerRef}
      className="svg-preview-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ flex: 1, cursor: isDragging ? 'crosshair' : 'default', overflow: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: svgWithOverlay }}
    />
  );
}
