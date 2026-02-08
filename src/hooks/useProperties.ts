'use client'

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from './useCurrentUser'

// Tipos
export interface Property {
  id: string
  agency_id: string
  producer_id: string
  title: string
  description: string | null
  property_type: 'casa' | 'departamento' | 'terreno' | 'local' | 'oficina' | 'bodega'
  operation_type: 'venta' | 'renta' | 'ambos'
  address: string
  neighborhood: string | null
  city: string
  state: string
  price: number
  rent_price: number | null
  currency?: 'MXN' | 'USD'
  bedrooms: number | null
  bathrooms: number | null
  half_bathrooms: number | null
  parking_spaces: number | null
  total_area: number | null
  construction_m2: number | null
  land_m2: number | null
  maintenance_fee: number | null
  commission_percentage: number | null
  main_image_url: string | null
  images: any[]
  status: 'draft' | 'active' | 'reserved' | 'sold' | 'rented' | 'suspended' | 'archived'
  visibility: 'public' | 'private' | 'agency'
  published: boolean
  health_score: number
  mls_shared: boolean
  slug: string | null
  owner_name: string | null
  owner_phone: string | null
  owner_email: string | null
  legal_status?: string | null
  is_my_agency: boolean
  is_mine: boolean
  source: 'own' | 'agency' | 'network'
  created_at: string
  updated_at: string
  views_count?: number
  lat?: number | null
  lng?: number | null
  year_built?: number | null
  pets_allowed?: boolean | null
  terrace_m2?: number | null
  balcony_m2?: number | null
  roof_garden_m2?: number | null
  floor_number?: number | null
}

export interface PropertiesFilters {
  page?: number
  pageSize?: number
  status?: string | string[]
  propertyType?: string
  operationType?: string
  city?: string
  source?: 'own' | 'agency' | 'network' | 'mls' | 'all'
  search?: string
  priceMin?: number
  priceMax?: number
  bedrooms?: number
  bathrooms?: number
  parkingSpaces?: number
  constructionM2Min?: number
  constructionM2Max?: number
  landM2Min?: number
  landM2Max?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  bounds?: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }
}

export interface PropertiesResponse {
  data: Property[]
  count: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

const supabase = createClient()

// Hook principal con paginación
export function useProperties(params: PropertiesFilters = {}) {
  const { data: currentUser } = useCurrentUser()
  const {
    page = 1,
    pageSize = 20,
    status,
    propertyType,
    operationType,
    city,
    source = 'all',
    search: searchQuery,
    priceMin,
    priceMax,
    bedrooms,
    bathrooms,
    parkingSpaces,
    sortBy = 'created_at',
    sortOrder = 'desc',
    bounds
  } = params

  return useQuery<PropertiesResponse>({
    queryKey: ['properties', { ...params, page, pageSize }],
    queryFn: async () => {
      if (!currentUser) return { data: [], count: 0, page, pageSize, totalPages: 0, hasMore: false }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from('properties_safe')
        .select('*', { count: 'exact' })

      if (source === 'own') {
        query = query.eq('producer_id', currentUser.id)
      } else if (source === 'agency') {
        query = query.eq('agency_id', currentUser.agency_id)
      } else if (source === 'network') {
        query = query.neq('agency_id', currentUser.agency_id)
      } else if (source === 'mls') {
        query = query.not('published_at', 'is', null)
      }

      if (status) {
        const statuses = Array.isArray(status) ? status : [status]
        if (statuses.length > 0) query = query.in('status', statuses)
      }
      if (propertyType) query = query.eq('property_type', propertyType)
      if (operationType) query = query.eq('operation_type', operationType)
      if (city) query = query.eq('city', city)
      if (bedrooms != null) query = query.gte('bedrooms', bedrooms)
      if (bathrooms != null) query = query.gte('bathrooms', bathrooms)
      if (parkingSpaces != null) query = query.gte('parking_spaces', parkingSpaces)
      if (priceMin != null && priceMin > 0) query = query.gte('price', priceMin)
      if (priceMax != null && priceMax > 0) query = query.lte('price', priceMax)

      if (searchQuery) {
        const term = searchQuery.trim()
        query = query.or(`title.ilike.%${term}%,city.ilike.%${term}%,address.ilike.%${term}%,neighborhood.ilike.%${term}%`)
      }

      const { data, count, error } = await query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to)

      if (error) throw error

      let resultData = (data as Property[]) || []

      if (bounds && resultData.length > 0) {
        const { ne, sw } = bounds
        resultData = resultData.filter((p) => {
          const lat = p.lat ?? (p as any).latitude
          const lng = p.lng ?? (p as any).longitude
          if (lat == null || lng == null || typeof lat !== 'number' || typeof lng !== 'number') return false
          return lat >= sw.lat && lat <= ne.lat && lng >= sw.lng && lng <= ne.lng
        })
      }

      const totalPages = count ? Math.ceil(count / pageSize) : 0

      return {
        data: resultData,
        count: count || 0,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages
      }
    },
    enabled: !!currentUser,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  })
}

