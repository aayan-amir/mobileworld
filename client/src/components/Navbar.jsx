import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, ShoppingBag, ShieldCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-navy text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-2xl font-bold text-gold">Mobile World</Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <NavLink to="/shop" className={({ isActive }) => isActive ? 'text-gold' : 'hover:text-gold'}>Shop</NavLink>
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'text-gold' : 'hover:text-gold'}>Admin</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative rounded-lg p-2 hover:bg-white/10" title="Cart">
            <ShoppingBag size={22} />
            {cart.count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-xs font-bold text-navy">{cart.count}</span>}
          </Link>
          <button className="hidden rounded-lg p-2 hover:bg-white/10 md:inline-flex" title="Logout" onClick={logout} type="button">
            <LogOut size={20} />
          </button>
          <Menu className="md:hidden" size={22} />
        </div>
      </div>
      <div className="border-t border-white/10 bg-navy-light px-4 py-2 text-center text-xs font-semibold text-gold">
        <ShieldCheck className="mr-1 inline" size={14} /> Star City Mall, Karachi
      </div>
    </header>
  );
}
