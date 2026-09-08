'use client';

/* Checkout flow - designer layout: Shipping -> Payment -> Review -> Done.
   Demo wiring: OTP login arrives with the SMS gateway, live fees/ETA with
   branch data / Cloud-Kitchen API, card processing with the payment
   gateway. Orders publish a bus event and clear the cart. */

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useCart } from './cart-context';
import { branches } from '@/lib/branches';
import { EVENTS, publish } from '@/lib/pubsub';
import CheckoutSteps from './CheckoutSteps';
import Select from './Select';

type Step = 'shipping' | 'payment' | 'review' | 'done';
const STEP_INDEX: Record<Step, number> = { shipping: 1, payment: 2, review: 3, done: 4 };

const EG_PHONE = /^01[0125][0-9]{8}$/;
const LOCATIONS = ['Home', 'Work / Office', 'Other Place'];

interface Shipping {
  mode: 'delivery' | 'pickup';
  location: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  building: string;
  notes: string;
  branch: string;
}

const slide = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: 'easeOut' as const },
};

const fmt = (v: number | null | undefined) => (v == null ? '—' : `EGP ${v}`);

export default function CheckoutFlow() {
  const { items, count, subtotal, clear } = useCart();
  const [step, setStep] = useState<Step>('shipping');
  const [ship, setShip] = useState<Shipping>({
    mode: 'delivery', location: 'Home', name: '', phone: '',
    address: '', city: 'Cairo', building: '', notes: '', branch: '',
  });
  const [pay, setPay] = useState<'card' | 'cod' | 'wallet'>('card');
  const [saveCard, setSaveCard] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [placed, setPlaced] = useState<{ items: typeof items; count: number; subtotal: number | null } | null>(null);
  const orderIdRef = useRef('');

  const orderId = useMemo(() => {
    if (!orderIdRef.current) orderIdRef.current = 'BD-' + String(Math.floor(100000 + Math.random() * 900000));
    return orderIdRef.current;
  }, []);

  const go = (next: Step) => { setError(''); setStep(next); window.scrollTo({ top: 0 }); };

  if (items.length === 0 && step !== 'done') {
    return (
      <div className="co-page">
        <CheckoutSteps current={1} />
        <div className="co-empty">
          <h1>Checkout</h1>
          <p>Your cart is empty - add some items first.</p>
          <Link href="/menu" className="btn btn-solid co-empty-btn">Explore the Menu</Link>
        </div>
      </div>
    );
  }

  const submitShipping = () => {
    if (!ship.name.trim()) { setError('Please enter your full name.'); return; }
    if (!EG_PHONE.test(ship.phone)) { setError('Please enter a valid Egyptian mobile number (01X XXXX XXXX).'); return; }
    if (ship.mode === 'delivery') {
      if (!ship.address.trim() || !ship.building.trim()) { setError('Please fill your address and building details.'); return; }
    } else if (!ship.branch) { setError('Please choose a pickup branch.'); return; }
    try { localStorage.setItem('bondok-shipping-v1', JSON.stringify(ship)); } catch { /* ignore */ }
    go('payment');
  };

  const placeOrder = () => {
    setPlaced({ items: [...items], count, subtotal });
    publish(EVENTS.orderPlaced, { source: 'checkout', orderId, count, subtotal });
    clear('checkout');
    go('done');
  };

  const copyId = () => {
    navigator.clipboard?.writeText(orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }).catch(() => { /* clipboard unavailable */ });
  };

  const maskedPhone = ship.phone
    ? `+20 ${ship.phone.slice(1, 3)}${ship.phone.slice(3, 4)} *** **${ship.phone.slice(-2)}`
    : 'your phone';

  const branchName = branches.find((b) => b.id === ship.branch)?.name;

  const recap = (
    <div className="co-recap">
      <div className="co-recap-head">
        <h3>Order Recap ({count} item{count > 1 ? 's' : ''})</h3>
        <Link href="/bag" className="co-edit-link">Edit</Link>
      </div>
      {items.map((it) => (
        <div key={it.key ?? it.slug} className="co-recap-item">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.image} alt="" />
          <div>
            <p className="co-recap-name">{it.name}</p>
            <p className="co-recap-desc">Qty: {it.qty}</p>
          </div>
          <strong>{fmt(it.price != null ? it.price * it.qty : null)}</strong>
        </div>
      ))}
      <p className="co-sumrow"><span>Subtotal</span><strong>{fmt(subtotal)}</strong></p>
      <p className="co-sumrow"><span>Standard Delivery Fee</span><strong className="co-fee">with branch data</strong></p>
      <p className="co-sumrow"><span>Taxes &amp; Service Surcharge</span><strong>Included</strong></p>
      <div className="co-recap-total">
        <p>Total amount</p>
        <strong>{fmt(subtotal)}</strong>
      </div>
    </div>
  );

  return (
    <div className="co-page">
      <CheckoutSteps current={STEP_INDEX[step]} />

      <AnimatePresence mode="wait" initial={false}>
        {step === 'shipping' && (
          <motion.div key="shipping" {...slide}>
            <header className="co-head">
              <h1>Delivery details</h1>
              <p className="co-subline">Where should we deliver your order hot, crisp, and fresh?</p>
            </header>

            <div className="co-mode">
              <button className={ship.mode === 'delivery' ? 'is-on' : ''} onClick={() => setShip({ ...ship, mode: 'delivery' })}>
                Delivery (Fast 30-min)
              </button>
              <button className={ship.mode === 'pickup' ? 'is-on' : ''} onClick={() => setShip({ ...ship, mode: 'pickup' })}>
                Pickup at Kitchen
              </button>
            </div>

            <div className="co-layout">
              <div className="co-card co-form">
                <div className="co-form-toprow">
                  <p className="ct-label ct-caps">Saved locations</p>
                  <span className="co-pinpoint">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 21s-6-5.7-6-10a6 6 0 1 1 12 0c0 4.3-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /></svg>
                    Pinpoint Accuracy
                  </span>
                </div>
                <div className="co-loc-chips">
                  {LOCATIONS.map((l) => (
                    <button key={l} className={ship.location === l ? 'is-on' : ''} onClick={() => setShip({ ...ship, location: l })}>{l}</button>
                  ))}
                </div>

                <div className="ct-row">
                  <div className="ct-field">
                    <label className="ct-label" htmlFor="co-name">Full Name <span className="ct-req">*</span></label>
                    <input id="co-name" className="ct-input" placeholder="Your name" value={ship.name} onChange={(e) => setShip({ ...ship, name: e.target.value })} />
                  </div>
                  <div className="ct-field">
                    <label className="ct-label" htmlFor="co-phone">Phone Number <span className="ct-req">*</span></label>
                    <div className="co-phone">
                      <span>🇪🇬 +20</span>
                      <input
                        id="co-phone" type="tel" inputMode="numeric" maxLength={11}
                        placeholder="10 1234 5678" value={ship.phone}
                        onChange={(e) => setShip({ ...ship, phone: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>
                </div>

                {ship.mode === 'delivery' ? (
                  <div className="ct-anim">
                    <div className="ct-row">
                      <div className="ct-field">
                        <label className="ct-label" htmlFor="co-addr">Delivery Address <span className="ct-req">*</span></label>
                        <input id="co-addr" className="ct-input" placeholder="Street, area" value={ship.address} onChange={(e) => setShip({ ...ship, address: e.target.value })} />
                      </div>
                      <div className="ct-field">
                        <label className="ct-label">City <span className="ct-req">*</span></label>
                        <Select
                          ariaLabel="City"
                          value={ship.city}
                          onChange={(v) => setShip({ ...ship, city: v })}
                          options={['Cairo', 'Giza', 'Alexandria', 'Mansoura'].map((c) => ({ value: c, label: c }))}
                        />
                      </div>
                    </div>
                    <div className="ct-field">
                      <label className="ct-label" htmlFor="co-bldg">Building / Apartment / Floor <span className="ct-req">*</span></label>
                      <input id="co-bldg" className="ct-input" placeholder="Building 14, Apt 4B, 3rd Floor" value={ship.building} onChange={(e) => setShip({ ...ship, building: e.target.value })} />
                    </div>
                    <div className="ct-field">
                      <label className="ct-label" htmlFor="co-notes">Delivery Notes <span className="ct-hint">Optional</span></label>
                      <textarea id="co-notes" className="ct-input ct-textarea" rows={3} placeholder="Leave at door, ring bell twice, extra napkins please." value={ship.notes} onChange={(e) => setShip({ ...ship, notes: e.target.value })} />
                    </div>
                  </div>
                ) : (
                  <div className="ct-field ct-anim">
                    <label className="ct-label">Pickup Branch <span className="ct-req">*</span></label>
                    <Select
                      ariaLabel="Pickup branch"
                      value={ship.branch}
                      onChange={(v) => setShip({ ...ship, branch: v })}
                      options={[{ value: '', label: 'Choose a branch' }, ...branches.map((b) => ({ value: b.id, label: b.name }))]}
                    />
                  </div>
                )}

                {error && <p className="ct-error" role="alert">{error}</p>}
                <button className="btn btn-solid co-cta" onClick={submitShipping}>
                  Continue to Payment
                  <svg viewBox="0 0 54 54" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M40.4 29.8H0v-6.6h40.4L21.8 4.6 26.5 0l26.6 26.5-26.6 26.5-4.7-4.6 18.6-18.6z" /></svg>
                </button>
                <p className="co-demo">Phone verification (OTP) activates with the SMS gateway.</p>
              </div>

              <aside className="co-side">
                <div className="co-card co-coverage">
                  <div className="co-card-head">
                    <h3>Live Coverage Hub</h3>
                    <span className="co-zone-chip">Within zone</span>
                  </div>
                  <div className="co-map-mini">
                    <span className="co-map-tag"><span className="pg-dot" aria-hidden="true" />Bondok Kitchen: nearest branch</span>
                  </div>
                </div>
                <div className="co-card co-eta">
                  <div className="co-card-head">
                    <p className="ct-label ct-caps">Estimated arrival</p>
                    <span className="co-chip">⚡ Fastest Route</span>
                  </div>
                  <p className="co-eta-num">25 - 40 <span>minutes</span></p>
                  <div className="co-eta-note">
                    <span className="co-eta-ic co-eta-ic-img" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/icon-temp1.png" alt="" width="40" height="40" />
                    </span>
                    <p><strong>Hot &amp; Fresh Kitchen Dispatch</strong><br />Prepared right after you confirm payment. Live distance arrives with branch data.</p>
                  </div>
                </div>
                {recap}
              </aside>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div key="payment" {...slide}>
            <header className="co-head">
              <h1>Payment method</h1>
              <p className="co-subline">Choose how you&apos;d like to pay for your handcrafted Bondok order.</p>
            </header>

            <div className="co-layout">
              <div className="co-paycol">
                <div className={`co-payopt${pay === 'card' ? ' is-on' : ''}`}>
                  <button className="co-payopt-head" onClick={() => setPay('card')}>
                    <span className="co-radio">{pay === 'card' && <span />}</span>
                    <span className="co-payopt-title">
                      <strong>Credit / Debit Card</strong>
                      <span className="co-chip co-chip-warm">Instant</span>
                    </span>
                    <span className="co-paylogos">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/card-logos.png" alt="Visa and Mastercard" height="26" />
                    </span>
                  </button>
                  <p className="co-payopt-desc">Fast, encrypted and secure checkout with 3D Secure verification</p>
                  {pay === 'card' && (
                    <div className="co-cardform ct-anim">
                      <div className="ct-field">
                        <label className="ct-label" htmlFor="co-cardno">Card Number</label>
                        <input id="co-cardno" className="ct-input" inputMode="numeric" placeholder="4242 •••• •••• 4242" disabled title="Card processing activates with the payment gateway" />
                      </div>
                      <div className="ct-row">
                        <div className="ct-field">
                          <label className="ct-label" htmlFor="co-exp">Expiry Date</label>
                          <input id="co-exp" className="ct-input" placeholder="MM/YY" disabled />
                        </div>
                        <div className="ct-field">
                          <label className="ct-label" htmlFor="co-cvv">Security Code (CVV) <span className="ct-hint">3 Digits</span></label>
                          <input id="co-cvv" className="ct-input" placeholder="•••" disabled />
                        </div>
                      </div>
                      <div className="ct-field">
                        <label className="ct-label" htmlFor="co-holder">Cardholder Full Name</label>
                        <input id="co-holder" className="ct-input" placeholder="Name on card" disabled />
                      </div>
                      <label className="ct-consent co-save">
                        <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />
                        <span>Save this card for 1-click checkout next time</span>
                      </label>
                      <p className="co-demo">Card fields activate with the payment gateway - demo orders use Cash on Delivery.</p>
                      <div className="co-badgerow">
                        <span>✔ 256-Bit Bank-Grade SSL</span>
                        <span>🛡 Verified by VISA</span>
                        <span>🔒 Mastercard ID Check</span>
                      </div>
                    </div>
                  )}
                </div>

                <button className={`co-payopt co-payopt-btn${pay === 'cod' ? ' is-on' : ''}`} onClick={() => setPay('cod')}>
                  <span className="co-radio">{pay === 'cod' && <span />}</span>
                  <span className="co-payopt-body">
                    <strong>Cash on Delivery</strong>
                    <span>Pay when you receive your meal at your door with cash or courier POS terminal</span>
                  </span>
                  <span className="co-payopt-ic" aria-hidden="true"><img src="/icons/icon-wallet.svg" alt="" width="22" /></span>
                </button>

                <button className={`co-payopt co-payopt-btn${pay === 'wallet' ? ' is-on' : ''}`} onClick={() => setPay('wallet')}>
                  <span className="co-radio">{pay === 'wallet' && <span />}</span>
                  <span className="co-payopt-body">
                    <strong>Digital Wallet / Vodafone Cash <span className="co-chip">Fast Pay</span></strong>
                    <span>Instantly transfer via Orange Money, Vodafone Cash, or InstaPay</span>
                  </span>
                  <span className="co-payopt-ic" aria-hidden="true"><img src="/icons/icon-secure.png" alt="" width="20" /></span>
                </button>

                <div className="co-guarantee">
                  <span className="co-guarantee-ic co-guarantee-ic-img" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icons/icon-temp2.png" alt="" width="46" height="46" />
                  </span>
                  <p><strong>Made-to-Order Freshness Guarantee</strong><br />Your meal is prepped the moment the kitchen receives verified payment clearance.</p>
                </div>
              </div>

              <aside className="co-side">
                <div className="co-card co-paysum">
                  <div className="co-summary-head">
                    <h3>Payment Summary</h3>
                    <span className="co-chip">{count} items</span>
                  </div>
                  <div className="co-paymethod-tag">
                    <span className="co-paymethod-ic" aria-hidden="true"><img src="/icons/icon-wallet.svg" alt="" width="20" /></span>
                    <div>
                      <p><strong>{pay === 'card' ? 'Credit / Debit Card' : pay === 'cod' ? 'Cash on Delivery' : 'Digital Wallet'}</strong></p>
                      <p className="co-recap-desc">{pay === 'cod' ? 'Pay at your door' : 'Activates with payment gateway'}</p>
                    </div>
                    <span className="co-paymethod-ok">✓</span>
                  </div>
                  <p className="co-sumrow"><span>Subtotal ({count} items)</span><strong>{fmt(subtotal)}</strong></p>
                  <p className="co-sumrow"><span>Priority Delivery</span><strong className="co-fee">with branch data</strong></p>
                  <p className="co-sumrow co-sumrow-green"><span>Promo Discount</span><strong>− EGP 0</strong></p>
                  <div className="co-total">
                    <div>
                      <p className="co-total-label">Total due</p>
                      <p className="co-total-sub">Inclusive of VAT</p>
                    </div>
                    <p className="co-total-num">{fmt(subtotal)}</p>
                  </div>
                  <button className="btn btn-solid co-cta" onClick={() => go('review')}>
                    Continue to Review
                    <svg viewBox="0 0 54 54" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M40.4 29.8H0v-6.6h40.4L21.8 4.6 26.5 0l26.6 26.5-26.6 26.5-4.7-4.6 18.6-18.6z" /></svg>
                  </button>
                  <p className="co-demo co-center">You will not be charged until the final review step.</p>
                  {items[0] && (
                    <div className="co-paysum-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={items[0].image} alt="" />
                      <div>
                        <p className="co-recap-name">{items[0].name}{count > 1 ? ` + ${count - 1} more` : ''}</p>
                        <p className="co-recap-desc">
                          {ship.mode === 'pickup'
                            ? `Pickup at ${branchName ?? 'your branch'}`
                            : `Delivering to ${ship.address || 'your address'}, ${ship.city}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <button className="co-back" onClick={() => go('shipping')}>← Back to delivery details</button>
              </aside>
            </div>
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div key="review" {...slide}>
            <header className="co-head co-head-center">
              <h1>Order review</h1>
              <p className="co-subline">Review your order details before placing it.</p>
            </header>

            <div className="co-layout">
              <div className="co-reviewcol">
                <div className="co-card">
                  <div className="co-card-head">
                    <h3 className="co-card-title">
                      <span className="co-title-ic" aria-hidden="true"><img src="/icons/icon-shipping.svg" alt="" width="22" /></span>
                      {ship.mode === 'pickup' ? 'Pickup Details' : 'Delivery Details'}
                    </h3>
                    <button className="co-edit-link" onClick={() => go('shipping')}>✎ Edit</button>
                  </div>
                  <div className="co-review-grid">
                    <div className="co-panel">
                      <p className="ct-label ct-caps">Recipient &amp; contact</p>
                      <p className="co-panel-main">{ship.name}</p>
                      <p className="co-recap-desc">+20 {ship.phone}</p>
                    </div>
                    <div className="co-panel">
                      <p className="ct-label ct-caps">{ship.mode === 'pickup' ? 'Pickup branch' : 'Destination'}</p>
                      <p className="co-panel-main">{ship.mode === 'pickup' ? (branchName ?? '—') : `${ship.address}${ship.building ? `, ${ship.building}` : ''}`}</p>
                      {ship.mode === 'delivery' && <p className="co-recap-desc">{ship.city}, Egypt</p>}
                    </div>
                  </div>
                  <div className="co-etabar">
                    <span className="co-etabar-ic" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7.5V12l3 2" /></svg>
                    </span>
                    <div>
                      <p className="ct-label ct-caps co-etabar-label">Estimated {ship.mode === 'pickup' ? 'pickup' : 'delivery'} time</p>
                      <p className="co-etabar-num">25 - 40 min</p>
                    </div>
                    <span className="co-express"><span className="pg-dot" aria-hidden="true" />Express Ready</span>
                  </div>
                </div>

                <div className="co-card">
                  <div className="co-card-head">
                    <h3 className="co-card-title"><span className="co-title-ic" aria-hidden="true"><img src="/icons/icon-wallet.svg" alt="" width="20" /></span>Payment Method</h3>
                    <button className="co-edit-link" onClick={() => go('payment')}>✎ Edit</button>
                  </div>
                  <div className="co-panel co-panel-row">
                    <span className="co-visa-chip">{pay === 'card' ? 'VISA' : pay === 'cod' ? 'CASH' : 'WALLET'}</span>
                    <div>
                      <p className="co-panel-main">{pay === 'card' ? 'Credit / Debit Card' : pay === 'cod' ? 'Cash on Delivery' : 'Digital Wallet / Vodafone Cash'}</p>
                      <p className="co-recap-desc">{pay === 'card' ? 'activates with payment gateway' : pay === 'cod' ? 'pay at your door' : 'activates with payment gateway'}</p>
                    </div>
                    <div className="co-billing">
                      <p className="ct-label ct-caps">Billing address</p>
                      <p className="co-recap-desc">Same as delivery address</p>
                    </div>
                  </div>
                </div>

                <div className="co-guarantee">
                  <span className="co-guarantee-ic" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="1.9"><path strokeLinejoin="round" d="M12 2 4 5v6c0 5 3.4 8.6 8 11 4.6-2.4 8-6 8-11V5l-8-3z" /><path strokeLinecap="round" strokeLinejoin="round" d="m8.5 12 2.5 2.5 4.5-5" /></svg>
                  </span>
                  <p><strong>100% On-Time Guarantee:</strong> Arrives fresh and warm, or your next combo meal is on us.</p>
                </div>
              </div>

              <aside className="co-side">
                <div className="co-card">
                  <div className="co-card-head">
                    <h3 className="co-card-title"><span className="co-title-ic co-title-ic-solid" aria-hidden="true"><img src="/icons/icon-bag.svg" alt="" width="15" /></span>Order Items <span className="co-chip">{count} items</span></h3>
                    <Link href="/bag" className="co-edit-link">✎ Edit</Link>
                  </div>
                  {items.map((it) => (
                    <div key={it.key ?? it.slug} className="co-recap-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.image} alt="" />
                      <div>
                        <p className="co-recap-name">{it.name}</p>
                        <span className="co-qty-chip">Qty: {it.qty}</span>
                      </div>
                      <strong>{fmt(it.price != null ? it.price * it.qty : null)}</strong>
                    </div>
                  ))}
                  <div className="co-panel co-totalspanel">
                    <p className="co-sumrow"><span>Subtotal</span><strong>{fmt(subtotal)}</strong></p>
                    <p className="co-sumrow"><span>Delivery Fee ⚡</span><strong className="co-fee">with branch data</strong></p>
                    <p className="co-sumrow"><span>Applicable Taxes</span><strong>Included</strong></p>
                    <div className="co-total">
                      <div>
                        <p className="co-total-label">Total</p>
                        <p className="co-total-sub">{pay === 'cod' ? 'Pay on delivery' : 'Ready to charge'}</p>
                      </div>
                      <p className="co-total-num">{fmt(subtotal)}</p>
                    </div>
                  </div>
                  <button className="btn btn-solid co-cta co-place" onClick={placeOrder}>
                    <span>Place Order</span>
                    <span className="co-place-total">{fmt(subtotal)}
                      <svg viewBox="0 0 54 54" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M40.4 29.8H0v-6.6h40.4L21.8 4.6 26.5 0l26.6 26.5-26.6 26.5-4.7-4.6 18.6-18.6z" /></svg>
                    </span>
                  </button>
                  <p className="co-demo co-center">By tapping Place Order, you confirm your craving and agree to Terms.</p>
                </div>
              </aside>
            </div>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div key="done" {...slide}>
            <div className="co-confirm-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/Order-confirmed.png" alt="" width="96" />
              <h1>Order confirmed!</h1>
              <p className="co-subline">Thank you for choosing Bondok. Your order is on the way!</p>
            </div>

            <div className="co-layout">
              <div className="co-reviewcol">
                <div className="co-card co-receipt">
                  <span className="co-ribbon" aria-hidden="true">Priority Prep</span>
                  <p className="ct-label ct-caps">Receipt ID</p>
                  <div className="co-receipt-row">
                    <h3>#{orderId}</h3>
                    <button className="co-copy" onClick={copyId} aria-label="Copy receipt id">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {copied ? <span className="co-copied">Copied!</span> : <img src="/icons/icon-clipboard.svg" alt="" width="15" />}
                    </button>
                  </div>

                  <div className="co-review-grid">
                    <div className="co-panel">
                      <p className="co-panel-cap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/icon-estimated.svg" alt="" width="14" />
                        Estimated {ship.mode === 'pickup' ? 'Pickup' : 'Delivery'}
                      </p>
                      <p className="co-panel-main">25 - 40 min</p>
                      <p className="co-recap-desc">Dispatches in ~8 mins</p>
                    </div>
                    <div className="co-panel">
                      <p className="co-panel-cap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/icon-wallet.svg" alt="" width="16" />
                        Payment Method
                      </p>
                      <p className="co-panel-main">{fmt(placed?.subtotal)}</p>
                      <p className="co-recap-desc">{pay === 'card' ? 'Card - activates with gateway' : pay === 'cod' ? 'Cash on Delivery' : 'Digital Wallet'}</p>
                    </div>
                  </div>

                  <div className="co-panel co-deliverto">
                    <div className="co-deliverto-head">
                      <p className="co-panel-cap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/Icon-location.svg" alt="" width="12" />
                        {ship.mode === 'pickup' ? 'Picking Up From' : 'Delivering To'}
                      </p>
                      <span className="co-chip">{ship.mode === 'pickup' ? 'Pickup' : 'Doorstep'}</span>
                    </div>
                    <p className="co-panel-main">{ship.name || '—'}</p>
                    <p className="co-recap-desc">
                      {ship.mode === 'pickup' ? (branchName ?? '—') : `${ship.address}${ship.building ? `, ${ship.building}` : ''}, ${ship.city}`}
                    </p>
                  </div>

                  <div className="co-panel co-progress">
                    <div className="co-progress-row">
                      <p className="co-progress-label">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/icon-preparing-meal.svg" alt="" width="15" />
                        Preparing meal
                      </p>
                      <span className="co-recap-desc">Courier assigned soon</span>
                    </div>
                    <span className="br-bar"><span style={{ width: '34%' }} /></span>
                  </div>

                  <p className="co-sms">
                    We&apos;ll do our best to get your order to you fast! An SMS confirmation arrives at
                    {' '}{maskedPhone} once the SMS gateway is live.
                  </p>

                  <div className="co-confirm-btns">
                    <button className="btn btn-solid co-track" title="Live tracking arrives with the Cloud-Kitchen API">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/icon-track-your-order.svg" alt="" width="17" />
                      Track Your Order
                    </button>
                    <Link href="/" className="co-home">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/Icon-back-to-home.svg" alt="" width="17" />
                      Back to Home
                    </Link>
                  </div>
                </div>

                <div className="co-guarantee">
                  <span className="co-guarantee-ic co-guarantee-ic-light" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icons/icon-guarantee.svg" alt="" width="18" />
                  </span>
                  <p><strong>100% Satisfaction Guarantee</strong><br />Hot &amp; crispy promise. Need help? The hotline number arrives with launch.</p>
                  <Link href="/complaints" className="co-edit-link co-helpdesk">Help Desk</Link>
                </div>
              </div>

              <aside className="co-side">
                <div className="co-card co-promo">
                  <div className="co-promo-img">
                    <div className="co-promo-quote">
                      <p className="co-promo-cap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/heart.svg" alt="" width="13" />
                        Bondok Kitchen Craft
                      </p>
                      <p className="co-promo-line">&ldquo;Same Great Taste,</p>
                      <p className="co-promo-line co-promo-line-orange">Now at Your Door!&rdquo;</p>
                    </div>
                    <span className="co-promo-smiley" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/icon-smiley.svg" alt="" width="30" />
                    </span>
                  </div>
                  <div className="co-delivery-items">
                    <div className="co-card-head">
                      <h3 className="co-delivery-title">Items in this delivery</h3>
                      <span className="co-recap-desc">{placed?.count ?? 0} Items</span>
                    </div>
                    {(placed?.items ?? []).map((it) => (
                      <p key={it.key ?? it.slug} className="co-sumrow">
                        <span>{it.qty}× {it.name}</span>
                        <strong>{fmt(it.price != null ? it.price * it.qty : null)}</strong>
                      </p>
                    ))}
                  </div>
                </div>
                <div className="co-guarantee co-dispatch">
                  <span className="co-dispatch-ic" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icons/icon-temp1.png" alt="" width="34" height="34" />
                  </span>
                  <p><strong>Fast Courier Dispatch</strong><br />Express delivery fleet in your area</p>
                  <span className="co-chip co-chip-warm">Live</span>
                </div>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