// Hook para prefetch de página siguiente
export function usePrefetchProperties() {
  const queryClient = useQueryClient()
  const { data: currentUser } = useCurrentUser()

  return (params: PropertiesFilters = {}) => {
    if (!currentUser) return

    const { page = 1, pageSize = 20 } = params
    const nextPage = page + 1

    return queryClient.prefetchQuery({
      queryKey: ['properties', { ...params, page: nextPage, pageSize }],
      queryFn: async () => {
        const from = page * pageSize
        const to = from + pageSize - 1

        let query = supabase
          .from('properties_safe')
          .select('*', { count: 'exact' })

        if (params.source === 'own') {
          query = query.eq('producer_id', currentUser.id)
        } else if (params.source === 'agency') {
          query = query.eq('agency_id', currentUser.agency_id)
        } else if (params.source === 'network') {
          query = query.neq('agency_id', currentUser.agency_id)
        } else if (params.source === 'mls') {
          query = query.not('published_at', 'is', null)
        }

        if (params.status) {
          const statuses = Array.isArray(params.status) ? params.status : [params.status]
          if (statuses.length > 0) query = query.in('status', statuses)
        }
        if (params.propertyType) query = query.eq('property_type', params.propertyType)
        if (params.operationType) query = query.eq('operation_type', params.operationType)
        if (params.city) query = query.eq('city', params.city)
        if (params.bedrooms != null) query = query.gte('bedrooms', params.bedrooms)
        if (params.bathrooms != null) query = query.gte('bathrooms', params.bathrooms)
        if (params.parkingSpaces != null) query = query.gte('parking_spaces', params.parkingSpaces)
        if (params.priceMin != null && params.priceMin > 0) query = query.gte('price', params.priceMin)
        if (params.priceMax != null && params.priceMax > 0) query = query.lte('price', params.priceMax)

        if (params.search) {
          const term = params.search.trim()
          query = query.or(`title.ilike.%${term}%,city.ilike.%${term}%,address.ilike.%${term}%,neighborhood.ilike.%${term}%`)
        }

        const { data, count, error } = await query
          .order(params.sortBy || 'created_at', { ascending: params.sortOrder === 'asc' })
          .range(from, to)

        if (error) throw error

        let resultData = (data as Property[]) || []

        if (params.bounds && resultData.length > 0) {
          const { ne, sw } = params.bounds
          resultData = resultData.filter((p) => {
            const lat = p.lat ?? (p as any).latitude
            const lng = p.lng ?? (p as any).longitude
            if (lat == null || lng == null || typeof lat !== 'number' || typeof lng !== 'number') return false
            return lat >= sw.lat && lat <= ne.lat && lng >= sw.lng && lng <= ne.lng
          })
        }

        const totalPages = count ? Math.ceil(count / pageSize) : 0

        return {
          data: resultData,
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

export function useCreateProperty() {
  const queryClient = useQueryClient()
  const { data: currentUser } = useCurrentUser()

  return useMutation({
    mutationFn: async (propertyData: Partial<Property>) => {
      if (!currentUser?.id || !currentUser?.agency_id) throw new Error('Not authenticated')

      const { agency_id: _a, producer_id: _p, ...rest } = propertyData as Partial<Property> & { agency_id?: string; producer_id?: string }
      const payload = {
        ...rest,
        agency_id: currentUser.agency_id,
        producer_id: currentUser.id,
      }

      const { data, error } = await supabase
        .from('properties')
        .insert(payload)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async (newProperty) => {
      await queryClient.cancelQueries({ queryKey: ['properties'] })
      const previousProperties = queryClient.getQueryData(['properties'])

      queryClient.setQueriesData({ queryKey: ['properties'] }, (old: any) => {
        if (!old?.data) return old
        if (old.page === 1) {
          return {
            ...old,
            data: [{ ...newProperty, id: 'temp-id', created_at: new Date().toISOString() }, ...old.data].slice(0, old.pageSize),
            count: (old.count || 0) + 1
          }
        }
        return old
      })

      return { previousProperties }
    },
    onError: (err, newProperty, context) => {
      if (context?.previousProperties) {
        queryClient.setQueryData(['properties'], context.previousProperties)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['properties-stats'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Property> }) => {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['properties'] })
      await queryClient.cancelQueries({ queryKey: ['property', id] })

      queryClient.setQueriesData({ queryKey: ['properties'] }, (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((p: Property) =>
            p.id === id ? { ...p, ...updates } : p
          )
        }
      })
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      if (data) queryClient.invalidateQueries({ queryKey: ['property', data.id] })
      queryClient.invalidateQueries({ queryKey: ['properties-stats'] })
    }
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { id: string; reason?: string } | string) => {
      const id = typeof payload === 'string' ? payload : payload.id
      const reason = typeof payload === 'string' ? undefined : payload.reason
      const updates: { deleted_at: string; deletion_reason?: string } = {
        deleted_at: new Date().toISOString(),
      }
      if (reason?.trim()) updates.deletion_reason = reason.trim()

      const { error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      return id
    },
    onMutate: async (payload) => {
      const id = typeof payload === 'string' ? payload : payload.id
      await queryClient.cancelQueries({ queryKey: ['properties'] })

      queryClient.setQueriesData({ queryKey: ['properties'] }, (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.filter((p: Property) => p.id !== id),
          count: (old.count || 0) - 1
        }
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['properties-stats'] })
    }
  })
}

export function useProperty(propertyId?: string) {
  return useQuery<Property | null>({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId) return null

      const { data, error } = await supabase
        .from('properties_safe')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (error) throw error
      return data as Property
    },
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000
  })
}

export function useTogglePublishProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { data, error } = await supabase
        .from('properties')
        .update({
          published,
          published_at: published ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      if (data) queryClient.invalidateQueries({ queryKey: ['property', data.id] })
      queryClient.invalidateQueries({ queryKey: ['properties-stats'] })
    },
  })
}

export function usePropertiesStats() {
  const { data: currentUser } = useCurrentUser()

  return useQuery({
    queryKey: ['properties-stats', currentUser?.id, currentUser?.agency_id],
    queryFn: async () => {
      if (!currentUser?.id || !currentUser?.agency_id) return null

      const [resMine, resTotal, resNetwork, resMls] = await Promise.all([
        supabase.from('properties_safe').select('id', { count: 'exact', head: true }).eq('producer_id', currentUser.id),
        supabase.from('properties_safe').select('id', { count: 'exact', head: true }).eq('agency_id', currentUser.agency_id),
        supabase.from('properties_safe').select('id', { count: 'exact', head: true }).neq('agency_id', currentUser.agency_id),
        supabase.from('properties_safe').select('id', { count: 'exact', head: true }).not('published_at', 'is', null),
      ])

      return {
        mine: resMine.count ?? 0,
        total: resTotal.count ?? 0,
        network: resNetwork.count ?? 0,
        mls: resMls.count ?? 0,
      }
    },
    enabled: !!currentUser?.id && !!currentUser?.agency_id,
  })
}
