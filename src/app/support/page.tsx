'use client';

/* /support merged into the unified Contact page (/complaints).
   Client redirect keeps old links working in the static export. */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Page() {
  const router = useRouter();
  useEffect(() => { router.replace('/complaints'); }, [router]);
  return (
    <div className="stub-page">
      <p>Support moved to our <Link href="/complaints">Contact page</Link> - taking you there…</p>
    </div>
  );
}
