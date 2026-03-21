

# Mobile & Content Fixes Plan

## Summary
14 items covering mobile UI fixes, content updates across multiple pages, and email safety changes.

---

## 1. LiveChat — Fix X button overlap on mobile
**File:** `src/components/LiveChat.tsx`
- The chat panel header has the Bot icon + title on left, X on right. On small screens they may overlap.
- Add `min-w-0` to the title container and ensure proper spacing. Move the close button further right with explicit padding.
- Also increase the chat bubble's `bottom` position so it doesn't overlap with the mobile nav if applicable.

## 2. Homepage — Add "& taxes" to non-member line
**File:** `src/components/SolutionSection.tsx` (line 57)
- Change: `"a small service fee applies at checkout"` → `"a small service fee & taxes applies at checkout"`

## 3. Navbar — Fix mobile menu overlapping hero image
**File:** `src/components/Navbar.tsx`
- The mobile menu dropdown currently has `bg-transparent` when not scrolled. On mobile when menu opens, it needs an opaque background regardless of scroll state.
- Add: when `isOpen` is true, force `bg-background/95 backdrop-blur-xl` on the nav element even if not scrolled.

## 4. Budget filter — Label "max budget per seat"
**File:** `src/components/team/GameScheduleFilters.tsx`
- Change label from `"Max budget:"` to `"Max budget per seat:"`
- Update button text from `Under $${maxBudget}` to `Under $${maxBudget}/seat`

## 5. Add number of tickets filter to GameScheduleFilters
**File:** `src/components/team/GameScheduleFilters.tsx` + `useTeamGames.ts` + all Team pages
- Add a quantity filter (2, 3, 4+) as a new Select in the filters row.
- Pass it up through props and filter games to only show those with tickets having sufficient available quantity.
- Update the `GameScheduleFiltersProps` interface and all 7 team pages that use it.

## 6. Add specific date filter
**File:** `src/components/team/GameScheduleFilters.tsx` + `useTeamGames.ts` + all Team pages
- Add a date picker (or date select from available event dates) alongside the month filter.
- When a specific date is selected, it overrides the month filter.
- Pass through props and filter in all 7 team pages.

## 7. Membership page — Update hero text
**File:** `src/pages/Membership.tsx` (lines 148-153)
- Change line 149: `"Non-members pay standard HST at checkout..."` → `"Non-members pay fees and standard HST at checkout."`
- Change line 151-152: Keep `"Members enjoy HST-included pricing."` in the green `text-emerald-400` large text, but restructure to:
  - Green large: `"Members enjoy $0 in fees & HST-included pricing."`
  - Below in smaller muted: `"— saving hundreds every year on event tickets."`

## 8. $49.95 off center
**File:** `src/pages/Membership.tsx` (line 176-179)
- The price circle is in a flex layout. Add `text-center` and ensure the `$49.95 CAD` text is centered. May need to reduce font size or adjust the circle dimensions to accommodate "CAD".

## 9. Platform chart — vendor names overlap
**File:** `src/pages/Membership.tsx` (competitor fees table, lines 196-216)
- On mobile the 4-column grid causes text overlap. Switch to a responsive layout: hide some columns on mobile or use a 2-column stacked layout for small screens.
- Add `overflow-hidden text-ellipsis` and responsive column sizing.

## 10. Email safety — Replace personal emails with seats.ca emails
**Files:** `src/pages/Membership.tsx`, `src/pages/Contact.tsx`, `src/components/Footer.tsx`
- This is a prerequisite: seats.ca domain emails need to be set up first.
- For now, replace `michaelkurtz66@hotmail.com` with `support@seats.ca` everywhere as a placeholder.
- Affected: FAQs (seller cost FAQ, contact support FAQ), Contact page sidebar, Contact page error toast.
- **Note to user:** Once seats.ca email is configured, these will work. Until then they're display-only.

## 11. FAQs — Split into Buyer and Seller sections
**File:** `src/pages/Membership.tsx`
- Create two separate FAQ sections with headers:
  - **"Frequently Asked Questions by Buyers"**: account needed, membership needed, what's included, how much save, hidden fees, other sites build fees, cancel membership, authentic guaranteed, events available, how delivered, phone, payment secure, contact support
  - **"Frequently Asked Questions by Sellers"**: become a seller, list tickets, cost to sell, get paid, contact support (duplicated)
- Reorder: "Do I need an account" moves above "Do I need a membership"

## 12. FAQ content updates
**File:** `src/pages/Membership.tsx` — Update FAQ text per user specifications:
- a) "What's included" → new answer about $49.95/year, fees, HST, bundle savings
- b) Rename to "Doesn't this site just build fees into the ticket price like everyone else?" with new answer
- c) "Do I need membership" → add "and HST" to answer
- d) "Authentic guaranteed" → remove the "If a ticket is found to be invalid..." sentence
- e) "Become a seller" → make "Become a Seller" text a `<Link>` to `/reseller`
- f) "How delivered" → update to mention "event's platform account"
- g) Move "Do I need an account" above "Do I need a membership"

## 13. About Us — Shorten all sections
**File:** `src/pages/About.tsx`
- Replace content of each section with the user's shortened versions:
  - Problem: shorter 3-paragraph version
  - Mission: shorter 3-paragraph version (remove last two paragraphs)
  - Built for Canadians: rewrite with user's 3 paragraphs
  - Where We Are Today: keep as-is
  - Our Promise: update bullet point descriptions to shorter versions

## 14. Reseller page — Remove "Trusted Platform" benefit
**File:** `src/pages/ResellerDashboard.tsx`
- Remove the `{ icon: Shield, title: "Trusted Platform", ... }` entry from the `benefits` array (line 16).

---

## Technical Details

### Files modified (13 files):
1. `src/components/LiveChat.tsx` — mobile header spacing
2. `src/components/SolutionSection.tsx` — "& taxes" text
3. `src/components/Navbar.tsx` — force opaque bg when mobile menu open
4. `src/components/team/GameScheduleFilters.tsx` — budget label, ticket qty filter, date filter
5. `src/hooks/useTeamGames.ts` — new filter state for qty and date
6. `src/pages/TeamMLBPage.tsx` — pass new filter props
7. `src/pages/TeamNHLPage.tsx` — pass new filter props
8. `src/pages/TeamNBAPage.tsx` — pass new filter props
9. `src/pages/TeamNFLPage.tsx` — pass new filter props
10. `src/pages/TeamMLSPage.tsx` — pass new filter props
11. `src/pages/TeamCFLPage.tsx` — pass new filter props
12. `src/pages/TeamWNBAPage.tsx` — pass new filter props
13. `src/pages/Membership.tsx` — hero text, price centering, table responsiveness, FAQ split + content
14. `src/pages/Contact.tsx` — email replacement
15. `src/pages/About.tsx` — shortened content
16. `src/pages/ResellerDashboard.tsx` — remove Trusted Platform benefit

