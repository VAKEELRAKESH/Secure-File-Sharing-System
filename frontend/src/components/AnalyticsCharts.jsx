'use client';
import React, { useEffect, useState } from 'react';
import { HardDrive, Files, Download, Share2, ShieldAlert, Users, PieChart, BarChart2 } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-surfaceBorder flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Encrypted Storage</span>
            <h3 className="text-xl font-bold text-slate-100 mt-1">{formatSize(data.total_storage_bytes)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-surfaceBorder flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Protected Files</span>
            <h3 className="text-xl font-bold text-slate-100 mt-1">{data.total_files}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Files className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-surfaceBorder flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Downloads</span>
            <h3 className="text-xl font-bold text-slate-100 mt-1">{data.total_downloads}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Download className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-surfaceBorder flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Share Links</span>
            <h3 className="text-xl font-bold text-slate-100 mt-1">{data.active_shares_count}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Share2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-surfaceBorder">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-blue-400" />
            File Category Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(data.category_distribution || {}).map(([cat, count]) => {
              const pct = data.total_files ? Math.round((count / data.total_files) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>{cat}</span>
                    <span className="font-mono text-slate-400">{count} files ({pct}%)</span>
                  </div>
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-surfaceBorder">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            System Security Overview
          </h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-surfaceBorder">
              <span className="text-slate-300">Total System Users</span>
              <span className="font-mono font-bold text-slate-100">{data.total_users}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-surfaceBorder">
              <span className="text-slate-300">Encryption Standard</span>
              <span className="font-mono font-bold text-emerald-400">AES-256-GCM</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-surfaceBorder">
              <span className="text-slate-300">Key Management</span>
              <span className="font-mono font-bold text-cyan-400">Master Envelope AES-256</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-surfaceBorder">
              <span className="text-slate-300">Unresolved Threat Alerts</span>
              <span className={`font-mono font-bold ${data.security_alerts_count > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {data.security_alerts_count}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
