// /app/dashboard/analytics/page.tsx
'use client'

import { DashboardKPIs } from '@/components/analytics/DashboardKPIs'
import { FunnelChart } from '@/components/analytics/FunnelChart'
import { LeaderboardTable } from '@/components/analytics/LeaderboardTable'

export default function AnalyticsPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Analytics & Reportes</h1>
                <div className="text-sm text-gray-500">
                    Última actualización: {new Date().toLocaleTimeString()}
                </div>
            </div>

            <DashboardKPIs />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
                <FunnelChart />
                <LeaderboardTable />
            </div>
        </div>
    )
}
