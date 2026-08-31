import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Order, Quote } from '../api/types';

export type Nav =
  | { screen: 'home' }
  | { screen: 'catalog'; category?: string }
  | { screen: 'product'; productId: string }
  | { screen: 'cart' }
  | { screen: 'quote'; productId?: string; productName?: string }
  | { screen: 'done'; kind: 'order'; order: Order }
  | { screen: 'done'; kind: 'quote'; quote: Quote }
  | { screen: 'account' };

export type TabScreen = 'home' | 'catalog' | 'cart' | 'account';

type NavContextValue = { nav: Nav; go: (next: Nav) => void; back: () => void };

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState<Nav>({ screen: 'home' });
  const back = () => setNav((current) => (current.screen === 'product' ? { screen: 'catalog' } : { screen: 'home' }));
  return <NavContext.Provider value={{ nav, go: setNav, back }}>{children}</NavContext.Provider>;
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
