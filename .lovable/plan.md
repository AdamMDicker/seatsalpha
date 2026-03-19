

## Homepage Redesign Plan

### Current Problems
- Hero is visually cluttered: badge, subtitle, heading, subheading, search bar, beta notice, and trust badge all compete for attention
- Page flow is disconnected: Features → Events → Membership → Newsletter doesn't tell a story
- "Not Just a Seat, An Experience" is vague — doesn't explain what Seats.ca actually does
- The "Problem" (unfair ticket fees) is buried inside the Features section copy
- No "How it Works" section — first-time users don't understand the process
- No social proof or competitor comparison on the homepage
- CTA buttons are sparse and don't guide users toward a conversion path
- "Members enjoy HST-included pricing" line floats awkwardly in Features section

### Redesigned Page Flow

```text
┌─────────────────────────────────────┐
│  Navbar                             │
├─────────────────────────────────────┤
│  1. HERO                            │
│  Clear value prop + search + CTA    │
├─────────────────────────────────────┤
│  2. TRUST BAR                       │
│  3 inline proof points (icons)      │
├─────────────────────────────────────┤
│  3. PROBLEM SECTION                 │
│  "You're overpaying for tickets"    │
│  Side-by-side fee comparison        │
├─────────────────────────────────────┤
│  4. HOW IT WORKS                    │
│  3 numbered steps                   │
├─────────────────────────────────────┤
│  5. UPCOMING EVENTS                 │
│  Live event cards from DB           │
├─────────────────────────────────────┤
│  6. FEATURES                        │
│  4 benefit cards (refined copy)     │
├─────────────────────────────────────┤
│  7. MEMBERSHIP CTA                  │
│  Pricing + benefits (existing)      │
├─────────────────────────────────────┤
│  8. NEWSLETTER + FOOTER             │
│  Combined final CTA                 │
└─────────────────────────────────────┘
```

### Section-by-Section Changes

**1. Hero Section** — Simplify dramatically
- New headline: **"Tickets Without the Fees"** (direct, benefit-first)
- Subheadline: "Seats.ca is a Canadian ticket marketplace where members never pay HST or service fees. Find your event and save."
- Keep search bar (clean up styling)
- Single prominent CTA: "Browse Blue Jays Tickets" (honest about beta scope)
- Remove: pulsing badge, redundant subtitle, tooltip, beta banner (move beta note to a subtle inline line under CTA)
- Keep the dynamic hero background image from Supabase

**2. Trust Bar** (NEW) — Horizontal strip below hero
- Three inline items: "Verified Authentic Tickets" | "No Hidden Fees" | "Full Refund if Cancelled"
- Clean icons, no cards — just a light row of proof points

**3. Problem Section** (NEW) — Make the pain concrete
- Headline: "You're overpaying for tickets"
- Show a real example: "$100 ticket → $132 on StubHub" vs "$100 on Seats.ca"
- Brief copy: "Other platforms add service fees, processing fees, and taxes at checkout. We don't."
- CTA: "See how membership works →" (links to /membership)

**4. How It Works** (NEW)
- 3 steps in a numbered row:
  1. "Find your event" — Search by team, date, or venue
  2. "Pick your seats" — Compare sections, rows, and prices
  3. "Pay the listed price" — No surprise fees at checkout
- CTA: "Browse Events"

**5. Events Section** — Keep existing logic, refine presentation
- Keep Supabase data fetching and EventCard component as-is
- Simplify section header copy
- Add "View All Blue Jays Games →" link button at bottom

**6. Features Section** — Tighten copy, remove orphaned HST line
- Keep the 4-card grid layout
- Remove the floating "Members enjoy HST-included pricing" line
- Slightly refine descriptions for clarity

**7. Membership Section** — Keep existing, minor copy polish
- Existing component is well-structured — keep as-is with minor adjustments

**8. Newsletter Section** — Keep as-is (already clean)

### Files to Create/Modify

| File | Action |
|---|---|
| `src/pages/Index.tsx` | Reorder sections, add TrustBar, ProblemSection, HowItWorks |
| `src/components/HeroSection.tsx` | Rewrite — simplified hero with clearer copy |
| `src/components/TrustBar.tsx` | **New** — horizontal proof-point strip |
| `src/components/ProblemSection.tsx` | **New** — fee comparison section |
| `src/components/HowItWorks.tsx` | **New** — 3-step explainer |
| `src/components/FeaturesSection.tsx` | Polish copy, remove orphaned line |
| `src/components/EventsSection.tsx` | Add "View All" link at bottom |

### Design Approach
- Same dark theme, same color tokens (primary red, gold, etc.)
- More vertical whitespace between sections (py-24 instead of py-20)
- Consistent section pattern: eyebrow label → heading → description → content → CTA
- Mobile: all sections stack naturally, no special breakpoint work needed beyond existing responsive grid

