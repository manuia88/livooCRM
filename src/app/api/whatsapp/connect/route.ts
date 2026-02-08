import { NextRequest, NextResponse } from 'next/server'
import { getWhatsAppClient } from '@/lib/whatsapp/baileys-client'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
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

        const agencyId = profile.agency_id

        const client = getWhatsAppClient(agencyId, {
            agencyId,
            onQR: async (qr) => {
                console.log(`QR Generated for agency ${agencyId}`)
            },
            onConnected: async (phoneNumber) => {
                console.log(`Connected agency ${agencyId}: ${phoneNumber}`)
            },
            onDisconnected: async () => {
                console.log(`Disconnected agency ${agencyId}`)
            }
        })

        await client.start()

        return NextResponse.json({
            success: true,
            message: 'WhatsApp connection initiated. Scan QR code to continue.'
        })

    } catch (error: any) {
        console.error('WhatsApp connect error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
