// Admin inventory CSV template — matches the import logic in AdminCsvImport.tsx
// and the field shape exported from the master Blue Jays spreadsheet.

export const ADMIN_CSV_HEADERS = [
  "title",
  "venue",
  "city",
  "province",
  "event_date",
  "category",
  "section",
  "row",
  "seat",
  "price",
  "quantity",
  "notes",
  "hide_seat_numbers",
] as const;

export const ADMIN_COLUMN_DESCRIPTIONS: Record<string, string> = {
  title: "Full event title, e.g. 'Toronto Blue Jays vs Yankees'. Must match or create an event.",
  venue: "Venue name, e.g. 'Rogers Centre', 'Scotiabank Arena'. Used to match existing events.",
  city: "City where the event takes place, e.g. 'Toronto'. Required for new events.",
  province: "Province or state code, e.g. 'ON', 'BC', 'NY'. Required for new events.",
  event_date:
    "Date and time in ISO format: YYYY-MM-DDTHH:MM (24-hour). Example: '2026-06-15T19:07'.",
  category: "Event category. Options: sports, concerts, theatre. Defaults to 'sports' if blank.",
  section: "Section number or name, e.g. '118', 'W11', 'GA'. Required — rows with blank sections are skipped.",
  row: "Row within the section, e.g. '5', 'A'. Optional.",
  seat: "Seat number(s), e.g. '1-4'. Optional — leave blank for GA or undisclosed seats.",
  price: "Ticket price per seat in CAD, e.g. '85.00'. Must be a positive number.",
  quantity: "Number of tickets in this listing, e.g. '2'. Defaults to 1 if blank.",
  notes: "Optional seat notes shown to buyers, e.g. 'Bobblehead Night', 'Aisle seats'.",
  hide_seat_numbers:
    "Yes / No — when 'Yes', seat numbers are hidden from buyers. Defaults to No.",
};

const EXAMPLE_ROWS: string[][] = [
  [
    "Toronto Blue Jays vs Yankees",
    "Rogers Centre",
    "Toronto",
    "ON",
    "2026-06-15T19:07",
    "sports",
    "118",
    "5",
    "1-2",
    "85.00",
    "2",
    "Bobblehead Night",
    "No",
  ],
  [
    "Toronto Blue Jays vs Red Sox",
    "Rogers Centre",
    "Toronto",
    "ON",
    "2026-04-27T19:07",
    "sports",
    "TBD",
    "",
    "",
    "125.00",
    "4",
    "Section confirmed at transfer",
    "Yes",
  ],
  [
    "Toronto Maple Leafs vs Canadiens",
    "Scotiabank Arena",
    "Toronto",
    "ON",
    "2026-01-18T19:00",
    "sports",
    "320",
    "12",
    "5-6",
    "210.00",
    "2",
    "",
    "No",
  ],
];

function escapeCsvCell(value: string): string {
  if (value === "" || value == null) return "";
  // Quote if contains comma, quote, or newline
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateAdminCsvTemplate(): string {
  const lines = [
    ADMIN_CSV_HEADERS.join(","),
    ...EXAMPLE_ROWS.map((row) => row.map(escapeCsvCell).join(",")),
  ];
  return lines.join("\n");
}

export function downloadAdminCsvTemplate() {
  const csv = generateAdminCsvTemplate();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "seats_ca_admin_inventory_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}
