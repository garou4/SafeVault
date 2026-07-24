import React from "react";
import {
  ShieldCheck,
  FolderLock,
  Star,
  Clock,
  HardDrive,
  Lock,
  Plus,
  SlidersHorizontal,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FolderItem } from "@/types/vault";
import { formatBytes } from "@/utils/vaultStorage";

export type NavView = "all" | "vaults" | "favorites" | "recents" | "settings";

interface VaultSidebarProps {
  currentView: NavView;
  selectedFolderId: string | null;
  folders: FolderItem[];
  totalBytesUsed: number;
  maxBytes: number;
  lockedVaultCount: number;
  onSelectNav: (view: NavView, folderId?: string | null) => void;
  onOpenCreateFolder: () => void;
  onLockAll: () => void;
}

export const VaultSidebar: React.FC<VaultSidebarProps> = ({
  currentView,
  selectedFolderId,
  folders,
  totalBytesUsed,
  maxBytes,
  lockedVaultCount,
  onSelectNav,
  onOpenCreateFolder,
  onLockAll,
}) => {
  const usedPercentage = Math.min(100, Math.round((totalBytesUsed / maxBytes) * 100));

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 p-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
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
        </div>

        {/* Action Button: Lock All Vaults */}
        <Button
          onClick={onLockAll}
          variant="outline"
          className="w-full bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-800/60 font-semibold gap-2 justify-center shadow-sm"
        >
          <Lock className="w-4 h-4 text-amber-400" />
          Lock All Vaults {lockedVaultCount > 0 && `(${lockedVaultCount})`}
        </Button>

        {/* Main Navigation */}
        <nav className="space-y-1 text-sm font-medium">
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
              <span>All Files & Vaults</span>
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
        </nav>

        {/* Password-Protected Folders Tree */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-400 tracking-wider uppercase">
            <span className="flex items-center gap-1">
              <FolderLock className="w-3.5 h-3.5 text-emerald-400" /> Protected Vaults
            </span>
            <button
              onClick={onOpenCreateFolder}
              className="text-slate-400 hover:text-emerald-400 transition-colors p-1"
              title="New Vault Folder"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
            {folders.length === 0 ? (
              <p className="text-xs text-slate-500 px-3 py-2 italic">No folders yet</p>
            ) : (
              folders.map((f) => {
                const isSelected = selectedFolderId === f.id;
                const isLocked = f.isPasswordProtected && !f.isUnlocked;

                return (
                  <button
                    key={f.id}
                    onClick={() => onSelectNav("vaults", f.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                      isSelected
                        ? "bg-slate-800 text-white font-medium border-l-2 border-emerald-500"
                        : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: f.color }}
                      />
                      <span className="truncate">{f.name}</span>
                    </div>

                    {f.isPasswordProtected && (
                      isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                          UNLOCKED
                        </span>
                      )
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Storage Widget & Settings */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
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

        <button
          onClick={() => onSelectNav("settings", null)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            currentView === "settings"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span>Vault Security Settings</span>
        </button>
      </div>
    </aside>
  );
};