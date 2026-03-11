import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Check, AlertCircle, Download } from "lucide-react";
import {
  parseResellerCsv,
  validateResellerRow,
  parseEventTime,
  downloadCsvTemplate,
  type ResellerCsvRow,
} from "@/utils/resellerCsvTemplate";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 1000;

const ResellerCsvUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [csvData, setCsvData] = useState<ResellerCsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      if (parsed.length === 0) {
        toast({ title: "No data found", description: "CSV appears empty or has no data rows.", variant: "destructive" });
        return;
      }

      if (parsed.length > MAX_ROWS) {
        toast({ title: "Too many rows", description: `Maximum ${MAX_ROWS} rows allowed. File has ${parsed.length}.`, variant: "destructive" });
        return;
      }

      const errors: string[] = [];
      parsed.forEach((row, i) => {
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

      setCsvData(parsed);
      toast({ title: `Parsed ${parsed.length} rows from ${file.name}` });
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (csvData.length === 0 || !user) return;
    setImporting(true);
    let success = 0;
    let errors = 0;

    for (const row of csvData) {
      try {
        const title = `${row.awayTeam} at ${row.homeTeam}`;
        const eventDate = parseEventTime(row.eventDate, row.eventTime);
        const category = row.sport.toLowerCase();

        // Find or create event
        const { data: existing } = await supabase
          .from("events")
          .select("id")
          .eq("title", title)
          .eq("venue", row.venue)
          .eq("event_date", eventDate)
          .maybeSingle();

        let eventId: string;
        if (existing) {
          eventId = existing.id;
        } else {
          const { data: newEvent, error: evErr } = await supabase.from("events").insert({
            title,
            venue: row.venue,
            city: "",
            province: "",
            event_date: eventDate,
            category,
            description: row.notes || null,
          }).select("id").single();

          if (evErr) { errors++; continue; }
          eventId = newEvent.id;
        }

        // Insert ticket
        const { error: tickErr } = await supabase.from("tickets").insert({
          event_id: eventId,
          section: row.section,
          row_name: row.row || null,
          seat_number: row.seatNumbers || null,
          price: parseFloat(row.unitCost),
          quantity: parseInt(row.quantity),
          is_reseller_ticket: true,
          seller_id: user.id,
          hide_seat_numbers: row.hideSeatNumbers?.toLowerCase() === "yes",
          stock_type: row.stockType || null,
          split_type: row.splitType || null,
          seat_type: row.seatType || null,
          order_number: row.orderNumber || null,
          sales_tax_paid: row.salesTaxPaid?.toLowerCase() === "yes",
          ticket_group_account: row.ticketGroupAccount || null,
          seat_notes: row.notes || null,
        });

        if (tickErr) { errors++; } else { success++; }
      } catch {
        errors++;
      }
    }

    setResults({ success, errors });
    setImporting(false);
    toast({ title: `Import complete: ${success} succeeded, ${errors} failed` });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-8 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1">Upload Inventory</h2>
        <p className="text-sm text-muted-foreground">
          Use our pre-formatted CSV template to bulk-import your ticket inventory.
        </p>
      </div>

      {/* Step 1: Download */}
      <div className="flex items-start gap-4 bg-secondary/50 rounded-xl p-5">
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/15 text-primary text-sm font-bold flex-shrink-0">1</div>
        <div>
          <h3 className="font-semibold text-foreground text-sm mb-1">Download the template</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Start with our pre-formatted CSV file. Fill in your ticket data, save, then upload below.
          </p>
          <Button variant="hero" size="sm" onClick={downloadCsvTemplate}>
            <Download className="h-4 w-4" /> Download CSV Template
          </Button>
        </div>
      </div>

      {/* Step 2: Upload */}
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/15 text-primary text-sm font-bold flex-shrink-0 mt-1">2</div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-sm mb-1">Upload your completed file</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Upload the filled-in template to import your tickets.
          </p>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              {fileName || "Drop your completed CSV here or click to browse"}
            </p>
            <Button variant="glass" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" /> Choose File
            </Button>
          </div>
        </div>
      </div>

      {csvData.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-foreground mb-3">{csvData.length} rows ready to import</p>
          <div className="max-h-48 overflow-y-auto overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  {["Sport", "Home", "Away", "Venue", "Date", "Qty", "Section", "Price"].map((h) => (
                    <th key={h} className="text-left p-2 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="p-2 text-foreground">{row.sport}</td>
                    <td className="p-2 text-foreground">{row.homeTeam}</td>
                    <td className="p-2 text-foreground">{row.awayTeam}</td>
                    <td className="p-2 text-foreground">{row.venue}</td>
                    <td className="p-2 text-foreground">{row.eventDate}</td>
                    <td className="p-2 text-foreground">{row.quantity}</td>
                    <td className="p-2 text-foreground">{row.section}</td>
                    <td className="p-2 text-foreground">${row.unitCost}</td>
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
        <div className="flex gap-4 mt-4">
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
  );
};

export default ResellerCsvUpload;
