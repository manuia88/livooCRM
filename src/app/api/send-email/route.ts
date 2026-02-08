import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, sendTaskReminderEmail } from '@/lib/email/resend-client'

export async function POST(request: NextRequest) {
  try {
    const { type, ...params } = await request.json()

    switch (type) {
      case 'welcome':
        await sendWelcomeEmail(params.email, params.firstName)
        break

      case 'task_reminder':
        await sendTaskReminderEmail(params.email, params.firstName, params.task)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Send email API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
