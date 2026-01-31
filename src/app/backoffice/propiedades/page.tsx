'use client'

import { useState } from 'react'
import { useProperties, usePropertiesStats } from '@/hooks/useProperties'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Propiedades</h1>
          <p className="text-gray-600 mt-1">Gestiona tu inventario de propiedades</p>
        </div>
        <Link href="/backoffice/propiedades/nueva">
          <Button className="bg-gray-900 hover:bg-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Propiedad
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mis Propiedades</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.mine || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mi Inmobiliaria</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Red de Inmobiliarias</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.network || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Network className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por título, ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="own">
            <Home className="h-4 w-4 mr-2" />
            Mías ({stats?.mine || 0})
          </TabsTrigger>
          <TabsTrigger value="agency">
            <Building2 className="h-4 w-4 mr-2" />
            Inmobiliaria ({stats?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="network">
            <Network className="h-4 w-4 mr-2" />
            Red ({stats?.network || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando propiedades...</p>
            </div>
          ) : properties && properties.length > 0 ? (
            <PropertiesGrid properties={properties} />
          ) : (
            <EmptyState activeTab={activeTab} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================================================
// GRID DE PROPIEDADES
// ============================================================================
function PropertiesGrid({ properties }: { properties: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {/* Imagen */}
        <div className="relative h-48 bg-gray-200">
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
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {property.published ? (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                Publicada
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-500 text-white text-xs font-medium rounded">
                Borrador
              </span>
            )}
            
            {property.source === 'network' && (
              <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded">
                Red
              </span>
            )}
          </div>

          {/* Health Score */}
          <div className="absolute top-2 right-2">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold
              ${property.health_score >= 80 ? 'bg-green-500 text-white' : 
                property.health_score >= 60 ? 'bg-yellow-500 text-white' : 
                'bg-red-500 text-white'}
            `}>
              {property.health_score}
            </div>
          </div>
        </div>

        <CardContent className="p-4">
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
        </CardContent>
      </Card>
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
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{message.title}</h3>
      <p className="text-gray-600 mb-6">{message.description}</p>
      
      {activeTab === 'own' && (
        <Link href="/backoffice/propiedades/nueva">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primera Propiedad
          </Button>
        </Link>
      )}
    </div>
  )
}
