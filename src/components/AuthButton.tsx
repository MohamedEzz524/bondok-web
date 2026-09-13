'use client';

/* Small client wrapper so server pages (e.g. Offers) can trigger the shared
   auth modal. Renders a button that opens the sign-up / login flow. */

import { useUI } from './ui-context';

export default function AuthButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const { openAuth } = useUI();
  return (
    <button type="button" className={className} onClick={openAuth}>
      {children}
    </button>
  );
}
