import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to set auth token in headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }
};

// Initialize auth token from localStorage
const initAuth = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    setAuthToken(token);
    return getCurrentUser();
  }
  return Promise.resolve(null);
};

// Register a new user
const register = async (email, password, displayName) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, {
      email,
      password,
      displayName
    });
    
    const { user, token } = response.data;
    setAuthToken(token);
    
    return user;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Login user
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email,
      password
    });
    
    const { user, token } = response.data;
    setAuthToken(token);
    
    return user;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Google login
const loginWithGoogle = () => {
  window.location.href = `${API_URL}/users/auth/google`;
};

// Handle OAuth callback
const handleAuthCallback = (token) => {
  if (token) {
    setAuthToken(token);
    return getCurrentUser();
  }
  return Promise.resolve(null);
};

// Logout user
const logout = () => {
  setAuthToken(null);
};

// Get current user
const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    // Decode JWT to get user ID (simple decode, not verification)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(window.atob(base64));
    
    const userId = decoded.sub; // JWT subject holds the user ID
    
    const response = await axios.get(`${API_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      setAuthToken(null);
    }
    return null;
  }
};

// Update user profile
const updateProfile = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

// Upload profile picture
const uploadProfilePicture = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await axios.post(
      `${API_URL}/users/${userId}/profile-picture`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload profile picture');
  }
};

const authService = {
  initAuth,
  register,
  login,
  loginWithGoogle,
  handleAuthCallback,
  logout,
  getCurrentUser,
  updateProfile,
  uploadProfilePicture
};

export default authService;