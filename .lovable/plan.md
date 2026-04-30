
# Import Manus Fixes into Seats.ca

Manus rebuilt the site on a separate Express/tRPC stack and identified **4 bugs** that also exist in our Lovable Edge Functions. Here's what needs to be fixed:

---

## Fix 1: Buyer email missing for returning Stripe customers (Critical)

**Problem:** When `createCheckout` passes an existing Stripe `customer` ID, Stripe doesn't populate `customer_email` on the session. The webhook only checks `session.customer_email` and `session.customer_details?.email` — both can be empty for returning customers. This means the order gets created without a buyer, and no confirmation email is sent.

**Fix:** Add a fallback in `stripe-webhook/index.ts` that calls `stripe.customers.retrieve()` when both session email fields are empty.

---

## Fix 2: Delivery status shows "Delivered" prematurely (High)

**Problem:** In `DeliveryStatusInfo.tsx`, `status === "confirmed"` is treated as delivered. But "confirmed" only means the AI verified the screenshot — the actual delivery to the buyer happens when `forward_sent_at` is set (the Ticketmaster accept link has been relayed).

**Fix:** Change `getDeliveryStage()` so "delivered" requires `forward_sent_at` to be set. Confirmed-but-not-forwarded transfers show "Tickets verified — delivering shortly" instead.

---

## Fix 3: Timezone handling — hardcoded UTC-5 instead of EST/EDT (Medium)

**Problem:** `formatEventDateET()` and `shortDateForSubject()` in the webhook use a hardcoded UTC-5 offset. During Eastern Daylight Time (March-November), all email timestamps are 1 hour off. Since Blue Jays games run April-October, nearly every email shows the wrong time.

**Fix:** Replace the manual offset arithmetic with `Intl.DateTimeFormat` using `timeZone: "America/Toronto"`, which automatically handles EST/EDT transitions.

---

## Fix 4: Email asset URLs use hardcoded Supabase storage path (Low)

**Problem:** `LOGO_URL` and `HERO_BANNER_URL` reference the Supabase storage URL directly. This is currently working but fragile.

**Fix:** This is already using our own Supabase project storage, so no change is needed here — the URLs are correct for our project. We'll skip this one.

---

## Files to Change

1. **`supabase/functions/stripe-webhook/index.ts`** — Fixes 1 + 3
2. **`src/components/DeliveryStatusInfo.tsx`** — Fix 2

After editing the Edge Function, it will be redeployed.

---

## What We're NOT Importing

Manus rebuilt the entire backend on Express + tRPC. We're keeping our existing Supabase Edge Functions architecture — we're only porting the **bug fixes**, not the architecture change.
