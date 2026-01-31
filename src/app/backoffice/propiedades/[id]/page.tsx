'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PropertyTasksSection } from '@/components/properties/PropertyTasksSection'
import {
    ArrowLeft,
    MapPin,
    Bed,
    Bath,
    Square,
    Calendar,
    DollarSign,
    Edit,
    Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function PropertyDetailPage() {
    const params = useParams()
    const router = useRouter()
    const propertyId = params.id as string

    const { data: property, isLoading } = useQuery({
        queryKey: ['property', propertyId],
        queryFn: async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('id', propertyId)
                .single()

            if (error) throw error
            return data
        }
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#B8975A] border-r-transparent"></div>
                    <p className="mt-4 text-[#556B55]">Cargando propiedad...</p>
                </div>
            </div>
        )
    }

    if (!property) {
        return (
            <div className="text-center py-12">
                <p className="text-[#556B55]">Propiedad no encontrada</p>
                <Button
                    onClick={() => router.back()}
                    className="mt-4"
                    variant="outline"
                >
                    Volver
                </Button>
            </div>
        )
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            active: { variant: 'default', label: 'Activa' },
            pending: { variant: 'secondary', label: 'Pendiente' },
            sold: { variant: 'default', label: 'Vendida' },
            rented: { variant: 'default', label: 'Rentada' },
            inactive: { variant: 'destructive', label: 'Inactiva' },
        }
        const config = variants[status] || { variant: 'secondary', label: status }
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    const getTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            apartment: 'Departamento',
            house: 'Casa',
            condo: 'Condominio',
            lot: 'Terreno',
            commercial: 'Comercial',
            office: 'Oficina'
        }
        return types[type] || type
    }

    const getOperationLabel = (operation: string) => {
        return operation === 'sale' ? 'Venta' : 'Renta'
    }

    const formatPrice = (price: number | null) => {
        if (!price) return 'No especificado'
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0
        }).format(price)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#2C3E2C]">
                            {property.title}
                        </h1>
                        <p className="text-[#556B55] mt-1">
                            {getTypeLabel(property.property_type)} • {getOperationLabel(property.operation_type)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver pública
                    </Button>
                    <Button className="bg-gradient-to-r from-[#B8975A] to-[#C4A872]">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Property Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Basic Info Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Información General</CardTitle>
                                {getStatusBadge(property.status)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Location */}
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-[#556B55] mt-1" />
                                <div className="text-sm">
                                    <p className="font-medium">{property.city || 'Ciudad no especificada'}</p>
                                    <p className="text-[#556B55]">{property.state || 'Estado no especificado'}</p>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                                {property.bedrooms && (
                                    <div className="text-center">
                                        <Bed className="h-5 w-5 text-[#556B55] mx-auto mb-1" />
                                        <p className="text-sm font-medium">{property.bedrooms}</p>
                                        <p className="text-xs text-[#556B55]">Recámaras</p>
                                    </div>
                                )}
                                {property.bathrooms && (
                                    <div className="text-center">
                                        <Bath className="h-5 w-5 text-[#556B55] mx-auto mb-1" />
                                        <p className="text-sm font-medium">{property.bathrooms}</p>
                                        <p className="text-xs text-[#556B55]">Baños</p>
                                    </div>
                                )}
                                {property.construction_m2 && (
                                    <div className="text-center">
                                        <Square className="h-5 w-5 text-[#556B55] mx-auto mb-1" />
                                        <p className="text-sm font-medium">{property.construction_m2}</p>
                                        <p className="text-xs text-[#556B55]">m²</p>
                                    </div>
                                )}
                            </div>

                            {/* Creation Date */}
                            <div className="flex items-center gap-3 pt-3 border-t">
                                <Calendar className="h-4 w-4 text-[#556B55]" />
                                <span className="text-sm">
                                    Publicada {formatDistanceToNow(new Date(property.created_at), {
                                        addSuffix: true,
                                        locale: es
                                    })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Price Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Precio
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {property.operation_type === 'sale' && property.sale_price && (
                                <div>
                                    <p className="text-xs text-[#556B55] mb-1">Venta</p>
                                    <p className="text-2xl font-bold text-[#2C3E2C]">
                                        {formatPrice(property.sale_price)}
                                    </p>
                                </div>
                            )}
                            {property.operation_type === 'rent' && property.rent_price && (
                                <div>
                                    <p className="text-xs text-[#556B55] mb-1">Renta mensual</p>
                                    <p className="text-2xl font-bold text-[#2C3E2C]">
                                        {formatPrice(property.rent_price)}
                                    </p>
                                </div>
                            )}
                            {!property.sale_price && !property.rent_price && (
                                <p className="text-[#556B55]">Precio no especificado</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Tasks */}
                <div className="lg:col-span-2">
                    <PropertyTasksSection propertyId={property.id} />
                </div>
            </div>
        </div>
    )
}
