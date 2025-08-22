import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminProductManager from '../../components/admin/AdminProductManager';
import { adminAPI } from '../../proxyApi/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if user is admin (Business Owner Admin or Super Admin)
  const isAdmin = user?.role === 'admin' || user?.isAdmin;
  
  // Check if user is Super Admin (has admin_management permissions)
  const isSuperAdmin = user?.role === 'admin' && user?.isAdmin === true;
  
  // Check if user is Business Owner Admin (regular admin, not super)
  const isBusinessOwnerAdmin = user?.role === 'admin' && user?.isAdmin === false;

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDashboardStats();
      setStats(data.stats);
      setRecentOrders(data.recentOrders || []);
      setLowStockProducts(data.lowStockProducts || []);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
    // Only show Admin Management for Super Admins
    ...(isSuperAdmin ? [{
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
        return <AdminOverview 
          stats={stats} 
          recentOrders={recentOrders} 
          lowStockProducts={lowStockProducts} 
          loading={loading} 
          isSuperAdmin={isSuperAdmin}
          onSectionChange={setActiveSection}
        />;
      case 'products':
        return <AdminProductManager isSuperAdmin={isSuperAdmin} />;
      case 'categories':
        return <AdminCategories isSuperAdmin={isSuperAdmin} />;
      case 'orders':
        return <AdminOrders isSuperAdmin={isSuperAdmin} />;
      case 'users':
        return <AdminUsers isSuperAdmin={isSuperAdmin} />;
      case 'admin-management':
        return <AdminAdminManagement isSuperAdmin={isSuperAdmin} />;
      case 'settings':
        return <AdminSettings isSuperAdmin={isSuperAdmin} />;
                default:
        return <AdminOverview 
          stats={stats} 
          recentOrders={recentOrders} 
          lowStockProducts={lowStockProducts} 
          loading={loading} 
          isSuperAdmin={isSuperAdmin}
          onSectionChange={setActiveSection}
        />;
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
const AdminOverview = ({ stats, recentOrders, lowStockProducts, loading, isSuperAdmin, onSectionChange }) => {
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {isSuperAdmin ? 'Platform Overview' : 'Business Overview'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Super Admin sees Platform-wide data, Business Owner sees Business data */}
        {isSuperAdmin ? (
          // Super Admin - Platform Overview
          <>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="text-2xl">🏢</div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-blue-900">{stats.totalBusinesses || 'N/A'}</div>
                  <div className="text-sm text-blue-700">Active Businesses</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="text-2xl">💰</div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-green-900">${stats.platformRevenue || 'N/A'}</div>
                  <div className="text-sm text-green-700">Platform Revenue</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Business Owner Admin - Business Overview
          <>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="text-2xl">🕯️</div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-blue-900">{stats.totalProducts || 'N/A'}</div>
                  <div className="text-sm text-blue-700">Total Products</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="text-2xl">📦</div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-green-900">{stats.totalOrders || 'N/A'}</div>
                  <div className="text-sm text-green-700">Total Orders</div>
                </div>
              </div>
            </div>
          </>
        )}
        {/* Clickable Users Section - Different for Super Admin vs Business Owner */}
        <button 
          onClick={() => onSectionChange('users')}
          className="bg-purple-50 p-6 rounded-lg border border-purple-200 hover:border-purple-300 hover:bg-purple-100 transition-all duration-200 cursor-pointer group text-left w-full"
        >
          <div className="flex items-center">
            <div className="text-2xl group-hover:scale-110 transition-transform">👥</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-purple-900 group-hover:text-purple-800">
                {isSuperAdmin ? (stats.platformUsers || 'N/A') : (stats.totalUsers || 'N/A')}
              </div>
              <div className="text-sm text-purple-700 group-hover:text-purple-600">
                {isSuperAdmin ? 'Platform Users' : 'Business Users'}
              </div>
              <div className="text-xs text-purple-500 mt-1 group-hover:text-purple-600">
                👆 Click to view {isSuperAdmin ? 'all platform users' : 'business users'}
              </div>
              {isSuperAdmin && (
                <div className="text-xs text-blue-500 mt-1 font-medium">
                  All customers across all businesses
                </div>
              )}
            </div>
          </div>
        </button>
        {/* Clickable Admins Section - Only for Super Admins */}
        {isSuperAdmin ? (
          <button 
            onClick={() => onSectionChange('admin-management')}
            className="bg-orange-50 p-6 rounded-lg border border-orange-200 hover:border-orange-300 hover:bg-orange-100 transition-all duration-200 cursor-pointer group text-left w-full"
          >
            <div className="flex items-center">
              <div className="text-2xl group-hover:scale-110 transition-transform">👑</div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-orange-900 group-hover:text-orange-800">
                  {stats.totalAdmins || 'N/A'}
                </div>
                <div className="text-sm text-orange-700 group-hover:text-orange-600">
                  Total Admins
                </div>
                <div className="text-xs text-orange-500 mt-1 group-hover:text-orange-600">
                  👆 Click to manage admins
                </div>
                <div className="text-xs text-red-500 mt-1 font-medium">
                  Super Admin Only
                </div>
              </div>
            </div>
          </button>
        ) : (
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <div className="flex items-center">
              <div className="text-2xl">💰</div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-orange-900">${stats.totalRevenue || 'N/A'}</div>
                <div className="text-sm text-orange-700">Total Revenue</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isSuperAdmin ? 'Platform Management' : 'Business Operations'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => onSectionChange('users')}
            className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left group"
          >
            <div className="text-purple-600 text-lg mb-2 group-hover:scale-110 transition-transform">👥</div>
            <div className="font-medium text-gray-900">
              {isSuperAdmin ? 'Platform Users' : 'Business Users'}
            </div>
            <div className="text-sm text-gray-500">
              {isSuperAdmin 
                ? 'View all customers across all businesses' 
                : 'Manage customer accounts and profiles'
              }
            </div>
          </button>
          
          {isSuperAdmin && (
            <button 
              onClick={() => onSectionChange('admin-management')}
              className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left group"
            >
              <div className="text-orange-600 text-lg mb-2 group-hover:scale-110 transition-transform">👑</div>
              <div className="font-medium text-gray-900">Manage Admins</div>
                              <div className="text-sm text-gray-500">Invite and manage business owners</div>
            </button>
          )}
          
          <button 
            onClick={() => onSectionChange('orders')}
            className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left group"
          >
            <div className="text-green-600 text-lg mb-2 group-hover:scale-110 transition-transform">📦</div>
            <div className="font-medium text-gray-900">View Orders</div>
            <div className="text-sm text-gray-500">Track customer orders and status</div>
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      {recentOrders && recentOrders.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-6">
            {isSuperAdmin ? 'Recent Platform Orders' : 'Recent Business Orders'}
          </h2>
          {isSuperAdmin && (
            <p className="text-sm text-gray-600 mb-4">
              💡 Showing recent orders from all businesses across the platform
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderId || order._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user?.username || order.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(order.totalAmount || order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Low Stock Products Table */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-6">Low Stock Products</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock || product.quantity || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(product.price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category?.name || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* No Data Message */}
      {(!recentOrders || recentOrders.length === 0) && (!lowStockProducts || lowStockProducts.length === 0) && (
        <div className="mt-8 text-center text-gray-500">
          <p>No recent orders or low stock products to display.</p>
        </div>
      )}
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

const AdminCategories = ({ isSuperAdmin }) => {
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

const AdminOrders = ({ isSuperAdmin }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Management</h2>
      <p className="text-gray-600 mb-4">View and manage customer orders, update status, and track shipments.</p>
      {/* Order management content will go here */}
    </div>
  );
};

const AdminUsers = ({ isSuperAdmin }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showRoleChangeConfirm, setShowRoleChangeConfirm] = useState(false);
  const [roleChangeData, setRoleChangeData] = useState(null);

  // Form states for editing user
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    role: '',
    isActive: true,
    businessInfo: {
      businessName: '',
      businessType: '',
      businessAddress: '',
      phone: '',
      website: ''
    }
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      // For Super Admin, show all users. For Business Owner Admin, show only their business users
      setUsers(response);
    } catch (error) {
      setMessage('Error loading users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'user',
      isActive: user.isActive !== false,
      businessInfo: {
        businessName: user.businessInfo?.businessName || '',
        businessType: user.businessInfo?.businessType || '',
        businessAddress: user.businessInfo?.businessAddress || '',
        phone: user.businessInfo?.phone || '',
        website: user.businessInfo?.website || ''
      }
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    // Check if role is changing and show confirmation
    if (editForm.role !== selectedUser.role) {
      setRoleChangeData({
        userId: selectedUser._id,
        oldRole: selectedUser.role,
        newRole: editForm.role,
        formData: editForm
      });
      setShowRoleChangeConfirm(true);
      return;
    }
    
    // If no role change, proceed with update
    await performUserUpdate(selectedUser._id, editForm);
  };

  const confirmRoleChange = async () => {
    try {
      setLoading(true);
      await performUserUpdate(roleChangeData.userId, roleChangeData.formData);
      setShowRoleChangeConfirm(false);
      setRoleChangeData(null);
    } catch (error) {
      console.error('Error confirming role change:', error);
      setMessage('Error updating user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const performUserUpdate = async (userId, formData) => {
    try {
      setLoading(true);
      console.log('Updating user:', userId, 'with form data:', formData);
      
      // Update user role if changed
      if (formData.role !== selectedUser.role) {
        console.log('Updating role from', selectedUser.role, 'to', formData.role);
        const roleResult = await adminAPI.updateUserRole(userId, formData.role);
        console.log('Role update result:', roleResult);
      }

      // Update user permissions if role is admin
      if (editForm.role === 'admin') {
        const adminPermissions = [
          { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
          { resource: 'orders', actions: ['read', 'update'] },
          { resource: 'users', actions: ['read', 'update'] },
          { resource: 'analytics', actions: ['read'] },
          { resource: 'settings', actions: ['read', 'update'] }
        ];
        console.log('Updating admin permissions:', adminPermissions);
        const permResult = await adminAPI.updateUserPermissions(selectedUser._id, adminPermissions);
        console.log('Permission update result:', permResult);
      }

      // Update business information if changed
      if (JSON.stringify(editForm.businessInfo) !== JSON.stringify(selectedUser.businessInfo || {})) {
        console.log('Updating business info:', editForm.businessInfo);
        const businessResult = await adminAPI.updateUserBusinessInfo(selectedUser._id, editForm.businessInfo);
        console.log('Business info update result:', businessResult);
      }

      setMessage('User updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage('Error updating user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    try {
      setLoading(true);
      console.log('Deactivating user:', userToDelete._id);
      
      // For now, we'll just deactivate the user instead of deleting
      // You can implement actual deletion if needed
      const result = await adminAPI.updateUserRole(userToDelete._id, 'user');
      console.log('User deactivation result:', result);
      
      setMessage('User deactivated successfully!');
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      console.error('Error deactivating user:', error);
      setMessage('Error deactivating user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isSuperAdmin ? 'Platform User Management' : 'Business User Management'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin 
              ? 'Manage all users across the platform, including business owners and customers.' 
              : 'Manage customer accounts, view profiles, and handle support requests.'
            }
          </p>
        </div>
      </div>

      {/* Role System Explanation */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">🎭 Role System Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-2 bg-white rounded border">
            <div className="font-medium text-gray-900">👤 Regular Customer</div>
            <div className="text-gray-600">Shop & place orders</div>
          </div>
          <div className="p-2 bg-white rounded border">
            <div className="font-medium text-gray-900">👁️ Business Viewer</div>
            <div className="text-gray-600">Read-only business data</div>
          </div>
          <div className="p-2 bg-white rounded border">
            <div className="font-medium text-gray-900">🎧 Customer Support</div>
            <div className="text-gray-600">Handle customer inquiries</div>
          </div>
          <div className="p-2 bg-white rounded border">
            <div className="font-medium text-gray-900">👥 Business Manager</div>
            <div className="text-gray-600">Manage products & orders</div>
          </div>
          <div className="p-2 bg-white rounded border">
            <div className="font-medium text-gray-900">🏢 Business Owner Admin</div>
            <div className="text-gray-600">Full business management</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users by email, username, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {user.username?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.username || 'No username'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'support' ? 'bg-green-100 text-green-800' :
                    user.role === 'super-admin' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {user.role === 'admin' ? 'Full Business Access' :
                     user.role === 'manager' ? 'Product & Order Management' :
                     user.role === 'support' ? 'Customer Support' :
                     user.role === 'viewer' ? 'Read-Only Access' :
                     'Shopping Only'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {user.businessInfo?.businessName ? (
                      <div>
                        <div className="font-medium">{user.businessInfo.businessName}</div>
                        <div className="text-xs text-gray-500">{user.businessInfo.businessType}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No business info</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-blue-600 hover:text-blue-900 mr-3 font-medium"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="text-red-600 hover:text-red-900 font-medium"
                  >
                    🗑️ Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User Information</h3>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-blue-600 text-lg mr-2">👤</span>
                  <span className="font-medium text-blue-900">User Details</span>
                </div>
                <p className="text-sm text-blue-700">
                  <strong>Current User:</strong> {selectedUser.email}
                </p>
              </div>
              
              <form onSubmit={handleUpdateUser}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                {/* Role Information */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-blue-600 text-lg mr-2">🎭</span>
                    <span className="font-medium text-blue-900">Role Descriptions</span>
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div><strong>👤 Regular Customer:</strong> Can shop and place orders</div>
                    <div><strong>🏢 Business Owner Admin:</strong> Full business management access</div>
                    <div><strong>👥 Business Manager:</strong> Manage products, orders, customers</div>
                    <div><strong>🎧 Customer Support:</strong> Handle customer inquiries and orders</div>
                    <div><strong>👁️ Business Viewer:</strong> Read-only access to business data</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">👤 Regular Customer (Can shop and place orders)</option>
                      <option value="admin">🏢 Business Owner Admin (Full business management)</option>
                      <option value="manager">👥 Business Manager (Manage products, orders, customers)</option>
                      <option value="support">🎧 Customer Support (Handle customer inquiries and orders)</option>
                      <option value="viewer">👁️ Business Viewer (Read-only access to business data)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editForm.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setEditForm({...editForm, isActive: e.target.value === 'active'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">✅ Active</option>
                      <option value="inactive">❌ Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Business Information Section */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Business Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={editForm.businessInfo.businessName}
                        onChange={(e) => setEditForm({
                          ...editForm, 
                          businessInfo: {...editForm.businessInfo, businessName: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type
                      </label>
                      <input
                        type="text"
                        value={editForm.businessInfo.businessType}
                        onChange={(e) => setEditForm({
                          ...editForm, 
                          businessInfo: {...editForm.businessInfo, businessType: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={editForm.businessInfo.phone}
                        onChange={(e) => setEditForm({
                          ...editForm, 
                          businessInfo: {...editForm.businessInfo, phone: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={editForm.businessInfo.website}
                        onChange={(e) => setEditForm({
                          ...editForm, 
                          businessInfo: {...editForm.businessInfo, website: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address
                    </label>
                    <textarea
                      value={editForm.businessInfo.businessAddress}
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        businessInfo: {...editForm.businessInfo, businessAddress: e.target.value}
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm User Removal</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to remove <strong>{userToDelete.email}</strong>? 
                This action will deactivate their account and remove their admin privileges.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Remove User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Confirmation Modal */}
      {showRoleChangeConfirm && roleChangeData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Role Change</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to change <strong>{roleChangeData.formData.email}</strong>'s role from{' '}
                <span className="font-medium">{roleChangeData.oldRole}</span> to{' '}
                <span className="font-medium">{roleChangeData.newRole}</span>?
              </p>
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-xs text-yellow-700">
                  <strong>New Role Access:</strong><br/>
                  {roleChangeData.newRole === 'admin' ? '🏢 Full Business Management Access' :
                   roleChangeData.newRole === 'manager' ? '👥 Product & Order Management' :
                   roleChangeData.newRole === 'support' ? '🎧 Customer Support Access' :
                   roleChangeData.newRole === 'viewer' ? '👁️ Read-Only Business Data' :
                   '👤 Regular Customer Access'}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRoleChangeConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRoleChange}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Confirm Role Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminAdminManagement = ({ isSuperAdmin }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [message, setMessage] = useState('');

  // Form states for inviting new admin
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'admin',
    permissions: []
  });

  // Available permissions
  const availablePermissions = [
    { resource: 'products', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'categories', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'orders', actions: ['read', 'update'] },
    { resource: 'users', actions: ['read', 'update'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'admin_management', actions: ['read', 'create', 'update', 'delete'] }
  ];

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      const adminUsers = response.filter(user => 
        user.role === 'admin' || user.isAdmin || user.permissions?.length > 0
      );
      setAdmins(adminUsers);
    } catch (error) {
      setMessage('Error loading admins: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminAPI.inviteAdmin(inviteForm);
      setMessage('Admin invitation sent successfully!');
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'admin', permissions: [] });
      loadAdmins();
    } catch (error) {
      setMessage('Error inviting admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermissions = async (adminId, newPermissions) => {
    try {
      setLoading(true);
      await adminAPI.updateUserPermissions(adminId, newPermissions);
      setMessage('Permissions updated successfully!');
      setShowEditModal(false);
      setSelectedAdmin(null);
      loadAdmins();
    } catch (error) {
      setMessage('Error updating permissions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to remove this admin?')) {
      try {
        setLoading(true);
        await adminAPI.removeAdminRole(adminId);
        setMessage('Admin role removed successfully!');
        loadAdmins();
      } catch (error) {
        setMessage('Error removing admin: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPermissionDisplay = (permissions) => {
    if (!permissions || permissions.length === 0) return 'No permissions';
    
    return permissions.map(perm => 
      `${perm.resource}: ${perm.actions.join(', ')}`
    ).join(' | ');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">Loading admin data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Admin Management</h2>
              {/* Only show invite button for Super Admins */}
      {isSuperAdmin ? (
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + Invite New Admin
        </button>
      ) : (
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
          💡 Only Super Admins can invite new Business Owner Admins
        </div>
      )}
    </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search admins by email, username, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Admins List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAdmins.map((admin) => (
              <tr key={admin._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {admin.username?.charAt(0)?.toUpperCase() || admin.email.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {admin.username || 'No username'}
                      </div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    admin.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    admin.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                    admin.role === 'support' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {admin.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {getPermissionDisplay(admin.permissions)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedAdmin(admin);
                      setShowEditModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveAdmin(admin._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite New Admin Modal - Only for Super Admins */}
      {showInviteModal && isSuperAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Invite Team Member</h3>
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-purple-600 text-lg mr-2">🏢</span>
                  <span className="font-medium text-purple-900">Team Member Invitation</span>
                </div>
                <p className="text-sm text-purple-700">
                  You are inviting a <strong>team member</strong> to help manage your business. 
                  They will have limited access based on their role.
                </p>
              </div>
              <form onSubmit={handleInviteAdmin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Type
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">🏢 Business Owner Admin (Full Business Access)</option>
                    <option value="manager">👥 Manager (Limited Business Access)</option>
                    <option value="support">🎧 Support (Customer Support Access)</option>
                    <option value="viewer">👁️ Viewer (Read-Only Access)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Note: These team members will help manage your business operations. Only Super Admins can invite new Business Owner Admins.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availablePermissions.map((perm) => (
                      <div key={perm.resource} className="border rounded p-2">
                        <div className="font-medium text-sm mb-1">{perm.resource}</div>
                        <div className="flex flex-wrap gap-2">
                          {perm.actions.map((action) => (
                            <label key={action} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={inviteForm.permissions.some(p => 
                                  p.resource === perm.resource && p.actions.includes(action)
                                )}
                                onChange={(e) => {
                                  const newPermissions = [...inviteForm.permissions];
                                  const existingIndex = newPermissions.findIndex(p => p.resource === perm.resource);
                                  
                                  if (e.target.checked) {
                                    if (existingIndex >= 0) {
                                      newPermissions[existingIndex].actions.push(action);
                                    } else {
                                      newPermissions.push({
                                        resource: perm.resource,
                                        actions: [action]
                                      });
                                    }
                                  } else {
                                    if (existingIndex >= 0) {
                                      newPermissions[existingIndex].actions = newPermissions[existingIndex].actions.filter(a => a !== action);
                                      if (newPermissions[existingIndex].actions.length === 0) {
                                        newPermissions.splice(existingIndex, 1);
                                      }
                                    }
                                  }
                                  
                                  setInviteForm({...inviteForm, permissions: newPermissions});
                                }}
                                className="mr-1"
                              />
                              <span className="text-sm">{action}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Invite Team Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Admin Permissions</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{selectedAdmin.email}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-4">Current Role: {selectedAdmin.role}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Permissions
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availablePermissions.map((perm) => (
                    <div key={perm.resource} className="border rounded p-2">
                      <div className="font-medium text-sm mb-1">{perm.resource}</div>
                      <div className="flex flex-wrap gap-2">
                        {perm.actions.map((action) => (
                          <label key={action} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedAdmin.permissions?.some(p => 
                                p.resource === perm.resource && p.actions.includes(action)
                              ) || false}
                              onChange={(e) => {
                                const newPermissions = [...(selectedAdmin.permissions || [])];
                                const existingIndex = newPermissions.findIndex(p => p.resource === perm.resource);
                                
                                if (e.target.checked) {
                                  if (existingIndex >= 0) {
                                    newPermissions[existingIndex].actions.push(action);
                                  } else {
                                    newPermissions.push({
                                      resource: perm.resource,
                                      actions: [action]
                                    });
                                  }
                                } else {
                                  if (existingIndex >= 0) {
                                    newPermissions[existingIndex].actions = newPermissions[existingIndex].actions.filter(a => a !== action);
                                    if (newPermissions[existingIndex].actions.length === 0) {
                                      newPermissions.splice(existingIndex, 1);
                                    }
                                  }
                                }
                                
                                setSelectedAdmin({...selectedAdmin, permissions: newPermissions});
                              }}
                              className="mr-1"
                            />
                            <span className="text-sm">{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAdmin(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdatePermissions(selectedAdmin._id, selectedAdmin.permissions)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminSettings = ({ isSuperAdmin }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Website Settings</h2>
      <p className="text-gray-600 mb-4">Configure website settings, update business information, and manage integrations.</p>
      {/* Settings content will go here */}
    </div>
  );
};

export default AdminDashboard; 