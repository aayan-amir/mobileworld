import StockBadge from './StockBadge';
import { pkr } from '../utils/api';

export default function VariantSelector({ variants, selected, onSelect }) {
  return (
    <div className="space-y-3">
      <label className="label">Choose variant</label>
      <div className="grid gap-3 sm:grid-cols-2">
        {(variants || []).map((variant) => (
          <button
            key={variant.variantId}
            type="button"
            onClick={() => onSelect(variant)}
            className={`rounded-xl border p-4 text-left transition ${selected?.variantId === variant.variantId ? 'border-ink bg-slate-50 ring-4 ring-ink/10' : 'border-slate-200 bg-white hover:border-ink'}`}
          >
            <div className="font-bold text-ink">{variant.storage} / {variant.color}</div>
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
