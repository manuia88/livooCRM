'use client'

import { useState } from 'react'
import { useProperties, usePropertiesStats } from '@/hooks/useProperties'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { PageContainer, Button } from '@/components/backoffice/PageContainer'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  Home, 
  Plus, 
  Search, 
  Building2, 
  Network,
  Eye,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Car,
  CheckCircle2,
  XCircle,
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function PropertiesPage() {
  const [activeTab, setActiveTab] = useState<'own' | 'agency' | 'network'>('own')
  const [search, setSearch] = useState('')
  const { data: currentUser } = useCurrentUser()
  const { data: properties, isLoading } = useProperties({ 
    source: activeTab,
    search: search || undefined
  })
  const { data: stats } = usePropertiesStats()

  return (
    <PageContainer
      title="Propiedades"
      subtitle="Gestiona tu inventario de propiedades"
      icon={Home}
      actions={
        <Link href="/backoffice/propiedades/nueva">
          <Button>
            <Plus className="h-5 w-5 mr-2" />
            Nueva Propiedad
          </Button>
        </Link>
      }
    >
      {/* Stats Cards - Estilo Apple */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-6 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Mis Propiedades</p>
              <p className="text-3xl font-black text-gray-900">{stats?.mine || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-6 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Mi Inmobiliaria</p>
              <p className="text-3xl font-black text-gray-900">{stats?.total || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-6 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Red de Inmobiliarias</p>
              <p className="text-3xl font-black text-gray-900">{stats?.network || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
              <Network className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar - Estilo Apple */}
      <div className="mb-6 sm:mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por título, ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 sm:h-14 rounded-2xl border-gray-200 bg-white/80 backdrop-blur-xl shadow-lg focus:ring-2 focus:ring-gray-900 text-base"
          />
        </div>
      </div>

      {/* Tabs - Estilo Apple */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full max-w-2xl grid-cols-3 h-12 bg-gray-100 rounded-xl p-1">
            <TabsTrigger value="own" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
              <Home className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Mías</span> ({stats?.mine || 0})
            </TabsTrigger>
            <TabsTrigger value="agency" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
              <Building2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Inmobiliaria</span> ({stats?.total || 0})
            </TabsTrigger>
            <TabsTrigger value="network" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
              <Network className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Red</span> ({stats?.network || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-600 mt-4 font-medium">Cargando propiedades...</p>
              </div>
            ) : properties && properties.length > 0 ? (
              <PropertiesGrid properties={properties} />
            ) : (
              <EmptyState activeTab={activeTab} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  )
}

// ============================================================================
// GRID DE PROPIEDADES - Estilo Apple
// ============================================================================
function PropertiesGrid({ properties }: { properties: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}

// ============================================================================
// CARD DE PROPIEDAD
// ============================================================================
function PropertyCard({ property }: { property: any }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Link href={`/backoffice/propiedades/${property.id}`}>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer">
        {/* Imagen */}
        <div className="relative h-56 bg-gray-200">
          {property.main_image_url ? (
            <Image
              src={property.main_image_url}
              alt={property.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Home className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Badges - Estilo Apple */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.published ? (
              <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-xl shadow-lg backdrop-blur-xl">
                Publicada
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-gray-700 text-white text-xs font-bold rounded-xl shadow-lg backdrop-blur-xl">
                Borrador
              </span>
            )}
            
            {property.source === 'network' && (
              <span className="px-3 py-1.5 bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg backdrop-blur-xl">
                Red
              </span>
            )}
          </div>

          {/* Health Score - Estilo Apple */}
          <div className="absolute top-3 right-3">
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black shadow-2xl backdrop-blur-xl
              ${property.health_score >= 80 ? 'bg-green-500 text-white' : 
                property.health_score >= 60 ? 'bg-yellow-500 text-white' : 
                'bg-red-500 text-white'}
            `}>
              {property.health_score}
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* Título */}
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
            {property.title}
          </h3>

          {/* Ubicación */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">
              {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
            </span>
          </div>

          {/* Precio */}
          <div className="flex items-center mb-3">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(property.sale_price || property.rent_price || 0)}
            </span>
            {property.operation_type === 'renta' && property.rent_price && (
              <span className="text-sm text-gray-600 ml-1">/mes</span>
            )}
          </div>

          {/* Características */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            {property.bedrooms && (
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.parking_spaces && (
              <div className="flex items-center">
                <Car className="h-4 w-4 mr-1" />
                <span>{property.parking_spaces}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center text-sm text-gray-600">
              <Eye className="h-4 w-4 mr-1" />
              <span>{property.views_count} vistas</span>
            </div>

            {/* Mostrar si puede ver datos propietario */}
            {property.is_my_agency && (
              <div className="text-xs text-green-600 font-medium">
                Mi agencia
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ============================================================================
// ESTADO VACÍO
// ============================================================================
function EmptyState({ activeTab }: { activeTab: string }) {
  const messages = {
    own: {
      title: 'No tienes propiedades',
      description: 'Comienza creando tu primera propiedad',
      icon: Home,
    },
    agency: {
      title: 'No hay propiedades en tu inmobiliaria',
      description: 'Sé el primero en agregar una propiedad',
      icon: Building2,
    },
    network: {
      title: 'No hay propiedades en la red',
      description: 'Otras inmobiliarias aún no han compartido propiedades',
      icon: Network,
    },
  }

  const message = messages[activeTab as keyof typeof messages]
  const Icon = message.icon

  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-6 shadow-xl">
        <Icon className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{message.title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">{message.description}</p>
      
      {activeTab === 'own' && (
        <Link href="/backoffice/propiedades/nueva">
          <Button size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Crear Primera Propiedad
          </Button>
        </Link>
      )}
    </div>
  )
}
