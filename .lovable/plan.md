
Goal: stop Stripe from retrying `stripe-webhook`, keep buyer fulfillment intact, and make the Stripe webhook setup reliable for current and future sellers.

What I found
- `supabase/functions/stripe-webhook/index.ts` is the weak point:
  - It uses an older Stripe SDK/API version (`npm:stripe@14.21.0`, `2023-10-16`) while the rest of the project has mostly moved to `2025-08-27.basil`.
  - It does a lot of synchronous work inside `checkout.session.completed` (order creation, order item, transfer row, ticket inventory update, notifications, multiple email queue writes).
  - It lacks a full protective processing wrapper around that branch, so any thrown error can cause a non-2xx response and Stripe will retry.
- `seller-stripe-webhook` has a similar structure and should be hardened too, even though the email you received was about `stripe-webhook`.
- The project memory explicitly says Stripe secret changes require redeploying Stripe-related functions so runtime secrets stay fresh.

Implementation plan
1. Reproduce and inspect the failing webhook path
- Review live webhook logs for `stripe-webhook` to identify whether the failures are:
  - signature mismatch / secret drift
  - timeout / slow processing
  - thrown processing errors on specific event payloads
- Cross-check the recent failing Stripe event types so we know whether failures are from real checkout events or unrelated account events being sent to the endpoint.

2. Harden `stripe-webhook` so Stripe always gets a clean response for non-critical cases
- Add structured logging throughout the function.
- Keep signature failures as explicit non-2xx.
- For valid signed events:
  - immediately acknowledge unsupported/unneeded event types with 200
  - wrap `checkout.session.completed` processing in a robust try/catch
  - make non-essential side effects best-effort so an email/notification issue does not fail purchase fulfillment

3. Make the fulfillment path safer and faster
- Separate “must succeed” steps from “nice to have” steps:
  - Must succeed: idempotency check, order creation, order item, `order_transfers`, ticket quantity update
  - Best effort: notifications, email queue inserts, admin/seller email fan-out
- Add null-safe guards around optional data so missing ticket/profile/transfer rows don’t crash the handler.
- Preserve current order/transfer behavior so buyers still get fulfilled exactly as today.

4. Align Stripe versions and reliability patterns
- Update `stripe-webhook` to the same modern Stripe SDK/API version pattern used elsewhere.
- Apply the same hardening pattern to `seller-stripe-webhook` so seller billing webhooks do not become the next failure source.
- If logs show secret drift rather than code failure, redeploy all Stripe-related backend functions to refresh runtime secrets.

5. Validate end to end
- Test buyer checkout webhook handling with a signed event payload and confirm:
  - Stripe receives 2xx
  - order is created once
  - `stripe_event_id` idempotency still works
  - `order_transfers` alias creation still works
  - buyer/admin/seller notifications remain intact
- Test seller billing webhook events (`checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`) to ensure seller onboarding and billing still work for newly approved sellers.

Technical details
- I do not currently see a required database migration for the first pass.
- If the live logs show repeated duplicate or partial-processing scenarios outside `orders.stripe_event_id`, I would add a dedicated webhook-event tracking table in a follow-up pass, but I would start with code hardening first.
- Backend changes will go live immediately once implemented; no frontend publish step is needed for the webhook fix.
