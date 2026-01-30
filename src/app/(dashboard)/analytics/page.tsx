'use client';

import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics-service';
import { KPICards } from '@/components/analytics/kpi-cards';
import { SalesTrendChart, ClosingsChart, LeadSourceChart } from '@/components/analytics/charts';
import { SalesFunnel } from '@/components/analytics/sales-funnel';
import { AdvisorRanking } from '@/components/analytics/advisor-ranking';
import { PropertyStatsTable } from '@/components/analytics/property-stats';
import { ExportButtons } from '@/components/analytics/export-buttons';
import { AnalyticsFilters } from '@/components/analytics/analytics-filters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
    // Data Fetching
    const { data: kpis, isLoading: kpisLoading } = useQuery({ queryKey: ['kpis'], queryFn: AnalyticsService.getKPIs });
    const { data: monthlyData, isLoading: monthlyLoading } = useQuery({ queryKey: ['monthly'], queryFn: AnalyticsService.getMonthlyTrends });
    const { data: funnelData, isLoading: funnelLoading } = useQuery({ queryKey: ['funnel'], queryFn: AnalyticsService.getSalesFunnel });
    const { data: advisors, isLoading: advisorsLoading } = useQuery({ queryKey: ['advisors'], queryFn: AnalyticsService.getAdvisorRanking });
    const { data: properties, isLoading: propertiesLoading } = useQuery({ queryKey: ['properties'], queryFn: AnalyticsService.getPropertyAnalytics });

    const isLoading = kpisLoading || monthlyLoading || funnelLoading || advisorsLoading || propertiesLoading;

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Ejecutivo</h1>
                    <p className="text-muted-foreground mt-1">
                        Resumen de rendimiento, ventas y proyecciones.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {kpis && monthlyData && advisors && (
                        <ExportButtons
                            kpis={kpis}
                            monthlyData={monthlyData}
                            advisors={advisors}
                            period="Últimos 30 días"
                        />
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <AnalyticsFilters />
            {kpis && <KPICards kpis={kpis} />}

            {/* Tabs System for Organization */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Resumen General</TabsTrigger>
                    <TabsTrigger value="funnel">Embudo de Ventas</TabsTrigger>
                    <TabsTrigger value="advisors">Asesores</TabsTrigger>
                    <TabsTrigger value="properties">Propiedades</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        {/* Main Chart Area */}
                        <div className="col-span-4">
                            {monthlyData && <SalesTrendChart data={monthlyData} />}
                        </div>
                        <div className="col-span-3">
                            <LeadSourceChart />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <div className="col-span-4">
                            {monthlyData && <ClosingsChart data={monthlyData} />}
                        </div>
                        <div className="col-span-3">
                            {/* Mini Funnel Preview */}
                            {funnelData && <SalesFunnel data={funnelData} />}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="funnel" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {funnelData && <SalesFunnel data={funnelData} />}
                        {/* Placeholder for more funnel analytics */}
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-muted-foreground">Más métricas de conversión detalladas aquí...</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="advisors" className="space-y-4">
                    {advisors && <AdvisorRanking advisors={advisors} />}
                </TabsContent>

                <TabsContent value="properties" className="space-y-4">
                    {properties && <PropertyStatsTable properties={properties} />}
                </TabsContent>
            </Tabs>
        </div>
    );
}
