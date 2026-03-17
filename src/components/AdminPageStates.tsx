'use client';

import type { ReactElement, ElementType } from 'react';

interface AdminLoadingStateProps {
  className?: string;
}

export function AdminLoadingState({ className = 'py-16' }: AdminLoadingStateProps) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className="w-10 h-10 rounded-full border-[3px] animate-spin"
        style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
      />
    </div>
  );
}

interface AdminEmptyStateProps {
  icon: ElementType;
  message: string;
  note?: string;
  action?: ReactElement;
}

export function AdminEmptyState({ icon: Icon, message, note, action }: AdminEmptyStateProps) {
  return (
    <div className="card p-12 text-center">
      <Icon className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
      <p className="text-fluid-sm font-medium" style={{ color: 'var(--text-muted)' }}>
        {message}
      </p>
      {note && (
        <p className="text-fluid-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {note}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
