import { test, expect } from '../fixtures';
import { COMPLEX_SCENE } from '../helpers/svg-samples';

test.describe('Region Selection', () => {
  test.beforeEach(async ({ page, apiContext }) => {
    await page.goto('/');

    // Post the complex scene SVG and wait for it to render
    await apiContext.post('/api/svg', {
      data: { svg: COMPLEX_SCENE },
    });
    const background = page.locator('.svg-preview-container rect[id="background"]');
    await expect(background).toBeAttached({ timeout: 5000 });
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
