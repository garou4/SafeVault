import React from "react";
import { FolderItem } from "@/types/vault";
import { Lock, Unlock, Star, MoreVertical, Shield, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface FolderCardProps {
  folder: FolderItem;
  itemCount: number;
  onOpenFolder: (folder: FolderItem) => void;
  onToggleFavorite: (folderId: string) => void;
  onLockFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  itemCount,
  onOpenFolder,
  onToggleFavorite,
  onLockFolder,
  onDeleteFolder,
}) => {
  const isLocked = folder.isPasswordProtected && !folder.isUnlocked;

  return (
    <div
      onClick={() => onOpenFolder(folder)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      {/* Top Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
        style={{ backgroundColor: folder.color || "#059669" }}
      />

      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ backgroundColor: `${folder.color}20`, color: folder.color }}
          >
            {isLocked ? (
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            ) : (
              <FolderItemIcon color={folder.color} />
            )}
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onToggleFavorite(folder.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                folder.isFavorite
                  ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                  : "text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={folder.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onOpenFolder(folder)}>
                  Open Vault
                </DropdownMenuItem>
                {folder.isPasswordProtected && folder.isUnlocked && (
                  <DropdownMenuItem onClick={() => onLockFolder(folder.id)}>
                    <Lock className="w-3.5 h-3.5 mr-2 text-amber-600" /> Lock Now
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 focus:text-red-600"
                  onClick={() => onDeleteFolder(folder.id)}
                >
                  Delete Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {folder.name}
            </h3>
          </div>
          {folder.description && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
              {folder.description}
            </p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-500">
          <FileText className="w-3.5 h-3.5" />
          <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
        </div>

        {folder.isPasswordProtected ? (
          isLocked ? (
            <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              <Lock className="w-3 h-3" /> Locked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Unlock className="w-3 h-3" /> Unlocked
            </span>
          )
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Shield className="w-3 h-3" /> Standard
          </span>
        )}
      </div>
    </div>
  );
};

const FolderItemIcon = ({ color }: { color: string }) => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    style={{ color }}
  >
    <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
  </svg>
);