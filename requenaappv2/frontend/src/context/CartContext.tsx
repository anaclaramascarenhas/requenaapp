import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { Cart } from '../api/types';

type CartContextValue = {
  cart: Cart;
  loading: boolean;
  addItem: (productId: string, qty: number) => Promise<void>;
  setItem: (productId: string, qty: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  repeatRecurring: (recurringOrderId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const EMPTY_CART: Cart = { items: [], subtotal: null };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setCart(await api.getCart());
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const addItem = useCallback(async (productId: string, qty: number) => {
    setCart(await api.addCartItem(productId, qty));
  }, []);
  const setItem = useCallback(async (productId: string, qty: number) => {
    setCart(await api.setCartItem(productId, qty));
  }, []);
  const removeItem = useCallback(async (productId: string) => {
    setCart(await api.removeCartItem(productId));
  }, []);
  const repeatRecurring = useCallback(async (recurringOrderId: string) => {
    setCart(await api.repeatRecurringOrder(recurringOrderId));
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, addItem, setItem, removeItem, repeatRecurring, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
