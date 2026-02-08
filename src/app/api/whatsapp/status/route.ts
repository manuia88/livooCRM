import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('agency_id')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const { data: session } = await supabase
            .from('whatsapp_agency_auth')
            .select('*')
            .eq('agency_id', profile.agency_id)
            .maybeSingle()

        return NextResponse.json({
            isConnected: session?.is_active || false,
            phoneNumber: session?.phone_number,
            qrCode: session?.last_qr_code,
            connectedAt: session?.connected_at
        })

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
