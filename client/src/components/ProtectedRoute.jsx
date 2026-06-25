/**
 * @file ProtectedRoute.jsx
 * @description Authentication guard component.
 * Restricts rendering of dashboard routes to logged-in users; redirects others to login page.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageLoader } from './LoadingSpinner';

/**
 * Higher-Order component that restricts access to authenticated users.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Inner components to render if authenticated.
 * @returns {React.ReactElement} Protected page elements or redirect commands.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Return a full-screen loading spinner while the session cookie is being validated
  if (isLoading) {
    return <FullPageLoader />;
  }

  // Redirect to the login page if the user is unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
