import React, { useState, useEffect } from "react";
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
import { FolderItem } from "@/types/vault";
import { Edit3, Lock, Palette } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface EditFolderDialogProps {
  folder: FolderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateFolder: (updatedData: {
    id: string;
    name: string;
    description: string;
    color: string;
    isPasswordProtected: boolean;
    password?: string;
    passwordHint?: string;
  }) => void;
}

const PRESET_COLORS = [
  "#059669", "#2563eb", "#7c3aed", "#dc2626", "#d97706", "#0891b2", "#4b5563"
];

export const EditFolderDialog: React.FC<EditFolderDialogProps> = ({
  folder,
  isOpen,
  onClose,
  onUpdateFolder,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#059669");
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordHint, setPasswordHint] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setDescription(folder.description || "");
      setColor(folder.color || "#059669");
      setIsProtected(folder.isPasswordProtected);
      setPassword(folder.password || "");
      setPasswordHint(folder.passwordHint || "");
      setError("");
    }
  }, [folder]);

  if (!folder) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Folder name cannot be empty");
      return;
    }

    if (isProtected && !password.trim()) {
      setError("Password is required for protected folders");
      return;
    }

    onUpdateFolder({
      id: folder.id,
      name: name.trim(),
      description: description.trim(),
      color,
      isPasswordProtected: isProtected,
      password: isProtected ? password.trim() : undefined,
      passwordHint: isProtected ? passwordHint.trim() : undefined,
    });

    showSuccess(`Updated folder "${name.trim()}"`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Edit3 className="w-5 h-5" />
            <DialogTitle className="text-xl font-bold">Rename / Edit Folder</DialogTitle>
          </div>
          <DialogDescription>
            Update folder title, color accent, or password settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-md font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit-folder-name">Folder Name *</Label>
            <Input
              id="edit-folder-name"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-folder-desc">Description</Label>
            <Textarea
              id="edit-folder-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-16 resize-none text-xs"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-semibold">
              <Palette className="w-3.5 h-3.5 text-slate-500" /> Accent Color
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

          {/* Password Settings */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  Password Lock
                </div>
                <p className="text-xs text-slate-500">
                  Protect folder contents with password
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
                  <Label htmlFor="edit-folder-pass" className="text-xs">Folder Password *</Label>
                  <Input
                    id="edit-folder-pass"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="bg-white dark:bg-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-folder-hint" className="text-xs">Password Hint</Label>
                  <Input
                    id="edit-folder-hint"
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};