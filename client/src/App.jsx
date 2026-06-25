/**
 * @file App.jsx
 * @description Main application routing configuration.
 * Configures public, protected, and role-restricted dashboard paths using React Router v6.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Onboard from './pages/Onboard';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import ApiKeys from './pages/ApiKeys';
import Users from './pages/Users';
import Profile from './pages/Profile';
import AccessRequests from './pages/AccessRequests';
import Playground from './pages/Playground';
import { ROLES } from './utils/constants';

/**
 * Root React application component containing router layouts.
 * 
 * @returns {React.ReactElement}
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes accessible to everyone */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboard" element={<Onboard />} />

        {/* Protected routes wrapped in AppLayout and Auth ProtectedRoute guard */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          
          {/* Admin-only client organization listing page */}
          <Route
            path="clients"
            element={
              <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Clients />
              </RoleGuard>
            }
          />
          {/* Admin-only client configuration edit page */}
          <Route
            path="clients/:id"
            element={
              <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
                <ClientDetail />
              </RoleGuard>
            }
          />
          {/* Admin-only signup onboarding request approvals page */}
          <Route
            path="requests"
            element={
              <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AccessRequests />
              </RoleGuard>
            }
          />
          
          <Route path="api-keys" element={<ApiKeys />} />
          <Route path="playground" element={<Playground />} />
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Legacy redirects for smooth backward URL compatibility */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />

        {/* Catch-all route routing invalid routes back to the root landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
