import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30_000,
  retries: 1,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'integration',
      testDir: './e2e/integration',
    },
    {
      name: 'full-flow',
      testDir: './e2e/full-flow',
      timeout: 120_000,
      retries: 0,
    },
  ],
  webServer: {
    command: 'npm run build && DISABLE_PTY=1 node server/index.js',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
