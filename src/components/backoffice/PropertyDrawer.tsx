'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Share2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video,
  Maximize2,
  LayoutGrid,
  MapPin,
  Navigation,
  Trash2,
} from 'lucide-react'
import type { Property } from '@/hooks/useProperties'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { getPricePerM2, VALUATION_COLORS, type ValuationLevel } from '@/lib/valuation'
import { getOperationBannerGradient, getOperationLabel, getPropertyTypeLabel } from '@/lib/property-card-theme'

const STATUS_LABELS: Record<Property['status'], string> = {
  draft: 'Borrador',
  active: 'Disponible',
  reserved: 'Reservada',
  sold: 'Vendida',
  rented: 'Rentada',
  suspended: 'No disponible',
  archived: 'Archivada',
}

const LEGAL_STATUS_LABELS: Record<string, string> = {
  sin_contrato: 'Sin Contrato',
  docs_pendientes: 'Documentos Pendientes',
  en_revision: 'En Revisión',
  aprobados: 'Aprobado',
  rechazados: 'Rechazado',
  contrato_enviado: 'Contrato Enviado',
  contrato_firmado: 'Contrato Firmado',
}

// Placeholder amenidades; en producción vendrían del modelo
const DEFAULT_AMENITIES = [
  'Alberca',
  'Gimnasio',
  'Terraza',
  'Balcón',
  'Cocina integral',
  'Área de lavado',
]

/** Tipos donde no se muestran todas las características residenciales (obligatorias en captación para casa/dep/local) */
const TIPOS_SIN_CARACT_RESIDENCIALES = ['oficina', 'terreno', 'bodega', 'nave_industrial']

/** Valuación calculada con la misma lógica que el módulo Inventario */
export interface PropertyDrawerValuation {
  pricePerM2: number | null
  valuation: ValuationLevel
}

interface PropertyDrawerProps {
  property: Property | null
  open: boolean
  onClose: () => void
  /** Si se define, se muestra el botón de eliminar (basura roja) al lado de Compartir */
  onDelete?: () => void
  /** Precio/m² y nivel de valuación (vinculado a Inventario) */
  valuation?: PropertyDrawerValuation
}

