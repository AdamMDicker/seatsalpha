

# Hide Buyer Identity from Sellers — Transfer Relay System

## Problem
Currently, when a ticket sells, the seller receives the buyer's email address so they can transfer tickets (e.g., via Ticketmaster). This lets sellers poach customers and cut Seats.ca out of future transactions.

## Solution: Seats.ca as the Transfer Middleman

The seller never sees the buyer's email. Instead:

1. **Seller notification emails and in-app notifications no longer include buyer email** — replaced with an order reference number (e.g., "Order #ABC123")
2. **Seller uploads transfer confirmation** (screenshot/image) to their Seller Portal, tagged to the specific order
3. **Seats.ca forwards the transfer details to the buyer** automatically via email, including the transfer image/screenshot
4. **Admin can review** all pending transfers and manually intervene if needed

```text
Current flow:
  Sale → Seller gets buyer email → Seller transfers directly → Buyer gets tickets

New flow:
  Sale → Seller gets order ref (no email) → Seller uploads transfer proof →
  System emails buyer with transfer details → Buyer gets tickets
```

## Implementation

### 1. Database: New `order_transfers` table
- `id`, `order_id`, `ticket_id`, `seller_id`, `transfer_image_url` (storage path), `status` (pending/uploaded/confirmed/disputed), `uploaded_at`, `confirmed_at`, `created_at`
- RLS: sellers can insert/update own rows; admins full access; buyers cannot see

### 2. Remove buyer email from seller-facing data
- **stripe-webhook**: Remove `buyerEmail` from `sellerEmailHtml()` — replace "Buyer" row with "Order Ref" showing order ID
- **stripe-webhook**: Remove `buyer_email` from seller notification metadata
- **send-transactional-email**: Same removal from `sellerNotificationHtml()`
- **Seller Sales Dashboard**: Never display buyer email anywhere

### 3. Seller Portal: Transfer Upload UI
- Add a "Pending Transfers" section to the seller dashboard showing orders awaiting transfer proof
- Each order card shows: event, section/row, quantity, order ref — no buyer info
- Upload button lets seller attach a screenshot from `seat-images` storage bucket
- On upload, status moves to `uploaded` and triggers an automated email to the buyer

### 4. Edge Function: `notify-buyer-transfer`
- Triggered when seller uploads transfer proof (or via database trigger/webhook)
- Looks up buyer email from `orders.user_id → profiles.email`
- Sends buyer an email: "Your tickets have been transferred! Here's the confirmation:" with the attached image
- Seller never touches the buyer's email — the system handles delivery

### 5. Admin Transfer Monitor
- New tab or section in admin dashboard showing all transfers
- Filter by status (pending/uploaded/confirmed)
- Admin can mark confirmed, flag disputes, or re-send buyer notification

## Files to Create
- `src/components/reseller/SellerTransfers.tsx` — upload UI for pending transfers
- `supabase/functions/notify-buyer-transfer/index.ts` — sends transfer proof to buyer

## Files to Modify
- `supabase/functions/stripe-webhook/index.ts` — remove buyer email from seller notifications
- `supabase/functions/send-transactional-email/index.ts` — remove buyer email from seller template
- `src/pages/ResellerDashboard.tsx` — add Transfers tab
- `src/components/reseller/SellerSalesDashboard.tsx` — ensure no buyer emails shown
- Database migration for `order_transfers` table

## Key Decisions
- Sellers are identified by order reference only — they see event details, seat info, and an order number, but never the buyer's name or email
- The transfer image goes through Seats.ca storage, then is forwarded to the buyer by the system
- This preserves the customer relationship with Seats.ca while still enabling ticket fulfillment

