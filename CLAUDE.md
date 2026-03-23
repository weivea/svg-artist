# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SVG Artist is a web-based drawing application with a React frontend and Node.js backend. Users describe artwork in natural language via an embedded Claude Code terminal (xterm.js), and Claude generates SVG content through a layer-based drawing system rendered in a live preview pane. The app supports multiple concurrent drawings, each with its own Claude CLI instance and isolated WebSocket channels. Claude operates as a professional SVG artist with 28 MCP tools for layer management, transforms, defs, preview, canvas, filters, styles, palettes, composition critique, and self-bootstrapping, plus a drawing skills plugin loaded via `--plugin-dir` with 10 professional-grade skills, 1 agent, and 2 commands.

## Commands

```bash
npm run dev              # Start frontend (Vite :5173) + backend (:3000) concurrently
npm run dev:frontend     # Vite dev server only (proxies /api and /ws to :3000)
npm run dev:server       # Express backend only
npm run build            # Build frontend to dist/
npm start                # Build + start production server on :3000

npm run test             # Integration tests (Playwright, auto-starts server with DISABLE_PTY=1)
npm run test:e2e         # All E2E tests (integration + full-flow)
npm run test:full        # Full-flow tests only (requires Claude CLI; start server manually first)

# Run a single test file
npx playwright test e2e/integration/page-layout.spec.ts --project=integration
```

Full-flow tests require a manually started server (`npm run dev:server`) without `DISABLE_PTY` and Claude CLI installed in PATH.

## Architecture

```
Browser (:5173 dev / :3000 prod)
  ├── HomePage (/)            ──── GET /api/drawings ──── Express Server (:3000)
  │   (create / history / delete)  POST /api/drawings        ├── DrawingStore (data/drawings.json)
  │                                DELETE /api/drawings/:id  ├── SvgEngine (linkedom DOM manipulation)
  └── DrawPage (/draw/:drawId)                               ├── PngRenderer (resvg-js → PNG preview)
      ├── SVG Preview (left)  ←── WS /ws/svg/:drawId ───────┤
      │   (region selection)                                  ├── Layer/Canvas/Preview/Bootstrap API routes
      └── Terminal (right)    ←→ WS /ws/terminal/:drawId ←→ SessionManager
                                                              └── Map<drawId, PtyManager>
                                                                  └── spawns Claude CLI with:
                                                                      --mcp-config  (28 tools)
                                                                      --plugin-dir  (10 skills, 1 agent)
                                                                      --append-system-prompt (layer guide)
```

**Frontend routing (React Router, hash mode):**
- `/#/` — HomePage: create new drawing, view history list with SVG thumbnails, delete drawings
- `/#/draw/:drawId` — DrawPage: split-pane canvas (SVG preview + terminal), one Claude CLI instance per drawId

**Communication channels (per drawId):**
- `/ws/svg/:drawId` — Server pushes SVG updates to browser; browser sends selection events back
- `/ws/terminal/:drawId` — Bidirectional PTY I/O between xterm.js and Claude CLI process

**Layer API routes (per drawId):**
- `POST /api/svg/:drawId/canvas/info` — Canvas overview (viewBox, layer count, defs count, total elements)
- `POST /api/svg/:drawId/canvas/source` — Full SVG source string
- `POST /api/svg/:drawId/canvas/viewbox` — Set/update viewBox
- `POST /api/svg/:drawId/canvas/bbox` — Element bounding box estimation
- `POST /api/svg/:drawId/layers/*` — Layer CRUD: list, get, add, update, delete, move, duplicate, transform, opacity, style
- `POST /api/svg/:drawId/defs/*` — Defs management: list, manage (add/update/delete gradients, filters, patterns)
- `POST /api/svg/:drawId/preview` — Full canvas PNG preview (via resvg-js)
- `POST /api/svg/:drawId/preview/layer` — Single layer PNG preview
- `POST /api/svg/:drawId/filter/apply` — Apply SVG filter (drop-shadow, blur, glow, emboss, noise-texture, paper, watercolor, metallic, glass) to a layer
- `POST /api/svg/:drawId/style/apply` — Apply style preset (flat, isometric, line-art, watercolor, retro, minimalist) to layers
- `POST /api/svg/:drawId/palette/generate` — Generate color palettes by theme/mood
- `POST /api/svg/:drawId/composition/critique` — Analyze composition with 7-dimension scoring

