// /lib/notifications/task-notifications.ts
import { createClient } from '@/utils/supabase/server'

/**
 * Sistema de notificaciones para tareas
 * Soporta: Email, Push, WhatsApp, In-app
 */

interface Task {
  id: string
  title: string
  description?: string
  priority: 'alta' | 'media' | 'baja'
  due_date?: string
  assigned_to: string
}

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  notification_preferences?: {
    email: boolean
    push: boolean
    whatsapp: boolean
  }
}

// ============================================================================
// EMAIL NOTIFICATIONS (con Resend)
// ============================================================================

export async function sendTaskAssignedEmail(task: Task, user: User) {
  if (!user.notification_preferences?.email) return

  try {
    // Usar Resend u otro servicio de email (opcional)
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not configured, skipping email')
      return
    }
    const Resend = (await import('resend')).Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    const priorityEmoji = {
      alta: '🔴',
      media: '🟡',
      baja: '🟢'
    }

    await resend.emails.send({
      from: 'NEXUS OS <tareas@nexusos.com>',
      to: user.email,
      subject: `${priorityEmoji[task.priority]} Nueva tarea: ${task.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .priority { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
              .alta { background: #fee2e2; color: #991b1b; }
              .media { background: #fef3c7; color: #92400e; }
              .baja { background: #dcfce7; color: #166534; }
              .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">Nueva tarea asignada</h1>
              </div>
              <div class="content">
                <p>Hola ${user.first_name},</p>
                <p>Se te ha asignado una nueva tarea:</p>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <div style="margin-bottom: 12px;">
                    <span class="priority ${task.priority}">${priorityEmoji[task.priority]} ${task.priority.toUpperCase()}</span>
                  </div>
                  <h2 style="margin: 0 0 10px 0; font-size: 18px;">${task.title}</h2>
                  ${task.description ? `<p style="margin: 0; color: #6b7280;">${task.description}</p>` : ''}
                  ${task.due_date ? `
                    <p style="margin-top: 12px; color: #6b7280; font-size: 14px;">
                      ⏰ Vence: ${new Date(task.due_date).toLocaleString('es-MX', {
        dateStyle: 'full',
        timeStyle: 'short'
      })}
                    </p>
                  ` : ''}
                </div>

                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tasks/${task.id}" class="button">
                  Ver tarea
                </a>
              </div>
              <div class="footer">
                <p>NEXUS OS - Tu CRM inmobiliario inteligente</p>
                <p style="font-size: 12px; color: #9ca3af;">
                  Puedes cambiar tus preferencias de notificaciones en tu perfil
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    console.log(`✅ Email enviado a ${user.email} para tarea ${task.id}`)
  } catch (error) {
    console.error('❌ Error enviando email:', error)
  }
}

export async function sendTaskDueSoonEmail(task: Task, user: User) {
  if (!user.notification_preferences?.email) return

  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not configured, skipping email')
      return
    }
    const Resend = (await import('resend')).Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'NEXUS OS <tareas@nexusos.com>',
      to: user.email,
      subject: `⏰ Tarea próxima a vencer: ${task.title}`,
      html: `
        <h2>Recordatorio de tarea</h2>
        <p>Hola ${user.first_name},</p>
        <p>La siguiente tarea está próxima a vencer:</p>
        <h3>${task.title}</h3>
        <p>Vence en: ${task.due_date ? new Date(task.due_date).toLocaleString('es-MX') : 'pronto'}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tasks/${task.id}">Ver tarea</a>
      `
    })
  } catch (error) {
    console.error('Error enviando email de recordatorio:', error)
  }
}

// ============================================================================
// PUSH NOTIFICATIONS (Web Push API)
// ============================================================================

export async function sendTaskPushNotification(task: Task, user: User) {
  if (!user.notification_preferences?.push) return

  try {
    // Implementar con Web Push API o servicio como OneSignal
    // Por ahora solo log
    console.log(`📱 Push notification para ${user.id}: ${task.title}`)

    // Ejemplo con OneSignal:
    // const OneSignal = await import('onesignal-node')
    // const client = new OneSignal.Client({
    //   app_id: process.env.ONESIGNAL_APP_ID,
    //   rest_api_key: process.env.ONESIGNAL_REST_API_KEY
    // })
    // 
    // await client.createNotification({
    //   contents: { en: task.title },
    //   headings: { en: 'Nueva tarea asignada' },
    //   include_external_user_ids: [user.id],
    //   data: { task_id: task.id }
    // })
  } catch (error) {
    console.error('Error enviando push notification:', error)
  }
}

// ============================================================================
// IN-APP NOTIFICATIONS (almacenar en BD)
// ============================================================================

export async function createInAppNotification(task: Task, userId: string) {
  const supabase = await createClient()

  try {
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'task_assigned',
        title: 'Nueva tarea asignada',
        message: task.title,
        link: `/dashboard/tasks/${task.id}`,
        data: { task_id: task.id, priority: task.priority }
      })

    console.log(`✅ In-app notification creada para usuario ${userId}`)
  } catch (error) {
    console.error('Error creando in-app notification:', error)
  }
}

// ============================================================================
// WHATSAPP NOTIFICATIONS (con Twilio o WhatsApp Business API)
// ============================================================================

export async function sendTaskWhatsAppNotification(task: Task, user: User) {
  if (!user.notification_preferences?.whatsapp || !user.phone) return

  try {
    // Implementar con Twilio WhatsApp API
    console.log(`📱 WhatsApp notification para ${user.phone}: ${task.title}`)

    // Ejemplo con Twilio:
    // const twilio = require('twilio')
    // const client = twilio(
    //   process.env.TWILIO_ACCOUNT_SID,
    //   process.env.TWILIO_AUTH_TOKEN
    // )
    //
    // await client.messages.create({
    //   from: 'whatsapp:+14155238886',
    //   to: `whatsapp:${user.phone}`,
    //   body: `🔔 Nueva tarea: ${task.title}\n\nVer: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tasks/${task.id}`
    // })
  } catch (error) {
    console.error('Error enviando WhatsApp:', error)
  }
}

// ============================================================================
// FUNCIÓN MAESTRA: Enviar todas las notificaciones
// ============================================================================

export async function notifyTaskAssigned(taskId: string) {
  const supabase = await createClient()

  try {
    // Obtener tarea con info del usuario
    const { data: task, error: taskError } = await supabase
      .from('v_tasks_with_details')
      .select('*')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      console.error('Error obteniendo tarea:', taskError)
      return
    }

    // Obtener usuario con preferencias
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', task.assigned_to)
      .single()

    if (userError || !user) {
      console.error('Error obteniendo usuario:', userError)
      return
    }

    // Enviar todas las notificaciones en paralelo
    await Promise.all([
      sendTaskAssignedEmail(task, user),
      sendTaskPushNotification(task, user),
      createInAppNotification(task, user.id),
      sendTaskWhatsAppNotification(task, user)
    ])

    console.log(`✅ Notificaciones enviadas para tarea ${taskId}`)
  } catch (error) {
    console.error('Error en notifyTaskAssigned:', error)
  }
}

// ============================================================================
// TRIGGER: Llamar cuando se crea una tarea
// ============================================================================

// En el API route de crear tarea, agregar:
// await notifyTaskAssigned(newTask.id)
