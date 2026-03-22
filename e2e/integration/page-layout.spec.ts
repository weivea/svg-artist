import { test, expect } from '../fixtures';

test.describe('Page Layout', () => {
  test('page loads with title "SVG Artist"', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('SVG Artist');
  });

  test('split pane layout is visible', async ({ page }) => {
    await page.goto('/');
    const svgPane = page.locator('.svg-pane');
    const terminalPane = page.locator('.terminal-pane');

    await expect(svgPane).toBeVisible();
    await expect(terminalPane).toBeVisible();
  });

  test('xterm.js terminal container renders in the terminal pane', async ({ page }) => {
    await page.goto('/');
    const xterm = page.locator('.terminal-pane .xterm');

    await expect(xterm).toBeVisible({ timeout: 10_000 });
  });

  test('placeholder SVG displays "Waiting for artwork..." text', async ({ page }) => {
    await page.goto('/');
    const placeholder = page.getByText('Waiting for artwork...');

    await expect(placeholder).toBeVisible();
  });
});
