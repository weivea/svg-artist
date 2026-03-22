# SVG Artist - Design Document

## Overview

SVG Artist is a web-based drawing tool powered by Claude Code. Users interact with a Claude Code terminal to describe what they want to draw, and Claude generates SVG artwork in real-time. The application features a split-pane UI with live SVG preview on the left and a full Claude Code terminal on the right.

## Architecture

### High-Level Diagram

```
React Frontend (:3000)
├── SVG Preview (left pane) - live rendering + region selection
└── xterm.js Terminal (right pane) - full Claude Code PTY proxy

         │ WebSocket A (SVG updates)
         │ WebSocket B (PTY data stream)
         ▼
Node.js Backend
├── Express - static files + MCP callback endpoint
├── WebSocket Server - dual channel (SVG + PTY)
├── PTY Manager - node-pty spawn claude process, stdin interception
└── MCP Server - draw_svg tool, HTTP callback to main process

         │ PTY
         ▼
Claude Code CLI (long-running session)
├── --mcp-config mcp-config.json
├── --system-prompt "You are an SVG artist..."
└── --allowedTools "mcp__svg-artist__*"
```

### Components

**React Frontend**
- **SvgPreview**: Renders SVG content, supports mouse drag to select rectangular regions. Detects SVG elements within selection using `getBBox()` intersection.
- **Terminal**: xterm.js component connected to backend PTY via WebSocket. Full Claude Code CLI experience including colors, spinners, tool call display, permission prompts.
- **SelectionInfo**: Displays selected region coordinates and detected SVG elements.

**Node.js Backend**
- **Express Server**: Serves React static files. Provides `POST /api/svg` endpoint for MCP Server callback.
- **PTY Manager**: Uses `node-pty` to spawn Claude Code in a real pseudo-terminal. Proxies PTY stdout to WebSocket B (to xterm.js) and WebSocket B input to PTY stdin. Intercepts user input on Enter to inject selection context if a region is selected.
- **MCP Server**: Standalone process spawned by Claude Code via mcp-config.json. Provides `draw_svg` tool. When invoked, saves SVG content and POSTs to main process `/api/svg` endpoint.

### Communication Channels

| Channel | Transport | Direction | Purpose |
|---------|-----------|-----------|---------|
| WebSocket A | ws://:3000/svg | Server → Client | Push SVG updates to preview |
| WebSocket B | ws://:3000/terminal | Bidirectional | PTY data stream (xterm.js ↔ node-pty) |
| HTTP callback | POST /api/svg | MCP Server → Main process | Notify SVG update from draw_svg tool |
| PTY stdio | stdin/stdout | Main process ↔ Claude CLI | Terminal I/O |
| MCP stdio | stdin/stdout | Claude CLI ↔ MCP Server | Tool invocation |

### Data Flows

**Normal conversation:**
1. User types in xterm.js
2. Keystrokes → WebSocket B → PTY Manager → node-pty stdin
3. Claude processes and responds
4. node-pty stdout → PTY Manager → WebSocket B → xterm.js renders

**SVG generation:**
1. Claude calls `draw_svg(svg_content)` MCP tool
2. MCP Server receives call, saves SVG
3. MCP Server POSTs SVG to `http://localhost:3000/api/svg`
4. Express handler pushes SVG via WebSocket A
5. React SvgPreview re-renders with new SVG

**Region-selected modification:**
1. User drags rectangle on SVG preview
2. Frontend detects intersecting SVG elements via `getBBox()`
3. SelectionInfo bar shows: "Selected: eye-left, eye-right"
4. Selection state (coords + elements) sent to backend via WebSocket A
5. User types in xterm: "change to blue"
6. PTY Manager intercepts Enter keystroke
7. Prepends selection context before user input:
   ```
   [Selected region x:120 y:80 w:60 h:40
    Elements in region:
    - <circle id="eye-left" cx="140" cy="95" r="8"/>
    - <circle id="eye-right" cx="165" cy="95" r="8"/>
    Please only modify these elements]
   change to blue
   ```
8. Writes combined message to PTY stdin
9. xterm.js only shows user's original input "change to blue"

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend framework | React + TypeScript |
| Terminal emulator | xterm.js + @xterm/addon-fit + @xterm/addon-attach |
| SVG rendering | Native SVG DOM |
| Region selection | Native mouse events + SVG getBBox() |
| Build tool | Vite |
| Backend | Node.js + Express |
| PTY | node-pty |
| Real-time communication | ws (WebSocket) |
| MCP Server | @modelcontextprotocol/sdk (stdio mode) |

## Project Structure

```
svg-artist/
├── package.json
├── mcp-config.json              # Claude Code MCP configuration
├── server/
│   ├── index.js                 # Main entry: Express + WebSocket + PTY
│   ├── pty-manager.js           # PTY lifecycle + stdin interception
│   └── mcp-server.js            # MCP Server (draw_svg tool)
├── src/                         # React frontend
│   ├── main.tsx
│   ├── App.tsx                  # Main layout: split panes
│   ├── components/
│   │   ├── SvgPreview.tsx       # SVG render + drag selection
│   │   ├── Terminal.tsx         # xterm.js terminal component
│   │   └── SelectionInfo.tsx    # Selection info bar
│   └── hooks/
│       ├── useWebSocket.ts      # WebSocket connection management
│       └── useSelection.ts      # Selection state management
├── public/
└── vite.config.ts
```

## MCP Server Tools

### draw_svg

```json
{
  "name": "draw_svg",
  "description": "Draw or update the SVG artwork. Pass the complete SVG content.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "svg_content": {
        "type": "string",
        "description": "Complete SVG markup to render"
      }
    },
    "required": ["svg_content"]
  }
}
```

## Startup Sequence

1. `npm start` launches Node.js main process
2. Express server starts, serves React frontend on `:3000`
3. WebSocket servers created (SVG channel + Terminal channel)
4. On first frontend WebSocket B connection:
   - node-pty spawns: `claude --mcp-config mcp-config.json --system-prompt "..." --allowedTools "mcp__svg-artist__*"`
   - PTY stdout piped to WebSocket B
   - WebSocket B input piped to PTY stdin (with interception layer)
5. Claude Code starts, loads MCP Server as subprocess
6. System ready for user interaction
