'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { PageContainer } from '@/components/backoffice/PageContainer'
import { DashboardKPIs } from '@/components/analytics/DashboardKPIs'
import { TrendingUp, Award, MapPin, Activity } from 'lucide-react'

const FunnelChart = dynamic(
  () => import('@/components/analytics/FunnelChart').then((mod) => mod.FunnelChart),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-50 animate-pulse rounded-2xl" />,
  }
)

const LeaderboardTable = dynamic(
  () => import('@/components/analytics/LeaderboardTable').then((mod) => mod.LeaderboardTable),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-50 animate-pulse rounded-2xl" />,
  }
)

const PropertiesTrendChart = dynamic(
  () => import('@/components/dashboard/PropertiesTrendChart'),
  {
    ssr: false,
    loading: () => <div className="h-[300px] bg-gray-50 animate-pulse rounded-lg" />,
  }
)

const SalesPipelineChart = dynamic(
  () => import('@/components/dashboard/SalesPipelineChart'),
  {
    ssr: false,
    loading: () => <div className="h-[300px] bg-gray-50 animate-pulse rounded-lg" />,
  }
)

const TopAgentsTable = dynamic(
  () => import('@/components/dashboard/TopAgentsTable'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-50 animate-pulse rounded-lg" />
        ))}
      </div>
    ),
  }
)

const RecentActivity = dynamic(
  () => import('@/components/dashboard/RecentActivity'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-9 h-9 bg-gray-50 animate-pulse rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-50 animate-pulse rounded w-3/4" />
              <div className="h-3 bg-gray-50 animate-pulse rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    ),
  }
)

const PropertiesHeatMap = dynamic(
  () => import('@/components/dashboard/PropertiesHeatMap'),
  {
    ssr: false,
    loading: () => <div className="h-96 bg-gray-50 animate-pulse rounded-lg" />,
  }
)

export default function AnalyticsPage() {
  return (
    <PageContainer
      title="Analytics & Reportes"
      subtitle={`Última actualización: ${new Date().toLocaleTimeString()}`}
      icon={TrendingUp}
      className="max-w-7xl mx-auto"
    >
      {/* KPI Cards */}
      <DashboardKPIs />

      {/* Charts: Property Trends + Sales Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Propiedades - Últimos 30 días
          </h3>
          <PropertiesTrendChart />
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Pipeline de Ventas
          </h3>
          <SalesPipelineChart />
        </div>
      </div>

      {/* Funnel + Leaderboard (existing) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px] mt-6">
        <FunnelChart />
        <LeaderboardTable />
      </div>

      {/* Top Agents + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-600" />
            <h3 className="text-base font-semibold text-gray-900">
              Top Performers (Este mes)
            </h3>
          </div>
          <TopAgentsTable />
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-semibold text-gray-900">
              Actividad Reciente
            </h3>
          </div>
          <RecentActivity />
        </div>
      </div>

      {/* Properties Heat Map */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-5 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-red-600" />
          <h3 className="text-base font-semibold text-gray-900">
            Mapa de Propiedades
          </h3>
        </div>
        <PropertiesHeatMap />
      </div>
    </PageContainer>
  )
}
