# SVG Preview Zoom & Pan Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add zoom (scroll wheel) and pan (spacebar + drag) to SvgPreview, change default viewBox to 800×800.

**Architecture:** CSS `transform: scale() translate()` on an inner wrapper div inside `.svg-preview-container`. Zoom/pan state lives in SvgPreview component. The `screenToSvg` coordinate conversion accounts for scale/translate so region selection continues to work. Default viewBox updated in backend (drawing-store) and frontend (DrawPage fallback), plus backend fallback strings.

**Tech Stack:** React (useState, useEffect, useCallback, useRef), CSS transforms, Playwright E2E tests.

---

### Task 1: Update default viewBox to 800×800

**Files:**
- Modify: `server/drawing-store.ts:12` — DEFAULT_SVG viewBox and rect/text coordinates
- Modify: `src/pages/DrawPage.tsx:8` — Frontend fallback DEFAULT_SVG
- Modify: `server/svg-engine.ts:356` — Fallback viewBox string
- Modify: `server/png-renderer.ts:30` — Fallback viewBox string

**Step 1: Update backend DEFAULT_SVG**

In `server/drawing-store.ts`, change line 12:

```typescript
const DEFAULT_SVG = '<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"><defs></defs><g id="layer-bg" data-name="background"><rect width="800" height="800" fill="#f5f5f5"/></g><g id="layer-content" data-name="content"><text x="400" y="400" text-anchor="middle" fill="#999" font-size="24">Waiting for artwork...</text></g></svg>';
```

Changes: viewBox `600` → `800`, rect height `600` → `800`, text y `300` → `400`.

**Step 2: Update frontend fallback SVG**

In `src/pages/DrawPage.tsx`, change line 8:

```typescript
const DEFAULT_SVG = '<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"><text x="400" y="400" text-anchor="middle" fill="#666" font-size="24">Waiting for artwork...</text></svg>';
```

Changes: viewBox `600` → `800`, text y `300` → `400`.

**Step 3: Update backend fallback viewBox strings**

In `server/svg-engine.ts:356`, change the fallback:
```typescript
const current = (this.svgElement.getAttribute('viewBox') || '0 0 800 800').split(/\s+/).map(Number);
```

In `server/png-renderer.ts:30`, change the fallback:
```typescript
const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 800 800';
```

**Step 4: Run existing tests to verify nothing broke**

Run: `npx playwright test --project=integration`
Expected: All tests PASS. The layer-api test checks viewBox of LAYERED_SCENE (which is its own SVG, not default), so it should still pass.

**Step 5: Commit**

```bash
git add server/drawing-store.ts src/pages/DrawPage.tsx server/svg-engine.ts server/png-renderer.ts
git commit -m "chore: change default viewBox from 800x600 to 800x800"
```

---

### Task 2: Add zoom/pan state and CSS transform to SvgPreview

**Files:**
- Modify: `src/components/SvgPreview.tsx` — Add state, wrapper div, transform style
- Modify: `src/App.css:31-34` — SVG sizing within transformed wrapper

**Step 1: Add zoom/pan state variables**

In `SvgPreview.tsx`, add these state and ref declarations after the existing state (after line 20):

```typescript
// Zoom & pan state
const [scale, setScale] = useState(1);
const [translate, setTranslate] = useState({ x: 0, y: 0 });
const [isPanning, setIsPanning] = useState(false);    // spacebar held
const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
const scaleRef = useRef(scale);
const translateRef = useRef(translate);
```

Add effects to keep refs in sync (needed for event listeners):

```typescript
useEffect(() => { scaleRef.current = scale; }, [scale]);
useEffect(() => { translateRef.current = translate; }, [translate]);
```

**Step 2: Restructure the render to use a wrapper div**

Replace the return statement. The outer container handles mouse events for selection, and an inner wrapper div applies the CSS transform:

