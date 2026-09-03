'use client';

import { useEffect, useState } from 'react';

interface Cat { slug: string; name: string; }

export default function CategoryNav({ categories }: { categories: Cat[] }) {
  const [active, setActive] = useState(categories[0]?.slug ?? '');

  /* highlight the chip of the section currently in view */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: '-140px 0px -60% 0px' },
    );
    categories.forEach((c) => {
      const el = document.getElementById(c.slug);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories]);

  return (
    <nav className="cat-nav" aria-label="Menu categories">
      <div className="cat-nav-inner">
        {categories.map((c) => (
          <a
            key={c.slug}
            href={`#${c.slug}`}
            className={`cat-chip${active === c.slug ? ' is-active' : ''}`}
          >
            {c.name}
          </a>
        ))}
      </div>
    </nav>
  );
}
