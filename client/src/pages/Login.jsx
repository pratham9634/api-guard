/**
 * @file Login.jsx
 * @description Login page component for user authentication.
 * Captures user credentials, submits via AuthContext login callback, and routes to landing/dashboard.
 */

import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Login page view component.
 * 
 * @returns {React.ReactElement}
 */
export default function Login() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Skip showing login form while resolving credentials
  if (authLoading) return null;
  // If already authenticated, redirect immediately back to the app dashboard
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;

  /**
   * Updates state on text input change and resets any validation alerts.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  /**
   * Submits credentials for validation.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
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
          <p className="text-sm text-text-secondary mt-1.5">Sign in to your dashboard</p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 mb-6 text-sm rounded-lg border bg-danger/10 border-danger/20 text-danger animate-fade-in">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-semibold text-text-secondary" htmlFor="login-username">
              Username
            </label>
            <input
              id="login-username"
              className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-semibold text-text-secondary" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size={20} /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          First time here?{' '}
          <Link to="/onboard" className="text-accent-primary hover:text-accent-secondary font-medium transition-colors">
            Set up Super Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
