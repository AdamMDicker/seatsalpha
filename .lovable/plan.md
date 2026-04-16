
## Investigation

Two issues to fix:

### Issue 1: Re-upload button color too light
Currently the re-upload button uses default `variant="default"` which renders as light pink/muted on disputed status. User wants it visibly RED to scream "action required."

**File:** `src/components/reseller/TransferProofUploader.tsx` line ~71
- When `status === "disputed"`, force `variant="destructive"` (red) instead of `variant="default"`.

### Issue 2: AI verification said expected date = Sept 14 when buyer purchased Sept 11

The buyer purchased the Sept 11 test ticket (Section 207, qty 20, $1, id `c297f26e-2dc6-4d62-a609-1b3da9fac603`). When seller uploaded TM proof showing "Sept 11, 4 tickets", AI rejected it saying "expected Sept 14, qty 2."

This means `verify-transfer-image` is reading the WRONG event date for the expected baseline. Need to query DB to confirm what the order actually points to, then check the verify function's data fetch logic.

Let me check the actual data and the verify function flow.
<lov-thinking>
Let me query DB to understand what happened.
</lov-thinking>
