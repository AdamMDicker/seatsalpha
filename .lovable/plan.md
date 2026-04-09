

# Redesign Seller Application Form

## Overview
Replace the current simple form with a multi-section application that captures business info, sport-by-sport seat inventory details, and optional company/tax info. Remove the "How many tickets do you own?" field. Add dynamic sport selection with per-location seat details.

---

## 1. Database: New table for application seat locations

Create a `reseller_application_seats` table to store the per-sport, per-location seat details submitted with the application.

```text
reseller_application_seats
├── id (uuid, PK)
├── reseller_id (uuid, FK → resellers.id)
├── league (text)          -- e.g. "NHL", "MLB"
├── section (text)
├── row_name (text)
├── seat_count (integer)
├── lowest_seat (text)
├── created_at (timestamptz)
```

RLS: Sellers can insert/read own rows (via reseller_id join). Admins can read all.

Also add columns to `resellers` table:
- `is_registered_company` (boolean, default false)
- `corporation_number` (text, nullable)
- `tax_collection_number` (text, nullable)

Remove the `ticket_count` column usage from the form (keep column for backward compat but stop writing to it).

---

## 2. Redesigned Application Form

The form will have three sections:

### Section A: Personal & Business Info
- First Name * / Last Name *
- Phone / Email *
- **Are you a registered company?** — Yes/No toggle
  - If Yes: **Company Name** * (mandatory)
  - If Yes: **Corporation Number** (optional)
  - **Do you have a tax collection number (e.g. HST/GST)?** (optional text field)

### Section B: Sport Selection & Seat Inventory
- **What sports are you applying for?** — Multi-select checkboxes: NHL, NFL, MLB, NBA, MLS, CFL, WNBA
- For each selected sport, show a card:
  - **How many seat locations do you have?** — dropdown (1–10)
  - For each location, expandable fields:
    - Section *
    - Row *
    - Number of Seats *
    - Lowest Seat Number *

### Section C: Submit
- Standard submit button (same gating as today — must be logged in)

---

## 3. Files to modify

| File | Change |
|------|--------|
| `src/pages/ResellerDashboard.tsx` | Replace application form with new multi-section component |
| New: `src/components/reseller/SellerApplicationForm.tsx` | Extract form into dedicated component for cleanliness |
| Migration SQL | Add `reseller_application_seats` table + new columns on `resellers` |

---

## 4. What stays the same

- Payment flow remains post-approval (signup fee → weekly sub)
- Document uploads (invoice, seat photos) will be required after approval, before first listing — no changes needed now
- Seat perks (accessible, aisle, food) captured at listing time only
- The `handleApply` insert to `resellers` table continues to work, just with updated fields

---

## Technical Details

- The sport multi-select uses the same league list already in the codebase (`NHL`, `NFL`, `MLB`, `NBA`, `MLS`, `CFL`, `WNBA`)
- Dynamic seat location fields use React state: `Record<string, Array<{section, row, seatCount, lowestSeat}>>`
- On submit: insert into `resellers` first, then batch insert into `reseller_application_seats` using the returned reseller ID
- Form validation: at least one sport selected, each location must have section + row + seat count filled

