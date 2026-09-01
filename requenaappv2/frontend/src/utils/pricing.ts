import type { Product } from '../api/types';

export function unitPriceFor(product: Product, qty: number): number | null {
  if (product.price == null) return null;
  if (product.tier && qty >= product.tier.minQty) return product.tier.price;
  return product.price;
}
