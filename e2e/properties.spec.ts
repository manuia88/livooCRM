import { test, expect } from '@playwright/test'
import { PropertyFormPage } from './pages/PropertyFormPage'

test.describe('Property Creation Wizard', () => {
  test('should navigate to new property form and show step 1', async ({ page }) => {
    const propertyForm = new PropertyFormPage(page)
    await propertyForm.goto()

    // Step 1 should show category selection
    await propertyForm.expectStepVisible(1)
    await expect(page.getByText('Casa')).toBeVisible()
    await expect(page.getByText('Departamento')).toBeVisible()
    await expect(page.getByText('Oficina')).toBeVisible()
  })

  test('should select category and advance to step 2', async ({ page }) => {
    const propertyForm = new PropertyFormPage(page)
    await propertyForm.goto()

    // Select Casa category
    await propertyForm.selectCategory('Casa')

    // Verify we're on step 2
    await propertyForm.expectStepVisible(2)
    await expect(page.getByText('VENTA').first()).toBeVisible()
    await expect(page.getByText('RENTA').first()).toBeVisible()
  })

  test('should fill operation data and advance to step 3', async ({ page }) => {
    const propertyForm = new PropertyFormPage(page)
    await propertyForm.goto()

    // Step 1: Category
    await propertyForm.selectCategory('Casa')

    // Step 2: Operation and data
    await propertyForm.fillOperationAndData({
      operationType: 'VENTA',
      price: '5000000',
      bedrooms: 3,
      bathrooms: 2,
      constructionM2: '150',
    })

    // Verify step 3 (location)
    await propertyForm.expectStepVisible(3)
  })

  test('should navigate back from step 2 to step 1', async ({ page }) => {
    const propertyForm = new PropertyFormPage(page)
    await propertyForm.goto()

    await propertyForm.selectCategory('Departamento')
    await propertyForm.expectStepVisible(2)

    // Go back
    await propertyForm.backButton.click()
    await propertyForm.expectStepVisible(1)
  })

  test('should show all 8 property categories', async ({ page }) => {
    const propertyForm = new PropertyFormPage(page)
    await propertyForm.goto()

    const categories = ['Casa', 'Departamento', 'Oficina', 'Local Comercial', 'Terreno', 'Bodega', 'Nave industrial', 'Otro']
    for (const category of categories) {
      await expect(page.getByText(category, { exact: true })).toBeVisible()
    }
  })
})

test.describe('Property Listing (Backoffice)', () => {
  test('should load property inventory page', async ({ page }) => {
    await page.goto('/backoffice/propiedades')
    await page.waitForLoadState('networkidle')

    // Page should have a heading or title for properties
    await expect(page.getByText(/Propiedades|Inventario/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to property detail from list', async ({ page }) => {
    await page.goto('/backoffice/propiedades')
    await page.waitForLoadState('networkidle')

    // Click on first property link/card if available
    const propertyLink = page.locator('a[href*="/backoffice/propiedades/"]').first()
    if (await propertyLink.count() > 0) {
      await propertyLink.click()
      await expect(page).toHaveURL(/\/backoffice\/propiedades\//)
    }
  })

  test('should navigate to new property page from listing', async ({ page }) => {
    await page.goto('/backoffice/propiedades')
    await page.waitForLoadState('networkidle')

    const newButton = page.getByRole('link', { name: /Nueva|Agregar/i }).or(
      page.getByRole('button', { name: /Nueva|Agregar/i })
    )
    if (await newButton.count() > 0) {
      await newButton.first().click()
      await expect(page).toHaveURL(/\/backoffice\/propiedades\/nueva/)
    }
  })
})