**REST API:**
- `GET /api/drawings` — List all drawings (with svgContent for thumbnails)
- `POST /api/drawings` — Create new drawing (generates id, sessionId, default SVG)
- `DELETE /api/drawings/:drawId` — Delete drawing and kill active Claude CLI process
- `POST /api/svg/:drawId/bootstrap/*` — Bootstrap write/list/reload (6 endpoints)

**SVG update flow:** User prompt → Claude CLI → layer MCP tools (add_layer, update_layer, etc.) → MCP server POSTs to `/api/svg/:drawId/layers/*` → Express backend parses SVG DOM with SvgEngine (linkedom), applies operation, serializes back → broadcasts updated SVG via `/ws/svg/:drawId` → React re-renders preview → SVG persisted to `data/drawings.json`

**Self-review flow:** Claude calls `preview_as_png` → MCP server POSTs to `/api/svg/:drawId/preview` → Express renders SVG to PNG via resvg-js → returns base64 PNG → Claude analyzes the image and decides if adjustments needed

**Region selection flow:** User drag-selects in SVG preview → frontend detects intersecting elements via `getBBox()` → selection sent to backend via `/ws/svg/:drawId` → PtyManager stores it → on next Enter keypress, context is silently prepended to the user's input before writing to PTY stdin → selection auto-clears after use

**Session lifecycle:** Create drawing → navigate to `/draw/:drawId` → terminal WebSocket triggers `SessionManager.getOrCreate()` → spawns Claude CLI with `--session-id` (new) or `--resume` (returning) → user draws → close tab → 2s grace period → kill Claude CLI process → reopen from history → resume conversation via `claude --resume <sessionId>`

## Key Design Decisions

- **Multi-session architecture** — SessionManager maintains a `Map<drawId, PtyManager>`. Each drawing gets an independent Claude CLI process with its own MCP callback URL
- **Path-parameter WebSocket isolation** — WebSocket paths include drawId (`/ws/svg/:drawId`), so SVG broadcasts only reach clients watching that specific drawing
- **Session persistence** — Claude CLI's `--session-id` / `--resume` flags enable conversation continuity. SVG content and metadata persisted in `data/drawings.json`
- **Close-and-resume** — Closing a tab kills the Claude CLI process immediately (after 2s grace period). Reopening resumes the conversation
- **Terminal exclusivity** — Only one terminal WebSocket can connect to a given drawId at a time; a second tab sees "Terminal already open in another tab"
- **stdin interception** — PtyManager buffers keystrokes and intercepts Enter to inject selection context; the context prefix is invisible in xterm.js display (line is erased and rewritten)
- **MCP callback architecture** — The MCP server runs as a child process of Claude CLI (spawned via `--mcp-config mcp-config.json`). It communicates with Claude over stdin/stdout (JSON-RPC) and with the Express server over HTTP. The callback URL is per-drawId via environment variable
- **Layer-based drawing** — SVG content is structured using `<g>` layers with `id="layer-*"` and `data-name` attributes. SvgEngine parses SVG with linkedom, applies layer operations, and serializes back. Write operations return minimal JSON (not full SVG) to avoid large payloads
- **Drawing plugin** — `plugins/svg-drawing/` loaded via `--plugin-dir` provides 10 drawing skills (svg-fundamentals, bezier-and-curves, color-and-gradients, composition, layer-workflow, svg-filters-and-effects, illustration-styles, character-illustration, advanced-color-composition, materials-and-textures), 1 agent (design-advisor with sonnet model for integrated research + design), and 2 commands (`/reference`, `/design`). The design-advisor agent searches the web, downloads and compresses reference images to `data/references/<drawId>/`, analyzes them visually, and generates design proposals.
- **Self-bootstrapping** — Claude can extend its own capabilities mid-session by writing custom filters, styles, skills, and prompt extensions to `data/bootstrap/`, then reloading the CLI process with `--resume` to pick up changes. The reload preserves conversation context via session resumption
- **28 MCP tools** — Information query (3), layer management (7), transform & style (3), defs resources (2), canvas (1), preview (2), professional tools (4: apply_filter, apply_style_preset, get_color_palette, critique_composition), bootstrap (6: write_skill, write_filter, write_style, write_prompt_extension, reload_session, list_bootstrap_assets)
- **`DISABLE_PTY=1`** — Environment variable that makes the terminal WebSocket send a test-mode message instead of spawning Claude CLI; used by Playwright integration tests
- **Backend is TypeScript (ES modules, run via tsx)** — Both frontend and backend are TypeScript; server uses a separate `tsconfig.server.json` without DOM types

