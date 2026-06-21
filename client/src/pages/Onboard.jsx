import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle, AlertTriangle } from 'lucide-react';
import * as api from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Onboard() {
  const { isAuthenticated, isLoading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) return null;
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.onboardSuperAdmin(form);
      await refreshProfile();
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create super admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-primary p-4 relative overflow-hidden">
      <div className="glass-card w-full max-w-[440px] p-8 rounded-2xl relative z-10 shadow-2xl animate-fade-in">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center mb-4">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">API Guard</h1>
          <p className="text-sm text-text-secondary mt-1.5">First-time setup</p>
        </div>

        <div className="flex items-center gap-2.5 p-3.5 mb-4 text-sm rounded-lg border bg-warning/10 border-warning/20 text-warning">
          <AlertTriangle size={16} />
          This will create the initial Super Admin account
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 mb-6 text-sm rounded-lg border bg-danger/10 border-danger/20 text-danger animate-fade-in">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-semibold text-text-secondary" htmlFor="onboard-username">
              Username
            </label>
            <input
              id="onboard-username"
              className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-semibold text-text-secondary" htmlFor="onboard-email">
              Email
            </label>
            <input
              id="onboard-email"
              className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
              type="email"
              name="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-semibold text-text-secondary" htmlFor="onboard-password">
              Password
            </label>
            <input
              id="onboard-password"
              className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
              type="password"
              name="password"
              placeholder="Choose a strong password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size={20} /> : 'Create Super Admin'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-primary hover:text-accent-secondary font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
