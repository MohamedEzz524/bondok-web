'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/menu-data';
import { useCart } from './cart-context';
import { useCatalog } from './catalog-context';
import CloseIcon from './CloseIcon';
import ProductBadges from './ProductBadges';
import FavButton from './FavButton';
import { findProduct } from '@/lib/upsell';
import { optionsFor } from '@/lib/product-options';

interface Props {
  product: Product;
  /* size siblings kept for API compatibility; the modal uses the Size option group */
  variants: Product[] | null;
  onSelectVariant: (p: Product) => void;
  onClose: () => void;
}

/* one ordered unit's option selections (each unit can differ) */
type UnitState = { single: Record<string, number>; multi: Record<string, Record<number, number>>; combo: boolean };

/* right-column hints (reference copy) */
const HINTS: Record<string, string> = {
  size: 'Free upgrade on combos',
  heat: 'Hot is our chef pick',
};

export default function ProductModal({ product, onClose }: Props) {
  const { add } = useCart();
  const { priceOf } = useCatalog();
  const branchPrice = priceOf(product.slug);   // active-branch base price; undefined until a branch is chosen
  const catSlug = findProduct(product.slug)?.catSlug ?? '';
  const config = useMemo(() => optionsFor(product, catSlug), [product, catSlug]);

  const [units, setUnits] = useState<UnitState[]>([]);
  const [activeUnit, setActiveUnit] = useState(0);
  const [closing, setClosing] = useState(false);
  const [note, setNote] = useState('');

  const defaultUnit = useCallback((): UnitState => {
    const single: Record<string, number> = {};
    const multi: Record<string, Record<number, number>> = {};
    for (const g of config.groups) { if (g.type === 'single') single[g.key] = g.defaultIdx ?? 0; else multi[g.key] = {}; }
    return { single, multi, combo: false };
  }, [config]);

  /* (re)seed selections when the product changes */
  useEffect(() => {
    setUnits([defaultUnit()]); setActiveUnit(0); setNote('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  const qty = Math.max(1, units.length);
  const cur: UnitState = units[activeUnit] ?? units[0] ?? { single: {}, multi: {}, combo: false };
  const singles = cur.single, multis = cur.multi, combo = cur.combo;

  const close = () => { setClosing(true); setTimeout(onClose, 220); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchActive = (fn: (u: UnitState) => UnitState) => setUnits((arr) => arr.map((u, i) => (i === activeUnit ? fn(u) : u)));
  const setQty = (n: number) => {
    const next = Math.max(1, n);
    setUnits((arr) => (next <= arr.length ? arr.slice(0, next) : [...arr, ...Array.from({ length: next - arr.length }, () => defaultUnit())]));
    setActiveUnit((a) => Math.min(a, next - 1));
  };
  const setSingle = (key: string, idx: number) => patchActive((u) => ({ ...u, single: { ...u.single, [key]: idx } }));
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

  const base = branchPrice ?? 0;
  const unitInfo = useCallback((u: UnitState) => {
    let d = u.combo && config.combo ? config.combo.delta : 0;
    const opts: string[] = [];
    for (const g of config.groups) {
      if (g.type === 'single') {
        const c = g.choices[u.single[g.key] ?? g.defaultIdx ?? 0];
        if (c) { d += c.delta; if (!(g.key === 'size' && c.label === 'Regular')) opts.push(c.label); }
      } else {
        for (const [idxStr, q] of Object.entries(u.multi[g.key] ?? {})) { const c = g.choices[Number(idxStr)]; if (c && q > 0) { d += c.delta * q; opts.push(`${c.label}${q > 1 ? ` ×${q}` : ''}`); } }
      }
    }
    if (u.combo && config.combo) opts.push(`Combo (${config.combo.includes})`);
    return { delta: d, opts };
  }, [config]);
  const unitExtra = unitInfo(cur).delta;
  const unit = base + unitExtra;
  const orderTotal = units.reduce((s, u) => s + base + unitInfo(u).delta, 0);

  /* short summary for the sticky bar: size · heat · combo */
  const barBits = useMemo(() => {
    const bits: string[] = [];
    const sizeG = config.groups.find((g) => g.key === 'size');
    if (sizeG) bits.push(sizeG.choices[cur.single.size ?? 0]?.label);
    const heatG = config.groups.find((g) => g.key === 'heat');
    if (heatG) bits.push(heatG.choices[cur.single.heat ?? heatG.defaultIdx ?? 0]?.label);
    if (cur.combo) bits.push('Combo');
    return bits.filter(Boolean);
  }, [config, cur]);

  const addToBag = () => {
    const groups = new Map<string, { u: UnitState; count: number }>();
    for (const u of units) {
      const hash = `${unitInfo(u).opts.join(',')}#${note.trim()}`;
      const g = groups.get(hash);
      if (g) g.count += 1; else groups.set(hash, { u, count: 1 });
    }
    for (const { u, count } of groups.values()) {
      const { opts, delta: d } = unitInfo(u);
      add({
        slug: product.slug,
        key: `${product.slug}#${opts.join(',')}#${note.trim()}`,
        name: product.name,
        image: product.image,
        price: branchPrice != null ? base + d : undefined,
        basePrice: branchPrice,
        optionsDelta: d,
        options: opts.length ? opts : undefined,
        note: note.trim() || undefined,
      }, 'product-modal', count);
    }
    close();
  };

  /* numbered single-select groups (size / spice / sauce) */
  let stepNo = 0;

  return (
    <div className={`pmodal-overlay${closing ? ' closing' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="pmodal" role="dialog" aria-label={product.name}>
        <button className="pmodal-close" aria-label="Close" onClick={close}>
          <CloseIcon size={18} />
        </button>

        <div className="pmodal-grid">
          {/* LEFT: image + identity */}
          <div className="pmodal-left">
            <div className="pmodal-imgwrap">
              <ProductBadges tags={product.tags} className="pmodal-badges" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pmodal-img" src={product.image} alt={product.name} />
              <FavButton slug={product.slug} size={20} className="pmodal-fav" />
            </div>
            <h2 className="pmodal-title">{product.name}</h2>
            <p className="pmodal-rating">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="var(--orange)" d="m12 17.3 6.2 3.7-1.6-7 5.4-4.7-7.1-.6L12 2 9.1 8.7 2 9.3l5.4 4.7-1.6 7z" /></svg>
              <strong>4.8</strong> <span>(1.2k reviews)</span>
            </p>
            {branchPrice !== undefined && (
              <p className="pmodal-price">EGP {branchPrice} <span>All taxes included</span></p>
            )}
            <div className="pmodal-desc">
              <p>{product.description ?? 'Massive crispy fried chicken fillet, fresh garden lettuce and our signature Bondok glaze tucked inside a toasted buttered brioche bun.'}</p>
            </div>
          </div>

          {/* RIGHT: make it your way */}
          <div className="pmodal-right">
            <header className="pmodal-way">
              <h3>Make it your way</h3>
              <p>Personalize options before sliding this into your bag.</p>
            </header>

            {qty > 1 && (config.groups.length > 0 || config.combo) && (
              <div className="pm-units">
                <p className="pm-units-label">Customize each item separately</p>
                <div className="pd-units-tabs" role="tablist">
                  {units.map((_, i) => (
                    <button key={i} type="button" role="tab" aria-selected={i === activeUnit}
                      className={`pd-unit-tab${i === activeUnit ? ' is-on' : ''}`} onClick={() => setActiveUnit(i)}>
                      Item {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {config.combo && (
              <button className={`pm-combo${combo ? ' is-on' : ''}`} onClick={() => setCombo(!combo)} aria-pressed={combo}>
                <span className="pm-combo-ic" aria-hidden="true">
                  {config.combo.items?.length
                    ? config.combo.items.flatMap((it, i) => [
                        i > 0 ? <span key={`p${i}`} className="pm-combo-plus">+</span> : null,
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img key={it.label} className="pm-combo-thumb" src={it.image} alt="" />,
                      ])
                    /* eslint-disable-next-line @next/next/no-img-element */
                    : <img src="/icons/HOT.png" alt="" width="22" />}
                </span>
                <span className="pm-combo-text">
                  <strong>Make it a Combo <em className="pm-combo-badge">+ EGP {config.combo.delta}</em></strong>
                  <span>Includes {config.combo.includes}</span>
                </span>
                <span className="pm-switch" aria-hidden="true"><span /></span>
              </button>
            )}

            {config.groups.map((g) => {
              if (g.type === 'single') {
                stepNo += 1;
                const n = stepNo;
                const sel = singles[g.key] ?? g.defaultIdx ?? 0;
                return (
                  <div className="pm-group" key={g.key}>
                    <div className="pm-group-head">
                      <h4><span className="pm-step">{n}.</span> {g.label} {n === 1 && <em>(select one)</em>}</h4>
                      {HINTS[g.key] && <span className="pm-hint">{HINTS[g.key]}</span>}
                    </div>
                    <div className={`pm-opts pm-opts-${g.choices.length}`}>
                      {g.choices.map((c, i) => (
                        <button key={c.label} className={`pm-opt${i === sel ? ' is-on' : ''}${c.image ? ' pm-opt-img-on' : ''}`} onClick={() => setSingle(g.key, i)}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {c.image && <img className="pm-opt-img" src={c.image} alt="" />}
                          <span>{c.label}{c.delta > 0 && <span className="pm-opt-delta"> (+{c.delta})</span>}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }
              // multi = add-ons card
              const set = multis[g.key] ?? {};
              return (
                <div className="pm-group" key={g.key}>
                  <div className="pm-group-head">
                    <h4>Extra Add-ons</h4>
                    <span className="pm-hint">(optional)</span>
                  </div>
                  <div className="pm-addons">
                    {g.choices.map((c, i) => {
                      const q = set[i] ?? 0;
                      const on = q > 0;
                      return (
                        <div key={c.label} className={`pm-addon${on ? ' is-on' : ''}`}>
                          <button type="button" className="pm-addon-hit" onClick={() => toggleMulti(g.key, i)} role="checkbox" aria-checked={on}>
                            <span className="pm-check" aria-hidden="true">{on && '✓'}</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {c.image && <img className="pm-addon-img" src={c.image} alt="" />}
                            <span className="pm-addon-name">{c.label}</span>
                          </button>
                          {on ? (
                            <div className="pd-check-step">
                              <button type="button" aria-label={`Decrease ${c.label}`} onClick={() => setMultiQty(g.key, i, q - 1)}>−</button>
                              <b>{q}</b>
                              <button type="button" aria-label={`Increase ${c.label}`} onClick={() => setMultiQty(g.key, i, q + 1)}>+</button>
                            </div>
                          ) : (
                            <span className="pm-addon-price">+ EGP {c.delta}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="pm-group">
              <div className="pm-group-head">
                <h4>Kitchen Note</h4>
                <span className="pm-hint">(optional)</span>
              </div>
              <input
                className="pm-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., No pickles? Extra crispy buns? Cut in half?"
              />
            </div>
          </div>
        </div>

        {/* sticky bottom bar */}
        <div className="pmodal-bar">
          <div className="pm-qty" aria-label="Quantity">
            <span className="pm-qty-label">QTY:</span>
            <button aria-label="Decrease quantity" onClick={() => setQty(qty - 1)}>−</button>
            <span className="pm-qty-num">{qty}</span>
            <button aria-label="Increase quantity" onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <p className="pm-bar-summary">
            <strong>{product.name}</strong>
            {barBits.length > 0 && <span> {barBits.map((b) => <em key={b}>{b}</em>)}</span>}
          </p>
          <button className="btn btn-solid pm-add" onClick={addToBag}>
            <img src="/icons/icon-cart.svg" alt="" width="18" aria-hidden="true" />
            Add to Cart{branchPrice !== undefined ? ` — EGP ${orderTotal}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
