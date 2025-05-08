'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../lib/api';

// Create context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(null);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If token exists, try to get current user
        if (localStorage.getItem('token')) {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authAPI.login(username, password);
      localStorage.setItem('token', data.access_token);
      
      // Fetch user data
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    setDebug(null);

    try {
      console.log('Registration attempt with data:', {...userData, password: '[REDACTED]'});
      
      const response = await authAPI.register(userData);
      
      console.log('Registration successful:', response);
      return response;
    } catch (err) {
      // Clean up error message to make it user-friendly
      let userFriendlyError = err.message;
      
      // Simplify common error messages
      if (userFriendlyError.includes("email already exists")) {
        userFriendlyError = "This email is already registered.";
      } else if (userFriendlyError.includes("username already exists")) {
        userFriendlyError = "This username is already taken.";
      }
      
      console.error('Registration error:', userFriendlyError);
      setError(userFriendlyError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update profile function
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await authAPI.updateProfile(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        debug,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 