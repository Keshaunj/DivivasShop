import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/admin/AdminAuthContext';
import AdminProductManager from '../../components/admin/AdminProductManager';
import { adminAPI } from '../../proxyApi/api';

// AdminOverview Component
const AdminOverview = ({ stats, recentOrders, lowStockProducts, loading, isSuperAdmin, onSectionChange }) => {
  try {
    if (loading) {
      return (
        <div className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="text-lg text-gray-600">Loading dashboard data...</div>
          </div>
        </div>
      );
    }

    const safeStats = stats || {};
    const safeRecentOrders = recentOrders || [];
    const safeLowStockProducts = lowStockProducts || [];

    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {isSuperAdmin ? 'Platform Overview' : 'Business Overview'}
        </h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="text-2xl">🕯️</div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-blue-900">{safeStats.totalProducts || 'N/A'}</div>
                <div className="text-sm text-blue-700">Total Products</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="text-2xl">📦</div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-green-900">{safeStats.totalOrders || 'N/A'}</div>
                <div className="text-sm text-green-700">Total Orders</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <div className="text-2xl">👥</div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-purple-900">{safeStats.totalUsers || 'N/A'}</div>
                <div className="text-sm text-purple-700">Total Users</div>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <div className="flex items-center">
              <div className="text-2xl">💰</div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-orange-900">${safeStats.totalRevenue || 'N/A'}</div>
                <div className="text-sm text-orange-700">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => onSectionChange('users')}
              className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              <div className="text-purple-600 text-lg mb-2">👥</div>
              <div className="font-medium text-gray-900">Manage Users</div>
              <div className="text-sm text-gray-500">View and manage user accounts</div>
            </button>
            
            <button 
              onClick={() => onSectionChange('orders')}
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <div className="text-green-600 text-lg mb-2">📦</div>
              <div className="font-medium text-gray-900">View Orders</div>
              <div className="text-sm text-gray-500">Track customer orders and status</div>
            </button>
            
            <button 
              onClick={() => onSectionChange('products')}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <div className="text-blue-600 text-lg mb-2">🕯️</div>
              <div className="font-medium text-gray-900">Manage Products</div>
              <div className="text-sm text-gray-500">Add, edit, and organize products</div>
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        {safeRecentOrders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeRecentOrders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{order._id?.slice(-8) || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt || order.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.customerEmail || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">${(order.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Low Stock Products */}
        {safeLowStockProducts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Products</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeLowStockProducts.slice(0, 5).map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{product.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          (product.stock || 0) <= 5 ? 'bg-red-100 text-red-800' :
                          (product.stock || 0) <= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {product.stock || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">${(product.price || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in AdminOverview component:', error);
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Overview</h2>
          <p className="text-gray-600 mb-4">There was an error loading the dashboard overview.</p>
          <details className="text-left bg-gray-50 p-4 rounded-lg">
            <summary className="cursor-pointer font-medium text-gray-700">Error Details</summary>
            <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap">{error.message}</pre>
          </details>
        </div>
      </div>
    );
  }
};

// AdminCategories Component
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
      <div className="text-center text-gray-500 py-8">
        Category management functionality coming soon...
      </div>
    </div>
  );
};

// AdminOrders Component
const AdminOrders = ({ isSuperAdmin }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await adminAPI.getAllOrders();
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setMessage('Error loading orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Management</h2>
      {message && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          {message}
        </div>
      )}
      
      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{order._id?.slice(-8) || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt || order.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.customerEmail || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">${(order.total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No orders found.
        </div>
      )}
    </div>
  );
};

// AdminUsers Component
const AdminUsers = ({ isSuperAdmin }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading users...');
      const response = await adminAPI.getAllUsers();
      console.log('Users loaded successfully, count:', response?.length || 0);
      setUsers(response || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage('Error loading users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  try {
    if (loading) {
      return (
        <div className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="text-lg text-gray-600">Loading users...</div>
          </div>
        </div>
      );
    }

    console.log('Rendering AdminUsers with users:', users?.length || 0);

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

        {message && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
            {message}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users by email, username, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* User Status Summary */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">📊 User Status Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-white rounded border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-700">Total Users</span>
                <span className="font-bold text-blue-900">{users.length}</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-green-700">✅ Active Users</span>
                <span className="font-bold text-green-900">{users.filter(u => u.isActive !== false).length}</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded border border-red-200">
              <div className="flex items-center justify-between">
                <span className="text-red-700">❌ Inactive Users</span>
                <span className="font-bold text-red-900">{users.filter(u => u.isActive === false).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users
                  .filter(user => {
                    if (!searchTerm) return true;
                    return (
                      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                  })
                  .map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username || 'N/A'}</div>
                            <div className="text-sm text-gray-500">ID: {user._id?.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'business_owner' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'manager' ? 'bg-green-100 text-green-800' :
                          user.role === 'support' ? 'bg-yellow-100 text-yellow-800' :
                          user.role === 'viewer' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role || 'customer'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No users found.
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in AdminUsers component:', error);
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Users</h2>
          <p className="text-gray-600 mb-4">There was an error loading the users section.</p>
          <details className="text-left bg-gray-50 p-4 rounded-lg">
            <summary className="cursor-pointer font-medium text-gray-700">Error Details</summary>
            <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap">{error.message}</pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

// AdminAdminManagement Component
const AdminAdminManagement = ({ isSuperAdmin }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Admin Management</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + Invite New Admin
        </button>
      </div>
      <p className="text-gray-600 mb-4">Manage admin users and their permissions.</p>
      <div className="text-center text-gray-500 py-8">
        Admin management functionality coming soon...
      </div>
    </div>
  );
};

// AdminSettings Component
const AdminSettings = ({ isSuperAdmin }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
      <p className="text-gray-600 mb-4">Configure website settings and preferences.</p>
      <div className="text-center text-gray-500 py-8">
        Settings functionality coming soon...
      </div>
    </div>
  );
};

// Main AdminDashboard Component
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, isAdminAuthenticated, isSuperAdmin } = useAdminAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if user is admin (Business Owner Admin or Super Admin)
  const isAdmin = isAdminAuthenticated();
  
  // Check if user is Super Admin (has admin_management permissions)
  const isSuperAdminUser = isSuperAdmin();
  
  // Check if user is Business Owner Admin (regular admin, not super)
  const isBusinessOwnerAdmin = isAdmin && !isSuperAdminUser;

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Login Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access the admin panel.</p>
          <button
            onClick={() => navigate('/corporate')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Admin Login
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
        return <AdminOverview 
          stats={stats} 
          recentOrders={recentOrders} 
          lowStockProducts={lowStockProducts} 
          loading={loading} 
          isSuperAdmin={isSuperAdminUser}
          onSectionChange={setActiveSection}
        />;
      case 'products':
        return <AdminProductManager isSuperAdmin={isSuperAdminUser} />;
      case 'categories':
        return <AdminCategories isSuperAdmin={isSuperAdminUser} />;
      case 'orders':
        return <AdminOrders isSuperAdmin={isSuperAdminUser} />;
      case 'users':
        return <AdminUsers isSuperAdmin={isSuperAdminUser} />;
      case 'admin-management':
        return <AdminAdminManagement isSuperAdmin={isSuperAdminUser} />;
      case 'settings':
        return <AdminSettings isSuperAdmin={isSuperAdminUser} />;
      default:
        return <AdminOverview 
          stats={stats} 
          recentOrders={recentOrders} 
          lowStockProducts={lowStockProducts} 
          loading={loading} 
          isSuperAdmin={isSuperAdminUser}
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
                Welcome, {admin?.username || admin?.email}
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

export default AdminDashboard; 