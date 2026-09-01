import { useState } from 'react';
import { Basket, MapPin, CalendarBlank, Minus, Plus } from '@phosphor-icons/react';
import { useNav } from '../context/NavContext';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import { usePaymentMethods } from '../hooks/useCatalog';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { api } from '../api/client';
import { money, qtyLabel } from '../utils/format';
import './CartScreen.css';

export function CartScreen() {
  const { go } = useNav();
  const cart = useCart();
  const session = useSession();
  const paymentMethods = usePaymentMethods();

  const [paymentIndex, setPaymentIndex] = useState(1);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const subtotal = cart.cart.subtotal;
  const selectedMethod = paymentMethods.status === 'ready' ? paymentMethods.data[paymentIndex] : undefined;
  const discount = subtotal != null && selectedMethod ? subtotal * selectedMethod.discount : null;
  const total = subtotal != null && discount != null ? subtotal - discount : null;
  const discountLabel = selectedMethod?.discount ? `Desconto ${selectedMethod.note.replace('−', '')}` : 'Sem desconto no prazo';

  const isEmpty = !cart.loading && cart.cart.items.length === 0;

  const sendOrder = async () => {
    if (!selectedMethod) return;
    setSending(true);
    try {
      const order = await api.createOrder({ paymentMethodId: selectedMethod.id, note });
      await cart.refresh();
      go({ screen: 'done', kind: 'order', order });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="app-scroll">
        <div className="cart-screen">
          {isEmpty && (
            <div className="cart-empty">
              <Basket size={34} color="var(--color-neutral-600)" />
              <p className="text-muted" style={{ margin: '12px 0 14px', fontSize: 13 }}>Nenhum item no pedido.</p>
              <button className="btn btn-primary" onClick={() => go({ screen: 'catalog' })}>Abrir catálogo</button>
            </div>
          )}

          {cart.cart.items.map((item) => (
            <div key={item.productId} className="cart-line">
              <ImagePlaceholder radius={6} label="foto" style={{ width: 52, height: 52, flex: 'none' }} />
              <div className="cart-line-info">
                <div className="cart-line-name">{item.name}</div>
                <div className="text-muted cart-line-detail">
                  {item.unitPrice != null ? `${money(item.unitPrice)} / ${item.unit === 'un' ? 'cx' : 'kg'}` : 'contrato'} · {item.origin}
                </div>
              </div>
              <div className="cart-line-stepper">
                <button className="btn btn-secondary cart-step-btn" onClick={() => cart.setItem(item.productId, item.qty - item.sackSize)}><Minus size={12} /></button>
                <span className="cart-line-qty">{qtyLabel(item.unit, item.qty)}</span>
                <button className="btn btn-secondary cart-step-btn" onClick={() => cart.setItem(item.productId, item.qty + item.sackSize)}><Plus size={12} /></button>
              </div>
              <span className="cart-line-total">{item.lineTotal != null ? money(item.lineTotal) : '—'}</span>
            </div>
          ))}

          {!isEmpty && session.status === 'ready' && (
            <>
              <div className="cart-section">
                <h6 className="cart-section-title">Entrega</h6>
                <div className="cart-address-row">
                  <MapPin size={16} color="var(--color-accent-400)" style={{ marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{session.account.address.label}</div>
                    <div className="text-muted" style={{ fontSize: 11.5 }}>{session.account.address.line}</div>
                  </div>
                  <button className="btn btn-ghost" style={{ fontSize: 12 }}>Trocar</button>
                </div>
                <div className="cart-window-row">
                  <CalendarBlank size={16} color="var(--color-accent-400)" />
                  <div style={{ fontSize: 13 }}>{session.account.nextDeliveryWindow.label}</div>
                </div>
              </div>

              <div className="cart-section">
                <h6 className="cart-section-title">Pagamento</h6>
                <div className="cart-payment-list">
                  {paymentMethods.status === 'ready' && paymentMethods.data.map((m, i) => (
                    <button key={m.id} className={`cart-payment-row${paymentIndex === i ? ' is-active' : ''}`} onClick={() => setPaymentIndex(i)}>
                      <span style={{ fontSize: 13, fontFamily: 'var(--font-heading)' }}>{m.label}</span>
                      <span className="text-muted" style={{ fontSize: 11.5, marginLeft: 'auto' }}>{m.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cart-section cart-totals">
                <div className="cart-total-row"><span className="text-muted">Produtos</span><span style={{ marginLeft: 'auto' }}>{subtotal != null ? money(subtotal) : '—'}</span></div>
                <div className="cart-total-row"><span className="text-muted">Frete CIF</span><span style={{ marginLeft: 'auto' }}>incluso</span></div>
                <div className="cart-total-row" style={{ color: 'var(--color-accent-300)' }}>
                  <span>{discountLabel}</span>
                  <span style={{ marginLeft: 'auto' }}>{discount ? `− ${money(discount)}` : '—'}</span>
                </div>
              </div>

              <div className="field">
                <label>Observação para a expedição</label>
                <textarea className="input" style={{ minHeight: 64 }} placeholder="Ex.: entregar pela rampa dos fundos" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </>
          )}
        </div>
      </div>

      {!isEmpty && (
        <div className="app-actionbar">
          <div className="app-actionbar-total">
            <div className="label">Total do pedido</div>
            <div className="value">{total != null ? money(total) : 'sob contrato'}</div>
          </div>
          <button className="btn btn-primary" disabled={sending} onClick={sendOrder}>Enviar pedido</button>
        </div>
      )}
    </>
  );
}
