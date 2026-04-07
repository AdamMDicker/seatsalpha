

# Remove External Email Alias — Keep Transfers Entirely on Seats.ca

## What's Changing

The masked email alias (`order-XXXX@transfers.seats.ca`) was designed for sellers to transfer tickets via Ticketmaster. You don't want that — the entire transfer flow should happen on seats.ca itself.

The current flow already works for this:
1. Sale happens → seller sees a pending transfer card in their portal
2. Seller uploads a screenshot/image of the transfer proof on seats.ca
3. Seats.ca automatically forwards the proof to the buyer via email notification

The seller never sees the buyer's email, name, or any identifying info. They only see event details, seat info, and an order reference number.

## Changes

### 1. Remove the transfer email alias from the seller UI
- Remove the "Transfer tickets to this email" block from `SellerTransfers.tsx` (the `transfer_email_alias` section with copy button)
- Remove the `Mail` and `Copy` icon imports if no longer needed
- Update the pending transfer card to show clearer instructions: "Upload a screenshot of the completed transfer to confirm fulfillment"

### 2. Remove alias generation from the webhook
- Remove the `transfer_email_alias` generation logic from `stripe-webhook/index.ts` (the line that builds `order-XXXX@transfers.seats.ca`)
- The column can stay in the DB (harmless), but it won't be populated or displayed

### 3. No email forwarding infrastructure needed
- No need to configure `transfers.seats.ca` subdomain or catch-all forwarder
- The existing `notify-buyer-transfer` edge function already handles forwarding the proof image to the buyer — that's the entire system

## Files to modify
- `src/components/reseller/SellerTransfers.tsx` — remove alias display, update instructions
- `supabase/functions/stripe-webhook/index.ts` — remove alias generation code

## Result
Sellers upload proof on seats.ca → system emails buyer automatically. No external email infrastructure. Buyer identity fully protected.

