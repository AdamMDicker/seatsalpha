

# Seller System Updates

## Summary
Change the weekly fee to $1, add a one-time $100 seller sign-up fee, add an "Other/Events" category for non-league listings, and lay groundwork for Stripe Connect payouts.

## Changes

### 1. Weekly fee: $9.99 → $1.00
- `supabase/functions/create-seller-checkout/index.ts`: Change `unit_amount: 999` to `unit_amount: 100`
- `supabase/functions/seller-stripe-webhook/index.ts`: Change fallback `|| 999` to `|| 100`
- `src/components/reseller/SellerBillingSetup.tsx`: Update "$9.99 CAD/week" text to "$1.00 CAD/week"
- `src/components/reseller/SellerBillingTab.tsx`: No code change needed (reads fee from DB)
- Database migration: Update `seller_subscriptions` default `weekly_fee` from 9.99 to 1.00
- Delete the cached `seller_weekly_price_id` from `site_settings` so a new $1 Stripe price is created on next checkout

### 2. One-time $100 seller sign-up fee
This is a separate one-time Stripe charge before the weekly subscription begins. The flow becomes: **Apply → Approve → Sign Agreement → Pay $100 sign-up fee → Set up $1/week billing → List tickets.**

- Create a new edge function `create-seller-signup-fee/index.ts` that creates a Stripe Checkout session in `mode: "payment"` for $100 CAD
- Add a `signup_fee_paid_at` column to `resellers` table
- Update the stripe-webhook to handle the signup fee checkout completion (set `signup_fee_paid_at`)
- Update `ResellerDashboard.tsx` gating logic: after agreement, check `signup_fee_paid_at` before showing the weekly billing setup
- Create a `SellerSignupFee.tsx` component (similar to `SellerBillingSetup.tsx`) with a "Pay $100 Sign-Up Fee" button
- Update `SellerBillingSetup.tsx` text to clarify this is the recurring weekly charge (separate from sign-up)

### 3. "Other/Events" category for non-league listings
- Add "OTHER" to the league/category system so sellers can list concerts, NFL, etc.
- Update `reseller_leagues` seed/defaults to include "OTHER"
- Update `AdminLeagueVisibility.tsx` and admin reseller league toggles to include "OTHER"
- Update CSV import validation to accept "OTHER" as a valid sport/league
- Update team page routing to handle generic "Other" events (or list them on a general events page)

### 4. Stripe Connect for seller payouts (foundation only)
This is a larger feature. For now, lay the groundwork:
- Add a `stripe_connect_account_id` column to `resellers` table
- Create `create-seller-connect-account/index.ts` edge function that creates a Stripe Connect Express account and returns the onboarding link
- Add a "Set Up Payouts" section in the seller portal that initiates Connect onboarding
- Actual payout automation (transfers after events) will be a follow-up task

### 5. Pre-auth hold amount — make configurable in admin UI
- Currently hardcoded to $500 default but already accepts custom `amount_cents`
- Add an input field in `AdminResellers.tsx` next to the Pre-Auth button so admins can specify the hold amount per complaint (default $500, adjustable)

## Files to create
- `supabase/functions/create-seller-signup-fee/index.ts`
- `src/components/reseller/SellerSignupFee.tsx`
- `supabase/functions/create-seller-connect-account/index.ts`

## Files to modify
- `supabase/functions/create-seller-checkout/index.ts`
- `supabase/functions/seller-stripe-webhook/index.ts`
- `supabase/functions/stripe-webhook/index.ts` (handle signup fee completion)
- `src/components/reseller/SellerBillingSetup.tsx`
- `src/pages/ResellerDashboard.tsx`
- `src/components/admin/AdminResellers.tsx`
- `src/components/admin/AdminLeagueVisibility.tsx`
- CSV import components (reseller + admin)

## Database migration
- `ALTER TABLE resellers ADD COLUMN signup_fee_paid_at timestamptz;`
- `ALTER TABLE resellers ADD COLUMN stripe_connect_account_id text;`
- `ALTER TABLE seller_subscriptions ALTER COLUMN weekly_fee SET DEFAULT 1.00;`
- Delete cached price ID: `DELETE FROM site_settings WHERE key = 'seller_weekly_price_id';`

