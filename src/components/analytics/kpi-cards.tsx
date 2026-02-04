'use client';

import { KPI } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, DollarSign, Users, BarChart3, TrendingUp } from 'lucide-react';

const iconMap = {
    leads: Users,
    conversion: TrendingUp,
    closings: BarChart3,
    commissions: DollarSign,
};

interface KPICardsProps {
    kpis: KPI[];
}

export function KPICards({ kpis }: KPICardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => {
                const Icon = iconMap[kpi.id as keyof typeof iconMap] || BarChart3;
                const isPositive = kpi.change >= 0;
                const formattedValue = kpi.format === 'currency'
                    ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(kpi.value))
                    : kpi.format === 'percentage'
                        ? `${kpi.value}%`
                        : kpi.value;

                return (
                    <Card key={kpi.id} className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 hover:scale-[1.02] transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {kpi.label}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formattedValue}</div>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                                {isPositive ? (
                                    <ArrowUp className="w-4 h-4 text-emerald-500 mr-1" />
                                ) : (
                                    <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                                )}
                                <span className={isPositive ? 'text-emerald-500' : 'text-red-500'}>
                                    {Math.abs(kpi.change)}%
                                </span>
                                <span className="ml-1">vs mes anterior</span>
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
