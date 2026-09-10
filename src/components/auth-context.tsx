'use client';

/* DEMO auth/session. No real backend: "logging in" just persists a local user
   record (phone + optional name) to localStorage. The OTP is a fixed demo code
   (1234) checked in AuthModal. When the real SMS/OTP backend lands, only
   AuthModal.verify and this login() need to call it — the rest of the app just
   reads useAuth().user. */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export interface AuthUser {
  phone: string;       // digits, no country code
  name: string;        // display name (editable on the account page)
  joined: string;      // ISO date the demo account was created
  points: number;      // demo rewards balance (10 pts = EGP 1 at checkout)
}

/* demo starting balance for a new session */
export const DEMO_START_POINTS = 850;

interface AuthState {
  user: AuthUser | null;
  ready: boolean;                          // hydration done (avoid SSR flash)
  login: (phone: string) => AuthUser;
  logout: () => void;
  updateName: (name: string) => void;
  spendPoints: (n: number) => void;
}

const STORAGE_KEY = 'bondok-auth-v1';
const AuthContext = createContext<AuthState | null>(null);

function persist(u: AuthUser | null) {
  try {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* storage blocked */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const u = JSON.parse(raw);
        if (typeof u.points !== 'number') u.points = DEMO_START_POINTS;   // backfill older sessions
        setUser(u);
      }
    } catch { /* corrupt: stay logged out */ }
    setReady(true);
  }, []);

  const login = useCallback((phone: string) => {
    const digits = phone.replace(/\D/g, '');
    const u: AuthUser = { phone: digits, name: '', joined: new Date().toISOString(), points: DEMO_START_POINTS };
    setUser(u);
    persist(u);
    return u;
  }, []);

  const logout = useCallback(() => { setUser(null); persist(null); }, []);

  const updateName = useCallback((name: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const u = { ...prev, name };
      persist(u);
      return u;
    });
  }, []);

  const spendPoints = useCallback((n: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const u = { ...prev, points: Math.max(0, prev.points - Math.round(n)) };
      persist(u);
      return u;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, updateName, spendPoints }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
