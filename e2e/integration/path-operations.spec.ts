import { test, expect } from '../fixtures';

test.describe('Path Operations API', () => {
  async function setup(apiContext: any) {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();
    return drawing.id;
  }

  test('create_path creates a line', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/path/create`, {
      data: {
        type: 'line',
        start: [10, 20],
        end: [100, 200],
        stroke: '#ff0000',
        layer_name: 'my-line',
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('<path');
    expect(body.svg).toContain('M 10 20 L 100 200');
    expect(body.svg).toContain('stroke="#ff0000"');
  });

  test('create_path creates a bezier curve', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/path/create`, {
      data: {
        type: 'bezier',
        start: [0, 0],
        end: [200, 200],
        control1: [0, 200],
        control2: [200, 0],
        stroke: '#0000ff',
        stroke_width: 2,
        layer_name: 'curve',
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('C ');  // Cubic bezier command
  });

  test('create_path creates a star', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/path/create`, {
      data: {
        type: 'star',
        start: [200, 200],
        radius: 100,
        inner_radius: 40,
        corners: 5,
        fill: '#ffcc00',
        stroke: '#000000',
        layer_name: 'star',
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('<path');
    expect(body.svg).toContain('fill="#ffcc00"');
    expect(body.svg).toContain('Z');  // Closed path
  });

  test('create_path creates a polygon', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/path/create`, {
      data: {
        type: 'polygon',
        points: [[100, 0], [200, 100], [100, 200], [0, 100]],
        fill: '#00ff00',
        layer_name: 'diamond',
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('Z');
    expect(body.svg).toContain('fill="#00ff00"');
  });

  test('create_path creates a rounded rect', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/path/create`, {
      data: {
        type: 'rounded-rect',
        start: [50, 50],
        end: [250, 150],
        corner_radius: 15,
        fill: '#eee',
        stroke: '#333',
        layer_name: 'button-bg',
      },
    });
    expect(res.ok()).toBeTruthy();
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('Q ');  // Quadratic curves for corners
  });
});
