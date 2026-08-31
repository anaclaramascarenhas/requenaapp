import type {
  Account, Category, Product, RecurringOrder, Cart, PaymentMethod, Order, Quote,
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'requena.token';

let token: string | null = localStorage.getItem(TOKEN_KEY);

export function setToken(next: string | null) {
  token = next;
  if (next) localStorage.setItem(TOKEN_KEY, next);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: (cnpj?: string) =>
    request<{ token: string; account: Account }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ cnpj }),
    }),
  getMe: () => request<Account>('/me'),
  getCategories: () => request<Category[]>('/categories'),
  getProducts: (params: { category?: string; q?: string; featured?: boolean } = {}) => {
    const search = new URLSearchParams();
    if (params.category) search.set('category', params.category);
    if (params.q) search.set('q', params.q);
    if (params.featured) search.set('featured', 'true');
    const qs = search.toString();
    return request<Product[]>(`/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id: string) => request<Product>(`/products/${id}`),
  getRecurringOrder: () => request<RecurringOrder>('/recurring-order'),
  repeatRecurringOrder: (id: string) => request<Cart>(`/recurring-order/${id}/repeat`, { method: 'POST' }),
  getCart: () => request<Cart>('/cart'),
  addCartItem: (productId: string, qty: number) =>
    request<Cart>('/cart/items', { method: 'POST', body: JSON.stringify({ productId, qty }) }),
  setCartItem: (productId: string, qty: number) =>
    request<Cart>(`/cart/items/${productId}`, { method: 'PATCH', body: JSON.stringify({ qty }) }),
  removeCartItem: (productId: string) =>
    request<Cart>(`/cart/items/${productId}`, { method: 'DELETE' }),
  getPaymentMethods: () => request<PaymentMethod[]>('/payment-methods'),
  createOrder: (payload: { paymentMethodId: string; note?: string }) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  createQuote: (payload: { productId: string; volumeKg?: number; deliverBy?: string; recurrence?: string; note?: string }) =>
    request<Quote>('/quotes', { method: 'POST', body: JSON.stringify(payload) }),
};
