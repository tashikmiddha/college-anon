const API_URL = import.meta.env.VITE_API_URL || '/api/admin';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const adminAPI = {
  getStats: async () => {
    const response = await fetch(`${API_URL}/stats`, {
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch stats');
    }
    
    return data;
  },

  getAllPosts: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/posts?${queryParams}`, {
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

  getReports: async () => {
    const response = await fetch(`${API_URL}/reports`, {
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

  getUsers: async () => {
    const response = await fetch(`${API_URL}/users`, {
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
};

