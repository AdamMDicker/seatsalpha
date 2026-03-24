

## Seller Email Improvements

This plan covers updating the seller notification email in the stripe webhook with the user's feedback (points 1-6, 9). Points 7 and 8 are design discussions that don't require code changes now.

### Changes to `supabase/functions/stripe-webhook/index.ts`

**1. Add quantity to seller email**
- Add `quantity` to the `sellerEmailHtml` function signature and display it as a row in the details table.

**2. Show total sale amount (not just per-ticket price)**
- Add a "Price Per Ticket" row AND a "Total Sale" row showing `quantity × price`.
- The data is already available: `ticket.price` is per-ticket, and `quantity` comes from metadata.

**3. Confirm: yes, the system knows quantity and per-ticket price**
- The webhook already has `quantity` from `meta.ticket_quantity` and `ticket.price` from the DB. No changes needed for data availability.

**4. Remove "check your spam/junk folder" from seller email**
- Delete the spam warning line from the seller email footer.

**5. Change delivery language**
- Replace "Please ensure the tickets are delivered promptly" with:
  "Tickets must be delivered within, at least, 48 hours before the event."

**6. Add ticket transfer upload reminder**
- Add a highlighted callout box:
  "Please ensure you upload a copy/image of the ticket transfer to your Seats.ca Seller Portal after completion."

**9. Add penalty/payment terms reminders**
- Add two warning notices:
  - "Please ensure that your ticket transfer is for the noted event and seats. Ticket transfer errors are subject to Seats.ca Terms and Conditions."
  - "Seller payments are contingent on properly transferred tickets and occur two weeks after the event. In the event of any ticket transfer errors, Seats.ca reserves the right to withhold payment to facilitate any buyer issues/complaints."

### Also update `send-transactional-email` seller template
- Apply the same changes to the `sellerNotificationHtml` function in `supabase/functions/send-transactional-email/index.ts` for consistency.

### Redeploy
- Deploy both `stripe-webhook` and `send-transactional-email` edge functions.

### Not in scope (discussion items)
- Points 7-8 (ticket transfer verification with AI, seller email privacy) are strategic decisions. These can be revisited as separate features once you decide on the approach.

