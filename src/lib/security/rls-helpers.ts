import { createClient } from '@/utils/supabase/server'

/**
 * Get user profile with role and agency information
 */
export async function getUserProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // TODO: Once user_profiles table is created in Supabase
    // const { data } = await supabase
    //   .from('user_profiles')
    //   .select('role, agency_id, full_name')
    //   .eq('id', user.id)
    //   .single()

    // For now, return basic user info
    return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'Usuario',
        // role: data?.role || 'agent',
        // agency_id: data?.agency_id
    }
}

/**
 * Require specific roles for access
 */
export async function requireRole(allowedRoles: string[]) {
    const profile = await getUserProfile()

    if (!profile) {
        throw new Error('No autenticado')
    }

    // TODO: Uncomment when user_profiles exists
    // if (!allowedRoles.includes(profile.role)) {
    //   throw new Error('No tienes permisos para esta acción')
    // }

    return profile
}
