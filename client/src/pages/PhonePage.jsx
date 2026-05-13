import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, MapPin, ShoppingCart } from 'lucide-react';
import ApprovalBadge from '../components/ApprovalBadge';
import ConditionBadge from '../components/ConditionBadge';
import StockBadge from '../components/StockBadge';
import UsedPhoneWarning from '../components/UsedPhoneWarning';
import VariantSelector from '../components/VariantSelector';
import { useCart } from '../context/CartContext';
import { api, pkr } from '../utils/api';

export default function PhonePage() {
  const { id } = useParams();
  const [phone, setPhone] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const cart = useCart();

  useEffect(() => {
    api.getProduct(id).then((data) => {
      setPhone(data);
      setSelected(data.variants?.[0]);
    }).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <main className="mx-auto max-w-7xl px-4 py-10 text-danger">{error}</main>;
  if (!phone) return <main className="mx-auto max-w-7xl px-4 py-10">Loading...</main>;

  const specs = Object.entries(phone.specs || {}).filter(([, value]) => value);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid aspect-square place-items-center bg-gradient-to-br from-slate-100 to-slate-300">
            {phone.images?.[0] ? (
              <img src={phone.images[0]} alt={phone.name} className="h-full w-full object-cover" />
            ) : (
              <img src={phone.brand === 'Apple' ? 'https://images.pexels.com/photos/19281836/pexels-photo-19281836.jpeg?auto=compress&cs=tinysrgb&w=1200' : 'https://images.pexels.com/photos/28919439/pexels-photo-28919439.jpeg?auto=compress&cs=tinysrgb&w=1200'} alt={phone.name} className="h-full w-full object-cover" />
            )}
          </div>
        </div>
        <section className="space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <ApprovalBadge approval={phone.approval} />
              <ConditionBadge condition={phone.condition} />
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-ink md:text-6xl">{phone.name}</h1>
            <p className="mt-4 text-3xl font-bold text-ink">{pkr(selected?.price)}</p>
          </div>

          <UsedPhoneWarning condition={phone.condition} approval={phone.approval} />
          <VariantSelector variants={phone.variants} selected={selected} onSelect={setSelected} />

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-ink">Specs</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {specs.map(([key, value]) => (
                <div key={key} className="rounded-lg bg-slate-50 p-3">
                  <dt className="text-xs font-bold uppercase text-muted">{key}</dt>
                  <dd className="font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button className="btn-primary" disabled={!selected || selected.stock <= 0} onClick={() => cart.addItem(phone, selected)} type="button">
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <StockBadge stock={selected?.stock || 0} />
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-ink shadow-sm"><CheckCircle2 size={16} /> {phone.warranty}</span>
          </div>
          <p className="flex items-center gap-2 text-sm font-semibold text-muted"><MapPin size={16} /> Pickup from Star City Mall, Karachi. We will contact you to arrange collection.</p>
          <Link className="font-bold text-ink underline underline-offset-4" to="/shop">Back to shop</Link>
        </section>
      </div>
    </main>
  );
}
