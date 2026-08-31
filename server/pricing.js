import { products } from './data.js';

export function findProduct(id) {
  return products.find((p) => p.id === id);
}

// Volume-tier price: once qty reaches the tier threshold, the lower price applies.
export function unitPriceFor(product, qty) {
  return qty >= product.tierQty ? product.tierPrice : product.price;
}

export function lineTotal(product, qty) {
  return unitPriceFor(product, qty) * qty;
}

// Pricing is only ever shown to an authenticated (logged-in) buyer — this
// mirrors the design's core assumption ("Preço só logado"). Callers pass
// `authed` from the request's bearer token check.
export function serializeProduct(product, authed) {
  const { id, categoryId, name, spec, origin, stockLabel, sackSize, unit, featured, description } = product;
  const base = { id, categoryId, name, spec, origin, stockLabel, sackSize, unit, featured, description };
  if (!authed) return { ...base, price: null, tier: null };
  return {
    ...base,
    price: product.price,
    tier: { minQty: product.tierQty, price: product.tierPrice },
  };
}
