import {
  House, HouseSimple, SquaresFour, Receipt, UserCircle, Scales,
} from '@phosphor-icons/react';
import { useNav, type TabScreen } from '../context/NavContext';
import { useCart } from '../context/CartContext';

const TABS: { id: TabScreen; label: string; Icon: typeof House; FillIcon: typeof House }[] = [
  { id: 'home', label: 'Início', Icon: HouseSimple, FillIcon: HouseSimple },
  { id: 'catalog', label: 'Catálogo', Icon: SquaresFour, FillIcon: SquaresFour },
  { id: 'cart', label: 'Pedido', Icon: Receipt, FillIcon: Receipt },
  { id: 'account', label: 'Conta', Icon: UserCircle, FillIcon: UserCircle },
];

export function TabBar() {
  const { nav, go } = useNav();
  const { cart } = useCart();
  const active = nav.screen;
  // Matches the design: the tab bar hides on 'cart' too, since that screen
  // has its own bottom action bar ("Enviar pedido").
  const showTabs = active === 'home' || active === 'catalog' || active === 'account';
  if (!showTabs) return null;

  return (
    <div className="app-tabbar">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        const badge = id === 'cart' && cart.items.length ? String(cart.items.length) : '';
        return (
          <button key={id} className={`app-tab${isActive ? ' is-active' : ''}`} onClick={() => go({ screen: id } as never)}>
            <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
            <span className="app-tab-label">{label}</span>
            {badge && <span className="app-tab-badge">{badge}</span>}
          </button>
        );
      })}
      <button className="app-fab" title="Cotação" onClick={() => go({ screen: 'quote' })}>
        <Scales size={21} />
      </button>
    </div>
  );
}
