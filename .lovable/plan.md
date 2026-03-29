

## Plan: Add Face Value Disclosure for Ontario Ticket Sales Act Compliance

### Context
Ontario's Ticket Sales Act, 2017 requires secondary ticket platforms to disclose the **face value** of every ticket alongside the resale price. Currently, the `tickets` table has no `face_value` column, and the UI only shows the resale price.

### Strategy
Display face value in a compliant but understated way — similar to how StubHub buries it in small print. The disclosure will be visible but not the focal point of the listing.

### Changes

**1. Database: Add `face_value` column**
- Add nullable `face_value numeric` column to `tickets` table (default `null`)
- Update the `public_tickets` view to expose `face_value`
- Face value is optional — listings without it simply won't show the disclosure line

**2. UI: `TicketListings.tsx` — Add face value disclosure line**
- On each ticket card (desktop `CompactTicketCard`, mobile `MobileCompactCard`, and `FeaturedTicketCard`), add a small muted-text line below the price:
  - `"Face value: $XX.XX"` in `text-[10px] text-muted-foreground`
- Only render when `face_value` is present and > 0
- Positioned beneath the resale price, not prominently — compliant but buried

**3. UI: `FeeGateDialog.tsx` — Add face value in checkout summary**
- Show face value as a small footnote line in the receipt breakdown area
- Format: `"Original face value: $XX.XX per ticket"` in small muted text

### What this does NOT do
- Does not change pricing logic or margins
- Does not highlight markup — just states the face value as required
- Does not require face value for internal (non-reseller) tickets — only shows when data exists

### Technical Details
- `TicketInfo` interface gains optional `face_value?: number | null`
- All queries selecting from `public_tickets` already select `*` or named columns — add `face_value` to those selects
- The column is nullable so existing tickets and CSV imports continue working without changes

