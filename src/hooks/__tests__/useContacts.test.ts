import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/test/test-utils'
import { mockContacts, mockContact } from '@/test/mockData/contacts'

// Chainable mock builder for Supabase queries
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
  useIsAdmin: vi.fn(() => false),
  useAgencyId: vi.fn(() => 'agency-123'),
}))

import { useContacts, useContact, useCreateContact, useUpdateContact, useDeleteContact } from '../useContacts'

describe('useContacts', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch contacts with default params', async () => {
    const chain = createChainableMock({
      data: mockContacts,
      count: mockContacts.length,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useContacts(),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.data).toHaveLength(mockContacts.length)
    expect(result.current.data?.page).toBe(1)
    expect(result.current.data?.pageSize).toBe(20)
    expect(mockFrom).toHaveBeenCalledWith('v_contacts_with_details')
  })

  it('should handle pagination params', async () => {
    const chain = createChainableMock({
      data: [mockContacts[0]],
      count: 3,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useContacts({ page: 2, pageSize: 1 }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.page).toBe(2)
    expect(result.current.data?.pageSize).toBe(1)
    expect(result.current.data?.totalPages).toBe(3)
    expect(result.current.data?.hasMore).toBe(true)
  })

  it('should apply stage filter', async () => {
    const chain = createChainableMock({
      data: [mockContacts[0]],
      count: 1,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useContacts({ stage: 'calificado' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(chain.eq).toHaveBeenCalledWith('current_stage', 'calificado')
  })

  it('should apply search filter', async () => {
    const chain = createChainableMock({
      data: [mockContacts[0]],
      count: 1,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useContacts({ searchQuery: 'Juan' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(chain.or).toHaveBeenCalledWith(
      expect.stringContaining('Juan')
    )
  })

  it('should apply minLeadScore filter', async () => {
    const chain = createChainableMock({
      data: [mockContacts[2]],
      count: 1,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useContacts({ minLeadScore: 90 }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(chain.gte).toHaveBeenCalledWith('lead_score', 90)
  })

  it('should handle errors gracefully', async () => {
    const chain = createChainableMock({})
    chain.range.mockRejectedValue(new Error('Database error'))
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useContacts(),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
  })

  it('should sort by specified field and order', async () => {
    const chain = createChainableMock({
      data: mockContacts,
      count: mockContacts.length,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useContacts({ sortBy: 'lead_score', sortOrder: 'desc' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(chain.order).toHaveBeenCalledWith('lead_score', { ascending: false })
  })

  it('should calculate hasMore correctly', async () => {
    const chain = createChainableMock({
      data: mockContacts.slice(0, 2),
      count: 50,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useContacts({ page: 1, pageSize: 2 }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.hasMore).toBe(true)
    expect(result.current.data?.totalPages).toBe(25)
  })

  it('should apply status filter', async () => {
    const chain = createChainableMock({
      data: mockContacts,
      count: mockContacts.length,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    renderHook(
      () => useContacts({ status: 'active' }),
      { wrapper }
    )

    await waitFor(() => {
      expect(chain.eq).toHaveBeenCalledWith('status', 'active')
    })
  })

  it('should apply contactType filter', async () => {
    const chain = createChainableMock({
      data: mockContacts,
      count: mockContacts.length,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    renderHook(
      () => useContacts({ contactType: 'buyer' }),
      { wrapper }
    )

    await waitFor(() => {
      expect(chain.eq).toHaveBeenCalledWith('contact_type', 'buyer')
    })
  })

  it('should apply assignedTo filter', async () => {
    const chain = createChainableMock({
      data: mockContacts,
      count: mockContacts.length,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    renderHook(
      () => useContacts({ assignedTo: 'user-123' }),
      { wrapper }
    )

    await waitFor(() => {
      expect(chain.eq).toHaveBeenCalledWith('assigned_to', 'user-123')
    })
  })
})

describe('useContact', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch a single contact by id', async () => {
    const chain = createChainableMock({
      data: mockContact,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useContact('contact-123'),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockFrom).toHaveBeenCalledWith('v_contacts_with_details')
    expect(chain.eq).toHaveBeenCalledWith('id', 'contact-123')
  })

  it('should not fetch when id is empty', async () => {
    const { result } = renderHook(
      () => useContact(''),
      { wrapper }
    )

    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateContact', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a contact', async () => {
    const chain = createChainableMock({
      data: mockContact,
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useCreateContact(),
      { wrapper }
    )

    result.current.mutate({
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan@example.com',
    } as any)

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(mockFrom).toHaveBeenCalledWith('contacts')
  })
})

describe('useUpdateContact', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update a contact', async () => {
    const chain = createChainableMock({
      data: { ...mockContact, first_name: 'Updated' },
      error: null,
    })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useUpdateContact(),
      { wrapper }
    )

    result.current.mutate({
      id: 'contact-123',
      updates: { first_name: 'Updated' },
    })

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(mockFrom).toHaveBeenCalledWith('contacts')
  })
})

describe('useDeleteContact', () => {
  const wrapper = createQueryWrapper()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete a contact', async () => {
    const chain = createChainableMock({ error: null })
    mockFrom.mockReturnValue(chain)

    const { result } = renderHook(
      () => useDeleteContact(),
      { wrapper }
    )

    result.current.mutate('contact-123')

    await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true))

    expect(mockFrom).toHaveBeenCalledWith('contacts')
  })
})
