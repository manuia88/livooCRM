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

interface NuevoLeadEmailProps {
  agentName: string
  leadName: string
  leadEmail?: string
  leadPhone?: string
  propertyInterested?: string
  message?: string
  source?: string
  contactUrl: string
}

export default function NuevoLeadEmail({
  agentName,
  leadName,
  leadEmail,
  leadPhone,
  propertyInterested,
  message,
  source,
  contactUrl
}: NuevoLeadEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nuevo lead: {leadName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Section style={headerBadge}>
              <Text style={badgeText}>NUEVO LEAD</Text>
            </Section>

            <Heading style={h1}>
              Tienes un nuevo contacto
            </Heading>

            <Text style={text}>
              Hola {agentName},
            </Text>

            <Text style={text}>
              Un nuevo lead ha llegado{source ? ` desde ${source}` : ''}. Contacta lo antes posible
              para no perder la oportunidad.
            </Text>

            <Section style={leadBox}>
              <Text style={leadNameStyle}>{leadName}</Text>
              <Hr style={divider} />

              {leadEmail && (
                <Text style={contactDetail}>
                  <strong>Email:</strong> {leadEmail}
                </Text>
              )}

              {leadPhone && (
                <Text style={contactDetail}>
                  <strong>Teléfono:</strong> {leadPhone}
                </Text>
              )}

              {propertyInterested && (
                <Text style={contactDetail}>
                  <strong>Propiedad de interés:</strong> {propertyInterested}
                </Text>
              )}

              {message && (
                <>
                  <Hr style={divider} />
                  <Text style={messageLabel}>Mensaje:</Text>
                  <Text style={messageText}>{message}</Text>
                </>
              )}
            </Section>

            <Section style={buttonContainer}>
              <Button href={contactUrl} style={button}>
                Ver Contacto
              </Button>
            </Section>

            <Text style={tipText}>
              Los leads contactados en los primeros 5 minutos tienen 9x más
              probabilidad de conversión.
            </Text>

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

const headerBadge = {
  textAlign: 'center' as const,
  margin: '24px 0 0'
}

const badgeText = {
  display: 'inline-block',
  backgroundColor: '#dbeafe',
  color: '#1d4ed8',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '4px 12px',
  borderRadius: '12px',
  letterSpacing: '1px',
  margin: '0'
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '16px 0 20px',
  padding: '0',
  textAlign: 'center' as const
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 24px'
}

const leadBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px'
}

const leadNameStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 8px'
}

const divider = {
  borderColor: '#bfdbfe',
  margin: '12px 0'
}

const contactDetail = {
  fontSize: '14px',
  color: '#374151',
  margin: '6px 0',
  lineHeight: '20px'
}

const messageLabel = {
  fontSize: '13px',
  color: '#6b7280',
  fontWeight: '600',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const
}

const messageText = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
  fontStyle: 'italic',
  lineHeight: '22px'
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0'
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px'
}

const tipText = {
  backgroundColor: '#fef3c7',
  color: '#92400e',
  fontSize: '13px',
  padding: '12px 16px',
  borderRadius: '6px',
  margin: '24px',
  lineHeight: '20px',
  textAlign: 'center' as const
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '32px',
  padding: '0 24px'
}
