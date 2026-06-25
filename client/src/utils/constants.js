/**
 * @file constants.js
 * @description Central constant definitions for the client application.
 * Defines roles, labels, environment settings, and time boundaries.
 */

/**
 * Access control roles enum definitions.
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  CLIENT_ADMIN: 'client_admin',
  CLIENT_VIEWER: 'client_viewer',
};

/**
 * Visual text labels corresponding to access control roles.
 */
export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.CLIENT_ADMIN]: 'Client Admin',
  [ROLES.CLIENT_VIEWER]: 'Client Viewer',
};

/**
 * Allowed API environments for keys.
 */
export const ENVIRONMENTS = ['production', 'staging', 'development', 'testing'];

/**
 * Visual text labels corresponding to target key environments.
 */
export const ENVIRONMENT_LABELS = {
  production: 'Production',
  staging: 'Staging',
  development: 'Development',
  testing: 'Testing',
};

/**
 * Standard HTTP verb strings supported by client playground.
 */
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

/**
 * Time filter ranges for analytics charts and aggregations.
 */
export const TIME_RANGES = [
  { label: 'Last 1h', value: '1h', ms: 60 * 60 * 1000 },
  { label: 'Last 6h', value: '6h', ms: 6 * 60 * 60 * 1000 },
  { label: 'Last 24h', value: '24h', ms: 24 * 60 * 60 * 1000 },
  { label: 'Last 7d', value: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
  { label: 'Last 30d', value: '30d', ms: 30 * 24 * 60 * 60 * 1000 },
];

/**
 * API Key / Client status visual layout definitions.
 */
export const STATUS_MAP = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'danger' },
  revoked: { label: 'Revoked', variant: 'warning' },
  expired: { label: 'Expired', variant: 'neutral' },
};
