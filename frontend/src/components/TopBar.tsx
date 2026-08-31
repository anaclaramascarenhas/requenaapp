import { MagnifyingGlass, Bell, ArrowLeft } from '@phosphor-icons/react';
import { useNav, type Nav } from '../context/NavContext';
import logo from '../assets/requena-logo.png';

const SUB_TITLES: Partial<Record<Nav['screen'], string>> = {
  catalog: 'Catálogo',
  product: '',
  cart: 'Seu pedido',
  quote: 'Pedir cotação',
};

export function TopBar() {
  const { nav } = useNav();
  const isTop = nav.screen === 'home' || nav.screen === 'account';
  const isSub = nav.screen === 'catalog' || nav.screen === 'product' || nav.screen === 'cart' || nav.screen === 'quote';

  if (isTop) {
    return (
      <div className="app-topbar">
        <img src={logo} alt="REQUENA" className="app-logo" />
        <div className="app-topbar-actions">
          <button className="btn btn-icon btn-secondary" aria-label="Buscar"><MagnifyingGlass size={17} /></button>
          <button className="btn btn-icon btn-secondary app-topbar-bell" aria-label="Notificações"><Bell size={17} /></button>
        </div>
      </div>
    );
  }

  if (isSub) {
    return <SubBar title={SUB_TITLES[nav.screen] || ''} />;
  }

  return null;
}

function SubBar({ title }: { title: string }) {
  const { back } = useNav();
  return (
    <div className="app-subbar">
      <button className="btn btn-icon btn-secondary" onClick={back} aria-label="Voltar"><ArrowLeft size={18} /></button>
      {title && <span className="app-subbar-title">{title}</span>}
    </div>
  );
}
