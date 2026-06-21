import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import { ROLES, ROLE_LABELS } from '../utils/constants';

export default function Users() {
  const { user, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create user modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'client_viewer' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      if (isSuperAdmin) {
        res = await api.getAllUsers();
      } else if (user?.clientId) {
        res = await api.getClientUsers(user.clientId);
      } else {
        setLoading(false);
        return;
      }
      if (res.success) {
        setUsers(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, user?.clientId]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await api.updateUserStatus(userId, !currentStatus);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setCreateError('All fields are required');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      await api.registerUser(form);
      setShowCreate(false);
      setForm({ username: '', email: '', password: '', role: 'client_viewer' });
      fetchUsers();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    { key: 'username', label: 'Username', render: (v) => <strong>{v}</strong> },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (val, row) => {
        if (!isSuperAdmin) return <StatusBadge label={ROLE_LABELS[val] || val} variant="accent" />;
        return (
          <select
            className="px-2 py-1 text-xs bg-surface-input border border-border rounded text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors max-w-[140px] cursor-pointer"
            value={val}
            onChange={(e) => handleRoleChange(row._id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="super_admin">Super Admin</option>
            <option value="client_admin">Client Admin</option>
            <option value="client_viewer">Client Viewer</option>
          </select>
        );
      },
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (val, row) => (
        <button
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap uppercase tracking-wide border-0 transition-colors select-none ${
            val
              ? 'bg-success-bg text-success hover:bg-success/20'
              : 'bg-danger-bg text-danger hover:bg-danger/20'
          } ${isSuperAdmin ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={(e) => { e.stopPropagation(); if (isSuperAdmin) handleStatusToggle(row._id, val); }}
          title={isSuperAdmin ? 'Click to toggle status' : undefined}
          disabled={!isSuperAdmin}
        >
          {val ? 'ACTIVE' : 'INACTIVE'}
        </button>
      ),
    },
    { key: 'createdAt', label: 'Created', render: (v) => formatDate(v) },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Users</h1>
          <p className="text-sm text-text-secondary mt-1">
            {isSuperAdmin ? 'Manage all users across clients' : 'View users in your organization'}
          </p>
        </div>
        {isSuperAdmin && (
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
            onClick={() => setShowCreate(true)}
          >
            <UserPlus size={18} /> Create User
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 mb-6 text-sm rounded-lg border bg-danger/10 border-danger/20 text-danger animate-fade-in">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyTitle="No users found"
        emptyDescription={isSuperAdmin ? 'Create the first user to get started' : 'No users in your organization'}
      />

      {/* Create User Modal (super_admin only) */}
      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setCreateError(''); }}
        title="Create User"
        footer={
          <>
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none bg-surface-elevated hover:bg-surface-card-hover border border-border text-text-primary hover:text-white"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? <LoadingSpinner size={18} /> : 'Create'}
            </button>
          </>
        }
      >
        {createError && (
          <div className="flex items-center gap-2.5 p-3.5 mb-4 text-sm rounded-lg border bg-danger/10 border-danger/20 text-danger animate-fade-in">
            <AlertCircle size={16} /> {createError}
          </div>
        )}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Username *</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Email *</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Password *</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Role</label>
          <select
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          >
            <option value="client_admin">Client Admin</option>
            <option value="client_viewer">Client Viewer</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
