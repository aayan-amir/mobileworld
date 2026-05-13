import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { pkr } from '../utils/api';

export default function Cart() {
  const cart = useCart();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-5xl font-bold text-ink">Cart</h1>
      {cart.items.length === 0 ? (
        <div className="panel mt-8 p-8">
          <p className="text-muted">Your cart is empty.</p>
          <Link className="btn-primary mt-4" to="/shop">Shop Phones</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="panel flex flex-wrap items-center gap-4 p-4">
                <div className="grid h-20 w-20 place-items-center rounded-xl bg-navy text-gold font-bold">MW</div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-ink">{item.name}</h2>
                  <p className="text-sm text-muted">{item.variant}</p>
                  <p className="mt-1 font-bold">{pkr(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg border p-2" onClick={() => cart.updateQty(item.productId, item.variantId, item.qty - 1)} type="button"><Minus size={16} /></button>
                  <span className="w-8 text-center font-bold">{item.qty}</span>
                  <button className="rounded-lg border p-2" onClick={() => cart.updateQty(item.productId, item.variantId, item.qty + 1)} type="button"><Plus size={16} /></button>
                </div>
                <div className="w-28 text-right font-bold">{pkr(item.price * item.qty)}</div>
                <button className="rounded-lg p-2 text-danger hover:bg-red-50" onClick={() => cart.removeItem(item.productId, item.variantId)} type="button"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
          <aside className="panel h-fit p-5">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{pkr(cart.total)}</span>
            </div>
            <Link className="btn-primary mt-5 w-full" to="/checkout">Proceed to Checkout</Link>
          </aside>
        </div>
      )}
    </main>
  );
}
