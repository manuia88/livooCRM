'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { logLogout } from '@/lib/security/audit-log'

export async function logout() {
    const supabase = await createClient()

    // Log logout before destroying session
    await logLogout()

    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    redirect('/')
}
