import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api/client.js';
import { ROLES } from '../utils/constants.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate session from httpOnly cookie on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.getProfile();
        if (!cancelled && res.success) {
          setUser(res.data);
        }
      } catch {
        // Not authenticated — that's fine
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await api.login(username, password);
    if (res.success) {
      // Fetch full profile after login (cookie is set by server)
      const profile = await api.getProfile();
      setUser(profile.data);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    }
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.getProfile();
      if (res.success) setUser(res.data);
    } catch {
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === ROLES.SUPER_ADMIN,
    isClientAdmin: user?.role === ROLES.CLIENT_ADMIN,
    role: user?.role,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
