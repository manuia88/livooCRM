'use client'

import { useState, useMemo, useEffect } from 'react'
import { useProperties, usePropertiesStats, useDeleteProperty, type Property, type PropertiesFilters } from '@/hooks/useProperties'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Home,
  Plus,
  Search,
  Building2,
  Network,
  Layers,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { PropertyFiltersSidebar, INITIAL_ADVANCED, type AdvancedFiltersState } from './PropertyFiltersSidebar'
import { PriceFilterPopover } from './PriceFilterPopover'
import { getPricePerM2, getValuationClassification, type ValuationLevel } from '@/lib/valuation'
import { getOperationBannerGradient, getOperationLabel, getPropertyTypeLabel, getBannerText } from '@/lib/property-card-theme'
import { PropertyDrawer } from '@/components/backoffice/PropertyDrawer'
import { Skeleton } from '@/components/ui/skeleton'
import { useAgencyUsers } from '@/hooks/useAgencyUsers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

/** Motivos de baja para eliminar una propiedad (obligatorio preguntar al asesor) */
const DELETE_REASONS = [
  { value: 'propietario_no_quiso', label: 'El propietario decidió no vender ni rentar' },
  { value: 'operacion_cerrada_exito', label: 'Operación cerrada con éxito (vendida o rentada por nosotros)' },
  { value: 'vendida_rentada_otro', label: 'Vendida o rentada por otro medio o inmobiliaria' },
  { value: 'baja_interna', label: 'Baja interna (ya no manejamos esta propiedad)' },
  { value: 'listado_duplicado', label: 'Listado duplicado' },
  { value: 'error_registro', label: 'Error en el registro (carga incorrecta)' },
  { value: 'otro', label: 'Otro motivo' },
] as const

const PRICE_RANGE = [0, 50_000_000] as const
const PAGE_SIZE = 12
const OPERATION_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'venta', label: 'Venta' },
  { value: 'renta', label: 'Renta' },
] as const

const PROPERTY_TYPES = [
  { value: 'all', label: 'Todos' },
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'local', label: 'Local' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'bodega', label: 'Bodega' },
] as const

/** 3 ejemplos fijos en la pestaña Propias: Renta (verde), Venta o Renta (violeta), Oficina (ámbar) */
const PROPIAS_EJEMPLOS: Property[] = [
  {
    id: 'ejemplo-renta',
    agency_id: '',
    producer_id: '',
    title: 'Departamento en Renta',
    description: null,
    property_type: 'departamento',
    operation_type: 'renta',
    address: 'Av. Amsterdam 456',
    neighborhood: 'Condesa',
    city: 'Ciudad de México',
    state: 'CDMX',
    price: 28_000,
    rent_price: 28_000,
    bedrooms: 2,
    bathrooms: 2,
    half_bathrooms: 0,
    parking_spaces: 1,
    total_area: 95,
    construction_m2: 95,
    land_m2: null,
    maintenance_fee: 2500,
    commission_percentage: null,
    main_image_url: 'https://picsum.photos/seed/condesa-1/800/600',
    images: ['https://picsum.photos/seed/condesa-1/800/600', 'https://picsum.photos/seed/condesa-2/800/600'],
    status: 'active',
    visibility: 'public',
    published: true,
    health_score: 90,
    mls_shared: false,
    slug: null,
    owner_name: null,
    owner_phone: null,
    owner_email: null,
    is_my_agency: true,
    is_mine: false,
    source: 'own',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    currency: 'MXN',
  },
  {
    id: 'ejemplo-venta-renta',
    agency_id: '',
    producer_id: '',
    title: 'Casa en Venta o Renta',
    description: null,
    property_type: 'casa',
    operation_type: 'ambos',
    address: 'Av. Álvaro Obregón 123',
    neighborhood: 'Roma Norte',
    city: 'Ciudad de México',
    state: 'CDMX',
    price: 5_500_000,
    rent_price: 35_000,
    bedrooms: 3,
    bathrooms: 2,
    half_bathrooms: 1,
    parking_spaces: 2,
    total_area: 150,
    construction_m2: 150,
    land_m2: null,
    maintenance_fee: 2500,
    commission_percentage: 3,
    main_image_url: 'https://picsum.photos/seed/depto-venta-renta-1/800/600',
    images: ['https://picsum.photos/seed/depto-venta-renta-1/800/600', 'https://picsum.photos/seed/depto-venta-renta-2/800/600'],
    status: 'active',
    visibility: 'public',
    published: true,
    health_score: 85,
    mls_shared: false,
    slug: null,
    owner_name: null,
    owner_phone: null,
    owner_email: null,
    is_my_agency: true,
    is_mine: false,
    source: 'own',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    currency: 'MXN',
  },
  {
    id: 'ejemplo-oficina',
    agency_id: '',
    producer_id: '',
    title: 'Oficina en Venta',
    description: null,
    property_type: 'oficina',
    operation_type: 'venta',
    address: 'Av. Presidente Masaryk 789',
    neighborhood: 'Polanco',
    city: 'Ciudad de México',
    state: 'CDMX',
    price: 8_900_000,
    rent_price: null,
    bedrooms: null,
    bathrooms: 2,
    half_bathrooms: 0,
    parking_spaces: 4,
    total_area: 220,
    construction_m2: 220,
    land_m2: null,
    maintenance_fee: null,
    commission_percentage: 5,
    main_image_url: 'https://picsum.photos/seed/polanco-1/800/600',
    images: ['https://picsum.photos/seed/polanco-1/800/600', 'https://picsum.photos/seed/polanco-2/800/600'],
    status: 'active',
    visibility: 'public',
    published: true,
    health_score: 78,
    mls_shared: false,
    slug: null,
    owner_name: null,
    owner_phone: null,
    owner_email: null,
    is_my_agency: true,
    is_mine: false,
    source: 'own',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    currency: 'MXN',
  },
]

