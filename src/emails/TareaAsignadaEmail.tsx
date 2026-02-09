import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text
} from '@react-email/components'

interface TareaAsignadaEmailProps {
  assignedToName: string
  assignedByName: string
  taskTitle: string
  taskDescription?: string
  dueDate?: string
  priority: 'alta' | 'media' | 'baja'
  taskUrl: string
}

const priorityConfig = {
  alta: { label: 'ALTA', bgColor: '#fee2e2', textColor: '#991b1b', emoji: '' },
  media: { label: 'MEDIA', bgColor: '#fef3c7', textColor: '#92400e', emoji: '' },
  baja: { label: 'BAJA', bgColor: '#dcfce7', textColor: '#166534', emoji: '' }
}

export default function TareaAsignadaEmail({
  assignedToName,
  assignedByName,
  taskTitle,
  taskDescription,
  dueDate,
  priority,
  taskUrl
}: TareaAsignadaEmailProps) {
  const config = priorityConfig[priority] || priorityConfig.media

  return (
    <Html>
      <Head />
      <Preview>Nueva tarea: {taskTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Heading style={h1}>
              Nueva Tarea Asignada
            </Heading>

            <Text style={text}>
              Hola {assignedToName},
            </Text>

            <Text style={text}>
              <strong>{assignedByName}</strong> te ha asignado una nueva tarea:
            </Text>

            <Section style={taskBox}>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td>
                      <Text style={taskTitleStyle}>{taskTitle}</Text>
                    </td>
                    <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                      <span style={{
                        ...priorityBadge,
                        backgroundColor: config.bgColor,
                        color: config.textColor
                      }}>
                        {config.label}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {taskDescription && (
                <>
                  <Hr style={divider} />
                  <Text style={descriptionText}>{taskDescription}</Text>
                </>
              )}

              {dueDate && (
                <>
                  <Hr style={divider} />
                  <Text style={dueDateStyle}>
                    Vence: {dueDate}
                  </Text>
                </>
              )}
            </Section>

            <Section style={buttonContainer}>
              <Button href={taskUrl} style={button}>
                Ver Tarea
              </Button>
            </Section>

            <Text style={footer}>
              — El equipo de Livoo CRM
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif'
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px'
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
  textAlign: 'center' as const
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 24px'
}

const taskBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px'
}

const taskTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0'
}

const priorityBadge = {
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: 'bold',
  letterSpacing: '0.5px'
}

const divider = {
  borderColor: '#e2e8f0',
  margin: '12px 0'
}

const descriptionText = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
  lineHeight: '22px'
}

const dueDateStyle = {
  fontSize: '14px',
  color: '#ef4444',
  fontWeight: '600',
  margin: '0'
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

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '32px',
  padding: '0 24px'
}
