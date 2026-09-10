import type { Metadata } from 'next';
import OrdersView from '@/components/OrdersView';

export const metadata: Metadata = {
  title: 'Order History — Bondok Fried Chicken',
  description: 'Your past Bondok orders.',
};

export default function Page() {
  return <OrdersView />;
}
