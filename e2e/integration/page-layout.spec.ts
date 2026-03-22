import { test, expect } from '../fixtures';
import { createAndNavigateToDrawing } from '../helpers/navigate-to-drawing';

test.describe('Page Layout', () => {
  test('page loads with title "SVG Artist"', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('SVG Artist');
  });

  test('split pane layout is visible on draw page', async ({ page, apiContext }) => {
    await createAndNavigateToDrawing(page, apiContext);
    const svgPane = page.locator('.svg-pane');
    const terminalPane = page.locator('.terminal-pane');

    await expect(svgPane).toBeVisible();
    await expect(terminalPane).toBeVisible();
  });

  test('xterm.js terminal container renders in the terminal pane', async ({ page, apiContext }) => {
    await createAndNavigateToDrawing(page, apiContext);
    const xterm = page.locator('.terminal-pane .xterm');

    await expect(xterm).toBeVisible({ timeout: 10_000 });
  });

  test('placeholder SVG displays "Waiting for artwork..." text', async ({ page, apiContext }) => {
    await createAndNavigateToDrawing(page, apiContext);
    const placeholder = page.getByText('Waiting for artwork...');

    await expect(placeholder).toBeVisible();
  });
});
