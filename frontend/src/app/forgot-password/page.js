'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Key, Lock, ArrowLeft, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../../lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Request token, 2: Reset with token

  // Step 1 state
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Step 2 state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(res.data.message || 'If an account exists, reset instructions have been sent.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetToken.trim()) {
      setResetError('Please enter your reset token');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    setResetLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        token: resetToken,
        new_password: newPassword,
      });
      setResetSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setResetError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/20 mx-auto mb-4 border border-blue-400/30">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Password Recovery</h1>
          <p className="text-xs text-slate-400 mt-1">
            {step === 1 ? 'Enter your email address to receive a security reset token' : 'Enter your reset token and new password'}
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8 border border-surfaceBorder shadow-2xl">
          {step === 1 ? (
            <form onSubmit={handleRequestToken} className="space-y-4">
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
                {loading ? 'Processing...' : <>Send Password Reset Token <ArrowRight className="w-4 h-4" /></>}
              </button>

              <div className="pt-2 text-center border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                >
                  Already have a reset token? Enter Token <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
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
                <label className="block text-xs font-medium text-slate-300 mb-1">Reset Token</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Paste reset token..."
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              {resetError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {resetError}
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {resetSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {resetLoading ? 'Resetting...' : <>Reset Password <ArrowRight className="w-4 h-4" /></>}
              </button>

              <div className="pt-2 text-center border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-400 hover:text-slate-300 font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Request Token
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
