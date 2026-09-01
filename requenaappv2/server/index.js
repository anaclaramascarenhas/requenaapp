import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import {
  categories, products, paymentMethods, accounts, admins, recurringOrders, state, cartFor,
} from './data.js';
import { findProduct, unitPriceFor, lineTotal, serializeProduct } from './pricing.js';

const app = express();
app.use(cors());
app.use(express.json());

function newToken() {
  return crypto.randomBytes(24).toString('hex');
}

function sanitizeAccount(acc) {
  const { passwordHash, ...rest } = acc;
  return rest;
}

// Attaches req.session ({type:'buyer',accountId} | {type:'admin',adminId}) when
// the bearer token is valid; req.authed mirrors "is anyone logged in" and
// gates contract pricing on the public catalog endpoints.
function optionalAuth(req, _res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  req.session = token ? state.tokens.get(token) || null : null;
  req.authed = !!req.session;
  next();
}

function requireAuth(req, res, next) {
  if (req.session?.type !== 'buyer') return res.status(401).json({ error: 'login required' });
  req.account = accounts.find((a) => a.id === req.session.accountId);
  if (!req.account) return res.status(401).json({ error: 'account no longer exists' });
  next();
}

function requireAdmin(req, res, next) {
  if (req.session?.type !== 'admin') return res.status(401).json({ error: 'admin login required' });
  next();
}

app.use(optionalAuth);

// ---- buyer auth ----
app.post('/api/auth/login', (req, res) => {
  const { cnpj, password } = req.body || {};
  const account = accounts.find((a) => a.cnpj === cnpj);
  if (!account || !bcrypt.compareSync(password || '', account.passwordHash)) {
    return res.status(401).json({ error: 'CNPJ ou senha inválidos' });
  }
  const token = newToken();
  state.tokens.set(token, { type: 'buyer', accountId: account.id });
  res.json({ token, account: sanitizeAccount(account) });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  const header = req.get('authorization') || '';
  state.tokens.delete(header.slice(7));
  res.status(204).end();
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json(sanitizeAccount(req.account));
});

// ---- admin auth ----
app.post('/api/admin/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const admin = admins.find((a) => a.username === username);
  if (!admin || !bcrypt.compareSync(password || '', admin.passwordHash)) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }
  const token = newToken();
  state.tokens.set(token, { type: 'admin', adminId: admin.id });
  res.json({ token, admin: { id: admin.id, username: admin.username, name: admin.name } });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  const admin = admins.find((a) => a.id === req.session.adminId);
  if (!admin) return res.status(401).json({ error: 'admin no longer exists' });
  res.json({ id: admin.id, username: admin.username, name: admin.name });
});

app.post('/api/admin/auth/logout', requireAdmin, (req, res) => {
  const header = req.get('authorization') || '';
  state.tokens.delete(header.slice(7));
  res.status(204).end();
});

// ---- catalog (public; pricing gated by req.authed) ----
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

// ---- recurring order (home screen) ----
app.get('/api/recurring-order', requireAuth, (req, res) => {
  res.json(recurringOrders[req.account.id] || null);
});

app.post('/api/recurring-order/:id/repeat', requireAuth, (req, res) => {
  const recurring = recurringOrders[req.account.id];
  if (!recurring || recurring.id !== req.params.id) return res.status(404).json({ error: 'not found' });
  const cart = cartFor(req.account.id);
  for (const [id, qty] of Object.entries(recurring.quantities)) {
    cart.set(id, (cart.get(id) || 0) + qty);
  }
  res.json(serializeCart(cart, req.authed));
});

