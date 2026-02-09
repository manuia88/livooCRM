'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Globe,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Eye,
  Users,
  Clock,
  AlertTriangle,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { PageContainer } from '@/components/backoffice/PageContainer'

const supabase = createClient()

// Portal metadata
const PORTAL_INFO: Record<string, { label: string; color: string; icon: string }> = {
  inmuebles24: { label: 'Inmuebles24', color: 'bg-blue-600', icon: '🏠' },
  vivanuncios: { label: 'Vivanuncios', color: 'bg-green-600', icon: '📢' },
  lamudi: { label: 'Lamudi', color: 'bg-purple-600', icon: '🌐' },
  mercadolibre: { label: 'Mercado Libre', color: 'bg-yellow-500', icon: '🛒' },
  propiedades_com: { label: 'Propiedades.com', color: 'bg-red-600', icon: '🔑' },
  properati: { label: 'Properati', color: 'bg-teal-600', icon: '📍' },
  metroscubicos: { label: 'Metros Cúbicos', color: 'bg-indigo-600', icon: '📐' }
}

interface PortalPublication {
  id: string
  portal_name: string
  portal_listing_id?: string
  portal_url?: string
  status: string
  last_synced_at?: string
  sync_error?: string
  views_on_portal: number
  contacts_from_portal: number
}

interface PortalConfig {
  id: string
  portal: string
  enabled: boolean
  settings: any
}

