import { DocumentItem, FolderItem, VaultSettings } from "@/types/vault";

const FOLDERS_KEY = "dyad_vault_folders_v1";
const DOCUMENTS_KEY = "dyad_vault_documents_v1";
const SETTINGS_KEY = "dyad_vault_settings_v1";

export const INITIAL_FOLDERS: FolderItem[] = [
  {
    id: "folder-tax",
    parentId: null,
    name: "Tax & Financials 2024",
    color: "#059669", // emerald
    iconName: "FileSpreadsheet",
    isPasswordProtected: true,
    password: "1234",
    passwordHint: "Simple pin (1234)",
    isUnlocked: false,
    isFavorite: true,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    description: "Confidential tax returns, bank statements and W-2 forms"
  },
  {
    id: "folder-identity",
    parentId: null,
    name: "Personal Identity Vault",
    color: "#2563eb", // blue
    iconName: "ShieldCheck",
    isPasswordProtected: true,
    password: "pass",
    passwordHint: "Short word (pass)",
    isUnlocked: false,
    isFavorite: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    description: "Passports, ID cards, driver license, health records"
  },
  {
    id: "folder-work",
    parentId: null,
    name: "Work Projects & Contracts",
    color: "#7c3aed", // purple
    iconName: "Briefcase",
    isPasswordProtected: false,
    isUnlocked: true,
    isFavorite: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    description: "Client NDA documents, software architecture diagrams"
  },
  {
    id: "folder-passwords",
    parentId: null,
    name: "Emergency Recovery Keys",
    color: "#dc2626", // red
    iconName: "KeyRound",
    isPasswordProtected: true,
    password: "masterkey",
    passwordHint: "Master key (masterkey)",
    isUnlocked: false,
    isFavorite: true,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    description: "Crypto seed phrases, recovery backup codes"
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-1",
    folderId: "folder-tax",
    name: "Form 1040 Tax Return 2023.pdf",
    type: "pdf",
    sizeBytes: 2450000,
    tags: ["Tax", "IRS", "2023"],
    isFavorite: true,
    isConfidential: true,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    content: "Confidential Tax Document for Tax Year 2023. Federal Tax Return total summary."
  },
  {
    id: "doc-2",
    folderId: "folder-tax",
    name: "W2 Statement - ACME Corp.pdf",
    type: "pdf",
    sizeBytes: 850000,
    tags: ["W2", "Income"],
    isFavorite: false,
    isConfidential: true,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    content: "W2 Wage and Tax Statement. Employer Identification: XX-XXXXXXX."
  },
  {
    id: "doc-3",
    folderId: "folder-identity",
    name: "Passport Scan High Res.jpg",
    type: "image",
    sizeBytes: 4200000,
    previewUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    tags: ["Passport", "ID", "Travel"],
    isFavorite: true,
    isConfidential: true,
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    content: "International Passport Copy - Expiry 2030."
  },
  {
    id: "doc-4",
    folderId: "folder-identity",
    name: "Medical Records & Insurance.pdf",
    type: "pdf",
    sizeBytes: 3100000,
    tags: ["Health", "Insurance"],
    isFavorite: false,
    isConfidential: false,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    content: "Health policy details, blood group card, emergency contact numbers."
  },
  {
    id: "doc-5",
    folderId: "folder-work",
    name: "Client Non-Disclosure Agreement.pdf",
    type: "pdf",
    sizeBytes: 1200000,
    tags: ["Legal", "NDA"],
    isFavorite: false,
    isConfidential: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    content: "Mutual NDA regarding software development consulting services."
  },
  {
    id: "doc-6",
    folderId: "folder-work",
    name: "Q3 Strategy Presentation.note",
    type: "note",
    sizeBytes: 15000,
    tags: ["Strategy", "Notes"],
    isFavorite: true,
    isConfidential: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    content: "1. Expand European market presence\n2. Launch password-vault feature by Q3\n3. Zero-knowledge encryption standard audit."
  },
  {
    id: "doc-7",
    folderId: "folder-passwords",
    name: "Cold Storage Crypto Wallet Keys.note",
    type: "note",
    sizeBytes: 8000,
    tags: ["Crypto", "Keys", "Secret"],
    isFavorite: true,
    isConfidential: true,
    createdAt: new Date(Date.now() - 86400000 * 55).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 55).toISOString(),
    content: "Mnemonic Seed Phrase:\n1. timber 2. harvest 3. quantum 4. velocity 5. shield 6. obsidian 7. fortress 8. matrix 9. horizon 10. cobalt 11. galaxy 12. safe"
  },
  {
    id: "doc-8",
    folderId: null, // Root folder doc
    name: "Welcome to SafeVault Guide.pdf",
    type: "pdf",
    sizeBytes: 950000,
    tags: ["Guide", "Getting Started"],
    isFavorite: false,
    isConfidential: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    content: "Welcome to SafeVault! Store files securely inside custom password-protected folders. Click 'Lock All' to instantly obscure sensitive vaults."
  }
];

export const INITIAL_SETTINGS: VaultSettings = {
  masterPassword: "admin",
  masterPasswordHint: "Default master password (admin)",
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