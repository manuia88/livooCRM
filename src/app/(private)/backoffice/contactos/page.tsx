'use client';

import { useState, useEffect } from 'react';
import { useContacts, usePrefetchContacts } from '@/hooks/useContacts';
import { PageContainer, Button as AppleButton } from '@/components/backoffice/PageContainer';
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
    Users,
    Search,
    Eye,
    Edit,
    MoreVertical,
    UserPlus,
    Mail,
    Phone,
    MessageSquare,
    ListChecks,
    TrendingUp,
    TrendingDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

export default function BackofficeContactsPage() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: contactsResponse, isLoading, isPlaceholderData } = useContacts({
        page,
        pageSize: 20,
        contactType: typeFilter === 'all' ? undefined : typeFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        searchQuery: searchTerm || undefined
    });

    const prefetchContacts = usePrefetchContacts();
    const contacts = contactsResponse?.data || [];

    useEffect(() => {
        if (contactsResponse?.hasMore) {
            prefetchContacts({
                page,
                pageSize: 20,
                contactType: typeFilter === 'all' ? undefined : typeFilter,
                status: statusFilter === 'all' ? undefined : statusFilter,
                searchQuery: searchTerm || undefined
            });
        }
    }, [page, contactsResponse, prefetchContacts, typeFilter, statusFilter, searchTerm]);

    const getTypeBadge = (type: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            buyer: { variant: 'default', label: 'Comprador' },
            seller: { variant: 'secondary', label: 'Vendedor' },
            owner: { variant: 'outline', label: 'Propietario' },
            tenant: { variant: 'outline', label: 'Inquilino' },
            investor: { variant: 'default', label: 'Inversionista' },
        };
        const config = variants[type] || { variant: 'secondary', label: type };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            lead: { variant: 'secondary', label: 'Lead' },
            contacted: { variant: 'outline', label: 'Contactado' },
            qualified: { variant: 'default', label: 'Calificado' },
            negotiating: { variant: 'default', label: 'Negociando' },
            closed_won: { variant: 'default', label: 'Ganado' },
            closed_lost: { variant: 'destructive', label: 'Perdido' },
            inactive: { variant: 'secondary', label: 'Inactivo' },
        };
        const config = variants[status] || { variant: 'secondary', label: status };
        return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
    };

    const getLeadScoreColor = (score: number | null) => {
        if (!score) return 'text-gray-400';
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStageBadge = (stage: string | null) => {
        if (!stage) return null;
        const stages: Record<string, string> = {
            'initial_contact': 'Contacto Inicial',
            'qualification': 'Calificación',
            'presentation': 'Presentación',
            'negotiation': 'Negociación',
            'proposal': 'Propuesta',
            'closing': 'Cierre',
            'won': 'Ganado'
        };
        return <span className="text-xs text-gray-500">{stages[stage] || stage}</span>;
    };

    if (isLoading && !isPlaceholderData) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-[#B8975A] animate-pulse" />
                    <p className="text-[#556B55]">Cargando contactos...</p>
                </div>
            </div>
        );
    }

    return (
        <PageContainer
            title="Contactos"
            subtitle="Gestiona tus clientes, prospectos y relaciones"
            icon={Users}
            actions={
                <AppleButton>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Nuevo Contacto
                </AppleButton>
            }
        >
            {/* Stats Cards - Estilo Apple */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 sm:mb-8">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-4 hover:scale-105 transition-all duration-300">
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-3xl font-black text-gray-900">{contactsResponse?.count || 0}</p>
                </div>
                {/* Nota: Los conteos específicos por tipo ahora podrían requerir queries separadas o ser devueltos por la API de búsqueda si es crítico */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-4 hover:scale-105 transition-all duration-300">
                    <p className="text-sm text-gray-600 mb-1">Compradores</p>
                    <p className="text-3xl font-black text-blue-600">
                        {contacts.filter((c) => c.contact_type === 'buyer').length || '-'}
                    </p>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-4 hover:scale-105 transition-all duration-300">
                    <p className="text-sm text-gray-600 mb-1">Vendedores</p>
                    <p className="text-3xl font-black text-green-600">
                        {contacts.filter((c) => c.contact_type === 'seller').length || '-'}
                    </p>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-4 hover:scale-105 transition-all duration-300">
                    <p className="text-sm text-gray-600 mb-1">Calificados</p>
                    <p className="text-3xl font-black text-purple-600">
                        {contacts.filter((c) => c.status === 'qualified').length || '-'}
                    </p>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-4 hover:scale-105 transition-all duration-300">
                    <p className="text-sm text-gray-600 mb-1">Score Prom.</p>
                    <p className="text-3xl font-black text-gray-900">
                        {contacts.length > 0
                            ? Math.round(
                                contacts.reduce((sum, c) => sum + (c.lead_score || 0), 0) /
                                contacts.length
                            )
                            : 0}
                    </p>
                </div>
            </div>

            {/* Filters - Estilo Apple */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Buscar por nombre, email o teléfono..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            className="pl-12 h-12 rounded-xl border-gray-200 bg-white/80 backdrop-blur-xl shadow-md focus:ring-2 focus:ring-gray-900"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 h-12 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-xl shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900 font-medium"
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="buyer">Comprador</option>
                        <option value="seller">Vendedor</option>
                        <option value="owner">Propietario</option>
                        <option value="tenant">Inquilino</option>
                        <option value="investor">Inversionista</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 h-12 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-xl shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900 font-medium"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="lead">Lead</option>
                        <option value="contacted">Contactado</option>
                        <option value="qualified">Calificado</option>
                        <option value="negotiating">Negociando</option>
                        <option value="closed_won">Ganado</option>
                        <option value="closed_lost">Perdido</option>
                    </select>
                </div>
            </div>

            {/* Table - Estilo Apple */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden relative">
                {isPlaceholderData && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center" />
                )}
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#F8F7F4]">
                            <TableHead>Contacto</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Información</TableHead>
                            <TableHead>Lead Score</TableHead>
                            <TableHead>Estado/Etapa</TableHead>
                            <TableHead>Asignado a</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contacts.length > 0 ? (
                            contacts.map((contact) => (
                                <TableRow key={contact.id} className="hover:bg-[#F8F7F4]">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] text-white">
                                                    {contact.first_name[0]}
                                                    {contact.last_name?.[0] || ''}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-[#2C3E2C]">
                                                    {contact.full_name}
                                                </div>
                                                <div className="text-xs text-[#556B55]">
                                                    {contact.source || 'Sin fuente'}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getTypeBadge(contact.contact_type)}</TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {contact.email && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Mail className="w-3 h-3 text-[#556B55]" />
                                                    <span className="text-[#556B55] truncate max-w-[180px]">
                                                        {contact.email}
                                                    </span>
                                                </div>
                                            )}
                                            {contact.phone && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Phone className="w-3 h-3 text-[#556B55]" />
                                                    <span className="text-[#556B55]">{contact.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-lg font-bold ${getLeadScoreColor(
                                                    contact.lead_score
                                                )}`}
                                            >
                                                {contact.lead_score || 0}
                                            </span>
                                            {contact.lead_score && contact.lead_score >= 70 ? (
                                                <TrendingUp className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {getStatusBadge(contact.status)}
                                            {contact.current_stage && (
                                                <div>{getStageBadge(contact.current_stage)}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-[#556B55]">
                                            {contact.assigned_to_name || '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <Link href={`/backoffice/contactos/${contact.id}`}>
                                                    <DropdownMenuItem>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Ver perfil
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem>
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Enviar mensaje
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <ListChecks className="w-4 h-4 mr-2" />
                                                    Crear tarea
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12">
                                    <Users className="w-12 h-12 mx-auto mb-4 text-[#E5E3DB]" />
                                    <p className="text-[#556B55]">No se encontraron contactos</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                {contactsResponse && contactsResponse.totalPages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
                        <div className="text-sm text-gray-500">
                            Mostrando {((page - 1) * 20) + 1} a {Math.min(page * 20, contactsResponse.count)} de {contactsResponse.count} contactos
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isPlaceholderData}
                                className="rounded-lg h-9 w-9 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="text-sm font-medium px-2">
                                Página {page} de {contactsResponse.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={!contactsResponse.hasMore || isPlaceholderData}
                                className="rounded-lg h-9 w-9 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
