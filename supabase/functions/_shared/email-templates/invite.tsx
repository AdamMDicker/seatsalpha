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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

const LOGO_URL = 'https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo.png'

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>You've been invited to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={accentBar} />
        <Section style={content}>
          <Img src={LOGO_URL} width="300" height="300" alt="seats.ca" style={logo} />
          <Heading style={h1}>You've Been Invited</Heading>
          <Text style={text}>
            You've been invited to join{' '}
            <Link href={siteUrl} style={link}>
              <strong>{siteName}</strong>
            </Link>
            . Click the button below to accept the invitation and create your account.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Accept Invitation
          </Button>
          <Text style={footer}>
            If you weren't expecting this invitation, you can safely ignore this email.
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

export default InviteEmail

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
const spamWarning = { marginTop: '24px', padding: '14px 16px', backgroundColor: '#FEF9E7', borderRadius: '8px', borderLeft: '4px solid #D4AC0D' }
const spamText = { fontSize: '13px', color: '#7D6608', margin: '0', lineHeight: '1.5', fontFamily: "'Space Grotesk', Arial, sans-serif" }
