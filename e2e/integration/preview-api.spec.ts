import { test, expect } from '../fixtures';
import { LAYERED_SCENE } from '../helpers/svg-samples';

test.describe('Preview & BBox API', () => {
  async function setupLayeredDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: LAYERED_SCENE } });
    return drawing.id;
  }

  test('preview_as_png returns base64 PNG', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/preview`, {
      data: { width: 400, height: 300 },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.image).toBeTruthy();
    // Verify it's valid base64 PNG (PNG magic bytes: 89 50 4E 47)
    const buf = Buffer.from(body.image, 'base64');
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50); // 'P'
  });

  test('preview_layer returns base64 PNG for single layer', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/preview/layer`, {
      data: { layer_id: 'layer-sun', width: 200, height: 200 },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.image).toBeTruthy();
    const buf = Buffer.from(body.image, 'base64');
    expect(buf[0]).toBe(0x89);
  });

  test('preview_layer returns 404 for nonexistent layer', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/preview/layer`, {
      data: { layer_id: 'nonexistent', width: 200, height: 200 },
    });
    expect(res.status()).toBe(404);
  });

  test('get_element_bbox returns bounding box for circle', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/canvas/bbox`, {
      data: { element_id: 'layer-sun' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    // The sun layer contains <circle cx="650" cy="100" r="60"/>
    // So bbox should be approximately x:590, y:40, w:120, h:120
    expect(body.x).toBeDefined();
    expect(body.y).toBeDefined();
    expect(body.width).toBeDefined();
    expect(body.height).toBeDefined();
    expect(body.width).toBeGreaterThan(0);
    expect(body.height).toBeGreaterThan(0);
  });

  test('get_element_bbox returns 404 for nonexistent element', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/canvas/bbox`, {
      data: { element_id: 'nonexistent' },
    });
    expect(res.status()).toBe(404);
  });

  test('preview with background color produces valid PNG', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/preview`, {
      data: { background: '#ffffff' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.image).toBeTruthy();
    const buf = Buffer.from(body.image, 'base64');
    expect(buf[0]).toBe(0x89); // PNG magic
    expect(buf[1]).toBe(0x50);
  });

  test('preview with DPI scales render', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    // Get baseline image at default DPI
    const baseRes = await apiContext.post(`/api/svg/${drawId}/preview`, {
      data: { width: 400 },
    });
    const baseBody = await baseRes.json();
    const baseSize = Buffer.from(baseBody.image, 'base64').length;

    // Get image at 2x DPI (should produce larger PNG)
    const hiRes = await apiContext.post(`/api/svg/${drawId}/preview`, {
      data: { dpi: 144 },
    });
    expect(hiRes.ok()).toBeTruthy();
    const hiBody = await hiRes.json();
    expect(hiBody.image).toBeTruthy();
    const hiBuf = Buffer.from(hiBody.image, 'base64');
    expect(hiBuf[0]).toBe(0x89); // PNG magic
    // 2x DPI should produce a larger image than 400px width
    expect(hiBuf.length).toBeGreaterThan(baseSize);
  });

  test('preview with background and DPI combined', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/preview`, {
      data: { background: '#000000', dpi: 144, width: 400 },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.image).toBeTruthy();
    const buf = Buffer.from(body.image, 'base64');
    expect(buf[0]).toBe(0x89);
  });
});
