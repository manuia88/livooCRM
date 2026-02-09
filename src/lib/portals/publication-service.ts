/**
 * Publication Service - Orchestrates multi-portal publishing
 *
 * Manages the lifecycle of property publications across all configured portals:
 * - Publish to multiple portals simultaneously
 * - Update/sync existing publications
 * - Unpublish from specific or all portals
 * - Track status and logs for each publication
 */

import { createClient } from '@/lib/supabase/client'
import { BasePortalClient, PortalPropertyData, PublishResponse } from './base-portal'
import { createPortalClient } from './index'
import type { Property } from '@/types/properties'

// =============================================
// Types
// =============================================

export interface PublishResult {
  portal: string
  success: boolean
  externalId?: string
  externalUrl?: string
  error?: string
}

export interface PublicationSummary {
  total: number
  published: number
  errors: number
  results: PublishResult[]
}

// =============================================
// Service
// =============================================

export class PublicationService {
  private clients: Map<string, BasePortalClient> = new Map()
  private agencyId: string | null = null

  /**
   * Initialize portal clients for a specific agency
   */
  async initializeForAgency(agencyId: string): Promise<string[]> {
    this.agencyId = agencyId
    this.clients.clear()

    const supabase = createClient()

    const { data: configs, error } = await supabase
      .from('portal_configs')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('enabled', true)

    if (error) {
      console.error('Error loading portal configs:', error)
      return []
    }

    const initialized: string[] = []

    for (const config of configs || []) {
      const client = createPortalClient(config.portal, config.credentials, config.settings)
      if (client) {
        this.clients.set(config.portal, client)
        initialized.push(config.portal)
      }
    }

    return initialized
  }

  /**
   * Publish a property to one or more portals
   */
  async publishProperty(
    propertyId: string,
    portals: string[],
    triggeredBy?: string
  ): Promise<PublicationSummary> {
    const supabase = createClient()

    // 1. Load property data
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (propError || !property) {
      throw new Error('Propiedad no encontrada')
    }

    // 2. Transform to portal format
    const propertyData = this.transformProperty(property)

    // 3. Publish to each portal
    const results: PublishResult[] = []

    for (const portal of portals) {
      const client = this.clients.get(portal)
      if (!client) {
        results.push({
          portal,
          success: false,
          error: `Portal "${portal}" no está configurado o habilitado`
        })
        continue
      }

      const startTime = Date.now()

      try {
        const result = await client.publish(propertyData)
        const durationMs = Date.now() - startTime

        // Upsert in property_portals (existing table from 0015)
        const { data: portalRecord } = await supabase
          .from('property_portals')
          .upsert({
            property_id: propertyId,
            portal_name: portal,
            portal_listing_id: result.externalId,
            portal_url: result.externalUrl,
            status: result.success ? 'published' : 'error',
            sync_error: result.error || null,
            last_synced_at: new Date().toISOString(),
            sync_attempts: 1
          }, {
            onConflict: 'property_id,portal_name'
          })
          .select('id')
          .single()

        // Log the action
        if (this.agencyId) {
          await supabase.from('publication_logs').insert({
            property_portal_id: portalRecord?.id,
            property_id: propertyId,
            agency_id: this.agencyId,
            portal,
            action: 'create',
            status: result.success ? 'success' : 'error',
            request_data: { photos_count: propertyData.photos.length, title: propertyData.title },
            response_data: result.rawResponse,
            error_message: result.error,
            triggered_by: triggeredBy,
            triggered_type: 'manual',
            duration_ms: durationMs
          })
        }

        results.push({
          portal,
          success: result.success,
          externalId: result.externalId,
          externalUrl: result.externalUrl,
          error: result.error
        })
      } catch (error: any) {
        results.push({
          portal,
          success: false,
          error: error.message
        })
      }
    }

    return {
      total: results.length,
      published: results.filter(r => r.success).length,
      errors: results.filter(r => !r.success).length,
      results
    }
  }

