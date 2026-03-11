

# Plan: Chargeback-Proof Checkout with Mandatory Consent Checkboxes & Disclosures

## What We're Building

Adding mandatory legal checkboxes, prominent refund disclosures, and a dispute-first notice to the FeeGateDialog checkout popup -- all visible and required **before** the user can click Pay.

## Changes (Single File: `src/components/team/FeeGateDialog.tsx`)

### 1. Two Mandatory Unchecked Checkboxes
Add two `Checkbox` components (from existing `@/components/ui/checkbox`) with state tracking, both defaulting to `false`:

- **Checkbox 1 — Terms Agreement:**
  > "I confirm that I have read and agree to the [Terms of Service](/terms-of-service), [Refund Policy](/terms-of-service#refunds), and [Ticket Delivery Policy](/terms-of-service#ticket-delivery)."
  - "Terms of Service", "Refund Policy", and "Ticket Delivery Policy" are each `<a>` links (open in new tab) pointing to the relevant page/anchor.

- **Checkbox 2 — Ticket Details Confirmation:**
  > "I confirm the ticket details above are correct."

### 2. Prominent "All Sales Final" Disclosure
A styled notice block (warning/amber background) placed between the ticket details and the checkboxes:

> "All ticket sales are final unless an event is cancelled without a rescheduling opportunity set out by the event organizer."

### 3. Dispute Resolution Notice
A small but clear line above or near the Pay button:

> "By purchasing, you agree to contact Seats.ca support before initiating a payment dispute with your bank."

### 4. Disable Pay Button Until Both Checkboxes Are Checked
The existing `handleProceed` button gets an additional `disabled` condition: both checkboxes must be `true`. Visual feedback via reduced opacity when unchecked.

### 5. State Management
Two new `useState<boolean>` hooks (`agreedToTerms`, `confirmedDetails`), both initialized to `false`. Reset to `false` when the dialog opens (via `onOpenChange` or effect on `open`).

## What This Does NOT Cover (Addressed Elsewhere / Future)
- **Visa Secure / Mastercard Identity Check**: These are Stripe-side configurations, not frontend code. Stripe handles 3D Secure automatically when enabled in your Stripe dashboard settings.
- **IP/device/browser/geo capture**: This requires server-side logging in the `create-payment` edge function (separate task).
- **Confirmation email with open tracking**: Requires a post-payment webhook or edge function (separate task).
- **Stripe line item descriptor** ("seats.ca - City - Event"): This is configured via `statement_descriptor` in the Stripe checkout session creation in the edge function (separate task).
- **Account-required checkout**: Already enforced -- `handleBuy` redirects to `/auth` if no user.
- **Ticket transfer from sellers**: Operational workflow, not a checkout UI change.

## Visual Layout (inside the dialog, below the total section, above the Pay button)

```text
┌─────────────────────────────────────────┐
│  ⚠ All ticket sales are final unless   │
│  cancelled without rescheduling by the  │
│  event organizer.                       │
└─────────────────────────────────────────┘

☐ I confirm that I have read and agree to
  the Terms of Service, Refund Policy,
  and Ticket Delivery Policy.

☐ I confirm the ticket details above
  are correct.

  By purchasing, you agree to contact
  Seats.ca support before initiating a
  payment dispute with your bank.

  [ Pay $XXX.XX ]  ← disabled until both ☑
```

