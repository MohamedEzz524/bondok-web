'use client';

/* Contact / Complaints & Suggestions - built to the designer's approved
   layout. Submissions queue locally and publish a bus event; they route to
   the dashboard/CRM once the backend is live. Hotline number pending client. */

import { useRef, useState } from 'react';
import Link from 'next/link';
import { branches } from '@/lib/branches';
import { EVENTS, publish } from '@/lib/pubsub';
import { useUI } from './ui-context';
import Select from './Select';

type Kind = 'complaint' | 'suggestion' | 'compliment';

const KINDS: { key: Kind; icon: string; title: string; text: string }[] = [
  { key: 'complaint', icon: '/icons/icon-complaint.svg', title: 'Complaint', text: "Something didn't go as expected." },
  { key: 'suggestion', icon: '/icons/icon-suggestion.svg', title: 'Suggestion', text: 'Have an idea to make Bondok better?' },
  { key: 'compliment', icon: '/icons/icon-compliment.svg', title: 'Compliment', text: 'Loved your meal or crew service?' },
];

const FAQS = [
  { q: 'How can I track my order?', a: 'You can follow your meal from your order page, and we send WhatsApp updates at every step - confirmed, preparing, out for delivery, delivered.' },
  { q: 'How long does delivery usually take?', a: 'Most orders arrive within 30-45 minutes depending on your branch and area. Each branch shows its estimated delivery time before you order.' },
  { q: 'Can I cancel or modify my order after placing it?', a: "Call your branch hotline right away - if the kitchen hasn't started preparing your meal, we'll adjust or cancel it." },
  { q: 'How do I redeem my Bondok reward points?', a: 'Bondok Rewards launches soon - you will swap points for freebies right from the rewards page.' },
  { q: 'What should I do if an item was missing from my bag?', a: "Tell us through this page with your order number - we'll make it right and credit your next meal." },
];

