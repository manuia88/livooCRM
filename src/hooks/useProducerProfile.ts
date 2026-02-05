'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface ProducerProfile {
  id: string
  full_name: string
  email: string | null
  avatar_url: string | null
  phone?: string | null
}

export function useProducerProfile(producerId: string | null) {
  const supabase = createClient()

  return useQuery<ProducerProfile | null>({
    queryKey: ['producer-profile', producerId],
    queryFn: async () => {
      if (!producerId) return null
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, avatar_url, phone')
        .eq('id', producerId)
        .single()
      if (error || !data) return null
      return data
    },
    enabled: !!producerId,
  })
}
