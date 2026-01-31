'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    MessageCircle,
    Search,
    Calendar,
    RefreshCw,
    Home,
    Package,
    BarChart3,
    Users
} from 'lucide-react';

const QUICK_ACTIONS = [
    { icon: MessageCircle, label: 'Consultas', href: '/backoffice/consultas', color: 'text-gray-600' },
    { icon: Search, label: 'Búsquedas', href: '/backoffice/busquedas', color: 'text-gray-600' },
    { icon: Calendar, label: 'Visitas', href: '/backoffice/visitas', color: 'text-gray-600' },
    { icon: RefreshCw, label: 'Operaciones', href: '/backoffice/operaciones', color: 'text-gray-600' },
    { icon: Home, label: 'Propiedades', href: '/backoffice/propiedades', color: 'text-gray-600' },
    { icon: Package, label: 'Inventario', href: '/backoffice/inventario', color: 'text-gray-600' },
    { icon: BarChart3, label: 'Métricas', href: '/backoffice/analytics', color: 'text-gray-600' },
    { icon: Users, label: 'Referidos', href: '/backoffice/referidos', color: 'text-gray-600' }
];

export function QuickActions() {
    const router = useRouter();

    return (
        <div className="space-y-8">
            <div className="px-2">
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Acciones Rápidas</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {QUICK_ACTIONS.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            key={action.label}
                            onClick={() => router.push(action.href)}
                            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-none hover:border-gray-200 hover:bg-gray-50 transition-all duration-200 group text-center"
                        >
                            <div className="flex flex-col items-center space-y-4">
                                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#B8975A] group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                    {action.label}
                                </h3>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

