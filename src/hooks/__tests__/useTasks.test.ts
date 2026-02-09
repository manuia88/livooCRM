import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/test/test-utils'
import { mockTasks, mockTask, mockTaskMetrics } from '@/test/mockData/tasks'

// Chainable mock builder for Supabase queries
function createChainableMock(resolveValue: any) {
  const chain: any = {}
  const methods = ['select', 'eq', 'neq', 'gte', 'lte', 'in', 'or', 'not', 'is', 'order', 'range', 'single', 'maybeSingle', 'insert', 'update', 'delete', 'limit']
  methods.forEach(method => {
    chain[method] = vi.fn().mockReturnValue(chain)
  })
  chain.range.mockResolvedValue(resolveValue)
  chain.single.mockResolvedValue(resolveValue)
  chain.order.mockReturnValue(chain)
  return chain
}

const { mockFrom, mockAuthGetUser } = vi.hoisted(() => {
  return { mockFrom: vi.fn(), mockAuthGetUser: vi.fn() }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    auth: {
      getUser: mockAuthGetUser,
    },
  }),
}))

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}))

import { useTasks, useTask, useTaskMetrics, useCreateTask, useCompleteTask, useDeleteTask, usePostponeTask } from '../useTasks'

describe('useTasks', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch tasks with default params', async () => {
    const chain = createChainableMock({
      data: mockTasks,
      count: mockTasks.length,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useTasks(),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.data).toHaveLength(mockTasks.length)
    expect(result.current.data?.page).toBe(1)
    expect(result.current.data?.pageSize).toBe(20)
    expect(mockFrom).toHaveBeenCalledWith('v_tasks_with_details')
  })

  it('should apply status filter', async () => {
    const chain = createChainableMock({
      data: [mockTasks[0]],
      count: 1,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useTasks({ status: 'pendiente' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(chain.eq).toHaveBeenCalledWith('status', 'pendiente')
  })

  it('should apply priority filter', async () => {
    const chain = createChainableMock({
      data: [mockTasks[0]],
      count: 1,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useTasks({ priority: 'alta' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(chain.eq).toHaveBeenCalledWith('priority', 'alta')
  })

  it('should apply search query filter', async () => {
    const chain = createChainableMock({
      data: [mockTasks[0]],
      count: 1,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useTasks({ searchQuery: 'Llamar' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(chain.or).toHaveBeenCalledWith(
      expect.stringContaining('Llamar')
    )
  })

  it('should sort by due_date ascending by default', async () => {
    const chain = createChainableMock({
      data: mockTasks,
      count: mockTasks.length,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useTasks(),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(chain.order).toHaveBeenCalledWith('due_date', { ascending: true })
  })

  it('should handle pagination correctly', async () => {
    const chain = createChainableMock({
      data: [mockTasks[0]],
      count: 100,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useTasks({ page: 3, pageSize: 10 }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.page).toBe(3)
    expect(result.current.data?.totalPages).toBe(10)
    expect(result.current.data?.hasMore).toBe(true)
    expect(chain.range).toHaveBeenCalledWith(20, 29)
  })

  it('should handle errors', async () => {
    const chain = createChainableMock({})
    chain.range.mockRejectedValue(new Error('DB Error'))
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useTasks(),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('should apply assignedTo filter', async () => {
    const chain = createChainableMock({
      data: [mockTasks[0]],
      count: 1,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useTasks({ assignedTo: 'user-123' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(chain.eq).toHaveBeenCalledWith('assigned_to', 'user-123')
  })
})

describe('useTask', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single task by id', async () => {
    const chain = createChainableMock({
      data: mockTask,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useTask('task-123'),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockFrom).toHaveBeenCalledWith('v_tasks_with_details')
    expect(chain.eq).toHaveBeenCalledWith('id', 'task-123')
  })

  it('should not fetch when taskId is null', async () => {
    const { result } = renderHook(
      () => useTask(null),
      { wrapper }
    )

    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useTaskMetrics', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch task metrics for current user', async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    const chain = createChainableMock({
      data: {
        total_tasks_assigned: 50,
        tasks_completed: 35,
        tasks_completed_on_time: 30,
        tasks_completed_late: 5,
        tasks_overdue: 3,
        avg_completion_time_minutes: 120,
        ranking_position: 2,
        total_agents: 10,
      },
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useTaskMetrics(),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.completion_rate).toBeDefined()
    expect(mockFrom).toHaveBeenCalledWith('task_performance_metrics')
  })

  it('should throw when user is not authenticated', async () => {
    // Use fresh wrapper to avoid cache from previous test
    const freshWrapper = createQueryWrapper()
    mockAuthGetUser.mockResolvedValue({
      data: { user: null },
    })

    const { result } = renderHook(
      () => useTaskMetrics(),
      { wrapper: freshWrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('Not authenticated')
  })
})

describe('useCreateTask', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a task', async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    })

    const chain = createChainableMock({
      data: mockTask,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useCreateTask(),
      { wrapper }
    )

    result.current.mutate({
      title: 'New task',
      priority: 'alta',
      status: 'pendiente',
    } as any)

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(mockFrom).toHaveBeenCalledWith('tasks')
  })

  it('should fail when not authenticated', async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: null },
    })

    const { result } = renderHook(
      () => useCreateTask(),
      { wrapper }
    )

    result.current.mutate({
      title: 'New task',
    } as any)

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error?.message).toBe('Not authenticated')
  })
})

describe('useCompleteTask', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete a task', async () => {
    const chain = createChainableMock({
      data: { ...mockTask, status: 'completada' },
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useCompleteTask(),
      { wrapper }
    )

    result.current.mutate('task-123')

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(mockFrom).toHaveBeenCalledWith('tasks')
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'completada',
        completed_at: expect.any(String),
      })
    )
  })
})

describe('useDeleteTask', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should soft-delete a task', async () => {
    const chain = createChainableMock({
      data: mockTask,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useDeleteTask(),
      { wrapper }
    )

    result.current.mutate('task-123')

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(mockFrom).toHaveBeenCalledWith('tasks')
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        deleted_at: expect.any(String),
      })
    )
  })
})

describe('usePostponeTask', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should postpone a task to a new date', async () => {
    const chain = createChainableMock({
      data: { ...mockTask, status: 'pospuesta' },
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const postponeDate = new Date('2024-02-01T10:00:00Z')

    const { result } = renderHook(
      () => usePostponeTask(),
      { wrapper }
    )

    result.current.mutate({
      taskId: 'task-123',
      postponeUntil: postponeDate,
    })

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'pospuesta',
        postponed_until: postponeDate.toISOString(),
      })
    )
  })
})
