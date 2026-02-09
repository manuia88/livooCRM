/**
 * Portal Publishing System - Index
 *
 * Central export for all portal-related modules.
 */

// Base
export { BasePortalClient } from './base-portal'
export type {
  PortalPropertyData,
  PublishResponse,
  PortalPropertyStatus,
  PortalConnectionTest
} from './base-portal'

// Portal Clients
export { Inmuebles24Client } from './inmuebles24-client'
export { VivanunciosClient } from './vivanuncios-client'
export { LamudiClient } from './lamudi-client'

// Service
export { PublicationService } from './publication-service'

// Factory helper
import { BasePortalClient } from './base-portal'
import { Inmuebles24Client } from './inmuebles24-client'
import { VivanunciosClient } from './vivanuncios-client'
import { LamudiClient } from './lamudi-client'

export function createPortalClient(
  portal: string,
  credentials: Record<string, any>,
  settings: Record<string, any> = {}
): BasePortalClient | null {
  switch (portal) {
    case 'inmuebles24':
      return new Inmuebles24Client(credentials, settings)
    case 'vivanuncios':
      return new VivanunciosClient(credentials, settings)
    case 'lamudi':
      return new LamudiClient(credentials, settings)
    default:
      return null
  }
}
