import { defineConfig } from '@playwright/test';
import { join } from 'path';
import { tmpdir } from 'os';

const testDataDir = join(tmpdir(), 'svg-artist-test-data');

export default defineConfig({
  timeout: 30_000,
  retries: 1,
  reporter: [['html', { open: 'never' }]],
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
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
    command: `npm run build && DATA_DIR="${testDataDir}" DISABLE_PTY=1 node server/index.js`,
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
