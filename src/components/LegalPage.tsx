import { legalDocs } from '@/lib/legal-content';

/* Shared template for legal/info pages. When the client's official text is
   pasted into lib/legal-content.ts, the page renders it automatically. */
export default function LegalPage({ docKey }: { docKey: string }) {
  const doc = legalDocs[docKey];
  if (!doc) return null;

  return (
    <div className="legal-page">
      <h1>{doc.title}</h1>
      {doc.updated && <p className="legal-updated">Last updated: {doc.updated}</p>}
      {doc.pending && (
        <div className="branches-note">
          Placeholder page - the official content is pending and will replace this text.
        </div>
      )}
      {doc.sections.map((s, i) => (
        <section key={i} className="legal-section">
          {s.heading && <h2>{s.heading}</h2>}
          <p>{s.body}</p>
        </section>
      ))}
    </div>
  );
}
