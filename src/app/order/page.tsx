import type { Metadata } from 'next';
import { Suspense } from 'react';
import OrderView from '@/components/OrderView';

export const metadata: Metadata = {
  title: 'Your Order — Bondok Fried Chicken',
  description: 'Order confirmation and live tracking.',
};

/* useSearchParams (in OrderView) needs a Suspense boundary for the static export */
export default function Page() {
  return (
    <Suspense fallback={<div className="ord-page"><p className="ord-loading">Loading your order…</p></div>}>
      <OrderView />
    </Suspense>
  );
}
