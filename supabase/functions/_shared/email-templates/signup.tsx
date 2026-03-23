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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

const LOGO_URL = 'https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo.png'

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to seats.ca — Confirm your email to get started 🎟️</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Top accent bar */}
        <Section style={accentBar} />

        {/* Header with logo */}
        <Section style={header}>
          <Img src={LOGO_URL} width="160" height="auto" alt="seats.ca" style={logoImg} />
          <Text style={tagline}>CANADA'S NO EXTRA FEES PLATFORM</Text>
        </Section>

        {/* Main content */}
        <Section style={content}>
          <Section style={iconCircle}>
            <Text style={iconEmoji}>🎟️</Text>
          </Section>
          <Heading style={h1}>Welcome aboard!</Heading>
          <Text style={text}>
            Hey there! Thanks for joining <strong>seats.ca</strong>. You're one step away from accessing the best ticket deals across Canada — with zero extra fees.
          </Text>
          <Text style={text}>
            Just confirm your email address (<strong>{recipient}</strong>) and you're all set.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={confirmationUrl}>
              Verify My Email
            </Button>
          </Section>

          <Text style={subtext}>
            If the button doesn't work, copy and paste this URL into your browser:
          </Text>
          <Text style={urlText}>{confirmationUrl}</Text>
        </Section>

        {/* Feature highlights */}
        <Section style={featuresSection}>
          <table style={featuresTable} cellPadding="0" cellSpacing="0">
            <tr>
              <td style={featureCell}>
                <Text style={featureIcon}>💰</Text>
                <Text style={featureTitle}>No Extra Fees</Text>
                <Text style={featureDesc}>HST-inclusive pricing for members</Text>
              </td>
              <td style={featureCell}>
                <Text style={featureIcon}>⚡</Text>
                <Text style={featureTitle}>Instant Delivery</Text>
                <Text style={featureDesc}>Tickets sent straight to your inbox</Text>
              </td>
              <td style={featureCell}>
                <Text style={featureIcon}>🛡️</Text>
                <Text style={featureTitle}>Guaranteed</Text>
                <Text style={featureDesc}>Every ticket is 100% verified</Text>
              </td>
            </tr>
          </table>
        </Section>

        <Hr style={divider} />

        {/* Footer */}
        <Section style={footerSection}>
          <Text style={spamNotice}>
            <strong>If you don't see the email, please check your spam/junk folder.</strong>
          </Text>
          <Text style={footer}>
            © {new Date().getFullYear()} seats.ca — Canada's No Extra Fees Platform
          </Text>
          <Text style={footerSub}>
            If you didn't create an account, you can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#f0f0f5', fontFamily: "'Space Grotesk', 'Inter', Arial, sans-serif", padding: '20px 0' }
const container = { maxWidth: '580px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden' as const, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }
const accentBar = { height: '4px', background: 'linear-gradient(90deg, #E31837, #ff4d6a, #E31837)', margin: '0' }
const header = { padding: '32px 32px 16px', textAlign: 'center' as const, backgroundColor: '#ffffff' }
const logoImg = { margin: '0 auto', display: 'block' }
const tagline = { fontSize: '10px', fontWeight: '700' as const, color: '#E31837', letterSpacing: '2px', margin: '8px 0 0', textTransform: 'uppercase' as const }
const content = { padding: '8px 40px 32px', backgroundColor: '#ffffff' }
const iconCircle = { textAlign: 'center' as const, margin: '0 0 8px' }
const iconEmoji = { fontSize: '40px', margin: '0', lineHeight: '1' }
const h1 = { fontSize: '28px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0 0 16px', lineHeight: '1.2', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.7', margin: '0 0 14px' }
const buttonContainer = { textAlign: 'center' as const, margin: '28px 0' }
const button = { backgroundColor: '#E31837', color: '#ffffff', fontSize: '16px', fontWeight: '700' as const, borderRadius: '10px', padding: '16px 40px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(227,24,55,0.35)' }
const subtext = { fontSize: '12px', color: '#9a9aaa', lineHeight: '1.5', margin: '16px 0 6px', textAlign: 'center' as const }
const urlText = { fontSize: '11px', color: '#E31837', wordBreak: 'break-all' as const, margin: '0 0 16px', textAlign: 'center' as const }
const featuresSection = { padding: '24px 32px', backgroundColor: '#fafafa', borderTop: '1px solid #f0f0f0' }
const featuresTable = { width: '100%' }
const featureCell = { textAlign: 'center' as const, padding: '0 8px', width: '33.33%', verticalAlign: 'top' as const }
const featureIcon = { fontSize: '24px', margin: '0 0 4px', lineHeight: '1' }
const featureTitle = { fontSize: '12px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0 0 2px' }
const featureDesc = { fontSize: '11px', color: '#8a8a9a', margin: '0', lineHeight: '1.4' }
const divider = { borderColor: '#eaeaea', margin: '0' }
const footerSection = { padding: '20px 32px', backgroundColor: '#ffffff' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
const spamNotice = { fontSize: '12px', color: '#E31837', margin: '0 0 12px', textAlign: 'center' as const, lineHeight: '1.5' }
const footerSub = { fontSize: '11px', color: '#cccccc', margin: '0', textAlign: 'center' as const }
