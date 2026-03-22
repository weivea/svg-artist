import pty, { IPty } from 'node-pty';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

export interface SelectionRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SelectionData {
  region: SelectionRegion;
  elements: string[];
}

export interface SpawnOptions {
  sessionId?: string;
  isResume?: boolean;
  callbackUrl?: string;
}

/**
 * Resolve the full path to the claude CLI binary.
 * node-pty's posix_spawnp may not find binaries that are only on the
 * user's interactive-shell PATH, so we resolve it once at startup.
 */
function resolveClaudePath(): string {
  try {
    return execSync('which claude', { encoding: 'utf8' }).trim();
  } catch {
    return 'claude'; // fallback — let node-pty try PATH
  }
}

const claudeBin = resolveClaudePath();

type SvgFilterState = 'passthrough' | 'suppressing';

export class PtyManager {
  ptyProcess: IPty | null = null;
  terminalWs: WebSocket | null = null;
  selectionContext: SelectionData | null = null;
  inputBuffer: string = '';
  private _svgFilterState: SvgFilterState = 'passthrough';
  private _svgFilterBuffer: string = '';

  /**
   * Spawn claude CLI in a real PTY.
   */
  spawn(opts: SpawnOptions = {}): IPty {
    const mcpConfigPath = join(projectRoot, 'mcp-config.json');
    const pluginDir = join(projectRoot, 'plugins', 'svg-drawing');

    const systemPrompt = [
      'You are a professional SVG artist and designer. Users describe artwork and you create it through layer operations.',
      '',
      'Workflow:',
      '1. ASSESS: Analyze user request complexity.',
      '   - Simple (specific object, clear style) → skip to step 3',
      '   - Complex (scene, abstract concept, no style specified, multiple subjects) → step 2',
      '2. DESIGN: Use design-advisor agent to explore visual approaches.',
      '   - Present 2-3 approaches to user with style, palette, composition',
      '   - Wait for user selection before proceeding',
      '   - User can also trigger this manually with /design',
      '3. PREPARE: Load relevant drawing skills based on what you need.',
      '   - Always load: layer-workflow',
      '   - Load based on task: svg-fundamentals (basics), bezier-and-curves (organic shapes),',
      '     color-and-gradients (color work), composition (scene planning),',
      '     svg-filters-and-effects (filters/textures), materials-and-textures (realistic materials),',
      '     illustration-styles (specific style), character-illustration (characters/figures),',
      '     advanced-color-composition (advanced color/layout)',
      '4. PLAN: Define layer structure, color palette, key techniques.',
      '   - Use get_color_palette for palette suggestions when appropriate',
      '5. EXECUTE: Build layers background → foreground.',
      '   - Use apply_filter for complex filter effects',
      '   - Use apply_style_preset for unified style application',
      '6. REVIEW: Use critique_composition for automated analysis,',
      '   then preview_as_png for visual review.',
      '   - Apply 7-dimension professional critique:',
      '     Purpose → Hierarchy → Unity → Variety → Proportion → Rhythm → Emphasis',
      '7. REFINE: Fix issues found in review. Repeat steps 6-7 until',
      '   the critique score is satisfactory and the preview looks right.',
      '',
      'Always give layers and elements meaningful id and data-name attributes.',
    ].join('\n');

    const layerGuide = [
      'Layer tool usage:',
      '- Each independent visual element goes in its own layer',
      '- Name layers with layer-<description> format (e.g., layer-sky, layer-tree-1)',
      '- Prefer update_layer over rebuilding layers',
      '- Use duplicate_layer + transform_layer for repeated elements',
      '- Put gradients/filters in manage_defs, reference by id in layers',
      '- Self-review with preview_as_png after major changes',
      '',
      'Skill loading strategy:',
      '- Load only the skills relevant to the current task (not all 10)',
      '- For any drawing task, always load layer-workflow first',
      '- Load svg-filters-and-effects when textures, shadows, or lighting are needed',
      '- Load illustration-styles when a specific visual style is requested',
      '- Load character-illustration for any human/animal characters',
      '- Load materials-and-textures for realistic object rendering',
      '- Load advanced-color-composition for complex scenes or specific mood requests',
      '',
      'New tools available:',
      '- apply_filter: Apply preset filter effects (drop-shadow, glow, metallic, etc.)',
      '- apply_style_preset: Apply unified style across layers (flat, isometric, etc.)',
      '- get_color_palette: Generate harmonious color palettes by theme/mood',
      '- critique_composition: Get automated composition analysis with scores and suggestions',
    ].join('\n');

    const callbackUrl = opts.callbackUrl
      || `http://localhost:${process.env.PORT || 3000}/api/svg`;

    const args: string[] = [];
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
    args.push('--append-system-prompt', layerGuide);
    args.push('--plugin-dir', pluginDir);
    args.push('--mcp-config', mcpConfigPath);
    args.push('--allowedTools', 'mcp__svg-artist__*,WebSearch,WebFetch');

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
  attachWebSocket(ws: WebSocket, spawnOpts: SpawnOptions = {}): void {
    if (!this.ptyProcess) {
      this.spawn(spawnOpts);
    }

    this.terminalWs = ws;

    // PTY stdout -> filter SVG content -> WebSocket -> xterm.js
    const dataHandler = this.ptyProcess!.onData((data: string) => {
      if (ws.readyState === 1) {
        const filtered = this._filterSvgContent(data);
        if (filtered) {
          ws.send(filtered);
        }
      }
    });

    // xterm.js -> WebSocket -> PTY stdin (with interception)
    ws.on('message', (message: Buffer | ArrayBuffer | Buffer[]) => {
      const input = message.toString();

      // Fast path: single characters and short terminal input never start with '{'
      // Only attempt JSON parse for messages that look like JSON objects
      if (input.length > 2 && input.charCodeAt(0) === 123 /* '{' */) {
        try {
          const parsed = JSON.parse(input) as { type: string; cols?: number; rows?: number };
          if (parsed.type === 'resize') {
            this.resize(parsed.cols!, parsed.rows!);
            return;
          }
        } catch {
          // not valid JSON, treat as terminal input
        }
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
  handleInput(input: string): void {
    if (!this.ptyProcess) return;

    // Check if input contains Enter/Return (carriage return)
    if (input === '\r' && this.selectionContext && this.inputBuffer.trim().length > 0) {
      // Inject selection context before user's message
      const contextPrefix = this.formatSelectionContext();
      const fullInput = contextPrefix + this.inputBuffer;

      // Clear current line: move to start, clear line
      this.ptyProcess.write('\x1b[2K\r');
      // Write the full input with context
      this.ptyProcess.write(fullInput + '\r');

      this.inputBuffer = '';
      this.selectionContext = null;
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
  setSelection(selection: SelectionData): void {
    this.selectionContext = selection;
    console.log('[PTY] Selection set:', selection?.region);
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selectionContext = null;
  }

  /**
   * Format selection context as a prefix string for Claude
   */
  formatSelectionContext(): string {
    const { region, elements } = this.selectionContext!;
    const lines: string[] = [
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
   * Fast check: does the string possibly contain an SVG tag?
   * Avoids expensive regex when data is just normal terminal output.
   */
  private _mightContainSvg(data: string): boolean {
    return data.indexOf('<') !== -1;
  }

  _filterSvgContent(data: string): string | null {
    // Fast path: in passthrough mode with no buffered data, and the chunk
    // doesn't contain '<' at all → impossible to have <svg, pass through as-is.
    if (
      this._svgFilterState === 'passthrough' &&
      this._svgFilterBuffer.length === 0 &&
      !this._mightContainSvg(data)
    ) {
      return data;
    }

    // Combine any buffered data with current chunk
    const combined = this._svgFilterBuffer + data;
    this._svgFilterBuffer = '';

    if (this._svgFilterState === 'passthrough' && !this._mightContainSvg(combined)) {
      // No '<' anywhere → no possible SVG tag, return everything immediately.
      // No need to buffer trailing chars since there's nothing to match against.
      return combined || null;
    }

    // Full filtering path (only when '<' is present or we're suppressing SVG)
    let result = '';
    let i = 0;

    while (i < combined.length) {
      if (this._svgFilterState === 'passthrough') {
        const svgStart = this._findSvgOpen(combined, i);
        if (svgStart === -1) {
          // No <svg found — pass through all content, but buffer last few chars
          // in case an '<' at the end is the start of a split '<svg' tag
          const lastLt = combined.lastIndexOf('<', combined.length - 1);
          if (lastLt >= i && combined.length - lastLt < 5) {
            // There's a trailing '<' that could be start of '<svg' split across chunks
            result += combined.slice(i, lastLt);
            this._svgFilterBuffer = combined.slice(lastLt);
          } else {
            result += combined.slice(i);
          }
          i = combined.length;
        } else {
          result += combined.slice(i, svgStart);
          this._svgFilterState = 'suppressing';
          i = svgStart;
        }
      } else {
        const svgEnd = this._findSvgClose(combined, i);
        if (svgEnd === -1) {
          this._svgFilterBuffer = combined.slice(Math.max(i, combined.length - 7));
          i = combined.length;
        } else {
          i = svgEnd;
          this._svgFilterState = 'passthrough';
        }
      }
    }

    return result || null;
  }

  /**
   * Find the start index of an <svg tag in data, starting from `from`.
   */
  _findSvgOpen(data: string, from: number): number {
    // Quick indexOf check on raw data first (covers common case with no ANSI escapes)
    const rawIdx = data.indexOf('<svg', from);
    if (rawIdx !== -1) return rawIdx;

    // Only do expensive ANSI-stripping if '<' exists (could be split by escapes)
    if (data.indexOf('<', from) === -1) return -1;

    const searchStr = data.slice(from).replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
    const idx = searchStr.indexOf('<svg');
    if (idx === -1) return -1;

    let origIdx = from;
    let cleanCount = 0;
    while (origIdx < data.length && cleanCount < idx) {
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
   * Find the end position (just after </svg>) in data, starting from `from`.
   */
  _findSvgClose(data: string, from: number): number {
    // Quick indexOf check on raw data first
    const rawIdx = data.indexOf('</svg>', from);
    if (rawIdx !== -1) return rawIdx + 6;

    // Only do expensive ANSI-stripping if '<' exists
    if (data.indexOf('<', from) === -1) return -1;

    const searchStr = data.slice(from).replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
    const closeTag = '</svg>';
    const idx = searchStr.indexOf(closeTag);
    if (idx === -1) return -1;

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
  resize(cols: number, rows: number): void {
    if (this.ptyProcess) {
      this.ptyProcess.resize(cols, rows);
    }
  }

  /**
   * Kill the PTY process
   */
  kill(): void {
    if (this.ptyProcess) {
      this.ptyProcess.kill();
      this.ptyProcess = null;
    }
  }
}
