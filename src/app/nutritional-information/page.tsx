import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Nutrition & Allergen' + ' — Bondok Fried Chicken' };

export default function Page() {
  return <LegalPage docKey='nutritional-information' />;
}
