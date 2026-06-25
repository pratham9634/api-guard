/**
 * @file client.js
 * @description Centralized client-side API utility client module.
 * Exposes fetch wrappers and structured paths connecting React components with microservice gateways.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Core fetch wrapper that attaches credentials, configures request headers,
 * formats payloads to JSON, and interprets server response statuses.
 * 
 * @param {string} endpoint - Path segment to fetch.
 * @param {Object} [options={}] - HTTP options (method, headers, body).
 * @returns {Promise<any>} Response JSON data.
 * @throws {Error} Detailed message enclosing HTTP error status and array mappings.
 */
async function apiFetch(endpoint, options = {}) {
  const { body, method = 'GET', headers: customHeaders = {} } = options;

  const config = {
    method,
    credentials: 'include', // Ensures session cookie headers are transmitted cross-origin
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

// ─── Authentication Endpoints ───

/**
 * Sends user login credentials.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>}
 */
export const login = (username, password) =>
  apiFetch('/api/auth/login', { method: 'POST', body: { username, password } });

/**
 * Revokes client authentication session.
 * @returns {Promise<Object>}
 */
export const logout = () =>
  apiFetch('/api/auth/logout');

/**
 * Instantiates the platform super admin account details.
 * @param {Object} data - Admin details.
 * @returns {Promise<Object>}
 */
export const onboardSuperAdmin = (data) =>
  apiFetch('/api/auth/onboard-super-admin', { method: 'POST', body: data });

/**
 * Registers user details.
 * @param {Object} data - Account credentials.
 * @returns {Promise<Object>}
 */
export const registerUser = (data) =>
  apiFetch('/api/auth/register', { method: 'POST', body: data });

/**
 * Fetches profile details of active session user.
 * @returns {Promise<Object>}
 */
export const getProfile = () =>
  apiFetch('/api/auth/profile');

/**
 * Updates profile details of active session user.
 * @param {Object} data - Settings changes.
 * @returns {Promise<Object>}
 */
export const updateProfile = (data) =>
  apiFetch('/api/auth/profile', { method: 'PUT', body: data });

// ─── Clients Management (Super Admin) ───

/**
 * Lists all active client organizations.
 * @returns {Promise<Object>}
 */
export const getClients = () =>
  apiFetch('/api/admin/clients');

/**
 * Gets specific client organization profile details by ID.
 * @param {string} clientId
 * @returns {Promise<Object>}
 */
export const getClientById = (clientId) =>
  apiFetch(`/api/admin/clients/${clientId}`);

/**
 * Registers/onboards a new client organization.
 * @param {Object} data - Company details.
 * @returns {Promise<Object>}
 */
export const createClient = (data) =>
  apiFetch('/api/admin/clients/onboard', { method: 'POST', body: data });

/**
 * Updates configuration settings of a client organization.
 * @param {string} clientId
 * @param {Object} data - Configurations.
 * @returns {Promise<Object>}
 */
export const updateClient = (clientId, data) =>
  apiFetch(`/api/admin/clients/${clientId}`, { method: 'PUT', body: data });

/**
 * Deactivates a client organization (soft delete).
 * @param {string} clientId
 * @returns {Promise<Object>}
 */
export const deactivateClient = (clientId) =>
  apiFetch(`/api/admin/clients/${clientId}`, { method: 'DELETE' });

/**
 * Purges client data and cascading entities completely (hard delete).
 * @param {string} clientId
 * @returns {Promise<Object>}
 */
export const deleteClientHard = (clientId) =>
  apiFetch(`/api/admin/clients/${clientId}/hard`, { method: 'DELETE' });

// ─── Client Users ───

/**
 * Gets organization-scoped user list.
 * @param {string} clientId
 * @returns {Promise<Object>}
 */
export const getClientUsers = (clientId) =>
  apiFetch(`/api/admin/clients/${clientId}/users`);

/**
 * Invites / creates a user account tied to a client organization.
 * @param {string} clientId
 * @param {Object} data - Account information.
 * @returns {Promise<Object>}
 */
export const createClientUser = (clientId, data) =>
  apiFetch(`/api/admin/clients/${clientId}/users`, { method: 'POST', body: data });

// ─── API Keys Management ───

/**
 * Lists client keys.
 * @param {string} clientId
 * @returns {Promise<Object>}
 */
export const getClientApiKeys = (clientId) =>
  apiFetch(`/api/admin/clients/${clientId}/api/keys`);

/**
 * Generates a new API key configuration.
 * @param {string} clientId
 * @param {Object} data - API key metadata permissions.
 * @returns {Promise<Object>}
 */
export const createApiKey = (clientId, data) =>
  apiFetch(`/api/admin/clients/${clientId}/api/keys`, { method: 'POST', body: data });

/**
 * Disables a client API key.
 * @param {string} clientId
 * @param {string} keyId
 * @returns {Promise<Object>}
 */
export const revokeApiKey = (clientId, keyId) =>
  apiFetch(`/api/admin/clients/${clientId}/api/keys/${keyId}/revoke`, { method: 'PUT' });

/**
 * Generates a new random value matching the configuration schema of a key.
 * @param {string} clientId
 * @param {string} keyId
 * @returns {Promise<Object>}
 */
export const rotateApiKey = (clientId, keyId) =>
  apiFetch(`/api/admin/clients/${clientId}/api/keys/${keyId}/rotate`, { method: 'PUT' });

/**
 * Deletes a client API key record from storage.
 * @param {string} clientId
 * @param {string} keyId
 * @returns {Promise<Object>}
 */
export const deleteApiKey = (clientId, keyId) =>
  apiFetch(`/api/admin/clients/${clientId}/api/keys/${keyId}`, { method: 'DELETE' });

// ─── Global Users Management (Super Admin) ───

/**
 * Lists all platform system users.
 * @returns {Promise<Object>}
 */
export const getAllUsers = () =>
  apiFetch('/api/admin/users');

/**
 * Toggles a platform user's active login state.
 * @param {string} userId
 * @param {boolean} isActive
 * @returns {Promise<Object>}
 */
export const updateUserStatus = (userId, isActive) =>
  apiFetch(`/api/admin/users/${userId}/status`, { method: 'PUT', body: { isActive } });

/**
 * Modifies client permission roles.
 * @param {string} userId
 * @param {string} role - Enum role string.
 * @returns {Promise<Object>}
 */
export const updateUserRole = (userId, role) =>
  apiFetch(`/api/admin/users/${userId}/role`, { method: 'PUT', body: { role } });

/**
 * Deletes user profile records from the database.
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export const deleteUserCompletely = (userId) =>
  apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });

// ─── Metrics and Analytics Endpoints ───

/**
 * Fetches dashboard widgets counters data.
 * @param {Object} [params] - Query filters (startTime, endTime, clientId).
 * @returns {Promise<Object>}
 */
export const getDashboard = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startTime) query.set('startTime', params.startTime);
  if (params.endTime) query.set('endTime', params.endTime);
  if (params.clientId) query.set('clientId', params.clientId);
  const qs = query.toString();
  return apiFetch(`/api/analytics/dashboard${qs ? '?' + qs : ''}`);
};

