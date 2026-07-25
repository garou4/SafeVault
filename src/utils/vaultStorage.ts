import { DocumentItem, FolderItem, VaultSettings } from "@/types/vault";

const FOLDERS_KEY = "dyad_vault_folders_v1";
const DOCUMENTS_KEY = "dyad_vault_documents_v1";
const SETTINGS_KEY = "dyad_vault_settings_v1";

// Ensure these are exported as empty arrays so no mock data appears on first load
export const INITIAL_FOLDERS: FolderItem[] = [];
export const INITIAL_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_SETTINGS: VaultSettings = {
  autoLockMinutes: 5,
  lockOnTabBlur: false,
  enableEncryptionBadge: true,
  compactView: false,
};

export function loadFolders(): FolderItem[] {
  const stored = localStorage.getItem(FOLDERS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((f: FolderItem) => ({
        ...f,
        isUnlocked: f.isPasswordProtected ? false : true,
      }));
    } catch {
      return INITIAL_FOLDERS;
    }
  }
  return INITIAL_FOLDERS;
}

export function saveFolders(folders: FolderItem[]) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function loadDocuments(): DocumentItem[] {
  const stored = localStorage.getItem(DOCUMENTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_DOCUMENTS;
    }
  }
  return INITIAL_DOCUMENTS;
}

export function saveDocuments(docs: DocumentItem[]) {
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
}

export function loadSettings(): VaultSettings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_SETTINGS;
    }
  }
  return INITIAL_SETTINGS;
}

export function saveSettings(settings: VaultSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}