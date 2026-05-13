import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, pkr } from '../../utils/api';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    api.adminOrders().then(setOrders).catch(() => setOrders([]));
    api.adminInventory().then(setInventory).catch(() => setInventory([]));
  }, []);

  const stats = useMemo(() => ['pending', 'confirmed', 'completed', 'returned'].map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length
  })), [orders]);

  const lowStock = inventory.flatMap((product) => (product.variants || [])
    .filter((variant) => variant.stock <= 2)
    .map((variant) => ({ product, variant })));

  async function updateStatus(id, status) {
    const updated = await api.updateOrder(id, { status });
    setOrders((current) => current.map((order) => order.id === id ? updated : order));
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
