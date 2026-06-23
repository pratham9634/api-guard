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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboard" element={<Onboard />} />

        {/* Protected routes with layout */}
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
          <Route
            path="clients"
            element={
              <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Clients />
              </RoleGuard>
            }
          />
          <Route
            path="clients/:id"
            element={
              <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
                <ClientDetail />
              </RoleGuard>
            }
          />
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

        {/* Legacy redirects */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
