

# Add Separate Key Terms Acknowledgment to Seller Agreement Flow

## Summary
After the full 27-section Seller Agreement, add a dedicated "Key Terms Acknowledgment" section where sellers must type their initials, full name, and signature (typed), with a date auto-filled. This acts as a legally stronger confirmation of the most critical terms. The acknowledgment data is stored in the `resellers` table.

## Changes

### 1. Database: Add acknowledgment fields to `resellers`
- `acknowledgment_initials` (text, nullable)
- `acknowledgment_name` (text, nullable)
- `acknowledgment_signed_at` (timestamptz, nullable)

The `agreement_accepted_at` timestamp continues to be set only after both the agreement checkbox AND the key terms acknowledgment are completed.

### 2. Update `SellerAgreement.tsx`
After the 27 agreement sections and before the submit button, add a new bordered section:

- **Header**: "Seats.ca Seller Agreement – Key Terms Acknowledgment"
- **Body**: The 12 key terms bullet points provided by the user, displayed as numbered items
- **Form fields**:
  - "Seller Initials" — short text input (2-4 chars, required)
  - "Seller Name / Business Name" — text input (required)
  - "Signature" — text input styled in a cursive/script font to simulate a signature (required)
  - "Date" — auto-filled with today's date (read-only)
- **Validation**: All three fields must be filled AND the agreement checkbox checked before the submit button enables
- On submit, save initials + name + signed_at to the reseller record alongside `agreement_accepted_at`

### 3. Files
- **Migration**: Add 3 columns to `resellers`
- **Modify**: `src/pages/SellerAgreement.tsx` — add the key terms acknowledgment UI below the agreement sections, add form state + validation, update `handleAccept` to save the new fields

