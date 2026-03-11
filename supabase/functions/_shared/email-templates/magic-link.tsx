/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your seats.ca login link</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>
            seats<span style={logoDot}>.ca</span>
          </Text>
        </Section>

        <Section style={content}>
          <Heading style={h1}>Your login link</Heading>
          <Text style={text}>
            Click the button below to sign in to your seats.ca account. This link will expire shortly.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={confirmationUrl}>
              Sign In
            </Button>
          </Section>

          <Text style={subtext}>
            If the button doesn't work, copy and paste this URL into your browser:
          </Text>
          <Text style={urlText}>{confirmationUrl}</Text>
        </Section>

        <Hr style={divider} />

        <Section style={footerSection}>
          <Text style={footer}>
            © {new Date().getFullYear()} seats.ca — Tickets without the fees.
          </Text>
          <Text style={footerSub}>
            If you didn't request this link, you can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Space Grotesk', 'Inter', Arial, sans-serif" }
const container = { maxWidth: '560px', margin: '0 auto' }
const header = { backgroundColor: '#E31837', padding: '24px 32px', borderRadius: '12px 12px 0 0', textAlign: 'center' as const }
const logoText = { fontSize: '28px', fontWeight: '700' as const, color: '#ffffff', margin: '0', letterSpacing: '-0.5px' }
const logoDot = { color: '#ffffff', opacity: '0.85' }
const content = { padding: '32px 32px 24px', backgroundColor: '#fafafa' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0 0 16px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 16px' }
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' }
const button = { backgroundColor: '#E31837', color: '#ffffff', fontSize: '16px', fontWeight: '600' as const, borderRadius: '8px', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }
const subtext = { fontSize: '13px', color: '#8a8a9a', lineHeight: '1.5', margin: '16px 0 8px' }
const urlText = { fontSize: '12px', color: '#E31837', wordBreak: 'break-all' as const, margin: '0 0 16px' }
const divider = { borderColor: '#eaeaea', margin: '0' }
const footerSection = { padding: '20px 32px', backgroundColor: '#f5f5f5', borderRadius: '0 0 12px 12px' }
const footer = { fontSize: '13px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
const footerSub = { fontSize: '12px', color: '#bbbbbb', margin: '0', textAlign: 'center' as const }
