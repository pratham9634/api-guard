import { useState, useEffect, useCallback } from 'react';
import { Plus, AlertCircle, Ban, Trash2, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, maskApiKey } from '../utils/formatters';
import { ENVIRONMENTS, ROLES } from '../utils/constants';

export default function ApiKeys() {
  const { user, isSuperAdmin } = useAuth();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // For super_admin: need to pick a client first
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', environment: 'production' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Fetch clients for super admin
  useEffect(() => {
    if (isSuperAdmin) {
      api.getClients().then(res => {
        if (res.success) {
          const list = Array.isArray(res.data) ? res.data : [res.data].filter(Boolean);
          setClients(list);
          if (list.length > 0 && !selectedClientId) {
            setSelectedClientId(list[0]._id);
          }
        }
      }).catch(() => {});
    }
  }, [isSuperAdmin]);

  const clientId = isSuperAdmin ? selectedClientId : user?.clientId;

  const fetchKeys = useCallback(async () => {
    if (!clientId) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await api.getClientApiKeys(clientId);
      if (res.success) setKeys(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setCreateError('Name is required'); return; }
    setCreating(true);
    setCreateError('');
    try {
      await api.createApiKey(clientId, form);
      setShowCreate(false);
      setForm({ name: '', description: '', environment: 'production' });
      fetchKeys();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyId) => {
    if (!confirm('Revoke this API key?')) return;
    try { await api.revokeApiKey(clientId, keyId); fetchKeys(); }
    catch (err) { alert(err.message); }
  };

  const handleRotate = async (keyId) => {
    if (!confirm('Rotate this API key? The old key will stop working.')) return;
    try { await api.rotateApiKey(clientId, keyId); fetchKeys(); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async (keyId) => {
    if (!confirm('Permanently delete this API key?')) return;
    try { await api.deleteApiKey(clientId, keyId); fetchKeys(); }
    catch (err) { alert(err.message); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (v) => <strong>{v}</strong> },
    { key: 'keyId', label: 'Key ID', render: (v) => <code className="text-text-secondary text-xs bg-surface-input px-1.5 py-0.5 rounded border border-border">{v}</code> },
    { key: 'environment', label: 'Env', render: (v) => <StatusBadge label={v} variant="info" /> },
    { key: 'isActive', label: 'Status', render: (v) => <StatusBadge status={v ? 'active' : 'revoked'} /> },
    { key: 'expiresAt', label: 'Expires', render: (v) => formatDate(v) },
    {
      key: '_id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1">
          <button
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50 transition-colors duration-200 cursor-pointer focus:outline-none"
            title="Rotate"
            onClick={() => handleRotate(row._id)}
          >
            <RotateCw size={15} />
          </button>
          <button
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50 transition-colors duration-200 cursor-pointer focus:outline-none"
            title="Revoke"
            onClick={() => handleRevoke(row._id)}
          >
            <Ban size={15} />
          </button>
          <button
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-bg transition-colors duration-200 cursor-pointer focus:outline-none"
            title="Delete"
            onClick={() => handleDelete(row._id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">API Keys</h1>
          <p className="text-sm text-text-secondary mt-1">Manage authentication keys for API access</p>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdmin && clients.length > 0 && (
            <select
              className="min-w-[200px] px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          )}
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
            onClick={() => setShowCreate(true)}
            disabled={!clientId}
          >
            <Plus size={18} /> Create Key
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 mb-6 text-sm rounded-lg border bg-danger/10 border-danger/20 text-danger animate-fade-in">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={keys}
        loading={loading}
        emptyTitle="No API keys"
        emptyDescription="Create your first API key to start ingesting data"
        emptyAction={
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
            onClick={() => setShowCreate(true)}
            disabled={!clientId}
          >
            <Plus size={18} /> Create Key
          </button>
        }
      />

      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setCreateError(''); }}
        title="Create API Key"
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
          <label className="text-sm font-semibold text-text-secondary">Key Name *</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            placeholder="Production API Key"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Description</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            placeholder="Purpose of this key"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Environment</label>
          <select
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            value={form.environment}
            onChange={e => setForm(f => ({ ...f, environment: e.target.value }))}
          >
            {ENVIRONMENTS.map(env => <option key={env} value={env}>{env}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  );
}
