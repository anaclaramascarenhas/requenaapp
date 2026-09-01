import { Package, Receipt, UsersThree, ChatCircleText, SignOut } from '@phosphor-icons/react';
import { useAdminSession } from '../context/AdminSessionContext';
import logo from '../assets/requena-logo.png';
import type { Section } from '../App';

const ITEMS: { id: Section; label: string; Icon: typeof Package }[] = [
  { id: 'products', label: 'Produtos', Icon: Package },
  { id: 'orders', label: 'Pedidos', Icon: Receipt },
  { id: 'clients', label: 'Clientes', Icon: UsersThree },
  { id: 'quotes', label: 'Cotações', Icon: ChatCircleText },
];

export function Sidebar({ section, onSelect }: { section: Section; onSelect: (s: Section) => void }) {
  const session = useAdminSession();
  const admin = session.status === 'ready' ? session.admin : null;
  const { logout } = session;
  return (
    <div className="admin-sidebar">
      <img src={logo} alt="REQUENA" className="admin-sidebar-logo" />
      <nav className="admin-nav">
        {ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`admin-nav-item${section === id ? ' is-active' : ''}`}
            onClick={() => onSelect(id)}
          >
            <Icon size={17} weight={section === id ? 'fill' : 'regular'} />
            {label}
          </button>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user">{admin?.name}</div>
        <button className="admin-nav-item" onClick={logout}>
          <SignOut size={17} /> Sair
        </button>
      </div>
    </div>
  );
}
