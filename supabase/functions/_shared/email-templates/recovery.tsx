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
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

const LOGO_URL = 'https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo.png'

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your seats.ca password 🔐</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={accentBar} />

        <Section style={header}>
          <Img src={LOGO_URL} width="160" height="auto" alt="seats.ca" style={logoImg} />
        </Section>

        <Section style={content}>
          <Section style={iconCircle}>
            <Text style={iconEmoji}>🔐</Text>
          </Section>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>
            No worries — it happens to the best of us! Click the button below to choose a new password for your seats.ca account.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={confirmationUrl}>
              Reset Password
            </Button>
          </Section>

          <Section style={warningBox}>
            <Text style={warningText}>
              ⏰ This link will expire in 1 hour for security purposes.
            </Text>
          </Section>

          <Text style={subtext}>
            If the button doesn't work, copy and paste this URL into your browser:
          </Text>
          <Text style={urlText}>{confirmationUrl}</Text>
        </Section>

        <Hr style={divider} />

        <Section style={footerSection}>
          <Text style={spamNotice}>
            <strong>If you don't see the email, please check your spam/junk folder.</strong>
          </Text>
          <Text style={footer}>
            © {new Date().getFullYear()} seats.ca — Canada's No Extra Fees Platform
          </Text>
          <Text style={footerSub}>
            If you didn't request a password reset, you can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
const buttonContainer = { textAlign: 'center' as const, margin: '28px 0' }
const button = { backgroundColor: '#E31837', color: '#ffffff', fontSize: '16px', fontWeight: '700' as const, borderRadius: '10px', padding: '16px 40px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(227,24,55,0.35)' }
const warningBox = { backgroundColor: '#FFF8E1', borderRadius: '8px', padding: '12px 16px', margin: '0 0 16px', border: '1px solid #FFE082' }
const warningText = { fontSize: '13px', color: '#6D4C00', margin: '0', textAlign: 'center' as const }
const subtext = { fontSize: '12px', color: '#9a9aaa', lineHeight: '1.5', margin: '16px 0 6px', textAlign: 'center' as const }
const urlText = { fontSize: '11px', color: '#E31837', wordBreak: 'break-all' as const, margin: '0 0 16px', textAlign: 'center' as const }
const divider = { borderColor: '#eaeaea', margin: '0' }
const footerSection = { padding: '20px 32px', backgroundColor: '#ffffff' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
const spamNotice = { fontSize: '12px', color: '#E31837', margin: '0 0 12px', textAlign: 'center' as const, lineHeight: '1.5' }
const footerSub = { fontSize: '11px', color: '#cccccc', margin: '0', textAlign: 'center' as const }
