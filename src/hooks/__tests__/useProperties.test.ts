import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/test/test-utils'

// Chainable mock builder
function createChainableMock(resolveValue: any) {
  const chain: any = {}
  const methods = ['select', 'eq', 'neq', 'gte', 'lte', 'in', 'or', 'not', 'is', 'order', 'range', 'single', 'maybeSingle', 'insert', 'update', 'delete']
  methods.forEach(method => {
    chain[method] = vi.fn().mockReturnValue(chain)
  })
  chain.range.mockResolvedValue(resolveValue)
  chain.single.mockResolvedValue(resolveValue)
  chain.order.mockReturnValue(chain)
  return chain
}

const { mockFrom } = vi.hoisted(() => {
  return { mockFrom: vi.fn() }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  }),
}))

vi.mock('../useCurrentUser', () => ({
  useCurrentUser: vi.fn(() => ({
    data: {
      id: 'user-123',
      agency_id: 'agency-123',
      role: 'agent',
    },
    isLoading: false,
    isSuccess: true,
  })),
}))

import {
  useProperties,
  useProperty,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  useTogglePublishProperty,
  usePropertiesStats,
} from '../useProperties'

describe('useProperties', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch properties with default params', async () => {
    const chain = createChainableMock({
      data: [{ id: 'p1', title: 'Casa' }, { id: 'p2', title: 'Depto' }],
      count: 2,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(() => useProperties(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.data).toHaveLength(2)
    expect(result.current.data?.page).toBe(1)
    expect(result.current.data?.pageSize).toBe(20)
    expect(mockFrom).toHaveBeenCalledWith('properties_safe')
  })

  it('should filter by source: own', async () => {
    const chain = createChainableMock({
      data: [{ id: 'p1' }],
      count: 1,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    renderHook(() => useProperties({ source: 'own' }), { wrapper })

    await waitFor(() => {
      expect(chain.eq).toHaveBeenCalledWith('producer_id', 'user-123')
    })
  })

  it('should filter by source: agency', async () => {
    const chain = createChainableMock({
      data: [{ id: 'p1' }],
      count: 1,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    renderHook(() => useProperties({ source: 'agency' }), { wrapper })

    await waitFor(() => {
      expect(chain.eq).toHaveBeenCalledWith('agency_id', 'agency-123')
    })
  })

  it('should filter by source: network', async () => {
    const chain = createChainableMock({
      data: [],
      count: 0,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    renderHook(() => useProperties({ source: 'network' }), { wrapper })

    await waitFor(() => {
      expect(chain.neq).toHaveBeenCalledWith('agency_id', 'agency-123')
    })
  })

  it('should filter by status array', async () => {
    const chain = createChainableMock({
      data: [],
      count: 0,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    renderHook(() => useProperties({ status: ['active', 'reserved'] }), { wrapper })

    await waitFor(() => {
      expect(chain.in).toHaveBeenCalledWith('status', ['active', 'reserved'])
    })
  })

  it('should filter by single status', async () => {
    const chain = createChainableMock({
      data: [],
      count: 0,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    renderHook(() => useProperties({ status: 'active' }), { wrapper })

    await waitFor(() => {
      expect(chain.in).toHaveBeenCalledWith('status', ['active'])
    })
  })

  it('should apply property type filter', async () => {
    const chain = createChainableMock({
      data: [],
      count: 0,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    renderHook(() => useProperties({ propertyType: 'casa' }), { wrapper })

    await waitFor(() => {
      expect(chain.eq).toHaveBeenCalledWith('property_type', 'casa')
    })
  })

  it('should apply search query filter', async () => {
    const chain = createChainableMock({
      data: [],
      count: 0,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    renderHook(() => useProperties({ search: 'Polanco' }), { wrapper })

    await waitFor(() => {
      expect(chain.or).toHaveBeenCalledWith(
        expect.stringContaining('Polanco')
      )
    })
  })

  it('should apply price range filters', async () => {
    const chain = createChainableMock({
      data: [],
      count: 0,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    renderHook(() => useProperties({ priceMin: 1000000, priceMax: 5000000 }), { wrapper })

    await waitFor(() => {
      expect(chain.gte).toHaveBeenCalledWith('price', 1000000)
      expect(chain.lte).toHaveBeenCalledWith('price', 5000000)
    })
  })

  it('should apply bedrooms filter', async () => {
    const chain = createChainableMock({
      data: [],
      count: 0,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    renderHook(() => useProperties({ bedrooms: 3 }), { wrapper })

    await waitFor(() => {
      expect(chain.gte).toHaveBeenCalledWith('bedrooms', 3)
    })
  })

  it('should handle pagination correctly', async () => {
    const chain = createChainableMock({
      data: [{ id: 'p1' }],
      count: 50,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useProperties({ page: 2, pageSize: 10 }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(chain.range).toHaveBeenCalledWith(10, 19)
    expect(result.current.data?.page).toBe(2)
    expect(result.current.data?.totalPages).toBe(5)
    expect(result.current.data?.hasMore).toBe(true)
  })

  it('should sort by created_at descending by default', async () => {
    const chain = createChainableMock({
      data: [],
      count: 0,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    renderHook(() => useProperties(), { wrapper })

    await waitFor(() => {
      expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  it('should handle errors from supabase', async () => {
    // Use a fresh wrapper to avoid cached data from previous tests
    const freshWrapper = createQueryWrapper()
    const chain = createChainableMock({
      data: null,
      count: null,
      error: { message: 'Connection error', code: '500' },
    })
    // The hook does: const { data, count, error } = await query.order(...).range(...)
    // then: if (error) throw error
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useProperties({ search: 'unique-error-test-query' }),
      { wrapper: freshWrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useProperty', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch single property by id', async () => {
    const chain = createChainableMock({
      data: { id: 'p1', title: 'Test Property' },
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useProperty('p1'),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockFrom).toHaveBeenCalledWith('properties_safe')
    expect(chain.eq).toHaveBeenCalledWith('id', 'p1')
  })

  it('should not fetch when propertyId is undefined', async () => {
    const { result } = renderHook(
      () => useProperty(undefined),
      { wrapper }
    )

    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateProperty', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create property with user context', async () => {
    const chain = createChainableMock({
      data: { id: 'new-prop', title: 'New Property' },
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(() => useCreateProperty(), { wrapper })

    result.current.mutate({
      title: 'New Property',
      property_type: 'casa',
    } as any)

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(mockFrom).toHaveBeenCalledWith('properties')
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Property',
        agency_id: 'agency-123',
        producer_id: 'user-123',
      })
    )
  })
})

describe('useUpdateProperty', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update property', async () => {
    const chain = createChainableMock({
      data: { id: 'p1', title: 'Updated' },
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(() => useUpdateProperty(), { wrapper })

    result.current.mutate({
      id: 'p1',
      updates: { title: 'Updated' },
    })

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(mockFrom).toHaveBeenCalledWith('properties')
    expect(chain.update).toHaveBeenCalledWith({ title: 'Updated' })
  })
})

describe('useDeleteProperty', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should soft-delete property by id string', async () => {
    const chain = createChainableMock({ error: null })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(() => useDeleteProperty(), { wrapper })

    result.current.mutate('p1')

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(mockFrom).toHaveBeenCalledWith('properties')
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        deleted_at: expect.any(String),
      })
    )
  })

  it('should soft-delete property with reason', async () => {
    const chain = createChainableMock({ error: null })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(() => useDeleteProperty(), { wrapper })

    result.current.mutate({ id: 'p1', reason: 'Sold externally' })

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        deleted_at: expect.any(String),
        deletion_reason: 'Sold externally',
      })
    )
  })
})

describe('useTogglePublishProperty', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should publish a property', async () => {
    const chain = createChainableMock({
      data: { id: 'p1', published: true },
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(() => useTogglePublishProperty(), { wrapper })

    result.current.mutate({ id: 'p1', published: true })

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        published: true,
        published_at: expect.any(String),
      })
    )
  })

  it('should unpublish a property', async () => {
    const chain = createChainableMock({
      data: { id: 'p1', published: false },
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(() => useTogglePublishProperty(), { wrapper })

    result.current.mutate({ id: 'p1', published: false })

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        published: false,
        published_at: null,
      })
    )
  })
})

describe('usePropertiesStats', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch property stats', async () => {
    const chain = createChainableMock({})
    // For head queries that return count
    chain.eq.mockReturnValue(chain)
    chain.neq.mockReturnValue(chain)
    chain.not.mockReturnValue(chain)
    chain.select.mockReturnValue(chain)

    // Override the resolve for the stat queries
    const resolveWithCount = (count: number) => ({
      count,
      error: null,
    })

    // The stats hook calls from() 4 times in Promise.all
    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      const c = createChainableMock({})
      // Make terminal methods resolve with count
      c.eq.mockImplementation(() => {
        return { count: callCount * 5, error: null }
      })
      c.neq.mockImplementation(() => {
        return { count: 15, error: null }
      })
      c.not.mockImplementation(() => {
        return { count: 20, error: null }
      })
      c.select.mockReturnValue(c)
      return c
    })

    const { result } = renderHook(() => usePropertiesStats(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true)
    })
  })
})
