import { useState, useEffect, useCallback } from 'react';
import { Plus, AlertCircle, Ban, Trash2, RotateCw, CheckCircle, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
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

  // Modals state
  const [alertError, setAlertError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [copied, setCopied] = useState(false);

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
      const res = await api.createApiKey(clientId, form);
      setShowCreate(false);
      setForm({ name: '', description: '', environment: 'production' });
      fetchKeys();
      if (res.data?.keyValue) {
        setNewlyCreatedKey(res.data.keyValue);
        setCopied(false);
      }
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = (keyId) => {
    setConfirmDialog({
      title: 'Revoke API Key',
      message: 'Revoke this API key? It will stop working immediately.',
      onConfirm: async () => {
        try { await api.revokeApiKey(clientId, keyId); fetchKeys(); }
        catch (err) { setAlertError(err.message); }
      }
    });
  };

  const handleRotate = (keyId) => {
    setConfirmDialog({
      title: 'Rotate API Key',
      message: 'Rotate this API key? The old key will stop working immediately and you will need to update your integrations.',
      onConfirm: async () => {
        try {
          const res = await api.rotateApiKey(clientId, keyId);
          fetchKeys();
          if (res.data?.keyValue) {
            setNewlyCreatedKey(res.data.keyValue);
            setCopied(false);
          }
        } catch (err) {
          setAlertError(err.message);
        }
      }
    });
  };

  const handleDelete = (keyId) => {
    setConfirmDialog({
      title: 'Delete API Key',
      message: 'Permanently delete this API key? This action cannot be undone.',
      onConfirm: async () => {
        try { await api.deleteApiKey(clientId, keyId); fetchKeys(); }
        catch (err) { setAlertError(err.message); }
      }
    });
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
            onClick={() => handleRotate(row.keyId)}
          >
            <RotateCw size={15} />
          </button>
          <button
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50 transition-colors duration-200 cursor-pointer focus:outline-none"
            title="Revoke"
            onClick={() => handleRevoke(row.keyId)}
          >
            <Ban size={15} />
          </button>
          <button
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-bg transition-colors duration-200 cursor-pointer focus:outline-none"
            title="Delete"
            onClick={() => handleDelete(row.keyId)}
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

      <AlertModal
        isOpen={!!alertError}
        onClose={() => setAlertError('')}
        message={alertError}
      />

      <ConfirmModal
        isOpen={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        onConfirm={confirmDialog?.onConfirm}
      />

      {/* Show newly created API key */}
      <Modal
        isOpen={!!newlyCreatedKey}
        onClose={() => setNewlyCreatedKey(null)}
        title="API Key Created"
        footer={
          <button
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-surface-elevated hover:bg-surface-card-hover border border-border text-text-primary transition-colors focus:outline-none cursor-pointer"
            onClick={() => setNewlyCreatedKey(null)}
          >
            Close
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-start">
            <div className="p-2 rounded-full bg-success/10 text-success shrink-0">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-sm text-text-primary font-semibold">Please copy your API key now.</p>
              <p className="text-sm text-text-secondary mt-1">For your security, it won't be shown again.</p>
            </div>
          </div>
          <div className="relative mt-2">
            <code className="block w-full p-4 bg-surface-input border border-border rounded-lg text-text-primary text-sm font-mono break-all pr-12">
              {newlyCreatedKey}
            </code>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-secondary hover:text-accent-primary transition-colors focus:outline-none bg-surface-input cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(newlyCreatedKey);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              title="Copy to clipboard"
            >
              {copied ? <CheckCircle size={16} className="text-success" /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
