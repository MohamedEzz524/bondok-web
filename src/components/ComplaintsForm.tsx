'use client';

/* Complaints & Suggestions form. Submissions queue locally for now and
   publish a bus event; they route to the dashboard/CRM once the backend
   is live. Structural placeholder for the designer to restyle. */

import { useState } from 'react';
import { branches } from '@/lib/branches';
import { EVENTS, publish } from '@/lib/pubsub';
import Select from './Select';

type Kind = 'complaint' | 'suggestion' | 'compliment';

export default function ComplaintsForm() {
  const [kind, setKind] = useState<Kind>('complaint');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!name.trim() || !message.trim()) { setError('Please fill your name and your message.'); return; }
    if (phone && !/^01[0125][0-9]{8}$/.test(phone)) { setError('Please enter a valid Egyptian mobile number, or leave it empty.'); return; }
    const entry = { kind, name, phone, branch, message, at: new Date().toISOString() };
    try {
      const key = 'bondok-feedback-v1';
      const list = JSON.parse(localStorage.getItem(key) ?? '[]');
      list.push(entry);
      localStorage.setItem(key, JSON.stringify(list));
    } catch { /* storage unavailable */ }
    publish(EVENTS.modalOpen, { source: 'complaints-form', name: `feedback-${kind}` });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="stub-page">
        <svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#68b631" />
          <path fill="#fff" d="M9.5 15.5 6.3 12.3l-1.4 1.4 4.6 4.6 9-9-1.4-1.4z" />
        </svg>
        <h1>Thank you!</h1>
        <p>Your {kind} was received. Our team reviews every message.</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="menu-head">
        <h1>Complaints &amp; Suggestions</h1>
        <p>Tell us what went wrong - or what we should do next. We read everything.</p>
      </div>

      <div className="step-card">
        <div className="fgroup">
          <h4>Type</h4>
          <div className="fchips">
            {(['complaint', 'suggestion', 'compliment'] as Kind[]).map((k) => (
              <button key={k} className={`fchip${kind === k ? ' is-on' : ''}`} onClick={() => setKind(k)}>
                {k[0].toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <input className="field" placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          className="field" type="tel" inputMode="numeric" maxLength={11}
          placeholder="Phone (optional - so we can follow up)"
          value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
        />
        <Select
          ariaLabel="Related branch"
          value={branch}
          onChange={setBranch}
          options={[
            { value: '', label: 'Branch (optional)' },
            ...branches.map((b) => ({ value: b.id, label: b.name })),
          ]}
        />
        <textarea
          className="field field-area" rows={5}
          placeholder="Your message *"
          value={message} onChange={(e) => setMessage(e.target.value)}
        />
        {error && <p className="step-error" role="alert">{error}</p>}
        <button className="btn btn-solid step-next" onClick={submit}>Send</button>
        <p className="step-demo">Messages route to the Bondok team dashboard once the backend is connected.</p>
      </div>
    </div>
  );
}
