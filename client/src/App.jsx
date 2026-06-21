import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import Login from './pages/Login';
import Onboard from './pages/Onboard';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import ApiKeys from './pages/ApiKeys';
import Users from './pages/Users';
import Profile from './pages/Profile';
import { ROLES } from './utils/constants';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/onboard" element={<Onboard />} />

        {/* Protected routes with layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
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
          <Route path="api-keys" element={<ApiKeys />} />
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
