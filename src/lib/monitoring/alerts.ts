interface SlackBlock {
  type: string
  text?: {
    type: string
    text: string
  }
}

interface SlackMessage {
  text: string
  blocks?: SlackBlock[]
}

export async function sendSlackAlert(
  webhookUrl: string,
  message: SlackMessage
): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      console.error('Failed to send Slack alert:', response.statusText)
    }
  } catch (error) {
    console.error('Error sending Slack alert:', error)
  }
}

export function createErrorAlert(
  error: Error,
  context: Record<string, unknown>
): SlackMessage {
  return {
    text: 'Error en Livoo CRM',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Error Critico',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Error:* ${error.message}\n*Environment:* ${process.env.NEXT_PUBLIC_VERCEL_ENV || 'development'}\n*Time:* ${new Date().toISOString()}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Context:*\n\`\`\`${JSON.stringify(context, null, 2)}\`\`\``,
        },
      },
    ],
  }
}

export function createUptimeAlert(
  status: 'down' | 'recovered',
  endpoint: string
): SlackMessage {
  const isDown = status === 'down'
  const text = isDown ? 'Sistema Caido' : 'Sistema Recuperado'

  return {
    text,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Endpoint:* ${endpoint}\n*Status:* ${status}\n*Time:* ${new Date().toISOString()}`,
        },
      },
    ],
  }
}

export function createPerformanceAlert(
  metric: string,
  value: number,
  threshold: number
): SlackMessage {
  return {
    text: 'Alerta de Performance',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Alerta de Performance',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Metrica:* ${metric}\n*Valor:* ${value}\n*Umbral:* ${threshold}\n*Time:* ${new Date().toISOString()}`,
        },
      },
    ],
  }
}
