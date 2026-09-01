import { useState } from 'react';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { money, kg } from '../utils/format';
import type { Quote } from '../api/types';

const RECURRENCE_LABELS: Record<string, string> = { once: 'Uma vez', monthly: 'Mensal', biweekly: 'Quinzenal' };

export function QuotesScreen() {
  const [state, refresh] = useAsync(() => api.getQuotes(), []);
  const [responding, setResponding] = useState<Quote | null>(null);

  return (
    <div>
      <div className="admin-header"><h2>Cotações</h2></div>
      <div className="admin-table-wrap">
        {state.status === 'loading' && <div className="admin-loading">Carregando…</div>}
        {state.status === 'error' && <div className="admin-empty">{state.message}</div>}
        {state.status === 'ready' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th><th>Produto</th><th>Volume</th><th>Entrega até</th><th>Recorrência</th><th>Status</th><th>Resposta</th><th></th>
              </tr>
            </thead>
            <tbody>
              {state.data.map((q) => (
                <tr key={q.id}>
                  <td>{q.accountName}</td>
                  <td>{q.productName}</td>
                  <td>{q.volumeKg ? kg(q.volumeKg) : '—'}</td>
                  <td>{q.deliverBy || '—'}</td>
                  <td>{RECURRENCE_LABELS[q.recurrence] || q.recurrence}</td>
                  <td><span className={`admin-status-pill status-${q.status}`}>{q.status === 'pending' ? 'Pendente' : 'Respondida'}</span></td>
                  <td>{q.response ? (q.response.price != null ? money(q.response.price) : q.response.note || '—') : '—'}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => setResponding(q)}>
                      {q.status === 'pending' ? 'Responder' : 'Editar resposta'}
                    </button>
                  </td>
                </tr>
              ))}
              {state.data.length === 0 && (
                <tr><td colSpan={8} className="admin-empty">Nenhuma cotação recebida ainda.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {responding && (
        <RespondModal quote={responding} onClose={() => setResponding(null)} onSaved={() => { setResponding(null); refresh(); }} />
      )}
    </div>
  );
}

function RespondModal({ quote, onClose, onSaved }: { quote: Quote; onClose: () => void; onSaved: () => void }) {
  const [price, setPrice] = useState(quote.response?.price ?? 0);
  const [note, setNote] = useState(quote.response?.note ?? '');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await api.respondQuote(quote.id, price || null, note);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Responder cotação #{quote.id}</h3>
        <p className="text-muted" style={{ margin: 0, fontSize: 13 }}>
          {quote.accountName} pediu <strong>{quote.productName}</strong>
          {quote.volumeKg ? `, ${kg(quote.volumeKg)}` : ''}
          {quote.deliverBy ? `, entrega até ${quote.deliverBy}` : ''}.
          {quote.note && <> Observação: “{quote.note}”.</>}
        </p>
        <div className="admin-form-grid">
          <div className="field"><label>Preço fechado (R$/kg ou /un)</label><input className="input" type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
          <div className="field span-2"><label>Nota para o cliente</label><textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Prazo de embarque, condições, etc." /></div>
        </div>
        <div className="admin-modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? 'Salvando…' : 'Enviar resposta'}</button>
        </div>
      </div>
    </div>
  );
}
