import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { menuCategories } from '@/lib/menu-data';
import ProductView from '@/components/ProductView';

interface Params { category: string; product: string; }

/* statically generate all product pages - each product gets its own
   ad/SEO-ready URL (scope: direct product links) */
export function generateStaticParams(): Params[] {
  return menuCategories.flatMap((c) =>
    c.products.map((p) => ({ category: c.slug, product: p.slug })),
  );
}

function findProduct(params: Params) {
  const category = menuCategories.find((c) => c.slug === params.category);
  const product = category?.products.find((p) => p.slug === params.product);
  return category && product ? { category, product } : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const found = findProduct(await params);
  if (!found) return { title: 'Bondok Fried Chicken' };
  const { category, product } = found;
  const title = `${product.name} — Bondok Fried Chicken`;
  const description = product.description ?? `${product.name} from our ${category.name} menu. Order now for pickup or delivery.`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: product.image }] },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const found = findProduct(await params);
  if (!found) notFound();
  const { category, product } = found;

  /* size-variant siblings (single/double/triple) */
  const base = product.slug.replace(/-(double|triple)$/, '');
  const sibs = category.products.filter(
    (x) => x.slug === base || x.slug === `${base}-double` || x.slug === `${base}-triple`,
  );
  const variants = product.size && sibs.length > 1 ? sibs : null;

  return <ProductView category={category} product={product} variants={variants} />;
}
