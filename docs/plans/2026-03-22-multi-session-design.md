# Multi-Session Architecture Design

## Problem

The current SVG Artist architecture uses a single PtyManager (one Claude CLI instance). Multiple browser tabs share the same PTY, SVG state, and selection context. There is no concept of separate drawings or sessions.

## Requirements

- FRE (First Run Experience) landing page with "create new drawing" + history list
- Each drawing gets its own route (`/draw/:drawId`) and independent Claude CLI instance
- Persist SVG content, metadata, and Claude session ID in a JSON file
- Close tab → kill Claude process immediately; reopen → resume conversation via `claude --resume`
- No limit on concurrent active drawings
- Auto-generated titles (timestamp), support delete from history
- Same drawId opened in multiple tabs: SVG preview shared, terminal exclusive to one tab

## Architecture: Path-Parameter Isolation (Option A)

### Frontend Routing

React Router (hash mode), two routes:

```
/              → HomePage (FRE)
/draw/:drawId  → DrawPage (canvas)
```

### HomePage

- "Create New Drawing" button → `POST /api/drawings` → navigate to `/draw/:newId`
- History grid: cards with SVG thumbnail + title + delete button
- Delete → `DELETE /api/drawings/:drawId`

### DrawPage

Same layout as current App (left SVG preview + right terminal), plus:
- Top bar with back button and drawing title
- WebSocket paths include drawId: `/ws/svg/:drawId`, `/ws/terminal/:drawId`
- Cleanup on unmount / route change

## Backend

### Data Persistence

Single file `data/drawings.json`:

```json
{
  "drawings": [
    {
      "id": "a1b2c3d4",
      "title": "绘画 2026-03-22 14:30",
      "createdAt": "2026-03-22T06:30:00.000Z",
      "updatedAt": "2026-03-22T06:45:00.000Z",
      "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "svgContent": "<svg>...</svg>"
    }
  ]
}
```

- `id`: short ID (nanoid 8 chars) for URL routing
- `sessionId`: full UUID for Claude CLI `--session-id` / `--resume`
- `svgContent`: latest SVG, updated on every MCP callback

### REST API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/drawings` | List all drawings (with svgContent for thumbnails) |
| POST | `/api/drawings` | Create new drawing, returns `{ id, sessionId, ... }` |
| DELETE | `/api/drawings/:drawId` | Delete drawing + kill active process |
| POST | `/api/svg/:drawId` | MCP callback (updated from `/api/svg`) |

### SessionManager

Replaces the singleton PtyManager:

```
SessionManager
├── sessions: Map<drawId, PtyManager>
├── getOrCreate(drawId, sessionId) → PtyManager
│   └── spawn: claude --resume <sessionId> --mcp-config ...
│       env: SVG_CALLBACK_URL=http://localhost:3000/api/svg/<drawId>
├── destroy(drawId) → kill process, remove from Map
└── destroyAll() → cleanup on server shutdown
```

### Claude CLI Parameters

First creation:
```
claude --session-id <sessionId> \
       --mcp-config mcp-config.json \
       --system-prompt "You are an SVG artist..." \
       --allowedTools mcp__svg-artist__draw_svg
```

Resume (reopening from history):
```
claude --resume <sessionId> \
       --mcp-config mcp-config.json \
       --allowedTools mcp__svg-artist__draw_svg
```

### WebSocket Routing

Upgrade handler extracts drawId from path:

- `/ws/svg/:drawId` → add to `svgClients: Map<drawId, Set<WebSocket>>`
- `/ws/terminal/:drawId` → `SessionManager.getOrCreate()` then `ptyManager.attachWebSocket()`

SVG broadcast is per-drawId (only clients watching that drawing receive updates).

### MCP Server

No code changes. Already reads `process.env.SVG_CALLBACK_URL`. Each Claude CLI instance gets a different URL via env var.

## Error Handling

| Scenario | Handling |
|----------|----------|
| Claude CLI unexpected exit | PtyManager detects exit → notify terminal → remove from SessionManager |
| WebSocket disconnect, process alive | 2-second grace period, then kill if no reconnect |
| drawings.json write failure | Atomic write (temp file + rename), log error |
| Delete while process active | Kill process first, then delete record |
| Same drawId in multiple tabs | SVG: both tabs receive updates. Terminal: second tab gets "terminal already open in another tab" message, no PTY attach |

## Lifecycle

```
Create:  POST /api/drawings → generate id + sessionId → write JSON → return id
Enter:   /draw/:drawId → WS connect → SessionManager.getOrCreate() → spawn CLI
Draw:    Claude → draw_svg → MCP POST /api/svg/:drawId → update JSON → broadcast
Leave:   WS disconnect → SessionManager.destroy() → kill CLI process
Reopen:  /draw/:drawId → SessionManager.getOrCreate() → claude --resume → load SVG from JSON
Delete:  DELETE /api/drawings/:drawId → kill if active → remove from JSON
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/main.tsx` | Modify | Add HashRouter + route config |
| `src/pages/HomePage.tsx` | New | FRE page: create button + history grid |
| `src/pages/DrawPage.tsx` | New | Canvas page, extracted from App.tsx |
| `src/components/TopBar.tsx` | New | Navigation bar: back + title |
| `src/components/DrawingCard.tsx` | New | History list card component |
| `src/App.tsx` | Modify | Simplify to route container |
| `src/components/Terminal.tsx` | Minor | wsUrl as prop instead of hardcoded |
| `server/index.js` | Modify | Multi-instance WebSocket routing + REST API |
| `server/pty-manager.js` | Modify | Support resume + dynamic callback URL in spawn |
| `server/session-manager.js` | New | Manage multiple PtyManager instances |
| `server/drawing-store.js` | New | drawings.json CRUD with atomic writes |
| `server/mcp-server.js` | No change | — |

## New Dependencies

- `react-router-dom` — frontend routing
- `nanoid` — short ID generation

## Testing

| Test File | Coverage |
|-----------|----------|
| `e2e/integration/homepage.spec.ts` | FRE render, create drawing, history list, delete |
| `e2e/integration/drawing-api.spec.ts` | REST API CRUD |
| `e2e/integration/multi-session.spec.ts` | Two drawId SVG updates isolated |
| Existing tests | Update route paths and WebSocket URLs |
