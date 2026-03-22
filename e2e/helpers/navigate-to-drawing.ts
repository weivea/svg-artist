import type { Page, APIRequestContext } from '@playwright/test';

/**
 * Create a drawing via API and navigate to its draw page.
 * Returns the drawId.
 */
export async function createAndNavigateToDrawing(
  page: Page,
  apiContext: APIRequestContext,
): Promise<string> {
  const res = await apiContext.post('/api/drawings');
  const drawing = await res.json();
  await page.goto(`/#/draw/${drawing.id}`);
  return drawing.id;
}
