export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  CLIENT_ADMIN: 'client_admin',
  CLIENT_VIEWER: 'client_viewer',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.CLIENT_ADMIN]: 'Client Admin',
  [ROLES.CLIENT_VIEWER]: 'Client Viewer',
};

export const ENVIRONMENTS = ['production', 'staging', 'development', 'testing'];

export const ENVIRONMENT_LABELS = {
  production: 'Production',
  staging: 'Staging',
  development: 'Development',
  testing: 'Testing',
};

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

export const TIME_RANGES = [
  { label: 'Last 1h', value: '1h', ms: 60 * 60 * 1000 },
  { label: 'Last 6h', value: '6h', ms: 6 * 60 * 60 * 1000 },
  { label: 'Last 24h', value: '24h', ms: 24 * 60 * 60 * 1000 },
  { label: 'Last 7d', value: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
  { label: 'Last 30d', value: '30d', ms: 30 * 24 * 60 * 60 * 1000 },
];

export const STATUS_MAP = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'danger' },
  revoked: { label: 'Revoked', variant: 'warning' },
  expired: { label: 'Expired', variant: 'neutral' },
};
