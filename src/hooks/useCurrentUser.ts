// src/hooks/useCurrentUser.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { CurrentUser } from '@/types'

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

            // Intentar obtener perfil con agencia
            let profile = null
            let agency = null

            // Primera intentar: query completa con JOIN
            const { data: profileWithAgency, error: profileError } = await supabase
                .from('user_profiles')
                .select('*, agency:agencies(*)')
                .eq('id', user.id)
                .maybeSingle()

            // Si falla (ej: error 406 por RLS), intentar query sin JOIN
            if (profileError) {
                console.warn('Error fetching profile with agency (intentando sin JOIN):', profileError)
                
                const { data: basicProfile, error: basicError } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle()

                if (basicError) {
                    console.error('Error fetching basic profile:', basicError)
                    return null
                }

                profile = basicProfile

                // Intentar obtener agencia por separado
                if (profile?.agency_id) {
                    const { data: agencyData } = await supabase
                        .from('agencies')
                        .select('*')
                        .eq('id', profile.agency_id)
                        .maybeSingle()
                    
                    agency = agencyData
                }
            } else {
                profile = profileWithAgency
            }

            if (!profile) {
                console.error('User profile not found for user:', user.id)
                return null
            }

            // Combinar datos de auth.users con user_profiles
            return {
                ...profile,
                email: user.email || '',
                agency: agency || (profile as any).agency || null,
            } as CurrentUser
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
        retry: 2,
    })
}

/**
 * Hook para verificar si el usuario es Admin o Manager
 * Estos roles pueden ver TODO de su agencia
 */
export function useIsAdmin() {
    const { data: user } = useCurrentUser()
    return user?.role === 'admin' || user?.role === 'manager'
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
