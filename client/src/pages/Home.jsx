import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Landmark, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import PhoneCard from '../components/PhoneCard';
import ApprovalBadge from '../components/ApprovalBadge';
import { api, pkr } from '../utils/api';

const trust = [
  ['PTA and FU only', ShieldCheck],
  ['Meezan transfer', Landmark],
  ['Star City pickup', MapPin],
  ['Curated stock', Sparkles]
];

export default function Home() {
  const [phones, setPhones] = useState([]);
  const [brand, setBrand] = useState('All');

  useEffect(() => {
    api.getInventory().then(setPhones).catch(() => setPhones([]));
  }, []);

  const heroPhone = useMemo(() => [...phones].sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0))[0], [phones]);
  const featured = useMemo(() => phones
    .filter((phone) => brand === 'All' || phone.brand === brand)
    .sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0))
    .slice(0, 8), [phones, brand]);

  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted">Karachi phone shop</p>
            <h1 className="mt-4 max-w-2xl font-display text-5xl font-bold leading-[0.95] text-ink md:text-7xl">
              PTA Approved and Factory Unlocked phones.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              A tighter catalog of iPhones, Samsung flagships, and Pixels you can reserve online and collect from Star City Mall.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">Shop available phones <ArrowRight size={18} /></Link>
              <a href="#featured" className="btn-secondary">View featured stock</a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_0.8fr]">
            <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Featured</span>
                {heroPhone && <ApprovalBadge approval={heroPhone.approval} />}
              </div>
              <div className="mt-6 grid place-items-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 py-8">
                <div className="phone-render" />
              </div>
              <h2 className="mt-5 text-2xl font-bold">{heroPhone?.name || 'Premium phones in stock'}</h2>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-slate-400">Ready for pickup</span>
                <span className="text-xl font-bold">{heroPhone ? pkr(heroPhone.variants?.[0]?.price) : 'PKR'}</span>
              </div>
            </div>
            <div className="grid gap-4">
              {trust.map(([label, Icon]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <Icon className="text-ink" size={22} />
                  <div className="mt-3 font-bold text-ink">{label}</div>
                  <div className="mt-1 text-sm text-muted">Clear before checkout.</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted">Current stock</p>
            <h2 className="mt-2 font-display text-4xl font-bold text-ink">Featured phones</h2>
          </div>
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {['All', 'Apple', 'Samsung', 'Google'].map((item) => (
              <button key={item} className={`rounded-lg px-4 py-2 text-sm font-bold ${brand === item ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`} onClick={() => setBrand(item)} type="button">{item}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((phone) => <PhoneCard key={phone.id} phone={phone} />)}
        </div>
      </section>
    </div>
  );
}
