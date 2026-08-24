'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Mail, Shield, Key, ArrowLeft, CheckCircle, Sliders, Database } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Local preferences state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [securityAlertsOpt, setSecurityAlertsOpt] = useState(true);
  const [prefSaved, setPrefSaved] = useState(false);

  const savePreferences = (e) => {
    e.preventDefault();
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 3000);
  };

  return (
    <AppLayout onRefreshUser={(u) => setUser(u)}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-400" />
            User Profile & Identity
          </h1>
        </div>

        {/* Identity & Profile Information */}
        <Card className="p-0 overflow-hidden">
          <div className="bg-surface/50 border-b border-surfaceBorder p-6 md:p-8 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg text-white text-3xl font-bold border-2 border-blue-400/30">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-100">
                  {user?.username || 'test_hero'}
                </h2>
                <Badge variant={user?.role === 'admin' ? 'admin' : 'info'}>
                  {user?.role || 'user'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">{user?.email || 'user@trustshare.io'}</p>
              <div className="mt-3">
                <Badge variant="success" className="gap-1 px-2.5 py-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Active Verified Account
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8 space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Profile Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-200 bg-surface/40 p-3 rounded-xl border border-surfaceBorder">
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  {user?.username || 'test_hero'}
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-200 bg-surface/40 p-3 rounded-xl border border-surfaceBorder">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  {user?.email || 'user@trustshare.io'}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Assigned Role
                </label>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-200 bg-surface/40 p-3 rounded-xl border border-surfaceBorder">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="capitalize">{user?.role || 'standard user'}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Details & Metadata Summary */}
        <Card id="details">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-purple-400" />
            Account Details & Security Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-surface/30 border border-surfaceBorder">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">2FA Authentication</span>
              <Badge variant={user?.mfa_enabled ? 'success' : 'warning'} className="mt-1">
                {user?.mfa_enabled ? '✓ Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="p-4 rounded-xl bg-surface/30 border border-surfaceBorder">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Encryption Protocol</span>
              <span className="text-slate-200 font-semibold mt-1 inline-block">AES-256-GCM Server-Side</span>
            </div>
            <div className="p-4 rounded-xl bg-surface/30 border border-surfaceBorder">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Status</span>
              <Badge variant="success" className="mt-1">Active & Compliant</Badge>
            </div>
          </div>
        </Card>

        {/* Account Preferences */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Account Preferences
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Customize your personal alert and viewing preferences.</p>
            </div>
            {prefSaved && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={savePreferences} className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface/30 border border-surfaceBorder">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Security Alert Emails</span>
                <span className="text-[11px] text-slate-400">Receive instant notifications on unknown login attempts or policy violations.</span>
              </div>
              <input
                type="checkbox"
                checked={securityAlertsOpt}
                onChange={(e) => setSecurityAlertsOpt(e.target.checked)}
                className="w-4 h-4 rounded border-surfaceBorder bg-slate-900 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface/30 border border-surfaceBorder">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Activity Summary Digest</span>
                <span className="text-[11px] text-slate-400">Weekly email breakdown of shared file views and download counts.</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="w-4 h-4 rounded border-surfaceBorder bg-slate-900 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm">
                Save Preferences
              </Button>
            </div>
          </form>
        </Card>

      </div>
    </AppLayout>
  );
}
