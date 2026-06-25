/**
 * @file AuthContext.jsx
 * @description React Authentication Context provider.
 * Manages user credentials hydration, login / logout actions, profile refreshing, and role validations.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api/client.js';
import { ROLES } from '../utils/constants.js';

/**
 * React context instance storing active user session details and actions.
 */
const AuthContext = createContext(null);

/**
 * Authentication Context Provider Component.
 * Wraps elements and offers access to the session properties and methods.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child elements to wrap.
 * @returns {React.ReactElement}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate session from httpOnly cookie on mount.
  // Utilizes a cancellation boolean flag to prevent updating state if the component is unmounted.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.getProfile();
        if (!cancelled && res.success) {
          setUser(res.data);
        }
      } catch {
        // Not authenticated — that's fine, user remains null
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /**
   * Performs user log in. Fetches the complete profile details on success.
   * 
   * @type {Function}
   * @param {string} username - User account username.
   * @param {string} password - User password.
   * @returns {Promise<Object>} API response status.
   */
  const login = useCallback(async (username, password) => {
    const res = await api.login(username, password);
    if (res.success) {
      // Fetch full profile after login (cookie is set by server)
      const profile = await api.getProfile();
      setUser(profile.data);
    }
    return res;
  }, []);

  /**
   * Logs out the user by deleting the active credentials cookie on the server,
   * and clears local state values.
   * 
   * @type {Function}
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors to ensure client state is cleared regardless of network/server state
    }
    setUser(null);
  }, []);

  /**
   * Forces a refresh fetch of the profile details from the server.
   * 
   * @type {Function}
   * @returns {Promise<void>}
   */
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

/**
 * Custom React hook to retrieve authentication context properties.
 * 
 * @returns {Object} Authentication state and methods.
 * @throws {Error} If called outside an AuthProvider element.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
