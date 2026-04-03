import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet, Check, AlertCircle, Download, X, Link2, Users } from "lucide-react";
import {
  parseResellerCsv,
  validateResellerRow,
  parseEventTime,
  downloadCsvTemplate,
  type ResellerCsvRow,
} from "@/utils/resellerCsvTemplate";

interface Reseller {
  id: string;
  user_id: string;
  business_name: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 1000;

const AdminResellerImport = () => {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [selectedResellerId, setSelectedResellerId] = useState("");
  const [csvData, setCsvData] = useState<ResellerCsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: number; errorMessages: string[] } | null>(null);
  const [sheetUrl, setSheetUrl] = useState("");
  const [fetchingSheet, setFetchingSheet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchResellers();
  }, []);

  const fetchResellers = async () => {
    const { data } = await supabase
      .from("resellers")
      .select("id, user_id, business_name, first_name, last_name, status")
      .in("status", ["approved", "live"])
      .eq("is_enabled", true)
      .order("business_name");
    setResellers(data || []);
  };

  const selectedReseller = resellers.find((r) => r.id === selectedResellerId);

  const processRows = (rows: ResellerCsvRow[]) => {
    if (rows.length > MAX_ROWS) {
      toast({ title: "Too many rows", description: `Maximum ${MAX_ROWS} rows. File has ${rows.length}.`, variant: "destructive" });
      return;
    }
    const errors: string[] = [];
    rows.forEach((row, i) => {
      const err = validateResellerRow(row, i);
      if (err) errors.push(err);
    });
    if (errors.length > 0) {
      toast({
        title: "Validation errors",
        description: errors.slice(0, 3).join("; ") + (errors.length > 3 ? ` (+${errors.length - 3} more)` : ""),
        variant: "destructive",
      });
      return;
    }
    setCsvData(rows);
    toast({ title: `Parsed ${rows.length} ticket rows` });
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
      const parsed = parseResellerCsv(text);
      processRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleFetchSheet = async () => {
    if (!sheetUrl.trim()) return;
    setFetchingSheet(true);
    setResults(null);
    try {
      // Extract spreadsheet ID and gid from URL
      const idMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      const gidMatch = sheetUrl.match(/gid=(\d+)/);
      if (!idMatch) {
        toast({ title: "Invalid URL", description: "Please provide a valid Google Sheets URL", variant: "destructive" });
        setFetchingSheet(false);
        return;
      }
      const sheetId = idMatch[1];
      const gid = gidMatch ? gidMatch[1] : "0";
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`);
      const text = await res.text();
      const parsed = parseResellerCsv(text);
      setFileName(`Google Sheet (${parsed.length} rows)`);
      processRows(parsed);
    } catch (err) {
      toast({ title: "Failed to fetch sheet", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
    setFetchingSheet(false);
  };

  const handleImport = async () => {
    if (csvData.length === 0 || !selectedReseller) return;
    setImporting(true);
    let success = 0;
    let errors = 0;
    const errorMessages: string[] = [];
    const sellerId = selectedReseller.user_id;

    for (const row of csvData) {
      try {
        const title = `${row.homeTeam} vs ${row.awayTeam}`;
        const eventDate = parseEventTime(row.eventDate, row.eventTime);
        const city = "";
        const province = "";

        // Find or create event
        let eventId: string | null = null;
        const { data: existing } = await supabase
          .from("events")
          .select("id")
          .eq("title", title)
          .eq("venue", row.venue)
          .gte("event_date", row.eventDate + "T00:00:00")
          .lte("event_date", row.eventDate + "T23:59:59")
          .maybeSingle();

        if (existing) {
          eventId = existing.id;
        } else {
          const { data: newEvent, error } = await supabase
            .from("events")
            .insert({
              title,
              venue: row.venue,
              city,
              province,
              event_date: eventDate,
              category: "sports",
              description: `${row.sport.toUpperCase()} - ${row.homeTeam} vs ${row.awayTeam}`,
            })
            .select("id")
            .single();
          if (error) {
            errors++;
            errorMessages.push(`Event create failed: ${title} - ${error.message}`);
            continue;
          }
          eventId = newEvent.id;
        }

        // Insert ticket
        const { error: ticketError } = await supabase.from("tickets").insert({
          event_id: eventId,
          section: row.section.toUpperCase(),
          row_name: row.row || null,
          seat_number: row.seatNumbers || null,
          hide_seat_numbers: row.hideSeatNumbers?.toLowerCase() === "yes",
          price: parseFloat(row.unitCost),
          quantity: parseInt(row.quantity),
          quantity_sold: 0,
          is_active: true,
          is_reseller_ticket: true,
          seller_id: sellerId,
          seat_notes: row.notes || null,
          stock_type: row.stockType || null,
          split_type: row.splitType || null,
          seat_type: row.seatType || null,
          order_number: row.orderNumber || null,
          ticket_group_account: row.ticketGroupAccount || null,
          sales_tax_paid: row.salesTaxPaid?.toLowerCase() === "yes",
        });

        if (ticketError) {
          errors++;
          errorMessages.push(`Ticket insert failed: ${row.section} - ${ticketError.message}`);
        } else {
          success++;
        }
      } catch {
        errors++;
      }
    }

    setResults({ success, errors, errorMessages });
    setImporting(false);
    toast({ title: `Import complete: ${success} tickets added for ${selectedReseller.business_name}, ${errors} errors` });
  };

  const clearFile = () => {
    setCsvData([]);
    setFileName("");
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold">Reseller Inventory Import</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Import tickets on behalf of approved resellers via CSV file or Google Sheet link.
        </p>
      </div>

      {/* Step 1: Select reseller */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/15 text-primary text-sm font-bold flex-shrink-0">1</div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm mb-1">Select Reseller</h3>
            <p className="text-xs text-muted-foreground mb-3">Choose an approved reseller to assign tickets to.</p>
            {resellers.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No approved resellers found. Approve a reseller first in the Resellers tab.</p>
            ) : (
              <Select value={selectedResellerId} onValueChange={setSelectedResellerId}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Choose a reseller..." />
                </SelectTrigger>
                <SelectContent>
                  {resellers.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{r.business_name}</span>
                        {r.first_name && (
                          <span className="text-muted-foreground text-xs">
                            ({r.first_name} {r.last_name})
                          </span>
                        )}
                        <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/15 text-green-600 capitalize">{r.status}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Step 2: Download template */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/15 text-primary text-sm font-bold flex-shrink-0">2</div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm mb-1">Download the template</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Use our 19-column reseller CSV template for the import.
            </p>
            <Button variant="hero" size="sm" onClick={downloadCsvTemplate}>
              <Download className="h-4 w-4" /> Download CSV Template
            </Button>
          </div>
        </div>
      </div>

      {/* Step 3: Upload or Link */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/15 text-primary text-sm font-bold flex-shrink-0">3</div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm mb-1">Upload CSV or link Google Sheet</h3>
            <p className="text-xs text-muted-foreground">
              Upload a filled-in CSV file, or paste a Google Sheets URL (sheet must be publicly accessible or shared).
            </p>
          </div>
        </div>

        {/* Google Sheet input */}
        <div className="flex gap-2 items-center">
          <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            className="flex-1"
          />
          <Button variant="glass" size="sm" onClick={handleFetchSheet} disabled={fetchingSheet || !sheetUrl.trim()}>
            {fetchingSheet ? "Fetching..." : "Fetch"}
          </Button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="absolute bg-card px-3 text-xs text-muted-foreground">or</span>
        </div>

        {/* File upload */}
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
            <p className="text-sm text-muted-foreground mb-3">Drop a completed CSV here or click to browse</p>
          )}
          <Button variant="glass" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" /> {fileName ? "Choose Different File" : "Choose File"}
          </Button>
        </div>

        {/* Preview + import */}
        {csvData.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-foreground">{csvData.length} rows ready to import</p>
              {selectedReseller && (
                <span className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary font-medium">
                  → {selectedReseller.business_name}
                </span>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="text-left p-2 font-medium text-muted-foreground">Sport</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Home</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Away</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Section</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Row</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Qty</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="p-2 text-foreground">{row.sport}</td>
                      <td className="p-2 text-foreground">{row.homeTeam}</td>
                      <td className="p-2 text-foreground">{row.awayTeam}</td>
                      <td className="p-2 text-foreground">{row.eventDate}</td>
                      <td className="p-2 text-foreground">{row.section}</td>
                      <td className="p-2 text-foreground">{row.row}</td>
                      <td className="p-2 text-foreground">{row.quantity}</td>
                      <td className="p-2 text-foreground">${row.unitCost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {csvData.length > 10 && (
                <p className="text-xs text-muted-foreground p-2 text-center">...and {csvData.length - 10} more rows</p>
              )}
            </div>
            <Button
              variant="hero"
              className="mt-4"
              onClick={handleImport}
              disabled={importing || !selectedResellerId}
            >
              {importing
                ? "Importing..."
                : !selectedResellerId
                ? "Select a reseller first"
                : `Import ${csvData.length} tickets for ${selectedReseller?.business_name}`}
            </Button>
          </div>
        )}

        {results && (
          <div className="space-y-2">
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
            {results.errorMessages.length > 0 && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                {results.errorMessages.slice(0, 5).map((msg, i) => (
                  <p key={i} className="text-xs text-destructive">{msg}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResellerImport;
