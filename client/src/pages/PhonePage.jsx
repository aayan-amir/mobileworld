import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
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
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel overflow-hidden">
          <div className="grid aspect-square place-items-center bg-gradient-to-br from-navy via-navy-light to-slate-800">
            {phone.images?.[0] ? (
              <img src={phone.images[0]} alt={phone.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-80 w-44 rounded-[2.4rem] border-8 border-slate-200 bg-slate-950 shadow-2xl" />
            )}
          </div>
        </div>
        <section className="space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <ApprovalBadge approval={phone.approval} />
              <ConditionBadge condition={phone.condition} />
            </div>
            <h1 className="font-display text-5xl font-bold text-navy">{phone.name}</h1>
            <p className="mt-3 text-lg font-bold text-ink">{pkr(selected?.price)}</p>
          </div>

          <UsedPhoneWarning condition={phone.condition} approval={phone.approval} />
          <VariantSelector variants={phone.variants} selected={selected} onSelect={setSelected} />

          <div className="panel p-5">
            <h2 className="mb-3 font-display text-2xl font-bold text-navy">Specs</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              {specs.map(([key, value]) => (
                <div key={key} className="rounded-lg bg-slate-50 p-3">
                  <dt className="text-xs font-bold uppercase text-muted">{key}</dt>
                  <dd className="font-semibold text-navy">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button className="btn-primary" disabled={!selected || selected.stock <= 0} onClick={() => cart.addItem(phone, selected)} type="button">
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <StockBadge stock={selected?.stock || 0} />
            <span className="rounded-full bg-white px-3 py-2 text-sm font-bold text-navy shadow-sm">{phone.warranty}</span>
          </div>
          <p className="text-sm font-semibold text-muted">Pickup from Star City Mall, Karachi. We will contact you to arrange collection.</p>
          <Link className="font-bold text-gold" to="/shop">Back to shop</Link>
        </section>
      </div>
    </main>
  );
}
