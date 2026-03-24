/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

const LOGO_URL = 'https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo.png'

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>Your login link for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={accentBar} />
        <Section style={content}>
          <Img src={LOGO_URL} width="300" height="300" alt="seats.ca" style={logo} />
          <Heading style={h1}>Your Login Link</Heading>
          <Text style={text}>
            Click the button below to log in to {siteName}. This link will expire shortly.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Log In
          </Button>
          <Text style={footer}>
            If you didn't request this link, you can safely ignore this email.
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

export default MagicLinkEmail

const main = { backgroundColor: '#f4f4f5', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const container = { maxWidth: '560px', margin: '40px auto', borderRadius: '12px', overflow: 'hidden' as const, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }
const accentBar = { background: 'linear-gradient(135deg, #E11D48, #BE123C)', height: '6px', width: '100%' }
const content = { backgroundColor: '#ffffff', padding: '32px 40px 40px' }
const logo = { margin: '0 0 24px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#111827', margin: '0 0 20px', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const button = { backgroundColor: '#E11D48', color: '#ffffff', fontSize: '15px', fontWeight: '600' as const, borderRadius: '8px', padding: '14px 28px', textDecoration: 'none', fontFamily: "'Space Grotesk', Arial, sans-serif", display: 'inline-block' as const }
const footer = { fontSize: '13px', color: '#9ca3af', margin: '28px 0 0', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const spamWarning = { marginTop: '24px', padding: '14px 16px', backgroundColor: '#FEF2F2', borderRadius: '8px', borderLeft: '4px solid #E11D48' }
const spamText = { fontSize: '13px', color: '#991B1B', margin: '0', lineHeight: '1.5', fontFamily: "'Space Grotesk', Arial, sans-serif" }
