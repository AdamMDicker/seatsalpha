

# Mobile Optimization Plan

Focused improvements for the mobile experience (≤768px) across the highest-traffic flows: Hero → Team page → Ticket selection → Checkout. Each item is scoped, low-risk, and shippable independently.

## 1. Team page layout (biggest win)

**Problem:** On `/teams/mlb/blue-jays`, after picking a game, `SeatingMap` and `TicketListings` render in a `grid-cols-1` stack on mobile. The seating map (~600px tall with legend) pushes ticket listings far below the fold, forcing heavy scrolling.

**Fix:**
- Collapse `SeatingMap` into a tappable accordion on mobile (`<768px`), default **closed**, showing only a thin "View Seating Map" pill with the venue name. Expand on tap.
- Reorder so `TicketListings` renders **first** on mobile (the user's primary intent), map second.
- Move the giveaway/Jr. Jays banner from inside `SeatingMap` into a small badge at the top of `TicketListings`.

## 2. Ticket card density & touch targets

**Problem:** `FeaturedTicketCard` (lines 286-386 of `TicketListings.tsx`) uses `text-[10px]` / `text-[9px]` for price subtitles and "Members enjoy LCC-included pricing" — too small per WCAG and our `mem://ui/mobile-standards` (52px min tap target).

**Fix:**
- On mobile: bump price subtitle to `text-xs`, hide "per ticket" / face-value when space-constrained, and stack the price column above the Buy button (full-width Buy button at `min-h-[48px]`).
- Hide the seat-view thumbnail strip on mobile (saves ~80px). Replace with single "📷 View Seat (3)" pill that opens the lightbox directly.
- Reduce `FeaturedTicketCard` padding from `p-4` to `p-3` on mobile.

## 3. Filter bar overhaul

**Problem:** `GameScheduleFilters` row wraps to 3+ lines on mobile (Month, Date, Opponent, # Tickets, Budget) — eats ~140px before the user sees a single game.

**Fix:**
- Collapse all filters into a single "Filters" bottom-sheet trigger button on mobile, showing active-filter count badge. Inside the sheet: vertical stack of the existing controls.
- Keep one quick-pick visible: a horizontal scroll of month chips (e.g. "Apr · May · Jun · Jul").
- Same approach for the perks filter row inside `TicketListings` ("Row 1 / Aisle / Accessible") — collapse into a single chip.

## 4. Quantity selector card

**Problem:** The `🎟️ Quantity of Tickets` panel (lines 586-612) uses `p-4` plus a 200px-wide select side-by-side, which wraps awkwardly on 360px screens.

**Fix:**
- On mobile: shrink to a single-line pill: `🎟️ Quantity: [Any ▼]` with `p-2.5`. Remove the helper paragraph (move it under the trigger as `text-[11px]` only when expanded).

## 5. Sticky bottom buy bar polish

**Problem:** Sticky bar (lines 738-753) only scrolls back to the filter — not the most useful action. It also overlaps the `LiveChat` widget.

**Fix:**
- Change CTA from "View Tickets" to "Buy from $X" → opens the cheapest ticket's `FeeGateDialog` directly.
- Add `bottom: env(safe-area-inset-bottom)` (already partial) and `pb-[max(0.625rem,env(safe-area-inset-bottom))]` for iPhone notch.
- Auto-shift the floating chat button up by `64px` when the sticky bar is visible.

## 6. Hero section

**Problem:** `min-h-[90vh]` hero is too tall on mobile (cuts trust signals below the fold). Two stacked CTA buttons take another 130px.

**Fix:**
- Mobile: `min-h-[70vh]` and reduce `pt-24 → pt-20`.
- Single primary CTA "Browse Blue Jays Tickets" full-width; demote "How Membership Works" to a small text link below.
- Drop hero subhead from `text-base` to `text-sm` and tighten leading.

## 7. Navbar + safe areas

- Add `env(safe-area-inset-top)` padding to the fixed `<nav>` so it clears the iPhone notch.
- Mobile menu currently lists every page — promote "Browse Tickets" as a sticky CTA at the bottom of the open menu.

## Out of scope (intentionally deferred)

- Performance/bundle optimization (separate audit).
- PWA install prompt.
- Offline support.

## Technical Summary

**Files to edit:**
- `src/components/team/TicketListings.tsx` — accordion wrap on mobile, simpler card layout, perks filter collapse, sticky bar CTA.
- `src/pages/TeamMLBPage.tsx` (and the 6 sibling `Team{LEAGUE}Page.tsx` files) — reorder grid on mobile (tickets first), wrap `SeatingMap` in `<details>` at `<768px`.
- `src/components/team/GameScheduleFilters.tsx` — bottom-sheet wrapper for mobile, month chip scroller.
- `src/components/team/SeatingMap.tsx` — render in collapsible mode when prop `defaultCollapsed` is set.
- `src/components/HeroSection.tsx` — height + CTA tweaks.
- `src/components/Navbar.tsx` — safe-area padding, sticky CTA in mobile menu.
- `src/index.css` — add `.safe-pt`, `.safe-pb` utility classes leveraging `env(safe-area-inset-*)`.

**Approach:** Reuse existing `useIsMobile()` hook and `Sheet` primitive (`@/components/ui/sheet`) — no new deps. All changes are CSS/JSX-only; no schema or auth changes.

**Risk:** Low. Desktop layout untouched (gated by `md:` Tailwind prefix and `isMobile` checks).

