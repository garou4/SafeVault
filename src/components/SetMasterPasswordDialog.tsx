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
import { KeyRound, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface SetMasterPasswordDialogProps {
  isOpen: boolean;
  currentMasterPassword?: string;
  currentHint?: string;
  onClose: () => void;
  onSaveMasterPassword: (newPassword: string, hint: string) => void;
}

export const SetMasterPasswordDialog: React.FC<SetMasterPasswordDialogProps> = ({
  isOpen,
  currentMasterPassword = "",
  currentHint = "",
  onClose,
  onSaveMasterPassword,
}) => {
  const [password, setPassword] = useState(currentMasterPassword);
  const [confirmPassword, setConfirmPassword] = useState(currentMasterPassword);
  const [hint, setHint] = useState(currentHint);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Master password cannot be empty");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    onSaveMasterPassword(password.trim(), hint.trim());
    showSuccess("Master Password updated! You can now use it to unlock any vault folder.");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
            <KeyRound className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            Set Universal Master Password
          </DialogTitle>
          <DialogDescription className="text-center text-slate-500 text-xs">
            Choose a Master Password that can override and unlock <span className="font-semibold text-slate-700 dark:text-slate-300">all protected folders</span> in your vault.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/50 p-2.5 rounded-lg font-medium border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="new-master-pass" className="text-xs font-semibold">
              New Master Password *
            </Label>
            <div className="relative">
              <Input
                id="new-master-pass"
                type={showPass ? "text" : "password"}
                placeholder="Enter new master password..."
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="pr-10 font-mono text-sm"
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

          <div className="space-y-1.5">
            <Label htmlFor="confirm-master-pass" className="text-xs font-semibold">
              Confirm Master Password *
            </Label>
            <Input
              id="confirm-master-pass"
              type={showPass ? "text" : "password"}
              placeholder="Re-enter master password..."
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="master-hint" className="text-xs font-semibold">
              Master Password Hint (Optional)
            </Label>
            <Input
              id="master-hint"
              placeholder="e.g. Childhood pet + birth year"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-snug">
              This Master Password serves as a super-key. It will work on any folder, even if that folder has its own individual password.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Save Master Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};