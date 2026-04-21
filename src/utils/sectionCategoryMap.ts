// Maps a Rogers Centre ticket section value (e.g. "113", "200B", "TD Terrace")
// to one of the category IDs used in venue_section_views (e.g. "100R", "500B", "TDT").
// Returns null if no confident mapping exists.

const NAMED_SECTION_MAP: Record<string, string> = {
  "TD TERRACE": "TDT",
  "TD TERRACE LEFT": "TDT",
  "TD TERRACE RIGHT": "TDT",
  "PREMIUM TICKETMASTER LOUNGE": "PTML",
  "TICKETMASTER LOUNGE": "PTML",
  "KPMG PREMIUM BLUEPRINT LOUNGE": "KPMG",
  "KPMG LOUNGE": "KPMG",
  "PREMIUM TD LOUNGE": "PTD",
  "TD LOUNGE": "PTD",
  "ROGERS PREMIUM BANNER LOUNGE": "RPBL",
  "BANNER LOUNGE": "RPBL",
  "SCOREBET SEATS": "SBL",
  "SCOREBET": "SBL",
};

/**
 * Map a Rogers Centre ticket section to a section-view category id.
 * Numeric sections at Rogers Centre roughly follow:
 *  - 100s: lower bowl. 100-115 third-base side, 116-129 behind home, 130-141 first-base side. Outfield: 102 area corners, 142+ outfield.
 *  - 200s: second deck. 200-218 third-base, 219-228 behind home, 229-243 first-base.
 *  - 500s: upper deck. 500-516 third-base, 517-528 behind home, 529-540 first-base.
 *
 * We use simple numeric ranges that approximate the seating bowl.
 */
export function mapRogersCentreSectionToCategory(rawSection: string | null | undefined): string | null {
  if (!rawSection) return null;
  const trimmed = String(rawSection).trim();
  if (!trimmed) return null;

  // Named sections
  const upper = trimmed.toUpperCase();
  if (NAMED_SECTION_MAP[upper]) return NAMED_SECTION_MAP[upper];
  for (const key of Object.keys(NAMED_SECTION_MAP)) {
    if (upper.includes(key)) return NAMED_SECTION_MAP[key];
  }

  // Pull leading numeric portion
  const numMatch = trimmed.match(/^(\d{3,4})/);
  if (!numMatch) return null;
  const num = parseInt(numMatch[1], 10);
  if (Number.isNaN(num)) return null;

  // 100 level (lower bowl)
  if (num >= 100 && num <= 199) {
    // Outfield ranges (rough): 101, 142+ are outfield wraparound
    if (num <= 102 || num >= 138) {
      // Left/right outfield
      return num <= 102 ? "100OL" : "100OR";
    }
    if (num >= 116 && num <= 130) return "100B"; // behind home
    if (num < 116) return "100L"; // third-base side
    return "100R"; // first-base side
  }

  // 200 level
  if (num >= 200 && num <= 299) {
    if (num >= 219 && num <= 228) return "200C";
    if (num < 219) return "200L";
    return "200R";
  }

  // 500 level (upper deck)
  if (num >= 500 && num <= 599) {
    if (num >= 517 && num <= 528) return "500B";
    if (num < 517) return "500L";
    return "500R";
  }

  return null;
}
