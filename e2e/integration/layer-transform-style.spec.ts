import { test, expect } from '../fixtures';
import { LAYERED_SCENE } from '../helpers/svg-samples';

test.describe('Layer API — Transform & Style', () => {
  async function setupLayeredDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: LAYERED_SCENE } });
    return drawing.id;
  }

  test('transform_layer applies translate', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
      data: { layer_id: 'layer-sun', translate: { x: 100, y: 50 } },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('translate(100');
  });

  test('transform_layer applies rotate', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
      data: { layer_id: 'layer-sun', rotate: { angle: 45, cx: 650, cy: 100 } },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('rotate(45');
  });

  test('set_layer_opacity sets opacity attribute', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/opacity`, {
      data: { layer_id: 'layer-sun', opacity: 0.5 },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('opacity="0.5"');
  });

  test('set_layer_style sets fill and stroke', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-bg', fill: 'red', stroke: 'black', stroke_width: 2 },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    // Style attributes should be on the <g id="layer-bg"> element
    expect(svg).toContain('fill="red"');
    expect(svg).toContain('stroke="black"');
    expect(svg).toContain('stroke-width="2"');
  });
});
