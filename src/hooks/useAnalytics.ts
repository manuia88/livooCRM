// /src/hooks/useAnalytics.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

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
            const now = new Date()
            const month = now.getMonth() + 1
            const year = now.getFullYear()

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            // Get agency_id
            const { data: profile } = await supabase.from('user_profiles').select('agency_id').eq('id', user.id).single()
            if (!profile) return []

            const { data, error } = await supabase
                .rpc('get_agent_leaderboard', {
                    p_agency_id: profile.agency_id,
                    p_month: month,
                    p_year: year
                })

            if (error) throw error
            return data as LeaderboardItem[]
        }
    })
}

export function useFunnel() {
    return useQuery({
        queryKey: ['funnel'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            const { data: profile } = await supabase.from('user_profiles').select('agency_id').eq('id', user.id).single()
            if (!profile) return []

            const { data, error } = await supabase
                .rpc('get_pipeline_funnel', {
                    p_agency_id: profile.agency_id
                })

            if (error) throw error
            return data as FunnelItem[]
        }
    })
}

export function useKPIs() {
    return useQuery({
        queryKey: ['kpis'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const { data: profile } = await supabase.from('user_profiles').select('agency_id').eq('id', user.id).single()
            if (!profile) return null

            const agencyId = profile.agency_id

            // Get properties count
            const { count: propertiesCount } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('agency_id', agencyId)
                .eq('status', 'disponible')

            // Get leads count (last 30 days)
            const { count: leadsCount } = await supabase
                .from('contacts')
                .select('*', { count: 'exact', head: true })
                .eq('agency_id', agencyId)
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

            // Get sales volume (last 30 days)
            const { data: sales } = await supabase
                .from('properties')
                .select('sale_price')
                .eq('agency_id', agencyId)
                .eq('status', 'vendida')
                .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

            const totalSales = sales?.reduce((acc, curr) => acc + (curr.sale_price || 0), 0) || 0

            return {
                activeProperties: propertiesCount || 0,
                newLeads: leadsCount || 0,
                salesVolume: totalSales,
                propertyTrend: 0, // TODO: Calculate actual trend
                leadTrend: 0, // TODO: Calculate actual trend
                salesTrend: 0 // TODO: Calculate actual trend
            }
        }
    })
}
