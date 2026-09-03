import type { Metadata } from 'next';
import FaqList from '@/components/FaqList';

export const metadata: Metadata = { title: 'FAQs — Bondok Fried Chicken' };

export default function Page() {
  return <FaqList />;
}
