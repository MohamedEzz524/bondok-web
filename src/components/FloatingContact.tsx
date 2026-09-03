'use client';

/* Sticky contact stack (scope: sticky call + WhatsApp buttons).
   Renders only the buttons whose numbers exist; links publish bus events
   so the tracking layer can count Click-to-Call / Click-to-WhatsApp. */

import { usePathname } from 'next/navigation';
import { CONTACT } from '@/lib/branches';
import { EVENTS, publish } from '@/lib/pubsub';

export default function FloatingContact() {
  const pathname = usePathname();
  /* keep checkout distraction-free */
  if (pathname === '/checkout') return null;
  if (!CONTACT.hotline && !CONTACT.whatsapp) return null;

  return (
    <div className="float-contact">
      {CONTACT.whatsapp && (
        <a
          className="float-btn float-wa"
          href={`https://wa.me/${CONTACT.whatsapp}`}
          target="_blank" rel="noopener"
          aria-label="Chat on WhatsApp"
          onClick={() => publish(EVENTS.modalOpen, { source: 'float-contact', name: 'whatsapp' })}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.35A10 10 0 1 0 12 2zm4.5 13.87c-.21.58-1.2 1.11-1.67 1.18-.43.06-.97.09-1.56-.1-.36-.11-.82-.26-1.41-.52-2.48-1.07-4.1-3.57-4.23-3.74-.12-.17-1.01-1.35-1.01-2.57 0-1.22.64-1.82.87-2.07.22-.25.49-.31.66-.31h.47c.15.01.35-.05.55.43.2.49.69 1.7.76 1.83.06.13.1.27.02.44-.47.93-.97.9-.72 1.33a6.7 6.7 0 0 0 3.35 2.93c.25.13.4.11.54-.06.15-.17.62-.72.78-.97.17-.25.33-.21.55-.12.23.08 1.45.68 1.7.8.25.13.41.19.47.29.06.11.06.6-.15 1.18z" /></svg>
        </a>
      )}
      {CONTACT.hotline && (
        <a
          className="float-btn float-call"
          href={`tel:${CONTACT.hotline}`}
          aria-label="Call the hotline"
          onClick={() => publish(EVENTS.modalOpen, { source: 'float-contact', name: 'call' })}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11 11 0 0 0 3.5.56 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .56 3.5 1 1 0 0 1-.25 1z" /></svg>
        </a>
      )}
    </div>
  );
}
