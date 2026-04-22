

## Fix Stripe Seller Webhook — Stop 45 Failed Deliveries

### Root cause
Stripe's email reports 45 failed deliveries to `/functions/v1/seller-stripe-webhook` since April 16. Our DB only logged 2 successful events in that window, meaning the other 43 never reached business logic.

The function currently returns **HTTP 400** in three cases:
1. Missing `stripe-signature` header
2. Failed signature verification
3. Missing env vars (returns 500)

Stripe's message is explicit: *"You need to return any status code between HTTP 200 to 299 for Stripe to consider the webhook event successfully delivered."* Every 4xx/5xx triggers a retry storm and the impending April 25 disable deadline.

The most likely trigger: signature mismatches from rotated secrets, Connect account events, or events from a sibling webhook misrouted to this URL. Either way, the fix is to **always 200** Stripe, and log the failure for our own visibility.

### Changes to `supabase/functions/seller-stripe-webhook/index.ts`

1. **Missing signature** → return **200** with `{ received: true, ignored: "no_signature" }` (was 400). Log to `stripe_webhook_events` as `ignored_no_signature`.
2. **Signature verification failure** → return **200** with `{ received: true, signature_failed: true }` (was 400). Log to `stripe_webhook_events` with status `signature_failed` and the error message, plus the raw event ID if parseable from the body. This is critical: Stripe stops retrying, but we still see the problem in Admin → Webhook Events.
3. **Missing env vars** → return **200** with `{ received: true, misconfigured: true }` (was 500). Log a `console.error` so it surfaces in function logs.
4. Keep all existing post-verification logic (HANDLED set, processing_error 200 ack) untouched — that part is already correct.

### Admin visibility
The existing `AdminWebhookEvents.tsx` table already renders `error_message` and a status badge — new `signature_failed` and `ignored_no_signature` statuses will appear automatically. No UI work required, but we'll add `signature_failed` to the `STATUS_STYLES` map so it gets a red/destructive badge instead of falling back to the default.

### Files touched
- `supabase/functions/seller-stripe-webhook/index.ts` — change three response paths from 4xx/5xx to 200, add audit logging on signature failure
- `src/components/admin/AdminWebhookEvents.tsx` — add `signature_failed` to status styles map

### Outcome
- Stripe receives 2xx for every delivery → retry storm stops, April 25 disable threat removed
- Real signature problems now surface in Admin → Webhook Events with full error message instead of being invisible
- No risk to legitimate events: the existing signature-verified branch is unchanged

