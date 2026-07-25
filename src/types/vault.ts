export type FileType = 'pdf' | 'image' | 'note' | 'spreadsheet' | 'code' | 'word' | 'gdoc' | 'archive';

export interface DocumentItem {
  id: string;
  folderId: string | null; // null means root
  name: string;
  type: FileType;
  sizeBytes: number;
  content?: string; // Text content or Google Doc URL
  fileDataUrl?: string; // Base64 data URL for real uploaded files (PDFs, Word, Images)
  previewUrl?: string;
  tags: string[];
  isFavorite: boolean;
  isConfidential: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FolderItem {
  id: string;
  parentId: string | null;
  name: string;
  color: string;
  iconName?: string;
  isPasswordProtected: boolean;
  password?: string;
  passwordHint?: string;
  isUnlocked: boolean; // runtime unlock state
  isFavorite: boolean;
  createdAt: string;
  description?: string;
}

export interface StorageStats {
  usedBytes: number;
  maxBytes: number;
  fileCounts: Record<FileType, number>;
}

export interface VaultSettings {
  autoLockMinutes: number;
  lockOnTabBlur: boolean;
  enableEncryptionBadge: boolean;
  compactView: boolean;
}