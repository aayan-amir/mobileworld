import StockBadge from './StockBadge';
import { pkr } from '../utils/api';

export default function VariantSelector({ variants, selected, onSelect }) {
  return (
    <div className="space-y-3">
      <label className="label">Variant</label>
      <div className="grid gap-3 sm:grid-cols-2">
        {(variants || []).map((variant) => (
          <button
            key={variant.variantId}
            type="button"
            onClick={() => onSelect(variant)}
            className={`rounded-xl border p-4 text-left transition ${selected?.variantId === variant.variantId ? 'border-gold bg-gold/10 ring-4 ring-gold/20' : 'border-slate-200 bg-white hover:border-gold'}`}
          >
            <div className="font-bold text-navy">{variant.storage} / {variant.color}</div>
            <div className="mt-1 text-sm text-muted">{variant.approval}</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="font-bold">{pkr(variant.price)}</span>
              <StockBadge stock={variant.stock} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
