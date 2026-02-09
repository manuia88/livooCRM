'use client'

import { Award, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AgentWithMetrics {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  properties: number
  sold: number
  leads: number
  score: number
}

export default function TopAgentsTable() {
  const supabase = createClient()
  const { data: currentUser } = useCurrentUser()

  const { data: agents, isLoading } = useQuery<AgentWithMetrics[]>({
    queryKey: ['top-agents', currentUser?.agency_id],
    queryFn: async () => {
      if (!currentUser) return []

      const firstDayOfMonth = new Date()
      firstDayOfMonth.setDate(1)
      firstDayOfMonth.setHours(0, 0, 0, 0)

      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, avatar_url, role')
        .eq('agency_id', currentUser.agency_id)
        .in('role', ['agent', 'asesor'])
        .eq('is_active', true)

      if (!users || users.length === 0) return []

      const agentsWithMetrics = await Promise.all(
        users.map(async (user) => {
          const [propResult, soldResult, leadsResult] = await Promise.all([
            supabase
              .from('properties')
              .select('id', { count: 'exact', head: true })
              .eq('created_by', user.id)
              .gte('created_at', firstDayOfMonth.toISOString())
              .is('deleted_at', null),
            supabase
              .from('properties')
              .select('id', { count: 'exact', head: true })
              .eq('created_by', user.id)
              .in('status', ['sold', 'vendida'])
              .gte('updated_at', firstDayOfMonth.toISOString())
              .is('deleted_at', null),
            supabase
              .from('contacts')
              .select('id', { count: 'exact', head: true })
              .eq('assigned_to', user.id)
              .gte('created_at', firstDayOfMonth.toISOString())
              .is('deleted_at', null),
          ])

          const properties = propResult.count || 0
          const sold = soldResult.count || 0
          const leads = leadsResult.count || 0

          return {
            id: user.id,
            full_name: user.full_name,
            email: user.email || '',
            avatar_url: user.avatar_url,
            properties,
            sold,
            leads,
            score: properties * 2 + sold * 10 + leads,
          }
        })
      )

      return agentsWithMetrics.sort((a, b) => b.score - a.score).slice(0, 5)
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400 text-sm">
        No hay datos de agentes para este mes
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {agents.map((agent, index) => {
        const initials = agent.full_name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()

        return (
          <div
            key={agent.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {/* Ranking */}
            <div className="flex-shrink-0">
              {index === 0 ? (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
                  <Award className="w-4.5 h-4.5 text-white" />
                </div>
              ) : index === 1 ? (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-white">2</span>
                </div>
              ) : index === 2 ? (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-white">3</span>
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-500">{index + 1}</span>
                </div>
              )}
            </div>

            {/* Agent Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-8 w-8">
                {agent.avatar_url && <AvatarImage src={agent.avatar_url} />}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{agent.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{agent.email}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="hidden sm:flex gap-5 text-xs">
              <div className="text-center">
                <p className="font-bold text-blue-600">{agent.properties}</p>
                <p className="text-gray-500">Captadas</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-green-600">{agent.sold}</p>
                <p className="text-gray-500">Vendidas</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-purple-600">{agent.leads}</p>
                <p className="text-gray-500">Leads</p>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{agent.score}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
