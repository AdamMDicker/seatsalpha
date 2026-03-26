

## Plan: Reframe Membership Option as "Unlock Member Price"

### Problem
Users see "$499.95 CAD" on the membership option and think that's the membership cost. The current breakdown still bundles everything together, making it confusing.

### Marketing Strategy
Flip the framing: instead of "Add Annual Membership — $499.95 total", show the **ticket price at the member rate** as the hero number, with the membership fee as a small add-on. This reframes it as "you're getting cheaper tickets" rather than "you're paying more for a membership bundle."

### New Layout for Membership Option

```
┌─────────────────────────────────────────────────────┐
│ ● Become a Member & Save                BEST VALUE  │
│                                                      │
│   Ticket price:        $450.00  (no fees, no HST)   │
│   + Annual membership:  $49.95/yr                   │
│   ─────────────────────────────                      │
│   Total:               $499.95 CAD                  │
│                                                      │
│   💡 Save $8.55 vs non-member pricing               │
│      + no fees on ALL future purchases for 12 months │
└─────────────────────────────────────────────────────┘
```

### Key Changes
- **Title**: "Become a Member & Save" (action-oriented, not "Add Annual Membership")
- **Badge**: "BEST VALUE" instead of "Recommended" — stronger psychological anchor
- **Ticket price shown first and prominently** — users see $450 tickets, not $499.95
- **Membership fee on its own line** — clearly $49.95/yr, unmistakable
- **Dotted separator + total** — classic receipt-style breakdown
- **Savings callout** — shows exact dollar savings vs HST option, plus the ongoing benefit

### File Changes

**`src/components/team/FeeGateDialog.tsx`** (lines 335-366)

Replace the current membership button content with the new receipt-style layout:
- Change heading to "Become a Member & Save"
- Change badge from "Recommended" to "Best Value"
- Replace description lines with a mini receipt: ticket line, membership line, separator, total
- Add a savings note: `Save $X.XX vs non-member + no fees for 12 months`
- The right-side bold total stays as `$totalWithMembership CAD`
- Compute `savings = totalWithHST - totalWithMembership` for the savings callout

