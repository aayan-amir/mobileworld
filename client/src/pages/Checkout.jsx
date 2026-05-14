import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PaymentInstructions from '../components/PaymentInstructions';
import { useCart } from '../context/CartContext';
import { api, pkr } from '../utils/api';

const phoneRegex = /^(03\d{2}[-\s]?\d{7}|\+923\d{9})$/;

export default function Checkout() {
  const cart = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.customerMe().then((me) => {
      setCustomer(me);
      setForm((current) => ({
        name: current.name || me.name || '',
        email: current.email || me.email || '',
        phone: current.phone || me.phone || ''
      }));
    }).catch(() => {});
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!phoneRegex.test(form.phone)) return setError('Enter a valid Pakistani phone number.');
    if (!file) return setError('Payment screenshot is required.');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      return setError('Screenshot must be jpg, png, or webp and 5MB or smaller.');
    }

    const body = new FormData();
    body.append('name', form.name);
    body.append('email', form.email);
    body.append('phone', form.phone);
    body.append('items', JSON.stringify(cart.items.map(({ productId, variantId, qty }) => ({ productId, variantId, qty }))));
    body.append('screenshot', file);

    setLoading(true);
    try {
      const result = await api.createOrder(body);
      cart.clearCart();
      navigate(`/order/${result.orderId}`, { state: { total: cart.total } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-5xl font-bold text-ink">Checkout</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <form className="panel space-y-5 p-6" onSubmit={submit}>
          {customer ? (
            <div className="rounded-xl bg-electric/10 p-4 text-sm font-bold text-electric">
              Signed in as {customer.email}. This order will be saved to your account.
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-muted">
              Want to track this order later? <Link className="font-extrabold text-electric underline" to="/login">Sign in with Google</Link>.
            </div>
          )}
          <div>
            <label className="label">Full Name</label>
            <input className="field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="field" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="field" required placeholder="03xx xxxxxxx or +923xxxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <PaymentInstructions amount={cart.total} />
          <div>
            <label className="label">Payment Screenshot</label>
            <input className="field" required type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0])} />
          </div>
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-danger">{error}</div>}
          <button className="btn-primary w-full" disabled={loading || cart.items.length === 0} type="submit">{loading ? 'Submitting...' : 'Submit Order'}</button>
        </form>
        <aside className="panel h-fit p-5">
          <h2 className="text-2xl font-bold text-ink">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {cart.items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="border-b border-slate-100 pb-3">
                <div className="font-bold text-ink">{item.name}</div>
                <div className="text-sm text-muted">{item.variant} x {item.qty}</div>
                <div className="font-bold">{pkr(item.price * item.qty)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{pkr(cart.total)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
