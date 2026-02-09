'use client'

import {
  Home,
  UserPlus,
  CheckSquare,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface ActivityItem {
  type: 'property' | 'contact' | 'task'
  icon: LucideIcon
  text: string
  timestamp: string
}

function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins}m`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `Hace ${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Ayer'
  return `Hace ${diffDays}d`
}

const TYPE_STYLES = {
  property: 'bg-blue-100 text-blue-600',
  contact: 'bg-green-100 text-green-600',
  task: 'bg-purple-100 text-purple-600',
} as const

export default function RecentActivity() {
  const supabase = createClient()
  const { data: currentUser } = useCurrentUser()

  const { data: activities, isLoading } = useQuery<ActivityItem[]>({
    queryKey: ['recent-activity', currentUser?.agency_id],
    queryFn: async () => {
      if (!currentUser) return []

      const [propertiesRes, contactsRes, tasksRes] = await Promise.all([
        supabase
          .from('properties')
          .select('id, title, created_at')
          .eq('agency_id', currentUser.agency_id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('contacts')
          .select('id, first_name, last_name, created_at')
          .eq('agency_id', currentUser.agency_id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('tasks')
          .select('id, title, status, updated_at')
          .eq('agency_id', currentUser.agency_id)
          .eq('status', 'completed')
          .order('updated_at', { ascending: false })
          .limit(5),
      ])

      const combined: ActivityItem[] = [
        ...(propertiesRes.data?.map((p) => ({
          type: 'property' as const,
          icon: Home,
          text: `Nueva propiedad: ${p.title || 'Sin título'}`,
          timestamp: p.created_at,
        })) || []),
        ...(contactsRes.data?.map((c) => ({
          type: 'contact' as const,
          icon: UserPlus,
          text: `Nuevo contacto: ${c.first_name}${c.last_name ? ' ' + c.last_name : ''}`,
          timestamp: c.created_at,
        })) || []),
        ...(tasksRes.data?.map((t) => ({
          type: 'task' as const,
          icon: CheckSquare,
          text: `Tarea completada: ${t.title || 'Sin título'}`,
          timestamp: t.updated_at,
        })) || []),
      ]

      return combined
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
    },
    enabled: !!currentUser,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-9 h-9 bg-gray-100 animate-pulse rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
              <div className="h-3 bg-gray-100 animate-pulse rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400 text-sm">
        Sin actividad reciente
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const Icon = activity.icon

        return (
          <div key={index} className="flex gap-3 group">
            <div className="flex-shrink-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${TYPE_STYLES[activity.type]}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex-1 min-w-0 py-0.5">
              <p className="text-sm text-gray-800 truncate group-hover:text-gray-900">
                {activity.text}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{getTimeAgo(activity.timestamp)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
