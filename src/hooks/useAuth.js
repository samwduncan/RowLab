import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * DEPRECATED V1 Hook - Stub for legacy auth pages
 *
 * V1 authStore deleted in Phase 36.1-02.
 * This stub exists only for legacy pages (LoginPage, RegisterPage, InviteClaimPage).
 * V2 uses AuthContext from src/v2/contexts/AuthContext.tsx
 *
 * TODO(phase-37): Replace legacy pages with V2 Canvas auth pages and delete this stub.
 */
export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stub values - legacy pages use dev-login which bypasses this
  const user = null;
  const teams = [];
  const activeTeamId = null;
  const activeTeamRole = null;
  const isAuthenticated = false;
  const isInitialized = true;

  // Stub login - legacy pages use dev-login which directly navigates
  const login = useCallback(
    async (email, password) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        setIsLoading(false);
        if (data.success) {
          window.__rowlab_access_token = data.data.accessToken;
          const from = location.state?.from?.pathname || '/app';
          navigate(from, { replace: true });
          return { success: true };
        }
        setError(data.error?.message || 'Login failed');
        return { success: false, error: data.error };
      } catch (err) {
        setIsLoading(false);
        setError('Network error');
        return { success: false, error: { message: 'Network error' } };
      }
    },
    [navigate, location]
  );

  // Stub register
  const register = useCallback(
    async (data) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        setIsLoading(false);
        if (result.success) {
          navigate('/login', {
            state: { message: 'Account created! Please log in.' },
          });
          return { success: true };
        }
        setError(result.error?.message || 'Registration failed');
        return { success: false, error: result.error };
      } catch (err) {
        setIsLoading(false);
        setError('Network error');
        return { success: false, error: { message: 'Network error' } };
      }
    },
    [navigate]
  );

  // Stub logout
  const logout = useCallback(async () => {
    delete window.__rowlab_access_token;
    navigate('/login', { replace: true });
  }, [navigate]);

  // Stub team functions
  const switchTeam = useCallback(async () => ({ success: false }), []);
  const createTeam = useCallback(async () => ({ success: false }), []);
  const joinTeamByCode = useCallback(async () => ({ success: false }), []);

  // Stub helpers
  const hasRole = useCallback(() => false, []);
  const isCoachOrOwner = useCallback(() => false, []);
  const isOwner = useCallback(() => false, []);
  const clearError = useCallback(() => setError(null), []);
  const getAuthHeaders = useCallback(() => ({}), []);
  const authenticatedFetch = useCallback(async () => {
    throw new Error('V1 authenticatedFetch deprecated - use V2 api utility');
  }, []);

  return {
    // State
    user,
    teams,
    activeTeamId,
    activeTeamRole,
    activeTeam: null,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,

    // Actions
    login,
    register,
    logout,
    switchTeam,
    createTeam,
    joinTeamByCode,
    clearError,

    // Helpers
    hasRole,
    isCoachOrOwner,
    isOwner,
    getAuthHeaders,
    authenticatedFetch,
  };
}

/**
 * Stub - Hook for requiring authentication
 */
export function useRequireAuth() {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: { from: location },
      });
    }
  }, [isAuthenticated, isInitialized, isLoading, navigate, location]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook for requiring specific roles
 */
export function useRequireRole(...requiredRoles) {
  const { isAuthenticated, activeTeamRole, isInitialized, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && !isLoading && isAuthenticated) {
      if (!requiredRoles.includes(activeTeamRole)) {
        navigate('/app', { replace: true });
      }
    }
  }, [isAuthenticated, activeTeamRole, isInitialized, isLoading, navigate, requiredRoles]);

  return {
    hasAccess: requiredRoles.includes(activeTeamRole),
    isLoading: isLoading || !isInitialized,
  };
}

/**
 * Hook for requiring team context
 */
export function useRequireTeam() {
  const { isAuthenticated, activeTeamId, isInitialized, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && !isLoading && isAuthenticated && !activeTeamId) {
      navigate('/onboarding/team', { replace: true });
    }
  }, [isAuthenticated, activeTeamId, isInitialized, isLoading, navigate]);

  return {
    hasTeam: !!activeTeamId,
    isLoading: isLoading || !isInitialized,
  };
}

export default useAuth;
