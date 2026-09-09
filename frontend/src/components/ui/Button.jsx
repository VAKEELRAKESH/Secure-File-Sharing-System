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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
  };

  const variantStyles = {
    primary: 'bg-primary hover:bg-primaryHover text-white shadow-md shadow-primary/20 border border-primary/30 active:scale-[0.98]',
    secondary: 'bg-surface hover:bg-surfaceHover text-foreground border border-surfaceBorder active:scale-[0.98]',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border border-emerald-500/30 active:scale-[0.98]',
    amber: 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-500/20 border border-amber-500/30 active:scale-[0.98]',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 active:scale-[0.98]',
    ghost: 'text-secondaryText hover:text-foreground hover:bg-surface/80 border border-transparent active:scale-[0.98]',
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
