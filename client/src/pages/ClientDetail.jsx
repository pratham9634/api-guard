import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Globe, Mail, Calendar, Plus, AlertCircle,
  KeyRound, Users, RotateCw, Trash2, Ban, CheckCircle, Copy
} from 'lucide-react';
import * as api from '../api/client';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatDateTime, maskApiKey } from '../utils/formatters';
import { ENVIRONMENTS, ROLE_LABELS } from '../utils/constants';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // API Keys state
  const [keys, setKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(false);

  // Create user modal
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'client_viewer' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [userError, setUserError] = useState('');

  // Create key modal
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [keyForm, setKeyForm] = useState({ name: '', description: '', environment: 'production' });
  const [creatingKey, setCreatingKey] = useState(false);
  const [keyError, setKeyError] = useState('');

  // Modals state
  const [alertError, setAlertError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchClient = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getClientById(id);
      if (res.success) setClient(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await api.getClientUsers(id);
      if (res.success) setUsers(Array.isArray(res.data) ? res.data : []);
    } catch { setUsers([]); }
    finally { setUsersLoading(false); }
  }, [id]);

  const fetchKeys = useCallback(async () => {
    try {
      setKeysLoading(true);
      const res = await api.getClientApiKeys(id);
      if (res.success) setKeys(Array.isArray(res.data) ? res.data : []);
    } catch { setKeys([]); }
    finally { setKeysLoading(false); }
  }, [id]);

  useEffect(() => { fetchClient(); }, [fetchClient]);
  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else fetchKeys();
  }, [activeTab, fetchUsers, fetchKeys]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserError('');
    try {
      await api.createClientUser(id, userForm);
      setShowCreateUser(false);
      setUserForm({ username: '', email: '', password: '', role: 'client_viewer' });
      fetchUsers();
    } catch (err) {
      setUserError(err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    setCreatingKey(true);
    setKeyError('');
    try {
      const res = await api.createApiKey(id, keyForm);
      setShowCreateKey(false);
      setKeyForm({ name: '', description: '', environment: 'production' });
      fetchKeys();
      if (res.data?.keyValue) {
        setNewlyCreatedKey(res.data.keyValue);
        setCopied(false);
      }
    } catch (err) {
      setKeyError(err.message);
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = (keyId) => {
    setConfirmDialog({
      title: 'Revoke API Key',
      message: 'Are you sure you want to revoke this API key? It will stop working immediately.',
      onConfirm: async () => {
        try {
          await api.revokeApiKey(id, keyId);
          fetchKeys();
        } catch (err) {
          setAlertError(err.message);
        }
      }
    });
  };

  const handleDeleteKey = (keyId) => {
    setConfirmDialog({
      title: 'Delete API Key',
      message: 'Permanently delete this API key? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.deleteApiKey(id, keyId);
          fetchKeys();
        } catch (err) {
          setAlertError(err.message);
        }
      }
    });
  };

  const handleRotateKey = (keyId) => {
    setConfirmDialog({
      title: 'Rotate API Key',
      message: 'Rotate this API key? The old key will stop working immediately and you will need to update your integrations.',
      onConfirm: async () => {
        try {
          const res = await api.rotateApiKey(id, keyId);
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

  const userColumns = [
    { key: 'username', label: 'Username', render: (v) => <strong>{v}</strong> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (v) => <StatusBadge label={ROLE_LABELS[v] || v} variant="accent" /> },
    { key: 'isActive', label: 'Status', render: (v) => <StatusBadge status={v ? 'active' : 'inactive'} /> },
    { key: 'createdAt', label: 'Created', render: (v) => formatDate(v) },
  ];

  const keyColumns = [
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
            onClick={(e) => { e.stopPropagation(); handleRotateKey(row.keyId); }}
          >
            <RotateCw size={15} />
          </button>
          <button
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50 transition-colors duration-200 cursor-pointer focus:outline-none"
            title="Revoke"
            onClick={(e) => { e.stopPropagation(); handleRevokeKey(row.keyId); }}
          >
            <Ban size={15} />
          </button>
          <button
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-bg transition-colors duration-200 cursor-pointer focus:outline-none"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); handleDeleteKey(row.keyId); }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">Client not found</h3>
        <button
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
          onClick={() => navigate('/app/clients')}
        >
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <button
        className="inline-flex items-center justify-center gap-2 px-3 py-1.5 mb-4 text-sm font-semibold rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50 transition-colors duration-200 cursor-pointer focus:outline-none"
        onClick={() => navigate('/app/clients')}
      >
        <ArrowLeft size={18} /> Back to Clients
      </button>

      <div className="mb-8 bg-surface-secondary border border-border p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">{client.name}</h1>
            <StatusBadge status={client.isActive ? 'active' : 'inactive'} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mt-3">
            {client.email && <span className="flex items-center gap-1"><Mail size={14} /> {client.email}</span>}
            {client.website && <span className="flex items-center gap-1"><Globe size={14} /> {client.website}</span>}
            <span className="flex items-center gap-1"><Calendar size={14} /> Created {formatDate(client.createdAt)}</span>
          </div>
          {client.description && (
            <p className="text-text-secondary mt-3 text-sm max-w-2xl leading-relaxed">
              {client.description}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6 gap-2">
        <button
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all duration-150 cursor-pointer focus:outline-none -mb-[2px] ${
            activeTab === 'users'
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          Users
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all duration-150 cursor-pointer focus:outline-none -mb-[2px] ${
            activeTab === 'keys'
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
          }`}
          onClick={() => setActiveTab('keys')}
        >
          <KeyRound size={16} />
          API Keys
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'users' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
              onClick={() => setShowCreateUser(true)}
            >
              <Plus size={16} /> Add User
            </button>
          </div>
          <DataTable columns={userColumns} data={users} loading={usersLoading} emptyTitle="No users" emptyDescription="Add users to this client" />
        </>
      )}

      {activeTab === 'keys' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
              onClick={() => setShowCreateKey(true)}
            >
              <Plus size={16} /> Create API Key
            </button>
          </div>
          <DataTable columns={keyColumns} data={keys} loading={keysLoading} emptyTitle="No API keys" emptyDescription="Create an API key for this client" />
        </>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateUser}
        onClose={() => { setShowCreateUser(false); setUserError(''); }}
        title="Add User"
        footer={
          <>
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none bg-surface-elevated hover:bg-surface-card-hover border border-border text-text-primary hover:text-white"
              onClick={() => setShowCreateUser(false)}
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
              onClick={handleCreateUser}
              disabled={creatingUser}
            >
              {creatingUser ? <LoadingSpinner size={18} /> : 'Create'}
            </button>
          </>
        }
      >
        {userError && (
          <div className="flex items-center gap-2.5 p-3.5 mb-4 text-sm rounded-lg border bg-danger/10 border-danger/20 text-danger animate-fade-in">
            <AlertCircle size={16} /> {userError}
          </div>
        )}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Username *</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            value={userForm.username}
            onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Email *</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            type="email"
            value={userForm.email}
            onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Password *</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            type="password"
            value={userForm.password}
            onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Role</label>
          <select
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            value={userForm.role}
            onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
          >
            <option value="client_admin">Client Admin</option>
            <option value="client_viewer">Client Viewer</option>
          </select>
        </div>
      </Modal>

      {/* Create Key Modal */}
      <Modal
        isOpen={showCreateKey}
        onClose={() => { setShowCreateKey(false); setKeyError(''); }}
        title="Create API Key"
        footer={
          <>
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none bg-surface-elevated hover:bg-surface-card-hover border border-border text-text-primary hover:text-white"
              onClick={() => setShowCreateKey(false)}
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none accent-gradient hover:accent-gradient-hover text-white accent-glow"
              onClick={handleCreateKey}
              disabled={creatingKey}
            >
              {creatingKey ? <LoadingSpinner size={18} /> : 'Create'}
            </button>
          </>
        }
      >
        {keyError && (
          <div className="flex items-center gap-2.5 p-3.5 mb-4 text-sm rounded-lg border bg-danger/10 border-danger/20 text-danger animate-fade-in">
            <AlertCircle size={16} /> {keyError}
          </div>
        )}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Key Name *</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            placeholder="Production API Key"
            value={keyForm.name}
            onChange={e => setKeyForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Description</label>
          <input
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            placeholder="Used for..."
            value={keyForm.description}
            onChange={e => setKeyForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-sm font-semibold text-text-secondary">Environment</label>
          <select
            className="w-full px-3.5 py-2 text-sm bg-surface-input border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 transition-colors duration-150"
            value={keyForm.environment}
            onChange={e => setKeyForm(f => ({ ...f, environment: e.target.value }))}
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
