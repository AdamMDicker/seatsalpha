import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Loader2, ClipboardPaste, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransferProofUploaderProps {
  transferId: string;
  status: string;
  uploading: boolean;
  verifying: boolean;
  onUpload: (transferId: string, file: File) => void;
}

const TransferProofUploader = ({ transferId, status, uploading, verifying, onUpload }: TransferProofUploaderProps) => {
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setOpen(false);
    onUpload(transferId, file);
  }, [transferId, onUpload]);

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

  if (status !== "pending" && status !== "disputed") return null;

  const disabled = uploading || verifying;
  const label = status === "disputed" ? "Re-upload" : "Upload Proof";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={status === "disputed" ? "destructive" : "default"}
          className={cn(
            "h-7 text-xs",
            status === "disputed" && "bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold shadow-md shadow-destructive/30 animate-pulse"
          )}
          disabled={disabled}
        >
          {uploading ? (
            <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Uploading</>
          ) : (
            <><Upload className="h-3 w-3 mr-1" />{label}</>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Transfer Proof</DialogTitle>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
};

export default TransferProofUploader;
