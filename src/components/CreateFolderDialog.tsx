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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Lock, ShieldAlert, FolderPlus, Palette } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderData: {
    name: string;
    description: string;
    color: string;
    isPasswordProtected: boolean;
    password?: string;
    passwordHint?: string;
  }) => void;
}

const PRESET_COLORS = [
  "#059669", // emerald
  "#2563eb", // blue
  "#7c3aed", // violet
  "#dc2626", // red
  "#d97706", // amber
  "#0891b2", // cyan
  "#4b5563", // slate
];

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#059669");
  const [isProtected, setIsProtected] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordHint, setPasswordHint] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a folder name");
      return;
    }

    if (isProtected && !password.trim()) {
      setError("Password is required for protected folders");
      return;
    }

    onCreateFolder({
      name: name.trim(),
      description: description.trim(),
      color,
      isPasswordProtected: isProtected,
      password: isProtected ? password.trim() : undefined,
      passwordHint: isProtected ? passwordHint.trim() : undefined,
    });

    showSuccess(`Created folder "${name.trim()}"`);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("#059669");
    setIsProtected(true);
    setPassword("");
    setPasswordHint("");
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <FolderPlus className="w-6 h-6" />
            <DialogTitle className="text-xl font-bold">New Vault Folder</DialogTitle>
          </div>
          <DialogDescription>
            Create a secure container for your confidential files and documents.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-md font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="folder-name">Folder Name *</Label>
            <Input
              id="folder-name"
              placeholder="e.g. Financial Documents 2025"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="folder-desc">Description (Optional)</Label>
            <Textarea
              id="folder-desc"
              placeholder="Brief description of what goes in this vault..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-20 resize-none text-sm"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <Palette className="w-4 h-4 text-slate-500" /> Folder Accent Color
            </Label>
            <div className="flex items-center gap-3 pt-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? "scale-125 border-slate-900 dark:border-white shadow" : "border-transparent hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Password Protection Toggle */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  Password Protection
                </div>
                <p className="text-xs text-slate-500">
                  Require password to reveal or download files inside this folder.
                </p>
              </div>
              <Switch
                checked={isProtected}
                onCheckedChange={(checked) => setIsProtected(checked)}
              />
            </div>

            {isProtected && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <Label htmlFor="folder-pass" className="text-xs">
                    Folder Lock Password *
                  </Label>
                  <Input
                    id="folder-pass"
                    type="password"
                    placeholder="Set folder password..."
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="bg-white dark:bg-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="folder-hint" className="text-xs">
                    Password Hint (Optional)
                  </Label>
                  <Input
                    id="folder-hint"
                    placeholder="e.g. Year of graduation"
                    value={passwordHint}
                    onChange={(e) => setPasswordHint(e.target.value)}
                    className="bg-white dark:bg-slate-950 text-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Only users with this password can view contents.</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Create Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};