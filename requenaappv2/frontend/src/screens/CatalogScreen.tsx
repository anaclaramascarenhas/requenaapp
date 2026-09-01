import { useEffect, useState } from 'react';
import { MagnifyingGlass, SlidersHorizontal, Plus } from '@phosphor-icons/react';
import { useNav } from '../context/NavContext';
import { useCart } from '../context/CartContext';
import { useCategories, useProducts } from '../hooks/useCatalog';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { money, qtyLabel } from '../utils/format';
import type { Product } from '../api/types';
import './CatalogScreen.css';

export function CatalogScreen() {
  const { nav, go } = useNav();
  const cart = useCart();
  const categories = useCategories();
  const navCategory = nav.screen === 'catalog' ? nav.category : undefined;

  const [category, setCategory] = useState(navCategory ?? 'todos');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => { setCategory(navCategory ?? 'todos'); }, [navCategory]);

  const products = useProducts({ category: category === 'todos' ? undefined : category, q: debouncedQuery || undefined });

  return (
    <div className="app-scroll">
      <div className="catalog-screen">
        <div className="field">
          <div className="catalog-search">
            <MagnifyingGlass size={15} className="catalog-search-icon" />
            <input
              className="input"
              style={{ paddingLeft: 31 }}
              placeholder="Buscar grão, tempero, conserva…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="catalog-chip-row">
          <button className={`chip${category === 'todos' ? ' is-active' : ''}`} onClick={() => setCategory('todos')}>Todos</button>
          {categories.status === 'ready' && categories.data.map((c) => (
            <button key={c.id} className={`chip${category === c.id ? ' is-active' : ''}`} onClick={() => setCategory(c.id)}>{c.name}</button>
          ))}
        </div>

        <div className="catalog-count-row">
          <span className="text-muted" style={{ fontSize: 11.5 }}>
            {products.status === 'ready' ? `${products.data.length} produtos · preço do contrato B2` : ''}
          </span>
          <button className="btn btn-ghost" style={{ marginLeft: 'auto', fontSize: 12 }}>
            <SlidersHorizontal size={14} /> Filtrar
          </button>
        </div>

        <div className="catalog-list">
          {products.status === 'ready' && products.data.map((p) => (
            <ProductRow key={p.id} product={p} onOpen={() => go({ screen: 'product', productId: p.id })} onQuickAdd={() => cart.addItem(p.id, p.sackSize)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product, onOpen, onQuickAdd }: { product: Product; onOpen: () => void; onQuickAdd: () => void }) {
  const tierStr = product.tier
    ? `≥ ${qtyLabel(product.unit, product.tier.minQty)} · ${money(product.tier.price)}`
    : 'Entre para ver faixas';
  return (
    <div className="catalog-row" onClick={onOpen}>
      <ImagePlaceholder radius={6} label="foto" style={{ width: 76, height: 76, flex: 'none' }} />
      <div className="catalog-row-info">
        <div className="catalog-row-name">{product.name}</div>
        <div className="text-muted catalog-row-spec">{product.spec}</div>
        <div className="catalog-row-price">
          <span>{product.price != null ? money(product.price) : 'Preço de contrato'}</span>
          {product.price != null && <span className="text-muted" style={{ fontSize: 11 }}>/ {product.unit}</span>}
        </div>
        <div className="catalog-row-tier">{tierStr}</div>
      </div>
      <button
        className="btn btn-icon btn-primary"
        style={{ alignSelf: 'center', flex: 'none' }}
        onClick={(e) => { e.stopPropagation(); onQuickAdd(); }}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
