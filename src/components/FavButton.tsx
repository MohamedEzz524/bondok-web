'use client';

/* Heart toggle - add/remove a product from favorites. */

import { usePrefs } from './prefs-context';

interface Props {
  slug: string;
  size?: number;
  className?: string;
}

export default function FavButton({ slug, size = 20, className }: Props) {
  const { isFavorite, toggleFavorite } = usePrefs();
  const on = isFavorite(slug);

  return (
    <button
      className={`fav-btn${on ? ' is-on' : ''}${className ? ` ${className}` : ''}`}
      aria-label={on ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={on}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFavorite(slug); }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <path
          d="M12 21s-7.1-4.4-9.5-8.2C.7 9.9 1.6 6.4 4.7 5.3c2-.7 4 .1 5.8 2 .5.6 1 .6 1.5 0 1.8-1.9 3.8-2.7 5.8-2 3.1 1.1 4 4.6 2.2 7.5C17.1 16.6 12 21 12 21z"
          fill={on ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
