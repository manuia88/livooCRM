// /app/backoffice/page.tsx
'use client'

import { useDashboardSummary, usePriorityActions } from '@/hooks/useDashboard'
import { UserHeader } from '@/components/dashboard/UserHeader'
import { PriorityWidget } from '@/components/dashboard/PriorityWidget'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ConversationsPanel } from '@/components/dashboard/ConversationsPanel'
import { UserLevelCard } from '@/components/dashboard/UserLevelCard'
import { DashboardKPIs } from '@/components/analytics/DashboardKPIs'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { TrendingUp, Award, MessageCircle } from 'lucide-react'

export default function BackofficePage() {
    const { data: summaryData, isLoading: isLoadingSummary } = useDashboardSummary()
    const { data: priorityActions, isLoading: isLoadingActions } = usePriorityActions()

    if (isLoadingSummary || isLoadingActions) {
        return (
            <div className="min-h-screen bg-[#FAFAFA]">
                <div className="max-w-[1400px] mx-auto px-8 py-12 space-y-16">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Skeleton className="h-48 rounded-2xl" />
                        <Skeleton className="h-48 rounded-2xl" />
                        <Skeleton className="h-48 rounded-2xl" />
                    </div>
                    <Skeleton className="h-96 rounded-2xl" />
                </div>
            </div>
        )
    }

    const summary = summaryData?.summary || {
        user_level: 'Broker Profesional',
        objective: { target: 1000000, current: 0, percentage: 0, period: 'Mensual' }
    }
    const user = {
        name: summaryData?.user?.name || 'Usuario',
        avatar: summaryData?.user?.avatar || '/avatars/user.jpg'
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <UserHeader user={user} summary={summary} />

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-8 py-16 space-y-16">
                {/* KPI Metrics */}
                <section>
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                            Métricas de Rendimiento
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Basado en tus últimos 30 días
                        </p>
                    </div>
                    <DashboardKPIs />
                </section>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: 2/3 width */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* User Level Progress */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <UserLevelCard level={summary.user_level} objective={summary.objective} />
                        </motion.div>

                        {/* Priority Actions */}
                        <PriorityWidget actions={priorityActions} />

                        {/* Quick Actions */}
                        <QuickActions />
                    </div>

                    {/* Right Column: 1/3 width */}
                    <div className="space-y-8">
                        {/* Conversations */}
                        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <MessageCircle className="w-5 h-5 text-gray-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">Mensajes</h2>
                                </div>
                                <Badge className="bg-gray-100 text-gray-600 border-none text-xs font-medium px-2.5 py-0.5">
                                    Recientes
                                </Badge>
                            </div>
                            <ConversationsPanel />
                        </section>

                        {/* Insight Card */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="p-8 bg-[#2C3E2C] rounded-2xl text-white relative overflow-hidden"
                        >
                            <Award className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5" />
                            <div className="relative z-10 space-y-4">
                                <div className="inline-block px-3 py-1 bg-[#B8975A] text-white text-xs font-semibold rounded-full">
                                    Consejo
                                </div>
                                <h3 className="font-semibold text-xl tracking-tight leading-snug">
                                    Optimiza tu tiempo de respuesta
                                </h3>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    Los asesores que responden en menos de 5 minutos tienen un 400% más de probabilidad de cierre.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
