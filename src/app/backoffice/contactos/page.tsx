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
    TrendingDown
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

interface Contact {
    id: string;
    first_name: string;
    last_name: string | null;
    full_name: string;
    email: string | null;
    phone: string | null;
    contact_type: string;
    source: string | null;
    status: string;
    lead_score: number | null;
    current_stage: string | null;
    assigned_to_name: string | null;
    created_at: string;
    last_interaction: string | null;
}

export default function BackofficeContactsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: contacts, isLoading } = useQuery({
        queryKey: ['backoffice-contacts'],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('v_contacts_with_details')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Contact[];
        },
    });

    const filteredContacts = contacts?.filter((contact) => {
        const matchesSearch =
            contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.phone?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || contact.contact_type === typeFilter;
        const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

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

    if (isLoading) {
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#2C3E2C]">Contactos</h1>
                    <p className="text-[#556B55] mt-1">
                        Gestiona tus clientes, prospectos y relaciones
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A]">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nuevo Contacto
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg border border-[#E5E3DB]">
                    <p className="text-sm text-[#556B55]">Total</p>
                    <p className="text-2xl font-bold text-[#2C3E2C]">{contacts?.length || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E5E3DB]">
                    <p className="text-sm text-[#556B55]">Compradores</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {contacts?.filter((c) => c.contact_type === 'buyer').length || 0}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E5E3DB]">
                    <p className="text-sm text-[#556B55]">Vendedores</p>
                    <p className="text-2xl font-bold text-green-600">
                        {contacts?.filter((c) => c.contact_type === 'seller').length || 0}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E5E3DB]">
                    <p className="text-sm text-[#556B55]">Calificados</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {contacts?.filter((c) => c.status === 'qualified').length || 0}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E5E3DB]">
                    <p className="text-sm text-[#556B55]">Score Prom.</p>
                    <p className="text-2xl font-bold text-[#B8975A]">
                        {contacts && contacts.length > 0
                            ? Math.round(
                                contacts.reduce((sum, c) => sum + (c.lead_score || 0), 0) /
                                contacts.length
                            )
                            : 0}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-[#E5E3DB]">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#556B55] w-4 h-4" />
                        <Input
                            placeholder="Buscar por nombre, email o teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-[#E5E3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8975A]"
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
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-[#E5E3DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8975A]"
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

            {/* Table */}
            <div className="bg-white rounded-lg border border-[#E5E3DB] overflow-hidden">
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
                        {filteredContacts && filteredContacts.length > 0 ? (
                            filteredContacts.map((contact) => (
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
                                                <DropdownMenuItem>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Ver perfil
                                                </DropdownMenuItem>
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
            </div>
        </div>
    );
}
