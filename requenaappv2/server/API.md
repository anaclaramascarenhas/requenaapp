# REQUENA API (mock)

Base URL: `http://localhost:4000/api`

Mock/demo server backing the REQUENA buyer app and the admin panel.
In-memory state (resets on restart). Swap this service for a real backend
later without changing the frontends, as long as the shapes below hold.

## Auth

There are two separate kinds of session — buyer and admin — each with its
own bearer token. There is no public self-signup: buyer accounts are
created by REQUENA staff through the admin panel.

**Demo credentials** (seeded on server start):
- Buyer: CNPJ `12.345.678/0001-90` · senha `demo123`
- Admin: usuário `admin` · senha `admin123`

### Buyer
- `POST /auth/login` `{ cnpj, password }` → `{ token, account }`
- `POST /auth/logout` *(auth)* → 204
- `GET /me` *(auth)* → `Account`

### Admin
- `POST /admin/auth/login` `{ username, password }` → `{ token, admin }`
- `POST /admin/auth/logout` *(admin)* → 204
- `GET /admin/me` *(admin)* → `Admin`

Send `Authorization: Bearer <token>` on subsequent requests. Pricing on the
public catalog endpoints is only returned when *any* valid token (buyer or
admin) is present (`Preço só logado` in the design).

## Catalog (public)

- `GET /categories` → `Category[]`
- `GET /products?category=<id>&q=<search>&featured=true` → `Product[]`
  (pricing fields are `null` when unauthenticated)
- `GET /products/:id` → `Product`
- `GET /payment-methods` → `PaymentMethod[]`

## Buyer-scoped (all require a buyer token; scoped to that buyer's account)

- `GET /recurring-order` → `RecurringOrder | null`
- `POST /recurring-order/:id/repeat` → adds its items into the buyer's
  cart, returns `Cart`
- `GET /cart` → `Cart`
- `POST /cart/items` `{ productId, qty }` → `Cart`
- `PATCH /cart/items/:productId` `{ qty }` (`qty <= 0` removes it) → `Cart`
- `DELETE /cart/items/:productId` → `Cart`
- `POST /orders` `{ paymentMethodId, note? }` → creates an order from the
  cart, clears it → `Order` (201)
- `POST /quotes` `{ productId, volumeKg?, deliverBy?, recurrence?, note? }`
  → `Quote` (201)
- `GET /quotes/:id` → `Quote` (only the requesting buyer's own quote)

## Admin (all require an admin token)

### Products
- `GET /admin/products` → `Product[]` (raw, always includes pricing)
- `POST /admin/products` → creates a product, id auto-generated → `Product` (201)
- `PUT /admin/products/:id` → partial update → `Product`
- `DELETE /admin/products/:id` → 204

### Orders
- `GET /admin/orders` → all orders across all accounts, newest first
- `PATCH /admin/orders/:id` `{ status }` → status is one of
  `confirmed | separating | shipped | delivered | cancelled`

### Quotes
- `GET /admin/quotes` → all quotes across all accounts, newest first
- `POST /admin/quotes/:id/respond` `{ price, note }` → sets the quote's
  response and marks it `responded`

### Client accounts
- `GET /admin/accounts` → `ClientAccount[]` (no password hash)
- `POST /admin/accounts` `{ name, cnpj, password, priceTable, creditLimit, address?, representative? }`
  → creates a new buyer login → `ClientAccount` (201)
- `PUT /admin/accounts/:id` → partial update; include `password` to reset it
- `DELETE /admin/accounts/:id` → 204 (revokes that buyer's access)

## Shapes

```ts
type Category = { id: string; name: string; icon: string };

type Product = {
  id: string; categoryId: string; name: string; spec: string; origin: string;
  stockLabel: string; sackSize: number; unit: 'kg' | 'un'; featured: boolean;
  description: string | null;
  price: number | null;               // null on public endpoints when not authenticated
  tier: { minQty: number; price: number } | null;
};

type Account = {
  id: string; name: string; cnpj: string; customerSince: number;
  priceTable: string; creditLimit: number;
  address: { label: string; line: string };
  nextDeliveryWindow: { date: string; shortLabel: string; label: string };
  addressesCount: number; openInvoicesCount: number; usersCount: number;
  representative: { name: string; role: string; phone: string };
};
type ClientAccount = Account; // same shape, as seen from the admin panel

type RecurringOrder = {
  id: string; accountId: string; intervalLabel: string; itemIds: string[];
  quantities: Record<string, number>; totalWeightKg: number;
  summaryLabel: string; contractTotal: number;
};

type CartItem = {
  productId: string; name: string; origin: string; unit: 'kg' | 'un';
  sackSize: number; qty: number;
  unitPrice: number | null; lineTotal: number | null;
};
type Cart = { items: CartItem[]; subtotal: number | null };

type PaymentMethod = { id: string; label: string; note: string; discount: number };

type OrderStatus = 'confirmed' | 'separating' | 'shipped' | 'delivered' | 'cancelled';
type Order = {
  id: number; accountId: string; accountName: string;
  items: CartItem[]; subtotal: number; paymentMethodId: string;
  discount: number; total: number;
  deliveryWindow: { date: string; shortLabel: string; label: string };
  note: string; status: OrderStatus; createdAt: string;
};

type Quote = {
  id: number; accountId: string; accountName: string;
  productId: string; productName: string; volumeKg: number | null;
  deliverBy: string | null; recurrence: string; note: string;
  status: 'pending' | 'responded';
  response: { price: number | null; note: string; respondedAt: string } | null;
  representative: { name: string; role: string; phone: string };
  createdAt: string;
};

type Admin = { id: string; username: string; name: string };
```
