import type { Metadata } from 'next';
import { Suspense } from 'react';
import { menuCategories } from '@/lib/menu-data';
import MenuBrowser from '@/components/MenuBrowser';

export const metadata: Metadata = {
  title: 'Menu — Bondok Fried Chicken',
  description: 'Explore the full Bondok menu: fried chicken meals, sandwiches, burgers, rolls, tenders, sides and sauces.',
};

export default function MenuPage() {
  return (
    <div className="menu-page">
      <div className="menu-head">
        <h1>Our Menu</h1>
        <p>Golden, crispy, and made fresh - pick your favorites.</p>
      </div>
      <Suspense fallback={null}>
        <MenuBrowser categories={menuCategories} />
      </Suspense>
    </div>
  );
}
