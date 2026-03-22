import Terminal from './components/Terminal';

export default function App() {
  const wsBase = `ws://${window.location.host}`;

  return (
    <div className="app">
      <div className="svg-pane">
        <p style={{ padding: '1rem' }}>SVG Preview (TODO)</p>
      </div>
      <div className="terminal-pane">
        <Terminal wsUrl={`${wsBase}/ws/terminal`} />
      </div>
    </div>
  );
}
