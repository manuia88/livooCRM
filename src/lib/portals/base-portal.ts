/**
 * Base Portal Client - Abstract interface for all portal integrations
 *
 * Each portal (Inmuebles24, Vivanuncios, Lamudi, etc.) extends this class
 * and implements the abstract methods with their specific API calls.
 *
 * Phase 1: Mock implementations only
 * Phase 2: Real API integrations when portal services are contracted
 */

import { createClient } from '@/lib/supabase/client'

// =============================================
// Types
// =============================================

export interface PortalPropertyData {
  id: string
  title: string
  description: string
  propertyType: string
  operationType: 'sale' | 'rent' | 'both'
  salePrice?: number
  rentPrice?: number
  currency: string
  bedrooms?: number
  bathrooms?: number
  halfBathrooms?: number
  parkingSpaces?: number
  constructionM2?: number
  landM2?: number
  floors?: number
  yearBuilt?: number
  condition?: string
  address: {
    street?: string
    exteriorNumber?: string
    neighborhood?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    formattedAddress?: string
  }
  coordinates?: {
    lat: number
    lng: number
  }
  photos: string[]
  videos: string[]
  virtualTourUrl?: string
  amenities: string[]
  features: Record<string, any>
  contactInfo: {
    name: string
    phone: string
    email: string
    agencyName?: string
  }
}

export interface PublishResponse {
  success: boolean
  externalId?: string
  externalUrl?: string
  error?: string
  rawResponse?: any
}

export interface PortalPropertyStatus {
  status: 'draft' | 'published' | 'paused' | 'error' | 'removed'
  views?: number
  contacts?: number
  lastSyncedAt?: string
  portalUrl?: string
}

export interface PortalConnectionTest {
  connected: boolean
  error?: string
  portalName: string
  testedAt: string
}

// =============================================
// Abstract Base Client
// =============================================

export abstract class BasePortalClient {
  protected portalName: string
  protected credentials: Record<string, any>
  protected settings: Record<string, any>

  constructor(
    portalName: string,
    credentials: Record<string, any>,
    settings: Record<string, any> = {}
  ) {
    this.portalName = portalName
    this.credentials = credentials
    this.settings = settings
  }

  /** Publish a property to the portal */
  abstract publish(property: PortalPropertyData): Promise<PublishResponse>

  /** Update an already-published property */
  abstract update(externalId: string, property: PortalPropertyData): Promise<PublishResponse>

  /** Remove a property from the portal */
  abstract unpublish(externalId: string): Promise<PublishResponse>

  /** Get the current status of a property on the portal */
  abstract getStatus(externalId: string): Promise<PortalPropertyStatus>

  /** Test the connection/credentials for this portal */
  abstract testConnection(): Promise<PortalConnectionTest>

  /** Get the portal display name */
  getPortalName(): string {
    return this.portalName
  }

  /** Log a publication action to the database */
  protected async logAction(
    propertyId: string,
    propertyPortalId: string | null,
    agencyId: string,
    action: string,
    status: 'success' | 'error' | 'pending',
    options: {
      requestData?: any
      responseData?: any
      errorMessage?: string
      triggeredBy?: string
      triggeredType?: 'manual' | 'auto_sync' | 'webhook' | 'system'
      durationMs?: number
    } = {}
  ): Promise<void> {
    try {
      const supabase = createClient()
      await supabase.from('publication_logs').insert({
        property_portal_id: propertyPortalId,
        property_id: propertyId,
        agency_id: agencyId,
        portal: this.portalName,
        action,
        status,
        request_data: options.requestData,
        response_data: options.responseData,
        error_message: options.errorMessage,
        triggered_by: options.triggeredBy,
        triggered_type: options.triggeredType || 'manual',
        duration_ms: options.durationMs
      })
    } catch (error) {
      console.error(`[${this.portalName}] Error logging action:`, error)
    }
  }
}
