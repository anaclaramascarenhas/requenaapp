import { useState } from 'react';
import { AdminSessionProvider, useAdminSession } from './context/AdminSessionContext';
import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './screens/LoginScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { ClientsScreen } from './screens/ClientsScreen';
import { QuotesScreen } from './screens/QuotesScreen';
import './styles/tokens.css';
import './styles/shell.css';

export type Section = 'products' | 'orders' | 'clients' | 'quotes';

function AdminShell() {
  const [section, setSection] = useState<Section>('products');
  return (
    <div className="admin-shell">
      <Sidebar section={section} onSelect={setSection} />
      <div className="admin-main">
        {section === 'products' && <ProductsScreen />}
        {section === 'orders' && <OrdersScreen />}
        {section === 'clients' && <ClientsScreen />}
        {section === 'quotes' && <QuotesScreen />}
      </div>
    </div>
  );
}

function Boot() {
  const session = useAdminSession();
  if (session.status === 'loading') return <div className="admin-loading">Carregando…</div>;
  if (session.status === 'anonymous') return <LoginScreen />;
  return <AdminShell />;
}

export default function App() {
  return (
    <AdminSessionProvider>
      <Boot />
    </AdminSessionProvider>
  );
}