/** Tarjetas de prueba (legacy, por si se usan en otro lugar) */
const MOCK_PROPERTIES: Property[] = [
  {
    id: 'mock-4',
    agency_id: '',
    producer_id: '',
    title: 'Casa en Venta Valle',
    description: null,
    property_type: 'casa',
    operation_type: 'venta',
    address: 'Av. San Jerónimo 100',
    neighborhood: 'San Ángel',
    city: 'Ciudad de México',
    state: 'CDMX',
    price: 15_000_000,
    rent_price: null,
    bedrooms: 4,
    bathrooms: 3,
    half_bathrooms: 1,
    parking_spaces: 2,
    total_area: 210,
    construction_m2: 195,
    land_m2: 180,
    maintenance_fee: null,
    commission_percentage: 3,
    main_image_url: 'https://picsum.photos/seed/sanangel-1/800/600',
    images: [
      'https://picsum.photos/seed/sanangel-1/800/600',
      'https://picsum.photos/seed/sanangel-2/800/600',
      'https://picsum.photos/seed/sanangel-3/800/600',
      'https://picsum.photos/seed/sanangel-4/800/600',
    ],
    status: 'active',
    visibility: 'public',
    published: true,
    health_score: 88,
    mls_shared: false,
    slug: null,
    owner_name: null,
    owner_phone: null,
    owner_email: null,
    is_my_agency: true,
    is_mine: false,
    source: 'agency',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    currency: 'MXN',
  },
]

/** Fotos de prueba para PH Condesa / propiedades Condesa sin fotos (demo en Venta) */
const FOTOS_PH_CONDESA = [
  'https://picsum.photos/seed/ph-condesa-1/800/600',
  'https://picsum.photos/seed/ph-condesa-2/800/600',
  'https://picsum.photos/seed/ph-condesa-3/800/600',
  'https://picsum.photos/seed/ph-condesa-4/800/600',
]

type InventoryTab = 'own' | 'agency' | 'network' | 'mls'

