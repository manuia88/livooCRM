'use client'

import { useDashboardSummary, usePriorityActions } from '@/hooks/useDashboard'
import { UserHeader } from '@/components/dashboard/UserHeader'
import { PriorityWidget } from '@/components/dashboard/PriorityWidget'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ConversationsPanel } from '@/components/dashboard/ConversationsPanel'
import { DashboardKPIs } from '@/components/analytics/DashboardKPIs'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardInicioPage() {
    const { data: summaryData, isLoading: isLoadingSummary } = useDashboardSummary()
    const { data: priorityActions, isLoading: isLoadingActions } = usePriorityActions()

    if (isLoadingSummary || isLoadingActions) {
        return (
            <div className="space-y-6 p-8 bg-[#FAF8F3]">
                <Skeleton className="h-32 w-full rounded-xl bg-gray-200" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="h-64 rounded-xl bg-gray-200" />
                        <Skeleton className="h-96 rounded-xl bg-gray-200" />
                    </div>
                    <div className="space-y-8">
                        <Skeleton className="h-80 rounded-xl bg-gray-200" />
                        <Skeleton className="h-80 rounded-xl bg-gray-200" />
                    </div>
                </div>
            </div>
        )
    }

    const summary = summaryData?.summary || {
        user_level: 'Agente Livoo',
        objective: { target: 1000000, current: 0, percentage: 0, period: 'Mensual' }
    }
    const user = summaryData?.user || { name: 'Usuario' }

    return (
        <div className="min-h-screen bg-[#FAF8F3]/50 pb-12">
            {/* Header Section with Livoo Gradient */}
            <UserHeader user={user} summary={summary} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content (Left/Center) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Priority Actions Widget */}
                        <section className="relative z-10">
                            <PriorityWidget actions={priorityActions} />
                        </section>

                        {/* Real-time KPIs Section */}
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-[#2C3E2C]">Métricas de Rendimiento</h2>
                                <span className="text-sm text-[#B8975A] font-medium">Actualizado ahora</span>
                            </div>
                            <DashboardKPIs />
                        </section>

                        {/* Quick Navigation / Common Actions */}
                        <section>
                            <QuickActions />
                        </section>
                    </div>

                    {/* Sidebar Content (Right) */}
                    <div className="space-y-8">
                        {/* Messages & Conversations Panel */}
                        <section className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-[#2C3E2C]">Conversaciones</h2>
                                <span className="bg-[#B8975A]/10 text-[#B8975A] text-xs font-bold px-2 py-1 rounded-full">
                                    Nuevas
                                </span>
                            </div>
                            <ConversationsPanel />
                        </section>

                        {/* Pro-tip or System Message */}
                        <div className="p-6 bg-gradient-to-br from-[#2C3E2C] to-[#1F2D1F] rounded-2zl text-white shadow-lg">
                            <h3 className="font-bold text-lg mb-2 text-[#B8975A]">Livoo Pro Tip</h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                Mantén tu "Health Score" por encima de 85 para aparecer en las recomendaciones destacadas de la red Livoo.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
