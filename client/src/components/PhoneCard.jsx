import { Link } from 'react-router-dom';
import ApprovalBadge from './ApprovalBadge';
import ConditionBadge from './ConditionBadge';
import StockBadge from './StockBadge';
import { pkr } from '../utils/api';

function brandAccent(brand) {
  if (brand === 'Apple') return 'from-zinc-100 to-zinc-300';
  if (brand === 'Samsung') return 'from-sky-100 to-blue-300';
  return 'from-emerald-100 to-slate-300';
}

export default function PhoneCard({ phone }) {
  const cheapest = [...(phone.variants || [])].sort((a, b) => a.price - b.price)[0] || {};
  const stock = (phone.variants || []).reduce((sum, item) => sum + Number(item.stock || 0), 0);
  const image = phone.images?.[0];

  return (
    <Link to={`/phone/${phone.id}`} className={`group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl ${stock <= 0 ? 'opacity-60' : ''}`}>
      <div className={`relative grid aspect-[5/4] place-items-center bg-gradient-to-br ${brandAccent(phone.brand)}`}>
        {image ? (
          <img src={image} alt={phone.name} className="h-full w-full object-cover" />
        ) : (
          <div className="phone-render scale-90" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink shadow-sm">{phone.brand}</span>
        {stock <= 0 && <div className="absolute inset-0 grid place-items-center bg-white/70 text-lg font-bold text-danger">Out of Stock</div>}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <ApprovalBadge approval={phone.approval} />
          <ConditionBadge condition={phone.condition} />
        </div>
        <h3 className="min-h-12 text-base font-bold leading-snug text-ink group-hover:text-slate-700">{phone.name}</h3>
        <div className="flex items-center justify-between gap-3">
          <span>
            <span className="block text-xs font-semibold text-muted">From</span>
            <span className="font-bold text-ink">{pkr(cheapest.price)}</span>
          </span>
          <span className="text-sm"><StockBadge stock={stock} /></span>
        </div>
      </div>
    </Link>
  );
}
