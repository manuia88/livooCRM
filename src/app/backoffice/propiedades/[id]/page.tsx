'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProperty, useUpdateProperty, useTogglePublishProperty } from '@/hooks/useProperties'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Share2,
  MapPin,
  Home,
  Bed,
  Bath,
  Car,
  Maximize,
  DollarSign,
  Phone,
  Mail,
  User,
  Network,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  
  const { data: property, isLoading } = useProperty(propertyId)
  const { data: currentUser } = useCurrentUser()
  const updateProperty = useUpdateProperty()
  const togglePublish = useTogglePublishProperty()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="p-6">
        <p>Propiedad no encontrada</p>
      </div>
    )
  }

  const canEdit = property.is_mine || currentUser?.role === 'admin' || currentUser?.role === 'director'
  const canSeeOwnerData = property.is_my_agency

  const handleEdit = () => {
    setEditData({
      title: property.title,
      description: property.description || '',
      price: property.price,
      bedrooms: property.bedrooms || '',
      bathrooms: property.bathrooms || '',
      parking_spaces: property.parking_spaces || '',
      total_area: property.total_area || '',
      construction_m2: property.construction_m2 || '',
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      await updateProperty.mutateAsync({
        id: propertyId,
        updates: {
          ...editData,
          bedrooms: editData.bedrooms ? parseInt(editData.bedrooms) : null,
          bathrooms: editData.bathrooms ? parseFloat(editData.bathrooms) : null,
          parking_spaces: editData.parking_spaces ? parseInt(editData.parking_spaces) : null,
          total_area: editData.total_area ? parseFloat(editData.total_area) : null,
          construction_m2: editData.construction_m2 ? parseFloat(editData.construction_m2) : null,
          price: parseFloat(editData.price),
        }
      })
      setIsEditing(false)
    } catch (error) {
      alert('Error al actualizar')
    }
  }

  const handleTogglePublish = async () => {
    try {
      await togglePublish.mutateAsync({
        id: propertyId,
        published: !property.published
      })
    } catch (error) {
      alert('Error al cambiar estado de publicación')
    }
  }

  const handleToggleMLS = async () => {
    try {
      await updateProperty.mutateAsync({
        id: propertyId,
        updates: { mls_shared: !property.mls_shared }
      })
    } catch (error) {
      alert('Error al cambiar MLS')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? (
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="text-2xl font-bold"
                />
              ) : (
                property.title
              )}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{property.city}, {property.state}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Badges */}
          {property.published ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Publicada
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              Borrador
            </span>
          )}

          {property.mls_shared && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              MLS Compartido
            </span>
          )}

          {property.source === 'network' && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Red
            </span>
          )}

          {/* Health Score */}
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold
            ${property.health_score >= 80 ? 'bg-green-500 text-white' : 
              property.health_score >= 60 ? 'bg-yellow-500 text-white' : 
              'bg-red-500 text-white'}
          `}>
            {property.health_score}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {canEdit && (
        <div className="flex items-center space-x-2 mb-6">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={updateProperty.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={handleTogglePublish}
                disabled={togglePublish.isPending}
              >
                {property.published ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Despublicar
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Publicar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleMLS}
                disabled={updateProperty.isPending}
              >
                <Network className="h-4 w-4 mr-2" />
                {property.mls_shared ? 'Quitar de MLS' : 'Compartir en MLS'}
              </Button>
              {property.published && property.slug && (
                <Link href={`/propiedad/${property.slug}`} target="_blank">
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver en Web
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <Card>
            <CardContent className="p-0">
              <div className="relative h-96 bg-gray-200">
                {property.main_image_url ? (
                  <Image
                    src={property.main_image_url}
                    alt={property.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Home className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {property.description || 'Sin descripción'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Characteristics */}
          <Card>
            <CardHeader>
              <CardTitle>Características</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bed className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.bedrooms}
                      onChange={(e) => setEditData({ ...editData, bedrooms: e.target.value })}
                      className="text-center"
                    />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{property.bedrooms || '-'}</p>
                      <p className="text-sm text-gray-600">Recámaras</p>
                    </>
                  )}
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bath className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.5"
                      value={editData.bathrooms}
                      onChange={(e) => setEditData({ ...editData, bathrooms: e.target.value })}
                      className="text-center"
                    />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{property.bathrooms || '-'}</p>
                      <p className="text-sm text-gray-600">Baños</p>
                    </>
                  )}
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Car className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.parking_spaces}
                      onChange={(e) => setEditData({ ...editData, parking_spaces: e.target.value })}
                      className="text-center"
                    />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{property.parking_spaces || '-'}</p>
                      <p className="text-sm text-gray-600">Estacionamiento</p>
                    </>
                  )}
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Maximize className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.construction_m2}
                      onChange={(e) => setEditData({ ...editData, construction_m2: e.target.value })}
                      className="text-center"
                    />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{property.construction_m2 || property.total_area || '-'}</p>
                      <p className="text-sm text-gray-600">m² construidos</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Price */}
          <Card>
            <CardHeader>
              <CardTitle>Precio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-2">
                <DollarSign className="h-6 w-6 text-gray-600" />
                {isEditing ? (
                  <Input
                    type="number"
                    value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                    className="text-3xl font-bold"
                  />
                ) : (
                  <span className="text-3xl font-bold">{formatPrice(property.price)}</span>
                )}
              </div>
              {property.operation_type === 'renta' && (
                <p className="text-sm text-gray-600">/mes</p>
              )}
              {property.construction_m2 && property.price && (
                <p className="text-sm text-gray-600 mt-2">
                  {formatPrice(property.price / property.construction_m2)}/m²
                </p>
              )}
            </CardContent>
          </Card>

          {/* Owner Data (only if can see) */}
          {canSeeOwnerData && property.owner_name && (
            <Card>
              <CardHeader>
                <CardTitle>Datos del Propietario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">{property.owner_name}</span>
                </div>
                {property.owner_phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">{property.owner_phone}</span>
                  </div>
                )}
                {property.owner_email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">{property.owner_email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Health Score</span>
                <span className="font-semibold">{property.health_score}</span>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Dirección:</strong> {property.address}</p>
              {property.neighborhood && <p><strong>Colonia:</strong> {property.neighborhood}</p>}
              <p><strong>Ciudad:</strong> {property.city}</p>
              <p><strong>Estado:</strong> {property.state}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