export default function PublicarPropertyPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  const [property, setProperty] = useState<any>(null)
  const [publications, setPublications] = useState<PortalPublication[]>([])
  const [portalConfigs, setPortalConfigs] = useState<PortalConfig[]>([])
  const [selectedPortals, setSelectedPortals] = useState<string[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [publishResults, setPublishResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [propertyId])

  async function loadData() {
    setLoading(true)
    try {
      // Load property, publications, and portal configs in parallel
      const [propRes, pubRes, configRes] = await Promise.all([
        supabase.from('properties').select('id, title, photos, status, operation_type, sale_price, rent_price, health_score').eq('id', propertyId).single(),
        supabase.from('property_portals').select('*').eq('property_id', propertyId),
        supabase.from('portal_configs').select('*').eq('enabled', true)
      ])

      if (propRes.data) setProperty(propRes.data)
      if (pubRes.data) setPublications(pubRes.data)
      if (configRes.data) setPortalConfigs(configRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getPublication(portal: string): PortalPublication | undefined {
    return publications.find(p => p.portal_name === portal)
  }

  function togglePortal(portal: string) {
    setSelectedPortals(prev =>
      prev.includes(portal)
        ? prev.filter(p => p !== portal)
        : [...prev, portal]
    )
  }

  async function handlePublish() {
    if (selectedPortals.length === 0) return
    setIsPublishing(true)
    setPublishResults(null)

    try {
      const response = await fetch('/api/publish-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          portals: selectedPortals,
          action: 'publish'
        })
      })
      const data = await response.json()
      setPublishResults(data)
      setSelectedPortals([])
      await loadData()
    } catch (error) {
      console.error('Publish error:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  async function handleSync() {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/publish-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          action: 'update'
        })
      })
      await response.json()
      await loadData()
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  async function handleUnpublish(portal: string) {
    try {
      await fetch('/api/publish-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          portals: [portal],
          action: 'unpublish'
        })
      })
      await loadData()
    } catch (error) {
      console.error('Unpublish error:', error)
    }
  }

  const publishedCount = publications.filter(p => p.status === 'published').length
  const errorCount = publications.filter(p => p.status === 'error').length
  const unpublishedPortals = portalConfigs.filter(
    c => !publications.find(p => p.portal_name === c.portal && p.status === 'published')
  )

  if (loading) {
    return (
      <PageContainer title="Publicar en Portales" icon={Globe} variant="crm">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Publicar en Portales"
      subtitle={property?.title || 'Propiedad'}
      icon={Globe}
      variant="crm"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          {publishedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Sincronizar todo
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Publicadas</p>
                <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Portales disponibles</p>
                <p className="text-2xl font-bold text-gray-900">{portalConfigs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${errorCount > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                {errorCount > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Con errores</p>
                <p className="text-2xl font-bold text-gray-900">{errorCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Published Portals */}
        {publications.filter(p => ['published', 'paused', 'error'].includes(p.status)).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Publicaciones activas</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {publications
                .filter(p => ['published', 'paused', 'error'].includes(p.status))
                .map(pub => {
                  const info = PORTAL_INFO[pub.portal_name] || { label: pub.portal_name, color: 'bg-gray-600', icon: '🌐' }
                  return (
                    <div key={pub.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{info.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{info.label}</p>
                            <Badge
                              variant={pub.status === 'published' ? 'default' : pub.status === 'error' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {pub.status === 'published' ? 'Publicada' :
                               pub.status === 'error' ? 'Error' :
                               pub.status === 'paused' ? 'Pausada' : pub.status}
                            </Badge>
                          </div>
                          {pub.sync_error && (
                            <p className="text-xs text-red-600 mt-1">{pub.sync_error}</p>
                          )}
                          {pub.last_synced_at && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Sincronizado: {new Date(pub.last_synced_at).toLocaleString('es-MX')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Analytics */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1" title="Vistas en portal">
                            <Eye className="w-4 h-4" />
                            <span>{pub.views_on_portal}</span>
                          </div>
                          <div className="flex items-center gap-1" title="Contactos del portal">
                            <Users className="w-4 h-4" />
                            <span>{pub.contacts_from_portal}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {pub.portal_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(pub.portal_url!, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnpublish(pub.portal_name)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Publish to New Portals */}
        {unpublishedPortals.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Publicar en nuevos portales</h2>
              <p className="text-sm text-gray-500 mt-1">Selecciona los portales donde quieres publicar esta propiedad</p>
            </div>
            <div className="divide-y divide-gray-100">
              {unpublishedPortals.map(config => {
                const info = PORTAL_INFO[config.portal] || { label: config.portal, color: 'bg-gray-600', icon: '🌐' }
                const isSelected = selectedPortals.includes(config.portal)

                return (
                  <label
                    key={config.id}
                    className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePortal(config.portal)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-2xl">{info.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{info.label}</p>
                        <p className="text-xs text-gray-500">
                          {config.settings?.auto_sync_photos ? 'Sync automático de fotos' : 'Publicación manual'}
                        </p>
                      </div>
                    </div>

                    <Badge variant="secondary" className="text-xs">
                      Disponible
                    </Badge>
                  </label>
                )
              })}
            </div>

            {/* Publish Button */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <Button
                onClick={handlePublish}
                disabled={isPublishing || selectedPortals.length === 0}
                className="w-full"
                size="lg"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Globe className="w-5 h-5 mr-2" />
                    Publicar en {selectedPortals.length} portal{selectedPortals.length !== 1 ? 'es' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* No portals configured */}
        {portalConfigs.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay portales configurados
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
              Para publicar propiedades en portales externos, primero debes configurar las credenciales
              de los portales en la sección de configuración de tu agencia.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push('/backoffice/configuracion')}
            >
              Ir a Configuración
            </Button>
          </div>
        )}

        {/* Publish Results */}
        {publishResults && (
          <div className={`bg-white rounded-2xl border p-6 ${
            publishResults.errors > 0 ? 'border-yellow-200' : 'border-green-200'
          }`}>
            <h3 className="font-semibold text-gray-900 mb-3">
              Resultado de publicación
            </h3>
            <div className="space-y-2">
              {publishResults.results?.map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  {r.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <span className="font-medium capitalize">{r.portal}</span>
                  {r.success ? (
                    <span className="text-green-600">Publicada exitosamente</span>
                  ) : (
                    <span className="text-red-600">{r.error}</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {publishResults.published}/{publishResults.total} publicaciones exitosas
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
