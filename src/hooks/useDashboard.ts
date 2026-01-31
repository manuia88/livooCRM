// src/hooks/useDashboard.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from './useCurrentUser'

export interface DashboardSummary {
    summary: {
        user_level: string
        objective: {
            period: string
            target: number
            current: number
            percentage: number
        }
    }
    user: {
        id: string
        name: string
        avatar: string
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

            // Transformar para que coincida con lo que espera page.tsx
            return {
                summary: {
                    user_level: data.level || 'Broker Inicial',
                    objective: {
                        period: data.objective?.period || 'Mensual',
                        target: data.objective?.target || 0,
                        current: data.objective?.current || 0,
                        percentage: data.objective?.percentage || 0
                    }
                },
                user: {
                    id: data.user?.id || currentUser.id,
                    name: data.user?.full_name || currentUser.full_name,
                    avatar: currentUser.avatar_url || '/avatars/user.jpg' // Usamos avatar del perfil
                }
            } as DashboardSummary
        },
        enabled: !!currentUser,
        staleTime: 60 * 1000, // 1 minuto
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
        staleTime: 30 * 1000, // 30 segundos
    })
}

/**
 * Hook para obtener métricas globales de la agencia (solo admin/director)
 */
export function useAgencyMetrics() {
    const supabase = createClient()
    const { data: currentUser } = useCurrentUser()

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'director'

    return useQuery<AgencyMetrics | null>({
        queryKey: ['agency-metrics', currentUser?.agency_id],
        queryFn: async () => {
            if (!currentUser || !isAdmin) return null

            // Obtener métricas globales de la agencia
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
                console.error('Error fetching agency metrics')
                throw new Error('Error fetching metrics')
            }

            const totalSales = operations?.reduce((sum, op) => sum + Number(op.sale_price), 0) || 0

            // Obtener performance por asesor
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

                    // Obtener nivel del asesor
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
        staleTime: 2 * 60 * 1000, // 2 minutos
    })
}

/**
 * Hook para obtener métricas de un asesor específico (para vista admin)
 */
export function useAgentMetrics(agentId?: string) {
    const supabase = createClient()
    const { data: currentUser } = useCurrentUser()

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'director'

    return useQuery<DashboardSummary | null>({
        queryKey: ['agent-metrics', agentId],
        queryFn: async () => {
            if (!agentId || !isAdmin) return null

            const { data, error } = await supabase
                .rpc('get_dashboard_summary', {
                    p_user_id: agentId
                })

            if (error) {
                console.error('Error fetching agent metrics:', error)
                throw error
            }

            return {
                summary: {
                    user_level: data.level || 'Broker Inicial',
                    objective: data.objective
                },
                user: {
                    id: data.user.id,
                    name: data.user.full_name,
                    avatar: '/avatars/user.jpg'
                }
            } as DashboardSummary
        },
        enabled: !!agentId && isAdmin,
        staleTime: 60 * 1000, // 1 minuto
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
 * Hook para obtener lista de asesores de la agencia (para dropdown admin)
 */
export function useAgencyAgents() {
    const supabase = createClient()
    const { data: currentUser } = useCurrentUser()

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'director'

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
