import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Globe, Mail, Calendar, Plus, AlertCircle,
  KeyRound, Users, RotateCw, Trash2, Ban
} from 'lucide-react';
import * as api from '../api/client';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
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
      await api.createApiKey(id, keyForm);
      setShowCreateKey(false);
      setKeyForm({ name: '', description: '', environment: 'production' });
      fetchKeys();
    } catch (err) {
      setKeyError(err.message);
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (!confirm('Revoke this API key?')) return;
    try {
      await api.revokeApiKey(id, keyId);
      fetchKeys();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (!confirm('Permanently delete this API key?')) return;
    try {
      await api.deleteApiKey(id, keyId);
      fetchKeys();
    } catch (err) {
      alert(err.message);
    }
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
            title="Revoke"
            onClick={(e) => { e.stopPropagation(); handleRevokeKey(row._id); }}
          >
            <Ban size={15} />
          </button>
          <button
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-bg transition-colors duration-200 cursor-pointer focus:outline-none"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); handleDeleteKey(row._id); }}
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
          onClick={() => navigate('/clients')}
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
        onClick={() => navigate('/clients')}
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
    </div>
  );
}
