import type { Metadata } from 'next';
import RewardsView from '@/components/RewardsView';

export const metadata: Metadata = {
  title: 'Bondok Rewards — Bondok Fried Chicken',
  description: 'Earn points with every order and redeem them for free Bondok favorites.',
};

export default function Page() {
  return <RewardsView />;
}
