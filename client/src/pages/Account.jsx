import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, PackageCheck, Save } from 'lucide-react';
import { api, pkr } from '../utils/api';

export default function Account() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.customerMe(), api.customerOrders()])
      .then(([me, history]) => {
        setCustomer(me);
        setForm({ name: me.name || '', phone: me.phone || '' });
        setOrders(history);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      const updated = await api.updateCustomer(form);
      setCustomer(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function logout() {
    await api.customerLogout();
    navigate('/');
  }

  if (!customer) return <main className="mx-auto max-w-7xl px-4 py-10">Loading account...</main>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-electric">Customer account</p>
          <h1 className="mt-2 text-4xl font-extrabold text-ink">Your orders</h1>
        </div>
        <button className="btn-secondary" onClick={logout} type="button"><LogOut size={18} /> Logout</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form className="panel h-fit p-5" onSubmit={save}>
          <div className="flex items-center gap-3">
            {customer.avatar_url && <img src={customer.avatar_url} alt={customer.name} className="h-14 w-14 rounded-full object-cover" />}
            <div>
              <div className="font-extrabold text-ink">{customer.email}</div>
              <div className="text-sm text-muted">Google account</div>
            </div>
          </div>
          <div className="mt-5">
            <label className="label">Full Name</label>
            <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="mt-4">
            <label className="label">Phone Number</label>
            <input className="field" placeholder="03xx xxxxxxx" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-danger">{error}</div>}
          <button className="btn-primary mt-5 w-full" type="submit"><Save size={18} /> Save profile</button>
        </form>

        <section className="space-y-4">
          {orders.length === 0 && (
            <div className="panel p-8 text-center">
              <PackageCheck className="mx-auto text-electric" size={36} />
              <h2 className="mt-3 text-2xl font-extrabold text-ink">No orders yet</h2>
              <p className="mt-2 text-muted">Orders placed with this email will appear here.</p>
              <Link className="btn-primary mt-5" to="/shop">Shop phones</Link>
            </div>
          )}
          {orders.map((order) => (
            <article key={order.id} className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link to={`/order/${order.id}`} className="text-lg font-extrabold text-ink hover:text-electric">{order.id}</Link>
                  <div className="text-sm text-muted">{new Date(order.created_at).toLocaleString()}</div>
                </div>
                <div className="rounded-full bg-electric/10 px-3 py-1 text-sm font-extrabold capitalize text-electric">{order.status}</div>
              </div>
              <div className="mt-4 space-y-2">
                {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items || []).map((item) => (
                  <div key={item.variantId} className="flex justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                    <span className="font-bold text-ink">{item.name} x {item.qty}</span>
                    <span>{pkr(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t pt-4 font-extrabold">
                <span>Total</span>
                <span>{pkr(order.total_amount)}</span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
