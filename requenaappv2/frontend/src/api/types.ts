export type Category = { id: string; name: string; icon: string };

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  spec: string;
  origin: string;
  stockLabel: string;
  sackSize: number;
  unit: 'kg' | 'un';
  featured: boolean;
  description: string | null;
  price: number | null;
  tier: { minQty: number; price: number } | null;
};

export type Account = {
  id: string;
  name: string;
  cnpj: string;
  customerSince: number;
  priceTable: string;
  creditLimit: number;
  address: { label: string; line: string };
  nextDeliveryWindow: { date: string; shortLabel: string; label: string };
  addressesCount: number;
  openInvoicesCount: number;
  usersCount: number;
  representative: { name: string; role: string; phone: string };
};

export type RecurringOrder = {
  id: string;
  intervalLabel: string;
  itemIds: string[];
  quantities: Record<string, number>;
  totalWeightKg: number;
  summaryLabel: string;
  contractTotal: number;
};

export type CartItem = {
  productId: string;
  name: string;
  origin: string;
  unit: 'kg' | 'un';
  sackSize: number;
  qty: number;
  unitPrice: number | null;
  lineTotal: number | null;
};

export type Cart = { items: CartItem[]; subtotal: number | null };

export type PaymentMethod = { id: string; label: string; note: string; discount: number };

export type Order = {
  id: number;
  items: CartItem[];
  subtotal: number;
  paymentMethodId: string;
  discount: number;
  total: number;
  deliveryWindow: { date: string; shortLabel: string; label: string };
  note: string;
  status: 'confirmed';
};

export type Quote = {
  id: number;
  productId: string;
  productName: string;
  volumeKg: number | null;
  deliverBy: string | null;
  recurrence: string;
  note: string;
  status: 'sent';
  representative: { name: string; role: string; phone: string };
};
