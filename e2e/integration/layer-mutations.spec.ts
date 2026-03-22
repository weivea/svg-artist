import { test, expect } from '../fixtures';
import { LAYERED_SCENE } from '../helpers/svg-samples';

test.describe('Layer API — Mutations', () => {
  async function setupLayeredDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: LAYERED_SCENE } });
    return drawing.id;
  }

  test('add_layer inserts new layer', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/add`, {
      data: { name: '云朵', content: '<ellipse cx="200" cy="80" rx="60" ry="30" fill="white"/>' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.layer_id).toBeTruthy();

    // Verify layer exists
    const listRes = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    const layers = (await listRes.json()).layers;
    expect(layers.find((l: any) => l.id === body.layer_id)).toBeTruthy();
  });

  test('add_layer with parent_id nests inside parent', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/add`, {
      data: { name: '山顶雪', content: '<polygon points="200,200 220,180 240,200" fill="white"/>', parent_id: 'layer-mountains' },
    });
    expect(res.ok()).toBeTruthy();

    const listRes = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    const layers = (await listRes.json()).layers;
    const mountains = layers.find((l: any) => l.id === 'layer-mountains');
    expect(mountains.children).toHaveLength(3); // left, right, + new
  });

  test('update_layer replaces layer content', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/update`, {
      data: { layer_id: 'layer-bg', content: '<rect width="800" height="800" fill="red"/>' },
    });
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).ok).toBe(true);

    const getRes = await apiContext.post(`/api/svg/${drawId}/layers/get`, {
      data: { layer_id: 'layer-bg' },
    });
    const body = await getRes.json();
    expect(body.content).toContain('fill="red"');
    expect(body.content).not.toContain('sky-gradient');
  });

  test('delete_layer removes layer', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/delete`, {
      data: { layer_id: 'layer-sun' },
    });
    expect(res.ok()).toBeTruthy();

    const listRes = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    const layers = (await listRes.json()).layers;
    expect(layers.find((l: any) => l.id === 'layer-sun')).toBeUndefined();
  });

  test('move_layer changes position', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    // Move sun to position 0 (before bg)
    const res = await apiContext.post(`/api/svg/${drawId}/layers/move`, {
      data: { layer_id: 'layer-sun', position: 0 },
    });
    expect(res.ok()).toBeTruthy();

    const listRes = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    const layers = (await listRes.json()).layers;
    expect(layers[0].id).toBe('layer-sun');
  });

  test('duplicate_layer creates copy', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/layers/duplicate`, {
      data: { layer_id: 'layer-sun', new_name: '月亮' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.new_layer_id).toBeTruthy();
    expect(body.new_layer_id).not.toBe('layer-sun');

    const listRes = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    const layers = (await listRes.json()).layers;
    const moon = layers.find((l: any) => l.id === body.new_layer_id);
    expect(moon).toBeTruthy();
    expect(moon.name).toBe('月亮');
  });
});
