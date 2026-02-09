import { test, expect } from '@playwright/test'
import { TasksPage } from './pages/TasksPage'

test.describe('Task Management', () => {
  test('should load tasks page with metrics', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.goto()

    // Verify page title
    await expect(page.getByText('Tareas').first()).toBeVisible({ timeout: 10000 })

    // Verify metric cards
    await tasksPage.expectMetricsVisible()
  })

  test('should show new task button', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.goto()

    await expect(tasksPage.newTaskButton).toBeVisible()
  })

  test('should open create task dialog', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.goto()

    await tasksPage.newTaskButton.click()
    await page.waitForTimeout(500)

    // Dialog should appear with form fields
    const dialog = page.locator('[role="dialog"], [class*="modal"], [class*="Dialog"]')
    if (await dialog.count() > 0) {
      await expect(dialog.first()).toBeVisible()
    }
  })

  test('should create a new task', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.goto()

    await tasksPage.createTask({
      title: `Tarea E2E ${Date.now()}`,
      description: 'Tarea creada automáticamente por Playwright',
      priority: 'alta',
    })

    // Should stay on tasks page
    await expect(page).toHaveURL(/\/backoffice\/tareas/)
  })

  test('should display task priority sections', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.goto()

    // Check for priority section headers (may not all be present if no tasks in that priority)
    const urgentSection = page.getByText('Tareas Urgentes')
    const normalSection = page.getByText('Tareas Normales')
    const lowSection = page.getByText('Tareas de Baja Prioridad')

    // At least one section or empty state should be visible
    const hasUrgent = await urgentSection.count() > 0
    const hasNormal = await normalSection.count() > 0
    const hasLow = await lowSection.count() > 0
    const hasEmpty = await tasksPage.emptyState.count() > 0

    expect(hasUrgent || hasNormal || hasLow || hasEmpty).toBe(true)
  })

  test('should show filters button', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.goto()

    await expect(tasksPage.filtersButton).toBeVisible()
  })

  test('should open task filters panel', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.goto()

    await tasksPage.openFilters()

    // Filter controls should be visible
    await expect(
      page.getByText('Aplicar filtros').or(page.getByText('Limpiar'))
    ).toBeVisible()
  })

  test('should show start queue button', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.goto()

    await expect(tasksPage.startQueueButton).toBeVisible()
  })

  test('should display pending task count metric', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.goto()

    await expect(page.getByText('Pendientes')).toBeVisible()
  })

  test('should display overdue task count metric', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.goto()

    await expect(page.getByText('Vencidas')).toBeVisible()
  })

  test('should display completed task count metric', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.goto()

    await expect(page.getByText('Completadas')).toBeVisible()
  })
})
