# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SVG Artist is a web-based drawing application with a React frontend and Node.js backend. Users describe artwork in natural language via an embedded Claude Code terminal (xterm.js), and Claude generates SVG content through a layer-based drawing system rendered in a live preview pane. The app supports multiple concurrent drawings, each with its own Claude CLI instance and isolated WebSocket channels. Claude operates as a master SVG artist with 39 built-in MCP tools for canvas setup, layer management, path & shape creation, typography, transforms, styles, effects, defs, preview, color palettes, composition critique, scratch canvases, self-bootstrapping, custom tools/routes/macros, and versioning, plus a drawing skills plugin loaded via `--plugin-dir` with 10 professional-grade skills, 2 agents, and 3 commands.

## Browser-Based Web Search (chrome-devtools-mcp)

This project uses `chrome-devtools-mcp` (configured in `.mcp.json`) to control a Chrome browser for web searches and content retrieval. **WebSearch is disabled** — use browser automation instead.

**Workflow for searching the web:**
1. `new_page` — Open a new tab to a search engine (e.g. `https://www.google.com`)
2. `take_snapshot` — Read the page structure to find input elements
3. `fill` — Type search query into the search input field
4. `press_key` — Press Enter to submit the search
5. `take_snapshot` — Read search results to find relevant links
6. `click` — Click on a search result link
7. `take_snapshot` — Extract content from the target page

**Other useful chrome-devtools-mcp tools:**
- `take_screenshot` — Capture visual screenshot of the page
- `navigate_page` — Navigate to a URL directly, or go back/forward
- `list_pages` / `select_page` — Manage multiple open tabs
- `evaluate_script` — Run JavaScript on the page for advanced extraction
- `wait_for` — Wait for specific text to appear on the page

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
                                                                      --mcp-config  (39 tools)
                                                                      --plugin-dir  (10 skills, 2 agents, 3 commands)
                                                                      --append-system-prompt (layer guide)
```

**Frontend routing (React Router, hash mode):**
- `/#/` — HomePage: create new drawing, view history list with SVG thumbnails, delete drawings
- `/#/draw/:drawId` — DrawPage: split-pane canvas (SVG preview + terminal), one Claude CLI instance per drawId

**Communication channels (per drawId):**
- `/ws/svg/:drawId` — Server pushes SVG updates to browser; browser sends selection events back
- `/ws/terminal/:drawId` — Bidirectional PTY I/O between xterm.js and Claude CLI process

**Layer API routes (per drawId):**
- `POST /api/svg/:drawId/canvas/info` — Canvas overview (viewBox, layer count, defs count, total elements); optionally includes full SVG source
- `POST /api/svg/:drawId/canvas/source` — Full SVG source string
- `POST /api/svg/:drawId/canvas/viewbox` — Set/update viewBox
- `POST /api/svg/:drawId/canvas/bbox` — Element bounding box estimation
- `POST /api/svg/:drawId/canvas/background` — Set canvas background color or gradient
- `POST /api/svg/:drawId/layers/*` — Layer CRUD: list, get, add, update, delete, reorder, transform, opacity, style, colors
- `POST /api/svg/:drawId/layers/reorder` — Batch reorder layers (move_to, move_up/down, move_to_top/bottom)
- `POST /api/svg/:drawId/text/create` — Create text element with rich typography (multi-line, spans, text-on-path)
- `POST /api/svg/:drawId/path/create` — Create path from high-level spec (line, polyline, polygon, bezier, arc, star, rounded-rect)
- `POST /api/svg/:drawId/path/edit` — Edit path points (move, add, delete, set control, close/open, smooth, simplify)
- `POST /api/svg/:drawId/path/boolean` — Boolean path operations (union, subtract, intersect, exclude)
- `POST /api/svg/:drawId/path/find` — Find path element within a layer
- `POST /api/svg/:drawId/align` — Align layers to edge/center or distribute with equal spacing
- `POST /api/svg/:drawId/defs/*` — Defs management: list, manage (add/update/delete gradients, filters, patterns, clipPaths, masks)
- `POST /api/svg/:drawId/preview` — Full canvas PNG preview (via resvg-js, with background and DPI options)
- `POST /api/svg/:drawId/preview/layer` — Single layer PNG preview
- `POST /api/svg/:drawId/effect/apply` — Apply chainable effects (drop-shadow, blur, glow, emboss, noise-texture, paper, watercolor, metallic, glass) with append/replace mode
- `POST /api/svg/:drawId/palette/generate` — Generate color palettes by theme/mood
- `POST /api/svg/:drawId/composition/critique` — Analyze composition with 7-dimension scoring
- `POST /api/svg/:drawId/scratch/*` — Scratch canvas CRUD and merge operations
- `POST /api/svg/:drawId/custom/:name` — Execute custom route pipeline handler
- `POST /api/svg/:drawId/custom-tool/:toolName` — Execute custom tool pipeline handler

