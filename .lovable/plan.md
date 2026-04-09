

# Replace 3 Seller Benefits with Email Transfer Benefit

## What changes
In `src/pages/ResellerDashboard.tsx`, remove these 3 benefits:
- "Active Seller Network"
- "Fewer Headaches"
- "Professional Platform"

Replace them with one new benefit:

```
{ icon: Mail, title: "Email-Based Transfers", description: "Tickets transfer via email — not barcodes. Your account stays private, and buyers get reliable, trackable delivery." }
```

This captures the key ideas: email > barcodes, seller account privacy, buyer reliability/traceability. The `Mail` icon (from lucide-react) fits naturally.

## Files modified
- `src/pages/ResellerDashboard.tsx` — update benefits array (lines 27-29 → 1 entry), add `Mail` to imports

Total benefits goes from 11 → 9.

