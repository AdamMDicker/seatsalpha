
## Two small fixes

### 1. Make "Complete" look like "Verified" in the Seller Portal

The `confirmed` status badge already shows a green "Verified ✓" pill, but the action column also adds a tiny muted "Complete" line under it that's hard to see — that's the text you barely noticed.

**Fix:** Remove the duplicate muted "Complete" indicator at the bottom of the action cell in `src/components/reseller/SellerTransfers.tsx` (lines 404–408). The existing green "Verified ✓" badge in the Status column already conveys the state with high contrast — same as the admin portal.

### 2. Stripe statement descriptor still shows "MILK GIVEAWAYS"

The code already passes `statement_descriptor_suffix` (e.g. "Toronto Tickets") on every checkout, but the prefix on the cardholder's statement comes from the **Stripe account's business profile**, not from code. That prefix is currently set to "MILK GIVEAWAYS" on the Stripe account itself, so all charges read `MILK GIVEAWAYS* Toronto Tickets`.

**Fix:** Update the Stripe account's public business name / shortened descriptor to `SEATS.CA`. This must be changed in the Stripe Dashboard (Settings → Public details / Business → Statement descriptor). I can't change account-level branding from code — but once you update it in Stripe, all future charges will read `SEATS.CA* <city> Tickets` automatically with no code change needed.

I'll also tighten the suffix logic to fall back to `SEATS.CA TICKETS` if no city is parseable, so the full statement line stays on-brand.

### Files to edit
- `src/components/reseller/SellerTransfers.tsx` — remove redundant "Complete" line
- `supabase/functions/create-payment/index.ts` — minor cleanup of suffix fallback

### Action required from you (Stripe Dashboard)
Open Stripe → **Settings → Public details** and change:
- **Public business name** → `Seats.ca`
- **Shortened descriptor** → `SEATS.CA`

This is the only way to remove "MILK GIVEAWAYS" from card statements.

<lov-actions>
<lov-suggestion message="Approved — apply both fixes">Approved</lov-suggestion>
<lov-suggestion message="Just fix the Complete badge — I'll update Stripe descriptor myself later">Only fix the badge</lov-suggestion>
<lov-suggestion message="Walk me through exactly where in Stripe Dashboard to change the descriptor">Show me the Stripe steps</lov-suggestion>
</lov-actions>
