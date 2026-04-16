

# Fix: Make Tickets Visible to All Users (Including Anonymous)

## Root Cause
The `public_tickets` view uses `security_invoker=on`, meaning it respects the caller's RLS permissions on the `tickets` table. The `tickets` table has a SELECT policy for `authenticated` users only — there is **no policy for the `anon` role**. Anonymous visitors get zero tickets back, causing "Tickets coming soon" on every game card.

## Fix

### 1. Add an RLS policy for anonymous ticket reads (database migration)

```sql
CREATE POLICY "Anyone can read active tickets"
  ON public.tickets
  FOR SELECT
  TO anon
  USING (is_active = true);
```

This allows unauthenticated visitors to see active tickets through the `public_tickets` view, just like authenticated users already can. The view already filters to `is_active = true AND quantity > quantity_sold`, so this is safe — no sensitive data (seller_id is visible but that's a UUID, and seat numbers are masked by the view's CASE expression when `hide_seat_numbers` is true).

### 2. No code changes needed
The GameCard and TicketListings components already handle tickets correctly — they just weren't receiving any data for anonymous users. Once the RLS policy is added, everything will work for all user types.

## What Changes
- **Not logged in**: Will see all active tickets (currently sees none)
- **Logged in (customer)**: No change (already works)
- **Reseller**: No change (already works)
- **Admin**: No change (already works)

