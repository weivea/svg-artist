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

  test('transform_layer compose mode appends to existing transform', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
      data: { layer_id: 'layer-sun', translate: { x: 10, y: 20 } },
    });
    await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
      data: { layer_id: 'layer-sun', rotate: { angle: 45 }, mode: 'compose' },
    });
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('translate(10, 20)');
    expect(body.svg).toMatch(/rotate\(45\)/);
  });

  test('transform_layer replace mode overwrites existing transform', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
      data: { layer_id: 'layer-sun', translate: { x: 10, y: 20 } },
    });
    await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
      data: { layer_id: 'layer-sun', rotate: { angle: 45 }, mode: 'replace' },
    });
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).not.toContain('translate(10, 20)');
    expect(body.svg).toMatch(/rotate\(45\)/);
  });

  test('transform_layer supports skew', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
      data: { layer_id: 'layer-sun', skew: { x: 15, y: 10 } },
    });
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('skewX(15)');
    expect(body.svg).toContain('skewY(10)');
  });

  test('transform_layer scale with center point', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    await apiContext.post(`/api/svg/${drawId}/layers/transform`, {
      data: { layer_id: 'layer-sun', scale: { x: 2, y: 2, cx: 650, cy: 100 } },
    });
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('translate(650, 100)');
    expect(body.svg).toContain('scale(2, 2)');
    expect(body.svg).toContain('translate(-650, -100)');
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

  test('set_layer_style sets stroke-dasharray', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-bg', stroke: 'black', stroke_width: 2, stroke_dasharray: '5 3' },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('stroke-dasharray="5 3"');
  });

  test('set_layer_style sets stroke-linecap and stroke-linejoin', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-sun', stroke: '#000', stroke_linecap: 'round', stroke_linejoin: 'bevel' },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('stroke-linecap="round"');
    expect(svg).toContain('stroke-linejoin="bevel"');
  });

  test('set_layer_style sets mix-blend-mode via style attribute', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-sun', mix_blend_mode: 'multiply' },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('mix-blend-mode: multiply');
  });

  test('set_layer_style sets filter_ref as filter attribute', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-sun', filter_ref: 'url(#my-filter)' },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('filter="url(#my-filter)"');
  });

  test('set_layer_style sets clip-path and mask', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-bg', clip_path: 'url(#clip-1)', mask_ref: 'url(#mask-1)' },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('clip-path="url(#clip-1)"');
    expect(svg).toContain('mask="url(#mask-1)"');
  });

  test('set_layer_style sets fill-opacity and stroke-opacity', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-sun', fill_opacity: 0.5, stroke_opacity: 0.8 },
    });
    expect(res.ok()).toBeTruthy();

    const srcRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await srcRes.json()).svg;
    expect(svg).toContain('fill-opacity="0.5"');
    expect(svg).toContain('stroke-opacity="0.8"');
  });

  test('set_layer_style null value removes attribute', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-sun', fill: '#ff0000', stroke: '#000000' },
    });
    await apiContext.post(`/api/svg/${drawId}/layers/style`, {
      data: { layer_id: 'layer-sun', fill: null },
    });
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    const sunMatch = body.svg.match(/<g[^>]*id="layer-sun"[^>]*>/);
    expect(sunMatch[0]).not.toContain('fill=');
    expect(sunMatch[0]).toContain('stroke="#000000"');
  });
});
