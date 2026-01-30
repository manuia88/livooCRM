'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Building2,
    Search,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    Plus,
    Filter
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Property {
    id: string;
    title: string;
    property_type: string;
    operation_type: string;
    status: string;
    sale_price: number | null;
    rent_price: number | null;
    city: string | null;
    state: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    construction_m2: number | null;
    created_at: string;
}

export default function BackofficePropertiesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: properties, isLoading, refetch } = useQuery({
        queryKey: ['backoffice-properties'],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Property[];
        },
    });

    const filteredProperties = properties?.filter((property) => {
        const matchesSearch =
            property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.city?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            draft: { variant: 'secondary', label: 'Borrador' },
            active: { variant: 'default', label: 'Activa' },
            reserved: { variant: 'outline', label: 'Reservada' },
            sold: { variant: 'destructive', label: 'Vendida' },
            rented: { variant: 'destructive', label: 'Rentada' },
            suspended: { variant: 'secondary', label: 'Suspendida' },
            archived: { variant: 'secondary', label: 'Archivada' },
        };
        const config = variants[status] || { variant: 'secondary', label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getPropertyTypeName = (type: string) => {
        const types: Record<string, string> = {
            house: 'Casa',
            apartment: 'Departamento',
            condo: 'Condominio',
            townhouse: 'Townhouse',
            land: 'Terreno',
            commercial: 'Comercial',
            office: 'Oficina',
            warehouse: 'Bodega',
            building: 'Edificio',
            farm: 'Rancho',
            development: 'Desarrollo',
        };
        return types[type] || type;
    };

    const formatPrice = (salePrice: number | null, rentPrice: number | null, operationType: string) => {
        if (operationType === 'sale' && salePrice) {
            return `$${salePrice.toLocaleString('es-MX')} MXN`;
        }
        if (operationType === 'rent' && rentPrice) {
            return `$${rentPrice.toLocaleString('es-MX')} MXN/mes`;
        }
        if (operationType === 'both') {
            return salePrice
                ? `$${salePrice.toLocaleString('es-MX')} MXN`
                : rentPrice
                    ? `$${rentPrice.toLocaleString('es-MX')} MXN/mes`
                    : '-';
        }
        return '-';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-[#B8975A] animate-pulse" />
                    <p className="text-[#556B55]">Cargando propiedades...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#2C3E2C]">Propiedades</h1>
                    <p className="text-[#556B55] mt-1">
                        Gestiona todas las propiedades del sistema
                    </p>
                </div>
                <Link href="/dashboard/properties/new">
                    <Button className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A]">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Propiedad
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-[#E5E3DB]">
                    <p className="text-sm text-[#556B55]">Total</p>
                    <p className="text-2xl font-bold text-[#2C3E2C]">{properties?.length || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E5E3DB]">
                    <p className="text-sm text-[#556B55]">Activas</p>
                    <p className="text-2xl font-bold text-green-600">
                        {properties?.filter((p) => p.status === 'active').length || 0}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E5E3DB]">
                    <p className="text-sm text-[#556B55]">Vendidas/Rentadas</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {properties?.filter((p) => p.status === 'sold' || p.status === 'rented').length || 0}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E5E3DB]">
                    <p className="text-sm text-[#556B55]">Borradores</p>
                    <p className="text-2xl font-bold text-orange-600">
                        {properties?.filter((p) => p.status === 'draft').length || 0}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-[#E5E3DB]">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#556B55] w-4 h-4" />
                        <Input
                            placeholder="Buscar por título o ciudad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-[#E5E3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8975A]"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="draft">Borrador</option>
                        <option value="active">Activa</option>
                        <option value="reserved">Reservada</option>
                        <option value="sold">Vendida</option>
                        <option value="rented">Rentada</option>
                        <option value="suspended">Suspendida</option>
                        <option value="archived">Archivada</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-[#E5E3DB] overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#F8F7F4]">
                            <TableHead>Propiedad</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Ubicación</TableHead>
                            <TableHead>Características</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProperties && filteredProperties.length > 0 ? (
                            filteredProperties.map((property) => (
                                <TableRow key={property.id} className="hover:bg-[#F8F7F4]">
                                    <TableCell>
                                        <div className="font-medium text-[#2C3E2C]">{property.title}</div>
                                        <div className="text-xs text-[#556B55]">ID: {property.id.slice(0, 8)}...</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{getPropertyTypeName(property.property_type)}</div>
                                        <div className="text-xs text-[#556B55]">
                                            {property.operation_type === 'sale' ? 'Venta' : property.operation_type === 'rent' ? 'Renta' : 'Venta/Renta'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{property.city || '-'}</div>
                                        <div className="text-xs text-[#556B55]">{property.state || '-'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {property.bedrooms ? `${property.bedrooms} rec` : '-'} •{' '}
                                            {property.bathrooms ? `${property.bathrooms} baños` : '-'}
                                        </div>
                                        <div className="text-xs text-[#556B55]">
                                            {property.construction_m2 ? `${property.construction_m2} m²` : '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-[#2C3E2C]">
                                            {formatPrice(property.sale_price, property.rent_price, property.operation_type)}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(property.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Ver detalles
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12">
                                    <Building2 className="w-12 h-12 mx-auto mb-4 text-[#E5E3DB]" />
                                    <p className="text-[#556B55]">No se encontraron propiedades</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
