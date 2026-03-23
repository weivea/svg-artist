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
});
