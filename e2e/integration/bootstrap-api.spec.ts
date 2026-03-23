import { test, expect } from '../fixtures';
import { rm } from 'fs/promises';
import { join } from 'path';

test.describe('Bootstrap API', () => {
  async function createDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    return (await res.json()).id;
  }

  test.afterAll(async () => {
    // Clean up test-created skills
    const skillsToClean = ['e2e-test-skill'];
    for (const name of skillsToClean) {
      await rm(join(process.cwd(), 'plugins', 'svg-drawing', 'skills', name), { recursive: true, force: true }).catch(() => {});
    }
    // Clean up test bootstrap data
    await rm(join(process.cwd(), 'data', 'bootstrap'), { recursive: true, force: true }).catch(() => {});
  });

  // --- Validation tests ---

  test('write-skill rejects name with path traversal', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-skill`, {
      data: { name: '../evil', content: '# Evil' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Invalid name');
  });

  test('write-skill rejects empty content', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-skill`, {
      data: { name: 'test-skill', content: '' },
    });
    expect(res.status()).toBe(400);
  });

  test('write-filter rejects template without filter tag', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-filter`, {
      data: {
        name: 'bad-filter',
        definition: {
          description: 'Bad',
          svg_template: '<rect width="100" height="100"/>',
        },
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('filter');
  });

  // --- write-skill ---

  test('write-skill creates a new skill', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-skill`, {
      data: { name: 'e2e-test-skill', content: '# E2E Test Skill\n\nThis is a test skill.' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.path).toContain('e2e-test-skill');
  });

  // --- write-filter + custom filter application ---

  test('write-filter creates custom filter and apply-filter uses it', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    await apiContext.post(`/api/svg/${drawId}`, {
      data: { svg: '<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg"><defs></defs><g id="layer-test" data-name="test"><circle cx="100" cy="100" r="50" fill="red"/></g></svg>' },
    });

    const writeRes = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-filter`, {
      data: {
        name: 'test-grit',
        definition: {
          description: 'A test grit filter',
          svg_template: '<filter id="{{id}}"><feGaussianBlur in="SourceGraphic" stdDeviation="{{blur:2}}"/></filter>',
          params_schema: {
            blur: { type: 'number', default: 2, min: 0, max: 10 },
          },
        },
      },
    });
    expect(writeRes.ok()).toBeTruthy();

    const applyRes = await apiContext.post(`/api/svg/${drawId}/filter/apply`, {
      data: { layer_id: 'layer-test', filter_type: 'test-grit', params: { blur: 3 } },
    });
    expect(applyRes.ok()).toBeTruthy();
    const body = await applyRes.json();
    expect(body.ok).toBe(true);
    expect(body.filter_id).toContain('filter-test-grit');

    const sourceRes = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const svg = (await sourceRes.json()).svg;
    expect(svg).toContain('stdDeviation="3"');
  });

  // --- write-style ---

  test('write-style creates a custom style', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-style`, {
      data: {
        name: 'e2e-test-style',
        definition: {
          description: 'Test style',
          layer_styles: { '*': { fill: '#ff0000' } },
        },
      },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  // --- write-prompt-extension ---

  test('write-prompt-extension creates a prompt extension', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/write-prompt-extension`, {
      data: { name: 'e2e-test-prompt', content: 'Always use bold colors.' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  // --- list ---

  test('list returns all bootstrap assets', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    await apiContext.post(`/api/svg/${drawId}/bootstrap/write-prompt-extension`, {
      data: { name: 'e2e-list-test', content: 'Test extension' },
    });
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/list`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.skills).toBeInstanceOf(Array);
    expect(body.custom_filters).toBeInstanceOf(Array);
    expect(body.custom_styles).toBeInstanceOf(Array);
    expect(body.prompt_extensions).toBeInstanceOf(Array);
  });

  // --- reload (test mode) ---

  test('reload returns error when no active session', async ({ apiContext }) => {
    const drawId = await createDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/bootstrap/reload`, {
      data: { reason: 'test reload' },
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});
