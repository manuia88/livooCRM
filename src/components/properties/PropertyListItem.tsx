'use client';

import {
    MoreVertical,
    Edit,
    Share2,
    Trash2,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PropertyHealthScore } from './PropertyHealthScore';
import type { Property } from '@/types/properties';

interface PropertyListItemProps {
    property: Property;
    onShare?: (property: Property) => void;
    onEdit?: (property: Property) => void;
    onDelete?: (property: Property) => void;
}

export function PropertyListItem({
    property,
    onShare,
    onEdit,
    onDelete
}: PropertyListItemProps) {
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

    return (
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/10 transition-colors">
            {/* Image */}
            <div className="h-16 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                <img
                    src={property.photos?.[0] || '/placeholder-property.jpg'}
                    alt={property.title}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="col-span-2">
                    <h4 className="font-medium truncate">{property.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                        {property.address?.neighborhood}, {property.address?.city}
                    </p>
                </div>

                <div className="flex flex-col">
                    <span className="font-semibold text-primary">
                        {property.operation_type === 'rent'
                            ? formatPrice(property.rent_price, property.currency) + '/mes'
                            : formatPrice(property.sale_price, property.currency)
                        }
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                        {property.property_type} • {property.operation_type === 'sale' ? 'Venta' : 'Renta'}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(property.status)} variant="outline">
                        {property.status}
                    </Badge>
                    <PropertyHealthScore score={property.health_score} size="sm" />
                </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
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
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete?.(property)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
