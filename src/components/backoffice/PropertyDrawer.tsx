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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Share2,
  FileText,
  Eye,
  BarChart3,
  Settings,
  User,
  UserCog,
  Pencil,
  FileCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video,
  Maximize2,
  LayoutGrid,
  MapPin,
  Navigation,
  Bed,
  Bath,
  Car,
  Square,
  Phone,
  MessageCircle,
} from 'lucide-react'
import type { Property } from '@/hooks/useProperties'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useProducerProfile } from '@/hooks/useProducerProfile'

const STATUS_LABELS: Record<Property['status'], string> = {
  draft: 'Borrador',
  active: 'Disponible',
  reserved: 'Reservada',
  sold: 'Vendida',
  rented: 'Rentada',
  suspended: 'No disponible',
  archived: 'Archivada',
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

interface PropertyDrawerProps {
  property: Property | null
  open: boolean
  onClose: () => void
}

function formatPrice(price: number, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

export function PropertyDrawer({ property, open, onClose }: PropertyDrawerProps) {
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [mediaTab, setMediaTab] = useState<'fotos' | 'video' | '360' | 'planos' | 'mapa' | 'street'>('fotos')
  const { data: currentUser } = useCurrentUser()
  const { data: producer } = useProducerProfile(property?.producer_id ?? null)

  const isProducer = !!currentUser && !!property && property.producer_id === currentUser.id
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

  const opLabel = property.operation_type === 'renta' ? 'RENTA' : property.operation_type === 'venta' ? 'VENTA' : 'VENTA/RENTA'
  const typeLabel = property.property_type.toUpperCase()
  const publishedDate = property.created_at
    ? new Date(property.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="p-0 flex flex-col max-w-2xl w-full">
        <SheetHeader className="flex-shrink-0 p-6 pb-4 border-b border-[#E5E5E7]">
          <div className="pr-10">
            <p className="text-xs text-[#86868B] mb-0.5">
              ID interno: {property.id.slice(0, 8)} · Portal: {property.slug || '—'}
            </p>
            <SheetTitle className="text-xl font-bold text-[#1D1D1F] mt-0">
              {property.address || property.title}
            </SheetTitle>
            <p className="text-sm text-[#86868B] mt-1">
              {[property.neighborhood, property.city].filter(Boolean).join(', ')}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="text-2xl font-bold text-[#1D1D1F]">
                {formatPrice(property.price, property.currency ?? 'MXN')}
                {property.operation_type === 'renta' && property.rent_price != null && (
                  <span className="text-base font-normal text-[#86868B]">/mes</span>
                )}
              </span>
              <span className="rounded-full bg-[#E5E5E7] px-3 py-1 text-xs font-medium text-[#1D1D1F]">
                Publicado {publishedDate} · {opLabel}
              </span>
            </div>
            <div className="mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="w-full sm:w-auto rounded-xl bg-amber-400 hover:bg-amber-500 text-[#1D1D1F] font-semibold shadow-sm"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-xl border-[#E5E5E7]">
                  <DropdownMenuItem className="rounded-lg">
                    <FileText className="h-4 w-4 mr-2" />
                    Ficha con mis datos
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg">
                    <FileText className="h-4 w-4 mr-2" />
                    Ficha sin datos
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver en Red
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Compartir Radar
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-lg">
                      <Settings className="h-4 w-4 mr-2" />
                      Gestión Interna
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="rounded-xl border-[#E5E5E7]">
                      <DropdownMenuItem className="rounded-lg">
                        <UserCog className="h-4 w-4 mr-2" />
                        Cambiar Productor
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg">
                        <User className="h-4 w-4 mr-2" />
                        Cambiar Vendedor
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/backoffice/propiedades/${property.id}`} className="rounded-lg flex items-center">
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar propiedad
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg">
                        <FileCheck className="h-4 w-4 mr-2" />
                        Editar ACM
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Dar de baja
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="propiedad" className="flex-1 flex flex-col min-h-0">
          <TabsList className="flex-shrink-0 mx-6 mt-4 rounded-xl bg-[#F5F5F7] p-1">
            <TabsTrigger value="propiedad" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Propiedad
            </TabsTrigger>
            <TabsTrigger value="interno" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Interno
            </TabsTrigger>
          </TabsList>

          <SheetBody className="flex-1 min-h-0 pt-4">
            <TabsContent value="propiedad" className="mt-0 flex flex-col h-full data-[state=inactive]:hidden">
              {/* Galería con lazy loading */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#F5F5F7] mx-6">
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
                  <div className="absolute inset-0 flex items-center justify-center text-[#86868B]">
                    Sin imagen
                  </div>
                )}
                {totalImages > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
                      {galleryIndex + 1}/{totalImages} fotos
                    </div>
                  </>
                )}
              </div>
              {/* Barra de iconos: Fotos, Video, 360, Planos, Mapa, Street View */}
              <div className="flex flex-wrap gap-2 mx-6 mt-4">
                {[
                  { id: 'fotos', label: 'Fotos', icon: ImageIcon },
                  { id: 'video', label: 'Video', icon: Video },
                  { id: '360', label: 'Recorrido 360', icon: Maximize2 },
                  { id: 'planos', label: 'Planos', icon: LayoutGrid },
                  { id: 'mapa', label: 'Ubicación', icon: MapPin },
                  { id: 'street', label: 'Street View', icon: Navigation },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMediaTab(id as typeof mediaTab)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      mediaTab === id
                        ? 'bg-[#1D1D1F] text-white'
                        : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E5E5E7]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Características principales - grid 4 columnas */}
              <div className="mx-6 mt-6">
                <p className="text-sm font-semibold text-[#1D1D1F] mb-3">Características</p>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { icon: Bed, label: 'Recámaras', value: property.bedrooms },
                    { icon: Bath, label: 'Baños', value: property.bathrooms },
                    { icon: Car, label: 'Estacionamientos', value: property.parking_spaces },
                    { icon: Square, label: 'Construcción', value: property.construction_m2 ? `${property.construction_m2} m²` : null },
                    { icon: Square, label: 'Totales', value: property.total_area ? `${property.total_area} m²` : property.land_m2 ? `${property.land_m2} m²` : null },
                  ].filter(({ value }) => value != null).map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex flex-col items-center gap-1 text-center">
                      <Icon className="h-5 w-5 text-[#86868B]" strokeWidth={1.5} />
                      <span className="text-xs text-[#86868B] tabular-nums">{String(value)}</span>
                      <span className="text-[10px] text-[#86868B]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenidades */}
              <div className="mx-6 mt-6">
                <p className="text-sm font-semibold text-[#1D1D1F] mb-3">Amenidades</p>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_AMENITIES.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-blue-50 text-blue-800 px-3 py-1 text-xs font-medium"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="interno" className="mt-0 flex flex-col h-full data-[state=inactive]:hidden">
              <ScrollArea className="flex-1">
                {/* Bloque Productor */}
                <div className="mx-6 mb-6 p-4 rounded-2xl border border-[#E5E5E7] bg-[#F5F5F7]">
                  <p className="text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-3">Productor</p>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 rounded-xl border-2 border-white shadow">
                      <AvatarImage src={producer?.avatar_url ?? undefined} />
                      <AvatarFallback className="rounded-xl bg-[#E5E5E7] text-[#1D1D1F] text-lg">
                        {(producer?.full_name ?? '?').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1D1D1F]">{producer?.full_name ?? '—'}</p>
                      {producer?.email && (
                        <p className="text-sm text-[#86868B] truncate">{producer.email}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="rounded-xl border-[#E5E5E7]">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="rounded-xl border-[#E5E5E7]">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tabla de detalles técnicos */}
                <div className="mx-6 mb-6">
                  <p className="text-sm font-semibold text-[#1D1D1F] mb-3">Detalles técnicos</p>
                  <div className="rounded-2xl border border-[#E5E5E7] overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          { label: 'Título', value: property.title },
                          { label: 'Estado', value: STATUS_LABELS[property.status] },
                          { label: 'Tipo de operación', value: property.operation_type === 'venta' ? 'Venta' : property.operation_type === 'renta' ? 'Renta' : 'Ambos' },
                          { label: 'Moneda', value: property.currency ?? 'MXN' },
                          { label: 'Público', value: property.published ? 'Sí' : 'No' },
                          { label: 'Exclusiva', value: 'Sí' },
                          { label: 'Comisión', value: property.commission_percentage != null ? `${property.commission_percentage}%` : '—' },
                        ].map(({ label, value }) => (
                          <tr key={label} className="border-b border-[#E5E5E7] last:border-0">
                            <td className="py-3 px-4 text-[#86868B] font-medium w-1/3">{label}</td>
                            <td className="py-3 px-4 text-[#1D1D1F]">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Datos del propietario (solo si es el productor) */}
                {isProducer && (
                  <div className="mx-6 mb-6 p-4 rounded-2xl border border-amber-200 bg-amber-50/50">
                    <p className="text-sm font-semibold text-[#1D1D1F] mb-3">Datos del propietario</p>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-[#86868B]">Nombre:</span> {property.owner_name ?? '—'}</p>
                      <p><span className="text-[#86868B]">Teléfono:</span> {property.owner_phone ?? '—'}</p>
                      <p><span className="text-[#86868B]">Correo:</span> {property.owner_email ?? '—'}</p>
                      {property.description && (
                        <p className="pt-2 border-t border-amber-200">
                          <span className="text-[#86868B]">Notas privadas:</span> {property.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </SheetBody>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
