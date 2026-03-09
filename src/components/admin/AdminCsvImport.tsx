import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Check, AlertCircle, Download } from "lucide-react";
import {
  parseResellerCsv,
  validateResellerRow,
  parseEventTime,
  downloadCsvTemplate,
  RESELLER_CSV_HEADERS,
  type ResellerCsvRow,
} from "@/utils/resellerCsvTemplate";

interface LegacyCsvRow {
  title?: string;
  venue?: string;
  city?: string;
  province?: string;
  event_date?: string;
  category?: string;
  section?: string;
  row?: string;
  seat?: string;
  price?: string;
  quantity?: string;
  [key: string]: string | undefined;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 1000;

function parseLegacyCsv(text: string): LegacyCsvRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).filter(l => l.trim()).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: LegacyCsvRow = {};
    headers.forEach((h, i) => { row[h] = values[i]; });
    return row;
  });
}

function validateLegacyRow(row: LegacyCsvRow, index: number): string | null {
  if (row.price && (isNaN(parseFloat(row.price)) || parseFloat(row.price) < 0)) return `Row ${index + 1}: Invalid price`;
  if (row.quantity && (isNaN(parseInt(row.quantity)) || parseInt(row.quantity) < 1)) return `Row ${index + 1}: Invalid quantity`;
  if (row.event_date && isNaN(Date.parse(row.event_date))) return `Row ${index + 1}: Invalid date`;
  if (row.title && row.title.length > 255) return `Row ${index + 1}: Title too long`;
  return null;
}

function isResellerFormat(firstLine: string): boolean {
  const headers = firstLine.split(",").map(h => h.trim());
  return headers.includes("Sport") && headers.includes("Home Team") && headers.includes("Away Team");
}

