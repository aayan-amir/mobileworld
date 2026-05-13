import { Copy } from 'lucide-react';
import { pkr } from '../utils/api';

const title = import.meta.env.VITE_OWNER_ACCOUNT_TITLE || 'Mobile World';
const number = import.meta.env.VITE_OWNER_ACCOUNT_NUMBER || '0123456789012345';

export default function PaymentInstructions({ amount, orderId }) {
  return (
    <div className="panel p-5">
      <h2 className="text-2xl font-bold text-ink">Meezan Bank Transfer</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted">Account Title</dt>
          <dd className="font-bold text-ink">{title}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted">Account Number</dt>
          <dd className="flex items-center gap-2 font-bold text-ink">
            {number}
            <button className="rounded p-1 hover:bg-slate-100" onClick={() => navigator.clipboard?.writeText(number)} title="Copy account number" type="button">
              <Copy size={16} />
            </button>
          </dd>
        </div>
        {amount !== undefined && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Exact Amount</dt>
            <dd className="font-bold text-ink">{pkr(amount)}</dd>
          </div>
        )}
        {orderId && (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Reference</dt>
            <dd className="font-bold text-ink">{orderId}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
