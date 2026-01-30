import { createClient } from "@/utils/supabase/server";
import { BarChart3, Building2, Users, MessageSquare, ListChecks, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function BackofficePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch real statistics
    const [
        { count: totalProperties },
        { count: totalContacts },
        { count: pendingTasks },
        { count: unreadMessages },
        { data: recentActivity }
    ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('contacts').select('*', { count: 'exact', head: true }),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pendiente'),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('read', false),
        supabase.from('activity_logs')
            .select('*, user_profiles(full_name, avatar_url)')
            .order('created_at', { ascending: false })
            .limit(10)
    ]);

    // Get active properties breakdown
    const { data: propertiesStatus } = await supabase
        .from('properties')
        .select('status');

    const activeProperties = propertiesStatus?.filter(p => p.status === 'active').length || 0;
    const soldRented = propertiesStatus?.filter(p => p.status === 'sold' || p.status === 'rented').length || 0;

    const stats = [
        {
            title: "Total Propiedades",
            value: totalProperties?.toString() || "0",
            subtitle: `${activeProperties} activas`,
            icon: Building2,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
            href: "/backoffice/propiedades"
        },
        {
            title: "Contactos",
            value: totalContacts?.toString() || "0",
            subtitle: "en el sistema",
            icon: Users,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
            textColor: "text-green-600",
            href: "/backoffice/contactos"
        },
        {
            title: "Tareas Pendientes",
            value: pendingTasks?.toString() || "0",
            subtitle: "requieren atención",
            icon: ListChecks,
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600",
            href: "/backoffice/tareas"
        },
        {
            title: "Mensajes Sin Leer",
            value: unreadMessages?.toString() || "0",
            subtitle: "nuevos",
            icon: MessageSquare,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
            href: "/dashboard/inbox"
        },
    ];

    const getActivityIcon = (action: string) => {
        const icons: Record<string, any> = {
            'property_created': Building2,
            'property_updated': Building2,
            'contact_created': Users,
            'task_completed': ListChecks,
            'message_sent': MessageSquare,
        };
        return icons[action] || Clock;
    };

    const getActivityLabel = (action: string) => {
        const labels: Record<string, string> = {
            'property_created': 'Creó una propiedad',
            'property_updated': 'Actualizó una propiedad',
            'contact_created': 'Agregó un contacto',
            'task_completed': 'Completó una tarea',
            'message_sent': 'Envió un mensaje',
            'task_created': 'Creó una tarea',
            'user_login': 'Inició sesión',
        };
        return labels[action] || action;
    };

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-[#2C3E2C] to-[#3D5A3D] rounded-2xl p-8 text-white shadow-xl">
                <h1 className="text-3xl font-bold mb-2">
                    ¡Bienvenido, {user?.user_metadata?.full_name || "Usuario"}!
                </h1>
                <p className="text-white/80 text-lg">
                    Este es tu panel de control de Livoo Bienes Raíces.
                </p>
                <div className="mt-6 flex items-center gap-4">
                    <Link href="/backoffice/propiedades">
                        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                            <Building2 className="w-4 h-4 mr-2" />
                            Ver Propiedades
                        </Button>
                    </Link>
                    <Link href="/backoffice/tareas">
                        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                            <ListChecks className="w-4 h-4 mr-2" />
                            Mis Tareas
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link key={stat.title} href={stat.href}>
                            <div className="bg-white rounded-xl p-6 shadow-md border border-[#E5E3DB] hover:shadow-lg transition-all cursor-pointer group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 ${stat.bgColor} rounded-lg group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-[#2C3E2C] mb-1">
                                    {stat.value}
                                </h3>
                                <p className="text-sm text-[#556B55] font-medium">{stat.title}</p>
                                <p className="text-xs text-[#777] mt-1">{stat.subtitle}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-[#E5E3DB]">
                <h2 className="text-xl font-bold text-[#2C3E2C] mb-4">
                    Acciones Rápidas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/dashboard/properties/new">
                        <button className="w-full p-4 border-2 border-[#E5E3DB] rounded-lg hover:border-[#B8975A] hover:bg-[#F8F7F4] transition-all text-left group">
                            <h3 className="font-semibold text-[#2C3E2C] group-hover:text-[#B8975A] mb-1">
                                Nueva Propiedad
                            </h3>
                            <p className="text-sm text-[#556B55]">
                                Agrega una nueva propiedad al catálogo
                            </p>
                        </button>
                    </Link>
                    <Link href="/dashboard/inbox">
                        <button className="w-full p-4 border-2 border-[#E5E3DB] rounded-lg hover:border-[#B8975A] hover:bg-[#F8F7F4] transition-all text-left group">
                            <h3 className="font-semibold text-[#2C3E2C] group-hover:text-[#B8975A] mb-1">
                                Ver Mensajes
                            </h3>
                            <p className="text-sm text-[#556B55]">
                                Revisa las conversaciones con clientes
                            </p>
                        </button>
                    </Link>
                    <Link href="/backoffice/reportes">
                        <button className="w-full p-4 border-2 border-[#E5E3DB] rounded-lg hover:border-[#B8975A] hover:bg-[#F8F7F4] transition-all text-left group">
                            <h3 className="font-semibold text-[#2C3E2C] group-hover:text-[#B8975A] mb-1">
                                Generar Reporte
                            </h3>
                            <p className="text-sm text-[#556B55]">
                                Crea reportes de actividad y ventas
                            </p>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-[#E5E3DB]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-[#2C3E2C]">
                        Actividad Reciente
                    </h2>
                    <TrendingUp className="w-5 h-5 text-[#B8975A]" />
                </div>
                {recentActivity && recentActivity.length > 0 ? (
                    <div className="space-y-3">
                        {recentActivity.map((activity: any) => {
                            const Icon = getActivityIcon(activity.action);
                            return (
                                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F8F7F4] transition-colors">
                                    <div className="p-2 bg-[#F8F7F4] rounded-lg">
                                        <Icon className="w-4 h-4 text-[#B8975A]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[#2C3E2C]">
                                            <span className="font-medium">{activity.user_profiles?.full_name || 'Usuario'}</span>
                                            {' '}{getActivityLabel(activity.action)}
                                        </p>
                                        {activity.details && (
                                            <p className="text-xs text-[#556B55] mt-1 truncate">
                                                {activity.details}
                                            </p>
                                        )}
                                        <p className="text-xs text-[#777] mt-1">
                                            {new Date(activity.created_at).toLocaleDateString('es-MX', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-[#556B55] text-center py-8">
                        No hay actividad reciente disponible
                    </p>
                )}
            </div>
        </div>
    );
}
