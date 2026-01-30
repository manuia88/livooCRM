import { createClient } from '@/utils/supabase/server'

/**
 * Get user profile with role and agency information
 */
export async function getUserProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch from user_profiles table
    const { data } = await supabase
        .from('user_profiles')
        .select('role, agency_id, full_name')
        .eq('id', user.id)
        .single()

    // Return profile with fallback to user metadata
    return {
        id: user.id,
        email: user.email,
        full_name: data?.full_name || user.user_metadata?.full_name || 'Usuario',
        role: data?.role || 'agent',
        agency_id: data?.agency_id
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

    // Check if user has required role
    if (profile.role && !allowedRoles.includes(profile.role)) {
        throw new Error('No tienes permisos para esta acción')
    }

    return profile
}
