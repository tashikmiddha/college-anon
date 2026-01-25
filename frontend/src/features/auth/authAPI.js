import { withRetry, handleError, parseErrorMessage } from '../../utils/errorHandler.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// Strip trailing /api from VITE_API_URL if present, then add /api back
const API_URL = API_BASE_URL 
  ? `${API_BASE_URL.replace(/\/api\/?$/, '')}/api/auth` 
  : '/api/auth';

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
    // Login should only make 1 request - no retry to avoid multiple requests
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
        // Clear invalid auth data on 401 with tokenInvalid flag
        if (response.status === 401 && (data.tokenInvalid || data.tokenExpired)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else if (response.status === 401) {
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

  verifyEmail: async (token) => {
    return withRetry(async () => {
      const response = await fetch(`${API_URL}/verify-email/${token}`, {
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Verification failed');
        error.response = { status: response.status, data };
        throw error;
      }
      
      return data;
    }, MAX_RETRIES, RETRY_DELAY);
  },

  resendVerificationEmail: async (email) => {
    return withRetry(async () => {
      const response = await fetch(`${API_URL}/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Failed to send verification email');
        error.response = { status: response.status, data };
        throw error;
      }
      
      return data;
    }, MAX_RETRIES, RETRY_DELAY);
  },

  forgotPassword: async (email) => {
    return withRetry(async () => {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Failed to send password reset email');
        error.response = { status: response.status, data };
        throw error;
      }
      
      return data;
    }, MAX_RETRIES, RETRY_DELAY);
  },

  resetPassword: async (token, password) => {
    return withRetry(async () => {
      const response = await fetch(`${API_URL}/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Password reset failed');
        error.response = { status: response.status, data };
        throw error;
      }
      
      return data;
    }, MAX_RETRIES, RETRY_DELAY);
  },

  checkUserExists: async (email) => {
    const response = await fetch(`${API_URL}/check-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      // User doesn't exist
      const error = new Error(data.message || 'User not found');
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
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

// Payment API
export const paymentAPI = {
  submitPayment: async ({ planId, planName, amount, screenshot }) => {
    const formData = new FormData();
    formData.append('planId', planId);
    formData.append('planName', planName);
    formData.append('amount', amount);
    formData.append('screenshot', screenshot);

    const response = await fetch(`${API_URL}/submit-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Failed to submit payment');
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  },
};

