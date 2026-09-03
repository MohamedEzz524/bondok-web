import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Support — Bondok Fried Chicken' };

/* structural placeholder - hotline/WhatsApp activate with client numbers */
export default function Page() {
  return (
    <div className="support-page">
      <div className="menu-head">
        <h1>Support</h1>
        <p>We are here to help with orders, branches, and anything Bondok.</p>
      </div>
      <div className="support-grid">
        <div className="support-card">
          <h2>Call us</h2>
          <p>Hotline number arrives with branch data.</p>
          <button className="btn btn-solid is-disabled" disabled>Hotline · soon</button>
        </div>
        <div className="support-card">
          <h2>WhatsApp</h2>
          <p>Chat with us - number arrives with branch data.</p>
          <button className="btn btn-outline is-disabled" disabled>WhatsApp · soon</button>
        </div>
        <div className="support-card">
          <h2>Your order</h2>
          <p>Questions about a recent order? Have your order number ready and contact your branch.</p>
          <Link className="btn btn-outline" href="/branches">Find your branch</Link>
        </div>
        <div className="support-card">
          <h2>Feedback</h2>
          <p>Complaints, suggestions, or compliments - we read everything.</p>
          <Link className="btn btn-outline" href="/complaints">Send feedback</Link>
        </div>
      </div>
      <p className="support-faq">Looking for quick answers? <Link href="/faq">Check the FAQs</Link>.</p>
    </div>
  );
}
