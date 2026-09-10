'use client';

/* DEMO account page. Reads the local session (useAuth). Lets the user set a
   display name, shows their phone + join date, quick links, and sign-out.
   Order history connects in the orders phase. */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './auth-context';

export default function AccountView() {
  const { user, ready, logout, updateName } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  /* not signed in -> back home (the header/drawer open the auth popup) */
  useEffect(() => { if (ready && !user) router.replace('/'); }, [ready, user, router]);
  useEffect(() => { if (user) setName(user.name); }, [user]);

  if (!ready || !user) return null;

  const initials = (user.name || 'B').trim().slice(0, 1).toUpperCase();
  const joined = new Date(user.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const saveName = (e: React.FormEvent) => {
    e.preventDefault();
    updateName(name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const signOut = () => { logout(); router.replace('/'); };

  return (
    <div className="acct-page">
      <header className="acct-hero">
        <span className="acct-avatar" aria-hidden="true">{initials}</span>
        <div>
          <p className="pg-eyebrow"><span className="pg-dot" aria-hidden="true" />Your account</p>
          <h1>{user.name ? `Hi, ${user.name.split(' ')[0]}` : 'Welcome to Bondok'}</h1>
          <p className="acct-sub">+20 {user.phone} · Member since {joined}</p>
        </div>
      </header>

      <div className="acct-grid">
        <section className="acct-card">
          <h2>Profile</h2>
          <form className="acct-form" onSubmit={saveName}>
            <label htmlFor="acct-name">Display name</label>
            <input id="acct-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Add your name" />
            <label htmlFor="acct-phone">Phone</label>
            <input id="acct-phone" value={`+20 ${user.phone}`} readOnly className="acct-readonly" />
            <button type="submit" className="btn btn-solid">{saved ? 'Saved ✓' : 'Save changes'}</button>
          </form>
        </section>

        <section className="acct-card">
          <h2>Quick links</h2>
          <nav className="acct-links">
            <Link href="/orders" className="acct-link"><span>🧾</span> Order history</Link>
            <Link href="/menu?fav=1" className="acct-link"><span>❤️</span> My favorites</Link>
            <Link href="/rewards" className="acct-link"><span>🎁</span> Rewards &amp; points</Link>
            <Link href="/branches" className="acct-link"><span>📍</span> Find a branch</Link>
          </nav>
          <button className="acct-signout" onClick={signOut}>Sign out</button>
        </section>
      </div>
    </div>
  );
}
