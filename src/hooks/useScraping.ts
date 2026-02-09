'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// ── Types ────────────────────────────────────────────────────────────────

export interface ScrapedListing {
  id: string
  agency_id: string
  source: string
  external_id: string
  external_url: string
  title: string
  description?: string
  property_type?: string
  operation_type: 'venta' | 'renta' | 'traspaso'
  price?: number
  currency: string
  bedrooms?: number
  bathrooms?: number
  parking_spaces?: number
  construction_m2?: number
  land_m2?: number
  address: Record<string, string>
  latitude?: number
  longitude?: number
  images: string[]
  features: Record<string, unknown>
  scraped_at: string
  imported: boolean
  imported_at?: string
  imported_property_id?: string
  duplicate_of?: string
}

export interface ScrapingJob {
  id: string
  agency_id: string
  source: string
  search_params: Record<string, unknown>
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  pages_requested: number
  pages_scraped: number
  listings_found: number
  listings_new: number
  listings_updated: number
  listings_duplicates: number
  error_message?: string
  started_at?: string
  completed_at?: string
  created_at: string
}

interface ScrapedListingsFilters {
  source?: string
  imported?: boolean
  operationType?: string
  limit?: number
}

// ── Queries ──────────────────────────────────────────────────────────────

export function useScrapedListings(filters?: ScrapedListingsFilters) {
  return useQuery({
    queryKey: ['scraped-listings', filters],
    queryFn: async () => {
      let query = supabase
        .from('scraped_listings')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(filters?.limit || 100)

      if (filters?.source) {
        query = query.eq('source', filters.source)
      }

      if (filters?.imported !== undefined) {
        query = query.eq('imported', filters.imported)
      }

      if (filters?.operationType) {
        query = query.eq('operation_type', filters.operationType)
      }

      const { data, error } = await query
      if (error) throw error
      return data as ScrapedListing[]
    }
  })
}

export function useScrapingJobs() {
  return useQuery({
    queryKey: ['scraping-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data as ScrapingJob[]
    },
    refetchInterval: (query) => {
      // Refetch while there are running jobs
      const hasRunning = query.state.data?.some(j => j.status === 'running')
      return hasRunning ? 3000 : false
    }
  })
}

// ── Mutations ────────────────────────────────────────────────────────────

export function useStartScraping() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      source,
      pages = 1,
      city,
      operation
    }: {
      source: string
      pages?: number
      city?: string
      operation?: string
    }) => {
      const response = await fetch('/api/scraping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, pages, city, operation })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al iniciar scraping')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped-listings'] })
      queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] })
    }
  })
}

export function useImportListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (listingId: string) => {
      // 1. Get scraped listing
      const { data: listing, error: fetchError } = await supabase
        .from('scraped_listings')
        .select('*')
        .eq('id', listingId)
        .single()

      if (fetchError || !listing) {
        throw new Error('No se encontró la propiedad')
      }

      if (listing.imported) {
        throw new Error('Esta propiedad ya fue importada')
      }

      // 2. Create property in Livoo
      const { data: property, error: insertError } = await supabase
        .from('properties')
        .insert({
          title: listing.title,
          description: listing.description,
          property_type: listing.property_type || 'otro',
          operation_type: listing.operation_type,
          sale_price: listing.operation_type === 'venta' ? listing.price : null,
          rent_price: listing.operation_type === 'renta' ? listing.price : null,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          parking_spaces: listing.parking_spaces,
          construction_m2: listing.construction_m2,
          land_m2: listing.land_m2,
          address: listing.address,
          latitude: listing.latitude,
          longitude: listing.longitude,
          photos: listing.images,
          status: 'draft',
          source: `imported_${listing.source}`,
          agency_id: listing.agency_id
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(`Error al crear propiedad: ${insertError.message}`)
      }

      // 3. Mark as imported
      await supabase
        .from('scraped_listings')
        .update({
          imported: true,
          imported_at: new Date().toISOString(),
          imported_property_id: property.id
        })
        .eq('id', listingId)

      return property
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped-listings'] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    }
  })
}

export function useImportMultipleListings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (listingIds: string[]) => {
      const results = { imported: 0, failed: 0, errors: [] as string[] }

      for (const id of listingIds) {
        try {
          const { data: listing } = await supabase
            .from('scraped_listings')
            .select('*')
            .eq('id', id)
            .single()

          if (!listing || listing.imported) continue

          const { error } = await supabase
            .from('properties')
            .insert({
              title: listing.title,
              description: listing.description,
              property_type: listing.property_type || 'otro',
              operation_type: listing.operation_type,
              sale_price: listing.operation_type === 'venta' ? listing.price : null,
              rent_price: listing.operation_type === 'renta' ? listing.price : null,
              bedrooms: listing.bedrooms,
              bathrooms: listing.bathrooms,
              construction_m2: listing.construction_m2,
              land_m2: listing.land_m2,
              address: listing.address,
              latitude: listing.latitude,
              longitude: listing.longitude,
              photos: listing.images,
              status: 'draft',
              source: `imported_${listing.source}`,
              agency_id: listing.agency_id
            })
            .select()
            .single()

          if (error) {
            results.failed++
            results.errors.push(`${listing.title}: ${error.message}`)
          } else {
            await supabase
              .from('scraped_listings')
              .update({ imported: true, imported_at: new Date().toISOString() })
              .eq('id', id)
            results.imported++
          }
        } catch (err) {
          results.failed++
          results.errors.push(err instanceof Error ? err.message : String(err))
        }
      }

      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped-listings'] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    }
  })
}

export function useDeleteScrapedListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (listingId: string) => {
      const { error } = await supabase
        .from('scraped_listings')
        .delete()
        .eq('id', listingId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraped-listings'] })
    }
  })
}
