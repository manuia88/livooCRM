import { Resend } from 'resend'
import { render } from '@react-email/render'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Livoo CRM <notifications@livoocrm.com>'

interface SendEmailParams {
  to: string | string[]
  subject: string
  react: React.ReactElement
}

export async function sendEmail({ to, subject, react }: SendEmailParams) {
  try {
    const html = render(react)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Email sent:', data)
    return data

  } catch (error) {
    console.error('Send email error:', error)
    throw error
  }
}

// Helpers específicos
export async function sendWelcomeEmail(userEmail: string, userFirstName: string) {
  const WelcomeEmail = (await import('@/emails/WelcomeEmail')).default

  return sendEmail({
    to: userEmail,
    subject: '¡Bienvenido a Livoo CRM!',
    react: <WelcomeEmail userFirstName={userFirstName} loginUrl={`${process.env.NEXT_PUBLIC_APP_URL}/backoffice`} />
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
  }
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
    />
  })
}
