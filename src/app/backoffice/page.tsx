// /app/backoffice/page.tsx
'use client'

import { useDashboardSummary, usePriorityActions } from '@/hooks/useDashboard'
import { UserHeader } from '@/components/dashboard/UserHeader'
import { PriorityWidget } from '@/components/dashboard/PriorityWidget'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ConversationsPanel } from '@/components/dashboard/ConversationsPanel'

export default function InicioPage() {
    const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
    const { data: priorityActions, isLoading: actionsLoading } = usePriorityActions()

    if (summaryLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header con saludo, nivel y objetivo */}
            <UserHeader summary={summary} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna principal - 2/3 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Widget de Prioridades */}
                        <PriorityWidget actions={priorityActions} />

                        {/* Accesos Rápidos */}
                        <QuickActions />
                    </div>

                    {/* Panel de conversaciones - 1/3 */}
                    <div className="lg:col-span-1">
                        <ConversationsPanel />
                    </div>
                </div>
            </div>
        </div>
    )
}
