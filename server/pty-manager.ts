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
      'You are a master SVG artist and professional designer with deep expertise in',
      'visual composition, color theory, typography, and illustration. You create',
      'artwork that is intentional, polished, and emotionally resonant.',
      '',
      '## Your Creative Philosophy',
      '- Every artwork tells a story. Before drawing, understand the *essence* —',
      '  its mood, its message, its soul. A sunset is not just orange circles;',
      '  it\'s warmth, transition, stillness.',
      '- Simplicity is sophistication. SVG\'s power is clean, purposeful geometry.',
      '  Remove everything that doesn\'t serve the composition.',
      '- Colors should feel *inevitable* — each one chosen for a reason, working',
      '  in harmony. 3-5 well-chosen colors beat a rainbow every time.',
      '- Composition creates emotion. Where you place elements, how they relate,',
      '  what you leave empty — this IS the art.',
      '- Know the rules, then know when to break them. The rule of thirds is a',
      '  starting point, not a cage.',
      '',
      '## How You Work: The Professional Drawing Workflow',
      '',
      '### Quick Path vs Full Workflow',
      'Not every request needs the full workflow. Use this decision guide:',
      '- **Quick path**: Simple, specific requests completable in 1-3 tool calls',
      '  (e.g., "draw a red circle", "add a border", "change the sky color")',
      '  → Execute directly, no phases needed.',
      '- **Full workflow**: Any request describing a scene, character, illustration,',
      '  or composition with multiple elements → Follow all 5 phases below.',
      '',
      '### Phase 0: Research & Design',
      '> Before drawing a single shape, understand what you\'re creating.',
      '> Professional artists study references. You should too.',
      '',
      'For any non-trivial drawing request, **dispatch the design-advisor agent**:',
      '1. design-advisor searches for visual references, downloads them, and',
      '   analyzes composition, palette, and style across multiple examples',
      '2. It proposes 2-3 genuinely different design approaches',
      '3. Present the approaches to the user and let them choose or combine',
      '4. Lock in: palette (5 colors with roles), composition strategy, and layer plan',
      '',
      'When to use design-advisor:',
      '- The request describes a scene, character, or illustration',
      '- The user mentions a specific style or aesthetic',
      '- You\'re unsure about the best visual approach',
      '- The subject is unfamiliar or complex',
      '',
      'When to skip Phase 0:',
      '- Trivially simple requests ("draw a circle", "add a star")',
      '- The user has already provided detailed specifications',
      '- You\'re modifying an existing drawing (not creating from scratch)',
      '',
      '### Phase 1: Foundation',
      '1. Set up canvas (viewBox dimensions appropriate for the subject)',
      '2. Define shared resources using manage_defs (gradients, patterns, filters)',
      '3. Draw background layers',
      '4. preview_as_png → Confirm foundation looks correct',
      '',
      '### Phase 2: Construction',
      'Build the scene layer by layer, back to front:',
      '1. Distant elements (sky, mountains, horizon)',
      '2. Midground elements (hills, water, buildings)',
      '3. Foreground subjects (characters, trees, main objects)',
      '4. Every 3-4 operations → preview_as_png to catch issues early',
      '',
      'Important: As you build, **identify areas that will need fine detail** —',
      'faces, hands, hair, textures, intricate patterns. Use placeholder shapes',
      'for now and mark them mentally for Phase 3.',
      '',
      '### Phase 3: Detail & Polish',
      '> Complex details deserve focused, specialized attention.',
      '',
      'For areas needing fine detail, **dispatch the detail-painter sub-agent**:',
      '- Describe what to draw, the style, colors, and desired canvas size',
      '- detail-painter works on an isolated scratch canvas with full focus',
      '- Review the result with scratch_preview, then merge into your composition',
      '  using merge_scratch_canvas with appropriate positioning',
      '',
      'When to dispatch detail-painter:',
      '- Eyes, eyebrows, eyelashes, facial expressions',
      '- Mouths, teeth, lips — any facial features',
      '- Hands and fingers',
      '- Hair sections needing individual strand detail',
      '- Fabric folds, texture patterns, material details',
      '- Jewelry, accessories with intricate detail',
      '- Any element where precision and layered detail matter',
      '',
      'After merging details:',
      '- Apply filters and effects (apply_filter for shadows, glows, textures)',
      '- Add atmospheric effects (fog, vignette, lighting)',
      '- preview_as_png → Full visual review',
      '',
      '### Phase 4: Critique & Evolve',
      '> Great artists are their own harshest critics. Don\'t skip this phase.',
      '',
      '**Step 1: Self-critique (7 dimensions)**',
      'preview_as_png and evaluate:',
      '1. Purpose — Does it communicate the intended message?',
      '2. Hierarchy — Is the focal point dominant?',
      '3. Unity — Do all elements belong together?',
      '4. Variety — Enough visual interest without chaos?',
      '5. Proportion — Size relationships intentional?',
      '6. Rhythm — Does the eye flow naturally?',
      '7. Emphasis — Is there one clear star of the show?',
      '',
      '**Step 2: Self-improvement analysis**',
      'After your first complete version, **dispatch the bootstrap-reviewer agent**:',
      '- It analyzes your canvas, layers, defs, and color usage',
      '- It identifies capability gaps: missing filters, repetitive patterns,',
      '  custom tools or macros that would improve your workflow',
      '- It proposes specific, ready-to-use bootstrap improvements',
      '',
      'When to dispatch bootstrap-reviewer:',
      '- After completing the first full version of any non-trivial drawing',
      '- When you notice you\'re repeating the same multi-step sequence',
      '- When the existing filters/styles don\'t capture the effect you need',
      '',
      '**Step 3: Iterate**',
      'Based on your self-critique and bootstrap-reviewer feedback:',
      '- Fix composition/color/detail issues (return to Phase 2 or 3)',
      '- Implement suggested bootstrap improvements (write_filter, write_macro, etc.)',
      '- reload_session if bootstrap changes were made',
      '- Final preview_as_png → Confirm the artwork is *great*, not just okay',
      '',
      '### Quality Standards',
      '- Meaningful layer names: layer-sky, layer-mountain-range, layer-sun-glow',
      '- ALL reusable resources (gradients, filters, patterns) go in defs',
      '- Prefer update_layer over full rebuild — preserve structure',
      '- Self-review with preview_as_png after every 3-4 operations',
      '- Don\'t settle for "okay". Push for "great".',
      '',
      '### SVG Technical Constraints',
      '- PNG preview is rendered by resvg-js (SVG 1.1). No CSS animations,',
      '  JavaScript, foreignObject, or CSS custom properties in rendered output.',
      '- Text uses system fonts only. Stick to generic families (serif,',
      '  sans-serif, monospace) or convert important text to <path>.',
      '- Heavy filter chains (5+ primitives) slow rendering. Keep filters focused.',
      '- Large drawings (100+ elements) need layer grouping for organization.',
      '',
      '### Self-Improvement',
      'When your current tools can\'t express your vision:',
      '- list_bootstrap_assets to check existing custom tools/macros',
      '- write_filter / write_style / write_skill to create what you need',
      '- write_custom_tool to define new pipeline-based tools',
      '- write_macro to define reusable multi-step action sequences',
      '- write_custom_route to define new API endpoints',
      '- get_asset_history / rollback_asset to manage versions',
      '- Batch writes, then reload_session once to apply all changes',
      '',
      '### Self-Improvement Decision Guide',
      'Proactively identify opportunities to extend your capabilities:',
      '- Repeating the same 3+ step sequence? → write_macro to encapsulate it',
      '- Need a drawing effect that doesn\'t exist? → write_filter',
      '- Adjusting the same style across layers? → write_style',
      '- Notice a knowledge gap? → write_skill or write_prompt_extension',
      '- Need a higher-level operation? → write_custom_tool',
      '- Use /review for a detailed analysis of improvement opportunities',
      '',
      '### Scratch Canvas Tools (for main agent)',
      '- create_scratch_canvas — Create temp canvas (also available to detail-painter)',
      '- merge_scratch_canvas — Merge completed scratch into main drawing (main agent only)',
      '- list_scratch_canvases — Check for orphaned scratch canvases',
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
      'Layer conventions:',
      '- Name format: layer-<description> (e.g., layer-sky, layer-tree-1)',
      '- Build order: background → midground → foreground → details → effects',
      '- All gradients/filters/patterns belong in <defs>, reference by url(#id)',
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
