'use client';

import {
    Heart,
    Share2,
    MapPin,
    BedDouble,
    Bath,
    Ruler,
    MoreVertical,
    Edit,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PropertyHealthScore } from './PropertyHealthScore';
import type { Property } from '@/types/properties';

interface PropertyCardProps {
    property: Property;
    onShare?: (property: Property) => void;
    onEdit?: (property: Property) => void;
    onView?: (property: Property) => void;
    onDelete?: (property: Property) => void;
    className?: string;
}

export function PropertyCard({
    property,
    onShare,
    onEdit,
    onView,
    onDelete,
    className
}: PropertyCardProps) {
    const formatPrice = (price?: number, currency?: string) => {
        if (!price) return 'N/A';
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency || 'MXN',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'sold': return 'bg-blue-100 text-blue-800';
            case 'rented': return 'bg-purple-100 text-purple-800';
            case 'reserved': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            active: 'Activa',
            sold: 'Vendida',
            rented: 'Rentada',
            reserved: 'Reservada',
            draft: 'Borrador',
            suspended: 'Suspendida',
        };
        return labels[status] || status;
    };

    return (
        <Card className={`group overflow-hidden transition-all hover:shadow-lg ${className}`}>
            {/* Image Header */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                    src={property.photos?.[0] || '/placeholder-property.jpg'}
                    alt={property.title}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge className={getStatusColor(property.status)}>
                        {getStatusLabel(property.status)}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-sm text-foreground">
                        {property.operation_type === 'sale' ? 'Venta' :
                            property.operation_type === 'rent' ? 'Renta' : 'Venta/Renta'}
                    </Badge>
                </div>

                {/* Actions Overlay */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm"
                        onClick={() => onShare?.(property)}
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm"
                    >
                        <Heart className="h-4 w-4" />
                    </Button>
                </div>

                {/* Health Score Badge (Corner) */}
                <div className="absolute bottom-3 right-3">
                    <PropertyHealthScore score={property.health_score} size="sm" />
                </div>
            </div>

            {/* Content */}
            <CardContent className="p-4 space-y-3">
                {/* Price */}
                <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-bold text-primary">
                        {property.operation_type === 'rent'
                            ? formatPrice(property.rent_price, property.currency) + '/mes'
                            : formatPrice(property.sale_price, property.currency)
                        }
                    </h3>
                </div>

                {/* Title & Address */}
                <div className="space-y-1">
                    <h4 className="font-medium line-clamp-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => onView?.(property)}>
                        {property.title}
                    </h4>
                    <div className="flex items-center text-sm text-muted-foreground gap-1">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">
                            {property.address?.neighborhood}, {property.address?.city}
                        </span>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="flex items-center justify-between py-2 border-t border-b text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5" title="Recámaras">
                        <BedDouble className="h-4 w-4" />
                        <span>{property.bedrooms || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Baños">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Metros Construcción">
                        <Ruler className="h-4 w-4" />
                        <span>{property.construction_m2 || 0} m²</span>
                    </div>
                </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="p-3 bg-muted/5 flex items-center justify-between text-xs text-muted-foreground">
                <div>
                    {property.shared_in_mls && (
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <Share2 className="h-3 w-3" />
                            MLS Activo
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onView?.(property)}>
                        <Eye className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit?.(property)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onShare?.(property)}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Compartir
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onDelete?.(property)}
                            >
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardFooter>
        </Card>
    );
}
