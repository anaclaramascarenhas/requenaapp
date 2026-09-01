import { ArrowsClockwise, ArrowCounterClockwise } from '@phosphor-icons/react';
import { Truck } from '@phosphor-icons/react';
import { useNav } from '../context/NavContext';
import { useSession } from '../context/SessionContext';
import { useCart } from '../context/CartContext';
import { useCategories, useProducts, useRecurringOrder } from '../hooks/useCatalog';
import { CategoryIcon } from '../components/CategoryIcon';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { money } from '../utils/format';
import './HomeScreen.css';

export function HomeScreen() {
  const { go } = useNav();
  const session = useSession();
  const cart = useCart();
  const recurring = useRecurringOrder();
  const categories = useCategories();
  const featured = useProducts({ featured: true });

  const accountName = session.status === 'ready' ? session.account.name : '';
  const nextDelivery = session.status === 'ready' ? session.account.nextDeliveryWindow.shortLabel : '';

  return (
    <div className="app-scroll">
      <div className="home-screen">
        <div>
          <h3>Bom dia, {accountName}</h3>
          <p className="text-muted" style={{ fontSize: 13 }}>Sua reposição de terça está pronta para sair.</p>
        </div>

        {recurring.status === 'ready' && recurring.data && (() => {
          const data = recurring.data!;
          return (
            <div className="recurring-card">
              <div className="recurring-card-row">
                <ArrowsClockwise weight="fill" size={14} color="var(--color-accent)" />
                <span className="recurring-kicker">Pedido recorrente</span>
                <span className="tag tag-neutral" style={{ marginLeft: 'auto' }}>{data.intervalLabel}</span>
              </div>
              <div>
                <div className="recurring-title">{data.itemIds.length} itens · {data.totalWeightKg} kg</div>
                <div className="text-muted recurring-summary">{data.summaryLabel}</div>
              </div>
              <div className="recurring-card-row" style={{ alignItems: 'baseline' }}>
                <span className="recurring-price">{money(data.contractTotal)}</span>
                <span className="text-muted" style={{ fontSize: 11.5 }}>preço de contrato · frete CIF</span>
              </div>
              <div className="recurring-actions">
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={async () => { await cart.repeatRecurring(data.id); go({ screen: 'cart' }); }}
                >
                  <ArrowCounterClockwise size={15} /> Repetir pedido
                </button>
                <button className="btn btn-secondary" onClick={() => go({ screen: 'cart' })}>Editar lista</button>
              </div>
            </div>
          );
        })()}

        <div>
          <div className="home-section-heading">
            <h5>Categorias</h5>
            <span className="text-muted" style={{ marginLeft: 'auto', fontSize: 11.5 }}>
              {categories.status === 'ready' ? `${categories.data.length} linhas` : ''}
            </span>
          </div>
          <div className="category-grid">
            {categories.status === 'ready' && categories.data.map((c) => (
              <button key={c.id} className="category-tile" onClick={() => go({ screen: 'catalog', category: c.id })}>
                <CategoryIcon name={c.icon} size={19} color="var(--color-accent-400)" />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="home-section-heading">
            <h5>Safra nova</h5>
            <button className="btn btn-ghost" style={{ marginLeft: 'auto', fontSize: 12.5 }} onClick={() => go({ screen: 'catalog' })}>Ver tudo</button>
          </div>
          <div className="featured-row">
            {featured.status === 'ready' && featured.data.map((p) => (
              <div key={p.id} className="featured-card" onClick={() => go({ screen: 'product', productId: p.id })}>
                <ImagePlaceholder height={118} label={p.name} />
                <div className="featured-card-body">
                  <div className="featured-card-origin">{p.origin}</div>
                  <div className="featured-card-name">{p.name}</div>
                  <div className="featured-card-price">
                    <span>{p.price != null ? money(p.price) : 'Preço de contrato'}</span>
                    {p.price != null && <span className="text-muted" style={{ fontSize: 11 }}>/ {p.unit}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="home-delivery-note">
          <Truck size={17} color="var(--color-accent-400)" style={{ marginTop: 1, flex: 'none' }} />
          <div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-heading)' }}>Entrega {nextDelivery}</div>
            <div className="text-muted" style={{ fontSize: 11.5 }}>Pedidos fechados até quarta, 14h. Mínimo de 200 kg por rota.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
