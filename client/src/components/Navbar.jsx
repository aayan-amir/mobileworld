import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, MapPin, Menu, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';

export default function Navbar() {
  const cart = useCart();
  const navigate = useNavigate();

  async function logout() {
    try {
      await api.adminLogout();
      navigate('/admin/login');
    } catch {
      navigate('/admin/login');
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 text-ink shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-cobalt text-lg font-extrabold text-white shadow-lg shadow-blue-500/20">MW</span>
          <span>
            <span className="block text-2xl font-extrabold leading-none tracking-[-0.03em] text-ink">Mobile World</span>
            <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-muted sm:block">PTA and FU phones</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-2 text-sm font-semibold md:flex">
          <NavLink to="/shop" className={({ isActive }) => `rounded-lg px-4 py-2 ${isActive ? 'bg-cobalt text-white' : 'text-muted hover:bg-slate-50 hover:text-ink'}`}>Shop</NavLink>
          <NavLink to="/admin" className={({ isActive }) => `rounded-lg px-4 py-2 ${isActive ? 'bg-cobalt text-white' : 'text-muted hover:bg-slate-50 hover:text-ink'}`}>Admin</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative rounded-lg border border-slate-200 p-2 hover:border-ink" title="Cart">
            <ShoppingBag size={22} />
            {cart.count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-xs font-bold text-white">{cart.count}</span>}
          </Link>
          <button className="hidden rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-ink md:inline-flex" title="Logout" onClick={logout} type="button">
            <LogOut size={20} />
          </button>
          <Menu className="md:hidden" size={22} />
        </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-center text-xs font-semibold text-muted">
        <MapPin className="mr-1 inline" size={14} /> Star City Mall, Karachi - bank transfer and shop pickup
      </div>
    </header>
  );
}
