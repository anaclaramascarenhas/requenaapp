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
  price: number;
  tierQty: number;
  tierPrice: number;
};

export type ProductInput = Omit<Product, 'id'>;

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

export type OrderStatus = 'confirmed' | 'separating' | 'shipped' | 'delivered' | 'cancelled';

export type Order = {
  id: number;
  accountId: string;
  accountName: string;
  items: CartItem[];
  subtotal: number;
  paymentMethodId: string;
  discount: number;
  total: number;
  deliveryWindow: { date: string; shortLabel: string; label: string };
  note: string;
  status: OrderStatus;
  createdAt: string;
};

export type Quote = {
  id: number;
  accountId: string;
  accountName: string;
  productId: string;
  productName: string;
  volumeKg: number | null;
  deliverBy: string | null;
  recurrence: string;
  note: string;
  status: 'pending' | 'responded';
  response: { price: number | null; note: string; respondedAt: string } | null;
  representative: { name: string; role: string; phone: string };
  createdAt: string;
};

export type ClientAccount = {
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

export type ClientAccountInput = {
  name: string;
  cnpj: string;
  password?: string;
  priceTable: string;
  creditLimit: number;
  address?: { label: string; line: string };
  representative?: { name: string; role: string; phone: string };
};

export type Admin = { id: string; username: string; name: string };
