import { test, expect } from '../fixtures';

const ALIGNED_SVG = `<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <g id="layer-a" data-name="A"><rect x="50" y="100" width="100" height="80" fill="red"/></g>
  <g id="layer-b" data-name="B"><rect x="200" y="200" width="120" height="60" fill="blue"/></g>
  <g id="layer-c" data-name="C"><rect x="400" y="150" width="80" height="100" fill="green"/></g>
</svg>`;

test.describe('Align & Distribute API', () => {
  async function setup(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: ALIGNED_SVG } });
    return drawing.id;
  }

  test('align layers to left', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/align`, {
      data: {
        layer_ids: ['layer-a', 'layer-b', 'layer-c'],
        align: 'left',
      },
    });
    expect(res.ok()).toBeTruthy();
    // After left-align, all layers should start at x=50 (the leftmost)
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    // All layers should have been translated
    expect(body.svg).toContain('translate');
  });

  test('align layers to right', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/align`, {
      data: {
        layer_ids: ['layer-a', 'layer-b', 'layer-c'],
        align: 'right',
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('translate');
  });

  test('align layers to center', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/align`, {
      data: {
        layer_ids: ['layer-a', 'layer-b', 'layer-c'],
        align: 'center',
      },
    });
    expect(res.ok()).toBeTruthy();
  });

  test('align layers to top', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/align`, {
      data: {
        layer_ids: ['layer-a', 'layer-b', 'layer-c'],
        align: 'top',
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    // layer-a is already at y=100 (topmost), others should be translated
    expect(body.svg).toContain('translate');
  });

  test('distribute layers horizontally', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/align`, {
      data: {
        layer_ids: ['layer-a', 'layer-b', 'layer-c'],
        distribute: 'horizontal',
      },
    });
    expect(res.ok()).toBeTruthy();
  });

  test('distribute layers vertically', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/align`, {
      data: {
        layer_ids: ['layer-a', 'layer-b', 'layer-c'],
        distribute: 'vertical',
      },
    });
    expect(res.ok()).toBeTruthy();
  });

  test('returns 400 with fewer than 2 layer_ids', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/align`, {
      data: {
        layer_ids: ['layer-a'],
        align: 'left',
      },
    });
    expect(res.status()).toBe(400);
  });

  test('align with reference layer', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/align`, {
      data: {
        layer_ids: ['layer-a', 'layer-b', 'layer-c'],
        align: 'left',
        reference: 'layer-b',
      },
    });
    expect(res.ok()).toBeTruthy();
  });
});
