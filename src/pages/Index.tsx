"use client";

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
import { CreateFolderDialog } from "@/components/CreateFolderDialog";
import { EditFolderDialog } from "@/components/EditFolderDialog";
import { CreateDocumentDialog } from "@/components/CreateDocumentDialog";
import { DocumentPreviewModal } from "@/components/DocumentPreviewModal";
import { SettingsView } from "@/components/SettingsView";
import { showSuccess } from "@/utils/toast";
import { Lock, FolderOpen, ArrowLeft, ShieldAlert, FolderPlus, Plus, ShieldCheck } from "lucide-react";
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
    showSuccess("Vault reset successfully");
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
                Enter the folder password to access "{currentFolder.name}".
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
            <div className="space-y-12">
              {/* Standalone Create Folder Hero Section - Only shown on main "all" view */}
              {!selectedFolderId && currentNav === "all" && (
                <section className="relative">
                  <button
                    onClick={() => setIsCreateFolderOpen(true)}
                    className="w-full group relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 dark:from-emerald-950 dark:to-slate-900 border border-slate-700 dark:border-emerald-900/50 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 text-left flex items-center justify-between group"
                  >
                    <div className="relative z-10 space-y-2">
                      <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> Secure Vault Storage
                      </div>
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        Create Your First Secure Vault
                      </h2>
                      <p className="text-slate-400 max-w-md text-sm leading-relaxed">
                        Start organizing your confidential documents with end-to-end local encryption. 
                        Choose a name, pick an accent color, and set a master password.
                      </p>
                      <div className="pt-4 flex items-center gap-3">
                         <div className="bg-emerald-600 group-hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/40">
                           <FolderPlus className="w-4 h-4" /> Get Started Now
                         </div>
                         <span className="text-slate-500 text-xs font-medium italic">Takes less than 10 seconds</span>
                      </div>
                    </div>
                    
                    <div className="relative z-10 hidden md:block pr-8">
                       <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          <Plus className="w-12 h-12" />
                       </div>
                    </div>

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 blur-[60px] -ml-24 -mb-24" />
                  </button>
                </section>
              )}

              {/* Breadcrumb Navigation - Only shown when inside a folder or specific nav */}
              {(selectedFolderId || currentNav !== "all") && (
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
                    {selectedFolderId ? currentFolder?.name : currentNav === "favorites" ? "Starred" : "Recents"}
                  </span>
                </div>
              )}

              {/* Vault Content Section - Shown when inside a folder or specific nav view */}
              {(selectedFolderId || currentNav !== "all") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                      {selectedFolderId ? "Vault Contents" : "Items"} ({filteredDocuments.length})
                    </h3>
                  </div>

                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-16 bg-slate-100/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                      <ShieldAlert className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                      <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                        This view is currently empty
                      </p>
                      <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                        Securely upload your first document or start typing a private note to populate this area.
                      </p>
                      <Button
                        onClick={() => setIsCreateDocumentOpen(true)}
                        className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-900/20"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Your First Item
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                          : "space-y-3"
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
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <PasswordModal
        folder={passwordFolder}
        isOpen={!!passwordFolder}
        onClose={() => setPasswordFolder(null)}
        onSuccess={handleUnlockFolderSuccess}
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