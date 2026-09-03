'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

export type OrderMode = 'pickup' | 'delivery';

interface UIState {
  drawerOpen: boolean;
  orderMode: OrderMode | null;      // null = order modal closed
  orderClosing: boolean;
  docKey: string | null;            // FAQ / legal doc popup (reference pattern)
  openDrawer: () => void;
  closeDrawer: () => void;
  openOrder: (mode: OrderMode) => void;
  switchOrder: () => void;
  closeOrder: () => void;
  openDoc: (key: string) => void;
  closeDoc: () => void;
}

const UIContext = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderMode, setOrderMode] = useState<OrderMode | null>(null);
  const [orderClosing, setOrderClosing] = useState(false);
  const [docKey, setDocKey] = useState<string | null>(null);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openOrder = useCallback((mode: OrderMode) => {
    setOrderClosing(false);
    setOrderMode(mode);
  }, []);
  const switchOrder = useCallback(() => {
    setOrderMode((m) => (m === 'pickup' ? 'delivery' : 'pickup'));
  }, []);
  const openDoc = useCallback((key: string) => setDocKey(key), []);
  const closeDoc = useCallback(() => setDocKey(null), []);

  const closeOrder = useCallback(() => {
    // slide-down + fade exit (mirrors entrance), then unmount
    setOrderClosing(true);
    setTimeout(() => {
      setOrderMode(null);
      setOrderClosing(false);
    }, 230);
  }, []);

  return (
    <UIContext.Provider value={{ drawerOpen, orderMode, orderClosing, docKey, openDrawer, closeDrawer, openOrder, switchOrder, closeOrder, openDoc, closeDoc }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI(): UIState {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}
