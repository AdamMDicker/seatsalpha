
## Plan: Sync April 2026 inventory from Google Sheet

The existing `sync-inventory` edge function already pulls the full "All Tickets" tab from the hardcoded public Google Sheet URL and:
- Inserts new events
- Updates existing event metadata
- Inserts new tickets
- Updates price/quantity on existing tickets
- Deactivates stale (removed) tickets

It processes **every** game in the sheet — not just one date — so running it once will refresh April 2026 along with everything else.

### Steps
1. Invoke the `sync-inventory` edge function (admin-authenticated).
2. Report the result counts: new events, updated events, new tickets, updated tickets, deactivated tickets.
3. Spot-check April 2026 events in the DB to confirm the sync landed (count of active tickets per April game).

No code changes. Pure data sync via existing infrastructure.
