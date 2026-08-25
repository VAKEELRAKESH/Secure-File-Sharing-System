'use client';
import React, { useState, useEffect } from 'react';
import { Shield, Users, HardDrive, Lock, Activity, RefreshCw, UserPlus, Search, Filter, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import EmptyState from '../ui/EmptyState';

export default function AdminConsoleView({ analyticsData, loadingAnalytics, fetchAnalytics }) {
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Add/Invite User Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

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

  const handleInviteUser = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      await api.post('/admin/users', {
        username: newUsername,
        email: newEmail,
        password: newPassword,
        role: newRole
      });

      setInviteSuccess(`User ${newUsername} created successfully with role '${newRole}'!`);
      fetchUsers();
      if (fetchAnalytics) fetchAnalytics();

      setTimeout(() => {
        setShowInviteModal(false);
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('user');
        setInviteSuccess('');
      }, 1500);
    } catch (err) {
      setInviteError(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setInviteLoading(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Invite Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-primary" />
            Admin Console & User Governance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            System-wide user role assignments, encryption statistics, and administrative controls.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
        >
          <UserPlus className="w-4 h-4" /> Invite System User
        </button>
      </div>

      {/* Metrics Row (Unified field references matching API) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-surfaceBorder flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Users</div>
            <div className="text-lg font-bold text-slate-100">{usersList.length || analyticsData?.total_users || 0}</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-surfaceBorder flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Encrypted Files</div>
            <div className="text-lg font-bold text-slate-100">{analyticsData?.total_files || 0}</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-surfaceBorder flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Shares</div>
            <div className="text-lg font-bold text-slate-100">{analyticsData?.active_shares_count || 0}</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-surfaceBorder flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Storage Used</div>
            <div className="text-lg font-bold text-slate-100">
              {((analyticsData?.total_storage_bytes || 0) / (1024 * 1024)).toFixed(2)} MB
            </div>
          </div>
        </div>
      </div>

      {/* Admin Users Table & Toolbar */}
      <div className="glass-panel rounded-2xl border border-surfaceBorder overflow-hidden shadow-xl space-y-0">
        <div className="p-4 border-b border-surfaceBorder bg-surface/40 flex flex-col md:flex-row items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> System User Directory ({filteredUsers.length})
          </h3>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full glass-input rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="glass-input rounded-xl px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="all">All Roles</option>
              <option value="user">Standard User</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
            </select>

            <button
              onClick={() => { fetchUsers(); if (fetchAnalytics) fetchAnalytics(); }}
              className="p-1.5 rounded-lg bg-surface border border-surfaceBorder text-slate-400 hover:text-white"
              title="Refresh User List"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-surface/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-surfaceBorder">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role Permission</th>
                <th className="px-4 py-3">2FA Status</th>
                <th className="px-4 py-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder/50">
              {loadingUsers ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    Loading admin user records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-4">
                    <EmptyState
                      icon={Users}
                      title="No matching users found"
                      description={searchTerm ? `No user accounts matching "${searchTerm}".` : "No registered system users in database."}
                      actionLabel="Invite System User"
                      onAction={() => setShowInviteModal(true)}
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-200 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                        {u.username ? u.username[0].toUpperCase() : 'U'}
                      </div>
                      {u.username}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold border ${
                        u.role === 'admin'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : u.role === 'manager'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-surface border-surfaceBorder text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.mfa_enabled ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-500'
                      }`}>
                        {u.mfa_enabled ? '✓ 2FA Enabled' : 'Off'}
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

      {/* Invite System User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-surfaceBorder rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-surfaceBorder pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" /> Invite / Provision System User
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sec_auditor"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@enterprise.io"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Permission</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="user">Standard User</option>
                  <option value="manager">Security Manager</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              {inviteError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {inviteError}
                </div>
              )}

              {inviteSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {inviteSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface border border-surfaceBorder text-slate-300 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {inviteLoading ? 'Creating User...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
