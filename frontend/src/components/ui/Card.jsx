'use client';
import React from 'react';

export default function Card({ children, className = '', header, footer, ...props }) {
  return (
    <div
      className={`glass-panel rounded-2xl border border-surfaceBorder shadow-xl overflow-hidden backdrop-blur-md ${className}`}
      {...props}
    >
      {header && (
        <div className="p-5 border-b border-surfaceBorder/80 bg-surface/40 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="p-4 border-t border-surfaceBorder/80 bg-surface/30">
          {footer}
        </div>
      )}
    </div>
  );
}
