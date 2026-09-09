'use client';

/* Sign Up / Log In popup - phone + OTP, two steps (per the Bondok spec:
   phone number -> OTP verify, no password). Placeholder flow: no real SMS
   is sent yet; wiring to the SMS gateway lands with the backend. */

import { useEffect, useState } from 'react';
import { useUI } from './ui-context';
import Modal from './Modal';
import CloseIcon from './CloseIcon';

const AppleIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="currentColor" d="M16.36 12.9c-.02-2.03 1.66-3 1.73-3.05-.94-1.38-2.4-1.57-2.93-1.59-1.25-.13-2.44.73-3.07.73-.63 0-1.6-.71-2.64-.69-1.36.02-2.61.79-3.31 2-1.41 2.45-.36 6.08 1.01 8.07.67.97 1.47 2.06 2.51 2.02 1.01-.04 1.39-.65 2.61-.65 1.22 0 1.56.65 2.63.63 1.09-.02 1.78-.99 2.44-1.97.77-1.12 1.09-2.21 1.11-2.27-.02-.01-2.13-.82-2.15-3.24zM14.4 6.86c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.21-.52.6-.97 1.56-.85 2.48.9.07 1.83-.46 2.39-1.13z" />
  </svg>
);
const GoogleIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.34-.17-1.97H12v3.73h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.28z" />
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H3.06v2.58A10 10 0 0 0 12 22z" />
    <path fill="#FBBC05" d="M6.42 13.9a6 6 0 0 1 0-3.8V7.52H3.06a10 10 0 0 0 0 8.96l3.36-2.58z" />
    <path fill="#EA4335" d="M12 5.98c1.47 0 2.78.5 3.81 1.5l2.85-2.85C16.95 2.98 14.7 2 12 2A10 10 0 0 0 3.06 7.52l3.36 2.58C7.2 7.74 9.4 5.98 12 5.98z" />
  </svg>
);

export default function AuthModal() {
  const { authOpen, closeAuth } = useUI();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!authOpen) { setStep('phone'); setPhone(''); setCode(''); setNote(''); }
  }, [authOpen]);

  const sendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length < 10) { setNote('Please enter a valid phone number.'); return; }
    setNote('');
    setStep('otp'); // placeholder: real OTP is sent once the SMS gateway is connected
  };
  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) { setNote('Enter the code we sent you.'); return; }
    setNote('Preview only - accounts go live with the loyalty program.');
  };

  return (
    <Modal open={authOpen} onClose={closeAuth} label="Sign Up or Log In" overlayClass="auth-overlay" panelClass="auth-modal">
      <div className="auth-head">
        {step === 'otp' && (
          <button className="auth-back" aria-label="Back" onClick={() => { setStep('phone'); setNote(''); }}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="m15 6-6 6 6 6" /></svg>
          </button>
        )}
        <h2>Sign Up / Log In</h2>
        <button className="auth-close" aria-label="Close" onClick={closeAuth}><CloseIcon size={18} /></button>
      </div>

      {step === 'phone' ? (
        <>
          <button type="button" className="auth-social" onClick={() => setNote('Social sign-in arrives at launch.')}>
            {AppleIcon}<span>Continue with Apple</span>
          </button>
          <button type="button" className="auth-social" onClick={() => setNote('Social sign-in arrives at launch.')}>
            {GoogleIcon}<span>Continue with Google</span>
          </button>
          <div className="auth-or"><span>OR</span></div>
          <form className="auth-form" onSubmit={sendCode}>
            <label htmlFor="auth-phone">Phone Number<span aria-hidden="true">*</span></label>
            <div className="auth-phone">
              <span className="auth-phone-cc">🇪🇬 +20</span>
              <input
                id="auth-phone" type="tel" inputMode="tel" autoComplete="tel" required
                placeholder="1XX XXX XXXX" value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-solid auth-submit">Send Code</button>
            <p className="auth-hint">We&apos;ll text you a 6-digit verification code.</p>
          </form>
        </>
      ) : (
        <form className="auth-form" onSubmit={verify}>
          <p className="auth-otp-to">Enter the code we sent to<br /><strong>+20 {phone}</strong></p>
          <input
            className="auth-otp" type="text" inputMode="numeric" autoComplete="one-time-code"
            maxLength={6} placeholder="------" aria-label="Verification code"
            value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
          <button type="submit" className="btn btn-solid auth-submit">Verify &amp; Continue</button>
          <button type="button" className="auth-resend" onClick={() => setNote('Code resent.')}>Resend code</button>
        </form>
      )}

      {note && <p className="auth-note">{note}</p>}
    </Modal>
  );
}
