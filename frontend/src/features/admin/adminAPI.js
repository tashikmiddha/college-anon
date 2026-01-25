const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// Strip trailing /api from VITE_API_URL if present, then add /api back
const API_URL = API_BASE_URL 
  ? `${API_BASE_URL.replace(/\/api\/?$/, '')}/api/admin` 
  : '/api/admin';

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

  // Get all posts with pagination support
  getPosts: async (params = {}) => {
    const page = params.page || 1;
    const limit = params.limit || 20;
    // Build filter params (status, college) but exclude pagination params
    const filterParams = {};
    if (params.status) filterParams.status = params.status;
    if (params.college) filterParams.college = params.college;
    
    const queryString = buildQueryString({ ...filterParams, page, limit });
    const response = await fetch(`${API_URL}/posts?${queryString}`, {
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch posts');
    }

    return data;
  },

  // Legacy method - kept for backward compatibility
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

  // Get reports with pagination support
  getReports: async (params = {}) => {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const filterParams = {};
    if (params.status) filterParams.status = params.status;
    if (params.college) filterParams.college = params.college;
    
    const queryString = buildQueryString({ ...filterParams, page, limit });
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

  // Get users with pagination support
  getUsers: async (params = {}) => {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const filterParams = {};
    if (params.college) filterParams.college = params.college;
    
    const queryString = buildQueryString({ ...filterParams, page, limit });
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

  // Premium management with pagination support
  getPremiumUsers: async (params = {}) => {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const filterParams = {};
    if (params.college) filterParams.college = params.college;
    if (params.status) filterParams.status = params.status;
    
    const queryString = buildQueryString({ ...filterParams, page, limit });
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

  // User's own reports
  getMyReports: async () => {
    const response = await fetch(`${API_URL}/reports/my-reports`, {
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch your reports');
    }

    return data;
  },

  // Competition management
  getAllCompetitions: async (params = {}) => {
    const queryString = buildQueryString(params);
    console.log('API call: GET /api/competitions/admin/all?' + queryString);
    const response = await fetch(`/api/competitions/admin/all?${queryString}`, {
      headers: getHeaders(),
    });
    console.log('API response status:', response.status);

    const data = await response.json();
    console.log('API response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch competitions');
    }

    return data;
  },

  updateCompetition: async (id, data) => {
    const response = await fetch(`/api/competitions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update competition');
    }

    return result;
  },

  deleteCompetition: async (id) => {
    const response = await fetch(`/api/competitions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete competition');
    }

    return data;
  },

  // Hard delete competition (permanently removes from database)
  hardDeleteCompetition: async (id) => {
    const response = await fetch(`/api/competitions/${id}/hard-delete`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to permanently delete competition');
    }

    return data;
  },

  // Feedback management with pagination support
  submitFeedback: async (data) => {
    const response = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to submit feedback');
    }

    return result;
  },

  getMyFeedbacks: async () => {
    const response = await fetch(`${API_URL}/feedback/my-feedbacks`, {
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch your feedbacks');
    }

    return data;
  },

  // Get all feedbacks with pagination support
  getAllFeedbacks: async (params = {}) => {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const filterParams = {};
    if (params.status) filterParams.status = params.status;
    if (params.type) filterParams.type = params.type;
    if (params.college) filterParams.college = params.college;
    
    const queryString = buildQueryString({ ...filterParams, page, limit });
    const response = await fetch(`${API_URL}/feedback?${queryString}`, {
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch feedbacks');
    }

    return data;
  },

  resolveFeedback: async (id, data) => {
    const response = await fetch(`${API_URL}/feedback/${id}/resolve`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to resolve feedback');
    }

    return result;
  },

  deleteFeedback: async (id) => {
    const response = await fetch(`${API_URL}/feedback/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete feedback');
    }

    return data;
  },

  // Comments management with pagination support
  getAllComments: async (params = {}) => {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const filterParams = {};
    if (params.college) filterParams.college = params.college;
    
    const queryString = buildQueryString({ ...filterParams, page, limit });
    const response = await fetch(`${API_URL}/comments?${queryString}`, {
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch comments');
    }

    return data;
  },

  deleteComment: async (id) => {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete comment');
    }

    return data;
  },

  // Get competition reports with pagination support
  getCompetitionReports: async (params = {}) => {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const filterParams = {};
    if (params.status) filterParams.status = params.status;

    const queryString = buildQueryString({ ...filterParams, page, limit });
    const response = await fetch(`${API_URL}/competition-reports?${queryString}`, {
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch competition reports');
    }

    return data;
  },

  resolveCompetitionReport: async (id, { status, adminNotes }) => {
    const response = await fetch(`${API_URL}/competition-reports/${id}/resolve`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, adminNotes }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resolve competition report');
    }

    return data;
  },
};

