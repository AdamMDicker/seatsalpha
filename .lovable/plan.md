

# Add Hero Image Banner to All Buyer & Seller Emails

## What This Does
Replaces the current plain dark header (just the seats.ca logo on a charcoal background) in all transactional emails with a branded hero image banner matching the uploaded reference — a baseball stadium photo overlaid with the seats.ca logo, tagline "Compare Every Seat. Skip Every Fee.", and trust badges ("Verified Authentic · No Hidden Fees · Full Refund Guarantee").

## The Hero Image

The uploaded reference shows a stadium photo with overlaid branding. Since email clients don't support CSS overlays reliably, the approach is:

1. **Generate a pre-composited hero banner image** (~600×200px) using the AI image model — stadium photo with logo, tagline, and trust badges baked in as a single image
2. **Upload it to the `email-assets` storage bucket** as `email-hero-banner.png` so it's publicly accessible via URL
3. **Reference the hosted URL** in all email templates as a simple `<img>` tag

## Files to Update (6 Edge Functions)

Every `premiumWrapper` function gets updated to include the hero banner image between the logo header and the accent line:

1. **`supabase/functions/stripe-webhook/index.ts`** — Buyer confirmation + Seller notification emails
2. **`supabase/functions/notify-buyer-transfer/index.ts`** — Transfer confirmed/disputed emails
3. **`supabase/functions/verify-transfer-image/index.ts`** — Transfer verification emails
4. **`supabase/functions/send-transactional-email/index.ts`** — General transactional emails
5. **`supabase/functions/resolve-transfer-email/index.ts`** — "Accept Tickets" relay email
6. **`supabase/functions/transfer-fallback-reminder/index.ts`** — Fallback reminder email

## Template Change

The current header structure:
```
[Dark bar with logo]
[Accent color line]
[Title + body]
```

New structure:
```
[Dark bar with logo]
[Hero banner image — stadium, tagline, trust badges]
[Accent color line]
[Title + body]
```

The hero banner row will be:
```html
<tr><td style="padding:0;">
  <img src="HERO_BANNER_URL" alt="Compare Every Seat. Skip Every Fee." 
       width="600" style="display:block;width:100%;height:auto;" />
</td></tr>
```

## Steps

1. Generate the hero banner image using the AI image model (baseball stadium, dark overlay, seats.ca logo centered, tagline below, trust badges at bottom)
2. Upload to Supabase storage `email-assets` bucket
3. Add `HERO_BANNER_URL` constant to all 6 edge functions
4. Insert the hero image row into each `premiumWrapper` / standalone template
5. Deploy all 6 edge functions
6. Update the email standards memory

