// /src/hooks/useDashboard.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export function useDashboardSummary() {
    return useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")

            // Fetch profile for name and level
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            // Fetch metrics (reuse analytics logic or dedicated RPC)
            // For now, we'll mock or simple fetch
            const { count: activeProperties } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'disponible')
                .eq('producer_id', user.id)

            const { count: pendingTasks } = await supabase
                .from('tasks')
                .select('*', { count: 'exact', head: true })
                .eq('assigned_to', user.id)
                .eq('status', 'pendiente')

            return {
                user: {
                    name: profile?.first_name || user.email?.split('@')[0],
                    level: profile?.role || 'Agente', // Mock level
                    progress: 75 // Mock progress to next level
                },
                metrics: {
                    activeProperties: activeProperties || 0,
                    pendingTasks: pendingTasks || 0,
                    closedDeals: 0 // Mock, requires complex query
                }
            }
        }
    })
}

export function usePriorityActions() {
    return useQuery({
        queryKey: ['dashboard-priority-actions'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            // Example actions: Overdue tasks
            const { data: overdueTasks } = await supabase
                .from('tasks')
                .select('*')
                .eq('assigned_to', user.id)
                .eq('status', 'vencida')
                .limit(3)

            const actions = overdueTasks?.map(task => ({
                id: task.id,
                type: 'overdue_task',
                title: 'Tarea Vencida',
                description: task.title,
                priority: 'high',
                actionUrl: '/backoffice/tasks'
            })) || []

            // Add mock "Complete Profile" action if needed
            if (actions.length === 0) {
                actions.push({
                    id: 'complete-profile',
                    type: 'system',
                    title: 'Completa tu Perfil',
                    description: 'Sube tu foto para generar confianza.',
                    priority: 'medium',
                    actionUrl: '/backoffice/configuracion'
                })
            }

            return actions
        }
    })
}
