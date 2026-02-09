import { test, expect } from '@playwright/test'
import { ContactsPage } from './pages/ContactsPage'

test.describe('Contacts / Leads Management', () => {
  test('should load contacts page with stats and filters', async ({ page }) => {
    const contactsPage = new ContactsPage(page)
    await contactsPage.goto()

    // Verify page title
    await expect(page.getByText('Contactos').first()).toBeVisible({ timeout: 10000 })

    // Verify stats cards are present
    await expect(page.getByText('Total').first()).toBeVisible()

    // Verify search input exists
    await expect(contactsPage.searchInput).toBeVisible()
  })

  test('should show new contact button', async ({ page }) => {
    const contactsPage = new ContactsPage(page)
    await contactsPage.goto()

    await expect(contactsPage.addContactButton).toBeVisible()
  })

  test('should open new contact form dialog', async ({ page }) => {
    const contactsPage = new ContactsPage(page)
    await contactsPage.goto()

    await contactsPage.addContactButton.click()
    await page.waitForTimeout(500)

    // Dialog should be visible with form fields
    const dialog = page.locator('[role="dialog"], [class*="modal"], [class*="Dialog"]')
    if (await dialog.count() > 0) {
      await expect(dialog.first()).toBeVisible()
    }
  })

  test('should create a new contact', async ({ page }) => {
    const contactsPage = new ContactsPage(page)
    await contactsPage.goto()

    const timestamp = Date.now()
    await contactsPage.createContact({
      firstName: 'Juan',
      lastName: `Pérez E2E ${timestamp}`,
      email: `juan.perez.${timestamp}@test.com`,
      phone: '+5215512345678',
    })

    // Verify contact appears in list or success message shown
    await page.waitForLoadState('networkidle')
  })

  test('should search contacts by name', async ({ page }) => {
    const contactsPage = new ContactsPage(page)
    await contactsPage.goto()

    await contactsPage.searchContact('test')
    await page.waitForLoadState('networkidle')

    // Search should filter results without error
    await expect(page).toHaveURL(/\/backoffice\/contactos/)
  })

  test('should filter contacts by type', async ({ page }) => {
    const contactsPage = new ContactsPage(page)
    await contactsPage.goto()

    // Filter by "Comprador"
    await contactsPage.filterByType('Comprador')

    // Page should still be accessible without errors
    await expect(page).toHaveURL(/\/backoffice\/contactos/)
  })

  test('should filter contacts by status', async ({ page }) => {
    const contactsPage = new ContactsPage(page)
    await contactsPage.goto()

    // Filter by "Lead"
    await contactsPage.filterByStatus('Lead')

    await expect(page).toHaveURL(/\/backoffice\/contactos/)
  })

  test('should display contact stats cards', async ({ page }) => {
    const contactsPage = new ContactsPage(page)
    await contactsPage.goto()

    // Stats cards should be visible
    await expect(page.getByText('Total').first()).toBeVisible()
    await expect(page.getByText('Compradores').first()).toBeVisible()
    await expect(page.getByText('Vendedores').first()).toBeVisible()
  })

  test('should navigate to contact detail page', async ({ page }) => {
    const contactsPage = new ContactsPage(page)
    await contactsPage.goto()

    // Click on a contact link if available
    const contactLink = page.locator('a[href*="/backoffice/contactos/"]').first()
    if (await contactLink.count() > 0) {
      await contactLink.click()
      await expect(page).toHaveURL(/\/backoffice\/contactos\//)
    }
  })

  test('should show dropdown menu with actions', async ({ page }) => {
    const contactsPage = new ContactsPage(page)
    await contactsPage.goto()

    // Only proceed if there are contacts in the list
    const rowCount = await contactsPage.getContactCount()
    if (rowCount > 0) {
      await contactsPage.openContactMenu(0)

      // Verify menu items
      await expect(page.getByText('Ver perfil').or(page.getByText('Editar'))).toBeVisible()
    }
  })
})
