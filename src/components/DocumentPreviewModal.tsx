import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentItem } from "@/types/vault";
import { formatBytes } from "@/utils/vaultStorage";
import { Download, Shield, FileText, Image as ImageIcon, Copy, Check } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document: doc,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!doc) return null;

  const handleCopyContent = () => {
    if (doc.content) {
      navigator.clipboard.writeText(doc.content);
      setCopied(true);
      showSuccess("Content copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([doc.content || "SafeVault Protected File Content"], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = doc.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showSuccess(`Downloaded ${doc.name}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-start justify-between pr-6 gap-2">
            <div className="flex items-center gap-2">
              {doc.type === "image" ? (
                <ImageIcon className="w-6 h-6 text-indigo-500" />
              ) : (
                <FileText className="w-6 h-6 text-emerald-600" />
              )}
              <div>
                <DialogTitle className="text-lg font-bold line-clamp-1">{doc.name}</DialogTitle>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>Size: {formatBytes(doc.sizeBytes)}</span>
                  <span>•</span>
                  <span>Added: {new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            {doc.isConfidential && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 gap-1 text-[11px] shrink-0">
                <Shield className="w-3 h-3" /> Confidential
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {doc.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          {doc.type === "image" && doc.previewUrl ? (
            <div className="rounded-xl overflow-hidden border bg-slate-900 flex items-center justify-center min-h-[250px]">
              <img src={doc.previewUrl} alt={doc.name} className="max-h-[350px] object-contain" />
            </div>
          ) : (
            <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-800 shadow-inner relative group">
              <button
                onClick={handleCopyContent}
                className="absolute top-3 right-3 bg-slate-800 hover:bg-slate-700 text-slate-200 p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors"
                title="Copy content"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <pre className="whitespace-pre-wrap break-words font-mono leading-relaxed max-h-[300px] overflow-y-auto pr-8">
                {doc.content || "Empty document content"}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-3 flex items-center justify-between sm:justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" /> Verified 256-Bit Decrypted View
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleDownload} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Download className="w-4 h-4" /> Download File
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};