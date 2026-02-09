import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createClient } from '@/utils/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Livoo CRM <notifications@livoocrm.com>'

export type EmailTemplate =
  | 'welcome'
  | 'task_reminder'
  | 'task_assigned'
  | 'nueva_captacion'
  | 'nuevo_lead'

interface SendEmailParams {
  to: string | string[]
  subject: string
  react: React.ReactElement
  template?: EmailTemplate
  agencyId?: string
  metadata?: Record<string, unknown>
}

/**
 * Send an email via Resend and optionally log it to the database.
 */
export async function sendEmail({
  to,
  subject,
  react,
  template,
  agencyId,
  metadata
}: SendEmailParams) {
  try {
    const html = await render(react)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    })

    if (error) {
      console.error('Resend error:', error)
      await logEmail({
        template: template || 'unknown',
        to,
        subject,
        status: 'failed',
        errorMessage: error.message,
        agencyId,
        metadata
      })
      throw error
    }

    // Log successful send
    await logEmail({
      template: template || 'unknown',
      to,
      subject,
      resendId: data?.id,
      status: 'sent',
      agencyId,
      metadata
    })

    console.log('Email sent:', data)
    return data

  } catch (error) {
    console.error('Send email error:', error)
    throw error
  }
}

// ── Email logging ──────────────────────────────────────────────────────

interface LogEmailParams {
  template: string
  to: string | string[]
  subject: string
  resendId?: string
  status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed'
  errorMessage?: string
  agencyId?: string
  metadata?: Record<string, unknown>
}

async function logEmail(params: LogEmailParams) {
  try {
    const supabase = await createClient()
    const recipients = Array.isArray(params.to) ? params.to : [params.to]

    await supabase.from('email_logs').insert({
      template: params.template,
      recipient_emails: recipients,
      subject: params.subject,
      resend_id: params.resendId || null,
      status: params.status,
      error_message: params.errorMessage || null,
      agency_id: params.agencyId || null,
      metadata: params.metadata || {}
    })
  } catch (err) {
    // Don't let logging failures break email sending
    console.error('Failed to log email:', err)
  }
}

// ── Template-specific helpers ──────────────────────────────────────────

export async function sendWelcomeEmail(userEmail: string, userFirstName: string, agencyId?: string) {
  const WelcomeEmail = (await import('@/emails/WelcomeEmail')).default

  return sendEmail({
    to: userEmail,
    subject: '¡Bienvenido a Livoo CRM!',
    react: <WelcomeEmail userFirstName={userFirstName} loginUrl={`${process.env.NEXT_PUBLIC_APP_URL}/backoffice`} />,
    template: 'welcome',
    agencyId,
    metadata: { userFirstName }
  })
}

export async function sendTaskReminderEmail(
  userEmail: string,
  userFirstName: string,
  task: {
    title: string
    description: string
    dueDate: string
    id: string
  },
  agencyId?: string
) {
  const TaskReminderEmail = (await import('@/emails/TaskReminderEmail')).default

  return sendEmail({
    to: userEmail,
    subject: `Recordatorio: ${task.title}`,
    react: <TaskReminderEmail
      userFirstName={userFirstName}
      taskTitle={task.title}
      taskDescription={task.description}
      dueDate={task.dueDate}
      taskUrl={`${process.env.NEXT_PUBLIC_APP_URL}/backoffice/tareas/${task.id}`}
    />,
    template: 'task_reminder',
    agencyId,
    metadata: { taskId: task.id }
  })
}

export async function sendTareaAsignadaEmail(
  assignedToEmail: string,
  params: {
    assignedToName: string
    assignedByName: string
    taskTitle: string
    taskDescription?: string
    dueDate?: string
    priority: 'alta' | 'media' | 'baja'
    taskId: string
  },
  agencyId?: string
) {
  const TareaAsignadaEmail = (await import('@/emails/TareaAsignadaEmail')).default

  return sendEmail({
    to: assignedToEmail,
    subject: `Nueva tarea asignada: ${params.taskTitle}`,
    react: <TareaAsignadaEmail
      assignedToName={params.assignedToName}
      assignedByName={params.assignedByName}
      taskTitle={params.taskTitle}
      taskDescription={params.taskDescription}
      dueDate={params.dueDate}
      priority={params.priority}
      taskUrl={`${process.env.NEXT_PUBLIC_APP_URL}/backoffice/tareas/${params.taskId}`}
    />,
    template: 'task_assigned',
    agencyId,
    metadata: { taskId: params.taskId }
  })
}

export async function sendNuevaCaptacionEmail(
  managerEmail: string,
  params: {
    managerName: string
    producerName: string
    propertyTitle: string
    propertyType: string
    operationType: string
    price: string
    address: string
    propertyId: string
  },
  agencyId?: string
) {
  const NuevaCaptacionEmail = (await import('@/emails/NuevaCaptacionEmail')).default

  return sendEmail({
    to: managerEmail,
    subject: `Nueva captación: ${params.propertyTitle}`,
    react: <NuevaCaptacionEmail
      managerName={params.managerName}
      producerName={params.producerName}
      propertyTitle={params.propertyTitle}
      propertyType={params.propertyType}
      operationType={params.operationType}
      price={params.price}
      address={params.address}
      viewUrl={`${process.env.NEXT_PUBLIC_APP_URL}/backoffice/propiedades/${params.propertyId}`}
    />,
    template: 'nueva_captacion',
    agencyId,
    metadata: { propertyId: params.propertyId }
  })
}

export async function sendNuevoLeadEmail(
  agentEmail: string,
  params: {
    agentName: string
    leadName: string
    leadEmail?: string
    leadPhone?: string
    propertyInterested?: string
    message?: string
    source?: string
    contactId: string
  },
  agencyId?: string
) {
  const NuevoLeadEmail = (await import('@/emails/NuevoLeadEmail')).default

  return sendEmail({
    to: agentEmail,
    subject: `Nuevo lead: ${params.leadName}`,
    react: <NuevoLeadEmail
      agentName={params.agentName}
      leadName={params.leadName}
      leadEmail={params.leadEmail}
      leadPhone={params.leadPhone}
      propertyInterested={params.propertyInterested}
      message={params.message}
      source={params.source}
      contactUrl={`${process.env.NEXT_PUBLIC_APP_URL}/backoffice/contactos/${params.contactId}`}
    />,
    template: 'nuevo_lead',
    agencyId,
    metadata: { contactId: params.contactId }
  })
}
