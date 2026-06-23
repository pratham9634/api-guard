const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Core fetch wrapper — handles credentials, JSON, and error handling
 */
async function apiFetch(endpoint, options = {}) {
  const { body, method = 'GET', headers: customHeaders = {} } = options;

  const config = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorDetails = data?.errors ? ` - ${data.errors.join(', ')}` : '';
    const errorMessage = data?.message ? `${data.message}${errorDetails}` : `Request failed (${res.status})`;
    const error = new Error(errorMessage);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ─── Auth ───
export const login = (username, password) =>
  apiFetch('/api/auth/login', { method: 'POST', body: { username, password } });

export const logout = () =>
  apiFetch('/api/auth/logout');

export const onboardSuperAdmin = (data) =>
  apiFetch('/api/auth/onboard-super-admin', { method: 'POST', body: data });

export const registerUser = (data) =>
  apiFetch('/api/auth/register', { method: 'POST', body: data });

export const getProfile = () =>
  apiFetch('/api/auth/profile');

export const updateProfile = (data) =>
  apiFetch('/api/auth/profile', { method: 'PUT', body: data });

// ─── Clients ───
export const getClients = () =>
  apiFetch('/api/admin/clients');

export const getClientById = (clientId) =>
  apiFetch(`/api/admin/clients/${clientId}`);

export const createClient = (data) =>
  apiFetch('/api/admin/clients/onboard', { method: 'POST', body: data });

export const updateClient = (clientId, data) =>
  apiFetch(`/api/admin/clients/${clientId}`, { method: 'PUT', body: data });

export const deactivateClient = (clientId) =>
  apiFetch(`/api/admin/clients/${clientId}`, { method: 'DELETE' });

export const deleteClientHard = (clientId) =>
  apiFetch(`/api/admin/clients/${clientId}/hard`, { method: 'DELETE' });

// ─── Client Users ───
export const getClientUsers = (clientId) =>
  apiFetch(`/api/admin/clients/${clientId}/users`);

export const createClientUser = (clientId, data) =>
  apiFetch(`/api/admin/clients/${clientId}/users`, { method: 'POST', body: data });

// ─── API Keys ───
export const getClientApiKeys = (clientId) =>
  apiFetch(`/api/admin/clients/${clientId}/api/keys`);

export const createApiKey = (clientId, data) =>
  apiFetch(`/api/admin/clients/${clientId}/api/keys`, { method: 'POST', body: data });

export const revokeApiKey = (clientId, keyId) =>
  apiFetch(`/api/admin/clients/${clientId}/api/keys/${keyId}/revoke`, { method: 'PUT' });

export const rotateApiKey = (clientId, keyId) =>
  apiFetch(`/api/admin/clients/${clientId}/api/keys/${keyId}/rotate`, { method: 'PUT' });

export const deleteApiKey = (clientId, keyId) =>
  apiFetch(`/api/admin/clients/${clientId}/api/keys/${keyId}`, { method: 'DELETE' });

// ─── Users (admin) ───
export const getAllUsers = () =>
  apiFetch('/api/admin/users');

export const updateUserStatus = (userId, isActive) =>
  apiFetch(`/api/admin/users/${userId}/status`, { method: 'PUT', body: { isActive } });

export const updateUserRole = (userId, role) =>
  apiFetch(`/api/admin/users/${userId}/role`, { method: 'PUT', body: { role } });

export const deleteUserCompletely = (userId) =>
  apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });

// ─── Analytics ───
export const getDashboard = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startTime) query.set('startTime', params.startTime);
  if (params.endTime) query.set('endTime', params.endTime);
  if (params.clientId) query.set('clientId', params.clientId);
  const qs = query.toString();
  return apiFetch(`/api/analytics/dashboard${qs ? '?' + qs : ''}`);
};

export const getStats = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startTime) query.set('startTime', params.startTime);
  if (params.endTime) query.set('endTime', params.endTime);
  if (params.clientId) query.set('clientId', params.clientId);
  const qs = query.toString();
  return apiFetch(`/api/analytics/stats${qs ? '?' + qs : ''}`);
};

export const getReports = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startTime) query.set('startTime', params.startTime);
  if (params.endTime) query.set('endTime', params.endTime);
  if (params.clientId) query.set('clientId', params.clientId);
  const qs = query.toString();
  return apiFetch(`/api/analytics/reports${qs ? '?' + qs : ''}`);
};

// --- Public Endpoints ---
export const requestAccess = (data) =>
  apiFetch('/api/public/request-access', { method: 'POST', body: data });

// --- Admin Endpoints ---
export const getAccessRequests = () =>
  apiFetch('/api/admin/requests');

export const approveAccessRequest = (requestId) =>
  apiFetch(`/api/admin/requests/${requestId}/approve`, { method: 'POST' });

export const rejectAccessRequest = (requestId) =>
  apiFetch(`/api/admin/requests/${requestId}/reject`, { method: 'POST' });

export const deleteAccessRequest = (requestId) =>
  apiFetch(`/api/admin/requests/${requestId}`, { method: 'DELETE' });
