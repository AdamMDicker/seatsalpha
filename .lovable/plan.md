

## Plan: Audit and Fix Blue Jays Ticket Data vs Spreadsheet

### Summary
Compare every ticket listing in the database against the master Google Sheet to find and fix discrepancies in prices, quantities, sections, and missing/extra tickets.

### Approach
Write a Python audit script that:
1. Fetches the live spreadsheet CSV
2. Queries all Blue Jays tickets from the database
3. Compares row-by-row and produces a discrepancy report
4. Generates SQL fix statements for each issue found

### Rules for Spreadsheet Interpretation
- **SWAP rows**: Exclude from site (these are being traded elsewhere)
- **$0 price rows**: Exclude (comp tickets like section 118 row 9, section 521 row 5)
- **#VALUE! sections**: Skip (invalid data)
- **"3pack"/"Banner 3-pack" promos**: Not giveaways, just bundle notes
- **Non-SWAP, non-$0 rows with valid sections**: These are the tickets that should be on the site

### Steps

1. **Run audit script** -- Parse the spreadsheet, query the DB, and compare:
   - Missing tickets (in spreadsheet but not in DB)
   - Extra tickets (in DB but not in spreadsheet)
   - Price mismatches
   - Quantity mismatches
   - Wrong giveaway flags

2. **Review discrepancy report** -- Present findings before making changes

3. **Apply fixes via SQL** -- Insert missing tickets, update wrong prices/quantities, delete extras (if any), fix giveaway metadata

### Technical Details
- The script will match tickets by: event date + opponent + section + row_name
- Prices compared using the "Per Seat" column from the spreadsheet
- Events matched by `title LIKE '%Blue Jays%'` and UTC-converted event_date
- All fixes applied as featured tickets (`is_reseller_ticket = false`)
- Excluded dates (Apr 17, May 1, May 15, May 29, Jul 10) confirmed already removed

