'use client';
import React from 'react';
import { Search, RefreshCw, UploadCloud, Download, Share2, Trash2, Lock, FolderOpen } from 'lucide-react';

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
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Page Title Header Split */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            Vault Files
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-semibold">
              {filesList.length} {filesList.length === 1 ? 'file' : 'files'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Encrypted documents stored securely in your private vault.
          </p>
        </div>

        <button
          onClick={onUploadClick}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
        >
          <UploadCloud className="w-4 h-4" /> Upload File
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search documents by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && fetchFiles()}
              className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); fetchFiles(); }}
            className="glass-input rounded-xl px-3 py-2 text-xs text-slate-200"
          >
            <option value="">All Categories</option>
            <option value="Document">Document</option>
            <option value="Image">Image</option>
            <option value="Video">Video</option>
            <option value="Archive">Archive</option>
            <option value="Code">Code</option>
            <option value="General">General</option>
          </select>

          <button
            onClick={fetchFiles}
            className="p-2 rounded-xl bg-surface border border-surfaceBorder text-slate-400 hover:text-white transition-colors"
            title="Refresh Files"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Files Table Container */}
      <div className="glass-panel rounded-2xl border border-surfaceBorder overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-surface/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-surfaceBorder">
              <tr>
                <th className="px-4 py-3">File Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder/50">
              {loadingFiles ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center text-slate-500">
                    Decrypting vault file index...
                  </td>
                </tr>
              ) : filesList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12">
                    {/* Centered Empty State */}
                    <div className="max-w-sm mx-auto text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mx-auto flex items-center justify-center">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-200">No files in your vault yet</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Upload your documents to encrypt them with AES-256 and store them securely.
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={onUploadClick}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-md shadow-blue-500/20"
                        >
                          <UploadCloud className="w-4 h-4" /> Upload Your First File
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filesList.map((file) => (
                  <tr key={file.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-200 flex items-center gap-2.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span className="truncate max-w-xs">{file.filename}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {file.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{formatSize(file.file_size)}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onDownload(file)}
                          className="p-1.5 rounded-lg bg-surface border border-surfaceBorder text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                          title="Decrypt & Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onShareClick(file)}
                          className="p-1.5 rounded-lg bg-surface border border-surfaceBorder text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                          title="Create Secure Share Link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(file.id)}
                          className="p-1.5 rounded-lg bg-surface border border-surfaceBorder text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
