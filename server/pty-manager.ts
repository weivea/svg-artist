import pty, { IPty } from 'node-pty';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { WebSocket } from 'ws';
import { loadAllPromptExtensions } from './bootstrap-store.js';

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
  private _lastSpawnOpts: SpawnOptions | null = null;
  private _dataHandler: { dispose: () => void } | null = null;

  /**
   * Spawn claude CLI in a real PTY.
   */
  async spawn(opts: SpawnOptions = {}): Promise<IPty> {
    this._lastSpawnOpts = { ...opts };
    const mcpConfigPath = join(projectRoot, 'mcp-config.json');
    const pluginDir = join(projectRoot, 'plugins', 'svg-drawing');

    const systemPrompt = [
      'You are a professional SVG artist and designer. Users describe artwork and you create it through layer operations.',
      '',
      'Workflow:',
      '1. OFFER DESIGN RESEARCH: After receiving the user\'s drawing request, always ask:',
      '   "Would you like me to do design research first? I\'ll search for reference images',
      '   and propose 2-3 visual approaches. (y/n, or just describe more details to start drawing)"',
      '   - If user says yes/y → proceed to step 2',
      '   - If user says no/n or provides more details → skip to step 3',
      '   - User can also trigger research later with /design or /reference',
      '2. DESIGN: Use design-advisor agent to research references and explore visual approaches.',
      '   - IMPORTANT: Pass the current drawId to the agent so it can save reference images',
      '   - Agent will automatically search web, download reference images, compress them, and analyze them',
      '   - Reference images are saved to data/references/<drawId>/',
      '   - Agent presents 2-3 approaches informed by real visual references',
      '   - Wait for user selection before proceeding',
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
      '8. SELF-IMPROVE: If you encounter a capability gap during drawing:',
      '   - Use list_bootstrap_assets to see what custom tools exist',
      '   - Use write_filter/write_style/write_skill to create what you need',
      '   - Use reload_session to apply changes (auto-continues your work)',
      '   - Batch multiple writes before a single reload for efficiency',
      '',
      'Always give layers and elements meaningful id and data-name attributes.',
    ].join('\n');

    const layerGuide = await this.buildDynamicPrompt();

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

  private async buildDynamicPrompt(): Promise<string> {
    const base = [
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
      '',
      'Self-improvement capabilities:',
      '- write_skill: Create/update drawing skills for future use',
      '- write_filter: Create custom SVG filter templates',
      '- write_style: Create custom style presets',
      '- write_prompt_extension: Add to your own system prompt',
      '- reload_session: Apply all changes (auto-restarts and continues)',
      '- list_bootstrap_assets: View all custom assets',
      '',
      'When you find your current tools insufficient for a task,',
      'create the tools/skills you need, reload, and continue.',
      'Batch multiple writes before a single reload for efficiency.',
    ].join('\n');

    const extensions = await loadAllPromptExtensions();
    if (extensions) {
      return base + '\n\n' + extensions;
    }
    return base;
  }

  /**
   * Attach a WebSocket client to the PTY
   */
  async attachWebSocket(ws: WebSocket, spawnOpts: SpawnOptions = {}): Promise<void> {
    if (!this.ptyProcess) {
      await this.spawn(spawnOpts);
    }

    this.terminalWs = ws;

    // PTY stdout -> filter SVG content -> WebSocket -> xterm.js
    this._dataHandler = this.ptyProcess!.onData((data: string) => {
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
      if (this._dataHandler) {
        this._dataHandler.dispose();
        this._dataHandler = null;
      }
      this.terminalWs = null;
      console.log('[PTY] WebSocket disconnected');
    });
  }

  /**
   * Respawn the Claude CLI process with updated capabilities.
   * Kills the current process, spawns a new one with --resume,
   * reattaches the WebSocket, and injects a continuation prompt.
   */
  async respawn(reason?: string): Promise<void> {
    const sessionId = this._lastSpawnOpts?.sessionId;
    const callbackUrl = this._lastSpawnOpts?.callbackUrl;
    const ws = this.terminalWs;

    // Notify terminal
    if (ws && ws.readyState === 1) {
      ws.send('\r\n\x1b[33m[Reloading with upgraded capabilities...]\x1b[0m\r\n');
    }

    // Dispose existing data handler
    if (this._dataHandler) {
      this._dataHandler.dispose();
      this._dataHandler = null;
    }

    // Kill current process
    if (this.ptyProcess) {
      this.ptyProcess.kill();
      this.ptyProcess = null;
    }

    // Brief pause for process cleanup
    await new Promise(r => setTimeout(r, 500));

    // Respawn with resume
    await this.spawn({
      sessionId,
      isResume: true,
      callbackUrl,
    });

    // Reattach WebSocket to new PTY
    if (ws && ws.readyState === 1) {
      this.reattachWebSocket(ws);
    }

    // Wait for ready, then inject continuation prompt
    this.waitForReadyAndInject(reason);
  }

  private reattachWebSocket(ws: WebSocket): void {
    if (!this.ptyProcess) return;
    this.terminalWs = ws;

    this._dataHandler = this.ptyProcess.onData((data: string) => {
      if (ws.readyState === 1) {
        const filtered = this._filterSvgContent(data);
        if (filtered) {
          ws.send(filtered);
        }
      }
    });
  }

  private waitForReadyAndInject(reason?: string): void {
    if (!this.ptyProcess) return;

    let injected = false;

    // Debounce-based ready detection: when PTY output stops for 2s, assume ready
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const outputHandler = this.ptyProcess.onData(() => {
      if (injected) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!injected) {
          injected = true;
          outputHandler.dispose();
          this.injectContinuationPrompt(reason);
        }
      }, 2000);
    });

    // Hard timeout fallback: 15 seconds
    setTimeout(() => {
      if (!injected) {
        injected = true;
        outputHandler.dispose();
        if (debounceTimer) clearTimeout(debounceTimer);
        this.injectContinuationPrompt(reason);
      }
    }, 15_000);
  }

  private injectContinuationPrompt(reason?: string): void {
    if (!this.ptyProcess) return;

    const message = [
      'I just upgraded my capabilities:',
      reason || 'System reload with latest changes',
      '',
      'Continue where I left off with the current task.',
    ].join('\n');

    this.ptyProcess.write(message + '\r');
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
