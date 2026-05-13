import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.adminLogin(form);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 py-10">
      <form className="panel w-full space-y-5 p-6" onSubmit={submit}>
        <h1 className="font-display text-4xl font-bold text-navy">Admin Login</h1>
        <div>
          <label className="label">Email</label>
          <input className="field" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="field" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-danger">{error}</div>}
        <button className="btn-primary w-full" disabled={loading} type="submit">{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
    </main>
  );
}
