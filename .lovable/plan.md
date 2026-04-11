

## Plan: Enhanced Seller Transfer Flow

This plan adds the transfer email to the seller confirmation email, provides a step-by-step transfer guide, and introduces AI-powered verification of uploaded transfer proof with automatic confirmation/alert emails.

---

### 1. Add Transfer Email to Seller Confirmation Email

**File:** `supabase/functions/stripe-webhook/index.ts`

- Add `transferEmail` parameter to `sellerEmailHtml()` function
- Display the masked transfer email (e.g., `order-a1b2c3d4@seats.ca`) prominently in the seller email, right after the sale details
- Add a styled "Transfer Email" row in the details table
- Pass the `transferEmailAlias` value when calling `sellerEmailHtml()` (it's already generated at that point in the webhook)

Also update the `send-transactional-email` version of `sellerNotificationHtml` to match.

### 2. Add Step-by-Step Transfer Guide in Seller Email

Replace the generic "upload a copy" reminder with a clear numbered guide:

1. Log in to your Seats.ca Seller Portal
2. Go to the **Transfers** tab
3. Locate this sale (Order Ref shown above)
4. Transfer your tickets to the email shown above via Ticketmaster (or your platform)
5. Take a screenshot of the completed transfer
6. Upload the screenshot to confirm delivery

Include a CTA button: **"View Transfer in Seller Portal"** linking to `https://seats.ca/reseller-dashboard?tab=transfers`

### 3. Add AI Verification of Transfer Proof

**New edge function:** `supabase/functions/verify-transfer-image/index.ts`

When a seller uploads transfer proof, use AI (Lovable AI Gateway with Gemini Vision) to analyze the screenshot and extract:
- Recipient email address
- Event name/date
- Seat details (section, row)

Compare extracted data against the order record. Possible outcomes:
- **Match** → Auto-set status to `confirmed`, send confirmation email to both buyer and seller
- **Mismatch** → Set status to `disputed`, send alert email to admin with details of what didn't match

### 4. Add New Transfer Statuses & Database Update

**Migration:** Add `verification_result` jsonb column to `order_transfers` to store AI extraction results.

### 5. Update SellerTransfers UI

**File:** `src/components/reseller/SellerTransfers.tsx`

- Show verification status after upload (analyzing → confirmed / disputed)
- Display a "Verified" badge with checkmark when AI confirms the transfer
- Show alert if details don't match

### 6. Confirmation & Alert Emails

**In `stripe-webhook/index.ts` or `notify-buyer-transfer/index.ts`:**

- **Transfer Confirmed email** (to buyer): "Your tickets have been verified and confirmed for [Event]"
- **Transfer Alert email** (to admin): "Transfer mismatch detected for Order #XYZ — [details of what didn't match]"

### 7. Redeploy Edge Functions

Deploy: `stripe-webhook`, `send-transactional-email`, `notify-buyer-transfer`, `verify-transfer-image`

---

### Technical Details

- AI verification uses Gemini 2.5 Flash via the Lovable AI gateway (no API key needed) with a structured prompt asking it to extract email, event name, date, and seats from the screenshot
- The verification runs asynchronously after upload — the seller sees "Analyzing..." status briefly
- The `verify-transfer-image` function downloads the image from the public storage URL and sends it to the vision model
- Verification result is stored as JSON in `order_transfers.verification_result` for audit trail

