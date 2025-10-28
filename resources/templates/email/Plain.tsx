import {
  Html,
  Head,
  Heading,
  Preview,
  Body,
  Container,
  Text,
  Img,
  Column,
  Row,
} from '@react-email/components';
import { useDaytalog } from 'daytalog';

const Plain: React.FC = () => {
  const { message } = useDaytalog();

  const logo = 'https://assets.daytalog.com/example/obsidian.png';
  const address = `Obsidian Frame Studios - 123 Hollywood Lane, Dreamville, CA 90210 `;

  return (
    <Html>
      <Head></Head>
      <Preview>{message?.slice(0, 100)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading>
            <Row>
              <Column align={'center'}>
                <Img src={logo} height={80} />
              </Column>
            </Row>
          </Heading>
          <Text style={textbox}>{message}</Text>
          <Text style={footer}>{address}</Text>
        </Container>
      </Body>
    </Html>
  );
};

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#24292e',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
};

const textbox: React.CSSProperties = {
  padding: '24px',
  border: 'solid 1px #dedede',
  borderRadius: '10px',
  minHeight: '320px',
  whiteSpace: 'pre-line',
};

const container: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '20px 0 48px',
};

const footer: React.CSSProperties = {
  fontSize: '10px',
  textAlign: 'center',
  margin: '16px 0 0',
};

export default Plain;
