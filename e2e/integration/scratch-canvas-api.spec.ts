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

  test('preview scratch canvas as PNG', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'circle', content: '<circle cx="60" cy="40" r="30" fill="red"/>' },
    });

    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/preview`, {
      data: { width: 200 },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.image).toBeTruthy();
    expect(body.image.slice(0, 5)).toBe('iVBOR');
  });

  test('list scratch canvases for a drawing', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);

    await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 200 100' },
    });

    const res = await apiContext.post(`/api/svg/${drawId}/scratch/list`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.canvases).toHaveLength(2);
    expect(body.canvases[0].canvasId).toMatch(/^scratch-/);
    expect(body.canvases[0].viewBox).toBeTruthy();
    expect(body.canvases[0].layerCount).toBeDefined();
  });

  test('list scratch canvases returns empty for drawing with none', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/list`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.canvases).toHaveLength(0);
  });

  test('merge scratch canvas into main drawing', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    // Add layers to scratch
    await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'iris', content: '<circle cx="60" cy="40" r="20" fill="blue"/>' },
    });
    await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'pupil', content: '<circle cx="60" cy="40" r="8" fill="black"/>' },
    });

    // Merge into main drawing
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/merge`, {
      data: {
        layerName: 'left-eye',
        transform: { translate: [100, 150], scale: 0.8 },
      },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.layer_id).toMatch(/^layer-left-eye-/);

    // Verify the layer exists in main drawing
    const layersRes = await apiContext.post(`/api/svg/${drawId}/layers/list`);
    const layersBody = await layersRes.json();
    const merged = layersBody.layers.find((l: any) => l.id === body.layer_id);
    expect(merged).toBeTruthy();
    expect(merged.name).toBe('left-eye');

    // Verify scratch canvas is deleted after merge
    const listRes = await apiContext.post(`/api/svg/${drawId}/scratch/list`);
    const listBody = await listRes.json();
    expect(listBody.canvases).toHaveLength(0);
  });

  test('merge scratch canvas transfers defs', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: {
        name: 'gradient-circle',
        content: '<circle cx="60" cy="40" r="20" fill="url(#scratch-grad)"/>',
      },
    });

    // Add a def to the scratch canvas
    await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/defs/manage`, {
      data: {
        action: 'add',
        id: 'scratch-grad',
        content: '<linearGradient id="scratch-grad"><stop offset="0%" stop-color="blue"/><stop offset="100%" stop-color="green"/></linearGradient>',
      },
    });

    // Merge
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/merge`, {
      data: { layerName: 'eye-with-gradient', transferDefs: true },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.defs_transferred).toBeGreaterThanOrEqual(1);

    // Check main drawing has the gradient
    const defsRes = await apiContext.post(`/api/svg/${drawId}/defs/list`);
    const defsBody = await defsRes.json();
    const transferred = defsBody.defs.find((d: any) => d.id.includes('scratch-grad'));
    expect(transferred).toBeTruthy();
  });

  test('merge fails for nonexistent scratch canvas', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/nonexistent/merge`, {
      data: { layerName: 'test' },
    });
    expect(res.status()).toBe(404);
  });

  test('delete layer from scratch canvas', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    const addRes = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/add`, {
      data: { name: 'iris', content: '<circle cx="60" cy="40" r="20" fill="blue"/>' },
    });
    const { layer_id } = await addRes.json();

    // Verify layer exists
    const listBefore = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/list`);
    const beforeBody = await listBefore.json();
    expect(beforeBody.layers).toHaveLength(1);

    // Delete the layer
    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/delete`, {
      data: { layer_id },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);

    // Verify layer is gone
    const listAfter = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/list`);
    const afterBody = await listAfter.json();
    expect(afterBody.layers).toHaveLength(0);
  });

  test('delete layer from scratch canvas fails for nonexistent layer', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/delete`, {
      data: { layer_id: 'nonexistent' },
    });
    expect(res.status()).toBe(404);
  });

  test('delete layer from scratch canvas fails without layer_id', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/layers/delete`, {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test('manage defs on scratch canvas (add and verify on merge)', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    // Add a gradient def
    const addDefRes = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/defs/manage`, {
      data: {
        action: 'add',
        id: 'test-grad',
        content: '<linearGradient id="test-grad"><stop offset="0%" stop-color="red"/><stop offset="100%" stop-color="blue"/></linearGradient>',
      },
    });
    expect(addDefRes.ok()).toBeTruthy();
    const addDefBody = await addDefRes.json();
    expect(addDefBody.ok).toBe(true);

    // Update the def
    const updateDefRes = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/defs/manage`, {
      data: {
        action: 'update',
        id: 'test-grad',
        content: '<linearGradient id="test-grad"><stop offset="0%" stop-color="green"/><stop offset="100%" stop-color="yellow"/></linearGradient>',
      },
    });
    expect(updateDefRes.ok()).toBeTruthy();

    // Delete the def
    const deleteDefRes = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/defs/manage`, {
      data: { action: 'delete', id: 'test-grad' },
    });
    expect(deleteDefRes.ok()).toBeTruthy();
  });

  test('manage defs on scratch canvas fails without action or id', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/scratch/create`, {
      data: { viewBox: '0 0 120 80' },
    });
    const { canvasId } = await createRes.json();

    const res = await apiContext.post(`/api/svg/${drawId}/scratch/${canvasId}/defs/manage`, {
      data: { action: 'add' }, // missing id
    });
    expect(res.status()).toBe(400);
  });
});
