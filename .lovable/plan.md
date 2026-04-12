

## Plan: Brand Emails + Forward Ticketmaster Transfers

Three issues to address:

1. **Brand all transactional emails** — add Seats.ca logo, brand colors, and consistent styling
2. **Add event date + seat location** to the buyer transfer confirmation email
3. **Fix Ticketmaster email forwarding** — the `resolve-transfer-email` function exists but isn't configured in `config.toml` and has no logs (never deployed or not receiving webhooks)

---

### 1. Brand the Transfer Confirmation Emails

**Files:** `supabase/functions/verify-transfer-image/index.ts`, `supabase/functions/notify-buyer-transfer/index.ts`

Both the "confirmed" and "disputed" email templates will be updated to match the brand standard already used in `send-transactional-email` and `stripe-webhook`:

- Add the Seats.ca wordmark logo (300x300px) at the top of every email, above the gradient header
- Use the brand red gradient (`#d6193d → #b81535`) header
- Use Space Grotesk / Helvetica Neue font stack
- Add the spam/junk warning footer consistent with other emails

The logo URL is: `https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo.png`

### 2. Add Event Date + Ticket Location to Buyer Transfer Email

**File:** `supabase/functions/verify-transfer-image/index.ts`

The confirmed buyer email currently shows event title and venue but not the date or seat details. Update to:

- Fetch `event_date` from the event record (already available via `orderItem.tickets.events`)
- Fetch `section` and `row_name` from the ticket record
- Add a details table showing: Date, Venue, Section/Row — matching the layout in buyer confirmation emails
- Format the date using the same `formatEventDateET` helper

### 3. Fix Ticketmaster Email Forwarding

The `resolve-transfer-email` edge function exists and the code looks correct, but:

- It's **not in `config.toml`** — needs `verify_jwt = false` since it receives Resend inbound webhooks
- It may not be deployed — no logs exist
- Resend inbound webhook needs to be configured to point to this function's URL

**Actions:**
- Add `[functions.resolve-transfer-email]` with `verify_jwt = false` to `config.toml`
- Deploy the function
- The Resend inbound webhook URL should be: `https://fkcszgrewzhswdtsqpad.supabase.co/functions/v1/resolve-transfer-email`
- Verify the function works by checking logs after deployment

The user mentioned they'll forward a sample Ticketmaster email — once received, we can test the full relay flow.

### 4. Deploy

Deploy all updated functions: `verify-transfer-image`, `notify-buyer-transfer`, `resolve-transfer-email`

---

### Technical Details

- Logo is already hosted in the `email-assets` public storage bucket
- The `resolve-transfer-email` function uses `from: "Seats.ca Transfers <noreply@seats.ca>"` which sends via Resend directly (not the queue) — this is fine for forwarded emails since they need immediate delivery
- The Resend inbound webhook must be configured in the Resend dashboard to forward `email.received` events for `*@seats.ca` to the edge function URL

