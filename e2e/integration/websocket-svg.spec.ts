import { test, expect } from '../fixtures';
import { SIMPLE_CIRCLE, TWO_RECTS } from '../helpers/svg-samples';

test.describe('SVG WebSocket Updates', () => {
  test('SVG update via API renders in the preview', async ({ page, apiContext }) => {
    await page.goto('/');

    const response = await apiContext.post('/api/svg', {
      data: { svg: SIMPLE_CIRCLE },
    });
    expect(response.ok()).toBeTruthy();

    const circle = page.locator('.svg-preview-container circle[id="main-circle"]');
    await expect(circle).toBeAttached({ timeout: 5000 });
  });

  test('sequential updates replace previous SVG content', async ({ page, apiContext }) => {
    await page.goto('/');

    // First update: circle
    await apiContext.post('/api/svg', {
      data: { svg: SIMPLE_CIRCLE },
    });
    const circle = page.locator('.svg-preview-container circle[id="main-circle"]');
    await expect(circle).toBeAttached({ timeout: 5000 });

    // Second update: two rects
    await apiContext.post('/api/svg', {
      data: { svg: TWO_RECTS },
    });
    const rectLeft = page.locator('.svg-preview-container rect[id="rect-left"]');
    const rectRight = page.locator('.svg-preview-container rect[id="rect-right"]');
    await expect(rectLeft).toBeAttached({ timeout: 5000 });
    await expect(rectRight).toBeAttached({ timeout: 5000 });

    // Circle should be gone
    await expect(circle).not.toBeAttached();
  });

  test('invalid request returns 400', async ({ apiContext }) => {
    const response = await apiContext.post('/api/svg', {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test('health check returns 200 with status ok', async ({ apiContext }) => {
    const response = await apiContext.get('/api/health');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toEqual({ status: 'ok' });
  });
});
