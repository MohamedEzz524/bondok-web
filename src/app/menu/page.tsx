import type { Metadata } from 'next';
import { menuCategories } from '@/lib/menu-data';
import CategoryNav from '@/components/CategoryNav';

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

      <CategoryNav categories={menuCategories.map((c) => ({ slug: c.slug, name: c.name }))} />

      {menuCategories.map((cat) => (
        <section key={cat.slug} id={cat.slug} className="menu-section">
          <div className="menu-section-head">
            <h2>{cat.name}</h2>
            <p>{cat.blurb}</p>
          </div>
          <div className="menu-grid">
            {cat.products.map((p) => (
              <article key={p.slug} className="product-card">
                <div className="product-imgwrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} loading="lazy" />
                </div>
                <div className="product-body">
                  <h3>{p.name}</h3>
                  {p.price !== undefined && <span className="product-price">EGP {p.price}</span>}
                  <button className="btn btn-outline product-add">Add to Bag</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
