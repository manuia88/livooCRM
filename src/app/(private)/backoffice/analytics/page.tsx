// /app/dashboard/analytics/page.tsx
'use client'

import dynamic from 'next/dynamic'
import { PageContainer } from '@/components/backoffice/PageContainer'
import { DashboardKPIs } from '@/components/analytics/DashboardKPIs'
import { TrendingUp } from 'lucide-react'

const FunnelChart = dynamic(() => import('@/components/analytics/FunnelChart').then(mod => mod.FunnelChart), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-50 animate-pulse rounded-2xl" />
})

const LeaderboardTable = dynamic(() => import('@/components/analytics/LeaderboardTable').then(mod => mod.LeaderboardTable), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-50 animate-pulse rounded-2xl" />
})

export default function AnalyticsPage() {
    return (
        <PageContainer
            title="Analytics & Reportes"
            subtitle={`Última actualización: ${new Date().toLocaleTimeString()}`}
            icon={TrendingUp}
            className="max-w-7xl mx-auto"
        >
            <DashboardKPIs />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px] mt-6">
                <FunnelChart />
                <LeaderboardTable />
            </div>
        </PageContainer>
    )
}