/**
 * Fetches detailed time-series stats graphs.
 * @param {Object} [params] - Query filters (startTime, endTime, clientId).
 * @returns {Promise<Object>}
 */
export const getStats = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startTime) query.set('startTime', params.startTime);
  if (params.endTime) query.set('endTime', params.endTime);
  if (params.clientId) query.set('clientId', params.clientId);
  const qs = query.toString();
  return apiFetch(`/api/analytics/stats${qs ? '?' + qs : ''}`);
};

/**
 * Generates CSV / PDF reports.
 * @param {Object} [params] - Query filters (startTime, endTime, clientId).
 * @returns {Promise<Object>}
 */
export const getReports = (params = {}) => {
  const query = new URLSearchParams();
  if (params.startTime) query.set('startTime', params.startTime);
  if (params.endTime) query.set('endTime', params.endTime);
  if (params.clientId) query.set('clientId', params.clientId);
  const qs = query.toString();
  return apiFetch(`/api/analytics/reports${qs ? '?' + qs : ''}`);
};

// ─── Onboarding Public Requests ───

/**
 * Submits onboarding request parameters.
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const requestAccess = (data) =>
  apiFetch('/api/public/request-access', { method: 'POST', body: data });

// ─── Onboarding Approval Requests (Super Admin) ───

/**
 * Lists all pending access requests.
 * @returns {Promise<Object>}
 */
export const getAccessRequests = () =>
  apiFetch('/api/admin/requests');

/**
 * Approves a request and dispatches automated admin login credentials.
 * @param {string} requestId
 * @returns {Promise<Object>}
 */
export const approveAccessRequest = (requestId) =>
  apiFetch(`/api/admin/requests/${requestId}/approve`, { method: 'POST' });

/**
 * Rejects onboarding request.
 * @param {string} requestId
 * @returns {Promise<Object>}
 */
export const rejectAccessRequest = (requestId) =>
  apiFetch(`/api/admin/requests/${requestId}/reject`, { method: 'POST' });

/**
 * Deletes request files completely.
 * @param {string} requestId
 * @returns {Promise<Object>}
 */
export const deleteAccessRequest = (requestId) =>
  apiFetch(`/api/admin/requests/${requestId}`, { method: 'DELETE' });
