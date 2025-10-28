import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Img,
  Button,
  Hr,
} from '@react-email/components';
import * as React from 'react';
import { useDaytalog } from 'daytalog';

const LinkEmail: React.FC = () => {
  // This template is using "message" for the URL,
  // paste the URL into the email message.
  const { message, log, projectName } = useDaytalog();

  const logo = 'https://assets.daytalog.com/example/obsidian.png';
  const address = 'Obsidian Frame Studios · 123 Hollywood Lane, Dreamville, CA 90210';

  return (
    <Html>
      <Head>
        <title>{`${projectName} – Day ${log.day()} proxies ready`}</title>
      </Head>

      <Preview>{`Proxies for day ${log.day()} of ${projectName} are ready to download.`}</Preview>

      <Body style={body}>
        <Container style={card}>
          <Section style={header}>
            <Img src={logo} width={64} height={64} alt='Obsidian Frame Studios' style={logoStyle} />
            <Text style={title}>{`Day ${log.day()} – ${projectName}`}</Text>
          </Section>

          <Hr style={divider} />

          <Section>
            <Text style={meta}>{`Files: ${log.proxy.files()} • Size: ${log.proxy.size()}`}</Text>
            <Button href={message} style={button}>
              Download Proxies
            </Button>

            <Text style={linkHint}>
              If the button doesn’t work, copy and paste this URL into your browser:
              <br />
              <a href={message} style={url}>
                {message}
              </a>
            </Text>
          </Section>
        </Container>

        <Text style={footer}>{address}</Text>
      </Body>
    </Html>
  );
};

const body: React.CSSProperties = {
  margin: 0,
  backgroundColor: '#f6f8fa',
  color: '#24292e',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
};

const card: React.CSSProperties = {
  maxWidth: '520px',
  margin: '40px auto',
  backgroundColor: '#ffffff',
  border: '1px solid #eaecef',
  borderRadius: 12,
  padding: 24,
};

const header: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: 8,
};

const logoStyle: React.CSSProperties = {
  display: 'block',
  margin: '0 auto 8px',
  borderRadius: 12,
};

const title: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  margin: '8px 0 2px',
};

const subtitle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: '20px',
  color: '#57606a',
  margin: 0,
};

const divider: React.CSSProperties = {
  borderColor: '#eaecef',
  margin: '16px 0 12px',
};

const meta: React.CSSProperties = {
  fontSize: 13,
  color: '#57606a',
  textAlign: 'center',
  margin: '0 0 16px',
};

const button: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '14px 16px',
  fontWeight: 700,
  borderRadius: 10,
  textAlign: 'center',
  backgroundColor: '#432dd7',
  color: '#ffffff',
  textDecoration: 'none',
  display: 'block',
};

const linkHint: React.CSSProperties = {
  fontSize: 12,
  color: '#57606a',
  marginTop: 12,
  wordBreak: 'break-all',
};

const url: React.CSSProperties = {
  color: '#0969da',
  textDecoration: 'underline',
};

const footer: React.CSSProperties = {
  fontSize: 11,
  textAlign: 'center',
  color: '#6e7781',
  margin: '8px 0 24px',
};

export default LinkEmail;
