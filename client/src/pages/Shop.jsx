import { useEffect, useMemo, useState } from 'react';
import PhoneCard from '../components/PhoneCard';
import { api, pkr } from '../utils/api';

export default function Shop() {
  const [phones, setPhones] = useState([]);
  const [filters, setFilters] = useState({ brand: 'All', condition: 'All', approval: 'All', max: 500000, storage: 'All', sort: 'low' });

  useEffect(() => {
    api.getInventory().then(setPhones).catch(() => setPhones([]));
  }, []);

  const storages = useMemo(() => ['All', ...new Set(phones.flatMap((phone) => phone.variants?.map((v) => v.storage) || []))], [phones]);

  const filtered = useMemo(() => phones.filter((phone) => {
    const minPrice = Math.min(...(phone.variants || []).map((v) => v.price));
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
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-bold text-navy">Shop Phones</h1>
          <p className="mt-2 text-muted">{filtered.length} phones available for pickup.</p>
        </div>
        <select className="field w-auto" value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}>
          <option value="low">Price Low to High</option>
          <option value="high">Price High to Low</option>
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="panel h-fit space-y-4 p-5">
          <Filter label="Brand" value={filters.brand} onChange={(v) => setFilter('brand', v)} options={['All', 'Apple', 'Samsung', 'Google']} />
          <Filter label="Condition" value={filters.condition} onChange={(v) => setFilter('condition', v)} options={['All', 'new', 'refurbished', 'used']} />
          <Filter label="Approval" value={filters.approval} onChange={(v) => setFilter('approval', v)} options={['All', 'pta', 'jv', 'fu', 'non-pta', 'cpid', 'mdm', 'boxpack']} />
          <Filter label="Storage" value={filters.storage} onChange={(v) => setFilter('storage', v)} options={storages} />
          <div>
            <label className="label">Max Price: {pkr(filters.max)}</label>
            <input className="w-full accent-gold" type="range" min="0" max="500000" step="10000" value={filters.max} onChange={(e) => setFilter('max', e.target.value)} />
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
