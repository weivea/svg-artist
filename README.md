# SVG Artist

A web-based SVG drawing tool powered by Claude Code. Describe the artwork you want in natural language, and Claude generates SVG content in real-time.

The application features a split-pane UI:
- **Left pane** — Live SVG preview with interactive region selection
- **Right pane** — Full Claude Code terminal interface

## Features

- 🎨 **Natural Language Drawing** — Describe what you want, Claude creates the SVG
- 🖼️ **Live Preview** — SVG updates rendered instantly in the browser
- ✏️ **Region Selection** — Click and drag to select regions; your selection context is automatically injected into prompts so Claude can modify specific elements
- 💻 **Full Terminal** — Embedded xterm.js terminal with complete Claude Code access
- 🔄 **Real-time Sync** — WebSocket-based communication for instant updates

## Prerequisites

- **Node.js** v24.12.0+
- **npm** v11.6.2+
- **Claude CLI** installed and available in `PATH`

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd svg-artist

# Install dependencies
npm install

# Start in development mode (frontend + backend)
npm run dev
```

The app will be available at `http://localhost:5173` (dev mode) or `http://localhost:3000` (production mode).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both frontend (Vite) and backend concurrently |
| `npm run dev:frontend` | Start Vite dev server only (port 5173) |
| `npm run dev:server` | Start backend server only (port 3000) |
| `npm start` | Build frontend and start production server |
| `npm run build` | Build the frontend for production |
| `npm run test` | Run integration tests |
| `npm run test:e2e` | Run all E2E tests (requires Claude CLI) |
| `npm run test:full` | Run full-flow E2E tests (120s timeout) |

## Project Structure

```
svg-artist/
├── src/                        # React frontend (TypeScript)
│   ├── App.tsx                 # Main app — split-pane layout
│   ├── components/
│   │   ├── SvgPreview.tsx      # SVG display + region selection
│   │   └── Terminal.tsx        # xterm.js terminal wrapper
│   └── hooks/
│       └── useWebSocket.ts     # WebSocket utility hook
│
├── server/                     # Node.js backend
│   ├── index.js                # Express server + WebSocket setup
│   ├── mcp-server.js           # MCP server (draw_svg tool)
│   └── pty-manager.js          # PTY management + stdin interception
│
├── e2e/                        # Playwright end-to-end tests
│   ├── integration/            # Integration tests
│   ├── full-flow/              # Full flow tests (Claude CLI required)
│   └── helpers/                # Test fixtures and SVG samples
│
├── docs/plans/                 # Design & implementation documents
├── mcp-config.json             # MCP server configuration
├── vite.config.ts              # Vite build configuration
└── playwright.config.ts        # Playwright test configuration
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                       │
│  ┌──────────────────┐  ┌──────────────────────┐ │
│  │   SVG Preview    │  │   xterm.js Terminal   │ │
│  │  (region select) │  │   (Claude Code CLI)   │ │
│  └────────┬─────────┘  └──────────┬───────────┘ │
└───────────┼────────────────────────┼─────────────┘
            │ WebSocket /ws/svg      │ WebSocket /ws/terminal
            ▼                        ▼
┌─────────────────────────────────────────────────┐
│              Express Server (:3000)             │
│  ┌──────────────┐  ┌─────────────────────────┐  │
│  │  SVG State   │  │     PTY Manager         │  │
│  │  + Callback  │  │  (stdin interception)   │  │
│  └──────────────┘  └─────────────────────────┘  │
│         ▲                       │               │
│         │ POST /api/svg         │ spawns        │
│  ┌──────┴───────┐               ▼               │
│  │  MCP Server  │◄────── Claude CLI Process     │
│  │  (draw_svg)  │                               │
│  └──────────────┘                               │
└─────────────────────────────────────────────────┘
```

**Key flows:**

1. User types a prompt in the terminal → PTY Manager forwards it to Claude CLI
2. Claude calls the `draw_svg` MCP tool → MCP Server posts SVG to `/api/svg`
3. Server broadcasts the SVG update via `/ws/svg` → SVG Preview re-renders
4. User selects a region in the preview → selection context is injected into the next prompt automatically

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, xterm.js
- **Backend:** Node.js, Express 5, node-pty, WebSocket (ws)
- **Testing:** Playwright
- **Protocol:** MCP (Model Context Protocol)

## License

ISC
