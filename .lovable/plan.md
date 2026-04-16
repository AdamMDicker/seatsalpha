

## Investigation Results

### What the system thinks you bought

**Order ID:** `c3992864-5137-4a0a-818b-e6e97a326979` (April 16, 2026 at 16:59 UTC)
- **Event:** Toronto Blue Jays vs Orioles — Sept 11, 2026 @ Rogers Centre
- **Section:** GA (General Admission)
- **Row / Seat:** None (null)
- **Quantity:** 2
- **Unit Price:** $1.00 CAD (total $2.00)
- **Face Value:** Not set (null)
- **Perks / Notes:** None

### Which account it's associated with

**Buyer:**
- Michael Kurtz (michaelkurtz66@hotmail.com)

**Seller assignment (the ticket itself has NO seller — `seller_id` is NULL):**
- Because the ticket has no seller, the system applied the **admin fulfillment standardization rule** and assigned the transfer to:
  - **LMK / Metro Tickets Inc.** (lmkconsulting@gmail.com)
  - Transfer alias: `order-wmkvnotxkk@inbound.seats.ca`
  - Transfer status: `pending`

That's why it's not in LMK's seller dashboard as a *sale* — the ticket was an admin-created listing (no `seller_id`), so revenue isn't attributed to LMK as a seller. LMK is only the **fulfillment recipient** for the transfer.

### How the GA ticket got into the database

Looking at the ticket record:
- **Ticket ID:** `5d2f2efc-a7f4-4bde-b5c1-12c86ba40245`
- **Created:** April 16, 2026 at 03:14 UTC (about 14 hours before the purchase)
- **seller_id:** `NULL` → admin-created (not from a reseller upload)
- **is_reseller_ticket:** `false`
- **Quantity:** 20 available, 2 sold
- **Section:** "GA" with no row/seat

This was manually added via the admin Tickets panel (or imported via CSV) with the section literally typed as "GA". The schema doesn't restrict section names, so "GA" was accepted. There are still **18 more** of these GA tickets active and purchasable right now.

### Recommended next step

Deactivate or delete this ticket so no more accidental GA orders come through. Want me to:
1. Set `is_active = false` on this ticket (soft-delete, keeps the existing order intact), or
2. Investigate the admin Tickets / CSV import flow to add a section validation guard against non-existent sections like "GA" for Rogers Centre?