## Self-Bootstrapping

Claude can self-improve during a drawing session by creating custom capabilities and reloading:

**Bootstrap MCP tools (6):**
- `write_skill` — Create/update SKILL.md in plugins directory
- `write_filter` — Create custom SVG filter template (JSON with `{{param:default}}` syntax)
- `write_style` — Create custom style preset (JSON with layer pattern matching)
- `write_prompt_extension` — Append to system prompt (Markdown)
- `reload_session` — Kill CLI + respawn with `--resume` + auto-inject continuation prompt
- `list_bootstrap_assets` — List all custom and built-in assets

**Bootstrap data:** `data/bootstrap/` (custom-filters/, custom-styles/, prompt-extensions/)

**Custom filter template syntax:** `{{id}}` for filter element id, `{{param:default}}` for parameters

**Reload flow:** MCP tool → POST `/api/svg/:drawId/bootstrap/reload` → PtyManager.respawn() → kill PTY → wait 500ms → spawn with `--resume` → wait for CLI ready (2s debounce, 15s timeout) → inject continuation prompt to stdin → Claude auto-continues

**Validation:** kebab-case names, no path traversal, `<filter` tag required in templates, size limits (skills 50KB, prompts 10KB)

## Project Structure

- `src/` — React frontend (TypeScript)
  - `main.tsx` — Entry point with HashRouter
  - `App.tsx` — Route container (HomePage + DrawPage)
  - `pages/HomePage.tsx` — Landing page: create button, history grid with SVG thumbnails, delete
  - `pages/DrawPage.tsx` — Canvas page: top bar + split pane (SVG preview + terminal)
  - `components/SvgPreview.tsx` — SVG render + drag selection + element detection
  - `components/Terminal.tsx` — xterm.js wrapper (accepts wsUrl prop)
  - `components/DrawingCard.tsx` — History card with SVG thumbnail and delete button
- `server/` — Node.js backend (TypeScript, run via tsx)
  - `index.ts` — Express + per-drawId WebSocket routing + REST API + layer/canvas/preview routes + graceful shutdown
  - `session-manager.ts` — Manages `Map<drawId, PtyManager>` instances
  - `pty-manager.ts` — Claude CLI PTY lifecycle + stdin interception + session resume + plugin-dir + append-system-prompt
  - `drawing-store.ts` — JSON-file CRUD for drawings (`data/drawings.json`)
  - `mcp-server.ts` — MCP server with 28 tools (layer CRUD, transform, defs, canvas, preview, filters, styles, palettes, critique, bootstrap)
  - `svg-engine.ts` — SVG DOM manipulation layer: parses SVG with linkedom, executes layer/defs/viewBox/filter/style operations
  - `png-renderer.ts` — SVG to PNG conversion via resvg-js for full canvas and per-layer preview
  - `filter-templates.ts` — 9 SVG filter type builders (drop-shadow, blur, glow, emboss, noise-texture, paper, watercolor, metallic, glass)
  - `style-presets.ts` — 6 style preset builders (flat, isometric, line-art, watercolor, retro, minimalist)
  - `color-palettes.ts` — HSL-based color palette generation with theme/mood mappings
  - `composition-analyzer.ts` — 7-dimension composition analysis (purpose, hierarchy, unity, variety, proportion, rhythm, emphasis)
  - `bootstrap-store.ts` — CRUD for `data/bootstrap/` custom filters, styles, prompt extensions, and skills
  - `bootstrap-validator.ts` — Path safety and format validation for bootstrap writes
