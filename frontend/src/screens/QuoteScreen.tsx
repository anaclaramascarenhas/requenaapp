import { useState } from 'react';
import { useNav } from '../context/NavContext';
import { api } from '../api/client';
import './QuoteScreen.css';

const RECURRENCE_OPTIONS: { code: string; label: string }[] = [
  { code: 'once', label: 'Uma vez' },
  { code: 'monthly', label: 'Mensal' },
  { code: 'biweekly', label: 'Quinzenal' },
];

export function QuoteScreen({ productId, productName }: { productId?: string; productName?: string }) {
  const { go } = useNav();
  const [name, setName] = useState(productName ?? 'Grão-de-bico graúdo 8–9 mm');
  const [volume, setVolume] = useState('2.400 kg');
  const [deliverBy, setDeliverBy] = useState('12/09/2026');
  const [recurrenceIndex, setRecurrenceIndex] = useState(1);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const sendQuote = async () => {
    setSending(true);
    try {
      const volumeKg = Number(volume.replace(/\D/g, '')) || undefined;
      const quote = await api.createQuote({
        productId: productId ?? 'graodebico',
        volumeKg,
        deliverBy,
        recurrence: RECURRENCE_OPTIONS[recurrenceIndex].code,
        note,
      });
      go({ screen: 'done', kind: 'quote', quote });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="app-scroll">
      <div className="quote-screen">
        <p className="text-muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
          Volumes acima de 1 t saem da tabela e passam pelo seu representante. Diga o que precisa e para quando.
        </p>
        <div className="field"><label>Produto</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="quote-row">
          <div className="field" style={{ flex: 1 }}><label>Volume</label><input className="input" value={volume} onChange={(e) => setVolume(e.target.value)} /></div>
          <div className="field" style={{ flex: 1 }}><label>Entrega até</label><input className="input" value={deliverBy} onChange={(e) => setDeliverBy(e.target.value)} /></div>
        </div>
        <div>
          <h6 className="quote-section-title">Recorrência</h6>
          <div className="seg">
            {RECURRENCE_OPTIONS.map((opt, i) => (
              <label key={opt.code} className={`seg-opt${recurrenceIndex === i ? ' is-active' : ''}`} onClick={() => setRecurrenceIndex(i)}>{opt.label}</label>
            ))}
          </div>
        </div>
        <div className="field"><label>Observação</label><textarea className="input" placeholder="Calibre, embalagem, condição de pagamento…" value={note} onChange={(e) => setNote(e.target.value)} /></div>
        <button className="btn btn-primary btn-block" disabled={sending} onClick={sendQuote}>Enviar cotação</button>
      </div>
    </div>
  );
}