export default function ComplaintsForm() {
  const { openDoc } = useUI();
  const [kind, setKind] = useState<Kind>('suggestion');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) { setError('Please fill your name and your message.'); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }
    if (!branch) { setError('Please select a branch.'); return; }
    if (phone && !/^01[0125][0-9]{8}$/.test(phone)) { setError('Please enter a valid Egyptian mobile number, or leave it empty.'); return; }
    if (!consent) { setError('Please agree so we can contact you about this submission.'); return; }
    const entry = { kind, name, phone, email, branch, orderNo, message, fileName, at: new Date().toISOString() };
    try {
      const key = 'bondok-feedback-v1';
      const list = JSON.parse(localStorage.getItem(key) ?? '[]');
      list.push(entry);
      localStorage.setItem(key, JSON.stringify(list));
    } catch { /* storage unavailable */ }
    publish(EVENTS.modalOpen, { source: 'complaints-form', name: `feedback-${kind}` });
    setError('');
    setSent(true);
  };

  return (
    <div className="ct-page">
      {/* hero */}
      <header className="ct-hero">
        <p className="pg-eyebrow"><span className="pg-dot" aria-hidden="true" />We&apos;re here to help</p>
        <h1>How can we make<br />it better?</h1>
        <p className="ct-sub">
          Your feedback fuels our kitchen. Whether something didn&apos;t meet your standards,
          you have an inspired craveable idea, or simply want to share good vibes — we are
          listening 24/7.
        </p>
      </header>

      {/* contact channels */}
      <section className="ct-channels" aria-label="Contact options">
        <article className="ct-channel">
          <span className="ct-channel-icon">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/Icon-phone.svg" alt="" width="17" height="17" />
          </span>
          <h4>Call us</h4>
          <p>Need urgent support? Our hotline is live during open hours.</p>
          <button className="ct-channel-btn" title="Hotline number arrives with launch">☏ Hotline — coming soon</button>
        </article>
        <article className="ct-channel">
          <span className="ct-channel-icon">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--orange)" strokeWidth="1.9" aria-hidden="true"><path strokeLinejoin="round" d="M4 5h16v11H8l-4 4V5z" /><path strokeLinecap="round" d="M8 9h8M8 12h5" /></svg>
          </span>
          <h4>Chat with us</h4>
          <p>Send us a message and our team will get back to you.</p>
          <a className="ct-channel-btn" href="#ct-form">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinejoin="round" d="M4 5h16v11H8l-4 4V5z" /></svg>
            Send Us a Message
          </a>
        </article>
        <article className="ct-channel">
          <span className="ct-channel-icon">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/Icon-location.svg" alt="" width="14" height="17" />
          </span>
          <h4>Find a branch</h4>
          <p>Locate your nearest store or reach in-store managers.</p>
          <Link className="ct-channel-btn" href="/branches">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 3 10 14m11-11-7 18-2.5-7.5L4 11l17-8z" /></svg>
            View Locations
          </Link>
        </article>
        <article className="ct-channel">
          <span className="ct-channel-icon">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--orange)" strokeWidth="1.9" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M9.6 9.2a2.5 2.5 0 1 1 3.2 2.9c-.6.2-.8.6-.8 1.2v.4" /><circle cx="12" cy="16.6" r=".4" fill="var(--orange)" /></svg>
          </span>
          <h4>FAQs</h4>
          <p>Quick answers to food specs, delivery, and Bondok rewards.</p>
          <button className="ct-channel-btn" onClick={() => openDoc('faq')}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinejoin="round" d="M5 4h11l3 3v13H5V4z" /><path strokeLinecap="round" d="M9 11h6M9 14h4" /></svg>
            Read Guides
          </button>
        </article>
      </section>

      {/* form section */}
      <section className="ct-main" id="ct-form">
        <div className="ct-side">
          <p className="pg-kicker">Your voice matters</p>
          <h2>Tell us<br />what&apos;s on<br />your mind</h2>
          <p className="ct-side-text">
            We review every submission individually. Whether it&apos;s a delivery bump, an
            ingredient recommendation, or praise for your neighborhood store crew, it
            reaches the culinary directors directly.
          </p>
          <div className="ct-human">
            <div className="ct-human-head">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-guarantee.svg" alt="" width="22" height="27" />
              <div>
                <h4>100% Human Response</h4>
                <p className="ct-human-sub">No automated bot loops.</p>
              </div>
            </div>
            <p>
              If something wasn&apos;t crisp, hot, or 100% accurate, we ensure your next meal
              is credited or made completely right.
            </p>
          </div>
        </div>

        <form className="ct-form" onSubmit={submit}>
          {sent ? (
            <div className="ct-done">
              <svg viewBox="0 0 24 24" width="52" height="52" aria-hidden="true">
                <circle cx="12" cy="12" r="11" fill="#68b631" />
                <path fill="#fff" d="M9.5 15.5 6.3 12.3l-1.4 1.4 4.6 4.6 9-9-1.4-1.4z" />
              </svg>
              <h3>Thank you!</h3>
              <p>Your {kind} was received. Our team reviews every message individually.</p>
            </div>
          ) : (
            <>
              <h3>Send us a message</h3>
              <p className="ct-form-sub">Choose a category to route your message to the correct kitchen operations team.</p>

              <p className="ct-label ct-caps">Select feedback type <span className="ct-req">*</span></p>
              <div className="ct-kinds" role="radiogroup" aria-label="Feedback type">
                {KINDS.map((k) => (
                  <button
                    type="button"
                    key={k.key}
                    role="radio"
                    aria-checked={kind === k.key}
                    className={`ct-kind${kind === k.key ? ' is-on' : ''}`}
                    onClick={() => setKind(k.key)}
                  >
                    <span className="ct-kind-radio" aria-hidden="true">
                      {kind === k.key && (
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="var(--orange)" /><path fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="m7.5 12.5 3 3 6-6.5" /></svg>
                      )}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={k.icon} alt="" height="26" />
                    <span className="ct-kind-title">{k.title}</span>
                    <span className="ct-kind-text">{k.text}</span>
                  </button>
                ))}
              </div>

              <div className="ct-row">
                <div className="ct-field">
                  <label className="ct-label" htmlFor="ct-name">Your Name <span className="ct-req">*</span></label>
                  <input id="ct-name" className="ct-input" placeholder="Alex Morgan" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="ct-field">
                  <label className="ct-label" htmlFor="ct-phone">Phone Number <span className="ct-hint">Optional</span></label>
                  <input
                    id="ct-phone" className="ct-input" type="tel" inputMode="numeric" maxLength={11}
                    placeholder="01x xxxx xxxx"
                    value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div className="ct-row">
                <div className="ct-field">
                  <label className="ct-label" htmlFor="ct-email">Email Address <span className="ct-req">*</span></label>
                  <input id="ct-email" className="ct-input" type="email" placeholder="alex@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="ct-field">
                  <label className="ct-label">Select Branch <span className="ct-req">*</span></label>
                  <Select
                    ariaLabel="Select branch"
                    value={branch}
                    onChange={setBranch}
                    options={[
                      { value: '', label: 'Choose a restaurant location' },
                      ...branches.map((b) => ({ value: b.id, label: b.name })),
                    ]}
                  />
                </div>
              </div>

              <div className="ct-field">
                <label className="ct-label" htmlFor="ct-order">Order Number <span className="ct-hint">Find this in receipt or app</span></label>
                <input id="ct-order" className="ct-input" placeholder="#BND-94821" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
              </div>

              <div className="ct-field">
                <label className="ct-label" htmlFor="ct-msg">Your Message <span className="ct-req">*</span></label>
                <textarea
                  id="ct-msg" className="ct-input ct-textarea" rows={4}
                  placeholder="Tell us what happened, item specifics, or share your creative idea..."
                  value={message} onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="ct-field">
                <p className="ct-label ct-caps">Attach photo or receipt (optional)</p>
                <button type="button" className="ct-upload" onClick={() => fileRef.current?.click()}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m21 12.5-8.5 8.5a6 6 0 0 1-8.5-8.5l8.5-8.5a4 4 0 0 1 5.7 5.7l-8.5 8.5a2 2 0 0 1-2.8-2.8L15 7.3" /></svg>
                  <strong>{fileName || 'Drop receipt image or click to upload'}</strong>
                  <span>Supports PNG, JPG, or PDF up to 10MB</span>
                </button>
                <input
                  ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.pdf" hidden
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
                />
              </div>

              <label className="ct-consent">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>
                  I agree to allow the Bondok Guest Experience team to contact me via email or SMS
                  regarding this submission. View our{' '}
                  <button type="button" className="ct-link" onClick={() => openDoc('privacy')}>Privacy Policy</button>.
                </span>
              </label>

              {error && <p className="ct-error" role="alert">{error}</p>}

              <button type="submit" className="btn btn-solid ct-submit">
                Send Message
                <svg viewBox="0 0 54 54" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M40.4 29.8H0v-6.6h40.4L21.8 4.6 26.5 0l26.6 26.5-26.6 26.5-4.7-4.6 18.6-18.6z" /></svg>
              </button>
              <p className="ct-demo">Messages route to the Bondok team dashboard once the backend is connected.</p>
            </>
          )}
        </form>
      </section>

      {/* FAQ */}
      <section className="ct-faq">
        <p className="pg-eyebrow ct-faq-eyebrow">Quick answers</p>
        <h2>Frequently asked<br />questions</h2>
        <p className="ct-sub">Find swift solutions to typical order queries, kitchen policies, and takeout guidelines.</p>
        <div className="ct-faq-list">
          {FAQS.map((f, i) => (
            <div key={f.q} className={`ct-faq-item${openFaq === i ? ' is-open' : ''}`}>
              <button className="ct-faq-q" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                <span className="ct-faq-chev" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </span>
              </button>
              {openFaq === i && <p className="ct-faq-a">{f.a}</p>}
            </div>
          ))}
        </div>
        <button className="ct-viewall" onClick={() => openDoc('faq')}>
          View All FAQs
          <svg viewBox="0 0 54 54" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M40.4 29.8H0v-6.6h40.4L21.8 4.6 26.5 0l26.6 26.5-26.6 26.5-4.7-4.6 18.6-18.6z" /></svg>
        </button>
      </section>
    </div>
  );
}
