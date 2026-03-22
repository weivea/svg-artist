import { test, expect } from '../fixtures';
import { SIMPLE_CIRCLE, TWO_RECTS } from '../helpers/svg-samples';

/**
 * Navigate to the page and ensure the SVG WebSocket is connected.
 *
 * Posts a probe SVG via the API and waits for it to render.
 * If it doesn't appear quickly, it means the WebSocket wasn't connected yet,
 * so it retries. This handles the race condition where the API POST
 * arrives before the browser's WebSocket connection is established.
 */
async function gotoAndEnsureSvgWsReady(
  page: import('@playwright/test').Page,
  apiContext: import('@playwright/test').APIRequestContext,
) {
  await page.goto('/');

  // Wait for the page to be interactive (xterm renders)
  await expect(page.locator('.xterm')).toBeAttached({ timeout: 10_000 });

  // Poll: keep posting a probe SVG until it appears in the DOM,
  // which proves the WebSocket connection is fully established.
  const probeSvg = '<svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg"><circle id="ws-probe" cx="0" cy="0" r="1"/></svg>';
  const probeLocator = page.locator('.svg-preview-container circle[id="ws-probe"]');

  for (let attempt = 0; attempt < 10; attempt++) {
    await apiContext.post('/api/svg', { data: { svg: probeSvg } });
    try {
      await expect(probeLocator).toBeAttached({ timeout: 500 });
      break; // WebSocket is connected!
    } catch {
      // WebSocket not yet connected, wait and retry
      await page.waitForTimeout(200);
    }
  }
}

test.describe('SVG WebSocket Updates', () => {
  test('SVG update via API renders in the preview', async ({ page, apiContext }) => {
    await gotoAndEnsureSvgWsReady(page, apiContext);

    const response = await apiContext.post('/api/svg', {
      data: { svg: SIMPLE_CIRCLE },
    });
    expect(response.ok()).toBeTruthy();

    const circle = page.locator('.svg-preview-container circle[id="main-circle"]');
    await expect(circle).toBeAttached({ timeout: 5000 });
  });

  test('sequential updates replace previous SVG content', async ({ page, apiContext }) => {
    await gotoAndEnsureSvgWsReady(page, apiContext);

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
