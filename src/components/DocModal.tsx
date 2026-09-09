'use client';

/* Document popup (reference pattern): title bar + close, brand banner,
   scrollable content. Opens from footer links for FAQ and legal docs;
   the standalone routes stay for deep links. */

import { useUI } from './ui-context';
import Modal from './Modal';
import { legalDocs } from '@/lib/legal-content';
import CloseIcon from './CloseIcon';
import FaqContent from './FaqContent';

const TITLES: Record<string, string> = {
  faq: 'FAQs',
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  'delivery-terms': 'Delivery Terms',
  'offer-terms': 'Offer Terms',
};

export default function DocModal() {
  const { docKey, closeDoc } = useUI();

  if (!docKey) return null;
  const title = TITLES[docKey] ?? legalDocs[docKey]?.title ?? 'Bondok';
  const doc = legalDocs[docKey];

  return (
    <Modal open onClose={closeDoc} label={title} overlayClass="docmodal-overlay" panelClass="docmodal">
        <header className="docmodal-bar">
          <h2>{title}</h2>
          <button className="docmodal-close" aria-label="Close" onClick={closeDoc}>
            <CloseIcon size={18} />
          </button>
        </header>
        <div className="docmodal-banner" aria-hidden="true" />
        <div className="docmodal-scroll">
          {docKey === 'faq' ? (
            <FaqContent />
          ) : doc ? (
            <>
              {doc.pending && (
                <div className="branches-note">
                  Placeholder - the official {title} content is pending and will replace this text.
                </div>
              )}
              {doc.sections.map((s, i) => (
                <section key={i} className="legal-section">
                  {s.heading && <h2>{s.heading}</h2>}
                  <p>{s.body}</p>
                </section>
              ))}
            </>
          ) : null}
        </div>
    </Modal>
  );
}
