/**
 * @file roles.js
 * @description Defines security roles and role-validation utilities.
 * - super_admin: Global system administrator with cross-tenant privileges.
 * - client_admin: Organization admin that can manage keys, users, and read organization-scoped analytics.
 * - client_viewer: Organization viewer that can read analytics but cannot modify configurations.
 */

export const ROLES = [
    'super_admin',
    'client_admin',
    'client_viewer',
];

export const CLIENT_ROLES = [
    'client_admin',
    'client_viewer',
];

export const APPLICATION_ROLES = {
    SUPER_ADMIN: "super_admin",
    CLIENT_ADMIN: "client_admin",
    CLIENT_VIEWER: "client_viewer"
}


export const isValidClientRole = (role) => CLIENT_ROLES.includes(role);
export const isValidRole = (role) => ROLES.includes(role);