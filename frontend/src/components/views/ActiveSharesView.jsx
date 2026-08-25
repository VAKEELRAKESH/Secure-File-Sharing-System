'use client';
import React, { useState } from 'react';
import { Share2, Key, Copy, Check, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import EmptyState from '../ui/EmptyState';

export default function ActiveSharesView({ sharesList = [], fetchShares }) {
  const [copiedToken, setCopiedToken] = useState(null);

  const handleCopyLink = (token) => {
    const shareUrl = `${window.location.origin}/dashboard?shareToken=${token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevokeShare = async (shareId) => {
    if (!confirm('Are you sure you want to revoke access to this share link?')) return;
    try {
      await api.delete(`/shares/${shareId}`);
      if (fetchShares) fetchShares();
    } catch (err) {
      alert('Failed to revoke share link');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-primary" />
            Active Shares
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono font-semibold">
              {sharesList.length} active
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Share links created by you for recipients. Manage permissions, passphrases, and access revocation.
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-surfaceBorder overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-surface/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-surfaceBorder">
              <tr>
                <th className="px-4 py-3">Share Token</th>
                <th className="px-4 py-3">Protection</th>
                <th className="px-4 py-3">Downloads</th>
                <th className="px-4 py-3">Expires At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder/50">
              {sharesList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-4">
                    <EmptyState
                      icon={Share2}
                      title="No active share links"
                      description="Click the share icon on any file in your vault to generate an encrypted share link."
                    />
                  </td>
                </tr>
              ) : (
                sharesList.map((share) => {
                  const token = share.share_token || share.token;
                  return (
                    <tr key={share.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-primary font-medium truncate max-w-xs">
                        {token}
                      </td>
                      <td className="px-4 py-3">
                        {share.has_passphrase || share.passphrase_protected ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-1 w-fit">
                            <Key className="w-3 h-3" /> Passphrase
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-surface border border-surfaceBorder text-slate-400">
                            Direct Link
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {share.download_count} / {share.max_downloads || '∞'}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {share.expires_at ? new Date(share.expires_at).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleCopyLink(token)}
                            className="p-1.5 rounded-lg bg-surface border border-surfaceBorder text-primary hover:text-primaryHover transition-colors"
                            title="Copy Share Link"
                          >
                            {copiedToken === token ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRevokeShare(share.id)}
                            className="p-1.5 rounded-lg bg-surface border border-surfaceBorder text-rose-400 hover:text-rose-300 transition-colors"
                            title="Revoke Share Link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
