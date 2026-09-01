import type {
  Admin, Category, ClientAccount, ClientAccountInput, Order, OrderStatus, Product, ProductInput, Quote,
} from './types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'requena.admin.token';

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
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; admin: Admin }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request<void>('/admin/auth/logout', { method: 'POST' }),
  getMe: () => request<Admin>('/admin/me'),

  getCategories: () => request<Category[]>('/categories'),

  getProducts: () => request<Product[]>('/admin/products'),
  createProduct: (input: ProductInput) => request<Product>('/admin/products', { method: 'POST', body: JSON.stringify(input) }),
  updateProduct: (id: string, input: Partial<ProductInput>) =>
    request<Product>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deleteProduct: (id: string) => request<void>(`/admin/products/${id}`, { method: 'DELETE' }),

  getOrders: () => request<Order[]>('/admin/orders'),
  updateOrderStatus: (id: number, status: OrderStatus) =>
    request<Order>(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  getQuotes: () => request<Quote[]>('/admin/quotes'),
  respondQuote: (id: number, price: number | null, note: string) =>
    request<Quote>(`/admin/quotes/${id}/respond`, { method: 'POST', body: JSON.stringify({ price, note }) }),

  getAccounts: () => request<ClientAccount[]>('/admin/accounts'),
  createAccount: (input: ClientAccountInput) => request<ClientAccount>('/admin/accounts', { method: 'POST', body: JSON.stringify(input) }),
  updateAccount: (id: string, input: Partial<ClientAccountInput>) =>
    request<ClientAccount>(`/admin/accounts/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deleteAccount: (id: string) => request<void>(`/admin/accounts/${id}`, { method: 'DELETE' }),
};
