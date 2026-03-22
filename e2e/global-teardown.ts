import { rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Playwright global teardown: remove the temporary test data directory.
 */
export default function globalTeardown() {
  const testDataDir = join(tmpdir(), 'svg-artist-test-data');
  try {
    rmSync(testDataDir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }
}