  /**
   * Update a property across all portals where it's published
   */
  async updateProperty(
    propertyId: string,
    triggeredBy?: string
  ): Promise<PublicationSummary> {
    const supabase = createClient()

    // 1. Get existing publications
    const { data: publications } = await supabase
      .from('property_portals')
      .select('*')
      .eq('property_id', propertyId)
      .in('status', ['published', 'paused'])

    if (!publications || publications.length === 0) {
      return { total: 0, published: 0, errors: 0, results: [] }
    }

    // 2. Load fresh property data
    const { data: property } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (!property) {
      throw new Error('Propiedad no encontrada')
    }

    const propertyData = this.transformProperty(property)
    const results: PublishResult[] = []

    // 3. Update each portal
    for (const pub of publications) {
      const client = this.clients.get(pub.portal_name)
      if (!client || !pub.portal_listing_id) {
        results.push({
          portal: pub.portal_name,
          success: false,
          error: 'Cliente no disponible o sin ID externo'
        })
        continue
      }

      const startTime = Date.now()

      try {
        const result = await client.update(pub.portal_listing_id, propertyData)
        const durationMs = Date.now() - startTime

        await supabase
          .from('property_portals')
          .update({
            status: result.success ? 'published' : 'error',
            sync_error: result.error || null,
            last_synced_at: new Date().toISOString(),
            sync_attempts: pub.sync_attempts + 1
          })
          .eq('id', pub.id)

        if (this.agencyId) {
          await supabase.from('publication_logs').insert({
            property_portal_id: pub.id,
            property_id: propertyId,
            agency_id: this.agencyId,
            portal: pub.portal_name,
            action: 'update',
            status: result.success ? 'success' : 'error',
            error_message: result.error,
            triggered_by: triggeredBy,
            triggered_type: 'manual',
            duration_ms: durationMs
          })
        }

        results.push({
          portal: pub.portal_name,
          success: result.success,
          externalId: pub.portal_listing_id,
          error: result.error
        })
      } catch (error: any) {
        results.push({
          portal: pub.portal_name,
          success: false,
          error: error.message
        })
      }
    }

    return {
      total: results.length,
      published: results.filter(r => r.success).length,
      errors: results.filter(r => !r.success).length,
      results
    }
  }

  /**
   * Unpublish a property from specific portals (or all)
   */
  async unpublishProperty(
    propertyId: string,
    portals?: string[],
    triggeredBy?: string
  ): Promise<PublicationSummary> {
    const supabase = createClient()

    let query = supabase
      .from('property_portals')
      .select('*')
      .eq('property_id', propertyId)
      .in('status', ['published', 'paused', 'error'])

    if (portals && portals.length > 0) {
      query = query.in('portal_name', portals)
    }

    const { data: publications } = await query
    const results: PublishResult[] = []

    for (const pub of publications || []) {
      const client = this.clients.get(pub.portal_name)

      try {
        if (client && pub.portal_listing_id) {
          await client.unpublish(pub.portal_listing_id)
        }

        await supabase
          .from('property_portals')
          .update({
            status: 'removed',
            last_synced_at: new Date().toISOString()
          })
          .eq('id', pub.id)

        if (this.agencyId) {
          await supabase.from('publication_logs').insert({
            property_portal_id: pub.id,
            property_id: propertyId,
            agency_id: this.agencyId,
            portal: pub.portal_name,
            action: 'delete',
            status: 'success',
            triggered_by: triggeredBy,
            triggered_type: 'manual'
          })
        }

        results.push({ portal: pub.portal_name, success: true })
      } catch (error: any) {
        results.push({
          portal: pub.portal_name,
          success: false,
          error: error.message
        })
      }
    }

    return {
      total: results.length,
      published: results.filter(r => r.success).length,
      errors: results.filter(r => !r.success).length,
      results
    }
  }

  /**
   * Get all available (initialized) portals
   */
  getAvailablePortals(): string[] {
    return Array.from(this.clients.keys())
  }

  /**
   * Transform a Livoo property to the portal-agnostic format
   */
  private transformProperty(property: any): PortalPropertyData {
    const address = property.address || {}

    return {
      id: property.id,
      title: property.title || '',
      description: property.description || '',
      propertyType: property.property_type || 'house',
      operationType: property.operation_type || 'sale',
      salePrice: property.sale_price,
      rentPrice: property.rent_price,
      currency: property.currency || 'MXN',
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      halfBathrooms: property.half_bathrooms,
      parkingSpaces: property.parking_spaces,
      constructionM2: property.construction_m2,
      landM2: property.land_m2,
      floors: property.floors,
      yearBuilt: property.year_built,
      condition: property.condition,
      address: {
        street: address.street,
        exteriorNumber: address.exterior_number,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        postalCode: address.postal_code,
        country: address.country || 'México',
        formattedAddress: address.formatted_address
      },
      coordinates: property.coordinates ? {
        lat: typeof property.coordinates === 'object' && property.coordinates.coordinates
          ? property.coordinates.coordinates[1]
          : property.coordinates.lat,
        lng: typeof property.coordinates === 'object' && property.coordinates.coordinates
          ? property.coordinates.coordinates[0]
          : property.coordinates.lng
      } : undefined,
      photos: Array.isArray(property.photos) ? property.photos : [],
      videos: Array.isArray(property.videos) ? property.videos : [],
      virtualTourUrl: property.virtual_tour_url,
      amenities: Array.isArray(property.amenities) ? property.amenities : [],
      features: property.features || {},
      contactInfo: {
        name: property.contact_name || 'Livoo CRM',
        phone: property.contact_phone || '',
        email: property.contact_email || '',
        agencyName: property.agency_name
      }
    }
  }
}
