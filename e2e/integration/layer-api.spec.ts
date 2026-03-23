import { test, expect } from '../fixtures';
import { LAYERED_SCENE } from '../helpers/svg-samples';

test.describe('Layer API — Query Operations', () => {
  async function setupLayeredDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: LAYERED_SCENE } });
    return drawing.id;
  }

  test('GET canvas info returns correct overview', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/canvas/info`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.viewBox).toBe('0 0 800 800');
    expect(body.layerCount).toBeGreaterThan(0);
    expect(body.defsCount).toBe(1);
  });

  test('list_layers returns tree structure', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.layers).toHaveLength(3); // bg, mountains, sun (top-level)
    const mountains = body.layers.find((l: any) => l.id === 'layer-mountains');
    expect(mountains.name).toBe('山脉');
    expect(mountains.children).toHaveLength(2);
  });

  test('get_layer returns single layer content', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/get`, {
      data: { layer_id: 'layer-bg' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.content).toContain('rect');
    expect(body.content).toContain('sky-gradient');
  });

  test('get_layer returns 404 for nonexistent layer', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/get`, {
      data: { layer_id: 'nonexistent' },
    });
    expect(res.status()).toBe(404);
  });

  test('get_svg_source returns full SVG', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.svg).toContain('<svg');
    expect(body.svg).toContain('layer-bg');
    expect(body.svg).toContain('layer-mountains');
  });

  test('get_layer_colors extracts colors from layer content', async ({ apiContext }) => {
    // Create a drawing with a layer containing multiple colors
    const createRes = await apiContext.post('/api/drawings');
    const drawing = await createRes.json();
    const drawId = drawing.id;

    const colorSvg = `<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <g id="layer-colorful" data-name="colorful">
        <rect x="0" y="0" width="400" height="400" fill="#ff0000" stroke="#00ff00"/>
        <circle cx="200" cy="200" r="50" fill="#0000ff"/>
        <ellipse cx="600" cy="600" rx="100" ry="50" fill="rgb(255,128,0)" stroke="#purple"/>
      </g>
    </svg>`;
    await apiContext.post(`/api/svg/${drawId}`, { data: { svg: colorSvg } });

    const res = await apiContext.post(`/api/svg/${drawId}/layers/colors`, {
      data: { layer_id: 'layer-colorful' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.colors).toBeDefined();
    expect(body.colors.length).toBeGreaterThanOrEqual(3);
    // Should find the hex colors
    const hexColors = body.colors.map((c: any) => c.color);
    expect(hexColors).toContain('#ff0000');
    expect(hexColors).toContain('#00ff00');
    expect(hexColors).toContain('#0000ff');
  });
});
