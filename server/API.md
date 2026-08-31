# REQUENA API (mock)

Base URL: `http://localhost:4000/api`

Mock/demo server backing the REQUENA B2B buyer app. Single demo account,
in-memory state (resets on restart). Swap this service for a real backend
later without changing the frontend, as long as the shapes below hold.

## Auth

Pricing is only returned to a logged-in buyer (`Preço só logado` in the
design). Auth is a mock bearer token — no real password.

- `POST /auth/login` `{ cnpj? }` → `{ token, account }`. Any `cnpj` other
  than the demo account's is rejected with 401; omit it to log in as the
  demo buyer.
- Send `Authorization: Bearer <token>` on subsequent requests.
- `GET /me` *(auth required)* → `Account`

## Catalog

- `GET /categories` → `Category[]`
- `GET /products?category=<id>&q=<search>&featured=true` → `Product[]`
  (pricing fields are `null` when unauthenticated)
- `GET /products/:id` → `Product`

## Recurring order (home screen)

- `GET /recurring-order` *(auth)* → `RecurringOrder`
- `POST /recurring-order/:id/repeat` *(auth)* → adds its items into the
  cart, returns `Cart`

## Cart

- `GET /cart` *(auth)* → `Cart`
- `POST /cart/items` *(auth)* `{ productId, qty }` → adds `qty` to the
  line (creates it if missing) → `Cart`
- `PATCH /cart/items/:productId` *(auth)* `{ qty }` → sets the line to an
  exact quantity; `qty <= 0` removes it → `Cart`
- `DELETE /cart/items/:productId` *(auth)* → `Cart`

## Payment methods

- `GET /payment-methods` → `PaymentMethod[]`

## Orders

- `POST /orders` *(auth)* `{ paymentMethodId, note? }` → creates an order
  from the current cart, clears the cart → `Order` (201)

## Quotes

- `POST /quotes` *(auth)* `{ productId, volumeKg?, deliverBy?, recurrence?, note? }`
  → `Quote` (201)

## Shapes

```ts
type Category = { id: string; name: string; icon: string };

type Product = {
  id: string; categoryId: string; name: string; spec: string; origin: string;
  stockLabel: string; sackSize: number; unit: 'kg' | 'un'; featured: boolean;
  description: string | null;
  price: number | null;               // null when not authenticated
  tier: { minQty: number; price: number } | null;
};

type Account = {
  id: string; name: string; cnpj: string; customerSince: number;
  priceTable: string; creditLimit: number;
  address: { label: string; line: string };
  nextDeliveryWindow: { date: string; label: string };
  addressesCount: number; openInvoicesCount: number; usersCount: number;
  representative: { name: string; role: string; phone: string };
};

type RecurringOrder = {
  id: string; intervalLabel: string; itemIds: string[];
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

type Order = {
  id: number; items: CartItem[]; subtotal: number; paymentMethodId: string;
  discount: number; total: number;
  deliveryWindow: { date: string; label: string }; note: string; status: 'confirmed';
};

type Quote = {
  id: number; productId: string; productName: string; volumeKg: number | null;
  deliverBy: string | null; recurrence: string; note: string; status: 'sent';
  representative: { name: string; role: string; phone: string };
};
```
