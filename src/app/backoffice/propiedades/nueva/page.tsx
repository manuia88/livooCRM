'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCreateProperty } from '@/hooks/useProperties'
import { PageContainer } from '@/components/backoffice/PageContainer'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Check, Plus, Home, Building2, TreePine, Store, Warehouse, Building, Factory, MoreHorizontal, Minus, Tag, FileText, MapPin, Ruler, Sparkles, FolderOpen, Waves, Dumbbell, Lock, Dog, Leaf, Car, ChefHat, Snowflake, Flame, MoveVertical, Flower2, PartyPopper, BookOpen, Bath, Package, Droplets, Sun, Armchair, Square, Shirt, CircleDollarSign, BedDouble, LocateFixed, Search, Camera, Baby, Footprints, Mountain, Users, Coffee, DoorOpen, ShieldCheck, User, Phone, Mail, FileSignature, Calendar, Percent, Banknote, CheckCircle2, CreditCard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// TEMPORAL: Mapa comentado para ver los cambios de diseño
// const LocationMapFullScreen = dynamic(
//   () => import('@/components/backoffice/LocationMapFullScreen').then((m) => m.LocationMapFullScreen),
//   { ssr: false }
// )

// Design System CRM: colores solo en badges (semánticos)
const BADGE_PROPERTIES = '#3B82F6'   // Propiedades
const BADGE_GREEN = '#22C55E'        // Dinero, leads, positivo
const BADGE_INDIGO = '#6366F1'       // Tarea, ubicación
const BADGE_TEAL = '#0D9488'        // Curso, datos
const BADGE_PURPLE = '#8B5CF6'       // Social, contenido
const BADGE_AMBER = '#F59E0B'        // Tiempo, legal/expiración

const STEP_COLORS = [BADGE_PROPERTIES, BADGE_GREEN, BADGE_INDIGO, BADGE_TEAL, BADGE_PURPLE, BADGE_AMBER] as const

const STEPS = [
  { id: 1, name: 'Categoría', Icon: Tag, color: STEP_COLORS[0] },
  { id: 2, name: 'Operación y Datos', Icon: FileText, color: STEP_COLORS[1] },
  { id: 3, name: 'Ubicación', Icon: MapPin, color: STEP_COLORS[2] },
  { id: 4, name: 'Amenidades', Icon: Sparkles, color: STEP_COLORS[3] },
  { id: 5, name: 'Contenido', Icon: Sparkles, color: STEP_COLORS[4] },
  { id: 6, name: 'Legal y Documentos', Icon: FolderOpen, color: STEP_COLORS[5] },
]

const CARD_COLORS = [BADGE_PROPERTIES, BADGE_GREEN, BADGE_AMBER, BADGE_PURPLE, BADGE_TEAL, BADGE_AMBER, '#EF4444', '#6B7280'] as const

const CATEGORIES = [
  { value: 'casa', label: 'Casa', Icon: Home, color: CARD_COLORS[0] },
  { value: 'departamento', label: 'Departamento', Icon: Building2, color: CARD_COLORS[1] },
  { value: 'oficina', label: 'Oficina', Icon: Building, color: CARD_COLORS[2] },
  { value: 'local', label: 'Local Comercial', Icon: Store, color: CARD_COLORS[3] },
  { value: 'terreno', label: 'Terreno', Icon: TreePine, color: CARD_COLORS[4] },
  { value: 'bodega', label: 'Bodega', Icon: Warehouse, color: CARD_COLORS[5] },
  { value: 'nave_industrial', label: 'Nave industrial', Icon: Factory, color: CARD_COLORS[6] },
  { value: 'otro', label: 'Otro', Icon: MoreHorizontal, color: CARD_COLORS[7] },
]

const OPERATION_OPTIONS = [
  { value: 'venta', label: 'Venta', color: '#2563EB' },
  { value: 'renta', label: 'Renta', color: '#059669' },
]

const AMENITIES_OPTIONS = [
  // Amenidades Comunes
  { id: 'alberca', label: 'Alberca', Icon: Waves, category: 'amenity' },
  { id: 'gimnasio', label: 'Gimnasio', Icon: Dumbbell, category: 'amenity' },
  { id: 'seguridad_24', label: 'Vigilancia 24/7', Icon: Lock, category: 'amenity' },
  { id: 'camaras_seguridad', label: 'Cámaras de seguridad', Icon: Camera, category: 'amenity' },
  { id: 'cisterna_comun', label: 'Cisterna', Icon: Droplets, category: 'amenity' },
  { id: 'lobby', label: 'Lobby / Recepción', Icon: Users, category: 'amenity' },
  { id: 'juegos_infantiles', label: 'Juegos infantiles', Icon: Baby, category: 'amenity' },
  { id: 'pista_jogging', label: 'Pista de jogging', Icon: Footprints, category: 'amenity' },
  { id: 'pet_zone', label: 'Pet zone / Pet friendly', Icon: Dog, category: 'amenity' },
  { id: 'fire_pit', label: 'Fire pit / Fogatero', Icon: Flame, category: 'amenity' },
  { id: 'areas_verdes', label: 'Áreas verdes', Icon: TreePine, category: 'amenity' },
  { id: 'roof_garden_comun', label: 'Roof garden común', Icon: Building2, category: 'amenity' },
  { id: 'salon_eventos', label: 'Salón de eventos', Icon: PartyPopper, category: 'amenity' },
  { id: 'elevador', label: 'Elevador', Icon: MoveVertical, category: 'amenity' },
  { id: 'planta_electrica', label: 'Planta eléctrica', Icon: Factory, category: 'amenity' },
  { id: 'fraccionamiento_privado', label: 'Fraccionamiento privado', Icon: Lock, category: 'amenity' },
  { id: 'acceso_playa', label: 'Acceso a playa', Icon: Waves, category: 'amenity' },
  { id: 'cancha_basket', label: 'Cancha de básquet', Icon: MoreHorizontal, category: 'amenity' },

  // Características Internas
  { id: 'terraza', label: 'Terraza', Icon: Leaf, category: 'feature' },
  { id: 'balcon', label: 'Balcón', Icon: Square, category: 'feature' },
  { id: 'cocina_equipada', label: 'Cocina equipada', Icon: ChefHat, category: 'feature' },
  { id: 'aire_acondicionado', label: 'Aire acondicionado', Icon: Snowflake, category: 'feature' },
  { id: 'calefaccion', label: 'Calefacción', Icon: Flame, category: 'feature' },
  { id: 'estudio', label: 'Estudio', Icon: BookOpen, category: 'feature' },
  { id: 'cuarto_servicio', label: 'Cuarto de servicio', Icon: Bath, category: 'feature' },
  { id: 'bodega', label: 'Bodega', Icon: Package, category: 'feature' },
  { id: 'cisterna', label: 'Cisterna privada', Icon: Droplets, category: 'feature' },
  { id: 'amueblado', label: 'Amueblado', Icon: Armchair, category: 'feature' },
  { id: 'walk_in_closet', label: 'Walk-in closet', Icon: DoorOpen, category: 'feature' },
  { id: 'family_room', label: 'Family room', Icon: Users, category: 'feature' },
  { id: 'desayunador', label: 'Desayunador', Icon: Coffee, category: 'feature' },
  { id: 'vista_ciudad', label: 'Vista a la ciudad', Icon: Building2, category: 'feature' },
  { id: 'vista_panoramica', label: 'Vista panorámica', Icon: Mountain, category: 'feature' },
  { id: 'lavanderia', label: 'Área de lavado', Icon: Shirt, category: 'feature' },
  { id: 'roof_garden_privado', label: 'Roof garden privado', Icon: Leaf, category: 'feature' },
  { id: 'persianas', label: 'Persianas', Icon: MoreHorizontal, category: 'feature' },
  { id: 'patio', label: 'Patio trasero', Icon: TreePine, category: 'feature' },
  { id: 'parrilla', label: 'Parrilla / Asador', Icon: Flame, category: 'feature' },
  { id: 'frente_mar', label: 'Frente al mar', Icon: Waves, category: 'feature' },
  { id: 'vista_mar', label: 'Vista al mar', Icon: Waves, category: 'feature' },
  { id: 'estacionamiento_techado', label: 'Estacionamiento techado', Icon: Car, category: 'feature' },
]

