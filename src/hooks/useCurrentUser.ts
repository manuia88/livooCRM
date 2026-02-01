// src/hooks/useCurrentUser.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface CurrentUser {
    id: string
    email: string
    full_name: string
    avatar_url: string | null
    phone: string | null
    role: 'admin' | 'director' | 'asesor'
    is_active: boolean
    agency_id: string
    agency: {
        id: string
        name: string
        slug: string
        email: string | null
        phone: string | null
    } | null
    created_at: string
    updated_at: string
}

/**
 * Hook para obtener el usuario actual con su agencia y rol
 * Se cachea por 5 minutos para evitar múltiples consultas
 */
export function useCurrentUser() {
    const supabase = createClient()

    return useQuery<CurrentUser | null>({
        queryKey: ['current-user'],
        queryFn: async () => {
            // Obtener usuario autenticado
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                return null
            }

            // Obtener perfil con agencia
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*, agency:agencies(*)')
                .eq('id', user.id)
                .maybeSingle()

            if (profileError) {
                console.error('Error fetching user profile:', profileError)
                return null
            }

            if (!profile) {
                console.error('User profile not found for user:', user.id)
                return null
            }

            return profile as CurrentUser
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
        retry: 1,
    })
}

/**
 * Hook para verificar si el usuario es Admin o Director
 * Estos roles pueden ver TODO de su agencia
 */
export function useIsAdmin() {
    const { data: user } = useCurrentUser()
    return user?.role === 'admin' || user?.role === 'director'
}

/**
 * Hook para obtener el agency_id del usuario actual
 */
export function useAgencyId() {
    const { data: user } = useCurrentUser()
    return user?.agency_id
}

/**
 * Hook para obtener el rol del usuario actual
 */
export function useUserRole() {
    const { data: user } = useCurrentUser()
    return user?.role
}
