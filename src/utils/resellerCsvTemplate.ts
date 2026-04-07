export const RESELLER_CSV_HEADERS = [
  "Sport",
  "Home Team",
  "Away Team",
  "Venue",
  "Event Date",
  "Event Time",
  "Quantity",
  "Section",
  "Row",
  "Seat Numbers",
  "Hide Seat Numbers",
  "Notes",
  "Ticket Group Account",
  "Unit Cost",
  "Stock Type",
  "Split Type",
  "Seat Type",
  "Order Number",
  "Sales Tax Paid",
] as const;

export const VALID_SPORTS = ["MLB", "NHL", "NBA", "NFL", "MLS", "CFL", "WNBA", "OTHER"] as const;
export const VALID_STOCK_TYPES = ["PDF", "Mobile QR", "Mobile Transfer"] as const;
export const VALID_SPLIT_TYPES = ["Any", "No Singles", "Keep Pairs", "No Splitting"] as const;
export const VALID_SEAT_TYPES = ["Consecutive", "General Admission", "Accessible", "VIP"] as const;

const EXAMPLE_ROW = [
  "MLB",
  "Blue Jays",
  "Yankees",
  "Rogers Centre",
  "2026-06-15",
  "7:07 PM",
  "2",
  "118",
  "5",
  "1-2",
  "No",
  "Bobblehead Night",
  "",
  "85.00",
  "Mobile Transfer",
  "Keep Pairs",
  "Consecutive",
  "",
  "No",
];

export function generateResellerCsvTemplate(): string {
  return [
    RESELLER_CSV_HEADERS.join(","),
    EXAMPLE_ROW.join(","),
  ].join("\n");
}

export function downloadCsvTemplate() {
  const csv = generateResellerCsvTemplate();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "seats_ca_inventory_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export interface ResellerCsvRow {
  sport: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  quantity: string;
  section: string;
  row: string;
  seatNumbers: string;
  hideSeatNumbers: string;
  notes: string;
  ticketGroupAccount: string;
  unitCost: string;
  stockType: string;
  splitType: string;
  seatType: string;
  orderNumber: string;
  salesTaxPaid: string;
}

export function parseResellerCsv(text: string): ResellerCsvRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).filter(l => l.trim()).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    return {
      sport: values[headers.indexOf("Sport")] || "",
      homeTeam: values[headers.indexOf("Home Team")] || "",
      awayTeam: values[headers.indexOf("Away Team")] || "",
      venue: values[headers.indexOf("Venue")] || "",
      eventDate: values[headers.indexOf("Event Date")] || "",
      eventTime: values[headers.indexOf("Event Time")] || "",
      quantity: values[headers.indexOf("Quantity")] || "",
      section: values[headers.indexOf("Section")] || "",
      row: values[headers.indexOf("Row")] || "",
      seatNumbers: values[headers.indexOf("Seat Numbers")] || "",
      hideSeatNumbers: values[headers.indexOf("Hide Seat Numbers")] || "",
      notes: values[headers.indexOf("Notes")] || "",
      ticketGroupAccount: values[headers.indexOf("Ticket Group Account")] || "",
      unitCost: values[headers.indexOf("Unit Cost")] || "",
      stockType: values[headers.indexOf("Stock Type")] || "",
      splitType: values[headers.indexOf("Split Type")] || "",
      seatType: values[headers.indexOf("Seat Type")] || "",
      orderNumber: values[headers.indexOf("Order Number")] || "",
      salesTaxPaid: values[headers.indexOf("Sales Tax Paid")] || "",
    };
  });
}

export function validateResellerRow(row: ResellerCsvRow, index: number): string | null {
  if (!row.sport || !VALID_SPORTS.includes(row.sport.toUpperCase() as any)) {
    return `Row ${index + 1}: Invalid sport "${row.sport}". Must be one of: ${VALID_SPORTS.join(", ")}`;
  }
  if (!row.homeTeam) return `Row ${index + 1}: Home Team is required`;
  if (row.homeTeam.length > 100) return `Row ${index + 1}: Home Team too long (max 100)`;
  if (!row.awayTeam) return `Row ${index + 1}: Away Team is required`;
  if (row.awayTeam.length > 100) return `Row ${index + 1}: Away Team too long (max 100)`;
  if (!row.venue) return `Row ${index + 1}: Venue is required`;
  if (row.venue.length > 150) return `Row ${index + 1}: Venue too long (max 150)`;
  if (!row.eventDate || isNaN(Date.parse(row.eventDate))) return `Row ${index + 1}: Invalid Event Date "${row.eventDate}". Use YYYY-MM-DD`;
  if (!row.eventTime) return `Row ${index + 1}: Event Time is required`;
  if (!row.quantity || isNaN(parseInt(row.quantity)) || parseInt(row.quantity) < 1) return `Row ${index + 1}: Invalid Quantity`;
  if (!row.section) return `Row ${index + 1}: Section is required`;
  if (!row.unitCost || isNaN(parseFloat(row.unitCost)) || parseFloat(row.unitCost) < 0) return `Row ${index + 1}: Invalid Unit Cost`;
  if (!row.stockType || !VALID_STOCK_TYPES.includes(row.stockType as any)) {
    return `Row ${index + 1}: Invalid Stock Type "${row.stockType}". Must be: ${VALID_STOCK_TYPES.join(", ")}`;
  }
  if (row.splitType && !VALID_SPLIT_TYPES.includes(row.splitType as any)) {
    return `Row ${index + 1}: Invalid Split Type "${row.splitType}". Must be: ${VALID_SPLIT_TYPES.join(", ")}`;
  }
  if (row.seatType && !VALID_SEAT_TYPES.includes(row.seatType as any)) {
    return `Row ${index + 1}: Invalid Seat Type "${row.seatType}". Must be: ${VALID_SEAT_TYPES.join(", ")}`;
  }
  if (row.notes && row.notes.length > 500) return `Row ${index + 1}: Notes too long (max 500)`;
  return null;
}

export function parseEventTime(dateStr: string, timeStr: string): string {
  const time = timeStr.trim();
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  let hours = 19, minutes = 7;
  if (match) {
    hours = parseInt(match[1]);
    const isPM = match[3].toUpperCase() === "PM";
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    minutes = parseInt(match[2]);
  }
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}
