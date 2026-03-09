

## Uber Integration Assessment

### What You Already Have
Your EventDetail page already has a simple "$25 Uber ride" toggle that adds a flat fee to the Stripe checkout. This is a cosmetic upsell — it charges the user but doesn't actually book an Uber.

### How Hard Is a Real Uber Integration?

**Short answer: Quite difficult, and likely not worth it for your use case.**

Here's why:

1. **Uber API access is restricted.** Uber's Ride Request API requires a business partnership and approval process. They don't hand out API keys to just anyone — you need to apply, get approved, and maintain compliance.

2. **Ride scheduling complexity.** You'd need to handle pickup/dropoff addresses, time scheduling, ride status tracking, cancellations, refunds, and fare estimates — all of which change in real-time.

3. **Liability and payments.** Uber rides are priced dynamically. A flat $25 won't match actual fares, meaning you'd either lose money or overcharge users.

### Recommended Approach: Keep It Simple

Instead of a real Uber integration, there are two practical paths:

**Option A — Affiliate/Deep Link (Easiest)**
- Add a button that opens the Uber app or uber.com with the venue address pre-filled
- Use Uber's universal deep link: `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=X&dropoff[longitude]=Y&dropoff[nickname]=VenueName`
- No API key needed, no partnership needed
- You don't charge for it — it's a value-add for your users

**Option B — Keep the Flat Fee Add-On (Current)**
- Keep the current $25 upsell as-is
- After purchase, show the user an Uber deep link to book their own ride
- You pocket the $25 as a convenience/concierge fee

### What I'd Build (Option A)

- Add venue coordinates to your events/teams data
- Replace the $25 Uber toggle with a free "Get an Uber to the game" button that deep-links to the Uber app with the venue pre-filled
- Show it on the confirmation/success page and on the game detail page
- No backend changes, no API keys, no edge functions needed

This is a 30-minute implementation with zero ongoing maintenance.

### Technical Details

- Add `latitude`/`longitude` fields to your venue data (in `teamsVenues.ts` or the events table)
- Build the Uber deep link URL using the venue coordinates
- Add a styled button/card on the game page and post-purchase page