- `data/` — Runtime data directory (gitignored): `drawings.json`, `references/<drawId>/` (downloaded reference images), `bootstrap/` (custom filters, styles, prompt extensions)
- `e2e/integration/` — Playwright tests that run with PTY disabled (30s timeout, 1 retry)
- `e2e/full-flow/` — Playwright tests requiring real Claude CLI (120s timeout, 0 retries)
- `e2e/helpers/` — Test fixtures, SVG samples, and navigation helpers
- `mcp-config.json` — MCP server config passed to Claude CLI via `--mcp-config`
- `plugins/svg-drawing/` — Claude Code drawing plugin loaded via `--plugin-dir`
  - `.claude-plugin/plugin.json` — Plugin metadata
  - `skills/svg-fundamentals/SKILL.md` — Basic shapes, paths, transforms, coordinate system, animation, advanced text, responsive SVG
  - `skills/bezier-and-curves/SKILL.md` — Quadratic/cubic Bézier, arcs, organic shapes, curve debugging, path optimization
  - `skills/color-and-gradients/SKILL.md` — Color theory, gradients, patterns, opacity blending, mesh gradient simulation, filter coloring
  - `skills/composition/SKILL.md` — Scene building, layering, perspective, shadows, dynamic symmetry, tension/resolution, large scene management
  - `skills/layer-workflow/SKILL.md` — Layer naming, work order, self-review workflow, 7-dimension critique, iteration framework, export/optimization
  - `skills/svg-filters-and-effects/SKILL.md` — SVG filter primitives, lighting, displacement, compositing, performance optimization
  - `skills/illustration-styles/SKILL.md` — Flat design, isometric, line art, watercolor, retro/vintage, minimalist styles with SVG techniques
  - `skills/character-illustration/SKILL.md` — Proportion systems, facial expressions, poses, hair/clothing, character consistency, stylization levels
  - `skills/advanced-color-composition/SKILL.md` — Advanced palettes, color psychology, WCAG accessibility, golden ratio, Gestalt principles, visual hierarchy
  - `skills/materials-and-textures/SKILL.md` — 10 material types (metal, glass, wood, water, fabric, stone, skin, fur, brick, ice) with SVG defs code
  - `agents/design-advisor.md` — Sonnet model sub-agent for integrated visual research (web search, image download/compress, multimodal analysis) and professional design critique with 2-3 approach proposals
  - `commands/reference.md` — `/reference` slash command for finding reference images
  - `commands/design.md` — `/design` slash command for requesting design advice and composition critique
- `docs/plans/` — Design and implementation plan documents

## Testing

Playwright has two projects configured in `playwright.config.ts`:
- **integration** — `e2e/integration/`, auto-starts server with `DISABLE_PTY=1`, 30s timeout
- **full-flow** — `e2e/full-flow/`, requires manual server start with real PTY, 120s timeout

Integration test suites:
- `homepage.spec.ts` — HomePage rendering, create drawing, history list, card navigation, delete
- `drawing-api.spec.ts` — REST API CRUD (POST create, GET list, DELETE remove, 404)
- `multi-session.spec.ts` — Per-drawId SVG broadcast isolation, SVG persistence
- `page-layout.spec.ts` — DrawPage split-pane layout, terminal rendering, placeholder SVG
- `websocket-svg.spec.ts` — Per-drawId SVG WebSocket updates, sequential updates, error handling
- `region-selection.spec.ts` — Drag selection overlay, coordinates, element count, clear
- `layer-api.spec.ts` — Layer query operations (canvas info, list layers, get layer, get source)
- `layer-mutations.spec.ts` — Layer write operations (add, update, delete, move, duplicate)
- `layer-transform-style.spec.ts` — Transform, opacity, and style operations
- `defs-viewbox.spec.ts` — Defs CRUD (list, add, update, delete) and viewBox operations
- `preview-api.spec.ts` — PNG preview (full canvas, per-layer) and element bounding box
- `filter-style-api.spec.ts` — Filter application (drop-shadow, glow, metallic) and style presets (flat, line-art, watercolor)
- `palette-critique-api.spec.ts` — Color palette generation (themes, moods) and composition critique (7-dimension scoring)
- `bootstrap-api.spec.ts` — Bootstrap write/list operations, validation, custom filter application

Test helpers: `e2e/fixtures.ts` (extends Playwright with APIRequestContext), `e2e/helpers/svg-samples.ts`, `e2e/helpers/navigate-to-drawing.ts` (creates drawing via API and navigates to draw page).
