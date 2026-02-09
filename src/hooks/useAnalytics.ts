'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface LeaderboardItem {
    agent_id: string
    agent_name: string
    avatar_url: string
    sales_volume: number
    deals_closed: number
    new_leads: number
    tasks_completed: number
    conversion_rate: number
}

export interface FunnelItem {
    stage: string
    count: number
    value: number
}

export function useLeaderboard() {
    return useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const supabase = createClient()
            const now = new Date()
            const month = now.getMonth() + 1
            const year = now.getFullYear()

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('agency_id')
                .eq('id', user.id)
                .single()
            if (!profile) return []

            const { data, error } = await supabase
                .rpc('get_agent_leaderboard', {
                    p_agency_id: profile.agency_id,
                    p_month: month,
                    p_year: year
                })

            if (error) throw error
            return data as LeaderboardItem[]
        },
        staleTime: 2 * 60 * 1000,
    })
}

export function useFunnel() {
    return useQuery({
        queryKey: ['funnel'],
        queryFn: async () => {
            const supabase = createClient()

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('agency_id')
                .eq('id', user.id)
                .single()
            if (!profile) return []

            const { data, error } = await supabase
                .rpc('get_pipeline_funnel', {
                    p_agency_id: profile.agency_id
                })

            if (error) throw error
            return data as FunnelItem[]
        },
        staleTime: 2 * 60 * 1000,
    })
}

export function useKPIs() {
    return useQuery({
        queryKey: ['kpis'],
        queryFn: async () => {
            const supabase = createClient()

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('agency_id')
                .eq('id', user.id)
                .single()
            if (!profile) return null

            const agencyId = profile.agency_id
            const now = Date.now()
            const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
            const thirtyDaysAgo = new Date(now - thirtyDaysMs).toISOString()
            const sixtyDaysAgo = new Date(now - 2 * thirtyDaysMs).toISOString()

            // Current period and previous period queries in parallel
            const [
                currentProps,
                prevProps,
                currentLeads,
                prevLeads,
                currentSales,
                prevSales,
            ] = await Promise.all([
                // Active properties now
                supabase
                    .from('properties')
                    .select('id', { count: 'exact', head: true })
                    .eq('agency_id', agencyId)
                    .in('status', ['disponible', 'active'])
                    .is('deleted_at', null),
                // Properties created in previous 30-day window
                supabase
                    .from('properties')
                    .select('id', { count: 'exact', head: true })
                    .eq('agency_id', agencyId)
                    .gte('created_at', sixtyDaysAgo)
                    .lt('created_at', thirtyDaysAgo)
                    .is('deleted_at', null),
                // Leads last 30 days
                supabase
                    .from('contacts')
                    .select('id', { count: 'exact', head: true })
                    .eq('agency_id', agencyId)
                    .gte('created_at', thirtyDaysAgo)
                    .is('deleted_at', null),
                // Leads previous 30 days
                supabase
                    .from('contacts')
                    .select('id', { count: 'exact', head: true })
                    .eq('agency_id', agencyId)
                    .gte('created_at', sixtyDaysAgo)
                    .lt('created_at', thirtyDaysAgo)
                    .is('deleted_at', null),
                // Sales last 30 days
                supabase
                    .from('properties')
                    .select('sale_price')
                    .eq('agency_id', agencyId)
                    .in('status', ['vendida', 'sold'])
                    .gte('updated_at', thirtyDaysAgo),
                // Sales previous 30 days
                supabase
                    .from('properties')
                    .select('sale_price')
                    .eq('agency_id', agencyId)
                    .in('status', ['vendida', 'sold'])
                    .gte('updated_at', sixtyDaysAgo)
                    .lt('updated_at', thirtyDaysAgo),
            ])

            const currentSalesTotal = currentSales.data?.reduce(
                (acc, curr) => acc + (curr.sale_price || 0), 0
            ) || 0
            const prevSalesTotal = prevSales.data?.reduce(
                (acc, curr) => acc + (curr.sale_price || 0), 0
            ) || 0

            const calcTrend = (current: number, previous: number): number => {
                if (previous === 0) return current > 0 ? 100 : 0
                return Math.round(((current - previous) / previous) * 100)
            }

            return {
                activeProperties: currentProps.count || 0,
                newLeads: currentLeads.count || 0,
                salesVolume: currentSalesTotal,
                propertyTrend: calcTrend(currentProps.count || 0, prevProps.count || 0),
                leadTrend: calcTrend(currentLeads.count || 0, prevLeads.count || 0),
                salesTrend: calcTrend(currentSalesTotal, prevSalesTotal),
            }
        },
        staleTime: 2 * 60 * 1000,
    })
}
