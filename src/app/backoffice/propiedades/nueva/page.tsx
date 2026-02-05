'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCreateProperty } from '@/hooks/useProperties'
import { PageContainer, Button as AppleButton } from '@/components/backoffice/PageContainer'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Check, Plus, Home, Building2, TreePine, Store, Warehouse, Building, Factory, MoreHorizontal, Minus, Tag, FileText, MapPin, Ruler, Sparkles, FolderOpen, Waves, Dumbbell, Lock, Dog, Leaf, Car, ChefHat, Snowflake, Flame, MoveVertical, Flower2, PartyPopper, BookOpen, Bath, Package, Droplets, Sun, Armchair, Square, Shirt } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const LocationMapFullScreen = dynamic(
  () => import('@/components/backoffice/LocationMapFullScreen').then((m) => m.LocationMapFullScreen),
  { ssr: false }
)

const STEPS = [
  { id: 1, name: 'Categoría', Icon: Tag },
  { id: 2, name: 'Operación', Icon: FileText },
  { id: 3, name: 'Ubicación', Icon: MapPin },
  { id: 4, name: 'Datos y Medidas', Icon: Ruler },
  { id: 5, name: 'Contenido', Icon: Sparkles },
  { id: 6, name: 'Legal y Documentos', Icon: FolderOpen },
]

const CATEGORIES = [
  { value: 'casa', label: 'Casa', Icon: Home },
  { value: 'departamento', label: 'Departamento', Icon: Building2 },
  { value: 'oficina', label: 'Oficina', Icon: Building },
  { value: 'local', label: 'Local Comercial', Icon: Store },
  { value: 'terreno', label: 'Terreno', Icon: TreePine },
  { value: 'bodega', label: 'Bodega', Icon: Warehouse },
  { value: 'nave_industrial', label: 'Nave industrial', Icon: Factory },
  { value: 'otro', label: 'Otro', Icon: MoreHorizontal },
]

const OPERATION_OPTIONS = [
  { value: 'venta', label: 'Venta' },
  { value: 'renta', label: 'Renta' },
]

const AMENITIES_OPTIONS = [
  { id: 'alberca', label: 'Alberca', Icon: Waves },
  { id: 'gimnasio', label: 'Gimnasio', Icon: Dumbbell },
  { id: 'seguridad_24', label: 'Seguridad 24/7', Icon: Lock },
  { id: 'mascotas', label: 'Mascotas permitidas', Icon: Dog },
  { id: 'terraza', label: 'Terraza', Icon: Leaf },
  { id: 'estacionamiento', label: 'Estacionamiento', Icon: Car },
  { id: 'cocina_integral', label: 'Cocina integral', Icon: ChefHat },
  { id: 'areas_verdes', label: 'Áreas verdes', Icon: TreePine },
  { id: 'aire_acondicionado', label: 'Aire acondicionado', Icon: Snowflake },
  { id: 'calefaccion', label: 'Calefacción', Icon: Flame },
  { id: 'elevador', label: 'Elevador', Icon: MoveVertical },
  { id: 'roof_garden', label: 'Roof garden', Icon: Building2 },
  { id: 'jardin', label: 'Jardín', Icon: Flower2 },
  { id: 'salon_eventos', label: 'Salón de eventos', Icon: PartyPopper },
  { id: 'estudio', label: 'Estudio', Icon: BookOpen },
  { id: 'cuarto_servicio', label: 'Cuarto de servicio', Icon: Bath },
  { id: 'bodega_cuarto', label: 'Bodega / Cuarto', Icon: Package },
  { id: 'cisterna', label: 'Cisterna', Icon: Droplets },
  { id: 'calentador_solar', label: 'Calentador solar', Icon: Sun },
  { id: 'gas_natural', label: 'Gas natural', Icon: Flame },
  { id: 'amueblado', label: 'Amueblado', Icon: Armchair },
  { id: 'balcon', label: 'Balcón', Icon: Square },
  { id: 'lavanderia', label: 'Área de lavado', Icon: Shirt },
]

