import { withRetry, handleError, parseErrorMessage } from '../../utils/errorHandler.js';

const API_URL = import.meta.env.VITE_API_URL || '/api/auth';

// Configure retry behavior
const MAX_RETRIES = 3;
const RETRY_DELAY = 1500;

export const authAPI = {
  register: async (userData) => {
    return withRetry(async () => {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Registration failed');
        error.response = { status: response.status, data };
        throw error;
      }
      
      return data;
    }, MAX_RETRIES, RETRY_DELAY);
  },

  login: async (credentials) => {
    return withRetry(async () => {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Clear any stale auth data on login failure
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        const error = new Error(data.message || 'Login failed');
        error.response = { status: response.status, data };
        throw error;
      }
      
      return data;
    }, MAX_RETRIES, RETRY_DELAY);
  },

  getMe: async (token) => {
    return withRetry(async () => {
      const response = await fetch(`${API_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Clear invalid auth data on 401
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        const error = new Error(data.message || 'Failed to get user');
        error.response = { status: response.status, data };
        throw error;
      }
      
      return data;
    }, MAX_RETRIES, RETRY_DELAY);
  },

  updateProfile: async (token, userData) => {
    return withRetry(async () => {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Update failed');
        error.response = { status: response.status, data };
        throw error;
      }
      
      return data;
    }, MAX_RETRIES, RETRY_DELAY);
  },

  refreshAnonId: async (token) => {
    return withRetry(async () => {
      const response = await fetch(`${API_URL}/refresh-anon-id`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Failed to refresh anon ID');
        error.response = { status: response.status, data };
        throw error;
      }
      
      return data;
    }, MAX_RETRIES, RETRY_DELAY);
  },
};

/**
 * Helper function to get error message from API calls
 */
export const getAuthErrorMessage = (error) => {
  return parseErrorMessage(error);
};

/**
 * Check if error requires logout (auth token issues)
 */
export const requiresLogout = (error) => {
  return error?.response?.status === 401 || error?.response?.status === 403;
};

