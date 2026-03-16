

## Purchase Path Optimization Plan

### Current Flow Analysis
The buyer path is: **Browse games → Select game → Scroll to tickets → Click "Buy" → (Auth wall if logged out) → FeeGateDialog (choose qty, pricing option, check 2 boxes) → Stripe Checkout → Success page**

Key friction points identified:

1. **Mobile ticket cards are cramped** — Featured cards show price, perks, seat views, and buy button all squeezed together; compact (reseller) cards require an expand tap to see any detail before buying.
2. **No sticky CTA on mobile** — Once a user scrolls past the quantity filter bar, there's no persistent way to act; they must scroll back up or find a card.
3. **FeeGateDialog requires 4 interactions minimum** — Select quantity, select pricing option, check terms, check details confirmation, then tap Pay. On mobile this dialog scrolls internally.
4. **Auth redirect is jarring** — Tapping "Buy" while logged out sends the user to `/auth`, then back. The redirect preserves state but the full-page navigation feels slow on mobile.
5. **Game selection horizontal scroll** — 220px-wide cards in a horizontal scroll are fine on desktop but require a lot of swiping on mobile to find games.

### Proposed Optimizations

#### 1. Streamline FeeGateDialog (high impact)
- Combine the two checkboxes into a single "I confirm and agree to terms" checkbox — reduces taps from 4 to 3.
- Auto-select the quantity based on the `desiredSeats` filter so users don't re-choose (already partially done, but default to 2 instead of max when no preference).
- For **members**, skip the pricing option entirely — go straight to quantity + confirm + pay since there's only one option.
- Make the Pay button larger and full-width on mobile with clear total.

#### 2. Mobile-optimized ticket cards
- On mobile (`useIsMobile`), show a tighter single-row layout for reseller tickets: `Sec 221 · Row 3 · $85 · [Buy]` — no expand needed for basic info.
- Move the "Buy Tickets" button to be always visible (not hidden behind expand) on compact cards.
- Featured cards: stack price and buy button below the section info on mobile instead of side-by-side.

#### 3. Sticky buy bar on mobile
- When the user scrolls past the quantity filter section, show a slim sticky bar at the bottom of the viewport with the cheapest available price and a "View Tickets" anchor that scrolls to the listings.
- This keeps the purchase intent visible at all times.

#### 4. Bottom sheet auth on mobile
- Replace the full-page `/auth` redirect with a Drawer/Sheet component on mobile when triggered from "Buy Tickets".
- The sheet slides up with login/signup fields, keeping the ticket context visible behind it.
- On successful auth, close the sheet and auto-open FeeGateDialog — no navigation needed.

#### 5. Game list improvements for mobile
- Switch from horizontal scroll to a vertical compact list on mobile (date + opponent + price on one row).
- Keep horizontal scroll on desktop where it works well.

### Implementation Priority

| Change | Effort | Impact |
|--------|--------|--------|
| Streamline FeeGateDialog (single checkbox, member shortcut) | Small | High |
| Mobile ticket card layout | Medium | High |
| Bottom sheet auth instead of redirect | Medium | High |
| Sticky buy bar on mobile | Small | Medium |
| Vertical game list on mobile | Small | Medium |

### Files to Modify
- `src/components/team/FeeGateDialog.tsx` — simplify checkbox, member fast-path
- `src/components/team/TicketListings.tsx` — mobile card layouts, sticky bar, auth sheet
- `src/components/team/GameCard.tsx` — compact mobile variant
- `src/pages/TeamMLBPage.tsx` (and other Team*Page files) — vertical game list on mobile
- Potentially extract a new `MobileAuthSheet.tsx` component

