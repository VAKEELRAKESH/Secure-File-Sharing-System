'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, User as UserIcon, Key, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [mfaCode, setMfaCode] = useState('');
  const [needsMfa, setNeedsMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isRegister) {
        await api.post('/auth/register', { username, email, password, role });
        setSuccess('Account created successfully! Switching to login...');
        setTimeout(() => {
          setIsRegister(false);
          setSuccess('');
        }, 1500);
      } else {
        const res = await api.post('/auth/login', {
          email,
          password,
          mfa_code: mfaCode || null,
        });

        localStorage.setItem('trustshare_access_token', res.data.access_token);
        localStorage.setItem('trustshare_user', JSON.stringify(res.data.user));
        router.push('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Authentication failed';
      if (msg.includes('MFA verification code required')) {
        setNeedsMfa(true);
        setError('2FA Code required for this account.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/20 mx-auto mb-4 border border-blue-400/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">TrustShare Platform</h1>
          <p className="text-xs text-slate-400 mt-1">AES-256 Server-Side Encrypted File Management & Sharing</p>
        </div>

        {/* Auth Form Card */}
        <div className="glass-panel rounded-2xl p-8 border border-surfaceBorder shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-surface rounded-xl p-1 mb-6 border border-surfaceBorder">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); setNeedsMfa(false); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isRegister ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); setNeedsMfa(false); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isRegister ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="john_doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="user@trustshare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role Permission</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-slate-200"
                >
                  <option value="user">Standard User</option>
                  <option value="manager">Security Manager</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
            )}

            {needsMfa && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <label className="block text-xs font-semibold text-amber-300 mb-1">2FA Authenticator Code</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-sm font-mono text-white"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Processing...'
              ) : isRegister ? (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Sign In to TrustShare <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        {/* Forgot Password Link */}
        {!isRegister && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/forgot-password')}
              className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="text-center text-[11px] text-slate-500 font-mono">
          AES-256 Envelope Key Encryption • OAuth2 • JWT • Audit Trail Log
        </div>
      </div>
    </div>
  );
}
