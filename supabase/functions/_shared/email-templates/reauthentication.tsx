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
        <Section style={accentBar} />
        <Section style={content}>
          <Img src={LOGO_URL} width="300" height="300" alt="seats.ca" style={logo} />
          <Heading style={h1}>Confirm Reauthentication</Heading>
          <Text style={text}>Use the code below to confirm your identity:</Text>
          <Text style={codeStyle}>{token}</Text>
          <Text style={footer}>
            This code will expire shortly. If you didn't request this, you can safely ignore this email.
          </Text>
          <Section style={spamWarning}>
            <Text style={spamText}>
              ⚠️ <strong>Important:</strong> If you don't see future emails from us, please check your spam/junk folder and mark us as a safe sender.
            </Text>
          </Section>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#f4f4f5', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const container = { maxWidth: '560px', margin: '40px auto', borderRadius: '12px', overflow: 'hidden' as const, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }
const accentBar = { background: 'linear-gradient(135deg, #E11D48, #BE123C)', height: '6px', width: '100%' }
const content = { backgroundColor: '#ffffff', padding: '32px 40px 40px' }
const logo = { margin: '0 0 24px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#111827', margin: '0 0 20px', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const codeStyle = { fontFamily: "'Space Grotesk', Courier, monospace", fontSize: '28px', fontWeight: '700' as const, color: '#E11D48', margin: '0 0 30px', letterSpacing: '4px' }
const footer = { fontSize: '13px', color: '#9ca3af', margin: '28px 0 0', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const spamWarning = { marginTop: '24px', padding: '14px 16px', backgroundColor: '#FEF2F2', borderRadius: '8px', borderLeft: '4px solid #E11D48' }
const spamText = { fontSize: '13px', color: '#991B1B', margin: '0', lineHeight: '1.5', fontFamily: "'Space Grotesk', Arial, sans-serif" }
