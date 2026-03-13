

## Plan: Import 500-Level Tickets as Non-Featured (Reseller) Inventory

### Change

In `supabase/functions/sync-inventory/index.ts`:

1. Add a section filter after `parseSeatTrim` to only import sections 500-599
2. Change `is_reseller_ticket: false` to `is_reseller_ticket: true` for these imported tickets so they appear under "Tickets" instead of "Featured Tickets"

Both changes are in the ticket-building loop (~lines 120-135):

```typescript
// After parseSeatTrim:
const sectionNum = parseInt(section);
if (isNaN(sectionNum) || sectionNum < 500 || sectionNum >= 600) continue;

// In the ticket object:
is_reseller_ticket: true,  // was false
```

This ensures 500-level seats from the feed appear in the regular "Tickets" section, not the "Featured Tickets" section, across all team pages and event detail views.