const LEGAL_STAGE_COLORS = [BADGE_INDIGO, BADGE_GREEN, BADGE_AMBER, BADGE_PURPLE] as const
const LEGAL_STAGES = [
  { id: 'solicitud_docs', label: 'Solicitud de docs', color: LEGAL_STAGE_COLORS[0] },
  { id: 'cargada', label: 'Cargada', color: LEGAL_STAGE_COLORS[1] },
  { id: 'aprobacion', label: 'Aprobación', color: LEGAL_STAGE_COLORS[2] },
  { id: 'firma', label: 'Firma', color: LEGAL_STAGE_COLORS[3] },
]

// Design System: tarjetas base (fondo blanco, 14px radius, sombra/borde)
const dsCardBase =
  'bg-white rounded-[14px] border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-[box-shadow,transform] duration-200'
const dsCardHover =
  'hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] hover:-translate-y-px cursor-pointer'
const dsCardPadding = 'py-5 px-6'

const CurrencyInput = ({ value, onChange, placeholder, className, disabled }: any) => {
  const format = (val: string | number) => {
    if (val === '' || val === undefined || val === null) return ''
    const num = Number(val)
    return isNaN(num) ? val : '$' + num.toLocaleString('en-US')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-numeric chars except dot
    const rawValue = e.target.value.replace(/[^0-9.]/g, '')

    // Prevent multiple dots
    if ((rawValue.match(/\./g) || []).length > 1) return

    onChange(rawValue)
  }

  return (
    <Input
      type="text"
      value={format(value)}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  )
}

