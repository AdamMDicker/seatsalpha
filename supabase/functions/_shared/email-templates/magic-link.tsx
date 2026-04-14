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
        <Section style={header}>
          <Img src={LOGO_URL} width="120" height="120" alt="seats.ca" style={logo} />
        </Section>
        <Section style={accentLine} />
        <Section style={content}>
          <Heading style={h1}>Your Login Link</Heading>
          <Text style={text}>
            Click the button below to log in to {siteName}. This link will expire shortly.
          </Text>
          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              Log In
            </Button>
          </Section>
          <Text style={muted}>
            If you didn't request this link, you can safely ignore this email.
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

export default MagicLinkEmail

const main = { backgroundColor: '#f4f4f5', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const container = { maxWidth: '560px', margin: '40px auto', borderRadius: '16px', overflow: 'hidden' as const, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }
const header = { backgroundColor: '#18181b', padding: '28px 40px', textAlign: 'center' as const }
const logo = { margin: '0 auto', display: 'block' as const }
const accentLine = { height: '3px', background: 'linear-gradient(90deg, #C41E3A, #d6193d, #C41E3A)', width: '100%' }
const content = { backgroundColor: '#ffffff', padding: '32px 40px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#18181b', margin: '0 0 16px', fontFamily: "'Space Grotesk', Arial, sans-serif", letterSpacing: '-0.5px' }
const text = { fontSize: '15px', color: '#52525b', lineHeight: '1.6', margin: '0 0 16px', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const buttonWrap = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#C41E3A', color: '#ffffff', fontSize: '15px', fontWeight: '600' as const, borderRadius: '50px', padding: '14px 32px', textDecoration: 'none', fontFamily: "'Space Grotesk', Arial, sans-serif", display: 'inline-block' as const, boxShadow: '0 4px 14px rgba(196,30,58,0.3)' }
const muted = { fontSize: '13px', color: '#a1a1aa', margin: '0', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const footer = { padding: '20px 40px', textAlign: 'center' as const, borderTop: '1px solid #f0f0f0' }
const footerText = { fontSize: '11px', color: '#a1a1aa', margin: '0', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const spamNote = { fontSize: '11px', color: '#a1a1aa', margin: '6px 0 0', fontFamily: "'Space Grotesk', Arial, sans-serif" }
