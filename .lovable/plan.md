

## Plan: Fix April 11 Tickets, Remove Featured Ticket Cap, and Audit All Dates

### Problem
1. **April 11 has no tickets on site** — the spreadsheet shows 2 entries (Section 118 Row 9 and Section 521 Row 5), but both are $0 comp tickets which the import logic excludes
2. **Featured tickets capped at 4 per game** — line 236 of `TicketListings.tsx` has `.slice(0, 4)`, hiding additional featured tickets
3. Possible other dates with missing/wrong tickets across the full schedule

### Changes

**1. Remove featured ticket display cap**
- `src/components/team/TicketListings.tsx` line 236: Remove `.slice(0, 4)` so ALL featured tickets are shown for every game

**2. Insert missing April 11 comp tickets**
- Run a script to insert the 2 missing tickets for the April 11 Blue Jays vs Twins game (Section 118 Row 9, qty 2, $0 and Section 521 Row 5, qty 2, $0) as featured tickets (`is_reseller_ticket: false`)
- Ensure the April 11 event exists and has `is_giveaway: true`, `giveaway_item: 'Barger Couch T-Shirt Giveaway'`

**3. Full audit: spreadsheet vs database**
- Run a comprehensive Python script that:
  - Fetches the full spreadsheet CSV
  - Queries all Blue Jays events and their featured tickets from the database
  - For each game date, compares expected tickets (excluding SWAP rows but INCLUDING $0 comps) against what's in the DB
  - Identifies: missing tickets, wrong prices, wrong quantities, missing events
  - Inserts/updates any discrepancies found

### Technical Details
- The sync-inventory edge function filters out `price <= 0` (line 142) and only imports 500-level sections (lines 148-150) — this is why most featured tickets come from manual/admin imports, not the sync function
- The comp ($0) tickets are legitimate inventory that should appear on site — they just show as "$0 CAD" and go through the normal purchase flow
- No changes to the sync-inventory function needed — the audit script handles the one-time data fix directly