function formatPrice(price: number, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

export function PropertyDrawer({ property, open, onClose, onDelete, valuation }: PropertyDrawerProps) {
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [mediaTab, setMediaTab] = useState<'fotos' | 'video' | '360' | 'planos' | 'mapa' | 'street'>('fotos')
  const { data: currentUser } = useCurrentUser()

  const isProducer = !!currentUser && !!property && property.producer_id === currentUser.id
  // Datos del propietario: solo productor o admins/manager de la inmobiliaria (no red, otros agentes ni MLS)
  const canSeeOwnerData =
    !!currentUser &&
    !!property &&
    (property.producer_id === currentUser.id ||
      (property.agency_id === currentUser.agency_id &&
        (currentUser.role === 'admin' || currentUser.role === 'manager')))
  const rawImages = property?.images
  const images: string[] =
    Array.isArray(rawImages) && rawImages.length > 0
      ? (rawImages
          .map((img: unknown) => (typeof img === 'string' ? img : (img as { url?: string })?.url))
          .filter(Boolean) as string[])
      : property?.main_image_url
        ? [property.main_image_url]
        : []
  const totalImages = images.length
  const currentImage = images[galleryIndex] ?? null

  const goPrev = useCallback(() => {
    setGalleryIndex((i) => (i <= 0 ? totalImages - 1 : i - 1))
  }, [totalImages])
  const goNext = useCallback(() => {
    setGalleryIndex((i) => (i >= totalImages - 1 ? 0 : i + 1))
  }, [totalImages])

  if (!property) return null

  const opLabel = getOperationLabel(property.operation_type)
  const typeLabel = getPropertyTypeLabel(property.property_type)
  const publishedDate = property.created_at
    ? new Date(property.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'

  const headerBannerGradient = getOperationBannerGradient(property.operation_type, property.property_type ?? undefined)
  const isRenta = property.operation_type === 'renta'
  const isVenta = property.operation_type === 'venta'

  const currency = property.currency ?? 'MXN'

  /** Precio/m² para la ficha: venta usa price, renta usa rent_price, ambos muestra los dos */
  const pricePerM2Sale =
    property.operation_type === 'venta' || property.operation_type === 'ambos'
      ? (valuation?.pricePerM2 ?? getPricePerM2({ ...property, operation_type: 'venta' }))
      : null
  const pricePerM2Rent =
    property.operation_type === 'renta' || property.operation_type === 'ambos'
      ? (property.operation_type === 'renta' ? valuation?.pricePerM2 : null) ?? getPricePerM2({ ...property, operation_type: 'renta' })
      : null
  const valuationLevel = valuation?.valuation ?? 'medio'
  const showPriceM2 = (pricePerM2Sale != null && pricePerM2Sale > 0) || (pricePerM2Rent != null && pricePerM2Rent > 0)
  const style = VALUATION_COLORS[valuationLevel]

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="p-0 flex flex-col max-w-2xl w-full">
        {/* Barra tipo tarjeta: mismo color que el listado */}
        <div className={`flex-shrink-0 ${headerBannerGradient} py-3 px-6`}>
          <p className="text-white font-bold text-sm tracking-tight">
            {typeLabel} en {opLabel}
          </p>
        </div>
        <SheetHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200 bg-white">
          <div className="pr-10">
            <p className="text-xs text-gray-500 mb-0.5">
              ID interno: {property.id.slice(0, 8)} · Portal: {property.slug || '—'}
            </p>
            <SheetTitle className="text-xl font-bold text-gray-900 mt-0">
              {property.address || property.title}
            </SheetTitle>
            <p className="text-sm text-gray-500 mt-1">
              {[property.neighborhood, property.city].filter(Boolean).join(', ')}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(property.price, currency)}
                {property.operation_type === 'renta' && property.rent_price != null && (
                  <span className="text-base font-normal text-gray-500">/mes</span>
                )}
              </span>
              <span className="text-sm font-bold text-green-600">{currency}</span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200">
                Publicado {publishedDate} · {opLabel}
              </span>
            </div>
            {/* Precio/m² y valuación en todas las fichas (venta, renta, venta o renta) */}
            {showPriceM2 && (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {pricePerM2Sale != null && pricePerM2Sale > 0 && (
                  <span className={`text-sm font-bold ${style.text}`}>
                    {property.operation_type === 'ambos' ? 'Venta: ' : ''}
                    ${Math.round(pricePerM2Sale).toLocaleString('es-MX')}/m²
                  </span>
                )}
                {pricePerM2Rent != null && pricePerM2Rent > 0 && (
                  <span className={`text-sm font-bold ${style.text}`}>
                    {property.operation_type === 'ambos' ? 'Renta: ' : ''}
                    ${Math.round(pricePerM2Rent).toLocaleString('es-MX')}/m²
                  </span>
                )}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
                <Link
                  href="/backoffice/inventario"
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 underline"
                >
                  Ver valuación en Inventario
                </Link>
              </div>
            )}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 min-w-[140px] sm:min-w-[180px] rounded-xl bg-gradient-to-b from-gray-50 to-gray-100/80 border border-gray-200/80 text-gray-800 font-semibold shadow-sm hover:from-gray-100 hover:to-gray-200/80 hover:border-gray-300/80 gap-2 [&_svg]:size-[1.125rem] [&_svg]:text-gray-600"
                  >
                    <Share2 strokeWidth={2.25} />
                    Compartir
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-60 rounded-2xl border border-gray-200/90 bg-white p-2 shadow-xl"
                >
                  <DropdownMenuItem className="flex items-center gap-3 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 focus:bg-gray-100 data-[highlighted]:bg-gray-100">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100/80 text-lg" aria-hidden>📋</span>
                    Ficha con mis datos
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 focus:bg-gray-100 data-[highlighted]:bg-gray-100">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100/80 text-lg" aria-hidden>📄</span>
                    Ficha sin datos
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 focus:bg-gray-100 data-[highlighted]:bg-gray-100">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100/80 text-lg" aria-hidden>👁️</span>
                    Ver en Red
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 focus:bg-gray-100 data-[highlighted]:bg-gray-100">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100/80 text-lg" aria-hidden>📡</span>
                    Compartir Radar
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center gap-3 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 focus:bg-gray-100 data-[highlighted]:bg-gray-100 [&>svg]:size-4 [&>svg]:text-gray-500">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100/80 text-lg" aria-hidden>⚙️</span>
                      Gestión Interna
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="rounded-2xl border border-gray-200/90 bg-white p-2 shadow-xl min-w-[200px]">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/backoffice/propiedades/${property.id}`}
                          className="flex items-center gap-3 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 focus:bg-gray-100 data-[highlighted]:bg-gray-100"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100/80 text-lg" aria-hidden>✏️</span>
                          Editar propiedad
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-800 focus:bg-gray-100 data-[highlighted]:bg-gray-100">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100/80 text-lg" aria-hidden>📝</span>
                        Editar ACM
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 rounded-xl py-2.5 px-3 text-sm font-medium text-red-600 focus:bg-red-50 data-[highlighted]:bg-red-50">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100/80 text-lg" aria-hidden>🗑️</span>
                        Dar de baja
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
              {onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 hover:border-red-300 shrink-0 h-11 w-11"
                  onClick={onDelete}
                  aria-label="Eliminar propiedad"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="propiedad" className="flex-1 flex flex-col min-h-0">
          <TabsList className="flex-shrink-0 mx-6 mt-4 rounded-xl bg-gray-100 p-1 border border-gray-200">
            <TabsTrigger value="propiedad" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200">
              Propiedad
            </TabsTrigger>
            <TabsTrigger value="interno" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200">
              Interno
            </TabsTrigger>
          </TabsList>

          <SheetBody className="flex-1 min-h-0 pt-4 overflow-hidden flex flex-col">
            <TabsContent value="propiedad" className="mt-0 flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden">
              <ScrollArea className="flex-1 min-h-0">
                <div className="pb-8">
              {/* Galería más grande (4:3 como la tarjeta); el resto hace scroll */}
              <div className="group/gallery relative aspect-[4/3] min-h-[280px] rounded-xl overflow-hidden bg-gray-100 mx-6 flex-shrink-0">
                {currentImage ? (
                  <Image
                    src={currentImage}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 672px) 100vw, 672px"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Sin imagen
                  </div>
                )}
                {totalImages > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all duration-200 opacity-0 group-hover/gallery:opacity-100"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all duration-200 opacity-0 group-hover/gallery:opacity-100"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium transition-opacity duration-200 opacity-0 group-hover/gallery:opacity-100">
                      {galleryIndex + 1}/{totalImages} fotos
                    </div>
                  </>
                )}
              </div>
              {/* Barra de medios compacta */}
              <div className="flex flex-wrap justify-center gap-1.5 mx-6 mt-3">
                {[
                  { id: 'fotos', label: 'Fotos', icon: ImageIcon },
                  { id: 'video', label: 'Video', icon: Video },
                  { id: '360', label: '360', icon: Maximize2 },
                  { id: 'planos', label: 'Planos', icon: LayoutGrid },
                  { id: 'mapa', label: 'Ubicación', icon: MapPin },
                  { id: 'street', label: 'Street View', icon: Navigation },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMediaTab(id as typeof mediaTab)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      mediaTab === id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Características obligatorias de captación: todas en todas las fichas salvo oficina, terreno, bodega, nave */}
              {(() => {
                const yearBuilt = (property as { year_built?: number | null }).year_built
                const antiguedad = yearBuilt != null && Number.isFinite(yearBuilt)
                  ? `${new Date().getFullYear() - Number(yearBuilt)} años`
                  : '—'
                const mantenimiento = property.maintenance_fee != null && Number.isFinite(property.maintenance_fee)
                  ? formatPrice(Number(property.maintenance_fee), property.currency ?? 'MXN')
                  : '—'
                const mascotas = property.pets_allowed != null ? (property.pets_allowed ? 'Sí' : 'No') : '—'
                const constructionM2 = Number(property.construction_m2) || 0
                const terraceM2 = Number(property.terrace_m2) || 0
                const balconyM2 = Number(property.balcony_m2) || 0
                const roofGardenM2 = Number(property.roof_garden_m2) || 0
                const openAreasSum = terraceM2 + balconyM2 + roofGardenM2
                const hasTerrace = terraceM2 > 0
                const hasBalcony = balconyM2 > 0
                const hasRoofGarden = roofGardenM2 > 0
                const openAreasCount = [hasTerrace, hasBalcony, hasRoofGarden].filter(Boolean).length
                // 1 elemento → nombre (Balcón, Terraza o Roof garden); 2 o más → Áreas abiertas; sin datos → Áreas abiertas con "—"
                const outdoorLabel =
                  openAreasSum > 0
                    ? openAreasCount >= 2
                      ? { label: 'Áreas Abiertas', value: `${Math.round(openAreasSum)} m²` }
                      : hasRoofGarden
                        ? { label: 'Roof garden', value: `${Math.round(roofGardenM2)} m²` }
                        : hasTerrace
                          ? { label: 'Terraza', value: `${Math.round(terraceM2)} m²` }
                          : { label: 'Balcón', value: `${Math.round(balconyM2)} m²` }
                    : { label: 'Áreas Abiertas', value: '—' as string }
                const totalM2Computed = constructionM2 + openAreasSum
                const totalM2Display = totalM2Computed > 0 ? totalM2Computed : (property.total_area ?? property.land_m2 ?? null)
                const totalM2Str = totalM2Display != null && Number(totalM2Display) > 0 ? `${Math.round(Number(totalM2Display))} m²` : '—'
                const piso = property.floor_number != null && Number.isFinite(property.floor_number) ? String(property.floor_number) : '—'
                const isSinCaractResidenciales = TIPOS_SIN_CARACT_RESIDENCIALES.includes(property.property_type ?? '')
                const dash = '—'
                const fullRow1: { emoji: string; label: string; value: string }[] = [
                  { emoji: '🛏️', label: 'Recámaras', value: property.bedrooms != null ? String(property.bedrooms) : dash },
                  { emoji: '🚿', label: 'Baños', value: property.bathrooms != null ? String(property.bathrooms) : dash },
                  { emoji: '🚗', label: 'Estacionamientos', value: property.parking_spaces != null ? String(property.parking_spaces) : dash },
                  { emoji: '💰', label: 'Mantenimiento', value: mantenimiento },
                  { emoji: '📅', label: 'Antigüedad', value: antiguedad },
                ]
                const fullRow2: { emoji: string; label: string; value: string }[] = [
                  { emoji: '🏢', label: 'Piso', value: piso },
                  { emoji: '🐕', label: 'Mascotas', value: mascotas },
                  { emoji: '🏗️', label: 'Construcción', value: property.construction_m2 != null ? `${property.construction_m2} m²` : dash },
                  { emoji: '🌿', label: outdoorLabel.label, value: outdoorLabel.value },
                  { emoji: '📐', label: 'Totales', value: totalM2Str },
                ]
                const reducedItems: { emoji: string; label: string; value: string }[] = [
                  { emoji: '🚗', label: 'Estacionamientos', value: property.parking_spaces != null ? String(property.parking_spaces) : dash },
                  { emoji: '💰', label: 'Mantenimiento', value: mantenimiento },
                  { emoji: '📅', label: 'Antigüedad', value: antiguedad },
                  { emoji: '🏢', label: 'Piso', value: piso },
                  { emoji: '🏗️', label: 'Construcción', value: property.construction_m2 != null ? `${property.construction_m2} m²` : dash },
                  { emoji: '📐', label: 'Totales', value: totalM2Str },
                ]
                const items = isSinCaractResidenciales ? reducedItems : [...fullRow1, ...fullRow2]
                const cardClass = 'flex flex-col items-center justify-center gap-0 py-2 px-1.5 rounded-lg bg-gradient-to-b from-gray-50 to-gray-100/80 border border-gray-200/80 shadow-sm flex-1 min-w-0'
                const cardClassSingleLine = 'flex flex-col items-center justify-center gap-0 py-2 px-1.5 rounded-lg bg-gradient-to-b from-gray-50 to-gray-100/80 border border-gray-200/80 shadow-sm flex-shrink-0 min-w-[56px] max-w-[20%]'
                const Card = ({ emoji, label, value, maxW = true, singleLine = false }: { emoji: string; label: string; value: string; maxW?: boolean; singleLine?: boolean }) => (
                  <div key={label} className={singleLine ? cardClassSingleLine : `${cardClass} ${maxW ? 'max-w-[20%]' : 'min-w-[56px] max-w-[20%]'}`}>
                    <span className="text-2xl leading-none opacity-90" aria-hidden>{emoji}</span>
                    <span className="text-[11px] font-bold text-gray-800 tabular-nums mt-1 leading-tight text-center break-words">{value}</span>
                    <span className="text-[10px] font-semibold text-gray-700 leading-tight text-center break-words whitespace-normal mt-0.5">{label}</span>
                  </div>
                )
                return (
                  <div className="mx-6 mt-5">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Características</p>
                    {isSinCaractResidenciales ? (
                      <div className="flex items-stretch justify-center gap-2 overflow-x-auto pb-1 flex-wrap">
                        {items.map((item) => <Card key={item.label} {...item} singleLine />)}
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-center gap-2 mb-2 flex-wrap">
                          {fullRow1.map((item) => <Card key={item.label} {...item} />)}
                        </div>
                        <div className="flex justify-center gap-2 flex-wrap">
                          {fullRow2.map((item) => <Card key={item.label} {...item} maxW={false} />)}
                        </div>
                      </>
                    )}
                  </div>
                )
              })()}

              {/* Amenidades: estilo neutro como la tarjeta */}
              <div className="mx-6 mt-5">
                <p className="text-sm font-semibold text-gray-900 mb-3">Amenidades</p>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_AMENITIES.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-medium border border-gray-200/80"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div className="mx-6 mt-5">
                <p className="text-sm font-semibold text-gray-900 mb-2">Descripción</p>
                <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 min-h-[100px]">
                  {property.description ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{property.description}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Sin descripción.</p>
                  )}
                </div>
              </div>

              {/* Reservado: mapa con ubicación exacta de la propiedad (próximamente). Contenedor listo para integrar lat/lng. */}
              <div
                id="property-drawer-map-container"
                data-map-placeholder
                className="mx-6 mt-6 mb-10 min-h-[120px] rounded-xl border border-dashed border-gray-200 bg-gray-50/50"
                aria-label="Ubicación en mapa (próximamente)"
              />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="interno" className="mt-0 flex flex-col h-full data-[state=inactive]:hidden">
              <ScrollArea className="flex-1">
                <div className="pb-8">
                {/* Detalles técnicos – cards por fila, estilo tarjeta */}
                <div className="mx-6 mb-6">
                  <p className="text-sm font-bold text-gray-900 mb-3">Detalles técnicos</p>
                  <div className="rounded-2xl bg-gradient-to-b from-gray-50 to-gray-100/80 border border-gray-200/80 shadow-sm overflow-hidden">
                    {[
                      { label: 'Título', value: property.title },
                      { label: 'Estado', value: STATUS_LABELS[property.status] },
                      { label: 'Tipo de operación', value: getOperationLabel(property.operation_type) },
                      { label: 'Moneda', value: property.currency ?? 'MXN' },
                      { label: 'Público', value: property.published ? 'Sí' : 'No' },
                      { label: 'Tipo', value: property.mls_shared ? 'Opción' : 'Exclusiva' },
                      { label: 'Comisión', value: property.commission_percentage != null ? (property.operation_type === 'renta' ? `${property.commission_percentage} ${Number(property.commission_percentage) === 1 ? 'mes' : 'meses'}` : `${property.commission_percentage}%`) : '—' },
                      { label: 'Estado Legal', value: property.legal_status ? LEGAL_STATUS_LABELS[property.legal_status] ?? property.legal_status : '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between py-3.5 px-4 border-b border-gray-200/80 last:border-0">
                        <span className="text-sm font-semibold text-gray-600">{label}</span>
                        <span className="text-sm font-bold text-gray-900 text-right max-w-[60%] truncate">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Datos del propietario: solo productor o admin/manager de la inmobiliaria */}
                {canSeeOwnerData && (
                  <div className="mx-6 mb-6 p-5 rounded-2xl bg-gradient-to-b from-amber-50/80 to-amber-100/50 border border-amber-200/80 shadow-sm">
                    <p className="text-sm font-bold text-gray-900 mb-3">Datos del propietario</p>
                    <div className="space-y-2.5 text-sm">
                      <p className="flex justify-between gap-2"><span className="font-semibold text-gray-600 shrink-0">Nombre</span><span className="font-medium text-gray-900 text-right">{property.owner_name ?? '—'}</span></p>
                      <p className="flex justify-between gap-2"><span className="font-semibold text-gray-600 shrink-0">Teléfono</span><span className="font-medium text-gray-900 text-right">{property.owner_phone ?? '—'}</span></p>
                      <p className="flex justify-between gap-2"><span className="font-semibold text-gray-600 shrink-0">Correo</span><span className="font-medium text-gray-900 text-right truncate max-w-[60%]">{property.owner_email ?? '—'}</span></p>
                      {property.description && (
                        <p className="pt-3 mt-3 border-t border-amber-200/80">
                          <span className="font-semibold text-gray-600 block mb-1">Notas privadas</span>
                          <span className="text-gray-700">{property.description}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
                </div>
              </ScrollArea>
            </TabsContent>
          </SheetBody>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
