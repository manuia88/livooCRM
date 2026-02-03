// src/hooks/useDashboard.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from './useCurrentUser'

/**
 * Interface for the Dashboard Summary returned by RPC
 */
export interface DashboardSummary {
    level: string
    objective: {
        period: string
        target: number
        current: number
        percentage: number
    }
    metrics: {
        properties_active: number
        new_leads: number
        sales_this_month: number
        tasks_pending: number
    }
    user: {
        id: string
        full_name: string
        avatar_url: string
    }
}

interface AgencyMetrics {
    total_properties: number
    total_leads: number
    total_sales: number
    active_agents: number
    agents_performance: Array<{
        user_id: string
        full_name: string
        properties_count: number
        leads_count: number
        sales_amount: number
        level: string
    }>
}

/**
 * Hook para obtener el resumen del dashboard del usuario actual
 * Usa la función SQL get_dashboard_summary()
 */
export function useDashboardSummary() {
    const supabase = createClient()
    const { data: currentUser } = useCurrentUser()

    return useQuery<DashboardSummary | null>({
        queryKey: ['dashboard-summary', currentUser?.id],
        queryFn: async () => {
            if (!currentUser) return null

            const { data, error } = await supabase
                .rpc('get_dashboard_summary', {
                    p_user_id: currentUser.id
                })

            if (error) {
                console.error('Error fetching dashboard summary:', error)
                throw error
            }

            // Return raw data as it matches the expectations of the new dashboard_page.tsx
            return data as DashboardSummary
        },
        enabled: !!currentUser,
        staleTime: 60 * 1000,
    })
}

/**
 * Hook para obtener las acciones prioritarias (pendientes) del usuario
 */
export function usePriorityActions() {
    const supabase = createClient()
    const { data: currentUser } = useCurrentUser()

    return useQuery({
        queryKey: ['priority-actions', currentUser?.id],
        queryFn: async () => {
            if (!currentUser) return []

            const { data, error } = await supabase
                .from('priority_actions')
                .select('*')
                .eq('user_id', currentUser.id)
                .eq('status', 'pending')
                .order('priority_level', { ascending: false })

            if (error) {
                console.error('Error fetching priority actions:', error)
                return []
            }

            return data
        },
        enabled: !!currentUser,
        staleTime: 30 * 1000,
    })
}

/**
 * Hook para obtener métricas globales de la agencia (solo admin/manager)
 */
export function useAgencyMetrics() {
    const supabase = createClient()
    const { data: currentUser } = useCurrentUser()

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager'

    return useQuery<AgencyMetrics | null>({
        queryKey: ['agency-metrics', currentUser?.agency_id],
        queryFn: async () => {
            if (!currentUser || !isAdmin) return null

            const { count: propCount, error: propError } = await supabase
                .from('properties')
                .select('id', { count: 'exact', head: true })
                .eq('agency_id', currentUser.agency_id)
                .in('status', ['disponible', 'apartado'])
                .is('deleted_at', null)

            const { count: leadsCount, error: leadsError } = await supabase
                .from('contacts')
                .select('id', { count: 'exact', head: true })
                .eq('agency_id', currentUser.agency_id)
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                .is('deleted_at', null)

            const { data: operations, error: opsError } = await supabase
                .from('operations')
                .select('sale_price')
                .eq('agency_id', currentUser.agency_id)
                .eq('status', 'completed')
                .gte('closing_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

            const { data: agents, error: agentsError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('agency_id', currentUser.agency_id)
                .eq('role', 'asesor')
                .eq('is_active', true)

            if (propError || leadsError || opsError || agentsError) {
                throw new Error('Error fetching metrics')
            }

            const totalSales = operations?.reduce((sum, op) => sum + Number(op.sale_price), 0) || 0

            const agentsPerformance = await Promise.all(
                (agents || []).map(async (agent) => {
                    const { count: propCount } = await supabase
                        .from('properties')
                        .select('id', { count: 'exact', head: true })
                        .eq('producer_id', agent.id)
                        .in('status', ['disponible', 'apartado'])
                        .is('deleted_at', null)

                    const { count: leadsCount } = await supabase
                        .from('contacts')
                        .select('id', { count: 'exact', head: true })
                        .eq('assigned_to', agent.id)
                        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                        .is('deleted_at', null)

                    const { data: agentOps } = await supabase
                        .from('operations')
                        .select('sale_price')
                        .eq('producer_id', agent.id)
                        .eq('status', 'completed')
                        .gte('closing_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

                    const agentSales = agentOps?.reduce((sum, op) => sum + Number(op.sale_price), 0) || 0

                    const { data: levelData } = await supabase
                        .rpc('calculate_user_level', { p_user_id: agent.id })

                    return {
                        user_id: agent.id,
                        full_name: agent.full_name,
                        properties_count: propCount || 0,
                        leads_count: leadsCount || 0,
                        sales_amount: agentSales,
                        level: levelData || 'Broker Inicial',
                    }
                })
            )

            return {
                total_properties: propCount || 0,
                total_leads: leadsCount || 0,
                total_sales: totalSales,
                active_agents: agents?.length || 0,
                agents_performance: agentsPerformance,
            }
        },
        enabled: !!currentUser && isAdmin,
        staleTime: 2 * 60 * 1000,
    })
}

/**
 * Hook para obtener métricas de un asesor específico
 */
export function useAgentMetrics(agentId?: string) {
    const supabase = createClient()
    const { data: currentUser } = useCurrentUser()
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager'

    return useQuery<DashboardSummary | null>({
        queryKey: ['agent-metrics', agentId],
        queryFn: async () => {
            if (!agentId || !isAdmin) return null

            const { data, error } = await supabase
                .rpc('get_dashboard_summary', { p_user_id: agentId })

            if (error) throw error
            return data as DashboardSummary
        },
        enabled: !!agentId && isAdmin,
        staleTime: 60 * 1000,
    })
}

/**
 * Hook para actualizar el objetivo mensual del usuario
 */
export function useUpdateObjective() {
    const queryClient = useQueryClient()
    const supabase = createClient()
    const { data: currentUser } = useCurrentUser()

    return useMutation({
        mutationFn: async ({ period, targetAmount }: { period: string; targetAmount: number }) => {
            if (!currentUser) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('user_objectives')
                .upsert({
                    user_id: currentUser.id,
                    agency_id: currentUser.agency_id,
                    period,
                    target_amount: targetAmount,
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
        },
    })
}

/**
 * Hook para obtener lista de asesores de la agencia
 */
export function useAgencyAgents() {
    const supabase = createClient()
    const { data: currentUser } = useCurrentUser()
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager'

    return useQuery({
        queryKey: ['agency-agents', currentUser?.agency_id],
        queryFn: async () => {
            if (!currentUser || !isAdmin) return []

            const { data, error } = await supabase
                .from('user_profiles')
                .select('id, full_name, email, avatar_url, role')
                .eq('agency_id', currentUser.agency_id)
                .eq('role', 'asesor')
                .eq('is_active', true)
                .order('full_name')

            if (error) throw error
            return data
        },
        enabled: !!currentUser && isAdmin,
    })
}
