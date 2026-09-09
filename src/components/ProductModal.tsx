'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/menu-data';
import { useCart } from './cart-context';
import CloseIcon from './CloseIcon';
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

/* right-column hints (reference copy) */
const HINTS: Record<string, string> = {
  size: 'Free upgrade on combos',
  heat: 'Hot is our chef pick',
};

export default function ProductModal({ product, onClose }: Props) {
  const { add } = useCart();
  const catSlug = findProduct(product.slug)?.catSlug ?? '';
  const config = useMemo(() => optionsFor(product, catSlug), [product, catSlug]);

  const [qty, setQty] = useState(1);
  const [closing, setClosing] = useState(false);
  const [combo, setCombo] = useState(false);
  const [singles, setSingles] = useState<Record<string, number>>({});
  const [multis, setMultis] = useState<Record<string, Set<number>>>({});
  const [note, setNote] = useState('');

  /* (re)seed selections when the product changes */
  useEffect(() => {
    const s: Record<string, number> = {};
    const m: Record<string, Set<number>> = {};
    for (const g of config.groups) {
      if (g.type === 'single') s[g.key] = g.defaultIdx ?? 0;
      else m[g.key] = new Set();
    }
    setSingles(s); setMultis(m); setCombo(false); setQty(1); setNote('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  const close = () => { setClosing(true); setTimeout(onClose, 220); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSingle = (key: string, idx: number) => setSingles((p) => ({ ...p, [key]: idx }));
  const toggleMulti = (key: string, idx: number) =>
    setMultis((p) => {
      const s = new Set(p[key]); s.has(idx) ? s.delete(idx) : s.add(idx);
      return { ...p, [key]: s };
    });

  const base = product.price ?? 0;
  const unitExtra = useMemo(() => {
    let x = combo && config.combo ? config.combo.delta : 0;
    for (const g of config.groups) {
      if (g.type === 'single') x += g.choices[singles[g.key] ?? g.defaultIdx ?? 0]?.delta ?? 0;
      else for (const idx of multis[g.key] ?? []) x += g.choices[idx]?.delta ?? 0;
    }
    return x;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combo, config, singles, multis]);
  const unit = base + unitExtra;
  const total = unit * qty;

  /* short summary for the sticky bar: size · heat · combo */
  const barBits = useMemo(() => {
    const bits: string[] = [];
    const sizeG = config.groups.find((g) => g.key === 'size');
    if (sizeG) bits.push(sizeG.choices[singles.size ?? 0]?.label);
    const heatG = config.groups.find((g) => g.key === 'heat');
    if (heatG) bits.push(heatG.choices[singles.heat ?? heatG.defaultIdx ?? 0]?.label);
    if (combo) bits.push('Combo');
    return bits.filter(Boolean);
  }, [config, singles, combo]);

  /* full option list stored on the cart line */
  const buildOptions = () => {
    const opts: string[] = [];
    for (const g of config.groups) {
      if (g.type === 'single') {
        const c = g.choices[singles[g.key] ?? g.defaultIdx ?? 0];
        if (!c) continue;
        if (g.key === 'size' && c.label === 'Regular') continue;
        opts.push(c.label);
      } else {
        for (const idx of multis[g.key] ?? []) opts.push(g.choices[idx].label);
      }
    }
    if (combo && config.combo) opts.push(`Combo (${config.combo.includes})`);
    return opts;
  };

  const addToBag = () => {
    const opts = buildOptions();
    add(
      {
        slug: product.slug,
        key: `${product.slug}#${opts.join(',')}#${note.trim()}`,
        name: product.name,
        image: product.image,
        price: unit,
        options: opts.length ? opts : undefined,
        note: note.trim() || undefined,
      },
      'product-modal',
      qty,
    );
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pmodal-img" src={product.image} alt={product.name} />
              <FavButton slug={product.slug} size={20} className="pmodal-fav" />
            </div>
            <h2 className="pmodal-title">{product.name}</h2>
            <p className="pmodal-rating">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="var(--orange)" d="m12 17.3 6.2 3.7-1.6-7 5.4-4.7-7.1-.6L12 2 9.1 8.7 2 9.3l5.4 4.7-1.6 7z" /></svg>
              <strong>4.8</strong> <span>(1.2k reviews)</span>
            </p>
            {product.price !== undefined && (
              <p className="pmodal-price">EGP {product.price} <span>All taxes included</span></p>
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

            {config.combo && (
              <button className={`pm-combo${combo ? ' is-on' : ''}`} onClick={() => setCombo((c) => !c)} aria-pressed={combo}>
                <span className="pm-combo-ic" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/HOT.png" alt="" width="22" />
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
                        <button key={c.label} className={`pm-opt${i === sel ? ' is-on' : ''}`} onClick={() => setSingle(g.key, i)}>
                          {c.label}{c.delta > 0 && <span className="pm-opt-delta"> (+{c.delta})</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }
              // multi = add-ons card
              const set = multis[g.key] ?? new Set<number>();
              return (
                <div className="pm-group" key={g.key}>
                  <div className="pm-group-head">
                    <h4>Extra Add-ons</h4>
                    <span className="pm-hint">(optional)</span>
                  </div>
                  <div className="pm-addons">
                    {g.choices.map((c, i) => {
                      const on = set.has(i);
                      return (
                        <button key={c.label} className={`pm-addon${on ? ' is-on' : ''}`} onClick={() => toggleMulti(g.key, i)} role="checkbox" aria-checked={on}>
                          <span className="pm-check" aria-hidden="true">{on && '✓'}</span>
                          <span className="pm-addon-name">{c.label}</span>
                          <span className="pm-addon-price">+ EGP {c.delta}</span>
                        </button>
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
            <button aria-label="Decrease quantity" onClick={() => setQty((n) => Math.max(1, n - 1))}>−</button>
            <span className="pm-qty-num">{qty}</span>
            <button aria-label="Increase quantity" onClick={() => setQty((n) => n + 1)}>+</button>
          </div>
          <p className="pm-bar-summary">
            <strong>{product.name}</strong>
            {barBits.length > 0 && <span> {barBits.map((b) => <em key={b}>{b}</em>)}</span>}
          </p>
          <button className="btn btn-solid pm-add" onClick={addToBag}>
            <img src="/icons/icon-cart.svg" alt="" width="18" aria-hidden="true" />
            Add to Cart{product.price !== undefined ? ` — EGP ${total}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
