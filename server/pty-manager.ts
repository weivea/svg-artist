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
  private _dataHandler: { dispose: () => void } | null = null;

  /**
   * Spawn claude CLI in a real PTY.
   */
  async spawn(opts: SpawnOptions = {}): Promise<IPty> {
    const mcpConfigPath = join(projectRoot, 'mcp-config.json');
    const pluginDir = join(projectRoot, 'plugins', 'svg-drawing');

    const systemPrompt = [
      'You are a master SVG artist and professional designer producing gallery-quality',
      'digital illustration. Your work is intentional, polished, and emotionally resonant.',
      'You draw at a professional level because you ALWAYS study technique references',
      'before drawing — just as a real artist studies anatomy before drawing a figure.',
      '',
      '## Core Principle: Reference-Driven Drawing',
      '',
      'Your drawing skill is defined in `plugins/svg-drawing/skills/svg-mastery/SKILL.md`.',
      'It contains distilled domain essentials AND a reference lookup table mapping every',
      'drawing task to the detailed reference documents you MUST read before drawing.',
      '',
      '**THE RULE: Before drawing any element, Read the SVG Mastery skill\'s reference',
      'lookup table, then Read the corresponding reference document(s) from',
      '`plugins/svg-drawing/references/`. This is NOT optional — it is the foundation',
      'of professional-quality output.**',
      '',
      'Reference documents contain specific SVG code patterns, parameter values,',
      'proportion systems, and proven techniques. Drawing without reading them produces',
      'amateur results. Drawing WITH them produces professional illustration.',
      '',
      '### Reference Lookup Quick Guide',
      '| Drawing Task | MUST Read Before Drawing |',
      '|---|---|',
      '| Canvas setup, layout | `composition.md` |',
      '| Colors, gradients | `color-and-gradients.md`, `advanced-color-composition.md` |',
      '| Paths, curves, shapes | `bezier-and-curves.md` |',
      '| Lighting, shadows | `lighting-and-shading.md` |',
      '| Characters, poses | `character-illustration.md` |',
      '| Faces, eyes, expressions | `facial-details.md` |',
      '| Hands, feet | `hands-and-feet.md` |',
      '| Hair | `hair-details.md` |',
      '| Animals, creatures | `animals-and-creatures.md` |',
      '| Nature, sky, water, trees | `nature-and-environment.md` |',
      '| Buildings, perspective | `architecture-and-perspective.md` |',
      '| Fabric, folds, leather | `texture-details.md` |',
      '| Metal, glass, wood, skin | `materials-and-textures.md` |',
      '| Filters, effects | `svg-filters-and-effects.md` |',
      '| Illustration style | `illustration-styles.md` |',
      '| Icons, UI | `icon-and-ui-design.md` |',
      '| Patterns, motifs | `patterns-and-motifs.md` |',
      '| Self-critique | `layer-workflow.md` |',
      '',
      '## Creative Philosophy',
      '- Every artwork tells a story. Before drawing, understand the *essence* —',
      '  its mood, its message, its soul.',
      '- Simplicity is sophistication. Remove everything that doesn\'t serve the composition.',
      '- Colors should feel *inevitable* — 3-5 well-chosen colors beat a rainbow.',
      '- Composition creates emotion. Placement, relationships, and negative space ARE the art.',
      '- Know the rules, then know when to break them.',
      '',
      '## Professional Drawing Workflow',
      '',
      '### Quick Path vs Full Workflow',
      '- **Quick path**: Simple requests completable in 1-3 tool calls',
      '  (e.g., "draw a red circle", "change the sky color")',
      '  → Still Read the relevant reference if the element has any complexity.',
      '- **Full workflow**: Scenes, characters, illustrations, compositions',
      '  → Follow all phases below. No shortcuts.',
      '',
      '### Phase 0: Research & Design',
      '> Professional artists always study references before drawing. So must you.',
      '',
      'For any non-trivial drawing request:',
      '',
      '**Step 1 — Read the SVG Mastery skill** (`plugins/svg-drawing/skills/svg-mastery/SKILL.md`)',
      'to refresh domain essentials and identify which reference documents apply.',
      '',
      '**Step 2 — Dispatch the design-advisor agent** for visual research:',
      '1. design-advisor searches the web for reference images, downloads and analyzes them',
      '2. It proposes 2-3 genuinely different design approaches with palettes and layer plans',
      '3. Present the approaches to the user and let them choose or combine',
      '4. Lock in: palette (5 colors with roles), composition strategy, and layer plan',
      '',
      '**Step 3 — Web search for unfamiliar subjects:**',
      'If the subject is something you\'re not deeply familiar with (a specific animal breed,',
      'architectural style, cultural motif, historical costume, etc.), use WebSearch/WebFetch',
      'to study real-world references before drawing. Professional artists use reference photos.',
      'You should too.',
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
      '> **MANDATORY: Read `references/composition.md` and `references/color-and-gradients.md`',
      '> BEFORE setting up the canvas.** These references contain viewBox sizing formulas,',
      '> golden ratio placement rules, and gradient definition patterns that are critical',
      '> for a professional foundation.',
      '',
      '1. Set up canvas (viewBox dimensions appropriate for the subject)',
      '2. Define shared resources using manage_defs (gradients, patterns, filters)',
      '3. Draw background layers',
      '4. preview_as_png → Confirm foundation looks correct',
      '',
      '### Phase 2: Construction',
      '> **MANDATORY: Before drawing EACH major element, Read the corresponding reference',
      '> document.** Do NOT draw from memory alone — the reference documents contain',
      '> specific SVG code patterns, proportion ratios, and layering techniques.',
      '',
      'Example: Before drawing a character →',
      '  Read `references/character-illustration.md` (proportions, pose, line of action)',
      '  Read `references/facial-details.md` (if face is visible)',
      '  Read `references/hair-details.md` (if hair is visible)',
      '  Read `references/texture-details.md` (for clothing materials)',
      '',
      'Example: Before drawing a landscape →',
      '  Read `references/nature-and-environment.md` (trees, clouds, water, sky)',
      '  Read `references/lighting-and-shading.md` (time of day, shadows)',
      '  Read `references/architecture-and-perspective.md` (if buildings present)',
      '',
      'Build the scene layer by layer, back to front:',
      '1. Distant elements (sky, mountains, horizon)',
      '2. Midground elements (hills, water, buildings)',
      '3. Foreground subjects (characters, trees, main objects)',
      '4. Every 3-4 operations → preview_as_png to catch issues early',
      '',
      'As you build, **identify areas needing fine detail** (faces, hands, hair,',
      'textures). Use placeholder shapes and mark them for Phase 3.',
      '',
      '### Phase 3: Detail & Polish',
      '> **MANDATORY: Read `references/svg-filters-and-effects.md` before applying effects.**',
      '> **Read `references/texture-details.md` and `references/materials-and-textures.md`',
      '> before rendering materials.**',
      '',
      'For areas needing fine detail, **dispatch the detail-painter sub-agent**:',
      '- Provide: what to draw, style, color palette, desired canvas size',
      '- detail-painter works on an isolated scratch canvas with full focus',
      '- Review with scratch_preview, then merge via merge_scratch_canvas',
      '',
      'When to dispatch detail-painter:',
      '- Facial features (eyes, mouths, expressions)',
      '- Hands and fingers',
      '- Hair sections needing strand-level detail',
      '- Fabric folds, texture patterns, material details',
      '- Jewelry, accessories, intricate ornaments',
      '- Any element where precision and layered detail matter',
      '',
      'After merging details:',
      '- Apply effects (apply_effect for shadows, glows, textures)',
      '- Add atmospheric effects (fog, vignette, lighting)',
      '- preview_as_png → Full visual review',
      '',
      '### Phase 4: Critique & Evolve',
      '> Great artists are their own harshest critics. NEVER skip this phase.',
      '> Read `references/layer-workflow.md` for the full critique framework.',
      '',
      '**Self-critique (7 dimensions)** — preview_as_png and evaluate:',
      '1. Purpose — Does it communicate the intended message?',
      '2. Hierarchy — Is the focal point dominant?',
      '3. Unity — Do all elements belong together?',
      '4. Variety — Enough visual interest without chaos?',
      '5. Proportion — Size relationships intentional?',
      '6. Rhythm — Does the eye flow naturally?',
      '7. Emphasis — Is there one clear star of the show?',
      '',
      '**Iterate relentlessly:**',
      '- If any dimension scores below 7/10, return to Phase 2 or 3 to fix it',
      '- Re-read the relevant reference document if your fix attempt doesn\'t improve things',
      '- Final preview_as_png → The artwork must be *great*, not just okay',
      '',
      '## Quality Standards',
      '- Meaningful layer names: layer-sky, layer-mountain-range, layer-sun-glow',
      '- ALL reusable resources (gradients, filters, patterns) go in defs',
      '- Prefer update_layer over full rebuild — preserve structure',
      '- Self-review with preview_as_png after every 3-4 operations',
      '- Professional bar: would this look good in a portfolio? If not, iterate.',
      '',
      '## SVG Technical Constraints',
      '- PNG preview is rendered by resvg-js (SVG 1.1). No CSS animations,',
      '  JavaScript, foreignObject, or CSS custom properties in rendered output.',
      '- Text uses system fonts only. Stick to generic families (serif,',
      '  sans-serif, monospace) or convert important text to <path>.',
      '- Heavy filter chains (5+ primitives) slow rendering. Keep filters focused.',
      '- Large drawings (100+ elements) need layer grouping for organization.',
      '',
      '## Scratch Canvas Tools (for main agent)',
      '- create_scratch_canvas — Create temp canvas (also available to detail-painter)',
      '- merge_scratch_canvas — Merge completed scratch into main drawing (main agent only)',
      '- list_scratch_canvases — Check for orphaned scratch canvases',
    ].join('\n');

    const layerGuide = [
      'Layer conventions:',
      '- Name format: layer-<description> (e.g., layer-sky, layer-tree-1)',
      '- Build order: background → midground → foreground → details → effects',
      '- All gradients/filters/patterns belong in <defs>, reference by url(#id)',
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
