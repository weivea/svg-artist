# SVG Preview Zoom & Pan Design

## Summary

Add zoom (scroll wheel) and pan (spacebar + drag) to the SvgPreview component, and change the default canvas viewBox from 800x600 to 800x800.

## Requirements

- Default viewBox: 800x800 (was 800x600)
- Scroll wheel: zoom in/out centered on mouse position
- Spacebar + drag: pan the canvas
- Plain drag: unchanged (region selection)
- Double-click: reset to initial view (scale=1, translate=0,0)
- Cursor feedback: grab/grabbing during pan, crosshair during selection

## Approach: CSS Transform

Apply `transform: scale() translate()` on the SVG container div. This keeps SVG content untouched — zoom/pan is purely a display-layer concern. No backend changes needed beyond the default viewBox update.

### State

```typescript
const [scale, setScale] = useState(1)
const [translate, setTranslate] = useState({ x: 0, y: 0 })
const [isPanning, setIsPanning] = useState(false)
```

### Interactions

| Input | Behavior |
|-------|----------|
| Scroll wheel | Scale ×1.1 or ÷1.1, centered on mouse position. Range: 0.1x–10x |
| Space + drag | Translate canvas. Cursor: grab → grabbing |
| Drag (no space) | Region selection (existing behavior) |
| Double-click | Reset scale=1, translate={0,0} |

### Coordinate Transform

Region selection mouse positions must account for scale and translate:

```
svgX = (mouseX - containerLeft - translate.x) / scale
svgY = (mouseY - containerTop - translate.y) / scale
```

### Files Changed

1. `server/drawing-store.ts` — DEFAULT_SVG viewBox to 800x800
2. `src/pages/DrawPage.tsx` — Fallback SVG viewBox to 800x800
3. `src/components/SvgPreview.tsx` — Add zoom/pan state, event handlers, coordinate transforms
4. `src/App.css` — Cursor styles for pan mode, transform-origin on container

### Not Changed

- Backend SVG engine, MCP tools, WebSocket protocol — untouched
- SVG content itself — never modified by zoom/pan
- Container overflow: hidden — maintained (clips zoomed content)
