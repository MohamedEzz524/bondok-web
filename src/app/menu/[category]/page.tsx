import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { menuCategories } from '@/lib/menu-data';
import MenuBrowser from '@/components/MenuBrowser';
import MenuSkeleton from '@/components/MenuSkeleton';

interface Params { category: string; }

/* one page per category: /menu/[category] */
export function generateStaticParams(): Params[] {
  return menuCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params;
  const cat = menuCategories.find((c) => c.slug === category);
  if (!cat) return { title: 'Menu — Bondok Fried Chicken' };
  const title = `${cat.name} — Bondok Fried Chicken`;
  const description = cat.blurb ?? `Browse ${cat.name} at Bondok. Order for pickup or delivery.`;
  return { title, description };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  const cat = menuCategories.find((c) => c.slug === category);
  if (!cat) notFound();
  return (
    <div className="menu-page">
      <Suspense fallback={<MenuSkeleton />}>
        <MenuBrowser categories={menuCategories} initialCategory={category} />
      </Suspense>
    </div>
  );
}
