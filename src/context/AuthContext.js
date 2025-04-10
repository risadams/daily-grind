import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService.js';

// Create context
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await authService.initAuth();
        setCurrentUser(user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register function
  const register = async (email, password, displayName) => {
    setError(null);
    try {
      const user = await authService.register(email, password, displayName);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Login function
  const login = async (email, password) => {
    setError(null);
    try {
      const user = await authService.login(email, password);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Google login function
  const loginWithGoogle = () => {
    setError(null);
    authService.loginWithGoogle();
  };

  // Handle OAuth callback
  const handleAuthCallback = async (token) => {
    setError(null);
    try {
      const user = await authService.handleAuthCallback(token);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout function (renamed from logout to logOut for consistency)
  const logOut = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Update profile
  const updateProfile = async (userData) => {
    if (!currentUser) return;
    try {
      const updated = await authService.updateProfile(currentUser._id, userData);
      setCurrentUser(prev => ({ ...prev, ...updated }));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file) => {
    if (!currentUser) return;
    try {
      const updated = await authService.uploadProfilePicture(currentUser._id, file);
      setCurrentUser(prev => ({ ...prev, ...updated }));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    handleAuthCallback,
    logOut,
    updateProfile,
    uploadProfilePicture
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};