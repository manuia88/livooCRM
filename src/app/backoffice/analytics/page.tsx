// /app/dashboard/analytics/page.tsx
'use client'

import { PageContainer } from '@/components/backoffice/PageContainer'
import { DashboardKPIs } from '@/components/analytics/DashboardKPIs'
import { FunnelChart } from '@/components/analytics/FunnelChart'
import { LeaderboardTable } from '@/components/analytics/LeaderboardTable'
import { TrendingUp } from 'lucide-react'

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
