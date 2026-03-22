import { test, expect } from '../fixtures';
import { SIMPLE_CIRCLE, TWO_RECTS } from '../helpers/svg-samples';

test.describe('Multi-Session SVG Isolation', () => {
  test('POST /api/svg/:drawId broadcasts only to that drawId WebSocket', async ({ page, apiContext }) => {
    // Create two drawings
    const res1 = await apiContext.post('/api/drawings');
    const drawing1 = await res1.json();
    const res2 = await apiContext.post('/api/drawings');
    const drawing2 = await res2.json();

    // Open page and connect to drawing1's SVG WebSocket
    await page.goto(`/#/draw/${drawing1.id}`);
    await page.waitForTimeout(1000);

    // Post SVG to drawing1 — should appear
    await apiContext.post(`/api/svg/${drawing1.id}`, {
      data: { svg: SIMPLE_CIRCLE },
    });

    const circle = page.locator('.svg-preview-container circle[id="main-circle"]');
    await expect(circle).toBeAttached({ timeout: 5000 });

    // Post SVG to drawing2 — should NOT appear in drawing1's view
    await apiContext.post(`/api/svg/${drawing2.id}`, {
      data: { svg: TWO_RECTS },
    });

    // Wait a moment to make sure no unexpected update arrives
    await page.waitForTimeout(500);
    const rectLeft = page.locator('.svg-preview-container rect[id="rect-left"]');
    await expect(rectLeft).not.toBeAttached();

    // drawing1's circle should still be there
    await expect(circle).toBeAttached();
  });

  test('POST /api/svg/:drawId persists SVG to drawings.json', async ({ apiContext }) => {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();

    await apiContext.post(`/api/svg/${drawing.id}`, {
      data: { svg: SIMPLE_CIRCLE },
    });

    // Verify persistence via GET
    const listRes = await apiContext.get('/api/drawings');
    const body = await listRes.json();
    const found = body.drawings.find((d: any) => d.id === drawing.id);
    expect(found.svgContent).toBe(SIMPLE_CIRCLE);
  });
});
