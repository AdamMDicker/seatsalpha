

# Solving the Transfer Email Problem

## The Gap
Ticket platforms (Ticketmaster, AXS, etc.) require an email to transfer tickets. We've hidden the buyer's email from sellers, but haven't provided an alternative.

## Recommended Approach: Seats.ca Relay Email

Create a **dedicated transfer email** like `transfers@seats.ca` (or per-order unique aliases like `order-ABC12345@transfers.seats.ca`) that Seats.ca controls. The flow becomes:

```text
1. Sale happens → seller sees "Transfer to: transfers@seats.ca" (or a unique alias)
2. Seller transfers tickets on Ticketmaster to that email
3. Seats.ca accepts the transfer in the relay inbox
4. Seats.ca then re-transfers to the buyer's actual email (or sends them the tickets directly)
```

### Problem with this approach
Seats.ca would need to **manually accept and re-transfer every ticket** — this doesn't scale without significant ops or automation tooling (Ticketmaster has no public API for accepting transfers programmatically).

## Practical Alternative: Buyer-Specific Transfer Email (Masked)

Generate a **masked forwarding alias** per order that maps to the buyer's real email but hides it from the seller. For example:

- Seller sees: `order-a1b2c3@transfers.seats.ca`
- That alias forwards to: `buyer@gmail.com`
- Buyer receives the Ticketmaster transfer directly

### Implementation

1. **Email forwarding infrastructure** — Set up a catch-all on `transfers.seats.ca` that routes `order-{id}@transfers.seats.ca` to the buyer's real email
2. **Show the alias in Seller Transfers UI** — each pending transfer card displays "Transfer tickets to: `order-XXXX@transfers.seats.ca`"
3. **Database** — add `transfer_email_alias` column to `order_transfers`
4. **Edge function update** — when `order_transfers` is created (in stripe-webhook), generate and store the alias

### Files to modify
- `supabase/functions/stripe-webhook/index.ts` — generate alias when creating `order_transfers`
- `src/components/reseller/SellerTransfers.tsx` — display the transfer email alias on each card
- Migration — add `transfer_email_alias` text column to `order_transfers`
- Email infrastructure — configure catch-all forwarding on `transfers.seats.ca` subdomain

### Trade-off
This requires **email forwarding infrastructure** (e.g., Mailgun/SendGrid inbound routes, or a simple SMTP forwarder). The alias approach is the cleanest — sellers transfer directly to the buyer via Ticketmaster, but never see the real email. Seats.ca maintains the mapping.

### Alternative: Manual / No-Tech Option
If email forwarding infra is too complex right now, the simplest stopgap is:
- **Admin manually provides the buyer email** to the transfer system (not to the seller) and Seats.ca staff handle transfers
- Or: display the buyer's email **only in the transfer UI** with a disclaimer that it's for transfer purposes only — weaker privacy but functional

## Decision needed
The masked forwarding alias is the strongest solution but requires email routing setup. Want to proceed with that, or start with a simpler interim approach?

