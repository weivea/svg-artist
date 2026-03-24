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

  test('create_path assigns id to path element', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    await apiContext.post(`/api/svg/${drawId}/path/create`, {
      data: { type: 'line', start: [10, 20], end: [100, 200], stroke: '#000', layer_name: 'id-test' },
    });
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    // Path elements should have an id attribute
    expect(body.svg).toMatch(/id="path-[^"]+"/);
  });

  test('path/find returns path id from layer', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/path/create`, {
      data: { type: 'line', start: [10, 20], end: [100, 200], stroke: '#000', layer_name: 'find-test' },
    });
    const { layer_id } = await createRes.json();
    const findRes = await apiContext.post(`/api/svg/${drawId}/path/find`, {
      data: { layer_id },
    });
    expect(findRes.ok()).toBeTruthy();
    const findBody = await findRes.json();
    expect(findBody.path_id).toBeTruthy();
    expect(findBody.path_id).toMatch(/^path-/);
  });

  test('edit_path moves a point', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/path/create`, {
      data: { type: 'line', start: [10, 20], end: [100, 200], stroke: '#000', layer_name: 'edit-move' },
    });
    const { layer_id } = await createRes.json();
    // Find the path element id
    const findRes = await apiContext.post(`/api/svg/${drawId}/path/find`, { data: { layer_id } });
    const { path_id } = await findRes.json();

    const editRes = await apiContext.post(`/api/svg/${drawId}/path/edit`, {
      data: {
        element_id: path_id,
        operations: [{ type: 'move_point', index: 1, x: 150, y: 300 }],
      },
    });
    expect(editRes.ok()).toBeTruthy();
    const editBody = await editRes.json();
    expect(editBody.newD).toContain('150');
    expect(editBody.newD).toContain('300');

    // Verify persisted
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    expect(body.svg).toContain('L 150 300');
  });

  test('edit_path adds a point', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/path/create`, {
      data: { type: 'line', start: [0, 0], end: [100, 100], stroke: '#000', layer_name: 'edit-add' },
    });
    const { layer_id } = await createRes.json();
    const findRes = await apiContext.post(`/api/svg/${drawId}/path/find`, { data: { layer_id } });
    const { path_id } = await findRes.json();

    const editRes = await apiContext.post(`/api/svg/${drawId}/path/edit`, {
      data: {
        element_id: path_id,
        operations: [{ type: 'add_point', after_index: 0, x: 50, y: 75 }],
      },
    });
    expect(editRes.ok()).toBeTruthy();
    const editBody = await editRes.json();
    // Should now have M 0 0 L 50 75 L 100 100
    expect(editBody.newD).toContain('L 50 75');
    expect(editBody.newD).toContain('L 100 100');
  });

  test('edit_path deletes a point', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/path/create`, {
      data: {
        type: 'polyline',
        points: [[0, 0], [50, 50], [100, 0]],
        stroke: '#000',
        layer_name: 'edit-del',
      },
    });
    const { layer_id } = await createRes.json();
    const findRes = await apiContext.post(`/api/svg/${drawId}/path/find`, { data: { layer_id } });
    const { path_id } = await findRes.json();

    const editRes = await apiContext.post(`/api/svg/${drawId}/path/edit`, {
      data: {
        element_id: path_id,
        operations: [{ type: 'delete_point', index: 1 }],
      },
    });
    expect(editRes.ok()).toBeTruthy();
    const editBody = await editRes.json();
    // Middle point removed, should have M 0 0 L 100 0
    expect(editBody.newD).not.toContain('50');
  });

  test('edit_path closes and opens a path', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/path/create`, {
      data: { type: 'line', start: [0, 0], end: [100, 100], stroke: '#000', layer_name: 'edit-close' },
    });
    const { layer_id } = await createRes.json();
    const findRes = await apiContext.post(`/api/svg/${drawId}/path/find`, { data: { layer_id } });
    const { path_id } = await findRes.json();

    // Close the path
    const closeRes = await apiContext.post(`/api/svg/${drawId}/path/edit`, {
      data: {
        element_id: path_id,
        operations: [{ type: 'close' }],
      },
    });
    expect(closeRes.ok()).toBeTruthy();
    const closeBody = await closeRes.json();
    expect(closeBody.newD).toContain('Z');

    // Open it again
    const openRes = await apiContext.post(`/api/svg/${drawId}/path/edit`, {
      data: {
        element_id: path_id,
        operations: [{ type: 'open' }],
      },
    });
    expect(openRes.ok()).toBeTruthy();
    const openBody = await openRes.json();
    expect(openBody.newD).not.toContain('Z');
  });

  test('edit_path set_control converts line segment to curve', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const createRes = await apiContext.post(`/api/svg/${drawId}/path/create`, {
      data: { type: 'line', start: [0, 0], end: [100, 100], stroke: '#000', layer_name: 'edit-ctrl' },
    });
    const { layer_id } = await createRes.json();
    const findRes = await apiContext.post(`/api/svg/${drawId}/path/find`, { data: { layer_id } });
    const { path_id } = await findRes.json();

    const editRes = await apiContext.post(`/api/svg/${drawId}/path/edit`, {
      data: {
        element_id: path_id,
        operations: [{ type: 'set_control', index: 1, control1: [25, 75], control2: [75, 25] }],
      },
    });
    expect(editRes.ok()).toBeTruthy();
    const editBody = await editRes.json();
    expect(editBody.newD).toContain('C ');  // Converted to cubic bezier
  });

  test('edit_path returns error for non-existent element', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/path/edit`, {
      data: {
        element_id: 'non-existent',
        operations: [{ type: 'move_point', index: 0, x: 0, y: 0 }],
      },
    });
    expect(res.ok()).toBeFalsy();
    expect(res.status()).toBe(400);
  });

  // --- Boolean Path Operations ---

  async function createPolygonAndGetPathId(
    apiContext: any,
    drawId: string,
    points: [number, number][],
    fill: string,
    layerName: string,
  ): Promise<{ layerId: string; pathId: string }> {
    const createRes = await apiContext.post(`/api/svg/${drawId}/path/create`, {
      data: { type: 'polygon', points, fill, stroke: '#000', layer_name: layerName },
    });
    const { layer_id: layerId } = await createRes.json();
    const findRes = await apiContext.post(`/api/svg/${drawId}/path/find`, { data: { layer_id: layerId } });
    const { path_id: pathId } = await findRes.json();
    return { layerId, pathId };
  }

  test('boolean_path union combines two overlapping polygons', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const a = await createPolygonAndGetPathId(apiContext, drawId,
      [[0, 0], [100, 0], [100, 100], [0, 100]], 'red', 'rect-a');
    const b = await createPolygonAndGetPathId(apiContext, drawId,
      [[50, 50], [150, 50], [150, 150], [50, 150]], 'blue', 'rect-b');

    const res = await apiContext.post(`/api/svg/${drawId}/path/boolean`, {
      data: { operation: 'union', path_a: a.pathId, path_b: b.pathId, result_layer: 'union-result' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.layer_id).toBeTruthy();
    expect(body.resultD).toBeTruthy();
    // Result should exist in SVG source
    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const srcBody = await source.json();
    expect(srcBody.svg).toContain('union-result');
  });

  test('boolean_path subtract removes second shape from first', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const a = await createPolygonAndGetPathId(apiContext, drawId,
      [[0, 0], [200, 0], [200, 200], [0, 200]], 'red', 'big-rect');
    const b = await createPolygonAndGetPathId(apiContext, drawId,
      [[50, 50], [150, 50], [150, 150], [50, 150]], 'blue', 'small-rect');

    const res = await apiContext.post(`/api/svg/${drawId}/path/boolean`, {
      data: { operation: 'subtract', path_a: a.pathId, path_b: b.pathId },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.resultD).toBeTruthy();
    // Result should have path data (the big rect minus inner rect)
    expect(body.resultD.length).toBeGreaterThan(0);
  });

  test('boolean_path intersect keeps only overlap', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const a = await createPolygonAndGetPathId(apiContext, drawId,
      [[0, 0], [100, 0], [100, 100], [0, 100]], 'red', 'int-a');
    const b = await createPolygonAndGetPathId(apiContext, drawId,
      [[50, 50], [150, 50], [150, 150], [50, 150]], 'blue', 'int-b');

    const res = await apiContext.post(`/api/svg/${drawId}/path/boolean`, {
      data: { operation: 'intersect', path_a: a.pathId, path_b: b.pathId },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.resultD).toBeTruthy();
  });

  test('boolean_path exclude keeps non-overlapping areas', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const a = await createPolygonAndGetPathId(apiContext, drawId,
      [[0, 0], [100, 0], [100, 100], [0, 100]], 'red', 'exc-a');
    const b = await createPolygonAndGetPathId(apiContext, drawId,
      [[50, 50], [150, 50], [150, 150], [50, 150]], 'blue', 'exc-b');

    const res = await apiContext.post(`/api/svg/${drawId}/path/boolean`, {
      data: { operation: 'exclude', path_a: a.pathId, path_b: b.pathId },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.resultD).toBeTruthy();
  });

  test('boolean_path returns error for invalid operation', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/path/boolean`, {
      data: { operation: 'invalid', path_a: 'a', path_b: 'b' },
    });
    expect(res.ok()).toBeFalsy();
    expect(res.status()).toBe(400);
  });

  test('boolean_path returns error for non-existent paths', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const res = await apiContext.post(`/api/svg/${drawId}/path/boolean`, {
      data: { operation: 'union', path_a: 'non-existent-a', path_b: 'non-existent-b' },
    });
    expect(res.ok()).toBeFalsy();
    expect(res.status()).toBe(400);
  });

  test('boolean_path inherits style from path A', async ({ apiContext }) => {
    const drawId = await setup(apiContext);
    const a = await createPolygonAndGetPathId(apiContext, drawId,
      [[0, 0], [100, 0], [100, 100], [0, 100]], '#ff0000', 'styled-a');
    const b = await createPolygonAndGetPathId(apiContext, drawId,
      [[50, 50], [150, 50], [150, 150], [50, 150]], '#0000ff', 'styled-b');

    await apiContext.post(`/api/svg/${drawId}/path/boolean`, {
      data: { operation: 'union', path_a: a.pathId, path_b: b.pathId, result_layer: 'styled-result' },
    });

    const source = await apiContext.post(`/api/svg/${drawId}/canvas/source`);
    const body = await source.json();
    // The result layer should have path A's fill color
    // Find the result layer content
    expect(body.svg).toContain('styled-result');
    // The result path should inherit fill from path A
    expect(body.svg).toMatch(/styled-result[\s\S]*fill="#ff0000"/);
  });
});
