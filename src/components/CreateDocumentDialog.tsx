import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilePlus, Upload, Shield, Tag } from "lucide-react";
import { FileType, FolderItem } from "@/types/vault";
import { showSuccess } from "@/utils/toast";

interface CreateDocumentDialogProps {
  isOpen: boolean;
  folders: FolderItem[];
  defaultFolderId: string | null;
  onClose: () => void;
  onCreateDocument: (docData: {
    folderId: string | null;
    name: string;
    type: FileType;
    sizeBytes: number;
    content: string;
    tags: string[];
    isConfidential: boolean;
    previewUrl?: string;
  }) => void;
}

export const CreateDocumentDialog: React.FC<CreateDocumentDialogProps> = ({
  isOpen,
  folders,
  defaultFolderId,
  onClose,
  onCreateDocument,
}) => {
  const [name, setName] = useState("");
  const [folderId, setFolderId] = useState<string>(defaultFolderId || "root");
  const [fileType, setFileType] = useState<FileType>("pdf");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [isConfidential, setIsConfidential] = useState(true);
  const [simulatedSizeMb, setSimulatedSizeMb] = useState("1.5");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Document name is required");
      return;
    }

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const sizeBytes = Math.round((parseFloat(simulatedSizeMb) || 1.0) * 1024 * 1024);

    onCreateDocument({
      folderId: folderId === "root" ? null : folderId,
      name: name.trim().endsWith(getExt(fileType)) ? name.trim() : `${name.trim()}${getExt(fileType)}`,
      type: fileType,
      sizeBytes,
      content: content.trim() || `Secure ${fileType.toUpperCase()} document stored safely.`,
      tags: tags.length ? tags : ["General"],
      isConfidential,
      previewUrl: fileType === "image" ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" : undefined,
    });

    showSuccess(`Added document "${name.trim()}"`);
    resetForm();
    onClose();
  };

  const getExt = (type: FileType) => {
    switch (type) {
      case "pdf": return ".pdf";
      case "image": return ".png";
      case "note": return ".note";
      case "spreadsheet": return ".xlsx";
      case "code": return ".json";
      default: return ".txt";
    }
  };

  const resetForm = () => {
    setName("");
    setFolderId(defaultFolderId || "root");
    setFileType("pdf");
    setContent("");
    setTagInput("");
    setIsConfidential(true);
    setSimulatedSizeMb("1.5");
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <FilePlus className="w-6 h-6" />
            <DialogTitle className="text-xl font-bold">Add Document / Secure Note</DialogTitle>
          </div>
          <DialogDescription>
            Store confidential files, identity records, or encrypted notes into your vaults.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="target-folder">Select Destination Vault</Label>
              <Select value={folderId} onValueChange={(val) => setFolderId(val)}>
                <SelectTrigger id="target-folder">
                  <SelectValue placeholder="Choose Folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">📁 Root Directory (Uncategorized)</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.isPasswordProtected ? "🔒 " : "📂 "}{f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="file-type">Document Type</Label>
              <Select value={fileType} onValueChange={(val) => setFileType(val as FileType)}>
                <SelectTrigger id="file-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">📄 PDF Document</SelectItem>
                  <SelectItem value="image">🖼️ Image Scan</SelectItem>
                  <SelectItem value="note">📝 Secure Note</SelectItem>
                  <SelectItem value="spreadsheet">📊 Spreadsheet</SelectItem>
                  <SelectItem value="code">💻 Config / Key JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-name">Document Title *</Label>
            <Input
              id="doc-name"
              placeholder="e.g. Passport Copy or Bank Statement Q1"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-content">Document Content / Secure Note Text</Label>
            <Textarea
              id="doc-content"
              placeholder="Type sensitive notes, recovery phrases, or description..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-24 text-xs font-mono resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="doc-tags" className="flex items-center gap-1 text-xs">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Tags (comma separated)
              </Label>
              <Input
                id="doc-tags"
                placeholder="e.g. Tax, IRS, 2024"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc-size" className="flex items-center gap-1 text-xs">
                <Upload className="w-3.5 h-3.5 text-slate-400" /> File Size (MB)
              </Label>
              <Input
                id="doc-size"
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={simulatedSizeMb}
                onChange={(e) => setSimulatedSizeMb(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  High Confidentiality
                </div>
                <div className="text-[11px] text-slate-500">
                  Mark item as highly sensitive with lock icon badge
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Save Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};