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

interface NuevaCaptacionEmailProps {
  managerName: string
  producerName: string
  propertyTitle: string
  propertyType: string
  operationType: string
  price: string
  address: string
  viewUrl: string
}

export default function NuevaCaptacionEmail({
  managerName,
  producerName,
  propertyTitle,
  propertyType,
  operationType,
  price,
  address,
  viewUrl
}: NuevaCaptacionEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nueva captación: {propertyTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Heading style={h1}>
              Nueva Captación Registrada
            </Heading>

            <Text style={text}>
              Hola {managerName},
            </Text>

            <Text style={text}>
              <strong>{producerName}</strong> ha registrado una nueva propiedad
              en el sistema:
            </Text>

            <Section style={propertyBox}>
              <Text style={propertyTitle as any}>
                {propertyTitle}
              </Text>
              <Hr style={divider} />
              <table style={detailsTable}>
                <tbody>
                  <tr>
                    <td style={labelCell}>Tipo</td>
                    <td style={valueCell}>{propertyType}</td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Operación</td>
                    <td style={valueCell}>{operationType}</td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Precio</td>
                    <td style={priceCell}>{price}</td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Ubicación</td>
                    <td style={valueCell}>{address}</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Section style={buttonContainer}>
              <Button href={viewUrl} style={button}>
                Ver Propiedad
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

const propertyBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px'
}

const propertyTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#166534',
  margin: '0 0 12px'
}

const divider = {
  borderColor: '#bbf7d0',
  margin: '12px 0'
}

const detailsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const
}

const labelCell = {
  padding: '6px 0',
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600',
  width: '100px',
  verticalAlign: 'top' as const
}

const valueCell = {
  padding: '6px 0',
  color: '#1f2937',
  fontSize: '14px'
}

const priceCell = {
  padding: '6px 0',
  color: '#166534',
  fontSize: '16px',
  fontWeight: 'bold'
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0'
}

const button = {
  backgroundColor: '#16a34a',
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
