import { NextRequest, NextResponse } from 'next/server'
import { getWhatsAppClient } from '@/lib/whatsapp/baileys-client'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phoneNumber, message, contactId } = await request.json()

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const client = getWhatsAppClient(profile.agency_id)

    if (!client.isConnected()) {
      return NextResponse.json(
        { error: 'WhatsApp not connected. Please scan QR code first.' },
        { status: 400 }
      )
    }

    const result = await client.sendMessage(phoneNumber, message, contactId)

    return NextResponse.json({
      success: true,
      messageId: result.messageId
    })

  } catch (error: any) {
    console.error('Send WhatsApp message error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
