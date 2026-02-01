// src/app/(backoffice)/page.tsx
'use client'

import { useState } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useDashboardSummary, useAgencyMetrics, useAgentMetrics, useAgencyAgents } from '@/hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Building2, User, Home, Users, DollarSign, CheckSquare, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
    const { data: currentUser } = useCurrentUser()
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'director'

    if (isAdmin) {
        return <AdminDashboard />
    }

    return <AgentDashboard />
}

// ============================================================================
// DASHBOARD PARA ADMIN/DIRECTOR
// ============================================================================
function AdminDashboard() {
    const [view, setView] = useState<'global' | 'by-agent'>('global')
    const [selectedAgentId, setSelectedAgentId] = useState<string>('')

    return (
        <div className="p-6">
            {/* Header */}
            <DashboardHeader />

            {/* Tabs de vista */}
            <Tabs value={view} onValueChange={(v) => setView(v as 'global' | 'by-agent')} className="mb-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="global">
                        <Building2 className="h-4 w-4 mr-2" />
                        Negocio General
                    </TabsTrigger>
                    <TabsTrigger value="by-agent">
                        <User className="h-4 w-4 mr-2" />
                        Por Asesor
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="global">
                    <GlobalBusinessView />
                </TabsContent>

                <TabsContent value="by-agent">
                    <ByAgentView
                        selectedAgentId={selectedAgentId}
                        onAgentChange={setSelectedAgentId}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

// ============================================================================
// VISTA: NEGOCIO GENERAL (Admin)
// ============================================================================
function GlobalBusinessView() {
    const { data: metrics, isLoading } = useAgencyMetrics()

    if (isLoading) {
        return <div className="text-center py-8">Cargando métricas...</div>
    }

    return (
        <div className="space-y-6">
            {/* Cards de métricas globales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Propiedades Activas"
                    value={metrics?.total_properties || 0}
                    icon={Home}
                    subtitle="Total del equipo"
                />
                <MetricCard
                    title="Nuevos Leads"
                    value={metrics?.total_leads || 0}
                    icon={Users}
                    subtitle="Últimos 30 días"
                />
                <MetricCard
                    title="Ventas (Volumen)"
                    value={`$${((metrics?.total_sales || 0) / 1000000).toFixed(1)}M`}
                    icon={DollarSign}
                    subtitle="Últimos 30 días"
                />
                <MetricCard
                    title="Asesores Activos"
                    value={metrics?.active_agents || 0}
                    icon={Users}
                    subtitle="Total del equipo"
                />
            </div>

            {/* Tabla de rendimiento por asesor */}
            <Card>
                <CardHeader>
                    <CardTitle>Rendimiento por Asesor (Últimos 30 días)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Asesor</th>
                                    <th className="text-left py-3 px-4">Nivel</th>
                                    <th className="text-right py-3 px-4">Propiedades</th>
                                    <th className="text-right py-3 px-4">Leads</th>
                                    <th className="text-right py-3 px-4">Ventas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics?.agents_performance.map((agent) => (
                                    <tr key={agent.user_id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="font-medium">{agent.full_name}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-gray-600">{agent.level}</span>
                                        </td>
                                        <td className="text-right py-3 px-4">{agent.properties_count}</td>
                                        <td className="text-right py-3 px-4">{agent.leads_count}</td>
                                        <td className="text-right py-3 px-4">
                                            ${(agent.sales_amount / 1000000).toFixed(2)}M
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// ============================================================================
// VISTA: POR ASESOR (Admin)
// ============================================================================
function ByAgentView({
    selectedAgentId,
    onAgentChange
}: {
    selectedAgentId: string
    onAgentChange: (id: string) => void
}) {
    const { data: agents } = useAgencyAgents()
    const { data: agentMetrics } = useAgentMetrics(selectedAgentId)

    return (
        <div className="space-y-6">
            {/* Selector de asesor */}
            <Select value={selectedAgentId} onValueChange={onAgentChange}>
                <SelectTrigger className="w-[350px]">
                    <SelectValue placeholder="Seleccionar asesor" />
                </SelectTrigger>
                <SelectContent>
                    {agents?.map((agent: any) => (
                        <SelectItem key={agent.id} value={agent.id}>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
                                    {agent.full_name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{agent.full_name}</p>
                                    <p className="text-xs text-gray-500">{agent.email}</p>
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Mostrar métricas del asesor seleccionado */}
            {selectedAgentId && agentMetrics && (
                <AgentMetricsView metrics={agentMetrics} />
            )}

            {!selectedAgentId && (
                <div className="text-center py-12 text-gray-500">
                    Selecciona un asesor para ver sus métricas
                </div>
            )}
        </div>
    )
}

// ============================================================================
// DASHBOARD PARA ASESOR
// ============================================================================
function AgentDashboard() {
    const { data: summary, isLoading } = useDashboardSummary()

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Cargando...</div>
    }

    return (
        <div className="p-6">
            {/* Header */}
            <DashboardHeader />

            {/* Métricas del asesor */}
            {summary && <AgentMetricsView metrics={summary} />}
        </div>
    )
}

// ============================================================================
// COMPONENTE: Header del Dashboard
// ============================================================================
function DashboardHeader() {
    const { data: currentUser } = useCurrentUser()
    const { data: summary } = useDashboardSummary()

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        ¡Hola, {currentUser?.full_name?.split(' ')[0] || 'Usuario'}!
                    </h1>
                    <div className="flex items-center space-x-3 mt-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {summary?.level || 'Broker Inicial'}
                        </span>
                        <span className="text-gray-500">Panel de Gestión</span>
                    </div>
                </div>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    Nueva Propiedad
                </button>
            </div>
        </div>
    )
}

// ============================================================================
// COMPONENTE: Vista de métricas de un asesor
// ============================================================================
function AgentMetricsView({ metrics }: { metrics: any }) {
    if (!metrics || !metrics.metrics) return null;

    return (
        <div className="space-y-6">
            {/* Métricas de rendimiento */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Métricas de Rendimiento</h2>
                <p className="text-gray-600 text-sm mb-4">Basado en tus últimos 30 días</p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <MetricCard
                        title="Propiedades Activas"
                        value={metrics.metrics.properties_active || 0}
                        icon={Home}
                        subtitle="En venta/renta"
                    />
                    <MetricCard
                        title="Nuevos Leads"
                        value={metrics.metrics.new_leads || 0}
                        icon={Users}
                        subtitle="Últimos 30 días"
                    />
                    <MetricCard
                        title="Ventas (Volumen)"
                        value={`$${((metrics.metrics.sales_this_month || 0) / 1000000).toFixed(1)}M`}
                        icon={DollarSign}
                        subtitle="Últimos 30 días"
                    />
                    <MetricCard
                        title="Tareas Pendientes"
                        value={metrics.metrics.tasks_pending || 0}
                        icon={CheckSquare}
                        subtitle="Por realizar"
                    />
                </div>
            </div>

            {/* Objetivo mensual */}
            {metrics.objective && (
                <Card>
                    <CardHeader>
                        <CardTitle>Meta Mensual</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold">
                                    ${((metrics.objective.current || 0) / 1000000).toFixed(2)}M
                                </span>
                                <span className="text-gray-600">
                                    de ${((metrics.objective.target || 0) / 1000000).toFixed(1)}M
                                </span>
                            </div>

                            {/* Barra de progreso */}
                            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="absolute h-full bg-blue-600 transition-all duration-500"
                                    style={{ width: `${Math.min(metrics.objective.percentage || 0, 100)}%` }}
                                />
                            </div>

                            <div className="flex justify-between text-sm text-gray-600">
                                <span>{metrics.objective.percentage || 0}% alcanzado</span>
                                <span>{metrics.objective.period || 'Mensual'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

// ============================================================================
// COMPONENTE: Card de métrica
// ============================================================================
function MetricCard({
    title,
    value,
    icon: Icon,
    subtitle
}: {
    title: string
    value: string | number
    icon: any
    subtitle: string
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                </div>
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                </div>
            </CardContent>
        </Card>
    )
}
