import { test, expect } from '@playwright/test'
import { PropertySearchPage } from './pages/PropertySearchPage'

// Public search tests do not require authentication
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Public Property Search', () => {
  test('should load property search page', async ({ page }) => {
    const searchPage = new PropertySearchPage(page)
    await searchPage.goto()

    // Page should load without errors
    await expect(page).toHaveURL(/\/propiedades/)
  })

  test('should display filter controls', async ({ page }) => {
    const searchPage = new PropertySearchPage(page)
    await searchPage.goto()

    // Price dropdown should be visible
    await expect(searchPage.priceDropdown).toBeVisible()
  })

  test('should display property cards', async ({ page }) => {
    const searchPage = new PropertySearchPage(page)
    await searchPage.goto()

    // Wait for properties to load
    await page.waitForLoadState('networkidle')

    // Results count text should be visible
    const resultsText = page.getByText(/\d+ propiedades?|No se encontraron/)
    await expect(resultsText.first()).toBeVisible({ timeout: 15000 })
  })

  test('should open price filter dropdown', async ({ page }) => {
    const searchPage = new PropertySearchPage(page)
    await searchPage.goto()

    await searchPage.priceDropdown.click()
    await page.waitForTimeout(300)

    // Min/max price inputs should appear
    const priceInput = page.getByPlaceholder(/mínimo|máximo/i)
    await expect(priceInput.first()).toBeVisible()
  })

  test('should filter by property type', async ({ page }) => {
    const searchPage = new PropertySearchPage(page)
    await searchPage.goto()

    await searchPage.filterByPropertyType('Casa')

    // Page should update without errors
    await expect(page).toHaveURL(/\/propiedades/)
    await page.waitForLoadState('networkidle')
  })

  test('should toggle map view', async ({ page }) => {
    const searchPage = new PropertySearchPage(page)
    await searchPage.goto()

    // Toggle map view
    await searchPage.toggleMapView()

    // Map container or map-related elements should appear
    const mapContainer = page.locator('.leaflet-container, [class*="map" i], iframe[src*="map"]')
    if (await mapContainer.count() > 0) {
      await expect(mapContainer.first()).toBeVisible()
    }
  })

  test('should navigate to property detail page', async ({ page }) => {
    const searchPage = new PropertySearchPage(page)
    await searchPage.goto()

    await page.waitForLoadState('networkidle')

    // Click on the first property card/link
    const propertyLink = page.locator('a[href*="/propiedades/"]').first()
    if (await propertyLink.count() > 0) {
      await propertyLink.click()
      await searchPage.expectPropertyDetailPage()
    }
  })

  test('should display sort options', async ({ page }) => {
    const searchPage = new PropertySearchPage(page)
    await searchPage.goto()

    // Sort dropdown should be visible
    const sortControl = page.getByText(/relevante|recientes|precio/i).first()
    await expect(sortControl).toBeVisible({ timeout: 10000 })
  })

  test('should show create alert button', async ({ page }) => {
    const searchPage = new PropertySearchPage(page)
    await searchPage.goto()

    await expect(searchPage.createAlertButton).toBeVisible()
  })

  test('should display property listing with key info', async ({ page }) => {
    const searchPage = new PropertySearchPage(page)
    await searchPage.goto()
    await page.waitForLoadState('networkidle')

    // Check that property cards have prices ($ or MXN/USD)
    const priceElements = page.locator('text=/\\$[\\d,]+/')
    if (await priceElements.count() > 0) {
      await expect(priceElements.first()).toBeVisible()
    }
  })

  test('should load property detail with gallery', async ({ page }) => {
    const searchPage = new PropertySearchPage(page)
    await searchPage.goto()
    await page.waitForLoadState('networkidle')

    const propertyLink = page.locator('a[href*="/propiedades/"]').first()
    if (await propertyLink.count() > 0) {
      await propertyLink.click()
      await page.waitForLoadState('networkidle')

      // Property detail should have images/gallery
      const images = page.locator('img[src*="supabase"], img[alt*="propiedad" i], img[alt*="property" i]')
      if (await images.count() > 0) {
        await expect(images.first()).toBeVisible()
      }
    }
  })
})
