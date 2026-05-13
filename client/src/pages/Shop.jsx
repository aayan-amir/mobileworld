import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import PhoneCard from '../components/PhoneCard';
import { api, pkr } from '../utils/api';

const bannerImage = 'https://images.pexels.com/photos/28919443/pexels-photo-28919443.jpeg?auto=compress&cs=tinysrgb&w=1600';

export default function Shop() {
  const [phones, setPhones] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ brand: 'All', condition: 'All', approval: 'All', max: 500000, storage: 'All', sort: 'high', q: '' });

  useEffect(() => {
    api.getInventory().then(setPhones).catch((err) => setError(err.message));
  }, []);

  const storages = useMemo(() => ['All', ...new Set(phones.flatMap((phone) => phone.variants?.map((v) => v.storage) || []))], [phones]);

  const filtered = useMemo(() => phones.filter((phone) => {
    const prices = (phone.variants || []).map((v) => v.price);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const hasStorage = filters.storage === 'All' || (phone.variants || []).some((v) => v.storage === filters.storage);
    const query = filters.q.trim().toLowerCase();
    const matchesQuery = !query || `${phone.name} ${phone.brand}`.toLowerCase().includes(query);
    return (filters.brand === 'All' || phone.brand === filters.brand)
      && (filters.condition === 'All' || phone.condition === filters.condition)
      && (filters.approval === 'All' || phone.approval === filters.approval)
      && minPrice <= Number(filters.max)
      && hasStorage
      && matchesQuery;
  }).sort((a, b) => {
    const ap = Math.min(...(a.variants || []).map((v) => v.price));
    const bp = Math.min(...(b.variants || []).map((v) => v.price));
    return filters.sort === 'low' ? ap - bp : bp - ap;
  }), [phones, filters]);

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-ink text-white shadow-2xl">
        <img src={bannerImage} alt="Smartphone display in a tech store" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
        <div className="relative flex min-h-[360px] flex-col justify-end p-6 md:p-10">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-200">Verified catalog</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-extrabold leading-none tracking-[-0.03em] md:text-7xl">Shop phones ready for pickup.</h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">Only PTA Approved and Factory Unlocked devices are available to customers.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-lg font-extrabold text-ink">
            <SlidersHorizontal size={20} /> Refine stock
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input className="field pl-10" placeholder="iPhone 16, S25, Pixel..." value={filters.q} onChange={(e) => setFilter('q', e.target.value)} />
              </div>
            </div>
            <Filter label="Brand" value={filters.brand} onChange={(v) => setFilter('brand', v)} options={['All', 'Apple', 'Samsung', 'Google']} />
            <Filter label="Condition" value={filters.condition} onChange={(v) => setFilter('condition', v)} options={['All', 'new', 'refurbished', 'used']} />
            <Filter label="Approval" value={filters.approval} onChange={(v) => setFilter('approval', v)} options={['All', 'pta', 'fu']} />
            <Filter label="Storage" value={filters.storage} onChange={(v) => setFilter('storage', v)} options={storages} />
            <div>
              <label className="label">Max Price: {pkr(filters.max)}</label>
              <input className="w-full accent-cobalt" type="range" min="0" max="500000" step="10000" value={filters.max} onChange={(e) => setFilter('max', e.target.value)} />
            </div>
            <Filter label="Sort" value={filters.sort} onChange={(v) => setFilter('sort', v)} options={['high', 'low']} labels={{ high: 'Price High to Low', low: 'Price Low to High' }} />
          </div>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <div className="text-2xl font-extrabold text-ink">{filtered.length} phones</div>
              <div className="text-sm font-semibold text-muted">PTA/FU stock visible to customers</div>
            </div>
            <div className="rounded-full bg-cobalt/10 px-4 py-2 text-sm font-extrabold text-cobalt">Star City Mall pickup</div>
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 font-bold text-danger">{error}</div>}
          {!error && filtered.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-extrabold text-ink">No public stock is showing.</h2>
              <p className="mt-2 text-muted">If you just imported inventory, confirm Heroku is using the same `DATABASE_URL`, then redeploy/restart.</p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((phone) => <PhoneCard key={phone.id} phone={phone} />)}
          </div>
        </section>
      </div>
    </main>
  );
}

function Filter({ label, value, onChange, options, labels = {} }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option key={option} value={option}>{labels[option] || option}</option>)}
      </select>
    </div>
  );
}
