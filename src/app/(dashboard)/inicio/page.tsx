'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { UserLevelCard } from '@/components/dashboard/UserLevelCard'
import { PriorityActions } from '@/components/dashboard/PriorityActions'
import { DashboardKPIs } from '@/components/analytics/DashboardKPIs'
import { Button } from '@/components/ui/button'
import { Plus, Search, Calendar } from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
    user_level: string
    objective: {
        target: number
        current: number
        percentage: number
        period: string
    }
    priority_actions_count: number
    pending_tasks_count: number
    active_properties_count: number
    unread_conversations_count: number
    priority_actions: any[] // We will fetch this separately or mock it for now since fetchRpc usually gets the JSON summary, but priority actions list needs a separate query or we update the RPC? 
    // The RPC get_dashboard_summary returns counts, not list.
    // We need to fetch the list of priority actions separately.
}

export default function InicioPage() {
    const [summary, setSummary] = useState<DashboardData | null>(null)
    const [priorityActions, setPriorityActions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [userName, setUserName] = useState('')

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const supabase = createClient()

                // Get user
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // Get name (from metadata or profile)
                setUserName(user.user_metadata?.full_name || 'Usuario')

                // Call RPC for summary
                const { data: summaryData, error: summaryError } = await supabase.rpc('get_dashboard_summary', {
                    p_user_id: user.id
                })

                if (summaryError) {
                    console.error('Error fetching dashboard summary:', summaryError)
                }

                if (summaryData) {
                    setSummary(summaryData as DashboardData)
                }

                // Fetch priority actions list (limited to top 5)
                const { data: actionsData } = await supabase
                    .from('priority_actions')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'pending')
                    .order('priority_level', { ascending: false })
                    .limit(5)

                if (actionsData) {
                    setPriorityActions(actionsData)
                }

            } catch (error) {
                console.error("Error:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboard()
    }, [])

    if (isLoading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div></div>
    }

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hola, {userName}</h1>
                    <p className="text-gray-500 mt-1">Aquí tienes el resumen de tu actividad hoy.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/properties/new">
                        <Button className="bg-[#2C3E2C] hover:bg-[#1F2D1F]">
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Propiedad
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* User Level & Objectives */}
                    {summary && (
                        <UserLevelCard
                            level={summary.user_level}
                            objective={summary.objective}
                        />
                    )}

                    {/* KPIs Wrapper (Reusing existing components or custom) */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Métricas Clave</h2>
                        {/* We use the custom DashboardKPIs component if it works, or we pass data manually */}
                        {/* Assuming DashboardKPIs fetches its own data internally via hooks, as seen in code */}
                        <DashboardKPIs />
                    </div>

                    {/* Pending Tasks Quick View (Optional) */}

                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-8">
                    {/* Priority Actions */}
                    <PriorityActions actions={priorityActions} />

                    {/* Quick Shortcuts */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Accesos Rápidos</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Link href="/dashboard/properties">
                                    <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-center cursor-pointer border border-gray-100">
                                        <Search className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">Buscar Propiedad</span>
                                    </div>
                                </Link>
                                <Link href="/dashboard/calendar">
                                    <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-center cursor-pointer border border-gray-100">
                                        <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">Mi Agenda</span>
                                    </div>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
