import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, AlertCircle } from 'lucide-react';
import * as api from '../api/client';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatters';

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', description: '', website: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getClients();
      if (res.success) {
        setClients(Array.isArray(res.data) ? res.data : [res.data].filter(Boolean));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim()) {
      setCreateError('Name and email are required');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      await api.createClient(createForm);
      setShowCreate(false);
      setCreateForm({ name: '', email: '', description: '', website: '' });
      fetchClients();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (val) => <strong>{val}</strong> },
    { key: 'slug', label: 'Slug', render: (val) => <code className="text-text-secondary text-xs bg-surface-input px-1.5 py-0.5 rounded border border-border">{val}</code> },
    { key: 'email', label: 'Email' },
    {
      key: 'isActive',
      label: 'Status',
      render: (val) => <StatusBadge status={val ? 'active' : 'inactive'} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (val) => formatDate(val),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Clients</h1>
          <p className="text-sm text-text-secondary mt-1">Manage client organizations</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
          onClick={() => setShowCreate(true)}
        >
          <Plus size={18} />
          Create Client
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 mb-6 text-sm rounded-lg border bg-danger/10 border-danger/20 text-danger animate-fade-in">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={clients}
        loading={loading}
        emptyTitle="No clients yet"
        emptyDescription="Create your first client organization to get started"
        emptyAction={
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={18} /> Create Client
          </button>
        }
        onRowClick={(row) => navigate(`/clients/${row._id}`)}
      />

      {/* Create Client Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setCreateError(''); }}
        title="Create Client"
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
          <label className="text-sm font-semibold text-text-secondary">Company Name *</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            placeholder="Acme Inc."
            value={createForm.name}
            onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Email *</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            type="email"
            placeholder="contact@acme.com"
            value={createForm.email}
            onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Description</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            placeholder="Brief description"
            value={createForm.description}
            onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Website</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            placeholder="https://acme.com"
            value={createForm.website}
            onChange={(e) => setCreateForm(f => ({ ...f, website: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
