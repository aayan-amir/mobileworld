import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { API_BASE } from '../utils/api';

export default function Login() {
  const [params] = useSearchParams();
  const error = params.get('error');

  return (
    <main className="mx-auto grid min-h-[68vh] max-w-5xl place-items-center px-4 py-10">
      <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-[1fr_0.9fr]">
        <section className="bg-gradient-to-br from-indigo-950 via-slate-950 to-cyan-900 p-8 text-white md:p-10">
          <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold">Mobile World Account</div>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-[-0.03em] md:text-5xl">Track orders and keep checkout details ready.</h1>
          <p className="mt-4 text-white/75">Sign in with Google to see your previous orders and save your customer profile.</p>
          <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white/10 p-4">
            <ShieldCheck size={24} />
            <span className="font-bold">Secure Google sign-in. No password to remember.</span>
          </div>
        </section>
        <section className="p-8 md:p-10">
          <img src="/mobile-world-logo-header.png" alt="Mobile World" className="h-20 w-auto object-contain" />
          <h2 className="mt-8 text-2xl font-extrabold text-ink">Customer login</h2>
          <p className="mt-2 text-muted">Use the same Gmail address when placing orders so your history stays together.</p>
          {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-danger">Google login failed. Please try again.</div>}
          <a href={`${API_BASE}/api/auth/google`} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3 font-extrabold text-ink shadow-sm hover:border-electric hover:text-electric">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-lg font-bold text-cobalt">G</span>
            Continue with Google
          </a>
          <Link to="/shop" className="mt-5 inline-block text-sm font-bold text-muted underline underline-offset-4">Back to shop</Link>
        </section>
      </div>
    </main>
  );
}
