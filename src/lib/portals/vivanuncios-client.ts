/**
 * Vivanuncios Portal Client - Mock Implementation
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

export class VivanunciosClient extends BasePortalClient {
  constructor(credentials: Record<string, any>, settings: Record<string, any> = {}) {
    super('vivanuncios', credentials, settings)
  }

  async publish(property: PortalPropertyData): Promise<PublishResponse> {
    try {
      // TODO: Implement real Vivanuncios API call
      await this.simulateApiDelay()
      const mockExternalId = `VVN-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      return {
        success: true,
        externalId: mockExternalId,
        externalUrl: `https://www.vivanuncios.com.mx/a/${mockExternalId}`,
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
        externalUrl: `https://www.vivanuncios.com.mx/a/${externalId}`,
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
      views: Math.floor(Math.random() * 300) + 30,
      contacts: Math.floor(Math.random() * 15),
      lastSyncedAt: new Date().toISOString(),
      portalUrl: `https://www.vivanuncios.com.mx/a/${externalId}`
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
