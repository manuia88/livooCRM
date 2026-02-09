'use client'

import { useState } from 'react'
import {
  Download,
  RefreshCw,
  Check,
  ExternalLink,
  Trash2,
  ChevronDown,
  AlertTriangle,
  Home,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import {
  useScrapedListings,
  useScrapingJobs,
  useStartScraping,
  useImportListing,
  useImportMultipleListings,
  useDeleteScrapedListing,
  type ScrapedListing
} from '@/hooks/useScraping'

const PORTALS = [
  { id: 'inmuebles24', name: 'Inmuebles24', enabled: true },
  { id: 'vivanuncios', name: 'Vivanuncios', enabled: true },
  { id: 'lamudi', name: 'Lamudi', enabled: false },
  { id: 'properati', name: 'Properati', enabled: false }
]

const CITIES = [
  { value: 'ciudad-de-mexico', label: 'Ciudad de México' },
  { value: 'guadalajara', label: 'Guadalajara' },
  { value: 'monterrey', label: 'Monterrey' },
  { value: 'puebla', label: 'Puebla' },
  { value: 'queretaro', label: 'Querétaro' },
  { value: 'cancun', label: 'Cancún' },
  { value: 'merida', label: 'Mérida' },
  { value: 'tijuana', label: 'Tijuana' },
  { value: 'leon', label: 'León' },
  { value: 'san-luis-potosi', label: 'San Luis Potosí' }
]

export default function ImportarPropiedadesPage() {
  const [selectedSource, setSelectedSource] = useState('inmuebles24')
  const [selectedCity, setSelectedCity] = useState('ciudad-de-mexico')
  const [operation, setOperation] = useState<'venta' | 'renta'>('venta')
  const [pages, setPages] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { data: listings, isLoading: listingsLoading } = useScrapedListings({
    source: selectedSource,
    imported: false
  })

  const { data: jobs } = useScrapingJobs()

  const { mutate: startScraping, isPending: isScrapingPending } = useStartScraping()
  const { mutate: importListing, isPending: isImporting } = useImportListing()
  const { mutate: importMultiple, isPending: isImportingMultiple } = useImportMultipleListings()
  const { mutate: deleteListing } = useDeleteScrapedListing()

  const activeJob = jobs?.find(j => j.status === 'running')

  function handleStartScraping() {
    startScraping({
      source: selectedSource,
      pages,
      city: selectedCity,
      operation
    })
  }

  function toggleSelection(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    if (!listings) return
    if (selectedIds.size === listings.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(listings.map(l => l.id)))
    }
  }

  function handleImportSelected() {
    if (selectedIds.size === 0) return
    importMultiple(Array.from(selectedIds), {
      onSuccess: () => setSelectedIds(new Set())
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Importar Propiedades</h1>
        <p className="text-gray-500">
          Busca e importa propiedades desde portales inmobiliarios externos
        </p>
      </div>

      {/* Scraping Controls */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="font-semibold mb-4">Configuración de Búsqueda</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Portal selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Portal</label>
            <div className="relative">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white appearance-none pr-8"
              >
                {PORTALS.map(p => (
                  <option key={p.id} value={p.id} disabled={!p.enabled}>
                    {p.name}{!p.enabled ? ' (pronto)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* City selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white appearance-none pr-8"
              >
                {CITIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Operation type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <div className="flex gap-2">
              <button
                onClick={() => setOperation('venta')}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium ${
                  operation === 'venta'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                Venta
              </button>
              <button
                onClick={() => setOperation('renta')}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium ${
                  operation === 'renta'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                Renta
              </button>
            </div>
          </div>

          {/* Pages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Páginas (máx. 5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={pages}
              onChange={(e) => setPages(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Action button */}
          <div className="flex items-end">
            <button
              onClick={handleStartScraping}
              disabled={isScrapingPending || !!activeJob}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {isScrapingPending || activeJob ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Buscar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active job progress */}
        {activeJob && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-blue-700">
              Buscando en {activeJob.source}...
              {activeJob.pages_scraped > 0 && ` Página ${activeJob.pages_scraped}/${activeJob.pages_requested}`}
              {activeJob.listings_found > 0 && ` - ${activeJob.listings_found} encontradas`}
            </span>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3">
          Cada página contiene aprox. 20 propiedades. Se respeta un límite de 1
          solicitud por segundo. Solo para uso interno de comparación de mercado.
        </p>
      </div>

      {/* Bulk actions */}
      {listings && listings.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedIds.size === listings.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </button>
            {selectedIds.size > 0 && (
              <span className="text-sm text-gray-500">
                {selectedIds.size} seleccionadas
              </span>
            )}
          </div>

          {selectedIds.size > 0 && (
            <button
              onClick={handleImportSelected}
              disabled={isImportingMultiple}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
            >
              {isImportingMultiple ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Importar seleccionadas ({selectedIds.size})
            </button>
          )}
        </div>
      )}

      {/* Listings */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">
            Propiedades Encontradas ({listings?.length || 0})
          </h2>
        </div>

        {listingsLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">Cargando propiedades...</p>
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="divide-y">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                selected={selectedIds.has(listing.id)}
                onToggleSelect={() => toggleSelection(listing.id)}
                onImport={() => importListing(listing.id)}
                onDelete={() => deleteListing(listing.id)}
                isImporting={isImporting}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-1">No hay propiedades para importar</p>
            <p className="text-gray-400 text-sm">Inicia una nueva búsqueda para encontrar propiedades</p>
          </div>
        )}
      </div>

      {/* Recent Jobs */}
      {jobs && jobs.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold mb-3">Historial de Importaciones</h2>
          <div className="bg-white rounded-lg border divide-y">
            {jobs.slice(0, 5).map(job => (
              <div key={job.id} className="p-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <JobStatusIcon status={job.status} />
                  <div>
                    <p className="font-medium capitalize">{job.source}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(job.created_at).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right text-gray-500">
                  <p>{job.listings_found} encontradas / {job.listings_new} nuevas</p>
                  {job.error_message && (
                    <p className="text-red-500 text-xs truncate max-w-[200px]">{job.error_message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────

function ListingCard({
  listing,
  selected,
  onToggleSelect,
  onImport,
  onDelete,
  isImporting
}: {
  listing: ScrapedListing
  selected: boolean
  onToggleSelect: () => void
  onImport: () => void
  onDelete: () => void
  isImporting: boolean
}) {
  return (
    <div className={`p-4 hover:bg-gray-50 transition-colors ${selected ? 'bg-blue-50' : ''}`}>
      <div className="flex gap-4">
        {/* Checkbox */}
        <div className="flex items-start pt-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Image */}
        {listing.images?.[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.title || 'Propiedad'}
            className="w-36 h-28 object-cover rounded-lg flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-36 h-28 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
            <Home className="w-8 h-8 text-gray-300" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>

              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 flex-wrap">
                {listing.price && (
                  <span className="font-bold text-blue-600">
                    ${listing.price.toLocaleString('es-MX')} {listing.currency}
                  </span>
                )}
                {listing.bedrooms != null && (
                  <span className="flex items-center gap-1">
                    <BedDouble className="w-3.5 h-3.5" />
                    {listing.bedrooms} rec
                  </span>
                )}
                {listing.bathrooms != null && (
                  <span className="flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5" />
                    {listing.bathrooms} baños
                  </span>
                )}
                {listing.construction_m2 != null && (
                  <span className="flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5" />
                    {listing.construction_m2} m²
                  </span>
                )}
              </div>

              {listing.address && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {[listing.address.neighborhood, listing.address.city, listing.address.state]
                    .filter(Boolean).join(', ')}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                  {listing.source}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  listing.operation_type === 'venta'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {listing.operation_type}
                </span>
                {listing.property_type && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
                    {listing.property_type.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={listing.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border rounded-lg hover:bg-gray-100 text-gray-500"
                title="Ver en portal"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={onDelete}
                className="p-2 border rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onImport}
                disabled={isImporting}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5 text-sm font-medium"
              >
                <Check className="w-4 h-4" />
                Importar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function JobStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'running':
      return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
    case 'completed':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />
    case 'failed':
      return <XCircle className="w-5 h-5 text-red-500" />
    default:
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
  }
}
