

## Plan: Clarify Membership Option Pricing Breakdown

### Problem
The "Add Annual Membership" option shows a single total (e.g., "$499.95 CAD") which users misread as the membership cost alone, when it's actually tickets ($450) + membership ($49.95).

### Solution
Add a visible price breakdown line under the membership option, similar to how the HST option shows "2× $225.00 + HST $58.50". The membership option will show:
- **Line 1**: `2× $225.00 + Membership $49.95`
- **Line 2**: A small note like `(Tickets $450.00 + $49.95/yr membership)` to make it unmistakable

### File Changes

**`src/components/team/FeeGateDialog.tsx`** (lines 356-358)

Replace the current description text:
```
Annual Membership: HST inclusive ticket pricing for 12 months
```

With a two-line breakdown:
```
{quantity}× ${ticketPrice.toFixed(2)} + Membership $49.95/yr
```
And add a second line in a distinct color:
```
(Tickets: ${subtotal.toFixed(2)} + $49.95 annual membership = ${totalWithMembership.toFixed(2)})
```

This mirrors the HST option's breakdown style so users can clearly see the ticket cost and membership fee as separate components.