```tsx
// Compute cursor
const cursor = isPanning
  ? (panStart ? 'grabbing' : 'grab')
  : (isDragging ? 'crosshair' : 'default');

return (
  <div
    ref={containerRef}
    className="svg-preview-container"
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onWheel={handleWheel}
    onDoubleClick={handleDoubleClick}
    style={{ flex: 1, cursor, overflow: 'hidden', position: 'relative' }}
  >
    <div
      className="svg-transform-wrapper"
      style={{
        transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
        transformOrigin: '0 0',
        width: '100%',
        height: '100%',
      }}
      dangerouslySetInnerHTML={{ __html: svgWithOverlay }}
    />
  </div>
);
```

**Step 3: Update App.css for the transform wrapper**

In `src/App.css`, change the SVG selector to target the wrapper's SVG:

```css
.svg-transform-wrapper svg {
  width: 100%;
  height: 100%;
}
```

(Replace the existing `.svg-preview-container svg` rule at lines 31-34.)

**Step 4: Run dev server, verify SVG renders correctly at default zoom**

Run: `npm run dev:frontend`
Expected: SVG preview renders exactly as before (scale=1, translate=0,0).

**Step 5: Commit**

```bash
git add src/components/SvgPreview.tsx src/App.css
git commit -m "feat: add zoom/pan state and CSS transform wrapper to SvgPreview"
```

---

### Task 3: Implement scroll wheel zoom (mouse-centered)

**Files:**
- Modify: `src/components/SvgPreview.tsx` — Add handleWheel

**Step 1: Add the wheel event handler**

Add this function inside SvgPreview, before the return:

```typescript
const handleWheel = useCallback((e: React.WheelEvent) => {
  e.preventDefault();
  const container = containerRef.current;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  // Mouse position relative to container
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
  const newScale = Math.min(10, Math.max(0.1, scale * zoomFactor));

  // Adjust translate so the point under the mouse stays fixed
  const newTranslateX = mouseX - (mouseX - translate.x) * (newScale / scale);
  const newTranslateY = mouseY - (mouseY - translate.y) * (newScale / scale);

  setScale(newScale);
  setTranslate({ x: newTranslateX, y: newTranslateY });
}, [scale, translate]);
```

**Step 2: Prevent default wheel scroll on the container**

Add a `useEffect` to attach a non-passive wheel listener (React's onWheel can't preventDefault on passive listeners in some browsers):

```typescript
useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const handler = (e: WheelEvent) => {
    e.preventDefault();
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const s = scaleRef.current;
    const t = translateRef.current;
    const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const newScale = Math.min(10, Math.max(0.1, s * zoomFactor));

    const newTranslateX = mouseX - (mouseX - t.x) * (newScale / s);
    const newTranslateY = mouseY - (mouseY - t.y) * (newScale / s);

    setScale(newScale);
    setTranslate({ x: newTranslateX, y: newTranslateY });
  };

  container.addEventListener('wheel', handler, { passive: false });
  return () => container.removeEventListener('wheel', handler);
}, []);
```

Note: Since this uses a native event listener with refs, remove the `onWheel` JSX prop from the container div and remove the React `handleWheel` callback — use only the useEffect approach. This avoids double-handling and the passive event issue.

**Step 3: Test manually**

Run: `npm run dev`
Expected: Scroll wheel zooms in/out centered on mouse position. SVG stays sharp. Min 0.1x, max 10x.

**Step 4: Commit**

```bash
git add src/components/SvgPreview.tsx
git commit -m "feat: implement scroll wheel zoom centered on mouse position"
```

---

### Task 4: Implement spacebar + drag panning

**Files:**
- Modify: `src/components/SvgPreview.tsx` — Add keyboard listeners, modify mouse handlers

**Step 1: Add keyboard listeners for spacebar**

Add a `useEffect` for keydown/keyup to track spacebar state:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      setIsPanning(true);
    }
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      setIsPanning(false);
      setPanStart(null);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, []);
