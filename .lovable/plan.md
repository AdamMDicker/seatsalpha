
The user wants to verify the test ticket (Sept 11, Section 207, Row 1, qty 20, $1) is purchasable. I already inserted this earlier (id `c297f26e-2dc6-4d62-a609-1b3da9fac603`). Let me check its current state and ensure it's active and not sold out.

I'll query the DB to confirm, then if needed: set `is_active=true`, ensure `quantity_sold < quantity`, confirm event is in the future and visible.

## Plan

1. Verify ticket `c297f26e-2dc6-4d62-a609-1b3da9fac603` state: `is_active`, `quantity`, `quantity_sold`, `price`.
2. If `is_active=false` → reactivate.
3. If `quantity_sold >= quantity` → reset `quantity_sold=0` (or bump quantity) so it shows as available.
4. Confirm event date (Sept 11, 2026) is future and event is visible.
5. Confirm it appears in `public_tickets` view for the buyer flow.

No code changes needed — data-only operation via the insert/update tool.
