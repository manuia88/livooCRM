import { Page, Locator, expect } from '@playwright/test'

export class PropertyFormPage {
  readonly page: Page
  readonly nextButton: Locator
  readonly backButton: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.nextButton = page.getByRole('button', { name: 'Siguiente' })
    this.backButton = page.getByRole('button', { name: 'Atrás' })
    this.submitButton = page.getByRole('button', { name: 'Crear Propiedad' })
  }

  async goto() {
    await this.page.goto('/backoffice/propiedades/nueva')
    await this.page.waitForLoadState('networkidle')
  }

  // Step 1: Select property category
  async selectCategory(category: string) {
    await this.page.getByText(category, { exact: true }).click()
    await this.nextButton.click()
  }

  // Step 2: Operation type and basic data
  async fillOperationAndData(data: {
    operationType: 'VENTA' | 'RENTA'
    price: string
    bedrooms?: number
    bathrooms?: number
    parking?: number
    constructionM2: string
  }) {
    // Select operation type
    await this.page.getByRole('button', { name: data.operationType }).click()

    // Fill price
    const priceInput = this.page.locator('input').filter({ hasText: '' }).first()
    // Find the currency input - it's typically the first major input
    const inputs = this.page.locator('input[type="text"], input[inputmode="numeric"]')
    const firstInput = inputs.first()
    await firstInput.fill(data.price)

    // Increment bedrooms if specified
    if (data.bedrooms) {
      const bedroomSection = this.page.locator('text=Recámaras').locator('..')
      for (let i = 0; i < data.bedrooms; i++) {
        await bedroomSection.getByRole('button', { name: '+' }).click()
      }
    }

    // Increment bathrooms if specified
    if (data.bathrooms) {
      const bathroomSection = this.page.locator('text=Baños').locator('..').first()
      for (let i = 0; i < data.bathrooms; i++) {
        await bathroomSection.getByRole('button', { name: '+' }).click()
      }
    }

    // Fill construction area
    const m2Input = this.page.locator('input[placeholder="0.00"]').first()
    await m2Input.fill(data.constructionM2)

    await this.nextButton.click()
  }

  // Step 3: Location
  async fillLocation(address: string) {
    // Fill address field if available
    const addressInput = this.page.locator('input[placeholder*="dirección"], input[placeholder*="Dirección"], input[placeholder*="ubicación"]')
    if (await addressInput.count() > 0) {
      await addressInput.first().fill(address)
      await this.page.keyboard.press('Enter')
      await this.page.waitForTimeout(1000)
    }
    await this.nextButton.click()
  }

  // Step 4: Amenities
  async selectAmenities(amenities: string[]) {
    for (const amenity of amenities) {
      const label = this.page.locator(`label:has-text("${amenity}")`)
      if (await label.count() > 0) {
        await label.click()
      }
    }
    await this.nextButton.click()
  }

  // Step 5: Content and photos
  async fillContentAndPhotos(data: { title?: string; description?: string; imagePaths?: string[] }) {
    if (data.title) {
      const titleInput = this.page.getByLabel(/título/i)
      if (await titleInput.count() > 0) {
        await titleInput.fill(data.title)
      }
    }

    if (data.description) {
      const descInput = this.page.getByLabel(/descripción/i)
      if (await descInput.count() > 0) {
        await descInput.fill(data.description)
      }
    }

    if (data.imagePaths && data.imagePaths.length > 0) {
      const fileInput = this.page.locator('input[type="file"]')
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles(data.imagePaths)
        await this.page.waitForTimeout(2000)
      }
    }

    await this.nextButton.click()
  }

  // Step 6: Legal and submit
  async fillLegalAndSubmit(data?: { ownerName?: string; commission?: string }) {
    if (data?.ownerName) {
      const ownerInput = this.page.locator('input').filter({ hasText: '' }).first()
      if (await ownerInput.count() > 0) {
        await ownerInput.fill(data.ownerName)
      }
    }

    await this.submitButton.click()
    await this.page.waitForURL(/\/backoffice\/propiedades/, { timeout: 15000 })
  }

  async expectStepVisible(stepNumber: number) {
    await expect(this.page.getByText(`Paso ${stepNumber}`)).toBeVisible({ timeout: 5000 })
  }
}
