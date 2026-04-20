import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Check, AlertCircle, Download, HelpCircle, X, RefreshCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CsvRow {
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

const COLUMN_DESCRIPTIONS: Record<string, string> = {
  title: "Full event title, e.g. 'Toronto Blue Jays vs Yankees'. Must match or create an event.",
  venue: "Venue name, e.g. 'Rogers Centre', 'Scotiabank Arena'. Used to match existing events.",
  city: "City where the event takes place, e.g. 'Toronto'. Required for new events.",
  province: "Province or state code, e.g. 'ON', 'BC', 'NY'. Required for new events.",
  event_date: "Date and time in ISO format: YYYY-MM-DDTHH:MM or YYYY-MM-DD HH:MM. e.g. '2026-06-15T19:07'.",
  category: "Event category. Options: sports, concerts, theatre. Defaults to 'sports' if blank.",
  section: "Seating section number or name, e.g. '118', 'W11', 'GA'. Required for ticket rows.",
  row: "Row within the section, e.g. '5', 'A', 'AA'. Optional.",
  seat: "Seat number(s), e.g. '1-4', '12'. Optional — leave blank for GA.",
  price: "Ticket price per seat in CAD, e.g. '85.00'. Must be a positive number.",
  quantity: "Number of tickets available, e.g. '2'. Defaults to 1 if blank.",
};

const ADMIN_CSV_HEADERS = ["title", "venue", "city", "province", "event_date", "category", "section", "row", "seat", "price", "quantity"];

function generateAdminCsvTemplate(): string {
  const example = [
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
  ];
  return [ADMIN_CSV_HEADERS.join(","), example.join(",")].join("\n");
}

function downloadAdminTemplate() {
  const csv = generateAdminCsvTemplate();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "seats_ca_admin_import_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const AdminCsvImport = () => {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCsv = (text: string): CsvRow[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    return lines.slice(1).filter(l => l.trim()).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row: CsvRow = {};
      headers.forEach((h, i) => { row[h] = values[i]; });
      return row;
    });
  };

  const validateRow = (row: CsvRow, index: number): string | null => {
    if (row.price && (isNaN(parseFloat(row.price)) || parseFloat(row.price) < 0)) return `Row ${index + 1}: Invalid price`;
    if (row.quantity && (isNaN(parseInt(row.quantity)) || parseInt(row.quantity) < 1)) return `Row ${index + 1}: Invalid quantity`;
    if (row.event_date && isNaN(Date.parse(row.event_date))) return `Row ${index + 1}: Invalid date`;
    if (row.title && row.title.length > 255) return `Row ${index + 1}: Title too long`;
    return null;
  };

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
      const parsed = parseCsv(text);
      if (parsed.length > MAX_ROWS) {
        toast({ title: "Too many rows", description: `Maximum ${MAX_ROWS} rows allowed. File has ${parsed.length}.`, variant: "destructive" });
        return;
      }
      const errors: string[] = [];
      parsed.forEach((row, i) => { const err = validateRow(row, i); if (err) errors.push(err); });
      if (errors.length > 0) {
        toast({ title: "Validation errors", description: errors.slice(0, 3).join("; ") + (errors.length > 3 ? ` (+${errors.length - 3} more)` : ""), variant: "destructive" });
        return;
      }
      setCsvData(parsed);
      toast({ title: `Parsed ${parsed.length} rows from ${file.name}` });
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (csvData.length === 0) return;
    setImporting(true);
    let success = 0, errors = 0;
    for (const row of csvData) {
      try {
        let eventId: string | null = null;
        if (row.title && row.venue) {
          const { data: existing } = await supabase.from("events").select("id").eq("title", row.title).eq("venue", row.venue || "").maybeSingle();
          if (existing) { eventId = existing.id; }
          else {
            const { data: newEvent, error } = await supabase.from("events").insert({ title: row.title, venue: row.venue || "", city: row.city || "", province: row.province || "", event_date: row.event_date || new Date().toISOString(), category: row.category || "sports" }).select("id").single();
            if (error) { errors++; continue; }
            eventId = newEvent.id;
          }
        }
        if (eventId && row.section && row.price) {
          const { error } = await supabase.from("tickets").insert({ event_id: eventId, section: row.section, row_name: row.row || null, seat_number: row.seat || null, price: parseFloat(row.price), quantity: parseInt(row.quantity || "1"), seller_id: "c0768913-3e54-476a-b4b2-8a0051b087ed" });
          if (error) errors++; else success++;
        } else if (eventId) { success++; } else { errors++; }
      } catch { errors++; }
    }
    setResults({ success, errors });
    setImporting(false);
    toast({ title: `Import complete: ${success} succeeded, ${errors} failed` });
  };

  const clearFile = () => {
    setCsvData([]);
    setFileName("");
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleSyncInventory = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        toast({ title: "Not authenticated", variant: "destructive" });
        setSyncing(false);
        return;
      }
      const { data, error } = await supabase.functions.invoke("sync-inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) throw error;
      setSyncResult(data);
      toast({
        title: "Inventory synced!",
        description: `${data?.newEvents ?? 0} new events, ${data?.newTickets ?? 0} new tickets, ${data?.updatedTickets ?? 0} updated, ${data?.deactivateTickets ?? 0} deactivated`,
      });
    } catch (err: any) {
      toast({ title: "Sync failed", description: err.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      {/* Sync from Google Sheets */}
      <div className="bg-card border border-primary/30 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/15 text-primary flex-shrink-0">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Sync Inventory from Google Sheets</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Pull the latest ticket data from the master spreadsheet. This will create new events, update prices/quantities, and deactivate stale tickets.
            </p>
            <Button variant="hero" size="sm" onClick={handleSyncInventory} disabled={syncing}>
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync Inventory"}
            </Button>
            {syncResult && (
              <div className="mt-3 text-xs text-muted-foreground space-y-0.5">
                <p>Games: {syncResult.games} | New Events: {syncResult.newEvents} | Updated Events: {syncResult.updatedEvents}</p>
                <p>New Tickets: {syncResult.newTickets} | Updated: {syncResult.updatedTickets} | Deactivated: {syncResult.deactivateTickets}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold">CSV Import</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Import events and tickets in bulk using our pre-formatted template.
          </p>
        </div>
      </div>

      {/* Step 1: Download */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/15 text-primary text-sm font-bold flex-shrink-0">1</div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm mb-1">Download the template</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Start with our pre-formatted CSV file. Fill in your event and ticket data, then come back to upload.
            </p>
            <Button variant="hero" size="sm" onClick={downloadAdminTemplate}>
              <Download className="h-4 w-4" /> Download CSV Template
            </Button>
          </div>
        </div>
      </div>

      {/* Column reference */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Column Reference</p>
        <TooltipProvider delayDuration={100}>
          <div className="flex flex-wrap gap-2">
            {ADMIN_CSV_HEADERS.map((col) => (
              <Tooltip key={col}>
                <TooltipTrigger asChild>
                  <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all cursor-help">
                    {col}
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-xs">
                  <p>{COLUMN_DESCRIPTIONS[col] || col}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* Step 2: Upload */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/15 text-primary text-sm font-bold flex-shrink-0">2</div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm mb-1">Upload your completed file</h3>
            <p className="text-xs text-muted-foreground">
              Upload the filled-in template to import your events and tickets.
            </p>
          </div>
        </div>
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          {fileName ? (
            <div className="flex items-center justify-center gap-2 mb-3">
              <p className="text-sm text-foreground font-medium">{fileName}</p>
              <button onClick={clearFile} className="text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-3">Drop your completed CSV here or click to browse</p>
          )}
          <div className="flex gap-2 justify-center">
            <Button variant="glass" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" /> {fileName ? "Choose Different File" : "Choose File"}
            </Button>
          </div>
        </div>

        {csvData.length > 0 && (
          <div>
            <p className="text-sm text-foreground mb-3">{csvData.length} rows ready to import</p>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    {Object.keys(csvData[0]).slice(0, 6).map((h) => (
                      <th key={h} className="text-left p-2 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Object.values(row).slice(0, 6).map((v, j) => (
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
