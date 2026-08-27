'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Mail, AlertCircle, CheckCircle, RefreshCw, ArrowLeft, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  // Main countdown timer (OTP expiry)
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Resend cooldown (30 seconds)
  useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }
    setCanResend(false);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // single digit
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/auth/verify-otp', { email, otp: code });
      setSuccess('Email verified successfully! Redirecting to dashboard...');

      // Store tokens and user data
      if (res.data.access_token) {
        localStorage.setItem('trustshare_access_token', res.data.access_token);
        localStorage.setItem('trustshare_user', JSON.stringify(res.data.user));
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Verification failed. Please try again.';
      setError(msg);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setError('');

    try {
      await api.post('/auth/resend-otp', { email });
      setSuccess('A new verification code has been sent.');
      setCountdown(600); // reset the 10-minute countdown
      setResendCooldown(30); // 30-second resend cooldown
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (otp.every((d) => d !== '') && otp.join('').length === 6) {
      handleVerify();
    }
  }, [otp]);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primaryHover flex items-center justify-center shadow-xl shadow-primary/25 mx-auto border border-primary/30"
          >
            <Mail className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Verify Your Email</h1>
          <p className="text-xs text-secondaryText max-w-xs mx-auto">
            We sent a 6-digit verification code to{' '}
            <span className="font-semibold text-primary">{email || 'your email'}</span>.
            Enter it below to activate your account.
          </p>
        </div>

        {/* OTP Card */}
        <div className="glass-panel rounded-2xl p-8 border border-surfaceBorder shadow-2xl">
          <form onSubmit={handleVerify} className="space-y-6">
            {/* Countdown Timer */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold ${
                countdown > 60
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : countdown > 0
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                {countdown > 0 ? (
                  <span>Code expires in {formatTime(countdown)}</span>
                ) : (
                  <span>Code expired</span>
                )}
              </div>
            </div>

            {/* 6-Digit OTP Input */}
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <motion.input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  whileFocus={{ scale: 1.08, borderColor: 'var(--primary)' }}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl glass-input 
                    focus:ring-2 focus:ring-primary/30 focus:border-primary
                    transition-all duration-150
                    ${digit ? 'border-primary/50 text-foreground' : 'text-secondaryText'}
                  `}
                  disabled={loading || !!success}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Alert */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verify Button */}
            <motion.button
              type="submit"
              disabled={loading || otp.join('').length !== 6 || !!success}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primaryHover text-white text-sm font-semibold transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Verify & Activate Account
                </>
              )}
            </motion.button>
          </form>

          {/* Resend Section */}
          <div className="mt-6 pt-4 border-t border-surfaceBorder text-center">
            <p className="text-xs text-secondaryText mb-2">
              Didn't receive the code? Check your spam folder or
            </p>
            <button
              onClick={handleResend}
              disabled={!canResend || resending || !!success}
              className={`text-xs font-semibold transition-colors ${
                canResend && !success
                  ? 'text-primary hover:text-primaryHover cursor-pointer'
                  : 'text-secondaryText cursor-not-allowed'
              }`}
            >
              {resending ? (
                <span className="flex items-center justify-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Sending...
                </span>
              ) : canResend ? (
                'Resend verification code'
              ) : (
                `Resend available in ${resendCooldown}s`
              )}
            </button>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-xs text-secondaryText hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Sign In
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}

