import { Page, Locator, expect } from '@playwright/test'

export class ContactsPage {
  readonly page: Page
  readonly addContactButton: Locator
  readonly searchInput: Locator
  readonly typeFilter: Locator
  readonly statusFilter: Locator
  readonly contactRows: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    this.page = page
    this.addContactButton = page.getByRole('button', { name: 'Nuevo Contacto' })
    this.searchInput = page.getByPlaceholder(/Buscar por nombre/)
    this.typeFilter = page.locator('select').first()
    this.statusFilter = page.locator('select').nth(1)
    this.contactRows = page.locator('table tbody tr')
    this.emptyState = page.getByText('No se encontraron contactos')
  }

  async goto() {
    await this.page.goto('/backoffice/contactos')
    await this.page.waitForLoadState('networkidle')
  }

  async createContact(data: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }) {
    await this.addContactButton.click()

    // Wait for dialog/form to appear
    await this.page.waitForTimeout(500)

    // Fill form fields - locate by placeholder or label
    const nameInput = this.page.getByPlaceholder(/nombre/i).first()
    if (await nameInput.count() > 0) {
      await nameInput.fill(`${data.firstName} ${data.lastName}`)
    }

    const emailInput = this.page.locator('input[type="email"]')
    if (await emailInput.count() > 0) {
      await emailInput.fill(data.email)
    }

    const phoneInput = this.page.locator('input[type="tel"], input[placeholder*="teléfono" i], input[placeholder*="phone" i]')
    if (await phoneInput.count() > 0) {
      await phoneInput.first().fill(data.phone)
    }

    // Submit
    const saveButton = this.page.getByRole('button', { name: /Guardar|Crear/i })
    await saveButton.click()

    await this.page.waitForLoadState('networkidle')
  }

  async searchContact(query: string) {
    await this.searchInput.fill(query)
    await this.page.keyboard.press('Enter')
    await this.page.waitForLoadState('networkidle')
  }

  async filterByType(type: string) {
    await this.typeFilter.selectOption({ label: type })
    await this.page.waitForLoadState('networkidle')
  }

  async filterByStatus(status: string) {
    await this.statusFilter.selectOption({ label: status })
    await this.page.waitForLoadState('networkidle')
  }

  async getContactCount(): Promise<number> {
    return await this.contactRows.count()
  }

  async clickContact(name: string) {
    await this.page.locator(`table tbody tr:has-text("${name}")`).first().click()
    await this.page.waitForLoadState('networkidle')
  }

  async expectContactVisible(name: string) {
    await expect(this.page.getByText(name).first()).toBeVisible({ timeout: 5000 })
  }

  async openContactMenu(rowIndex: number = 0) {
    const menuButton = this.contactRows.nth(rowIndex).locator('button').last()
    await menuButton.click()
  }
}
