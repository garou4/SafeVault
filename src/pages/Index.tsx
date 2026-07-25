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
} from "@/utils/vaultStorage";
import { VaultSidebar, NavView } from "@/components/VaultSidebar";
import { VaultHeader } from "@/components/VaultHeader";
import { DocumentCard } from "@/components/DocumentCard";
import { FolderCard } from "@/components/FolderCard";
import { CreateFolderDialog } from "@/components/CreateFolderDialog";
import { CreateDocumentDialog } from "@/components/CreateDocumentDialog";
import { DocumentPreviewModal } from "@/components/DocumentPreviewModal";
import { PasswordModal } from "@/components/PasswordModal";
import { AuthOverlay } from "@/components/AuthOverlay";
import { useAuth } from "@/hooks/use-auth";
import { showSuccess, showError } from "@/utils/toast";
import { FolderOpen, ShieldAlert, FolderPlus, Plus, ShieldCheck, Folder as FolderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_STORAGE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

const Index: React.FC = () => {
  const auth = useAuth();
  
  const [folders, setFolders] = useState<FolderItem[]>(() => loadFolders());
  const [documents, setDocuments] = useState<DocumentItem[]>(() => loadDocuments());
  const [settings, setSettings] = useState<VaultSettings>(() => loadSettings());

  const [currentNav, setCurrentNav] = useState<NavView>("all");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DocumentItem | null>(null);
  const [passwordFolder, setPasswordFolder] = useState<FolderItem | null>(null);

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

  const handleSelectNav = (view: NavView, folderId?: string | null) => {
    if (folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (folder?.isPasswordProtected && !folder.isUnlocked) {
        setPasswordFolder(folder);
        return;
      }
    }
    
    setCurrentNav(view);
    if (folderId !== undefined) {
      setSelectedFolderId(folderId);
    } else {
      setSelectedFolderId(null);
    }
  };

  const handleUnlockFolder = (folderId: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, isUnlocked: true } : f));
    setCurrentNav("all");
    setSelectedFolderId(folderId);
  };

  const handleToggleFavoriteFolder = (folderId: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, isFavorite: !f.isFavorite } : f));
  };

  const handleLockFolder = (folderId: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, isUnlocked: false } : f));
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
    showSuccess("Vault folder locked");
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
    setDocuments(prev => prev.filter(d => d.folderId !== folderId));
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
    showSuccess("Folder and its contents deleted");
  };

  const toggleDocumentFavorite = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isFavorite: !d.isFavorite } : d))
    );
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    showSuccess("Document deleted");
  };

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

  const totalBytesUsed = useMemo(() => {
    return documents.reduce((acc, doc) => acc + doc.sizeBytes, 0);
  }, [documents]);

  const currentFolder = useMemo(() => {
    return folders.find((f) => f.id === selectedFolderId) || null;
  }, [folders, selectedFolderId]);

  const filteredFolders = useMemo(() => {
    if (selectedFolderId || currentNav !== "all") return [];
    if (!searchQuery.trim()) return folders;
    
    const q = searchQuery.toLowerCase();
    return folders.filter(f => 
      f.name.toLowerCase().includes(q) || 
      f.description?.toLowerCase().includes(q)
    );
  }, [folders, selectedFolderId, currentNav, searchQuery]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      if (selectedFolderId !== null) {
        if (d.folderId !== selectedFolderId) return false;
      } else if (currentNav === "favorites") {
        if (!d.isFavorite) return false;
      } else if (currentNav === "recents") {
        // Just show all for recents sorted by date
      } else {
        // In "All" view with no folder selected, only show root documents
        if (d.folderId !== null) return false;
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

  if (!auth.isAuthenticated) {
    return (
      <AuthOverlay 
        onSignIn={auth.signIn} 
        onSignUp={auth.signUp} 
        hasAccount={auth.hasAccount} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      <VaultSidebar
        currentView={currentNav}
        selectedFolderId={selectedFolderId}
        folders={folders}
        totalBytesUsed={totalBytesUsed}
        maxBytes={MAX_STORAGE_BYTES}
        onSelectNav={handleSelectNav}
        username={auth.user?.username || "User"}
        onUpdatePassword={auth.updatePassword}
        onSignOut={auth.signOut}
      />

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
          isDeveloper={auth.user?.isDeveloper}
          currentFolderTitle={
            currentFolder
              ? currentFolder.name
              : currentNav === "favorites"
              ? "Starred Items"
              : currentNav === "recents"
              ? "Recent Files"
              : "All Vault Files"
          }
        />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-12">
            {/* Banner for Empty State */}
            {!selectedFolderId && currentNav === "all" && folders.length === 0 && (
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
                    </p>
                    <div className="pt-4 flex items-center gap-3">
                       <div className="bg-emerald-600 group-hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/40">
                         <FolderPlus className="w-4 h-4" /> Get Started Now
                       </div>
                    </div>
                  </div>
                  <div className="relative z-10 hidden md:block pr-8">
                     <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <Plus className="w-12 h-12" />
                     </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -mr-32 -mt-32" />
                </button>
              </section>
            )}

            {/* Breadcrumbs */}
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

            {/* Folders Section */}
            {filteredFolders.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <FolderIcon className="w-4 h-4" /> Vault Folders
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredFolders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      itemCount={documents.filter(d => d.folderId === folder.id).length}
                      onOpenFolder={(f) => handleSelectNav("all", f.id)}
                      onEditFolder={(f) => {}} // Could add edit dialog later
                      onToggleFavorite={handleToggleFavoriteFolder}
                      onLockFolder={handleLockFolder}
                      onDeleteFolder={handleDeleteFolder}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Documents Section */}
            <div className="space-y-4">
              {!selectedFolderId && currentNav === "all" && folders.length > 0 && (
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Root Documents
                </h3>
              )}
              
              {filteredDocuments.length === 0 && filteredFolders.length === 0 ? (
                <div className="text-center py-16 bg-slate-100/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <ShieldAlert className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                    This view is currently empty
                  </p>
                  <Button
                    onClick={() => setIsCreateDocumentOpen(true)}
                    className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-900/20"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Your First Item
                  </Button>
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
                  {filteredDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      viewMode={viewMode}
                      onPreview={setPreviewDocument}
                      onToggleFavorite={toggleDocumentFavorite}
                      onDeleteDocument={handleDeleteDocument}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreateFolder={handleCreateFolder}
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

      <PasswordModal
        folder={passwordFolder}
        isOpen={!!passwordFolder}
        onClose={() => setPasswordFolder(null)}
        onSuccess={handleUnlockFolder}
      />
    </div>
  );
};

export default Index;