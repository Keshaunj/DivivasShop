import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/admin/AdminAuthContext';

// Import Customer Management Components
import CustomerOverview from './components/CustomerOverview';
import CustomerProducts from './components/CustomerProducts';
import CustomerCategories from './components/CustomerCategories';
import CustomerOrders from './components/CustomerOrders';
import CustomerUsers from './components/CustomerUsers';
import CustomerAdminManagement from './components/CustomerAdminManagement';
import CustomerSettings from './components/CustomerSettings';

const CustomerManagement = () => {
  const navigate = useNavigate();
  const { admin, isAdminAuthenticated, isSuperAdmin } = useAdminAuth();
  const [activeSection, setActiveSection] = useState('overview');

  // Check if user is admin
  const isAdmin = isAdminAuthenticated();
  const isSuperAdminUser = isSuperAdmin();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access customer management.</p>
          <button
            onClick={() => navigate('/corporate')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Corporate Portal
          </button>
        </div>
      </div>
    );
  }

  const customerSections = [
    {
      id: 'overview',
      name: 'Overview',
      icon: '📊',
      description: 'Dashboard overview and statistics'
    },
    {
      id: 'products',
      name: 'Products',
      icon: '🕯️',
      description: 'Manage products, add images, descriptions'
    },
    {
      id: 'categories',
      name: 'Categories',
      icon: '📂',
      description: 'Organize products into categories'
    },
    {
      id: 'orders',
      name: 'Orders',
      icon: '📦',
      description: 'View and manage customer orders'
    },
    {
      id: 'users',
      name: 'Users',
      icon: '👥',
      description: 'Manage customer accounts'
    },
    // Only show Admin Management for Super Admins
    ...(isSuperAdminUser ? [{
      id: 'admin-management',
      name: 'Admin Management',
      icon: '👑',
      description: 'Manage admin users and permissions (Super Admin Only)'
    }] : []),
    {
      id: 'settings',
      name: 'Settings',
      icon: '⚙️',
      description: 'Website configuration and settings'
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <CustomerOverview isSuperAdmin={isSuperAdminUser} onSectionChange={setActiveSection} />;
      case 'products':
        return <CustomerProducts isSuperAdmin={isSuperAdminUser} />;
      case 'categories':
        return <CustomerCategories isSuperAdmin={isSuperAdminUser} />;
      case 'orders':
        return <CustomerOrders isSuperAdmin={isSuperAdminUser} />;
      case 'users':
        return <CustomerUsers isSuperAdmin={isSuperAdminUser} />;
      case 'admin-management':
        return <CustomerAdminManagement isSuperAdmin={isSuperAdminUser} />;
      case 'settings':
        return <CustomerSettings isSuperAdmin={isSuperAdminUser} />;
      default:
        return <CustomerOverview isSuperAdmin={isSuperAdminUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/corporate')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Corporate Portal
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {admin?.username || admin?.email}
              </span>
              <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded-full">
                {isSuperAdminUser ? 'Super Admin' : 'Business Admin'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {customerSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{section.icon}</span>
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="text-sm text-gray-500">{section.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;
