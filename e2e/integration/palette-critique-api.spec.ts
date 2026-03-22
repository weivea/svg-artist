import { test, expect } from '../fixtures';
import { LAYERED_SCENE } from '../helpers/svg-samples';

test.describe('Palette & Composition Critique API', () => {
  async function setupLayeredDrawing(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    await apiContext.post(`/api/svg/${drawing.id}`, { data: { svg: LAYERED_SCENE } });
    return drawing.id;
  }

  // --- get_color_palette ---

  test('get_color_palette returns palettes with defaults', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/palette/generate`, {
      data: {},
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.palettes).toBeInstanceOf(Array);
    expect(body.palettes.length).toBe(3); // default count

    // Validate palette structure
    const palette = body.palettes[0];
    expect(palette.name).toBeTruthy();
    expect(palette.description).toBeTruthy();
    expect(palette.colors).toBeInstanceOf(Array);
    expect(palette.colors).toHaveLength(5);
    expect(palette.usage).toBeTruthy();
    expect(palette.usage.primary).toBeTruthy();
    expect(palette.usage.secondary).toBeTruthy();
    expect(palette.usage.accent).toBeTruthy();
    expect(palette.usage.background).toBeTruthy();
    expect(palette.usage.text).toBeTruthy();

    // Colors should be hex format
    for (const color of palette.colors) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  test('get_color_palette with theme', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/palette/generate`, {
      data: { theme: 'ocean' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.palettes.length).toBe(3);
    expect(body.palettes[0].name).toContain('Ocean');
  });

  test('get_color_palette with mood', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/palette/generate`, {
      data: { mood: 'calm' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.palettes.length).toBe(3);
  });

  test('get_color_palette with theme, mood, and count', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/palette/generate`, {
      data: { theme: 'sunset', mood: 'warm', count: 2 },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.palettes.length).toBe(2);
    expect(body.palettes[0].name).toContain('Sunset');
  });

  test('get_color_palette all themes work', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const themes = ['ocean', 'autumn', 'sunset', 'forest', 'urban', 'spring', 'night', 'desert'];
    for (const theme of themes) {
      const res = await apiContext.post(`/api/svg/${drawId}/palette/generate`, {
        data: { theme, count: 1 },
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.palettes).toHaveLength(1);
    }
  });

  // --- critique_composition ---

  test('critique_composition returns analysis for layered scene', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/composition/critique`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();

    // Overall score
    expect(typeof body.score).toBe('number');
    expect(body.score).toBeGreaterThanOrEqual(0);
    expect(body.score).toBeLessThanOrEqual(100);

    // 7 dimensions
    expect(body.dimensions).toBeTruthy();
    const dims = ['purpose', 'hierarchy', 'unity', 'variety', 'proportion', 'rhythm', 'emphasis'];
    for (const dim of dims) {
      expect(body.dimensions[dim]).toBeTruthy();
      expect(typeof body.dimensions[dim].score).toBe('number');
      expect(typeof body.dimensions[dim].notes).toBe('string');
    }

    // Issues and strengths are arrays
    expect(body.issues).toBeInstanceOf(Array);
    expect(body.strengths).toBeInstanceOf(Array);
  });

  test('critique_composition issues have correct structure', async ({ apiContext }) => {
    const drawId = await setupLayeredDrawing(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/composition/critique`);
    const body = await res.json();

    // If there are issues, check structure
    if (body.issues.length > 0) {
      const issue = body.issues[0];
      expect(issue.category).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(issue.severity);
      expect(issue.description).toBeTruthy();
      expect(issue.suggestion).toBeTruthy();
    }
  });

  test('critique_composition for empty drawing', async ({ apiContext }) => {
    const createRes = await apiContext.post('/api/drawings');
    const drawing = await createRes.json();
    const drawId = drawing.id;

    const res = await apiContext.post(`/api/svg/${drawId}/composition/critique`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(typeof body.score).toBe('number');
    // Empty drawing should have issues
    expect(body.issues.length).toBeGreaterThan(0);
  });

  test('critique_composition for nonexistent drawing returns 404', async ({ apiContext }) => {
    const res = await apiContext.post(`/api/svg/nonexistent-draw-id/composition/critique`);
    expect(res.ok()).toBeFalsy();
    expect(res.status()).toBe(404);
  });
});
