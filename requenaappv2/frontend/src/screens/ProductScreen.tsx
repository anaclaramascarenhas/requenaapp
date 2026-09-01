import { useEffect, useState } from 'react';
import { Scales, ArrowRight, Plus } from '@phosphor-icons/react';
import { useNav } from '../context/NavContext';
import { useCart } from '../context/CartContext';
import { useCategories, useProduct } from '../hooks/useCatalog';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { money, qtyLabel } from '../utils/format';
import { unitPriceFor } from '../utils/pricing';
import './ProductScreen.css';

const QTY_MULTIPLIERS = [1, 2, 5, 10];

export function ProductScreen({ productId }: { productId: string }) {
  const { go } = useNav();
  const cart = useCart();
  const categories = useCategories();
  const product = useProduct(productId);

  const [fmtIndex, setFmtIndex] = useState(0);
  const [qtyIndex, setQtyIndex] = useState(1);
  useEffect(() => { setFmtIndex(0); setQtyIndex(1); }, [productId]);

  if (product.status !== 'ready') {
    return <div className="app-scroll"><div className="app-loading" style={{ minHeight: 200 }}>Carregando…</div></div>;
  }
  const p = product.data;
  const categoryName = categories.status === 'ready' ? categories.data.find((c) => c.id === p.categoryId)?.name : '';
  const unitSuffix = p.unit === 'un' ? 'cx' : 'kg';

  const lineQty = p.sackSize * QTY_MULTIPLIERS[qtyIndex];
  const unitPrice = unitPriceFor(p, lineQty);
  const lineTotal = unitPrice != null ? unitPrice * lineQty : null;

  const formats = [
    { label: p.unit === 'un' ? 'Caixa fechada' : `Saco ${p.sackSize} kg` },
    { label: p.unit === 'un' ? 'Unidade' : 'Granel' },
  ];

  return (
    <>
      <div className="app-scroll">
        <div className="product-screen">
          <ImagePlaceholder height={224} label="Foto do produto" />
          <div className="product-body">
            <div>
              <div className="product-kicker">{categoryName} · {p.origin}</div>
              <h3 className="product-title">{p.name}</h3>
              <p className="text-muted product-copy">{p.description ?? `${p.spec}. Lote conferido na entrada e liberado pelo controle de qualidade da REQUENA.`}</p>
            </div>

            <div className="product-price-row">
              <div>
                <div className="product-price">{p.price != null ? `${money(p.price)} / ${unitSuffix}` : 'Preço de contrato'}</div>
                <div className="text-muted product-price-note">{p.price != null ? 'Seu preço de contrato B2 · sem frete adicional' : 'Entre com seu CNPJ para ver preços'}</div>
              </div>
              <span className="tag tag-outline" style={{ marginLeft: 'auto' }}>{p.stockLabel}</span>
            </div>

            {p.tier && (
              <div>
                <h6 className="product-section-title">Faixas por volume</h6>
                <table className="table">
                  <tbody>
                    <tr>
                      <td style={{ paddingLeft: 0, fontSize: 13 }}>até {qtyLabel(p.unit, p.tier.minQty - 1)}</td>
                      <td style={{ textAlign: 'right', paddingRight: 0, fontSize: 13 }}>{p.price != null ? money(p.price) : '—'}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 0, fontSize: 13 }}>a partir de {qtyLabel(p.unit, p.tier.minQty)}</td>
                      <td style={{ textAlign: 'right', paddingRight: 0, fontSize: 13, color: 'var(--color-accent-300)' }}>{money(p.tier.price)}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: 0, fontSize: 13 }}>acima de 1 t</td>
                      <td style={{ textAlign: 'right', paddingRight: 0, fontSize: 13, color: 'var(--color-accent-300)' }}>sob cotação</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div>
              <h6 className="product-section-title">Formato</h6>
              <div className="seg">
                {formats.map((f, i) => (
                  <label key={f.label} className={`seg-opt${fmtIndex === i ? ' is-active' : ''}`} onClick={() => setFmtIndex(i)}>{f.label}</label>
                ))}
              </div>
            </div>

            <div>
              <h6 className="product-section-title">Quantidade</h6>
              <div className="product-qty-row">
                {QTY_MULTIPLIERS.map((m, i) => (
                  <button key={m} className={`chip${qtyIndex === i ? ' is-active' : ''}`} onClick={() => setQtyIndex(i)}>
                    {qtyLabel(p.unit, p.sackSize * m)}
                  </button>
                ))}
              </div>
            </div>

            <div className="product-quote-callout">
              <Scales size={17} color="var(--color-accent-400)" style={{ marginTop: 1, flex: 'none' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontFamily: 'var(--font-heading)' }}>Acima de 1 tonelada, o preço é negociado</div>
                <button className="btn btn-ghost" style={{ paddingLeft: 0, fontSize: 12.5, marginTop: 2 }} onClick={() => go({ screen: 'quote', productId: p.id, productName: p.name })}>
                  Pedir cotação <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="app-actionbar">
        <div className="app-actionbar-total">
          <div className="label">{qtyLabel(p.unit, lineQty)} · {unitPrice != null ? `${money(unitPrice)} / ${unitSuffix}` : 'contrato'}</div>
          <div className="value">{lineTotal != null ? money(lineTotal) : '—'}</div>
        </div>
        <button className="btn btn-primary" onClick={async () => { await cart.addItem(p.id, lineQty); go({ screen: 'cart' }); }}>
          <Plus size={15} /> Adicionar ao pedido
        </button>
      </div>
    </>
  );
}
