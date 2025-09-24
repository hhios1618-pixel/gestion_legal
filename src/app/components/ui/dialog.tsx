"use client";

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange?: (value: boolean) => void; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange?.(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => onOpenChange?.(false)} />
      {children}
    </div>,
    document.body
  );
}

export function DialogContent({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`relative z-[101] w-[calc(100vw-2rem)] max-w-lg rounded-2xl bg-white p-6 shadow-2xl focus:outline-none ${className}`.trim()}>
      {children}
    </div>
  );
}

export function DialogHeader({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`space-y-1.5 ${className}`.trim()}>{children}</div>;
}

export function DialogTitle({ className = '', children }: { className?: string; children: ReactNode }) {
  return <h3 className={`text-xl font-semibold text-[#0b1424] ${className}`.trim()}>{children}</h3>;
}

export function DialogDescription({ className = '', children }: { className?: string; children: ReactNode }) {
  return <p className={`text-sm text-[#4c5a74] ${className}`.trim()}>{children}</p>;
}
