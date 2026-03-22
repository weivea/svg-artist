import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Terminal from '../components/Terminal';
import SvgPreview, { SelectionData } from '../components/SvgPreview';
import { useResizablePanels } from '../hooks/useResizablePanels';
import './DrawPage.css';

const DEFAULT_SVG = '<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><text x="400" y="300" text-anchor="middle" fill="#666" font-size="24">Waiting for artwork...</text></svg>';

export default function DrawPage() {
  const { drawId } = useParams<{ drawId: string }>();
  const navigate = useNavigate();
  const wsBase = `ws://${window.location.host}`;

  const [svgContent, setSvgContent] = useState(DEFAULT_SVG);
  const [title, setTitle] = useState('');
  const [selection, setSelection] = useState<SelectionData | null>(null);
  const [svgWs, setSvgWs] = useState<WebSocket | null>(null);
  const { ratio, isDragging, dividerProps, containerRef } = useResizablePanels();

  // Load drawing metadata and initial SVG
  useEffect(() => {
    if (!drawId) return;
    fetch(`/api/drawings`)
      .then(res => res.json())
      .then(data => {
        const drawing = data.drawings.find((d: any) => d.id === drawId);
        if (drawing) {
          setTitle(drawing.title);
          if (drawing.svgContent) {
            setSvgContent(drawing.svgContent);
          }
        }
      })
      .catch(console.error);
  }, [drawId]);

  // SVG WebSocket connection (per drawId)
  useEffect(() => {
    if (!drawId) return;
    const ws = new WebSocket(`${wsBase}/ws/svg/${drawId}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'svg_update') {
          setSvgContent(data.svg);
        }
      } catch {
        // ignore
      }
    };

    setSvgWs(ws);
    return () => ws.close();
  }, [wsBase, drawId]);

  // Send selection to backend
  const handleSelectionChange = useCallback((sel: SelectionData | null) => {
    setSelection(sel);
    if (svgWs?.readyState === WebSocket.OPEN) {
      if (sel) {
        svgWs.send(JSON.stringify({ type: 'selection', selection: sel }));
      } else {
        svgWs.send(JSON.stringify({ type: 'clear_selection' }));
      }
    }
  }, [svgWs]);

  return (
    <div className="draw-page">
      <div className="top-bar">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <span className="drawing-title">{title}</span>
      </div>
      <div className="draw-content" ref={containerRef}>
        <div className="svg-pane" style={{ flexBasis: `${ratio * 100}%` }}>
          <SvgPreview
            svgContent={svgContent}
            externalSelection={selection}
            onSelectionChange={handleSelectionChange}
          />
          {selection && (
            <div className="selection-info">
              <span>
                Selected: ({Math.round(selection.region.x)}, {Math.round(selection.region.y)}) {Math.round(selection.region.width)}x{Math.round(selection.region.height)}
              </span>
              {selection.elements.length > 0 && (
                <span> | {selection.elements.length} element(s)</span>
              )}
              <button onClick={() => handleSelectionChange(null)}>Clear</button>
            </div>
          )}
        </div>
        <div {...dividerProps} />
        <div
          className="terminal-pane"
          style={{
            flexBasis: `${(1 - ratio) * 100}%`,
            pointerEvents: isDragging ? 'none' : 'auto',
          }}
        >
          <Terminal wsUrl={`${wsBase}/ws/terminal/${drawId}`} />
        </div>
      </div>
    </div>
  );
}
