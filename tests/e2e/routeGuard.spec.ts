import { expect, test } from '@playwright/test';

test('unauthenticated user is redirected to login', async ({ page }) => {
  await page.goto('/app/settings');
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
});
