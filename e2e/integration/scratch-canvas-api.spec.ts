import { test, expect } from '../fixtures';

test.describe('Scratch Canvas API', () => {
  async function createDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    return drawing.id;
  }

  test('create scratch canvas returns canvasId and viewBox', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.canvasId).toBeTruthy();
    expect(body.canvasId).toMatch(/^scratch-/);
    expect(body.viewBox).toBe('0 0 120 80');
  });

  test('create scratch canvas with background', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 100 100', background: '#ffffff' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.canvasId).toBeTruthy();
  });

  test('create scratch canvas fails for nonexistent drawing', async ({ apiContext }) => {
    const res = await apiContext.post(`/api/svg/nonexistent/scratch/create`, {
      data: { viewBox: '0 0 100 100' },
    });
    expect(res.status()).toBe(404);
  });

  test('add layer to scratch canvas', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'iris', content: '<circle cx="60" cy="40" r="20" fill="blue"/>' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.layer_id).toBeTruthy();
    expect(body.layer_id).toMatch(/^layer-iris-/);
  });

  test('update layer on scratch canvas', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    const addRes = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'iris', content: '<circle cx="60" cy="40" r="20" fill="blue"/>' },
    });
    const { layer_id } = await addRes.json();

    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/update`, {
      data: { layer_id, content: '<circle cx="60" cy="40" r="25" fill="green"/>' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('list layers on scratch canvas', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'iris', content: '<circle cx="60" cy="40" r="20" fill="blue"/>' },
    });
    await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'pupil', content: '<circle cx="60" cy="40" r="8" fill="black"/>' },
    });

    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/list`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.layers).toHaveLength(2);
    expect(body.layers[0].name).toBe('iris');
    expect(body.layers[1].name).toBe('pupil');
  });

  test('scratch canvas operations fail for nonexistent canvasId', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/nonexistent/layers/list`);
    expect(res.status()).toBe(404);
  });
});
