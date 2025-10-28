import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Img
} from '@react-email/components'
import { useDaytalog } from 'daytalog'

const Teahouse: React.FC = () => {
  const { log, message } = useDaytalog()

  const logo = 'https://assets.daytalog.com/example/teahouse.png'
  const note = 'No tea was spilled during offload'
  const address = 'Teahouse Post - 418 Brew Avenue, CA'

  return (
    <Html>
      <Head />
      <Preview>
        Day {log.day(2)} - {log.date()}: Backup report
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Row>
            <Column align="center">
              <Img src={logo} height={50} />
            </Column>
          </Row>
          <Section>
            <Heading style={title}>
              Day {log.day(2)} - {log.date('yyyymmdd')}
            </Heading>

            <Text style={subtitle}>All files have successfully been processed.</Text>

            <Row cellSpacing={16}>
              <Column style={{ ...statBox, borderColor: '#3b82f6' }}>
                <Text style={statValue}>{log.ocf.size().length ? log.ocf.size() : '-'}</Text>
                <Text style={statLabel}>OCF</Text>
              </Column>

              <Column style={{ ...statBox, borderColor: '#10b981' }}>
                <Text style={statValue}>{log.proxy.size().length ? log.proxy.size() : '-'}</Text>
                <Text style={statLabel}>PROXY</Text>
              </Column>

              <Column style={{ ...statBox, borderColor: '#7c3aed' }}>
                <Text style={statValue}>{log.sound.size().length ? log.sound.size() : '-'}</Text>
                <Text style={statLabel}>Sound</Text>
              </Column>
            </Row>
            <Text style={noteStyle}>{message}</Text>
            <Text style={noteStyle}>{note}</Text>
            <Text style={footer}>{address}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = {
  backgroundColor: '#0f172a',
  color: '#f8fafc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"'
}

const container: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '24px 16px',
  marginBottom: '64px'
}

const title: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 8px',
  textAlign: 'center'
}

const subtitle: React.CSSProperties = {
  fontSize: '14px',
  margin: '0 0 16px',
  textAlign: 'center'
}

const statBox: React.CSSProperties = {
  backgroundColor: '#0f172a',
  borderRadius: '8px',
  border: '2px solid',
  padding: '12px',
  minWidth: '110px',
  textAlign: 'center'
}

const statValue: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 4px'
}

const statLabel: React.CSSProperties = {
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  margin: 0
}

const noteStyle: React.CSSProperties = {
  fontSize: '12px',
  textAlign: 'center',
  margin: '8px 0 0'
}

const footer: React.CSSProperties = {
  fontSize: '10px',
  textAlign: 'center',
  margin: '16px 0 0'
}

export default Teahouse
