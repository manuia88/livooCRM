'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateProperty } from '@/hooks/useProperties'
import { PageContainer, Button as AppleButton } from '@/components/backoffice/PageContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Home,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  FileText,
  Settings,
  Eye,
  Plus
} from 'lucide-react'

const STEPS = [
  { id: 1, name: 'Información Básica', icon: Home },
  { id: 2, name: 'Ubicación', icon: MapPin },
  { id: 3, name: 'Detalles', icon: FileText },
  { id: 4, name: 'Precios', icon: DollarSign },
  { id: 5, name: 'Características', icon: Settings },
  { id: 6, name: 'Imágenes', icon: ImageIcon },
  { id: 7, name: 'Revisión', icon: Eye },
]

export default function NewPropertyWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Paso 1: Básica
    title: '',
    description: '',
    property_type: 'casa',
    operation_type: 'venta',
    
    // Paso 2: Ubicación
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    
    // Paso 3: Detalles
    bedrooms: '',
    bathrooms: '',
    half_bathrooms: '',
    parking_spaces: '',
    total_area: '',
    built_area: '',
    
    // Paso 4: Precios
    price: '',
    rent_price: '',
    maintenance_fee: '',
    commission_percentage: '5',
    
    // Paso 5: Características
    amenities: [] as string[],
    features: [] as string[],
    
    // Paso 6: Imágenes
    images: [] as string[],
    main_image_url: '',
    
    // Paso 7: Propietario y publicación
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

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    try {
      await createProperty.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        property_type: formData.property_type as any,
        operation_type: formData.operation_type as any,
        address: formData.address,
        neighborhood: formData.neighborhood || null,
        city: formData.city,
        state: formData.state,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        half_bathrooms: formData.half_bathrooms ? parseInt(formData.half_bathrooms) : null,
        parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
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
      subtitle={`Paso ${currentStep} de 7 - ${STEPS[currentStep - 1].name}`}
      icon={Plus}
      className="max-w-6xl mx-auto"
    >
      {/* Stepper - Estilo Apple */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex items-center flex-1 min-w-[80px]">
                  <div className="flex flex-col items-center w-full">
                    <div className={`
                      w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300
                      ${isCompleted ? 'bg-gradient-to-br from-green-500 to-green-600 text-white scale-110' : 
                        isActive ? 'bg-gradient-to-br from-gray-900 to-gray-700 text-white scale-110' : 
                        'bg-gray-100 text-gray-400'}
                    `}>
                      {isCompleted ? <Check className="h-6 w-6 font-bold" /> : <Icon className="h-5 w-5 sm:h-6 sm:w-6" />}
                    </div>
                    <p className={`text-[10px] sm:text-xs mt-2 text-center ${isActive ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                      {step.name}
                    </p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 sm:mx-2 rounded-full transition-all duration-300 ${isCompleted ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Form Card - Estilo Apple */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">
            Paso {currentStep}: {STEPS[currentStep - 1].name}
          </h2>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {currentStep === 1 && <Step1BasicInfo formData={formData} updateFormData={updateFormData} />}
          {currentStep === 2 && <Step2Location formData={formData} updateFormData={updateFormData} />}
          {currentStep === 3 && <Step3Details formData={formData} updateFormData={updateFormData} />}
          {currentStep === 4 && <Step4Pricing formData={formData} updateFormData={updateFormData} />}
          {currentStep === 5 && <Step5Features formData={formData} updateFormData={updateFormData} />}
          {currentStep === 6 && <Step6Images formData={formData} updateFormData={updateFormData} />}
          {currentStep === 7 && <Step7Review formData={formData} updateFormData={updateFormData} />}
        </div>
      </div>

      {/* Navigation - Estilo Apple */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
        <AppleButton
          onClick={prevStep}
          disabled={currentStep === 1}
          variant="secondary"
          size="lg"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Anterior
        </AppleButton>

        {currentStep < 7 ? (
          <AppleButton onClick={nextStep} size="lg">
            Siguiente
            <ChevronRight className="h-5 w-5 ml-2" />
          </AppleButton>
        ) : (
          <AppleButton 
            onClick={handleSubmit}
            disabled={createProperty.isPending}
            variant="success"
            size="lg"
          >
            {createProperty.isPending ? 'Guardando...' : 'Crear Propiedad'}
          </AppleButton>
        )}
      </div>
    </PageContainer>
  )
}

// ============================================================================
// PASO 1: INFORMACIÓN BÁSICA
// ============================================================================
function Step1BasicInfo({ formData, updateFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Título *</label>
        <Input
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          placeholder="Ej: Casa moderna en Polanco"
          className="h-12 rounded-xl border-gray-200 bg-white/80 backdrop-blur-xl shadow-md focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Descripción</label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          className="w-full min-h-[140px] rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-md px-4 py-3 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
          placeholder="Describe la propiedad..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Tipo de Propiedad *</label>
          <select
            value={formData.property_type}
            onChange={(e) => updateFormData('property_type', e.target.value)}
            className="w-full h-12 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-md px-4 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
          >
            <option value="casa">Casa</option>
            <option value="departamento">Departamento</option>
            <option value="terreno">Terreno</option>
            <option value="local">Local Comercial</option>
            <option value="oficina">Oficina</option>
            <option value="bodega">Bodega</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Tipo de Operación *</label>
          <select
            value={formData.operation_type}
            onChange={(e) => updateFormData('operation_type', e.target.value)}
            className="w-full h-12 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-md px-4 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
          >
            <option value="venta">Venta</option>
            <option value="renta">Renta</option>
            <option value="ambos">Venta y Renta</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PASO 2: UBICACIÓN
// ============================================================================
function Step2Location({ formData, updateFormData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Dirección *</label>
        <Input
          value={formData.address}
          onChange={(e) => updateFormData('address', e.target.value)}
          placeholder="Calle y número"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Colonia</label>
          <Input
            value={formData.neighborhood}
            onChange={(e) => updateFormData('neighborhood', e.target.value)}
            placeholder="Ej: Polanco"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ciudad *</label>
          <Input
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            placeholder="Ej: Ciudad de México"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Estado *</label>
          <Input
            value={formData.state}
            onChange={(e) => updateFormData('state', e.target.value)}
            placeholder="Ej: CDMX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Código Postal</label>
          <Input
            value={formData.postal_code}
            onChange={(e) => updateFormData('postal_code', e.target.value)}
            placeholder="Ej: 11560"
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PASO 3: DETALLES
// ============================================================================
function Step3Details({ formData, updateFormData }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Recámaras</label>
          <Input
            type="number"
            value={formData.bedrooms}
            onChange={(e) => updateFormData('bedrooms', e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Baños</label>
          <Input
            type="number"
            step="0.5"
            value={formData.bathrooms}
            onChange={(e) => updateFormData('bathrooms', e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Medios Baños</label>
          <Input
            type="number"
            value={formData.half_bathrooms}
            onChange={(e) => updateFormData('half_bathrooms', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Estacionamientos</label>
          <Input
            type="number"
            value={formData.parking_spaces}
            onChange={(e) => updateFormData('parking_spaces', e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">m² Totales</label>
          <Input
            type="number"
            value={formData.total_area}
            onChange={(e) => updateFormData('total_area', e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">m² Construidos</label>
          <Input
            type="number"
            value={formData.built_area}
            onChange={(e) => updateFormData('built_area', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PASO 4: PRECIOS
// ============================================================================
function Step4Pricing({ formData, updateFormData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Precio de {formData.operation_type === 'renta' ? 'Renta' : 'Venta'} * (MXN)</label>
        <Input
          type="number"
          value={formData.price}
          onChange={(e) => updateFormData('price', e.target.value)}
          placeholder="0"
        />
      </div>

      {formData.operation_type !== 'venta' && (
        <div>
          <label className="block text-sm font-medium mb-2">Mantenimiento (MXN/mes)</label>
          <Input
            type="number"
            value={formData.maintenance_fee}
            onChange={(e) => updateFormData('maintenance_fee', e.target.value)}
            placeholder="0"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Comisión (%)</label>
        <Input
          type="number"
          step="0.1"
          value={formData.commission_percentage}
          onChange={(e) => updateFormData('commission_percentage', e.target.value)}
          placeholder="5.0"
        />
      </div>
    </div>
  )
}

// ============================================================================
// PASOS 5, 6, 7 (simplificados por ahora)
// ============================================================================
function Step5Features({ formData, updateFormData }: any) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600">Características y amenidades (próximamente)</p>
    </div>
  )
}

function Step6Images({ formData, updateFormData }: any) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600">Galería de imágenes (próximamente)</p>
    </div>
  )
}

function Step7Review({ formData, updateFormData }: any) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-4">Datos del Propietario</h3>
      
      <div>
        <label className="block text-sm font-medium mb-2">Nombre del Propietario</label>
        <Input
          value={formData.owner_name}
          onChange={(e) => updateFormData('owner_name', e.target.value)}
          placeholder="Nombre completo"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Teléfono</label>
          <Input
            value={formData.owner_phone}
            onChange={(e) => updateFormData('owner_phone', e.target.value)}
            placeholder="+52 55 1234 5678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input
            type="email"
            value={formData.owner_email}
            onChange={(e) => updateFormData('owner_email', e.target.value)}
            placeholder="email@ejemplo.com"
          />
        </div>
      </div>

      <div className="border-t pt-4 mt-6">
        <h3 className="font-semibold text-lg mb-4">Publicación</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => updateFormData('published', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Publicar en sitio web</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.mls_shared}
              onChange={(e) => updateFormData('mls_shared', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Compartir en RED de inmobiliarias (MLS)</span>
          </label>
        </div>
      </div>
    </div>
  )
}
