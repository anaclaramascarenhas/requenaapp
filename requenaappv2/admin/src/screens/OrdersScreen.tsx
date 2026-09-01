import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { money } from '../utils/format';
import type { OrderStatus } from '../api/types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: 'Confirmado',
  separating: 'Em separação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export function OrdersScreen() {
  const [state, refresh] = useAsync(() => api.getOrders(), []);

  const changeStatus = async (id: number, status: OrderStatus) => {
    await api.updateOrderStatus(id, status);
    refresh();
  };

  return (
    <div>
      <div className="admin-header"><h2>Pedidos</h2></div>
      <div className="admin-table-wrap">
        {state.status === 'loading' && <div className="admin-loading">Carregando…</div>}
        {state.status === 'error' && <div className="admin-empty">{state.message}</div>}
        {state.status === 'ready' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pedido</th><th>Cliente</th><th>Itens</th><th>Total</th><th>Data</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {state.data.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.accountName}</td>
                  <td>{o.items.length} {o.items.length === 1 ? 'item' : 'itens'}</td>
                  <td>{money(o.total)}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <select className="input" value={o.status} onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {state.data.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">Nenhum pedido ainda.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