const LEGAL_STAGES = [
  { id: 'solicitud_docs', label: 'Solicitud de docs' },
  { id: 'cargada', label: 'Cargada' },
  { id: 'aprobacion', label: 'Aprobación' },
  { id: 'firma', label: 'Firma' },
]

export default function NewPropertyWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    property_type: 'casa',
    operation_types: ['venta'] as string[],
    title: '',
    description: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    lat: null as number | null,
    lng: null as number | null,
    bedrooms: 0,
    bathrooms: 0,
    half_bathrooms: 0,
    parking_spaces: 0,
    total_area: '',
    built_area: '',
    land_m2: '',
    terrain_length: '',
    terrain_front: '',
    amenities: [] as string[],
    price: '',
    rent_price: '',
    maintenance_fee: '',
    commission_percentage: '5',
    currency: 'MXN' as 'MXN' | 'USD',
    legal_status: 'solicitud_docs',
    images: [] as string[],
    main_image_url: '',
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    published: false,
    mls_shared: false,
  })

  const createProperty = useCreateProperty()

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const totalSteps = 6
  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1)
  }
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const operationTypeForApi = () => {
    const t = formData.operation_types
    if (t.includes('venta') && (t.includes('renta') || t.includes('renta_temporal'))) return 'ambos'
    if (t.includes('renta') || t.includes('renta_temporal')) return 'renta'
    return 'venta'
  }

  const handleSubmit = async () => {
    try {
      await createProperty.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        property_type: formData.property_type as any,
        operation_type: operationTypeForApi() as any,
        address: formData.address,
        neighborhood: formData.neighborhood || null,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code || null,
        lat: formData.lat ?? undefined,
        lng: formData.lng ?? undefined,
        bedrooms: formData.bedrooms || null,
        bathrooms: formData.bathrooms || null,
        half_bathrooms: formData.half_bathrooms || null,
        parking_spaces: formData.parking_spaces || null,
        total_area: formData.total_area ? parseFloat(formData.total_area) : null,
        construction_m2: formData.built_area ? parseFloat(formData.built_area) : null,
        price: parseFloat(formData.price),
        rent_price: formData.rent_price ? parseFloat(formData.rent_price) : null,
        maintenance_fee: formData.maintenance_fee ? parseFloat(formData.maintenance_fee) : null,
        commission_percentage: formData.commission_percentage ? parseFloat(formData.commission_percentage) : null,
        owner_name: formData.owner_name || null,
        owner_phone: formData.owner_phone || null,
        owner_email: formData.owner_email || null,
        published: formData.published,
        mls_shared: formData.mls_shared,
        images: formData.images || [],
        main_image_url: formData.main_image_url || null,
      } as any)
      router.push('/backoffice/propiedades')
    } catch (error) {
      console.error('Error creating property:', error)
      alert('Error al crear la propiedad')
    }
  }

  return (
    <PageContainer
      title="Nueva Propiedad"
      subtitle={`Paso ${currentStep} de ${totalSteps} · ${STEPS[currentStep - 1].name}`}
      icon={Plus}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-6 sm:mb-8">
        <div className="rounded-2xl bg-white border border-[#E5E3DB] shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const StepIcon = step.Icon
              return (
                <div key={step.id} className="flex items-center flex-1 min-w-[70px] sm:min-w-[80px]">
                  <div className="flex flex-col items-center w-full">
                    <div
                      className={`
                        w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 shadow-sm
                        ${isCompleted ? 'bg-[#2C3E2C] border-[#2C3E2C] text-white' : isActive ? 'border-[#2C3E2C] bg-[#F2F0E8] text-[#2C3E2C]' : 'border-[#E5E3DB] bg-[#E8EBE4] text-[#6B7B6B]'}
                      `}
                    >
                      {isCompleted ? <Check className="h-5 w-5" strokeWidth={2.5} /> : <StepIcon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} aria-hidden />}
                    </div>
                    <p className={`text-[10px] sm:text-xs mt-2 text-center font-semibold ${isActive ? 'text-[#2C3E2C]' : 'text-[#6B7B6B]'}`}>{step.name}</p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded-full ${isCompleted ? 'bg-[#2C3E2C]' : 'bg-[#E5E3DB]'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-[#E5E3DB] shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 border-b border-[#E5E3DB]">
          <h2 className="text-lg sm:text-xl font-bold text-[#2C3E2C] flex items-center gap-2">
            {(() => {
              const StepIcon = STEPS[currentStep - 1].Icon
              return <StepIcon className="h-6 w-6 sm:h-7 sm:w-7 text-[#2C3E2C]" strokeWidth={1.5} aria-hidden />
            })()}
            {STEPS[currentStep - 1].name}
          </h2>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-[#FAF8F3]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="outline-none"
            >
              {currentStep === 1 && <Step1Category formData={formData} updateFormData={updateFormData} />}
              {currentStep === 2 && <Step2Operation formData={formData} updateFormData={updateFormData} />}
              {currentStep === 3 && <Step3LocationMap formData={formData} updateFormData={updateFormData} />}
              {currentStep === 4 && <Step4DataMeasures formData={formData} updateFormData={updateFormData} />}
              {currentStep === 5 && <Step5ContentIA formData={formData} updateFormData={updateFormData} />}
              {currentStep === 6 && <Step6Legal formData={formData} updateFormData={updateFormData} />}
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Navegación: misma línea texto + flecha, colores del diseño */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-t border-[#E5E3DB] bg-white">
          <AppleButton
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="secondary"
            size="lg"
            className="rounded-xl border border-[#E5E3DB] bg-[#F8F7F4] text-[#2C3E2C] font-semibold hover:bg-[#F1EFE8] shadow-sm inline-flex items-center gap-1.5"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            Atrás
          </AppleButton>
          {currentStep < totalSteps ? (
            <AppleButton onClick={nextStep} size="lg" className="rounded-xl bg-[#2C3E2C] text-white hover:bg-[#3F5140] border-0 font-bold shadow-md inline-flex items-center gap-1.5">
              Siguiente
              <ChevronRight className="h-4 w-4 shrink-0" />
            </AppleButton>
          ) : (
            <AppleButton onClick={handleSubmit} disabled={createProperty.isPending} size="lg" className="rounded-xl bg-[#2C3E2C] text-white hover:bg-[#3F5140] font-bold">
              {createProperty.isPending ? 'Guardando…' : 'Crear Propiedad'}
            </AppleButton>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

const inputClass = 'w-full h-12 rounded-xl border border-[#E5E3DB] bg-white px-4 text-sm text-[#2C3E2C] placeholder:text-[#6B7B6B] focus:outline-none focus:ring-2 focus:ring-[#B8975A]/50 focus:border-transparent'
const labelClass = 'block text-sm font-semibold text-[#2C3E2C] mb-2'

// Paso 1: Categoría — Cards con iconos lineales, borde 2px negro al seleccionar
function Step1Category({ formData, updateFormData }: any) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {CATEGORIES.map(({ value, label, Icon }) => {
        const selected = formData.property_type === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => updateFormData('property_type', value)}
            className={`
              flex flex-col items-center justify-center p-6 rounded-2xl bg-white border-2 transition-all duration-200
              ${selected ? 'border-[#2C3E2C] shadow-lg' : 'border-[#E5E3DB] hover:border-[#B8975A]/50'}
            `}
          >
            <Icon className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 ${selected ? 'text-[#2C3E2C]' : 'text-[#6B7B6B]'}`} strokeWidth={1.5} />
            <span className={`text-sm font-semibold ${selected ? 'text-[#2C3E2C]' : 'text-[#6B7B6B]'}`}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

// Paso 2: Operación + Valor y mantenimiento
function Step2Operation({ formData, updateFormData }: any) {
  const toggle = (value: string) => {
    const arr = formData.operation_types.includes(value) ? formData.operation_types.filter((x: string) => x !== value) : [...formData.operation_types, value]
    if (arr.length === 0) return
    updateFormData('operation_types', arr)
  }
  return (
    <div className="space-y-8">
      <div>
        <p className="text-base font-semibold text-[#2C3E2C] mb-4">¿Qué tipo de operación será?</p>
        <div className="flex flex-wrap gap-3">
          {OPERATION_OPTIONS.map(({ value, label }) => {
            const selected = formData.operation_types.includes(value)
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggle(value)}
                className={`
                  px-6 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                  ${selected ? 'bg-[#2C3E2C] text-white border-[#2C3E2C]' : 'bg-white text-[#2C3E2C] border-[#E5E3DB] hover:border-[#B8975A]/50'}
                `}
              >
                {label}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-[#6B7B6B] mt-3">Puedes elegir más de una (ej. venta y renta a la vez).</p>
      </div>
      {/* Valor y mantenimiento en el mismo paso */}
      <div className="rounded-2xl border border-[#E5E3DB] bg-[#FAF8F3] p-5 sm:p-6 shadow-sm">
        <p className="text-xs font-bold text-[#6B7B6B] uppercase tracking-wider mb-4 flex items-center gap-2">
          <span aria-hidden>💰</span> Valor y mantenimiento
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Precio *</label>
            <div className="flex gap-2">
              <Input type="number" value={formData.price} onChange={(e) => updateFormData('price', e.target.value)} placeholder="0" className={inputClass} />
              <select value={formData.currency} onChange={(e) => updateFormData('currency', e.target.value)} className="h-12 w-24 rounded-xl border border-[#E5E3DB] bg-white px-3 text-sm font-semibold text-[#2C3E2C] focus:outline-none focus:ring-2 focus:ring-[#B8975A]/50">
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Mantenimiento *</label>
            <div className="flex gap-2">
              <Input type="number" value={formData.maintenance_fee} onChange={(e) => updateFormData('maintenance_fee', e.target.value)} placeholder="0" className={inputClass} />
              <span className="h-12 px-3 flex items-center rounded-xl border border-[#E5E3DB] bg-[#F8F7F4] text-sm font-semibold text-[#2C3E2C] shrink-0">
                {formData.currency}/mes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Paso 3: Ubicación — Formulario de dirección + vincular al mapa
function Step3LocationMap({ formData, updateFormData }: any) {
  const [linking, setLinking] = useState(false)

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    updateFormData('lat', lat)
    updateFormData('lng', lng)
    if (address) updateFormData('address', address)
  }

  const buildFullAddress = () => {
    const parts = [
      formData.address,
      formData.neighborhood,
      formData.city,
      formData.state,
      formData.postal_code,
      'México',
    ].filter(Boolean)
    return parts.join(', ')
  }

  const handleVerEnMapa = async () => {
    const full = buildFullAddress()
    if (!full || full === ', México') return
    setLinking(true)
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(full)}`)
      const data = await res.json()
      if (data?.lat != null && data?.lng != null) {
        updateFormData('lat', data.lat)
        updateFormData('lng', data.lng)
        if (data.display_name) updateFormData('address', data.display_name)
      } else {
        alert('No se encontró la dirección. Prueba buscando en el mapa.')
      }
    } catch {
      alert('Error al geocodificar. Prueba de nuevo.')
    } finally {
      setLinking(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm font-semibold text-[#2C3E2C]">Ubicación * — Completa la dirección y vincúlala al mapa, o busca directamente en el mapa.</p>

      {/* 1. Formulario de dirección */}
      <div className="rounded-2xl border border-[#E5E3DB] bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#2C3E2C]">Datos de dirección</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Calle y número *</label>
            <Input value={formData.address} onChange={(e) => updateFormData('address', e.target.value)} placeholder="Ej: Av. Reforma 222" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Colonia</label>
            <Input value={formData.neighborhood} onChange={(e) => updateFormData('neighborhood', e.target.value)} placeholder="Ej: Cuauhtémoc" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Ciudad *</label>
            <Input value={formData.city} onChange={(e) => updateFormData('city', e.target.value)} placeholder="Ej: CDMX" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <Input value={formData.state} onChange={(e) => updateFormData('state', e.target.value)} placeholder="Ej: Ciudad de México" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Código postal</label>
            <Input value={formData.postal_code} onChange={(e) => updateFormData('postal_code', e.target.value)} placeholder="Ej: 06500" className={inputClass} />
          </div>
        </div>
        <button
          type="button"
          onClick={handleVerEnMapa}
          disabled={linking || (!formData.address?.trim() && !formData.city?.trim())}
          className="rounded-xl bg-[#2C3E2C] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#3F5140] disabled:opacity-50 flex items-center gap-2"
        >
          {linking ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Geocodificando…
            </>
          ) : (
            'Ver en mapa'
          )}
        </button>
      </div>

      {/* 2. Mapa: se vincula con los datos de arriba al hacer "Ver en mapa"; también puedes buscar y mover el pin */}
      <div className="rounded-2xl border border-[#E5E3DB] overflow-hidden shadow-sm">
        <p className="text-xs text-[#6B7B6B] px-4 py-2 bg-[#FAF8F3] border-b border-[#E5E3DB]">Ajusta el pin en el mapa si hace falta. La búsqueda también actualiza la dirección.</p>
        <LocationMapFullScreen
          address={formData.address}
          lat={formData.lat}
          lng={formData.lng}
          onAddressChange={(a) => updateFormData('address', a)}
          onLocationChange={handleLocationChange}
        />
      </div>
    </div>
  )
}

// Contador circular +/-
function Counter({ value, onIncrement, onDecrement, label }: { value: number; onIncrement: () => void; onDecrement: () => void; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <p className={labelClass}>{label}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onDecrement} className="w-10 h-10 rounded-full border-2 border-[#2C3E2C] flex items-center justify-center text-[#2C3E2C] hover:bg-[#F8F7F4] disabled:opacity-40" disabled={value <= 0} aria-label={`Menos ${label}`}>
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-10 text-center font-bold text-lg text-[#2C3E2C] tabular-nums">{value}</span>
        <button type="button" onClick={onIncrement} className="w-10 h-10 rounded-full border-2 border-[#2C3E2C] flex items-center justify-center text-[#2C3E2C] hover:bg-[#F8F7F4]" aria-label={`Más ${label}`}>
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Paso 4: Datos y medidas — Counters + inputs m² + grid amenidades
function Step4DataMeasures({ formData, updateFormData }: any) {
  const inc = (field: 'bedrooms' | 'bathrooms' | 'half_bathrooms' | 'parking_spaces') => updateFormData(field, (formData[field] ?? 0) + 1)
  const dec = (field: 'bedrooms' | 'bathrooms' | 'half_bathrooms' | 'parking_spaces') => updateFormData(field, Math.max(0, (formData[field] ?? 0) - 1))
  const toggleAmenity = (id: string) => {
    const arr = formData.amenities.includes(id) ? formData.amenities.filter((x: string) => x !== id) : [...formData.amenities, id]
    updateFormData('amenities', arr)
  }
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-[#2C3E2C] mb-3">Habitaciones, baños y estacionamiento *</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Counter value={formData.bedrooms ?? 0} onIncrement={() => inc('bedrooms')} onDecrement={() => dec('bedrooms')} label="Recámaras *" />
          <Counter value={formData.bathrooms ?? 0} onIncrement={() => inc('bathrooms')} onDecrement={() => dec('bathrooms')} label="Baños *" />
          <Counter value={formData.half_bathrooms ?? 0} onIncrement={() => inc('half_bathrooms')} onDecrement={() => dec('half_bathrooms')} label="Medios baños *" />
          <Counter value={formData.parking_spaces ?? 0} onIncrement={() => inc('parking_spaces')} onDecrement={() => dec('parking_spaces')} label="Estacionamientos *" />
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-[#2C3E2C] mb-3">Medidas (m²) *</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className={labelClass}>m² Totales *</label>
            <Input value={formData.total_area} onChange={(e) => updateFormData('total_area', e.target.value)} placeholder="0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>m² Construidos *</label>
            <Input value={formData.built_area} onChange={(e) => updateFormData('built_area', e.target.value)} placeholder="0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>m² Terreno *</label>
            <Input value={formData.land_m2} onChange={(e) => updateFormData('land_m2', e.target.value)} placeholder="0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Largo terreno (m) <span className="text-[#6B7B6B] font-normal">(opcional)</span></label>
            <Input value={formData.terrain_length} onChange={(e) => updateFormData('terrain_length', e.target.value)} placeholder="—" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Frente terreno (m) <span className="text-[#6B7B6B] font-normal">(opcional)</span></label>
            <Input value={formData.terrain_front} onChange={(e) => updateFormData('terrain_front', e.target.value)} placeholder="—" className={inputClass} />
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-[#2C3E2C] mb-3">Amenidades <span className="text-[#6B7B6B] font-normal">(opcional)</span></p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AMENITIES_OPTIONS.map(({ id, label, Icon }) => {
            const active = formData.amenities.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleAmenity(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${active ? 'bg-[#2C3E2C] text-white border-[#2C3E2C] shadow-md' : 'bg-white text-[#2C3E2C] border-[#E5E3DB] hover:border-[#B8975A]/50 hover:bg-[#FAF8F3]'}`}
              >
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-white/20' : 'bg-[#E8EBE4]'}`}>
                  <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-[#2C3E2C]'}`} strokeWidth={1.5} />
                </span>
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Paso 5: Contenido IA + Precio y mantenimiento
function Step5ContentIA({ formData, updateFormData }: any) {
  const [generatingTitle, setGeneratingTitle] = useState(false)
  const [generatingDesc, setGeneratingDesc] = useState(false)
  const handleGenerateTitle = () => {
    setGeneratingTitle(true)
    setTimeout(() => {
      updateFormData('title', `${formData.property_type === 'casa' ? 'Casa' : formData.property_type === 'departamento' ? 'Departamento' : 'Propiedad'} en ${formData.neighborhood || 'ubicación destacada'}`)
      setGeneratingTitle(false)
    }, 800)
  }
  const handleGenerateDesc = () => {
    setGeneratingDesc(true)
    setTimeout(() => {
      updateFormData('description', `Excelente ${formData.property_type} con amplios espacios. ${formData.bedrooms ? `${formData.bedrooms} recámaras. ` : ''}${formData.total_area ? `Superficie total: ${formData.total_area} m². ` : ''}Ubicación inmejorable.`)
      setGeneratingDesc(false)
    }, 1500)
  }
  return (
    <div className="space-y-8">
      <div>
        <label className={labelClass}>Título *</label>
        <Input value={formData.title} onChange={(e) => updateFormData('title', e.target.value)} placeholder="Ej: Casa moderna en Polanco" className={inputClass} />
        <button type="button" onClick={handleGenerateTitle} disabled={generatingTitle} className="mt-2 px-4 py-2 rounded-xl bg-[#B8975A] text-white text-sm font-semibold hover:bg-[#A38449] disabled:opacity-60 flex items-center gap-2">
          {generatingTitle ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            '🪄'
          )}{' '}
          Generar título con IA
        </button>
      </div>
      <div>
        <label className={labelClass}>Descripción *</label>
        <textarea value={formData.description} onChange={(e) => updateFormData('description', e.target.value)} placeholder="Describe la propiedad..." className="w-full min-h-[140px] rounded-xl border border-[#E5E3DB] bg-white px-4 py-3 text-sm text-[#2C3E2C] placeholder:text-[#6B7B6B] focus:outline-none focus:ring-2 focus:ring-[#B8975A]/50 resize-y" />
        <button type="button" onClick={handleGenerateDesc} disabled={generatingDesc} className="mt-2 px-4 py-2 rounded-xl bg-[#B8975A] text-white text-sm font-semibold hover:bg-[#A38449] disabled:opacity-60 flex items-center gap-2">
          {generatingDesc ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-[#2C3E2C] border-t-transparent rounded-full animate-spin" />
              <span className="animate-pulse">Generando…</span>
            </>
          ) : (
            <>🪄 Generar descripción con IA</>
          )}
        </button>
      </div>
    </div>
  )
}

// Paso 6: Legal y documentación — Estado + drag & drop
function Step6Legal({ formData, updateFormData }: any) {
  const [ownerFiles, setOwnerFiles] = useState<File[]>([])
  const [propertyFiles, setPropertyFiles] = useState<File[]>([])
  const [predialFiles, setPredialFiles] = useState<File[]>([])
  const [domicilioFiles, setDomicilioFiles] = useState<File[]>([])
  const [fiscalFiles, setFiscalFiles] = useState<File[]>([])
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-[#2C3E2C] mb-3">Estado de la publicación *</p>
        <div className="flex flex-wrap gap-2">
          {LEGAL_STAGES.map(({ id, label }) => {
            const selected = formData.legal_status === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => updateFormData('legal_status', id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border-2 ${selected ? 'bg-[#2C3E2C] text-white border-[#2C3E2C]' : 'bg-white text-[#2C3E2C] border-[#E5E3DB] hover:border-[#B8975A]/50'}`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div>
          <p className="text-sm font-semibold text-[#2C3E2C] mb-2">ID Propietario *</p>
          <p className="text-xs text-[#6B7B6B] mb-2">INE, Acta Constitutiva, etc.</p>
          <DropZone id="drop-owner" files={ownerFiles} onFiles={setOwnerFiles} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2C3E2C] mb-2">De la Propiedad *</p>
          <p className="text-xs text-[#6B7B6B] mb-2">Título de propiedad, Escrituras</p>
          <DropZone id="drop-property" files={propertyFiles} onFiles={setPropertyFiles} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2C3E2C] mb-2">Predial *</p>
          <p className="text-xs text-[#6B7B6B] mb-2">Comprobante de pago predial</p>
          <DropZone id="drop-predial" files={predialFiles} onFiles={setPredialFiles} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2C3E2C] mb-2">Comprobante de domicilio *</p>
          <p className="text-xs text-[#6B7B6B] mb-2">CFE, agua, teléfono, etc.</p>
          <DropZone id="drop-domicilio" files={domicilioFiles} onFiles={setDomicilioFiles} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2C3E2C] mb-2">Constancia de situación fiscal *</p>
          <p className="text-xs text-[#6B7B6B] mb-2">SAT</p>
          <DropZone id="drop-fiscal" files={fiscalFiles} onFiles={setFiscalFiles} />
        </div>
      </div>
    </div>
  )
}

function DropZone({ id, files, onFiles }: { id: string; files: File[]; onFiles: (f: File[]) => void }) {
  const [drag, setDrag] = useState(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const list = Array.from(e.dataTransfer.files)
    onFiles([...files, ...list])
  }
  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || [])
    onFiles([...files, ...list])
  }
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      className={`min-h-[140px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-colors ${drag ? 'border-[#B8975A] bg-[#FAF8F3]' : 'border-[#E5E3DB] bg-[#F8F7F4]'}`}
    >
      <input type="file" multiple className="hidden" id={id} onChange={onInput} />
      <label htmlFor={id} className="cursor-pointer text-center text-sm text-[#6B7B6B]">
        Haz clic o arrastra archivos para subir
      </label>
      {files.length > 0 && <p className="text-xs text-[#2C3E2C] font-medium mt-2">{files.length} archivo(s)</p>}
    </div>
  )
}
