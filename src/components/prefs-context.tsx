'use client';

/* User preferences: favorites + recently viewed.
   localStorage now (per-device); syncs into the CRM once OTP accounts land. */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

interface PrefsState {
  favorites: string[];                 // product slugs
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  recent: string[];                    // most recent first, max 8
  recordView: (slug: string) => void;
}

const PrefsContext = createContext<PrefsState | null>(null);
const FAV_KEY = 'bondok-favorites-v1';
const RECENT_KEY = 'bondok-recent-v1';
const RECENT_MAX = 8;

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const f = localStorage.getItem(FAV_KEY);
      if (f) setFavorites(JSON.parse(f));
      const r = localStorage.getItem(RECENT_KEY);
      if (r) setRecent(JSON.parse(r));
    } catch { /* corrupted storage: start clean */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); } catch { /* full/blocked */ }
  }, [favorites, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)); } catch { /* full/blocked */ }
  }, [recent, loaded]);

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }, []);

  const recordView = useCallback((slug: string) => {
    setRecent((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, RECENT_MAX));
  }, []);

  return (
    <PrefsContext.Provider value={{ favorites, isFavorite, toggleFavorite, recent, recordView }}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs(): PrefsState {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used inside <PrefsProvider>');
  return ctx;
}
