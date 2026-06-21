import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import { AlertCircle, Check, Edit3, X } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { ROLE_LABELS } from '../utils/constants';
import { getInitials, formatDate } from '../utils/formatters';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getProfile();
        if (res.success) {
          setProfile(res.data);
          setForm({ username: res.data.username || '', email: res.data.email || '' });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.updateProfile(form);
      if (res.success) {
        setProfile(res.data);
        setEditing(false);
        setSuccess('Profile updated successfully');
        refreshProfile();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({ username: profile?.username || '', email: profile?.email || '' });
    setError('');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
        <LoadingSpinner size={48} />
      </div>
    );
  }

  const permissions = profile?.permissions || {};

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Profile</h1>
          <p className="text-sm text-text-secondary mt-1">View and manage your account</p>
        </div>
        {!editing && (
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none bg-surface-elevated hover:bg-surface-card-hover border border-border text-text-primary hover:text-white"
            onClick={() => setEditing(true)}
          >
            <Edit3 size={16} /> Edit
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 mb-4 text-sm rounded-lg border bg-danger/10 border-danger/20 text-danger animate-fade-in">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 p-3.5 mb-4 text-sm rounded-lg border bg-success/10 border-success/20 text-success animate-fade-in">
          <Check size={16} /> {success}
        </div>
      )}

      <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-border">
          <div className="w-20 h-20 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20 flex items-center justify-center text-3xl font-extrabold select-none">
            {getInitials(profile?.username)}
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-xl font-bold text-text-primary">{profile?.username}</h2>
            <p className="text-sm text-text-secondary mt-1">{profile?.email}</p>
            <div className="flex gap-2 mt-3">
              <StatusBadge label={ROLE_LABELS[profile?.role] || profile?.role} variant="accent" />
              <StatusBadge status={profile?.isActive ? 'active' : 'inactive'} />
            </div>
          </div>
        </div>

        {editing ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm font-semibold text-text-secondary">Username</label>
              <input
                className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm font-semibold text-text-secondary">Email</label>
              <input
                className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <LoadingSpinner size={18} /> : <><Check size={16} /> Save</>}
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none bg-surface-elevated hover:bg-surface-card-hover border border-border text-text-primary hover:text-white"
                onClick={handleCancel}
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="border-t border-border pt-6 mt-4">
              <h3 className="text-base font-semibold mb-3">Account Details</h3>
              <div className="grid grid-cols-[140px_1fr] gap-3 text-sm">
                <span className="text-text-secondary">Username</span>
                <span className="text-text-primary font-medium">{profile?.username}</span>
                <span className="text-text-secondary">Email</span>
                <span className="text-text-primary font-medium">{profile?.email}</span>
                <span className="text-text-secondary">Role</span>
                <span className="text-text-primary font-medium">{ROLE_LABELS[profile?.role] || profile?.role}</span>
                <span className="text-text-secondary">Member Since</span>
                <span className="text-text-primary font-medium">{formatDate(profile?.createdAt)}</span>
              </div>
            </div>

            <div className="border-t border-border pt-6 mt-6">
              <h3 className="text-base font-semibold mb-4">Permissions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm text-text-primary bg-surface-secondary/50 border border-border p-3 rounded-xl">
                  <StatusBadge
                    status={permissions.canCreateApiKeys ? 'active' : 'inactive'}
                    label={permissions.canCreateApiKeys ? '✓' : '✗'}
                  />
                  <span>Create API Keys</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-primary bg-surface-secondary/50 border border-border p-3 rounded-xl">
                  <StatusBadge
                    status={permissions.canManageUsers ? 'active' : 'inactive'}
                    label={permissions.canManageUsers ? '✓' : '✗'}
                  />
                  <span>Manage Users</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-primary bg-surface-secondary/50 border border-border p-3 rounded-xl">
                  <StatusBadge
                    status={permissions.canViewAnalytics ? 'active' : 'inactive'}
                    label={permissions.canViewAnalytics ? '✓' : '✗'}
                  />
                  <span>View Analytics</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-primary bg-surface-secondary/50 border border-border p-3 rounded-xl">
                  <StatusBadge
                    status={permissions.canExportData ? 'active' : 'inactive'}
                    label={permissions.canExportData ? '✓' : '✗'}
                  />
                  <span>Export Data</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
