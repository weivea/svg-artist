import { test, expect } from '../fixtures';

test.describe('Homepage', () => {
  test('homepage renders with SVG Artist title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'SVG Artist' })).toBeVisible();
  });

  test('create button exists and creates new drawing', async ({ page }) => {
    await page.goto('/');
    const createButton = page.getByRole('button', { name: /create|新建|创建/i });
    await expect(createButton).toBeVisible();

    await createButton.click();

    // Should navigate to /draw/:id
    await page.waitForURL(/\/#\/draw\/.+/);
    // Should see the draw page layout
    await expect(page.locator('.draw-content')).toBeVisible({ timeout: 5000 });
  });

  test('created drawing appears in history list', async ({ page, apiContext }) => {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();

    await page.goto('/');

    // Use data-id attribute on the card to find the specific drawing
    const card = page.locator(`.drawing-card[data-id="${drawing.id}"]`);
    await expect(card).toBeVisible({ timeout: 5000 });
    await expect(card.locator('.card-title')).toHaveText(drawing.title);
  });

  test('clicking history card navigates to draw page', async ({ page, apiContext }) => {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();

    await page.goto('/');
    const card = page.locator(`.drawing-card[data-id="${drawing.id}"]`);
    await card.click();

    await page.waitForURL(`/#/draw/${drawing.id}`);
    await expect(page.locator('.draw-content')).toBeVisible({ timeout: 5000 });
  });

  test('delete button removes drawing from list', async ({ page, apiContext }) => {
    const res = await apiContext.post('/api/drawings');
    const drawing = await res.json();

    await page.goto('/');
    const card = page.locator(`.drawing-card[data-id="${drawing.id}"]`);
    await expect(card).toBeVisible({ timeout: 5000 });

    const deleteButton = card.locator('.delete-button');
    await deleteButton.click();

    await expect(card).not.toBeVisible({ timeout: 5000 });
  });
});
