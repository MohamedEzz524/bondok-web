import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: "We're Hiring" + ' — Bondok Fried Chicken' };

export default function Page() {
  return <LegalPage docKey='careers' />;
}
