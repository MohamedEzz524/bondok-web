import type { Metadata } from 'next';
import AccountView from '@/components/AccountView';

export const metadata: Metadata = {
  title: 'My Account — Bondok Fried Chicken',
  description: 'Your Bondok account, orders, and rewards.',
};

export default function Page() {
  return <AccountView />;
}