// Helper component for percentage input (e.g. "5 %")
const PercentageInput = ({ value, onChange, placeholder, className, icon }: any) => {
  const format = (val: string | number) => {
    if (val === '' || val === undefined || val === null) return ''
    const num = Number(val)
    return isNaN(num) ? val : num + ' %'
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove " %" and non-numeric chars
    let rawValue = e.target.value.replace(/ %/g, '').replace(/[^0-9.]/g, '')

    // Prevent multiple dots
    if ((rawValue.match(/\./g) || []).length > 1) return

    onChange(rawValue)
  }

  return (
    <div className="relative">
      <Input
        type="text"
        value={format(value)}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
      />
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-[#9CA3AF]">
        {icon}
      </div>
    </div>
  )
}

export default function NewPropertyWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    property_type: 'casa',
    operation_types: [] as string[],
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
    terrace_m2: '',
    balcony_m2: '',
    roof_garden_m2: '',
    age: '',
    floor_number: '',
    pets_allowed: '' as '' | 'si' | 'no',
    amenities: [] as string[],
    price: '',
    rent_price: '',
    maintenance_fee: '',
    currency: 'MXN' as 'MXN' | 'USD',
    legal_status: 'solicitud_docs',
    // New Fields for Step 6
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    commission_percentage: '',
    exclusivity_contract: null as boolean | null,
    credits_accepted: [] as string[],
    contract_start_date: '',
    contract_end_date: '',
    documents_in_order: false,
    commission_iva_included: false, // New field for IVA logic
    images: [] as string[],
    main_image_url: '',
    published: false,
    mls_shared: false,
  })

  const createProperty = useCreateProperty()

  // Auto-calcular m2 Totales
  useEffect(() => {
    const build = parseFloat(formData.built_area) || 0;
    const terrace = parseFloat(formData.terrace_m2) || 0;
    const balcony = parseFloat(formData.balcony_m2) || 0;
    const roof = parseFloat(formData.roof_garden_m2) || 0;
    const total = (build + terrace + balcony + roof).toFixed(2);

    if (formData.total_area !== total) {
      setFormData(prev => ({ ...prev, total_area: total }));
    }
  }, [formData.built_area, formData.terrace_m2, formData.balcony_m2, formData.roof_garden_m2, formData.total_area]);

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
        terrace_m2: formData.terrace_m2 ? parseFloat(formData.terrace_m2) : null,
        balcony_m2: formData.balcony_m2 ? parseFloat(formData.balcony_m2) : null,
        roof_garden_m2: formData.roof_garden_m2 ? parseFloat(formData.roof_garden_m2) : null,
        year_built: formData.age ? (new Date().getFullYear() - parseInt(formData.age)) : null,
        floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
        pets_allowed: formData.pets_allowed === 'si',
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
        amenities: formData.amenities || [],
      } as any)
      router.push('/backoffice/propiedades')
    } catch (error) {
      console.error('Error creating property:', error)
      alert('Error al crear la propiedad')
    }
  }

  return (
    <PageContainer
      variant="crm"
      title="Nueva Propiedad"
      subtitle={`Paso ${currentStep} de ${totalSteps} · ${STEPS[currentStep - 1].name}`}
      icon={Plus}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-8">
        <div className={`${dsCardBase} ${dsCardPadding}`}>
          <div className="flex items-center justify-between overflow-x-auto pb-2 gap-0">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const StepIcon = step.Icon
              const isOn = isCompleted || isActive
              return (
                <div key={step.id} className="flex items-center flex-1 min-w-[64px] sm:min-w-[72px]">
                  <div className="flex flex-col items-center w-full">
                    <div
                      className="w-[42px] h-[42px] rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                      style={{
                        backgroundColor: isOn ? step.color : '#E5E7EB',
                        color: isOn ? '#FFFFFF' : '#6B7280',
                      }}
                    >
                      {isCompleted ? <Check className="h-5 w-5" strokeWidth={2} style={{ color: 'inherit' }} /> : <StepIcon className="h-5 w-5" strokeWidth={2} aria-hidden style={{ color: 'inherit' }} />}
                    </div>
                    <p className={`text-[10px] sm:text-xs mt-2 text-center font-medium ${isOn ? 'text-[#111827]' : 'text-[#6B7280]'}`}>{step.name}</p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-0.5 sm:mx-1 rounded-full min-w-[8px] bg-[#E5E7EB]" style={isCompleted ? { backgroundColor: step.color } : undefined} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className={`${dsCardBase} overflow-hidden`}>
        <div className="py-5 px-6 border-b border-[#E5E7EB] bg-white">
          <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#111827] flex items-center gap-3">
            <span
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: STEPS[currentStep - 1].color, color: '#FFFFFF' }}
            >
              {(() => {
                const StepIcon = STEPS[currentStep - 1].Icon
                return <StepIcon className="h-5 w-5" strokeWidth={2} aria-hidden style={{ color: '#FFFFFF' }} />
              })()}
            </span>
            {STEPS[currentStep - 1].name}
          </h2>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-[#F5F5F7]">
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
              {currentStep === 4 && <Step4Amenities formData={formData} updateFormData={updateFormData} />}
              {currentStep === 5 && <Step5ContentIA formData={formData} updateFormData={updateFormData} />}
              {currentStep === 6 && <Step6Legal formData={formData} updateFormData={updateFormData} />}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-3 py-5 px-6 border-t border-[#E5E7EB] bg-white">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="rounded-lg border border-[#E5E7EB] bg-white text-[#374151] text-sm font-medium px-5 py-2.5 hover:bg-[#F5F5F7] disabled:opacity-50 inline-flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            Atrás
          </button>
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="rounded-lg text-white text-sm font-medium px-5 py-2.5 inline-flex items-center gap-1.5 transition-colors hover:opacity-90"
              style={{ backgroundColor: '#111827' }}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createProperty.isPending}
              className="rounded-lg text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 disabled:opacity-50 transition-colors"
              style={{ backgroundColor: '#111827' }}
            >
              {createProperty.isPending ? 'Guardando…' : 'Crear Propiedad'}
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

const inputClass =
  'w-full h-12 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]'
const labelClass = 'block text-[13px] font-normal text-[#6B7280] mb-2'

// Paso 1: Categoría — Design System: card blanco, badge 42px, título 15–16px
function Step1Category({ formData, updateFormData }: any) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {CATEGORIES.map(({ value, label, Icon, color }) => {
        const selected = formData.property_type === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => updateFormData('property_type', value)}
            className={`flex flex-col items-center justify-center ${dsCardBase} ${dsCardPadding} ${dsCardHover} ${selected ? 'ring-2 ring-offset-2' : ''}`}
            style={selected ? { boxShadow: `0 0 0 2px ${color}` } : undefined}
          >
            <span className="w-[42px] h-[42px] rounded-full flex items-center justify-center mb-3 flex-shrink-0" style={{ backgroundColor: color, color: '#FFFFFF' }}>
              <Icon className="w-5 h-5" strokeWidth={2} style={{ color: '#FFFFFF' }} />
            </span>
            <span className={`text-[15px] font-semibold ${selected ? 'text-[#111827]' : 'text-[#6B7280]'}`}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

// Contador circular +/-
function Counter({ value, onIncrement, onDecrement, label, Icon }: { value: number; onIncrement: () => void; onDecrement: () => void; label: string, Icon?: any }) {
  const isEmoji = typeof Icon === 'string'

  return (
    <div className="flex flex-col items-center p-4 rounded-2xl bg-white border border-[#E5E3DB] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 group/card">
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F8F7F4] flex items-center justify-center border border-[#E5E3DB] group-hover/card:border-[#B8975A]/30 transition-colors shadow-inner">
          {Icon && (
            isEmoji ? (
              <span className="text-2xl select-none leading-none">{Icon}</span>
            ) : (
              <Icon className="w-5 h-5 text-[#556B55]" />
            )
          )}
        </div>
        <p className="text-[13px] font-bold text-[#6B7B6B] uppercase tracking-wider opacity-80">{label}</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onDecrement}
          className="w-10 h-10 rounded-full border border-[#E8EBE6] flex items-center justify-center text-[#556B55] hover:bg-[#F5F6F4] hover:border-[#D1D7CC] disabled:opacity-20 disabled:hover:bg-white transition-all duration-200 shadow-sm active:scale-95"
          disabled={value <= 0}
          aria-label={`Menos ${label}`}
        >
          <Minus className="w-4 h-4" strokeWidth={3} />
        </button>
        <div className="min-w-[44px] h-12 flex items-center justify-center bg-[#F8F7F4] rounded-xl border border-[#E5E3DB]/50 shadow-inner">
          <span className="text-xl font-black text-[#2C3E2C] tabular-nums leading-none">{value}</span>
        </div>
        <button
          type="button"
          onClick={onIncrement}
          className="w-10 h-10 rounded-full border border-[#E8EBE6] flex items-center justify-center text-[#556B55] hover:bg-[#F5F6F4] hover:border-[#D1D7CC] transition-all duration-200 shadow-sm active:scale-95"
          aria-label={`Más ${label}`}
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}

// Paso 2: Operación + Datos Clave (Habitaciones, Medidas, etc.)
function Step2Operation({ formData, updateFormData }: any) {
  const toggle = (value: string) => {
    const arr = formData.operation_types.includes(value) ? formData.operation_types.filter((x: string) => x !== value) : [...formData.operation_types, value]
    updateFormData('operation_types', arr)
  }

  const inc = (field: 'bedrooms' | 'bathrooms' | 'half_bathrooms' | 'parking_spaces') => updateFormData(field, (formData[field] ?? 0) + 1)
  const dec = (field: 'bedrooms' | 'bathrooms' | 'half_bathrooms' | 'parking_spaces') => updateFormData(field, Math.max(0, (formData[field] ?? 0) - 1))

  return (
    <div className="space-y-10">
      {/* 1. Tipo de Operación */}
      <div className="bg-white p-6 sm:p-10 rounded-[28px] border border-[#E5E3DB] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#F0F4FF] flex items-center justify-center border border-[#D1D7FF] shadow-inner">
            <Tag className="w-6 h-6 text-[#2563EB]" />
          </div>
          <h3 className="text-xl font-black text-[#2C3E2C] tracking-tight">Tipo de Operación</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          {OPERATION_OPTIONS.map(({ value, label }) => {
            const selected = formData.operation_types.includes(value)
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggle(value)}
                className={`px-8 py-4 rounded-2xl text-[15px] font-black transition-all duration-300 active:scale-[0.97] border-2 ${selected
                  ? 'bg-[#2C3E2C] border-[#2C3E2C] text-white shadow-xl translate-y-[-2px]'
                  : 'bg-white border-[#E5E3DB] text-[#6B7B6B] hover:border-[#B8975A] hover:bg-[#FAF8F3]'
                  }`}
              >
                {label.toUpperCase()}
              </button>
            )
          })}
        </div>
        <p className="text-[13px] text-[#6B7B6B] mt-4 font-medium opacity-80">Puedes elegir más de una si la propiedad está disponible para ambas.</p>
      </div>

      {/* 2. Valor y Distribución */}
      <div className="bg-white p-6 sm:p-10 rounded-[28px] border border-[#E5E3DB] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-[#F8F7F4]">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF8F3] flex items-center justify-center border border-[#E8DFC7] shadow-inner">
            <CircleDollarSign className="w-7 h-7 text-[#B8975A]" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#2C3E2C] tracking-tight">Precio y Características</h3>
            <p className="text-[14px] text-[#6B7B6B]">Datos fundamentales para el listado.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          <div>
            <label className="block text-[13px] font-black text-[#2C3E2C] mb-3 uppercase tracking-widest opacity-60">Precio *</label>
            <div className="flex gap-3">
              <CurrencyInput
                value={formData.price}
                onChange={(val: string) => updateFormData('price', val)}
                placeholder="$0.00"
                className="h-14 rounded-2xl border-[#E5E3DB] px-6 text-[17px] font-bold focus:border-[#B8975A] transition-all"
              />
              <select
                value={formData.currency}
                onChange={(e) => updateFormData('currency', e.target.value)}
                className="h-14 w-28 rounded-2xl border border-[#E5E3DB] bg-[#F8F7F4] px-4 text-[15px] font-black text-[#2C3E2C] focus:border-[#B8975A] transition-all cursor-pointer"
              >
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-black text-[#2C3E2C] mb-3 uppercase tracking-widest opacity-60">Mantenimiento *</label>
            <div className="flex items-center gap-3">
              <CurrencyInput
                value={formData.maintenance_fee}
                onChange={(val: string) => updateFormData('maintenance_fee', val)}
                placeholder="$0.00"
                className="h-14 rounded-2xl border-[#E5E3DB] px-6 text-[17px] font-bold focus:border-[#B8975A] transition-all"
              />
              <span className="px-5 h-14 flex items-center rounded-2xl bg-[#F8F7F4] border border-[#E5E3DB] text-[13px] font-black text-[#6B7B6B] uppercase tracking-wider whitespace-nowrap">
                {formData.currency} / MES
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Counter value={formData.bedrooms ?? 0} onIncrement={() => inc('bedrooms')} onDecrement={() => dec('bedrooms')} label="Recámaras" Icon="🛏️" />
          <Counter value={formData.bathrooms ?? 0} onIncrement={() => inc('bathrooms')} onDecrement={() => dec('bathrooms')} label="Baños" Icon="🚿" />
          <Counter value={formData.half_bathrooms ?? 0} onIncrement={() => inc('half_bathrooms')} onDecrement={() => dec('half_bathrooms')} label="Medios baños" Icon="🚿" />
          <Counter value={formData.parking_spaces ?? 0} onIncrement={() => inc('parking_spaces')} onDecrement={() => dec('parking_spaces')} label="Estacionamientos" Icon="🚗" />
        </div>
      </div>

      {/* 3. Medidas y Otros Datos */}
      <div className="bg-white p-6 sm:p-10 rounded-[28px] border border-[#E5E3DB] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-[#F8F7F4]">
          <div className="w-14 h-14 rounded-2xl bg-[#F8F7F4] flex items-center justify-center border border-[#E5E3DB] shadow-inner text-2xl">
            📐
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#2C3E2C] tracking-tight">Medidas y Especificaciones</h3>
            <p className="text-[14px] text-[#6B7B6B]">Información técnica obligatoria para las tarjetas.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Fila Principal: Construcción */}
          <div className="relative group">
            <label className="block text-[13px] font-black text-[#2C3E2C] mb-3 ml-1 uppercase tracking-widest opacity-60">
              m² Construcción *
            </label>
            <div className="relative isolate group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#F8F7F4] flex items-center justify-center border border-[#E5E3DB] group-focus-within:border-[#B8975A]/40 transition-all z-10 text-xl">
                🏗️
              </div>
              <Input
                value={formData.built_area}
                onChange={(e) => updateFormData('built_area', e.target.value)}
                placeholder="0.00"
                className="w-full h-16 pl-16 rounded-2xl border-[#E5E3DB] bg-[#FDFCFB] focus:bg-white focus:ring-8 focus:ring-[#B8975A]/5 focus:border-[#B8975A] transition-all text-xl font-bold text-[#2C3E2C] placeholder:text-[#9CA3AF] placeholder:font-normal"
              />
            </div>
          </div>

          {/* Áreas Privativas (Opcionales) - Grid horizontal para no ocupar tanto espacio vertical */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-[#F8F7F4]">
            {[
              { id: 'terrace_m2', label: 'm² Terraza', Icon: '🌅' },
              { id: 'balcony_m2', label: 'm² Balcón', Icon: '🏙️' },
              { id: 'roof_garden_m2', label: 'm² Roof Garden', Icon: '🌿' },
            ].map((field) => (
              <div key={field.id} className="relative group">
                <label className="block text-[11px] font-bold text-[#6B7B6B] mb-2 ml-1 uppercase tracking-wider">
                  {field.label}
                </label>
                <div className="relative isolate group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#E5E3DB] group-focus-within:border-[#B8975A]/40 transition-all z-10 text-base">
                    {field.Icon}
                  </div>
                  <Input
                    value={formData[field.id]}
                    onChange={(e) => updateFormData(field.id, e.target.value)}
                    placeholder="0.00"
                    className="w-full h-12 pl-12 rounded-xl border-[#E5E3DB] bg-[#FDFCFB]/50 focus:bg-white focus:ring-4 focus:ring-[#B8975A]/5 focus:border-[#B8975A] transition-all text-[15px] font-bold text-[#2C3E2C]"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Resultado: m² Totales */}
          <div className="relative group pt-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <label className="text-[13px] font-black text-[#B8975A] uppercase tracking-[0.2em]">
                m² Totales (Calculado)
              </label>
              <span className="text-[10px] font-bold text-[#6B7B6B] uppercase opacity-50">Suma automática</span>
            </div>
            <div className="relative isolate group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#556B55]/10 flex items-center justify-center border border-[#556B55]/20 group-focus-within:border-[#B8975A]/40 transition-all z-10 text-xl">
                📐
              </div>
              <Input
                readOnly
                value={formData.total_area}
                className="w-full h-16 pl-16 rounded-2xl border-2 border-[#556B55]/20 bg-[#FAFBF9] text-2xl font-black text-[#556B55] shadow-inner transition-all cursor-default"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Especificaciones Técnicas */}
      <div className="bg-white p-6 sm:p-10 rounded-[28px] border border-[#E5E3DB] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { id: 'age', label: 'Antigüedad (Años) *', Icon: '📅', type: 'number' },
            { id: 'floor_number', label: 'Nivel / Piso *', Icon: '🏢', type: 'number' },
          ].map((field: any) => (
            <div key={field.id} className="relative group">
              <label className="block text-[13px] font-black text-[#2C3E2C] mb-3 ml-1 uppercase tracking-widest opacity-60">
                {field.label}
              </label>
              <div className="relative isolate group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-[#F8F7F4] flex items-center justify-center border border-[#E5E3DB] group-focus-within:border-[#B8975A]/40 transition-all z-10 text-lg">
                  {field.Icon}
                </div>
                <Input
                  type={field.type || 'text'}
                  value={formData[field.id]}
                  onChange={(e) => updateFormData(field.id, e.target.value)}
                  placeholder="0.00"
                  className="w-full h-15 pl-15 rounded-2xl border-[#E5E3DB] bg-[#FDFCFB] focus:bg-white focus:ring-8 focus:ring-[#B8975A]/5 focus:border-[#B8975A] transition-all text-[17px] font-bold text-[#2C3E2C] placeholder:text-[#9CA3AF] placeholder:font-normal"
                />
              </div>
            </div>
          ))}

          {/* Mascotas Toggle */}
          <div className="relative group">
            <label className="block text-[13px] font-black text-[#2C3E2C] mb-3 ml-1 uppercase tracking-widest opacity-60">
              ¿Mascotas permitidas? *
            </label>
            <div className="flex gap-2">
              {['si', 'no'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => updateFormData('pets_allowed', val)}
                  className={`flex-1 h-15 rounded-2xl border-2 font-black text-[13px] uppercase tracking-widest transition-all ${formData.pets_allowed === val
                    ? 'bg-[#556B55] border-[#556B55] text-white shadow-lg translate-y-[-1px]'
                    : 'bg-white border-[#E5E3DB] text-[#6B7B6B] hover:border-[#556B55]/30'
                    }`}
                >
                  {val === 'si' ? '🐕 SÍ' : '🚫 NO'}
                </button>
              ))}
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

        // Populate fields from Nominatim address details
        const addr = data.address
        if (addr) {
          if (addr.suburb || addr.neighbourhood || addr.city_district) {
            updateFormData('neighborhood', addr.suburb || addr.neighbourhood || addr.city_district)
          }
          if (addr.city || addr.town || addr.village) {
            updateFormData('city', addr.city || addr.town || addr.village)
          }
          if (addr.state) {
            updateFormData('state', addr.state)
          }
          if (addr.postcode) {
            updateFormData('postal_code', addr.postcode)
          }
        }
      } else {
        alert('No se encontró la dirección. Prueba buscando en el mapa.')
      }
    } catch {
      alert('Error al geocodificar. Prueba de nuevo.')
    } finally {
      setLinking(false)
    }
  }

  const addressFields = [
    { id: 'address', label: 'Calle y número *', placeholder: 'Ej: Av. Reforma 222', Icon: '🏠', fullWidth: true },
    { id: 'neighborhood', label: 'Colonia *', placeholder: 'Ej: Cuauhtémoc', Icon: '🏘️' },
    { id: 'city', label: 'Ciudad *', placeholder: 'Ej: CDMX', Icon: '🏙️' },
    { id: 'state', label: 'Estado *', placeholder: 'Ej: Ciudad de México', Icon: '🗺️' },
    { id: 'postal_code', label: 'Código postal *', placeholder: 'Ej: 06500', Icon: '📮' },
  ]

  return (
    <div className="space-y-10">
      <div className="bg-white p-6 sm:p-10 rounded-[28px] border border-[#E5E3DB] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-[#F8F7F4]">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center border border-[#D1D9FF] shadow-inner text-2xl">
            📍
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#2C3E2C] tracking-tight">Ubicación de la Propiedad</h3>
            <p className="text-[14px] text-[#6B7B6B]">Ingresa los datos exactos para vincularla al mapa.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
          {addressFields.map((field) => (
            <div key={field.id} className={`${field.fullWidth ? 'sm:col-span-2' : ''} relative group`}>
              <label className="block text-[13px] font-black text-[#2C3E2C] mb-3 ml-1 uppercase tracking-widest opacity-60">
                {field.label}
              </label>
              <div className="relative isolate group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-[#F8F7F4] flex items-center justify-center border border-[#E5E3DB] group-focus-within:border-[#B8975A]/40 transition-all z-10 text-lg">
                  {field.Icon}
                </div>
                <Input
                  value={formData[field.id]}
                  onChange={(e) => updateFormData(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full h-15 pl-15 rounded-2xl border-[#E5E3DB] bg-[#FDFCFB] focus:bg-white focus:ring-8 focus:ring-[#B8975A]/5 focus:border-[#B8975A] transition-all text-[17px] font-bold text-[#2C3E2C] placeholder:text-[#9CA3AF] placeholder:font-normal"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-start">
          <button
            type="button"
            onClick={handleVerEnMapa}
            disabled={linking || (!formData.address?.trim() && !formData.city?.trim())}
            className={`h-16 px-10 rounded-2xl font-black text-[15px] uppercase tracking-widest transition-all flex items-center gap-3 active:scale-[0.98] ${linking
              ? 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed'
              : 'bg-[#2C3E2C] text-white hover:bg-[#1A261A] shadow-lg shadow-[#2C3E2C]/10'
              }`}
          >
            {linking ? (
              <>
                <div className="w-5 h-5 border-3 border-[#9CA3AF] border-t-transparent rounded-full animate-spin" />
                Geocodificando...
              </>
            ) : (
              <>
                <LocateFixed className="w-5 h-5" strokeWidth={2.5} />
                Vincular y ver en mapa
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-[#FDFCFB] p-8 sm:p-10 rounded-[28px] border-2 border-dashed border-[#E5E3DB] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-[#E5E3DB] mb-4 shadow-sm">
          <Search className="w-8 h-8 text-[#B8975A] opacity-50" />
        </div>
        <p className="max-w-md text-[14px] font-medium text-[#6B7B6B] leading-relaxed">
          El mapa se cargará automáticamente al confirmar la dirección. Por ahora, completa los datos arriba y haz clic en <span className="text-[#2C3E2C] font-bold">Vincular</span>.
        </p>
      </div>
    </div>
  )
}


// Paso 4: Amenidades y Características
function Step4Amenities({ formData, updateFormData }: any) {
  const toggleAmenity = (id: string) => {
    const arr = formData.amenities.includes(id) ? formData.amenities.filter((x: string) => x !== id) : [...formData.amenities, id]
    updateFormData('amenities', arr)
  }

  const amenities = AMENITIES_OPTIONS.filter(o => o.category === 'amenity')
  const features = AMENITIES_OPTIONS.filter(o => o.category === 'feature')

  return (
    <div className="bg-white p-6 sm:p-10 rounded-[28px] border border-[#E5E3DB] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-[#F8F7F4]">
        <div className="w-14 h-14 rounded-2xl bg-[#F5F6F4] flex items-center justify-center border border-[#D1D7CC] shadow-inner">
          <Sparkles className="w-7 h-7 text-[#556B55]" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-[#2C3E2C] tracking-tight">Amenidades y Características</h3>
          <p className="text-[14px] text-[#6B7B6B]">Selecciona todos los servicios incluidos.</p>
        </div>
      </div>

      {/* Amenidades Comunes */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-8 bg-[#B8975A] rounded-full shadow-sm" />
          <h4 className="text-[16px] font-black text-[#2C3E2C] uppercase tracking-[0.2em]">Amenidades Comunes</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {amenities.map(({ id, label, Icon }) => {
            const active = formData.amenities.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleAmenity(id)}
                className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 active:scale-[0.97] ${active
                  ? 'bg-[#2C3E2C] border-[#2C3E2C] text-white shadow-xl translate-y-[-2px]'
                  : 'bg-[#FDFCFB] border-[#E5E3DB] text-[#6B7B6B] hover:border-[#B8975A] hover:bg-[#FAF8F3] hover:translate-y-[-1px]'
                  }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${active ? 'bg-white/20' : 'bg-[#F1EFE8] group-hover:bg-[#E8DFC7]'}`}>
                  <Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-[#556B55]'}`} strokeWidth={1.5} />
                </div>
                <span className="text-[13px] font-black text-left leading-tight tracking-tight uppercase opacity-90">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Características Internas */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-8 bg-[#556B55] rounded-full shadow-sm" />
          <h4 className="text-[16px] font-black text-[#2C3E2C] uppercase tracking-[0.2em]">Características Internas</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {features.map(({ id, label, Icon }) => {
            const active = formData.amenities.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleAmenity(id)}
                className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 active:scale-[0.97] ${active
                  ? 'bg-[#556B55] border-[#556B55] text-white shadow-xl translate-y-[-2px]'
                  : 'bg-[#FDFCFB] border-[#E5E3DB] text-[#6B7B6B] hover:border-[#B8975A] hover:bg-[#FAF8F3] hover:translate-y-[-1px]'
                  }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${active ? 'bg-white/20' : 'bg-[#F1EFE8] group-hover:bg-[#E8DFC7]'}`}>
                  <Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-[#2C3E2C]'}`} strokeWidth={1.5} />
                </div>
                <span className="text-[13px] font-black text-left leading-tight tracking-tight uppercase opacity-90">{label}</span>
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
        <button
          type="button"
          onClick={handleGenerateTitle}
          disabled={generatingTitle}
          className="mt-2 rounded-lg bg-[#111827] text-white text-sm font-medium px-5 py-2.5 disabled:opacity-60 flex items-center gap-2 hover:bg-[#1F2937] transition-colors"
        >
          {generatingTitle ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          )}
          Generar título con IA
        </button>
      </div>
      <div>
        <label className={labelClass}>Descripción *</label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Describe la propiedad..."
          className="w-full min-h-[140px] rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] resize-y"
        />
        <button
          type="button"
          onClick={handleGenerateDesc}
          disabled={generatingDesc}
          className="mt-2 rounded-lg bg-[#111827] text-white text-sm font-medium px-5 py-2.5 disabled:opacity-60 flex items-center gap-2 hover:bg-[#1F2937] transition-colors"
        >
          {generatingDesc ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="animate-pulse">Generando…</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" strokeWidth={2} />
              Generar descripción con IA
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// Paso 6: Legal y documentación — Estado + drag & drop + info detallada
function Step6Legal({ formData, updateFormData }: any) {
  const [ownerFiles, setOwnerFiles] = useState<File[]>([])
  const [propertyFiles, setPropertyFiles] = useState<File[]>([])
  const [predialFiles, setPredialFiles] = useState<File[]>([])
  const [domicilioFiles, setDomicilioFiles] = useState<File[]>([])
  const [fiscalFiles, setFiscalFiles] = useState<File[]>([])

  // Detect operation type (venta vs renta) from Step 2
  const isRenta = formData.operation_types.includes('renta') && !formData.operation_types.includes('venta')

  // Use explicit fallback: if Rent Price is not separately set, use standard Price
  const operationValue = isRenta
    ? parseFloat(formData.rent_price || formData.price || '0')
    : parseFloat(formData.price || '0')

  const baseAmount = isRenta
    ? operationValue * parseFloat(formData.commission_percentage || '0')
    : operationValue * (parseFloat(formData.commission_percentage || '0') / 100)

  const ivaRate = 0.16
  const commissionDetails = (() => {
    if (!baseAmount || isNaN(baseAmount)) return null

    let subtotal = 0
    let iva = 0
    let total = 0

    if (formData.commission_iva_included) {
      // El total calculado YA incluye IVA
      total = baseAmount
      subtotal = total / (1 + ivaRate)
      iva = total - subtotal
    } else {
      // El total calculado es MÁS IVA
      subtotal = baseAmount
      iva = subtotal * ivaRate
      total = subtotal + iva
    }

    return { subtotal, iva, total }
  })()

  const toggleCredit = (id: string) => {
    const current = formData.credits_accepted || []
    const updated = current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id]
    updateFormData('credits_accepted', updated)
  }

  const credits = [
    { id: 'bancario', label: 'Crédito Bancario' },
    { id: 'infonavit', label: 'Infonavit' },
    { id: 'fovissste', label: 'Fovissste' },
    { id: 'imss', label: 'IMSS' },
  ]

  return (
    <div className="space-y-10">
      <div className="bg-white p-6 sm:p-10 rounded-[28px] border border-[#E5E3DB] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-[#F8F7F4]">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center border border-[#D1D9FF] shadow-inner text-[#4F46E5]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#2C3E2C] tracking-tight">Información Legal y Administrativa</h3>
            <p className="text-[14px] text-[#6B7B6B]">Gestiona toda la documentación y condiciones de la propiedad.</p>
          </div>
        </div>

        {/* 1. Datos del Propietario */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-[#4F46E5] rounded-full shadow-sm" />
            <h4 className="text-[16px] font-black text-[#2C3E2C] uppercase tracking-[0.2em]">Datos del Propietario *</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#2C3E2C] uppercase tracking-wider ml-1">Nombre Completo *</label>
              <div className="relative">
                <Input
                  value={formData.owner_name}
                  onChange={(e) => updateFormData('owner_name', e.target.value)}
                  placeholder="Nombre del propietario"
                  className="pl-11 h-12 rounded-xl border-[#E5E3DB] bg-[#FDFCFB]"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#2C3E2C] uppercase tracking-wider ml-1">Teléfono *</label>
              <div className="relative">
                <Input
                  type="tel"
                  value={formData.owner_phone}
                  onChange={(e) => updateFormData('owner_phone', e.target.value)}
                  placeholder="55 1234 5678"
                  className="pl-11 h-12 rounded-xl border-[#E5E3DB] bg-[#FDFCFB]"
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#2C3E2C] uppercase tracking-wider ml-1">Correo Electrónico *</label>
              <div className="relative">
                <Input
                  type="email"
                  value={formData.owner_email}
                  onChange={(e) => updateFormData('owner_email', e.target.value)}
                  placeholder="propietario@email.com"
                  className="pl-11 h-12 rounded-xl border-[#E5E3DB] bg-[#FDFCFB]"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Condiciones Comerciales */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-[#10B981] rounded-full shadow-sm" />
            <h4 className="text-[16px] font-black text-[#2C3E2C] uppercase tracking-[0.2em]">Condiciones Comerciales *</h4>
          </div>
          <div className="grid grid-cols-1 gap-10 mb-8">
            {/* 1. Valor de Operación y Comisión */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[#2C3E2C] uppercase tracking-wider ml-1">Valor Estimado de Operación</label>
                  <div className="relative">
                    <Input
                      disabled
                      value={operationValue ? '$' + operationValue.toLocaleString('en-US') : '$0.00'}
                      className="pl-11 h-12 rounded-xl border-[#E5E3DB] bg-[#F3F4F6] text-[#6B7B6B] font-medium"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-[#9CA3AF]">
                      <Banknote className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] ml-1">Tomado del paso 2 ({isRenta ? 'Renta' : 'Venta'})</p>
                </div>

                <div className="flex gap-4">
                  <div className="space-y-2 flex-1">
                    <label className="text-[13px] font-bold text-[#2C3E2C] uppercase tracking-wider ml-1">
                      {isRenta ? 'Meses de Renta' : '% Comisión'} *
                    </label>
                    <div className="relative">
                      {isRenta ? (
                        <div className="relative">
                          <Input
                            type="number"
                            value={formData.commission_percentage}
                            onChange={(e) => updateFormData('commission_percentage', e.target.value)}
                            placeholder="1"
                            className="pl-11 h-12 rounded-xl border-[#E5E3DB] bg-[#FDFCFB]"
                          />
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-[#9CA3AF]">
                            <Calendar className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <PercentageInput
                          value={formData.commission_percentage}
                          onChange={(val: string) => updateFormData('commission_percentage', val)}
                          placeholder="5"
                          className="pl-11 h-12 rounded-xl border-[#E5E3DB] bg-[#FDFCFB]"
                          icon={<Percent className="w-4 h-4" />}
                        />
                      )}
                    </div>
                    {/* Instant Calculation Feedback */}
                    {formData.commission_percentage && !isNaN(baseAmount) && baseAmount > 0 && (
                      <p className="text-[11px] text-[#059669] font-bold mt-1.5 ml-1 flex items-center gap-1">
                        <span className="opacity-60">=</span>
                        {baseAmount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <label className="text-[13px] font-bold text-[#2C3E2C] uppercase tracking-wider ml-1">Impuestos</label>
                    <div className="flex bg-[#FDFCFB] p-1 rounded-xl border border-[#E5E3DB] h-12">
                      <button
                        type="button"
                        onClick={() => updateFormData('commission_iva_included', false)}
                        className={`flex-1 rounded-lg text-xs font-bold transition-all ${!formData.commission_iva_included ? 'bg-white shadow-sm text-[#2C3E2C] border border-black/5' : 'text-[#6B7B6B] hover:bg-white/50'}`}
                      >
                        Más IVA
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFormData('commission_iva_included', true)}
                        className={`flex-1 rounded-lg text-xs font-bold transition-all ${formData.commission_iva_included ? 'bg-white shadow-sm text-[#2C3E2C] border border-black/5' : 'text-[#6B7B6B] hover:bg-white/50'}`}
                      >
                        Incluido
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen Financiero */}
              <AnimatePresence>
                {commissionDetails && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#111827] rounded-2xl p-6 shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <CircleDollarSign className="w-24 h-24 text-white" />
                    </div>
                    <h5 className="text-white/90 text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Resumen Financiero</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                      <div>
                        <p className="text-white/60 text-xs mb-1">Subtotal Comisión</p>
                        <p className="text-white text-lg font-mono">{commissionDetails.subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs mb-1">IVA (16%)</p>
                        <p className="text-white text-lg font-mono">{commissionDetails.iva.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                      </div>
                      <div>
                        <p className="text-[#34D399] text-xs mb-1 font-bold">Total a Facturar</p>
                        <p className="text-[#34D399] text-2xl font-black font-mono tracking-tight">{commissionDetails.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Tipo de Contrato */}
            <div className="space-y-4 pt-6 border-t border-[#F8F7F4]">
              <label className="text-[13px] font-bold text-[#2C3E2C] uppercase tracking-wider ml-1">Tipo de Contrato *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => updateFormData('exclusivity_contract', true)}
                  className={`h-16 rounded-2xl border flex items-center justify-center gap-3 transition-all ${formData.exclusivity_contract === true ? 'bg-[#111827] border-[#111827] text-white shadow-lg scale-[1.01]' : 'bg-white border-[#E5E3DB] text-[#6B7B6B] hover:border-[#B8975A] hover:bg-[#FAF8F3]'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.exclusivity_contract === true ? 'bg-white/20' : 'bg-[#F3F4F6]'}`}>
                    <FileSignature className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">Exclusiva</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData('exclusivity_contract', false)}
                  className={`h-16 rounded-2xl border flex items-center justify-center gap-3 transition-all ${formData.exclusivity_contract === false ? 'bg-[#111827] border-[#111827] text-white shadow-lg scale-[1.01]' : 'bg-white border-[#E5E3DB] text-[#6B7B6B] hover:border-[#B8975A] hover:bg-[#FAF8F3]'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.exclusivity_contract === false ? 'bg-white/20' : 'bg-[#F3F4F6]'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">Opción</span>
                </button>
              </div>
            </div>

            {/* 3. Créditos Aceptados (Condicional) */}
            {!isRenta && (
              <div className="space-y-4 pt-6 border-t border-[#F8F7F4]">
                <label className="text-[13px] font-bold text-[#2C3E2C] uppercase tracking-wider ml-1">Créditos Aceptados *</label>
                <div className="flex flex-wrap gap-3">
                  {credits.map((c) => {
                    const active = (formData.credits_accepted || []).includes(c.id)
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCredit(c.id)}
                        className={`px-5 py-3 rounded-xl border text-sm font-bold transition-all flex items-center gap-2 ${active ? 'bg-[#ECFDF5] border-[#10B981] text-[#047857] shadow-sm' : 'bg-white border-[#E5E3DB] text-[#6B7B6B] hover:border-[#B8975A] hover:bg-[#FAF8F3]'}`}
                      >
                        {active ? <CheckCircle2 className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                        {c.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Vigencia del Contrato */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-[#F59E0B] rounded-full shadow-sm" />
            <h4 className="text-[16px] font-black text-[#2C3E2C] uppercase tracking-[0.2em]">Vigencia del Contrato *</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#2C3E2C] uppercase tracking-wider ml-1">Fecha de Inicio *</label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.contract_start_date}
                  onChange={(e) => updateFormData('contract_start_date', e.target.value)}
                  className="pl-11 h-12 rounded-xl border-[#E5E3DB] bg-[#FDFCFB]"
                />
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#2C3E2C] uppercase tracking-wider ml-1">Fecha de Término *</label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.contract_end_date}
                  onChange={(e) => updateFormData('contract_end_date', e.target.value)}
                  className="pl-11 h-12 rounded-xl border-[#E5E3DB] bg-[#FDFCFB]"
                />
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              </div>
            </div>
          </div>
        </div>
      </div >

      {/* 4. Documentación */}
      < div className="bg-white p-6 sm:p-10 rounded-[28px] border border-[#E5E3DB] shadow-[0_2px_12px_rgba(0,0,0,0.03)]" >
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#F8F7F4]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-[#4B5563]" />
            </div>
            <h3 className="text-xl font-black text-[#2C3E2C] tracking-tight">Documentación</h3>
          </div>
          <button
            type="button"
            onClick={() => updateFormData('documents_in_order', !formData.documents_in_order)}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all ${formData.documents_in_order ? 'bg-[#ECFDF5] border-[#10B981] text-[#047857]' : 'bg-white border-[#E5E3DB] text-[#6B7B6B]'}`}
          >
            <span className="text-sm font-bold">Documentación en regla</span>
            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.documents_in_order ? 'bg-[#10B981]' : 'bg-[#E5E7EB]'}`}>
              <div className={`w-4 h-full rounded-full bg-white shadow-sm transition-transform ${formData.documents_in_order ? 'translate-x-4' : ''}`} />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DocumentCard title="ID Propietario *" subtitle="INE, Acta Constitutiva" id="drop-owner" files={ownerFiles} onFiles={setOwnerFiles} />
          <DocumentCard title="De la Propiedad *" subtitle="Escrituras, Título" id="drop-property" files={propertyFiles} onFiles={setPropertyFiles} />
          <DocumentCard title="Predial *" subtitle="Comprobante de pago" id="drop-predial" files={predialFiles} onFiles={setPredialFiles} />
          <DocumentCard title="Comprobante Domicilio *" subtitle="CFE, Agua, Teléfono" id="drop-domicilio" files={domicilioFiles} onFiles={setDomicilioFiles} />
          <DocumentCard title="Situación Fiscal *" subtitle="Constancia SAT" id="drop-fiscal" files={fiscalFiles} onFiles={setFiscalFiles} />
        </div>

        <div className="mt-8 pt-6 border-t border-[#F8F7F4]">
          <p className="text-[15px] font-semibold text-[#111827] mb-4">Estado del Proceso Legal *</p>
          <div className="flex flex-wrap gap-2">
            {LEGAL_STAGES.map(({ id, label }) => {
              const selected = formData.legal_status === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => updateFormData('legal_status', id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${selected ? 'bg-[#111827] text-white shadow-lg transform -translate-y-0.5' : 'bg-white border border-[#E5E3DB] text-[#6B7B6B] hover:bg-[#F9FAFB]'}`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div >
    </div >
  )
}

function DocumentCard({ title, subtitle, id, files, onFiles }: { title: string, subtitle: string, id: string, files: File[], onFiles: (f: File[]) => void }) {
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
      className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 ${drag ? 'border-[#4F46E5] bg-[#EEF2FF]' : 'border-[#E5E3DB] bg-[#FDFCFB] hover:border-[#B8975A] hover:bg-white'}`}
    >
      <input type="file" multiple className="hidden" id={id} onChange={onInput} />
      <label htmlFor={id} className="cursor-pointer block p-6 text-center select-none h-full flex flex-col items-center justify-center">
        <div className={`w-10 h-10 mb-3 rounded-full flex items-center justify-center transition-colors ${files.length > 0 ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#F3F4F6] text-[#9CA3AF] group-hover:bg-[#FFF8E6] group-hover:text-[#B8975A]'}`}>
          {files.length > 0 ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </div>
        <p className="text-[14px] font-bold text-[#2C3E2C] mb-1">{title}</p>
        <p className="text-[12px] text-[#9CA3AF] group-hover:text-[#6B7B6B] transition-colors">{files.length > 0 ? `${files.length} archivo(s)` : subtitle}</p>
      </label>
    </div>
  )
}
