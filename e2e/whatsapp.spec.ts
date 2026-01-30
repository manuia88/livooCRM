import { test, expect } from '@playwright/test';

test.describe('WhatsApp & Inbox Integration', () => {

    test('should navigate to Inbox and show message list UI', async ({ page }) => {
        // Listen to console logs
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err));

        // Navigate to Inbox
        await page.goto('/inbox');
        console.log('Current URL:', page.url());

        // Debug: Layout Check
        // "Messages" might not be an h2 or has different text casing
        // Let's check for any text "Messages" first
        await expect(page.locator('body')).toContainText('Messages');

        // Check if ChatList is rendered
        // It has a specific class or structure? 
        // <h2 className="font-semibold mb-2">Messages</h2>
        // Maybe the sidebar is hidden/collapsed on default viewport?
        // Playwright default viewport is 1280x720, so md+ should be visible.

        // Retry finding the heading
        await expect(page.getByRole('heading', { level: 2, name: 'Messages' })).toBeVisible();

        // Verify Search Input
        await expect(page.getByPlaceholder('Search messages...')).toBeVisible();
    });

});
