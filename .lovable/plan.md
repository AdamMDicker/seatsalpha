
# Applicable Fixes from Manus TODO List

I reviewed all 60+ items against the current codebase. Here's the breakdown:

## Already Done / Not Applicable

Most items fall into these categories:
- **Manus-specific infrastructure** (tRPC, Express routes, data migration, new Supabase project) — does not apply to this Lovable project
- **Already implemented**: Recovery email template is already professional and branded. Pricing config ($59.99/$99.99) is correct. Membership detection via `useAuth()` context exists. My Orders page exists. FeeGateDialog correctly hides membership upsell when `isMember=true`. Stripe is in live mode.
- **Already fixed in last session**: Buyer email fallback, delivery status accuracy, timezone handling.
- **DNS/domain issue**: The email domain `notify.seats.ca` DNS has drifted — you need to re-verify the NS records at your domain provider (as mentioned in the previous message). This is blocking ALL email delivery.

## Fixes to Apply (4 items)

### 1. ContactInfoGate: use upsert instead of update
**Bug**: If a user's profile row doesn't exist yet (edge case with OAuth signups), the `Save & Continue` button fails silently because it uses `.update()` which requires an existing row.
**Fix**: Change `.update()` to `.upsert()` in `ContactInfoGate.tsx` so it creates the row if missing.

### 2. Hide sold-out tickets (quantity = 0 remaining)
**Bug**: Tickets where `quantity - quantity_sold = 0` still appear in listings.
**Fix**: Add a `.filter()` in `TicketListings.tsx` to exclude tickets with zero remaining quantity before displaying them.

### 3. Add Account/Profile page with password change
**Missing feature**: There's no dedicated account page where users can view their profile, update their info, or change their password. Manus added this.
**Fix**: Create a new `AccountPage.tsx` with sections for profile info editing, password change (using `supabase.auth.updateUser`), and a link to purchase history (/my-orders). Add route `/account` and a nav link.

### 4. SEO: Reduce homepage meta keywords and set title
**Missing**: The homepage doesn't set `document.title` or manage meta keywords.
**Fix**: Add `document.title` in `Index.tsx` (concise ~53 char title) and a meta description tag focused on 6 core keywords.

## Deferred / User Action Required

- **Email delivery**: All emails (recovery, transactional, auth) are blocked because the `notify.seats.ca` DNS records have drifted. Go to **Cloud > Emails > Manage Domains** and re-verify, or update your NS records at your domain provider.
- **Design refinements** (color palette, typography, animations): These are cosmetic changes that should be reviewed individually rather than bulk-applied.
