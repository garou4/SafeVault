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
import { Lock, FolderPlus, Palette, Tag } from "lucide-react";
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

const PRESET_FOLDER_NAMES = [
  "Tax & Financials 2025",
  "Passports & Identity",
  "Medical & Insurance",
  "Property & Legal Documents",
  "Passwords & Crypto Keys",
  "Work Projects & NDAs",
  "Family Archives",
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
      setError("Please select or enter a folder name");
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <FolderPlus className="w-6 h-6" />
            <DialogTitle className="text-xl font-bold">New Vault Folder</DialogTitle>
          </div>
          <DialogDescription>
            Choose or type a custom folder name and set up password protection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-md font-medium">
              {error}
            </div>
          )}

          {/* Quick Select Folder Name */}
          <div className="space-y-2">
            <Label htmlFor="folder-name" className="text-xs font-semibold flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-600" /> Folder Name *
            </Label>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {PRESET_FOLDER_NAMES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { setName(preset); setError(""); }}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    name === preset
                      ? "bg-emerald-600 text-white border-emerald-600 font-medium"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <Input
              id="folder-name"
              placeholder="Or type a custom folder name..."
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
              className="h-16 resize-none text-xs"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-semibold">
              <Palette className="w-3.5 h-3.5 text-slate-500" /> Folder Color
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
                  Require password to reveal or view files inside this folder.
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
                    Folder Password *
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