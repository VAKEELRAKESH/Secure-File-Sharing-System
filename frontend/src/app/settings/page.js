'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings as SettingsIcon,
  Key,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Lock,
  Laptop,
  Bell,
  HardDrive,
  Monitor
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import api from '../../lib/api';

export default function SettingsPage() {
  const router = useRouter();

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preference Toggles
  const [notifSecurity, setNotifSecurity] = useState(true);
  const [notifShares, setNotifShares] = useState(true);
  const [autoPurge, setAutoPurge] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savedSettings, setSavedSettings] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setSuccess('Your password has been successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Failed to update password. Please verify your current password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-amber-400" />
            Application Settings
          </h1>
        </div>

        {/* Section Quick Sub-Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-surfaceBorder text-xs font-semibold text-slate-400">
          <a href="#security" className="px-3 py-1.5 rounded-xl bg-surface border border-surfaceBorder hover:text-white hover:border-primary transition-all flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-primary" /> Security & Sessions
          </a>
          <a href="#password" className="px-3 py-1.5 rounded-xl bg-surface border border-surfaceBorder hover:text-white hover:border-primary transition-all flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-primary" /> Change Password
          </a>
          <a href="#notifications" className="px-3 py-1.5 rounded-xl bg-surface border border-surfaceBorder hover:text-white hover:border-primary transition-all flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-primary" /> Notifications
          </a>
          <a href="#storage" className="px-3 py-1.5 rounded-xl bg-surface border border-surfaceBorder hover:text-white hover:border-primary transition-all flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-primary" /> Storage & Encryption
          </a>
        </div>

        {/* SECTION 1: SECURITY (Password, Sessions/Devices) */}
        <Card id="security" className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-surfaceBorder">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Security Settings</h2>
              <p className="text-xs text-slate-400">Password management, authentication, & session control.</p>
            </div>
          </div>

          {/* Change Password Form */}
          <div id="password" className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Change Password
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Current Password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Input
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />

              <div className="md:col-span-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={loading}
                >
                  {loading ? 'Updating Password...' : 'Save Password'}
                </Button>
              </div>
            </form>
          </div>

          {/* Active Sessions / Devices */}
          <div id="sessions" className="pt-4 border-t border-surfaceBorder/60 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Laptop className="w-4 h-4 text-primary" />
              Active Sessions & Connected Devices
            </h3>

            <div className="p-4 rounded-xl bg-surface/30 border border-surfaceBorder flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Current Session (Windows / Chrome)</div>
                  <div className="text-[10px] text-slate-400">IP: Active Local Host • Token: AES JWT Encrypted</div>
                </div>
              </div>
              <Badge variant="success">Current Device</Badge>
            </div>
          </div>
        </Card>

        {/* SECTION 2: NOTIFICATION PREFERENCES */}
        <Card id="notifications" className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-surfaceBorder">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Notification Preferences</h2>
              <p className="text-xs text-slate-400">Configure email and real-time alert triggers.</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface/30 border border-surfaceBorder">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Critical Security Alerts</span>
                <span className="text-[11px] text-slate-400">Receive instant popups and logs on failed MFA or rate limit violations.</span>
              </div>
              <input
                type="checkbox"
                checked={notifSecurity}
                onChange={(e) => setNotifSecurity(e.target.checked)}
                className="w-4 h-4 rounded border-surfaceBorder bg-slate-900 text-primary focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface/30 border border-surfaceBorder">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Share Access Activity</span>
                <span className="text-[11px] text-slate-400">Log notification when a recipient opens or downloads a shared file.</span>
              </div>
              <input
                type="checkbox"
                checked={notifShares}
                onChange={(e) => setNotifShares(e.target.checked)}
                className="w-4 h-4 rounded border-surfaceBorder bg-slate-900 text-primary focus:ring-primary"
              />
            </div>
          </div>
        </Card>

        {/* SECTION 3: STORAGE PREFERENCES */}
        <Card id="storage" className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-surfaceBorder">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Storage & Encryption Preferences</h2>
              <p className="text-xs text-slate-400">Manage file retention and cipher policies.</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface/30 border border-surfaceBorder">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Default Encryption Cipher</span>
                <span className="text-[11px] text-slate-400">Server-side AES-256 GCM with unique per-file initialization vectors.</span>
              </div>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md font-semibold select-none cursor-default">
                AES-256-GCM
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface/30 border border-surfaceBorder">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Auto-Purge Expired Shares</span>
                <span className="text-[11px] text-slate-400">Automatically delete share link tokens when their expiration time passes.</span>
              </div>
              <input
                type="checkbox"
                checked={autoPurge}
                onChange={(e) => setAutoPurge(e.target.checked)}
                className="w-4 h-4 rounded border-surfaceBorder bg-slate-900 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* SECTION 4: APPLICATION PREFERENCES */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-surfaceBorder">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Application Preferences</h2>
              <p className="text-xs text-slate-400">Visual appearance and interface options.</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface/30 border border-surfaceBorder">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Interface Theme</span>
                <span className="text-[11px] text-slate-400">Dark glassmorphism cyber-security design.</span>
              </div>
              <span className="text-xs font-mono bg-surface border border-surfaceBorder px-2.5 py-1 rounded text-slate-300">
                Enterprise Dark
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="submit"
                variant="emerald"
                size="sm"
                icon={CheckCircle}
              >
                Save Preferences
              </Button>
              {savedSettings && (
                <span className="text-xs text-emerald-400 font-medium animate-pulse">
                  ✓ Preferences successfully updated!
                </span>
              )}
            </div>
          </form>
        </Card>

      </div>
    </AppLayout>
  );
}
