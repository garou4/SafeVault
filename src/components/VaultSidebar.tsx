import React, { useState } from "react";
import {
  ShieldCheck,
  Star,
  Clock,
  HardDrive,
  FileCheck2,
  Settings,
  Folder,
  Lock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/utils/vaultStorage";
import { SettingsDialog } from "./SettingsDialog";
import { FolderItem } from "@/types/vault";

export type NavView = "all" | "vaults" | "favorites" | "recents" | "settings";

interface VaultSidebarProps {
  currentView: NavView;
  selectedFolderId: string | null;
  folders: FolderItem[];
  totalBytesUsed: number;
  maxBytes: number;
  onSelectNav: (view: NavView, folderId?: string | null) => void;
  username: string;
  onUpdatePassword: (curr: string, next: string) => { success: boolean; message: string };
  onSignOut: () => void;
}

export const VaultSidebar: React.FC<VaultSidebarProps> = ({
  currentView,
  selectedFolderId,
  folders,
  totalBytesUsed,
  maxBytes,
  onSelectNav,
  username,
  onUpdatePassword,
  onSignOut,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const usedPercentage = Math.min(100, Math.round((totalBytesUsed / maxBytes) * 100));

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 p-4">
      <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-950">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight leading-none">
                SafeVault
              </h1>
              <span className="text-[10px] text-emerald-400 font-medium">
                AES-256 Protected
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1 text-sm font-medium overflow-y-auto pr-1 custom-scrollbar">
          <button
            onClick={() => onSelectNav("all", null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
              currentView === "all" && selectedFolderId === null
                ? "bg-emerald-600 text-white"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-4 h-4" />
              <span>All Files</span>
            </div>
          </button>

          <button
            onClick={() => onSelectNav("favorites", null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
              currentView === "favorites"
                ? "bg-emerald-600 text-white"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Starred Items</span>
            </div>
          </button>

          <button
            onClick={() => onSelectNav("recents", null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
              currentView === "recents"
                ? "bg-emerald-600 text-white"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Documents</span>
            </div>
          </button>

          {/* Folders Section */}
          <div className="pt-4 pb-2 px-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">My Vaults</span>
          </div>

          <div className="space-y-0.5">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => onSelectNav("all", folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors group ${
                  selectedFolderId === folder.id
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="truncate">{folder.name}</span>
                </div>
                {folder.isPasswordProtected && (
                  <Lock className={`w-3 h-3 ${folder.isUnlocked ? "text-emerald-500" : "text-amber-500"}`} />
                )}
              </button>
            ))}
            
            {folders.length === 0 && (
              <p className="px-3 py-2 text-[11px] text-slate-600 italic">No folders created yet</p>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom Storage Widget */}
      <div className="space-y-4 pt-4 border-t border-slate-800 shrink-0">
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Storage
            </span>
            <span className="text-slate-400 font-mono">
              {formatBytes(totalBytesUsed)} / {formatBytes(maxBytes)}
            </span>
          </div>
          <Progress value={usedPercentage} className="h-1.5 bg-slate-800" />
        </div>
      </div>

      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        username={username}
        onUpdatePassword={onUpdatePassword}
        onSignOut={onSignOut}
      />
    </aside>
  );
};