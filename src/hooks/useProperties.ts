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
  bedrooms: number | null
  bathrooms: number | null
  parking_spaces: number | null
  total_area: number | null
  built_area: number | null
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
}

interface PropertiesFilters {
  status?: string
  property_type?: string
  operation_type?: string
  city?: string
  source?: 'own' | 'agency' | 'network' | 'all'
  search?: string
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
      }

      if (filters.status) query = query.eq('status', filters.status)
      if (filters.property_type) query = query.eq('property_type', filters.property_type)
      if (filters.operation_type) query = query.eq('operation_type', filters.operation_type)
      if (filters.city) query = query.eq('city', filters.city)
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,city.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Property[]
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

      return { total: total || 0, mine: mine || 0, network: network || 0 }
    },
    enabled: !!currentUser,
  })
}