export default function PropertiesPage() {
  const [activeTab, setActiveTab] = useState<InventoryTab>('own')
  const [search, setSearch] = useState('')
  const [operation, setOperation] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_RANGE[0], PRICE_RANGE[1]])
  const [belowMarket, setBelowMarket] = useState(false)
  const [propertyType, setPropertyType] = useState<string>('all')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersState>(INITIAL_ADVANCED)
  const [page, setPage] = useState(1)
  const [drawerProperty, setDrawerProperty] = useState<Property | null>(null)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [deletionReason, setDeletionReason] = useState<string>('')
  const [deletionReasonOther, setDeletionReasonOther] = useState('')

  const { data: currentUser } = useCurrentUser()
  const { data: agencyUsers = [] } = useAgencyUsers()
  const deletePropertyMutation = useDeleteProperty()

  useEffect(() => {
    setPage(1)
  }, [activeTab, search, priceRange, propertyType, operation, advancedFilters])
  const filters: PropertiesFilters = useMemo(() => {
    const f: PropertiesFilters = {
      source: activeTab,
      search: search || undefined,
      price_min: priceRange[0] > PRICE_RANGE[0] ? priceRange[0] : undefined,
      price_max: priceRange[1] < PRICE_RANGE[1] ? priceRange[1] : undefined,
      property_type: propertyType !== 'all' ? propertyType : undefined,
      operation_type: operation !== 'all' ? operation : undefined,
      ...(advancedFilters.bedrooms != null && { bedrooms: advancedFilters.bedrooms }),
      ...(advancedFilters.bathrooms != null && { bathrooms: advancedFilters.bathrooms }),
      ...(advancedFilters.parking_spaces != null && { parking_spaces: advancedFilters.parking_spaces }),
      ...(advancedFilters.construction_m2_min != null && { construction_m2_min: advancedFilters.construction_m2_min }),
      ...(advancedFilters.construction_m2_max != null && { construction_m2_max: advancedFilters.construction_m2_max }),
      ...(advancedFilters.land_m2_min != null && { land_m2_min: advancedFilters.land_m2_min }),
      ...(advancedFilters.land_m2_max != null && { land_m2_max: advancedFilters.land_m2_max }),
      ...(advancedFilters.status.length > 0 && { status: advancedFilters.status }),
    }
    return f
  }, [activeTab, search, priceRange, propertyType, operation, advancedFilters])

  const { data: properties = [], isLoading } = useProperties(filters)
  const { data: stats } = usePropertiesStats()

  const totalItems = properties.length
  const numEjemplos = PROPIAS_EJEMPLOS.length
  /** Conteos por pestaña: la activa usa la longitud de la lista; Propias incluye siempre los 3 ejemplos fijos */
  const countOwn = (activeTab === 'own' ? totalItems : (stats?.mine ?? 0)) + numEjemplos
  const countAgency = activeTab === 'agency' ? totalItems : (stats?.total ?? 0)
  const countNetwork = activeTab === 'network' ? totalItems : (stats?.network ?? 0)
  const countMls = activeTab === 'mls' ? totalItems : (stats?.mls ?? 0)
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedProperties = useMemo(
    () => properties.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [properties, currentPage]
  )
  /** Lista a mostrar: en Propias se muestran primero 3 ejemplos (Renta, Venta/Renta, Oficina) con sus colores; luego las reales */
  const rawDisplayList = useMemo(
    () => (activeTab === 'own' ? [...PROPIAS_EJEMPLOS, ...paginatedProperties] : paginatedProperties),
    [activeTab, paginatedProperties]
  )

  /** Valuación (precio/m² y nivel) por propiedad, usando la misma lógica que Inventario */
  const valuationByProperty = useMemo(() => {
    const map = new Map<string, { pricePerM2: number | null; valuation: ValuationLevel }>()
    const pool = properties.filter((p) => !p.id.startsWith('mock-') && !p.id.startsWith('ejemplo-'))
    for (const p of rawDisplayList) {
      const pricePerM2 = getPricePerM2(p)
      const valuation = getValuationClassification(p, pool.length > 0 ? pool : rawDisplayList)
      map.set(p.id, { pricePerM2, valuation })
    }
    return map
  }, [rawDisplayList, properties])

  /** PH Condesa / propiedades Condesa sin fotos: completar tarjeta en Venta con datos y fotos de demo */
  const displayList = useMemo(() => {
    return rawDisplayList.map((p) => {
      const isCondesa = (p.title?.includes('Condesa') || p.address?.includes('Condesa') || p.neighborhood?.includes('Condesa') || p.title === 'PH Condesa') ?? false
      const sinFotos = !(Array.isArray(p.images) && p.images.length > 0) && !p.main_image_url
      if (isCondesa && sinFotos) {
        return {
          ...p,
          title: 'PH Condesa',
          property_type: 'departamento' as const,
          operation_type: 'venta' as const,
          address: 'Av. Mazatlán 88',
          neighborhood: 'Condesa',
          city: 'Ciudad de México',
          state: 'CDMX',
          price: 5_500_000,
          rent_price: null,
          currency: 'MXN' as const,
          bedrooms: 3,
          bathrooms: 2,
          half_bathrooms: 1,
          parking_spaces: 2,
          total_area: 125,
          construction_m2: 125,
          land_m2: null,
          maintenance_fee: 3200,
          commission_percentage: 3,
          main_image_url: FOTOS_PH_CONDESA[0],
          images: [...FOTOS_PH_CONDESA],
          year_built: 2015,
          pets_allowed: true,
          roof_garden_m2: 25,
          floor_number: 2,
        }
      }
      return p
    })
  }, [rawDisplayList])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 min-w-0 w-full max-w-full">
      <div className="p-4 sm:p-5 lg:p-6 w-full max-w-full min-w-0 box-border">
        {/* 1. Encabezado y Navegación - estilo backoffice */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center shadow-lg text-2xl">
                🏠
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                  Propiedades
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Gestiona tu inventario
                </p>
              </div>
            </div>
            <Link href="/backoffice/propiedades/nueva" className="flex-shrink-0">
              <Button
                size="lg"
                className="rounded-2xl bg-gray-900 hover:bg-gray-800 hover:scale-105 text-white font-semibold shadow-lg px-6 transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nueva propiedad
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. Tabs de segmentación - estilo dashboard */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as InventoryTab)}>
            <TabsList className="inline-flex h-12 p-1 bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200 shadow-2xl gap-1">
              <TabsTrigger
                value="own"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-900 data-[state=active]:to-gray-800 data-[state=active]:text-white data-[state=active]:shadow-lg px-4 sm:px-6 transition-all"
              >
                <Home className="h-4 w-4 mr-2" />
                Propias ({countOwn})
              </TabsTrigger>
              <TabsTrigger
                value="agency"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-900 data-[state=active]:to-gray-800 data-[state=active]:text-white data-[state=active]:shadow-lg px-4 sm:px-6 transition-all"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Inmobiliaria ({countAgency})
              </TabsTrigger>
              <TabsTrigger
                value="network"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-900 data-[state=active]:to-gray-800 data-[state=active]:text-white data-[state=active]:shadow-lg px-4 sm:px-6 transition-all"
              >
                <Network className="h-4 w-4 mr-2" />
                Red ({countNetwork})
              </TabsTrigger>
              <TabsTrigger
                value="mls"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-900 data-[state=active]:to-gray-800 data-[state=active]:text-white data-[state=active]:shadow-lg px-4 sm:px-6 transition-all"
              >
                <Layers className="h-4 w-4 mr-2" />
                MLS ({countMls})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 3. Búsqueda y filtros rápidos - card estilo backoffice */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar por colonia, delegación o dirección..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 rounded-xl border-gray-200 bg-gray-50/80 focus:bg-white shadow-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger className="w-[130px] h-12 rounded-2xl border-gray-200 bg-white/90">
                <SelectValue placeholder="Operación" />
              </SelectTrigger>
              <SelectContent>
                {OPERATION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="w-[160px] h-12 rounded-2xl border-gray-200 bg-white/90">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <PriceFilterPopover
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              belowMarket={belowMarket}
              onBelowMarketChange={setBelowMarket}
            />
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-xl border-gray-200 bg-gray-50/80 hover:bg-white shadow-sm"
              onClick={() => setAdvancedOpen(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </div>
        </div>

        {/* 4. Grid de propiedades - 3 columnas en lg, dimensiones como referencia */}
        <div className="min-h-[500px] w-full max-w-full min-w-0">
          <Tabs value={activeTab} className="contents">
            <TabsContent value={activeTab} className="mt-0 contents">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="min-w-0">
                      <PropertyCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : properties.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {displayList.map((p) => (
                      <div key={p.id} className="min-w-0">
                        <PropertyCard
                          property={p}
                          producer={p.id.startsWith('mock-') || p.id.startsWith('ejemplo-') ? undefined : agencyUsers.find((u) => u.id === p.producer_id)}
                          onOpenDrawer={() => setDrawerProperty(p)}
                        />
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-xl border-gray-200"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <div className="flex items-center gap-1">
                        {currentPage > 2 && (
                          <>
                            <button
                              type="button"
                              className="h-10 min-w-[2.5rem] rounded-xl border border-gray-200 bg-white px-2 font-medium text-gray-900 hover:bg-gray-50"
                              onClick={() => setPage(1)}
                            >
                              1
                            </button>
                            {currentPage > 3 && <span className="text-gray-400 px-1">…</span>}
                          </>
                        )}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((n) => n === currentPage || n === currentPage - 1 || n === currentPage + 1)
                          .map((n) => (
                            <button
                              key={n}
                              type="button"
                              className={`h-10 min-w-[2.5rem] rounded-xl border px-2 font-medium transition-colors ${
                                n === currentPage
                                  ? 'border-gray-900 bg-gray-900 text-white'
                                  : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
                              }`}
                              onClick={() => setPage(n)}
                            >
                              {n}
                            </button>
                          ))}
                        {currentPage < totalPages - 1 && (
                          <>
                            {currentPage < totalPages - 2 && <span className="text-gray-400 px-1">…</span>}
                            <button
                              type="button"
                              className="h-10 min-w-[2.5rem] rounded-xl border border-gray-200 bg-white px-2 font-medium text-gray-900 hover:bg-gray-50"
                              onClick={() => setPage(totalPages)}
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-xl border-gray-200"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState activeTab={activeTab} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PropertyFiltersSidebar
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
      />
      <PropertyDrawer
        property={drawerProperty}
        open={!!drawerProperty}
        onClose={() => setDrawerProperty(null)}
        onDelete={drawerProperty ? () => setPropertyToDelete(drawerProperty) : undefined}
        valuation={drawerProperty ? valuationByProperty.get(drawerProperty.id) : undefined}
      />
      <Dialog
        open={!!propertyToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setPropertyToDelete(null)
            setDeletionReason('')
            setDeletionReasonOther('')
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dar de baja propiedad</DialogTitle>
            <DialogDescription>
              Indica el motivo de la baja. Esta información se guarda para reportes y auditoría.
              {propertyToDelete && (
                <span className="mt-2 block font-medium text-foreground">
                  {propertyToDelete.address || propertyToDelete.title || propertyToDelete.id}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">¿Por qué deseas dar de baja esta propiedad?</Label>
              <RadioGroup
                value={deletionReason}
                onValueChange={(v) => {
                  setDeletionReason(v)
                  if (v !== 'otro') setDeletionReasonOther('')
                }}
                className="grid gap-2"
              >
                {DELETE_REASONS.map((r) => (
                  <div key={r.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={r.value} id={`reason-${r.value}`} />
                    <Label htmlFor={`reason-${r.value}`} className="text-sm font-normal cursor-pointer">
                      {r.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            {deletionReason === 'otro' && (
              <div className="space-y-2">
                <Label htmlFor="deletion-reason-other" className="text-sm font-semibold">
                  Especifica el motivo (opcional)
                </Label>
                <Textarea
                  id="deletion-reason-other"
                  placeholder="Ej.: Cambio de estrategia, propiedad ya no disponible..."
                  value={deletionReasonOther}
                  onChange={(e) => setDeletionReasonOther(e.target.value)}
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setPropertyToDelete(null)
                setDeletionReason('')
                setDeletionReasonOther('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!propertyToDelete) return
                const isMock = propertyToDelete.id.startsWith('mock-') || propertyToDelete.id.startsWith('ejemplo-')
                if (isMock) {
                  setPropertyToDelete(null)
                  setDeletionReason('')
                  setDeletionReasonOther('')
                  setDrawerProperty((prev) => (prev?.id === propertyToDelete.id ? null : prev))
                  return
                }
                const reasonLabel = DELETE_REASONS.find((r) => r.value === deletionReason)?.label ?? deletionReason
                const reasonText = deletionReason === 'otro' && deletionReasonOther.trim()
                  ? `Otro motivo: ${deletionReasonOther.trim()}`
                  : reasonLabel
                await deletePropertyMutation.mutateAsync({ id: propertyToDelete.id, reason: reasonText })
                setPropertyToDelete(null)
                setDeletionReason('')
                setDeletionReasonOther('')
                setDrawerProperty((prev) => (prev?.id === propertyToDelete.id ? null : prev))
              }}
              disabled={deletePropertyMutation.isPending || !deletionReason}
            >
              {deletePropertyMutation.isPending ? 'Eliminando…' : 'Dar de baja'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PropertyCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full min-w-0 flex flex-col">
      <Skeleton className="aspect-[4/3] w-full rounded-t-2xl flex-shrink-0" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-7 w-1/3" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
        <div className="pt-3 border-t border-gray-200 flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

/** Quita "Calle", "Avenida", "Av." etc. y deja solo nombre de calle y número */
function formatStreetAddress(address: string | null | undefined): string {
  if (!address?.trim()) return ''
  return address
    .replace(/\b(calle|avenida|av\.?)\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function PropertyCard({
  property,
  producer,
  onOpenDrawer,
}: {
  property: Property
  producer?: { full_name: string; avatar_url: string | null }
  onOpenDrawer: () => void
}) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const currency = (property?.currency ?? 'MXN') as 'MXN' | 'USD'
  const formatPrice = (price: number, curr: 'MXN' | 'USD' = currency) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(price)
  const priceNum = Number(property?.price)
  const priceText = Number.isFinite(priceNum) ? formatPrice(priceNum) : 'Consultar'
  const rentPriceNum = Number(property?.rent_price)
  const rentPriceText = Number.isFinite(rentPriceNum) ? formatPrice(rentPriceNum) : null
  const isAmbos = property?.operation_type === 'ambos'
  const images: string[] = useMemo(() => {
    const raw = property?.images
    if (Array.isArray(raw) && raw.length > 0) {
      const urls = raw
        .map((img: unknown) => (typeof img === 'string' ? img : (img as { url?: string })?.url))
        .filter(Boolean) as string[]
      if (urls.length > 0) return urls
    }
    return property?.main_image_url ? [property.main_image_url] : []
  }, [property?.images, property?.main_image_url])
  const currentImage = images[photoIndex] ?? images[0]
  const hasMultiplePhotos = images.length > 1
  const opLabel = getOperationLabel(property.operation_type)
  const typeLabel = getPropertyTypeLabel(property.property_type)
  const bannerText = getBannerText(property.operation_type, property.property_type ?? undefined)
  const bannerGradient = getOperationBannerGradient(property.operation_type, property.property_type ?? undefined)
  const m2 = property.construction_m2 ?? property.land_m2 ?? null
  const publishedDate = property.created_at
    ? new Date(property.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'
  const imageCount = images.length
  const showDocTag = property.status === 'draft'
  const displayAddress = formatStreetAddress(property.address || property.title) || property.address || property.title
  const isVenta = property.operation_type === 'venta'
  const isRenta = property.operation_type === 'renta'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpenDrawer}
      onKeyDown={(e) => e.key === 'Enter' && onOpenDrawer()}
      className="group w-full max-w-full min-w-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden cursor-pointer shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.18)] hover:border-gray-300"
    >
      {/* Área de fotos: 4:3 equilibrada (como referencias de portales) */}
      <div className="relative aspect-[4/3] flex-shrink-0 bg-gray-100 rounded-t-2xl overflow-hidden">
        {currentImage ? (
          <Image
            src={currentImage}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
            <span className="text-4xl" aria-hidden>🏠</span>
          </div>
        )}
        {/* Flechas: solo visibles al pasar el mouse por la tarjeta */}
        {imageCount > 0 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setPhotoIndex((i) => (i <= 0 ? images.length - 1 : i - 1))
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setPhotoIndex((i) => (i >= images.length - 1 ? 0 : i + 1))
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Siguiente foto"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        {/* Overlay: checkbox */}
        <div
          className="absolute top-2 left-2 z-10 flex flex-col gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur-sm px-2 py-1 shadow-md border border-white/60">
            <Checkbox
              id={`share-${property.id}`}
              className="h-3.5 w-3.5 border-gray-300 data-[state=checked]:bg-gray-900"
            />
            <label htmlFor={`share-${property.id}`} className="text-[11px] font-medium text-gray-800 cursor-pointer select-none">
              Compartir
            </label>
          </div>
          {showDocTag && (
            <span className="rounded-lg bg-amber-400 text-gray-900 px-2 py-0.5 text-[11px] font-bold">
              📄 Doc.
            </span>
          )}
        </div>
        {imageCount > 0 && (
          <div className="absolute top-2 right-2 z-10 rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white transition-opacity duration-200 opacity-0 group-hover:opacity-100">
            📷 {photoIndex + 1}/{imageCount}
          </div>
        )}
        <div className={`absolute bottom-0 left-0 right-0 ${bannerGradient} py-2 px-3 shadow-md`}>
          <span className="text-white text-[13px] font-bold tracking-tight">{bannerText}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-shrink-0">
        <div className="flex items-start gap-2 mb-1 min-w-0">
          <span className="text-sm flex-shrink-0 mt-0.5" aria-hidden>📍</span>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 line-clamp-1 text-[13px] leading-snug">
              {displayAddress}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
              {[property.neighborhood, property.city].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2 flex-wrap min-h-[28px]">
          {isAmbos && rentPriceText ? (
            <>
              <span className="text-[13px] font-black text-gray-900">{priceText}</span>
              <span className="text-sm font-bold text-green-600">{currency}</span>
              <span className="text-gray-300">·</span>
              <span className="text-[13px] font-black text-gray-900">{rentPriceText}</span>
              <span className="text-sm font-bold text-green-600">{currency}</span>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">/mes</span>
            </>
          ) : (
            <>
              <span className="text-[15px] font-black text-gray-900">{priceText}</span>
              <span className="text-sm font-bold text-green-600">{currency}</span>
              {property.operation_type === 'renta' && rentPriceText != null && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">/mes</span>
              )}
            </>
          )}
        </div>
        {/* Características: estilo neutro con degradado para no competir con el banner */}
        <div className="grid grid-cols-4 gap-1.5 mt-3 min-h-[46px]">
          {property.bedrooms != null && (
            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-gray-50 to-gray-100/80 py-1.5 px-1 border border-gray-200/80 shadow-sm">
              <span className="text-xl leading-none select-none opacity-90" aria-hidden>🛏️</span>
              <span className="text-xs font-bold text-gray-700 tabular-nums mt-0.5">{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-gray-50 to-gray-100/80 py-1.5 px-1 border border-gray-200/80 shadow-sm">
              <span className="text-xl leading-none select-none opacity-90" aria-hidden>🚿</span>
              <span className="text-xs font-bold text-gray-700 tabular-nums mt-0.5">{property.bathrooms}</span>
            </div>
          )}
          {property.parking_spaces != null && (
            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-gray-50 to-gray-100/80 py-1.5 px-1 border border-gray-200/80 shadow-sm">
              <span className="text-xl leading-none select-none opacity-90" aria-hidden>🚗</span>
              <span className="text-xs font-bold text-gray-700 tabular-nums mt-0.5">{property.parking_spaces}</span>
            </div>
          )}
          {m2 != null && (
            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-gray-50 to-gray-100/80 py-1.5 px-1 border border-gray-200/80 shadow-sm">
              <span className="text-xl leading-none select-none opacity-90" aria-hidden>📐</span>
              <span className="text-xs font-bold text-gray-700 tabular-nums mt-0.5">{m2} m²</span>
            </div>
          )}
        </div>
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-7 w-7 rounded-full border border-white shadow flex-shrink-0">
              <AvatarImage src={producer?.avatar_url ?? undefined} />
              <AvatarFallback className="rounded-full bg-gray-200 text-gray-700 text-xs font-bold">
                {(producer?.full_name ?? 'L').slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold text-gray-700 truncate">{producer?.full_name ?? 'Livoo'}</span>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-gray-500 uppercase font-medium">Publicado</p>
            <p className="text-xs font-bold text-gray-800">{publishedDate}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ activeTab }: { activeTab: string }) {
  const config: Record<string, { title: string; description: string; icon: typeof Home; emoji: string }> = {
    own: {
      title: 'No tienes propiedades',
      description: 'Crea tu primera propiedad para comenzar.',
      icon: Home,
      emoji: '🏠',
    },
    agency: {
      title: 'No hay propiedades en tu inmobiliaria',
      description: 'Sé el primero en agregar una.',
      icon: Building2,
      emoji: '🏢',
    },
    network: {
      title: 'No hay propiedades en la red',
      description: 'Otras inmobiliarias aún no han compartido propiedades.',
      icon: Network,
      emoji: '🔗',
    },
    mls: {
      title: 'No hay propiedades en MLS',
      description: 'Las propiedades compartidas en MLS aparecerán aquí.',
      icon: Layers,
      emoji: '📋',
    },
  }
  const { title, description, icon: Icon, emoji } = config[activeTab] ?? config.own

  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200 shadow-2xl">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-5 text-4xl shadow-lg">
        {emoji}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 text-center max-w-sm">{description}</p>
      {activeTab === 'own' && (
        <Link href="/backoffice/propiedades/nueva">
          <Button size="lg" className="rounded-2xl bg-gray-900 hover:bg-gray-800 hover:scale-105 shadow-lg transition-all duration-200">
            <Plus className="h-5 w-5 mr-2" />
            Crear primera propiedad
          </Button>
        </Link>
      )}
    </div>
  )
}
