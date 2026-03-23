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
    <Head />
    <Preview>You've been invited to join seats.ca 🎉</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={accentBar} />

        <Section style={header}>
          <Img src={LOGO_URL} width="160" height="auto" alt="seats.ca" style={logoImg} />
        </Section>

        <Section style={content}>
          <Section style={iconCircle}>
            <Text style={iconEmoji}>🎉</Text>
          </Section>
          <Heading style={h1}>You're invited!</Heading>
          <Text style={text}>
            You've been invited to join <strong>seats.ca</strong> — Canada's no extra fees ticket platform. Accept the invitation to start browsing the best ticket deals.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={confirmationUrl}>
              Accept Invitation
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

        <Section style={footerSection}>
          <Text style={spamNotice}>
            <strong>If you don't see the email, please check your spam/junk folder.</strong>
          </Text>
          <Text style={footer}>
            © {new Date().getFullYear()} seats.ca — Canada's No Extra Fees Platform
          </Text>
          <Text style={footerSub}>
            If you weren't expecting this invitation, you can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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
const footerSub = { fontSize: '11px', color: '#cccccc', margin: '0', textAlign: 'center' as const }
