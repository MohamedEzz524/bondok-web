import type { Metadata } from 'next';
import FaqContent from '@/components/FaqContent';

export const metadata: Metadata = { title: 'FAQs — Bondok Fried Chicken' };

export default function Page() {
  return (
    <div className="faq-page">
      <div className="menu-head">
        <h1>FAQs</h1>
        <p>Quick answers to the questions we hear most.</p>
      </div>
      <FaqContent />
    </div>
  );
}
