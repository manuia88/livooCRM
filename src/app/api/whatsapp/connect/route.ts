import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getWhatsAppSocket } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('agency_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Only admin/manager can connect WhatsApp
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Admin or Manager role required.' },
        { status: 403 }
      )
    }

    console.log(`[API] POST /api/whatsapp/connect - agency: ${profile.agency_id}`)

    // Start connection in background (non-blocking)
    initializeConnection().catch((error) => {
      console.error('[API] Background connection error:', error)
    })

    return NextResponse.json({
      success: true,
      status: 'connecting',
      message: 'Connection started. Poll /api/whatsapp/status for updates.',
    })
  } catch (error: any) {
    console.error('[API] Connection error:', error)
    return NextResponse.json(
      { error: 'Failed to start connection', details: error.message },
      { status: 500 }
    )
  }
}

async function initializeConnection() {
  console.log('[Background] Starting WhatsApp connection...')
  try {
    const socket = await getWhatsAppSocket()
    console.log('[Background] Socket obtained:', !!socket.user)
  } catch (error) {
    console.error('[Background] Socket error:', error)
    throw error
  }
}
