import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminProductManager from '../components/admin/AdminProductManager';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  // Check if user is admin (you can add admin role to your user model)
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const adminSections = [
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
        return <AdminOverview />;
      case 'products':
        return <AdminProductManager />;
      case 'categories':
        return <AdminCategories />;
      case 'orders':
        return <AdminOrders />;
      case 'users':
        return <AdminUsers />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username || user?.email}
              </span>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Site
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {adminSections.map((section) => (
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

          {/* Main Content */}
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

// Admin Section Components
const AdminOverview = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="text-2xl">🕯️</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-blue-900">24</div>
              <div className="text-sm text-blue-700">Total Products</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="text-2xl">📦</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-green-900">156</div>
              <div className="text-sm text-green-700">Total Orders</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="text-2xl">👥</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-purple-900">89</div>
              <div className="text-sm text-purple-700">Total Users</div>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <div className="text-2xl">💰</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-orange-900">$12,450</div>
              <div className="text-sm text-orange-700">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Product Management</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + Add New Product
        </button>
      </div>
      <p className="text-gray-600 mb-4">Manage your products, add images, and update descriptions.</p>
      {/* Product management content will go here */}
    </div>
  );
};

const AdminCategories = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Category Management</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + Add New Category
        </button>
      </div>
      <p className="text-gray-600 mb-4">Organize your products into categories for better navigation.</p>
      {/* Category management content will go here */}
    </div>
  );
};

const AdminOrders = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Management</h2>
      <p className="text-gray-600 mb-4">View and manage customer orders, update status, and track shipments.</p>
      {/* Order management content will go here */}
    </div>
  );
};

const AdminUsers = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>
      <p className="text-gray-600 mb-4">Manage customer accounts, view profiles, and handle support requests.</p>
      {/* User management content will go here */}
    </div>
  );
};

const AdminSettings = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Website Settings</h2>
      <p className="text-gray-600 mb-4">Configure website settings, update business information, and manage integrations.</p>
      {/* Settings content will go here */}
    </div>
  );
};

export default AdminDashboard; 