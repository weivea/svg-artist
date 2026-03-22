import { useState, useEffect, useCallback } from 'react';
import Terminal from './components/Terminal';
import SvgPreview, { SelectionData } from './components/SvgPreview';

export default function App() {
  const wsBase = `ws://${window.location.host}`;
  const [svgContent, setSvgContent] = useState('<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><text x="400" y="300" text-anchor="middle" fill="#666" font-size="24">Waiting for artwork...</text></svg>');
  const [selection, setSelection] = useState<SelectionData | null>(null);
  const [svgWs, setSvgWs] = useState<WebSocket | null>(null);

  // SVG WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`${wsBase}/ws/svg`);

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
  }, [wsBase]);

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
    <div className="app">
      <div className="svg-pane">
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
      <div className="terminal-pane">
        <Terminal wsUrl={`${wsBase}/ws/terminal`} />
      </div>
    </div>
  );
}
