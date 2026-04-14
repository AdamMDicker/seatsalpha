/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
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
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={LOGO_URL} width="120" height="120" alt="seats.ca" style={logo} />
        </Section>
        <Section style={accentLine} />
        <Section style={content}>
          <Heading style={h1}>Confirm Reauthentication</Heading>
          <Text style={text}>Use the code below to confirm your identity:</Text>
          <Section style={codeCard}>
            <Text style={codeStyle}>{token}</Text>
          </Section>
          <Text style={muted}>
            This code will expire shortly. If you didn't request this, you can safely ignore this email.
          </Text>
        </Section>
        <Section style={footer}>
          <Text style={footerText}>© {new Date().getFullYear()} seats.ca · Canada's No-Fee Ticket Platform</Text>
          <Text style={spamNote}>Tip: Add noreply@seats.ca to your contacts to avoid missing emails.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#f4f4f5', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const container = { maxWidth: '560px', margin: '40px auto', borderRadius: '16px', overflow: 'hidden' as const, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }
const header = { backgroundColor: '#18181b', padding: '28px 40px', textAlign: 'center' as const }
const logo = { margin: '0 auto', display: 'block' as const }
const accentLine = { height: '3px', background: 'linear-gradient(90deg, #C41E3A, #d6193d, #C41E3A)', width: '100%' }
const content = { backgroundColor: '#ffffff', padding: '32px 40px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#18181b', margin: '0 0 16px', fontFamily: "'Space Grotesk', Arial, sans-serif", letterSpacing: '-0.5px' }
const text = { fontSize: '15px', color: '#52525b', lineHeight: '1.6', margin: '0 0 16px', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const codeCard = { backgroundColor: '#f8f8fa', borderRadius: '12px', padding: '20px', textAlign: 'center' as const, margin: '24px 0', border: '1px solid #e4e4e7' }
const codeStyle = { fontFamily: "'Space Grotesk', Courier, monospace", fontSize: '32px', fontWeight: '700' as const, color: '#C41E3A', margin: '0', letterSpacing: '6px' }
const muted = { fontSize: '13px', color: '#a1a1aa', margin: '0', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const footer = { padding: '20px 40px', textAlign: 'center' as const, borderTop: '1px solid #f0f0f0' }
const footerText = { fontSize: '11px', color: '#a1a1aa', margin: '0', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const spamNote = { fontSize: '11px', color: '#a1a1aa', margin: '6px 0 0', fontFamily: "'Space Grotesk', Arial, sans-serif" }
