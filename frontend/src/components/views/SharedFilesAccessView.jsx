'use client';
import React, { useState, useEffect } from 'react';
import { Share2, Lock, Key, Download, AlertCircle, FileText, CheckCircle, User, Clock, Inbox, Search, Shield, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import EmptyState from '../ui/EmptyState';

export default function SharedFilesAccessView() {
  const [activeSubTab, setActiveSubTab] = useState('received'); // 'received' | 'lookup'
  
  // Received Files State
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [searchReceived, setSearchReceived] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [receivedError, setReceivedError] = useState('');

  // Passphrase modal for received file download
  const [activePassphraseFile, setActivePassphraseFile] = useState(null);
  const [receivedPassphrase, setReceivedPassphrase] = useState('');

  // Public Token Lookup State
  const [token, setToken] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [shareInfo, setShareInfo] = useState(null);
  const [error, setError] = useState('');
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchReceivedFiles();
  }, []);

  const fetchReceivedFiles = async () => {
    setLoadingReceived(true);
    setReceivedError('');
    try {
      const res = await api.get('/shares/received');
      setReceivedFiles(res.data || []);
    } catch (err) {
      setReceivedError(err.response?.data?.detail || 'Failed to fetch received files');
    } finally {
      setLoadingReceived(false);
    }
  };

  const handleDownloadReceived = async (file, pw = null) => {
    if (file.has_passphrase && !pw) {
      setActivePassphraseFile(file);
      return;
    }

    setDownloadingId(file.id);
    setReceivedError('');
    try {
      const res = await api.post(
        `/shares/received/${file.id}/download`,
        { passphrase: pw || undefined },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setActivePassphraseFile(null);
      setReceivedPassphrase('');
    } catch (err) {
      setReceivedError(err.response?.data?.detail || 'Download failed or incorrect passphrase');
    } finally {
      setDownloadingId(null);
    }
  };

  // Extract the raw share token from a full URL or plain token string
  const extractToken = (input) => {
    const trimmed = (input || '').trim();
    const shareMatch = trimmed.match(/\/share\/([A-Za-z0-9_\-]+)\/?$/);
    if (shareMatch) return shareMatch[1];
    return trimmed;
  };

  const handleTokenInput = (e) => {
    const raw = e.target.value;
    setToken(extractToken(raw));
  };

  const fetchShareInfo = async (e) => {
    if (e) e.preventDefault();
    if (!token) return;
    setLoadingInfo(true);
    setError('');
    setShareInfo(null);
    try {
      const res = await api.get(`/shares/access/${token}/info`);
      setShareInfo(res.data);
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 404) {
        setError('Not Found — this share token does not exist. Verify the link was copied correctly.');
      } else if (status === 410) {
        setError(detail || 'This share link has expired or reached its download limit.');
      } else {
        setError(detail || 'Unable to look up share token. Please try again.');
      }
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleDownloadPublic = async (e) => {
    e.preventDefault();
    if (!token) return;
    setDownloading(true);
    setError('');
    try {
      const res = await api.post(
        `/shares/access/${token}/download`,
        { passphrase: passphrase || undefined },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', shareInfo?.filename || 'decrypted_file');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Passphrase incorrect or download limit exceeded');
    } finally {
      setDownloading(false);
    }
  };

  const filteredReceived = receivedFiles.filter(f =>
    f.filename.toLowerCase().includes(searchReceived.toLowerCase()) ||
    f.sender_name.toLowerCase().includes(searchReceived.toLowerCase()) ||
    f.sender_email.toLowerCase().includes(searchReceived.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Inbox className="w-5 h-5 text-primary" />
            Shared Documents Hub
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Access documents shared directly with your account or decrypt external share links.
          </p>
        </div>

        <div className="flex bg-surface rounded-xl p-1 border border-surfaceBorder">
          <button
            onClick={() => setActiveSubTab('received')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'received'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" /> Shared With Me ({receivedFiles.length})
          </button>
          <button
            onClick={() => setActiveSubTab('lookup')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'lookup'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> Lookup Share Link
          </button>
        </div>
      </div>

      {/* TAB 1: SHARED WITH ME */}
      {activeSubTab === 'received' && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-surfaceBorder flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Received</div>
                <div className="text-lg font-bold text-slate-100">{receivedFiles.length}</div>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-surfaceBorder flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Download Access</div>
                <div className="text-lg font-bold text-slate-100">
                  {receivedFiles.filter(f => f.permission === 'download').length}
                </div>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-surfaceBorder flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Protected Shares</div>
                <div className="text-lg font-bold text-slate-100">
                  {receivedFiles.filter(f => f.has_passphrase).length}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Refresh Toolbar */}
          <div className="glass-panel rounded-2xl border border-surfaceBorder overflow-hidden shadow-xl">
            <div className="p-4 border-b border-surfaceBorder bg-surface/40 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search received files or sender..."
                  value={searchReceived}
                  onChange={(e) => setSearchReceived(e.target.value)}
                  className="w-full glass-input rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200"
                />
              </div>

              <button
                onClick={fetchReceivedFiles}
                className="p-1.5 rounded-lg bg-surface border border-surfaceBorder text-slate-400 hover:text-white"
                title="Refresh Received Files"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {receivedError && (
              <div className="m-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {receivedError}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-surface/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-surfaceBorder">
                  <tr>
                    <th className="px-4 py-3">Document Name</th>
                    <th className="px-4 py-3">Shared By</th>
                    <th className="px-4 py-3">Permission</th>
                    <th className="px-4 py-3">Security</th>
                    <th className="px-4 py-3">Expires</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surfaceBorder/50">
                  {loadingReceived ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                        Loading documents shared with you...
                      </td>
                    </tr>
                  ) : filteredReceived.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-4">
                        <EmptyState
                          icon={Inbox}
                          title="No shared documents yet"
                          description="When colleagues share encrypted files directly with your email address, they will appear here."
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredReceived.map((file) => (
                      <tr key={file.id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-200">{file.filename}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {((file.file_size_bytes || 0) / (1024 * 1024)).toFixed(2)} MB • {file.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            {file.sender_name}
                          </div>
                          <div className="text-[10px] text-slate-500">{file.sender_email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                            {file.permission}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {file.has_passphrase ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-1 w-fit">
                              <Key className="w-3 h-3" /> Passphrase
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-surface border border-surfaceBorder text-slate-400">
                              Direct Auth
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-400">
                          {file.expires_at ? new Date(file.expires_at).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDownloadReceived(file)}
                            disabled={downloadingId === file.id}
                            className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-md shadow-primary/20 disabled:opacity-50 transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {downloadingId === file.id ? 'Decrypting...' : 'Decrypt & Download'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Passphrase Prompt Modal */}
          {activePassphraseFile && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel border border-surfaceBorder rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Passphrase Required</h3>
                    <p className="text-[11px] text-slate-400">Enter passphrase to decrypt {activePassphraseFile.filename}</p>
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleDownloadReceived(activePassphraseFile, receivedPassphrase); }} className="space-y-4">
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder="Enter security passphrase"
                    value={receivedPassphrase}
                    onChange={(e) => setReceivedPassphrase(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-200"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setActivePassphraseFile(null); setReceivedPassphrase(''); }}
                      className="px-3 py-1.5 rounded-xl bg-surface border border-surfaceBorder text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={downloadingId === activePassphraseFile.id}
                      className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-semibold shadow-md disabled:opacity-50"
                    >
                      {downloadingId === activePassphraseFile.id ? 'Decrypting...' : 'Decrypt & Download'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PUBLIC LINK LOOKUP */}
      {activeSubTab === 'lookup' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 mx-auto flex items-center justify-center">
              <Share2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Access Shared Encrypted Document</h2>
            <p className="text-xs text-slate-400">
              Enter a valid share token below to retrieve metadata and decrypt the document payload.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-surfaceBorder shadow-xl space-y-4">
            <form onSubmit={fetchShareInfo} className="flex gap-2">
              <input
                type="text"
                required
                value={token}
                onChange={handleTokenInput}
                placeholder="Paste share URL or token (e.g. http://…/share/abc123 or abc123)"
                className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200"
              />
              <button
                type="submit"
                disabled={loadingInfo || !token}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-semibold shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {loadingInfo ? 'Inspecting...' : 'Lookup Share'}
              </button>
            </form>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {shareInfo && (
              <div className="p-5 rounded-xl bg-surface/50 border border-surfaceBorder space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{shareInfo.filename}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Size: {(((shareInfo.file_size_bytes || shareInfo.file_size || 0)) / (1024 * 1024)).toFixed(2)} MB • Algorithm: {shareInfo.encryption_algorithm || 'AES-256-GCM'}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleDownloadPublic} className="space-y-3 pt-2 border-t border-surfaceBorder/60">
                  {(shareInfo.requires_passphrase || shareInfo.passphrase_required) && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Passphrase Required
                      </label>
                      <input
                        type="password"
                        required
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="Enter security passphrase"
                        className="w-full glass-input rounded-xl px-4 py-2 text-xs"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={downloading}
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {downloading ? 'Decrypting File payload...' : 'Decrypt & Download File'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
