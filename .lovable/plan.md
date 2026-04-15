

# Plan: Update seats.ca Frontend to Match Manus Reference Design

## Summary
The Manus reference site uses identical content and section order but has a more polished, spacious visual treatment. The changes are primarily CSS/layout refinements across the existing components plus a new "Become a Seller" section and some navbar updates.

## Key Differences Identified

**Navbar:**
- Manus: Clean horizontal nav with properly sized logo (~h-8/h-10), "Browse Tickets" red CTA button on the right, "Sign In" text link
- Current: Logo is oversized at h-32, no "Browse Tickets" CTA button in nav
- Fix: Reduce logo back to h-10, add "Browse Tickets" red CTA button

**Hero Section:**
- Manus: Left-aligned text (not centered), larger bolder heading, no CAD badge, no ticket icon badge border styling, background image with stadium
- Current: Center-aligned, has CAD badge, centered CTAs
- Fix: Left-align hero content, remove CAD badge, adjust text sizing

**Trust Bar / Stats:**
- Manus: Three trust badges (Verified Authentic, No Hidden Fees, Full Refund) as text with red icons, stats below with larger numbers
- Current: Very similar content, minor styling differences
- Fix: Minor spacing/sizing adjustments

**Problem Section:**
- Manus: Left-aligned section header, cards have dark red/maroon tinted background with subtle gradient, icon backgrounds are rounded squares
- Current: Center-aligned header, centered card content
- Fix: Left-align section header, update card styling to match dark red-tinted cards

**Solution Section (Price Comparison):**
- Manus: Side-by-side cards with "VS" circle between them, strikethrough on $132, red top border on seats.ca card, "$49.95/yr" badge next to header
- Current: Similar but missing VS circle and some styling details
- Fix: Add VS circle overlay, strikethrough on competitor price, red accent border on member card

**How It Works:**
- Manus: Step icons in red circles with number badges, centered layout
- Current: Very similar
- Fix: Minor adjustments to match icon circle sizing

**Features Section (Why Fans Choose Us):**
- Manus: 2x2 grid of dark cards with red icon backgrounds, "Browse Available Tickets" CTA
- Current: Very similar
- Fix: Minor styling adjustments

**NEW - Become a Seller Section:**
- Manus: Split layout -- left side has heading "Got tickets? Sell them here." with red gradient text, right side has 3 benefit cards stacked vertically, "Start Selling" CTA
- Current: No dedicated seller section on homepage
- Fix: Create new `SellerSection` component

**Social Proof (Testimonials):**
- Manus: Featured testimonial with purple quote icon, 3-column review cards below with star ratings
- Current: Very similar structure
- Fix: Minor color/styling tweaks

**Final CTA:**
- Manus: Stadium background image behind the CTA, "Ready to stop overpaying?" with red italic gradient text
- Current: No background image
- Fix: Add background image, style "overpaying?" in red italic

**Newsletter:**
- Manus: Simple centered form, "Stay in the loop" heading
- Current: Very similar
- Fix: Minor adjustments

**Footer:**
- Manus: "Events" column (Toronto Blue Jays, More teams coming soon), "Company" column with all links, Newsletter email form with "Go" button
- Current: Different column structure
- Fix: Update footer columns to match

## Files to Create/Modify

1. **src/components/Navbar.tsx** -- Reduce logo to h-10, add "Browse Tickets" CTA button
2. **src/components/HeroSection.tsx** -- Left-align content, remove CAD badge, adjust sizing
3. **src/components/TrustBar.tsx** -- Minor spacing adjustments
4. **src/components/ProblemSection.tsx** -- Left-align header, update card backgrounds to dark red tint
5. **src/components/SolutionSection.tsx** -- Add VS circle, strikethrough competitor price, red top border on member card
6. **src/components/HowItWorks.tsx** -- Minor icon sizing adjustments
7. **src/components/FeaturesSection.tsx** -- Minor card styling adjustments
8. **src/components/SellerSection.tsx** (NEW) -- "Become a Seller" split layout section
9. **src/components/SocialProof.tsx** -- Purple quote icon styling
10. **src/components/FinalCTA.tsx** -- Add stadium background image, italic red gradient on "overpaying?"
11. **src/components/NewsletterSection.tsx** -- Minor adjustments
12. **src/components/Footer.tsx** -- Update column structure (Events, Company, Newsletter)
13. **src/pages/Index.tsx** -- Add SellerSection between FeaturesSection and SocialProof

## Technical Notes
- All changes are CSS/component-level; no database or backend changes needed
- Existing functionality (Supabase queries, auth, navigation) remains untouched
- The "Become a Seller" section links to existing `/reseller` route

