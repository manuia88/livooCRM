'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface UseInfinitePropertiesParams {
    pageSize?: number
    status?: string
    propertyType?: string
    operationType?: string
    searchQuery?: string
}

export function useInfiniteProperties(params: UseInfinitePropertiesParams = {}) {
    const { pageSize = 20, status, propertyType, operationType, searchQuery } = params

    return useInfiniteQuery({
        queryKey: ['properties-infinite', { status, propertyType, operationType, searchQuery, pageSize }],
        queryFn: async ({ pageParam = 0 }) => {
            const from = pageParam as number
            const to = from + pageSize - 1

            let query = supabase
                .from('properties_safe')
                .select('*', { count: 'exact' })

            if (status) query = query.eq('status', status)
            if (propertyType) query = query.eq('property_type', propertyType)
            if (operationType) query = query.eq('operation_type', operationType)

            if (searchQuery) {
                query = query.or(`title.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`)
            }

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(from, to)

            if (error) throw error

            return {
                data: data || [],
                nextCursor: to + 1 < (count || 0) ? to + 1 : undefined,
                count: count || 0
            }
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: 0,
        staleTime: 2 * 60 * 1000
    })
}
