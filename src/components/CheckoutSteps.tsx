'use client';

/* Checkout progress stepper (designer layout): Cart -> Shipping -> Payment
   -> Review -> Done. Completed steps show a check, the current step shows
   its number highlighted. */

import Link from 'next/link';

const STEPS = ['Cart', 'Shipping', 'Payment', 'Review', 'Done'];

export default function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="co-steps" aria-label="Checkout progress">
      {STEPS.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        const dot = (
          <span className="co-step-dot">
            {state === 'done' ? (
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="m5.5 12.5 4.2 4.2 8.8-9.4" /></svg>
            ) : (
              i + 1
            )}
          </span>
        );
        return (
          <li key={label} className={`co-step is-${state}`}>
            {i === 0 && current > 0 ? (
              <Link href="/bag" className="co-step-link" aria-label="Back to cart">{dot}</Link>
            ) : dot}
            <span className="co-step-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
