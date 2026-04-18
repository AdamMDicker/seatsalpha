
The user confirmed the full transfer flow works end-to-end. The only remaining issue is the credit card statement showing "MILK GIVEAWAYS" instead of "Seats.ca". 

This is the same issue flagged in the earlier `.lovable/plan.md`. The statement descriptor PREFIX comes from the Stripe account's business profile, not from code — so it can only be changed in the Stripe Dashboard. Code already passes a `statement_descriptor_suffix` (e.g. "Toronto Tickets") on every checkout.

I should:
1. Clearly explain that this is a Stripe account-level setting that I cannot change from code.
2. Give exact step-by-step Stripe Dashboard instructions.
3. Verify the suffix logic in `create-payment` is solid (it already is — falls back to `SEATS.CA TICKETS`), and check whether `create-checkout` (membership) and `create-seller-checkout` / `create-seller-signup-fee` also set descriptors so the prefix swap covers ALL charges.

Let me check the other checkout functions to see if they also need descriptor suffixes added for consistency once the prefix is updated.

## Plan: Fix "MILK GIVEAWAYS" on credit card statements

### Root cause
On every cardholder statement, the descriptor reads `<PREFIX>* <suffix>` — e.g. `MILK GIVEAWAYS* Toronto Tickets`. The **prefix** ("MILK GIVEAWAYS") is set on the Stripe account itself (Public business name / Shortened descriptor), not in code. No edge function change can override it.

### Action required from you (Stripe Dashboard) — only way to fix this

1. Open Stripe Dashboard → **Settings** → **Business** → **Public details**
2. Set **Public business name** → `Seats.ca`
3. Open **Settings** → **Business** → **Customer support** (or **Statement descriptor** section)
4. Set **Shortened descriptor** → `SEATS.CA` (max 22 chars, A–Z, 0–9, spaces only)
5. Save. Stripe may take a few minutes to propagate; new charges will read `SEATS.CA* <suffix>`.

Do this on the **live-mode** account (`acct_1T9boTBgGwQ8YCQe`).

### Code-side cleanup (small, optional, while we're here)

`create-payment` already passes a clean suffix. The other checkout flows do **not** currently set a `statement_descriptor_suffix`, so once you update the Stripe prefix they'll read just `SEATS.CA*` with no context. I'll add short, on-brand suffixes:

| Flow | File | Suffix to add |
|------|------|---|
| Membership / membership+ticket | `supabase/functions/create-checkout/index.ts` | `MEMBERSHIP` |
| Seller weekly subscription | `supabase/functions/create-seller-checkout/index.ts` | `SELLER WEEKLY` |
| Seller one-time signup fee | `supabase/functions/create-seller-signup-fee/index.ts` | `SELLER SIGNUP` |

Each addition is a single `payment_intent_data` (one-time) or `subscription_data` (recurring) block with `statement_descriptor_suffix` ≤ 22 chars.

### Files to edit
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/create-seller-checkout/index.ts`
- `supabase/functions/create-seller-signup-fee/index.ts`

No DB migrations. No frontend changes. No new secrets.

### How to verify after Stripe change
1. Update Stripe Public business name + Shortened descriptor.
2. Make one $1 test purchase on live (or just wait for next real charge).
3. Check the cardholder statement — should read `SEATS.CA* <city> Tickets`.

<lov-actions>
<lov-suggestion message="Approved — apply the suffix cleanup to the other three checkout functions">Apply code cleanup</lov-suggestion>
<lov-suggestion message="Skip the code cleanup, I'll just update the Stripe Dashboard prefix">Just update Stripe, skip code</lov-suggestion>
<lov-suggestion message="Walk me through the exact Stripe Dashboard screens with screenshots of where to click">Show me the Stripe screens in detail</lov-suggestion>
</lov-actions>