**REST API:**
- `GET /api/drawings` — List all drawings (with svgContent for thumbnails)
- `POST /api/drawings` — Create new drawing (generates id, sessionId, default SVG)
- `DELETE /api/drawings/:drawId` — Delete drawing and kill active Claude CLI process
- `POST /api/svg/:drawId/bootstrap/*` — Bootstrap write/list/reload (10 endpoints)
- `POST /api/svg/:drawId/bootstrap/write-custom-tool` — Write custom MCP tool with pipeline handler
- `POST /api/svg/:drawId/bootstrap/write-custom-route` — Write custom API route with pipeline handler
- `POST /api/svg/:drawId/bootstrap/rollback` — Roll back any asset to a previous version
- `POST /api/svg/:drawId/bootstrap/history` — View version history of any asset

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
- **Drawing plugin** — `plugins/svg-drawing/` loaded via `--plugin-dir` provides 10 drawing skills (svg-fundamentals, bezier-and-curves, color-and-gradients, composition, layer-workflow, svg-filters-and-effects, illustration-styles, character-illustration, advanced-color-composition, materials-and-textures), 2 agents (design-advisor with sonnet model for integrated research + design, bootstrap-reviewer for self-improvement analysis), and 3 commands (`/reference`, `/design`, `/review`). The design-advisor agent searches the web, downloads and compresses reference images to `data/references/<drawId>/`, analyzes them visually, and generates design proposals.
- **Self-bootstrapping** — Claude can extend its own capabilities mid-session by writing custom filters, styles, skills, macros, and prompt extensions to `data/bootstrap/`, then reloading the CLI process with `--resume` to pick up changes. The reload preserves conversation context via session resumption
- **Hot-reload registry** — Custom routes, tools, and macros use a registry pattern instead of direct Express route registration, enabling global refresh on `reload_session` without restarting the server
- **39 built-in MCP tools** — Canvas & info (3: get_canvas_info with optional source, get_element_bbox, get_layer_colors with HSL + gradient penetration), layer management (6: list_layers, get_layer, add_layer with source_layer_id, update_layer, delete_layer, reorder_layers), path & shape (3: create_path, edit_path, boolean_path), typography (1: create_text), transform (3: transform_layer with compose/replace mode, set_layer_opacity, align_distribute), style & color (2: set_layer_style with null removes, get_color_palette), defs (2: list_defs, manage_defs with gradient/pattern/clip-mask shortcuts), canvas setup (2: set_viewbox, set_canvas_background), preview & critique (3: preview_as_png with background + DPI, preview_layer, critique_composition), effects (1: apply_effect with chainable effects + append/replace mode), scratch canvas (2: scratch_canvas, merge_scratch), bootstrap (6: write_skill, write_filter, write_style, write_prompt_extension, reload_session, list_bootstrap_assets), phase-2 (5: write_custom_tool, write_custom_route, rollback_asset, get_asset_history, write_macro) + dynamic custom_*/macro_* tools. **Removed tools:** get_svg_source (merged into get_canvas_info), move_layer/duplicate_layer (replaced by reorder_layers and add_layer source_layer_id), apply_filter (replaced by apply_effect), apply_style_preset (removed; use set_layer_style directly)
- **`DISABLE_PTY=1`** — Environment variable that makes the terminal WebSocket send a test-mode message instead of spawning Claude CLI; used by Playwright integration tests
- **Backend is TypeScript (ES modules, run via tsx)** — Both frontend and backend are TypeScript; server uses a separate `tsconfig.server.json` without DOM types

## Self-Bootstrapping

Claude can self-improve during a drawing session by creating custom capabilities and reloading:

**Bootstrap MCP tools (11):**
- `write_skill` — Create/update SKILL.md in plugins directory
- `write_filter` — Create custom SVG filter template (JSON with `{{param:default}}` syntax)
- `write_style` — Create custom style preset (JSON with layer pattern matching)
- `write_prompt_extension` — Append to system prompt (Markdown)
- `reload_session` — Kill CLI + respawn with `--resume` + auto-inject continuation prompt
- `list_bootstrap_assets` — List all custom and built-in assets
- `write_custom_tool` — Create/update custom MCP tool with pipeline handler
- `write_custom_route` — Create/update custom API route with pipeline handler
- `rollback_asset` — Roll back any asset to a previous version
- `get_asset_history` — View version history of any asset
- `write_macro` — Define reusable pipeline macro (named sequence of actions)

**Bootstrap data:** `data/bootstrap/` (custom-filters/, custom-styles/, custom-tools/, custom-routes/, custom-macros/, prompt-extensions/)

