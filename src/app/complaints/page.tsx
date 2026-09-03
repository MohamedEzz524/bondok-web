import type { Metadata } from 'next';
import ComplaintsForm from '@/components/ComplaintsForm';

export const metadata: Metadata = { title: 'Complaints & Suggestions — Bondok Fried Chicken' };

export default function Page() {
  return <ComplaintsForm />;
}
