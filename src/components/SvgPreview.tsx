import { useCallback, useEffect, useRef, useState } from 'react';

interface SvgPreviewProps {
  svgContent: string;
  externalSelection: SelectionData | null;
  onSelectionChange: (selection: SelectionData | null) => void;
}

export interface SelectionData {
  region: { x: number; y: number; width: number; height: number };
  elements: string[];
}

export default function SvgPreview({ svgContent, externalSelection, onSelectionChange }: SvgPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);

  // Zoom & pan state
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);    // spacebar held
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const scaleRef = useRef(scale);
  const translateRef = useRef(translate);

  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { translateRef.current = translate; }, [translate]);

  // Clear internal selection when parent clears it
  useEffect(() => {
    if (externalSelection === null) {
      setSelection(null);
    }
  }, [externalSelection]);

  // Scroll wheel zoom centered on mouse position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const s = scaleRef.current;
      const t = translateRef.current;
      const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newScale = Math.min(10, Math.max(0.1, s * zoomFactor));

      const newTranslateX = mouseX - (mouseX - t.x) * (newScale / s);
      const newTranslateY = mouseY - (mouseY - t.y) * (newScale / s);

      setScale(newScale);
      setTranslate({ x: newTranslateX, y: newTranslateY });
    };

    container.addEventListener('wheel', handler, { passive: false });
    return () => container.removeEventListener('wheel', handler);
  }, []);

  // Spacebar + drag panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsPanning(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPanning(false);
        setPanStart(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
    if (e.button !== 0) return;
    if (isPanning) {
      setPanStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
      return;
    }
    const pos = screenToSvg(e.clientX, e.clientY);
    setDragStart(pos);
    setIsDragging(true);
    setSelection(null);
    onSelectionChange(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && panStart) {
      setTranslate({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }
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
    if (isPanning) {
      setPanStart(null);
      return;
    }
    setIsDragging(false);
    if (selection && selection.width > 5 && selection.height > 5) {
      const elements = detectElements(selection);
      const selectionData: SelectionData = { region: selection, elements };
      onSelectionChange(selectionData);
    }
  };

  // Double-click to reset view
  const handleDoubleClick = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  // Render SVG with selection overlay
  const svgWithOverlay = selection
    ? svgContent.replace(
        '</svg>',
        `<rect x="${selection.x}" y="${selection.y}" width="${selection.width}" height="${selection.height}" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="2" stroke-dasharray="6 3" pointer-events="none"/></svg>`
      )
    : svgContent;

  // Compute cursor
  const cursor = isPanning
    ? (panStart ? 'grabbing' : 'grab')
    : (isDragging ? 'crosshair' : 'default');

  return (
    <div
      ref={containerRef}
      className="svg-preview-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      style={{ flex: 1, cursor, overflow: 'hidden', position: 'relative' }}
    >
      <div
        className="svg-transform-wrapper"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%',
        }}
        dangerouslySetInnerHTML={{ __html: svgWithOverlay }}
      />
    </div>
  );
}
