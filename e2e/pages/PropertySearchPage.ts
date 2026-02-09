import { Page, Locator, expect } from '@playwright/test'

export class PropertySearchPage {
  readonly page: Page
  readonly filterButton: Locator
  readonly priceDropdown: Locator
  readonly propertyTypeDropdown: Locator
  readonly sortDropdown: Locator
  readonly propertyCards: Locator
  readonly mapToggle: Locator
  readonly createAlertButton: Locator

  constructor(page: Page) {
    this.page = page
    this.filterButton = page.getByRole('button', { name: 'Filtrar' })
    this.priceDropdown = page.getByRole('button', { name: /Precio/i })
    this.propertyTypeDropdown = page.getByRole('button', { name: /Tipo/i })
    this.sortDropdown = page.getByText('Lo más relevante')
    this.propertyCards = page.locator('a[href*="/propiedades/"], [class*="card"]').filter({ hasText: /\$|MXN|USD/ })
    this.mapToggle = page.getByRole('button', { name: /mapa/i })
    this.createAlertButton = page.getByRole('button', { name: /Crear alerta/i })
  }

  async goto(queryParams?: string) {
    const url = queryParams ? `/propiedades?${queryParams}` : '/propiedades'
    await this.page.goto(url)
    await this.page.waitForLoadState('networkidle')
  }

  async filterByPriceRange(min: string, max: string) {
    await this.priceDropdown.click()
    await this.page.waitForTimeout(300)

    const minInput = this.page.getByPlaceholder(/mínimo/i)
    const maxInput = this.page.getByPlaceholder(/máximo/i)

    if (await minInput.count() > 0) {
      await minInput.fill(min)
    }
    if (await maxInput.count() > 0) {
      await maxInput.fill(max)
    }

    // Close dropdown
    await this.page.keyboard.press('Escape')
    await this.page.waitForLoadState('networkidle')
  }

  async filterByPropertyType(type: string) {
    await this.propertyTypeDropdown.click()
    await this.page.waitForTimeout(300)

    await this.page.getByText(type, { exact: true }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async filterByBedrooms(count: string) {
    const caracteristicas = this.page.getByRole('button', { name: /Características/i })
    await caracteristicas.click()
    await this.page.waitForTimeout(300)

    const bedroomButton = this.page.locator('text=Recámaras').locator('..').getByRole('button', { name: count })
    if (await bedroomButton.count() > 0) {
      await bedroomButton.click()
    }

    await this.page.keyboard.press('Escape')
    await this.page.waitForLoadState('networkidle')
  }

  async sortBy(option: string) {
    await this.sortDropdown.click()
    await this.page.getByText(option).click()
    await this.page.waitForLoadState('networkidle')
  }

  async toggleMapView() {
    await this.mapToggle.click()
    await this.page.waitForTimeout(500)
  }

  async getPropertyCount(): Promise<number> {
    return await this.propertyCards.count()
  }

  async clickFirstProperty() {
    await this.propertyCards.first().click()
    await this.page.waitForLoadState('networkidle')
  }

  async expectResultsCount() {
    await expect(this.page.getByText(/\d+ propiedades?/)).toBeVisible({ timeout: 10000 })
  }

  async expectPropertyDetailPage() {
    await expect(this.page).toHaveURL(/\/propiedades\//)
  }
}
