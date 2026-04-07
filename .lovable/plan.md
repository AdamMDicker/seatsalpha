

# Fix the Transfer Email Gap

## Problem
Ticketmaster and similar platforms require a recipient email to transfer tickets. The masked alias system was removed, leaving no email for sellers to use when fulfilling orders externally.

## Recommended Solution: Restore Masked Aliases with Simple Forwarding

Generate a unique per-order alias (e.g., `order-a1b2c3d4@transfers.seats.ca`) that forwards to the buyer's real email. The seller sees only the alias.

### How it works
1. Sale happens → system generates alias `order-XXXX@transfers.seats.ca` and stores it in `order_transfers.transfer_email_alias`
2. Seller sees the alias in their Transfers tab with a "Copy" button and instructions: "Transfer your tickets to this address on Ticketmaster"
3. Buyer receives the Ticketmaster transfer notification at their real email (via forwarding)
4. Seller also uploads proof-of-transfer screenshot on Seats.ca as confirmation

### Infrastructure required (outside Lovable)
- **Cloudflare Email Routing** (or similar): Set up a catch-all on `transfers.seats.ca` that forwards `*@transfers.seats.ca` → a worker or directly to a lookup endpoint
- Alternatively, use a simple email forwarding service that accepts a webhook to resolve the alias → real email mapping

### Code changes

**1. Restore alias generation in stripe-webhook**
- In `supabase/functions/stripe-webhook/index.ts`, re-add the alias generation when creating `order_transfers`:
  ```
  const aliasRef = orderId.replace(/-/g, "").slice(0, 8).toLowerCase();
  const transferEmailAlias = `order-${aliasRef}@transfers.seats.ca`;
  ```
- Store it in `transfer_email_alias` column (already exists in DB)

**2. Restore alias display in SellerTransfers.tsx**
- Show the alias in the pending transfer card with a copy button
- Instructions: "Transfer your tickets to this email on Ticketmaster (or your ticket platform). Then upload a screenshot of the completed transfer below."
- Add `Copy` and `Mail` icon imports back

**3. Create a forwarding lookup edge function**
- `supabase/functions/resolve-transfer-email/index.ts`
- Accepts `{ alias: "order-a1b2c3d4@transfers.seats.ca" }`
- Looks up `order_transfers` by alias → finds order → finds buyer profile email
- Returns the real email (for the email forwarding service to use)
- Secured with a shared secret header (not public)

### Files to modify
- `supabase/functions/stripe-webhook/index.ts` — restore alias generation
- `src/components/reseller/SellerTransfers.tsx` — restore alias display + copy button

### Files to create
- `supabase/functions/resolve-transfer-email/index.ts` — alias→email lookup for forwarding

### What you need to set up externally
- DNS: MX record for `transfers.seats.ca` pointing to your forwarder
- Cloudflare Email Routing (free) or Mailgun/Resend inbound routing with a webhook that calls the `resolve-transfer-email` function to get the real destination

