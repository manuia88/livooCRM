import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {

    test('should load Analytics page and show KPIs', async ({ page }) => {
        // Navigate to Analytics
        await page.goto('/analytics');
        console.log('Analytics URL:', page.url());

        await page.waitForLoadState('networkidle');

        // Check Header (with longer timeout for slow queries/hydration)
        await expect(page.getByRole('heading', { name: 'Dashboard Ejecutivo' })).toBeVisible({ timeout: 15000 });

        // Check KPI Cards
        await expect(page.getByText(/Ventas Totales/i).or(page.getByText(/Ingresos Estimados/i))).toBeVisible({ timeout: 15000 });
    });

    test('should switch tabs in Analytics dashboard', async ({ page }) => {
        await page.goto('/analytics');
        await page.waitForLoadState('networkidle');

        // Check Tab Triggers
        await expect(page.getByText('Resumen General')).toBeVisible({ timeout: 15000 });
        await expect(page.getByText('Embudo de Ventas')).toBeVisible({ timeout: 15000 });

        // Click on Funnel Tab
        await page.getByText('Embudo de Ventas').click();

        // Check if Funnel Content is visible
        await expect(page.getByText('Embudo de Ventas (Lead to Close)')).toBeVisible();
    });

    test('should show export buttons', async ({ page }) => {
        await page.goto('/analytics');
        await page.waitForLoadState('networkidle');

        // Check for Export buttons with longer timeout
        await expect(page.getByRole('button', { name: /Exportar/i })).toBeVisible({ timeout: 15000 });
    });

});
