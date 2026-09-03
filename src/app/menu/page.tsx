import type { Metadata } from 'next';
import { Suspense } from 'react';
import { menuCategories } from '@/lib/menu-data';
import MenuBrowser from '@/components/MenuBrowser';
import MenuSkeleton from '@/components/MenuSkeleton';

export const metadata: Metadata = {
  title: 'Menu — Bondok Fried Chicken',
  description: 'Explore the full Bondok menu: fried chicken meals, sandwiches, burgers, rolls, tenders, sides and sauces.',
};

export default function MenuPage() {
  return (
    <div className="menu-page">
      <Suspense fallback={<MenuSkeleton />}>
        <MenuBrowser categories={menuCategories} />
      </Suspense>
    </div>
  );
}
