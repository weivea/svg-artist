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

    // Wait for zoom to settle
    const wrapper = page.locator('.svg-transform-wrapper');
    await expect(async () => {
      const style = await wrapper.getAttribute('style');
      const m = style?.match(/scale\(([^)]+)\)/);
      expect(m).toBeTruthy();
      expect(parseFloat(m![1])).toBeGreaterThan(1);
    }).toPass({ timeout: 3000 });

    // Double-click to reset — dispatch a native dblclick event on the container
    await container.dispatchEvent('dblclick');

    // Wait for reset to take effect
    await expect(async () => {
      const style = await wrapper.getAttribute('style');
      expect(style).toContain('scale(1)');
      expect(style).toContain('translate(0px, 0px)');
    }).toPass({ timeout: 3000 });
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
