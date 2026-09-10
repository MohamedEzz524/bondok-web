'use client';

/* Product page - designer layout: gallery (thumbs/dots only when 2+
   images) + frequently-bought-together on the left; details, make-it-a-
   combo toggle, per-product option groups, add-ons, kitchen note, and the
   live-total Add to Cart on the right; you-may-also-like carousel below.
   Option groups + deltas are SAMPLE data until the client menu arrives. */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MenuCategory, Product } from '@/lib/menu-data';
import { optionsFor } from '@/lib/product-options';
import { suggestFor, findProduct } from '@/lib/upsell';
import { useCart } from './cart-context';
import { useCatalog } from './catalog-context';
import { usePrefs } from './prefs-context';
import FavButton from './FavButton';
import ProductBadges from './ProductBadges';

interface Props {
  category: MenuCategory;
  product: Product;
  variants: Product[] | null;
}

const SIZE_LABEL: Record<string, string> = { single: 'Single', double: 'Double', triple: 'Triple' };

export default function ProductView({ category, product, variants }: Props) {
  const router = useRouter();
  const { add } = useCart();
  const { priceOf } = useCatalog();
  const branchPrice = priceOf(product.slug);   // active-branch base price; undefined until a branch is chosen
  const { recordView } = usePrefs();
  const config = useMemo(() => optionsFor(product, category.slug), [product, category.slug]);

  const [qty, setQty] = useState(1);
  const [combo, setCombo] = useState(false);
  const [single, setSingle] = useState<Record<string, number>>(() =>
    Object.fromEntries(config.groups.filter((g) => g.type === 'single').map((g) => [g.key, g.defaultIdx ?? 0])),
  );
  const [multi, setMulti] = useState<Record<string, number[]>>({});
  const [note, setNote] = useState('');
  const [imgIdx, setImgIdx] = useState(0);
  const [shared, setShared] = useState(false);
  const alsoRef = useRef<HTMLDivElement>(null);

  /* gallery: single image today; the array shape is API-ready */
  const images = [product.image];

  /* selection summary + sample delta total */
  const { optionLabels, delta } = useMemo(() => {
    const labels: string[] = [];
    let d = 0;
    for (const g of config.groups) {
      if (g.type === 'single') {
        const c = g.choices[single[g.key] ?? g.defaultIdx ?? 0];
        if (c) { labels.push(`${g.label}: ${c.label}`); d += c.delta; }
      } else {
        for (const idx of multi[g.key] ?? []) {
          const c = g.choices[idx];
          if (c) { labels.push(`+ ${c.label}`); d += c.delta; }
        }
      }
    }
    if (combo && config.combo) { labels.push(`Combo (${config.combo.includes})`); d += config.combo.delta; }
    return { optionLabels: labels, delta: d };
  }, [config, single, multi, combo]);

  const unitPrice = branchPrice != null ? branchPrice + delta : null;

  const toggleMulti = (key: string, idx: number) => {
    setMulti((m) => {
      const cur = m[key] ?? [];
      return { ...m, [key]: cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx] };
    });
  };

  const addToCart = () => {
    const hash = [combo ? 'c' : '', ...optionLabels].join('|');
    add({
      slug: product.slug,
      key: hash ? `${product.slug}::${hash}` : product.slug,
      name: combo ? `${product.name} Combo` : product.name,
      image: product.image,
      price: unitPrice ?? undefined,
      basePrice: branchPrice,
      optionsDelta: delta,
      options: optionLabels.length ? optionLabels : undefined,
      note: note.trim() || undefined,
    }, 'pdp', qty);
  };

  const share = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: product.name, url }).catch(() => { /* dismissed */ });
    else {
      navigator.clipboard?.writeText(url).then(() => { setShared(true); setTimeout(() => setShared(false), 1500); });
    }
  };

  /* frequently bought together: product + fries + coleslaw */
  const fbt = useMemo(() => {
    const extras = ['french-fries', 'coleslaw']
      .map((s) => findProduct(s)?.product)
      .filter((p): p is Product => !!p && p.slug !== product.slug);
    /* overlay active-branch prices onto the bundle products */
    return [product, ...extras].map((p) => ({ ...p, price: priceOf(p.slug) }));
  }, [product, priceOf]);
  const fbtTotal = fbt.every((p) => p.price != null) ? fbt.reduce((s, p) => s + (p.price ?? 0), 0) : null;
  const addBundle = () => {
    for (const p of fbt) add({ slug: p.slug, name: p.name, image: p.image, price: p.price }, 'pdp-bundle');
  };

  const also = useMemo(
    () => suggestFor(product.slug, 6).map((p) => ({ ...p, price: priceOf(p.slug) })),
    [product.slug, priceOf],
  );
  const scrollAlso = (dir: number) => alsoRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

  /* record view for "recently viewed" (effect, not render — recordView setStates PrefsProvider) */
  useEffect(() => { recordView(product.slug); }, [product.slug, recordView]);

  /* when the product has variant sizes (Single/Double/Triple), drop the
     duplicate customize "size" group so size isn't asked twice */
  const numbered = config.groups.filter((g) => g.choices.length > 0 && !(variants && g.key === 'size'));

  return (
    <div className="pd-page">
      <div className="pd-layout">
        {/* left: gallery + bundle */}
        <div className="pd-left">
          <div className="pd-gallery">
            <div className="pd-stage">
              <ProductBadges tags={product.tags} className="pd-badges" />
              {config.badge && <span className="pd-badge">{config.badge}</span>}
              <button className="pd-share" aria-label="Share this product" onClick={share}>
                {shared ? <span className="pd-shared">Link copied!</span> : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src="/icons/Icon-share.png" alt="" width="15" />
                )}
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[imgIdx]} alt={product.name} />
              {images.length > 1 && (
                <div className="pd-dots" aria-hidden="true">
                  {images.map((_, i) => <span key={i} className={i === imgIdx ? 'is-on' : ''} />)}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="pd-thumbs">
                {images.map((src, i) => (
                  <button key={i} className={`pd-thumb${i === imgIdx ? ' is-on' : ''}`} onClick={() => setImgIdx(i)} aria-label={`Image ${i + 1}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {fbt.length > 1 && (
            <section className="pd-fbt">
              <div className="pd-fbt-head">
                <div>
                  <h2>Frequently bought together</h2>
                  <p className="pg-sub">Complete your meal and save with this combo pack.</p>
                </div>
                <span className="pd-save-chip">Bundle deal</span>
              </div>
              <div className="pd-fbt-row">
                <div className="pd-fbt-items">
                  {fbt.map((p, i) => (
                    <div key={p.slug} className="pd-fbt-item">
                      {i > 0 && <span className="pd-fbt-plus" aria-hidden="true">+</span>}
                      <div className="pd-fbt-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.name} />
                        <span className="pd-fbt-check" aria-hidden="true"><img src="/icons/icon-rounded-check1.svg" alt="" width="18" /></span>
                      </div>
                      <p className="pd-fbt-name">{p.name}</p>
                      <p className="pd-fbt-price">{p.price != null ? `EGP ${p.price}` : '—'}</p>
                    </div>
                  ))}
                </div>
                <div className="pd-fbt-cta">
                  <p className="ct-label ct-caps">Bundle price</p>
                  <p className="pd-fbt-total">{fbtTotal != null ? `EGP ${fbtTotal}` : 'with menu prices'}</p>
                  <button className="btn btn-solid pd-fbt-btn" onClick={addBundle}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icons/icon-cart.svg" alt="" width="16" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* right: details + options */}
        <div className="pd-details">
          <div className="pd-card">
            <div className="pd-toprow">
              <p className="pd-rating">
                <span className="pd-star" aria-hidden="true"><img src="/icons/Icon-star.svg" alt="" width="15" /></span>
                <strong>4.8</strong> <span>(1.2k reviews)</span>
              </p>
              <FavButton slug={product.slug} />
            </div>
            <h1>{product.name}</h1>
            <p className="pd-desc">
              {product.description ?? `${product.name} from our ${category.name} lineup - full description arrives with the menu data.`}
            </p>
            <div className="pd-pricerow">
              <p className="pd-price">
                {unitPrice != null ? <strong>EGP {unitPrice}</strong> : <strong className="pd-price-pending">Price with menu data</strong>}
                <span>All taxes included</span>
              </p>
              <span className="co-qty">
                <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <b>{qty}</b>
                <button className="co-qty-plus" aria-label="Increase quantity" onClick={() => setQty(qty + 1)}>+</button>
              </span>
            </div>
          </div>

          {variants && (
            <div className="pd-card pd-variants">
              <p className="ct-label ct-caps">Choose your size</p>
              <div className="pd-pills">
                {variants.map((v) => (
                  <button
                    key={v.slug}
                    className={`pd-pill pd-pill-img${v.slug === product.slug ? ' is-on' : ''}`}
                    onClick={() => v.slug !== product.slug && router.push(`/menu/${category.slug}/${v.slug}`)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="pd-pill-thumb" src={v.image} alt="" />
                    <span>{SIZE_LABEL[v.size ?? 'single'] ?? v.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {config.combo && (
            <div className="pd-card pd-combo">
              <span className="pd-combo-ic" aria-hidden="true">
                {config.combo.items?.length
                  ? config.combo.items.flatMap((it, i) => [
                      i > 0 ? <span key={`p${i}`} className="pd-combo-plus">+</span> : null,
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img key={it.label} className="pd-combo-thumb" src={it.image} alt="" />,
                    ])
                  /* eslint-disable-next-line @next/next/no-img-element */
                  : <img src="/icons/HOT.png" alt="" width="26" />}
              </span>
              <div className="pd-combo-body">
                <p className="pd-combo-title">
                  Make it a combo
                  <span className="co-chip co-chip-warm">+ EGP {config.combo.delta}</span>
                </p>
                <p className="pd-combo-sub">Includes {config.combo.includes}</p>
              </div>
              <button
                role="switch"
                aria-checked={combo}
                aria-label="Make it a combo"
                className={`pd-switch${combo ? ' is-on' : ''}`}
                onClick={() => setCombo(!combo)}
              >
                <span />
              </button>
            </div>
          )}

          {numbered.length > 0 && (
            <div className="pd-card pd-custom">
              <h2>Customize your order</h2>
              {numbered.map((g, gi) => (
                <div key={g.key} className="pd-group">
                  <div className="pd-group-head">
                    <p className="pd-group-title">
                      <span className="pd-group-n">{gi + 1}</span>
                      {g.label}
                    </p>
                    <span className="pd-group-cur">
                      {g.type === 'single'
                        ? g.choices[single[g.key] ?? g.defaultIdx ?? 0]?.label
                        : 'Pick multiple'}
                    </span>
                  </div>
                  {g.type === 'single' ? (
                    <div className="pd-pills">
                      {g.choices.map((c, i) => (
                        <button
                          key={c.label}
                          className={`pd-pill${(single[g.key] ?? g.defaultIdx ?? 0) === i ? ' is-on' : ''}${c.image ? ' pd-pill-img' : ''}`}
                          onClick={() => setSingle({ ...single, [g.key]: i })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {c.image && <img className="pd-pill-thumb" src={c.image} alt="" />}
                          <span>{c.label}{c.delta > 0 ? ` (+${c.delta})` : ''}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="pd-checks">
                      {g.choices.map((c, i) => {
                        const on = (multi[g.key] ?? []).includes(i);
                        return (
                          <label key={c.label} className={`pd-check${on ? ' is-on' : ''}`}>
                            <input type="checkbox" checked={on} onChange={() => toggleMulti(g.key, i)} />
                            <span className="pd-check-box" aria-hidden="true">
                              {on && <svg viewBox="0 0 24 24" width="13" height="13"><path fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" d="m5.5 12.5 4.2 4.2 8.8-9.4" /></svg>}
                            </span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {c.image && <img className="pd-check-img" src={c.image} alt="" />}
                            <span className="pd-check-label">{c.label}</span>
                            <strong>+ EGP {c.delta}</strong>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <div className="pd-group">
                <p className="pd-group-title pd-note-title">Kitchen note</p>
                <textarea
                  className="ct-input ct-textarea pd-note"
                  rows={2}
                  placeholder="e.g. Extra toasted bun, sauce on side..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          )}

          <button className="btn btn-solid pd-add" onClick={addToCart}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-cart.svg" alt="" width="18" />
            Add to Cart{unitPrice != null ? ` — EGP ${unitPrice * qty}` : ''}
          </button>
          {delta > 0 && unitPrice == null && (
            <p className="pd-delta-note">Selected extras add EGP {delta} once menu prices arrive.</p>
          )}
        </div>
      </div>

      {also.length > 0 && (
        <section className="pd-also">
          <div className="pd-also-head">
            <h2>You may also like</h2>
            <div className="pd-also-nav">
              <button aria-label="Scroll back" onClick={() => scrollAlso(-1)}>‹</button>
              <button aria-label="Scroll forward" onClick={() => scrollAlso(1)}>›</button>
            </div>
          </div>
          <div className="pd-also-row" ref={alsoRef}>
            {also.map((p) => {
              const loc = findProduct(p.slug);
              return (
                <article key={p.slug} className="pd-also-card">
                  <Link href={loc ? `/menu/${loc.catSlug}/${p.slug}` : '/menu'} className="pd-also-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} loading="lazy" />
                  </Link>
                  <span className="pd-also-fav"><FavButton slug={p.slug} /></span>
                  <div className="pd-also-body">
                    <p className="pd-also-name">{p.name}</p>
                    <strong>{p.price != null ? `EGP ${p.price}` : '—'}</strong>
                  </div>
                  <button
                    className="btn btn-solid pd-also-add"
                    onClick={() => add({ slug: p.slug, name: p.name, image: p.image, price: p.price }, 'pdp-also')}
                  >
                    Add to Cart
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
