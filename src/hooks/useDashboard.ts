// src/hooks/useDashboard.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

export function useDashboardSummary() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['dashboard', 'summary'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .rpc('get_dashboard_summary', { p_user_id: user.id })

            if (error) throw error
            return data
        },
        staleTime: 60000, // 1 minuto
    })
}

export function usePriorityActions() {
    const supabase = createClient()

    return useQuery({
        queryKey: ['priority-actions'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            // Generar acciones automáticamente
            await supabase.rpc('generate_priority_actions', { p_user_id: user.id })

            // Obtener acciones pendientes
            const { data, error } = await supabase
                .from('priority_actions')
                .select('*')
                .eq('status', 'pending')
                .order('priority_level', { ascending: false })
                .limit(10)

            if (error) throw error
            return data
        },
        staleTime: 30000, // 30 segundos
    })
}

export function useCompleteAction() {
    const queryClient = useQueryClient()
    const supabase = createClient()

    return useMutation({
        mutationFn: async (actionId: string) => {
            const { data, error } = await supabase
                .from('priority_actions')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', actionId)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['priority-actions'] })
        }
    })
}
