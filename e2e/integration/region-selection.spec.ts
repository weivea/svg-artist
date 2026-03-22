import { test, expect } from '../fixtures';
import { COMPLEX_SCENE } from '../helpers/svg-samples';

/**
 * Post SVG via API and reliably wait for it to render in the browser.
 *
 * Handles the race condition where the browser's SVG WebSocket may not
 * be connected yet when the first POST arrives. Retries posting until
 * the content appears in the DOM.
 */
async function postSvgAndWaitForRender(
  page: import('@playwright/test').Page,
  apiContext: import('@playwright/test').APIRequestContext,
  svg: string,
  selectorToWait: string,
) {
  const locator = page.locator(selectorToWait);

  for (let attempt = 0; attempt < 10; attempt++) {
    await apiContext.post('/api/svg', { data: { svg } });
    try {
      await expect(locator).toBeAttached({ timeout: 500 });
      return; // Success
    } catch {
      // WebSocket not yet connected or message not delivered, retry
      await page.waitForTimeout(200);
    }
  }

  // Final attempt with a longer timeout for a clear error message
  await apiContext.post('/api/svg', { data: { svg } });
  await expect(locator).toBeAttached({ timeout: 5000 });
}

test.describe('Region Selection', () => {
  test.beforeEach(async ({ page, apiContext }) => {
    await page.goto('/');

    // Wait for the page to be interactive
    await expect(page.locator('.xterm')).toBeAttached({ timeout: 10_000 });

    // Post the complex scene SVG and wait for it to render (with retry for WS readiness)
    await postSvgAndWaitForRender(
      page,
      apiContext,
      COMPLEX_SCENE,
      '.svg-preview-container rect[id="background"]',
    );
  });

  test('drag selection creates overlay', async ({ page }) => {
    const container = page.locator('.svg-preview-container');
    const box = await container.boundingBox();

    // Start drag at ~25% from left, 50% from top
    const startX = box!.x + box!.width * 0.25;
    const startY = box!.y + box!.height * 0.5;
    // End drag at ~75% from left, 75% from top
    const endX = box!.x + box!.width * 0.75;
    const endY = box!.y + box!.height * 0.75;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();

    const selectionInfo = page.locator('.selection-info');
    await expect(selectionInfo).toBeVisible({ timeout: 5000 });
  });

  test('selection info shows coordinates', async ({ page }) => {
    const container = page.locator('.svg-preview-container');
    const box = await container.boundingBox();

    const startX = box!.x + box!.width * 0.25;
    const startY = box!.y + box!.height * 0.5;
    const endX = box!.x + box!.width * 0.75;
    const endY = box!.y + box!.height * 0.75;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();

    const selectionInfo = page.locator('.selection-info');
    await expect(selectionInfo).toBeVisible({ timeout: 5000 });
    await expect(selectionInfo).toContainText('Selected:');
  });

  test('selection info shows element count', async ({ page }) => {
    const container = page.locator('.svg-preview-container');
    const box = await container.boundingBox();

    const startX = box!.x + box!.width * 0.25;
    const startY = box!.y + box!.height * 0.5;
    const endX = box!.x + box!.width * 0.75;
    const endY = box!.y + box!.height * 0.75;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();

    const selectionInfo = page.locator('.selection-info');
    await expect(selectionInfo).toBeVisible({ timeout: 5000 });
    await expect(selectionInfo).toContainText('element(s)');
  });

  test('clear button removes selection', async ({ page }) => {
    const container = page.locator('.svg-preview-container');
    const box = await container.boundingBox();

    const startX = box!.x + box!.width * 0.25;
    const startY = box!.y + box!.height * 0.5;
    const endX = box!.x + box!.width * 0.75;
    const endY = box!.y + box!.height * 0.75;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();

    const selectionInfo = page.locator('.selection-info');
    await expect(selectionInfo).toBeVisible({ timeout: 5000 });

    // Click the Clear button inside selection-info
    const clearButton = selectionInfo.locator('button', { hasText: 'Clear' });
    await clearButton.click();

    await expect(selectionInfo).not.toBeVisible();
  });
});
