import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

type AuditAction =
    | 'login'
    | 'logout'
    | 'register'
    | 'create_property'
    | 'update_property'
    | 'delete_property'
    | 'create_contact'
    | 'update_contact'
    | 'delete_contact'
    | 'send_message'

interface AuditLogParams {
    action: AuditAction
    resourceType?: string
    resourceId?: string
    oldValues?: any
    newValues?: any
}

/**
 * Log an audit event to the audit_logs table
 * Captures user, IP, user agent, and action details
 */
export async function logAudit(params: AuditLogParams) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            console.warn('[Audit] No user found, skipping audit log')
            return null
        }

        const headersList = await headers()
        const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip')
        const userAgent = headersList.get('user-agent')

        // Get user's agency_id from profile
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('agency_id')
            .eq('id', user.id)
            .single()

        const { data, error } = await supabase.from('audit_logs').insert({
            user_id: user.id,
            agency_id: profile?.agency_id,
            action: params.action,
            resource_type: params.resourceType,
            resource_id: params.resourceId,
            old_values: params.oldValues,
            new_values: params.newValues,
            ip_address: ip,
            user_agent: userAgent,
        }).select().single()

        if (error) {
            console.error('[Audit] Failed to log:', error)
            return null
        }

        return data
    } catch (error) {
        // Don't fail the main operation if audit logging fails
        console.error('[Audit] Unexpected error:', error)
        return null
    }
}

/**
 * Log successful login
 */
export async function logLogin() {
    return logAudit({ action: 'login' })
}

/**
 * Log logout
 */
export async function logLogout() {
    return logAudit({ action: 'logout' })
}

/**
 * Log user registration
 */
export async function logRegister() {
    return logAudit({ action: 'register' })
}
