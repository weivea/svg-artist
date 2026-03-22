import { test, expect } from '../fixtures';
import { createAndNavigateToDrawing } from '../helpers/navigate-to-drawing';

test.describe('Resizable Panels', () => {
  test('divider is visible between svg and terminal panes', async ({ page, apiContext }) => {
    await createAndNavigateToDrawing(page, apiContext);
    const divider = page.locator('.pane-divider');
    await expect(divider).toBeVisible();
  });
});
