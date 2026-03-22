import { test, expect } from '../fixtures';

test.describe('Drawings REST API', () => {
  test('POST /api/drawings creates a new drawing', async ({ apiContext }) => {
    const response = await apiContext.post('/api/drawings');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.id).toBeTruthy();
    expect(body.sessionId).toBeTruthy();
    expect(body.title).toContain('绘画');
    expect(body.svgContent).toContain('<svg');
  });

  test('GET /api/drawings returns list including created drawing', async ({ apiContext }) => {
    const createRes = await apiContext.post('/api/drawings');
    const created = await createRes.json();

    const listRes = await apiContext.get('/api/drawings');
    expect(listRes.ok()).toBeTruthy();

    const body = await listRes.json();
    expect(body.drawings).toBeInstanceOf(Array);
    const found = body.drawings.find((d: any) => d.id === created.id);
    expect(found).toBeTruthy();
    expect(found.title).toBe(created.title);
  });

  test('DELETE /api/drawings/:id removes the drawing', async ({ apiContext }) => {
    const createRes = await apiContext.post('/api/drawings');
    const created = await createRes.json();

    const deleteRes = await apiContext.delete(`/api/drawings/${created.id}`);
    expect(deleteRes.ok()).toBeTruthy();

    const listRes = await apiContext.get('/api/drawings');
    const body = await listRes.json();
    const found = body.drawings.find((d: any) => d.id === created.id);
    expect(found).toBeUndefined();
  });

  test('DELETE /api/drawings/:nonexistent returns 404', async ({ apiContext }) => {
    const response = await apiContext.delete('/api/drawings/nonexistent');
    expect(response.status()).toBe(404);
  });
});
