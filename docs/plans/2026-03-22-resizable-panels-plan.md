# Resizable Split Panels Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a draggable divider between the SVG preview and terminal panes so users can resize them, with localStorage persistence and terminal content integrity.

**Architecture:** A custom React hook (`useResizablePanels`) manages all drag logic, ratio calculation, and localStorage persistence. DrawPage inserts a divider element between the two panes and applies dynamic `flex-basis` styles. The existing terminal `ResizeObserver` chain handles re-fitting automatically.

**Tech Stack:** React (TypeScript), CSS, localStorage, Playwright (tests)

---

### Task 1: Write failing test for divider visibility

**Files:**
- Create: `e2e/integration/resizable-panels.spec.ts`

**Step 1: Write the test file**

```typescript
import { test, expect } from '../fixtures';
import { createAndNavigateToDrawing } from '../helpers/navigate-to-drawing';

test.describe('Resizable Panels', () => {
  test('divider is visible between svg and terminal panes', async ({ page, apiContext }) => {
    await createAndNavigateToDrawing(page, apiContext);
    const divider = page.locator('.pane-divider');
    await expect(divider).toBeVisible();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/integration/resizable-panels.spec.ts --project=integration`
Expected: FAIL — `.pane-divider` element does not exist

**Step 3: Commit**

```bash
git add e2e/integration/resizable-panels.spec.ts
git commit -m "test: add failing test for pane divider visibility"
```

---

### Task 2: Create useResizablePanels hook

**Files:**
- Create: `src/hooks/useResizablePanels.ts`

**Step 1: Write the hook**

```typescript
import { useState, useRef, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'svg-artist:panel-ratio';
const DEFAULT_RATIO = 0.5;
const MIN_RATIO = 0.2;
const MAX_RATIO = 0.8;

function clampRatio(ratio: number): number {
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));
}

function loadRatio(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed)) return clampRatio(parsed);
    }
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_RATIO;
}

function saveRatio(ratio: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(ratio));
  } catch {
    // localStorage unavailable
  }
}

export function useResizablePanels() {
  const [ratio, setRatio] = useState(loadRatio);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDoubleClick = useCallback(() => {
    setRatio(DEFAULT_RATIO);
    saveRatio(DEFAULT_RATIO);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const newRatio = clampRatio((e.clientX - rect.left) / rect.width);
        setRatio(newRatio);
      });
    };

    const handleMouseUp = () => {
      cancelAnimationFrame(rafRef.current);
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      setRatio((current) => {
        saveRatio(current);
        return current;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  const dividerProps = {
    className: 'pane-divider',
    onMouseDown: handleMouseDown,
    onDoubleClick: handleDoubleClick,
  };

  return { ratio, isDragging, dividerProps, containerRef };
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to `useResizablePanels.ts`

**Step 3: Commit**

```bash
git add src/hooks/useResizablePanels.ts
git commit -m "feat: add useResizablePanels hook with drag logic and persistence"
```

---

### Task 3: Integrate hook into DrawPage and add divider styles

**Files:**
- Modify: `src/pages/DrawPage.tsx` (lines 1-4 imports, lines 68-98 JSX return)
- Modify: `src/App.css` (lines 7-19 pane styles, add divider styles)

**Step 1: Update DrawPage.tsx imports and hook usage**

Add import at top of file (after line 4):

```typescript
import { useResizablePanels } from '../hooks/useResizablePanels';
```

Inside the component function body (after line 17, the `svgWs` state line), add:

```typescript
const { ratio, isDragging, dividerProps, containerRef } = useResizablePanels();
```

**Step 2: Update the JSX return**

Replace the `<div className="draw-content">` block (lines 76-98) with:

```tsx
      <div className="draw-content" ref={containerRef}>
        <div className="svg-pane" style={{ flexBasis: `${ratio * 100}%` }}>
          <SvgPreview
            svgContent={svgContent}
            externalSelection={selection}
            onSelectionChange={handleSelectionChange}
          />
          {selection && (
            <div className="selection-info">
              <span>
                Selected: ({Math.round(selection.region.x)}, {Math.round(selection.region.y)}) {Math.round(selection.region.width)}x{Math.round(selection.region.height)}
              </span>
              {selection.elements.length > 0 && (
                <span> | {selection.elements.length} element(s)</span>
              )}
              <button onClick={() => handleSelectionChange(null)}>Clear</button>
            </div>
          )}
        </div>
        <div {...dividerProps} />
        <div
          className="terminal-pane"
          style={{
            flexBasis: `${(1 - ratio) * 100}%`,
            pointerEvents: isDragging ? 'none' : 'auto',
          }}
        >
          <Terminal wsUrl={`${wsBase}/ws/terminal/${drawId}`} />
        </div>
      </div>
