import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Landmark, MapPin, ShieldCheck } from 'lucide-react';
import PhoneCard from '../components/PhoneCard';
import ApprovalBadge from '../components/ApprovalBadge';
import PackageBadge from '../components/PackageBadge';
import { api, pkr } from '../utils/api';

const heroImage = 'https://images.pexels.com/photos/11297769/pexels-photo-11297769.jpeg?auto=compress&cs=tinysrgb&w=1800';
const spotlightImage = 'https://images.pexels.com/photos/19281836/pexels-photo-19281836.jpeg?auto=compress&cs=tinysrgb&w=1000';

const trust = [
  ['PTA and FU only', ShieldCheck, 'No grey-market stock in the public shop.'],
  ['Meezan transfer', Landmark, 'Bank transfer first, then pickup.'],
  ['Star City pickup', MapPin, 'Collect from our Karachi shop.'],
  ['Checked stock', BadgeCheck, 'Owner-managed inventory and warranty.']
];

export default function Home() {
  const [phones, setPhones] = useState([]);
  const [brand, setBrand] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getInventory().then(setPhones).catch((err) => setError(err.message));
  }, []);

  const heroPhone = useMemo(() => [...phones].sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0))[0], [phones]);
  const featured = useMemo(() => phones
    .filter((phone) => brand === 'All' || phone.brand === brand)
    .sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0))
    .slice(0, 8), [phones, brand]);

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="relative min-h-[620px] overflow-hidden rounded-[2rem] bg-ink text-white shadow-2xl">
          <img src={heroImage} alt="Smartphones displayed in a retail store" className="absolute inset-0 h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-slate-950/60 to-cyan-900/20" />
          <div className="relative grid min-h-[620px] items-end gap-8 p-6 md:p-10 lg:grid-cols-[1fr_380px]">
            <div className="max-w-3xl pb-4">
              <div className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                Star City Mall, Karachi
              </div>
              <h1 className="text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] md:text-7xl">
                Premium phones people actually want to buy.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
                PTA Approved and Factory Unlocked iPhones, Samsung flagships, and Pixels with clear prices, stock, and pickup from our shop.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/shop" className="btn-primary">Shop phones <ArrowRight size={18} /></Link>
                <a href="#featured" className="btn-secondary border-white/30 bg-white/10 text-white hover:border-white hover:text-white">See featured</a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/95 p-4 text-ink shadow-2xl backdrop-blur">
              <img src={spotlightImage} alt="iPhones on display" className="h-56 w-full rounded-xl object-cover" />
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">Spotlight</p>
                  <h2 className="mt-1 line-clamp-2 text-xl font-extrabold">{heroPhone?.name || 'Fresh stock available'}</h2>
                </div>
                {heroPhone && <div className="flex flex-wrap justify-end gap-2"><PackageBadge type={heroPhone.packageType} /><ApprovalBadge approval={heroPhone.approval} /></div>}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-100 p-4">
                <span className="text-sm font-bold text-muted">Starting from</span>
                <span className="text-lg font-extrabold">{heroPhone ? pkr(heroPhone.variants?.[0]?.price) : 'PKR'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-4 md:grid-cols-4">
          {trust.map(([label, Icon, copy]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Icon className="text-electric" size={24} />
              <div className="mt-4 font-extrabold text-ink">{label}</div>
              <div className="mt-1 text-sm leading-6 text-muted">{copy}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-electric">Current stock</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-[-0.02em] text-ink">Featured phones</h2>
          </div>
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {['All', 'Apple', 'Samsung', 'Google'].map((item) => (
              <button key={item} className={`rounded-lg px-4 py-2 text-sm font-extrabold ${brand === item ? 'bg-electric text-white' : 'text-muted hover:text-ink'}`} onClick={() => setBrand(item)} type="button">{item}</button>
            ))}
          </div>
        </div>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 font-bold text-danger">{error}</div>}
        {!error && featured.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h3 className="text-2xl font-extrabold text-ink">Inventory is not showing yet.</h3>
            <p className="mt-2 text-muted">Once the production database is connected and seeded, featured phones will appear here.</p>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((phone) => <PhoneCard key={phone.id} phone={phone} />)}
        </div>
      </section>
    </div>
  );
}
