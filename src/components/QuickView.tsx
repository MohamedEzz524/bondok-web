'use client';

/* Global product quick-add popup. Any ProductCard's "Add to Cart" opens this via
   ui-context.openQuickView(slug); it looks the product up and renders ProductModal. */

import { useUI } from './ui-context';
import ProductModal from './ProductModal';
import { findProduct } from '@/lib/upsell';

export default function QuickView() {
  const { quickView, openQuickView, closeQuickView } = useUI();
  if (!quickView) return null;
  const loc = findProduct(quickView);
  if (!loc) return null;
  return (
    <ProductModal
      product={loc.product}
      variants={null}
      onSelectVariant={(p) => openQuickView(p.slug)}
      onClose={closeQuickView}
    />
  );
}
