

## Root Cause — User Was Right

Looking at the database, here's what actually happened:

**Disputed transfer `d625aeef`** (the one with the dispute email):
- Order placed: **April 15** at 19:42
- Ticket: `68e66ddc` → Section 207, Row 1, **Toronto Blue Jays vs Tigers, Sept 14, 2026**
- Order qty: 2
- Seller uploaded a screenshot showing **Sept 11 vs Orioles, qty 4** (the user's most recent test screenshot)

**Sept 11 Orioles purchase** (the brand new one):
- Order: `c6494da3` placed today (April 16) at 19:41
- Transfer `de65ac55` — Section 207, Row 1, **Sept 11 vs Orioles**, qty 2
- Status: `pending` — **no upload yet**

So the AI is technically correct: the seller uploaded the Sept 11 Orioles screenshot against the **older Sept 14 Tigers transfer** (`d625aeef`), not the new Sept 11 transfer (`de65ac55`).

### Why this is confusing for the seller

The seller dashboard shows multiple pending transfers. When the seller hit "Upload Proof" on the disputed Tigers row, they uploaded the Orioles screenshot — but they thought they were uploading against the Sept 11 order they just received. The system has **no visual signal** distinguishing which transfer row corresponds to which event/date, so it's easy to upload the right screenshot against the wrong row.

### The Ticketmaster screenshot proves this
Your TM screenshot shows: "Toronto Blue Jays vs. Baltimore Orioles · Fri Sep 11, 2026" with seats 1–4 (seats 3 & 4 in transfer to `order-erhfyliypv@inbound.seats.ca`).

Database confirms `order-erhfyliypv@inbound.seats.ca` is the alias for transfer `de65ac55` (the new Sept 11 Orioles one) — **not** `d625aeef` (the Sept 14 Tigers one). So the AI verification was right to reject it on the Tigers row. The proof actually belongs against `de65ac55`.

## Fix Plan

Make the seller dashboard impossible to confuse:

1. **Show event date + opponent prominently on each transfer row** in `SellerTransfers.tsx` so sellers visually match upload to the right row before clicking.
2. **Add a confirmation dialog inside `TransferProofUploader`** that shows the event title, date, section/row, and qty for the row being uploaded against — seller must confirm "Yes, this screenshot is for this game" before proceeding.
3. **Auto-detect mismatch from filename or paste**: not feasible client-side, so we rely on the confirmation dialog + post-upload AI catch (already working).
4. **Bonus**: if a seller has only ONE pending transfer matching the section/row in the screenshot, we could auto-route the upload there. Skip for now — keep manual.

### Files to change
- `src/components/reseller/SellerTransfers.tsx` — surface event date + opponent more prominently on each row.
- `src/components/reseller/TransferProofUploader.tsx` — accept event metadata as props, render a confirmation card inside the dialog showing exactly which order this upload is for.

### What about the AI verification function?
**No changes needed.** It correctly rejected the mismatched upload. The dispute was a true positive — the seller uploaded the wrong screenshot against the wrong row.

### Cleanup for the test data
Once the seller uploads the Orioles screenshot against the **correct** row (`de65ac55`), it will pass verification. The disputed `d625aeef` (Tigers) row still needs the actual Sept 14 Tigers screenshot OR can be admin-reset.

