'use client';
import React from 'react';

export default function EmptyState({
  icon: Icon,
  title = 'No items found',
  description = 'There are no records to display at this time.',
  securityBadges = [],
  actionLabel,
  onAction
}) {
  return (
    <div className="max-w-md mx-auto text-center space-y-4 py-8 px-4">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 mx-auto flex items-center justify-center shadow-sm">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-secondaryText leading-relaxed">{description}</p>
        )}
      </div>

      {securityBadges && securityBadges.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {securityBadges.map((badge, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2.5 py-1 rounded-full bg-surfaceBorder/60 text-secondaryText border border-surfaceBorder font-semibold font-mono"
            >
              • {badge}
            </span>
          ))}
        </div>
      )}

      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            onClick={onAction}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-primary/20 transition-all"
            aria-label={actionLabel}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
