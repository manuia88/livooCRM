import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import {
  sendWelcomeEmail,
  sendTaskReminderEmail,
  sendTareaAsignadaEmail,
  sendNuevaCaptacionEmail,
  sendNuevoLeadEmail
} from '@/lib/email/resend-client'

export async function POST(request: NextRequest) {
  try {
    const { type, ...params } = await request.json()

    switch (type) {
      case 'welcome':
        await sendWelcomeEmail(params.email, params.firstName, params.agencyId)
        break

      case 'task_reminder':
        await sendTaskReminderEmail(params.email, params.firstName, params.task, params.agencyId)
        break

      case 'task_assigned':
        await sendTareaAsignadaEmail(params.email, params, params.agencyId)
        break

      case 'nueva_captacion':
        await sendNuevaCaptacionEmail(params.email, params, params.agencyId)
        break

      case 'nuevo_lead':
        await sendNuevoLeadEmail(params.email, params, params.agencyId)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Send email API error:', message)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
