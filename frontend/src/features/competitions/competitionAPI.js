const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = API_BASE_URL ? `${API_BASE_URL}/api/competitions` : '/api/competitions';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const getMultipartHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export const competitionAPI = {
  // Create a new competition (Premium only)
  createCompetition: async (competitionData) => {
    const formData = new FormData();
    formData.append('title', competitionData.title);
    formData.append('description', competitionData.description || '');
    formData.append('type', competitionData.type || 'comparison');
    formData.append('durationHours', competitionData.durationHours || 24);
    
    // Append options as JSON
    const options = competitionData.options.map(opt => ({
      name: opt.name,
      image: opt.image || { url: '', publicId: '' }
    }));
    formData.append('options', JSON.stringify(options));
    
    // Append images if present
    if (competitionData.images) {
      competitionData.images.forEach((image, index) => {
        if (image) {
          formData.append('optionImages', image);
        }
      });
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getMultipartHeaders(),
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.errors?.join(', ') || 'Failed to create competition');
    }

    return data;
  },

  // Get all competitions for user's college
  getCompetitions: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    
    try {
      const response = await fetch(`${API_URL}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed (${response.status})`);
      }
      
      return await response.json();
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check your connection.');
      }
      throw err;
    }
  },

  // Get single competition
  getCompetition: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch competition');
    }
    
    return data;
  },

  // Vote on a competition
  voteOnCompetition: async (id, optionIndex) => {
    const response = await fetch(`${API_URL}/${id}/vote`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ optionIndex }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to vote');
    }
    
    return data;
  },

  // Get competition results
  getCompetitionResults: async (id) => {
    const response = await fetch(`${API_URL}/${id}/results`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch results');
    }
    
    return data;
  },

  // Delete own competition
  deleteCompetition: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete competition');
    }
    
    return data;
  },

  // Report a competition
  reportCompetition: async (id, reportData) => {
    const response = await fetch(`${API_URL}/${id}/report`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reportData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to report competition');
    }
    
    return data;
  },
};

