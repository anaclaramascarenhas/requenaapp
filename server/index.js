import express from 'express';
import cors from 'cors';
import {
  categories, products, paymentMethods, account, recurringOrder, state,
  DEMO_CNPJ, DEMO_TOKEN,
} from './data.js';
import { findProduct, unitPriceFor, lineTotal, serializeProduct } from './pricing.js';

const app = express();
app.use(cors());
app.use(express.json());

function optionalAuth(req, _res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  req.authed = token === DEMO_TOKEN;
  next();
}

function requireAuth(req, res, next) {
  if (!req.authed) return res.status(401).json({ error: 'login required' });
  next();
}

app.use(optionalAuth);

// ---- auth ----
app.post('/api/auth/login', (req, res) => {
  const { cnpj } = req.body || {};
  if (cnpj && cnpj !== DEMO_CNPJ) {
    return res.status(401).json({ error: 'CNPJ não encontrado' });
  }
  res.json({ token: DEMO_TOKEN, account });
});

app.get('/api/me', requireAuth, (_req, res) => {
  res.json(account);
});

// ---- catalog ----
app.get('/api/categories', (_req, res) => {
  res.json(categories);
});

app.get('/api/products', (req, res) => {
  const { category, q, featured } = req.query;
  let list = products;
  if (category && category !== 'todos') list = list.filter((p) => p.categoryId === category);
  if (featured === 'true') list = list.filter((p) => p.featured);
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(needle) || p.spec.toLowerCase().includes(needle));
  }
  res.json(list.map((p) => serializeProduct(p, req.authed)));
});

app.get('/api/products/:id', (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'not found' });
  res.json(serializeProduct(product, req.authed));
});

// ---- recurring order ----
app.get('/api/recurring-order', requireAuth, (_req, res) => {
  res.json(recurringOrder);
});

app.post('/api/recurring-order/:id/repeat', requireAuth, (req, res) => {
  if (req.params.id !== recurringOrder.id) return res.status(404).json({ error: 'not found' });
  for (const [id, qty] of Object.entries(recurringOrder.quantities)) {
    state.cart.set(id, (state.cart.get(id) || 0) + qty);
  }
  res.json(serializeCart(req.authed));
});

// ---- cart ----
function serializeCart(authed) {
  const items = [...state.cart.entries()].map(([productId, qty]) => {
    const product = findProduct(productId);
    const unitPrice = authed ? unitPriceFor(product, qty) : null;
    return {
      productId,
      name: product.name,
      origin: product.origin,
      unit: product.unit,
      sackSize: product.sackSize,
      qty,
      unitPrice,
      lineTotal: authed ? lineTotal(product, qty) : null,
    };
  });
  const subtotal = authed ? items.reduce((sum, i) => sum + i.lineTotal, 0) : null;
  return { items, subtotal };
}

app.get('/api/cart', requireAuth, (req, res) => {
  res.json(serializeCart(req.authed));
});

app.post('/api/cart/items', requireAuth, (req, res) => {
  const { productId, qty } = req.body || {};
  const product = findProduct(productId);
  if (!product || !(qty > 0)) return res.status(400).json({ error: 'invalid productId or qty' });
  state.cart.set(productId, (state.cart.get(productId) || 0) + qty);
  res.json(serializeCart(req.authed));
});

app.patch('/api/cart/items/:productId', requireAuth, (req, res) => {
  const { productId } = req.params;
  const { qty } = req.body || {};
  if (!findProduct(productId) || typeof qty !== 'number') return res.status(400).json({ error: 'invalid productId or qty' });
  if (qty <= 0) state.cart.delete(productId);
  else state.cart.set(productId, qty);
  res.json(serializeCart(req.authed));
});

app.delete('/api/cart/items/:productId', requireAuth, (req, res) => {
  state.cart.delete(req.params.productId);
  res.json(serializeCart(req.authed));
});

// ---- payment methods ----
app.get('/api/payment-methods', (_req, res) => {
  res.json(paymentMethods);
});

// ---- orders ----
app.post('/api/orders', requireAuth, (req, res) => {
  const { paymentMethodId, note } = req.body || {};
  const method = paymentMethods.find((m) => m.id === paymentMethodId) || paymentMethods[0];
  const cart = serializeCart(true);
  if (cart.items.length === 0) return res.status(400).json({ error: 'cart is empty' });
  const discount = cart.subtotal * method.discount;
  const order = {
    id: state.nextOrderId++,
    items: cart.items,
    subtotal: cart.subtotal,
    paymentMethodId: method.id,
    discount,
    total: cart.subtotal - discount,
    deliveryWindow: account.nextDeliveryWindow,
    note: note || '',
    status: 'confirmed',
  };
  state.orders.push(order);
  state.cart.clear();
  res.status(201).json(order);
});

// ---- quotes ----
app.post('/api/quotes', requireAuth, (req, res) => {
  const { productId, volumeKg, deliverBy, recurrence, note } = req.body || {};
  const product = findProduct(productId);
  if (!product) return res.status(400).json({ error: 'invalid productId' });
  const quote = {
    id: state.nextQuoteId++,
    productId,
    productName: product.name,
    volumeKg: volumeKg || null,
    deliverBy: deliverBy || null,
    recurrence: recurrence || 'once',
    note: note || '',
    status: 'sent',
    representative: account.representative,
  };
  state.quotes.push(quote);
  res.status(201).json(quote);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`REQUENA mock API listening on http://localhost:${PORT}`);
});
