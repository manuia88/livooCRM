'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProperty, useUpdateProperty, useTogglePublishProperty } from '@/hooks/useProperties'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { PageContainer, Card, CardHeader, CardContent, CardTitle, Button as AppleButton } from '@/components/backoffice/PageContainer'
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
  ExternalLink,
  Calendar,
  Building2,
  Dog,
  Ruler,
  TreePine
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const TIPOS_SIN_CARACT_RESIDENCIALES = ['oficina', 'terreno', 'bodega', 'nave_industrial']

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
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="text-center bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando propiedad...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="p-6">
        <div className="text-center bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-8 max-w-md mx-auto">
          <p className="text-gray-600 mb-4">Propiedad no encontrada</p>
          <AppleButton variant="secondary" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </AppleButton>
        </div>
      </div>
    )
  }

  const canEdit = property.is_mine || currentUser?.role === 'admin' || currentUser?.role === 'manager'
  // Datos del propietario: solo productor o admins/manager de la inmobiliaria (no red, otros agentes ni MLS)
  const canSeeOwnerData =
    property.is_mine ||
    (property.is_my_agency && (currentUser?.role === 'admin' || currentUser?.role === 'manager'))

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4 sm:p-6 lg:p-8">
      {/* Header - Estilo Apple */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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

          {/* Características obligatorias: todas salvo en oficina, terreno, bodega, nave */}
          <Card>
            <CardHeader>
              <CardTitle>Características</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const prop = property as typeof property & {
                  year_built?: number | null
                  maintenance_fee?: number | null
                  terrace_m2?: number | null
                  balcony_m2?: number | null
                  roof_garden_m2?: number | null
                  furnished?: boolean | null
                  occupied?: boolean | null
                }
                const yearBuilt = prop.year_built
                const antiguedad = yearBuilt != null && Number.isFinite(yearBuilt)
                  ? `${new Date().getFullYear() - Number(yearBuilt)} años`
                  : '—'
                const mantenimiento = prop.maintenance_fee != null && Number.isFinite(prop.maintenance_fee)
                  ? formatPrice(Number(prop.maintenance_fee), 'MXN')
                  : '—'
                const mascotas = prop.pets_allowed != null ? (prop.pets_allowed ? 'Sí' : 'No') : '—'
                const constructionM2 = Number(property.construction_m2) || 0
                const terraceM2 = Number(prop.terrace_m2) || 0
                const balconyM2 = Number(prop.balcony_m2) || 0
                const roofGardenM2 = Number(prop.roof_garden_m2) || 0
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
                    : { label: 'Áreas Abiertas', value: '—' }
                const totalM2Computed = constructionM2 + openAreasSum
                const totalM2Display = totalM2Computed > 0 ? totalM2Computed : (property.total_area ?? (property as { land_m2?: number | null }).land_m2 ?? null)
                const totalM2Str = totalM2Display != null && Number(totalM2Display) > 0 ? `${Math.round(Number(totalM2Display))} m²` : '—'
                const piso = property.floor_number != null && Number.isFinite(property.floor_number) ? String(property.floor_number) : '—'
                const dash = '—'
                const isSinCaract = TIPOS_SIN_CARACT_RESIDENCIALES.includes(property.property_type ?? '')
                const getVal = (key: string) => (isEditing && key in editData ? editData[key as keyof typeof editData] : null)
                const fullItems: { Icon: typeof Bed; label: string; value: string; editKey?: string }[] = [
                  { Icon: Bed, label: 'Recámaras', value: getVal('bedrooms') != null ? String(getVal('bedrooms')) : (property.bedrooms != null ? String(property.bedrooms) : dash), editKey: 'bedrooms' },
                  { Icon: Bath, label: 'Baños', value: getVal('bathrooms') != null ? String(getVal('bathrooms')) : (property.bathrooms != null ? String(property.bathrooms) : dash), editKey: 'bathrooms' },
                  { Icon: Car, label: 'Estacionamientos', value: getVal('parking_spaces') != null ? String(getVal('parking_spaces')) : (property.parking_spaces != null ? String(property.parking_spaces) : dash), editKey: 'parking_spaces' },
                  { Icon: DollarSign, label: 'Mantenimiento', value: mantenimiento },
                  { Icon: Calendar, label: 'Antigüedad', value: antiguedad },
                  { Icon: Building2, label: 'Piso', value: piso },
                  { Icon: Dog, label: 'Mascotas', value: mascotas },
                  { Icon: Maximize, label: 'Construcción', value: getVal('construction_m2') != null ? `${getVal('construction_m2')} m²` : (property.construction_m2 != null ? `${property.construction_m2} m²` : dash), editKey: 'construction_m2' },
                  { Icon: TreePine, label: outdoorLabel.label, value: outdoorLabel.value },
                  { Icon: Ruler, label: 'Totales', value: totalM2Str },
                ]
                const reducedItems: { Icon: typeof Bed; label: string; value: string; editKey?: string }[] = [
                  { Icon: Car, label: 'Estacionamientos', value: property.parking_spaces != null ? String(property.parking_spaces) : dash, editKey: 'parking_spaces' },
                  { Icon: DollarSign, label: 'Mantenimiento', value: mantenimiento },
                  { Icon: Calendar, label: 'Antigüedad', value: antiguedad },
                  { Icon: Building2, label: 'Piso', value: piso },
                  { Icon: Maximize, label: 'Construcción', value: property.construction_m2 != null ? `${property.construction_m2} m²` : dash, editKey: 'construction_m2' },
                  { Icon: Ruler, label: 'Totales', value: totalM2Str },
                ]
                const items = isSinCaract ? reducedItems : fullItems
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {items.map(({ Icon, label, value, editKey }) => (
                      <div key={label} className="text-center p-4 bg-gray-50 rounded-lg">
                        <Icon className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                        {isEditing && editKey ? (
                          <>
                            {editKey === 'construction_m2' ? (
                              <Input
                                type="number"
                                value={editData.construction_m2 ?? ''}
                                onChange={(e) => setEditData({ ...editData, construction_m2: e.target.value })}
                                className="text-center"
                              />
                            ) : (
                              <Input
                                type="number"
                                step={editKey === 'bathrooms' ? '0.5' : undefined}
                                value={(editData as Record<string, unknown>)[editKey] ?? ''}
                                onChange={(e) => setEditData({ ...editData, [editKey]: e.target.value })}
                                className="text-center"
                              />
                            )}
                            <p className="text-sm text-gray-600 mt-1">{label}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-2xl font-bold">{value}</p>
                            <p className="text-sm text-gray-600">{label}</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })()}
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
