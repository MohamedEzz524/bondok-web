'use client';

/* Product page - designer layout: gallery (thumbs/dots only when 2+
   images) + frequently-bought-together on the left; details, make-it-a-
   combo toggle, per-product option groups, add-ons, kitchen note, and the
   live-total Add to Cart on the right; you-may-also-like carousel below.
   Option groups + deltas are SAMPLE data until the client menu arrives. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useCarousel, CarouselArrows } from './Carousel';
import ProductReviews from './ProductReviews';
import ProductCard from './ProductCard';

interface Props {
  category: MenuCategory;
  product: Product;
  variants: Product[] | null;
}

const SIZE_LABEL: Record<string, string> = { single: 'Single', double: 'Double', triple: 'Triple' };

/* one ordered unit's option selections (each unit can differ) */
type UnitState = { single: Record<string, number>; multi: Record<string, Record<number, number>>; combo: boolean };

export default function ProductView({ category, product, variants }: Props) {
  const router = useRouter();
  const { add } = useCart();
  const { priceOf } = useCatalog();
  const branchPrice = priceOf(product.slug);   // active-branch base price; undefined until a branch is chosen
  const { recordView } = usePrefs();
  const oowCr = useCarousel<HTMLDivElement>();        // "often ordered with" carousel (desktop, below gallery)
  const oowCrM = useCarousel<HTMLDivElement>();       // second instance (mobile, below details)
  const [oowOpen, setOowOpen] = useState(false);     // mobile accordion (desktop is always open via CSS)
  const [oowQty, setOowQty] = useState<Record<string, number>>({});   // local selection (not added until "Add" clicked)
  const config = useMemo(() => optionsFor(product, category.slug), [product, category.slug]);

  /* per-unit options: each ordered unit can pick its own variant/sauce/add-ons */
  const defaultUnit = useCallback((): UnitState => ({
    single: Object.fromEntries(config.groups.filter((g) => g.type === 'single').map((g) => [g.key, g.defaultIdx ?? 0])),
    multi: {},
    combo: false,
  }), [config]);

  const [units, setUnits] = useState<UnitState[]>(() => [defaultUnit()]);
  const [activeUnit, setActiveUnit] = useState(0);
  const [note, setNote] = useState('');
  const [imgIdx, setImgIdx] = useState(0);
  const [shared, setShared] = useState(false);
  const alsoCr = useCarousel<HTMLDivElement>();   // "you may also like" carousel
  const addRef = useRef<HTMLButtonElement>(null);      // the in-page Add button
  const [stickyShow, setStickyShow] = useState(false); // mobile sticky add form (shown when the main one is off-screen)

  /* reset to a single default unit when the product changes */
  useEffect(() => { setUnits([defaultUnit()]); setActiveUnit(0); }, [product.slug, defaultUnit]);

  const qty = units.length;
  const cur = units[activeUnit] ?? units[0];
  const single = cur.single, multi = cur.multi, combo = cur.combo;

  const patchActive = (fn: (u: UnitState) => UnitState) =>
    setUnits((arr) => arr.map((u, i) => (i === activeUnit ? fn(u) : u)));

  const setQty = (n: number) => {
    const next = Math.max(1, n);
    setUnits((arr) => {
      if (next === arr.length) return arr;
      if (next < arr.length) return arr.slice(0, next);
      return [...arr, ...Array.from({ length: next - arr.length }, () => defaultUnit())];
    });
    setActiveUnit((a) => Math.min(a, next - 1));
  };
  const setSingle = (nextSingle: Record<string, number>) => patchActive((u) => ({ ...u, single: nextSingle }));
  const setCombo = (v: boolean) => patchActive((u) => ({ ...u, combo: v }));
  const toggleMulti = (key: string, idx: number) => patchActive((u) => {
    const g = { ...(u.multi[key] ?? {}) };
    if (g[idx] > 0) delete g[idx]; else g[idx] = 1;
    return { ...u, multi: { ...u.multi, [key]: g } };
  });
  const setMultiQty = (key: string, idx: number, q: number) => patchActive((u) => {
    const g = { ...(u.multi[key] ?? {}) };
    if (q <= 0) delete g[idx]; else g[idx] = q;
    return { ...u, multi: { ...u.multi, [key]: g } };
  });

  /* gallery: single image today; the array shape is API-ready */
  const images = [product.image];

  /* labels + delta for one unit */
  const unitInfo = useCallback((u: UnitState) => {
    const labels: string[] = [];
    let d = 0;
    for (const g of config.groups) {
      if (g.type === 'single') {
        const c = g.choices[u.single[g.key] ?? g.defaultIdx ?? 0];
        if (c) { labels.push(`${g.label}: ${c.label}`); d += c.delta; }
      } else {
        for (const [idxStr, q] of Object.entries(u.multi[g.key] ?? {})) {
          const c = g.choices[Number(idxStr)];
          if (c && q > 0) { labels.push(`+ ${c.label}${q > 1 ? ` ×${q}` : ''}`); d += c.delta * q; }
        }
      }
    }
    if (u.combo && config.combo) { labels.push(`Combo (${config.combo.includes})`); d += config.combo.delta; }
    return { labels, delta: d };
  }, [config]);

  const { optionLabels, delta } = useMemo(() => {
    const { labels, delta } = unitInfo(cur);
    return { optionLabels: labels, delta };
  }, [unitInfo, cur]);
  const unitPrice = branchPrice != null ? branchPrice + delta : null;   // active unit
  const orderTotal = branchPrice != null ? units.reduce((s, u) => s + branchPrice + unitInfo(u).delta, 0) : null;

  const addToCart = () => {
    /* merge identical units into one line with a quantity */
    const groups = new Map<string, { u: UnitState; count: number }>();
    for (const u of units) {
      const { labels } = unitInfo(u);
      const hash = [u.combo ? 'c' : '', ...labels].join('|');
      const g = groups.get(hash);
      if (g) g.count += 1; else groups.set(hash, { u, count: 1 });
    }
    for (const { u, count } of groups.values()) {
      const { labels, delta: d } = unitInfo(u);
      const hash = [u.combo ? 'c' : '', ...labels].join('|');
      add({
        slug: product.slug,
        key: hash ? `${product.slug}::${hash}` : product.slug,
        name: u.combo ? `${product.name} Combo` : product.name,
        image: product.image,
        price: branchPrice != null ? branchPrice + d : undefined,
        basePrice: branchPrice,
        optionsDelta: d,
        options: labels.length ? labels : undefined,
        note: note.trim() || undefined,
      }, 'pdp', count);
    }
  };

  const share = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: product.name, url }).catch(() => { /* dismissed */ });
    else {
      navigator.clipboard?.writeText(url).then(() => { setShared(true); setTimeout(() => setShared(false), 1500); });
    }
  };

  /* "often ordered with": complementary sides/drinks; qty chosen locally, then
     added together via one "Add" button (nothing hits the cart until then). */
  const oow = useMemo(() => {
    return ['french-fries', 'coleslaw', 'onion-rings', 'mozzarella-sticks', 'cheese-fries']
      .map((s) => findProduct(s)?.product)
      .filter((p): p is Product => !!p && p.slug !== product.slug)
      .map((p) => ({ ...p, price: priceOf(p.slug) }));
  }, [product, priceOf]);
  const oowCount = Object.values(oowQty).reduce((s, q) => s + q, 0);
  const oowTotal = oow.reduce((s, p) => s + (p.price ?? 0) * (oowQty[p.slug] ?? 0), 0);
  const addOow = () => {
    for (const p of oow) {
      const q = oowQty[p.slug] ?? 0;
      if (q > 0) add({ slug: p.slug, name: p.name, image: p.image, price: p.price }, 'pdp-oow', q);
    }
    setOowQty({});
  };

  /* one markup, rendered twice: desktop copy below the gallery, mobile copy below
     the details section — visibility is toggled by CSS (.pd-oow-desktop/-mobile) */
  const renderOow = (cr: ReturnType<typeof useCarousel<HTMLDivElement>>, place: string) => (
    <section className={`pd-oow ${place}${oowOpen ? ' is-open' : ''}`}>
      <button type="button" className="pd-oow-head" onClick={() => setOowOpen((o) => !o)} aria-expanded={oowOpen}>
        <span className="pd-oow-titles">
          <span className="pd-oow-title">Often ordered with</span>
          <span className="pd-oow-sub">People usually order these items as well</span>
        </span>
        <span className="pd-oow-toggle" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
        </span>
      </button>
      <div className="pd-oow-body">
        <div className="pd-oow-wrap crsl-wrap">
          <CarouselArrows nav={cr.nav} onNav={cr.scrollByPage} />
          <div className="pd-oow-row" ref={cr.ref} {...cr.dragProps}>
            {oow.map((p) => {
              const q = oowQty[p.slug] ?? 0;
              return (
                <div key={p.slug} className={`pd-oow-card${q > 0 ? ' is-picked' : ''}`}>
                  <div className="pd-oow-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} loading="lazy" draggable={false} />
                    {q === 0 ? (
                      <button className="pd-oow-add" aria-label={`Add ${p.name}`} onClick={() => setOowQty((s) => ({ ...s, [p.slug]: 1 }))}>
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
                      </button>
                    ) : (
                      <span className="qstep qstep-sm pd-oow-step">
                        <button className="qstep-dec" aria-label={`Decrease ${p.name}`} onClick={() => setOowQty((s) => ({ ...s, [p.slug]: Math.max(0, q - 1) }))}>−</button>
                        <b key={q}>{q}</b>
                        <button className="qstep-inc" aria-label={`Increase ${p.name}`} onClick={() => setOowQty((s) => ({ ...s, [p.slug]: q + 1 }))}>+</button>
                      </span>
                    )}
                  </div>
                  <p className="pd-oow-name">{p.name}</p>
                  <p className="pd-oow-price">{p.price != null ? `EGP ${p.price}` : '—'}</p>
                </div>
              );
            })}
          </div>
        </div>
        <button className="btn btn-solid pd-oow-addall" disabled={oowCount === 0} onClick={addOow}>
          {oowCount === 0 ? '+ Add Items' : <>+ Add {oowCount} Item{oowCount !== 1 ? 's' : ''}{oowTotal > 0 ? ` — EGP ${oowTotal}` : ''}</>}
        </button>
      </div>
    </section>
  );

  const also = useMemo(
    () => suggestFor(product.slug, 6).map((p) => ({ ...p, price: priceOf(p.slug) })),
    [product.slug, priceOf],
  );

  /* record view for "recently viewed" (effect, not render — recordView setStates PrefsProvider) */
  useEffect(() => { recordView(product.slug); }, [product.slug, recordView]);

  /* mobile: reveal the sticky add-bar only while the in-page Add button is off-screen */
  useEffect(() => {
    const el = addRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStickyShow(!e.isIntersecting), { rootMargin: '0px 0px -60px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* when the product has variant sizes (Single/Double/Triple), drop the
     duplicate customize "size" group so size isn't asked twice */
  const numbered = config.groups.filter((g) => g.choices.length > 0 && !(variants && g.key === 'size'));
  /* a required choice is a single-select group with no default that isn't chosen yet */
  const missingRequired = numbered.some((g) => g.type === 'single' && g.defaultIdx == null && single[g.key] == null);
  /* multi-piece / combo items read as "bundle deals" */
  const isBundle = category.slug === 'meals' || /pcs|meal|feast|family|bucket|combo/i.test(product.slug);

  return (
    <div className="pd-page">
      <div className="pd-layout">
        {/* left: gallery + bundle */}
        <div className="pd-left">
          <div className="pd-gallery">
            <div className="pd-stage">
              <div className="pd-stage-tags">
                <ProductBadges tags={product.tags} className="pd-badges" />
                {config.badge && <span className="pd-badge">{config.badge}</span>}
              </div>
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
          {oow.length > 0 && renderOow(oowCr, 'pd-oow-desktop')}
        </div>

        {/* right: details + options */}
        <div className="pd-details">
          <div className="pd-card">
            <div className="pd-toprow">
              <button
                type="button"
                className="pd-rating"
                onClick={() => document.getElementById('pd-reviews')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                aria-label="Read customer reviews"
              >
                <span className="pd-star" aria-hidden="true"><img src="/icons/Icon-star.svg" alt="" width="15" /></span>
                <strong>4.8</strong> <span>(1.2k reviews)</span>
              </button>
              <div className="pd-toprow-right">
                {isBundle && <span className="pd-bundle-chip">Bundle Deal</span>}
                <FavButton slug={product.slug} size={24} className="pd-wish" />
              </div>
            </div>
            <h1>{product.name}</h1>
            <p className="pd-desc">
              {product.description ?? `${product.name} from our ${category.name} lineup - full description arrives with the menu data.`}
            </p>
            <div className="pd-pricerow">
              <p className="pd-price">
                {orderTotal != null ? <strong>EGP {orderTotal}</strong> : <strong className="pd-price-pending">Price with menu data</strong>}
                <span>All taxes included</span>
              </p>
              <span className="co-qty">
                <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <b>{qty}</b>
                <button className="co-qty-plus" aria-label="Increase quantity" onClick={() => setQty(qty + 1)}>+</button>
              </span>
            </div>
          </div>

          {qty > 1 && (numbered.length > 0 || config.combo) && (
            <div className="pd-card pd-units">
              <p className="ct-label ct-caps">Customize each item separately</p>
              <div className="pd-units-tabs" role="tablist">
                {units.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === activeUnit}
                    className={`pd-unit-tab${i === activeUnit ? ' is-on' : ''}`}
                    onClick={() => setActiveUnit(i)}
                  >
                    Item {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                    {v.slug === product.slug && <span className="pd-pill-check" aria-hidden="true"><svg viewBox="0 0 24 24" width="11" height="11"><path fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.2 4.2L19 6.5" /></svg></span>}
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
                      <span className="pd-group-n">
                        {g.type === 'multi'
                          ? <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
                          : <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h10" /></svg>}
                      </span>
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
                      {g.choices.map((c, i) => {
                        const on = (single[g.key] ?? g.defaultIdx ?? 0) === i;
                        return (
                        <button
                          key={c.label}
                          className={`pd-pill${on ? ' is-on' : ''}${c.image ? ' pd-pill-img' : ''}`}
                          onClick={() => setSingle({ ...single, [g.key]: i })}
                        >
                          {on && <span className="pd-pill-check" aria-hidden="true"><svg viewBox="0 0 24 24" width="11" height="11"><path fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.2 4.2L19 6.5" /></svg></span>}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {c.image && <img className="pd-pill-thumb" src={c.image} alt="" />}
                          <span>{c.label}{c.delta > 0 ? ` (+${c.delta})` : ''}</span>
                        </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="pd-checks">
                      {g.choices.map((c, i) => {
                        const q = multi[g.key]?.[i] ?? 0;
                        const on = q > 0;
                        return (
                          <div key={c.label} className={`pd-check${on ? ' is-on' : ''}`}>
                            <button type="button" className="pd-check-hit" aria-pressed={on} onClick={() => toggleMulti(g.key, i)}>
                              <span className="pd-check-box" aria-hidden="true">
                                {on && <svg viewBox="0 0 24 24" width="13" height="13"><path fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" d="m5.5 12.5 4.2 4.2 8.8-9.4" /></svg>}
                              </span>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {c.image && <img className="pd-check-img" src={c.image} alt="" />}
                              <span className="pd-check-label">{c.label}</span>
                            </button>
                            {on ? (
                              <div className="pd-check-step">
                                <button type="button" aria-label={`Decrease ${c.label}`} onClick={() => setMultiQty(g.key, i, q - 1)}>−</button>
                                <b>{q}</b>
                                <button type="button" aria-label={`Increase ${c.label}`} onClick={() => setMultiQty(g.key, i, q + 1)}>+</button>
                              </div>
                            ) : (
                              <strong className="pd-check-price">+ EGP {c.delta}</strong>
                            )}
                          </div>
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

          <button ref={addRef} className="btn btn-solid pd-add" onClick={addToCart}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-cart.svg" alt="" width="18" />
            Add to Cart{orderTotal != null ? ` — EGP ${orderTotal}` : ''}
          </button>
          {delta > 0 && unitPrice == null && (
            <p className="pd-delta-note">Selected extras add EGP {delta} once menu prices arrive.</p>
          )}

          <ProductReviews />
        </div>
      </div>

      {oow.length > 0 && renderOow(oowCrM, 'pd-oow-mobile')}

      {also.length > 0 && (
        <section className="pd-also">
          <div className="pd-also-head">
            <h2>You may also like</h2>
          </div>
          <div className="pd-also-wrap crsl-wrap">
            <CarouselArrows nav={alsoCr.nav} onNav={alsoCr.scrollByPage} />
            <div className="pd-also-row" ref={alsoCr.ref} {...alsoCr.dragProps}>
            {also.map((p) => {
              const loc = findProduct(p.slug);
              return (
                <ProductCard
                  key={p.slug}
                  product={p}
                  href={loc ? `/menu/${loc.catSlug}/${p.slug}` : '/menu'}
                  variant="vertical"
                  size="sm"
                  source="pdp-also"
                />
              );
            })}
            </div>
          </div>
        </section>
      )}

      {/* mobile sticky add-to-cart — shown only when the in-page one is off-screen */}
      <div className={`pd-sticky${stickyShow ? ' is-show' : ''}`} aria-hidden={!stickyShow}>
        {missingRequired && <p className="pd-sticky-req">Select required to add item</p>}
        <div className="pd-sticky-row">
          <span className="co-qty pd-sticky-qty">
            <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <b>{qty}</b>
            <button className="co-qty-plus" aria-label="Increase quantity" onClick={() => setQty(qty + 1)}>+</button>
          </span>
          <button className="btn btn-solid pd-sticky-add" disabled={missingRequired} onClick={addToCart}>
            <span>Add item</span>
            {orderTotal != null && <span className="pd-sticky-price">EGP {orderTotal}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
