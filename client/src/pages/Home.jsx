import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, MapPin, ShieldCheck, Star } from 'lucide-react';
import PhoneCard from '../components/PhoneCard';
import { api } from '../utils/api';

const badges = [
  ['PTA Verified Stock', ShieldCheck],
  ['Meezan Bank Secure', Landmark],
  ['Star City Mall Pickup', MapPin],
  ['7-Day Warranty', Star]
];

export default function Home() {
  const [phones, setPhones] = useState([]);
  const [brand, setBrand] = useState('All');

  useEffect(() => {
    api.getInventory().then(setPhones).catch(() => setPhones([]));
  }, []);

  const featured = useMemo(() => phones
    .filter((phone) => brand === 'All' || phone.brand === brand)
    .sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0))
    .slice(0, 8), [phones, brand]);

  return (
    <div>
      <section className="bg-navy text-white">
        <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Mobile World</p>
            <h1 className="mt-4 font-display text-5xl font-bold leading-tight md:text-7xl">Premium Phones. Verified Quality. Star City Mall, Karachi.</h1>
            <p className="mt-6 max-w-xl text-lg text-white/75">iPhones, Samsung flagships, and Google Pixels with clear approval labels, warranty details, and shop pickup after bank transfer verification.</p>
            <Link to="/shop" className="btn-primary mt-8">Shop Phones</Link>
          </div>
          <div className="relative grid min-h-[360px] place-items-center">
            <div className="absolute h-72 w-72 rounded-full border border-gold/30" />
            <div className="relative h-80 w-44 rounded-[2.4rem] border-8 border-slate-200 bg-slate-950 shadow-2xl">
              <div className="mx-auto mt-4 h-5 w-20 rounded-full bg-slate-800" />
              <div className="mx-5 mt-10 h-20 rounded-2xl bg-gold/90" />
              <div className="mx-5 mt-5 grid grid-cols-2 gap-3">
                <div className="h-16 rounded-xl bg-white/15" />
                <div className="h-16 rounded-xl bg-white/15" />
                <div className="h-16 rounded-xl bg-white/15" />
                <div className="h-16 rounded-xl bg-white/15" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-3 md:grid-cols-4">
          {badges.map(([label, Icon]) => (
            <div key={label} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <Icon className="text-gold" size={22} />
              <span className="font-bold text-navy">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-4xl font-bold text-navy">Featured Phones</h2>
          <div className="flex rounded-xl bg-white p-1 shadow-sm">
            {['All', 'Apple', 'Samsung', 'Google'].map((item) => (
              <button key={item} className={`rounded-lg px-4 py-2 text-sm font-bold ${brand === item ? 'bg-navy text-white' : 'text-navy'}`} onClick={() => setBrand(item)} type="button">{item}</button>
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
