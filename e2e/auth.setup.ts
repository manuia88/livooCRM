import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth/user.json')

setup('authenticate', async ({ page }) => {
  await page.goto('/auth')

  // Click login tab
  await page.getByRole('tab', { name: 'Iniciar Sesión' }).click()

  // Fill credentials
  await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL || 'test@livoo.mx')
  await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD || 'TestPassword123!')

  // Submit
  await page.locator('form button[type="submit"]').click()

  // Wait for redirect to backoffice dashboard
  await page.waitForURL(/\/backoffice/, { timeout: 15000 })

  // Verify we're authenticated
  await expect(page.locator('body')).not.toContainText('Iniciar Sesión')

  // Save auth state
  await page.context().storageState({ path: authFile })
})
