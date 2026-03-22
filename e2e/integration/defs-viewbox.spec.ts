import { test, expect } from '../fixtures';
import { LAYERED_SCENE } from '../helpers/svg-samples';

test.describe('Defs & ViewBox API', () => {
  async function setupLayeredDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: LAYERED_SCENE } });
    return drawing.id;
  }

  test('list_defs returns existing defs', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/defs/list`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.defs).toHaveLength(1);
    expect(body.defs[0].id).toBe('sky-gradient');
    expect(body.defs[0].type).toMatch(/linearGradient/i); // case may vary with linkedom
  });

  test('manage_defs add creates new gradient', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/defs/manage`, {
      data: {
        action: 'add',
        id: 'sunset-gradient',
        content: '<linearGradient id="sunset-gradient"><stop offset="0%" stop-color="#FF6B35"/><stop offset="100%" stop-color="#F7C59F"/></linearGradient>',
      },
    });
    expect(res.ok()).toBeTruthy();

    const listRes = await apiContext.post(`/api/svg/${drawId}/defs/list`);
    const defs = (await listRes.json()).defs;
    expect(defs).toHaveLength(2);
    expect(defs.find((d: any) => d.id === 'sunset-gradient')).toBeTruthy();
  });

  test('manage_defs delete removes def', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/defs/manage`, {
      data: { action: 'delete', id: 'sky-gradient' },
    });
    expect(res.ok()).toBeTruthy();

    const listRes = await apiContext.post(`/api/svg/${drawId}/defs/list`);
    const defs = (await listRes.json()).defs;
    expect(defs).toHaveLength(0);
  });

  test('manage_defs update replaces existing def', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/defs/manage`, {
      data: {
        action: 'update',
        id: 'sky-gradient',
        content: '<linearGradient id="sky-gradient"><stop offset="0%" stop-color="red"/><stop offset="100%" stop-color="blue"/></linearGradient>',
      },
    });
    expect(res.ok()).toBeTruthy();

    // Verify the content changed
    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('stop-color="red"');
    expect(svg).not.toContain('#87CEEB');
  });

  test('set_viewbox changes viewBox', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/canvas/viewbox`, {
      data: { x: 0, y: 0, width: 1200, height: 900 },
    });
    expect(res.ok()).toBeTruthy();

    const infoRes = await apiContext.post(`/api/svg/${drawId}/canvas/info`);
    const info = await infoRes.json();
    expect(info.viewBox).toBe('0 0 1200 900');
  });

  test('set_viewbox partial update preserves other values', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    // Only change width
    const res = await apiContext.post(`/api/svg/${drawId}/canvas/viewbox`, {
      data: { width: 1600 },
    });
    expect(res.ok()).toBeTruthy();

    const infoRes = await apiContext.post(`/api/svg/${drawId}/canvas/info`);
    const info = await infoRes.json();
    expect(info.viewBox).toBe('0 0 1600 600'); // x=0, y=0 preserved, width changed, height=600 preserved
  });
});
