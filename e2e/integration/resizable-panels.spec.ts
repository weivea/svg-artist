import { test, expect } from '../fixtures';
import { createAndNavigateToDrawing } from '../helpers/navigate-to-drawing';

test.describe('Resizable Panels', () => {
  test('divider is visible between svg and terminal panes', async ({ page, apiContext }) => {
    await createAndNavigateToDrawing(page, apiContext);
    const divider = page.locator('.pane-divider');
    await expect(divider).toBeVisible();
  });

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
});
