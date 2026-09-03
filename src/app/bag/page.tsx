import type { Metadata } from 'next';
import BagView from '@/components/BagView';

export const metadata: Metadata = { title: 'Your Bag — Bondok Fried Chicken' };

export default function BagPage() {
  return <BagView />;
}
