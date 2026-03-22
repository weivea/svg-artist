import { test, expect } from '../fixtures';
import { LAYERED_SCENE } from '../helpers/svg-samples';

test.describe('Filter & Style Preset API', () => {
  async function setupLayeredDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: LAYERED_SCENE } });
    return drawing.id;
  }

  // --- apply_filter ---

  test('apply_filter adds drop-shadow filter to layer', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/filter/apply`, {
      data: { layer_id: 'layer-sun', filter_type: 'drop-shadow', params: { dx: 4, dy: 4, blur: 6 } },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.filter_id).toContain('filter-drop-shadow');

    // Verify filter is in defs
    const defsRes = await apiContext.post(`/api/svg/${drawId}/defs/list`);
    const defs = (await defsRes.json()).defs;
    expect(defs.find((d: any) => d.id === body.filter_id)).toBeTruthy();

    // Verify layer has filter attribute
    const sourceRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await sourceRes.json()).svg;
    expect(svg).toContain(`filter="url(#${body.filter_id})"`);
  });

  test('apply_filter adds glow filter', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/filter/apply`, {
      data: { layer_id: 'layer-sun', filter_type: 'glow', params: { radius: 15, color: '#FFD700' } },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.filter_id).toContain('filter-glow');
  });

  test('apply_filter adds metallic filter', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/filter/apply`, {
      data: { layer_id: 'layer-mountains', filter_type: 'metallic' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.filter_id).toContain('filter-metallic');
  });

  test('apply_filter returns error for invalid layer', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/filter/apply`, {
      data: { layer_id: 'nonexistent', filter_type: 'blur' },
    });
    expect(res.ok()).toBeFalsy();
  });

  test('apply_filter returns error for missing params', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/filter/apply`, {
      data: { layer_id: 'layer-sun' },
    });
    expect(res.ok()).toBeFalsy();
  });

  // --- apply_style_preset ---

  test('apply_style_preset flat applies to all layers', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/style/apply`, {
      data: { preset: 'flat' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.affected_layers).toBeInstanceOf(Array);
    expect(body.affected_layers.length).toBeGreaterThan(0);
    expect(body.description).toBeTruthy();
  });

  test('apply_style_preset line-art applies to specific layers', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/style/apply`, {
      data: { preset: 'line-art', layers: ['layer-sun', 'layer-bg'] },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.affected_layers).toEqual(expect.arrayContaining(['layer-sun', 'layer-bg']));
  });

  test('apply_style_preset watercolor adds filters to defs', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/style/apply`, {
      data: { preset: 'watercolor' },
    });
    expect(res.ok()).toBeTruthy();

    // Watercolor should add filter defs
    const defsRes = await apiContext.post(`/api/svg/${drawId}/defs/list`);
    const defs = (await defsRes.json()).defs;
    const filterDefs = defs.filter((d: any) => d.type === 'filter');
    expect(filterDefs.length).toBeGreaterThan(0);
  });

  test('apply_style_preset returns error for missing preset', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/style/apply`, {
      data: {},
    });
    expect(res.ok()).toBeFalsy();
  });
});
