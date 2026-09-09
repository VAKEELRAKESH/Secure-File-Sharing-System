'use client';
import React, { useState, useEffect } from 'react';
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
  Monitor,
  Moon,
  Sun,
  Laptop2,
  Check,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { useTheme } from '../../components/ThemeProvider';
import api from '../../lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Selected Theme in Form (Pending Save)
  const [selectedTheme, setSelectedTheme] = useState(theme || 'dark');
  const [hasThemeChanges, setHasThemeChanges] = useState(false);
  const [themeSaveSuccess, setThemeSaveSuccess] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Active Sessions State
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Preference Toggles
  const [notifSecurity, setNotifSecurity] = useState(true);
  const [notifShares, setNotifShares] = useState(true);
  const [autoPurge, setAutoPurge] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (theme) {
      setSelectedTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await api.get('/auth/sessions');
      setSessions(res.data || []);
    } catch (err) {
      console.error('Failed to load active sessions', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      fetchSessions();
    } catch (err) {
      alert('Failed to revoke session');
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('Are you sure you want to log out all other device sessions?')) return;
    try {
      await api.delete('/auth/sessions');
      fetchSessions();
    } catch (err) {
      alert('Failed to revoke sessions');
    }
  };

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

  const handleSelectTheme = (newTheme) => {
    setSelectedTheme(newTheme);
    setHasThemeChanges(newTheme !== theme);
  };

  const handleSaveThemePreferences = (e) => {
    e.preventDefault();
    if (setTheme) {
      setTheme(selectedTheme);
    }
    setHasThemeChanges(false);
    setThemeSaveSuccess(true);
    setTimeout(() => setThemeSaveSuccess(false), 3500);
  };

  const themeOptions = [
    {
      id: 'dark',
      name: 'Enterprise Dark',
      description: 'High-contrast dark palette engineered for low-light environments and cyber-security focus.',
      icon: Moon,
      tag: 'Recommended',
      preview: {
        bg: '#0F1117',
        surface: '#1E2230',
        border: '#2E3448',
        accent: '#D4764E',
        text: '#F8FAFC',
        muted: '#94A3B8'
      }
    },
    {
      id: 'light',
      name: 'Modern Light',
      description: 'Clean, luminous interface optimized for high-clarity daylight workflows.',
      icon: Sun,
      tag: 'Crisp',
      preview: {
        bg: '#F5F3EE',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        accent: '#C96442',
        text: '#0F172A',
        muted: '#475569'
      }
    }
  ];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surfaceBorder">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                Settings & Preferences
              </h1>
            </div>
            <p className="text-xs text-secondaryText">
              Manage your visual appearance, security credentials, active sessions, and alerts.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Section Quick Sub-Navigation Bar */}
        <nav aria-label="Settings sections" className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold text-secondaryText">
          <a href="#preferences" className="px-3 py-1.5 rounded-xl bg-surface border border-surfaceBorder hover:text-foreground hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary transition-all flex items-center gap-1.5 shrink-0 shadow-sm">
            <Monitor className="w-3.5 h-3.5 text-primary" /> Appearance
          </a>
          <a href="#security" className="px-3 py-1.5 rounded-xl bg-surface border border-surfaceBorder hover:text-foreground hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary transition-all flex items-center gap-1.5 shrink-0 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-primary" /> Security & Sessions
          </a>
          <a href="#password" className="px-3 py-1.5 rounded-xl bg-surface border border-surfaceBorder hover:text-foreground hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary transition-all flex items-center gap-1.5 shrink-0 shadow-sm">
            <Key className="w-3.5 h-3.5 text-primary" /> Password
          </a>
          <a href="#notifications" className="px-3 py-1.5 rounded-xl bg-surface border border-surfaceBorder hover:text-foreground hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary transition-all flex items-center gap-1.5 shrink-0 shadow-sm">
            <Bell className="w-3.5 h-3.5 text-primary" /> Notifications
          </a>
          <a href="#storage" className="px-3 py-1.5 rounded-xl bg-surface border border-surfaceBorder hover:text-foreground hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary transition-all flex items-center gap-1.5 shrink-0 shadow-sm">
            <HardDrive className="w-3.5 h-3.5 text-primary" /> Storage
          </a>
        </nav>

        {/* SECTION 1: APPLICATION PREFERENCES (HIGHEST PRIORITY) */}
        <Card id="preferences" className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-surfaceBorder">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Application Preferences</h2>
                <p className="text-xs text-secondaryText">Choose your interface theme and visual presentation style.</p>
              </div>
            </div>
            <Badge variant="primary">UI Theme</Badge>
          </div>

          <form onSubmit={handleSaveThemePreferences} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                Interface Theme
              </label>
              <p className="text-xs text-secondaryText mb-3">
                Select your preferred visual mode. Changes take effect across your entire workspace.
              </p>

              {/* Theme Selector Cards */}
              <div role="radiogroup" aria-label="Interface theme options" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {themeOptions.map((opt) => {
                  const IconComponent = opt.icon;
                  const isSelected = selectedTheme === opt.id;
                  const isCurrentlyActive = theme === opt.id;

                  return (
                    <div
                      key={opt.id}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => handleSelectTheme(opt.id)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          handleSelectTheme(opt.id);
                        }
                      }}
                      className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 border text-left outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isSelected
                          ? 'bg-primary/5 border-primary ring-1 ring-primary shadow-md'
                          : 'bg-surface hover:bg-surfaceHover border-surfaceBorder hover:border-primary/40 shadow-sm'
                      }`}
                    >
                      {/* Top status indicator & tags */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${
                            isSelected ? 'bg-primary text-white' : 'bg-surfaceBorder/60 text-secondaryText'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-foreground">
                            {opt.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isCurrentlyActive && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Active
                            </span>
                          )}
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-primary text-white ring-2 ring-primary/20 scale-105'
                              : 'border border-surfaceBorder bg-surface'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-secondaryText leading-relaxed mb-3">
                        {opt.description}
                      </p>

                      {/* Micro Theme Preview Strip */}
                      <div
                        className="rounded-lg p-2 border flex items-center justify-between text-[10px] font-mono shadow-inner"
                        style={{
                          backgroundColor: opt.preview.bg,
                          borderColor: opt.preview.border,
                          color: opt.preview.text
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.preview.accent }}></div>
                          <span style={{ color: opt.preview.text }} className="font-semibold">Vault Preview</span>
                        </div>
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                          style={{
                            backgroundColor: `${opt.preview.accent}20`,
                            color: opt.preview.accent,
                            border: `1px solid ${opt.preview.accent}40`
                          }}
                        >
                          AES-256
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save & Feedback Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-surfaceBorder">
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!hasThemeChanges}
                  icon={CheckCircle}
                >
                  Save Preferences
                </Button>
                {hasThemeChanges && (
                  <span className="text-xs text-amber-500 font-medium">
                    • Unsaved changes pending
                  </span>
                )}
              </div>

              {themeSaveSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg animate-fadeIn">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Preferences saved and applied successfully!</span>
                </div>
              )}
            </div>
          </form>
        </Card>

        {/* SECTION 2: SECURITY & SESSIONS */}
        <Card id="security" className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-surfaceBorder">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Security Settings</h2>
              <p className="text-xs text-secondaryText">Password credentials, active devices, and session controls.</p>
            </div>
          </div>

          {/* Change Password Form */}
          <div id="password" className="space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Change Password
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

              <div className="md:col-span-3 pt-1">
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
          <div id="sessions" className="pt-4 border-t border-surfaceBorder space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Laptop className="w-4 h-4 text-primary" />
                Active Sessions & Connected Devices ({sessions.length})
              </h3>
              {sessions.length > 1 && (
                <button
                  type="button"
                  onClick={handleRevokeAllSessions}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold transition-colors"
                >
                  Log out all other devices
                </button>
              )}
            </div>

            {loadingSessions ? (
              <div className="text-xs text-secondaryText py-3 text-center">Loading device sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-surface border border-surfaceBorder flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">Current Session</div>
                    <div className="text-[11px] text-secondaryText">Authenticated via Secure JWT</div>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((sess, idx) => (
                  <div key={sess.id} className="p-3 rounded-xl bg-surface border border-surfaceBorder flex items-center justify-between shadow-sm hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                          <span>{sess.device_info || 'Browser Session'}</span>
                          {idx === 0 && <Badge variant="success">Current</Badge>}
                        </div>
                        <div className="text-[10px] text-secondaryText font-mono mt-0.5">
                          IP: {sess.ip_address || '127.0.0.1'} • Started: {new Date(sess.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {idx !== 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(sess.id)}
                        className="text-rose-500 hover:text-rose-600 text-xs"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* SECTION 3: NOTIFICATION PREFERENCES */}
        <Card id="notifications" className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-surfaceBorder">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Notification Preferences</h2>
              <p className="text-xs text-secondaryText">Configure security alerts and share access activity notifications.</p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-surfaceBorder hover:border-primary/30 cursor-pointer transition-all shadow-sm">
              <div className="pr-4">
                <span className="text-xs font-semibold text-foreground block">Critical Security Alerts</span>
                <span className="text-[11px] text-secondaryText">Receive instant notifications on failed authentication attempts or access violations.</span>
              </div>
              <input
                type="checkbox"
                checked={notifSecurity}
                onChange={(e) => setNotifSecurity(e.target.checked)}
                className="w-4 h-4 rounded border-surfaceBorder text-primary focus:ring-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-surfaceBorder hover:border-primary/30 cursor-pointer transition-all shadow-sm">
              <div className="pr-4">
                <span className="text-xs font-semibold text-foreground block">Share Access Activity</span>
                <span className="text-[11px] text-secondaryText">Receive notification logs when a recipient downloads a shared file.</span>
              </div>
              <input
                type="checkbox"
                checked={notifShares}
                onChange={(e) => setNotifShares(e.target.checked)}
                className="w-4 h-4 rounded border-surfaceBorder text-primary focus:ring-primary cursor-pointer"
              />
            </label>
          </div>
        </Card>

        {/* SECTION 4: STORAGE & ENCRYPTION POLICIES */}
        <Card id="storage" className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-surfaceBorder">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Storage & Encryption Policies</h2>
              <p className="text-xs text-secondaryText">Server-side cryptographic parameters and automated lifecycle rules.</p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-surfaceBorder shadow-sm">
              <div>
                <span className="text-xs font-semibold text-foreground block">Default Cryptographic Cipher</span>
                <span className="text-[11px] text-secondaryText">Server-side AES-256-GCM with envelope key encryption (DEK/KEK).</span>
              </div>
              <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-mono px-2.5 py-1 rounded-lg font-bold">
                <Lock className="w-3 h-3" />
                <span>AES-256-GCM</span>
              </div>
            </div>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-surfaceBorder hover:border-primary/30 cursor-pointer transition-all shadow-sm">
              <div className="pr-4">
                <span className="text-xs font-semibold text-foreground block">Auto-Purge Expired Share Links</span>
                <span className="text-[11px] text-secondaryText">Automatically remove share tokens and cryptographic handles once expired.</span>
              </div>
              <input
                type="checkbox"
                checked={autoPurge}
                onChange={(e) => setAutoPurge(e.target.checked)}
                className="w-4 h-4 rounded border-surfaceBorder text-primary focus:ring-primary cursor-pointer"
              />
            </label>
          </div>
        </Card>

      </div>
    </AppLayout>
  );
}
