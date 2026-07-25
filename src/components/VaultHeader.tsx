import React from "react";
import { Search, LayoutGrid, List, Plus, FolderPlus, ShieldCheck, Code2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VaultHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenCreateDocument: () => void;
  onOpenCreateFolder: () => void;
  currentFolderTitle?: string;
  isCurrentFolderLocked?: boolean;
  isDeveloper?: boolean;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  viewMode,
  onViewModeChange,
  onOpenCreateDocument,
  onOpenCreateFolder,
  currentFolderTitle,
  isCurrentFolderLocked,
  isDeveloper,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-10 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Title & Status */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2">
          {isDeveloper && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg border border-indigo-500/20">
                  <Code2 className="w-5 h-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-[10px] font-bold">Developer Mode Active</p>
              </TooltipContent>
            </Tooltip>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {currentFolderTitle || "Dashboard"}
              {isCurrentFolderLocked === false && (
                <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Unlocked
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {isDeveloper ? "Sarvagya's Development Terminal" : "End-to-end Local Encryption Vault"}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        <div className="relative flex-1 md:w-56">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <Input
            placeholder="Search vault or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs bg-slate-50 dark:bg-slate-950"
          />
        </div>

        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[130px] h-9 text-xs bg-slate-50 dark:bg-slate-950">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All File Types</SelectItem>
            <SelectItem value="pdf">📄 PDFs</SelectItem>
            <SelectItem value="word">📘 Word (.docx)</SelectItem>
            <SelectItem value="gdoc">🔗 Google Docs</SelectItem>
            <SelectItem value="image">🖼️ Images</SelectItem>
            <SelectItem value="note">📝 Notes</SelectItem>
            <SelectItem value="spreadsheet">📊 Spreadsheets</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              viewMode === "grid" ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm" : "text-slate-500"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              viewMode === "list" ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm" : "text-slate-500"
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenCreateFolder}
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5 border-slate-300"
          >
            <FolderPlus className="w-3.5 h-3.5 text-slate-600" />
            New Folder
          </Button>

          <Button
            onClick={onOpenCreateDocument}
            size="sm"
            className="h-9 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Document
          </Button>
        </div>
      </div>
    </header>
  );
};