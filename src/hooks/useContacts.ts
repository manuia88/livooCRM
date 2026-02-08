'use client'

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface Contact {
    id: string
    first_name: string
    last_name?: string
    full_name: string
    email?: string
    phone?: string
    whatsapp?: string
    contact_type: string
    source?: string
    status: string
    lead_score: number
    current_stage: string
    assigned_to?: string
    assigned_to_name?: string
    created_at: string
    updated_at: string
    last_interaction?: string
}

export interface UseContactsParams {
    page?: number
    pageSize?: number
    stage?: string
    status?: string
    contactType?: string
    minLeadScore?: number
    assignedTo?: string
    searchQuery?: string
    sortBy?: 'lead_score' | 'created_at' | 'updated_at'
    sortOrder?: 'asc' | 'desc'
}

export interface ContactsResponse {
    data: Contact[]
    count: number
    page: number
    pageSize: number
    totalPages: number
    hasMore: boolean
}

export function useContacts(params: UseContactsParams = {}) {
    const {
        page = 1,
        pageSize = 20,
        stage,
        status,
        contactType,
        minLeadScore,
        assignedTo,
        searchQuery,
        sortBy = 'created_at',
        sortOrder = 'desc'
    } = params

    return useQuery<ContactsResponse>({
        queryKey: ['contacts', { page, pageSize, stage, status, contactType, minLeadScore, assignedTo, searchQuery, sortBy, sortOrder }],
        queryFn: async () => {
            const from = (page - 1) * pageSize
            const to = from + pageSize - 1

            let query = supabase
                .from('v_contacts_with_details')
                .select('*', { count: 'exact' })

            if (stage) query = query.eq('current_stage', stage)
            if (status) query = query.eq('status', status)
            if (contactType) query = query.eq('contact_type', contactType)
            if (minLeadScore) query = query.gte('lead_score', minLeadScore)
            if (assignedTo) query = query.eq('assigned_to', assignedTo)

            if (searchQuery) {
                query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
            }

            const { data, count, error } = await query
                .order(sortBy, { ascending: sortOrder === 'asc' })
                .range(from, to)

            if (error) throw error

            const totalPages = count ? Math.ceil(count / pageSize) : 0

            return {
                data: (data as Contact[]) || [],
                count: count || 0,
                page,
                pageSize,
                totalPages,
                hasMore: page < totalPages
            }
        },
        placeholderData: keepPreviousData,
        staleTime: 2 * 60 * 1000,
    })
}

export function usePrefetchContacts() {
    const queryClient = useQueryClient()

    return (params: UseContactsParams = {}) => {
        const { page = 1, pageSize = 20 } = params
        const nextPage = page + 1

        return queryClient.prefetchQuery({
            queryKey: ['contacts', { ...params, page: nextPage, pageSize }],
            queryFn: async () => {
                const from = page * pageSize
                const to = from + pageSize - 1

                let query = supabase
                    .from('v_contacts_with_details')
                    .select('*', { count: 'exact' })

                if (params.stage) query = query.eq('current_stage', params.stage)
                if (params.status) query = query.eq('status', params.status)
                if (params.contactType) query = query.eq('contact_type', params.contactType)
                if (params.minLeadScore) query = query.gte('lead_score', params.minLeadScore)
                if (params.assignedTo) query = query.eq('assigned_to', params.assignedTo)

                if (params.searchQuery) {
                    query = query.or(`full_name.ilike.%${params.searchQuery}%,email.ilike.%${params.searchQuery}%,phone.ilike.%${params.searchQuery}%`)
                }

                const { data, count, error } = await query
                    .order(params.sortBy || 'created_at', { ascending: params.sortOrder === 'asc' })
                    .range(from, to)

                if (error) throw error

                const totalPages = count ? Math.ceil(count / pageSize) : 0

                return {
                    data: (data as Contact[]) || [],
                    count: count || 0,
                    page: nextPage,
                    pageSize,
                    totalPages,
                    hasMore: nextPage < totalPages
                }
            }
        })
    }
}

export function useCreateContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newContact: Partial<Contact>) => {
            const { data, error } = await supabase
                .from('contacts')
                .insert(newContact)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onMutate: async (newContact) => {
            await queryClient.cancelQueries({ queryKey: ['contacts'] })
            const previousContacts = queryClient.getQueryData(['contacts'])

            queryClient.setQueriesData({ queryKey: ['contacts'] }, (old: any) => {
                if (!old?.data) return old
                if (old.page === 1) {
                    return {
                        ...old,
                        data: [{ ...newContact, id: 'temp-id', created_at: new Date().toISOString() }, ...old.data].slice(0, old.pageSize),
                        count: (old.count || 0) + 1
                    }
                }
                return old
            })

            return { previousContacts }
        },
        onError: (err, newContact, context) => {
            if (context?.previousContacts) {
                queryClient.setQueryData(['contacts'], context.previousContacts)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        }
    })
}

export function useUpdateContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contact> }) => {
            const { data, error } = await supabase
                .from('contacts')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onMutate: async ({ id, updates }) => {
            await queryClient.cancelQueries({ queryKey: ['contacts'] })
            await queryClient.cancelQueries({ queryKey: ['contact', id] })

            queryClient.setQueriesData({ queryKey: ['contacts'] }, (old: any) => {
                if (!old?.data) return old
                return {
                    ...old,
                    data: old.data.map((c: Contact) =>
                        c.id === id ? { ...c, ...updates } : c
                    )
                }
            })
        },
        onSettled: (data) => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
            if (data) queryClient.invalidateQueries({ queryKey: ['contact', data.id] })
        }
    })
}

export function useDeleteContact() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('contacts')
                .delete()
                .eq('id', id)

            if (error) throw error
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['contacts'] })

            queryClient.setQueriesData({ queryKey: ['contacts'] }, (old: any) => {
                if (!old?.data) return old
                return {
                    ...old,
                    data: old.data.filter((c: Contact) => c.id !== id),
                    count: (old.count || 0) - 1
                }
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        }
    })
}

export function useContact(id: string) {
    return useQuery<Contact | null>({
        queryKey: ['contact', id],
        queryFn: async () => {
            if (!id) return null
            const { data, error } = await supabase
                .from('v_contacts_with_details')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            return data as Contact
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    })
}
