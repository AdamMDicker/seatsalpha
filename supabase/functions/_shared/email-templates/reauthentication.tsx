/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const LOGO_URL = 'https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo.png'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your seats.ca verification code 🔑</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={accentBar} />

        <Section style={header}>
          <Img src={LOGO_URL} width="160" height="auto" alt="seats.ca" style={logoImg} />
        </Section>

        <Section style={content}>
          <Section style={iconCircle}>
            <Text style={iconEmoji}>🔑</Text>
          </Section>
          <Heading style={h1}>Verification code</Heading>
          <Text style={text}>
            Use the code below to confirm your identity on seats.ca:
          </Text>

          <Section style={codeContainer}>
            <Text style={codeStyle}>{token}</Text>
          </Section>

          <Section style={warningBox}>
            <Text style={warningText}>
              ⏰ This code will expire shortly. Do not share it with anyone.
            </Text>
          </Section>
        </Section>

        <Hr style={divider} />

        <Section style={footerSection}>
          <Text style={footer}>
            © {new Date().getFullYear()} seats.ca — Canada's No Extra Fees Platform
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

const main = { backgroundColor: '#f0f0f5', fontFamily: "'Space Grotesk', 'Inter', Arial, sans-serif", padding: '20px 0' }
const container = { maxWidth: '580px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden' as const, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }
const accentBar = { height: '4px', background: 'linear-gradient(90deg, #E31837, #ff4d6a, #E31837)', margin: '0' }
const header = { padding: '32px 32px 16px', textAlign: 'center' as const, backgroundColor: '#ffffff' }
const logoImg = { margin: '0 auto', display: 'block' }
const content = { padding: '8px 40px 32px', backgroundColor: '#ffffff' }
const iconCircle = { textAlign: 'center' as const, margin: '0 0 8px' }
const iconEmoji = { fontSize: '40px', margin: '0', lineHeight: '1' }
const h1 = { fontSize: '28px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0 0 16px', lineHeight: '1.2', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.7', margin: '0 0 14px', textAlign: 'center' as const }

const codeContainer = {
  textAlign: 'center' as const,
  margin: '24px auto',
  padding: '20px 24px',
  backgroundColor: '#1a1a2e',
  borderRadius: '12px',
  maxWidth: '280px',
}

const codeStyle = {
  fontFamily: "'Space Grotesk', 'Courier New', monospace",
  fontSize: '36px',
  fontWeight: '700' as const,
  color: '#ffffff',
  letterSpacing: '8px',
  margin: '0',
  textAlign: 'center' as const,
}

const warningBox = { backgroundColor: '#FFF8E1', borderRadius: '8px', padding: '12px 16px', margin: '16px 0 0', border: '1px solid #FFE082' }
const warningText = { fontSize: '13px', color: '#6D4C00', margin: '0', textAlign: 'center' as const }
const divider = { borderColor: '#eaeaea', margin: '0' }
const footerSection = { padding: '20px 32px', backgroundColor: '#ffffff' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
const footerSub = { fontSize: '11px', color: '#cccccc', margin: '0', textAlign: 'center' as const }
