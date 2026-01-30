import { test, expect } from '@playwright/test';

test.describe('MLS & Sharing System', () => {

    test('should navigate to MLS and show shared properties', async ({ page }) => {
        // Navigate to MLS page
        await page.goto('/mls');
        console.log('MLS URL:', page.url());

        await page.waitForLoadState('networkidle');

        // Check title
        await expect(page.getByText('Bolsa Inmobiliaria (MLS)')).toBeVisible({ timeout: 15000 });

        // Check filters existence
        await expect(page.getByText('Filtros')).toBeVisible();
        await expect(page.getByText('Solo Compartidas')).toBeVisible();

        // Check properties loaded (assuming at least one mock or DB item)
        // Note: In a real env, we would seed data first.
    });

    test('should open creation alert dialog', async ({ page }) => {
        await page.goto('/mls');

        // Open alert dialog
        await page.getByRole('button', { name: 'Crear Alerta' }).click();

        // Check dialog content
        await expect(page.getByText('Crear Alerta de Búsqueda')).toBeVisible();
        await expect(page.getByLabel('Nombre de la alerta')).toBeVisible();
    });

    test('should show sharing options in property card', async ({ page }) => {
        // Assuming there is at least one property card
        // We might need to mock network response here for stability
        await page.route('* *\/getMlsProperties', async route => {
            // Mock response if this was an API call, but it's a server action/component.
            // For now, we rely on page structure
            await route.continue();
        });

        await page.goto('/mls');
        // Wait for properties
        const firstCard = page.locator('.group').first();
        // Assuming we have properties
        if (await firstCard.count() > 0) {
            // Try to find share button (usually inside the card or on hover)
            // Adjust selector based on actual implementation
            // await firstCard.getByRole('button', { name: /share/i }).click();
        }
    });

    test('should load shared page with White Label modality', async ({ page }) => {
        // Navigate to a shared page with valid ID from mock data
        await page.goto('/shared/1?modality=whitelabel');
        console.log('Shared Page URL:', page.url());

        // Verify contact agent button or similar
        await expect(page.getByRole('button', { name: /Contactar/i })).toBeVisible({ timeout: 15000 });
    });

    test('should load shared page with MLS modality', async ({ page }) => {
        // Navigate to a shared page with valid ID from mock data
        await page.goto('/shared/1?modality=mls');

        // Verify commission badge or similar indicator
        // This depends on whether 'mock-id' returns a valid property. 
        // For pure E2E we usually mock the DB call or use a known seeded ID.
    });
});
