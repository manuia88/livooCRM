'use client';

import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics-service';
import { KPICards } from '@/components/analytics/kpi-cards';
import { SalesTrendChart, ClosingsChart, LeadSourceChart } from '@/components/analytics/charts';
import { AdvisorRanking } from '@/components/analytics/advisor-ranking';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Loader2, BarChart3, TrendingUp, Users as UsersIcon, DollarSign } from 'lucide-react';

export default function BackofficeReportsPage() {
    const { data: kpis, isLoading: kpisLoading } = useQuery({
        queryKey: ['kpis'],
        queryFn: AnalyticsService.getKPIs,
    });
    const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
        queryKey: ['monthly'],
        queryFn: AnalyticsService.getMonthlyTrends,
    });
    const { data: advisors, isLoading: advisorsLoading } = useQuery({
        queryKey: ['advisors'],
        queryFn: AnalyticsService.getAdvisorRanking,
    });

    const isLoading = kpisLoading || monthlyLoading || advisorsLoading;

    const handleExportPDF = () => {
        alert('Exportar a PDF - En desarrollo');
    };

    const handleExportExcel = () => {
        alert('Exportar a Excel - En desarrollo');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#B8975A] animate-spin" />
                    <p className="text-[#556B55]">Cargando reportes...</p>
                </div>
            </div>
        );
    }

    // Extract values from KPI array
    const closedDeals = Number(kpis?.find(k => k.id === 'closings')?.value || 0);
    const totalCommissions = Number(kpis?.find(k => k.id === 'commissions')?.value || 0);
    const newLeadsCount = Number(kpis?.find(k => k.id === 'leads')?.value || 0);
    const conversionRate = Number(kpis?.find(k => k.id === 'conversion')?.value || 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#2C3E2C]">Reportes y Análisis</h1>
                    <p className="text-[#556B55] mt-1">
                        Análisis detallado de rendimiento, ventas y actividad
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportExcel}>
                        <Download className="w-4 h-4 mr-2" />
                        Excel
                    </Button>
                    <Button
                        className="bg-gradient-to-r from-[#B8975A] to-[#C4A872] hover:from-[#A38449] hover:to-[#B8975A]"
                        onClick={handleExportPDF}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Exportar PDF
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            {kpis && <KPICards kpis={kpis} />}

            {/* Tabs */}
            <Tabs defaultValue="sales" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="sales">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Ventas
                    </TabsTrigger>
                    <TabsTrigger value="activity">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Actividad
                    </TabsTrigger>
                    <TabsTrigger value="advisors">
                        <UsersIcon className="w-4 h-4 mr-2" />
                        Asesores
                    </TabsTrigger>
                    <TabsTrigger value="trends">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Tendencias
                    </TabsTrigger>
                </TabsList>

                {/* Sales Tab */}
                <TabsContent value="sales" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {monthlyData && <SalesTrendChart data={monthlyData} />}
                        {monthlyData && <ClosingsChart data={monthlyData} />}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen de Ventas</CardTitle>
                            <CardDescription>Detalle mensual de ingresos y conversiones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-[#F8F7F4] rounded-lg">
                                    <div>
                                        <p className="text-sm text-[#556B55]">Total Comisiones (Este Mes)</p>
                                        <p className="text-2xl font-bold text-[#2C3E2C]">
                                            ${totalCommissions.toLocaleString('es-MX')} MXN
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-[#556B55]">Propiedades Cerradas</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {closedDeals}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Actividad de Leads</CardTitle>
                                <CardDescription>Nuevos contactos y seguimientos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[#556B55]">Nuevos Leads</span>
                                        <span className="font-bold text-[#2C3E2C]">
                                            {newLeadsCount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[#556B55]">En Seguimiento</span>
                                        <span className="font-bold text-blue-600">
                                            90
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[#556B55]">Tasa de Conversión</span>
                                        <span className="font-bold text-green-600">
                                            {conversionRate}%
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <LeadSourceChart />
                    </div>
                </TabsContent>

                {/* Advisors Tab */}
                <TabsContent value="advisors" className="space-y-4">
                    {advisors && <AdvisorRanking advisors={advisors} />}
                </TabsContent>

                {/* Trends Tab */}
                <TabsContent value="trends" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tendencias del Mercado</CardTitle>
                                <CardDescription>Análisis de precios y demanda</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-blue-700 mb-1">Precio Promedio - Venta</p>
                                        <p className="text-xl font-bold text-blue-900">
                                            $4,250,000 MXN
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">↑ 5.2% vs mes anterior</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                        <p className="text-sm text-green-700 mb-1">Precio Promedio - Renta</p>
                                        <p className="text-xl font-bold text-green-900">
                                            $18,500 MXN/mes
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">↑ 3.1% vs mes anterior</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Zonas Más Buscadas</CardTitle>
                                <CardDescription>Top 5 colonias con mayor demanda</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {['Polanco', 'Condesa', 'Roma Norte', 'Santa Fe', 'Coyoacán'].map(
                                        (zone, idx) => (
                                            <div key={zone} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#B8975A] to-[#C4A872] text-white text-xs flex items-center justify-center font-bold">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-sm font-medium text-[#2C3E2C]">
                                                        {zone}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-[#556B55]">
                                                    {Math.floor(Math.random() * 200 + 50)} búsquedas
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
