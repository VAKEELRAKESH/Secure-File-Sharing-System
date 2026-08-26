'use client';
import React, { useState } from 'react';
import { X, Share2, Copy, Check, Lock, Clock, Hash, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';

export default function ShareModal({ file, onClose }) {
  const [permission, setPermission] = useState('download');
  const [passphrase, setPassphrase] = useState('');
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [maxDownloads, setMaxDownloads] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateShare = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      const res = await api.post('/shares', {
        file_id: file.id,
        permission,
        passphrase: passphrase || null,
        expires_in_hours: parseInt(expiresInHours),
        max_downloads: maxDownloads ? parseInt(maxDownloads) : null,
      });

      const fullUrl = `${window.location.origin}${res.data.share_url}`;
      setGeneratedUrl(fullUrl);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate share link');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-surfaceBorder relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">Secure File Sharing</h3>
            <p className="text-xs text-slate-400 truncate max-w-xs">{file.filename}</p>
          </div>
        </div>

        {generatedUrl ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>Share link generated with encrypted access control!</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Shareable Access URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={generatedUrl}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono text-cyan-300"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all flex-shrink-0 shadow-md shadow-blue-500/20"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateShare} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Access Permission</label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="download">Download File Access</option>
                <option value="view">View-Only Access</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Link Expiration</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <select
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(e.target.value)}
                  className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200"
                >
                  <option value={1}>1 Hour</option>
                  <option value={24}>24 Hours (1 Day)</option>
                  <option value={168}>7 Days</option>
                  <option value={720}>30 Days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Passphrase Protection <span className="text-slate-500">(Optional)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="Enter access passphrase"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Max Download Limit <span className="text-slate-500">(Optional)</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="number"
                  placeholder="e.g. 5 downloads max"
                  value={maxDownloads}
                  onChange={(e) => setMaxDownloads(e.target.value)}
                  className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-medium transition-all shadow-md shadow-blue-500/20"
              >
                {isCreating ? 'Generating...' : 'Generate Encrypted Link'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
