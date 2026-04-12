

## Plan: Redesign Seller Application with STH/Casual Seller Gate

### What changes

**Step 1 — New first-screen selector** in `SellerApplicationForm.tsx`:
- Two big cards: "Season Ticket Holder" and "I Want to Sell a Few Tickets"
- Selecting "Sell a few tickets" shows a friendly "Coming Soon" message (e.g., "Thanks for your interest! We're building tools for casual sellers — check back soon.") with no further form.
- Selecting "Season Ticket Holder" proceeds to the application form.

**Step 2 — Replace league checkboxes with dropdowns**:
- Replace the current checkbox grid with a repeatable "Add a Sport" pattern using `<Select>` dropdowns populated from the existing `LEAGUES` list.
- Add an "Other" option in the dropdown. When selected, show a free-text field ("Tell us more — what sport/event type?") plus the standard Section/Row/Seat Count/Lowest Seat fields.
- Non-"Other" selections use the existing seat location flow unchanged.

**Step 3 — "Other" goes to review; sports-only goes to payment**:
- If the applicant selected only standard leagues (no "Other"), submitting the form inserts the reseller record and immediately redirects to the credit card / signup-fee step (existing `SellerSignupFee` component flow).
- If the applicant selected "Other" (with or without standard leagues), the submission lands in a "pending review" state with a confirmation message: "Our team will review your application and follow up shortly."

**Step 4 — Store seller type in database**:
- Add a migration: `ALTER TABLE resellers ADD COLUMN seller_type text DEFAULT 'sth';` (values: `sth`, `casual`).
- On submit, save `seller_type` so admin can differentiate.

### Files modified
1. `src/components/reseller/SellerApplicationForm.tsx` — full rewrite of the form flow
2. New migration — add `seller_type` column and optionally auto-approve non-"Other" STH applications

### Flow summary
```text
Landing
  ├─ "Season Ticket Holder"
  │    ├─ Select sport(s) via dropdown (NHL, NFL, MLB, NBA, MLS, CFL, WNBA, Other)
  │    │    ├─ Standard sport → seat details (Section, Row, Count, Lowest)
  │    │    └─ "Other" → free-text description + seat details
  │    ├─ Personal/Business info (unchanged)
  │    └─ Submit
  │         ├─ All standard sports → auto-approve → redirect to payment
  │         └─ Has "Other" → pending review → "We'll be in touch"
  │
  └─ "Want to Sell a Few Tickets"
       └─ Friendly "Coming Soon" message (no form)
```

### Notes
- The "casual seller" path is a dead end for now — no account creation or fee required. They can navigate back and choose STH if they want.
- No changes to the existing gate flow (Agreement → Signup Fee → Weekly Billing → Unlocked).
- The auto-approve for standard-sports-only applicants means they skip the admin review and go straight to agreement signing + payment.

