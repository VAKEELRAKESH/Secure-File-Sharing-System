'use client';
import React from 'react';

export default function EmptyState({
  icon: Icon,
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction
}) {
  return (
    <div className="max-w-sm mx-auto text-center space-y-3 py-10 px-4">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 mx-auto flex items-center justify-center shadow-sm">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div>
        <h3 className="text-sm font-bold text-slate-200">{title}</h3>
        {description && (
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            onClick={onAction}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-semibold inline-flex items-center gap-2 shadow-md shadow-primary/20 transition-all"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
