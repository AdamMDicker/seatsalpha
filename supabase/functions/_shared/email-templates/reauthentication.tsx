/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your seats.ca verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>
            seats<span style={logoDot}>.ca</span>
          </Text>
        </Section>

        <Section style={content}>
          <Heading style={h1}>Verification code</Heading>
          <Text style={text}>
            Use the code below to confirm your identity on seats.ca:
          </Text>

          <Section style={codeContainer}>
            <Text style={codeStyle}>{token}</Text>
          </Section>

          <Text style={subtext}>
            This code will expire shortly. Do not share it with anyone.
          </Text>
        </Section>

        <Hr style={divider} />

        <Section style={footerSection}>
          <Text style={footer}>
            © {new Date().getFullYear()} seats.ca — Tickets without the fees.
          </Text>
          <Text style={footerSub}>
            If you didn't request this code, you can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Space Grotesk', 'Inter', Arial, sans-serif" }
const container = { maxWidth: '560px', margin: '0 auto' }
const header = { backgroundColor: '#E31837', padding: '24px 32px', borderRadius: '12px 12px 0 0', textAlign: 'center' as const }
const logoText = { fontSize: '28px', fontWeight: '700' as const, color: '#ffffff', margin: '0', letterSpacing: '-0.5px' }
const logoDot = { color: '#ffffff', opacity: '0.85' }
const content = { padding: '32px 32px 24px', backgroundColor: '#fafafa' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }

const codeContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '2px dashed #E31837',
}

const codeStyle = {
  fontFamily: "'Space Grotesk', Courier, monospace",
  fontSize: '32px',
  fontWeight: '700' as const,
  color: '#E31837',
  letterSpacing: '6px',
  margin: '0',
}

const subtext = { fontSize: '13px', color: '#8a8a9a', lineHeight: '1.5', margin: '16px 0 8px' }
const divider = { borderColor: '#eaeaea', margin: '0' }
const footerSection = { padding: '20px 32px', backgroundColor: '#f5f5f5', borderRadius: '0 0 12px 12px' }
const footer = { fontSize: '13px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
const footerSub = { fontSize: '12px', color: '#bbbbbb', margin: '0', textAlign: 'center' as const }
