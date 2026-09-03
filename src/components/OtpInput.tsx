'use client';

/* Segmented OTP input: one box per digit, auto-advance, backspace
   moves back, full paste supported. */

import { useRef } from 'react';

interface Props {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
}

export default function OtpInput({ length = 4, value, onChange, onComplete }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const commit = (next: string[]) => {
    const v = next.join('').slice(0, length);
    onChange(v);
    if (v.length === length) onComplete?.(v);
  };

  const handleChange = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, '');
    if (!d) return;
    const next = digits.slice();
    if (d.length > 1) {
      /* paste of several digits into a box */
      for (let k = 0; k < d.length && i + k < length; k++) next[i + k] = d[k];
      refs.current[Math.min(i + d.length, length - 1)]?.focus();
    } else {
      next[i] = d;
      refs.current[i + 1]?.focus();
    }
    commit(next);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = digits.slice();
      if (digits[i]) {
        next[i] = '';
      } else if (i > 0) {
        next[i - 1] = '';
        refs.current[i - 1]?.focus();
      }
      commit(next);
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const d = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!d) return;
    const next = Array.from({ length }, (_, i) => d[i] ?? '');
    refs.current[Math.min(d.length, length - 1)]?.focus();
    commit(next);
  };

  return (
    <div className="otp-boxes" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className="otp-box"
          type="text" inputMode="numeric" maxLength={2}
          aria-label={`Digit ${i + 1}`}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}
