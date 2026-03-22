import { test as base, APIRequestContext } from '@playwright/test';

/**
 * Custom fixture that provides an apiContext and automatically tracks
 * all drawings created via POST /api/drawings during the test.
 * After the test completes, all tracked drawings are deleted via
 * DELETE /api/drawings/:id to prevent test data from accumulating.
 */
export const test = base.extend<{ apiContext: APIRequestContext }>({
  apiContext: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL: 'http://localhost:3000',
    });

    // Track drawing IDs created during this test
    const createdDrawingIds: string[] = [];

    // Wrap the context to intercept POST /api/drawings responses
    const originalPost = ctx.post.bind(ctx);
    ctx.post = async (url: string, options?: any) => {
      const response = await originalPost(url, options);
      if (url === '/api/drawings' && response.ok()) {
        try {
          const body = JSON.parse((await response.body()).toString());
          if (body?.id) {
            createdDrawingIds.push(body.id);
          }
        } catch {
          // Ignore parse errors — don't break the test
        }
      }
      return response;
    };

    await use(ctx);

    // Cleanup: delete all drawings created during this test
    for (const id of createdDrawingIds) {
      try {
        await ctx.delete(`/api/drawings/${id}`);
      } catch {
        // Best-effort cleanup — don't fail the test on cleanup errors
      }
    }

    await ctx.dispose();
  },
});
export { expect } from '@playwright/test';
