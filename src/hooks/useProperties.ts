// src/hooks/useProperties.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from './useCurrentUser'

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
  status?: string | string[]
  property_type?: string
  operation_type?: string
  city?: string
  source?: 'own' | 'agency' | 'network' | 'mls' | 'all'
  search?: string
  price_min?: number
  price_max?: number
  bedrooms?: number
  bathrooms?: number
  parking_spaces?: number
  construction_m2_min?: number
  construction_m2_max?: number
  land_m2_min?: number
  land_m2_max?: number
  bounds?: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }
}

export function useProperties(filters: PropertiesFilters = {}) {
  const supabase = createClient()
  const { data: currentUser } = useCurrentUser()

  return useQuery<Property[]>({
    queryKey: ['properties', filters],
    queryFn: async () => {
      if (!currentUser) return []

      let query = supabase
        .from('properties_safe')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.source === 'own') {
        query = query.eq('producer_id', currentUser.id)
      } else if (filters.source === 'agency') {
        query = query.eq('agency_id', currentUser.agency_id)
      } else if (filters.source === 'network') {
        query = query.neq('agency_id', currentUser.agency_id)
      } else if (filters.source === 'mls') {
        query = query.eq('mls_shared', true)
      }

      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
        if (statuses.length > 0) query = query.in('status', statuses)
      }
      if (filters.property_type) query = query.eq('property_type', filters.property_type)
      if (filters.operation_type) query = query.eq('operation_type', filters.operation_type)
      if (filters.city) query = query.eq('city', filters.city)
      if (filters.bedrooms != null) query = query.gte('bedrooms', filters.bedrooms)
      if (filters.bathrooms != null) query = query.gte('bathrooms', filters.bathrooms)
      if (filters.parking_spaces != null) query = query.gte('parking_spaces', filters.parking_spaces)
      if (filters.price_min != null && filters.price_min > 0) query = query.gte('price', filters.price_min)
      if (filters.price_max != null && filters.price_max > 0) query = query.lte('price', filters.price_max)
      if (filters.construction_m2_min != null) query = query.gte('construction_m2', filters.construction_m2_min)
      if (filters.construction_m2_max != null) query = query.lte('construction_m2', filters.construction_m2_max)
      if (filters.land_m2_min != null) query = query.gte('land_m2', filters.land_m2_min)
      if (filters.land_m2_max != null) query = query.lte('land_m2', filters.land_m2_max)
      if (filters.search) {
        const term = filters.search.trim()
        query = query.or(`title.ilike.%${term}%,city.ilike.%${term}%,address.ilike.%${term}%,neighborhood.ilike.%${term}%`)
      }

      const { data, error } = await query
      if (error) throw error
      let result = (data ?? []) as Property[]

      if (filters.bounds && result.length > 0) {
        const { ne, sw } = filters.bounds
        result = result.filter((p) => {
          const lat = p.lat ?? (p as any).latitude
          const lng = p.lng ?? (p as any).longitude
          if (lat == null || lng == null || typeof lat !== 'number' || typeof lng !== 'number') return false
          return lat >= sw.lat && lat <= ne.lat && lng >= sw.lng && lng <= ne.lng
        })
      }
      return result
    },
    enabled: !!currentUser,
    staleTime: 30 * 1000,
  })
}

export function useProperty(propertyId?: string) {
  const supabase = createClient()

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
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const { data: currentUser } = useCurrentUser()

  return useMutation({
    mutationFn: async (propertyData: Partial<Property>) => {
      if (!currentUser) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...propertyData,
          agency_id: currentUser.agency_id,
          producer_id: currentUser.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()
  const supabase = createClient()

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] })
    },
  })
}

export function useTogglePublishProperty() {
  const queryClient = useQueryClient()
  const supabase = createClient()

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] })
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

export function usePropertiesStats() {
  const supabase = createClient()
  const { data: currentUser } = useCurrentUser()

  return useQuery({
    queryKey: ['properties-stats', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null

      const { count: total } = await supabase
        .from('properties_safe')
        .select('id', { count: 'exact', head: true })
        .eq('agency_id', currentUser.agency_id)

      const { count: mine } = await supabase
        .from('properties_safe')
        .select('id', { count: 'exact', head: true })
        .eq('producer_id', currentUser.id)

      const { count: network } = await supabase
        .from('properties_safe')
        .select('id', { count: 'exact', head: true })
        .neq('agency_id', currentUser.agency_id)

      const { count: mls } = await supabase
        .from('properties_safe')
        .select('id', { count: 'exact', head: true })
        .eq('mls_shared', true)

      return { total: total || 0, mine: mine || 0, network: network || 0, mls: mls || 0 }
    },
    enabled: !!currentUser,
  })
}
