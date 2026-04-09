

# Update Seller Page, Agreement, and Navigation

## Overview
Three concrete changes plus a recommendation on the featured ticket rotation strategy.

---

## 1. Add "Become a Seller" link to top navigation

**Navbar.tsx** — Add a "Become a Seller" link in the `pageLinks` array (desktop + mobile) that navigates to `/reseller`. Place it after "Membership" and before "Contact".

---

## 2. Update "Why Sell on Seats.ca?" benefits

**ResellerDashboard.tsx** — Replace the current 5-benefit `benefits` array with the 11 benefits you provided, using appropriate icons:

| Benefit | Icon |
|---------|------|
| Keep More Profit | DollarSign |
| Real Buyers, Not Browsers | Users |
| Fair Marketplace | Eye |
| You Set the Price | Settings |
| All-In Pricing Wins | CheckCircle |
| More Exposure | Zap |
| Bulk Listing Made Easy | Upload |
| Active Seller Network | ShieldAlert → ShieldCheck |
| Fewer Headaches | CheckCircle |
| Professional Platform | Store |
| Simple, Low Cost | CreditCard |

Also update the subtitle text to: *"$100/year + $0.50/week to sell smarter."*

---

## 3. Update Seller Agreement to 29-section version

**`src/data/sellerAgreementSections.ts`** — Replace all 27 sections with the new 29-section agreement text you provided (adds sections 15 "Third-Party Integrations", 20 "Buyer Access Restriction", and 28 "General Terms"; renumbers remaining sections).

**`src/components/reseller/SellerKeyTerms.tsx`** — Update the KEY_TERMS array to reflect any new acknowledgment points from the updated agreement (e.g., third-party integrations, buyer access restriction, collections/pre-auth).

---

## 4. Featured Ticket Rotation Strategy (Discussion)

For the featured area once your own inventory sells out, here's my recommendation:

**Weighted rotation based on seller performance**, combining:
- **Sales velocity** — sellers whose tickets sell fastest get more featured time
- **Listing freshness** — newer listings get a boost to ensure visibility
- **Price competitiveness** — listings priced closer to face value rank higher

This avoids the downsides of pure rotation (low-quality sellers get equal time) and consumer-based personalization (too complex for now). It rewards good sellers and naturally surfaces the best deals.

Implementation would be a database view or function that scores listings and rotates the "featured" flag on a schedule (e.g., hourly cron). This can be built as a separate task when you're ready — it doesn't block the other changes above.

---

## Technical Details

### Files to modify
- `src/components/Navbar.tsx` — add pageLink entry
- `src/pages/ResellerDashboard.tsx` — replace benefits array + subtitle
- `src/data/sellerAgreementSections.ts` — replace with 29-section content
- `src/components/reseller/SellerKeyTerms.tsx` — update KEY_TERMS array

### No database changes needed
All changes are frontend copy/content updates.

