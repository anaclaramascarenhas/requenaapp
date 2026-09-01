import {
  FileText, MapPin, Receipt, ArrowsClockwise, UsersThree, User, CaretRight,
} from '@phosphor-icons/react';
import { useSession } from '../context/SessionContext';
import './AccountScreen.css';

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function AccountScreen() {
  const session = useSession();
  if (session.status !== 'ready') {
    return <div className="app-scroll"><div className="app-loading" style={{ minHeight: 200 }}>Carregando…</div></div>;
  }
  const account = session.account;
  const { logout } = session;

  const rows = [
    { icon: FileText, label: 'Contrato e tabela de preços', value: account.priceTable },
    { icon: MapPin, label: 'Endereços de entrega', value: String(account.addressesCount) },
    { icon: Receipt, label: 'Faturas e boletos', value: `${account.openInvoicesCount} aberta` },
    { icon: ArrowsClockwise, label: 'Pedidos recorrentes', value: '1 ativo' },
    { icon: UsersThree, label: 'Usuários da conta', value: String(account.usersCount) },
    { icon: User, label: `${account.representative.name} · representante`, value: '' },
  ];

  return (
    <div className="app-scroll">
      <div className="account-screen">
        <div className="account-header">
          <div className="account-avatar">{initials(account.name)}</div>
          <div>
            <div className="account-name">{account.name}</div>
            <div className="text-muted" style={{ fontSize: 11.5 }}>CNPJ {account.cnpj} · Cliente desde {account.customerSince}</div>
          </div>
        </div>

        <div className="account-tiles">
          <div className="account-tile">
            <div className="account-tile-label">Tabela</div>
            <div className="account-tile-value">{account.priceTable}</div>
          </div>
          <div className="account-tile">
            <div className="account-tile-label">Limite</div>
            <div className="account-tile-value">R$ {account.creditLimit.toLocaleString('pt-BR')}</div>
          </div>
        </div>

        <div className="account-rows">
          {rows.map((r) => (
            <button key={r.label} className="account-row">
              <r.icon size={17} color="var(--color-accent-400)" />
              <span className="account-row-label">{r.label}</span>
              <span className="text-muted" style={{ fontSize: 11.5 }}>{r.value}</span>
              <CaretRight size={13} color="var(--color-neutral-600)" />
            </button>
          ))}
        </div>

        <button className="btn btn-secondary btn-block" onClick={logout}>Sair da conta</button>
      </div>
    </div>
  );
}
