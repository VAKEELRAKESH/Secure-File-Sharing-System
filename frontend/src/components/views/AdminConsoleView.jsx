'use client';
import React, { useState, useEffect } from 'react';
import { Shield, Users, HardDrive, Lock, Activity, RefreshCw } from 'lucide-react';
import api from '../../lib/api';

export default function AdminConsoleView({ analyticsData, loadingAnalytics, fetchAnalytics }) {
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/admin/users');
      setUsersList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch admin users', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-surfaceBorder flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Users</div>
            <div className="text-lg font-bold text-slate-100">{analyticsData?.total_users || usersList.length || 0}</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-surfaceBorder flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Encrypted Files</div>
            <div className="text-lg font-bold text-slate-100">{analyticsData?.total_files || 0}</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-surfaceBorder flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Shares</div>
            <div className="text-lg font-bold text-slate-100">{analyticsData?.active_shares || 0}</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-surfaceBorder flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Storage Used</div>
            <div className="text-lg font-bold text-slate-100">
              {((analyticsData?.total_bytes_stored || 0) / (1024 * 1024)).toFixed(2)} MB
            </div>
          </div>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="glass-panel rounded-2xl border border-surfaceBorder overflow-hidden shadow-xl">
        <div className="p-4 border-b border-surfaceBorder bg-surface/40 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> System User Management & Roles
          </h3>
          <button
            onClick={() => { fetchUsers(); if (fetchAnalytics) fetchAnalytics(); }}
            className="p-1.5 rounded-lg bg-surface border border-surfaceBorder text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-surface/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-surfaceBorder">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">2FA Status</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder/50">
              {loadingUsers ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    Loading admin user records...
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    No users registered in system database.
                  </td>
                </tr>
              ) : (
                usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-200">{u.username}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold border ${
                        u.role === 'admin'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.mfa_enabled ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        {u.mfa_enabled ? '✓ Enabled' : 'Off'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
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
