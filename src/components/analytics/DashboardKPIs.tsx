// /src/components/analytics/DashboardKPIs.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Users, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useKPIs } from '@/hooks/useAnalytics';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardKPIs() {
    const { data: metrics, isLoading, error } = useKPIs();

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-sm text-red-600">Error al cargar métricas. Por favor, intenta nuevamente.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200">
                        <CardHeader className="pb-3">
                            <Skeleton className="h-4 w-32" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-10 w-24 mb-2" />
                            <Skeleton className="h-3 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const kpis = [
        {
            title: 'Propiedades Activas',
            value: metrics?.activeProperties || 0,
            subtitle: 'En venta/renta',
            icon: Home,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            trend: metrics?.propertyTrend || 0
        },
        {
            title: 'Nuevos Leads',
            value: metrics?.newLeads || 0,
            subtitle: 'Últimos 30 días',
            icon: Users,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            trend: metrics?.leadTrend || 0
        },
        {
            title: 'Ventas (Volumen)',
            value: `$${(metrics?.salesVolume || 0).toLocaleString()}`,
            subtitle: 'Últimos 30 días',
            icon: DollarSign,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            trend: metrics?.salesTrend || 0
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kpis.map((kpi, index) => {
                const Icon = kpi.icon;
                const isPositive = kpi.trend >= 0;
                const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

                return (
                    <motion.div
                        key={kpi.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    {kpi.title}
                                </CardTitle>
                                <div className={`p-2.5 rounded-2xl ${kpi.bg}`}>
                                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-3xl font-bold text-[#2C3E2C] group-hover:text-[#B8975A] transition-colors">
                                            {kpi.value}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{kpi.subtitle}</p>
                                    </div>
                                    {kpi.trend !== 0 && (
                                        <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                            <TrendIcon className="h-4 w-4" />
                                            {Math.abs(kpi.trend)}%
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}
