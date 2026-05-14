import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, pkr } from '../../utils/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        const [ordersData, inventoryData] = await Promise.all([
          api.adminOrders(),
          api.adminInventory()
        ]);
        if (cancelled) return;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) {
          navigate('/admin/login', { replace: true });
          return;
        }
        setError(err.message || 'Could not load dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, [navigate]);

  const stats = useMemo(() => ['pending', 'confirmed', 'completed', 'returned'].map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length
  })), [orders]);

  const lowStock = inventory.flatMap((product) => (product.variants || [])
    .filter((variant) => variant.stock <= 2)
    .map((variant) => ({ product, variant })));

  async function updateStatus(id, status) {
    setError('');
    try {
      const updated = await api.updateOrder(id, { status });
      setOrders((current) => current.map((order) => order.id === id ? updated : order));
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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-5xl font-bold text-navy">Dashboard</h1>
        <div className="flex gap-3">
          <Link className="btn-secondary" to="/admin/orders">Orders</Link>
          <Link className="btn-secondary" to="/admin/inventory">Inventory</Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <div key={item.status} className="panel p-5">
            <div className="text-sm font-bold uppercase text-muted">{item.status}</div>
            <div className="mt-2 text-4xl font-bold text-navy">{item.count}</div>
          </div>
        ))}
      </div>
      {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="panel overflow-hidden">
          <div className="border-b p-5 font-display text-2xl font-bold text-navy">Recent Orders</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-muted"><tr><th className="p-3">ID</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead>
              <tbody>
                {orders.slice(0, 8).map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="p-3 font-bold text-navy">{order.id}</td>
                    <td className="p-3">{order.customer_name}</td>
                    <td className="p-3">{pkr(order.total_amount)}</td>
                    <td className="p-3"><Status value={order.status} onChange={(status) => updateStatus(order.id, status)} /></td>
                  </tr>
                ))}
                {!loading && orders.length === 0 && (
                  <tr className="border-t">
                    <td className="p-6 text-center text-muted" colSpan="4">No orders yet.</td>
                  </tr>
                )}
                {loading && (
                  <tr className="border-t">
                    <td className="p-6 text-center text-muted" colSpan="4">Loading orders...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <aside className="panel h-fit p-5">
          <h2 className="font-display text-2xl font-bold text-navy">Low Stock</h2>
          <div className="mt-4 space-y-3">
            {lowStock.length === 0 && <p className="text-muted">No low-stock variants.</p>}
            {lowStock.slice(0, 12).map(({ product, variant }) => (
              <div key={variant.variantId} className="rounded-lg bg-slate-50 p-3">
                <div className="font-bold text-navy">{product.name}</div>
                <div className="text-sm text-muted">{variant.storage} / {variant.color}</div>
                <div className="font-bold text-warning">{variant.stock} left</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

function Status({ value, onChange }) {
  return (
    <select className="field py-1" value={value} onChange={(e) => onChange(e.target.value)}>
      {['pending', 'confirmed', 'completed', 'returned'].map((status) => <option key={status} value={status}>{status}</option>)}
    </select>
  );
}
