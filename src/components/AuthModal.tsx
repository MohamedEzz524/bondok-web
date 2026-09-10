'use client';

/* Sign Up / Log In popup - phone + OTP, two steps (per the Bondok spec:
   phone number -> OTP verify, no password). Placeholder flow: no real SMS
   is sent yet; wiring to the SMS gateway lands with the backend. */

import { useEffect, useState } from 'react';
import { useUI } from './ui-context';
import { useAuth } from './auth-context';
import Modal from './Modal';
import OtpInput from './OtpInput';
import CloseIcon from './CloseIcon';

const DEMO_CODE = '1234';   // demo OTP until the real SMS gateway is connected

export default function AuthModal() {
  const { authOpen, closeAuth } = useUI();
  const { login } = useAuth();
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
    setCode('');
    setStep('otp');
  };

  const submitCode = (value: string) => {
    if (value !== DEMO_CODE) {
      setNote(value.length < 4 ? 'Enter the 4-digit code.' : 'Incorrect code — for this demo, enter 1234.');
      return;
    }
    login(phone);   // persists the demo session
    closeAuth();
  };
  const verify = (e: React.FormEvent) => { e.preventDefault(); submitCode(code); };

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
          <p className="auth-lead">Enter your phone number to sign in or create an account - we&apos;ll text you a verification code.</p>
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
          <OtpInput length={4} value={code} onChange={setCode} onComplete={submitCode} />
          <p className="auth-demo-hint">Demo mode — enter <strong>1234</strong> to continue.</p>
          <button type="submit" className="btn btn-solid auth-submit">Verify &amp; Continue</button>
          <button type="button" className="auth-resend" onClick={() => setNote('Code resent.')}>Resend code</button>
        </form>
      )}

      {note && <p className="auth-note">{note}</p>}
    </Modal>
  );
}
