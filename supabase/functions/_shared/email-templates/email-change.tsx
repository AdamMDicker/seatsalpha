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
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

const LOGO_URL = 'https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo.png'

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>Confirm your email change for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={accentBar} />
        <Section style={content}>
          <Img src={LOGO_URL} width="120" height="40" alt="seats.ca" style={logo} />
          <Heading style={h1}>Confirm Your Email Change</Heading>
          <Text style={text}>
            You requested to change your email address for {siteName} from{' '}
            <Link href={`mailto:${email}`} style={link}>
              {email}
            </Link>{' '}
            to{' '}
            <Link href={`mailto:${newEmail}`} style={link}>
              {newEmail}
            </Link>
            .
          </Text>
          <Text style={text}>
            Click the button below to confirm this change:
          </Text>
          <Button style={button} href={confirmationUrl}>
            Confirm Email Change
          </Button>
          <Text style={footer}>
            If you didn't request this change, please secure your account immediately.
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

export default EmailChangeEmail

const main = { backgroundColor: '#f4f4f5', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const container = { maxWidth: '560px', margin: '40px auto', borderRadius: '12px', overflow: 'hidden' as const, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }
const accentBar = { background: 'linear-gradient(135deg, #E11D48, #BE123C)', height: '6px', width: '100%' }
const content = { backgroundColor: '#ffffff', padding: '32px 40px 40px' }
const logo = { margin: '0 0 24px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#111827', margin: '0 0 20px', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const text = { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const link = { color: '#E11D48', textDecoration: 'underline' }
const button = { backgroundColor: '#E11D48', color: '#ffffff', fontSize: '15px', fontWeight: '600' as const, borderRadius: '8px', padding: '14px 28px', textDecoration: 'none', fontFamily: "'Space Grotesk', Arial, sans-serif", display: 'inline-block' as const }
const footer = { fontSize: '13px', color: '#9ca3af', margin: '28px 0 0', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const spamWarning = { marginTop: '24px', padding: '14px 16px', backgroundColor: '#FEF2F2', borderRadius: '8px', borderLeft: '4px solid #E11D48' }
const spamText = { fontSize: '13px', color: '#991B1B', margin: '0', lineHeight: '1.5', fontFamily: "'Space Grotesk', Arial, sans-serif" }
