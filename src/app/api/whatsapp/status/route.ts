import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getConnectionStatus } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

    const status = await getConnectionStatus(profile.agency_id)

    return NextResponse.json({
      success: true,
      isConnected: status.status === 'connected',
      status: status.status,
      phoneNumber: status.phoneNumber,
      qrCode: status.qrCode,
      connectedAt: status.connectedAt,
    })
  } catch (error: any) {
    console.error('[API] Error getting WhatsApp status:', error)
    return NextResponse.json(
      { error: 'Failed to get status', details: error.message },
      { status: 500 }
    )
  }
}
