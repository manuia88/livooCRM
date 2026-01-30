import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

    test('should navigate to auth page', async ({ page }) => {
        await page.goto('/auth');
        await expect(page).toHaveURL(/\/auth/);

        // Verifica que existan los tabs de Login/Registro
        await expect(page.getByRole('tab', { name: 'Iniciar Sesión' })).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Registrarse' })).toBeVisible();
    });

    test('should show validation errors on empty login', async ({ page }) => {
        await page.goto('/auth');

        // Asegurarse de estar en la tab de Login
        await page.getByRole('tab', { name: 'Iniciar Sesión' }).click();

        // Intentar submit vacío
        await page.locator('form').getByRole('button', { name: 'Iniciar Sesión' }).click();

        // Verificar mensajes de error de Zod
        await expect(page.getByText('Email inválido')).toBeVisible();
        await expect(page.getByText('La contraseña debe tener al menos 6 caracteres')).toBeVisible();
    });

    test('should switch to register tab and show validation', async ({ page }) => {
        await page.goto('/auth');

        // Cambiar a tab Registro
        await page.getByRole('tab', { name: 'Registrarse' }).click();

        // Verificar campos de registro
        await expect(page.getByPlaceholder('Nombre completo')).toBeVisible();
        await expect(page.getByPlaceholder('Email')).toBeVisible();

        // Intentar submit vacío
        await page.getByRole('button', { name: 'Crear Cuenta' }).click();

        // Verificar validaciones específicas de registro
        await expect(page.getByText('El nombre debe tener al menos 2 caracteres')).toBeVisible();
        await expect(page.getByText('Email inválido')).toBeVisible();
    });

});
