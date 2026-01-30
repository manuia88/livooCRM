// /src/components/analytics/DashboardKPIs.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Users, DollarSign, TrendingUp } from 'lucide-react'
import { useKPIs } from '@/hooks/useAnalytics'

export function DashboardKPIs() {
    const { data: metrics, isLoading } = useKPIs()

    if (isLoading) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                        Propiedades Activas
                    </CardTitle>
                    <Home className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{metrics?.activeProperties || 0}</div>
                    <p className="text-xs text-gray-600 mt-1">En venta/renta</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                        Nuevos Leads
                    </CardTitle>
                    <Users className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{metrics?.newLeads || 0}</div>
                    <p className="text-xs text-gray-600 mt-1">Últimos 30 días</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                        Ventas (Volumen)
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">
                        ${(metrics?.salesVolume || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Últimos 30 días</p>
                </CardContent>
            </Card>
        </div>
    )
}
