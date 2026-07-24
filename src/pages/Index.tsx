import React, { useState, useEffect, useMemo } from "react";
import { FolderItem, DocumentItem, VaultSettings, FileType } from "@/types/vault";
import {
  loadFolders,
  saveFolders,
  loadDocuments,
  saveDocuments,
  loadSettings,
  saveSettings,
  INITIAL_FOLDERS,
  INITIAL_DOCUMENTS,
} from "@/utils/vaultStorage";
import { VaultSidebar, NavView } from "@/components/VaultSidebar";
import { VaultHeader } from "@/components/VaultHeader";
import { FolderCard } from "@/components/FolderCard";
import { DocumentCard } from "@/components/DocumentCard";
import { PasswordModal } from "@/components/PasswordModal";
import { SetMasterPasswordDialog } from "@/components/SetMasterPasswordDialog";
import { CreateFolderDialog } from "@/components/CreateFolderDialog";
import { EditFolderDialog } from "@/components/EditFolderDialog";
import { CreateDocumentDialog } from "@/components/CreateDocumentDialog";
import { DocumentPreviewModal } from "@/components/DocumentPreviewModal";
import { SettingsView } from "@/components/SettingsView";
import { showSuccess } from "@/utils/toast";
import { Lock, FolderOpen, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_STORAGE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

const Index: React.FC = () => {
  const [folders, setFolders] = useState<FolderItem[]>(loadFolders);
  const [documents, setDocuments] = useState<DocumentItem[]>(loadDocuments);
  const [settings, setSettings] = useState<VaultSettings>(loadSettings);

  const [currentNav, setCurrentNav] = useState<NavView>("all");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [passwordFolder, setPasswordFolder] = useState<FolderItem | null>(null);
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);
  const [isSetMasterPassOpen, setIsSetMasterPassOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DocumentItem | null>(null);

  // Sync to persistence
  useEffect(() => {
    saveFolders(folders);
  }, [folders]);

  useEffect(() => {
    saveDocuments(documents);
  }, [documents]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Handle Tab Blur auto-lock if enabled
  useEffect(() => {
    if (!settings.lockOnTabBlur) return;
    const handleBlur = () => {
      lockAllFolders();
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [settings.lockOnTabBlur]);

  // Lock all password protected folders
  const lockAllFolders = () => {
    setFolders((prev) =>
      prev.map((f) => (f.isPasswordProtected ? { ...f, isUnlocked: false } : f))
    );
    showSuccess("Locked all vault folders");
  };

  const handleSelectNav = (view: NavView, folderId?: string | null) => {
    setCurrentNav(view);
    if (folderId !== undefined) {
      const targetFolder = folders.find((f) => f.id === folderId);
      if (targetFolder && targetFolder.isPasswordProtected && !targetFolder.isUnlocked) {
        setPasswordFolder(targetFolder);
        return;
      }
      setSelectedFolderId(folderId);
    } else {
      setSelectedFolderId(null);
    }
  };

  const handleOpenFolder = (folder: FolderItem) => {
    if (folder.isPasswordProtected && !folder.isUnlocked) {
      setPasswordFolder(folder);
    } else {
      setSelectedFolderId(folder.id);
      setCurrentNav("vaults");
    }
  };

  const handleUnlockFolderSuccess = (folderId: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, isUnlocked: true } : f))
    );
    setSelectedFolderId(folderId);
    setCurrentNav("vaults");
  };

  // Save new Master Password
  const handleSaveMasterPassword = (newPassword: string, hint: string) => {
    setSettings((prev) => ({
      ...prev,
      masterPassword: newPassword,
      masterPasswordHint: hint,
    }));
  };

  // Toggle favorite for folders
  const toggleFolderFavorite = (folderId: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, isFavorite: !f.isFavorite } : f))
    );
  };

  // Toggle favorite for documents
  const toggleDocumentFavorite = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isFavorite: !d.isFavorite } : d))
    );
  };

  // Delete folder & move internal docs to root
  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setDocuments((prev) =>
      prev.map((d) => (d.folderId === folderId ? { ...d, folderId: null } : d))
    );
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
      setCurrentNav("all");
    }
    showSuccess("Folder deleted");
  };

  // Delete document
  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    showSuccess("Document deleted");
  };

  // Create new folder
  const handleCreateFolder = (data: {
    name: string;
    description: string;
    color: string;
    isPasswordProtected: boolean;
    password?: string;
    passwordHint?: string;
  }) => {
    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      parentId: null,
      name: data.name,
      description: data.description,
      color: data.color,
      isPasswordProtected: data.isPasswordProtected,
      password: data.password,
      passwordHint: data.passwordHint,
      isUnlocked: true,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };
    setFolders((prev) => [newFolder, ...prev]);
  };

  // Update existing folder
  const handleUpdateFolder = (data: {
    id: string;
    name: string;
    description: string;
    color: string;
    isPasswordProtected: boolean;
    password?: string;
    passwordHint?: string;
  }) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === data.id
          ? {
              ...f,
              name: data.name,
              description: data.description,
              color: data.color,
              isPasswordProtected: data.isPasswordProtected,
              password: data.password,
              passwordHint: data.passwordHint,
            }
          : f
      )
    );
  };

  // Create new document
  const handleCreateDocument = (data: {
    folderId: string | null;
    name: string;
    type: FileType;
    sizeBytes: number;
    content: string;
    tags: string[];
    isConfidential: boolean;
    previewUrl?: string;
  }) => {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      folderId: data.folderId,
      name: data.name,
      type: data.type,
      sizeBytes: data.sizeBytes,
      content: data.content,
      tags: data.tags,
      isConfidential: data.isConfidential,
      previewUrl: data.previewUrl,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  // Handle preview request (checking lock status first)
  const handlePreviewDocument = (doc: DocumentItem) => {
    if (doc.folderId) {
      const parentFolder = folders.find((f) => f.id === doc.folderId);
      if (parentFolder && parentFolder.isPasswordProtected && !parentFolder.isUnlocked) {
        setPasswordFolder(parentFolder);
        return;
      }
    }
    setPreviewDocument(doc);
  };

  const handleResetAllData = () => {
    setFolders(INITIAL_FOLDERS);
    setDocuments(INITIAL_DOCUMENTS);
    setSelectedFolderId(null);
    setCurrentNav("all");
    showSuccess("Reset vault data to demo defaults");
  };

  // Calculate statistics
  const totalBytesUsed = useMemo(() => {
    return documents.reduce((acc, doc) => acc + doc.sizeBytes, 0);
  }, [documents]);

  const lockedVaultCount = useMemo(() => {
    return folders.filter((f) => f.isPasswordProtected && !f.isUnlocked).length;
  }, [folders]);

  const currentFolder = useMemo(() => {
    return folders.find((f) => f.id === selectedFolderId) || null;
  }, [folders, selectedFolderId]);

  // Filtered Items logic
  const filteredFolders = useMemo(() => {
    if (currentNav === "favorites") {
      return folders.filter((f) => f.isFavorite);
    }
    if (selectedFolderId !== null) {
      return []; // inside a specific folder view
    }
    return folders.filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [folders, currentNav, selectedFolderId, searchQuery]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      if (selectedFolderId !== null) {
        if (d.folderId !== selectedFolderId) return false;
      } else if (currentNav === "favorites") {
        if (!d.isFavorite) return false;
      }

      if (selectedTypeFilter !== "all" && d.type !== selectedTypeFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesTags = d.tags.some((t) => t.toLowerCase().includes(q));
        const matchesContent = d.content && d.content.toLowerCase().includes(q);
        return matchesName || matchesTags || matchesContent;
      }

      return true;
    }).sort((a, b) => {
      if (currentNav === "recents") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [documents, selectedFolderId, currentNav, selectedTypeFilter, searchQuery]);

  const isInsideLockedFolder = currentFolder && currentFolder.isPasswordProtected && !currentFolder.isUnlocked;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <VaultSidebar
        currentView={currentNav}
        selectedFolderId={selectedFolderId}
        folders={folders}
        totalBytesUsed={totalBytesUsed}
        maxBytes={MAX_STORAGE_BYTES}
        lockedVaultCount={lockedVaultCount}
        onSelectNav={handleSelectNav}
        onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
        onLockAll={lockAllFolders}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <VaultHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedTypeFilter}
          onTypeChange={setSelectedTypeFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenCreateDocument={() => setIsCreateDocumentOpen(true)}
          onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
          onOpenSetMasterPassword={() => setIsSetMasterPassOpen(true)}
          currentFolderTitle={
            currentFolder
              ? currentFolder.name
              : currentNav === "favorites"
              ? "Starred Items"
              : currentNav === "recents"
              ? "Recent Files"
              : currentNav === "settings"
              ? "Settings"
              : "All Vault Files"
          }
          isCurrentFolderLocked={currentFolder?.isPasswordProtected ? !currentFolder.isUnlocked : undefined}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {currentNav === "settings" ? (
            <SettingsView
              settings={settings}
              folders={folders}
              onUpdateSettings={setSettings}
              onOpenSetMasterPassword={() => setIsSetMasterPassOpen(true)}
              onLockAll={lockAllFolders}
              onResetAllData={handleResetAllData}
            />
          ) : isInsideLockedFolder ? (
            /* Locked Folder View State */
            <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">This Vault is Locked</h3>
              <p className="text-sm text-slate-500">
                Enter the folder password or Master Password to access "{currentFolder.name}".
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button variant="outline" onClick={() => setSelectedFolderId(null)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
                <Button
                  onClick={() => setPasswordFolder(currentFolder)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Unlock Vault
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Breadcrumb Navigation */}
              {selectedFolderId && (
                <div className="flex items-center gap-2 text-xs text-slate-500 pb-2 border-b">
                  <button
                    onClick={() => { setSelectedFolderId(null); setCurrentNav("all"); }}
                    className="hover:text-emerald-600 font-medium"
                  >
                    All Vaults
                  </button>
                  <span>/</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
                    {currentFolder?.name}
                  </span>
                </div>
              )}

              {/* Folders Section */}
              {filteredFolders.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Folders & Vaults ({filteredFolders.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredFolders.map((f) => (
                      <FolderCard
                        key={f.id}
                        folder={f}
                        itemCount={documents.filter((d) => d.folderId === f.id).length}
                        onOpenFolder={handleOpenFolder}
                        onEditFolder={(folderToEdit) => setEditingFolder(folderToEdit)}
                        onToggleFavorite={toggleFolderFavorite}
                        onLockFolder={() => {
                          setFolders((prev) =>
                            prev.map((item) => (item.id === f.id ? { ...item, isUnlocked: false } : item))
                          );
                          showSuccess(`Locked "${f.name}"`);
                        }}
                        onDeleteFolder={handleDeleteFolder}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Documents Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Documents ({filteredDocuments.length})
                  </h3>
                </div>

                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      No documents found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload or add a secure note to populate this folder.
                    </p>
                    <Button
                      onClick={() => setIsCreateDocumentOpen(true)}
                      variant="outline"
                      size="sm"
                      className="mt-4 text-xs"
                    >
                      Add First Document
                    </Button>
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                        : "space-y-2"
                    }
                  >
                    {filteredDocuments.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        viewMode={viewMode}
                        onPreview={handlePreviewDocument}
                        onToggleFavorite={toggleDocumentFavorite}
                        onDeleteDocument={handleDeleteDocument}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <PasswordModal
        folder={passwordFolder}
        masterPassword={settings.masterPassword}
        isOpen={!!passwordFolder}
        onClose={() => setPasswordFolder(null)}
        onSuccess={handleUnlockFolderSuccess}
      />

      <SetMasterPasswordDialog
        isOpen={isSetMasterPassOpen}
        currentMasterPassword={settings.masterPassword}
        currentHint={settings.masterPasswordHint}
        onClose={() => setIsSetMasterPassOpen(false)}
        onSaveMasterPassword={handleSaveMasterPassword}
      />

      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      <EditFolderDialog
        folder={editingFolder}
        isOpen={!!editingFolder}
        onClose={() => setEditingFolder(null)}
        onUpdateFolder={handleUpdateFolder}
      />

      <CreateDocumentDialog
        isOpen={isCreateDocumentOpen}
        folders={folders}
        defaultFolderId={selectedFolderId}
        onClose={() => setIsCreateDocumentOpen(false)}
        onCreateDocument={handleCreateDocument}
      />

      <DocumentPreviewModal
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
      />
    </div>
  );
};

export default Index;