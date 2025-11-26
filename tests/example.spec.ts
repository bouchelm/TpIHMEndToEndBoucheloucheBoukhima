import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://alexdmr.github.io/l3m-2023-2024-angular-todolist/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://alexdmr.github.io/l3m-2023-2024-angular-todolist/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
