'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Files, UploadCloud, Share2, Activity, PieChart, Search, Filter,
  Download, Trash2, Shield, Lock, ExternalLink, RefreshCw, FolderPlus, Tag,
  Bell, AlertTriangle
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import FileUploader from '../../components/FileUploader';
import ShareModal from '../../components/ShareModal';
import MfaModal from '../../components/MfaModal';
import AuditLogTable from '../../components/AuditLogTable';
import AnalyticsCharts from '../../components/AnalyticsCharts';
import api from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('files');
  
  // Files State
  const [filesList, setFilesList] = useState([]);
  const [sharesList, setSharesList] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(true);
  
  // Modals State
  const [selectedShareFile, setSelectedShareFile] = useState(null);
  const [showMfaModal, setShowMfaModal] = useState(false);

  // New Integration States (for file-management-frontend)
  // Shared Files states
  const [shareLinkToken, setShareLinkToken] = useState('');
  const [shareLinkPassphrase, setShareLinkPassphrase] = useState('');
  const [shareInfo, setShareInfo] = useState(null);
  const [shareError, setShareError] = useState('');
  const [loadingShareInfo, setLoadingShareInfo] = useState(false);
  const [downloadingSharedFile, setDownloadingSharedFile] = useState(false);

  // Notifications states
  const [notificationsList, setNotificationsList] = useState([]);
  const [securityAlertsList, setSecurityAlertsList] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Admin Console states
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('trustshare_user');
    const token = localStorage.getItem('trustshare_access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    fetchProfile();
    fetchFiles();
    fetchShares();
    fetchNotifications();
    fetchAnalytics();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('trustshare_user', JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await api.get('/files', {
        params: {
          search: search || undefined,
          category: categoryFilter || undefined,
        },
      });
      setFilesList(res.data);
    } catch (err) {
      console.error('Failed to fetch files', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const fetchShares = async () => {
    try {
      const res = await api.get('/shares');
      setSharesList(res.data);
    } catch (err) {
      console.error('Failed to fetch shares', err);
    }
  };

  // Integration fetchers
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const [logsRes, alertsRes] = await Promise.all([
        api.get('/audit/logs'),
        api.get('/audit/alerts'),
      ]);
      setNotificationsList(logsRes.data || []);
      setSecurityAlertsList(alertsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await api.get('/analytics');
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchShareInfo = async () => {
    if (!shareLinkToken) return;
    setLoadingShareInfo(true);
    setShareError('');
    setShareInfo(null);
    try {
      const res = await api.get(`/shares/access/${shareLinkToken}/info`);
      setShareInfo(res.data);
    } catch (err) {
      setShareError(err.response?.data?.detail || 'Invalid or expired share link token');
    } finally {
      setLoadingShareInfo(false);
    }
  };

  const handleSharedDownload = async (e) => {
    e.preventDefault();
    if (!shareLinkToken) return;
    setDownloadingSharedFile(true);
    setShareError('');
    try {
      const res = await api.post(`/shares/access/${shareLinkToken}/download`, {
        passphrase: shareLinkPassphrase || undefined
      }, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', shareInfo?.filename || 'downloaded_file');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setShareError('Passphrase incorrect or download limit exceeded');
    } finally {
      setDownloadingSharedFile(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await api.get(`/files/${file.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download decrypted file');
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file from encrypted storage?')) return;
    try {
      await api.delete(`/files/${fileId}`);
      fetchFiles();
      fetchProfile();
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('trustshare_access_token');
    localStorage.removeItem('trustshare_user');
    router.push('/login');
  };

  const formatSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        user={user}
        onOpenMfa={() => setShowMfaModal(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-surfaceBorder mb-8 overflow-x-auto space-x-2">
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'files'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Files className="w-4 h-4" />
            <span>Files & Storage ({filesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Secure Upload</span>
          </button>

          <button
            onClick={() => setActiveTab('shares')}
            className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'shares'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Active Shares ({sharesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shared_files')}
            className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'shared_files'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Shared Files</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Bell className="w-4 h-4" />
              {securityAlertsList.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </div>
            <span>Notifications</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin_console')}
              className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'admin_console'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Admin Console</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Analytics Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit & Threat Logging</span>
          </button>
        </div>

        {/* TAB 1: FILES & STORAGE */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search encrypted documents..."
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
                  className="p-2 rounded-xl bg-surface border border-surfaceBorder text-slate-400 hover:text-white"
                  title="Refresh Files"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setActiveTab('upload')}
                className="w-full md:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <UploadCloud className="w-4 h-4" /> Upload New File
              </button>
            </div>

            {/* Files Grid / Table */}
            <div className="glass-panel rounded-2xl border border-surfaceBorder overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-surface/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-surfaceBorder">
                    <tr>
                      <th className="px-4 py-3">File Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Encryption</th>
                      <th className="px-4 py-3">Uploaded</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surfaceBorder/50">
                    {loadingFiles ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                          Fetching encrypted file records...
                        </td>
                      </tr>
                    ) : filesList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-12 text-center text-slate-500">
                          No files found. Click "Upload New File" to add encrypted documents.
                        </td>
                      </tr>
                    ) : (
                      filesList.map((file) => (
                        <tr key={file.id} className="hover:bg-surface/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-100 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-cyan-400" />
                            <div>
                              <div>{file.filename}</div>
                              {file.tags && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Tags: {file.tags}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                              {file.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-400">{formatSize(file.file_size_bytes)}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                              AES-256-GCM
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                            {new Date(file.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              onClick={() => handleDownload(file)}
                              className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 transition-all"
                              title="Decrypt & Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedShareFile(file)}
                              className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600 hover:text-white border border-cyan-500/30 transition-all"
                              title="Generate Share Link"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(file.id)}
                              className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition-all"
                              title="Delete File"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SECURE UPLOAD */}
        {activeTab === 'upload' && (
          <FileUploader
            onUploadSuccess={() => {
              fetchFiles();
              fetchProfile();
              setActiveTab('files');
            }}
          />
        )}

        {/* TAB 3: ACTIVE SHARES */}
        {activeTab === 'shares' && (
          <div className="glass-panel rounded-2xl p-6 border border-surfaceBorder">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2 mb-6">
              <Share2 className="w-5 h-5 text-blue-400" />
              Active Share Links & Permissions
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-surface/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-surfaceBorder">
                  <tr>
                    <th className="px-4 py-3">Share Token</th>
                    <th className="px-4 py-3">Permission</th>
                    <th className="px-4 py-3">Password Protected</th>
                    <th className="px-4 py-3">Downloads</th>
                    <th className="px-4 py-3">Expires At</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surfaceBorder/50">
                  {sharesList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                        No active share links created yet.
                      </td>
                    </tr>
                  ) : (
                    sharesList.map((share) => (
                      <tr key={share.id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-cyan-300">
                          <a
                            href={share.share_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 hover:underline"
                          >
                            {share.share_token.slice(0, 16)}... <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="px-4 py-3 uppercase text-[10px] font-semibold text-slate-200">
                          {share.permission}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {share.has_passphrase ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Yes
                            </span>
                          ) : (
                            <span className="text-slate-500">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-400">
                          {share.download_count} / {share.max_downloads || '∞'}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-400">
                          {share.expires_at ? new Date(share.expires_at).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={async () => {
                              await api.delete(`/shares/${share.id}`);
                              fetchShares();
                            }}
                            className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-[10px]"
                          >
                            Revoke Link
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SHARED FILES (INTEGRATED) */}
        {activeTab === 'shared_files' && (
          <div className="space-y-8">
            {/* Direct access block */}
            <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 bg-cyan-500/5">
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-cyan-400" />
                Access Shared File Direct Code
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                If someone shared a TrustShare file token with you, enter the token and optional password here to decrypt and retrieve it.
              </p>

              <div className="flex flex-col md:flex-row gap-4 items-end max-w-3xl">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Share Token</label>
                  <input
                    type="text"
                    placeholder="e.g. pMhctdBrRM5U36MLhmhI..."
                    value={shareLinkToken}
                    onChange={(e) => setShareLinkToken(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchShareInfo}
                  disabled={loadingShareInfo || !shareLinkToken}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {loadingShareInfo ? 'Verifying...' : 'Verify Share Link'}
                </button>
              </div>

              {shareError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{shareError}</span>
                </div>
              )}

              {shareInfo && (
                <form onSubmit={handleSharedDownload} className="mt-6 p-5 rounded-2xl bg-surface/50 border border-surfaceBorder space-y-4 max-w-3xl">
                  <div className="flex justify-between items-start border-b border-surfaceBorder/50 pb-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{shareInfo.filename}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Category: <span className="text-cyan-400">{shareInfo.category}</span> • Size: {formatSize(shareInfo.file_size_bytes)}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                      AES-256 Protected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
                    <div>Permission: <span className="font-semibold text-slate-200 uppercase">{shareInfo.permission}</span></div>
                    <div>Downloads: <span className="font-semibold text-slate-200">{shareInfo.download_count} / {shareInfo.max_downloads || 'Unlimited'}</span></div>
                    <div>Expires At: <span className="font-semibold text-slate-200">{shareInfo.expires_at ? new Date(shareInfo.expires_at).toLocaleString() : 'Never'}</span></div>
                  </div>

                  {shareInfo.requires_passphrase && (
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-slate-400">Passphrase Required</label>
                      <input
                        type="password"
                        placeholder="Enter the secure share passphrase"
                        value={shareLinkPassphrase}
                        onChange={(e) => setShareLinkPassphrase(e.target.value)}
                        className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-200"
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={downloadingSharedFile}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> {downloadingSharedFile ? 'Decrypting & Downloading...' : 'Decrypt & Download File'}
                  </button>
                </form>
              )}
            </div>

            {/* Files Shared With You section */}
            <div>
              <h3 className="text-base font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-400" />
                Files Shared With You
              </h3>
              <div className="glass-panel rounded-2xl p-8 border border-surfaceBorder text-center">
                <p className="text-xs text-slate-400">
                  No files have been shared with you directly. You can use the Access Shared File Direct Code panel above to retrieve shared documents.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: NOTIFICATIONS (INTEGRATED) */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                Notification & Alert Center
              </h2>
              <button
                onClick={fetchNotifications}
                className="p-2 rounded-xl bg-surface border border-surfaceBorder text-slate-400 hover:text-white"
                title="Refresh Notifications"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Critical Security Alerts Banner */}
            {securityAlertsList.filter(a => !a.is_resolved).length > 0 && (
              <div className="glass-panel rounded-2xl p-5 border border-rose-500/30 bg-rose-500/5 animate-pulse">
                <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  Active Threat Detections!
                </h3>
                <p className="text-xs text-rose-300">
                  The threat monitoring system has detected {securityAlertsList.filter(a => !a.is_resolved).length} unresolved security alert(s). Please review system audit logs immediately.
                </p>
              </div>
            )}

            {/* Notifications List */}
            <div className="glass-panel rounded-2xl p-6 border border-surfaceBorder space-y-4">
              {loadingNotifications ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Fetching recent activities and alert notifications...
                </div>
              ) : notificationsList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No system notifications active at this time.
                </div>
              ) : (
                <div className="divide-y divide-surfaceBorder/30 font-sans">
                  {notificationsList.slice(0, 10).map((log) => {
                    // Map log action to friendly notification title
                    let title = 'System Activity';
                    let desc = log.details || '';
                    if (log.action === 'UPLOAD') {
                      title = 'File Uploaded';
                      desc = `File was encrypted with AES-256 and uploaded.`;
                    } else if (log.action === 'LOGIN') {
                      title = 'Successful Session Auth';
                      desc = 'User logged in successfully.';
                    } else if (log.action === 'REGISTER') {
                      title = 'New Account Created';
                      desc = 'A new user joined the system.';
                    } else if (log.action === 'CREATE_SHARE') {
                      title = 'Share Link Generated';
                      desc = 'A password-protected temporary link was generated.';
                    } else if (log.action === 'SHARED_FILE_DOWNLOAD') {
                      title = 'Shared Link Downloaded';
                      desc = 'Someone accessed and downloaded a shared file.';
                    }

                    return (
                      <div key={log.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                            log.status === 'SUCCESS'
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-100">{title}</h4>
                            <p className="text-xs text-slate-400 mt-1">{desc}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">
                              IP: {log.ip_address} • Status: {log.status}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: ADMIN CONSOLE (INTEGRATED) */}
        {activeTab === 'admin_console' && user?.role === 'admin' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  System Administrative Console
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Global management, system stats, encryption keys, and security logs overview.
                </p>
              </div>
              <button
                onClick={fetchAnalytics}
                className="p-2 rounded-xl bg-surface border border-surfaceBorder text-slate-400 hover:text-white"
                title="Refresh Admin Stats"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics */}
            {loadingAnalytics || !analyticsData ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Fetching system stats...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass-panel rounded-2xl p-5 border border-surfaceBorder">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Users</span>
                    <h3 className="text-2xl font-bold text-slate-100 mt-1">{analyticsData.total_users}</h3>
                  </div>
                  <div className="glass-panel rounded-2xl p-5 border border-surfaceBorder">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Files</span>
                    <h3 className="text-2xl font-bold text-slate-100 mt-1">{analyticsData.total_files}</h3>
                  </div>
                  <div className="glass-panel rounded-2xl p-5 border border-surfaceBorder">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Storage</span>
                    <h3 className="text-2xl font-bold text-slate-100 mt-1">{formatSize(analyticsData.total_storage_bytes)}</h3>
                  </div>
                  <div className="glass-panel rounded-2xl p-5 border border-surfaceBorder">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Security Alerts</span>
                    <h3 className={`text-2xl font-bold mt-1 ${analyticsData.security_alerts_count > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {analyticsData.security_alerts_count} Active
                    </h3>
                  </div>
                </div>

                {/* Storage Card Info */}
                <div className="glass-panel rounded-2xl p-6 border border-surfaceBorder">
                  <h3 className="text-sm font-semibold text-slate-200 mb-4">Storage Capacity Overview</h3>
                  <div className="flex justify-between text-xs text-slate-300 mb-2">
                    <span>Used Storage: {formatSize(analyticsData.total_storage_bytes)}</span>
                    <span className="font-mono text-slate-400">Total Allocatable: 100 GB</span>
                  </div>
                  <div className="w-full bg-surface h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (analyticsData.total_storage_bytes / (100 * 1024 * 1024 * 1024)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Recent Activities list */}
                <div className="glass-panel rounded-2xl p-6 border border-surfaceBorder">
                  <h3 className="text-sm font-semibold text-slate-200 mb-4">Recent System Activities</h3>
                  <div className="space-y-4">
                    {analyticsData.recent_activity?.map((act) => (
                      <div key={act.id} className="flex justify-between items-center text-xs border-b border-surfaceBorder/30 pb-3 last:border-none last:pb-0">
                        <div>
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[10px] mr-2">
                            {act.action}
                          </span>
                          <span className="text-slate-300">{act.details || 'System Action'}</span>
                        </div>
                        <span className="text-slate-500 text-[10px]">
                          {new Date(act.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 4: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && <AnalyticsCharts />}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === 'audit' && <AuditLogTable />}
      </main>

      {/* Share Modal */}
      {selectedShareFile && (
        <ShareModal
          file={selectedShareFile}
          onClose={() => {
            setSelectedShareFile(null);
            fetchShares();
          }}
        />
      )}

      {/* MFA Modal */}
      {showMfaModal && (
        <MfaModal
          onClose={() => setShowMfaModal(false)}
          onMfaEnabled={() => fetchProfile()}
        />
      )}
    </div>
  );
}
