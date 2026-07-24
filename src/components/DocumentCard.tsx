import React from "react";
import { DocumentItem } from "@/types/vault";
import { formatBytes } from "@/utils/vaultStorage";
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Code,
  StickyNote,
  File,
  Star,
  Shield,
  Download,
  Eye,
  MoreVertical,
  Trash2,
  FileCode,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface DocumentCardProps {
  document: DocumentItem;
  viewMode: "grid" | "list";
  onPreview: (doc: DocumentItem) => void;
  onToggleFavorite: (docId: string) => void;
  onDeleteDocument: (docId: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document: doc,
  viewMode,
  onPreview,
  onToggleFavorite,
  onDeleteDocument,
}) => {
  const getIcon = () => {
    switch (doc.type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "word":
        return <FileCode className="w-5 h-5 text-blue-600" />;
      case "gdoc":
        return <ExternalLink className="w-5 h-5 text-blue-500" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-indigo-500" />;
      case "spreadsheet":
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case "code":
        return <Code className="w-5 h-5 text-cyan-500" />;
      case "note":
        return <StickyNote className="w-5 h-5 text-amber-500" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (doc.type === "gdoc" && doc.content) {
      window.open(doc.content, "_blank");
      return;
    }

    const element = document.createElement("a");
    if (doc.fileDataUrl) {
      element.href = doc.fileDataUrl;
    } else {
      const file = new Blob([doc.content || "SafeVault Protected File Content"], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
    }
    element.download = doc.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (viewMode === "list") {
    return (
      <div
        onClick={() => onPreview(doc)}
        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-xl px-4 py-3 flex items-center justify-between transition-all hover:shadow-sm cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate group-hover:text-emerald-600 transition-colors">
                {doc.name}
              </p>
              {doc.isConfidential && (
                <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Confidential" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{doc.type === "gdoc" ? "Google Doc Link" : formatBytes(doc.sizeBytes)}</span>
              <span>•</span>
              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          <div className="hidden sm:flex items-center gap-1">
            {doc.tags.slice(0, 2).map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">
                #{t}
              </Badge>
            ))}
          </div>

          <button
            onClick={() => onToggleFavorite(doc.id)}
            className={`p-1.5 rounded-md ${
              doc.isFavorite ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
            }`}
          >
            <Star className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
            title={doc.type === "gdoc" ? "Open Google Doc" : "Download file"}
          >
            {doc.type === "gdoc" ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreview(doc)}>
                <Eye className="w-4 h-4 mr-2" /> Preview Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                {doc.type === "gdoc" ? <ExternalLink className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                {doc.type === "gdoc" ? "Open Link" : "Download"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDeleteDocument(doc.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={() => onPreview(doc)}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:scale-105 transition-transform">
            {getIcon()}
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onToggleFavorite(doc.id)}
              className={`p-1.5 rounded-lg ${
                doc.isFavorite ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onPreview(doc)}>
                  <Eye className="w-4 h-4 mr-2" /> Quick View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  {doc.type === "gdoc" ? <ExternalLink className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                  {doc.type === "gdoc" ? "Open Link" : "Download"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDeleteDocument(doc.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
              {doc.name}
            </h4>
            {doc.isConfidential && (
              <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Confidential" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-mono bg-slate-50 dark:bg-slate-950 p-1.5 rounded border border-slate-100 dark:border-slate-800">
            {doc.type === "gdoc" ? doc.content : (doc.content || "No preview snippet available")}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>{doc.type === "gdoc" ? "Google Doc" : formatBytes(doc.sizeBytes)}</span>
        <div className="flex items-center gap-1">
          {doc.tags.slice(0, 1).map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px]">
              #{t}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};