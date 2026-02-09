import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'

test.describe('Authentication Flow', () => {
  test('should display auth page with all tabs', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await expect(loginPage.loginTab).toBeVisible()
    await expect(loginPage.registerTab).toBeVisible()
    await expect(loginPage.magicLinkTab).toBeVisible()
    await expect(loginPage.resetTab).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.login(
      process.env.TEST_USER_EMAIL || 'test@livoo.mx',
      process.env.TEST_USER_PASSWORD || 'TestPassword123!'
    )

    await loginPage.waitForDashboard()
    await expect(page).toHaveURL(/\/backoffice/)
  })

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.login('nonexistent@test.com', 'WrongPassword123!')

    // Should stay on auth page and show an error
    await expect(page).toHaveURL(/\/auth/)
    await loginPage.expectLoginError()
  })

  test('should show validation errors on empty login form', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    // Click login tab then submit without filling
    await loginPage.loginTab.click()
    await page.locator('form button[type="submit"]').click()

    await loginPage.expectValidationError('Email inválido')
    await loginPage.expectValidationError('La contraseña debe tener al menos 6 caracteres')
  })

  test('should switch to register tab and show validation errors', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.switchToRegister()

    // Verify register form fields are visible
    await expect(page.getByPlaceholder('Nombre Completo')).toBeVisible()
    await expect(page.getByPlaceholder('Confirmar Contraseña')).toBeVisible()

    // Submit empty form
    await page.getByRole('button', { name: 'Crear Cuenta' }).click()

    await loginPage.expectValidationError('El nombre debe tener al menos 2 caracteres')
    await loginPage.expectValidationError('Email inválido')
  })

  test('should show password requirements on register tab', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.switchToRegister()

    // Password requirements should be visible
    await expect(page.getByText(/8 caracteres|1 mayúscula|1 número/i)).toBeVisible()
  })

  test('should navigate to magic link tab', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.magicLinkTab.click()

    await expect(page.getByPlaceholder('tu@email.com')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Enviar Enlace Mágico' })).toBeVisible()
  })

  test('should navigate to password reset tab', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.resetTab.click()

    await expect(page.getByPlaceholder('tu@email.com')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Enviar Instrucciones' })).toBeVisible()
  })
})
