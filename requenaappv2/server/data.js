import bcrypt from 'bcryptjs';

// In-memory mock data, ported from the Claude Design prototype
// (project/REQUENA App standalone-src.dc.html) so the real app matches
// the approved design 1:1. Swap this module for a real database later —
// nothing outside this file knows the data is in-memory.

export const categories = [
  { id: 'graos', name: 'Grãos', icon: 'Grains' },
  { id: 'sementes', name: 'Sementes', icon: 'Leaf' },
  { id: 'farinaceos', name: 'Farináceos', icon: 'Bread' },
  { id: 'oleaginosas', name: 'Oleaginosas', icon: 'Tree' },
  { id: 'temperos', name: 'Temperos', icon: 'Pepper' },
  { id: 'conservas', name: 'Conservas', icon: 'Jar' },
];

// Mutable — the admin panel adds/edits/removes products directly in this array.
export const products = [
  { id: 'feijao', categoryId: 'graos', name: 'Feijão carioca tipo 1', spec: 'Safra nova · peneira 11 · sc 30 kg', origin: 'Paraná', price: 7.40, tierQty: 500, tierPrice: 6.95, stockLabel: '18 t em estoque', sackSize: 30, unit: 'kg', featured: false,
    description: 'Colhido em fevereiro no norte do Paraná e beneficiado na semana do embarque. Grão uniforme, casca fina, cozimento curto.' },
  { id: 'graodebico', categoryId: 'graos', name: 'Grão-de-bico graúdo 8–9 mm', spec: 'Calibre 8–9 mm · sc 25 kg', origin: 'Argentina', price: 12.80, tierQty: 300, tierPrice: 11.90, stockLabel: '6 t em estoque', sackSize: 25, unit: 'kg', featured: true,
    description: 'Calibre graúdo, o que os clientes de homus e salada pedem. Umidade controlada, sem quebra visível no lote.' },
  { id: 'arroz', categoryId: 'graos', name: 'Arroz agulhinha tipo 1', spec: 'Longo fino · fardo 30 kg', origin: 'Rio Grande do Sul', price: 5.60, tierQty: 1000, tierPrice: 5.15, stockLabel: '32 t em estoque', sackSize: 30, unit: 'kg', featured: false, description: null },
  { id: 'lentilha', categoryId: 'graos', name: 'Lentilha canadense', spec: 'Graúda · sc 25 kg', origin: 'Canadá', price: 14.20, tierQty: 250, tierPrice: 13.40, stockLabel: '4 t em estoque', sackSize: 25, unit: 'kg', featured: false, description: null },
  { id: 'girassol', categoryId: 'sementes', name: 'Semente de girassol sem casca', spec: 'Grau alimentar · sc 20 kg', origin: 'Minas Gerais', price: 18.90, tierQty: 200, tierPrice: 17.60, stockLabel: '2,4 t em estoque', sackSize: 20, unit: 'kg', featured: false, description: null },
  { id: 'chia', categoryId: 'sementes', name: 'Chia preta', spec: 'Peneirada · sc 10 kg', origin: 'Paraguai', price: 22.50, tierQty: 100, tierPrice: 20.80, stockLabel: '900 kg em estoque', sackSize: 10, unit: 'kg', featured: true, description: null },
  { id: 'linhaca', categoryId: 'sementes', name: 'Linhaça dourada', spec: 'Inteira · sc 25 kg', origin: 'Argentina', price: 11.30, tierQty: 250, tierPrice: 10.60, stockLabel: '3,1 t em estoque', sackSize: 25, unit: 'kg', featured: false, description: null },
  { id: 'farinha', categoryId: 'farinaceos', name: 'Farinha de trigo tipo 1', spec: 'W 220 · sc 25 kg', origin: 'Paraná', price: 4.10, tierQty: 1000, tierPrice: 3.78, stockLabel: '40 t em estoque', sackSize: 25, unit: 'kg', featured: false, description: null },
  { id: 'fuba', categoryId: 'farinaceos', name: 'Fubá mimoso', spec: 'Moagem fina · sc 25 kg', origin: 'Goiás', price: 3.45, tierQty: 750, tierPrice: 3.18, stockLabel: '22 t em estoque', sackSize: 25, unit: 'kg', featured: false, description: null },
  { id: 'mandioca', categoryId: 'farinaceos', name: 'Farinha de mandioca torrada', spec: 'Fina · sc 25 kg', origin: 'Pará', price: 6.20, tierQty: 400, tierPrice: 5.80, stockLabel: '9 t em estoque', sackSize: 25, unit: 'kg', featured: false, description: null },
  { id: 'caju', categoryId: 'oleaginosas', name: 'Castanha de caju W2', spec: 'Inteira clara · cx 10 kg', origin: 'Ceará', price: 78.00, tierQty: 100, tierPrice: 73.50, stockLabel: '640 kg em estoque', sackSize: 10, unit: 'kg', featured: true, description: null },
  { id: 'amendoim', categoryId: 'oleaginosas', name: 'Amendoim tipo 1 sem pele', spec: 'Runner · sc 25 kg', origin: 'São Paulo', price: 13.60, tierQty: 300, tierPrice: 12.75, stockLabel: '5,2 t em estoque', sackSize: 25, unit: 'kg', featured: false, description: null },
  { id: 'paprica', categoryId: 'temperos', name: 'Páprica defumada', spec: 'Moída · sc 10 kg', origin: 'Espanha', price: 41.00, tierQty: 60, tierPrice: 38.20, stockLabel: '380 kg em estoque', sackSize: 10, unit: 'kg', featured: false, description: null },
  { id: 'colorau', categoryId: 'temperos', name: 'Colorau', spec: 'Fino · sc 20 kg', origin: 'Bahia', price: 9.80, tierQty: 200, tierPrice: 9.05, stockLabel: '1,8 t em estoque', sackSize: 20, unit: 'kg', featured: false, description: null },
  { id: 'cominho', categoryId: 'temperos', name: 'Cominho em pó', spec: 'Moído · sc 10 kg', origin: 'Síria', price: 36.50, tierQty: 80, tierPrice: 34.00, stockLabel: '420 kg em estoque', sackSize: 10, unit: 'kg', featured: false, description: null },
  { id: 'palmito', categoryId: 'conservas', name: 'Palmito pupunha em conserva', spec: 'Tolete · vidro 500 g · cx 12', origin: 'Espírito Santo', price: 19.40, tierQty: 40, tierPrice: 18.10, stockLabel: '210 cx em estoque', sackSize: 6, unit: 'un', featured: false, description: null },
  { id: 'azeitona', categoryId: 'conservas', name: 'Azeitona verde sem caroço', spec: 'Balde 2 kg · cx 6', origin: 'Peru', price: 27.90, tierQty: 60, tierPrice: 25.90, stockLabel: '150 cx em estoque', sackSize: 12, unit: 'un', featured: false, description: null },
];

