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
import { Lock, KeyRound, Eye, EyeOff, AlertCircle, HelpCircle } from "lucide-react";
import { FolderItem } from "@/types/vault";
import { showError, showSuccess } from "@/utils/toast";

interface PasswordModalProps {
  folder: FolderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (folderId: string) => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  folder,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!folder) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg("Please enter the folder password");
      return;
    }

    if (folder.password && password === folder.password) {
      showSuccess(`Unlocked "${folder.name}"`);
      setPassword("");
      setErrorMsg("");
      setShowHint(false);
      onSuccess(folder.id);
      onClose();
    } else {
      setErrorMsg("Incorrect password. Please try again.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setPassword(""); setErrorMsg(""); setShowHint(false); onClose(); } }}>
      <DialogContent className={`sm:max-w-md ${isShaking ? "animate-bounce transition-all duration-100 border-red-500" : ""}`}>
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            Protected Vault Folder
          </DialogTitle>
          <DialogDescription className="text-center text-slate-500">
            Enter the password to access contents inside <span className="font-semibold text-slate-800 dark:text-slate-200">{folder.name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUnlock} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="vault-password">Folder Password</Label>
            <div className="relative">
              <Input
                id="vault-password"
                type={showPass ? "text" : "password"}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                className="pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {folder.passwordHint && (
            <div className="pt-1">
              {!showHint ? (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Show Password Hint
                </button>
              ) : (
                <div className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <span className="font-semibold">Hint:</span> {folder.passwordHint}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2">
              <KeyRound className="w-4 h-4" />
              Unlock Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};