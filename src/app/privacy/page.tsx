import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Privacy Policy' + ' — Bondok Fried Chicken' };

export default function Page() {
  return <LegalPage docKey='privacy' />;
}
