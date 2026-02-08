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

interface WelcomeEmailProps {
  userFirstName: string
  loginUrl: string
}

export default function WelcomeEmail({ userFirstName, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido a Livoo CRM</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Heading style={h1}>
              👋 ¡Bienvenido a Livoo CRM!
            </Heading>

            <Text style={text}>
              Hola {userFirstName},
            </Text>

            <Text style={text}>
              Tu cuenta ha sido creada exitosamente. Ya puedes comenzar a gestionar tus propiedades, leads y tareas desde un solo lugar.
            </Text>

            <Section style={buttonContainer}>
              <Button href={loginUrl} style={button}>
                Ir al CRM
              </Button>
            </Section>

            <Text style={text}>
              Si tienes alguna pregunta, responde a este correo y te ayudaremos.
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
  marginBottom: '64px'
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0'
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
  marginTop: '32px'
}
