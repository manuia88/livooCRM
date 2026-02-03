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
  const { data: currentUser, isLoading, error } = useCurrentUser()

  // Mostrar loading mientras se carga el usuario
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  // Si hay error o no hay usuario, mostrar mensaje
  if (error || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error al cargar el dashboard</p>
          <p className="text-gray-600 text-sm">Por favor, recarga la página</p>
        </div>
      </div>
    )
  }

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager'

  if (isAdmin) {
    return <AdminDashboard />
  }

  return <AgentDashboard />
}

function AdminDashboard() {
  const [view, setView] = useState<'global' | 'by-agent'>('global')
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')

  return (
    <div className="p-6">
      <DashboardHeader />

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

function GlobalBusinessView() {
  const { data: metrics, isLoading, error } = useAgencyMetrics()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error al cargar las métricas de la agencia</p>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">No se encontraron métricas</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Asesor</CardTitle>
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
                {metrics?.agents_performance?.map((agent: any) => (
                  <tr key={agent.user_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{agent.full_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{agent.level}</td>
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

function ByAgentView({ selectedAgentId, onAgentChange }: { 
  selectedAgentId: string
  onAgentChange: (id: string) => void 
}) {
  const { data: agents } = useAgencyAgents()
  const { data: agentMetrics } = useAgentMetrics(selectedAgentId)

  return (
    <div className="space-y-6">
      <Select value={selectedAgentId} onValueChange={onAgentChange}>
        <SelectTrigger className="w-[350px]">
          <SelectValue placeholder="Seleccionar asesor" />
        </SelectTrigger>
        <SelectContent>
          {agents?.map((agent: any) => (
            <SelectItem key={agent.id} value={agent.id}>
              {agent.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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

function AgentDashboard() {
  const { data: summary, isLoading, error } = useDashboardSummary()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <DashboardHeader />
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">Error al cargar las métricas del dashboard</p>
          <p className="text-red-600 text-sm mt-1">Por favor, intenta recargar la página</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <DashboardHeader />
      {summary ? (
        <AgentMetricsView metrics={summary} />
      ) : (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">No se encontraron datos del dashboard</p>
        </div>
      )}
    </div>
  )
}

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
      </div>
    </div>
  )
}

function AgentMetricsView({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Propiedades Activas"
          value={metrics.metrics?.properties_active || 0}
          icon={Home}
          subtitle="En venta/renta"
        />
        <MetricCard
          title="Nuevos Leads"
          value={metrics.metrics?.new_leads || 0}
          icon={Users}
          subtitle="Últimos 30 días"
        />
        <MetricCard
          title="Ventas (Volumen)"
          value={`$${((metrics.metrics?.sales_this_month || 0) / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          subtitle="Últimos 30 días"
        />
        <MetricCard
          title="Tareas Pendientes"
          value={metrics.metrics?.tasks_pending || 0}
          icon={CheckSquare}
          subtitle="Por realizar"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meta Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">
                ${((metrics.objective?.current || 0) / 1000000).toFixed(2)}M
              </span>
              <span className="text-gray-600">
                de ${((metrics.objective?.target || 0) / 1000000).toFixed(1)}M
              </span>
            </div>
            
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${Math.min(metrics.objective?.percentage || 0, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>{metrics.objective?.percentage || 0}% alcanzado</span>
              <span>{metrics.objective?.period || 'Este mes'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, subtitle }: { 
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
