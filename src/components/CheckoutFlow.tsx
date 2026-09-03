'use client';

/* Bondok checkout flow (Stage-1 stub): phone -> OTP -> address -> payment -> confirm.
   OTP + payment are demo stubs; they go live once the SMS gateway and payment
   gateway are provided by the client. Order submission will route through the
   Cloud-Kitchen API adapter in Phase 3. */

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useCart } from './cart-context';
import { EVENTS, publish } from '@/lib/pubsub';

type Step = 'phone' | 'otp' | 'address' | 'payment' | 'confirm' | 'done';

const STEPS: { id: Step; label: string }[] = [
  { id: 'phone', label: 'Phone' },
  { id: 'otp', label: 'Verify' },
  { id: 'address', label: 'Address' },
  { id: 'payment', label: 'Payment' },
  { id: 'confirm', label: 'Confirm' },
];

const DEMO_OTP = '1234';
const EG_PHONE = /^01[0125][0-9]{8}$/;

interface Address {
  area: string; street: string; building: string; floor: string; apartment: string; notes: string;
}

const slide = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.22, ease: 'easeOut' as const },
};

export default function CheckoutFlow() {
  const { items, count, subtotal, clear } = useCart();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [address, setAddress] = useState<Address>({ area: '', street: '', building: '', floor: '', apartment: '', notes: '' });
  const [payMethod, setPayMethod] = useState<'cod' | 'card'>('cod');
  const [error, setError] = useState('');
  const orderIdRef = useRef('');

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const orderId = useMemo(() => {
    if (!orderIdRef.current) {
      orderIdRef.current = 'BD-' + String(Math.floor(100000 + Math.random() * 900000));
    }
    return orderIdRef.current;
  }, []);

  const go = (next: Step) => { setError(''); setStep(next); };

  if (items.length === 0 && step !== 'done') {
    return (
      <div className="stub-page">
        <h1>Checkout</h1>
        <p>Your bag is empty - add some items first.</p>
        <Link href="/menu" className="btn btn-solid">Explore the Menu</Link>
      </div>
    );
  }

  const submitPhone = () => {
    if (!EG_PHONE.test(phone.trim())) { setError('Please enter a valid Egyptian mobile number (e.g. 010 XXXX XXXX).'); return; }
    go('otp');   // live build: SMS gateway sends the code here
  };

  const submitOtp = () => {
    if (otp.trim() !== DEMO_OTP) { setError(`Wrong code. Demo build: use ${DEMO_OTP}.`); return; }
    go('address');
  };

  const submitAddress = () => {
    if (!address.area.trim() || !address.street.trim() || !address.building.trim()) {
      setError('Area, street, and building are required.'); return;
    }
    go('payment');
  };

  const placeOrder = () => {
    publish(EVENTS.orderPlaced, { source: 'checkout', orderId, count, subtotal });
    clear('checkout');
    go('done');
  };

  return (
    <div className="checkout-page">
      {step !== 'done' && (
        <ol className="steps" aria-label="Checkout progress">
          {STEPS.map((s, i) => (
            <li key={s.id} className={i < stepIndex ? 'is-done' : i === stepIndex ? 'is-current' : ''}>
              <span className="step-dot">{i < stepIndex ? '✓' : i + 1}</span>
              <span className="step-label">{s.label}</span>
            </li>
          ))}
        </ol>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {step === 'phone' && (
          <motion.div key="phone" className="step-card" {...slide}>
            <h2>Your phone number</h2>
            <p className="step-hint">No account or password needed - we verify with a one-time code.</p>
            <input
              className="field"
              type="tel" inputMode="numeric" placeholder="01X XXXX XXXX" maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && submitPhone()}
              autoFocus
            />
            {error && <p className="step-error" role="alert">{error}</p>}
            <button className="btn btn-solid step-next" onClick={submitPhone}>Send Code</button>
          </motion.div>
        )}

        {step === 'otp' && (
          <motion.div key="otp" className="step-card" {...slide}>
            <h2>Enter the code</h2>
            <p className="step-hint">
              Sent to <strong>{phone}</strong> · <button className="step-link" onClick={() => go('phone')}>change</button>
              <br /><span className="step-demo">Demo build: the code is {DEMO_OTP}. Live SMS arrives with the gateway.</span>
            </p>
            <input
              className="field field-otp"
              type="text" inputMode="numeric" placeholder="• • • •" maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && submitOtp()}
              autoFocus
            />
            {error && <p className="step-error" role="alert">{error}</p>}
            <button className="btn btn-solid step-next" onClick={submitOtp}>Verify</button>
          </motion.div>
        )}

        {step === 'address' && (
          <motion.div key="address" className="step-card" {...slide}>
            <h2>Delivery address</h2>
            <div className="field-grid">
              <input className="field" placeholder="Area / District *" value={address.area} onChange={(e) => setAddress({ ...address, area: e.target.value })} />
              <input className="field" placeholder="Street *" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
              <input className="field" placeholder="Building *" value={address.building} onChange={(e) => setAddress({ ...address, building: e.target.value })} />
              <input className="field" placeholder="Floor" value={address.floor} onChange={(e) => setAddress({ ...address, floor: e.target.value })} />
              <input className="field" placeholder="Apartment" value={address.apartment} onChange={(e) => setAddress({ ...address, apartment: e.target.value })} />
              <input className="field" placeholder="Delivery notes (optional)" value={address.notes} onChange={(e) => setAddress({ ...address, notes: e.target.value })} />
            </div>
            <p className="step-demo">Coverage check &amp; delivery fees activate with branch data / POS API.</p>
            {error && <p className="step-error" role="alert">{error}</p>}
            <div className="step-nav">
              <button className="btn btn-outline" onClick={() => go('otp')}>Back</button>
              <button className="btn btn-solid step-next" onClick={submitAddress}>Continue</button>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div key="payment" className="step-card" {...slide}>
            <h2>Payment method</h2>
            <div className="pay-options">
              <button className={`pay-option${payMethod === 'cod' ? ' is-on' : ''}`} onClick={() => setPayMethod('cod')}>
                <strong>Cash on Delivery</strong>
                <span>Pay the courier when your order arrives</span>
              </button>
              <button className="pay-option is-disabled" disabled>
                <strong>Card / Wallet</strong>
                <span>Available at launch with the payment gateway</span>
              </button>
            </div>
            <div className="step-nav">
              <button className="btn btn-outline" onClick={() => go('address')}>Back</button>
              <button className="btn btn-solid step-next" onClick={() => go('confirm')}>Continue</button>
            </div>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div key="confirm" className="step-card" {...slide}>
            <h2>Confirm your order</h2>
            <ul className="confirm-list">
              {items.map((i) => (
                <li key={i.slug}>
                  <span>{i.qty}× {i.name}</span>
                  <strong>{i.price !== undefined ? `EGP ${i.price * i.qty}` : '—'}</strong>
                </li>
              ))}
            </ul>
            <div className="confirm-meta">
              <p><strong>Deliver to:</strong> {address.building} {address.street}, {address.area}{address.floor && `, floor ${address.floor}`}{address.apartment && `, apt ${address.apartment}`}</p>
              <p><strong>Phone:</strong> {phone} · <strong>Payment:</strong> Cash on Delivery</p>
              <p className="confirm-total">
                <span>Subtotal</span>
                <strong>{subtotal === null ? 'Prices arrive with menu data' : `EGP ${subtotal}`}</strong>
              </p>
              <p className="step-demo">+ delivery fee (calculated per branch at launch)</p>
            </div>
            <div className="step-nav">
              <button className="btn btn-outline" onClick={() => go('payment')}>Back</button>
              <button className="btn btn-solid step-next" onClick={placeOrder}>Place Order</button>
            </div>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div key="done" className="step-card step-done" {...slide}>
            <svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="#68b631" />
              <path fill="#fff" d="M9.5 15.5 6.3 12.3l-1.4 1.4 4.6 4.6 9-9-1.4-1.4z" />
            </svg>
            <h2>Order placed!</h2>
            <p className="step-hint">Order <strong>{orderId}</strong> is being prepared.<br />
              <span className="step-demo">Demo build - live orders route to the branch via the Cloud-Kitchen API in Phase 3.</span>
            </p>
            <Link href="/menu" className="btn btn-solid step-next">Back to Menu</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
