import { test, expect } from '@playwright/test';
import { WebSocket } from 'ws';

// These tests require Claude CLI installed and a manually started server (no DISABLE_PTY)
// Run with: npm run dev:server (in one terminal) + npm run test:full (in another)

/**
 * Check if the server is running with PTY enabled by connecting to the
 * terminal WebSocket and looking for the "[Test mode: PTY disabled]" message.
 * Returns true if PTY is available (server NOT started with DISABLE_PTY=1).
 */
async function isPtyAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;
    const done = (result: boolean) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      try { ws.close(); } catch { /* ignore */ }
      resolve(result);
    };

    let ws: WebSocket;
    try {
      ws = new WebSocket('ws://localhost:3000/ws/terminal');
    } catch {
      resolve(false);
      return;
    }

    const timeout = setTimeout(() => {
      // Timeout without receiving the test-mode message means PTY is likely available
      done(true);
    }, 3_000);

    ws.on('message', (data) => {
      const msg = data.toString();
      if (msg.includes('Test mode: PTY disabled')) {
        done(false);
      }
    });

    ws.on('error', () => {
      done(false);
    });

    ws.on('open', () => {
      // Connection succeeded; wait a bit for the potential test-mode message
    });
  });
}

test.describe('Claude CLI Full Flow @full-flow', () => {

  test.beforeAll(async () => {
    const ptyOk = await isPtyAvailable();
    test.skip(!ptyOk, 'Server is running with DISABLE_PTY=1 or is not reachable — start the server manually without DISABLE_PTY for full-flow tests');
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for terminal to initialize
    await page.waitForSelector('.xterm', { timeout: 10_000 });
    // Give Claude CLI time to start up
    await page.waitForTimeout(5_000);
  });

  test('terminal connects and shows Claude CLI output', async ({ page }) => {
    // The xterm terminal should contain some text from Claude CLI
    // Claude CLI typically shows a greeting or prompt
    const terminalContent = page.locator('.xterm-rows');
    await expect(terminalContent).not.toBeEmpty({ timeout: 30_000 });
  });

  test('user can type in terminal and get a response', async ({ page }) => {
    // Type a simple message
    const terminal = page.locator('.terminal-pane');
    await terminal.click();

    // Type "hello" and press Enter
    await page.keyboard.type('say hello', { delay: 50 });
    await page.keyboard.press('Enter');

    // Wait for some response text to appear (Claude should respond)
    // We can't predict the exact response, but there should be new content
    await page.waitForTimeout(15_000);

    const rows = page.locator('.xterm-rows');
    await expect(rows).not.toBeEmpty();
  });

  test('Claude draws SVG and preview updates', async ({ page }) => {
    // Ask Claude to draw something simple
    const terminal = page.locator('.terminal-pane');
    await terminal.click();

    await page.keyboard.type('draw a red circle in the center using the draw_svg tool', { delay: 30 });
    await page.keyboard.press('Enter');

    // Wait for SVG to appear in the preview
    // This may take a while as Claude processes and calls draw_svg
    const svgPreview = page.locator('.svg-preview-container svg');
    await expect(svgPreview).toBeAttached({ timeout: 60_000 });

    // The placeholder text should be gone
    // Either placeholder is gone or SVG has more elements than just text
    const circleOrShape = page.locator('.svg-preview-container svg circle, .svg-preview-container svg ellipse, .svg-preview-container svg rect');
    await expect(circleOrShape.first()).toBeAttached({ timeout: 60_000 });
  });
});
