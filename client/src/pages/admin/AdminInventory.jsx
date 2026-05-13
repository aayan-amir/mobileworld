import { useEffect, useRef, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { api, pkr } from '../../utils/api';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  function load() {
    api.adminInventory().then(setProducts).catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function patchProduct(id, patch) {
    const updated = await api.updateProduct(id, patch);
    setProducts((current) => current.map((product) => product.id === id ? updated : product));
  }

  async function patchVariant(productId, variantId, patch) {
    const updated = await api.updateVariant(productId, variantId, patch);
    setProducts((current) => current.map((product) => product.id === productId ? {
      ...product,
      variants: product.variants.map((variant) => variant.variantId === variantId ? updated : variant)
    } : product));
  }

  async function remove(id) {
    if (!confirm('Delete this product?')) return;
    await api.deleteProduct(id);
    setProducts((current) => current.filter((product) => product.id !== id));
  }

  async function uploadJson(file) {
    if (!file || !confirm('Replace the full inventory JSON?')) return;
    const text = await file.text();
    await api.replaceInventory(JSON.parse(text));
    load();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-5xl font-bold text-navy">Inventory</h1>
        <button className="btn-secondary" onClick={() => fileRef.current?.click()} type="button"><Upload size={18} /> Upload JSON</button>
        <input ref={fileRef} className="hidden" type="file" accept="application/json" onChange={(e) => uploadJson(e.target.files?.[0])} />
      </div>
      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-danger">{error}</div>}
      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-muted"><tr><th className="p-3">Product</th><th className="p-3">Type</th><th className="p-3">Variants</th><th className="p-3">Published</th><th className="p-3">Actions</th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t align-top">
                  <td className="p-3">
                    <div className="font-bold text-navy">{product.name}</div>
                    <div className="text-xs text-muted">{product.brand} / {product.approval}</div>
                    <div className="mt-1 text-xs text-muted">Imported: {product._importedFrom || 'Manual'}</div>
                    <SpecsEditor product={product} onSave={(specs) => patchProduct(product.id, { specs })} />
                  </td>
                  <td className="p-3 capitalize">{product.condition}</td>
                  <td className="p-3">
                    <div className="space-y-2">
                      {product.variants?.map((variant) => (
                        <div key={variant.variantId} className="grid gap-2 rounded-lg bg-slate-50 p-2 md:grid-cols-[1fr_110px_110px]">
                          <div>
                            <div className="font-bold">{variant.storage} / {variant.color}</div>
                            <div className="text-xs text-muted">Cost {pkr(variant.costPrice)}</div>
                          </div>
                          <input className="field py-1" type="number" defaultValue={variant.stock} onBlur={(e) => patchVariant(product.id, variant.variantId, { stock: Number(e.target.value) })} />
                          <input className="field py-1" type="number" defaultValue={variant.price} onBlur={(e) => patchVariant(product.id, variant.variantId, { price: Number(e.target.value) })} />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <input className="h-5 w-5 accent-gold" type="checkbox" checked={Boolean(product.published)} onChange={(e) => patchProduct(product.id, { published: e.target.checked })} />
                  </td>
                  <td className="p-3">
                    <button className="rounded-lg p-2 text-danger hover:bg-red-50" onClick={() => remove(product.id)} type="button"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function SpecsEditor({ product, onSave }) {
  const [open, setOpen] = useState(false);
  const [specs, setSpecs] = useState(product.specs || {});

  if (!open) return <button className="mt-2 text-xs font-bold text-gold" onClick={() => setOpen(true)} type="button">Edit specs</button>;

  return (
    <div className="mt-3 grid gap-2">
      {['storage', 'color', 'display', 'chip', 'camera', 'battery'].map((key) => (
        <input key={key} className="field py-1 text-xs" placeholder={key} value={specs[key] || ''} onChange={(e) => setSpecs({ ...specs, [key]: e.target.value })} />
      ))}
      <button className="btn-secondary py-1 text-xs" onClick={() => { onSave(specs); setOpen(false); }} type="button">Save specs</button>
    </div>
  );
}
