'use client';

/* Shared modal shell: backdrop, Escape-to-close, body scroll-lock, and
   click-outside dismissal. Callers pass their own overlay/panel class names
   so existing per-modal styling keeps working - this only dedupes the
   boilerplate that every popup used to re-implement. */

import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  label: string;                 // aria-label for the dialog
  overlayClass: string;
  panelClass: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, label, overlayClass, panelClass, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={overlayClass} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={panelClass} role="dialog" aria-modal="true" aria-label={label}>
        {children}
      </div>
    </div>
  );
}
