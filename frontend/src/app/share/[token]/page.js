'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, Download, Lock, FileText, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import api from '../../../lib/api';

export default function PublicSharePage() {
  const params = useParams();
  const token = params?.token;

  const [shareInfo, setShareInfo] = useState(null);
  const [passphrase, setPassphrase] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      fetchShareInfo();
    }
  }, [token]);

  const fetchShareInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/shares/access/${token}/info`);
      setShareInfo(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired share link');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    setDownloading(true);
    setError('');

    try {
      const res = await api.post(
        `/shares/access/${token}/download`,
        { passphrase: passphrase || null },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', shareInfo?.filename || 'downloaded_file');
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess('Decrypted file downloaded successfully!');
    } catch (err) {
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          setError(json.detail || 'Download failed');
        } catch {
          setError('Incorrect passphrase or download limit reached');
        }
      } else {
        setError(err.response?.data?.detail || 'Download failed');
      }
    } finally {
      setDownloading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/20 mx-auto mb-4 border border-blue-400/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">TrustShare Protected File</h1>
          <p className="text-xs text-slate-400 mt-1">AES-256 Decryption On-The-Fly Stream</p>
        </div>

        <div className="glass-panel rounded-2xl p-8 border border-surfaceBorder shadow-2xl">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Verifying share security credentials...
            </div>
          ) : error && !shareInfo ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-rose-400 mb-2" />
              <p className="font-semibold">{error}</p>
              <p className="text-slate-400 text-[11px]">This link may have expired or reached its maximum download limit.</p>
            </div>
          ) : (
            <form onSubmit={handleDownload} className="space-y-6">
              <div className="p-4 rounded-xl bg-surface border border-surfaceBorder flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-semibold text-slate-100 truncate">
                    {shareInfo?.filename}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {formatSize(shareInfo?.file_size_bytes)} • {shareInfo?.category}
                  </div>
                </div>
              </div>

              {shareInfo?.expires_at && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
                  <Clock className="w-4 h-4" />
                  <span>Expires: {new Date(shareInfo.expires_at).toLocaleString()}</span>
                </div>
              )}

              {shareInfo?.requires_passphrase && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Enter Passphrase to Decrypt File
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Enter passphrase"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={downloading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {downloading ? (
                  'Decrypting & Preparing Stream...'
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Decrypt & Download File
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="text-center text-[11px] text-slate-500 font-mono">
          AES-256 Server-Side Decrypted Memory Stream • Zero Plaintext Saved
        </div>
      </div>
    </div>
  );
}
