import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, imageUrl, pkr } from '../../utils/api';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError('');
      try {
        const data = await api.adminOrders(status === 'all' ? '' : status);
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) {
          navigate('/admin/login', { replace: true });
          return;
        }
        setOrders([]);
        setError(err.message || 'Could not load orders.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();
    return () => { cancelled = true; };
  }, [navigate, status]);

  async function updateOrder(order, patch) {
    setError('');
    try {
      const updated = await api.updateOrder(order.id, patch);
      setOrders((current) => current.map((item) => item.id === order.id ? updated : item));
      setSelected(updated);
    } catch (err) {
      if (err.status === 401) {
        navigate('/admin/login', { replace: true });
        return;
      }
      setError(err.message || 'Could not update order.');
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-5xl font-bold text-navy">Orders</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {['all', 'pending', 'confirmed', 'completed', 'returned'].map((item) => (
          <button key={item} className={`rounded-lg px-4 py-2 font-bold ${status === item ? 'bg-navy text-white' : 'bg-white text-navy'}`} onClick={() => setStatus(item)} type="button">{item}</button>
        ))}
      </div>
      {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}
      <section className="panel mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-muted"><tr><th className="p-3">ID</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Date</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="cursor-pointer border-t hover:bg-slate-50" onClick={() => setSelected(order)}>
                  <td className="p-3 font-bold text-navy">{order.id}</td>
                  <td className="p-3">{order.customer_name}</td>
                  <td className="p-3">{pkr(order.total_amount)}</td>
                  <td className="p-3">{order.status}</td>
                  <td className="p-3">{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr className="border-t">
                  <td className="p-6 text-center text-muted" colSpan="5">No orders found.</td>
                </tr>
              )}
              {loading && (
                <tr className="border-t">
                  <td className="p-6 text-center text-muted" colSpan="5">Loading orders...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {selected && <OrderModal order={selected} onClose={() => setSelected(null)} onSave={updateOrder} />}
    </main>
  );
}

function OrderModal({ order, onClose, onSave }) {
  const [notes, setNotes] = useState(order.notes || '');
  const items = useMemo(() => order.items || [], [order]);

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
          <h2 className="font-display text-3xl font-bold text-navy">{order.id}</h2>
          <button className="rounded-lg p-2 hover:bg-slate-100" onClick={onClose} type="button"><X /></button>
        </div>
        <div className="grid gap-6 p-5 lg:grid-cols-2">
          <div>
            <h3 className="font-bold text-navy">Customer</h3>
            <p className="mt-2 text-sm">{order.customer_name}<br />{order.customer_email}<br />{order.customer_phone}</p>
            <h3 className="mt-6 font-bold text-navy">Items</h3>
            <div className="mt-2 space-y-2">
              {items.map((item) => (
                <div key={item.variantId} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <div className="font-bold">{item.name}</div>
                  <div className="text-muted">{item.variant}</div>
                  <div>{item.qty} x {pkr(item.price)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {(order.screenshot_url || order.screenshot_path) && <img src={imageUrl(order.screenshot_url || order.screenshot_path)} alt="Payment screenshot" className="max-h-80 w-full rounded-xl object-contain bg-slate-50" />}
            <div>
              <label className="label">Status</label>
              <select className="field" value={order.status} onChange={(e) => onSave(order, { status: e.target.value })}>
                {['pending', 'confirmed', 'completed', 'returned'].map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="field min-h-32" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => onSave(order, { notes })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
