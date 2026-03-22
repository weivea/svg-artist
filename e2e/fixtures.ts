import { test as base, APIRequestContext } from '@playwright/test';

export const test = base.extend<{ apiContext: APIRequestContext }>({
  apiContext: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL: 'http://localhost:3000',
    });
    await use(ctx);
    await ctx.dispose();
  },
});
export { expect } from '@playwright/test';
