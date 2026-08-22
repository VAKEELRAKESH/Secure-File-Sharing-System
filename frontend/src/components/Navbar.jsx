'use client';
import React from 'react';
import { ShieldCheck, Lock, User, LogOut, Key, AlertTriangle } from 'lucide-react';

export default function Navbar({ user, onOpenMfa, onLogout }) {
  return (
    <header className="w-full glass-panel border-b border-surfaceBorder px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
            TrustShare
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              AES-256 SSE
            </span>
          </h1>
          <p className="text-xs text-slate-400">Enterprise Encrypted Document Platform</p>
        </div>
      </div>

      {user && (
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenMfa}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              user.mfa_enabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{user.mfa_enabled ? '2FA Active' : 'Enable 2FA'}</span>
          </button>

          <div className="flex items-center space-x-2 bg-surface border border-surfaceBorder px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-semibold text-xs border border-blue-500/30">
              {user.username ? user.username[0].toUpperCase() : 'U'}
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200 leading-tight">{user.username}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">{user.role}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
}
