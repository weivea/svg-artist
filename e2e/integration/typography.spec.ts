import { test, expect } from '../fixtures';

test.describe('Typography API', () => {
  async function setup(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    return drawing.id;
  }

  test('create_text creates a text layer', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/text/create`, {
      data: {
        text: 'Hello World',
        x: 100,
        y: 200,
        font_family: 'Arial',
        font_size: 24,
        fill: '#333333',
        layer_name: 'title',
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('Hello World');
    expect(body.svg).toContain('font-family="Arial"');
    expect(body.svg).toContain('font-size="24"');
    expect(body.svg).toContain('data-name="title"');
  });

  test('create_text with spans creates rich text', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/text/create`, {
      data: {
        text: '',
        x: 50,
        y: 100,
        layer_name: 'rich',
        spans: [
          { text: 'Bold ', font_weight: 'bold' },
          { text: 'Red', fill: '#ff0000' },
        ],
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('<tspan');
    expect(body.svg).toContain('font-weight="bold"');
    expect(body.svg).toContain('fill="#ff0000"');
  });

  test('create_text to existing layer_id', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    // First create a layer
    await apiContext.post(`/api/svg/${drawId}/layers/add`, {
      data: { name: 'text-layer', content: '<rect width="10" height="10"/>' },
    });
    const layers = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    const layerBody = await layers.json();
    const textLayer = layerBody.layers.find((l: any) => l.name === 'text-layer');

    const res = await apiContext.post(`/api/svg/${drawId}/text/create`, {
      data: {
        text: 'Added Text',
        x: 0,
        y: 50,
        layer_id: textLayer.id,
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    // Should have both the rect and the text in the same layer
    expect(body.svg).toContain('Added Text');
  });

  test('create_text with multi-line text', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/text/create`, {
      data: {
        text: 'Line 1\nLine 2\nLine 3',
        x: 100,
        y: 100,
        line_height: 24,
        layer_name: 'multiline',
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('Line 1');
    expect(body.svg).toContain('Line 2');
    expect(body.svg).toContain('<tspan');
  });
});
