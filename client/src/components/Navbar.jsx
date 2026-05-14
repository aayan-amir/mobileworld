import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, MapPin, Package, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';

export default function Navbar() {
  const cart = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

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
          <img src="/mobile-world-logo-header.png" alt="Mobile World Phones and Accessories" className="h-14 w-auto max-w-[190px] object-contain sm:max-w-[230px]" />
        </Link>
        <nav className="hidden items-center gap-2 text-sm font-semibold md:flex">
          {isAdmin ? (
            <>
              <NavLink to="/admin" end className={({ isActive }) => `inline-flex items-center gap-2 rounded-lg px-4 py-2 ${isActive ? 'bg-electric text-white' : 'text-muted hover:bg-slate-50 hover:text-ink'}`}><LayoutDashboard size={16} /> Dashboard</NavLink>
              <NavLink to="/admin/orders" className={({ isActive }) => `rounded-lg px-4 py-2 ${isActive ? 'bg-electric text-white' : 'text-muted hover:bg-slate-50 hover:text-ink'}`}>Orders</NavLink>
              <NavLink to="/admin/inventory" className={({ isActive }) => `inline-flex items-center gap-2 rounded-lg px-4 py-2 ${isActive ? 'bg-electric text-white' : 'text-muted hover:bg-slate-50 hover:text-ink'}`}><Package size={16} /> Inventory</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end className={({ isActive }) => `rounded-lg px-4 py-2 ${isActive ? 'bg-electric text-white' : 'text-muted hover:bg-slate-50 hover:text-ink'}`}>Home</NavLink>
              <NavLink to="/shop" className={({ isActive }) => `rounded-lg px-4 py-2 ${isActive ? 'bg-electric text-white' : 'text-muted hover:bg-slate-50 hover:text-ink'}`}>Shop</NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <NavLink to="/admin/orders" className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-bold md:hidden ${isActive ? 'bg-electric text-white' : 'border border-slate-200 text-muted'}`}>Orders</NavLink>
              <button className="inline-flex rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-muted hover:border-ink hover:text-ink" title="Logout" onClick={logout} type="button">
                <LogOut size={18} /><span className="hidden md:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/shop" className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-bold md:hidden ${isActive ? 'bg-electric text-white' : 'border border-slate-200 text-muted'}`}>Shop</NavLink>
              <Link to="/cart" className="relative rounded-lg border border-slate-200 p-2 hover:border-ink" title="Cart">
                <ShoppingBag size={22} />
                {cart.count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-xs font-bold text-white">{cart.count}</span>}
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-center text-xs font-semibold text-muted">
        <MapPin className="mr-1 inline" size={14} /> Star City Mall, Karachi - bank transfer and shop pickup
      </div>
    </header>
  );
}
