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
import { ShieldCheck, Lock, RefreshCw, KeyRound, AlertCircle } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onUpdatePassword: (curr: string, next: string) => { success: boolean; message: string };
  onSignOut: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  username,
  onUpdatePassword,
  onSignOut,
}) => {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPass.length <= 6) {
      setError("New password must be more than 6 digits.");
      return;
    }

    if (newPass !== confirmPass) {
      setError("New passwords do not match.");
      return;
    }

    const result = onUpdatePassword(currentPass, newPass);
    if (result.success) {
      showSuccess(result.message);
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <DialogTitle className="text-xl font-bold tracking-tight">Account Settings</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            Log out or change your vault access password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Account</div>
              <div className="text-sm font-bold text-white mt-0.5">{username}</div>
            </div>
            <Button variant="ghost" onClick={onSignOut} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 text-xs">
              Log Out
            </Button>
          </div>

          <form onSubmit={handleReset} className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
              <KeyRound className="w-4 h-4" /> Reset Password
            </h3>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 p-3 rounded-xl border border-red-900/50">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Current Password</Label>
              <Input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="bg-slate-950 border-slate-800 h-9 text-xs"
                placeholder="Verify current password"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">New Password</Label>
                <Input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="bg-slate-950 border-slate-800 h-9 text-xs"
                  placeholder="Min 7 chars"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Confirm New</Label>
                <Input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="bg-slate-950 border-slate-800 h-9 text-xs"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-9 text-xs font-bold gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Update Vault Password
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};