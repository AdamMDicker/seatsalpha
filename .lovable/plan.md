## Goal

Update all pricing across site + Stripe to:

| Item | Current | New regular | Promo (shown) |
|---|---|---|---|
| Buyer Membership | $49.95/yr | **$99.99/yr** (strikethrough) | **$59.99/yr** (40% off) |
| Seller Sign-Up Fee | $100 (one-time) | **$199.99** (strikethrough) | **$99.99** (50% off) |

Plus: when a buyer purchases a membership at checkout that's bundled with a ticket from a specific seller, credit that seller **$20**.

---

## 1. Stripe products & prices

Create new prices via Stripe MCP (keep old prices archived in case of replay):

- **Buyer Membership (recurring, yearly, CAD)**
  - Promo price: **$59.99 CAD/year** (`recurring_interval: year`) → save new price ID
  - Strikethrough price ($99.99) is **display-only**, not billed.
- **Seller Sign-Up Fee (one-time, CAD)**
  - Promo price: **$99.99 CAD** one-time → save new price ID
  - Strikethrough ($199.99) is display-only.

Both new price IDs will be hardcoded into:
- `supabase/functions/create-checkout/index.ts` → replace `price_1TKTCMBgGwQ8YCQeW2OAT6Vh`
- `supabase/functions/create-seller-signup-fee/index.ts` → replace the dynamically-created $100 price (also clear the cached `seller_signup_fee_price_id` row in `site_settings` so the new hardcoded ID takes over)

---

## 2. Frontend pricing display

Centralize pricing in a new `src/config/pricing.ts`:
```
MEMBERSHIP_PRICE = 59.99
MEMBERSHIP_PRICE_ORIGINAL = 99.99
MEMBERSHIP_DISCOUNT_PCT = 40
SELLER_SIGNUP_PRICE = 99.99
SELLER_SIGNUP_PRICE_ORIGINAL = 199.99
SELLER_SIGNUP_DISCOUNT_PCT = 50
SELLER_MEMBERSHIP_REFERRAL_BONUS = 20
```

Replace every hardcoded `$49.95` / `49.95` / `$100` in:
- `src/components/MembershipSection.tsx` — show strikethrough $99.99 + promo $59.99 + "40% OFF" badge
- `src/components/SolutionSection.tsx`
- `src/components/team/FeeGateDialog.tsx` (lines 150, 413, 451 — also the membership math)
- `src/pages/Membership.tsx` (~10 occurrences, including the savings ROI math `totalSaved / 49.95`)
- `src/pages/About.tsx`
- `src/pages/TermsOfService.tsx` (membership amount mention)
- `src/components/reseller/SellerSignupFee.tsx` — show strikethrough $199.99 + promo $99.99 + "50% OFF" badge
- `supabase/functions/chat-support/index.ts` — system prompt mentions $49.95
- `supabase/functions/stripe-webhook/index.ts` line 265 — "$100 seller sign-up fee" copy
- `supabase/functions/create-checkout/index.ts` line 126 — `membership_amount: "49.95"` → `"59.99"`
- `src/test/iphone-purchase-flow.test.tsx` — update `MEMBERSHIP_PRICE` constant + breakeven thresholds

Visual treatment for strikethrough/promo:
```
<span class="line-through text-muted-foreground">$99.99</span>
<span class="text-gold font-bold">$59.99</span>
<Badge>40% OFF</Badge>
```

---

## 3. Seller $20 referral credit

When a buyer pays via the **bundled membership + ticket** checkout (already exists in `create-checkout`), and the ticket has a `seller_id`, credit that seller $20.

**Database (migration):**
```sql
CREATE TABLE public.seller_credits (
  id uuid PK default gen_random_uuid(),
  seller_id uuid not null,
  order_id uuid,
  amount numeric not null,
  reason text not null,             -- 'membership_referral'
  status text not null default 'pending',  -- pending | paid
  created_at timestamptz default now(),
  paid_at timestamptz
);
-- RLS: admins manage all; sellers SELECT own
```

**Webhook logic** (`supabase/functions/stripe-webhook/index.ts`, in the must-succeed block where `order_transfers` is created):
- Detect membership bundle: `meta.membership_amount` present AND parseFloat > 0.
- Look up the ticket's `seller_id`. If it exists and is **not** the admin fulfillment user, insert into `seller_credits` (amount=20, reason='membership_referral', order_id, seller_id).
- Skip if seller_id is the admin user (no self-credit on platform-owned tickets).

**Admin UI:** New "Seller Credits" tab in `AdminDashboard.tsx` (small table) listing pending credits with a "Mark Paid" action that updates `status='paid'` + `paid_at`. Out-of-scope: actual Stripe Connect transfer — credits are tracked manually for now and reconciled with the existing 2-week post-event payout cycle. (Easy to extend later to auto-transfer.)

**Seller dashboard:** add a small "Bonus Credits" summary card on `ResellerDashboard.tsx` showing total pending + paid bonus credits.

---

## 4. Memory updates

Update `mem://business-logic/membership-model` and the Core memory line:
> Pricing model: ~~$49.95/yr~~ **$59.99/yr (promo, regular $99.99)** membership for $0 fees. Non-members pay LCC (13%). Sellers earn $20 referral credit when a buyer adds membership at checkout on their ticket.

Update `mem://business-logic/seller-payouts` to mention the $20 referral credit.

---

## Out of scope
- Automatic Stripe Connect transfers for the $20 credit (admin marks paid manually for now).
- Migrating existing $49.95 active subscriptions — they stay grandfathered at their current price; only new signups get the new pricing.
- Promo end-date logic (the discount is presented as ongoing; no countdown timer).