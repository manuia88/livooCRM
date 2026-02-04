'use client'

import { useState } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useDashboardSummary, useAgencyMetrics } from '@/hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Home,
  Users,
  Search,
  FileText,
  CheckSquare,
  TrendingUp,
  Package,
  Target,
  UserPlus,
  Clock,
  AlertTriangle,
  GraduationCap,
  DollarSign,
  Eye,
  BarChart3,
  MessageSquare,
  Calendar,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'

export default function DashboardPage() {
  const { data: currentUser, isLoading, error } = useCurrentUser()
  const [showMetricsPanel, setShowMetricsPanel] = useState(false)

  // Mostrar loading mientras se carga el usuario
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error al cargar el dashboard</p>
          <p className="text-gray-600 text-sm">Por favor, recarga la página</p>
        </div>
      </div>
    )
  }

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Performance Header - Estilo Apple */}
      <PerformanceHeader user={currentUser} />

      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${showMetricsPanel ? 'pr-96' : ''}`}>
          <div className="p-8">
            {/* Sección: ¿Qué debo hacer hoy? */}
            <TodoSection />

            {/* Bento Grid - Accesos Rápidos */}
            <QuickAccessGrid onShowMetrics={() => setShowMetricsPanel(!showMetricsPanel)} />

            {/* Dashboard Metrics */}
            {isAdmin ? <AdminMetricsView /> : <AgentMetricsView />}
          </div>
        </div>

        {/* Metrics Panel Lateral (Slide-in) */}
        {showMetricsPanel && (
          <div className="fixed right-0 top-0 h-screen w-96 bg-white/80 backdrop-blur-xl border-l border-gray-200 shadow-2xl z-40 overflow-y-auto">
            <MetricsPanel onClose={() => setShowMetricsPanel(false)} />
          </div>
        )}
      </div>
    </div>
  )
}

function PerformanceHeader({ user }: { user: any }) {
  const { data: summary } = useDashboardSummary()
  const progress = summary?.objective?.percentage || 0
  const current = (summary?.objective?.current || 0) / 1000000
  const target = (summary?.objective?.target || 10000000) / 1000000

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-2xl">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Left: Saludo */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              ¡Hola {user?.full_name?.split(' ')[0] || 'Usuario'}!
            </h1>
            <div className="flex items-center space-x-3">
              <span className="px-4 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 rounded-full text-sm font-bold shadow-lg">
                {summary?.level || 'Broker Inicial'}
              </span>
            </div>
          </div>

          {/* Center: Gamificación */}
          <div className="flex-1 max-w-md mx-12">
            <div className="text-center mb-2">
              <p className="text-yellow-400 font-semibold text-lg">
                ${current.toFixed(1)}M alcanzado (últimos 6 meses)
              </p>
            </div>
            
            {/* Progress Bar - Estilo Apple */}
            <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div
                className="absolute h-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{progress}%</span>
              <span>Meta: ${target.toFixed(1)}M</span>
            </div>
          </div>

          {/* Right: Disponibilidad */}
          <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium shadow-lg transition-all duration-200 hover:scale-105">
            🟢 Disponible
          </button>
        </div>
      </div>
    </div>
  )
}

function TodoSection() {
  const priorityCards = [
    {
      title: '2 asesores',
      description: 'Pausados y 1 en riesgo de suspensión',
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      action: 'Ver detalle',
    },
    {
      title: 'Oferta vencida',
      description: 'Avenida Homero 664 • $200M',
      subtitle: 'hace 7 meses',
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      action: 'Actualizar',
    },
    {
      title: 'Tarea de propiedad',
      bigNumber: '1',
      subtitle: '1 atrasadas',
      icon: CheckSquare,
      color: 'from-blue-500 to-blue-600',
      action: 'Realizar',
    },
    {
      title: 'Curso pendiente',
      description: 'Mentalidad Pulpper',
      subtitle: '30 minutos',
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600',
      action: 'Ver curso',
    },
    {
      title: 'Continúa',
      description: 'Refiriendo para mejorar tus ingresos',
      icon: UserPlus,
      color: 'from-green-500 to-green-600',
      action: 'Referir',
    },
  ]

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Qué debo hacer hoy?</h2>
      
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {priorityCards.map((card, idx) => (
          <div
            key={idx}
            className="min-w-[320px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-6 hover:scale-105 transition-all duration-300 hover:shadow-3xl"
          >
            <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${card.color} mb-4`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
            
            {card.bigNumber && (
              <p className="text-5xl font-black text-gray-900 mb-1">{card.bigNumber}</p>
            )}
            
            {card.description && (
              <p className="text-sm text-gray-600 mb-1">{card.description}</p>
            )}
            
            {card.subtitle && (
              <p className="text-xs text-gray-500 mb-4">{card.subtitle}</p>
            )}
            
            <button className="w-full mt-4 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg">
              {card.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickAccessGrid({ onShowMetrics }: { onShowMetrics: () => void }) {
  const tiles = [
    { icon: MessageSquare, label: 'Consultas', href: '/backoffice/inbox' },
    { icon: Search, label: 'Búsquedas', href: '/backoffice/busquedas' },
    { icon: Eye, label: 'Visitas', href: '/backoffice/actividad' },
    { icon: FileText, label: 'Operaciones', href: '/backoffice/captaciones' },
    { icon: Home, label: 'Propiedades', href: '/backoffice/propiedades' },
    { icon: Package, label: 'Inventario', href: '/backoffice/inventario' },
    { icon: BarChart3, label: 'Métricas', onClick: onShowMetrics },
    { icon: UserPlus, label: 'Referidos', href: '/backoffice/marketing' },
  ]

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map((tile, idx) => (
          <button
            key={idx}
            onClick={tile.onClick}
            className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-6 hover:scale-105 transition-all duration-300 hover:shadow-3xl hover:bg-gradient-to-br hover:from-gray-900 hover:to-gray-800 text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-100 group-hover:bg-white/20 rounded-2xl transition-colors duration-300">
                <tile.icon className="h-6 w-6 text-gray-900 group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="font-semibold text-gray-900 group-hover:text-white transition-colors duration-300">
                {tile.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function AdminMetricsView() {
  const { data: metrics } = useAgencyMetrics()

  const cards = [
    {
      title: 'Propiedades Activas',
      value: metrics?.total_properties || 0,
      icon: Home,
      color: 'from-blue-500 to-blue-600',
      subtitle: 'Total del equipo',
    },
    {
      title: 'Nuevos Leads',
      value: metrics?.total_leads || 0,
      icon: Users,
      color: 'from-green-500 to-green-600',
      subtitle: 'Últimos 30 días',
    },
    {
      title: 'Ventas (Volumen)',
      value: `$${((metrics?.total_sales || 0) / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
      subtitle: 'Últimos 30 días',
    },
    {
      title: 'Asesores Activos',
      value: metrics?.active_agents || 0,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      subtitle: 'Total del equipo',
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Resumen de Negocio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-6 hover:scale-105 transition-all duration-300"
          >
            <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${card.color} mb-4`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm text-gray-600 mb-2">{card.title}</p>
            <p className="text-3xl font-black text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Tabla de Rendimiento */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Rendimiento por Asesor</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Asesor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Nivel</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Propiedades</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Leads</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Ventas</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.agents_performance?.map((agent: any) => (
                <tr key={agent.user_id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium">{agent.full_name}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {agent.level}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">{agent.properties_count}</td>
                  <td className="text-right py-3 px-4">{agent.leads_count}</td>
                  <td className="text-right py-3 px-4 font-bold">
                    ${(agent.sales_amount / 1000000).toFixed(2)}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AgentMetricsView() {
  const { data: summary } = useDashboardSummary()

  const cards = [
    {
      title: 'Propiedades Activas',
      value: summary?.metrics?.properties_active || 0,
      icon: Home,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Nuevos Leads',
      value: summary?.metrics?.new_leads || 0,
      icon: Users,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Ventas (Volumen)',
      value: `$${((summary?.metrics?.sales_this_month || 0) / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      title: 'Tareas Pendientes',
      value: summary?.metrics?.tasks_pending || 0,
      icon: CheckSquare,
      color: 'from-purple-500 to-purple-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-6 hover:scale-105 transition-all duration-300"
        >
          <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${card.color} mb-4`}>
            <card.icon className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-gray-600 mb-2">{card.title}</p>
          <p className="text-3xl font-black text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  )
}

function MetricsPanel({ onClose }: { onClose: () => void }) {
  const metrics = [
    { label: 'Pausa de consultas', value: '0/11', status: 'good' },
    { label: 'Advertencia', value: '0/11', status: 'good' },
    { label: 'WhatsApp vinculado', value: '11/11', status: 'good' },
    { label: 'Brokers certificados', value: '11/11', status: 'good' },
    { label: 'Consultas pendientes', value: '1', status: 'bad' },
    { label: 'T. de 1° respuesta', value: '7 min', status: 'good' },
    { label: 'Tareas pendientes client', value: '15', status: 'bad' },
    { label: 'T. de respuesta medio', value: '94 min', status: 'bad' },
    { label: 'Calidad de seguimiento', value: 'Malo', status: 'bad' },
    { label: 'Sugerencia de propiedades', value: '3', status: 'warning' },
    { label: 'Tasa de visita', value: '10%', status: 'good' },
    { label: 'Tasa de oferta', value: '0%', status: 'bad' },
    { label: 'Tareas pendientes prop', value: '93', status: 'bad' },
    { label: 'Inventario en venta', value: '86%', status: 'good' },
    { label: 'Inventario', value: '203', status: 'good' },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Métricas del Equipo</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Sugerencia Banner */}
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-2xl">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <p className="text-sm text-yellow-800 font-medium">
            Mejora los niveles de métricas que tienes bajo el promedio
          </p>
        </div>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 hover:scale-105 transition-all duration-200"
          >
            <p className="text-xs text-gray-600 mb-1">{metric.label}</p>
            <p
              className={`text-2xl font-bold ${
                metric.status === 'good'
                  ? 'text-green-600'
                  : metric.status === 'warning'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
