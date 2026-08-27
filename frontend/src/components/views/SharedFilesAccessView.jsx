'use client';
import React, { useState } from 'react';
import { Share2, Lock, Key, Download, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import api from '../../lib/api';

export default function SharedFilesAccessView() {
  const [token, setToken] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [shareInfo, setShareInfo] = useState(null);
  const [error, setError] = useState('');
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Extract the raw share token from a full URL or plain token string
  const extractToken = (input) => {
    const trimmed = (input || '').trim();
    // Handle full URLs like http://localhost:3000/share/TOKEN or https://domain.com/share/TOKEN
    const shareMatch = trimmed.match(/\/share\/([A-Za-z0-9_\-]+)\/?$/);
    if (shareMatch) return shareMatch[1];
    // Otherwise treat the entire input as a raw token
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

  const handleDownload = async (e) => {
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

  return (
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

            <form onSubmit={handleDownload} className="space-y-3 pt-2 border-t border-surfaceBorder/60">
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
  );
}
