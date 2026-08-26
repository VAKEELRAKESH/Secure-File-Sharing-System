'use client';
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';

export default function MfaModal({ onClose, onMfaEnabled }) {
  const [step, setStep] = useState('setup');
  const [mfaData, setMfaData] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMfaSetup();
  }, []);

  const fetchMfaSetup = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/mfa/setup');
      setMfaData(res.data);
    } catch (err) {
      setError('Failed to setup 2FA authenticator');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/mfa/verify', { code });
      setSuccess('Multi-Factor Authentication enabled successfully!');
      setTimeout(() => {
        if (onMfaEnabled) onMfaEnabled();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-panel w-full max-w-md rounded-2xl p-6 border border-surfaceBorder relative text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mx-auto mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-100">Setup Multi-Factor Authentication</h3>
        <p className="text-xs text-slate-400 mt-1 mb-6">Scan the QR code with Google Authenticator or Authy</p>

        {mfaData?.qr_code_base64 && (
          <div className="bg-white p-3 rounded-2xl inline-block mb-4 border border-slate-700 shadow-xl">
            <img
              src={`data:image/png;base64,${mfaData.qr_code_base64}`}
              alt="2FA QR Code"
              className="w-44 h-44 object-contain"
            />
          </div>
        )}

        {mfaData?.secret && (
          <div className="mb-4">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1">Secret Key</span>
            <code className="text-xs text-cyan-400 bg-surface px-3 py-1.5 rounded-lg border border-surfaceBorder font-mono">
              {mfaData.secret}
            </code>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">6-Digit Verification Code</label>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-widest text-white"
            />
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

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Enable 2FA'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
