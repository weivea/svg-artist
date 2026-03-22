# SVG Artist

A web-based SVG drawing tool powered by Claude Code. Describe the artwork you want in natural language, and Claude generates SVG content in real-time.

## Features

- **Natural Language Drawing** — Describe what you want, Claude creates the SVG
- **Multi-Session** — Create multiple independent drawings, each with its own Claude CLI instance
- **Live Preview** — SVG updates rendered instantly in the browser
- **Region Selection** — Click and drag to select regions; your selection context is automatically injected into prompts so Claude can modify specific elements
- **Session Persistence** — Close a drawing and come back later; Claude remembers your conversation
- **History Gallery** — Browse and manage your previous drawings with SVG thumbnails
- **Full Terminal** — Embedded xterm.js terminal with complete Claude Code access
- **Real-time Sync** — WebSocket-based communication for instant updates

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

1. Open the app — you'll see the **Home** page
2. Click **"+ Create New Drawing"** to start a new canvas
3. Describe your artwork in the terminal on the right
4. Watch the SVG preview update in real-time on the left
5. Use **region selection** (click and drag) to tell Claude which elements to modify
6. Click **"Back"** to return to the homepage and see your drawing in the history

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
│   ├── main.tsx                # Entry point with HashRouter
│   ├── App.tsx                 # Route container
│   ├── pages/
│   │   ├── HomePage.tsx        # Landing page — create + history gallery
│   │   └── DrawPage.tsx        # Canvas page — SVG preview + terminal
│   └── components/
│       ├── SvgPreview.tsx      # SVG display + region selection
│       ├── Terminal.tsx        # xterm.js terminal wrapper
│       └── DrawingCard.tsx     # History card with SVG thumbnail
│
├── server/                     # Node.js backend (ES modules)
│   ├── index.js                # Express + multi-session WebSocket routing
│   ├── session-manager.js      # Manages Map<drawId, PtyManager>
│   ├── pty-manager.js          # PTY lifecycle + stdin interception
│   ├── drawing-store.js        # JSON-file CRUD for drawings
│   └── mcp-server.js           # MCP server (18 layer/canvas/preview tools)
│
├── data/                       # Runtime data (gitignored)
│   └── drawings.json           # Persisted drawings + SVG content
│
├── e2e/                        # Playwright end-to-end tests
│   ├── integration/            # Integration tests (6 spec files, 23 tests)
│   ├── full-flow/              # Full flow tests (Claude CLI required)
│   └── helpers/                # Test fixtures, SVG samples, navigation helpers
│
├── docs/plans/                 # Design & implementation documents
├── mcp-config.json             # MCP server configuration
├── vite.config.ts              # Vite build configuration
└── playwright.config.ts        # Playwright test configuration
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │          HomePage (/#/)                         │    │
│  │  [+ Create] [Drawing 1] [Drawing 2] [Drawing 3]│    │
│  └──────────────────────┬──────────────────────────┘    │
│                         │ navigate                      │
│  ┌──────────────────────▼──────────────────────────┐    │
│  │          DrawPage (/#/draw/:drawId)             │    │
│  │  ┌──────────────────┐  ┌──────────────────────┐ │    │
│  │  │   SVG Preview    │  │   xterm.js Terminal   │ │    │
│  │  │  (region select) │  │   (Claude Code CLI)   │ │    │
│  │  └────────┬─────────┘  └──────────┬───────────┘ │    │
│  └───────────┼────────────────────────┼─────────────┘    │
└──────────────┼────────────────────────┼──────────────────┘
               │ WS /ws/svg/:drawId    │ WS /ws/terminal/:drawId
               ▼                        ▼
┌─────────────────────────────────────────────────────────┐
│              Express Server (:3000)                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────────────────────────┐ │
│  │ DrawingStore  │  │      SessionManager              │ │
│  │ (drawings.json│  │  Map<drawId, PtyManager>         │ │
│  │  CRUD + SVG) │  │  ├── drawId_1 → PtyManager_1    │ │
│  └──────────────┘  │  ├── drawId_2 → PtyManager_2    │ │
│         ▲           │  └── ...                         │ │
│         │           └──────────────────────────────────┘ │
│         │                         │ spawns per drawId   │
│         │                         ▼                     │
│         │            Claude CLI Process (per drawing)   │
│         │              ├── MCP Server (18 tools)        │
│         │              └── layer/canvas/preview ops     │
│         │                         │                     │
│         │  POST /api/svg/:drawId/*│                     │
│         └─────────────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

**Key flows:**

1. User clicks "Create New Drawing" → `POST /api/drawings` → navigate to `/#/draw/:drawId`
2. DrawPage opens → WebSocket connects to `/ws/terminal/:drawId` → SessionManager spawns Claude CLI
3. User types a prompt → PtyManager forwards it to Claude CLI
4. Claude calls layer MCP tools (add_layer, update_layer, etc.) → MCP Server posts to `/api/svg/:drawId/layers/*`
5. Server broadcasts the SVG update via `/ws/svg/:drawId` → SVG Preview re-renders
6. User selects a region → selection context injected into the next prompt automatically
7. User closes tab → Claude CLI process killed after 2s grace period
8. User reopens from history → `claude --resume <sessionId>` restores conversation context

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, React Router, xterm.js
- **Backend:** Node.js, Express 5, node-pty, WebSocket (ws)
- **Persistence:** JSON file (`data/drawings.json`), nanoid for IDs
- **Testing:** Playwright (23 integration tests)
- **Protocol:** MCP (Model Context Protocol)

## License

ISC
