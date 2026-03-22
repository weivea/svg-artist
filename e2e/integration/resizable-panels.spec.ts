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
});
