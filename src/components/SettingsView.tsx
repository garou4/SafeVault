import React, { useState } from "react";
import { VaultSettings, FolderItem } from "@/types/vault";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Lock, RefreshCw, KeyRound, CheckCircle2, Edit3 } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface SettingsViewProps {
  settings: VaultSettings;
  folders: FolderItem[];
  onUpdateSettings: (newSettings: VaultSettings) => void;
  onOpenSetMasterPassword: () => void;
  onLockAll: () => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  folders,
  onUpdateSettings,
  onOpenSetMasterPassword,
  onLockAll,
  onResetAllData,
}) => {
  const protectedFolders = folders.filter((f) => f.isPasswordProtected);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-emerald-600" /> Security & Master Password
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Set a Master Password that can unlock any folder in your vault.
        </p>
      </div>

      {/* Master Password Panel */}
      <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-lg">
              <KeyRound className="w-5 h-5 text-emerald-600" /> Universal Master Password
            </div>
            <p className="text-xs text-slate-500">
              Your Master Password serves as a universal override key to open any locked folder.
            </p>
          </div>

          <Button
            onClick={onOpenSetMasterPassword}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" /> Change Master Password
          </Button>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">Master Password:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {settings.masterPassword ? "••••••••" : "Not Configured"}
          </span>
        </div>

        {settings.masterPasswordHint && (
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Password Hint:</span> {settings.masterPasswordHint}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Security Automation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
            <Lock className="w-5 h-5 text-emerald-600" /> Auto-Lock Rules
          </h3>

          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Auto-Lock Inactivity Timer</Label>
              <Select
                value={settings.autoLockMinutes.toString()}
                onValueChange={(val) => {
                  onUpdateSettings({ ...settings, autoLockMinutes: parseInt(val, 10) });
                  showSuccess("Auto-lock timer updated");
                }}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select Timeout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Minute of inactivity</SelectItem>
                  <SelectItem value="5">5 Minutes of inactivity</SelectItem>
                  <SelectItem value="15">15 Minutes of inactivity</SelectItem>
                  <SelectItem value="0">Never auto-lock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <Label className="text-xs font-semibold">Lock on Tab Switch / Blur</Label>
                <p className="text-[11px] text-slate-500">
                  Automatically lock all folders when leaving browser tab.
                </p>
              </div>
              <Switch
                checked={settings.lockOnTabBlur}
                onCheckedChange={(checked) => {
                  onUpdateSettings({ ...settings, lockOnTabBlur: checked });
                  showSuccess(`Tab blur locking ${checked ? "enabled" : "disabled"}`);
                }}
              />
            </div>
          </div>
        </div>

        {/* Protected Vault Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
            <KeyRound className="w-5 h-5 text-amber-500" /> Protected Vaults Overview
          </h3>

          <div className="space-y-2 pt-1 max-h-[160px] overflow-y-auto pr-1">
            {protectedFolders.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 italic">No password protected vaults created yet.</p>
            ) : (
              protectedFolders.map((f) => (
                <div key={f.id} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                    <span className="font-medium text-slate-700 dark:text-slate-200">{f.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${f.isUnlocked ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                    {f.isUnlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
              ))
            )}
          </div>

          <Button onClick={onLockAll} className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Lock All Folders Now
          </Button>
        </div>
      </div>

      {/* Reset data */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Local Storage Encryption Active
          </div>
          <p className="text-xs text-slate-400">
            Files and folders are stored safely in browser storage. Reset restores initial demo vaults.
          </p>
        </div>

        <Button
          onClick={onResetAllData}
          variant="outline"
          className="bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-800/60 text-xs shrink-0 gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-red-400" /> Reset Demo Vault Data
        </Button>
      </div>
    </div>
  );
};