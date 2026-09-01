import { useState } from 'react';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import type { ClientAccount, ClientAccountInput } from '../api/types';

export function ClientsScreen() {
  const [state, refresh] = useAsync(() => api.getAccounts(), []);
  const [editing, setEditing] = useState<ClientAccount | 'new' | null>(null);

  const remove = async (id: string) => {
    if (!confirm('Remover este cliente? Ele perderá o acesso ao app imediatamente.')) return;
    await api.deleteAccount(id);
    refresh();
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Clientes</h2>
        <button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={15} /> Novo cliente</button>
      </div>

      <div className="admin-table-wrap">
        {state.status === 'loading' && <div className="admin-loading">Carregando…</div>}
        {state.status === 'error' && <div className="admin-empty">{state.message}</div>}
        {state.status === 'ready' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th><th>CNPJ</th><th>Tabela</th><th>Limite</th><th>Representante</th><th></th>
              </tr>
            </thead>
            <tbody>
              {state.data.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.cnpj}</td>
                  <td>{a.priceTable}</td>
                  <td>R$ {a.creditLimit.toLocaleString('pt-BR')}</td>
                  <td>{a.representative.name}</td>
                  <td>
                    <button className="btn btn-icon btn-secondary" onClick={() => setEditing(a)}><PencilSimple size={14} /></button>
                    <button className="btn btn-icon btn-secondary" onClick={() => remove(a.id)} style={{ marginLeft: 6 }}><Trash size={14} /></button>
                  </td>
                </tr>
              ))}
              {state.data.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">Nenhum cliente cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <ClientModal
          account={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function ClientModal({ account, onClose, onSaved }: {
  account: ClientAccount | null; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(account?.name || '');
  const [cnpj, setCnpj] = useState(account?.cnpj || '');
  const [password, setPassword] = useState('');
  const [priceTable, setPriceTable] = useState(account?.priceTable || 'Contrato B1');
  const [creditLimit, setCreditLimit] = useState(account?.creditLimit ?? 0);
  const [addressLabel, setAddressLabel] = useState(account?.address.label || '');
  const [addressLine, setAddressLine] = useState(account?.address.line || '');
  const [repName, setRepName] = useState(account?.representative.name || 'Marcelo Ferrão');
  const [repPhone, setRepPhone] = useState(account?.representative.phone || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true);
    setError(null);
    const input: ClientAccountInput = {
      name, cnpj, priceTable, creditLimit,
      address: { label: addressLabel, line: addressLine },
      representative: { name: repName, role: 'Seu representante REQUENA', phone: repPhone },
      ...(password ? { password } : {}),
    };
    try {
      if (account) await api.updateAccount(account.id, input);
      else await api.createAccount(input);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{account ? 'Editar cliente' : 'Novo cliente'}</h3>
        <div className="admin-form-grid">
          <div className="field span-2"><label>Nome do cliente</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label>CNPJ</label><input className="input" value={cnpj} onChange={(e) => setCnpj(e.target.value)} /></div>
          <div className="field">
            <label>{account ? 'Nova senha (opcional)' : 'Senha de acesso'}</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={account ? 'Deixe em branco para manter' : ''} />
          </div>
          <div className="field"><label>Tabela de preços</label><input className="input" value={priceTable} onChange={(e) => setPriceTable(e.target.value)} /></div>
          <div className="field"><label>Limite de crédito (R$)</label><input className="input" type="number" value={creditLimit} onChange={(e) => setCreditLimit(Number(e.target.value))} /></div>
          <div className="field span-2"><label>Endereço — nome (ex.: "Depósito")</label><input className="input" value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)} /></div>
          <div className="field span-2"><label>Endereço — rua, cidade, UF</label><input className="input" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} /></div>
          <div className="field"><label>Representante</label><input className="input" value={repName} onChange={(e) => setRepName(e.target.value)} /></div>
          <div className="field"><label>Telefone do representante</label><input className="input" value={repPhone} onChange={(e) => setRepPhone(e.target.value)} /></div>
        </div>
        {error && <p style={{ color: '#e88', fontSize: 12.5, margin: 0 }}>{error}</p>}
        <div className="admin-modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
        </div>
      </div>
    </div>
  );
}
