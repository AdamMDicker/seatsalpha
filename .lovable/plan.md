

## Reseller CSV Template & Upload System

### Overview
Create a downloadable CSV template for resellers with the fields you specified, plus a reseller-facing upload page. The admin CSV import will also be updated to handle the new format.

### CSV Template Columns

| Column | Description | Required | Validation |
|--------|------------|----------|------------|
| Sport | League/sport (e.g. MLB, NHL, NBA) | Yes | Must match known league |
| Home Team | Home team name | Yes | Text, max 100 chars |
| Away Team | Visiting team name | Yes | Text, max 100 chars |
| Venue | Venue/stadium name | Yes | Text, max 150 chars |
| Event Date | Date of game (YYYY-MM-DD format) | Yes | Valid date |
| Event Time | Start time (e.g. 7:07 PM) | Yes | Valid time |
| Quantity | Number of tickets | Yes | Integer ≥ 1 |
| Section | Seating section | Yes | Text |
| Row | Row identifier | No | Text |
| Seat Numbers | Seat number(s) | No | Text |
| Hide Seat Numbers | Hide seats from public listing (Yes/No) | No | Default: No |
| Notes | Buyer-facing notes (e.g. "Bobblehead Night") | No | Text, max 500 chars |
| Ticket Group Account | Internal account/group name | No | Text |
| Unit Cost | Price per ticket in CAD | Yes | Number ≥ 0 |
| Stock Type | Delivery method (PDF, Mobile QR, Mobile Transfer) | Yes | Must match options |
| Split Type | How tickets can be split (Any, No Singles, Keep Pairs, No Splitting) | No | Must match options |
| Seat Type | Seat classification (Consecutive, General Admission, Accessible, VIP) | No | Must match options |
| Order Number | Reseller's internal order/reference number | No | Text |
| Sales Tax Paid | Tax already paid (Yes/No) | No | Default: No |

### Database Changes

Add columns to the `tickets` table:
- `hide_seat_numbers` (boolean, default false)
- `stock_type` (text, nullable) — PDF / Mobile QR / Mobile Transfer
- `split_type` (text, nullable) — Any / No Singles / Keep Pairs / No Splitting
- `seat_type` (text, nullable) — Consecutive / General Admission / Accessible / VIP
- `order_number` (text, nullable) — reseller's reference
- `sales_tax_paid` (boolean, default false)
- `ticket_group_account` (text, nullable)

The `events` table already has a `description` field we can use for buyer-facing notes. The event title will be constructed as "Away Team at Home Team" from the CSV.

### Implementation Plan

1. **Database migration** — Add the new columns to the `tickets` table.

2. **CSV template generator** — Create a utility that generates a CSV string with the header row and one example row, triggered by a "Download Template" button.

3. **Reseller upload page** — Add a CSV upload section to the `/reseller` page (visible to approved resellers) that:
   - Parses the CSV
   - Validates all fields (sport, dates, required columns, option values)
   - Constructs event title as "Away Team at Home Team"
   - Finds or creates events, then inserts tickets with `is_reseller_ticket = true` and `seller_id = user.id`
   - Maps the new fields to the new ticket columns

4. **Admin CSV import update** — Update `AdminCsvImport` to also accept the new reseller CSV format, supporting both old and new column schemas.

5. **Hide seat numbers in UI** — Update `TicketListings` to respect `hide_seat_numbers` and not display seat numbers when true.

### Files to Create/Edit
- **Migration**: New columns on `tickets`
- **`src/utils/resellerCsvTemplate.ts`** (new) — template generation
- **`src/pages/ResellerDashboard.tsx`** — add upload section for approved resellers
- **`src/components/admin/AdminCsvImport.tsx`** — support new format
- **`src/components/team/TicketListings.tsx`** — respect `hide_seat_numbers`

