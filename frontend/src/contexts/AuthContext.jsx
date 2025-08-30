import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../proxyApi/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    // Temporarily disable auto auth check to prevent timeout errors
    // checkAuthStatus();
    
    // Set loading to false immediately so the app can render
    setLoading(false);
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      const response = await authAPI.checkAuth();
      
      setUser(response.user);
      setError(null);
    } catch (error) {
      console.log('Auth check failed:', error.message);
      setUser(null);
      setError(null); // Don't show error for auth check
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(credentials);
      
      setUser(response.user);
      
      // Store the JWT token in localStorage for API calls
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      return { success: true, message: 'Login successful!' };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.signup(userData);
      setUser(response.user);
      
      // Store the JWT token in localStorage for API calls
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      return { success: true, message: 'Account created successfully!' };
    } catch (error) {
      const errorMessage = error.message || 'Signup failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setError(null);
      // Clear the JWT token from localStorage
      localStorage.removeItem('token');
      return { success: true, message: 'Logged out successfully!' };
    } catch (error) {
      const errorMessage = error.message || 'Logout failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const clearError = () => {
    setError(null);
  };

  // Add helper function to check if user is admin
  const isAdmin = () => {
    return user && (user.role === 'admin' || user.isAdmin);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,
    clearError,
    isAdmin, // Add this
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 