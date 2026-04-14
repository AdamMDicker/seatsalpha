

# Email Template Redesign Plan

## Scope

Redesign **all** email templates across the platform to create a unified, premium visual identity. This covers:

**6 Auth Email Templates** (React Email components):
- Confirm signup, Password reset, Magic link, Invite, Email change, Reauthentication

**8+ Transactional Email Templates** (inline HTML in Edge Functions):
- Buyer order confirmation (`stripe-webhook`, `send-transactional-email`)
- Seller sale notification (`stripe-webhook`, `send-transactional-email`)
- Transfer relay / "Accept Tickets" (`resolve-transfer-email`)
- Transfer confirmed - buyer (`notify-buyer-transfer`, `verify-transfer-image`)
- Transfer disputed - seller (`notify-buyer-transfer`)
- Transfer mismatch - admin (`verify-transfer-image`)
- Fallback reminder - buyer (`transfer-fallback-reminder`)

## Design Direction

**Premium ticket platform aesthetic** -- clean, modern, high-contrast with strategic use of brand red (#C41E3A / #d6193d). Key changes:

1. **Logo**: Shrink to 120px wide across all templates (currently 300px in most)
2. **Header**: Replace gradient bars with a dark charcoal (#18181b) header section featuring white text and a subtle red accent line -- cleaner, more premium feel than the current full-gradient approach
3. **Typography**: Tighten spacing, increase hierarchy contrast -- larger bold headings, smaller muted labels
4. **Cards/Sections**: Use subtle border + shadow treatment instead of colored background blocks. Information cards get thin left-border accents (red for buyer, green for seller)
5. **Buttons**: Larger, bolder CTAs with pill shape, shadow, and hover-ready styling
6. **Footer**: Slim single-line footer. Move spam warning into a more subtle inline note rather than a full-width yellow banner
7. **Spacing**: Reduce excessive padding. Tighter vertical rhythm throughout
8. **Seller emails**: Keep green accent but use same structural layout as buyer emails for consistency

## Technical Approach

### Auth Templates (6 files)
Update each `.tsx` file in `supabase/functions/_shared/email-templates/`:
- Apply new shared style constants (logo size, header, footer, typography)
- Consistent button styling across signup, recovery, magic-link, invite, email-change
- Reauthentication: style the OTP code block with a modern card treatment

### Transactional Templates (5 Edge Functions)
Update inline HTML builders in:
- `stripe-webhook/index.ts` -- `buyerEmailHtml()` and `sellerEmailHtml()`
- `send-transactional-email/index.ts` -- `buyerConfirmationHtml()` and `sellerNotificationHtml()`
- `resolve-transfer-email/index.ts` -- `buildBrandedEmail()`
- `notify-buyer-transfer/index.ts` -- `brandedEmailWrapper()`, `transferConfirmedHtml()`, `transferDisputedSellerHtml()`
- `verify-transfer-image/index.ts` -- inline confirmed/disputed email HTML and `brandedEmailWrapper()`
- `transfer-fallback-reminder/index.ts` -- `fallbackReminderHtml()`

### Deployment
Redeploy all 6 modified Edge Functions:
`auth-email-hook`, `stripe-webhook`, `send-transactional-email`, `resolve-transfer-email`, `notify-buyer-transfer`, `verify-transfer-image`, `transfer-fallback-reminder`

### Verification
Send a test email to confirm the new design renders correctly in inbox.

