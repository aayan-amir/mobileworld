import { Link } from 'react-router-dom';
import ApprovalBadge from './ApprovalBadge';
import ConditionBadge from './ConditionBadge';
import StockBadge from './StockBadge';
import { pkr } from '../utils/api';

const fallbackImages = {
  Apple: 'https://images.pexels.com/photos/19281836/pexels-photo-19281836.jpeg?auto=compress&cs=tinysrgb&w=900',
  Samsung: 'https://images.pexels.com/photos/28919439/pexels-photo-28919439.jpeg?auto=compress&cs=tinysrgb&w=900',
  Google: 'https://images.pexels.com/photos/28919443/pexels-photo-28919443.jpeg?auto=compress&cs=tinysrgb&w=900'
};

function fallbackImage(phone) {
  return fallbackImages[phone.brand] || fallbackImages.Samsung;
}

export default function PhoneCard({ phone }) {
  const cheapest = [...(phone.variants || [])].sort((a, b) => a.price - b.price)[0] || {};
  const stock = (phone.variants || []).reduce((sum, item) => sum + Number(item.stock || 0), 0);
  const image = phone.images?.[0] || fallbackImage(phone);

  return (
    <Link to={`/phone/${phone.id}`} className={`group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-cobalt/30 hover:shadow-2xl ${stock <= 0 ? 'opacity-60' : ''}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img src={image} alt={phone.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-ink shadow-sm">{phone.brand}</span>
          <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">Pickup</span>
        </div>
        {stock <= 0 && <div className="absolute inset-0 grid place-items-center bg-white/70 text-lg font-bold text-danger">Out of Stock</div>}
      </div>
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          <ApprovalBadge approval={phone.approval} />
          <ConditionBadge condition={phone.condition} />
        </div>
        <h3 className="min-h-12 text-base font-extrabold leading-snug text-ink group-hover:text-cobalt">{phone.name}</h3>
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
