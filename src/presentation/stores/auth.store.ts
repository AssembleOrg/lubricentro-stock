import { create } from 'zustand';
import { cookieUtil } from '../utils/cookie.util';
import { useProductStore } from './product.store';
import { useProductTypeStore } from './product-type.store';

interface AuthState {
  user: { email: string; uid: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  initialize: () => {
    // Don't try to read httpOnly cookies from client
    // They will be verified via /api/auth/verify endpoint
    // Only set user from non-httpOnly cookie if available
    if (typeof window === 'undefined') return;

    const user = cookieUtil.getUser();
    if (user) {
      set({
        user,
        token: null, // Token is httpOnly, we can't read it
        isAuthenticated: false, // Will be verified by checkAuth
      });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      console.log('Login response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      // Server already set httpOnly cookies via Set-Cookie header
      // We only set non-httpOnly user cookie for client access
      // Token is httpOnly and can't be read from client
      cookieUtil.setUser(result.data.user);

      // Update state - token is httpOnly so we don't store it
      set({
        user: result.data.user,
        token: null, // Token is httpOnly, stored in server cookie only
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      // Call server logout endpoint to clear httpOnly cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with client-side cleanup even if server call fails
    }

    // Clear client-side cookies
    cookieUtil.clear();
    
    // Clear all cookies manually (in case cookieUtil didn't catch them all)
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach((c) => {
        const eqPos = c.indexOf('=');
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        // Remove all cookies
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      });
    }

    // Clear localStorage and sessionStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }

    // Clear Zustand state
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    // Clear other stores
    useProductStore.getState().clearFilters();
    useProductStore.setState({ products: [], selectedProduct: null, error: null });
    useProductTypeStore.getState().clearError();
    useProductTypeStore.setState({ productTypes: [], error: null });
  },

  checkAuth: async () => {
    if (typeof window === 'undefined') return false;

    try {
      // Verify auth using server endpoint which reads httpOnly cookies
      // Don't send token in header, let server read from cookies
      const response = await fetch('/api/auth/verify', {
        credentials: 'include', // Important: sends cookies
      });

      if (response.status === 401) {
        cookieUtil.clear();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        return false;
      }

      const result = await response.json();
      if (result.success && result.data) {
        // Update user cookie (non-httpOnly) for client access
        cookieUtil.setUser(result.data.user);
        set({
          user: result.data.user,
          token: null, // Token is httpOnly, we don't store it in state
          isAuthenticated: true,
        });
        return true;
      }

      cookieUtil.clear();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
      return false;
    } catch (error) {
      console.error('checkAuth error:', error);
      cookieUtil.clear();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
      return false;
    }
  },
}));

