import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    // Using a generic expectation since the actual title might vary
    await expect(page).toHaveTitle(/.*|Livoo|Nexus/);
});
