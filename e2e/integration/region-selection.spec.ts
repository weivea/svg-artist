import { test, expect } from '../fixtures';
import { COMPLEX_SCENE } from '../helpers/svg-samples';
import { createAndNavigateToDrawing } from '../helpers/navigate-to-drawing';

/**
 * Post SVG via API and reliably wait for it to render in the browser.
 */
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

test.describe('Region Selection', () => {
  let drawId: string;

  test.beforeEach(async ({ page, apiContext }) => {
    drawId = await createAndNavigateToDrawing(page, apiContext);

    // Wait for the page to be interactive
    await expect(page.locator('.xterm')).toBeAttached({ timeout: 10_000 });

    // Post the complex scene SVG and wait for it to render
    await postSvgAndWaitForRender(
      page,
      apiContext,
      drawId,
      COMPLEX_SCENE,
      '.svg-preview-container rect[id="background"]',
    );
  });

  async function performDrag(page: import('@playwright/test').Page) {
    const container = page.locator('.svg-preview-container');
    const box = await container.boundingBox();

    const startX = box!.x + box!.width * 0.25;
    const startY = box!.y + box!.height * 0.5;
    const endX = box!.x + box!.width * 0.75;
    const endY = box!.y + box!.height * 0.75;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(300);
  }

  test('drag selection creates overlay', async ({ page }) => {
    await performDrag(page);
    const selectionInfo = page.locator('.selection-info');
    await expect(selectionInfo).toBeVisible({ timeout: 5000 });
  });

  test('selection info shows coordinates', async ({ page }) => {
    await performDrag(page);
    const selectionInfo = page.locator('.selection-info');
    await expect(selectionInfo).toBeVisible({ timeout: 5000 });
    await expect(selectionInfo).toContainText('Selected:');
  });

  test('selection info shows element count', async ({ page }) => {
    await performDrag(page);
    const selectionInfo = page.locator('.selection-info');
    await expect(selectionInfo).toBeVisible({ timeout: 5000 });
    await expect(selectionInfo).toContainText('element(s)');
  });

  test('clear button removes selection', async ({ page }) => {
    await performDrag(page);
    const selectionInfo = page.locator('.selection-info');
    await expect(selectionInfo).toBeVisible({ timeout: 5000 });

    const clearButton = selectionInfo.locator('button', { hasText: 'Clear' });
    await clearButton.click();
    await expect(selectionInfo).not.toBeVisible();
  });
});
