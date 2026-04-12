

## Plan: Soften Pricing Display + Add Legal Sign-Off Before Payment

### Problem
1. The "$100/year + $0.50/week" price is shown prominently in benefits — can scare people off before they understand the value
2. The fee structure needs to clarify it's per sport/league (not all-inclusive)
3. Terms of Service and Privacy Policy aren't explicitly accepted before payment — only the Seller Agreement is

### Changes

#### 1. Soften pricing in benefits section
**File:** `src/pages/ResellerDashboard.tsx`

- Change the "Simple, Low Cost" benefit description from `"$100/year + $0.50/week to sell smarter."` → `"Annual Membership fee* — affordable access to Canada's fastest-growing marketplace."`
- Change the subtitle under "Why Sell on Seats.ca?" from `"$100/year + $0.50/week to sell smarter."` → `"Low annual membership fee* to start selling."`
- Add a small footnote below the benefits grid: `"*Membership fee applies per sport listing category. See Seller Agreement for full details."`

#### 2. Add Terms + Privacy sign-off to the Seller Agreement page
**File:** `src/pages/SellerAgreement.tsx`

- Add two additional checkboxes before the "I Agree" button:
  - "I have read and agree to the Terms of Service" (linked)
  - "I have read and agree to the Privacy Policy" (linked)
- All three checkboxes (agreement + terms + privacy) must be checked before the submit button enables
- This keeps everything in one place before any payment step

#### 3. Remove explicit dollar amounts from SellerSignupFee and SellerBillingSetup
**Files:** `src/components/reseller/SellerSignupFee.tsx`, `src/components/reseller/SellerBillingSetup.tsx`

- SellerSignupFee: Change "A one-time $100.00 CAD sign-up fee..." → "A one-time sign-up fee is required to activate your seller account." Button: "Pay Sign-Up Fee" (no dollar amount)
- SellerBillingSetup: Change "$1.00 CAD/week" → "Set up your recurring weekly seller membership." These amounts are already disclosed in the Seller Agreement they've signed.

The actual prices remain unchanged in Stripe — this only softens the marketing copy so people see the value proposition first, with full pricing details in the agreement they've already signed.

### Flow (unchanged order, stronger legal gate)
```text
Apply → Approved → Sign Agreement + Terms + Privacy → Pay signup fee → Weekly billing → Unlocked
```

