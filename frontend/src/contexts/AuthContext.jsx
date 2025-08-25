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
      console.log('=== LOGIN PROCESS START ===');
      console.log('1. Setting loading state to true');
      setLoading(true);
      setError(null);
      
      console.log('2. Login credentials received:', { 
        email: credentials.email, 
        hasPassword: !!credentials.password,
        passwordLength: credentials.password ? credentials.password.length : 0
      });
      
      console.log('3. About to call authAPI.login...');
      console.log('4. API base URL should be: http://localhost:3000/api');
      
      const response = await authAPI.login(credentials);
      
      console.log('5. Login API call completed successfully!');
      console.log('6. Response received:', response);
      console.log('7. Setting user state with:', response.user);
      
      setUser(response.user);
      
      console.log('8. Login process completed successfully');
      console.log('=== LOGIN SUCCESS ===');
      
      return { success: true, message: 'Login successful!' };
    } catch (error) {
      console.error('=== LOGIN FAILED ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', error);
      
      if (error.name === 'TypeError') {
        console.error('This looks like a network/API error');
        console.error('Check if backend is running on port 3000');
        console.error('Check if frontend can reach http://localhost:3000');
      }
      
      if (error.message.includes('fetch')) {
        console.error('This looks like a fetch/network error');
        console.error('Possible causes:');
        console.error('- Backend not running');
        console.error('- CORS issues');
        console.error('- Network connectivity problems');
      }
      
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      console.log('9. Setting loading state to false');
      setLoading(false);
      console.log('=== LOGIN PROCESS END ===');
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.signup(userData);
      setUser(response.user);
      
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