**Custom filter template syntax:** `{{id}}` for filter element id, `{{param:default}}` for parameters

**Reload flow:** MCP tool → POST `/api/svg/:drawId/bootstrap/reload` → PtyManager.respawn() → kill PTY → wait 500ms → spawn with `--resume` → wait for CLI ready (2s debounce, 15s timeout) → inject continuation prompt to stdin → Claude auto-continues

**Validation:** kebab-case names, no path traversal, `<filter` tag required in templates, size limits (skills 50KB, prompts 10KB)

**Hot-reload:** On `reload_session`, the global route/tool/macro registry refreshes before the CLI respawns

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
  - `mcp-server.ts` — MCP server with 39 built-in tools (canvas, layers, path & shape, typography, transform, style, defs, effects, preview, palettes, critique, scratch canvases, bootstrap, custom tools/routes/macros, versioning)
  - `svg-engine.ts` — SVG DOM manipulation layer: parses SVG with linkedom, executes layer/defs/viewBox/filter/style operations
  - `png-renderer.ts` — SVG to PNG conversion via resvg-js for full canvas and per-layer preview
  - `filter-templates.ts` — 9 SVG filter type builders (drop-shadow, blur, glow, emboss, noise-texture, paper, watercolor, metallic, glass)
  - `style-presets.ts` — 6 style preset builders (flat, isometric, line-art, watercolor, retro, minimalist)
  - `color-palettes.ts` — HSL-based color palette generation with theme/mood mappings
  - `composition-analyzer.ts` — 7-dimension composition analysis (purpose, hierarchy, unity, variety, proportion, rhythm, emphasis)
  - `bootstrap-store.ts` — CRUD for `data/bootstrap/` custom filters, styles, prompt extensions, and skills
  - `bootstrap-validator.ts` — Path safety and format validation for bootstrap writes
  - `pipeline-engine.ts` — Sandboxed pipeline execution engine with 18+ actions for custom tool/route handlers
  - `custom-route-registry.ts` — Registry pattern for custom routes/tools/macros with hot-reload support
  - `typography.ts` — Typography engine: text element creation with multi-line, rich spans, text-on-path, and XML entity escaping
  - `path-operations.ts` — Path creation (line, polyline, polygon, bezier, arc, star, rounded-rect), point editing, smooth/simplify, and boolean operations via `path-bool`
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
  - `agents/bootstrap-reviewer.md` — Sonnet model sub-agent for analyzing drawing sessions and proposing self-improvement opportunities (custom filters, styles, tools, macros)
  - `commands/reference.md` — `/reference` slash command for finding reference images
  - `commands/design.md` — `/design` slash command for requesting design advice and composition critique
  - `commands/review.md` — `/review` slash command for bootstrap self-improvement analysis
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
- `resizable-panels.spec.ts` — Split-pane resize handle, min widths, drag behavior
- `zoom-pan.spec.ts` — SVG preview zoom controls, pan, keyboard shortcuts
- `layer-api.spec.ts` — Layer query operations (canvas info, list layers, get layer, get source)
- `layer-mutations.spec.ts` — Layer write operations (add, update, delete, reorder, duplicate via source_layer_id)
- `layer-transform-style.spec.ts` — Transform (compose/replace mode, skew), opacity, style (null removes), and align/distribute
- `defs-viewbox.spec.ts` — Defs CRUD (list, add, update, delete, gradient/pattern/clip-mask shortcuts) and viewBox operations
- `preview-api.spec.ts` — PNG preview (full canvas with background/DPI, per-layer) and element bounding box
- `filter-style-api.spec.ts` — Effect application (drop-shadow, glow, metallic) with chainable effects and append/replace modes
- `palette-critique-api.spec.ts` — Color palette generation (themes, moods) and composition critique (7-dimension scoring)
- `bootstrap-api.spec.ts` — Bootstrap write/list operations, validation, custom filter application, Phase 3 macro tests
- `scratch-canvas-api.spec.ts` — Scratch canvas create, layer operations, defs, preview, and merge to main canvas
- `typography.spec.ts` — Typography tool: text creation, multi-line, rich spans, text-on-path, XML entity escaping
- `path-operations.spec.ts` — Path create (line, polyline, polygon, bezier, arc, star, rounded-rect), edit, smooth, simplify, boolean
- `align-distribute.spec.ts` — Layer alignment (left, center, right, top, middle, bottom) and equal distribution

Test helpers: `e2e/fixtures.ts` (extends Playwright with APIRequestContext), `e2e/helpers/svg-samples.ts`, `e2e/helpers/navigate-to-drawing.ts` (creates drawing via API and navigates to draw page).
