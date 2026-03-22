import { test, expect } from '../fixtures';
import { SIMPLE_CIRCLE, TWO_RECTS } from '../helpers/svg-samples';
import { createAndNavigateToDrawing } from '../helpers/navigate-to-drawing';

/**
 * Navigate to a draw page and ensure the SVG WebSocket is connected.
 */
async function gotoDrawingAndEnsureSvgWsReady(
  page: import('@playwright/test').Page,
  apiContext: import('@playwright/test').APIRequestContext,
) {
  const drawId = await createAndNavigateToDrawing(page, apiContext);

  // Wait for the page to be interactive (xterm renders)
  await expect(page.locator('.xterm')).toBeAttached({ timeout: 10_000 });

  // Poll: keep posting a probe SVG until it appears in the DOM
  const probeSvg = '<svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg"><circle id="ws-probe" cx="0" cy="0" r="1"/></svg>';
  const probeLocator = page.locator('.svg-preview-container circle[id="ws-probe"]');

  for (let attempt = 0; attempt < 10; attempt++) {
    await apiContext.post(`/api/svg/${drawId}`, { data: { svg: probeSvg } });
    try {
      await expect(probeLocator).toBeAttached({ timeout: 500 });
      break;
    } catch {
      await page.waitForTimeout(200);
    }
  }

  return drawId;
}

test.describe('SVG WebSocket Updates', () => {
  test('SVG update via API renders in the preview', async ({ page, apiContext }) => {
    const drawId = await gotoDrawingAndEnsureSvgWsReady(page, apiContext);

    const response = await apiContext.post(`/api/svg/${drawId}`, {
      data: { svg: SIMPLE_CIRCLE },
    });
    expect(response.ok()).toBeTruthy();

    const circle = page.locator('.svg-preview-container circle[id="main-circle"]');
    await expect(circle).toBeAttached({ timeout: 5000 });
  });

  test('sequential updates replace previous SVG content', async ({ page, apiContext }) => {
    const drawId = await gotoDrawingAndEnsureSvgWsReady(page, apiContext);

    await apiContext.post(`/api/svg/${drawId}`, {
      data: { svg: SIMPLE_CIRCLE },
    });
    const circle = page.locator('.svg-preview-container circle[id="main-circle"]');
    await expect(circle).toBeAttached({ timeout: 5000 });

    await apiContext.post(`/api/svg/${drawId}`, {
      data: { svg: TWO_RECTS },
    });
    const rectLeft = page.locator('.svg-preview-container rect[id="rect-left"]');
    const rectRight = page.locator('.svg-preview-container rect[id="rect-right"]');
    await expect(rectLeft).toBeAttached({ timeout: 5000 });
    await expect(rectRight).toBeAttached({ timeout: 5000 });

    await expect(circle).not.toBeAttached();
  });

  test('invalid request returns 400', async ({ apiContext }) => {
    // Need a drawId for the new route format
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();

    const response = await apiContext.post(`/api/svg/${drawing.id}`, {
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
