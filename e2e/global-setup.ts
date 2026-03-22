import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Playwright global setup: create a temporary data directory for tests
 * so test-created drawings don't pollute the real data/drawings.json.
 */
export default function globalSetup() {
  const testDataDir = join(tmpdir(), 'svg-artist-test-data');
  mkdirSync(testDataDir, { recursive: true });
  writeFileSync(join(testDataDir, 'drawings.json'), JSON.stringify({ drawings: [] }));

  // Store the path so globalTeardown and the webServer can access it
  process.env.TEST_DATA_DIR = testDataDir;
}
