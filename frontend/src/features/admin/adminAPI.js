const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = API_BASE_URL ? `${API_BASE_URL}/api/admin` : '/api/admin';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const buildQueryString = (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  return queryParams.toString();
};

export const adminAPI = {
  getStats: async (params = {}) => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_URL}/stats?${queryString}`, {
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch stats');
    }

    return data;
  },

  getAllPosts: async (params = {}) => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_URL}/posts?${queryString}`, {
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch posts');
    }

    return data;
  },

  moderatePost: async (id, { status, reason }) => {
    const response = await fetch(`${API_URL}/posts/${id}/moderate`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, reason }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to moderate post');
    }

    return data;
  },

  togglePin: async (id) => {
    const response = await fetch(`${API_URL}/posts/${id}/pin`, {
      method: 'PUT',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to toggle pin');
    }

    return data;
  },

  deletePost: async (id) => {
    const response = await fetch(`${API_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete post');
    }

    return data;
  },

  blockUser: async (id, reason) => {
    const response = await fetch(`${API_URL}/users/${id}/block`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to block user');
    }

    return data;
  },

  unblockUser: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}/unblock`, {
      method: 'PUT',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to unblock user');
    }

    return data;
  },

  getReports: async (params = {}) => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_URL}/reports?${queryString}`, {
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch reports');
    }

    return data;
  },

  resolveReport: async (id, { status, adminNotes }) => {
    const response = await fetch(`${API_URL}/reports/${id}/resolve`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, adminNotes }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resolve report');
    }

    return data;
  },

  getUsers: async (params = {}) => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_URL}/users?${queryString}`, {
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch users');
    }

    return data;
  },

  toggleAdmin: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}/toggle-admin`, {
      method: 'PUT',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to toggle admin status');
    }

    return data;
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete user');
    }

    return data;
  },

  // Premium management
  getPremiumUsers: async (params = {}) => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_URL}/premium-users?${queryString}`, {
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch premium users');
    }

    return data;
  },

  grantPremium: async (id, data) => {
    const response = await fetch(`${API_URL}/users/${id}/grant-premium`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to grant premium');
    }

    return result;
  },

  revokePremium: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}/revoke-premium`, {
      method: 'PUT',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to revoke premium');
    }

    return data;
  },

  updatePremiumQuotas: async (id, data) => {
    const response = await fetch(`${API_URL}/users/${id}/update-quotas`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update quotas');
    }

    return result;
  },

  resetPremiumUsage: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}/reset-usage`, {
      method: 'PUT',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset usage');
    }

    return data;
  },
};

