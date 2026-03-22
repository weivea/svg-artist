# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SVG Artist is a web-based drawing application with a React frontend and Node.js backend. Users describe artwork in natural language via an embedded Claude Code terminal (xterm.js), and Claude generates SVG content rendered in a live preview pane. Communication happens over two WebSocket channels and an MCP tool callback.

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
  ├── SVG Preview (left pane) ←── WebSocket /ws/svg ──── Express Server (:3000)
  │   (region selection)                                    ├── POST /api/svg ← MCP Server
  └── xterm.js Terminal (right pane) ←→ WebSocket /ws/terminal ←→ PTY Manager
                                                            └── spawns Claude CLI with --mcp-config
```

**Three communication channels:**
- `/ws/svg` — Server pushes SVG updates to browser; browser sends selection events back
- `/ws/terminal` — Bidirectional PTY I/O between xterm.js and Claude CLI process
- `POST /api/svg` — MCP server's `draw_svg` tool calls this HTTP endpoint to deliver SVG content

**SVG update flow:** User prompt → Claude CLI → `draw_svg` MCP tool → MCP server POSTs to `/api/svg` → Express broadcasts via `/ws/svg` → React re-renders preview

**Region selection flow:** User drag-selects in SVG preview → frontend detects intersecting elements via `getBBox()` → selection sent to backend via `/ws/svg` → PtyManager stores it → on next Enter keypress, context is silently prepended to the user's input before writing to PTY stdin → selection auto-clears after use

## Key Design Decisions

- **Single PTY process** — One Claude CLI instance, lazy-spawned on first terminal WebSocket connection
- **stdin interception** — PtyManager buffers keystrokes and intercepts Enter to inject selection context; the context prefix is invisible in xterm.js display (line is erased and rewritten)
- **MCP callback architecture** — The MCP server runs as a child process of Claude CLI (spawned via `--mcp-config mcp-config.json`). It communicates with Claude over stdin/stdout (JSON-RPC) and with the Express server over HTTP
- **`DISABLE_PTY=1`** — Environment variable that makes the terminal WebSocket send a test-mode message instead of spawning Claude CLI; used by Playwright integration tests
- **Backend is plain JS (ES modules)** — Only the frontend and tests use TypeScript

## Project Structure

- `src/` — React frontend (TypeScript): `App.tsx` (state + layout), `components/SvgPreview.tsx` (SVG render + drag selection + element detection), `components/Terminal.tsx` (xterm.js wrapper)
- `server/` — Node.js backend (JavaScript ES modules): `index.js` (Express + dual WebSocket servers), `pty-manager.js` (Claude CLI PTY lifecycle + stdin interception), `mcp-server.js` (MCP `draw_svg` tool implementation)
- `e2e/integration/` — Playwright tests that run with PTY disabled (30s timeout, 1 retry)
- `e2e/full-flow/` — Playwright tests requiring real Claude CLI (120s timeout, 0 retries)
- `mcp-config.json` — MCP server config passed to Claude CLI via `--mcp-config`
- `docs/plans/` — Original design and implementation plan documents

## Testing

Playwright has two projects configured in `playwright.config.ts`:
- **integration** — `e2e/integration/`, auto-starts server with `DISABLE_PTY=1`, 30s timeout
- **full-flow** — `e2e/full-flow/`, requires manual server start with real PTY, 120s timeout

Test fixtures are in `e2e/fixtures.ts` (extends Playwright with APIRequestContext) and `e2e/helpers/svg-samples.ts`.
