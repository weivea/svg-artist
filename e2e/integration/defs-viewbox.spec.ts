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
    expect(info.viewBox).toBe('0 0 1600 800'); // x=0, y=0 preserved, width changed, height=800 preserved
  });

  test('manage_defs create_gradient creates linear gradient', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/defs/manage`, {
      data: {
        action: 'create_gradient',
        id: 'my-gradient',
        gradient_type: 'linear',
        stops: [
          { offset: '0%', color: '#ff0000' },
          { offset: '100%', color: '#0000ff' },
        ],
        x1: '0%', y1: '0%', x2: '100%', y2: '0%',
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg.toLowerCase()).toContain('lineargradient');
    expect(body.svg).toContain('id="my-gradient"');
    expect(body.svg).toContain('#ff0000');
    expect(body.svg).toContain('#0000ff');
  });

  test('manage_defs create_gradient creates radial gradient', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/defs/manage`, {
      data: {
        action: 'create_gradient',
        id: 'radial-grad',
        gradient_type: 'radial',
        stops: [
          { offset: '0%', color: 'white' },
          { offset: '100%', color: 'black', opacity: 0.5 },
        ],
        cx: '50%', cy: '50%', r: '50%',
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg.toLowerCase()).toContain('radialgradient');
    expect(body.svg).toContain('id="radial-grad"');
    expect(body.svg).toContain('stop-opacity="0.5"');
  });

  test('manage_defs create_pattern creates pattern def', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/defs/manage`, {
      data: {
        action: 'create_pattern',
        id: 'dots-pattern',
        pattern_width: '10',
        pattern_height: '10',
        pattern_units: 'userSpaceOnUse',
        pattern_content: '<circle cx="5" cy="5" r="2" fill="red"/>',
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('pattern');
    expect(body.svg).toContain('id="dots-pattern"');
    // linkedom may lowercase attribute names, check case-insensitively for attr name
    expect(body.svg.toLowerCase()).toContain('patternunits=');
    expect(body.svg).toContain('userSpaceOnUse');
  });

  test('manage_defs create_clip_mask creates clipPath', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/defs/manage`, {
      data: {
        action: 'create_clip_mask',
        id: 'my-clip',
        clip_content: '<circle cx="400" cy="400" r="200"/>',
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg.toLowerCase()).toContain('clippath');
    expect(body.svg).toContain('id="my-clip"');
  });

  test('manage_defs create_clip_mask creates mask when mask_content provided', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/defs/manage`, {
      data: {
        action: 'create_clip_mask',
        id: 'my-mask',
        mask_content: '<rect width="800" height="800" fill="white"/>',
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('<mask');
    expect(body.svg).toContain('id="my-mask"');
  });
});
