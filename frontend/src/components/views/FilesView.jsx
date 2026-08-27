'use client';
import React from 'react';
import { Search, RefreshCw, UploadCloud, Download, Share2, Trash2, Lock, FolderOpen } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

export default function FilesView({
  filesList = [],
  loadingFiles = false,
  search = '',
  setSearch,
  categoryFilter = '',
  setCategoryFilter,
  fetchFiles,
  onUploadClick,
  onDownload,
  onShareClick,
  onDelete
}) {
  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Page Title Header Split */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            Vault Files
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-semibold">
              {filesList.length} {filesList.length === 1 ? 'file' : 'files'}
            </span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Private, encrypted document storage.
          </p>
        </div>

        {/* Top Right Action: Render only if files exist to avoid duplicate primary CTAs */}
        {filesList.length > 0 && (
          <button
            onClick={onUploadClick}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-primary/20 transition-all"
            aria-label="Upload File"
          >
            <UploadCloud className="w-4 h-4" /> Upload File
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar: Render only if files exist or search active */}
      {(filesList.length > 0 || search || categoryFilter) && (
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface border border-surfaceBorder shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-secondaryText absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && fetchFiles()}
              className="w-full bg-transparent border-0 rounded-lg pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-secondaryText focus:ring-0 focus:outline-none"
              aria-label="Search files"
            />
          </div>

          <div className="h-5 w-px bg-surfaceBorder hidden sm:block" />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent border-0 text-xs font-medium text-foreground px-3 py-2 rounded-lg cursor-pointer focus:outline-none"
            aria-label="Filter by category"
          >
            <option value="" className="bg-surface text-foreground">All Categories</option>
            <option value="Document" className="bg-surface text-foreground">Document</option>
            <option value="Image" className="bg-surface text-foreground">Image</option>
            <option value="Video" className="bg-surface text-foreground">Video</option>
            <option value="Archive" className="bg-surface text-foreground">Archive</option>
            <option value="Code" className="bg-surface text-foreground">Code</option>
            <option value="General" className="bg-surface text-foreground">General</option>
          </select>

          <div className="h-5 w-px bg-surfaceBorder" />

          <button
            onClick={fetchFiles}
            className="p-2 rounded-lg text-secondaryText hover:text-foreground hover:bg-surfaceBorder/40 transition-colors flex items-center justify-center"
            title="Refresh files"
            aria-label="Refresh files"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Files Table Container or Dedicated Empty State */}
      {loadingFiles ? (
        <div className="glass-panel rounded-2xl border border-surfaceBorder p-12 text-center text-xs text-secondaryText">
          Decrypting vault file index...
        </div>
      ) : filesList.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-surfaceBorder p-8 shadow-sm">
          <EmptyState
            icon={FolderOpen}
            title="No files in your vault yet"
            description="Upload documents to encrypt and securely store them in your private vault."
            securityBadges={["AES-256 Encrypted", "Zero-Knowledge Storage", "Private Vault"]}
            actionLabel="Upload your first file"
            onAction={onUploadClick}
          />
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-surfaceBorder overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="bg-surface/80 text-secondaryText uppercase tracking-wider text-[10px] border-b border-surfaceBorder font-bold">
                <tr>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surfaceBorder/60">
                {filesList.map((file) => (
                  <tr key={file.id} className="hover:bg-surface/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2.5">
                      <Lock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="truncate max-w-xs">{file.filename}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-surfaceBorder/60 text-foreground border border-surfaceBorder font-medium">
                        {file.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-secondaryText">{formatSize(file.file_size_bytes || file.file_size)}</td>
                    <td className="px-4 py-3 font-mono text-secondaryText">
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onDownload(file)}
                          className="p-1.5 rounded-lg bg-surface border border-surfaceBorder text-primary hover:bg-primary/10 transition-colors"
                          title="Decrypt & Download"
                          aria-label="Decrypt and download file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onShareClick(file)}
                          className="p-1.5 rounded-lg bg-surface border border-surfaceBorder text-primary hover:bg-primary/10 transition-colors"
                          title="Create Secure Share Link"
                          aria-label="Create share link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(file.id)}
                          className="p-1.5 rounded-lg bg-surface border border-surfaceBorder text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete File"
                          aria-label="Delete file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
