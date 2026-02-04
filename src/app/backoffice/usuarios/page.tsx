'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
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
    Shield,
    Mail,
    Phone,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
    id: string;
    first_name: string;
    last_name: string | null;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
    role: string;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
    email?: string;
}

export default function BackofficeUsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: users, isLoading } = useQuery({
        queryKey: ['backoffice-users'],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as UserProfile[];
        },
    });

    const filteredUsers = users?.filter((user) => {
        const matchesSearch =
            user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && user.is_active) ||
            (statusFilter === 'inactive' && !user.is_active);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getRoleBadge = (role: string) => {
        const variants: Record<string, { variant: any; label: string; icon: any }> = {
            admin: { variant: 'destructive', label: 'Admin', icon: Shield },
            manager: { variant: 'default', label: 'Manager', icon: Users },
            agent: { variant: 'secondary', label: 'Agente', icon: Users },
            viewer: { variant: 'outline', label: 'Viewer', icon: Eye },
        };
        const config = variants[role] || { variant: 'secondary', label: role, icon: Users };
        const Icon = config.icon;
        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[320px]">
                <div className="text-center bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    return (
        <PageContainer
            title="Usuarios"
            subtitle="Gestiona los usuarios del sistema"
            icon={Users}
            actions={
                <AppleButton>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Nuevo Usuario
                </AppleButton>
            }
        >
            {/* Stats Cards - Estilo Apple */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-4 hover:scale-105 transition-all duration-300">
                    <p className="text-sm text-gray-600 mb-1">Total Usuarios</p>
                    <p className="text-3xl font-black text-gray-900">{users?.length || 0}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-4 hover:scale-105 transition-all duration-300">
                    <p className="text-sm text-gray-600 mb-1">Activos</p>
                    <p className="text-3xl font-black text-green-600">
                        {users?.filter((u) => u.is_active).length || 0}
                    </p>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-4 hover:scale-105 transition-all duration-300">
                    <p className="text-sm text-gray-600 mb-1">Agentes</p>
                    <p className="text-3xl font-black text-blue-600">
                        {users?.filter((u) => u.role === 'agent').length || 0}
                    </p>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-4 hover:scale-105 transition-all duration-300">
                    <p className="text-sm text-gray-600 mb-1">Administradores</p>
                    <p className="text-3xl font-black text-purple-600">
                        {users?.filter((u) => u.role === 'admin').length || 0}
                    </p>
                </div>
            </div>

            {/* Filters - Estilo Apple */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 rounded-xl border-gray-200 bg-white/80 backdrop-blur-xl shadow-md focus:ring-2 focus:ring-gray-900"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 h-12 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-xl shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900 font-medium"
                    >
                        <option value="all">Todos los roles</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="agent">Agente</option>
                        <option value="viewer">Viewer</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 h-12 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-xl shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900 font-medium"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                    </select>
                </div>
            </div>

            {/* Table - Estilo Apple */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-100/80 border-b border-gray-200">
                            <TableHead>Usuario</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Último Acceso</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers && filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-gray-50/80 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.avatar_url || undefined} />
                                                <AvatarFallback className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] text-white">
                                                    {user.first_name[0]}
                                                    {user.last_name?.[0] || ''}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-[#2C3E2C]">
                                                    {user.full_name}
                                                </div>
                                                <div className="text-xs text-[#556B55]">
                                                    ID: {user.id.slice(0, 8)}...
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {user.email && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="w-3 h-3 text-[#556B55]" />
                                                    <span className="text-[#556B55]">{user.email}</span>
                                                </div>
                                            )}
                                            {user.phone && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="w-3 h-3 text-[#556B55]" />
                                                    <span className="text-[#556B55]">{user.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                                    <TableCell>
                                        {user.is_active ? (
                                            <Badge variant="default" className="bg-green-500">
                                                Activo
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">Inactivo</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-[#556B55]">
                                            {user.last_login_at
                                                ? new Date(user.last_login_at).toLocaleDateString('es-MX')
                                                : 'Nunca'}
                                        </div>
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
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Shield className="w-4 h-4 mr-2" />
                                                    Cambiar permisos
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className={user.is_active ? 'text-orange-600' : 'text-green-600'}
                                                >
                                                    {user.is_active ? 'Desactivar' : 'Activar'}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-600">No se encontraron usuarios</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </PageContainer>
    );
}
