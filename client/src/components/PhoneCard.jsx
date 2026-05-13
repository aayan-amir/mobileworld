import { Link } from 'react-router-dom';
import ApprovalBadge from './ApprovalBadge';
import ConditionBadge from './ConditionBadge';
import StockBadge from './StockBadge';
import { pkr } from '../utils/api';

export default function PhoneCard({ phone }) {
  const cheapest = [...(phone.variants || [])].sort((a, b) => a.price - b.price)[0] || {};
  const stock = (phone.variants || []).reduce((sum, item) => sum + Number(item.stock || 0), 0);
  const image = phone.images?.[0];

  return (
    <Link to={`/phone/${phone.id}`} className={`panel group block overflow-hidden transition-shadow duration-200 hover:shadow-xl ${stock <= 0 ? 'opacity-60' : ''}`}>
      <div className="relative grid aspect-[4/3] place-items-center bg-gradient-to-br from-navy via-navy-light to-slate-800">
        {image ? (
          <img src={image} alt={phone.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-36 w-20 rounded-[1.7rem] border-4 border-slate-200 bg-slate-950 shadow-2xl">
            <div className="mx-auto mt-3 h-3 w-10 rounded-full bg-slate-700" />
          </div>
        )}
        {stock <= 0 && <div className="absolute inset-0 grid place-items-center bg-white/60 text-lg font-bold text-danger">Out of Stock</div>}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <ApprovalBadge approval={phone.approval} />
          <ConditionBadge condition={phone.condition} />
        </div>
        <h3 className="min-h-12 text-base font-bold text-navy group-hover:text-gold">{phone.name}</h3>
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-ink">{pkr(cheapest.price)}</span>
          <StockBadge stock={stock} />
        </div>
      </div>
    </Link>
  );
}
