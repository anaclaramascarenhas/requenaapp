import { useEffect, useState } from 'react';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { api } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { money } from '../utils/format';
import type { Category, Product, ProductInput } from '../api/types';

const EMPTY: ProductInput = {
  categoryId: '', name: '', spec: '', origin: '', stockLabel: '',
  sackSize: 25, unit: 'kg', featured: false, description: '',
  price: 0, tierQty: 0, tierPrice: 0,
};

export function ProductsScreen() {
  const [state, refresh] = useAsync(() => api.getProducts(), []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  useEffect(() => { api.getCategories().then(setCategories); }, []);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name || id;

  const remove = async (id: string) => {
    if (!confirm('Remover este produto?')) return;
    await api.deleteProduct(id);
    refresh();
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Produtos</h2>
        <button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={15} /> Novo produto</button>
      </div>

      <div className="admin-table-wrap">
        {state.status === 'loading' && <div className="admin-loading">Carregando…</div>}
        {state.status === 'error' && <div className="admin-empty">{state.message}</div>}
        {state.status === 'ready' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produto</th><th>Categoria</th><th>Origem</th><th>Preço</th><th>Faixa (qtd · preço)</th><th>Estoque</th><th>Destaque</th><th></th>
              </tr>
            </thead>
            <tbody>
              {state.data.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{categoryName(p.categoryId)}</td>
                  <td>{p.origin}</td>
                  <td>{money(p.price)} / {p.unit}</td>
                  <td>{p.tierQty ? `≥ ${p.tierQty} · ${money(p.tierPrice)}` : '—'}</td>
                  <td>{p.stockLabel}</td>
                  <td>{p.featured ? 'Sim' : '—'}</td>
                  <td>
                    <button className="btn btn-icon btn-secondary" onClick={() => setEditing(p)}><PencilSimple size={14} /></button>
                    <button className="btn btn-icon btn-secondary" onClick={() => remove(p.id)} style={{ marginLeft: 6 }}><Trash size={14} /></button>
                  </td>
                </tr>
              ))}
              {state.data.length === 0 && (
                <tr><td colSpan={8} className="admin-empty">Nenhum produto cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <ProductModal
          product={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function ProductModal({ product, categories, onClose, onSaved }: {
  product: Product | null; categories: Category[]; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductInput>(product ? { ...product } : { ...EMPTY, categoryId: categories[0]?.id || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      if (product) await api.updateProduct(product.id, form);
      else await api.createProduct(form);
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
        <h3>{product ? 'Editar produto' : 'Novo produto'}</h3>
        <div className="admin-form-grid">
          <div className="field span-2"><label>Nome</label><input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div className="field">
            <label>Categoria</label>
            <select className="input" value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Unidade</label>
            <select className="input" value={form.unit} onChange={(e) => set('unit', e.target.value as 'kg' | 'un')}>
              <option value="kg">kg (granel/saco)</option>
              <option value="un">un (caixa)</option>
            </select>
          </div>
          <div className="field span-2"><label>Especificação</label><input className="input" value={form.spec} onChange={(e) => set('spec', e.target.value)} /></div>
          <div className="field"><label>Origem</label><input className="input" value={form.origin} onChange={(e) => set('origin', e.target.value)} /></div>
          <div className="field"><label>Estoque (texto)</label><input className="input" value={form.stockLabel} onChange={(e) => set('stockLabel', e.target.value)} /></div>
          <div className="field"><label>Preço (R$)</label><input className="input" type="number" step="0.01" value={form.price} onChange={(e) => set('price', Number(e.target.value))} /></div>
          <div className="field"><label>Tamanho do saco/caixa</label><input className="input" type="number" value={form.sackSize} onChange={(e) => set('sackSize', Number(e.target.value))} /></div>
          <div className="field"><label>Qtd. p/ faixa de volume</label><input className="input" type="number" value={form.tierQty} onChange={(e) => set('tierQty', Number(e.target.value))} /></div>
          <div className="field"><label>Preço na faixa (R$)</label><input className="input" type="number" step="0.01" value={form.tierPrice} onChange={(e) => set('tierPrice', Number(e.target.value))} /></div>
          <div className="field span-2"><label>Descrição</label><textarea className="input" value={form.description || ''} onChange={(e) => set('description', e.target.value)} /></div>
          <label className="field" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} /> Destacar na home ("Safra nova")
          </label>
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
