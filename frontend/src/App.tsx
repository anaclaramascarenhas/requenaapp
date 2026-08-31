import { SessionProvider, useSession } from './context/SessionContext';
import { NavProvider, useNav } from './context/NavContext';
import { CartProvider } from './context/CartContext';
import { TopBar } from './components/TopBar';
import { TabBar } from './components/TabBar';
import { HomeScreen } from './screens/HomeScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { ProductScreen } from './screens/ProductScreen';
import { CartScreen } from './screens/CartScreen';
import { QuoteScreen } from './screens/QuoteScreen';
import { DoneScreen } from './screens/DoneScreen';
import { AccountScreen } from './screens/AccountScreen';
import './styles/tokens.css';
import './styles/shell.css';

function ScreenRouter() {
  const { nav } = useNav();
  switch (nav.screen) {
    case 'home': return <HomeScreen />;
    case 'catalog': return <CatalogScreen />;
    case 'product': return <ProductScreen productId={nav.productId} />;
    case 'cart': return <CartScreen />;
    case 'quote': return <QuoteScreen productId={nav.productId} productName={nav.productName} />;
    case 'done': return nav.kind === 'order'
      ? <DoneScreen kind="order" order={nav.order} />
      : <DoneScreen kind="quote" quote={nav.quote} />;
    case 'account': return <AccountScreen />;
    default: return null;
  }
}

function AppShell() {
  return (
    <div className="app-page">
      <div className="app">
        <TopBar />
        <div className="app-body">
          <ScreenRouter />
        </div>
        <TabBar />
      </div>
    </div>
  );
}

function Boot() {
  const session = useSession();
  if (session.status === 'loading') {
    return <div className="app-loading">Carregando REQUENA…</div>;
  }
  if (session.status === 'error') {
    return (
      <div className="app-error">
        Não foi possível conectar ao servidor da REQUENA.
        <br />
        {session.message}
      </div>
    );
  }
  return (
    <NavProvider>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </NavProvider>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <Boot />
    </SessionProvider>
  );
}