```

**Step 3: Update CSS — modify pane rules and add divider styles**

In `src/App.css`, replace the `.svg-pane` rule (lines 7-14):

```css
.svg-pane {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  border-right: none;
  background: #1a1a1a;
  color: #fff;
  overflow: hidden;
}
```

Replace the `.terminal-pane` rule (lines 15-19):

```css
.terminal-pane {
  flex: 0 0 auto;
  background: #000;
  color: #fff;
  overflow: hidden;
}
```

Add after `.terminal-pane`:

```css
.pane-divider {
  flex: 0 0 5px;
  background: #333;
  cursor: col-resize;
  transition: background 0.15s;
}
.pane-divider:hover {
  background: #555;
}
```

**Step 4: Run the failing test from Task 1**

Run: `npx playwright test e2e/integration/resizable-panels.spec.ts --project=integration`
Expected: PASS — divider is now visible

**Step 5: Run all existing tests to check for regressions**

Run: `npx playwright test --project=integration`
Expected: All tests pass (existing layout tests should still work since `.svg-pane` and `.terminal-pane` classes remain)

**Step 6: Commit**

```bash
git add src/pages/DrawPage.tsx src/App.css
git commit -m "feat: integrate resizable divider into DrawPage layout"
```

---

### Task 4: Write and pass drag resize test

**Files:**
- Modify: `e2e/integration/resizable-panels.spec.ts`

**Step 1: Add drag resize test**

Append to the `test.describe` block in `resizable-panels.spec.ts`:

```typescript
  test('dragging divider changes pane widths', async ({ page, apiContext }) => {
    await createAndNavigateToDrawing(page, apiContext);
    const divider = page.locator('.pane-divider');
    const svgPane = page.locator('.svg-pane');
    await expect(divider).toBeVisible();

    const initialBox = await svgPane.boundingBox();
    expect(initialBox).toBeTruthy();

    // Drag divider 100px to the right
    const dividerBox = await divider.boundingBox();
    expect(dividerBox).toBeTruthy();
    const startX = dividerBox!.x + dividerBox!.width / 2;
    const startY = dividerBox!.y + dividerBox!.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 100, startY, { steps: 5 });
    await page.mouse.up();

    const newBox = await svgPane.boundingBox();
    expect(newBox).toBeTruthy();
    expect(newBox!.width).toBeGreaterThan(initialBox!.width + 50);
  });
```

**Step 2: Run the test**

Run: `npx playwright test e2e/integration/resizable-panels.spec.ts --project=integration`
Expected: PASS — both tests pass

**Step 3: Commit**

```bash
git add e2e/integration/resizable-panels.spec.ts
git commit -m "test: add drag resize test for resizable panels"
```

---

### Task 5: Write and pass double-click reset test

**Files:**
- Modify: `e2e/integration/resizable-panels.spec.ts`

**Step 1: Add double-click reset test**

Append to the `test.describe` block:

```typescript
  test('double-clicking divider resets to 50/50', async ({ page, apiContext }) => {
    await createAndNavigateToDrawing(page, apiContext);
    const divider = page.locator('.pane-divider');
    const svgPane = page.locator('.svg-pane');
    const drawContent = page.locator('.draw-content');
    await expect(divider).toBeVisible();

    // Drag divider to change ratio
    const dividerBox = await divider.boundingBox();
    expect(dividerBox).toBeTruthy();
    const startX = dividerBox!.x + dividerBox!.width / 2;
    const startY = dividerBox!.y + dividerBox!.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 150, startY, { steps: 5 });
    await page.mouse.up();

    // Now double-click to reset
    await divider.dblclick();

    const containerBox = await drawContent.boundingBox();
    const svgBox = await svgPane.boundingBox();
    expect(containerBox).toBeTruthy();
    expect(svgBox).toBeTruthy();

    // SVG pane should be approximately 50% of container (within 20px tolerance for divider width)
    const expectedWidth = containerBox!.width / 2;
    expect(svgBox!.width).toBeGreaterThan(expectedWidth - 20);
    expect(svgBox!.width).toBeLessThan(expectedWidth + 20);
  });
```

**Step 2: Run the test**

Run: `npx playwright test e2e/integration/resizable-panels.spec.ts --project=integration`
Expected: PASS — all three tests pass

**Step 3: Commit**

```bash
git add e2e/integration/resizable-panels.spec.ts
git commit -m "test: add double-click reset test for resizable panels"
```

---

### Task 6: Write and pass min/max constraint test

**Files:**
- Modify: `e2e/integration/resizable-panels.spec.ts`

**Step 1: Add constraint test**

Append to the `test.describe` block:

```typescript
  test('pane width respects minimum 20% constraint', async ({ page, apiContext }) => {
    await createAndNavigateToDrawing(page, apiContext);
    const divider = page.locator('.pane-divider');
    const svgPane = page.locator('.svg-pane');
    const drawContent = page.locator('.draw-content');
    await expect(divider).toBeVisible();

    const containerBox = await drawContent.boundingBox();
    expect(containerBox).toBeTruthy();

    // Drag divider far to the left (try to make SVG pane tiny)
    const dividerBox = await divider.boundingBox();
    expect(dividerBox).toBeTruthy();
    const startX = dividerBox!.x + dividerBox!.width / 2;
    const startY = dividerBox!.y + dividerBox!.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(containerBox!.x + 10, startY, { steps: 5 });
    await page.mouse.up();

    const svgBox = await svgPane.boundingBox();
    expect(svgBox).toBeTruthy();

    // SVG pane should be at least ~20% of container width
    const minExpected = containerBox!.width * 0.18; // small tolerance
    expect(svgBox!.width).toBeGreaterThan(minExpected);
  });
```

**Step 2: Run the test**

Run: `npx playwright test e2e/integration/resizable-panels.spec.ts --project=integration`
Expected: PASS — all four tests pass

**Step 3: Commit**

```bash
git add e2e/integration/resizable-panels.spec.ts
git commit -m "test: add min constraint test for resizable panels"
```

---

### Task 7: Run full regression and final commit

**Files:**
- None (verification only)

**Step 1: Run all integration tests**

Run: `npx playwright test --project=integration`
Expected: All tests pass, no regressions in existing suites (page-layout, homepage, drawing-api, multi-session, websocket-svg, region-selection)

**Step 2: Verify the app manually compiles**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 3: Verify TypeScript types**

Run: `npx tsc --noEmit`
Expected: No type errors
