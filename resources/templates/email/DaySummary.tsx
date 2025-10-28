import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Section,
  Row,
  Column,
} from '@react-email/components';
import { useDaytalog } from 'daytalog';

const DaySummary: React.FC = () => {
  const { projectName, log, message } = useDaytalog();

  const title = `DAY ${log.day()} - ${log.date()}`;

  const datacols = [
    log.ocf.files() && { label: 'Camera:', size: log.ocf.sizeAsTuple() },
    log.sound.files() && { label: 'Sound:', size: log.sound.sizeAsTuple() },
    log.proxy.files() && { label: 'Proxy:', size: log.proxy.sizeAsTuple() },
  ].filter(Boolean) as { label: string; size: [number, string] }[];

  return (
    <Html>
      <Head>
        <style>{`
          @media only screen and (max-width:500px){
            .col-pad { padding-right:0 !important; }
            .title   { font-size:24px !important; }
            .big     { font-size:20px !important; }
          }
        `}</style>
      </Head>
      <Preview>{`Backup Report - ${title} - ${projectName}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={titleStyle}>{title}</Text>
            <Text style={description}>Project: {projectName.toUpperCase()}</Text>
          </Section>
          <Section style={section}>
            <Text>
              All footage has been successfully collected, backed up to{' '}
              <strong>{log.ocf.copies().length}</strong> separate locations, and is in good
              standing.
            </Text>
            <Text>{message}</Text>
            <table role='presentation' cellPadding={0} cellSpacing={0} width='100%'>
              <tbody>
                {log.ocf.copies().map((copy, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        width: 160,
                        fontWeight: 600,
                        padding: '6px 8px 6px 0',
                        whiteSpace: 'nowrap',
                        color: '#475569',
                      }}
                    >
                      ✅ Verified Copy {i + 1}:
                    </td>
                    <td style={{ padding: '6px 0' }}>{copy.volumes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
          {!!log.ocf.duration() && <Card label='Duration:' text={log.ocf.duration()} />}
          {!!log.ocf.reels().length && (
            <Card label='Camera Reels:' text={log.ocf.reels({ mergeRanges: true }).join(' ')} />
          )}
          <Row>
            {datacols.map((c, i) => (
              <Column
                key={i}
                className='col-pad'
                style={i < datacols.length - 1 ? { paddingRight: '12px' } : undefined}
              >
                <Card label={c.label} size={c.size} />
              </Column>
            ))}
          </Row>
        </Container>
      </Body>
    </Html>
  );
};

const Card: React.FC<{ label: string; text?: string; size?: [number, string] }> = ({
  label,
  text,
  size,
}) => (
  <Section style={card}>
    <Text style={cardTitle}>{label}</Text>
    {text ? <Text style={cardText}>{text}</Text> : null}
    {size ? <CardSize size={size} /> : null}
  </Section>
);

const CardSize: React.FC<{ size: [number, string] }> = ({ size: [value, unit] }) => (
  <Text style={cardText}>
    {value}
    <span style={{ fontSize: '16px' }}> {unit}</span>
  </Text>
);

const main: React.CSSProperties = {
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
  backgroundColor: '#ffffff',
  color: '#334155',
};

const container: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '20px 0 48px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '28px',
  lineHeight: '1.25',
  textAlign: 'center',
  margin: '0 0 8px',
  color: '#0f172a',
};

const description: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.5',
  textAlign: 'center',
  margin: '0 0 16px',
  color: '#64748b',
};

const section: React.CSSProperties = {
  padding: '20px',
  margin: '16px 0',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  textAlign: 'left',
};

const card: React.CSSProperties = {
  padding: '16px 18px',
  marginBottom: '16px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
};

const cardTitle: React.CSSProperties = {
  fontSize: '12px',
  lineHeight: '1.4',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
  margin: '0 0 6px',
  color: '#475569',
};

const cardText: React.CSSProperties = {
  fontSize: '24px',
  lineHeight: '1.2',
  fontWeight: 300,
  margin: 0,
  color: '#334155',
};

export default DaySummary;