const AdminCsvImport = () => {
  const [csvData, setCsvData] = useState<ResellerCsvRow[] | LegacyCsvRow[]>([]);
  const [csvFormat, setCsvFormat] = useState<"reseller" | "legacy">("legacy");
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 5MB", variant: "destructive" });
      return;
    }

    setFileName(file.name);
    setResults(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const firstLine = text.trim().split("\n")[0] || "";

      if (isResellerFormat(firstLine)) {
        const parsed = parseResellerCsv(text);
        if (parsed.length > MAX_ROWS) {
          toast({ title: "Too many rows", description: `Maximum ${MAX_ROWS} rows. File has ${parsed.length}.`, variant: "destructive" });
          return;
        }
        const errors: string[] = [];
        parsed.forEach((row, i) => { const err = validateResellerRow(row, i); if (err) errors.push(err); });
        if (errors.length > 0) {
          toast({ title: "Validation errors", description: errors.slice(0, 3).join("; ") + (errors.length > 3 ? ` (+${errors.length - 3} more)` : ""), variant: "destructive" });
          return;
        }
        setCsvFormat("reseller");
        setCsvData(parsed);
      } else {
        const parsed = parseLegacyCsv(text);
        if (parsed.length > MAX_ROWS) {
          toast({ title: "Too many rows", description: `Maximum ${MAX_ROWS} rows. File has ${parsed.length}.`, variant: "destructive" });
          return;
        }
        const errors: string[] = [];
        parsed.forEach((row, i) => { const err = validateLegacyRow(row, i); if (err) errors.push(err); });
        if (errors.length > 0) {
          toast({ title: "Validation errors", description: errors.slice(0, 3).join("; ") + (errors.length > 3 ? ` (+${errors.length - 3} more)` : ""), variant: "destructive" });
          return;
        }
        setCsvFormat("legacy");
        setCsvData(parsed);
      }
      toast({ title: `Parsed ${text.trim().split("\n").length - 1} rows from ${file.name}` });
    };
    reader.readAsText(file);
  };

  const importReseller = async (rows: ResellerCsvRow[]) => {
    let success = 0, errors = 0;
    for (const row of rows) {
      try {
        const title = `${row.awayTeam} at ${row.homeTeam}`;
        const eventDate = parseEventTime(row.eventDate, row.eventTime);
        const { data: existing } = await supabase.from("events").select("id").eq("title", title).eq("venue", row.venue).eq("event_date", eventDate).maybeSingle();
        let eventId: string;
        if (existing) { eventId = existing.id; }
        else {
          const { data: ne, error } = await supabase.from("events").insert({ title, venue: row.venue, city: "", province: "", event_date: eventDate, category: row.sport.toLowerCase(), description: row.notes || null }).select("id").single();
          if (error) { errors++; continue; }
          eventId = ne.id;
        }
        const { error: te } = await supabase.from("tickets").insert({
          event_id: eventId, section: row.section, row_name: row.row || null, seat_number: row.seatNumbers || null,
          price: parseFloat(row.unitCost), quantity: parseInt(row.quantity),
          hide_seat_numbers: row.hideSeatNumbers?.toLowerCase() === "yes",
          stock_type: row.stockType || null, split_type: row.splitType || null, seat_type: row.seatType || null,
          order_number: row.orderNumber || null, sales_tax_paid: row.salesTaxPaid?.toLowerCase() === "yes",
          ticket_group_account: row.ticketGroupAccount || null, seat_notes: row.notes || null,
        });
        if (te) errors++; else success++;
      } catch { errors++; }
    }
    return { success, errors };
  };

  const importLegacy = async (rows: LegacyCsvRow[]) => {
    let success = 0, errors = 0;
    for (const row of rows) {
      try {
        let eventId: string | null = null;
        if (row.title && row.venue) {
          const { data: existing } = await supabase.from("events").select("id").eq("title", row.title).eq("venue", row.venue || "").maybeSingle();
          if (existing) { eventId = existing.id; }
          else {
            const { data: ne, error } = await supabase.from("events").insert({ title: row.title, venue: row.venue || "", city: row.city || "", province: row.province || "", event_date: row.event_date || new Date().toISOString(), category: row.category || "sports" }).select("id").single();
            if (error) { errors++; continue; }
            eventId = ne.id;
          }
        }
        if (eventId && row.section && row.price) {
          const { error } = await supabase.from("tickets").insert({ event_id: eventId, section: row.section, row_name: row.row || null, seat_number: row.seat || null, price: parseFloat(row.price), quantity: parseInt(row.quantity || "1") });
          if (error) errors++; else success++;
        } else if (eventId) { success++; } else { errors++; }
      } catch { errors++; }
    }
    return { success, errors };
  };

  const handleImport = async () => {
    if (csvData.length === 0) return;
    setImporting(true);
    const result = csvFormat === "reseller"
      ? await importReseller(csvData as ResellerCsvRow[])
      : await importLegacy(csvData as LegacyCsvRow[]);
    setResults(result);
    setImporting(false);
    toast({ title: `Import complete: ${result.success} succeeded, ${result.errors} failed` });
  };

  const previewHeaders = csvFormat === "reseller"
    ? ["Sport", "Home", "Away", "Venue", "Date", "Qty", "Section", "Price"]
    : Object.keys((csvData as LegacyCsvRow[])[0] || {}).slice(0, 6);

  const previewValues = (row: ResellerCsvRow | LegacyCsvRow, i: number) => {
    if (csvFormat === "reseller") {
      const r = row as ResellerCsvRow;
      return [r.sport, r.homeTeam, r.awayTeam, r.venue, r.eventDate, r.quantity, r.section, `$${r.unitCost}`];
    }
    return Object.values(row).slice(0, 6);
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-4">CSV Import</h2>
      <p className="text-sm text-muted-foreground mb-2">
        Supports both the <strong>reseller template</strong> (Sport, Home Team, Away Team...) and the <strong>legacy format</strong> (title, venue, city...).
      </p>
      <Button variant="outline" size="sm" className="mb-6" onClick={downloadCsvTemplate}>
        <Download className="h-4 w-4" /> Download Reseller Template
      </Button>

      <div className="glass rounded-xl p-6 space-y-6">
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">{fileName || "Drop your CSV file or click to browse"}</p>
          <Button variant="glass" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" /> Choose File
          </Button>
        </div>

        {csvData.length > 0 && (
          <div>
            <p className="text-sm text-foreground mb-1">{csvData.length} rows ready to import</p>
            <p className="text-xs text-muted-foreground mb-3">Format detected: <span className="text-primary font-medium">{csvFormat === "reseller" ? "Reseller Template" : "Legacy"}</span></p>
            <div className="max-h-48 overflow-y-auto overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    {previewHeaders.map((h) => (
                      <th key={h} className="text-left p-2 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {previewValues(row, i).map((v, j) => (
                        <td key={j} className="p-2 text-foreground">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="hero" className="mt-4" onClick={handleImport} disabled={importing}>
              {importing ? "Importing..." : `Import ${csvData.length} rows`}
            </Button>
          </div>
        )}

        {results && (
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm text-green-500">
              <Check className="h-4 w-4" /> {results.success} imported
            </div>
            {results.errors > 0 && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {results.errors} errors
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCsvImport;
