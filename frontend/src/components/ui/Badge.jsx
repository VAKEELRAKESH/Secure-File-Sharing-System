'use client';
import React from 'react';

export default function Badge({
  children,
  variant = 'neutral', // 'success' | 'warning' | 'error' | 'info' | 'admin' | 'neutral'
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border';

  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    admin: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 uppercase',
    neutral: 'bg-surfaceBorder/60 text-slate-400 border-surfaceBorder',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.neutral} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
