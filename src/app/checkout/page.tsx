import type { Metadata } from 'next';
import ComingSoon from '@/components/ComingSoon';

export const metadata: Metadata = { title: 'Checkout — Bondok Fried Chicken' };

export default function CheckoutPage() {
  return (
    <ComingSoon
      title="Checkout"
      text="The checkout flow (phone, OTP, address, payment) is the next build stage - it activates once the payment gateway and SMS service are connected."
    />
  );
}
