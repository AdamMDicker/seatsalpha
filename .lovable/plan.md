

## Fix: Transfer Relay Emails Failing (Missing idempotency_key)

### Problem Found
All `transfer-relay-forward` emails are failing since today (Apr 13) with this error:
```
Missing run_id or idempotency_key — App emails can omit run_id by providing idempotency_key with purpose=transactional.
```

The email API now requires an `idempotency_key` for transactional emails. The `process-email-queue` dispatcher correctly passes `payload.idempotency_key` to the email API, but no edge function is including `idempotency_key` in the enqueue payload. Some emails (like buyer-confirmation) were sent successfully on Apr 12 before the enforcement kicked in — but all transfer-relay-forward emails today are hitting the DLQ after 5 retries.

### What's Working
- Auth emails (signup, recovery, etc.) -- working via auth-email-hook
- Branding is correct ("Seats.ca" everywhere, no "seatsalpha")
- Mismatch gate (disputed transfer blocking) -- working correctly
- Admin transfers dashboard -- working

### What's Broken
- `transfer-relay-forward` emails (the Ticketmaster relay to buyers) -- all failing
- Potentially all other transactional emails going forward

### Fix
Add `idempotency_key: messageId` to every `enqueue_email` payload across all 5 edge functions that queue transactional emails:

1. **`resolve-transfer-email/index.ts`** -- `queueEmail()` function (line ~596)
2. **`notify-buyer-transfer/index.ts`** -- confirm and dispute enqueue calls (lines ~241, ~293)
3. **`verify-transfer-image/index.ts`** -- buyer verified and admin mismatch enqueue calls (lines ~315, ~401)
4. **`transfer-fallback-reminder/index.ts`** -- fallback enqueue call (line ~86)
5. **`send-transactional-email/index.ts`** -- the main transactional enqueue call (line ~327)

Each function already generates a `messageId` (UUID) before enqueuing. The fix is simply adding `idempotency_key: messageId` to the payload object passed to `supabase.rpc("enqueue_email", ...)`.

After editing, all 5 edge functions must be redeployed.

### Technical Details
- The `idempotency_key` serves as a deduplication key for the email API
- Using the existing `message_id` UUID is the correct value since it's already unique per email
- No database changes needed
- No UI changes needed

