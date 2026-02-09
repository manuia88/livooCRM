import { Page, Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly loginTab: Locator
  readonly registerTab: Locator
  readonly magicLinkTab: Locator
  readonly resetTab: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.loginTab = page.getByRole('tab', { name: 'Iniciar Sesión' })
    this.registerTab = page.getByRole('tab', { name: 'Registrarse' })
    this.magicLinkTab = page.getByRole('tab', { name: 'Magic Link' })
    this.resetTab = page.getByRole('tab', { name: 'Recuperar' })
    this.emailInput = page.locator('input[type="email"]')
    this.passwordInput = page.locator('input[type="password"]')
    this.submitButton = page.locator('form button[type="submit"]')
    this.errorMessage = page.locator('.bg-red-500\\/20, [role="alert"]')
  }

  async goto() {
    await this.page.goto('/auth')
  }

  async login(email: string, password: string) {
    await this.loginTab.click()
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async waitForDashboard() {
    await this.page.waitForURL(/\/backoffice/, { timeout: 15000 })
  }

  async expectValidationError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible({ timeout: 5000 })
  }

  async expectLoginError() {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 })
  }

  async switchToRegister() {
    await this.registerTab.click()
  }

  async register(data: { name: string; email: string; password: string; confirmPassword: string }) {
    await this.registerTab.click()
    await this.page.getByPlaceholder('Nombre Completo').fill(data.name)
    await this.page.getByPlaceholder('Email').fill(data.email)
    await this.page.getByPlaceholder('Contraseña').fill(data.password)
    await this.page.getByPlaceholder('Confirmar Contraseña').fill(data.confirmPassword)
    await this.page.getByRole('button', { name: 'Crear Cuenta' }).click()
  }

  async requestMagicLink(email: string) {
    await this.magicLinkTab.click()
    await this.page.getByPlaceholder('tu@email.com').fill(email)
    await this.page.getByRole('button', { name: 'Enviar Enlace Mágico' }).click()
  }

  async requestPasswordReset(email: string) {
    await this.resetTab.click()
    await this.page.getByPlaceholder('tu@email.com').fill(email)
    await this.page.getByRole('button', { name: 'Enviar Instrucciones' }).click()
  }

  async logout() {
    // Navigate to dashboard first if not already there
    if (!this.page.url().includes('/backoffice')) {
      await this.page.goto('/backoffice')
    }
    // Look for user menu / logout button
    const userMenu = this.page.locator('button:has([class*="LogOut"]), button:has-text("Cerrar sesión"), [data-testid="user-menu"]')
    if (await userMenu.count() > 0) {
      await userMenu.first().click()
      // If it's a dropdown, click the logout option
      const logoutOption = this.page.getByText('Cerrar sesión')
      if (await logoutOption.isVisible()) {
        await logoutOption.click()
      }
    }
  }
}
