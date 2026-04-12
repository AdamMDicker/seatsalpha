

## Plan: Block Buyer Forward on Transfer Mismatch

### Problem
Currently, `resolve-transfer-email` forwards the Ticketmaster transfer notification to the buyer immediately, regardless of whether the AI verification found a mismatch. This means a buyer could accept wrong tickets before anyone catches the error.

### Solution
Modify `resolve-transfer-email` to check the transfer's `status` and `verification_result` before forwarding:

1. **If status is `disputed`** (AI found mismatch) — do NOT forward to buyer. Log the blocked forward and notify admin.
2. **If status is `confirmed`** (AI verified match) — forward immediately as today.
3. **If status is `pending`** (proof not yet uploaded / not yet verified) — forward as today (the transfer email often arrives before the seller uploads proof, so we cannot block on pending).

Additionally, when a `disputed` transfer is later manually confirmed by admin (via AdminTransfers "Confirm" action), we should trigger the buyer notification at that point.

### Changes

**File 1: `supabase/functions/resolve-transfer-email/index.ts`**
- After looking up the transfer, fetch `status` and `verification_result` (currently only fetches `order_id`)
- If `status === "disputed"`, skip forwarding, log a console message, and return `{ forwarded: false, reason: "mismatch_blocked" }`
- If `status === "confirmed"` or `pending`, proceed with forward as normal

**File 2: `src/components/admin/AdminTransfers.tsx`**
- When admin clicks "Confirm" on a disputed transfer, after updating the status, also invoke `notify-buyer-transfer` with `action: "confirm"` to send the buyer their transfer notification (this already exists and sends the branded "Transfer Verified" email)

### Flow After Changes

```text
Seller uploads proof
  → AI verifies → status = confirmed OR disputed

Ticketmaster email arrives at inbound.seats.ca
  → resolve-transfer-email checks status
  → disputed? BLOCK forward, log it
  → confirmed/pending? FORWARD to buyer

Admin reviews disputed transfer
  → clicks "Confirm" → buyer gets notification
```

### Technical Details
- The `resolve-transfer-email` select query changes from `.select("order_id")` to `.select("order_id, status, verification_result")`
- No database migration needed — uses existing `status` column
- Two Edge Functions redeployed: `resolve-transfer-email`
- One UI file updated: `AdminTransfers.tsx` (confirm action triggers buyer email)

