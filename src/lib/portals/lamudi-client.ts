/**
 * Lamudi Portal Client - Mock Implementation
 *
 * Real implementation will be added when API access is contracted.
 */

import {
  BasePortalClient,
  PortalPropertyData,
  PublishResponse,
  PortalPropertyStatus,
  PortalConnectionTest
} from './base-portal'

export class LamudiClient extends BasePortalClient {
  constructor(credentials: Record<string, any>, settings: Record<string, any> = {}) {
    super('lamudi', credentials, settings)
  }

  async publish(property: PortalPropertyData): Promise<PublishResponse> {
    try {
      await this.simulateApiDelay()
      const mockExternalId = `LMD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      return {
        success: true,
        externalId: mockExternalId,
        externalUrl: `https://www.lamudi.com.mx/detalle/${mockExternalId}`,
        rawResponse: { mock: true }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async update(externalId: string, property: PortalPropertyData): Promise<PublishResponse> {
    try {
      await this.simulateApiDelay()
      return {
        success: true,
        externalId,
        externalUrl: `https://www.lamudi.com.mx/detalle/${externalId}`,
        rawResponse: { mock: true, action: 'update' }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async unpublish(externalId: string): Promise<PublishResponse> {
    try {
      await this.simulateApiDelay()
      return { success: true, externalId, rawResponse: { mock: true, action: 'unpublish' } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async getStatus(externalId: string): Promise<PortalPropertyStatus> {
    await this.simulateApiDelay()
    return {
      status: 'published',
      views: Math.floor(Math.random() * 400) + 40,
      contacts: Math.floor(Math.random() * 12),
      lastSyncedAt: new Date().toISOString(),
      portalUrl: `https://www.lamudi.com.mx/detalle/${externalId}`
    }
  }

  async testConnection(): Promise<PortalConnectionTest> {
    await this.simulateApiDelay()
    return {
      connected: !!this.credentials.api_key,
      error: !this.credentials.api_key ? 'API key no configurada' : undefined,
      portalName: this.portalName,
      testedAt: new Date().toISOString()
    }
  }

  private simulateApiDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
  }
}
