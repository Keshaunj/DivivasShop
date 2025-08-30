import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAPI } from '../../proxyApi/api';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if admin is authenticated on mount
  useEffect(() => {
    checkAdminAuthStatus();
  }, []);

  const checkAdminAuthStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        // Verify token is valid by making a simple request
        const response = await adminAPI.getDashboardStats();
        if (response) {
          // If we get a response, the token is valid
          // For now, we'll set a basic admin object
          // The actual admin data will be set when they log in
          setAdmin({ 
            email: 'admin@example.com', // This will be updated on login
            username: 'Admin',
            role: 'admin',
            isAdmin: true
          });
        }
      }
    } catch (error) {
      console.log('Admin auth check failed:', error.message);
      localStorage.removeItem('adminToken');
      setAdmin(null);
    }
  };

  const adminLogin = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminAPI.adminLogin(email, password);
      
      if (response.admin && response.token) {
        setAdmin(response.admin);
        localStorage.setItem('adminToken', response.token);
        return { success: true, message: 'Admin login successful' };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error.message || 'Admin login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const adminLogout = () => {
    setAdmin(null);
    localStorage.removeItem('adminToken');
  };

  const isAdminAuthenticated = () => {
    return !!admin && !!localStorage.getItem('adminToken');
  };

  const hasPermission = (resource, action) => {
    if (!admin || !admin.permissions) return false;
    
    const permission = admin.permissions.find(p => p.resource === resource);
    if (!permission) return false;
    
    return permission.actions.includes(action);
  };

  const isSuperAdmin = () => {
    return admin && admin.role === 'admin' && admin.isAdmin === true;
  };

  const value = {
    admin,
    loading,
    error,
    adminLogin,
    adminLogout,
    isAdminAuthenticated,
    hasPermission,
    isSuperAdmin
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
