import { createClient } from "@/utils/supabase/server";
import { BarChart3, Building2, Users, MessageSquare } from "lucide-react";

export default async function BackofficePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const stats = [
        {
            title: "Total Propiedades",
            value: "1,524",
            icon: Building2,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            title: "Usuarios Registrados",
            value: "3,842",
            icon: Users,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
            textColor: "text-green-600",
        },
        {
            title: "Consultas Pendientes",
            value: "127",
            icon: MessageSquare,
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600",
        },
        {
            title: "Visitas este Mes",
            value: "45,231",
            icon: BarChart3,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
        },
    ];

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
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className="bg-white rounded-xl p-6 shadow-md border border-[#E5E3DB] hover:shadow-lg transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-[#2C3E2C] mb-1">
                                {stat.value}
                            </h3>
                            <p className="text-sm text-[#556B55]">{stat.title}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-[#E5E3DB]">
                <h2 className="text-xl font-bold text-[#2C3E2C] mb-4">
                    Acciones Rápidas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 border-2 border-[#E5E3DB] rounded-lg hover:border-[#B8975A] hover:bg-[#F8F7F4] transition-all text-left group">
                        <h3 className="font-semibold text-[#2C3E2C] group-hover:text-[#B8975A] mb-1">
                            Nueva Propiedad
                        </h3>
                        <p className="text-sm text-[#556B55]">
                            Agrega una nueva propiedad al catálogo
                        </p>
                    </button>
                    <button className="p-4 border-2 border-[#E5E3DB] rounded-lg hover:border-[#B8975A] hover:bg-[#F8F7F4] transition-all text-left group">
                        <h3 className="font-semibold text-[#2C3E2C] group-hover:text-[#B8975A] mb-1">
                            Ver Consultas
                        </h3>
                        <p className="text-sm text-[#556B55]">
                            Revisa las consultas de clientes
                        </p>
                    </button>
                    <button className="p-4 border-2 border-[#E5E3DB] rounded-lg hover:border-[#B8975A] hover:bg-[#F8F7F4] transition-all text-left group">
                        <h3 className="font-semibold text-[#2C3E2C] group-hover:text-[#B8975A] mb-1">
                            Generar Reporte
                        </h3>
                        <p className="text-sm text-[#556B55]">
                            Crea reportes de actividad y ventas
                        </p>
                    </button>
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-[#E5E3DB]">
                <h2 className="text-xl font-bold text-[#2C3E2C] mb-4">
                    Actividad Reciente
                </h2>
                <p className="text-[#556B55]">
                    Aquí se mostrará la actividad reciente del sistema...
                </p>
            </div>
        </div>
    );
}
