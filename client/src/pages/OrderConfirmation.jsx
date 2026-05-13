import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Copy } from 'lucide-react';
import PaymentInstructions from '../components/PaymentInstructions';
import { api, pkr } from '../utils/api';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.getOrder(id).then(setOrder).catch(() => setOrder(null));
  }, [id]);

  const total = order?.total_amount ?? location.state?.total;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="panel p-8">
        <h1 className="font-display text-5xl font-bold text-navy">Order Received</h1>
        <p className="mt-3 text-muted">Your order is pending payment verification.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-4">
          <span className="font-bold text-navy">Order ID: {id}</span>
          <button className="rounded-lg p-2 hover:bg-white" onClick={() => navigator.clipboard?.writeText(id)} title="Copy order ID" type="button"><Copy size={18} /></button>
          {total !== undefined && <span className="ml-auto font-bold text-navy">{pkr(total)}</span>}
        </div>
        <div className="mt-6">
          <PaymentInstructions amount={total} orderId={id} />
        </div>
        <ol className="mt-6 grid gap-3 md:grid-cols-3">
          {['We verify your payment', 'We confirm via email', 'We call you to arrange pickup'].map((step, index) => (
            <li key={step} className="rounded-xl bg-slate-50 p-4 font-bold text-navy">{index + 1}. {step}</li>
          ))}
        </ol>
        <Link className="btn-primary mt-8" to="/shop">Back to Shop</Link>
      </div>
    </main>
  );
}
