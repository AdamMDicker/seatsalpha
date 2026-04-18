import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Loader2, ClipboardPaste, ImageIcon, AlertTriangle, Calendar, MapPin, Ticket, Mail, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TransferProofUploaderProps {
  transferId: string;
  status: string;
  uploading: boolean;
  verifying: boolean;
  onUpload: (transferId: string, file: File) => void;
  eventTitle?: string;
  eventDate?: string;
  venue?: string;
  section?: string;
  rowName?: string;
  quantity?: number;
  transferEmailAlias?: string | null;
  forwardSentAt?: string | null;
}

const TransferProofUploader = ({
  transferId,
  status,
  uploading,
  verifying,
  onUpload,
  eventTitle,
  eventDate,
  venue,
  section,
  rowName,
  quantity,
  transferEmailAlias,
  forwardSentAt,
}: TransferProofUploaderProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleConfirm = useCallback(() => {
    if (!pendingFile) return;
    setOpen(false);
    onUpload(transferId, pendingFile);
    setPendingFile(null);
    setPreviewUrl(null);
  }, [pendingFile, transferId, onUpload]);

  const handleCancel = useCallback(() => {
    setPendingFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }, [previewUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!open) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          handleFile(file);
          return;
        }
      }
    }
  }, [open, handleFile]);

  useEffect(() => {
    if (open) {
      document.addEventListener("paste", handlePaste);
      return () => document.removeEventListener("paste", handlePaste);
    }
  }, [open, handlePaste]);

  // Reset pending state when dialog closes
  useEffect(() => {
    if (!open && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPendingFile(null);
      setPreviewUrl(null);
    }
  }, [open, previewUrl]);

  // Allow upload for: pending, disputed, OR confirmed-but-not-yet-forwarded
  // (false-positive case where AI verified the screenshot but the actual
  // Ticketmaster transfer never reached our inbound alias).
  const canReupload =
    status === "pending" ||
    status === "disputed" ||
    (status === "confirmed" && !forwardSentAt) ||
    (status === "uploaded" && !forwardSentAt);

  if (!canReupload) return null;

  const disabled = uploading || verifying;
  const isDisputed = status === "disputed";
  const isStuck = (status === "confirmed" || status === "uploaded") && !forwardSentAt;
  const label = isDisputed
    ? "Re-upload"
    : isStuck
      ? "Re-send Transfer"
      : "Upload Proof";

  const copyAlias = () => {
    if (!transferEmailAlias) return;
    navigator.clipboard.writeText(transferEmailAlias);
    toast({ title: "Copied!", description: "Inbound email copied to clipboard." });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={isDisputed || isStuck ? "destructive" : "default"}
          className={cn(
            "h-7 text-xs",
            (isDisputed || isStuck) && "bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold shadow-md shadow-destructive/30 animate-pulse"
          )}
          disabled={disabled}
        >
          {uploading ? (
            <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Uploading</>
          ) : (
            <>{isStuck ? <RefreshCw className="h-3 w-3 mr-1" /> : <Upload className="h-3 w-3 mr-1" />}{label}</>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isStuck ? "Resend Transfer & Re-upload Proof" : "Upload Transfer Proof"}</DialogTitle>
        </DialogHeader>

        {/* Step-by-step instructions — always show so sellers know exact action required */}
        <div className="rounded-lg border-2 border-destructive/40 bg-destructive/5 p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-destructive font-bold">
            <AlertTriangle className="h-3.5 w-3.5" />
            {isStuck ? "Buyer hasn't received tickets yet — required steps:" : "Required steps to fulfill this order:"}
          </div>
          <ol className="text-xs text-foreground space-y-1.5 list-decimal list-inside pl-1">
            <li>Open <strong>Ticketmaster</strong> and start a transfer for these exact seats.</li>
            <li>
              Send the transfer to this <strong>inbound email address</strong>:
              {transferEmailAlias ? (
                <div className="flex items-center gap-1 mt-1.5 ml-4">
                  <code className="text-xs bg-background border px-2 py-1 rounded font-mono break-all flex-1">
                    {transferEmailAlias}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 shrink-0"
                    onClick={copyAlias}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <span className="text-muted-foreground"> (loading…)</span>
              )}
            </li>
            <li>Use the buyer's first name + "Seats" as the recipient name (e.g. "John Seats").</li>
            <li>After sending the TM transfer, take a <strong>screenshot</strong> of the confirmation screen.</li>
            <li>Upload that screenshot below. We'll verify it and forward the accept link to the buyer automatically.</li>
          </ol>
          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            <Mail className="h-3 w-3 inline mr-1" />
            A screenshot alone is not enough — the actual Ticketmaster transfer must hit the inbound address above for the buyer to receive their tickets.
          </p>
        </div>


        {/* Order context — always shown so seller verifies they're on the right row */}
        {(eventTitle || eventDate || section) && (
          <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" />
              You are uploading proof for:
            </div>
            {eventTitle && (
              <div className="font-semibold text-sm text-foreground">{eventTitle}</div>
            )}
            {eventDate && (
              <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(eventDate), "EEE, MMM d, yyyy · h:mm a")}
              </div>
            )}
            {venue && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {venue}
              </div>
            )}
            {(section || rowName || quantity) && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Ticket className="h-3 w-3" />
                {section && <>Section {section}</>}
                {rowName && <>, Row {rowName}</>}
                {quantity ? <> · Qty {quantity}</> : null}
              </div>
            )}
            <p className="text-xs text-muted-foreground pt-1 border-t border-border/50 mt-2">
              Make sure your screenshot matches this game. Uploading the wrong screenshot will be auto-rejected.
            </p>
          </div>
        )}

        {pendingFile && previewUrl ? (
          <div className="space-y-3">
            <div className="rounded-lg border overflow-hidden bg-muted">
              <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-contain" />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Confirm this screenshot is for the game shown above.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleCancel}>
                Choose different
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                Confirm & Upload
              </Button>
            </div>
          </div>
        ) : (
          <div
            ref={dropZoneRef}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              Drag & drop your screenshot here
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              or click to browse files
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ClipboardPaste className="h-3.5 w-3.5" />
              <span>You can also paste a screenshot (Ctrl+V / ⌘V)</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransferProofUploader;
