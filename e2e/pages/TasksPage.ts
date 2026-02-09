import { Page, Locator, expect } from '@playwright/test'

export class TasksPage {
  readonly page: Page
  readonly newTaskButton: Locator
  readonly filtersButton: Locator
  readonly startQueueButton: Locator
  readonly taskCards: Locator
  readonly emptyState: Locator

  // Metric cards
  readonly pendingCount: Locator
  readonly overdueCount: Locator
  readonly completedCount: Locator

  constructor(page: Page) {
    this.page = page
    this.newTaskButton = page.getByRole('button', { name: 'Nueva tarea' })
    this.filtersButton = page.getByRole('button', { name: 'Filtros' })
    this.startQueueButton = page.getByRole('button', { name: 'Iniciar cola de tareas' })
    this.taskCards = page.locator('[class*="card"], [class*="Card"]').filter({ hasText: /Realizar|Ver detalles/ })
    this.emptyState = page.getByText('¡No tienes tareas pendientes!')
    this.pendingCount = page.getByText('Pendientes').locator('..')
    this.overdueCount = page.getByText('Vencidas').locator('..')
    this.completedCount = page.getByText('Completadas').locator('..')
  }

  async goto() {
    await this.page.goto('/backoffice/tareas')
    await this.page.waitForLoadState('networkidle')
  }

  async createTask(data: {
    title: string
    description?: string
    priority?: 'alta' | 'media' | 'baja'
    dueDate?: string
  }) {
    await this.newTaskButton.click()

    // Wait for dialog
    await this.page.waitForTimeout(500)

    // Fill title
    const titleInput = this.page.locator('input[placeholder*="Ej: Llamar"], input[placeholder*="llamar" i]')
    if (await titleInput.count() > 0) {
      await titleInput.fill(data.title)
    }

    // Fill description
    if (data.description) {
      const descInput = this.page.getByPlaceholder('Describe la tarea...')
      if (await descInput.count() > 0) {
        await descInput.fill(data.description)
      }
    }

    // Select priority
    if (data.priority) {
      const prioritySelect = this.page.locator('select, [role="combobox"]').filter({ hasText: /prioridad|Alta|Media|Baja/i })
      if (await prioritySelect.count() > 0) {
        await prioritySelect.first().click()
        await this.page.getByText(new RegExp(data.priority, 'i')).first().click()
      }
    }

    // Set due date
    if (data.dueDate) {
      const dateButton = this.page.getByRole('button', { name: /Seleccionar fecha/i })
      if (await dateButton.count() > 0) {
        await dateButton.click()
        // Calendar interaction depends on date-picker implementation
        await this.page.waitForTimeout(500)
        await this.page.keyboard.press('Escape')
      }
    }

    // Submit
    const createButton = this.page.getByRole('button', { name: 'Crear tarea' })
    await createButton.click()

    await this.page.waitForLoadState('networkidle')
  }

  async completeTask(taskTitle: string) {
    const taskCard = this.page.locator(`text=${taskTitle}`).locator('..').locator('..')
    const completeButton = taskCard.getByRole('button', { name: 'Realizar' })
    if (await completeButton.count() > 0) {
      await completeButton.click()
    } else {
      // Try dropdown menu
      const menuButton = taskCard.locator('button').last()
      await menuButton.click()
      await this.page.getByText('Marcar como completada').click()
    }
    await this.page.waitForLoadState('networkidle')
  }

  async openFilters() {
    await this.filtersButton.click()
    await this.page.waitForTimeout(300)
  }

  async applyFilters(filters: {
    status?: string
    priority?: string
    type?: string
  }) {
    await this.openFilters()

    if (filters.status) {
      const statusSelect = this.page.locator('select').first()
      await statusSelect.selectOption({ label: filters.status })
    }

    if (filters.priority) {
      const prioritySelect = this.page.locator('select').nth(1)
      await prioritySelect.selectOption({ label: filters.priority })
    }

    const applyButton = this.page.getByRole('button', { name: 'Aplicar filtros' })
    if (await applyButton.count() > 0) {
      await applyButton.click()
    }

    await this.page.waitForLoadState('networkidle')
  }

  async expectTaskVisible(title: string) {
    await expect(this.page.getByText(title).first()).toBeVisible({ timeout: 5000 })
  }

  async expectMetricsVisible() {
    await expect(this.page.getByText('Pendientes')).toBeVisible()
    await expect(this.page.getByText('Vencidas')).toBeVisible()
    await expect(this.page.getByText('Completadas')).toBeVisible()
  }
}
