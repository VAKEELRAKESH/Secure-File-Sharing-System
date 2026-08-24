'use client';
import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'emerald' | 'amber' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
  };

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 border border-blue-500/30',
    secondary: 'bg-surface hover:bg-surface/80 text-slate-300 border border-surfaceBorder',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border border-emerald-500/30',
    amber: 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-500/20 border border-amber-500/30',
    danger: 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30',
    ghost: 'text-slate-400 hover:text-slate-200 hover:bg-surface/60 border border-transparent',
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{children}</span>
    </button>
  );
}
