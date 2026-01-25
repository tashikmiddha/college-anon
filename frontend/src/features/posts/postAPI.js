const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// Strip trailing /api from VITE_API_URL if present, then add /api back
const API_URL = API_BASE_URL 
  ? `${API_BASE_URL.replace(/\/api\/?$/, '')}/api/posts` 
  : '/api/posts';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const postAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }

    return data;
  },

  createPost: async (postData) => {
    console.log('Creating post with data:', postData);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(postData),
    });

    // Try to parse the response as JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, get text
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Server error: ${text || 'Unknown error'}`);
    }

    console.log('Create post response status:', response.status, 'data:', data);

    if (!response.ok) {
      // Include validation errors if present
      let errorMessage = data.message || 'Failed to create post';
      if (data.errors && Array.isArray(data.errors)) {
        errorMessage = `${errorMessage}: ${data.errors.join(', ')}`;
      }
      throw new Error(errorMessage);
    }

    return data;
  },

  getPosts: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    
    try {
      const response = await fetch(`${API_URL}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific status codes
        if (response.status === 401) {
          // Clear invalid auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('wrong-email-or-password'); // Special marker for auth errors
        } else if (response.status === 403) {
          throw new Error('You do not have permission to view posts');
        } else if (response.status === 404) {
          throw new Error('Posts endpoint not found');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        throw new Error(errorData.message || `Request failed (${response.status})`);
      }
      
      return await response.json();
    } catch (err) {
      // Handle network errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check your connection or try again later.');
      }
      throw err;
    }
  },

  getPost: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle college access denied
      if (response.status === 403) {
        const error = new Error(data.message || 'You do not have permission to view this post');
        error.accessDenied = true;
        error.college = data.college;
        throw error;
      }
      throw new Error(data.message || 'Failed to fetch post');
    }
    
    return data;
  },

  updatePost: async (id, postData) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(postData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update post');
    }
    
    return data;
  },

  deletePost: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete post');
    }
    
    return data;
  },

  likePost: async (id) => {
    const response = await fetch(`${API_URL}/${id}/like`, {
      method: 'POST',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to like post');
    }
    
    return data;
  },

  getMyPosts: async () => {
    const response = await fetch(`${API_URL}/user/my-posts`, {
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch your posts');
    }
    
    return data;
  },

  reportPost: async (id, reportData) => {
    const { reason, description } = reportData;

    // Client-side validation
    const validReasons = ['spam', 'harassment', 'hate-speech', 'violence', 'misinformation', 'inappropriate', 'other'];
    if (!reason) {
      throw new Error('Please select a reason for reporting this post');
    }
    if (!validReasons.includes(reason)) {
      throw new Error('Invalid report reason selected');
    }
    if (description && description.length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }

    const response = await fetch(`${API_URL}/${id}/report`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason, description }),
    });

    // Try to parse the response as JSON
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server returned an invalid response');
    }

    if (!response.ok) {
      // Handle specific error cases with user-friendly messages
      if (response.status === 400) {
        if (data.message?.includes('already reported')) {
          throw new Error('You have already reported this post');
        }
        if (data.message?.includes('reason is required')) {
          throw new Error('Please select a reason for reporting');
        }
        throw new Error(data.message || 'Unable to submit report. Please try again.');
      }
      if (response.status === 403) {
        throw new Error(data.message || 'You can only report posts from your college');
      }
      if (response.status === 404) {
        throw new Error('Post not found');
      }
      if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      throw new Error(data.message || 'Failed to report post');
    }

    return data;
  },

  // Comments API
  getComments: async (postId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/${postId}/comments?${queryParams}`, {
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch comments');
    }
    
    return data;
  },

  createComment: async (postId, content) => {
    const response = await fetch(`${API_URL}/${postId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create comment');
    }
    
    return data;
  },

  likeComment: async (commentId) => {
    const response = await fetch(`${API_URL}/comments/${commentId}/like`, {
      method: 'POST',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to like comment');
    }
    
    return data;
  },

  deleteComment: async (commentId) => {
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete comment');
    }
    
    return data;
  },

  getMyComments: async () => {
    const response = await fetch(`${API_URL}/user/my-comments`, {
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch your comments');
    }
    
    return data;
  },
};