export const paymentMethods = [
  { id: 'boleto28', label: 'Boleto 28 dias', note: 'sem acréscimo', discount: 0 },
  { id: 'boleto14', label: 'Boleto 14 dias', note: '−1%', discount: 0.01 },
  { id: 'pix', label: 'Pix na coleta', note: '−2%', discount: 0.02 },
];

// Demo credentials — change these in a real deployment.
// Buyer: CNPJ 12.345.678/0001-90 · senha demo123
// Admin: usuário admin · senha admin123
const DEMO_PASSWORD_HASH = bcrypt.hashSync('demo123', 8);
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 8);

// Mutable — the admin panel creates/edits/removes buyer accounts here.
// Accounts are the REQUENA customers (mercados, padarias, restaurantes);
// only staff (via the admin panel) can create one — there is no public
// self-signup, per the design's B2B, contract-pricing model.
export const accounts = [
  {
    id: 'acc-1',
    name: 'Padaria Aurora',
    cnpj: '12.345.678/0001-90',
    passwordHash: DEMO_PASSWORD_HASH,
    customerSince: 2019,
    priceTable: 'Contrato B2',
    creditLimit: 40000,
    address: { label: 'Padaria Aurora · Depósito', line: 'R. Cel. Bento Pires 412, Piracicaba SP' },
    nextDeliveryWindow: { date: '2026-09-03', shortLabel: 'quinta, 03/09', label: 'Quinta, 03/09 · janela 7h–12h' },
    addressesCount: 2,
    openInvoicesCount: 1,
    representative: { name: 'Marcelo Ferrão', role: 'Seu representante REQUENA', phone: '+55 19 99876-5432' },
    usersCount: 3,
  },
];

export const admins = [
  { id: 'admin-1', username: 'admin', passwordHash: ADMIN_PASSWORD_HASH, name: 'Equipe REQUENA' },
];

// Recurring orders keyed by accountId — not every account has one.
export const recurringOrders = {
  'acc-1': {
    id: 'rec-1',
    accountId: 'acc-1',
    intervalLabel: 'a cada 14 dias',
    itemIds: ['feijao', 'fuba', 'colorau'],
    quantities: { feijao: 180, fuba: 150, colorau: 40 },
    totalWeightKg: 480,
    summaryLabel: 'Feijão carioca, fubá mimoso, farinha tipo 1, colorau, azeitona verde, chia',
    contractTotal: 2847.60,
  },
};

// Mutable server-side state, all keyed by accountId for multi-tenant support.
export const state = {
  // token -> { type: 'buyer', accountId } | { type: 'admin', adminId }
  tokens: new Map(),
  // accountId -> Map(productId -> qty)
  carts: new Map([
    ['acc-1', new Map([
      ['feijao', 180],
      ['fuba', 150],
      ['colorau', 40],
    ])],
  ]),
  orders: [],
  quotes: [],
  nextOrderId: 24881,
  nextQuoteId: 5001,
  nextAccountId: 2,
  nextProductId: 1,
};

export function cartFor(accountId) {
  if (!state.carts.has(accountId)) state.carts.set(accountId, new Map());
  return state.carts.get(accountId);
}
