

## Plan: Add "SOLD OUT" indicator to game cards with no tickets

### What
Show a visible "SOLD OUT – check back soon" badge on home game cards that have zero available tickets, and disable the click action so users aren't confused.

### Changes

**`src/components/team/GameCard.tsx`**
- Compute `isSoldOut` — true when `game.tickets.length === 0` (no priced tickets exist for the game)
- For sold-out home games:
  - Add a red/muted "SOLD OUT" badge (similar styling to the giveaway badge but in red/gray)
  - Add a subtle "Check back soon" subtext
  - Reduce card opacity slightly and change cursor to `cursor-default`
  - Prevent `onClick` from firing (or make it a no-op)
- Away games already don't show tickets, so no change needed there
- Both mobile and desktop card variants get the sold-out treatment

### Technical Details
- `isSoldOut = isHome && game.tickets.length === 0` — only applies to home games
- The price area at the bottom switches from price display to "SOLD OUT" text
- Card remains visible in the list (not hidden) so users can see the game exists
- Click handler becomes `onClick={isSoldOut ? undefined : onClick}` with `pointer-events-none` or `cursor-not-allowed`