```

**Step 2: Modify handleMouseDown to support panning**

When `isPanning` is true, start pan instead of selection:

```typescript
const handleMouseDown = (e: React.MouseEvent) => {
  if (e.button !== 0) return;
  if (isPanning) {
    // Start pan
    setPanStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
    return;
  }
  // Existing selection logic
  const pos = screenToSvg(e.clientX, e.clientY);
  setDragStart(pos);
  setIsDragging(true);
  setSelection(null);
  onSelectionChange(null);
};
```

**Step 3: Modify handleMouseMove to support panning**

When panning, update translate:

```typescript
const handleMouseMove = (e: React.MouseEvent) => {
  if (isPanning && panStart) {
    setTranslate({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
    return;
  }
  // Existing selection logic
  if (!isDragging || !dragStart) return;
  const pos = screenToSvg(e.clientX, e.clientY);
  setSelection({
    x: Math.min(dragStart.x, pos.x),
    y: Math.min(dragStart.y, pos.y),
    width: Math.abs(pos.x - dragStart.x),
    height: Math.abs(pos.y - dragStart.y),
  });
};
```

**Step 4: Modify handleMouseUp to clear pan state**

```typescript
const handleMouseUp = () => {
  if (isPanning) {
    setPanStart(null);
    return;
  }
  // Existing selection logic
  setIsDragging(false);
  if (selection && selection.width > 5 && selection.height > 5) {
    const elements = detectElements(selection);
    const selectionData: SelectionData = { region: selection, elements };
    onSelectionChange(selectionData);
  }
};
```

**Step 5: Test manually**

Run: `npm run dev`
Expected: Hold spacebar → cursor becomes `grab`. Drag while holding spacebar → canvas pans, cursor is `grabbing`. Release spacebar → back to normal mode. Normal drag still does region selection.

**Step 6: Commit**

```bash
git add src/components/SvgPreview.tsx
git commit -m "feat: implement spacebar + drag panning for SvgPreview"
```

---

### Task 5: Implement double-click to reset view

**Files:**
- Modify: `src/components/SvgPreview.tsx` — Add handleDoubleClick

**Step 1: Add double-click handler**

```typescript
const handleDoubleClick = useCallback(() => {
  setScale(1);
  setTranslate({ x: 0, y: 0 });
}, []);
```

Add `onDoubleClick={handleDoubleClick}` to the container div JSX (this was already included in Task 2's render template).

**Step 2: Test manually**

Run: `npm run dev`
Expected: Zoom in, then double-click → view resets to scale=1, translate=0,0.

**Step 3: Commit**

```bash
git add src/components/SvgPreview.tsx
git commit -m "feat: double-click to reset zoom/pan view"
```

---

### Task 6: Fix screenToSvg coordinate conversion for zoom/pan

**Files:**
- Modify: `src/components/SvgPreview.tsx` — Update screenToSvg function

**Step 1: Update screenToSvg to account for transform**

The current `screenToSvg` uses `svgEl.getBoundingClientRect()` which already includes CSS transforms, so the conversion `(clientX - rect.left) / rect.width * viewBox.width` should still work correctly even with scale/translate applied, because `getBoundingClientRect()` returns the screen-space bounding box of the transformed SVG element.

Verify this by testing: zoom in, then drag to select a region. The selection overlay rectangle should align with the visual position of the elements being selected.

If the overlay is misaligned, the fix is:

```typescript
function screenToSvg(clientX: number, clientY: number) {
  const svgEl = containerRef.current?.querySelector('svg');
  if (!svgEl) return { x: clientX, y: clientY };

  const rect = svgEl.getBoundingClientRect();
  const viewBox = svgEl.viewBox.baseVal;

  return {
    x: ((clientX - rect.left) / rect.width) * viewBox.width + viewBox.x,
    y: ((clientY - rect.top) / rect.height) * viewBox.height + viewBox.y,
  };
}
```

This should work because `getBoundingClientRect()` reports the actual rendered position/size including CSS transforms. The ratio `(clientX - rect.left) / rect.width` maps screen pixels to the 0-1 range of the visible SVG, then multiplied by viewBox dimensions gives SVG-space coordinates.

**Step 2: Run integration tests**

Run: `npx playwright test e2e/integration/region-selection.spec.ts --project=integration`
Expected: All region selection tests PASS.

**Step 3: Commit (if any fixes needed)**

```bash
git add src/components/SvgPreview.tsx
git commit -m "fix: ensure region selection works correctly with zoom/pan transforms"
```

---

### Task 7: Add E2E tests for zoom and pan

**Files:**
- Create: `e2e/integration/zoom-pan.spec.ts`
- Modify: `e2e/helpers/svg-samples.ts` (if needed — likely reuse COMPLEX_SCENE)

**Step 1: Write zoom-pan E2E test file**

```typescript
import { test, expect } from '../fixtures';
import { COMPLEX_SCENE } from '../helpers/svg-samples';
import { createAndNavigateToDrawing } from '../helpers/navigate-to-drawing';

async function postSvgAndWaitForRender(
  page: import('@playwright/test').Page,
  apiContext: import('@playwright/test').APIRequestContext,
  drawId: string,
  svg: string,
  selectorToWait: string,
) {
  const locator = page.locator(selectorToWait);
  for (let attempt = 0; attempt < 10; attempt++) {
    await apiContext.post(`/api/svg/${drawId}`, { data: { svg } });
    try {
      await expect(locator).toBeAttached({ timeout: 500 });
      return;
    } catch {
      await page.waitForTimeout(200);
    }
  }
  await apiContext.post(`/api/svg/${drawId}`, { data: { svg } });
  await expect(locator).toBeAttached({ timeout: 5000 });
}

test.describe('Zoom & Pan', () => {
  let drawId: string;

  test.beforeEach(async ({ page, apiContext }) => {
    drawId = await createAndNavigateToDrawing(page, apiContext);
    await expect(page.locator('.xterm')).toBeAttached({ timeout: 10_000 });
    await postSvgAndWaitForRender(
      page, apiContext, drawId, COMPLEX_SCENE,
      '.svg-preview-container rect[id="background"]',
    );
  });

  test('scroll wheel changes SVG transform scale', async ({ page }) => {
    const container = page.locator('.svg-preview-container');
    const box = await container.boundingBox();
    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    // Zoom in with scroll wheel
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(200);

    const wrapper = page.locator('.svg-transform-wrapper');
    const transform = await wrapper.getAttribute('style');
    expect(transform).toContain('scale(');
    // Scale should be > 1 after zooming in
    const scaleMatch = transform?.match(/scale\(([^)]+)\)/);
    expect(scaleMatch).toBeTruthy();
    expect(parseFloat(scaleMatch![1])).toBeGreaterThan(1);
  });

  test('double-click resets zoom to default', async ({ page }) => {
    const container = page.locator('.svg-preview-container');
    const box = await container.boundingBox();
    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    // Zoom in first
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(200);

    // Double-click to reset
    await page.mouse.dblclick(centerX, centerY);
    await page.waitForTimeout(200);

    const wrapper = page.locator('.svg-transform-wrapper');
    const transform = await wrapper.getAttribute('style');
    expect(transform).toContain('scale(1)');
    expect(transform).toContain('translate(0px, 0px)');
  });

  test('region selection still works after zoom', async ({ page }) => {
    const container = page.locator('.svg-preview-container');
    const box = await container.boundingBox();
    const centerX = box!.x + box!.width / 2;
    const centerY = box!.y + box!.height / 2;

    // Zoom in
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(200);

    // Perform drag selection
    const startX = box!.x + box!.width * 0.25;
    const startY = box!.y + box!.height * 0.25;
    const endX = box!.x + box!.width * 0.75;
    const endY = box!.y + box!.height * 0.75;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const selectionInfo = page.locator('.selection-info');
    await expect(selectionInfo).toBeVisible({ timeout: 5000 });
    await expect(selectionInfo).toContainText('Selected:');
  });
});
```

**Step 2: Run the new tests**

Run: `npx playwright test e2e/integration/zoom-pan.spec.ts --project=integration`
Expected: All 3 tests PASS.

**Step 3: Run full integration suite**

Run: `npx playwright test --project=integration`
Expected: All tests PASS.

**Step 4: Commit**

```bash
git add e2e/integration/zoom-pan.spec.ts
git commit -m "test: add E2E tests for zoom, pan, and reset functionality"
```

---

### Task 8: Update test SVG samples viewBox to 800×800

**Files:**
- Modify: `e2e/helpers/svg-samples.ts` — Update viewBox and coordinates in all samples

**Step 1: Update svg-samples.ts**

Update all four SVG samples to use `viewBox="0 0 800 800"`. Adjust element coordinates that reference 600 (height) to use 800 instead. Elements that are artistically placed (like `cy="300"`) can be left as-is — only adjust full-canvas backgrounds and explicit 600-height references:

```typescript
export const SIMPLE_CIRCLE = `<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <circle id="main-circle" cx="400" cy="400" r="100" fill="red"/>
</svg>`;

export const TWO_RECTS = `<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <rect id="rect-left" x="100" y="250" width="200" height="150" fill="blue"/>
  <rect id="rect-right" x="500" y="250" width="200" height="150" fill="green"/>
</svg>`;

export const COMPLEX_SCENE = `<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <rect id="background" x="0" y="0" width="800" height="800" fill="#f0f0f0"/>
  <circle id="sun" cx="650" cy="100" r="60" fill="gold"/>
  <rect id="house-body" x="250" y="400" width="300" height="300" fill="brown"/>
  <polygon id="roof" points="250,400 400,250 550,400" fill="darkred"/>
  <rect id="door" x="370" y="550" width="60" height="150" fill="darkbrown"/>
  <circle id="eye-left" cx="330" cy="470" r="15" fill="white"/>
  <circle id="eye-right" cx="470" cy="470" r="15" fill="white"/>
</svg>`;

export const LAYERED_SCENE = `<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky-gradient">
      <stop offset="0%" stop-color="#87CEEB"/>
      <stop offset="100%" stop-color="#4682B4"/>
    </linearGradient>
  </defs>
  <g id="layer-bg" data-name="背景">
    <rect width="800" height="800" fill="url(#sky-gradient)"/>
  </g>
  <g id="layer-mountains" data-name="山脉">
    <g id="layer-mountain-left" data-name="左侧山">
      <polygon points="0,800 200,300 400,800" fill="#2d5016"/>
    </g>
    <g id="layer-mountain-right" data-name="右侧山">
      <polygon points="300,800 500,250 700,800" fill="#1a3a0a"/>
    </g>
  </g>
  <g id="layer-sun" data-name="太阳">
    <circle cx="650" cy="100" r="60" fill="#FFD700"/>
  </g>
</svg>`;
```

**Step 2: Update layer-api test viewBox assertion**

In `e2e/integration/layer-api.spec.ts:17`, change:
```typescript
expect(body.viewBox).toBe('0 0 800 800');
```

**Step 3: Update layer-mutations test if it references 800×600**

Check `e2e/integration/layer-mutations.spec.ts:44` — it uses `'<rect width="800" height="600" fill="red"/>'`. Update to:
```typescript
data: { layer_id: 'layer-bg', content: '<rect width="800" height="800" fill="red"/>' },
```

**Step 4: Run full integration suite**

Run: `npx playwright test --project=integration`
Expected: All tests PASS.

**Step 5: Commit**

```bash
git add e2e/helpers/svg-samples.ts e2e/integration/layer-api.spec.ts e2e/integration/layer-mutations.spec.ts
git commit -m "test: update test SVG samples and assertions to 800x800 viewBox"
```
