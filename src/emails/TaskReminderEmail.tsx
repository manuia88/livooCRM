import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text
} from '@react-email/components'

interface TaskReminderEmailProps {
  userFirstName: string
  taskTitle: string
  taskDescription: string
  dueDate: string
  taskUrl: string
}

export default function TaskReminderEmail({
  userFirstName,
  taskTitle,
  taskDescription,
  dueDate,
  taskUrl
}: TaskReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Recordatorio: {taskTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Heading style={h1}>
              ⏰ Recordatorio de Tarea
            </Heading>

            <Text style={text}>
              Hola {userFirstName},
            </Text>

            <Text style={text}>
              Tienes una tarea próxima a vencer:
            </Text>

            <Section style={taskBox}>
              <Text style={taskTitle as any}>
                {taskTitle}
              </Text>
              <Text style={taskDescription as any}>
                {taskDescription}
              </Text>
              <Text style={dueDateText}>
                📅 Vence: {dueDate}
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button href={taskUrl} style={button}>
                Ver Tarea
              </Button>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto'
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px'
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  textAlign: 'center' as const
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0'
}

const taskBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0'
}

const taskTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 8px'
}

const taskDescription = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0 0 16px'
}

const dueDateText = {
  fontSize: '14px',
  color: '#ef4444',
  fontWeight: '600',
  margin: 0
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0'
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px'
}
