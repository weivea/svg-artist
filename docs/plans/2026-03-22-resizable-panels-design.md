# Resizable Split Panels Design

## Goal

Allow users to drag the divider between the SVG preview pane and the terminal pane to dynamically adjust their widths. The terminal content must remain correctly formatted after resizing.

## Current State

DrawPage renders two sibling `<div>`s (`.svg-pane` and `.terminal-pane`) inside `.draw-content`, each set to `flex: 1` for a fixed 50/50 split. The Terminal component already uses a `ResizeObserver` + `FitAddon` to re-fit xterm.js when its container size changes, and sends a `resize` message to the PTY backend via WebSocket.

## Design

### Interaction

- A **4-6px wide draggable divider** sits between the two panes.
- Hover: divider changes color + `col-resize` cursor.
- Drag: pane widths update **in real-time** following the mouse (throttled to ~60fps).
- Double-click divider: reset to 50/50.
- **Min width constraint:** each pane must be at least 20% of the container width.
- **Persistence:** panel ratio saved to `localStorage` under key `svg-artist:panel-ratio`, restored on page load.

### Implementation

**New file — `src/hooks/useResizablePanels.ts`:**
- Custom hook managing drag state, ratio calculation, and localStorage persistence.
- Listens for `mousedown` on divider, `mousemove`/`mouseup` on `document`.
- Throttles ratio updates to ~16ms (requestAnimationFrame).
- Sets `user-select: none` on `<body>` during drag to prevent text selection.
- Returns: `{ ratio, dividerProps, containerRef }`.

**Modified — `src/pages/DrawPage.tsx`:**
- Import and call `useResizablePanels` hook.
- Insert a `<div className="pane-divider" {...dividerProps} />` between svg-pane and terminal-pane.
- Apply `flex-basis` from `ratio` to each pane via inline style.

**Modified — `src/App.css` (or `DrawPage.css`):**
- Add `.pane-divider` styles: width, background, hover state, cursor.
- Remove `flex: 1` from `.svg-pane` and `.terminal-pane` (replaced by dynamic flex-basis).

### Terminal Content Integrity

The existing `ResizeObserver` → `fitAddon.fit()` → WebSocket `resize` chain handles terminal re-fitting automatically. Additional safeguards:

1. During drag, set `pointer-events: none` on the terminal container to prevent xterm from capturing mouse events.
2. `ResizeObserver` inherently rate-limits callbacks, but the hook also throttles DOM updates via `requestAnimationFrame`.
3. On drag end (`mouseup`), trigger one final fit to ensure the terminal dimensions match the final pane size exactly.

### Files Changed

| File | Change |
|------|--------|
| `src/hooks/useResizablePanels.ts` | New — drag logic, throttle, localStorage |
| `src/pages/DrawPage.tsx` | Add divider element, use hook, apply dynamic widths |
| `src/App.css` or `src/pages/DrawPage.css` | Divider styles, update pane flex rules |
