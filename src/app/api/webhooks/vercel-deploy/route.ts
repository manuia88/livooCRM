import { NextRequest, NextResponse } from 'next/server'
import { sendSlackAlert } from '@/lib/monitoring/alerts'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    const webhookUrl = process.env.SLACK_WEBHOOK_URL
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'SLACK_WEBHOOK_URL not configured' },
        { status: 500 }
      )
    }

    if (payload.type === 'deployment') {
      const { state, url, target } = payload.deployment

      if (state === 'READY' && target === 'production') {
        await sendSlackAlert(webhookUrl, {
          text: 'Deployment a produccion exitoso',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Deployment:* ${url}\n*Environment:* ${target}\n*Status:* ${state}`,
              },
            },
          ],
        })
      }

      if (state === 'ERROR') {
        await sendSlackAlert(webhookUrl, {
          text: 'Deployment fallido',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Deployment:* ${url}\n*Environment:* ${target}\n*Status:* ERROR`,
              },
            },
          ],
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
