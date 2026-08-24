'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck, LogOut, Key, User, Settings as SettingsIcon, ChevronDown,
  Bell, Shield, PieChart, Lock, Laptop, FileText, UserCheck
} from 'lucide-react';
import Link from 'next/link';
import NotificationPanel from './NotificationPanel';

export default function Navbar({
  user,
  notifications = [],
  securityAlerts = [],
  onOpenMfa,
  onLogout,
  onNavigateTab
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = securityAlerts.length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full glass-panel border-b border-surfaceBorder px-6 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      {/* Brand Logo & Single Persistent Security Indicator */}
      <Link href="/dashboard" className="flex items-center space-x-3 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
            TrustShare
          </h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium flex items-center gap-1">
            <Lock className="w-3 h-3" /> AES-256 Vault
          </span>
        </div>
      </Link>

      {/* Top-Right Header Controls */}
      {user && (
        <div className="flex items-center space-x-3">
          
          {/* 1. 🔔 Notifications Bell Icon */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileDropdownOpen(false);
              }}
              className={`p-2 rounded-xl border transition-all relative ${
                notificationsOpen
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                  : 'bg-surface border-surfaceBorder text-slate-300 hover:text-white hover:bg-surface/80'
              }`}
              title="Notifications Panel"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <NotificationPanel
                notifications={notifications}
                securityAlerts={securityAlerts}
                onClose={() => setNotificationsOpen(false)}
                onViewAll={() => {
                  if (onNavigateTab) onNavigateTab('audit');
                }}
              />
            )}
          </div>

          {/* 2. ⚙️ Settings Direct Button */}
          <Link
            href="/settings"
            className="p-2 rounded-xl bg-surface border border-surfaceBorder text-slate-300 hover:text-white hover:bg-surface/80 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          {/* 3. T test_hero ▾ Profile Menu Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center space-x-2 bg-surface border border-surfaceBorder px-3 py-1.5 rounded-xl hover:bg-surface/80 transition-all focus:outline-none"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.username}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {user.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-surfaceBorder shadow-2xl py-2 z-50 divide-y divide-surfaceBorder/50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Identity Info */}
                <div className="px-4 py-2 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-200">{user.username}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono uppercase">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email || 'user@trustshare.io'}</p>
                </div>

                {/* Profile Actions */}
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/profile#details"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span>Account Details</span>
                  </Link>

                  <Link
                    href="/settings#security"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors"
                  >
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Security</span>
                  </Link>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (onOpenMfa) onOpenMfa();
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>Enable 2FA</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      user.mfa_enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {user.mfa_enabled ? 'Active' : 'Off'}
                    </span>
                  </button>

                  <Link
                    href="/settings#password"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors"
                  >
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>Change Password</span>
                  </Link>

                  <Link
                    href="/settings#sessions"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors"
                  >
                    <Laptop className="w-4 h-4 text-indigo-400" />
                    <span>Sessions / Devices</span>
                  </Link>
                </div>

                {/* Logout Action */}
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Logout Direct Button */}
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
