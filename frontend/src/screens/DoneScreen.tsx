import { CheckCircle, User, Phone } from '@phosphor-icons/react';
import { useNav } from '../context/NavContext';
import { useSession } from '../context/SessionContext';
import type { Order, Quote } from '../api/types';
import './DoneScreen.css';

export function DoneScreen({ kind, order, quote }: { kind: 'order' | 'quote'; order?: Order; quote?: Quote }) {
  const { go } = useNav();
  const session = useSession();

  const representative = quote?.representative ?? (session.status === 'ready' ? session.account.representative : undefined);
  const title = kind === 'quote' ? 'Cotação enviada' : 'Pedido enviado';
  const body = kind === 'quote'
    ? `${representative?.name.split(' ')[0] ?? 'Seu representante'} responde em até 4 horas úteis com preço fechado e prazo de embarque. Você recebe no app e por e-mail.`
    : `Pedido ${order?.id} confirmado. A expedição fecha a carga na quarta às 14h e a entrega sai ${order?.deliveryWindow.label}.`;

  return (
    <div className="app-scroll">
      <div className="done-screen">
        <CheckCircle weight="fill" size={44} color="var(--color-accent)" />
        <h3 style={{ margin: 0, fontSize: 26 }}>{title}</h3>
        <p className="text-muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>{body}</p>
        {representative && (
          <div className="done-rep-card">
            <div className="done-rep-avatar"><User size={17} color="var(--color-accent-100)" /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-heading)' }}>{representative.name}</div>
              <div className="text-muted" style={{ fontSize: 11.5 }}>{representative.role}</div>
            </div>
            <a className="btn btn-icon btn-primary" href={`tel:${representative.phone}`}><Phone size={16} /></a>
          </div>
        )}
        <button className="btn btn-secondary btn-block" style={{ marginTop: 8 }} onClick={() => go({ screen: 'home' })}>Voltar ao início</button>
      </div>
    </div>
  );
}
