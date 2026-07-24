import React, { useState, useRef } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ValueSelect" || "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePlus, Upload, Shield, Tag, FileText, Link as LinkIcon, Paperclip, CheckCircle2 } from "lucide-react";
import { FileType, FolderItem } from "@/types/vault";
import { showSuccess, showError } from "@/utils/toast";

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
    fileDataUrl?: string;
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
  const [activeTab, setActiveTab] = useState<"file" | "gdoc" | "note">("file");
  const [folderId, setFolderId] = useState<string>(defaultFolderId || "root");

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>("");
  const [fileName, setFileName] = useState("");

  // Google Doc State
  const [gdocUrl, setGdocUrl] = useState("");
  const [gdocTitle, setGdocTitle] = useState("");

  // Note State
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  // Shared Settings
  const [tagInput, setTagInput] = useState("");
  const [isConfidential, setIsConfidential] = useState(true);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setError("File size exceeds 25 MB max limit.");
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setError("");

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFileDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const detectFileType = (file: File): FileType => {
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf")) return "pdf";
    if (name.endsWith(".doc") || name.endsWith(".docx")) return "word";
    if (file.type.startsWith("image/")) return "image";
    if (name.endsWith(".xlsx") || name.endsWith(".csv")) return "spreadsheet";
    if (name.endsWith(".json") || name.endsWith(".js") || name.endsWith(".ts")) return "code";
    return "note";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (activeTab === "file") {
      if (!selectedFile || !fileName.trim()) {
        setError("Please choose a PDF, Word document, or image to upload.");
        return;
      }

      const fileType = detectFileType(selectedFile);

      onCreateDocument({
        folderId: folderId === "root" ? null : folderId,
        name: fileName.trim(),
        type: fileType,
        sizeBytes: selectedFile.size,
        content: `Uploaded ${fileType.toUpperCase()} file: ${selectedFile.name}`,
        fileDataUrl,
        tags: tags.length ? tags : [fileType.toUpperCase()],
        isConfidential,
        previewUrl: fileType === "image" ? fileDataUrl : undefined,
      });

      showSuccess(`Uploaded "${fileName.trim()}" successfully`);
    } else if (activeTab === "gdoc") {
      if (!gdocUrl.trim()) {
        setError("Please enter a Google Doc or Google Drive link");
        return;
      }

      const finalTitle = gdocTitle.trim() || "Google Document";

      onCreateDocument({
        folderId: folderId === "root" ? null : folderId,
        name: finalTitle.endsWith(".gdoc") ? finalTitle : `${finalTitle}.gdoc`,
        type: "gdoc",
        sizeBytes: 1024,
        content: gdocUrl.trim(),
        tags: tags.length ? tags : ["Google Doc", "Drive"],
        isConfidential,
      });

      showSuccess(`Linked Google Doc "${finalTitle}"`);
    } else {
      if (!noteTitle.trim()) {
        setError("Note title is required");
        return;
      }

      onCreateDocument({
        folderId: folderId === "root" ? null : folderId,
        name: noteTitle.trim().endsWith(".note") ? noteTitle.trim() : `${noteTitle.trim()}.note`,
        type: "note",
        sizeBytes: noteContent.length * 2 || 2048,
        content: noteContent.trim() || "Encrypted secure note content.",
        tags: tags.length ? tags : ["Note", "Private"],
        isConfidential,
      });

      showSuccess(`Created note "${noteTitle.trim()}"`);
    }

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFileDataUrl("");
    setFileName("");
    setGdocUrl("");
    setGdocTitle("");
    setNoteTitle("");
    setNoteContent("");
    setTagInput("");
    setIsConfidential(true);
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <FilePlus className="w-6 h-6" />
            <DialogTitle className="text-xl font-bold">Add Document or File</DialogTitle>
          </div>
          <DialogDescription>
            Upload PDFs, Microsoft Word docs, connect Google Docs, or type secure notes into your vault.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg font-medium border border-red-200">
              {error}
            </div>
          )}

          {/* Destination Folder Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="target-folder" className="text-xs font-semibold">
              Select Destination Vault Folder
            </Label>
            <Select value={folderId} onValueChange={(val) => setFolderId(val)}>
              <SelectTrigger id="target-folder" className="text-xs">
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

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-slate-100 dark:bg-slate-800 p-1">
              <TabsTrigger value="file" className="text-xs gap-1">
                <Upload className="w-3.5 h-3.5" /> PDF / Word
              </TabsTrigger>
              <TabsTrigger value="gdoc" className="text-xs gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-blue-500" /> Google Doc
              </TabsTrigger>
              <TabsTrigger value="note" className="text-xs gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-500" /> Secure Note
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Real PDF / Word / Image Upload */}
            <TabsContent value="file" className="space-y-3 pt-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.xlsx,.csv,image/*"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/40 space-y-2 group"
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center text-emerald-600 dark:text-emerald-400 space-y-1">
                    <CheckCircle2 className="w-8 h-8" />
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to store
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Paperclip className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Click to choose PDF or Word document
                    </div>
                    <p className="text-xs text-slate-400">
                      Supports PDF, .doc, .docx, spreadsheets, and scan images (max 25MB)
                    </p>
                  </>
                )}
              </div>

              {selectedFile && (
                <div className="space-y-1.5">
                  <Label htmlFor="uploaded-name" className="text-xs">Document Display Title</Label>
                  <Input
                    id="uploaded-name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="text-xs"
                  />
                </div>
              )}
            </TabsContent>

            {/* TAB 2: Google Docs / Google Drive Link */}
            <TabsContent value="gdoc" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="gdoc-url" className="text-xs font-semibold">
                  Google Docs or Google Drive Link *
                </Label>
                <Input
                  id="gdoc-url"
                  placeholder="https://docs.google.com/document/d/1x2y3z.../edit"
                  value={gdocUrl}
                  onChange={(e) => setGdocUrl(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gdoc-title" className="text-xs">
                  Document Title
                </Label>
                <Input
                  id="gdoc-title"
                  placeholder="e.g. Q1 Marketing Plan - Live Google Doc"
                  value={gdocTitle}
                  onChange={(e) => setGdocTitle(e.target.value)}
                  className="text-xs"
                />
              </div>
            </TabsContent>

            {/* TAB 3: Encrypted Text Note */}
            <TabsContent value="note" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="note-title" className="text-xs font-semibold">
                  Note Title *
                </Label>
                <Input
                  id="note-title"
                  placeholder="e.g. Wi-Fi Password & Recovery Seed"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note-content" className="text-xs">
                  Encrypted Text Content
                </Label>
                <Textarea
                  id="note-content"
                  placeholder="Type confidential note details..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="h-28 text-xs font-mono resize-none"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Tags */}
          <div className="space-y-1.5 pt-2 border-t">
            <Label htmlFor="doc-tags" className="flex items-center gap-1 text-xs">
              <Tag className="w-3.5 h-3.5 text-slate-400" /> Tags (comma separated)
            </Label>
            <Input
              id="doc-tags"
              placeholder="e.g. Legal, Contract, Tax2025"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Confidential Storage
                </div>
                <div className="text-[11px] text-slate-500">
                  Mark item as sensitive with lock badge
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
              Save to Vault
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};