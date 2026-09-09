'use client';

/* Sign Up / Log In popup - visual placeholder modeled on the reference
   (Popeyes) auth popup. NOTE: the agreed Bondok flow is phone + OTP (no
   email/password); this is a stand-in until that backend is wired. */

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
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => { if (!authOpen) { setEmail(''); setNote(''); } }, [authOpen]);

  /* placeholder: real auth (phone + OTP) is not built yet */
  const pending = () => setNote('Accounts launch soon - sign-in will use your phone number.');

  return (
    <Modal open={authOpen} onClose={closeAuth} label="Sign Up or Log In" overlayClass="auth-overlay" panelClass="auth-modal">
        <div className="auth-head">
          <h2>Sign Up / Log In</h2>
          <button className="auth-close" aria-label="Close" onClick={closeAuth}>
            <CloseIcon size={18} />
          </button>
        </div>

        <button className="auth-social auth-apple" onClick={pending}>
          {AppleIcon}<span>Continue with Apple</span>
        </button>
        <button className="auth-social auth-google" onClick={pending}>
          {GoogleIcon}<span>Continue with Google</span>
        </button>

        <div className="auth-or"><span>OR</span></div>

        <form
          className="auth-form"
          onSubmit={(e) => { e.preventDefault(); pending(); }}
        >
          <label htmlFor="auth-email">Email Address<span aria-hidden="true">*</span></label>
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <button type="submit" className="btn btn-solid auth-submit">Sign Up / Log In</button>
        </form>

        {note && <p className="auth-note">{note}</p>}
    </Modal>
  );
}
