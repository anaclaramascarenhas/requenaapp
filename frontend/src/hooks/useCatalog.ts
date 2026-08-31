import { useAsync } from './useAsync';
import { api } from '../api/client';

export function useCategories() {
  return useAsync(() => api.getCategories(), []);
}

export function useProducts(filters: { category?: string; q?: string; featured?: boolean } = {}) {
  return useAsync(() => api.getProducts(filters), [filters.category, filters.q, filters.featured]);
}

export function useProduct(id: string) {
  return useAsync(() => api.getProduct(id), [id]);
}

export function useRecurringOrder() {
  return useAsync(() => api.getRecurringOrder(), []);
}

export function usePaymentMethods() {
  return useAsync(() => api.getPaymentMethods(), []);
}
