'use client';
import React from 'react';

export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <Icon className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
        )}
        <input
          className={`w-full glass-input rounded-xl text-xs text-slate-200 transition-all ${
            Icon ? 'pl-9 pr-3' : 'px-3'
          } py-2.5 ${error ? 'border-rose-500/50 focus:border-rose-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[11px] text-rose-400 mt-1">{error}</p>
      )}
    </div>
  );
}
