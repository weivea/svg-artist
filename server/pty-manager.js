import pty from 'node-pty';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

export class PtyManager {
  constructor() {
    this.ptyProcess = null;
    this.terminalWs = null;
    this.selectionContext = null; // current region selection
    this.inputBuffer = '';
  }

  /**
   * Spawn claude CLI in a real PTY
   */
  spawn() {
    const mcpConfigPath = join(projectRoot, 'mcp-config.json');
    const systemPrompt = [
      'You are an SVG artist. The user will describe what they want you to draw.',
      'Use the draw_svg tool to render your artwork. Always provide complete SVG content.',
      'Give each SVG element a meaningful id attribute for easy identification.',
      'Use viewBox="0 0 800 600" unless the user specifies otherwise.',
      'When the user selects a region and asks for changes, only modify the specified elements.',
    ].join(' ');

    this.ptyProcess = pty.spawn('claude', [
      '--mcp-config', mcpConfigPath,
      '--system-prompt', systemPrompt,
      '--allowedTools', 'mcp__svg-artist__draw_svg',
    ], {
      name: 'xterm-256color',
      cols: 120,
      rows: 40,
      cwd: projectRoot,
      env: {
        ...process.env,
        SVG_CALLBACK_URL: `http://localhost:${process.env.PORT || 3000}/api/svg`,
      },
    });

    console.log('[PTY] Claude process spawned, pid:', this.ptyProcess.pid);

    this.ptyProcess.onExit(({ exitCode }) => {
      console.log('[PTY] Claude process exited with code:', exitCode);
      this.ptyProcess = null;
    });

    return this.ptyProcess;
  }

  /**
   * Attach a WebSocket client to the PTY
   */
  attachWebSocket(ws) {
    if (!this.ptyProcess) {
      this.spawn();
    }

    this.terminalWs = ws;

    // PTY stdout -> WebSocket -> xterm.js
    const dataHandler = this.ptyProcess.onData((data) => {
      if (ws.readyState === 1) {
        ws.send(data);
      }
    });

    // xterm.js -> WebSocket -> PTY stdin (with interception)
    ws.on('message', (message) => {
      const input = message.toString();

      // Check for JSON control messages (e.g. resize)
      try {
        const parsed = JSON.parse(input);
        if (parsed.type === 'resize') {
          this.resize(parsed.cols, parsed.rows);
          return;
        }
      } catch (e) {
        // not JSON, treat as terminal input
      }

      this.handleInput(input);
    });

    ws.on('close', () => {
      dataHandler.dispose();
      this.terminalWs = null;
      console.log('[PTY] WebSocket disconnected');
    });
  }

  /**
   * Handle input from xterm.js, intercept Enter to inject selection context
   */
  handleInput(input) {
    if (!this.ptyProcess) return;

    // Check if input contains Enter/Return (carriage return)
    if (input === '\r' && this.selectionContext && this.inputBuffer.trim().length > 0) {
      // Inject selection context before user's message
      const contextPrefix = this.formatSelectionContext();
      // Clear the current line, write context + user input, then send Enter
      // We use a trick: erase the line, write prefixed content, then Enter
      const fullInput = contextPrefix + this.inputBuffer;

      // Clear current line: move to start, clear line
      this.ptyProcess.write('\x1b[2K\r');
      // Write the full input with context
      this.ptyProcess.write(fullInput + '\r');

      this.inputBuffer = '';
      this.selectionContext = null; // clear selection after use
      return;
    }

    if (input === '\r') {
      this.inputBuffer = '';
      this.ptyProcess.write(input);
      return;
    }

    // Handle backspace
    if (input === '\x7f') {
      this.inputBuffer = this.inputBuffer.slice(0, -1);
      this.ptyProcess.write(input);
      return;
    }

    // Accumulate printable input
    if (input.length === 1 && input >= ' ') {
      this.inputBuffer += input;
    }

    this.ptyProcess.write(input);
  }

  /**
   * Set the current selection context (called from SVG WebSocket)
   */
  setSelection(selection) {
    this.selectionContext = selection;
    console.log('[PTY] Selection set:', selection?.region);
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.selectionContext = null;
  }

  /**
   * Format selection context as a prefix string for Claude
   */
  formatSelectionContext() {
    const { region, elements } = this.selectionContext;
    const lines = [
      `[Selected region x:${region.x} y:${region.y} w:${region.width} h:${region.height}`,
    ];
    if (elements && elements.length > 0) {
      lines.push(' Elements in region:');
      for (const el of elements) {
        lines.push(` - ${el}`);
      }
    }
    lines.push(' Please only modify these elements]');
    return lines.join('\n') + '\n';
  }

  /**
   * Resize the PTY
   */
  resize(cols, rows) {
    if (this.ptyProcess) {
      this.ptyProcess.resize(cols, rows);
    }
  }

  /**
   * Kill the PTY process
   */
  kill() {
    if (this.ptyProcess) {
      this.ptyProcess.kill();
      this.ptyProcess = null;
    }
  }
}
