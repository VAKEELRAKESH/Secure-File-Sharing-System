'use client';
import React, { useEffect, useState } from 'react';
import { HardDrive, Files, Download, Share2, ShieldAlert, Users, PieChart, Shield } from 'lucide-react';
import api from '../lib/api';

export default function AnalyticsCharts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-500">Loading storage analytics...</div>;
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const getCategoryColor = (categoryName) => {
    switch (categoryName) {
      case 'Document': return { bg: 'bg-primary', text: 'text-primary', badge: 'bg-primary/10 border-primary/20' };
      case 'Image': return { bg: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20' };
      case 'Code': return { bg: 'bg-cyan-500', text: 'text-cyan-400', badge: 'bg-cyan-500/10 border-cyan-500/20' };
      case 'Archive': return { bg: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/20' };
      case 'Video': return { bg: 'bg-purple-500', text: 'text-purple-400', badge: 'bg-purple-500/10 border-purple-500/20' };
      default: return { bg: 'bg-slate-400', text: 'text-slate-300', badge: 'bg-surface border-surfaceBorder' };
    }
  };

  const categoryEntries = Object.entries(data.category_distribution || {});

  return (
    <div className="space-y-6">
      {/* Metric Cards (Unified Single Accent Icon Tiles) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-surfaceBorder flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Encrypted Storage</span>
            <h3 className="text-xl font-bold text-slate-100 mt-1">{formatSize(data.total_storage_bytes)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-inner">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-surfaceBorder flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Protected Files</span>
            <h3 className="text-xl font-bold text-slate-100 mt-1">{data.total_files}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-inner">
            <Files className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-surfaceBorder flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Downloads</span>
            <h3 className="text-xl font-bold text-slate-100 mt-1">{data.total_downloads}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-inner">
            <Download className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-surfaceBorder flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Share Links</span>
            <h3 className="text-xl font-bold text-slate-100 mt-1">{data.active_shares_count}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-inner">
            <Share2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Distribution Breakdown (Equalized Heights) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* File Category Breakdown with Distinct Category Colors */}
        <div className="glass-panel rounded-2xl p-6 border border-surfaceBorder flex flex-col justify-between shadow-md">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-primary" />
              File Category Breakdown
            </h3>

            {categoryEntries.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No category data recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {/* Visual Stacked Multi-Color Segment Bar */}
                <div className="w-full bg-surface h-3 rounded-full overflow-hidden border border-surfaceBorder flex">
                  {categoryEntries.map(([cat, count]) => {
                    const pct = data.total_files ? Math.round((count / data.total_files) * 100) : 0;
                    const style = getCategoryColor(cat);
                    return (
                      <div
                        key={cat}
                        className={`h-full ${style.bg} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                        title={`${cat}: ${count} files (${pct}%)`}
                      />
                    );
                  })}
                </div>

                {/* Per-Category Color Breakdown List */}
                <div className="space-y-3 pt-2">
                  {categoryEntries.map(([cat, count]) => {
                    const pct = data.total_files ? Math.round((count / data.total_files) * 100) : 0;
                    const style = getCategoryColor(cat);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between items-center text-xs text-slate-300">
                          <div className="flex items-center gap-2 font-medium">
                            <span className={`w-2.5 h-2.5 rounded-full ${style.bg}`} />
                            <span>{cat}</span>
                          </div>
                          <span className="font-mono text-xs text-slate-400">{count} files ({pct}%)</span>
                        </div>
                        <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`${style.bg} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Security Overview */}
        <div className="glass-panel rounded-2xl p-6 border border-surfaceBorder flex flex-col justify-between shadow-md">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-primary" />
              System Security Overview
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-surfaceBorder">
                <span className="text-slate-300 font-medium">Total Registered Users</span>
                <span className="font-mono font-bold text-slate-100">{data.total_users}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-surfaceBorder">
                <span className="text-slate-300 font-medium">Encryption Standard</span>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  AES-256-GCM
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-surfaceBorder">
                <span className="text-slate-300 font-medium">Key Management</span>
                <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  Envelope Key AES-256
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-surfaceBorder">
                <span className="text-slate-300 font-medium">Unresolved Threat Alerts</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                  data.security_alerts_count > 0 
                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  {data.security_alerts_count}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surfaceBorder/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Security Status</span>
            <span className="text-emerald-400 font-mono font-semibold">✓ Compliant</span>
          </div>
        </div>

      </div>
    </div>
  );
}