// ---- cart ----
function serializeCart(cart, authed) {
  const items = [...cart.entries()].map(([productId, qty]) => {
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
  res.json(serializeCart(cartFor(req.account.id), req.authed));
});

app.post('/api/cart/items', requireAuth, (req, res) => {
  const { productId, qty } = req.body || {};
  const product = findProduct(productId);
  if (!product || !(qty > 0)) return res.status(400).json({ error: 'invalid productId or qty' });
  const cart = cartFor(req.account.id);
  cart.set(productId, (cart.get(productId) || 0) + qty);
  res.json(serializeCart(cart, req.authed));
});

app.patch('/api/cart/items/:productId', requireAuth, (req, res) => {
  const { productId } = req.params;
  const { qty } = req.body || {};
  if (!findProduct(productId) || typeof qty !== 'number') return res.status(400).json({ error: 'invalid productId or qty' });
  const cart = cartFor(req.account.id);
  if (qty <= 0) cart.delete(productId);
  else cart.set(productId, qty);
  res.json(serializeCart(cart, req.authed));
});

app.delete('/api/cart/items/:productId', requireAuth, (req, res) => {
  cartFor(req.account.id).delete(req.params.productId);
  res.json(serializeCart(cartFor(req.account.id), req.authed));
});

// ---- payment methods ----
app.get('/api/payment-methods', (_req, res) => {
  res.json(paymentMethods);
});

// ---- orders ----
app.post('/api/orders', requireAuth, (req, res) => {
  const { paymentMethodId, note } = req.body || {};
  const method = paymentMethods.find((m) => m.id === paymentMethodId) || paymentMethods[0];
  const cart = cartFor(req.account.id);
  const serialized = serializeCart(cart, true);
  if (serialized.items.length === 0) return res.status(400).json({ error: 'cart is empty' });
  const discount = serialized.subtotal * method.discount;
  const order = {
    id: state.nextOrderId++,
    accountId: req.account.id,
    accountName: req.account.name,
    items: serialized.items,
    subtotal: serialized.subtotal,
    paymentMethodId: method.id,
    discount,
    total: serialized.subtotal - discount,
    deliveryWindow: req.account.nextDeliveryWindow,
    note: note || '',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  state.orders.push(order);
  cart.clear();
  res.status(201).json(order);
});

// ---- quotes ----
app.post('/api/quotes', requireAuth, (req, res) => {
  const { productId, volumeKg, deliverBy, recurrence, note } = req.body || {};
  const product = findProduct(productId);
  if (!product) return res.status(400).json({ error: 'invalid productId' });
  const quote = {
    id: state.nextQuoteId++,
    accountId: req.account.id,
    accountName: req.account.name,
    productId,
    productName: product.name,
    volumeKg: volumeKg || null,
    deliverBy: deliverBy || null,
    recurrence: recurrence || 'once',
    note: note || '',
    status: 'pending',
    response: null,
    representative: req.account.representative,
    createdAt: new Date().toISOString(),
  };
  state.quotes.push(quote);
  res.status(201).json(quote);
});

app.get('/api/quotes/:id', requireAuth, (req, res) => {
  const quote = state.quotes.find((q) => q.id === Number(req.params.id) && q.accountId === req.account.id);
  if (!quote) return res.status(404).json({ error: 'not found' });
  res.json(quote);
});

// ================= ADMIN =================

// ---- admin: products ----
app.get('/api/admin/products', requireAdmin, (_req, res) => {
  res.json(products);
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  const { name, categoryId, spec, origin, price, tierQty, tierPrice, stockLabel, sackSize, unit, featured, description } = req.body || {};
  if (!name || !categoryId || !(price > 0) || !(sackSize > 0)) {
    return res.status(400).json({ error: 'name, categoryId, price and sackSize are required' });
  }
  const id = `p${state.nextProductId++}`;
  const product = {
    id, categoryId, name, spec: spec || '', origin: origin || '',
    price, tierQty: tierQty || 0, tierPrice: tierPrice || price,
    stockLabel: stockLabel || '', sackSize, unit: unit === 'un' ? 'un' : 'kg',
    featured: !!featured, description: description || null,
  };
  products.push(product);
  res.status(201).json(product);
});

app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'not found' });
  Object.assign(product, req.body || {}, { id: product.id });
  res.json(product);
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  const i = products.findIndex((p) => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'not found' });
  products.splice(i, 1);
  res.status(204).end();
});

// ---- admin: orders ----
app.get('/api/admin/orders', requireAdmin, (_req, res) => {
  res.json([...state.orders].reverse());
});

app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const order = state.orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'not found' });
  const { status } = req.body || {};
  if (!['confirmed', 'separating', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }
  order.status = status;
  res.json(order);
});

// ---- admin: quotes ----
app.get('/api/admin/quotes', requireAdmin, (_req, res) => {
  res.json([...state.quotes].reverse());
});

app.post('/api/admin/quotes/:id/respond', requireAdmin, (req, res) => {
  const quote = state.quotes.find((q) => q.id === Number(req.params.id));
  if (!quote) return res.status(404).json({ error: 'not found' });
  const { price, note } = req.body || {};
  quote.response = { price: price ?? null, note: note || '', respondedAt: new Date().toISOString() };
  quote.status = 'responded';
  res.json(quote);
});

// ---- admin: client accounts ----
app.get('/api/admin/accounts', requireAdmin, (_req, res) => {
  res.json(accounts.map(sanitizeAccount));
});

app.post('/api/admin/accounts', requireAdmin, (req, res) => {
  const { name, cnpj, password, priceTable, creditLimit, address, representative } = req.body || {};
  if (!name || !cnpj || !password) return res.status(400).json({ error: 'name, cnpj and password are required' });
  if (accounts.some((a) => a.cnpj === cnpj)) return res.status(409).json({ error: 'CNPJ já cadastrado' });
  const account = {
    id: `acc-${state.nextAccountId++}`,
    name, cnpj, passwordHash: bcrypt.hashSync(password, 8),
    customerSince: new Date().getFullYear(),
    priceTable: priceTable || 'Contrato B1',
    creditLimit: creditLimit || 0,
    address: address || { label: '', line: '' },
    nextDeliveryWindow: { date: '', shortLabel: 'a combinar', label: 'A combinar' },
    addressesCount: address ? 1 : 0,
    openInvoicesCount: 0,
    representative: representative || { name: 'Equipe REQUENA', role: 'Seu representante REQUENA', phone: '' },
    usersCount: 1,
  };
  accounts.push(account);
  res.status(201).json(sanitizeAccount(account));
});

app.put('/api/admin/accounts/:id', requireAdmin, (req, res) => {
  const account = accounts.find((a) => a.id === req.params.id);
  if (!account) return res.status(404).json({ error: 'not found' });
  const { password, ...updates } = req.body || {};
  Object.assign(account, updates, { id: account.id });
  if (password) account.passwordHash = bcrypt.hashSync(password, 8);
  res.json(sanitizeAccount(account));
});

app.delete('/api/admin/accounts/:id', requireAdmin, (req, res) => {
  const i = accounts.findIndex((a) => a.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'not found' });
  accounts.splice(i, 1);
  res.status(204).end();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`REQUENA mock API listening on http://localhost:${PORT}`);
});
