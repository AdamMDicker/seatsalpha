

## Plan: Fix Transfer Relay Issues (Duplicate Emails, Premature Forward, Broken Button)

### Issue Analysis

**Issue 1 — Duplicate emails (CONFIRMED in DB):**
At 17:08:25 the webhook handler enqueued TWO distinct relay emails to Michael (message IDs `5544a64b…` and `03f3439c…`), 50ms apart. This means Resend's inbound webhook fired twice for the same `inbound_email_id` (`278ec672…`). The current code has **no idempotency check** — it forwards every webhook hit regardless of whether we've already forwarded this exact inbound email.

**Issue 2 — Forward happened with no seller proof:**
The relay forwarded the TM accept link to the buyer immediately upon receiving the inbound email from TM. There is no gate requiring the seller to first upload proof-of-transfer in their dashboard. The user wants the forward blocked until the seller has explicitly marked the transfer as sent (proof uploaded + AI verified, OR at minimum the seller has logged a "transfer initiated" action). For admin-listed tickets (LMK fulfillment, `seller_id IS NULL`), the seller is LMK — they should be required to upload proof in their dashboard before the buyer gets the TM link.

**Issue 3 — "Accept Tickets" button missing/broken in Outlook:**
The accept link WAS extracted (`has_link: true` in DB), so the button HTML was rendered. The screenshot shows a small white pill with just the red ticket emoji and no text — this is Outlook collapsing our `linear-gradient` + emoji + inline-block `<a>` into an unreadable shape. Outlook (especially Outlook.com / new Outlook) does not support `linear-gradient` on `<a>` tags and renders unpredictably with leading emojis inside bold text.

---

### Fixes

**Fix 1 — Idempotency on inbound webhook (`resolve-transfer-email/index.ts`):**
Before forwarding, check if `order_transfers.inbound_email_id` already equals the current `email_id`. If yes → already forwarded, return `{ ignored: true, reason: "duplicate_webhook" }`. This handles Resend's at-least-once delivery semantics safely.

```text
if existing transfer.inbound_email_id === incoming email_id
  → skip enqueue, return ignored
```

**Fix 2 — Gate forward on seller proof upload:**
Modify the inbound webhook flow so that when an inbound TM email arrives at `order-XXXX@inbound.seats.ca`:
- If `order_transfers.transfer_image_url IS NULL` (no proof uploaded) → store the `inbound_email_id` and `accept_link` on the row, but **do NOT forward to buyer**. Instead, send an alert to the seller (or admin/LMK for orphan tickets) saying "TM transfer received but you haven't uploaded proof — please log in and upload proof to release the link to the buyer."
- If `order_transfers.transfer_image_url IS NOT NULL` AND `status IN ('pending','confirmed')` → forward as today.
- When the seller later uploads proof and `verify-transfer-image` succeeds (status flips to `confirmed`), automatically trigger the forward using the stored `accept_link`.

This prevents the "stupid seller" scenario the user described — TM link can't reach the buyer until the seller has done their job.

**Fix 3 — Outlook-safe Accept button (`buildBrandedEmail`):**
Replace the `linear-gradient` + emoji-prefixed inline `<a>` with a bulletproof email button pattern:
- Solid background color (`#059669`) instead of gradient
- Move the 🎟️ emoji to a separate inline span or remove it (Outlook adds odd kerning)
- Use VML fallback (`<!--[if mso]>…<v:roundrect>…<![endif]-->`) so Outlook desktop renders a proper rounded button
- Increase font-size and padding for better tap targets
- Add visible text-link fallback below the button: "Or copy this link: https://…"

---

### Files Touched
- `supabase/functions/resolve-transfer-email/index.ts` — idempotency check + proof gate + bulletproof button HTML
- `supabase/functions/verify-transfer-image/index.ts` — on successful verification, if `accept_link` already stored, trigger the buyer forward (re-use `resolve-transfer-email` manual mode via `transfer_id`)

No DB schema changes needed — `transfer_image_url`, `inbound_email_id`, and `accept_link` columns already exist.

---

### Clarifying Question

For Issue 2: when the inbound TM email arrives but the seller hasn't uploaded proof yet, should the system:

