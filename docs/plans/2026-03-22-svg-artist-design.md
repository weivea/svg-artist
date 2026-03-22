# SVG Artist - Design Document

## Overview

SVG Artist is a web-based drawing tool powered by Claude Code. Users interact with a Claude Code terminal to describe what they want to draw, and Claude generates SVG artwork in real-time. The application features a split-pane UI with live SVG preview on the left and a full Claude Code terminal on the right.

## Architecture

### Overall Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     React Frontend (:3000)                    │
│                                                              │
│  ┌───────────────────────────┬─────────────────────────────┐ │
│  │   SVG Preview (left)      │   xterm.js Terminal (right)  │ │
│  │                           │                             │ │
│  │  ┌─────────────────────┐  │   Human: Draw a cat          │ │
│  │  │    🐱                │  │   ● Calling draw_svg...      │ │
│  │  │  ┌─ ─ ─ ─ ┐        │  │   Done! Here's your cat~     │ │
│  │  │  │ select  │        │  │                             │ │
│  │  │  └─ ─ ─ ─ ┘        │  │   Human: Make eyes blue      │ │
│  │  │                     │  │   (backend auto-injects      │ │
│  │  └─────────────────────┘  │    selection context)        │ │
│  │                           │                             │ │
│  │  Info: selected eye-left  │                             │ │
│  │  [🖱️ Select] [↩️ Clear]   │                             │ │
│  └───────────────────────────┴─────────────────────────────┘ │
│                                                              │
│  WebSocket A (SVG updates)    WebSocket B (PTY data stream)  │
└───────┬──────────────────────────────┬───────────────────────┘
        │                              │
┌───────▼──────────────────────────────▼───────────────────────┐
│                   Node.js Backend                            │
│                                                              │
│  ┌─────────┐    ┌──────────────────────────────────────────┐ │
│  │ Express  │    │  PTY Manager                             │ │
│  │          │    │                                          │ │
│  │ /api/svg │    │  node-pty spawn claude process           │ │
│  │ (MCP     │    │  PTY stdout ──→ WebSocket B ──→ xterm.js │ │
│  │ callback)│    │  xterm.js ──→ WebSocket B ──→ Intercept  │ │
│  │    │     │    │                                ──→ stdin  │ │
│  │    ▼     │    │              ┌─────────────────┐         │ │
│  │ WebSocket│    │              │ stdin Interceptor│         │ │
│  │ A: push  │    │              │                 │         │ │
│  │ SVG to   │    │              │ if selection:   │         │ │
│  │ frontend │    │              │   prepend region│         │ │
│  │          │    │              │   + elements    │         │ │
│  │          │    │              │   context       │         │ │
│  │          │    │              └─────────────────┘         │ │
│  └─────────┘    └─────────────────┬────────────────────────┘ │
│                                   │ PTY                      │
│                                   ▼                          │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  claude --mcp-config mcp-config.json                  │   │
│  │         --system-prompt "You are an SVG artist..."    │   │
│  │         --allowedTools "mcp__svg-artist__*"           │   │
│  │                                                       │   │
│  │  (runs in real PTY, all colors/formatting preserved)  │   │
│  │                                                       │   │
│  │  calls draw_svg ──→ MCP Server (child process)        │   │
│  │                       │                               │   │
│  │                       POST http://localhost:3000       │   │
│  │                       /api/svg ────────────────────────┼───┘
│  └───────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────┘
```

### Startup Sequence Diagram

```
npm start
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│  Node.js Main Process                                    │
│                                                          │
│  Step 1: Start Express Server                            │
│          → Serve React static files (from dist/)         │
│          → Register POST /api/svg endpoint               │
│          → Listen on http://localhost:3000                │
│                                                          │
│  Step 2: Create WebSocket Servers                        │
│          → ws://:3000/ws/svg      (SVG update channel)   │
│          → ws://:3000/ws/terminal (PTY data channel)     │
│                                                          │
│  Step 3: On first terminal WebSocket connection          │
│          → node-pty spawns claude CLI in real PTY         │
│          → PTY stdout piped to WebSocket B               │
│          → WebSocket B input piped to PTY stdin           │
│          → stdin interceptor installed                    │
│                                                          │
│  Step 4: Claude Code loads MCP Server                    │
│          → Reads mcp-config.json                         │
│          → Spawns: node server/mcp-server.js             │
│          → MCP Server registers draw_svg tool            │
│                                                          │
│  ✅ Ready! User interacts via browser                    │
└──────────────────────────────────────────────────────────┘
```

### Data Flow Diagrams

**Normal Conversation:**
```
User types in xterm.js
    │ keystroke
    ▼
WebSocket B ──→ PTY Manager ──→ node-pty stdin ──→ Claude Code
                                                       │
Claude responds                                        │
    │ stdout                                           │
    ▼                                                  │
node-pty stdout ──→ PTY Manager ──→ WebSocket B ──→ xterm.js renders
```

**SVG Generation:**
```
Claude calls draw_svg(svg_content)
    │ MCP stdio
    ▼
MCP Server receives tool call
    │
    ├──→ POST http://localhost:3000/api/svg
    │         │
    │         ▼
    │    Express handler
    │         │
    │         ▼
    │    WebSocket A broadcast ──→ React SvgPreview re-renders
    │
    └──→ Return success to Claude
```

**Region-Selected Modification:**
```
User drags rectangle on SVG preview
    │
    ▼
Frontend detects intersecting SVG elements (getBBox)
    │
    ├──→ SelectionInfo bar: "Selected: eye-left, eye-right"
    │
    └──→ WebSocket A: send selection data to backend
              │
              ▼
         PTY Manager stores selection context

User types in xterm: "make it blue"  →  presses Enter
    │
    ▼
PTY Manager stdin interceptor
    │
    ├── selection context exists?
    │   YES: prepend "[Selected region x:120 y:80 w:60 h:40
    │         Elements: eye-left, eye-right
    │         Please only modify these elements]"
    │         + user input "make it blue"
    │         → write to PTY stdin
    │         → clear selection
    │
    └── xterm.js only shows: "make it blue" (context is transparent)
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

