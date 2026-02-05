'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from './useCurrentUser'

export interface AgencyUser {
  id: string
  full_name: string
  email: string | null
  avatar_url: string | null
  role: string
}

export function useAgencyUsers() {
  const supabase = createClient()
  const { data: currentUser } = useCurrentUser()

  return useQuery<AgencyUser[]>({
    queryKey: ['agency-users', currentUser?.agency_id],
    queryFn: async () => {
      if (!currentUser?.agency_id) return []

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, avatar_url, role')
        .eq('agency_id', currentUser.agency_id)
        .eq('is_active', true)
        .order('full_name')

      if (error) throw error
      return data ?? []
    },
    enabled: !!currentUser?.agency_id,
  })
}
