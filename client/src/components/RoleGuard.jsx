/**
 * @file RoleGuard.jsx
 * @description RBAC authorization guard component.
 * Restricts rendering of specific routes to permitted roles (e.g. super_admin).
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Higher-Order component that restricts access to specified user roles.
 * 
 * @param {Object} props
 * @param {Array<string>} props.allowedRoles - Array of allowed role enums.
 * @param {React.ReactNode} props.children - Inner layout to render if roles match.
 * @returns {React.ReactElement} Restricted elements or redirect commands.
 */
export default function RoleGuard({ allowedRoles = [], children }) {
  const { role } = useAuth();

  // If a role restrict exists and the user's role is not included, redirect to dashboard root
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}
