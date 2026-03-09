import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";

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
          const { error } = await supabase.from("tickets").insert({ event_id: eventId, section: row.section, row_name: row.row || null, seat_number: row.seat || null, price: parseFloat(row.price), quantity: parseInt(row.quantity || "1") });
          if (error) errors++; else success++;
        } else if (eventId) { success++; } else { errors++; }
      } catch { errors++; }
    }
    setResults({ success, errors });
    setImporting(false);
    toast({ title: `Import complete: ${success} succeeded, ${errors} failed` });
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-4">CSV Import</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Upload a CSV file with columns: <code className="text-primary">title, venue, city, province, event_date, category, section, row, seat, price, quantity</code>
      </p>
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
