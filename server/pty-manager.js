import pty from 'node-pty';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Resolve the full path to the claude CLI binary.
 * node-pty's posix_spawnp may not find binaries that are only on the
 * user's interactive-shell PATH, so we resolve it once at startup.
 */
function resolveClaudePath() {
  try {
    return execSync('which claude', { encoding: 'utf8' }).trim();
  } catch {
    return 'claude'; // fallback — let node-pty try PATH
  }
}

const claudeBin = resolveClaudePath();

export class PtyManager {
  constructor() {
    this.ptyProcess = null;
    this.terminalWs = null;
    this.selectionContext = null; // current region selection
    this.inputBuffer = '';
    // SVG output filter state
    this._svgFilterState = 'passthrough'; // 'passthrough' | 'suppressing'
    this._svgFilterBuffer = '';           // buffer for detecting split tags
  }

  /**
   * Spawn claude CLI in a real PTY.
   * @param {object} opts
   * @param {string} opts.sessionId - Claude CLI session UUID
   * @param {boolean} opts.isResume - true to use --resume instead of --session-id
   * @param {string} opts.callbackUrl - SVG callback URL including drawId
   */
  spawn(opts = {}) {
    const mcpConfigPath = join(projectRoot, 'mcp-config.json');
    const systemPrompt = [
      'You are an SVG artist. The user will describe what they want you to draw.',
      'Use the draw_svg tool to render your artwork. Always provide complete SVG content.',
      'Give each SVG element a meaningful id attribute for easy identification.',
      'Use viewBox="0 0 800 600" unless the user specifies otherwise.',
      'When the user selects a region and asks for changes, only modify the specified elements.',
    ].join(' ');

    const callbackUrl = opts.callbackUrl
      || `http://localhost:${process.env.PORT || 3000}/api/svg`;

    const args = [];
    if (opts.sessionId) {
      if (opts.isResume) {
        args.push('--resume', opts.sessionId);
      } else {
        args.push('--session-id', opts.sessionId);
        args.push('--system-prompt', systemPrompt);
      }
    } else {
      args.push('--system-prompt', systemPrompt);
    }
    args.push('--mcp-config', mcpConfigPath);
    args.push('--allowedTools', 'mcp__svg-artist__draw_svg');

    this.ptyProcess = pty.spawn(claudeBin, args, {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: projectRoot,
      env: {
        ...process.env,
        SVG_CALLBACK_URL: callbackUrl,
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
  attachWebSocket(ws, spawnOpts = {}) {
    if (!this.ptyProcess) {
      this.spawn(spawnOpts);
    }

    this.terminalWs = ws;

    // PTY stdout -> filter SVG content -> WebSocket -> xterm.js
    const dataHandler = this.ptyProcess.onData((data) => {
      if (ws.readyState === 1) {
        const filtered = this._filterSvgContent(data);
        if (filtered) {
          ws.send(filtered);
        }
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
   * Filter SVG content from PTY output to prevent raw XML from cluttering terminal.
   * Uses a state machine to detect <svg...> ... </svg> blocks and suppress them.
   * PTY data arrives in arbitrary chunks, so we buffer a small tail to handle
   * tags split across chunks.
   *
   * @param {string} data - raw PTY output chunk
   * @returns {string|null} - filtered output to send to xterm, or null if entirely suppressed
   */
  _filterSvgContent(data) {
    // Strip ANSI escape sequences for tag matching, but work on original data
    // We search on the raw data since PTY may embed escape codes inside content
    let result = '';
    let i = 0;

    // Prepend any leftover buffer from previous chunk
    const combined = this._svgFilterBuffer + data;
    this._svgFilterBuffer = '';

    while (i < combined.length) {
      if (this._svgFilterState === 'passthrough') {
        // Look for <svg (case-insensitive) — could also appear as part of ANSI-wrapped text
        const svgStart = this._findSvgOpen(combined, i);
        if (svgStart === -1) {
          // No <svg found. Pass through everything except the last few chars
          // (which might be a partial "<sv" at the boundary)
          const safeEnd = Math.max(i, combined.length - 5);
          result += combined.slice(i, safeEnd);
          this._svgFilterBuffer = combined.slice(safeEnd);
          i = combined.length;
        } else {
          // Pass through everything before <svg
          result += combined.slice(i, svgStart);
          this._svgFilterState = 'suppressing';
          i = svgStart;
        }
      } else {
        // suppressing — look for </svg>
        const svgEnd = this._findSvgClose(combined, i);
        if (svgEnd === -1) {
          // Haven't found </svg> yet — suppress everything, buffer tail
          this._svgFilterBuffer = combined.slice(Math.max(i, combined.length - 7));
          i = combined.length;
        } else {
          // Found </svg> — skip past it
          i = svgEnd;
          this._svgFilterState = 'passthrough';
        }
      }
    }

    return result || null;
  }

  /**
   * Find the start index of an <svg tag in data, starting from `from`.
   * Skips ANSI escape sequences embedded in the text.
   * Returns -1 if not found.
   */
  _findSvgOpen(data, from) {
    // Match <svg with optional ANSI codes interspersed
    // Simple approach: strip ANSI from a search copy
    const searchStr = data.slice(from).replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
    const idx = searchStr.indexOf('<svg');
    if (idx === -1) return -1;

    // Map back to original index by walking original data
    let origIdx = from;
    let cleanCount = 0;
    while (origIdx < data.length && cleanCount < idx) {
      if (data[origIdx] === '\x1b') {
        // Skip ANSI sequence
        const match = data.slice(origIdx).match(/^\x1b\[[0-9;]*[a-zA-Z]/);
        if (match) {
          origIdx += match[0].length;
          continue;
        }
      }
      origIdx++;
      cleanCount++;
    }
    return origIdx;
  }

  /**
   * Find the end position (just after </svg>) in data, starting from `from`.
   * Returns -1 if not found.
   */
  _findSvgClose(data, from) {
    const searchStr = data.slice(from).replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
    const closeTag = '</svg>';
    const idx = searchStr.indexOf(closeTag);
    if (idx === -1) return -1;

    // Map back to original index (past the closing tag)
    let origIdx = from;
    let cleanCount = 0;
    const targetCount = idx + closeTag.length;
    while (origIdx < data.length && cleanCount < targetCount) {
      if (data[origIdx] === '\x1b') {
        const match = data.slice(origIdx).match(/^\x1b\[[0-9;]*[a-zA-Z]/);
        if (match) {
          origIdx += match[0].length;
          continue;
        }
      }
      origIdx++;
      cleanCount++;
    }
    return origIdx;
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
