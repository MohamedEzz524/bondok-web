import Link from 'next/link';

export default function BottomTabs() {
  return (
    <nav className="bottom-tabs" aria-label="Primary">
      <Link href="/" className="tab tab-active">
        <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2c-.6 2.4-2.6 4-2.6 6.4 0 .9.3 1.6.8 2.2-.9.3-2.2-.2-2.7-1.6-.9 1.1-1.5 2.6-1.5 4.2A6 6 0 0 0 18 13c0-4.2-3-6.4-3.5-9-.4 1.6-1.4 2.6-2.2 3.4.3-1.5.2-3.3-.3-4.8z" /></svg>
        <span>Home</span>
      </Link>
      <Link href="/offers" className="tab">
        <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20.6 11 13 3.4A2 2 0 0 0 11.6 3H5a2 2 0 0 0-2 2v6.6a2 2 0 0 0 .6 1.4L11.2 20.6a2 2 0 0 0 2.8 0l6.6-6.6a2 2 0 0 0 0-2.8zM7.5 8A1.5 1.5 0 1 1 7.5 5a1.5 1.5 0 0 1 0 3z" /></svg>
        <span>Offers</span>
      </Link>
      <Link href="/menu" className="tab">
        <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M13 2c-2.2 0-4 2.4-4 5.3 0 2.1 1.2 3.9 3 4.5V22h2V11.8c1.8-.6 3-2.4 3-4.5C17 4.4 15.2 2 13 2z" /></svg>
        <span>Menu</span>
      </Link>
      <Link href="/rewards" className="tab">
        <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h3v3h-3v-3zm5 0h3v3h-3v-3zm-5 5h3v3h-3v-3zm5 0h3v3h-3v-3z" /></svg>
        <span>Rewards</span>
      </Link>
      <Link href="/bag" className="tab">
        <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M7 7V6a5 5 0 0 1 10 0v1h3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" /></svg>
        <span>Bag</span>
      </Link>
    </nav>
  );
}
