import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import PhoneCard from '../components/PhoneCard';
import { api, pkr } from '../utils/api';

export default function Shop() {
  const [phones, setPhones] = useState([]);
  const [filters, setFilters] = useState({ brand: 'All', condition: 'All', approval: 'All', max: 500000, storage: 'All', sort: 'high' });

  useEffect(() => {
    api.getInventory().then(setPhones).catch(() => setPhones([]));
  }, []);

  const storages = useMemo(() => ['All', ...new Set(phones.flatMap((phone) => phone.variants?.map((v) => v.storage) || []))], [phones]);

  const filtered = useMemo(() => phones.filter((phone) => {
    const prices = (phone.variants || []).map((v) => v.price);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const hasStorage = filters.storage === 'All' || (phone.variants || []).some((v) => v.storage === filters.storage);
    return (filters.brand === 'All' || phone.brand === filters.brand)
      && (filters.condition === 'All' || phone.condition === filters.condition)
      && (filters.approval === 'All' || phone.approval === filters.approval)
      && minPrice <= Number(filters.max)
      && hasStorage;
  }).sort((a, b) => {
    const ap = Math.min(...(a.variants || []).map((v) => v.price));
    const bp = Math.min(...(b.variants || []).map((v) => v.price));
    return filters.sort === 'low' ? ap - bp : bp - ap;
  }), [phones, filters]);

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-2xl bg-ink p-6 text-white md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Shop verified stock</p>
            <h1 className="mt-2 font-display text-4xl font-bold md:text-6xl">PTA and Factory Unlocked only.</h1>
            <p className="mt-3 max-w-2xl text-slate-300">No JV, Non-PTA, CPID, or MDM devices appear in the customer shop.</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 text-right">
            <div className="text-3xl font-bold">{filtered.length}</div>
            <div className="text-sm text-slate-300">available phones</div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2 font-bold text-ink">
            <SlidersHorizontal size={18} /> Filters
          </div>
          <div className="space-y-4">
            <Filter label="Brand" value={filters.brand} onChange={(v) => setFilter('brand', v)} options={['All', 'Apple', 'Samsung', 'Google']} />
            <Filter label="Condition" value={filters.condition} onChange={(v) => setFilter('condition', v)} options={['All', 'new', 'refurbished', 'used']} />
            <Filter label="Approval" value={filters.approval} onChange={(v) => setFilter('approval', v)} options={['All', 'pta', 'fu']} />
            <Filter label="Storage" value={filters.storage} onChange={(v) => setFilter('storage', v)} options={storages} />
            <div>
              <label className="label">Max Price: {pkr(filters.max)}</label>
              <input className="w-full accent-ink" type="range" min="0" max="500000" step="10000" value={filters.max} onChange={(e) => setFilter('max', e.target.value)} />
            </div>
            <div>
              <label className="label">Sort</label>
              <select className="field" value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}>
                <option value="high">Price High to Low</option>
                <option value="low">Price Low to High</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((phone) => <PhoneCard key={phone.id} phone={phone} />)}
        </div>
      </div>
    </main>
  );
}

function Filter({ label, value, onChange, options }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}
