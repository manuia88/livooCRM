'use client'

import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import {
    MessageCircle,
    Search,
    Calendar,
    RefreshCw,
    Home,
    Package,
    BarChart3,
    Users
} from 'lucide-react'

const QUICK_ACTIONS = [
    { icon: MessageCircle, label: 'Consultas', href: '/dashboard/consultas' },
    { icon: Search, label: 'Búsquedas', href: '/dashboard/busquedas' },
    { icon: Calendar, label: 'Visitas', href: '/dashboard/visitas' },
    { icon: RefreshCw, label: 'Operaciones', href: '/dashboard/operaciones' },
    { icon: Home, label: 'Propiedades', href: '/dashboard/properties' },
    { icon: Package, label: 'Inventario', href: '/dashboard/inventario' },
    { icon: BarChart3, label: 'Métricas', href: '/dashboard/metricas' },
    { icon: Users, label: 'Referidos', href: '/dashboard/referidos' }
]

export function QuickActions() {
    const router = useRouter()

    return (
        <div className="grid grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                    <Card
                        key={action.label}
                        className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                        onClick={() => router.push(action.href)}
                    >
                        <div className="flex flex-col items-center space-y-3">
                            <div className="p-3 rounded-full bg-gray-100 group-hover:bg-blue-50 transition-colors">
                                <Icon className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{action.label}</span>
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}
