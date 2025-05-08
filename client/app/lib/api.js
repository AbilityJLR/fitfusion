import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
  // For Next.js in browser, use the root URL
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Only try to access localStorage in the browser
    if (isBrowser) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Detailed error logging
    console.error('API response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });

    // Handle 401 Unauthorized errors
    if (isBrowser && error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login page if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await api.post('api/v1/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Login API error:', error.message);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      console.log('Sending registration data to API:', {...userData, password: '[REDACTED]'});
      
      // Use our Next.js API route that handles the server-to-server communication
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Extract just the error message without technical details
        const errorMessage = errorData.detail || `Registration failed`;
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      // Avoid logging full error object to console
      console.error('Register API error:', error.message);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('api/v1/users/me');
      return response.data;
    } catch (error) {
      console.error('Get current user API error:', error.message);
      throw error;
    }
  },
  
  updateProfile: async (userData) => {
    try {
      const response = await api.put('api/v1/users/me', userData);
      return response.data;
    } catch (error) {
      console.error('Update profile API error:', error.message);
      throw error;
    }
  },
};

// Other API modules can be added here

export default api; 