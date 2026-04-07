

# Seller Membership & Payment Enforcement System

## Summary
Build a complete seller subscription system: $9.99/week recurring charge via Stripe, credit card collection before any listing, discount codes for fee waivers, automatic ticket delisting on payment failure, admin complaint enforcement (suspend + pre-auth hold), adjustable fees, and a seller sales portal.

---

## Current State
- Sellers apply, get approved, sign agreement, then can upload CSV / view "My Tickets"
- No payment collection or subscription enforcement exists for sellers
- Buyer membership ($49.95/year) already uses Stripe via `create-checkout` edge function

---

## Plan

### 1. Database Changes (migration)

**New table: `seller_subscriptions`**
- `id`, `reseller_id` (references resellers), `stripe_subscription_id`, `stripe_customer_id`, `status` (active/past_due/canceled/suspended), `current_period_end`, `weekly_fee` (default 9.99), `discount_code` (nullable), `created_at`, `updated_at`

**New table: `seller_discount_codes`**
- `id`, `code` (unique), `is_active`, `description`, `created_at`, `created_by`
- Seed 10 discount codes (e.g., SELLER001–SELLER010) that waive the weekly fee entirely

**Add columns to `resellers`:**
- `is_suspended` (boolean, default false) — for complaint-based shutdowns
- `stripe_customer_id` (text, nullable) — link to Stripe customer

**RLS:** Admin full access on both new tables; resellers can read own subscription record.

### 2. Stripe Setup

- Create a Stripe product "Seller Membership" with a $9.99 CAD weekly recurring price
- Store the `price_id` in code as a constant

### 3. Edge Function: `create-seller-checkout`

- Authenticated reseller calls this after agreement is signed
- Accepts optional `discount_code` — if valid, creates a 100%-off coupon/free subscription
- Creates Stripe Checkout Session (mode: subscription, weekly interval)
- On success, redirects to `/reseller?subscription=success`
- Stores `stripe_customer_id` on the reseller record

### 4. Edge Function: `seller-stripe-webhook`

Listens for:
- `checkout.session.completed` → create `seller_subscriptions` record, mark status active
- `invoice.payment_succeeded` → update `current_period_end`, ensure tickets stay active
- `invoice.payment_failed` → set subscription status to `past_due`, **immediately deactivate all seller's tickets** (`UPDATE tickets SET is_active = false WHERE seller_id = X AND is_reseller_ticket = true`)
- `customer.subscription.deleted` → mark canceled, delist all tickets

### 5. Gating Logic (ResellerDashboard)

Current flow adds two new gates after agreement acceptance:

```text
Apply → Approved → Sign Agreement → Add Credit Card (Stripe checkout) → Dashboard unlocked
```

- After agreement, show "Set Up Weekly Billing" step with credit card form
- Optional discount code input field
- Block CSV upload and single-ticket upload until `seller_subscriptions.status = 'active'`
- If subscription lapses, show "Payment Required" banner and hide upload tools

### 6. Admin Complaint Enforcement

Add to `AdminResellers` component:
- **"Suspend Seller"** button → sets `resellers.is_suspended = true`, deactivates all their tickets
- **"Pre-Auth Hold"** button → calls new edge function `seller-preauth` that creates a Stripe `PaymentIntent` with `capture_method: manual` (e.g., $500 hold) on the seller's stored card
- **"Unsuspend"** button to restore access
- Suspended sellers see "Account Suspended — Contact Support" on their dashboard

### 7. Admin Fee Adjustment

In `AdminResellers`:
- Global fee override: input field to set default weekly fee for all new subscriptions
- Per-reseller fee override: editable field on each reseller card that updates `seller_subscriptions.weekly_fee` and modifies the Stripe subscription price via API

### 8. Seller Portal Enhancements

Expand the existing "My Tickets" section into a full seller portal tab on `/reseller`:
- **Sales Dashboard**: total revenue, tickets sold, active listings count (query from `orders` + `order_items` where ticket seller_id matches)
- **Listings Tab**: existing "My Tickets" component (already built)
- **Billing Tab**: current subscription status, next billing date, payment history link (Stripe customer portal)
- **Account Tab**: business info, subscription plan, discount code status

### 9. Discount Codes

- Admin can create/manage codes in a new "Seller Codes" tab in admin dashboard
- Seller enters code during checkout step — validated against `seller_discount_codes` table
- Valid code creates a free Stripe subscription (100% coupon) so the seller still has a subscription record but pays $0

---

## Technical Details

### Files to Create
- `supabase/functions/create-seller-checkout/index.ts`
- `supabase/functions/seller-stripe-webhook/index.ts`
- `supabase/functions/seller-preauth/index.ts`
- `src/components/reseller/SellerBillingSetup.tsx`
- `src/components/reseller/SellerSalesDashboard.tsx`
- `src/components/reseller/SellerBillingTab.tsx`
- `src/components/admin/AdminSellerCodes.tsx`

### Files to Modify
- `src/pages/ResellerDashboard.tsx` — add billing gate + portal tabs
- `src/components/admin/AdminResellers.tsx` — add suspend/preauth/fee controls
- `src/pages/AdminDashboard.tsx` — add "Seller Codes" tab
- `supabase/config.toml` — register new edge functions
- Database migration for new tables + columns

### Webhook Configuration
- New Stripe webhook endpoint for seller events at `/functions/v1/seller-stripe-webhook`
- Requires adding the webhook secret as a new secret: `SELLER_STRIPE_WEBHOOK_SECRET` (or reuse existing webhook endpoint with event routing)

